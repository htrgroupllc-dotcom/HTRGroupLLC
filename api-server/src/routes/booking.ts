import { Router } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import pg from "pg";
import { verifyAdminToken } from "../admin-auth.js";
import twilio from "twilio";
import { syncBookingToHubSpot, cancelDealInHubSpot, updateDealStageInHubSpot, updateDealDateInHubSpot, type HsBooking } from "../hubspot.js";

const OWNER_WA  = "whatsapp:+13468206021";
const WA_FROM   = process.env["TWILIO_WHATSAPP_NUMBER"] ?? "whatsapp:+15559554342";

type NotifyLog = { info: (msg: string) => void; warn: (obj: unknown, msg: string) => void };

/**
 * Send owner notification via WhatsApp only.
 */
function sendOwnerNotification(body: string, log?: NotifyLog): void {
  const sid   = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  if (!sid || !token) {
    (log ?? console).warn("[NOTIFY] Twilio credentials missing");
    return;
  }
  const client = twilio(sid, token);

  void client.messages
    .create({ from: WA_FROM, to: OWNER_WA, body })
    .then(() => { log?.info("[WA] Owner WhatsApp sent successfully"); })
    .catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      (log ?? console).warn(`[WA] Owner WhatsApp failed: ${msg}`);
    });
}

// Keep legacy name as alias for backward-compat
const sendOwnerWA = sendOwnerNotification;

/**
 * Normalize a raw phone string to E.164 WhatsApp format.
 * Returns null if the number looks invalid.
 */
function normalizeToWaPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `whatsapp:+1${digits}`;
  if (digits.length === 11 && digits[0] === "1") return `whatsapp:+${digits}`;
  if (digits.length > 10 && !digits.startsWith("1")) return `whatsapp:+${digits}`;
  return null;
}

/**
 * Send an appointment confirmation WhatsApp message to the client.
 * Non-blocking — errors are logged but never throw.
 */
function sendClientConfirmWA(booking: Booking, log?: NotifyLog): void {
  const sid   = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  if (!sid || !token) return;

  const waTo = normalizeToWaPhone(booking.phone ?? "");
  if (!waTo) {
    (log ?? console).warn(`[WA-CLIENT] Cannot normalize phone "${booking.phone}" — skipping`);
    return;
  }

  const isEs = booking.language === "es";
  const body = isEs
    ? `✅ *¡Cita confirmada!*\n\n` +
      `👤 ${booking.name}\n` +
      `🔧 ${booking.appliance}${booking.brandModel ? ` (${booking.brandModel})` : ""}\n` +
      `📅 ${booking.preferredDate} · ${booking.preferredTime}\n\n` +
      `Le contactaremos antes de la visita.\n` +
      `¡Gracias por elegir *HTRGroupTX*! 🙏`
    : `✅ *Appointment Confirmed!*\n\n` +
      `👤 ${booking.name}\n` +
      `🔧 ${booking.appliance}${booking.brandModel ? ` (${booking.brandModel})` : ""}\n` +
      `📅 ${booking.preferredDate} · ${booking.preferredTime}\n\n` +
      `Our technician will contact you before the visit.\n` +
      `Thank you for choosing *HTRGroupTX*! 🙏`;

  const client = twilio(sid, token);
  void client.messages
    .create({ from: WA_FROM, to: waTo, body })
    .then(() => { (log ?? console).info(`[WA-CLIENT] Confirmation sent to ${waTo}`); })
    .catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      (log ?? console).warn(`[WA-CLIENT] Failed to send to ${waTo}: ${msg}`);
    });
}

/**
 * Notify client via WhatsApp that their cancelled booking has been restored by admin.
 * Non-blocking — errors are logged but never throw.
 */
function sendClientRestoreWA(booking: Booking, log?: NotifyLog): void {
  const sid   = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  if (!sid || !token) return;

  const waTo = normalizeToWaPhone(booking.phone ?? "");
  if (!waTo) {
    (log ?? console).warn(`[WA-CLIENT] Cannot normalize phone "${booking.phone}" — skipping restore WA`);
    return;
  }

  const isEs = booking.language === "es";
  const body = isEs
    ? `🔄 *¡Su cita ha sido restaurada!*\n\n` +
      `👤 ${booking.name}\n` +
      `🔧 ${booking.appliance}${booking.brandModel ? ` (${booking.brandModel})` : ""}\n` +
      `📅 ${booking.preferredDate} · ${booking.preferredTime}\n\n` +
      `Su solicitud ha sido reactivada por el administrador.\n` +
      `Le contactaremos para confirmar.\n` +
      `¡Gracias por elegir *HTRGroupTX*! 🙏`
    : `🔄 *Your appointment has been restored!*\n\n` +
      `👤 ${booking.name}\n` +
      `🔧 ${booking.appliance}${booking.brandModel ? ` (${booking.brandModel})` : ""}\n` +
      `📅 ${booking.preferredDate} · ${booking.preferredTime}\n\n` +
      `Your request has been reactivated by our admin.\n` +
      `We will contact you shortly to confirm.\n` +
      `Thank you for choosing *HTRGroupTX*! 🙏`;

  const client = twilio(sid, token);
  void client.messages
    .create({ from: WA_FROM, to: waTo, body })
    .then(() => { (log ?? console).info(`[WA-CLIENT] Restore notification sent to ${waTo}`); })
    .catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      (log ?? console).warn(`[WA-CLIENT] Failed to send restore WA to ${waTo}: ${msg}`);
    });
}

/**
 * WhatsApp-formatted address block for owner messages.
 * Includes direct Google Maps link and Zillow property page.
 */
function ownerAddrBlock(address: string | undefined): string {
  if (!address || address.trim().length < 3) return "📍 не указан";
  const enc     = encodeURIComponent(address);
  const zilSlug = address.trim().replace(/,/g, "").replace(/\s+/g, "-").replace(/-{2,}/g, "-");
  return (
    `📍 *${address}*\n\n` +
    `🗺 Google Maps:\nhttps://maps.google.com/?q=${enc}\n\n` +
    `🏠 Zillow:\nhttps://www.zillow.com/homes/${zilSlug}/`
  );
}

const bookingRouter = Router();

// ─── Database pool ─────────────────────────────────────────────────────────────
const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });

interface Booking {
  id: string;
  approveToken: string;
  status: "pending" | "approved";
  name: string;
  phone: string;
  email: string;
  address: string;
  appliance: string;
  brandModel: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  language: string;
  createdAt: string;
  hsDealId?: string;
}

async function saveBooking(booking: Booking): Promise<void> {
  await pool.query(
    `INSERT INTO bookings
       (id, approve_token, status, name, phone, email, address, appliance,
        brand_model, preferred_date, preferred_time, message, language, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      booking.id, booking.approveToken, booking.status,
      booking.name, booking.phone, booking.email, booking.address,
      booking.appliance, booking.brandModel, booking.preferredDate,
      booking.preferredTime, booking.message, booking.language,
      booking.createdAt,
    ],
  );
}

async function findBooking(id: string): Promise<Booking | null> {
  const { rows } = await pool.query(
    "SELECT * FROM bookings WHERE id = $1", [id],
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id:            r.id,
    approveToken:  r.approve_token,
    status:        r.status,
    name:          r.name,
    phone:         r.phone,
    email:         r.email,
    address:       r.address,
    appliance:     r.appliance,
    brandModel:    r.brand_model,
    preferredDate: r.preferred_date,
    preferredTime: r.preferred_time,
    message:       r.message,
    language:      r.language,
    createdAt:     r.created_at,
    hsDealId:      r.hs_deal_id ?? undefined,
  };
}

async function approveBooking(id: string): Promise<void> {
  await pool.query("UPDATE bookings SET status='approved' WHERE id=$1", [id]);
}

// ─── Date normalization ───────────────────────────────────────────────────────
// Converts any date format to the canonical "Mon DD, YYYY" used by the website.
// Supports:
//   "2026-04-14"     → "Apr 14, 2026"
//   "Apr 14, 2026"   → "Apr 14, 2026" (unchanged)
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function normalizeDateStr(raw: string): string {
  const trimmed = raw.trim();
  // ISO: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const monthName = MONTH_NAMES[parseInt(m, 10) - 1];
    if (monthName) return `${monthName} ${parseInt(d, 10)}, ${y}`;
  }
  return trimmed;
}

// Returns a SQL predicate that matches both the normalized form and the raw form.
// This ensures backwards-compat with any ISO dates already in DB.
function dateMatchClause(col: string, paramIdx: number): string {
  return `(${col} = $${paramIdx} OR ${col} = $${paramIdx + 1})`;
}

// ─── POST /api/booking ────────────────────────────────────────────────────────
bookingRouter.post("/booking", async (req, res) => {
  const {
    name, phone, email, address, appliance,
    brandModel, date, time, message, lang,
  } = req.body as Record<string, string | undefined>;

  if (!name || !phone || !email) {
    res.status(400).json({ error: "Missing required fields: name, phone, email" });
    return;
  }

  const booking: Booking = {
    id:            crypto.randomUUID(),
    approveToken:  crypto.randomUUID(),
    status:        "pending",
    name:          name.trim(),
    phone:         phone.trim(),
    email:         email.trim().toLowerCase(),
    address:       (address ?? "").trim(),
    appliance:     (appliance ?? "").trim(),
    brandModel:    (brandModel ?? "").trim(),
    preferredDate: normalizeDateStr(date ?? ""),
    preferredTime: (time ?? "").trim(),
    message:       (message ?? "").trim(),
    language:      lang ?? "en",
    createdAt:     new Date().toISOString(),
  };

  // Check for slot conflict (pending or approved bookings on same date+time)
  if (booking.preferredDate && booking.preferredTime) {
    const [{ rows: conflict }, { rows: blocked }] = await Promise.all([
      pool.query(
        `SELECT id FROM bookings
         WHERE preferred_date = $1 AND preferred_time = $2
           AND status IN ('pending','approved')
         LIMIT 1`,
        [booking.preferredDate, booking.preferredTime],
      ),
      pool.query(
        `SELECT id FROM blocked_slots
         WHERE slot_date = $1 AND slot_time = $2
         LIMIT 1`,
        [booking.preferredDate, booking.preferredTime],
      ),
    ]);
    if (conflict.length > 0) {
      res.status(409).json({ error: "slot_taken", message: "This time slot is already booked. Please choose another time." });
      return;
    }
    if (blocked.length > 0) {
      res.status(409).json({ error: "slot_taken", message: "This time slot is not available. Please choose another time." });
      return;
    }
  }

  await saveBooking(booking);
  req.log.info({ bookingId: booking.id }, "Booking saved to database (pending)");

  // ── HubSpot sync — synchronous so hs_deal_id is in DB before response ───────
  try {
    const hsResult = await syncBookingToHubSpot({
      id:            booking.id,
      name:          booking.name,
      phone:         booking.phone,
      email:         booking.email,
      address:       booking.address,
      appliance:     booking.appliance,
      brandModel:    booking.brandModel,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      message:       booking.message,
      source:        "website",
    }, req.log);
    if (hsResult.ok && hsResult.dealId) {
      await pool.query(`UPDATE bookings SET hs_deal_id=$1 WHERE id=$2`, [hsResult.dealId, booking.id]);
      req.log.info({ dealId: hsResult.dealId, bookingId: booking.id }, "HubSpot deal created and hs_deal_id saved");
    } else if (!hsResult.ok) {
      req.log.warn({ error: hsResult.error, bookingId: booking.id }, "HubSpot sync failed at booking creation (non-fatal)");
    }
  } catch (hsErr) {
    req.log.error({ err: hsErr, bookingId: booking.id }, "HubSpot sync error at booking creation (non-fatal)");
  }

  // Always use PUBLIC_BASE_URL for the approve link — ensures the URL is stable
  // regardless of reverse-proxy / x-forwarded-host variations.
  const publicBase  = (process.env["PUBLIC_BASE_URL"] ?? "").replace(/\/$/, "")
    || "https://htr-group-llc-appliance-repair.replit.app";
  const approvalUrl = `${publicBase}/api/approve?id=${booking.id}&token=${booking.approveToken}`;

  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";

  if (!emailUser || !emailPass || !emailTo) {
    req.log.error("EMAIL_USER / EMAIL_PASS / EMAIL_TO not configured — skipping email");
    res.json({ ok: true, id: booking.id });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });

  const subject = `📋 New Booking [${booking.id.slice(0, 8).toUpperCase()}] — ${booking.appliance || "Appliance Repair"}`;

  const rowHtml = (label: string, value: string) =>
    value
      ? `<tr style="border-bottom:1px solid #eee;">
           <td style="padding:10px 8px;color:#666;width:140px;white-space:nowrap;">${label}</td>
           <td style="padding:10px 8px;font-weight:600;">${value}</td>
         </tr>`
      : "";

  const html = `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">📋 New Repair Booking</h2>
    <p style="color:#b3d4ff;margin:6px 0 0;font-size:13px;">
      Hi-Tech Repair Group &nbsp;·&nbsp; ID: <strong style="color:#fff;">${booking.id.slice(0, 8).toUpperCase()}</strong>
    </p>
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rowHtml("Name",          booking.name)}
      ${rowHtml("Phone",         `<a href="tel:${booking.phone}" style="color:#1B6FE8;">${booking.phone}</a>`)}
      ${rowHtml("Email",         `<a href="mailto:${booking.email}" style="color:#1B6FE8;">${booking.email}</a>`)}
      ${rowHtml("Home Address",  booking.address)}
      ${rowHtml("Appliance",     booking.appliance)}
      ${rowHtml("Brand / Model", booking.brandModel)}
      ${rowHtml("Preferred Date",booking.preferredDate)}
      ${rowHtml("Preferred Time",booking.preferredTime)}
      ${rowHtml("Language",      booking.language === "es" ? "Español" : "English")}
    </table>

    ${booking.message ? `
    <div style="margin-top:18px;">
      <p style="font-size:13px;color:#666;margin:0 0 6px;font-weight:600;">Customer Message:</p>
      <div style="background:#f8fafc;border-left:4px solid #1B6FE8;padding:12px 16px;border-radius:4px;font-size:14px;line-height:1.65;">
        ${booking.message.replace(/\n/g, "<br>")}
      </div>
    </div>` : ""}

    ${booking.address ? (() => {
      const addr   = booking.address;
      const enc    = encodeURIComponent(addr);
      const gmUrl  = `https://maps.google.com/?q=${enc}`;
      const svUrl  = `https://maps.google.com/maps?q=${enc}&layer=c`;
      const zilSlug = addr.trim().replace(/,/g,"").replace(/\s+/g,"-").replace(/-{2,}/g,"-");
      const zilUrl = `https://www.zillow.com/homes/${zilSlug}_rb/`;
      const rfUrl  = `https://www.redfin.com/search#location=${enc}`;
      return `
    <div style="margin:20px 0;border:1px solid #ddd;border-radius:10px;overflow:hidden;background:#f8f9ff;">
      <div style="background:#0B1A3F;padding:9px 14px;">
        <span style="font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;">📍 Property Location</span>
      </div>
      <div style="padding:12px 14px 4px;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#0B1A3F;">${addr}</p>
      </div>
      <div style="padding:10px 14px 14px;display:flex;gap:8px;flex-wrap:wrap;">
        <a href="${svUrl}"  target="_blank"
           style="flex:1;min-width:110px;background:#34a853;color:#fff;padding:9px 10px;border-radius:7px;text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;">
          🚶 Street View
        </a>
        <a href="${gmUrl}"  target="_blank"
           style="flex:1;min-width:110px;background:#4285F4;color:#fff;padding:9px 10px;border-radius:7px;text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;">
          🗺 Google Maps
        </a>
        <a href="${zilUrl}" target="_blank"
           style="flex:1;min-width:110px;background:#006AFF;color:#fff;padding:9px 10px;border-radius:7px;text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;">
          🏠 Zillow $
        </a>
        <a href="${rfUrl}"  target="_blank"
           style="flex:1;min-width:110px;background:#d73b2f;color:#fff;padding:9px 10px;border-radius:7px;text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;">
          🔴 Redfin $
        </a>
      </div>
    </div>`;
    })() : ""}

    <div style="margin-top:28px;text-align:center;">
      <a href="${approvalUrl}"
         style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                font-weight:bold;font-size:15px;padding:14px 40px;border-radius:6px;letter-spacing:.5px;">
        ✅ Approve Booking
      </a>
      <p style="margin-top:8px;font-size:12px;color:#f97316;font-weight:600;">
        ⚠️ After clicking — confirm on the page that opens (auto-confirms in 5 sec).
      </p>
      <p style="margin-top:6px;font-size:11px;color:#999;">
        Link: <a href="${approvalUrl}" style="color:#1B6FE8;">${approvalUrl}</a>
      </p>
    </div>

    <div style="margin-top:20px;padding:12px 16px;background:#eff6ff;border-radius:6px;font-size:13px;color:#1B6FE8;">
      ⏱ Call customer within 15 minutes to confirm appointment.
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021<br>
    Received: ${new Date(booking.createdAt).toLocaleString("en-US", { timeZone: "America/Chicago" })} CT
  </div>
</div>`;

  const text = [
    `New Booking — ${booking.id.slice(0, 8).toUpperCase()}`,
    `Name:          ${booking.name}`,
    `Phone:         ${booking.phone}`,
    `Email:         ${booking.email}`,
    `Address:       ${booking.address}`,
    `Appliance:     ${booking.appliance}`,
    `Brand/Model:   ${booking.brandModel}`,
    `Preferred Date:${booking.preferredDate}`,
    `Preferred Time:${booking.preferredTime}`,
    booking.message ? `\nMessage:\n${booking.message}` : "",
    `\nAPPROVE: ${approvalUrl}`,
    "\nCall customer within 15 minutes to confirm.",
  ].filter(Boolean).join("\n");

  try {
    await transporter.sendMail({
      from:    `"Hi-Tech Repair Group" <${emailUser}>`,
      to:      emailTo,
      subject,
      html,
      text,
    });
    req.log.info({ bookingId: booking.id }, "Approval email sent");
  } catch (err) {
    req.log.error({ err }, "Failed to send approval email");
    res.status(500).json({ error: "Failed to send email" });
    return;
  }

  res.json({ ok: true, id: booking.id });

  // ── WhatsApp notification to owner (fire-and-forget) ───────────────────
  sendOwnerWA(
    `📋 NEW BOOKING — ${booking.id.slice(0, 8).toUpperCase()}\n` +
    `👤 ${booking.name}\n` +
    `📞 ${booking.phone}\n` +
    `🔧 ${booking.appliance}${booking.brandModel ? ` · ${booking.brandModel}` : ""}\n` +
    `📅 ${booking.preferredDate} · ${booking.preferredTime}\n` +
    (booking.message ? `💬 ${booking.message}\n` : "") +
    `\n${ownerAddrBlock(booking.address)}\n` +
    `\n✅ Approve: ${approvalUrl}`,
    req.log,
  );

});

// ─── HubSpot sync ─────────────────────────────────────────────────────────────
async function syncToHubSpot(
  booking: Booking,
  log: { info: (obj: object, msg?: string) => void; error: (obj: object, msg?: string) => void },
): Promise<void> {
  const token = process.env["HUBSPOT_TOKEN"];
  if (!token) throw new Error("HUBSPOT_TOKEN not configured");

  const headers: Record<string, string> = {
    Authorization:  `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const nameParts  = booking.name.trim().split(" ");
  const firstname  = nameParts[0] ?? "";
  const lastname   = nameParts.slice(1).join(" ");

  const description = [
    booking.appliance    ? `Appliance: ${booking.appliance}`           : "",
    booking.brandModel   ? `Brand/Model: ${booking.brandModel}`        : "",
    booking.preferredDate ? `Preferred Date: ${booking.preferredDate}` : "",
    booking.preferredTime ? `Preferred Time: ${booking.preferredTime}` : "",
    booking.address      ? `Address: ${booking.address}`               : "",
    booking.message      ? `Message: ${booking.message}`               : "",
  ].filter(Boolean).join("\n");

  const contactProperties: Record<string, string> = {
    email: booking.email, firstname, lastname,
    phone: booking.phone, address: booking.address,
  };

  const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
    method: "POST", headers,
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: booking.email }] }],
      properties: ["id", "email"], limit: 1,
    }),
  });

  if (!searchRes.ok) throw new Error(`HubSpot search failed ${searchRes.status}`);
  const searchData = await searchRes.json() as { results?: Array<{ id: string }> };
  let contactId: string;

  if (searchData.results && searchData.results.length > 0) {
    contactId = searchData.results[0].id;
    const updateRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      { method: "PATCH", headers, body: JSON.stringify({ properties: contactProperties }) },
    );
    if (!updateRes.ok) throw new Error(`HubSpot update failed ${updateRes.status}`);
    log.info({ contactId }, "HubSpot contact updated");
  } else {
    const createRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST", headers, body: JSON.stringify({ properties: contactProperties }),
    });
    if (!createRes.ok) throw new Error(`HubSpot create failed ${createRes.status}`);
    const created = await createRes.json() as { id: string };
    contactId = created.id;
    log.info({ contactId }, "HubSpot contact created");
  }

  if (description && contactId) {
    try {
      const noteRes = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
        method: "POST", headers,
        body: JSON.stringify({
          properties: { hs_timestamp: new Date().toISOString(), hs_note_body: description },
          associations: [{ to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }] }],
        }),
      });
      if (noteRes.ok) log.info({ contactId }, "HubSpot note created");
      else log.error({ contactId }, "HubSpot note creation failed (non-critical)");
    } catch (noteErr) {
      log.error({ noteErr }, "HubSpot note error (non-critical)");
    }
  }
}

