import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import twilio from "twilio";
import pg from "pg";
import crypto from "crypto";
import { cancelDealInHubSpot, syncBookingToHubSpot } from "../hubspot.js";

const waRouter = Router();

const FROM_NUM     = process.env["TWILIO_WHATSAPP_NUMBER"] ?? "whatsapp:+14155238886";
const OWNER_WA     = "whatsapp:+13466968751";
const OWNER_PHONE  = "(346) 696-8751";
const OWNER_EMAIL  = "htrgroupllc@gmail.com";
const COMPANY_NAME = "HTRGroup";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });

/* ── Content template SIDs (cached after first creation) ─────────────────── */
let tplSlotsSid   = "";  // list-picker: 6 time slots
let tplConfirmSid = "";  // quick-reply: ✅ Confirm / ❌ Cancel

/* ── Session ─────────────────────────────────────────────────────────────── */
type Stage =
  | "awaiting_date"    // step 1: pick a day
  | "awaiting_time"    // step 2: pick a time for that day
  | "awaiting_problem"
  | "awaiting_name"
  | "awaiting_email"
  | "awaiting_address"
  | "awaiting_city"
  | "awaiting_zip"
  | "awaiting_phone"
  | "awaiting_confirm"
  | "booked"
  | "awaiting_action"
  | "new";

interface Session {
  lang:           string;
  lastSeen:       number;
  stage:          Stage;
  slots:          string[];     // holds dates (awaiting_date) or times (awaiting_time)
  slotsOffset?:   number;       // pagination offset
  selectedDate?:  string;       // "Wed, Apr 15, 2026" — set in awaiting_date, used in awaiting_time
  selectedSlot?:  string;       // "Wed, Apr 15, 2026 — 9:00 AM" — set after awaiting_time
  problem?:       string;
  clientName?:    string;
  clientEmail?:   string;
  clientStreet?:  string;       // street address only
  clientCity?:    string;       // city
  clientZip?:     string;       // zip code
  clientAddress?: string;       // full combined: "123 Main St, Houston, TX 77001"
  clientPhone?:   string;
  profileName?:   string;
  bookingId?:     string;       // DB id saved after confirmation
  chatOpen?:      boolean;      // owner opened direct chat; client replies forwarded to owner
}

// Hybrid session storage: in-memory (fast) + PostgreSQL (persistent across restarts)
const sessions = new Map<string, Session>();

async function loadSessions() {
  try {
    const { rows } = await pool.query("SELECT wa_from, data FROM wa_sessions");
    for (const r of rows) sessions.set(r.wa_from, r.data as Session);
    console.log(`[WA-DB] Loaded ${rows.length} sessions from DB`);
  } catch (e) { console.warn("[WA-DB] Could not load sessions:", e); }
}

async function persistSession(waFrom: string, sess: Session) {
  try {
    await pool.query(
      `INSERT INTO wa_sessions (wa_from, data, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (wa_from) DO UPDATE SET data=$2, updated_at=NOW()`,
      [waFrom, JSON.stringify(sess)],
    );
  } catch (e) { console.warn("[WA-DB] Could not persist session:", e); }
}

async function deleteSession(waFrom: string) {
  sessions.delete(waFrom);
  try { await pool.query("DELETE FROM wa_sessions WHERE wa_from=$1", [waFrom]); } catch {}
}

loadSessions().catch(() => {});

/* ── Twilio client ───────────────────────────────────────────────────────── */
function makeTwilioClient() {
  const sid   = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  if (!sid || !token) throw new Error("Twilio creds missing");
  return twilio(sid, token);
}

/* ── Content template management ─────────────────────────────────────────── */
async function createOrGetTemplate(friendlyName: string, types: object): Promise<string> {
  const sid   = process.env["TWILIO_ACCOUNT_SID"]!;
  const token = process.env["TWILIO_AUTH_TOKEN"]!;
  const auth  = Buffer.from(`${sid}:${token}`).toString("base64");

  try {
    const listRes  = await fetch("https://content.twilio.com/v1/Content?PageSize=100", {
      headers: { Authorization: `Basic ${auth}` },
    });
    const listData = (await listRes.json()) as { contents?: Array<{ friendly_name: string; sid: string }> };
    const found    = (listData.contents ?? []).find(c => c.friendly_name === friendlyName);
    if (found) {
      console.log(`[TPL] Found: ${friendlyName} → ${found.sid}`);
      return found.sid;
    }
  } catch (e) {
    console.warn("[TPL] List error:", e);
  }

  const createRes  = await fetch("https://content.twilio.com/v1/Content", {
    method:  "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ friendly_name: friendlyName, language: "en", types }),
  });
  const created = (await createRes.json()) as { sid?: string; message?: string };
  if (!created.sid) throw new Error(`Template create failed: ${JSON.stringify(created)}`);
  console.log(`[TPL] Created: ${friendlyName} → ${created.sid}`);
  return created.sid;
}

async function initTemplates() {
  try {
    tplSlotsSid = await createOrGetTemplate("htr_slots_v5", {
      "twilio/list-picker": {
        body:   "{{1}}",
        button: "📅 Choose",
        items: [
          { id: "slot_0", item: "{{2}}", description: "" },
          { id: "slot_1", item: "{{3}}", description: "" },
          { id: "slot_2", item: "{{4}}", description: "" },
          { id: "slot_3", item: "{{5}}", description: "" },
          { id: "slot_4", item: "{{6}}", description: "" },
          { id: "slot_5", item: "{{7}}", description: "" },
        ],
      },
    });

    tplConfirmSid = await createOrGetTemplate("htr_confirm_v4", {
      "twilio/quick-reply": {
        body:    "{{1}}",
        actions: [
          { title: "✅ Confirm", id: "confirm" },
          { title: "❌ Cancel",  id: "cancel"  },
        ],
      },
    });

    console.log(`[TPL] Ready — slots=${tplSlotsSid} confirm=${tplConfirmSid}`);
  } catch (err) {
    console.error("[TPL] initTemplates error:", err);
  }
}

initTemplates().catch(() => {});

/* ── Slot helpers ─────────────────────────────────────────────────────────── */

// 30-minute slots — must match website TIME_SLOTS exactly (5:30 PM excluded)
const HOUR_SLOTS = [
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM",
  "3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM",
];

// Parse stored slot string → {date: "Apr 15, 2026", time: "9:00 AM"}
function parseSlot(slot: string): { display: string; date: string; time: string } {
  const sep     = slot.lastIndexOf(" — ");
  const datePart = sep >= 0 ? slot.slice(0, sep) : slot;
  const timePart = sep >= 0 ? slot.slice(sep + 3) : "";
  // Strip optional "Wed, " weekday prefix → "Apr 15, 2026"
  const date = datePart.replace(/^\w+,\s*/, "");
  return { display: slot, date, time: timePart };
}

// Short display for Twilio list-picker (max 24 chars per item)
// "Wed, Apr 15, 2026 — 9:00 AM" → "Wed Apr 15 — 9:00 AM" (21 chars)
function shortSlotLabel(slot: string): string {
  const { date, time } = parseSlot(slot);
  const dayMatch = slot.match(/^(\w+),/);
  const day      = dayMatch ? dayMatch[1] : "";
  const shortDate = date.split(",")[0] ?? date;   // "Apr 15"
  return `${day} ${shortDate} — ${time}`;
}

