import crypto from "crypto";
import nodemailer from "nodemailer";
import pg from "pg";
import twilio from "twilio";
import { syncBookingToHubSpot } from "../hubspot.js";
import { blockSlotHour, parseSlot } from "../lib/booking-slots.js";
import type { BookingState } from "./booking-state.js";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const OWNER_WA = "whatsapp:+13468206021";
const WA_FROM = process.env["TWILIO_WHATSAPP_NUMBER"] ?? "whatsapp:+15559554342";
const OWNER_EMAIL = "htrgroupllc@gmail.com";

async function notifyOwner(text: string, subject: string, html: string): Promise<void> {
  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const tasks: Promise<unknown>[] = [];
  if (sid && token) {
    tasks.push(
      twilio(sid, token).messages
        .create({ from: WA_FROM, to: OWNER_WA, body: text })
        .catch(() => {}),
    );
  }
  const user = process.env["EMAIL_USER"];
  const pass = process.env["EMAIL_PASS"];
  if (user && pass) {
    tasks.push(
      nodemailer.createTransport({ service: "gmail", auth: { user, pass } })
        .sendMail({ from: `"HTR Voice" <${user}>`, to: OWNER_EMAIL, subject, html })
        .catch(() => {}),
    );
  }
  await Promise.allSettled(tasks);
}

export async function savePhoneBooking(state: BookingState): Promise<string | null> {
  const slot = state.selectedSlot ?? `${state.preferredDate} — ${state.preferredTime}`;
  const { date: preferredDate, time: preferredTime } = parseSlot(
    slot.includes(" — ") ? slot : `${state.preferredDate ?? ""} — ${state.preferredTime ?? ""}`,
  );
  if (!preferredDate || !preferredTime) return null;

  try {
    const id = crypto.randomUUID();
    const approveToken = crypto.randomBytes(16).toString("hex");
    const fullAddress = [state.streetAddress, state.city, "TX", state.zip].filter(Boolean).join(", ");

    await pool.query(
      `INSERT INTO bookings
       (id, approve_token, status, name, phone, email, address, appliance,
        brand_model, preferred_date, preferred_time, message, language, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`,
      [
        id, approveToken, "pending", state.clientName ?? "Caller", state.phone ?? "",
        "", fullAddress, state.appliance ?? "Appliance", state.brandModel ?? "",
        preferredDate, preferredTime, state.symptoms ?? "Phone AI", "en",
      ],
    );
    await blockSlotHour(preferredDate, preferredTime, `Phone AI – ${state.clientName}`);
    syncBookingToHubSpot({
      id, name: state.clientName ?? "Caller", phone: state.phone ?? "", email: "",
      address: fullAddress, appliance: state.appliance ?? "Appliance",
      preferredDate, preferredTime, message: state.symptoms ?? "", source: "phone",
    }).catch(() => {});
    void notifyOwner(
      `📞 AI BOOKING\n${state.clientName} ${state.phone}\n${preferredDate} ${preferredTime}`,
      `AI booking ${state.clientName}`,
      `<p>${state.clientName}</p>`,
    );
    return id;
  } catch (e) {
    console.error("[VOICE] save:", e);
    return null;
  }
}