// ─── Admin PIN middleware (scrypt-hashed comparison) ─────────────────────────
async function verifyPin(provided: string, stored: string): Promise<boolean> {
  // Support both plain (legacy/dev) and hashed (salt:hash) formats
  if (!stored.includes(":")) {
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(stored));
  }
  const [salt, hash] = stored.split(":");
  return new Promise(resolve => {
    crypto.scrypt(provided, salt!, 64, (err, key) => {
      if (err) { resolve(false); return; }
      try {
        resolve(crypto.timingSafeEqual(Buffer.from(hash!, "hex"), key));
      } catch { resolve(false); }
    });
  });
}

function requireAdminPin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  // Accept Bearer token (biometric / session auth) as alternative to PIN
  const bearer = (req.headers["authorization"] as string | undefined)?.replace("Bearer ", "");
  if (bearer && verifyAdminToken(bearer)) { next(); return; }

  const adminPin = process.env["ADMIN_PIN"] ?? "";
  if (!adminPin) { next(); return; } // no pin set → open (dev only)
  const rawPin = (req.headers["x-admin-pin"] as string | undefined) ?? (req.query["pin"] as string | undefined) ?? "";
  const pin = (() => { try { return decodeURIComponent(rawPin); } catch { return rawPin; } })();
  verifyPin(pin, adminPin).then(ok => {
    if (!ok) { res.status(401).json({ error: "Unauthorized" }); return; }
    next();
  }).catch(() => res.status(401).json({ error: "Unauthorized" }));
}

// ─── GET /api/availability ───────────────────────────────────────────────────
// Returns booked and blocked time slots for a given date
// Query: ?date=Apr+10,+2026  OR  ?date=2026-04-10  (both formats supported)
bookingRouter.get("/availability", async (req, res) => {
  const { date } = req.query as { date?: string };
  if (!date) {
    res.status(400).json({ error: "date param required" });
    return;
  }
  const raw  = date.trim();
  const norm = normalizeDateStr(raw);   // canonical: "Apr 14, 2026"
  // Match both the normalized form AND the raw form (handles legacy ISO dates in DB)
  const [bookedRes, blockedRes] = await Promise.all([
    pool.query(
      `SELECT id, name, status, preferred_time FROM bookings
       WHERE ${dateMatchClause("preferred_date", 1)} AND status IN ('pending','approved')`,
      [norm, raw],
    ),
    pool.query(
      `SELECT slot_time, reason FROM blocked_slots
       WHERE ${dateMatchClause("slot_date", 1)}`,
      [norm, raw],
    ),
  ]);
  const bookedSlots   = bookedRes.rows.map((r: { preferred_time: string }) => r.preferred_time);
  const bookedDetails = bookedRes.rows.map((r: { preferred_time: string; id: string; name: string; status: string }) => ({
    time: r.preferred_time, id: r.id, name: r.name, status: r.status,
  }));
  const blockedSlots  = blockedRes.rows.map((r: { slot_time: string; reason: string }) => ({
    time: r.slot_time, reason: r.reason,
  }));
  res.json({ date: norm, bookedSlots, bookedDetails, blockedSlots });
});

// ─── POST /api/admin/hs-sync ──────────────────────────────────────────────────
// Checks HubSpot for deleted/archived deals and cancels the corresponding
// local bookings so the admin panel always reflects the true state.
// Sends WhatsApp to owner for each auto-cancelled booking.
bookingRouter.post("/admin/hs-sync", requireAdminPin, async (req, res) => {
  const token = process.env["HUBSPOT_TOKEN"];
  if (!token) { res.json({ ok: true, synced: 0, note: "no token" }); return; }

  try {
    // 1. Fetch all active bookings that have a linked HubSpot deal
    const { rows } = await pool.query<{
      id: string; hs_deal_id: string;
      name: string; phone: string; appliance: string;
      preferred_date: string; preferred_time: string;
    }>(
      `SELECT id, hs_deal_id, name, phone, appliance, preferred_date, preferred_time
       FROM bookings
       WHERE status IN ('pending','approved')
         AND hs_deal_id IS NOT NULL AND hs_deal_id <> ''`,
    );
    if (rows.length === 0) { res.json({ ok: true, synced: 0 }); return; }

    // 2. Batch-read those deals from HubSpot (single API call)
    const inputs = rows.map(r => ({ id: r.hs_deal_id }));
    const hsRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals/batch/read", {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ inputs, properties: ["dealstage"] }),
    });

    // Safety: if HubSpot returns a server error — abort, cancel nothing
    if (hsRes.status >= 500) {
      req.log.warn({ status: hsRes.status }, "hs-sync: HubSpot server error, skipping to avoid false cancellations");
      res.json({ ok: true, synced: 0, note: "hs api error" });
      return;
    }

    // Collect deal IDs that still exist (results from 200 or 207 Multi-Status)
    const existingIds = new Set<string>();
    const body = await hsRes.json() as { results?: Array<{ id: string }> };
    (body.results ?? []).forEach(d => existingIds.add(String(d.id)));

    // 3. Cancel bookings whose HubSpot deal is gone (archived or purged by owner)
    let synced = 0;
    for (const row of rows) {
      if (!existingIds.has(String(row.hs_deal_id))) {
        const r = await pool.query(
          `UPDATE bookings SET status = 'cancelled'
           WHERE id = $1 AND status IN ('pending','approved')`,
          [row.id],
        );
        if ((r.rowCount ?? 0) > 0) {
          synced++;
          req.log.info({ bookingId: row.id, hsDealId: row.hs_deal_id }, "hs-sync: booking cancelled (deal deleted in HubSpot)");

          // Notify owner via WhatsApp
          const shortId = row.id.slice(0, 8).toUpperCase();
          sendOwnerNotification(
            `🗑️ ЗАЯВКА УДАЛЕНА — ${shortId}\n` +
            `👤 ${row.name}\n` +
            `📞 ${row.phone}\n` +
            `🔧 ${row.appliance || "—"}\n` +
            `📅 ${row.preferred_date} · ${row.preferred_time}\n` +
            `ℹ️ Сделка удалена в HubSpot — бронь автоматически отменена`,
            req.log,
          );
        }
      }
    }

    res.json({ ok: true, synced });
  } catch (e: unknown) {
    req.log.warn({ err: e }, "hs-sync: non-fatal error");
    res.json({ ok: true, synced: 0, error: String(e) });
  }
});

// ─── GET /api/admin/schedule ──────────────────────────────────────────────────
// Returns all bookings + blocked slots for a given date range
// Also auto-completes past approved bookings (date has passed)
bookingRouter.get("/admin/schedule", requireAdminPin, async (req, res) => {
  // Auto-complete: mark approved bookings whose date has passed as 'completed'
  try {
    await pool.query(
      `UPDATE bookings SET status = 'completed'
       WHERE status = 'approved'
         AND preferred_date IS NOT NULL
         AND preferred_date <> ''
         AND preferred_date NOT LIKE '%–%'
         AND preferred_date NOT LIKE '%-%PM'
         AND preferred_date NOT LIKE '%-%AM'
         AND to_date(
           regexp_replace(preferred_date, ',$', ''),
           'Mon DD, YYYY'
         ) < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Chicago')::date - interval '2 days'`,
    );
  } catch (_) {
    // Non-fatal: some dates may not parse (e.g. WhatsApp ranges like "9 AM–12 PM")
  }

  const [bookings, blocked] = await Promise.all([
    pool.query(
      `SELECT id, name, email, phone, address, appliance, preferred_date, preferred_time, status, created_at
       FROM bookings
       ORDER BY created_at DESC`,
    ),
    pool.query(`SELECT id, slot_date, slot_time, reason FROM blocked_slots ORDER BY slot_date, slot_time`),
  ]);
  res.json({ bookings: bookings.rows, blocked: blocked.rows });
});

// ─── POST /api/admin/complete-booking ────────────────────────────────────────
// Manually mark a booking as completed (job done)
bookingRouter.post("/admin/complete-booking", requireAdminPin, async (req, res) => {
  const { id } = req.body as { id?: string };
  if (!id) { res.status(400).json({ error: "id required" }); return; }

  const booking = await findBooking(id);
  if (!booking || !["pending", "approved"].includes(booking.status)) {
    res.status(404).json({ error: "booking not found or already completed/cancelled" });
    return;
  }

  const { rowCount } = await pool.query(
    `UPDATE bookings SET status = 'completed' WHERE id = $1 AND status IN ('pending','approved')`,
    [id],
  );
  if (!rowCount) { res.status(404).json({ error: "booking not found or already completed/cancelled" }); return; }
  req.log.info({ bookingId: id }, "Booking marked as completed by admin");

  // ── HubSpot: update deal stage to closedwon ─────────────────────────────
  const hsDealId: string | undefined = booking.hsDealId;
  if (hsDealId) {
    updateDealStageInHubSpot(hsDealId, "closedwon", req.log).then(r => {
      if (r.ok) req.log.info({ hsDealId }, "HubSpot deal stage set to closedwon (booking completed)");
      else      req.log.warn({ error: r.error }, "HubSpot stage update failed on completion (non-fatal)");
    }).catch(() => {});
  } else {
    req.log.info({ bookingId: id }, "HubSpot stage update skipped on completion — no hs_deal_id");
  }

  // ── Email to owner ──────────────────────────────────────────────────────
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";

  if (emailUser && emailPass && emailTo) {
    void (async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        });
        const shortId = booking.id.slice(0, 8).toUpperCase();
        const rowHtml = (label: string, value: string) =>
          value ? `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px 8px;color:#666;width:140px;white-space:nowrap;">${label}</td><td style="padding:10px 8px;font-weight:600;">${value}</td></tr>` : "";
        await transporter.sendMail({
          from:    `"Hi-Tech Repair Group" <${emailUser}>`,
          to:      emailTo,
          subject: `✅ Заказ выполнен [${shortId}] — ${booking.name}`,
          html: `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#16a34a;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">✅ Заказ выполнен</h2>
    <p style="color:#bbf7d0;margin:6px 0 0;font-size:13px;">Hi-Tech Repair Group · ID: <strong style="color:#fff;">${shortId}</strong></p>
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rowHtml("Клиент",   booking.name)}
      ${rowHtml("Телефон",  booking.phone)}
      ${rowHtml("Техника",  booking.appliance)}
      ${rowHtml("Дата",     booking.preferredDate)}
      ${rowHtml("Время",    booking.preferredTime)}
      ${rowHtml("Адрес",    booking.address)}
    </table>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021<br>
    Завершено: ${new Date().toLocaleString("ru-RU", { timeZone: "America/Chicago" })} CT
  </div>
</div>`,
          text: `Заказ выполнен.\nID: ${shortId}\nКлиент: ${booking.name}\nТелефон: ${booking.phone}\nДата: ${booking.preferredDate} · ${booking.preferredTime}`,
        });
        req.log.info({ bookingId: id }, "Completion email sent to owner");
      } catch (err) {
        req.log.error({ err }, "Failed to send completion email to owner");
      }
    })();
  }

  // ── WhatsApp notification to owner ──────────────────────────────────────
  sendOwnerWA(
    `✅ ЗАКАЗ ВЫПОЛНЕН\n` +
    `👤 ${booking.name}\n` +
    `📞 ${booking.phone}\n` +
    `🔧 ${booking.appliance || "—"}\n` +
    `📅 ${booking.preferredDate} · ${booking.preferredTime}\n` +
    `🆔 ID: ${booking.id.slice(0, 8).toUpperCase()}\n` +
    `📌 Отмечено выполненным в панели управления`,
    req.log,
  );

  res.json({ ok: true });
});