// Next 7 calendar days with their metadata — uses Houston (America/Chicago) local time
function getNext7Days(): Array<{ dayName: string; datePart: string; fullDate: string }> {
  const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = [];
  // Convert current time to Houston local date to avoid UTC offset errors
  const nowHouston = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  // Start from tomorrow (d=1) — same-day booking not accepted
  for (let d = 1; d <= 14 && days.length < 7; d++) {
    const dt  = new Date(nowHouston);
    dt.setDate(nowHouston.getDate() + d);
    const dow = dt.getDay();
    if (dow === 0 || dow === 6) continue; // skip Sunday (0) and Saturday (6)
    const dayName  = DAYS[dow];
    const datePart = `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
    days.push({ dayName, datePart, fullDate: `${dayName}, ${datePart}` });
  }
  return days;
}

// Sentinel prefix for "More" button: "__MORE__:label" so we can display next item's label
const MORE_PREFIX = "__MORE__";

// "Wed, Apr 15, 2026" → "Wed Apr 15" (short label for date picker)
function shortDateLabel(fullDate: string): string {
  const parts = fullDate.replace(/,/g, "").split(/\s+/);
  return `${parts[0] ?? ""} ${parts[1] ?? ""} ${parts[2] ?? ""}`.trim();
}

// Returns true if at least one hour slot is free for datePart ("Apr 15, 2026")
async function dateHasAvailableSlot(datePart: string): Promise<boolean> {
  for (const time of HOUR_SLOTS) {
    const { rows } = await pool.query(
      `SELECT 1 FROM bookings
       WHERE preferred_date = $1 AND preferred_time = $2 AND status IN ('pending','approved')
       UNION ALL
       SELECT 1 FROM blocked_slots WHERE slot_date = $1 AND slot_time = $2
       LIMIT 1`,
      [datePart, time],
    );
    if (rows.length === 0) return true;
  }
  return false;
}

// Step 1 — returns available dates (that have ≥1 free slot) for the next 7 days
// Up to 5 real dates per page + optional MORE sentinel as item 6
async function getAvailableDates(skip = 0): Promise<{ dates: string[]; hasMore: boolean }> {
  const available: string[] = [];
  for (const { datePart, fullDate } of getNext7Days()) {
    if (await dateHasAvailableSlot(datePart)) available.push(fullDate);
  }
  const page    = available.slice(skip, skip + 5);
  const hasMore = available.length > skip + 5;
  if (hasMore) {
    const nextDate  = available[skip + 5];
    const nextLabel = nextDate ? shortDateLabel(nextDate) : "";
    return { dates: [...page, `${MORE_PREFIX}:${nextLabel}`], hasMore };
  }
  return { dates: page, hasMore };
}

// Step 2 — returns available times for a given date ("Apr 15, 2026")
// Up to 5 real times per page + optional MORE sentinel as item 6
async function getTimesForDate(datePart: string, skip = 0): Promise<{ times: string[]; hasMore: boolean }> {
  const available: string[] = [];
  for (const time of HOUR_SLOTS) {
    const { rows } = await pool.query(
      `SELECT 1 FROM bookings
       WHERE preferred_date = $1 AND preferred_time = $2 AND status IN ('pending','approved')
       UNION ALL
       SELECT 1 FROM blocked_slots WHERE slot_date = $1 AND slot_time = $2
       LIMIT 1`,
      [datePart, time],
    );
    if (rows.length === 0) available.push(time);
  }
  const page    = available.slice(skip, skip + 5);
  const hasMore = available.length > skip + 5;
  if (hasMore) {
    const nextTime = available[skip + 5] ?? "";
    return { times: [...page, `${MORE_PREFIX}:${nextTime}`], hasMore };
  }
  return { times: page, hasMore };
}

// Block a single hour slot in blocked_slots
async function blockSlotHour(date: string, time: string, reason: string): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO blocked_slots (slot_date, slot_time, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (slot_date, slot_time) DO NOTHING`,
      [date, time, reason],
    );
  } catch (e) {
    console.warn("[WA] blockSlotHour error:", e);
  }
}

// Unblock a single hour slot
async function unblockSlotHour(date: string, time: string): Promise<void> {
  try {
    await pool.query(
      `DELETE FROM blocked_slots WHERE slot_date = $1 AND slot_time = $2`,
      [date, time],
    );
  } catch (e) {
    console.warn("[WA] unblockSlotHour error:", e);
  }
}

/* ── Gemini AI ────────────────────────────────────────────────────────────── */
function makeGemini() {
  const baseUrl = process.env["AI_INTEGRATIONS_GEMINI_BASE_URL"];
  const apiKey  = process.env["AI_INTEGRATIONS_GEMINI_API_KEY"];
  if (!baseUrl || !apiKey) throw new Error("Gemini not configured");
  return new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "", baseUrl } });
}

// Languages that are safe to switch to (prevents "Undetermined" and other junk)
const KNOWN_LANGS = new Set([
  "English","Spanish","Russian","Portuguese","French","German","Italian",
  "Arabic","Azerbaijani","Turkish","Ukrainian","Hebrew","Chinese","Japanese",
  "Korean","Hindi","Dutch","Polish","Romanian","Swedish","Norwegian",
  "Danish","Finnish","Greek","Czech","Hungarian","Vietnamese","Thai",
  "Indonesian","Malay","Georgian","Armenian","Persian","Uzbek","Kazakh",
]);

async function detectAndTranslate(text: string, ai: GoogleGenAI) {
  const resp = await ai.models.generateContent({
    model:    "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text:
      `Detect the language and translate to Russian.\nMessage: """${text}"""\nRespond ONLY as JSON (no markdown): {"lang":"<language in English>","russian":"<translation>"}`,
    }] }],
  });
  const raw = resp.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  try {
    const j    = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const lang = (j.lang && KNOWN_LANGS.has(j.lang)) ? j.lang : "English";
    return { russian: j.russian ?? raw, lang };
  } catch { return { russian: raw, lang: "English" }; }
}

// In-memory translation cache: key = "Lang:text", value = translated string
const _txCache = new Map<string, string>();

async function translateTo(text: string, lang: string, ai: GoogleGenAI, force = false): Promise<string> {
  // Skip only when target is English AND caller hasn't forced translation.
  // Owner replies are always forced (they write in Russian → client may be English-speaker).
  if (lang === "English" && !force) return text;
  // Guard: never translate to unknown/unsupported language — return original text
  if (!KNOWN_LANGS.has(lang)) return text;
  const cacheKey = `${lang}:${text}`;
  const cached = _txCache.get(cacheKey);
  if (cached) return cached;
  const resp = await ai.models.generateContent({
    model:    "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text:
      `Translate the following text into ${lang}. Return ONLY the translated text, no explanations.\n\nText: """${text}"""`,
    }] }],
  });
  const result = resp.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? text;
  _txCache.set(cacheKey, result);
  return result;
}

/* ── Send helpers ────────────────────────────────────────────────────────── */
async function sendWA(to: string, body: string): Promise<boolean> {
  try {
    const client = makeTwilioClient();
    const msg    = await client.messages.create({ from: FROM_NUM, to, body });
    console.log(`[WA] Sent text to ${to}: ${msg.sid}`);
    return true;
  } catch (e: any) {
    console.error(`[WA] Text failed to ${to}: code=${e?.code} ${e?.message}`);
    return false;
  }
}

