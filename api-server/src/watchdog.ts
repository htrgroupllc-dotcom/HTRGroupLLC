/**
 * WATCHDOG — система надзора за синхронностью броней
 *
 * Запускается автоматически при старте сервера.
 * Выполняет 6 независимых проверок по расписанию:
 *
 *  CHECK-1  (каждые 15 мин)  Зависшие WA-блокировки → автоудаление + уведомление
 *  CHECK-2  (каждые 15 мин)  Дублирующиеся активные слоты → уведомление хозяину
 *  CHECK-3  (каждые 30 мин)  Approved-брони без HubSpot ID → повторная синхронизация
 *  CHECK-3b (каждые 30 сек)  Удалённые/closedlost сделки → отмена брони + WA + email
 *  CHECK-4  (ежедневно 00:00 CT / полночь) Итоговый отчёт о здоровье системы → WA + email
 *  CHECK-5  (каждые 2 мин)   HubSpot → DB: импорт новых сделок в панель администратора
 *  CHECK-6  (каждые 4 мин)   Self-ping /healthz — сервер никогда не засыпает
 */

import pg from "pg";
import twilio from "twilio";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { syncBookingToHubSpot, cancelDealInHubSpot } from "./hubspot.js";
import { verifyAdminToken } from "./admin-auth.js";

// ─── Config ─────────────────────────────────────────────────────────────────
const OWNER_WA           = "whatsapp:+13468206021";
const OWNER_EMAIL        = process.env["EMAIL_TO"]   ?? "htrgroupllc@gmail.com";
const WA_FROM            = process.env["TWILIO_WHATSAPP_NUMBER"] ?? "whatsapp:+15559554342";

const STALE_BLOCK_MINS    = 30;
const CHECK1_INTERVAL_MS  = 15 * 60 * 1000;
const CHECK2_INTERVAL_MS  = 15 * 60 * 1000;
const CHECK3_INTERVAL_MS  = 30 * 60 * 1000;
const CHECK3B_INTERVAL_MS = 30 * 1000;        // 30 сек — синхронизация удалений из HubSpot
const CHECK5_INTERVAL_MS  =  2 * 60 * 1000;  // 2 мин  — HubSpot → DB обратная синхронизация
const CHECK4_DAILY_NOON_CT = true; // fires once per day at 12:00 PM America/Chicago
const CHECK6_INTERVAL_MS  =  4 * 60 * 1000;  // 4 мин  — самопинг /healthz (сервер не засыпает)

// ─── Shared pool ─────────────────────────────────────────────────────────────
const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(level: "info" | "warn" | "error", msg: string, meta?: unknown) {
  const ts = new Date().toISOString();
  console[level](`[WATCHDOG ${ts}] ${msg}`, meta ?? "");
}

function sendWA(body: string) {
  const sid   = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  if (!sid || !token) return;
  void twilio(sid, token).messages
    .create({ from: WA_FROM, to: OWNER_WA, body })
    .then(() => log("info", "WA alert sent"))
    .catch((e: unknown) => log("warn", "WA alert failed", e));
}

function mailer() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env["EMAIL_USER"], pass: process.env["EMAIL_PASS"] },
  });
}

async function sendEmail(subject: string, html: string) {
  try {
    const t = mailer();
    await t.sendMail({
      from: `HTRGroupTX Watchdog <${process.env["EMAIL_USER"]}>`,
      to:   OWNER_EMAIL,
      subject,
      html,
    });
    log("info", `Email sent: ${subject}`);
  } catch (e) {
    log("warn", "Email send failed", e);
  }
}