// ─── POST /api/admin/approve-booking ─────────────────────────────────────────
// Admin approves a pending booking (sends confirmation email to client)
bookingRouter.post("/admin/approve-booking", requireAdminPin, async (req, res) => {
  const { id } = req.body as { id?: string };
  if (!id) { res.status(400).json({ error: "id required" }); return; }

  const booking = await findBooking(id);
  if (!booking) { res.status(404).json({ error: "booking not found" }); return; }

  if (booking.status === "approved") {
    res.json({ ok: true, alreadyApproved: true });
    return;
  }
  if (!["pending"].includes(booking.status)) {
    res.status(400).json({ error: `Cannot approve booking with status: ${booking.status}` });
    return;
  }

  await approveBooking(id);
  req.log.info({ bookingId: id }, "Booking approved by admin panel");

  // ── WhatsApp confirmation to client ────────────────────────────────────────
  sendClientConfirmWA(booking, req.log);

  // ── HubSpot — update existing deal stage OR create new if no deal yet ────
  if (booking.hsDealId) {
    // Deal already created at booking-submission time → just update stage to "closedwon"
    updateDealStageInHubSpot(booking.hsDealId, "closedwon", req.log).then(r => {
      if (r.ok) req.log.info({ hsDealId: booking.hsDealId, bookingId: id }, "HubSpot deal stage updated to closedwon on approval");
      else      req.log.warn({ error: r.error, bookingId: id }, "HubSpot stage update failed (non-fatal)");
    }).catch(() => {});
  } else {
    // No deal yet (legacy booking or HubSpot was down at creation) → create new
    const hsSource = booking.message === "Via WhatsApp Bot" ? "whatsapp" : "website";
    syncBookingToHubSpot({
      id:            booking.id,
      name:          booking.name,
      phone:         booking.phone,
      email:         booking.email,
      address:       booking.address,
      appliance:     booking.appliance,
      brandModel:    booking.brandModel,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      message:       booking.message,
      source:        hsSource,
    }, req.log).then(r => {
      if (r.ok) {
        req.log.info({ dealId: r.dealId, bookingId: id }, "HubSpot deal created on approval (no prior deal)");
        if (r.dealId) pool.query(`UPDATE bookings SET hs_deal_id=$1 WHERE id=$2`, [r.dealId, id]).catch(() => {});
      } else {
        req.log.warn({ error: r.error, bookingId: id }, "HubSpot sync failed on admin approval (non-fatal)");
      }
    }).catch((err: unknown) => req.log.error({ err, bookingId: id }, "HubSpot sync error on admin approval"));
  }

  // ── Confirmation email to client ───────────────────────────────────────────
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const API_BASE  = "https://htr-group-llc-appliance-repair.replit.app";
  const cancelUrl = `${API_BASE}/api/cancel?id=${booking.id}&token=${booking.approveToken}`;
  const isEs      = booking.language === "es";

  const clientRowHtml2 = (label: string, value: string) =>
    value
      ? `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px 8px;color:#666;width:160px;white-space:nowrap;">${label}</td><td style="padding:10px 8px;font-weight:600;">${value}</td></tr>`
      : "";

  const clientHtml2 = isEs ? `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">✅ ¡Su cita ha sido confirmada!</h2>
    <p style="color:#b3d4ff;margin:6px 0 0;font-size:13px;">Hi-Tech Repair Group · Área Metropolitana de Houston</p>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#1a1a1a;line-height:1.6;">Estimado/a <strong>${booking.name}</strong>,<br><br>Nos complace confirmar su cita de reparación de electrodomésticos en el hogar.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:18px;">
      ${clientRowHtml2("Nombre",           booking.name)}
      ${clientRowHtml2("Teléfono",         booking.phone)}
      ${clientRowHtml2("Dirección",        booking.address)}
      ${clientRowHtml2("Electrodoméstico", booking.appliance)}
      ${clientRowHtml2("Marca / Modelo",   booking.brandModel)}
      ${clientRowHtml2("Fecha programada", booking.preferredDate)}
      ${clientRowHtml2("Hora programada",  booking.preferredTime)}
    </table>
    <div style="margin-top:24px;padding:16px 20px;background:#fff7ed;border-left:4px solid #f97316;border-radius:6px;font-size:14px;line-height:1.7;color:#7c2d12;">
      <strong>🐾 Aviso importante — Seguridad de mascotas y técnico:</strong><br>
      Por razones de seguridad, tanto para nuestro técnico como para sus mascotas, le pedimos que <strong>aísle en una habitación separada</strong> a todos los animales grandes, reptiles, animales exóticos y gatos antes de la llegada del técnico.
    </div>
    <p style="margin-top:24px;font-size:14px;color:#444;">Preguntas: <a href="tel:3468206021" style="color:#1B6FE8;font-weight:600;">(346) 820-6021</a></p>
    <div style="margin-top:20px;padding:14px 18px;background:#fef2f2;border-radius:8px;font-size:13px;color:#666;text-align:center;">
      ¿Necesita cancelar? <a href="${cancelUrl}" style="color:#dc2626;font-weight:600;">Cancelar mi cita</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">Hi-Tech Repair Group · Houston · (346) 820-6021</div>
</div>` : `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">✅ Your Appointment is Confirmed!</h2>
    <p style="color:#b3d4ff;margin:6px 0 0;font-size:13px;">Hi-Tech Repair Group · Houston Metropolitan Area</p>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#1a1a1a;line-height:1.6;">Dear <strong>${booking.name}</strong>,<br><br>We are pleased to confirm your home appliance repair appointment.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:18px;">
      ${clientRowHtml2("Name",           booking.name)}
      ${clientRowHtml2("Phone",          booking.phone)}
      ${clientRowHtml2("Address",        booking.address)}
      ${clientRowHtml2("Appliance",      booking.appliance)}
      ${clientRowHtml2("Brand / Model",  booking.brandModel)}
      ${clientRowHtml2("Scheduled Date", booking.preferredDate)}
      ${clientRowHtml2("Scheduled Time", booking.preferredTime)}
    </table>
    <div style="margin-top:24px;padding:16px 20px;background:#fff7ed;border-left:4px solid #f97316;border-radius:6px;font-size:14px;line-height:1.7;color:#7c2d12;">
      <strong>🐾 Important — Pet & Technician Safety Notice:</strong><br>
      For the safety of both our technician and your pets, please <strong>isolate in a separate room</strong> all large animals, reptiles, exotic animals, and cats before our technician arrives.
    </div>
    <p style="margin-top:24px;font-size:14px;color:#444;">Questions: <a href="tel:3468206021" style="color:#1B6FE8;font-weight:600;">(346) 820-6021</a></p>
    <div style="margin-top:20px;padding:14px 18px;background:#fef2f2;border-radius:8px;font-size:13px;color:#666;text-align:center;">
      Need to cancel? <a href="${cancelUrl}" style="color:#dc2626;font-weight:600;">Cancel my appointment</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021</div>
</div>`;

  let emailSent = false;
  if (emailUser && emailPass && booking.email) {
    try {
      const t = nodemailer.createTransport({ service: "gmail", auth: { user: emailUser, pass: emailPass } });
      await t.sendMail({
        from:    `"Hi-Tech Repair Group" <${emailUser}>`,
        to:      booking.email,
        subject: isEs ? "✅ Cita confirmada — Hi-Tech Repair Group" : "✅ Appointment Confirmed — Hi-Tech Repair Group",
        html:    clientHtml2,
      });
      emailSent = true;
      req.log.info({ bookingId: id, clientEmail: booking.email }, "Confirmation email sent to client (admin approve)");
    } catch (err) {
      req.log.error({ err }, "Failed to send confirmation email (admin approve)");
    }
  }

  res.json({ ok: true, emailSent });
});

// ─── POST /api/admin/block ────────────────────────────────────────────────────
bookingRouter.post("/admin/block", requireAdminPin, async (req, res) => {
  const { date, time, reason } = req.body as { date?: string; time?: string; reason?: string };
  if (!date || !time) {
    res.status(400).json({ error: "date and time required" });
    return;
  }
  const reasonTrimmed = (reason ?? "").trim();
  await pool.query(
    `INSERT INTO blocked_slots (slot_date, slot_time, reason)
     VALUES ($1, $2, $3)
     ON CONFLICT (slot_date, slot_time) DO UPDATE SET reason = EXCLUDED.reason`,
    [date.trim(), time.trim(), reasonTrimmed],
  );

  // ── Send notification email in background (non-blocking) ───────────────
  res.json({ ok: true });
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";
  if (emailUser && emailPass && emailTo) {
    void (async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        });
        const subject = `🔒 Slot Blocked — ${date.trim()} · ${time.trim()}`;
        const html = `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#0B1A3F;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">🔒 Slot Blocked by Administrator</h2>
    <p style="color:#8ba3cc;margin:6px 0 0;font-size:13px;">HTRGroupTX &nbsp;·&nbsp; Admin Action</p>
  </div>
  <div style="padding:24px;">
    <div style="display:inline-block;background:#f97316;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:.5px;margin-bottom:20px;">
      ЗАБЛОКИРОВАН АДМИНИСТРАТОРОМ
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;width:130px;">📅 Дата</td>
        <td style="padding:10px 8px;font-weight:600;">${date.trim()}</td>
      </tr>
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">🕐 Время</td>
        <td style="padding:10px 8px;font-weight:600;">${time.trim()}</td>
      </tr>
      ${reasonTrimmed ? `<tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">📝 Причина</td>
        <td style="padding:10px 8px;font-weight:600;">${reasonTrimmed}</td>
      </tr>` : ""}
    </table>
    <p style="margin:20px 0 0;font-size:12px;color:#999;">
      Этот слот заблокирован вручную и недоступен для онлайн-бронирования.<br>
      Чтобы разблокировать — войдите в Admin Panel и нажмите «Разблокировать».
    </p>
  </div>
  <div style="background:#f5f5f5;padding:12px 24px;font-size:11px;color:#aaa;text-align:center;">
    HTRGroupTX · (346) 820-6021 · htrgrouptx.com
  </div>
</div>`;
        await transporter.sendMail({ from: `"HTRGroupTX Admin" <${emailUser}>`, to: emailTo, subject, html });
      } catch (err) {
        console.warn("Block notification email failed:", err);
      }
    })();
  }
});

// ─── DELETE /api/admin/block ──────────────────────────────────────────────────
bookingRouter.delete("/admin/block", requireAdminPin, async (req, res) => {
  const { date, time } = req.body as { date?: string; time?: string };
  if (!date || !time) {
    res.status(400).json({ error: "date and time required" });
    return;
  }
  await pool.query(
    `DELETE FROM blocked_slots WHERE slot_date = $1 AND slot_time = $2`,
    [date.trim(), time.trim()],
  );

  // ── Send notification email in background (non-blocking) ───────────────
  res.json({ ok: true });
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";
  if (emailUser && emailPass && emailTo) {
    void (async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        });
        const subject = `🔓 Slot Unblocked — ${date.trim()} · ${time.trim()}`;
        const html = `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#0B1A3F;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">🔓 Slot Unblocked by Administrator</h2>
    <p style="color:#8ba3cc;margin:6px 0 0;font-size:13px;">HTRGroupTX &nbsp;·&nbsp; Admin Action</p>
  </div>
  <div style="padding:24px;">
    <div style="display:inline-block;background:#16a34a;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:.5px;margin-bottom:20px;">
      РАЗБЛОКИРОВАН АДМИНИСТРАТОРОМ
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;width:130px;">📅 Дата</td>
        <td style="padding:10px 8px;font-weight:600;">${date.trim()}</td>
      </tr>
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:10px 8px;color:#666;">🕐 Время</td>
        <td style="padding:10px 8px;font-weight:600;">${time.trim()}</td>
      </tr>
    </table>
    <p style="margin:20px 0 0;font-size:12px;color:#999;">
      Этот слот разблокирован и снова доступен для онлайн-бронирования.
    </p>
  </div>
  <div style="background:#f5f5f5;padding:12px 24px;font-size:11px;color:#aaa;text-align:center;">
    HTRGroupTX · (346) 820-6021 · htrgrouptx.com
  </div>
</div>`;
        await transporter.sendMail({ from: `"HTRGroupTX Admin" <${emailUser}>`, to: emailTo, subject, html });
      } catch (err) {
        console.warn("Unblock notification email failed:", err);
      }
    })();
  }
});