async function sendInteractive(to: string, contentSid: string, vars: Record<string, string>): Promise<boolean> {
  if (!contentSid) return sendWA(to, vars["1"] ?? "");
  try {
    const client = makeTwilioClient();
    const msg    = await (client.messages.create as Function)({
      from:             FROM_NUM,
      to,
      contentSid,
      contentVariables: JSON.stringify(vars),
    });
    console.log(`[WA] Sent interactive to ${to}: ${msg.sid}`);
    return true;
  } catch (e: any) {
    console.error(`[WA] Interactive failed to ${to}: code=${e?.code} ${e?.message} — falling back to text`);
    return sendWA(to, vars["1"] ?? "");
  }
}

/* ── Email ───────────────────────────────────────────────────────────────── */
async function emailOwner(subject: string, html: string) {
  const user = process.env["EMAIL_USER"];
  const pass = process.env["EMAIL_PASS"];
  if (!user || !pass) return;
  try {
    const t = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await t.sendMail({ from: `"${COMPANY_NAME} Bot" <${user}>`, to: OWNER_EMAIL, subject, html });
    console.log("[EMAIL] Sent ✅");
  } catch (e) { console.error("[EMAIL] Error:", e); }
}

async function notifyOwner(waMsg: string, emailSubject: string, emailHtml: string) {
  await Promise.allSettled([
    sendWA(OWNER_WA, waMsg),
    emailOwner(emailSubject, emailHtml),
  ]);
}

/* ── Save booking to DB ──────────────────────────────────────────────────── */
async function saveWaBooking(
  sess: Session,
  fromPhone: string,
): Promise<{ id: string; approveToken: string } | null> {
  try {
    const id           = crypto.randomUUID();
    const approveToken = crypto.randomBytes(16).toString("hex");

    // Normalize slot → {date: "Apr 15, 2026", time: "9:00 AM"}
    const { date: preferredDate, time: preferredTime } = parseSlot(sess.selectedSlot ?? "");

    await pool.query(
      `INSERT INTO bookings
       (id, approve_token, status, name, phone, email, address, appliance,
        brand_model, preferred_date, preferred_time, message, language, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`,
      [
        id, approveToken, "pending",
        sess.clientName ?? "",
        sess.clientPhone ?? fromPhone,
        sess.clientEmail ?? "",
        sess.clientAddress ?? "",
        sess.problem ?? "Appliance repair (via WhatsApp)",
        "",
        preferredDate,
        preferredTime,
        "Via WhatsApp Bot",
        sess.lang === "Spanish" ? "es" : "en",
      ],
    );
    console.log(`[DB] WA booking saved: ${id} | ${preferredDate} ${preferredTime}`);

    // Block this specific hour slot so the website shows it as unavailable.
    const blockReason = `WA booking – ${sess.clientName ?? "client"}`;
    await blockSlotHour(preferredDate, preferredTime, blockReason);
    console.log(`[DB] Blocked slot for ${preferredDate} ${preferredTime}`);

    // ── HubSpot sync at WA booking creation (fire-and-forget) ──────────────
    syncBookingToHubSpot({
      id,
      name:          sess.clientName ?? "",
      phone:         sess.clientPhone ?? fromPhone,
      email:         sess.clientEmail ?? "",
      address:       sess.clientAddress ?? "",
      appliance:     sess.problem ?? "Appliance repair (via WhatsApp)",
      preferredDate,
      preferredTime,
      message:       "Via WhatsApp Bot",
      source:        "whatsapp",
    }).then(r => {
      if (r.ok && r.dealId) {
        pool.query(`UPDATE bookings SET hs_deal_id=$1 WHERE id=$2`, [r.dealId, id]).catch(() => {});
        console.log(`[HS] WA booking deal created: ${r.dealId}`);
      } else if (!r.ok) {
        console.warn(`[HS] WA booking HubSpot sync failed (non-fatal): ${r.error}`);
      }
    }).catch(() => {});

    return { id, approveToken };
  } catch (err) {
    console.error("[DB] Save error:", err);
    return null;
  }
}

/* ── Maps helpers ─────────────────────────────────────────────────────────── */