function emailTable(rows: string[][], headers: string[]): string {
  const thStyle = "padding:8px 12px;background:#0B1A3F;color:#fff;font-size:13px;text-align:left;";
  const tdStyle = "padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;";
  const ths = headers.map(h => `<th style="${thStyle}">${h}</th>`).join("");
  const trs = rows.map(r =>
    `<tr>${r.map(c => `<td style="${tdStyle}">${c}</td>`).join("")}</tr>`
  ).join("");
  return `<table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
    <thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

// ─── CHECK-1: Зависшие WA-блокировки ────────────────────────────────────────

async function checkStaleWABlocks() {
  log("info", "CHECK-1: scanning for stale WA blocks...");
  try {
    const { rows } = await pool.query<{
      id: number; slot_date: string; slot_time: string; reason: string; created_at: Date;
    }>(`
      SELECT id, slot_date, slot_time, reason, created_at
      FROM blocked_slots
      WHERE created_at < NOW() - INTERVAL '${STALE_BLOCK_MINS} minutes'
    `);

    if (rows.length === 0) {
      log("info", "CHECK-1: no stale blocks found ✓");
      return;
    }

    log("warn", `CHECK-1: found ${rows.length} stale block(s)`);

    for (const row of rows) {
      await pool.query(`DELETE FROM blocked_slots WHERE id = $1`, [row.id]);
      log("info", `CHECK-1: deleted stale block id=${row.id} (${row.slot_date} ${row.slot_time})`);
    }

    const details = rows.map(r =>
      `• ${r.slot_date} ${r.slot_time} — "${r.reason}" (создана ${new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" })} CT)`
    ).join("\n");

    sendWA(
      `⚠️ HTRGroupTX Watchdog\n\n` +
      `Найдено и удалено ${rows.length} зависших WA-блокировок:\n${details}\n\n` +
      `Эти слоты теперь свободны для бронирования.`
    );

    await sendEmail(
      `⚠️ Watchdog: ${rows.length} зависших WA-блокировок удалено`,
      `<p style="font-family:sans-serif;color:#0B1A3F;">
        Watchdog обнаружил и автоматически удалил <strong>${rows.length}</strong> WA-блокировок,
        которые висели более ${STALE_BLOCK_MINS} минут без создания реальной брони:
      </p>
      ${emailTable(
        rows.map(r => [r.slot_date, r.slot_time, r.reason,
          new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" }) + " CT"]),
        ["Дата", "Время", "Причина", "Создана"]
      )}
      <p style="font-family:sans-serif;font-size:12px;color:#6b7280;margin-top:20px;">
        HTRGroupTX Watchdog · автоматическое сообщение
      </p>`
    );
  } catch (e) {
    log("error", "CHECK-1 failed", e);
  }
}

// ─── CHECK-2: Дублирующиеся активные слоты ───────────────────────────────────

async function checkDuplicateSlots() {
  log("info", "CHECK-2: scanning for duplicate active slots...");
  try {
    const { rows } = await pool.query<{
      preferred_date: string; preferred_time: string; cnt: string;
      ids: string; names: string;
    }>(`
      SELECT preferred_date, preferred_time,
             COUNT(*) AS cnt,
             STRING_AGG(id::text, '|') AS ids,
             STRING_AGG(name, ' / ') AS names
      FROM bookings
      WHERE status IN ('pending','approved')
      GROUP BY preferred_date, preferred_time
      HAVING COUNT(*) > 1
    `);

    if (rows.length === 0) {
      log("info", "CHECK-2: no duplicate slots ✓");
      return;
    }

    log("error", `CHECK-2: found ${rows.length} duplicate slot(s)!`);

    const details = rows.map(r =>
      `• ${r.preferred_date} ${r.preferred_time} — ${r.cnt} броней (${r.names})`
    ).join("\n");

    sendWA(
      `🚨 HTRGroupTX ВНИМАНИЕ!\n\n` +
      `Обнаружены дублирующиеся активные слоты (${rows.length}):\n${details}\n\n` +
      `Требуется ручная проверка на htrgrouptx.com/admin`
    );

    await sendEmail(
      `🚨 Watchdog КРИТИЧНО: дублирующиеся слоты (${rows.length})`,
      `<p style="font-family:sans-serif;color:#dc2626;font-weight:bold;">
        Обнаружено ${rows.length} слот(а) с несколькими активными бронями одновременно!
      </p>
      ${emailTable(
        rows.map(r => [r.preferred_date, r.preferred_time, r.cnt, r.names, r.ids.replace(/\|/g, "<br/>")]),
        ["Дата", "Время", "Кол-во броней", "Клиенты", "ID броней"]
      )}
      <p style="font-family:sans-serif;color:#0B1A3F;">
        Пожалуйста, зайдите на 
        <a href="https://htrgrouptx.com/admin">htrgrouptx.com/admin</a> 
        и вручную отмените лишние брони.
      </p>`
    );
  } catch (e) {
    log("error", "CHECK-2 failed", e);
  }
}

// ─── CHECK-3: Approved-брони без HubSpot ID → повторная синхронизация ────────