// ─── POST /api/admin/booking ─────────────────────────────────────────────────
// Manually create a booking (admin only, auto-approved, sends notification email)
bookingRouter.post("/admin/booking", requireAdminPin, async (req, res) => {
  const { name, phone, email, address, date, time, appliance, message } =
    req.body as Record<string, string | undefined>;

  if (!name || !phone || !date || !time) {
    res.status(400).json({ error: "name, phone, date, time required" });
    return;
  }

  const normDate    = normalizeDateStr(date.trim());
  const emailTrim   = (email   ?? "").trim();
  const addressTrim = (address ?? "").trim();

  // Conflict check (both normalized and raw form)
  const { rows: conflict } = await pool.query(
    `SELECT id FROM bookings
     WHERE ${dateMatchClause("preferred_date", 1)} AND preferred_time = $3
       AND status IN ('pending','approved')
     LIMIT 1`,
    [normDate, date.trim(), time.trim()],
  );
  if (conflict.length > 0) {
    res.status(409).json({ error: "slot_taken" });
    return;
  }

  const id = crypto.randomUUID();
  const msgTrimmed = (message ?? "").trim();

  await pool.query(
    `INSERT INTO bookings
       (id, approve_token, status, name, phone, email, address, appliance,
        brand_model, preferred_date, preferred_time, message, language, created_at)
     VALUES ($1,$2,'approved',$3,$4,$5,$6,$7,' ',$8,$9,$10,'en',$11)`,
    [
      id, crypto.randomUUID(),
      name.trim(), phone.trim(),
      emailTrim, addressTrim,
      (appliance ?? "").trim(),
      normDate, time.trim(),
      msgTrimmed,
      new Date().toISOString(),
    ],
  );
  req.log.info({ bookingId: id }, "Manual booking created by admin");

  // ── HubSpot sync (fire-and-forget) ────────────────────────────────────
  syncBookingToHubSpot({
    id,
    name:          name.trim(),
    phone:         phone.trim(),
    email:         emailTrim,
    address:       addressTrim || msgTrimmed,
    appliance:     (appliance ?? "").trim(),
    preferredDate: normDate,
    preferredTime: time.trim(),
    message:       msgTrimmed,
    source:        "admin",
  }, req.log).then(r => {
    if (r.ok) {
      req.log.info({ dealId: r.dealId }, "HubSpot deal created (admin booking)");
      if (r.dealId) {
        pool.query(`UPDATE bookings SET hs_deal_id=$1 WHERE id=$2`, [r.dealId, id]).catch(() => {});
        // Admin bookings are immediately approved → move deal to closedwon
        updateDealStageInHubSpot(r.dealId, "closedwon", req.log).then(upd => {
          if (upd.ok) req.log.info({ dealId: r.dealId }, "HubSpot admin booking deal → closedwon");
          else req.log.warn({ error: upd.error }, "HubSpot closedwon update failed (non-fatal)");
        }).catch(() => {});
      }
    } else {
      req.log.warn({ error: r.error }, "HubSpot sync failed (non-fatal)");
    }
  }).catch(() => {});

  // ── Send notification email ─────────────────────────────────────────────
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";

  if (emailUser && emailPass && emailTo) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: emailUser, pass: emailPass },
      });

      const shortId = id.slice(0, 8).toUpperCase();
      const subject = `🛠️ Admin Booking [${shortId}] — ${(appliance ?? "Appliance Repair").trim()}`;

      const rowHtml = (label: string, value: string) =>
        value
          ? `<tr style="border-bottom:1px solid #eee;">
               <td style="padding:10px 8px;color:#666;width:140px;white-space:nowrap;">${label}</td>
               <td style="padding:10px 8px;font-weight:600;">${value}</td>
             </tr>`
          : "";

      const html = `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#0D47B0;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">🛠️ Забронировано администратором</h2>
    <p style="color:#b3d4ff;margin:6px 0 0;font-size:13px;">
      Hi-Tech Repair Group &nbsp;·&nbsp; ID: <strong style="color:#fff;">${shortId}</strong>
    </p>
  </div>
  <div style="background:#fff3cd;border-left:4px solid #f59e0b;padding:12px 20px;font-size:13px;color:#92400e;font-weight:600;">
    ⚠️ Это бронирование создано вручную администратором. Статус: ПОДТВЕРЖДЕНО
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rowHtml("Имя клиента",  name.trim())}
      ${rowHtml("Телефон",      `<a href="tel:${phone.trim()}" style="color:#1B6FE8;">${phone.trim()}</a>`)}
      ${rowHtml("Техника",      (appliance ?? "").trim())}
      ${rowHtml("Дата",         date.trim())}
      ${rowHtml("Время",        time.trim())}
    </table>
    ${msgTrimmed ? `
    <div style="margin-top:18px;">
      <p style="font-size:13px;color:#666;margin:0 0 6px;font-weight:600;">Заметка / Адрес:</p>
      <div style="background:#f8fafc;border-left:4px solid #0D47B0;padding:12px 16px;border-radius:4px;font-size:14px;line-height:1.65;">
        ${msgTrimmed.replace(/\n/g, "<br>")}
      </div>
    </div>` : ""}
    <div style="margin-top:24px;padding:14px 18px;background:#eff6ff;border-radius:6px;font-size:13px;color:#1B6FE8;">
      ✅ Слот уже подтверждён — дополнительного одобрения не требуется.
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021<br>
    Создано: ${new Date().toLocaleString("ru-RU", { timeZone: "America/Chicago" })} CT
  </div>
</div>`;

      await transporter.sendMail({
        from:    `"Hi-Tech Repair Group" <${emailUser}>`,
        to:      emailTo,
        subject,
        html,
        text: [
          `[ADMIN BOOKING] ID: ${shortId}`,
          `Имя: ${name.trim()}`,
          `Телефон: ${phone.trim()}`,
          `Техника: ${(appliance ?? "").trim()}`,
          `Дата: ${date.trim()} · Время: ${time.trim()}`,
          msgTrimmed ? `Заметка: ${msgTrimmed}` : "",
          `Статус: ПОДТВЕРЖДЕНО (создано администратором)`,
        ].filter(Boolean).join("\n"),
      });
      req.log.info({ bookingId: id }, "Admin booking notification email sent");
    } catch (err) {
      req.log.error({ err }, "Failed to send admin booking email (non-fatal)");
    }
  }

  res.json({ ok: true, id });

  // ── WA+SMS notification to owner (fire-and-forget) ─────────────────────────
  sendOwnerNotification(
    `🛠️ ADMIN BOOKING — ${id.slice(0, 8).toUpperCase()}\n` +
    `👤 ${name.trim()}\n` +
    `📞 ${phone.trim()}\n` +
    (emailTrim ? `📧 ${emailTrim}\n` : "") +
    `🔧 ${(appliance ?? "").trim() || "—"}\n` +
    `📅 ${date.trim()} · ${time.trim()}\n` +
    (addressTrim ? `📍 ${addressTrim}\n` : "") +
    (msgTrimmed  ? `💬 ${msgTrimmed}\n` : "") +
    `✅ Создано администратором — статус: ПОДТВЕРЖДЕНО`,
    req.log,
  );
});

// ─── POST /api/admin/edit-booking ────────────────────────────────────────────
// Edit an existing booking. Sends email + WA+SMS. Updates HubSpot (archive old → create new).
bookingRouter.post("/admin/edit-booking", requireAdminPin, async (req, res) => {
  const { id, name, phone, email, address, date, time, appliance, message } =
    req.body as Record<string, string | undefined>;

  if (!id || !name || !phone || !date || !time) {
    res.status(400).json({ error: "id, name, phone, date, time required" });
    return;
  }

  const booking = await findBooking(id);
  if (!booking) {
    res.status(404).json({ error: "booking not found" });
    return;
  }
  if (["cancelled", "completed"].includes(booking.status)) {
    res.status(400).json({ error: `Cannot edit booking with status: ${booking.status}` });
    return;
  }

  const normDate    = normalizeDateStr(date.trim());
  const emailTrim   = (email   ?? "").trim();
  const addressTrim = (address ?? "").trim();
  const applianceTrim = (appliance ?? "").trim();
  const msgTrim     = (message ?? "").trim();

  // Check for slot conflict with OTHER bookings (excluding this one)
  if (normDate && time.trim()) {
    const { rows: conflict } = await pool.query(
      `SELECT id FROM bookings
       WHERE (preferred_date = $1 OR preferred_date = $2) AND preferred_time = $3
         AND status IN ('pending','approved') AND id != $4
       LIMIT 1`,
      [normDate, date.trim(), time.trim(), id],
    );
    if (conflict.length > 0) {
      res.status(409).json({ error: "slot_taken", message: "That time slot is already booked." });
      return;
    }
  }

  // Update in DB
  await pool.query(
    `UPDATE bookings
     SET name=$1, phone=$2, email=$3, address=$4, appliance=$5,
         preferred_date=$6, preferred_time=$7, message=$8
     WHERE id=$9`,
    [name.trim(), phone.trim(), emailTrim, addressTrim, applianceTrim, normDate, time.trim(), msgTrim, id],
  );
  req.log.info({ bookingId: id }, "Booking edited by admin");

  res.json({ ok: true });

  // ── HubSpot: archive old deal, create new ────────────────────────────────
  const oldDealId = booking.hsDealId;
  if (oldDealId) {
    cancelDealInHubSpot(oldDealId, req.log).then(r => {
      if (r.ok) req.log.info({ oldDealId }, "HubSpot old deal archived on edit");
      else      req.log.warn({ error: r.error }, "HubSpot old deal archive failed on edit (non-fatal)");
    }).catch(() => {});
  }
  const hsSource = booking.message === "Via WhatsApp Bot" ? "whatsapp" : "admin";
  syncBookingToHubSpot({
    id,
    name:          name.trim(),
    phone:         phone.trim(),
    email:         emailTrim,
    address:       addressTrim,
    appliance:     applianceTrim,
    preferredDate: normDate,
    preferredTime: time.trim(),
    message:       msgTrim || booking.message,
    source:        hsSource as "website" | "whatsapp" | "admin",
  }, req.log).then(r => {
    if (r.ok && r.dealId) {
      pool.query(`UPDATE bookings SET hs_deal_id=$1 WHERE id=$2`, [r.dealId, id]).catch(() => {});
      req.log.info({ dealId: r.dealId, bookingId: id }, "HubSpot new deal created after edit");
    } else if (!r.ok) {
      req.log.warn({ error: r.error, bookingId: id }, "HubSpot new deal failed after edit (non-fatal)");
    }
  }).catch(() => {});

  // ── Email to owner ────────────────────────────────────────────────────────
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";
  if (emailUser && emailPass && emailTo) {
    void (async () => {
      try {
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: emailUser, pass: emailPass } });
        const shortId = id.slice(0, 8).toUpperCase();
        const rowHtml = (label: string, value: string) =>
          value ? `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px 8px;color:#666;width:140px;white-space:nowrap;">${label}</td><td style="padding:10px 8px;font-weight:600;">${value}</td></tr>` : "";

        await transporter.sendMail({
          from:    `"Hi-Tech Repair Group" <${emailUser}>`,
          to:      emailTo,
          subject: `✏️ Бронирование изменено [${shortId}] — ${name.trim()}`,
          html: `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#7c3aed;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">✏️ Бронирование изменено</h2>
    <p style="color:#ddd6fe;margin:6px 0 0;font-size:13px;">Hi-Tech Repair Group · ID: <strong style="color:#fff;">${shortId}</strong></p>
  </div>
  <div style="background:#f5f3ff;border-left:4px solid #7c3aed;padding:12px 20px;font-size:13px;color:#5b21b6;font-weight:600;">
    ✏️ Данные брони изменены администратором
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rowHtml("Клиент",   name.trim())}
      ${rowHtml("Телефон",  `<a href="tel:${phone.trim()}" style="color:#1B6FE8;">${phone.trim()}</a>`)}
      ${rowHtml("Email",    emailTrim)}
      ${rowHtml("Адрес",    addressTrim)}
      ${rowHtml("Техника",  applianceTrim)}
      ${rowHtml("Дата",     date.trim())}
      ${rowHtml("Время",    time.trim())}
    </table>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021<br>
    Изменено: ${new Date().toLocaleString("ru-RU", { timeZone: "America/Chicago" })} CT
  </div>
</div>`,
          text: `Бронирование изменено.\nID: ${shortId}\nКлиент: ${name.trim()}\nТелефон: ${phone.trim()}\nДата: ${date.trim()} · ${time.trim()}`,
        });
        req.log.info({ bookingId: id }, "Edit notification email sent to owner");
      } catch (err) {
        req.log.error({ err }, "Failed to send edit email (non-fatal)");
      }
    })();
  }

  // ── WA+SMS to owner ───────────────────────────────────────────────────────
  sendOwnerNotification(
    `✏️ БРОНЬ ИЗМЕНЕНА — ${id.slice(0, 8).toUpperCase()}\n` +
    `👤 ${name.trim()}\n` +
    `📞 ${phone.trim()}\n` +
    (emailTrim    ? `📧 ${emailTrim}\n`    : "") +
    `🔧 ${applianceTrim || "—"}\n` +
    `📅 ${date.trim()} · ${time.trim()}\n` +
    (addressTrim  ? `📍 ${addressTrim}\n`  : "") +
    `✏️ Данные обновлены администратором`,
    req.log,
  );
});

// ─── POST /api/admin/cancel-booking ──────────────────────────────────────────
// Cancel a client booking — sets status to 'cancelled' and sends notification emails
bookingRouter.post("/admin/cancel-booking", requireAdminPin, async (req, res) => {
  const { id } = req.body as { id?: string };
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }

  // Fetch booking details BEFORE cancelling (so we have name/phone/email/date/time)
  const booking = await findBooking(id);
  if (!booking || !["pending", "approved"].includes(booking.status)) {
    res.status(404).json({ error: "booking not found or already cancelled" });
    return;
  }

  const { rowCount } = await pool.query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status IN ('pending','approved')`,
    [id],
  );
  if (!rowCount) {
    res.status(404).json({ error: "booking not found or already cancelled" });
    return;
  }
  req.log.info({ bookingId: id }, "Booking cancelled by admin");

  // ── HubSpot: delete the deal (booking cancelled) ────────────────────────────
  const hsDealId: string | undefined = booking.hsDealId;
  if (hsDealId) {
    cancelDealInHubSpot(hsDealId, req.log).then(r => {
      if (r.ok) req.log.info({ hsDealId }, "HubSpot deal deleted (admin cancel)");
      else      req.log.warn({ error: r.error }, "HubSpot deal delete failed (non-fatal)");
    }).catch(() => {});
  } else {
    req.log.info({ bookingId: id }, "HubSpot cancel skipped — no hs_deal_id (booking pre-dates HubSpot sync)");
  }

  // ── Also free blocked_slots linked to this booking ─────────────────────────
  // WA bookings block individual hourly slots; clear them when booking is cancelled
  try {
    const WA_MORNING   = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM"];
    const WA_AFTERNOON = ["1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
    const pt = booking.preferredTime ?? "";
    const isWAMorning   = pt.includes("9 AM") || pt.includes("AM–12") || pt.includes("AM-12");
    const isWAAfternoon = pt.includes("1 PM") || pt.includes("PM–5") || pt.includes("PM-5");
    if (isWAMorning || isWAAfternoon) {
      const hours = isWAMorning ? WA_MORNING : WA_AFTERNOON;
      for (const h of hours) {
        await pool.query(
          `DELETE FROM blocked_slots WHERE slot_date = $1 AND slot_time = $2`,
          [booking.preferredDate, h],
        );
      }
      req.log.info({ bookingId: id, date: booking.preferredDate }, "Cleared WA blocked slots on cancel");
    }
  } catch (e) {
    req.log.warn({ err: e }, "Could not clear blocked_slots on cancel (non-fatal)");
  }

  // ── Send notification emails (non-fatal) ──────────────────────────────────
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";

  if (emailUser && emailPass && emailTo) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: emailUser, pass: emailPass },
      });

      const shortId  = booking.id.slice(0, 8).toUpperCase();
      const rowHtml  = (label: string, value: string) =>
        value
          ? `<tr style="border-bottom:1px solid #eee;">
               <td style="padding:10px 8px;color:#666;width:140px;white-space:nowrap;">${label}</td>
               <td style="padding:10px 8px;font-weight:600;">${value}</td>
             </tr>`
          : "";

      // ── Email to admin ──────────────────────────────────────────────────
      const adminHtml = `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#dc2626;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">❌ Бронирование отменено</h2>
    <p style="color:#fecaca;margin:6px 0 0;font-size:13px;">
      Hi-Tech Repair Group &nbsp;·&nbsp; ID: <strong style="color:#fff;">${shortId}</strong>
    </p>
  </div>
  <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 20px;font-size:13px;color:#991b1b;font-weight:600;">
    ⚠️ Слот освобождён администратором — доступен для новых бронирований
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rowHtml("Клиент",    booking.name)}
      ${rowHtml("Телефон",   `<a href="tel:${booking.phone}" style="color:#1B6FE8;">${booking.phone}</a>`)}
      ${rowHtml("Email",     booking.email && booking.email !== "" ? `<a href="mailto:${booking.email}" style="color:#1B6FE8;">${booking.email}</a>` : "")}
      ${rowHtml("Техника",   booking.appliance)}
      ${rowHtml("Дата",      booking.preferredDate)}
      ${rowHtml("Время",     booking.preferredTime)}
    </table>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021<br>
    Отменено: ${new Date().toLocaleString("ru-RU", { timeZone: "America/Chicago" })} CT
  </div>