/** Returns a Google Maps search URL for a given address */
function googleMapsUrl(address: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

/** Returns an Apple Maps search URL for a given address */
function appleMapsUrl(address: string): string {
  return `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
}

/** Returns a Zillow property URL for a given address.
 *  Zillow's routing matches "123-Main-St-Houston-TX-77001_rb" to the actual listing. */
function zillowUrl(address: string): string {
  const slug = address
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");
  return `https://www.zillow.com/homes/${slug}_rb/`;
}

/**
 * WhatsApp-formatted address block with all property links.
 * Each URL is tappable on mobile — opens the respective app.
 */
function waAddressBlock(address: string): string {
  if (!address || address.trim().length < 3) return address;
  const enc     = encodeURIComponent(address);
  const zilSlug = address.trim().replace(/,/g,"").replace(/\s+/g,"-").replace(/-{2,}/g,"-");
  return (
    `📍 *${address}*\n\n` +
    `🚶 Street View:\nhttps://maps.google.com/maps?q=${enc}&layer=c\n\n` +
    `🗺 Google Maps:\nhttps://maps.google.com/?q=${enc}\n\n` +
    `🍎 Apple Maps:\nhttps://maps.apple.com/?q=${enc}\n\n` +
    `🏠 Zillow:\nhttps://www.zillow.com/homes/${zilSlug}/`
  );
}

/**
 * HTML block for approval email — property location links + Zillow button.
 * Shown in the empty space of the approval window.
 */
function emailPropertyBlock(address: string): string {
  if (!address || address.trim().length < 3) return "";
  const gmUrl  = googleMapsUrl(address);
  const svUrl  = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&layer=c`;
  const zilUrl = zillowUrl(address);
  const rfSlug = encodeURIComponent(address);
  const rfUrl  = `https://www.redfin.com/search#location=${rfSlug}`;

  return `
    <div style="margin:20px 0;border:1px solid #ddd;border-radius:10px;overflow:hidden;background:#f8f9ff;">
      <div style="background:#0B1A3F;padding:9px 14px;">
        <span style="font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:.6px;">📍 Property Location</span>
      </div>
      <div style="padding:12px 14px 4px;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#0B1A3F;">${address}</p>
      </div>
      <div style="padding:10px 14px 14px;display:flex;gap:8px;flex-wrap:wrap;">
        <a href="${svUrl}"  target="_blank"
           style="flex:1;min-width:110px;background:#34a853;color:#fff;padding:9px 10px;border-radius:7px;
                  text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;">
          🚶 Street View
        </a>
        <a href="${gmUrl}"  target="_blank"
           style="flex:1;min-width:110px;background:#4285F4;color:#fff;padding:9px 10px;border-radius:7px;
                  text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;">
          🗺 Google Maps
        </a>
        <a href="${zilUrl}" target="_blank"
           style="flex:1;min-width:110px;background:#006AFF;color:#fff;padding:9px 10px;border-radius:7px;
                  text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;">
          🏠 Zillow $
        </a>
        <a href="${rfUrl}"  target="_blank"
           style="flex:1;min-width:110px;background:#d73b2f;color:#fff;padding:9px 10px;border-radius:7px;
                  text-decoration:none;font-size:12px;font-weight:700;text-align:center;display:inline-block;">
          🔴 Redfin $
        </a>
      </div>
    </div>`;
}

/* ── TwiML ───────────────────────────────────────────────────────────────── */
const emptyResp = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

/* ── Generic interactive picker (reused for dates and times) ──────────────── */
// items: real values + optional MORE sentinel as last item
// labelFn: converts a raw item value to the display label shown in the picker
async function sendPickerInteractive(
  to: string,
  greeting: string,
  items: string[],
  hasMore: boolean,
  labelFn: (s: string) => string,
  emptyMsg: string,
) {
  const realItems = items.filter(s => !s.startsWith(MORE_PREFIX));

  if (realItems.length === 0) {
    await sendWA(to, emptyMsg);
    return;
  }

  const clean = (s: string) => s.replace(/[–—]/g, "-").replace(/\*/g, "");

  if (tplSlotsSid && realItems.length >= 1) {
    const header  = clean(greeting.replace(/\n/g, " ")).slice(0, 160);
    const padItem = (s?: string) => {
      if (!s) return " ";
      if (s.startsWith(MORE_PREFIX)) {
        const nextLabel = s.split(":").slice(1).join(":");
        return nextLabel ? `${nextLabel} & more >` : "More options >";
      }
      return labelFn(s).slice(0, 24);
    };
    const vars: Record<string, string> = {
      "1": header,
      "2": padItem(items[0]), "3": padItem(items[1]), "4": padItem(items[2]),
      "5": padItem(items[3]), "6": padItem(items[4]),
      "7": padItem(items[5] ?? items[4] ?? items[3]),
    };
    const ok = await sendInteractive(to, tplSlotsSid, vars);
    if (ok) return;
  }

  // Text fallback
  const lines    = realItems.map((s, i) => `*${i + 1}* — ${labelFn(s)}`).join("\n");
  const moreHint = hasMore ? `\n\n_Type *more* to see more options_` : "";
  await sendWA(to,
    `${greeting}\n\n${lines}\n\n` +
    `✏️ *Reply with a number* (e.g. type *1* and send)${moreHint}`
  );
}

/* ── Date picker (step 1) ─────────────────────────────────────────────────── */
async function sendDatePicker(to: string, greeting: string, dates: string[], hasMore: boolean) {
  const clean = (s: string) => s.replace(/[–—]/g, "-").replace(/\*/g, "");
  await sendPickerInteractive(
    to, greeting, dates, hasMore,
    (s) => clean(shortDateLabel(s)),
    `${greeting}\n\n` +
    `⚠️ *No available days in the next 7 days.*\n\n` +
    `Please call or text us directly:\n📞 *(346) 696-8751*\n\nWe'll find a time for you! 🙏`,
  );
}

/* ── Time picker (step 2) ─────────────────────────────────────────────────── */
async function sendTimePicker(
  to: string,
  greeting: string,
  times: string[],
  hasMore: boolean,
) {
  await sendPickerInteractive(
    to, greeting, times, hasMore,
    (s) => s,   // times are already short: "9:00 AM"
    `${greeting}\n\n⚠️ No available times. Please choose another day.`,
  );
}

// Legacy alias so existing call-sites that use sendSlotPicker still compile
// (used for reschedule flows that display full slot strings)
async function sendSlotPicker(to: string, greeting: string, slots: string[], hasMore = false) {
  const clean = (s: string) => s.replace(/[–—]/g, "-").replace(/\*/g, "");
  await sendPickerInteractive(
    to, greeting, slots, hasMore,
    (s) => clean(shortSlotLabel(s)).slice(0, 24),
    `${greeting}\n\n` +
    `⚠️ *No available slots.*\n\nPlease call us: 📞 *(346) 696-8751*`,
  );
}

/* ── Webhook ─────────────────────────────────────────────────────────────── */
waRouter.post("/whatsapp/incoming", async (req, res) => {
  res.type("text/xml").send(emptyResp);  // Respond to Twilio immediately

  const body          = ((req.body?.Body as string) ?? "").trim();
  const fromRaw       = (req.body?.From as string) ?? "";
  const profileName   = (req.body?.ProfileName as string) ?? "Customer";
  const firstName     = profileName.split(" ")[0] ?? "there";
  const buttonPayload = (req.body?.ButtonPayload as string) ?? "";
  const listId        = (req.body?.ListId as string) ?? "";

  console.log(`[WA] from=${fromRaw} stage=${sessions.get(fromRaw)?.stage ?? "NEW"} btn="${buttonPayload}" list="${listId}" body="${body.slice(0, 60)}"`);

  if (!body && !buttonPayload && !listId) return;

  try {
    const ai       = makeGemini();
    let   existing = sessions.get(fromRaw);

    /* ── Auto-expire: stale stage or session older than 24 h → treat as new ── */
    const VALID_STAGES: Stage[] = [
      "new","awaiting_date","awaiting_time","awaiting_problem","awaiting_name",
      "awaiting_email","awaiting_address","awaiting_city","awaiting_zip",
      "awaiting_phone","awaiting_confirm","booked","awaiting_action",
    ];
    const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
    if (existing) {
      const isStaleStage = !VALID_STAGES.includes(existing.stage as Stage);
      const isExpired    = Date.now() - existing.lastSeen > SESSION_TTL_MS;
      if (isStaleStage || isExpired) {
        console.log(`[WA] Auto-expire session ${fromRaw}: stage=${existing.stage} age=${Math.round((Date.now()-existing.lastSeen)/60000)}m`);
        await deleteSession(fromRaw);
        existing = undefined;
      }
    }

    /* ── Re-detect language on every free-text message ─────────────────────
       If the user writes in a different language than stored in the session,
       update the session lang so the bot responds in the new language.      */
    if (existing && body && body.length > 5 && !buttonPayload && !listId) {
      try {
        const { lang: msgLang } = await detectAndTranslate(body, ai);
        if (msgLang && msgLang !== existing.lang && KNOWN_LANGS.has(msgLang)) {
          console.log(`[WA] Lang switch ${existing.lang} → ${msgLang} for ${fromRaw}`);
          existing = { ...existing, lang: msgLang, lastSeen: Date.now() };
          sessions.set(fromRaw, existing);
          persistSession(fromRaw, existing).catch(() => {});
        }
      } catch { /* non-fatal */ }
    }

    /* Translate helper for client's language */
    const tx = async (en: string, lang: string) => {
      if (lang === "English") return en;
      try { return await translateTo(en, lang, ai); } catch { return en; }
    };

    /* ── OWNER MESSAGE → translate & forward to client (with chat management) ─ */
    if (fromRaw === OWNER_WA) {
      let targetWA: string | undefined;
      let message = body;

      // Resolve target: [+13131234567] msg  OR  most-recent active client
      const match = body.match(/^\[(\+?\d[\d\s\-()]+)\]\s*/);
      if (match) {
        const num = match[1]!.replace(/[\s\-()]/g, "");
        targetWA  = `whatsapp:+${num.replace(/^\+/, "")}`;
        message   = body.replace(match[0], "");
      } else {
        let latest = 0;
        for (const [wa, sess] of sessions.entries()) {
          if (wa !== OWNER_WA && sess.lastSeen > latest) {
            latest   = sess.lastSeen;
            targetWA = wa;
          }
        }
      }

      if (!targetWA) {
        await sendWA(OWNER_WA, "⚠️ Нет активных клиентов. Укажите номер: [+17135551234] ваш ответ");
        return;
      }

      const clientSess = sessions.get(targetWA);
      const clientName = clientSess?.clientName ?? targetWA.replace("whatsapp:", "");

      // ── "end" command → close chat, don't send anything to client ──────────
      if (message.trim().toLowerCase() === "end") {
        if (clientSess) {
          const closed = { ...clientSess, chatOpen: false, lastSeen: Date.now() };
          sessions.set(targetWA, closed);
          persistSession(targetWA, closed).catch(() => {});
        }
        await sendWA(OWNER_WA, `🔒 Чат с *${clientName}* закрыт. Клиент вернётся в режим меню.`);
        console.log(`[WA] Owner closed chat with ${targetWA}`);
        return;
      }

      // ── Regular message → open chat + forward to client ────────────────────
      // force=true: owner writes in Russian → translate to any client language including English
      const lang       = clientSess?.lang ?? "English";
      const translated = await translateTo(message, lang, ai, /* force */ true);
      const sent = await sendWA(targetWA, `💬 *HTRGroup:* ${translated}`);

      if (sent) {
        // Mark chat as open so client replies are forwarded back to owner
        const updated = { ...(clientSess ?? { lang: "English", lastSeen: Date.now(), stage: "booked" as Stage, slots: [] }), chatOpen: true, lastSeen: Date.now() };
        sessions.set(targetWA, updated);
        persistSession(targetWA, updated).catch(() => {});
        console.log(`[WA] Owner→${targetWA} chat opened, RU→${lang}: "${translated.slice(0, 60)}"`);
        await sendWA(OWNER_WA, `✅ Отправлено *${clientName}* (${lang}). Чат открыт — клиент может отвечать.`);
      } else {
        await sendWA(OWNER_WA, "❌ Ошибка отправки сообщения клиенту");
      }
      return;
    }

    /* ── RESTART keyword → wipe session from any stage ─────────────────────── */
    const RESTART_WORDS = ["restart", "start over", "start again", "reset",
                           "reiniciar", "empezar", "comenzar", "new booking", "nueva cita"];
    const isRestart = RESTART_WORDS.some(w => body.toLowerCase().includes(w));

    if (isRestart && existing && existing.stage !== "new") {
      await deleteSession(fromRaw);
      const [{ dates, hasMore }, restartGreet] = await Promise.all([
        getAvailableDates(0),
        tx(`🔄 Starting fresh! Choose a date that works for you:`, existing.lang ?? "English"),
      ]);
      const freshSess: Session = {
        lang: existing.lang ?? "English",
        lastSeen: Date.now(),
        stage: dates.filter(d => !d.startsWith(MORE_PREFIX)).length > 0 ? "awaiting_date" : "new",
        slotsOffset: 0,
        slots: dates,
        profileName,
      };
      sessions.set(fromRaw, freshSess);
      persistSession(fromRaw, freshSess).catch(() => {});
      await sendDatePicker(fromRaw, restartGreet, dates, hasMore);
      console.log(`[WA] ${fromRaw} restarted session`);
      return;
    }

    /* ── CUSTOMER: step 1 — date selection ─────────────────────────────────── */
    if (existing?.stage === "awaiting_date") {
      const bodyL = body.toLowerCase().trim();
      const selId = listId || buttonPayload;

      // Detect "More options" tap or "more" text
      const selectedValue = selId.startsWith("slot_")
        ? existing.slots[parseInt(selId.replace("slot_", ""), 10)]
        : undefined;
      const wantsMore = (selectedValue?.startsWith(MORE_PREFIX) ?? false)
        || bodyL === "more" || bodyL === "más" || bodyL === "mas";

      if (wantsMore) {
        const nextOffset = (existing.slotsOffset ?? 0) + 5;
        const [{ dates: nextDates, hasMore }, moreGreet] = await Promise.all([
          getAvailableDates(nextOffset),
          tx(`📅 More available dates:`, existing.lang),
        ]);
        const upd = { ...existing, slots: nextDates, slotsOffset: nextOffset, lastSeen: Date.now() };
        sessions.set(fromRaw, upd); persistSession(fromRaw, upd).catch(() => {});
        await sendDatePicker(fromRaw, moreGreet, nextDates, hasMore);
        return;
      }

      // Resolve which date was picked
      let chosenDate: string | undefined;
      if (selId.startsWith("slot_")) {
        const idx = parseInt(selId.replace("slot_", ""), 10);
        chosenDate = existing.slots[idx];
      } else {
        const n = parseInt(body, 10);
        if (!isNaN(n) && n >= 1 && n <= existing.slots.length) {
          chosenDate = existing.slots[n - 1];
        } else {
          chosenDate = existing.slots.find(s =>
            !s.startsWith(MORE_PREFIX) && bodyL.includes(s.split(",")[0]?.toLowerCase() ?? "")
          );
        }
      }

      if (!chosenDate || chosenDate.startsWith(MORE_PREFIX)) {
        // Retry — re-send the date picker from page 0
        const [{ dates, hasMore }, retryGreet] = await Promise.all([
          getAvailableDates(0),
          tx(`⚠️ Please choose one of the available days below:`, existing.lang),
        ]);
        const upd = { ...existing, slots: dates, slotsOffset: 0, lastSeen: Date.now() };
        sessions.set(fromRaw, upd); persistSession(fromRaw, upd).catch(() => {});
        await sendDatePicker(fromRaw, retryGreet, dates, hasMore);
        return;
      }

      // Date chosen → now ask for time
      const datePart = chosenDate.replace(/^\w+,\s*/, "");   // "Apr 15, 2026"
      const [{ times, hasMore: timesHasMore }, timeGreet] = await Promise.all([
        getTimesForDate(datePart, 0),
        tx(`📅 *${shortDateLabel(chosenDate)}* — Choose a time that works for you:`, existing.lang),
      ]);
      const dateSess: Session = {
        ...existing,
        stage:        "awaiting_time",
        selectedDate: chosenDate,
        slots:        times,
        slotsOffset:  0,
        lastSeen:     Date.now(),
      };
      sessions.set(fromRaw, dateSess); persistSession(fromRaw, dateSess).catch(() => {});
      await sendTimePicker(fromRaw, timeGreet, times, timesHasMore);
      return;
    }

    /* ── CUSTOMER: step 2 — time selection ─────────────────────────────────── */
    if (existing?.stage === "awaiting_time") {
      const bodyL = body.toLowerCase().trim();
      const selId = listId || buttonPayload;

      // Detect "More options" tap or "more" text
      const selectedValue = selId.startsWith("slot_")
        ? existing.slots[parseInt(selId.replace("slot_", ""), 10)]
        : undefined;
      const wantsMore = (selectedValue?.startsWith(MORE_PREFIX) ?? false)
        || bodyL === "more" || bodyL === "más" || bodyL === "mas";

      if (wantsMore) {
        const nextOffset = (existing.slotsOffset ?? 0) + 5;
        const datePart   = (existing.selectedDate ?? "").replace(/^\w+,\s*/, "");
        const [{ times: nextTimes, hasMore }, moreGreet] = await Promise.all([
          getTimesForDate(datePart, nextOffset),
          tx(`⏰ More available times:`, existing.lang),
        ]);
        const upd = { ...existing, slots: nextTimes, slotsOffset: nextOffset, lastSeen: Date.now() };
        sessions.set(fromRaw, upd); persistSession(fromRaw, upd).catch(() => {});
        await sendTimePicker(fromRaw, moreGreet, nextTimes, hasMore);
        return;
      }

      // Resolve which time was picked
      let chosenTime: string | undefined;
      if (selId.startsWith("slot_")) {
        const idx = parseInt(selId.replace("slot_", ""), 10);
        chosenTime = existing.slots[idx];
      } else {
        const n = parseInt(body, 10);
        if (!isNaN(n) && n >= 1 && n <= existing.slots.length) {
          chosenTime = existing.slots[n - 1];
        } else {
          chosenTime = existing.slots.find(s =>
            !s.startsWith(MORE_PREFIX) && bodyL.includes(s.toLowerCase())
          );
        }
      }

      if (!chosenTime || chosenTime.startsWith(MORE_PREFIX)) {
        // Retry time picker
        const datePart = (existing.selectedDate ?? "").replace(/^\w+,\s*/, "");
        const [{ times, hasMore }, retryGreet] = await Promise.all([
          getTimesForDate(datePart, 0),
          tx(`⚠️ Please choose one of the available times below:`, existing.lang),
        ]);
        const upd = { ...existing, slots: times, slotsOffset: 0, lastSeen: Date.now() };
        sessions.set(fromRaw, upd); persistSession(fromRaw, upd).catch(() => {});
        await sendTimePicker(fromRaw, retryGreet, times, hasMore);
        return;
      }

      // Build full slot string: "Wed, Apr 15, 2026 — 9:00 AM"
      const fullSlot  = `${existing.selectedDate ?? ""} — ${chosenTime}`;
      const slotSess  = { ...existing, stage: "awaiting_problem" as Stage, selectedSlot: fullSlot, lastSeen: Date.now() };
      sessions.set(fromRaw, slotSess); persistSession(fromRaw, slotSess).catch(() => {});
      const shortDate = shortDateLabel(existing.selectedDate ?? "");
      const q = await tx(
        `✅ *${shortDate} at ${chosenTime}* — confirmed!\n\nPlease briefly describe the problem with your appliance 🔧`,
        existing.lang,
      );
      await sendWA(fromRaw, q);
      return;
    }

    /* ── CUSTOMER: problem description ────────────────────────────────────── */
    if (existing?.stage === "awaiting_problem") {
      const s = { ...existing, stage: "awaiting_name" as Stage, problem: body, lastSeen: Date.now() };
      sessions.set(fromRaw, s); persistSession(fromRaw, s).catch(() => {});
      const q = await tx("👤 What is your *full name*?", existing.lang);
      await sendWA(fromRaw, q);
      return;
    }

    /* ── CUSTOMER: name ───────────────────────────────────────────────────── */
    if (existing?.stage === "awaiting_name") {
      const hasLetters = /[a-zA-ZÀ-ÿА-яёЁ\u0400-\u04FF]/.test(body);
      if (!hasLetters || body.trim().length < 2) {
        const retry = await tx(
          `⚠️ Please enter your *full name* using letters only (e.g. *John Smith*). Numbers are not accepted.`,
          existing.lang,
        );
        await sendWA(fromRaw, retry);
        return;
      }
      const s = { ...existing, stage: "awaiting_email" as Stage, clientName: body.trim(), lastSeen: Date.now() };
      sessions.set(fromRaw, s); persistSession(fromRaw, s).catch(() => {});
      const q = await tx("📧 Your *email address*?", existing.lang);
      await sendWA(fromRaw, q);
      return;
    }

    /* ── CUSTOMER: email ──────────────────────────────────────────────────── */
    if (existing?.stage === "awaiting_email") {
      // Accept "skip" / "нет" keywords as no-email; otherwise validate format
      const bodyL     = body.toLowerCase().trim();
      const skipWords = ["skip","no email","нет","пропустить","no","sin correo"];
      const skipped   = skipWords.some(w => bodyL === w);
      const isValidEm = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.trim());

      if (!skipped && !isValidEm) {
        const retry = await tx(
          `⚠️ That doesn't look like a valid email.\nPlease enter your email (e.g. name@gmail.com) or reply *skip* to continue without it.`,
          existing.lang,
        );
        await sendWA(fromRaw, retry);
        return;
      }

      const email = skipped ? "" : body.trim();
      const s = { ...existing, stage: "awaiting_address" as Stage, clientEmail: email, lastSeen: Date.now() };
      sessions.set(fromRaw, s); persistSession(fromRaw, s).catch(() => {});
      const q = await tx("📍 Your *home address*? (where should our technician come)", existing.lang);
      await sendWA(fromRaw, q);
      return;
    }

    /* ── CUSTOMER: address (street only) ─────────────────────────────────── */
    if (existing?.stage === "awaiting_address") {
      const s = { ...existing, stage: "awaiting_city" as Stage, clientStreet: body, lastSeen: Date.now() };
      sessions.set(fromRaw, s); persistSession(fromRaw, s).catch(() => {});
      const q = await tx("🏙️ Your *city*? (e.g. Houston, Katy, Sugar Land…)", existing.lang);
      await sendWA(fromRaw, q);
      return;
    }

    /* ── CUSTOMER: city ───────────────────────────────────────────────────── */
    if (existing?.stage === "awaiting_city") {
      const s = { ...existing, stage: "awaiting_zip" as Stage, clientCity: body, lastSeen: Date.now() };
      sessions.set(fromRaw, s); persistSession(fromRaw, s).catch(() => {});
      const q = await tx("📮 Your *ZIP code*? (5 digits, e.g. 77001)", existing.lang);
      await sendWA(fromRaw, q);
      return;
    }

    /* ── CUSTOMER: zip → combine full address → ask phone ─────────────────── */
    if (existing?.stage === "awaiting_zip") {
      const zip     = body.trim().replace(/\D/g, "").slice(0, 5);
      const street  = existing.clientStreet ?? "";
      const city    = existing.clientCity   ?? "";
      const fullAddr = [street, city, `TX${zip ? " " + zip : ""}`].filter(Boolean).join(", ");
      const s = { ...existing, stage: "awaiting_phone" as Stage, clientZip: zip, clientAddress: fullAddr, lastSeen: Date.now() };
      sessions.set(fromRaw, s); persistSession(fromRaw, s).catch(() => {});
      const q = await tx("📞 Your *phone number*?", existing.lang);
      await sendWA(fromRaw, q);
      return;
    }

    /* ── CUSTOMER: phone → send booking summary with confirm/cancel ──────── */
    if (existing?.stage === "awaiting_phone") {
      const updated: Session = { ...existing, stage: "awaiting_confirm", clientPhone: body, lastSeen: Date.now() };
      sessions.set(fromRaw, updated); persistSession(fromRaw, updated).catch(() => {});

      const summaryEn =
        `📋 *Booking Summary*\n\n` +
        `👤 *Name:* ${updated.clientName}\n` +
        `📞 *Phone:* ${body}\n` +
        `📧 *Email:* ${updated.clientEmail}\n` +
        `📍 *Address:* ${updated.clientAddress}\n` +
        `🔧 *Problem:* ${updated.problem}\n` +
        `📅 *Time slot:* ${updated.selectedSlot}\n\n` +
        `Is everything correct? Please confirm your appointment:`;

      const summaryTx = await tx(summaryEn, existing.lang);

      if (tplConfirmSid) {
        await sendInteractive(fromRaw, tplConfirmSid, { "1": summaryTx });
      } else {
        await sendWA(fromRaw, summaryTx + "\n\nReply *1* to CONFIRM or *2* to CANCEL.");
      }
      return;
    }

    /* ── CUSTOMER: confirmation ───────────────────────────────────────────── */
    if (existing?.stage === "awaiting_confirm") {
      const isConfirm = buttonPayload === "confirm" || /^(1|yes|confirm|да|si|sí|ok)/i.test(body);
      const isCancel  = buttonPayload === "cancel"  || /^(2|no|cancel|нет|não)/i.test(body);

      if (isConfirm) {
        const waResult  = await saveWaBooking(existing, fromRaw.replace("whatsapp:", ""));
        const bookingId = waResult?.id ?? null;
        const bookedSess = { ...existing, stage: "booked" as Stage, lastSeen: Date.now(), bookingId: bookingId ?? undefined };
        sessions.set(fromRaw, bookedSess); persistSession(fromRaw, bookedSess).catch(() => {});

        const confirmEn =
          `✅ *Appointment Confirmed!*\n\n` +
          `📅 ${existing.selectedSlot}\n` +
          `📍 Houston Metropolitan Area\n` +
          `📞 ${OWNER_PHONE}\n\n` +
          `Our technician will contact you shortly before the visit.\n` +
          `Thank you for choosing *HTRGroup*! 🙏`;
        await sendWA(fromRaw, await tx(confirmEn, existing.lang));

        // ── Notify owner IMMEDIATELY (no blocking Gemini translation) ──────────
        const addr      = existing.clientAddress ?? "";
        const addrBlock = addr ? `\n${waAddressBlock(addr)}` : "";
        const problemOrig = existing.problem ?? "";

        const publicBase  = (process.env["PUBLIC_BASE_URL"] ?? "").replace(/\/$/, "")
          || "https://htr-group-llc-appliance-repair.replit.app";
        const approvalUrl = bookingId && waResult?.approveToken
          ? `${publicBase}/api/approve?id=${bookingId}&token=${waResult.approveToken}`
          : null;

        const ownerMsg =
          `📅 *ЗАПИСЬ ПОДТВЕРЖДЕНА*\n\n` +
          `👤 ${existing.clientName} (${fromRaw.replace("whatsapp:", "")})\n` +
          `📞 ${existing.clientPhone}\n` +
          `📧 ${existing.clientEmail}\n` +
          addrBlock + `\n` +
          `🔧 ${problemOrig}\n` +
          `📅 ${existing.selectedSlot}\n` +
          `🌐 ${existing.lang}` +
          (bookingId ? `\n🆔 ${bookingId.slice(0, 8).toUpperCase()}` : "");

        notifyOwner(
          ownerMsg + (approvalUrl ? `\n\n🔗 Одобрить: ${approvalUrl}` : ""),
          `📅 [WhatsApp] Запись: ${existing.clientName} — ${existing.selectedSlot}`,
          `<p><b>Клиент:</b> ${existing.clientName}</p>
           <p><b>Телефон:</b> ${existing.clientPhone}</p>
           <p><b>Email:</b> ${existing.clientEmail}</p>
           <p><b>Адрес:</b> ${addr}</p>
           <p><b>Проблема:</b> ${problemOrig}</p>
           <p><b>Слот:</b> ${existing.selectedSlot}</p>
           ${emailPropertyBlock(addr)}
           ${approvalUrl ? `<p style="margin-top:20px;">
             <a href="${approvalUrl}"
                style="background:#1B6FE8;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
               ✅ Одобрить запись
             </a>
             <br><span style="font-size:12px;color:#f97316;font-weight:600;display:block;margin-top:6px;">
               ⚠️ После нажатия — подтвердите на открывшейся странице (авто через 5 сек).
             </span>
           </p>` : ""}`,
        ).catch(() => {});
        console.log(`[WA] Booking confirmed + owner notified: ${existing.clientName} → ${existing.selectedSlot}`);
        return;
      }

      if (isCancel) {
        deleteSession(fromRaw).catch(() => {});
        const cancelMsg = await tx(
          "❌ Booking cancelled. Feel free to write us again anytime to schedule a new appointment!",
          existing.lang,
        );
        await sendWA(fromRaw, cancelMsg);
        return;
      }

      const clarify = await tx(
        `Please reply:\n*1* — ✅ Confirm my appointment\n*2* — ❌ Cancel\n\nOr write *restart* to start over.`,
        existing.lang,
      );
      await sendWA(fromRaw, clarify);
      return;
    }

    /* ── CHAT MODE: if owner has opened direct chat → forward client reply ── */
    if (existing?.chatOpen && (existing.stage === "booked" || existing.stage === "awaiting_action")) {
      // Always translate to Russian for owner
      let russian = body;
      let detectedLang = existing.lang;
      try {
        const det = await detectAndTranslate(body, ai);
        russian   = det.russian;
        detectedLang = det.lang;
      } catch { /* non-fatal */ }

      // Owner receives Russian; original shown in italics only if different
      const ownerMsg =
        `💬 *${existing.clientName ?? profileName}* (${fromRaw.replace("whatsapp:", "")}):\n${russian}` +
        (russian !== body ? `\n_[${detectedLang}: ${body}]_` : "");
      await sendWA(OWNER_WA, ownerMsg);

      // Acknowledge to client so they know message was received
      const ackEn = `✅ Your message has been received. Our specialist will respond to you shortly.\n\n_Reply *restart* anytime to start a new booking._`;
      sendWA(fromRaw, await tx(ackEn, existing.lang ?? "English")).catch(() => {});

      // Update lastSeen
      const upd = { ...existing, lastSeen: Date.now() };
      sessions.set(fromRaw, upd); persistSession(fromRaw, upd).catch(() => {});
      return;
    }

    /* ── BOOKED CLIENT messages again → show action menu ─────────────────── */
    if (existing?.stage === "booked") {
      const actionSess = { ...existing, stage: "awaiting_action" as Stage, lastSeen: Date.now() };
      sessions.set(fromRaw, actionSess); persistSession(fromRaw, actionSess).catch(() => {});

      const menuEn =
        `Hi ${firstName}! 👋 You already have an appointment:\n📅 *${existing.selectedSlot ?? "—"}*\n\n` +
        `What would you like to do?\n\n` +
        `*1* — ❌ Cancel my appointment\n` +
        `*2* — 📅 Reschedule to a different time\n\n` +
        `_Reply with 1 or 2_`;
      await sendWA(fromRaw, await tx(menuEn, existing.lang));
      return;
    }

    /* ── AWAITING ACTION: cancel or reschedule ────────────────────────────── */
    if (existing?.stage === "awaiting_action") {
      const isCancel     = /^1/.test(body.trim()) || /cancel|отмен|cancelar/i.test(body);
      const isReschedule = /^2/.test(body.trim()) || /reschedul|перенес|reprogramar/i.test(body);

      // Helper: cancel booking in DB + clear blocked_slots + cancel HubSpot deal
      const cancelExistingBooking = async () => {
        if (existing.bookingId) {
          try {
            await pool.query(
              `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status IN ('pending','approved')`,
              [existing.bookingId],
            );
            // Get date/time and hs_deal_id from DB
            const { rows } = await pool.query(
              `SELECT preferred_date, preferred_time, hs_deal_id FROM bookings WHERE id = $1`,
              [existing.bookingId],
            );
            const slotDate = rows[0]?.preferred_date;
            const slotTime = rows[0]?.preferred_time;
            const hsDealId = rows[0]?.hs_deal_id as string | undefined;
            if (slotDate && slotTime) {
              await unblockSlotHour(slotDate, slotTime);
            }
            // Cancel deal in HubSpot (fire-and-forget)
            if (hsDealId) {
              cancelDealInHubSpot(hsDealId).then(r => {
                if (r.ok) console.log(`[HS] WA cancel: deal ${hsDealId} closed-lost`);
                else      console.warn(`[HS] WA cancel deal failed: ${r.error}`);
              }).catch(() => {});
            }
            console.log(`[WA] Booking ${existing.bookingId} cancelled by client, slot freed`);
          } catch (e) { console.warn("[WA] Could not cancel booking:", e); }
        }
      };

      if (isCancel) {
        await cancelExistingBooking();
        deleteSession(fromRaw).catch(() => {});

        // Notify owner
        notifyOwner(
          `❌ *КЛИЕНТ ОТМЕНИЛ ЗАПИСЬ*\n\n👤 ${existing.clientName} (${fromRaw.replace("whatsapp:", "")})\n📅 ${existing.selectedSlot}\n📞 ${existing.clientPhone}`,
          `❌ Отмена: ${existing.clientName} — ${existing.selectedSlot}`,
          `<p><b>Клиент отменил запись</b></p><p>${existing.clientName} — ${existing.selectedSlot}</p>`,
        ).catch(() => {});

        const cancelMsg = await tx(
          `❌ Your appointment has been cancelled.\n\n📅 *${existing.selectedSlot ?? ""}*\n\nIf you need help in the future, just write us — we're always happy to help! 🙏`,
          existing.lang,
        );
        await sendWA(fromRaw, cancelMsg);
        return;
      }

      if (isReschedule) {
        await cancelExistingBooking();

        // Restart date selection, keeping client data
        const greetEn = `📅 Let's pick a new date for you, ${firstName}!`;
        const [{ dates: newDates, hasMore: newHasMore }, greet] = await Promise.all([
          getAvailableDates(0),
          tx(greetEn, existing.lang),
        ]);
        const hasDates = newDates.filter(d => !d.startsWith(MORE_PREFIX)).length > 0;
        const reschedSess: Session = {
          ...existing,
          stage:        hasDates ? "awaiting_date" : "new",
          slots:        newDates,
          slotsOffset:  0,
          selectedDate: undefined,
          selectedSlot: undefined,
          bookingId:    undefined,
          lastSeen:     Date.now(),
        };
        sessions.set(fromRaw, reschedSess); persistSession(fromRaw, reschedSess).catch(() => {});
        await sendDatePicker(fromRaw, greet, newDates, newHasMore);
        return;
      }

      // Unrecognised input — repeat menu
      const clarify = await tx(
        `Please reply with:\n*1* — ❌ Cancel my appointment\n*2* — 📅 Reschedule`,
        existing.lang,
      );
      await sendWA(fromRaw, clarify);
      return;
    }

    /* ── NEW CLIENT → start fresh session ────────────────────────────────── */
    let lang   = "English";
    let russian = body;
    try {
      const result = await detectAndTranslate(body, ai);
      lang    = result.lang;
      russian = result.russian;
    } catch {}

    // Load available dates (step 1 of 2-step selection)
    const { dates, hasMore } = await getAvailableDates(0);
    const hasDates = dates.filter(d => !d.startsWith(MORE_PREFIX)).length > 0;

    const newSess: Session = {
      lang,
      lastSeen:    Date.now(),
      stage:       hasDates ? "awaiting_date" : "new",
      slotsOffset: 0,
      slots:       dates,
      profileName,
    };
    sessions.set(fromRaw, newSess);
    persistSession(fromRaw, newSess).catch(() => {});

    // Notify owner — always in Russian (show original only if different)
    notifyOwner(
      `📱 *${profileName}* (${fromRaw.replace("whatsapp:", "")})\n\n` +
      `*Сообщение (RU):* ${russian}` +
      (russian !== body ? `\n*Оригинал (${lang}):* ${body}` : "") +
      `\n\n_Клиент выбирает слот_`,
      `📱 WhatsApp: ${profileName}`,
      `<p><b>Клиент:</b> ${profileName}</p><p><b>Сообщение:</b> ${body}</p>`,
    ).catch(() => {});

    // Send date picker (step 1) in client's language
    let greeting = `Hi ${firstName}! 👋 Thank you for contacting *HTRGroup* — appliance repair in Houston.\n\n📅 Please choose a date that works for you:`;
    if (lang !== "English") {
      try { greeting = await translateTo(greeting, lang, ai); } catch {}
    }
    await sendDatePicker(fromRaw, greeting, dates, hasMore);
    console.log(`[WA] New: ${profileName} (${fromRaw}) [${lang}] → date picker sent`);

  } catch (err) {
    console.error("[WA] Handler error:", err);
  }
});