async function checkOrphanedHubSpot() {
  log("info", "CHECK-3: scanning approved bookings without HubSpot ID...");
  try {
    const { rows } = await pool.query<{
      id: string; name: string; phone: string; email: string;
      address: string; appliance: string; brand_model: string;
      preferred_date: string; preferred_time: string; message: string;
      created_at: Date;
    }>(`
      SELECT id, name, phone, email, address, appliance, brand_model,
             preferred_date, preferred_time, message, created_at
      FROM bookings
      WHERE status IN ('pending','approved')
        AND (hs_deal_id IS NULL OR hs_deal_id = '')
      ORDER BY created_at DESC
      LIMIT 20
    `);

    if (rows.length === 0) {
      log("info", "CHECK-3: all pending/approved bookings synced with HubSpot ✓");
      return;
    }

    log("warn", `CHECK-3: found ${rows.length} booking(s) (pending/approved) without HubSpot ID — retrying sync`);

    let synced = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const result = await syncBookingToHubSpot({
          id:            row.id,
          name:          row.name,
          phone:         row.phone,
          email:         row.email,
          address:       row.address,
          appliance:     row.appliance,
          brandModel:    row.brand_model,
          preferredDate: row.preferred_date,
          preferredTime: row.preferred_time,
          message:       row.message,
          source:        "website",
        });

        if (result.ok && result.dealId) {
          await pool.query(`UPDATE bookings SET hs_deal_id = $1 WHERE id = $2`, [result.dealId, row.id]);
          log("info", `CHECK-3: synced ${row.id} → HubSpot deal ${result.dealId}`);
          synced++;
        } else {
          log("warn", `CHECK-3: sync failed for ${row.id}: ${result.error}`);
          failed++;
        }
      } catch (e) {
        log("warn", `CHECK-3: exception for ${row.id}`, e);
        failed++;
      }
    }

    const summary = `Retry HubSpot sync: ✅ ${synced} успешно, ❌ ${failed} ошибок`;
    log("info", `CHECK-3: ${summary}`);

    if (synced > 0 || failed > 0) {
      sendWA(
        `ℹ️ HTRGroupTX Watchdog\n\n` +
        `Найдено ${rows.length} подтверждённых броней без HubSpot синхронизации.\n` +
        `${summary}`
      );
    }

    if (failed > 0) {
      await sendEmail(
        `⚠️ Watchdog: ${failed} брони не синхронизированы с HubSpot`,
        `<p style="font-family:sans-serif;color:#0B1A3F;">
          Watchdog попытался синхронизировать ${rows.length} approved-броней без HubSpot Deal ID.<br/>
          Результат: <strong style="color:green;">${synced} успешно</strong>,
          <strong style="color:red;">${failed} с ошибкой</strong>.
        </p>
        ${emailTable(
          rows.map(r => [r.name, r.preferred_date, r.preferred_time, r.id.slice(0, 8) + "..."]),
          ["Клиент", "Дата", "Время", "ID"]
        )}
        <p style="font-family:sans-serif;font-size:12px;color:#6b7280;margin-top:20px;">
          HTRGroupTX Watchdog · автоматическое сообщение
        </p>`
      );
    }
  } catch (e) {
    log("error", "CHECK-3 failed", e);
  }
}

// ─── CHECK-3b: HubSpot сделки удалены → отменить локальные брони ─────────────
// Запускается каждые 30 сек. Работает на сервере независимо от фронтенда.