</div>`;

      await transporter.sendMail({
        from:    `"Hi-Tech Repair Group" <${emailUser}>`,
        to:      emailTo,
        subject: `❌ Бронирование отменено [${shortId}] — ${booking.name}`,
        html:    adminHtml,
        text:    `Бронирование отменено.\nID: ${shortId}\nКлиент: ${booking.name}\nТелефон: ${booking.phone}\nДата: ${booking.preferredDate} · ${booking.preferredTime}\nСлот освобождён.`,
      });
      req.log.info({ bookingId: id }, "Admin cancellation email sent to owner");

      // ── Email to client (only if they have a real email address) ────────
      const clientEmail = booking.email?.trim();
      if (clientEmail && clientEmail !== "" && clientEmail.includes("@")) {
        const isEs = booking.language === "es";

        const clientSubject = isEs
          ? `Su cita ha sido cancelada — HTRGroupTX`
          : `Your appointment has been cancelled — HTRGroupTX`;

        const clientHtml = `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:20px 24px;">
    <h2 style="color:#fff;margin:0;font-size:18px;">
      ${isEs ? "Su cita ha sido cancelada" : "Your appointment has been cancelled"}
    </h2>
    <p style="color:#b3d4ff;margin:6px 0 0;font-size:13px;">HTRGroupTX · Hi-Tech Repair Group</p>
  </div>
  <div style="padding:24px;font-size:14px;color:#333;line-height:1.7;">
    <p>${isEs ? "Estimado/a" : "Dear"} <strong>${booking.name}</strong>,</p>
    <p>
      ${isEs
        ? `Le informamos que su cita del <strong>${booking.preferredDate}</strong> a las <strong>${booking.preferredTime}</strong> ha sido cancelada por nuestro equipo.`
        : `We would like to inform you that your appointment on <strong>${booking.preferredDate}</strong> at <strong>${booking.preferredTime}</strong> has been cancelled by our team.`}
    </p>
    <p>
      ${isEs
        ? `Si tiene preguntas o desea reagendar, no dude en contactarnos:`
        : `If you have any questions or would like to reschedule, please don't hesitate to contact us:`}
    </p>
    <div style="background:#eff6ff;border-radius:8px;padding:14px 18px;margin:16px 0;font-size:14px;">
      📞 <a href="tel:3468206021" style="color:#1B6FE8;font-weight:600;">(346) 820-6021</a><br>
      ✉️ <a href="mailto:htrgroupllc@gmail.com" style="color:#1B6FE8;">htrgroupllc@gmail.com</a>
    </div>
    <p style="font-size:13px;color:#666;">
      ${isEs ? "Gracias por elegir HTRGroupTX." : "Thank you for choosing HTRGroupTX."}
    </p>
  </div>
  <div style="background:#f8fafc;padding:12px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021
  </div>
</div>`;

        await transporter.sendMail({
          from:    `"HTRGroupTX" <${emailUser}>`,
          to:      clientEmail,
          subject: clientSubject,
          html:    clientHtml,
          text: isEs
            ? `Estimado/a ${booking.name},\n\nSu cita del ${booking.preferredDate} a las ${booking.preferredTime} ha sido cancelada.\n\nPara reagendar: (346) 820-6021\n\nHTRGroupTX`
            : `Dear ${booking.name},\n\nYour appointment on ${booking.preferredDate} at ${booking.preferredTime} has been cancelled.\n\nTo reschedule: (346) 820-6021\n\nHTRGroupTX`,
        });
        req.log.info({ bookingId: id, clientEmail }, "Cancellation email sent to client");
      }
    } catch (err) {
      req.log.error({ err }, "Failed to send cancellation email (non-fatal)");
    }
  }

  // ── WhatsApp notification to owner — admin cancelled ──────────────────────
  sendOwnerWA(
    `❌ ОТМЕНЕНО АДМИНИСТРАТОРОМ\n` +
    `👤 ${booking.name}\n` +
    `📞 ${booking.phone}\n` +
    `🔧 ${booking.appliance || "—"}\n` +
    `📅 ${booking.preferredDate} · ${booking.preferredTime}\n` +
    `🆔 ID: ${booking.id.slice(0, 8).toUpperCase()}\n` +
    `📌 Слот освобождён (отмена из панели управления)`,
    req.log,
  );

  res.json({ ok: true });
});

// ─── POST /api/admin/delete-booking ──────────────────────────────────────────
// Permanently delete a booking from the database (irreversible).
bookingRouter.post("/admin/delete-booking", requireAdminPin, async (req, res) => {
  const { id } = req.body as { id?: string };
  if (!id) { res.status(400).json({ error: "id required" }); return; }

  const booking = await findBooking(id);
  if (!booking) { res.status(404).json({ error: "booking not found" }); return; }

  // Free any blocked slots linked to this booking (non-fatal)
  try {
    const hours = (booking.preferredTime ?? "").match(/\b(\d{1,2}):\d{2}\s*(AM|PM)\b/gi) ?? [];
    for (const h of hours) {
      await pool.query(
        `DELETE FROM blocked_slots WHERE date = $1 AND slot_label = $2`,
        [booking.preferredDate, h],
      );
    }
  } catch (e) {
    req.log.warn({ err: e }, "Could not clear blocked_slots on permanent delete (non-fatal)");
  }

  await pool.query(`DELETE FROM bookings WHERE id = $1`, [id]);
  req.log.info({ bookingId: id }, "Booking permanently deleted by admin");

  res.json({ ok: true });
});

// ─── POST /api/admin/bulk-delete-bookings ────────────────────────────────────
// Permanently delete multiple bookings in one request.
bookingRouter.post("/admin/bulk-delete-bookings", requireAdminPin, async (req, res) => {
  const { ids } = req.body as { ids?: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: "ids array required" });
    return;
  }

  // Free blocked slots for each booking (non-fatal)
  for (const id of ids) {
    try {
      const booking = await findBooking(id);
      if (!booking) continue;
      const hours = (booking.preferredTime ?? "").match(/\b(\d{1,2}):\d{2}\s*(AM|PM)\b/gi) ?? [];
      for (const h of hours) {
        await pool.query(
          `DELETE FROM blocked_slots WHERE date = $1 AND slot_label = $2`,
          [booking.preferredDate, h],
        );
      }
    } catch (e) {
      req.log.warn({ err: e, id }, "Could not clear blocked_slots on bulk delete (non-fatal)");
    }
  }

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const { rowCount } = await pool.query(
    `DELETE FROM bookings WHERE id IN (${placeholders})`,
    ids,
  );
  req.log.info({ count: rowCount, ids }, "Bulk delete by admin");

  res.json({ ok: true, deleted: rowCount });
});

// ─── POST /api/admin/restore-booking ─────────────────────────────────────────
// Restore a cancelled booking back to 'pending' status.
// Accepts optional newDate / newTime to reschedule on conflict.
bookingRouter.post("/admin/restore-booking", requireAdminPin, async (req, res) => {
  const { id, newDate, newTime, newName, newPhone, newEmail, newAddress, newAppliance, newMessage } = req.body as {
    id?: string; newDate?: string; newTime?: string;
    newName?: string; newPhone?: string; newEmail?: string;
    newAddress?: string; newAppliance?: string; newMessage?: string;
  };
  if (!id) { res.status(400).json({ error: "id required" }); return; }

  const booking = await findBooking(id);
  if (!booking) { res.status(404).json({ error: "booking not found" }); return; }
  if (booking.status !== "cancelled" && booking.status !== "completed") {
    res.status(400).json({ error: `Cannot restore booking with status: ${booking.status}` });
    return;
  }

  // Use new date/time if admin explicitly rescheduled, otherwise keep original
  const restoreDate = (newDate ?? booking.preferredDate).trim();
  const restoreTime = (newTime ?? booking.preferredTime).trim();

  // ── Conflict check (only when not explicitly rescheduling) ─────────────────
  if (!newDate && !newTime) {
    const [conflictBook, conflictBlock] = await Promise.all([
      pool.query<{ name: string }>(
        `SELECT name FROM bookings
         WHERE id <> $1
           AND preferred_date = $2
           AND preferred_time = $3
           AND status IN ('pending','approved')`,
        [id, restoreDate, restoreTime],
      ),
      pool.query<{ slot_time: string }>(
        `SELECT slot_time FROM blocked_slots
         WHERE slot_date = $1 AND slot_time = $2`,
        [restoreDate, restoreTime],
      ),
    ]);
    if ((conflictBook.rowCount ?? 0) > 0 || (conflictBlock.rowCount ?? 0) > 0) {
      const conflictName = conflictBook.rows[0]?.name ?? "Заблокировано";
      res.json({ conflict: true, conflictWith: { name: conflictName, date: restoreDate, time: restoreTime } });
      return;
    }
  }

  // ── Update date/time if rescheduled ────────────────────────────────────────
  if (newDate || newTime) {
    await pool.query(
      `UPDATE bookings SET preferred_date = $1, preferred_time = $2 WHERE id = $3`,
      [restoreDate, restoreTime, id],
    );
    req.log.info({ bookingId: id, restoreDate, restoreTime }, "Booking rescheduled before restore");
  }

  // ── Update other fields if admin edited them ────────────────────────────
  const hasFieldEdits = newName || newPhone || newEmail !== undefined || newAddress !== undefined || newAppliance !== undefined || newMessage !== undefined;
  if (hasFieldEdits) {
    await pool.query(
      `UPDATE bookings SET
        name      = COALESCE(NULLIF($1,''), name),
        phone     = COALESCE(NULLIF($2,''), phone),
        email     = COALESCE($3, email),
        address   = COALESCE($4, address),
        appliance = COALESCE(NULLIF($5,''), appliance),
        message   = COALESCE($6, message)
       WHERE id = $7`,
      [
        newName    ?? null,
        newPhone   ?? null,
        newEmail   ?? null,
        newAddress ?? null,
        newAppliance ?? null,
        newMessage   ?? null,
        id,
      ],
    );
    req.log.info({ bookingId: id }, "Booking fields updated on restore");
  }

  // ── Restore status to pending, clear old HubSpot deal ID so watchdog
  //    doesn't re-cancel it when checking the now-deleted original deal ─────
  const { rowCount } = await pool.query(
    `UPDATE bookings SET status = 'pending', hs_deal_id = NULL WHERE id = $1 AND status IN ('cancelled','completed')`,
    [id],
  );
  if (!rowCount) { res.status(404).json({ error: "booking not found or not restorable" }); return; }
  req.log.info({ bookingId: id, restoreDate, restoreTime }, "Booking restored to pending by admin");

  // Build the effective booking object (with potentially new date/time and field edits)
  const effectiveBooking = {
    ...booking,
    name:          (newName?.trim()     || booking.name),
    phone:         (newPhone?.trim()    || booking.phone),
    email:         (newEmail  !== undefined ? newEmail  : booking.email),
    address:       (newAddress !== undefined ? newAddress : booking.address),
    appliance:     (newAppliance?.trim() || booking.appliance),
    message:       (newMessage !== undefined ? newMessage : booking.message),
    preferredDate: restoreDate,
    preferredTime: restoreTime,
  };

  // ── Re-create HubSpot deal ─────────────────────────────────────────────────
  syncBookingToHubSpot({
    id:            effectiveBooking.id,
    name:          effectiveBooking.name,
    phone:         effectiveBooking.phone,
    email:         effectiveBooking.email,
    address:       effectiveBooking.address,
    appliance:     effectiveBooking.appliance,
    brandModel:    effectiveBooking.brandModel,
    preferredDate: effectiveBooking.preferredDate,
    preferredTime: effectiveBooking.preferredTime,
    message:       effectiveBooking.message,
    source:        "admin",
  }, req.log).then(r => {
    if (r.ok && r.dealId) {
      pool.query(`UPDATE bookings SET hs_deal_id=$1 WHERE id=$2`, [r.dealId, id]).catch(() => {});
      req.log.info({ dealId: r.dealId, bookingId: id }, "HubSpot deal re-created on restore");
    }
  }).catch(() => {});

  // ── Re-block WA half-day slots (reverse of cancel logic) ──────────────────
  try {
    const WA_MORNING   = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM"];
    const WA_AFTERNOON = ["1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
    const pt = restoreTime;
    const isWAMorning   = pt.includes("9 AM") || pt.includes("AM–12") || pt.includes("AM-12");
    const isWAAfternoon = pt.includes("1 PM") || pt.includes("PM–5") || pt.includes("PM-5");
    if (isWAMorning || isWAAfternoon) {
      const hours = isWAMorning ? WA_MORNING : WA_AFTERNOON;
      for (const h of hours) {
        await pool.query(
          `INSERT INTO blocked_slots (slot_date, slot_time, reason)
           VALUES ($1, $2, $3)
           ON CONFLICT (slot_date, slot_time) DO NOTHING`,
          [restoreDate, h, `WA booking restored: ${id.slice(0,8)}`],
        );
      }
      req.log.info({ bookingId: id, date: restoreDate }, "Re-blocked WA slots on restore");
    }
  } catch (e) {
    req.log.warn({ err: e }, "Could not re-block WA slots on restore (non-fatal)");
  }

  // ── Email notifications ────────────────────────────────────────────────────
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";
  const shortId   = id.slice(0, 8).toUpperCase();
  const rescheduled = !!(newDate || newTime);

  if (emailUser && emailPass && emailTo) {
    void (async () => {
      try {
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: emailUser, pass: emailPass } });
        const rowHtml = (label: string, value: string) => value
          ? `<tr style="border-bottom:1px solid #eee;">
               <td style="padding:10px 8px;color:#666;width:140px;">${label}</td>
               <td style="padding:10px 8px;font-weight:600;">${value}</td>
             </tr>` : "";

        // Email to admin
        const adminHtml = `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#f97316;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">♻️ Заявка восстановлена</h2>
    <p style="color:#ffe8d6;margin:6px 0 0;font-size:13px;">Hi-Tech Repair Group · ID: <strong style="color:#fff;">${shortId}</strong></p>
  </div>
  ${rescheduled ? `<div style="background:#fff7ed;border-left:4px solid #f97316;padding:12px 20px;font-size:13px;color:#9a3412;font-weight:600;">
    📅 Перенесено на: ${restoreDate} · ${restoreTime}
  </div>` : ""}
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rowHtml("Клиент",    effectiveBooking.name)}
      ${rowHtml("Телефон",   `<a href="tel:${effectiveBooking.phone}" style="color:#1B6FE8;">${effectiveBooking.phone}</a>`)}
      ${rowHtml("Email",     effectiveBooking.email)}
      ${rowHtml("Техника",   effectiveBooking.appliance)}
      ${rowHtml("Дата",      restoreDate)}
      ${rowHtml("Время",     restoreTime)}
    </table>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021<br>
    Восстановлено: ${new Date().toLocaleString("ru-RU", { timeZone: "America/Chicago" })} CT
  </div>