/* ── Status ──────────────────────────────────────────────────────────────── */
waRouter.get("/whatsapp/status", (_req, res) => {
  res.json({
    ok:             true,
    fromNumber:     FROM_NUM,
    ownerWA:        OWNER_WA,
    activeSessions: sessions.size,
    templates:      { slots: tplSlotsSid || "pending", confirm: tplConfirmSid || "pending" },
  });
});

/* ── Admin: list / clear WA sessions ─────────────────────────────────────── */
waRouter.get("/whatsapp/sessions", (req, res) => {
  const pin = req.headers["x-admin-pin"];
  if (!pin || pin !== process.env["ADMIN_PIN"]) return res.status(401).json({ error: "Unauthorized" });
  const list = Array.from(sessions.entries()).map(([wa, s]) => ({
    wa, stage: s.stage, name: s.clientName, slot: s.selectedSlot, updated: new Date(s.lastSeen).toISOString(),
  }));
  return res.json({ count: list.length, sessions: list });
});

waRouter.delete("/whatsapp/sessions/:wa", async (req, res) => {
  const pin = req.headers["x-admin-pin"];
  if (!pin || pin !== process.env["ADMIN_PIN"]) return res.status(401).json({ error: "Unauthorized" });
  const waFrom = decodeURIComponent(req.params.wa ?? "");
  if (!waFrom) return res.status(400).json({ error: "Missing wa param" });
  await deleteSession(waFrom);
  console.log(`[ADMIN] Session cleared: ${waFrom}`);
  return res.json({ ok: true, cleared: waFrom });
});

/* ── SMS ─────────────────────────────────────────────────────────────────── */
waRouter.post("/sms/incoming", (req, res) => {
  if (req.body?.CallSid) {
    res.type("text/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`,
    );
    return;
  }
  const body = ((req.body?.Body as string) ?? "").trim();
  console.log(`[SMS] FROM=${req.body?.From} BODY="${body.slice(0, 60)}"`);
  const reply =
    "Hi! Thanks for texting HTR Group TX. Call us or visit HTRGroup.com to book appliance repair. Reply BOOK for help.";
  res.type("text/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${reply}</Message></Response>`,
  );
});

export default waRouter;