async function checkHubSpotDeletions() {
  const token = process.env["HUBSPOT_TOKEN"];
  if (!token) return;

  try {
    log("info", "CHECK-3b: проверка удалённых/отменённых сделок HubSpot...");
    const { rows } = await pool.query<{
      id: string; hs_deal_id: string;
      name: string; phone: string; email: string; language: string;
      appliance: string; preferred_date: string; preferred_time: string;
    }>(
      `SELECT id, hs_deal_id, name, phone, email, language, appliance, preferred_date, preferred_time
       FROM bookings
       WHERE status IN ('pending','approved')
         AND hs_deal_id IS NOT NULL AND hs_deal_id <> ''`,
    );
    if (rows.length === 0) {
      log("info", "CHECK-3b: нет активных броней с HubSpot ID — пропускаем ✓");
      return;
    }

    log("info", `CHECK-3b: проверяем ${rows.length} активных бронь(и) в HubSpot...`);
    // Один батчевый запрос — получаем ID и dealstage всех сделок
    const hsRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals/batch/read", {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify({ inputs: rows.map(r => ({ id: r.hs_deal_id })), properties: ["dealstage"] }),
    });

    // Безопасно: если HubSpot вернул неожиданный статус — пропускаем
    if (hsRes.status !== 200 && hsRes.status !== 207) {
      log("warn", `CHECK-3b: HubSpot вернул ${hsRes.status} — пропускаем синхронизацию`);
      return;
    }

    const data = await hsRes.json() as { results?: Array<{ id: string; properties?: { dealstage?: string } }> };
    // Карта: deal_id → dealstage
    const dealStageMap = new Map<string, string>();
    for (const d of (data.results ?? [])) {
      dealStageMap.set(String(d.id), d.properties?.dealstage ?? "");
    }

    for (const row of rows) {
      const dealId   = String(row.hs_deal_id);
      const stage    = dealStageMap.get(dealId);
      const deleted  = stage === undefined;                       // deal не найден → удалён
      const lostDeal = stage === "closedlost";                    // deal закрыт как проигрыш

      if (!deleted && !lostDeal) continue;                        // deal активен — пропускаем

      const r = await pool.query(
        `UPDATE bookings SET status = 'cancelled'
         WHERE id = $1 AND status IN ('pending','approved')`,
        [row.id],
      );
      if ((r.rowCount ?? 0) > 0) {
        const reason = deleted ? "удалена в HubSpot" : "закрыта как closedlost в HubSpot";
        log("info", `CHECK-3b: бронь ${row.id} отменена (сделка ${dealId} — ${reason})`);

        const shortId  = row.id.slice(0, 8).toUpperCase();
        const dateTime = `${row.preferred_date} · ${row.preferred_time}`;
        const icon     = deleted ? "🗑️" : "📉";
        const title    = deleted ? "Сделка удалена в HubSpot" : "Сделка закрыта (closedlost) в HubSpot";

        // ── WhatsApp владельцу ────────────────────────────────────────────────
        void sendWA(
          `${icon} ЗАЯВКА ОТМЕНЕНА — ${shortId}\n` +
          `👤 ${row.name}\n` +
          `📞 ${row.phone}\n` +
          `🔧 ${row.appliance || "—"}\n` +
          `📅 ${dateTime}\n` +
          `ℹ️ ${title}`,
        );

        // ── Email владельцу ──────────────────────────────────────────────────
        void sendEmail(
          `${icon} Заявка отменена — ${shortId}`,
          `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:12px;">
            <div style="background:#0B1A3F;padding:20px 24px;border-radius:8px 8px 0 0;">
              <h2 style="color:#fff;margin:0;font-size:18px;">${icon} Заявка автоматически отменена</h2>
              <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">HTRGroupTX — ${title}</p>
            </div>
            <div style="background:#fff;padding:20px 24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;border-top:none;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:140px;">ID заявки</td><td style="padding:8px 0;font-size:13px;font-weight:600;">${shortId}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Клиент</td><td style="padding:8px 0;font-size:13px;">${row.name}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Телефон</td><td style="padding:8px 0;font-size:13px;">${row.phone}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Техника</td><td style="padding:8px 0;font-size:13px;">${row.appliance || "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Дата/время</td><td style="padding:8px 0;font-size:13px;">${dateTime}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">HubSpot Deal</td><td style="padding:8px 0;font-size:13px;">${dealId}</td></tr>
              </table>
              <div style="margin-top:16px;padding:12px 16px;background:#fef2f2;border-left:4px solid #ef4444;border-radius:4px;">
                <p style="margin:0;color:#991b1b;font-size:13px;">${title}. Бронь автоматически переведена в статус <strong>Отменена</strong>.</p>
              </div>
            </div>
          </div>`,
        );

        // ── Email клиенту ─────────────────────────────────────────────────────
        const clientEmail = (row.email ?? "").trim();
        if (clientEmail.includes("@")) {
          const isEs = (row.language ?? "en") === "es";
          void (async () => {
            try {
              const t = mailer();
              await t.sendMail({
                from:    `"Hi-Tech Repair Group" <${process.env["EMAIL_USER"]}>`,
                to:      clientEmail,
                subject: isEs
                  ? `Su cita ha sido cancelada — HTRGroupTX`
                  : `Your appointment has been cancelled — HTRGroupTX`,
                html: isEs
                  ? `<div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:24px;">
                      <h2 style="color:#dc2626;">Su cita ha sido cancelada</h2>
                      <p>Estimado/a <strong>${row.name}</strong>,</p>
                      <p>Su cita del <strong>${row.preferred_date}</strong> a las <strong>${row.preferred_time}</strong> para <strong>${row.appliance || "electrodoméstico"}</strong> ha sido cancelada.</p>
                      <p>Para reagendar, contáctenos:<br>📞 (346) 820-6021<br>📧 htrgroupllc@gmail.com</p>
                      <p style="color:#6b7280;font-size:12px;">HTRGroupTX — Houston, TX</p>
                    </div>`
                  : `<div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:24px;">
                      <h2 style="color:#dc2626;">Your appointment has been cancelled</h2>
                      <p>Dear <strong>${row.name}</strong>,</p>
                      <p>Your appointment on <strong>${row.preferred_date}</strong> at <strong>${row.preferred_time}</strong> for <strong>${row.appliance || "appliance repair"}</strong> has been cancelled.</p>
                      <p>To reschedule, please contact us:<br>📞 (346) 820-6021<br>📧 htrgroupllc@gmail.com</p>
                      <p style="color:#6b7280;font-size:12px;">HTRGroupTX — Houston, TX</p>
                    </div>`,
              });
              log("info", `CHECK-3b: email клиенту отправлен → ${clientEmail}`);
            } catch (e) {
              log("warn", "CHECK-3b: email клиенту не отправлен", e);
            }
          })();
        }
      }
    }
  } catch (e) {
    log("warn", "CHECK-3b: ошибка (не критично)", e);
  }
}