</div>`;
        await transporter.sendMail({
          from:    `"Hi-Tech Repair Group" <${emailUser}>`,
          to:      emailTo,
          subject: `♻️ Заявка восстановлена [${shortId}] — ${effectiveBooking.name}`,
          html:    adminHtml,
          text:    `Заявка восстановлена.\nID: ${shortId}\nКлиент: ${effectiveBooking.name}\nТелефон: ${effectiveBooking.phone}\nДата: ${restoreDate} · ${restoreTime}`,
        });
        req.log.info({ bookingId: id }, "Admin restore email sent to owner");

        // Email to client (if they have a real email)
        const clientEmail = effectiveBooking.email?.trim();
        if (clientEmail && clientEmail.includes("@")) {
          const isEs = effectiveBooking.language === "es";
          const API_BASE  = "https://htr-group-llc-appliance-repair.replit.app";
          const cancelUrl = `${API_BASE}/api/cancel?id=${id}&token=${effectiveBooking.approveToken}`;

          const clientHtml = `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#f97316;padding:20px 24px;">
    <h2 style="color:#fff;margin:0;font-size:18px;">
      ${isEs ? "♻️ Su cita ha sido reactivada" : "♻️ Your appointment has been restored"}
    </h2>
    <p style="color:#ffe8d6;margin:6px 0 0;font-size:13px;">HTRGroupTX · Hi-Tech Repair Group</p>
  </div>
  <div style="padding:24px;font-size:14px;color:#333;line-height:1.7;">
    <p>${isEs ? "Estimado/a" : "Dear"} <strong>${effectiveBooking.name}</strong>,</p>
    <p>
      ${isEs
        ? `Nos complace informarle que su cita${rescheduled ? " ha sido reprogramada y" : ""} ha sido restaurada por nuestro equipo.`
        : `We are pleased to inform you that your appointment${rescheduled ? " has been rescheduled and" : ""} has been restored by our team.`}
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
      <tr style="border-bottom:1px solid #eee;"><td style="padding:8px;color:#666;">${isEs ? "Fecha" : "Date"}</td><td style="padding:8px;font-weight:600;">${restoreDate}</td></tr>
      <tr style="border-bottom:1px solid #eee;"><td style="padding:8px;color:#666;">${isEs ? "Hora" : "Time"}</td><td style="padding:8px;font-weight:600;">${restoreTime}</td></tr>
      <tr style="border-bottom:1px solid #eee;"><td style="padding:8px;color:#666;">${isEs ? "Servicio" : "Service"}</td><td style="padding:8px;font-weight:600;">${effectiveBooking.appliance}</td></tr>
    </table>
    <p style="margin-top:20px;">${isEs ? "Preguntas:" : "Questions:"} <a href="tel:3468206021" style="color:#1B6FE8;font-weight:600;">(346) 820-6021</a></p>
    <div style="margin-top:16px;padding:12px 16px;background:#fef2f2;border-radius:8px;font-size:13px;color:#666;text-align:center;">
      ${isEs ? "¿Necesita cancelar?" : "Need to cancel?"} <a href="${cancelUrl}" style="color:#dc2626;font-weight:600;">${isEs ? "Cancelar mi cita" : "Cancel my appointment"}</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021
  </div>
</div>`;
          await transporter.sendMail({
            from:    `"Hi-Tech Repair Group" <${emailUser}>`,
            to:      clientEmail,
            subject: isEs ? "♻️ Su cita ha sido restaurada — HTRGroupTX" : "♻️ Your appointment has been restored — HTRGroupTX",
            html:    clientHtml,
            text:    isEs
              ? `Su cita ha sido restaurada. Fecha: ${restoreDate} · ${restoreTime}. Servicio: ${effectiveBooking.appliance}. Preguntas: (346) 820-6021`
              : `Your appointment has been restored. Date: ${restoreDate} · ${restoreTime}. Service: ${effectiveBooking.appliance}. Questions: (346) 820-6021`,
          });
          req.log.info({ bookingId: id, clientEmail }, "Restore email sent to client");
        }
      } catch (err) {
        req.log.warn({ err }, "Failed to send restore email (non-fatal)");
      }
    })();
  }

  // ── WhatsApp: notify owner ─────────────────────────────────────────────────
  sendOwnerWA(
    `♻️ ЗАЯВКА ВОССТАНОВЛЕНА\n` +
    `👤 ${effectiveBooking.name}\n` +
    `📞 ${effectiveBooking.phone}\n` +
    `🔧 ${effectiveBooking.appliance || "—"}\n` +
    `📅 ${restoreDate} · ${restoreTime}\n` +
    `🆔 ID: ${shortId}\n` +
    (rescheduled ? `🔄 Перенесено админом\n` : "") +
    `📌 Статус: ожидает подтверждения`,
    req.log,
  );

  // ── WhatsApp: notify client ────────────────────────────────────────────────
  sendClientRestoreWA(effectiveBooking, req.log);

  res.json({ ok: true });
});

// ─── POST /api/admin/reschedule-booking ──────────────────────────────────────
// Move an active (pending/approved) booking to a new date/time.
bookingRouter.post("/admin/reschedule-booking", requireAdminPin, async (req, res) => {
  const { id, newDate, newTime } = req.body as { id?: string; newDate?: string; newTime?: string };
  if (!id)      { res.status(400).json({ error: "id required" });      return; }
  if (!newDate) { res.status(400).json({ error: "newDate required" }); return; }
  if (!newTime) { res.status(400).json({ error: "newTime required" }); return; }

  const booking = await findBooking(id);
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  if (booking.status !== "pending" && booking.status !== "approved") {
    res.status(400).json({ error: `Cannot reschedule booking with status: ${booking.status}` });
    return;
  }

  const rsDate = newDate.trim();
  const rsTime = newTime.trim();

  // ── Conflict check ────────────────────────────────────────────────────────
  const [conflictBook, conflictBlock] = await Promise.all([
    pool.query<{ name: string }>(
      `SELECT name FROM bookings
       WHERE id <> $1
         AND preferred_date = $2
         AND preferred_time = $3
         AND status IN ('pending','approved')`,
      [id, rsDate, rsTime],
    ),
    pool.query<{ slot_time: string }>(
      `SELECT slot_time FROM blocked_slots
       WHERE slot_date = $1 AND slot_time = $2`,
      [rsDate, rsTime],
    ),
  ]);
  if ((conflictBook.rowCount ?? 0) > 0 || (conflictBlock.rowCount ?? 0) > 0) {
    const conflictName = conflictBook.rows[0]?.name ?? "Заблокировано";
    res.json({ conflict: true, conflictWith: { name: conflictName, date: rsDate, time: rsTime } });
    return;
  }

  // ── Update DB ─────────────────────────────────────────────────────────────
  const oldDate = booking.preferredDate;
  const oldTime = booking.preferredTime;
  await pool.query(
    `UPDATE bookings SET preferred_date = $1, preferred_time = $2 WHERE id = $3`,
    [rsDate, rsTime, id],
  );
  req.log.info({ bookingId: id, from: `${oldDate} ${oldTime}`, to: `${rsDate} ${rsTime}` }, "Booking rescheduled by admin");

  const updatedBooking = { ...booking, preferredDate: rsDate, preferredTime: rsTime };

  // ── HubSpot: update deal date/name async ──────────────────────────────────
  if (booking.hsDealId) {
    updateDealDateInHubSpot(booking.hsDealId, {
      id:            updatedBooking.id,
      name:          updatedBooking.name,
      phone:         updatedBooking.phone,
      email:         updatedBooking.email,
      address:       updatedBooking.address,
      appliance:     updatedBooking.appliance,
      brandModel:    updatedBooking.brandModel,
      preferredDate: rsDate,
      preferredTime: rsTime,
      message:       updatedBooking.message,
      source:        "admin",
    }, req.log).catch(() => {});
  }

  // ── Email notifications ───────────────────────────────────────────────────
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";
  const shortId   = id.slice(0, 8).toUpperCase();

  if (emailUser && emailPass && emailTo) {
    void (async () => {
      try {
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: emailUser, pass: emailPass } });
        const rowHtml = (label: string, value: string) => value
          ? `<tr style="border-bottom:1px solid #eee;"><td style="padding:10px 8px;color:#666;width:140px;">${label}</td><td style="padding:10px 8px;font-weight:600;">${value}</td></tr>` : "";

        // Admin email
        await transporter.sendMail({
          from: `"Hi-Tech Repair Group" <${emailUser}>`,
          to:   emailTo,
          subject: `📅 Перенос заявки [${shortId}] — ${updatedBooking.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:22px 24px;"><h2 style="color:#fff;margin:0;font-size:20px;">📅 Перенос заявки</h2>
  <p style="color:#dbeafe;margin:6px 0 0;font-size:13px;">Hi-Tech Repair Group · ID: <strong style="color:#fff;">${shortId}</strong></p></div>
  <div style="background:#eff6ff;border-left:4px solid #1B6FE8;padding:12px 20px;font-size:13px;color:#1e40af;font-weight:600;">
    📅 Было: ${oldDate} · ${oldTime}<br>📅 Стало: ${rsDate} · ${rsTime}
  </div>
  <div style="padding:24px;"><table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${rowHtml("Клиент",  updatedBooking.name)}
    ${rowHtml("Телефон", `<a href="tel:${updatedBooking.phone}" style="color:#1B6FE8;">${updatedBooking.phone}</a>`)}
    ${rowHtml("Email",   updatedBooking.email ?? "")}
    ${rowHtml("Техника", updatedBooking.appliance ?? "")}
    ${rowHtml("Новая дата",  rsDate)}
    ${rowHtml("Новое время", rsTime)}
  </table></div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021<br>
    Перенесено: ${new Date().toLocaleString("ru-RU", { timeZone: "America/Chicago" })} CT
  </div></div>`,
          text: `Заявка перенесена.\nID: ${shortId}\nКлиент: ${updatedBooking.name}\nБыло: ${oldDate} · ${oldTime}\nСтало: ${rsDate} · ${rsTime}`,
        });
        req.log.info({ bookingId: id }, "Admin reschedule email sent to owner");

        // Client email
        const clientEmail = updatedBooking.email?.trim();
        if (clientEmail && clientEmail.includes("@")) {
          const isEs = updatedBooking.language === "es";
          await transporter.sendMail({
            from: `"HTRGroupTX" <${emailUser}>`,
            to:   clientEmail,
            subject: isEs
              ? `📅 Su cita ha sido reprogramada — HTRGroupTX`
              : `📅 Your appointment has been rescheduled — HTRGroupTX`,
            html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">${isEs ? "📅 Cita Reprogramada" : "📅 Appointment Rescheduled"}</h2>
    <p style="color:#dbeafe;margin:4px 0 0;font-size:13px;">HTRGroupTX · Houston Metropolitan Area</p>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#1e293b;">${isEs ? `Estimado/a <strong>${updatedBooking.name}</strong>,` : `Dear <strong>${updatedBooking.name}</strong>,`}</p>
    <p style="font-size:14px;color:#475569;">${isEs
      ? "Le informamos que su cita ha sido reprogramada para una nueva fecha y hora."
      : "We are writing to let you know that your appointment has been moved to a new date and time."
    }</p>
    <div style="background:#eff6ff;border-left:4px solid #1B6FE8;border-radius:6px;padding:16px 20px;margin:20px 0;">
      <p style="margin:4px 0;font-size:13px;color:#94a3b8;text-decoration:line-through;">${isEs ? "Fecha anterior" : "Previous"}: ${oldDate} · ${oldTime}</p>
      <p style="margin:8px 0 4px;font-size:16px;color:#1B6FE8;font-weight:700;">📅 ${rsDate} · ${rsTime}</p>
    </div>
    <p style="font-size:13px;color:#64748b;">${isEs
      ? "Si tiene preguntas, comuníquese con nosotros al (346) 820-6021."
      : "If you have any questions, please contact us at (346) 820-6021."
    }</p>
    <p style="font-size:14px;color:#1e293b;">${isEs ? "¡Gracias por confiar en HTRGroupTX!" : "Thank you for choosing HTRGroupTX!"}</p>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    HTRGroupTX · Houston Metropolitan Area · (346) 820-6021
  </div></div>`,
            text: isEs
              ? `Estimado/a ${updatedBooking.name},\n\nSu cita ha sido reprogramada.\nNueva fecha: ${rsDate} · ${rsTime}\n\nHTRGroupTX`
              : `Dear ${updatedBooking.name},\n\nYour appointment has been rescheduled.\nNew date: ${rsDate} · ${rsTime}\n\nHTRGroupTX`,
          });
          req.log.info({ bookingId: id }, "Client reschedule email sent");
        }
      } catch (e) {
        req.log.warn({ err: e }, "Reschedule email failed (non-fatal)");
      }
    })();
  }

  // ── WhatsApp to owner ─────────────────────────────────────────────────────
  sendOwnerWA(
    `📅 *Перенос заявки*\n` +
    `👤 ${updatedBooking.name}\n` +
    `📱 ${updatedBooking.phone}\n` +
    `🔧 ${updatedBooking.appliance ?? "—"}\n` +
    `⬅️ Было: ${oldDate} · ${oldTime}\n` +
    `✅ Стало: ${rsDate} · ${rsTime}\n` +
    `🆔 ID: ${shortId}`,
    req.log,
  );

  res.json({ ok: true });
});

