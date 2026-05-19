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
const COMPANY_NAME = "HTRGroupTX";

async function notifyOwner(text: string, subject: string, html: string): Promise<void> {
  const sid = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const tasks: Promise<unknown>[] = [];
  if (sid && token) {
    tasks.push(
      twilio(sid, token).messages
        .create({ from: WA_FROM, to: OWNER_WA, body: text })
        .catch((e) => console.warn("[VOICE] Owner WA:", e?.message ?? e)),
    );
  }
  const user = process.env["EMAIL_USER"];
  const pass = process.env["EMAIL_PASS"];
  if (user && pass) {
    tasks.push(
      nodemailer
        .createTransport({ service: "gmail", auth: { user, pass } })
        .sendMail({ from: `"${COMPANY_NAME} Voice" <${user}>`, to: OWNER_EMAIL, subject, html })
        .catch((e) => console.warn("[VOICE] Owner email:", e)),
    );
  }
  await Promise.allSettled(tasks);
}

export async function savePhoneBooking(state: BookingState): Promise<string | null> {
  const slot = state.selectedSlot ?? "";
  const { date: preferredDate, time: preferredTime } = parseSlot(
    slot.includes(" — ") ? slot : `${state.preferredDate ?? ""} — ${state.preferredTime ?? ""}`,
  );

  if (!preferredDate || !preferredTime) {
    console.error("[VOICE] Missing date/time for booking");
    return null;
  }

  try {
    const id = crypto.randomUUID();
    const approveToken = crypto.randomBytes(16).toString("hex");
    const fullAddress = [state.streetAddress, state.city, "TX", state.zip]
      .filter(Boolean)
      .join(", ");

    await pool.query(
      `INSERT INTO bookings
       (id, approve_token, status, name, phone, email, address, appliance,
        brand_model, preferred_date, preferred_time, message, language, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`,
      [
        id,
        approveToken,
        "pending",
        state.clientName ?? "Phone caller",
        state.phone ?? "",
        "",
        fullAddress,
        state.appliance ?? "Appliance repair",
        state.brandModel ?? "",
        preferredDate,
        preferredTime,
        [state.symptoms, "Via AI phone operator"].filter(Boolean).join(" — "),
        "en",
      ],
    );

    await blockSlotHour(
      preferredDate,
      preferredTime,
      `Phone AI booking – ${state.clientName ?? "caller"}`,
    );

    syncBookingToHubSpot({
      id,
      name: state.clientName ?? "Phone caller",
      phone: state.phone ?? "",
      email: "",
      address: fullAddress,
      appliance: state.appliance ?? "Appliance repair",
      preferredDate,
      preferredTime,
      message: state.symptoms ?? "Via AI phone operator",
      source: "phone",
    })
      .then((r) => {
        if (r.ok && r.dealId) {
          pool.query(`UPDATE bookings SET hs_deal_id=$1 WHERE id=$2`, [r.dealId, id]).catch(() => {});
        }
      })
      .catch(() => {});

    void notifyOwner(
      `📞 *AI PHONE BOOKING*\n\n👤 ${state.clientName}\n📞 ${state.phone}\n` +
        `🔧 ${state.appliance} (${state.brandModel})\n📋 ${state.symptoms}\n` +
        `📍 ${fullAddress}\n📅 ${preferredDate} · ${preferredTime}\n🆔 ${id.slice(0, 8)}`,
      `📞 AI booking: ${state.clientName}`,
      `<p><b>AI phone booking</b></p><p>${state.clientName} — ${preferredDate} ${preferredTime}</p>`,
    );

    return id;
  } catch (err) {
    console.error("[VOICE] savePhoneBooking:", err);
    return null;
  }
}