// ─── CHECK-5: HubSpot → DB обратная синхронизация ────────────────────────────
// Каждые 2 минуты: находит сделки в HubSpot которых нет в нашей базе данных.
// Создаёт брони для новых сделок. Так сделки, созданные прямо в HubSpot
// или через WA/сайт/администратора, всегда отображаются в панели администратора.

async function syncHubSpotDealsToDb() {
  const token = process.env["HUBSPOT_TOKEN"];
  if (!token) return;

  try {
    log("info", "CHECK-5: синхронизация сделок HubSpot → DB...");

    // Ищем сделки изменённые за последние 30 дней, исключая закрытые
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        filterGroups: [{
          filters: [
            { propertyName: "hs_lastmodifieddate", operator: "GTE",    value: String(since) },
            { propertyName: "dealstage",           operator: "NEQ",    value: "closedwon"   },
            { propertyName: "dealstage",           operator: "NEQ",    value: "closedlost"  },
          ],
        }],
        properties: ["dealname", "dealstage", "closedate", "description"],
        limit: 100,
      }),
    });

    if (!searchRes.ok) {
      log("warn", `CHECK-5: HubSpot search вернул ${searchRes.status} — пропускаем`);
      return;
    }

    const searchData = await searchRes.json() as {
      results?: Array<{
        id: string;
        properties: {
          dealname?:    string;
          dealstage?:   string;
          closedate?:   string;
          description?: string;
        };
      }>;
    };

    if (!searchData.results?.length) {
      log("info", "CHECK-5: нет активных сделок в HubSpot ✓");
      return;
    }

    // Получаем все hs_deal_id уже есть в нашей базе
    const { rows: existing } = await pool.query<{ hs_deal_id: string }>(
      `SELECT hs_deal_id FROM bookings WHERE hs_deal_id IS NOT NULL AND hs_deal_id <> ''`,
    );
    const existingIds = new Set(existing.map(r => String(r.hs_deal_id)));

    // Фильтруем только новые сделки
    const newDeals = searchData.results.filter(d => !existingIds.has(String(d.id)));
    if (!newDeals.length) {
      log("info", `CHECK-5: ${searchData.results.length} сделок — все уже в базе ✓`);
      return;
    }

    log("info", `CHECK-5: найдено ${newDeals.length} новых сделок — импортируем...`);

    for (const deal of newDeals) {
      try {
        let contactName  = "";
        let contactPhone = "";
        let contactEmail = "";

        // Получаем связанный контакт через associations API
        const assocRes = await fetch(
          `https://api.hubapi.com/crm/v3/objects/deals/${deal.id}/associations/contacts`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (assocRes.ok) {
          const assocData = await assocRes.json() as { results?: Array<{ id: string }> };
          const contactId = assocData.results?.[0]?.id;
          if (contactId) {
            const cRes = await fetch(
              `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,phone,email`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (cRes.ok) {
              const c = await cRes.json() as {
                properties: { firstname?: string; lastname?: string; phone?: string; email?: string };
              };
              contactName  = [c.properties.firstname, c.properties.lastname].filter(Boolean).join(" ").trim();
              contactPhone = c.properties.phone ?? "";
              contactEmail = c.properties.email ?? "";
            }
          }
        }

        // Парсим dealname по формату "Имя — Техника | Дата Время"
        const dealName = deal.properties.dealname ?? "";
        let parsedName      = contactName || dealName;
        let parsedAppliance = "Appliance Repair";
        let parsedDate      = "";
        let parsedTime      = "";

        const dashIdx = dealName.indexOf(" — ");
        const pipeIdx = dealName.indexOf(" | ");
        if (dashIdx !== -1) {
          if (!contactName) parsedName = dealName.slice(0, dashIdx).trim();
          if (pipeIdx !== -1) {
            parsedAppliance = dealName.slice(dashIdx + 3, pipeIdx).trim() || parsedAppliance;
            const dtPart    = dealName.slice(pipeIdx + 3).trim();
            const dtMatch   = dtPart.match(/^([A-Z][a-z]{2} \d{1,2}, \d{4})\s+(.+)$/);
            if (dtMatch) { parsedDate = dtMatch[1] ?? ""; parsedTime = dtMatch[2] ?? ""; }
            else           { parsedDate = dtPart; }
          } else {
            parsedAppliance = dealName.slice(dashIdx + 3).trim() || parsedAppliance;
          }
        }

        // Дата из closedate как запасной вариант
        if (!parsedDate && deal.properties.closedate) {
          const d = new Date(deal.properties.closedate);
          if (!isNaN(d.getTime())) {
            parsedDate = d.toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
            });
          }
        }

        // Статус: appointmentscheduled → approved, остальные → pending
        const stage  = deal.properties.dealstage ?? "";
        const status = stage === "appointmentscheduled" ? "approved" : "pending";

        // Вставляем только если ещё не существует (race-condition safe)
        const ins = await pool.query(
          `INSERT INTO bookings
             (id, approve_token, name, phone, email, appliance, preferred_date, preferred_time, status, hs_deal_id, language, created_at)
           SELECT gen_random_uuid(), gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8::text, 'en', NOW()
           WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE hs_deal_id = $8::text)`,
          [
            parsedName      || "HubSpot Client",
            contactPhone    || "—",
            contactEmail    || "",
            parsedAppliance,
            parsedDate      || "",
            parsedTime      || "",
            status,
            String(deal.id),
          ],
        );

        if ((ins.rowCount ?? 0) > 0) {
          log("info", `CHECK-5: ✅ импортирована сделка ${deal.id} — "${parsedName || dealName}" (${status})`);
        }
      } catch (e) {
        log("warn", `CHECK-5: ошибка импорта сделки ${deal.id}`, e);
      }
    }

    log("info", `CHECK-5: синхронизация завершена ✓`);
  } catch (e) {
    log("warn", "CHECK-5: ошибка (не критично)", e);
  }
}