// ─── GET /api/cancel ──────────────────────────────────────────────────────────
// Client self-cancellation via email link: /api/cancel?id=...&token=...
bookingRouter.get("/cancel", async (req, res) => {
  const { id, token } = req.query as { id?: string; token?: string };

  if (!id || !token) {
    res.status(400).send(statusPage("error", "Invalid Link",
      "<p>This cancellation link is missing required parameters.</p>"));
    return;
  }

  const booking = await findBooking(id);

  if (!booking) {
    res.status(404).send(statusPage("error", "Booking Not Found",
      "<p>No booking found with this ID. It may have been deleted or the link is incorrect.</p>"));
    return;
  }

  if (booking.approveToken !== token) {
    res.status(403).send(statusPage("error", "Invalid Token",
      "<p>This cancellation link is not valid.</p>"));
    return;
  }

  if (booking.status === "cancelled") {
    res.send(statusPage("already", "Already Cancelled",
      `<p>Booking for <strong>${booking.name}</strong> has already been cancelled.</p>`));
    return;
  }

  // ── Cancel in DB ──────────────────────────────────────────────────────────
  const { rowCount } = await pool.query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status IN ('pending','approved')`,
    [id],
  );
  if (!rowCount) {
    res.send(statusPage("already", "Already Cancelled",
      `<p>This booking has already been cancelled.</p>`));
    return;
  }
  req.log.info({ bookingId: id }, "Booking cancelled by client (self-cancel)");

  // ── HubSpot: mark deal closed lost ───────────────────────────────────────
  if (booking.hsDealId) {
    cancelDealInHubSpot(booking.hsDealId, req.log).catch(() => {});
  }

  // ── Free any WA-blocked slots ─────────────────────────────────────────────
  try {
    const WA_MORNING   = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM"];
    const WA_AFTERNOON = ["1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
    const pt = booking.preferredTime ?? "";
    const isWAMorning   = pt.includes("9 AM") || pt.includes("AM–12") || pt.includes("AM-12");
    const isWAAfternoon = pt.includes("1 PM") || pt.includes("PM–5") || pt.includes("PM-5");
    if (isWAMorning || isWAAfternoon) {
      const hours = isWAMorning ? WA_MORNING : WA_AFTERNOON;
      for (const h of hours) {
        await pool.query(`DELETE FROM blocked_slots WHERE slot_date = $1 AND slot_time = $2`,
          [booking.preferredDate, h]);
      }
    }
  } catch {}

  // ── WhatsApp to owner — client cancelled ─────────────────────────────────
  sendOwnerWA(
    `⚠️ КЛИЕНТ САМ ОТМЕНИЛ\n` +
    `👤 ${booking.name}\n` +
    `📞 ${booking.phone}\n` +
    `🔧 ${booking.appliance || "—"}\n` +
    `📅 ${booking.preferredDate} · ${booking.preferredTime}\n` +
    `🆔 ID: ${booking.id.slice(0, 8).toUpperCase()}\n` +
    `📌 Клиент перешёл по ссылке отмены — слот освобождён`,
    req.log,
  );

  // ── Email to owner — client cancelled ────────────────────────────────────
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";
  const emailTo   = process.env["EMAIL_TO"]   ?? "";
  if (emailUser && emailPass && emailTo) {
    void (async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        });
        const shortId = booking.id.slice(0, 8).toUpperCase();
        await transporter.sendMail({
          from:    `"Hi-Tech Repair Group" <${emailUser}>`,
          to:      emailTo,
          subject: `⚠️ Клиент отменил сам [${shortId}] — ${booking.name}`,
          html: `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#b45309;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">⚠️ Клиент самостоятельно отменил запись</h2>
    <p style="color:#fde68a;margin:6px 0 0;font-size:13px;">HTRGroupTX · ID: <strong style="color:#fff;">${shortId}</strong></p>
  </div>
  <div style="background:#fffbeb;border-left:4px solid #b45309;padding:12px 20px;font-size:13px;color:#92400e;font-weight:600;">
    ℹ️ Клиент нажал ссылку «Отменить запись» в письме подтверждения — слот освобождён
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 8px;color:#666;width:140px;">Клиент</td><td style="padding:10px 8px;font-weight:600;">${booking.name}</td></tr>
      <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 8px;color:#666;">Телефон</td><td style="padding:10px 8px;font-weight:600;"><a href="tel:${booking.phone}" style="color:#1B6FE8;">${booking.phone}</a></td></tr>
      <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 8px;color:#666;">Техника</td><td style="padding:10px 8px;font-weight:600;">${booking.appliance || "—"}</td></tr>
      <tr style="border-bottom:1px solid #eee;"><td style="padding:10px 8px;color:#666;">Дата</td><td style="padding:10px 8px;font-weight:600;">${booking.preferredDate}</td></tr>
      <tr><td style="padding:10px 8px;color:#666;">Время</td><td style="padding:10px 8px;font-weight:600;">${booking.preferredTime}</td></tr>
    </table>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021
  </div>
</div>`,
          text: `⚠️ Клиент ${booking.name} (${booking.phone}) самостоятельно отменил запись.\nДата: ${booking.preferredDate} · ${booking.preferredTime}\nID: ${shortId}`,
        });
      } catch (err) {
        req.log.warn({ err }, "Failed to send client-cancel owner email (non-fatal)");
      }
    })();
  }

  const isEs = booking.language === "es";
  res.send(statusPage("success",
    isEs ? "Cita Cancelada" : "Appointment Cancelled",
    isEs
      ? `<p>Su cita del <strong>${booking.preferredDate}</strong> a las <strong>${booking.preferredTime}</strong> ha sido cancelada exitosamente.</p>
         <p>Si desea reagendar, llámenos al <a href="tel:3468206021" style="color:#1B6FE8;">(346) 820-6021</a>.</p>`
      : `<p>Your appointment on <strong>${booking.preferredDate}</strong> at <strong>${booking.preferredTime}</strong> has been successfully cancelled.</p>
         <p>To reschedule, please call us at <a href="tel:3468206021" style="color:#1B6FE8;">(346) 820-6021</a>.</p>`,
  ));
});

// ─── GET /api/approve ─────────────────────────────────────────────────────────
// Shows a confirmation PAGE — does NOT approve. Prevents email-scanner auto-clicks.
bookingRouter.get("/approve", async (req, res) => {
  const { id, token } = req.query as { id?: string; token?: string };
  req.log.info({ bookingId: id }, "Approve link opened (confirmation page shown)");

  if (!id || !token) {
    res.status(400).send(statusPage("error", "Invalid Link",
      "<p>This approval link is missing required parameters.</p>"));
    return;
  }

  const booking = await findBooking(id);

  if (!booking) {
    res.status(404).send(statusPage("error", "Booking Not Found",
      "<p>No booking found with this ID. It may have been deleted or the link is incorrect.</p>"));
    return;
  }

  if (booking.approveToken !== token) {
    res.status(403).send(statusPage("error", "Invalid Token",
      "<p>This approval link is not valid.</p>"));
    return;
  }

  if (booking.status === "approved") {
    const alreadyRows = [
      ["Name", booking.name], ["Phone", booking.phone],
      ["Appliance", booking.appliance],
      ["Scheduled Date", booking.preferredDate],
      ["Scheduled Time", booking.preferredTime],
    ].filter(([, v]) => v)
     .map(([l, v]) => `<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:8px;color:#666;width:140px;">${l}</td><td style="padding:8px;font-weight:600;">${v}</td></tr>`)
     .join("");
    const adminLink = `<div style="margin-top:20px;text-align:center;"><a href="https://htrgrouptx.com/admin" style="display:inline-block;background:#1B6FE8;color:#fff;font-weight:600;font-size:14px;padding:11px 28px;border-radius:8px;text-decoration:none;">Open Admin Panel →</a></div>`;
    res.send(statusPage("success", "Already Confirmed ✓",
      `<p style="color:#15803d;font-weight:600;margin-bottom:16px;">This booking was already approved — no action needed.</p>
       <table style="width:100%;border-collapse:collapse;font-size:14px;">${alreadyRows}</table>${adminLink}`));
    return;
  }

  // Show confirmation page — human must click the button (or wait 5s auto-confirm)
  const previewRows = [
    ["Client", booking.name], ["Phone", booking.phone],
    ["Appliance", booking.appliance],
    ["Date", booking.preferredDate], ["Time", booking.preferredTime],
  ].filter(([, v]) => v)
   .map(([l, v]) => `<tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:10px 8px;color:#666;width:130px;">${l}</td>
      <td style="padding:10px 8px;font-weight:600;">${v}</td></tr>`)
   .join("");

  const API_BASE = (process.env["PUBLIC_BASE_URL"] ?? "https://htr-group-llc-appliance-repair.replit.app").replace(/\/$/, "");
  res.send(`<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Confirm Appointment — HTRGroupTX</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#f0f4f8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:540px;width:100%;overflow:hidden}
    .hdr{background:#1B6FE8;padding:28px 32px;text-align:center;color:#fff}
    .hdr .ico{font-size:48px;margin-bottom:12px}
    .hdr h1{font-size:22px;font-weight:700}
    .hdr p{font-size:13px;color:#b3d4ff;margin-top:6px}
    .body{padding:28px 32px}
    .alert{background:#dbeafe;border:1px solid #93c5fd;border-radius:8px;padding:14px 16px;margin-bottom:20px;font-size:14px;color:#1e40af;line-height:1.55}
    .alert strong{display:block;font-size:15px;margin-bottom:4px}
    table{width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px}
    .prop-box{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;background:#f8f9ff}
    .prop-header{padding:10px 14px;background:#0B1A3F;color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px}
    .prop-addr{padding:10px 14px 8px;font-size:14px;font-weight:600;color:#0B1A3F}
    .prop-map{width:100%;height:220px;border:none;display:block}
    .prop-links{display:flex;gap:8px;padding:10px 14px;flex-wrap:wrap}
    .plink{flex:1;min-width:100px;padding:9px 10px;border-radius:7px;text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;color:#fff}
    .plink-sv{background:#34a853}
    .plink-gm{background:#4285F4}
    .plink-zl{background:#006AFF}
    .plink-rf{background:#d73b2f}
    .btn{display:block;width:100%;background:#16a34a;color:#fff;font-size:17px;font-weight:700;padding:16px;border:none;border-radius:8px;cursor:pointer;text-align:center;letter-spacing:.3px}
    .btn:hover{background:#15803d}
    .btn:disabled{background:#9ca3af;cursor:not-allowed}
    .note{margin-top:14px;font-size:12px;color:#9ca3af;text-align:center}
    .footer{background:#f8fafc;padding:14px 32px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center}
  </style>
</head>
<body>
  <div class="card">
    <div class="hdr">
      <div class="ico">📋</div>
      <h1>Confirm Appointment</h1>
      <p>Hi-Tech Repair Group · Houston, TX</p>
    </div>
    <div class="body">
      <div class="alert">
        <strong>📋 Review the booking below</strong>
        Check the details and click the green button when ready to confirm.
      </div>
      <table>${previewRows}</table>

      ${booking.address ? (() => {
        const addr    = booking.address;
        const enc     = encodeURIComponent(addr);
        const mapEmbed = `https://maps.google.com/maps?q=${enc}&output=embed&t=k&zoom=19`;
        const gmLink  = `https://maps.google.com/?q=${enc}`;
        const svLink  = `https://maps.google.com/maps?q=${enc}&layer=c`;
        const zilSlug = addr.trim().replace(/,/g,"").replace(/\s+/g,"-").replace(/-{2,}/g,"-");
        const zilLink = `https://www.zillow.com/homes/${zilSlug}/`;
        const rfLink  = `https://www.redfin.com/search#location=${enc}`;
        return `
      <div class="prop-box">
        <div class="prop-header">🏠 Client Property</div>
        <div class="prop-addr">📍 ${addr}</div>
        <iframe class="prop-map"
          src="${mapEmbed}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen></iframe>
        <div class="prop-links">
          <a href="${svLink}"  target="_blank" class="plink plink-sv">🚶 Street View</a>
          <a href="${gmLink}"  target="_blank" class="plink plink-gm">🗺 Maps</a>
          <a href="${zilLink}" target="_blank" class="plink plink-zl">🏠 Zillow $</a>
          <a href="${rfLink}"  target="_blank" class="plink plink-rf">🔴 Redfin $</a>
        </div>
      </div>`;
      })() : ""}

      <form method="POST" action="${API_BASE}/api/approve" id="approveForm"
            onsubmit="document.getElementById('approveBtn').disabled=true;document.getElementById('approveBtn').textContent='Confirming…'">
        <input type="hidden" name="id"    value="${id}">
        <input type="hidden" name="token" value="${token}">
        <button type="submit" id="approveBtn" class="btn">✅ Confirm Appointment</button>
      </form>
      <p class="note">This action notifies the client and syncs to your CRM.</p>
    </div>
    <div class="footer">Hi-Tech Repair Group · (346) 820-6021</div>
  </div>
</body>
</html>`);
});

// ─── POST /api/approve ────────────────────────────────────────────────────────
// Actual approval — only triggered by a human clicking the button on the GET page.
bookingRouter.post("/approve", async (req, res) => {
  const { id, token } = req.body as { id?: string; token?: string };
  req.log.info({ bookingId: id }, "Approve confirmed by human click");

  if (!id || !token) {
    res.status(400).send(statusPage("error", "Invalid Request", "<p>Missing parameters.</p>"));
    return;
  }

  const booking = await findBooking(id);

  if (!booking) {
    res.status(404).send(statusPage("error", "Booking Not Found",
      "<p>No booking found with this ID.</p>"));
    return;
  }

  if (booking.approveToken !== token) {
    res.status(403).send(statusPage("error", "Invalid Token",
      "<p>This approval link is not valid.</p>"));
    return;
  }

  if (booking.status === "approved") {
    const adminLink = `<div style="margin-top:20px;text-align:center;"><a href="https://htrgrouptx.com/admin" style="display:inline-block;background:#1B6FE8;color:#fff;font-weight:600;font-size:14px;padding:11px 28px;border-radius:8px;text-decoration:none;">Open Admin Panel →</a></div>`;
    res.send(statusPage("success", "Already Confirmed ✓",
      `<p style="color:#15803d;font-weight:600;margin-bottom:16px;">This booking was already approved — no action needed.</p>${adminLink}`));
    return;
  }

  await approveBooking(id);
  req.log.info({ bookingId: id }, "Booking approved in database");

  // ── WhatsApp confirmation to client ────────────────────────────────────────
  sendClientConfirmWA(booking, req.log);

  // ── HubSpot sync — update stage if deal exists, create only if no prior deal ─
  let hubspotOk = false;
  try {
    if (booking.hsDealId) {
      // Deal already created at booking time — just update stage to closedwon
      const r = await updateDealStageInHubSpot(booking.hsDealId, "closedwon", req.log);
      hubspotOk = r.ok;
      if (r.ok) req.log.info({ hsDealId: booking.hsDealId, bookingId: id }, "HubSpot deal stage updated to closedwon on email approval");
      else      req.log.warn({ error: r.error, bookingId: id }, "HubSpot stage update failed on email approval (non-fatal)");
    } else {
      // No deal yet — create one now
      const emailHsSource = booking.message === "Via WhatsApp Bot" ? "whatsapp" : "website";
      const hsResult = await syncBookingToHubSpot({
        id:            booking.id,
        name:          booking.name,
        phone:         booking.phone,
        email:         booking.email,
        address:       booking.address,
        appliance:     booking.appliance,
        brandModel:    booking.brandModel,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        message:       booking.message,
        source:        emailHsSource,
      }, req.log);
      hubspotOk = hsResult.ok;
      if (hsResult.ok && hsResult.dealId) {
        pool.query(`UPDATE bookings SET hs_deal_id=$1 WHERE id=$2`, [hsResult.dealId, id]).catch(() => {});
        req.log.info({ dealId: hsResult.dealId, bookingId: id }, "HubSpot deal created on email approval (no prior deal)");
      }
    }
  } catch (err) {
    req.log.error({ err, bookingId: id }, "HubSpot sync error on email approval");
  }

  // ── Send confirmation email to client ──────────────────────────────────────
  const isEs = booking.language === "es";
  const emailUser = process.env["EMAIL_USER"] ?? "";
  const emailPass = process.env["EMAIL_PASS"] ?? "";

  const clientRowHtml = (label: string, value: string) =>
    value
      ? `<tr style="border-bottom:1px solid #eee;">
           <td style="padding:10px 8px;color:#666;width:160px;white-space:nowrap;">${label}</td>
           <td style="padding:10px 8px;font-weight:600;">${value}</td>
         </tr>`
      : "";

  const API_BASE  = "https://htr-group-llc-appliance-repair.replit.app";
  const cancelUrl = `${API_BASE}/api/cancel?id=${booking.id}&token=${booking.approveToken}`;

  const clientHtml = isEs ? `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">✅ ¡Su cita ha sido confirmada!</h2>
    <p style="color:#b3d4ff;margin:6px 0 0;font-size:13px;">Hi-Tech Repair Group · Área Metropolitana de Houston</p>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#1a1a1a;line-height:1.6;">Estimado/a <strong>${booking.name}</strong>,<br><br>Nos complace confirmar su cita de reparación de electrodomésticos en el hogar.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:18px;">
      ${clientRowHtml("Nombre",           booking.name)}
      ${clientRowHtml("Teléfono",         booking.phone)}
      ${clientRowHtml("Dirección",        booking.address)}
      ${clientRowHtml("Electrodoméstico", booking.appliance)}
      ${clientRowHtml("Marca / Modelo",   booking.brandModel)}
      ${clientRowHtml("Fecha programada", booking.preferredDate)}
      ${clientRowHtml("Hora programada",  booking.preferredTime)}
    </table>
    <div style="margin-top:24px;padding:16px 20px;background:#fff7ed;border-left:4px solid #f97316;border-radius:6px;font-size:14px;line-height:1.7;color:#7c2d12;">
      <strong>🐾 Aviso importante — Seguridad de mascotas y técnico:</strong><br>
      Por razones de seguridad, tanto para nuestro técnico como para sus mascotas, le pedimos que <strong>aísle en una habitación separada</strong> a todos los animales grandes, reptiles, animales exóticos y gatos antes de la llegada del técnico.
    </div>
    <p style="margin-top:24px;font-size:14px;color:#444;">Preguntas: <a href="tel:3468206021" style="color:#1B6FE8;font-weight:600;">(346) 820-6021</a></p>
    <div style="margin-top:20px;padding:14px 18px;background:#fef2f2;border-radius:8px;font-size:13px;color:#666;text-align:center;">
      ¿Necesita cancelar? <a href="${cancelUrl}" style="color:#dc2626;font-weight:600;">Cancelar mi cita</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">Hi-Tech Repair Group · Houston · (346) 820-6021</div>