// ─── CHECK-4: Итоговый отчёт о здоровье системы ──────────────────────────────

async function sendHealthReport() {
  log("info", "CHECK-4: generating health report...");
  try {
    const [statusRes, blockedRes, orphanRes, dupRes, staleRes] = await Promise.all([
      pool.query<{ status: string; cnt: string }>(`
        SELECT status, COUNT(*) AS cnt FROM bookings GROUP BY status ORDER BY cnt DESC
      `),
      pool.query<{ cnt: string }>(`SELECT COUNT(*) AS cnt FROM blocked_slots`),
      pool.query<{ cnt: string }>(`
        SELECT COUNT(*) AS cnt FROM bookings
        WHERE status IN ('pending','approved') AND (hs_deal_id IS NULL OR hs_deal_id='')
      `),
      pool.query<{ cnt: string }>(`
        SELECT COUNT(*) AS cnt FROM (
          SELECT preferred_date, preferred_time FROM bookings
          WHERE status IN ('pending','approved')
          GROUP BY preferred_date, preferred_time HAVING COUNT(*) > 1
        ) t
      `),
      pool.query<{ cnt: string }>(`
        SELECT COUNT(*) AS cnt FROM blocked_slots
        WHERE created_at < NOW() - INTERVAL '${STALE_BLOCK_MINS} minutes'
      `),
    ]);

    const statusMap: Record<string, number> = {};
    for (const r of statusRes.rows) statusMap[r.status] = parseInt(r.cnt);

    const pending   = statusMap["pending"]   ?? 0;
    const approved  = statusMap["approved"]  ?? 0;
    const cancelled = statusMap["cancelled"] ?? 0;
    const completed = statusMap["completed"] ?? 0;
    const blocked   = parseInt(blockedRes.rows[0]?.cnt ?? "0");
    const orphan    = parseInt(orphanRes.rows[0]?.cnt  ?? "0");
    const dups      = parseInt(dupRes.rows[0]?.cnt     ?? "0");
    const stale     = parseInt(staleRes.rows[0]?.cnt   ?? "0");

    const healthy = orphan === 0 && dups === 0 && stale === 0;
    const icon    = healthy ? "✅" : "⚠️";

    const nowCT = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "medium", timeStyle: "short",
    });

    const waMsg =
      `${icon} HTRGroupTX Отчёт о системе\n` +
      `📅 ${nowCT} CT\n\n` +
      `📊 Состояние броней:\n` +
      `• Ожидают подтверждения: ${pending}\n` +
      `• Подтверждены (active): ${approved}\n` +
      `• Завершены: ${completed}\n` +
      `• Отменены: ${cancelled}\n\n` +
      `🔒 Заблокированных слотов: ${blocked}\n\n` +
      `🔍 Проблемы:\n` +
      `• Без HubSpot ID: ${orphan}\n` +
      `• Дублирующиеся слоты: ${dups}\n` +
      `• Зависших WA-блоков: ${stale}\n\n` +
      (healthy
        ? `Всё в порядке 👍`
        : `⚠️ Требуется проверка на htrgrouptx.com/admin`);

    sendWA(waMsg);

    const rowStyle = "padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:14px;font-family:sans-serif;";
    const labelStyle = `${rowStyle}color:#6b7280;`;
    const valStyle   = `${rowStyle}font-weight:600;color:#0B1A3F;`;

    const issueRows: [string, number, string][] = [
      ["Без HubSpot Deal ID",  orphan, orphan > 0 ? "#fef3c7" : ""],
      ["Дублирующиеся слоты",  dups,   dups   > 0 ? "#fee2e2" : ""],
      ["Зависших WA-блоков",   stale,  stale  > 0 ? "#fef3c7" : ""],
    ];

    const issueHtml = issueRows.map(([label, val, bg]) =>
      `<tr style="background:${bg || "#fff"};">
        <td style="${labelStyle}">${label}</td>
        <td style="${valStyle}">${val}</td>
      </tr>`
    ).join("");

    await sendEmail(
      `${icon} Watchdog Отчёт · ${nowCT} CT`,
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0B1A3F;border-bottom:3px solid #1B6FE8;padding-bottom:8px;">
          ${icon} HTRGroupTX — Отчёт о состоянии системы
        </h2>
        <p style="color:#6b7280;font-size:13px;">${nowCT} CT</p>

        <h3 style="color:#0B1A3F;">📊 Брони</h3>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td style="${labelStyle}">Ожидают подтверждения</td><td style="${valStyle}">${pending}</td></tr>
          <tr><td style="${labelStyle}">Активные (approved)</td><td style="${valStyle}">${approved}</td></tr>
          <tr><td style="${labelStyle}">Завершённые</td><td style="${valStyle}">${completed}</td></tr>
          <tr><td style="${labelStyle}">Отменённые</td><td style="${valStyle}">${cancelled}</td></tr>
          <tr><td style="${labelStyle}">Заблокированных слотов</td><td style="${valStyle}">${blocked}</td></tr>
        </table>

        <h3 style="color:#0B1A3F;margin-top:24px;">🔍 Проверки синхронности</h3>
        <table style="border-collapse:collapse;width:100%;">${issueHtml}</table>

        ${!healthy ? `
        <p style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;margin-top:20px;color:#92400e;">
          ⚠️ Обнаружены проблемы. Проверьте 
          <a href="https://htrgrouptx.com/admin" style="color:#1B6FE8;">панель администратора</a>.
        </p>` : `
        <p style="background:#ecfdf5;border-left:4px solid #10b981;padding:12px 16px;margin-top:20px;color:#065f46;">
          ✅ Все системы работают нормально.
        </p>`}

        <p style="font-size:11px;color:#9ca3af;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px;">
          HTRGroupTX Watchdog · ежедневный отчёт в 00:00 (полночь CT)
        </p>
      </div>`
    );

    log("info", `CHECK-4: health report sent (healthy=${healthy})`);
  } catch (e) {
    log("error", "CHECK-4 failed", e);
  }
}

// ─── Admin PIN middleware (scrypt, same as booking.ts) ───────────────────────

async function verifyPin(provided: string, stored: string): Promise<boolean> {
  if (!stored.includes(":")) {
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(stored));
  }
  const [salt, hash] = stored.split(":");
  return new Promise(resolve => {
    crypto.scrypt(provided, salt!, 64, (err, key) => {
      if (err) { resolve(false); return; }
      try { resolve(crypto.timingSafeEqual(Buffer.from(hash!, "hex"), key)); }
      catch { resolve(false); }
    });
  });
}

function requireAdminPin(req: Request, res: Response, next: NextFunction) {
  // Accept Bearer token (biometric / session auth) as alternative to PIN
  const bearer = (req.headers["authorization"] as string | undefined)?.replace("Bearer ", "");
  if (bearer && verifyAdminToken(bearer)) { next(); return; }

  const adminPin = process.env["ADMIN_PIN"] ?? "";
  if (!adminPin) { next(); return; }
  const rawPin =
    (req.headers["x-admin-pin"] as string | undefined) ??
    (req.query["pin"] as string | undefined) ?? "";
  const pin = (() => { try { return decodeURIComponent(rawPin); } catch { return rawPin; } })();
  verifyPin(pin, adminPin)
    .then(ok => { ok ? next() : res.status(401).json({ error: "Unauthorized" }); })
    .catch(() => res.status(401).json({ error: "Unauthorized" }));
}

// ─── Запуск службы ───────────────────────────────────────────────────────────

// ─── CHECK-4 scheduler: fires exactly at 00:00 (midnight) America/Chicago ────
function msUntilMidnight(): number {
  const now = new Date();
  // Parse current CT time (en-US locale gives MM/DD/YYYY, HH:MM:SS)
  const ctStr = now.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit",  minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const m = ctStr.match(/(\d+)\/(\d+)\/(\d+)[,\s]+(\d+):(\d+):(\d+)/);
  if (!m) return 60_000; // fallback — try again in 1 min
  const [, , , , h, min, s] = m.map(Number);
  const secsNow = h * 3600 + min * 60 + s;
  // midnight = 86400 - secsNow (always positive: distance to next 00:00)
  const diff    = 86400 - secsNow;
  return diff * 1000;
}

// ─── CHECK-6: Self-ping — keeps the server awake ─────────────────────────────
async function selfPing() {
  const base = (process.env["PUBLIC_BASE_URL"] ?? "").replace(/\/$/, "");
  if (!base) return;
  try {
    const r = await fetch(`${base}/healthz`, { signal: AbortSignal.timeout(10_000) });
    log("info", `CHECK-6: self-ping → ${r.status} ✓`);
  } catch (e) {
    log("warn", `CHECK-6: self-ping failed — ${String(e)}`);
  }
}

export function startWatchdog() {
  log("info", `Watchdog starting — stale_threshold=${STALE_BLOCK_MINS}min`);

  const BOOT_DELAY = 60_000;

  setTimeout(() => {
    void checkStaleWABlocks();
    setInterval(() => void checkStaleWABlocks(), CHECK1_INTERVAL_MS);

    void checkDuplicateSlots();
    setInterval(() => void checkDuplicateSlots(), CHECK2_INTERVAL_MS);

    void checkOrphanedHubSpot();
    setInterval(() => void checkOrphanedHubSpot(), CHECK3_INTERVAL_MS);

    void checkHubSpotDeletions();
    setInterval(() => void checkHubSpotDeletions(), CHECK3B_INTERVAL_MS);

    // CHECK-5 стартует с небольшой задержкой чтобы не перегружать при запуске
    setTimeout(() => {
      void syncHubSpotDealsToDb();
      setInterval(() => void syncHubSpotDealsToDb(), CHECK5_INTERVAL_MS);
    }, 5_000);

    // CHECK-4: once per day at exactly 00:00 CT midnight (recursive setTimeout — no drift)
    const scheduleMidnightReport = () => {
      const ms = msUntilMidnight();
      const mins = Math.round(ms / 60_000);
      log("info", `CHECK-4: следующий отчёт через ${mins} мин (в 00:00 / полночь CT)`);
      void CHECK4_DAILY_NOON_CT; // reference constant to avoid unused-var warning
      setTimeout(() => {
        void sendHealthReport();
        scheduleMidnightReport(); // plan next midnight
      }, ms);
    };
    scheduleMidnightReport();

    // CHECK-6: самопинг — сервер не засыпает
    void selfPing();
    setInterval(() => void selfPing(), CHECK6_INTERVAL_MS);

    log("info", "Watchdog fully active ✓");
  }, BOOT_DELAY);
}

// ─── Admin endpoints ─────────────────────────────────────────────────────────

export const watchdogRouter = Router();

watchdogRouter.post("/admin/watchdog/run", requireAdminPin, (_req, res) => {
  log("info", "Manual watchdog run triggered by admin");
  void Promise.all([
    checkStaleWABlocks(),
    checkDuplicateSlots(),
    checkOrphanedHubSpot(),
  ]).then(() => log("info", "Manual watchdog run complete"));
  res.json({ ok: true, message: "Watchdog checks triggered — results sent via WA/email" });
});

watchdogRouter.get("/admin/watchdog/report", requireAdminPin, (_req, res) => {
  log("info", "Manual health report triggered by admin");
  void sendHealthReport();
  res.json({ ok: true, message: "Health report triggered — check WA and email" });
});

// ─── GET /api/admin/twilio-numbers — List available Twilio phone numbers ────
watchdogRouter.get("/admin/twilio-numbers", requireAdminPin, async (_req, res) => {
  const sid   = process.env["TWILIO_ACCOUNT_SID"];
  const token = process.env["TWILIO_AUTH_TOKEN"];
  if (!sid || !token) {
    res.status(503).json({ error: "Twilio credentials not configured" });
    return;
  }
  try {
    const client = twilio(sid, token);
    const numbers = await client.incomingPhoneNumbers.list({ limit: 20 });
    res.json({ ok: true, numbers: numbers.map(n => ({ phoneNumber: n.phoneNumber, friendlyName: n.friendlyName, capabilities: n.capabilities })) });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// ─── DELETE /api/admin/hs-deal/:id — Archive a HubSpot deal by deal ID ───────
watchdogRouter.delete("/admin/hs-deal/:dealId", requireAdminPin, async (req, res) => {
  const { dealId } = req.params;
  if (!dealId || !/^\d+$/.test(dealId)) {
    res.status(400).json({ error: "Invalid deal ID — must be numeric HubSpot deal ID" });
    return;
  }

  const apiKey = process.env["HUBSPOT_TOKEN"];
  if (!apiKey) {
    res.status(503).json({ error: "HUBSPOT_TOKEN not configured" });
    return;
  }

  log("info", `Admin archiving HubSpot deal ${dealId}`);
  try {
    const r = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (r.status === 204) {
      log("info", `HubSpot deal ${dealId} archived successfully`);
      res.json({ ok: true, dealId, archived: true });
    } else {
      const body = await r.text();
      log("warn", `HubSpot deal ${dealId} archive failed: ${r.status} ${body}`);
      res.status(r.status).json({ ok: false, dealId, error: body });
    }
  } catch (e) {
    log("error", `HubSpot deal ${dealId} archive exception`, e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});