</div>` : `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#1B6FE8;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">✅ Your Appointment is Confirmed!</h2>
    <p style="color:#b3d4ff;margin:6px 0 0;font-size:13px;">Hi-Tech Repair Group · Houston Metropolitan Area</p>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#1a1a1a;line-height:1.6;">Dear <strong>${booking.name}</strong>,<br><br>We are pleased to confirm your home appliance repair appointment.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:18px;">
      ${clientRowHtml("Name",           booking.name)}
      ${clientRowHtml("Phone",          booking.phone)}
      ${clientRowHtml("Address",        booking.address)}
      ${clientRowHtml("Appliance",      booking.appliance)}
      ${clientRowHtml("Brand / Model",  booking.brandModel)}
      ${clientRowHtml("Scheduled Date", booking.preferredDate)}
      ${clientRowHtml("Scheduled Time", booking.preferredTime)}
    </table>
    <div style="margin-top:24px;padding:16px 20px;background:#fff7ed;border-left:4px solid #f97316;border-radius:6px;font-size:14px;line-height:1.7;color:#7c2d12;">
      <strong>🐾 Important — Pet & Technician Safety Notice:</strong><br>
      For the safety of both our technician and your pets, please <strong>isolate in a separate room</strong> all large animals, reptiles, exotic animals, and cats before our technician arrives.
    </div>
    <p style="margin-top:24px;font-size:14px;color:#444;">Questions: <a href="tel:3468206021" style="color:#1B6FE8;font-weight:600;">(346) 820-6021</a></p>
    <div style="margin-top:20px;padding:14px 18px;background:#fef2f2;border-radius:8px;font-size:13px;color:#666;text-align:center;">
      Need to cancel? <a href="${cancelUrl}" style="color:#dc2626;font-weight:600;">Cancel my appointment</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">Hi-Tech Repair Group · Houston Metropolitan Area · (346) 820-6021</div>
</div>`;

  let clientEmailOk = false;
  if (emailUser && emailPass && booking.email) {
    try {
      const t = nodemailer.createTransport({ service: "gmail", auth: { user: emailUser, pass: emailPass } });
      await t.sendMail({
        from:    `"Hi-Tech Repair Group" <${emailUser}>`,
        to:      booking.email,
        subject: isEs ? "✅ Cita confirmada — Hi-Tech Repair Group" : "✅ Appointment Confirmed — Hi-Tech Repair Group",
        html:    clientHtml,
      });
      clientEmailOk = true;
      req.log.info({ bookingId: id, clientEmail: booking.email }, "Confirmation email sent to client");
    } catch (err) {
      req.log.error({ err }, "Failed to send confirmation email to client");
    }
  }

  // ── Send WA + email to owner ──────────────────────────────────────────────
  const emailTo = process.env["EMAIL_TO"] ?? "";
  const shortId = booking.id.slice(0, 8).toUpperCase();

  // WA to owner
  sendOwnerNotification(
    `✅ БРОНИРОВАНИЕ ПОДТВЕРЖДЕНО\n` +
    `ID: ${shortId}\n` +
    `Клиент: ${booking.name}\n` +
    `Телефон: ${booking.phone}\n` +
    `Техника: ${booking.appliance}${booking.brandModel ? ` (${booking.brandModel})` : ""}\n` +
    `Дата: ${booking.preferredDate} · ${booking.preferredTime}\n` +
    `\n${ownerAddrBlock(booking.address)}`,
    req.log,
  );

  // Email to owner
  if (emailUser && emailPass && emailTo) {
    const ownerRowHtml = (label: string, value: string) =>
      value
        ? `<tr style="border-bottom:1px solid #eee;">
             <td style="padding:10px 8px;color:#666;width:140px;white-space:nowrap;">${label}</td>
             <td style="padding:10px 8px;font-weight:600;">${value}</td>
           </tr>`
        : "";
    const ownerHtml = `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
  <div style="background:#16a34a;padding:22px 24px;">
    <h2 style="color:#fff;margin:0;font-size:20px;">✅ Бронирование подтверждено</h2>
    <p style="color:#bbf7d0;margin:6px 0 0;font-size:13px;">
      Hi-Tech Repair Group &nbsp;·&nbsp; ID: <strong style="color:#fff;">${shortId}</strong>
    </p>
  </div>
  <div style="padding:24px;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${ownerRowHtml("Клиент",    booking.name)}
      ${ownerRowHtml("Телефон",   `<a href="tel:${booking.phone}" style="color:#1B6FE8;">${booking.phone}</a>`)}
      ${ownerRowHtml("Email",     booking.email ? `<a href="mailto:${booking.email}" style="color:#1B6FE8;">${booking.email}</a>` : "")}
      ${ownerRowHtml("Адрес",     booking.address)}
      ${ownerRowHtml("Техника",   booking.appliance)}
      ${ownerRowHtml("Марка",     booking.brandModel)}
      ${ownerRowHtml("Дата",      booking.preferredDate)}
      ${ownerRowHtml("Время",     booking.preferredTime)}
    </table>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;border-top:1px solid #eee;font-size:12px;color:#999;">
    Hi-Tech Repair Group · Houston · (346) 820-6021 &nbsp;·&nbsp;
    Подтверждено: ${new Date().toLocaleString("ru-RU", { timeZone: "America/Chicago" })} CT
  </div>
</div>`;
    try {
      const t2 = nodemailer.createTransport({ service: "gmail", auth: { user: emailUser, pass: emailPass } });
      await t2.sendMail({
        from:    `"Hi-Tech Repair Group" <${emailUser}>`,
        to:      emailTo,
        subject: `✅ Бронирование подтверждено [${shortId}] — ${booking.name}`,
        html:    ownerHtml,
        text:    `Бронирование подтверждено.\nID: ${shortId}\nКлиент: ${booking.name}\nТелефон: ${booking.phone}\nДата: ${booking.preferredDate} · ${booking.preferredTime}`,
      });
      req.log.info({ bookingId: id }, "Approval confirmation email sent to owner");
    } catch (err) {
      req.log.error({ err }, "Failed to send approval confirmation email to owner (non-fatal)");
    }
  }

  const detailRows = [
    ["Name", booking.name], ["Phone", booking.phone], ["Email", booking.email],
    ["Home Address", booking.address], ["Appliance", booking.appliance],
    ["Brand / Model", booking.brandModel], ["Preferred Date", booking.preferredDate],
    ["Preferred Time", booking.preferredTime],
  ].filter(([, v]) => v)
   .map(([l, v]) => `<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 8px;color:#666;width:140px;">${l}</td><td style="padding:10px 8px;font-weight:600;">${v}</td></tr>`)
   .join("");

  const hubNote = hubspotOk
    ? `<div style="margin-top:16px;padding:10px 14px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:4px;font-size:13px;color:#15803d;">✅ Contact synced to HubSpot successfully.</div>`
    : `<div style="margin-top:16px;padding:10px 14px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px;font-size:13px;color:#b91c1c;">⚠️ Approved, but HubSpot sync failed.</div>`;

  const clientNote = clientEmailOk
    ? `<div style="margin-top:12px;padding:10px 14px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:4px;font-size:13px;color:#15803d;">📧 Confirmation email sent to: ${booking.email}</div>`
    : `<div style="margin-top:12px;padding:10px 14px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px;font-size:13px;color:#b91c1c;">⚠️ Could not send confirmation to client.</div>`;

  const adminPanelBtn = `<div style="margin-top:24px;text-align:center;"><a href="https://htrgrouptx.com/admin" style="display:inline-block;background:#1B6FE8;color:#fff;font-weight:600;font-size:14px;padding:11px 28px;border-radius:8px;text-decoration:none;">Open Admin Panel →</a></div>`;

  res.send(statusPage("success", "Booking Approved ✅",
    `<table style="width:100%;border-collapse:collapse;font-size:14px;">${detailRows}</table>${hubNote}${clientNote}${adminPanelBtn}`,
  ));
});

// ─── POST /api/hubspot/webhook ────────────────────────────────────────────────
// Called by HubSpot when a deal property changes (e.g. dealstage → closedlost)
// Setup: HubSpot → Settings → Integrations → Private Apps → Webhooks
//        Subscribe to: deal.propertyChange (property: dealstage)
//        Target URL: https://htr-group-llc-appliance-repair.replit.app/api/hubspot/webhook
bookingRouter.post("/hubspot/webhook", async (req, res) => {
  // ── Optional signature verification ────────────────────────────────────────
  const secret = process.env["HUBSPOT_WEBHOOK_SECRET"];
  if (secret) {
    const sig = req.headers["x-hubspot-signature"] as string | undefined;
    if (sig) {
      const crypto2 = await import("crypto");
      const body = JSON.stringify(req.body);
      const expected = crypto2.createHmac("sha256", secret).update(body).digest("hex");
      if (sig !== expected) {
        res.status(401).json({ error: "Invalid signature" });
        return;
      }
    }
  }

  // ── Parse event array ───────────────────────────────────────────────────────
  const events = Array.isArray(req.body) ? req.body : [req.body];

  interface HsWebhookEvent {
    subscriptionType?: string;
    objectId?: number | string;
    propertyName?: string;
    propertyValue?: string;
  }

  // Match both: dealstage→closedlost (property change) AND deal.deletion
  const cancelEvents = (events as HsWebhookEvent[]).filter(
    e =>
      (e.propertyName === "dealstage" && e.propertyValue === "closedlost") ||
      e.subscriptionType === "deal.deletion",
  );

  if (!cancelEvents.length) {
    res.json({ ok: true, processed: 0 });
    return;
  }

  req.log.info({ count: cancelEvents.length }, "HubSpot webhook: cancel/delete events received");

  // Respond immediately so HubSpot doesn't retry
  res.json({ ok: true, processed: cancelEvents.length });

  // ── Process each cancel/delete deal event ────────────────────────────────────
  for (const event of cancelEvents) {
    const dealId = String(event.objectId ?? "");
    if (!dealId) continue;

    try {
      // Find booking by hs_deal_id
      const { rows } = await pool.query(
        `SELECT * FROM bookings WHERE hs_deal_id = $1 AND status IN ('pending','approved') LIMIT 1`,
        [dealId],
      );
      if (!rows.length) {
        req.log.info({ dealId }, "HubSpot webhook: no active booking found for deal");
        continue;
      }

      const r = rows[0];
      const booking: Booking = {
        id:            r.id,
        approveToken:  r.approve_token,
        status:        r.status,
        name:          r.name,
        phone:         r.phone,
        email:         r.email,
        address:       r.address,
        appliance:     r.appliance,
        brandModel:    r.brand_model,
        preferredDate: r.preferred_date,
        preferredTime: r.preferred_time,
        message:       r.message,
        language:      r.language,
        createdAt:     r.created_at,
        hsDealId:      r.hs_deal_id ?? undefined,
      };

      // Cancel the booking
      const { rowCount } = await pool.query(
        `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status IN ('pending','approved')`,
        [booking.id],
      );
      if (!rowCount) continue;

      const cancelReason = event.subscriptionType === "deal.deletion" ? "deal deleted in HubSpot" : "deal marked closedlost in HubSpot";
      req.log.info({ bookingId: booking.id, dealId, reason: cancelReason }, "Booking cancelled via HubSpot webhook");

      // Free blocked slots (WA bookings)
      try {
        const WA_MORNING   = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM"];
        const WA_AFTERNOON = ["1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
        const pt = booking.preferredTime ?? "";
        const isWAMorning   = pt.includes("9 AM") || pt.includes("AM–12") || pt.includes("AM-12");
        const isWAAfternoon = pt.includes("1 PM") || pt.includes("PM–5") || pt.includes("PM-5");
        if (isWAMorning || isWAAfternoon) {
          const hours = isWAMorning ? WA_MORNING : WA_AFTERNOON;
          for (const h of hours) {
            await pool.query(
              `DELETE FROM blocked_slots WHERE slot_date = $1 AND slot_time = $2`,
              [booking.preferredDate, h],
            );
          }
        }
      } catch { /* non-fatal */ }

      // Send cancellation emails
      const emailUser = process.env["EMAIL_USER"] ?? "";
      const emailPass = process.env["EMAIL_PASS"] ?? "";
      const emailTo   = process.env["EMAIL_TO"]   ?? "";

      if (emailUser && emailPass && emailTo) {
        void (async () => {
          try {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: { user: emailUser, pass: emailPass },
            });
            const shortId = booking.id.slice(0, 8).toUpperCase();
            await transporter.sendMail({
              from:    `"Hi-Tech Repair Group" <${emailUser}>`,
              to:      emailTo,
              subject: `❌ [HubSpot] Бронирование отменено [${shortId}] — ${booking.name}`,
              html: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:24px;border:1px solid #ddd;border-radius:8px;">
                <h2 style="color:#dc2626;">❌ Бронирование отменено через HubSpot</h2>
                <p><strong>Клиент:</strong> ${booking.name}</p>
                <p><strong>Телефон:</strong> ${booking.phone}</p>
                <p><strong>Техника:</strong> ${booking.appliance}</p>
                <p><strong>Дата:</strong> ${booking.preferredDate} · ${booking.preferredTime}</p>
                <p><strong>ID сделки HubSpot:</strong> ${dealId}</p>
                <p style="color:#6b7280;font-size:13px;margin-top:16px;">Слот освобождён автоматически.</p>
              </div>`,
              text: `Бронирование отменено через HubSpot.\nКлиент: ${booking.name}\nТелефон: ${booking.phone}\nДата: ${booking.preferredDate} · ${booking.preferredTime}\nHubSpot Deal ID: ${dealId}\nСлот освобождён.`,
            });
          } catch (err) {
            console.warn("[HS-Webhook] Email failed:", err);
          }
        })();

        // Email to client
        const clientEmail = booking.email?.trim();
        if (clientEmail && clientEmail.includes("@")) {
          void (async () => {
            try {
              const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: { user: emailUser, pass: emailPass },
              });
              const isEs = booking.language === "es";
              await transporter.sendMail({
                from:    `"Hi-Tech Repair Group" <${emailUser}>`,
                to:      clientEmail,
                subject: isEs ? `Su cita ha sido cancelada — HTRGroupTX` : `Your appointment has been cancelled — HTRGroupTX`,
                text: isEs
                  ? `Estimado/a ${booking.name},\nSu cita del ${booking.preferredDate} a las ${booking.preferredTime} ha sido cancelada.\nContacto: (346) 820-6021 | htrgroupllc@gmail.com`
                  : `Dear ${booking.name},\nYour appointment on ${booking.preferredDate} at ${booking.preferredTime} has been cancelled.\nContact: (346) 820-6021 | htrgroupllc@gmail.com`,
              });
            } catch { /* non-fatal */ }
          })();
        }
      }

      // Notify owner via WhatsApp
      const waReason = event.subscriptionType === "deal.deletion"
        ? "🗑️ СДЕЛКА УДАЛЕНА В HUBSPOT"
        : "📉 СДЕЛКА ЗАКРЫТА КАК ПРОИГРЫШ (closedlost)";
      sendOwnerWA(
        `❌ БРОНЬ ОТМЕНЕНА\n${waReason}\n` +
        `👤 ${booking.name}\n` +
        `📞 ${booking.phone}\n` +
        `📅 ${booking.preferredDate} · ${booking.preferredTime}\n` +
        `🔧 ${booking.appliance}\n` +
        `🆔 Deal: ${dealId}`,
        req.log,
      );

    } catch (err) {
      req.log.error({ err, dealId }, "HubSpot webhook processing error");
    }
  }
});

// ─── Status HTML page helper ──────────────────────────────────────────────────
function statusPage(type: "success" | "already" | "error", title: string, bodyHtml: string): string {
  const colors = { success: "#16a34a", already: "#d97706", error: "#dc2626" };
  const icons  = { success: "✅", already: "⚠️", error: "❌" };
  return `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Hi-Tech Repair Group</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#f0f4f8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.1);max-width:560px;width:100%;overflow:hidden}
    .hdr{background:${colors[type]};padding:28px 32px;text-align:center;color:#fff}
    .hdr .ico{font-size:48px;margin-bottom:12px}
    .hdr h1{font-size:22px;font-weight:700}
    .body{padding:28px 32px}
    .footer{background:#f8fafc;padding:14px 32px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center}
  </style>
</head>
<body>
  <div class="card">
    <div class="hdr"><div class="ico">${icons[type]}</div><h1>${title}</h1></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">Hi-Tech Repair Group · Houston, TX · (346) 820-6021</div>
  </div>
</body>
</html>`;
}

export default bookingRouter;
