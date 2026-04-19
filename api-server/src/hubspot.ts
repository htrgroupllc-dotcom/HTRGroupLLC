/**
 * HubSpot CRM sync — called on every new booking from any source.
 *
 * For each booking we:
 *  1. Find or create a Contact (matched by email)
 *  2. Create a Deal (service visit) and associate it with the contact
 *  3. Create a Task on the Deal (service reminder)
 *  4. Attach a Note with full booking details
 *
 * All errors are non-fatal: caller receives { ok, error? }.
 */

export interface HsBooking {
  id?:           string;
  name:          string;
  phone:         string;
  email:         string;
  address:       string;
  appliance:     string;
  brandModel?:   string;
  preferredDate: string;
  preferredTime: string;
  message?:      string;
  source:        "website" | "whatsapp" | "admin";
}

export interface HsResult {
  ok:         boolean;
  contactId?: string;
  dealId?:    string;
  error?:     string;
}

type Logger = {
  info:  (obj: object, msg?: string) => void;
  error: (obj: object, msg?: string) => void;
  warn:  (obj: object, msg?: string) => void;
};

const silentLog: Logger = {
  info:  () => {},
  error: (obj, msg) => console.error("[HS]", msg, obj),
  warn:  (obj, msg) => console.warn("[HS]", msg, obj),
};

// Basic email validation — HubSpot rejects anything that isn't a real address
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// Parse "Apr 15, 2026" → UTC midnight ISO string for HubSpot closedate
function parseDateIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr + " 00:00:00 GMT-0500"); // Houston CT offset
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Build deal name e.g. "Maria Lopez — Washer Repair | Apr 15, 2026 1 PM–5 PM"
function buildDealName(b: HsBooking): string {
  const what = b.appliance || b.message?.slice(0, 40) || "Appliance Repair";
  const slot  = [b.preferredDate, b.preferredTime].filter(Boolean).join(" ");
  return `${b.name} — ${what}${slot ? ` | ${slot}` : ""}`;
}

// Format booking details as a plain-text note body
function buildNoteBody(b: HsBooking): string {
  return [
    `Source: ${b.source}`,
    b.id           ? `Booking ID: ${b.id}`                        : "",
    `Name: ${b.name}`,
    `Phone: ${b.phone}`,
    `Email: ${b.email}`,
    b.address      ? `Address: ${b.address}`                      : "",
    b.appliance    ? `Appliance: ${b.appliance}`                   : "",
    b.brandModel   ? `Brand/Model: ${b.brandModel}`               : "",
    b.preferredDate ? `Date: ${b.preferredDate}`                   : "",
    b.preferredTime ? `Time: ${b.preferredTime}`                   : "",
    b.message      ? `Notes: ${b.message}`                        : "",
  ].filter(Boolean).join("\n");
}

export async function syncBookingToHubSpot(
  booking: HsBooking,
  log: Logger = silentLog,
): Promise<HsResult> {
  const token = process.env["HUBSPOT_TOKEN"];
  if (!token) return { ok: false, error: "HUBSPOT_TOKEN not set" };

  const headers: Record<string, string> = {
    Authorization:  `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Only use the email if it passes basic validation — HubSpot rejects invalid ones
  const validEmail = booking.email && isValidEmail(booking.email) ? booking.email.trim() : "";

  try {
    /* ── 1. Find or create Contact ────────────────────────────────────────── */
    const nameParts = booking.name.trim().split(" ");
    const firstname = nameParts[0] ?? "";
    const lastname  = nameParts.slice(1).join(" ");

    const contactProps: Record<string, string> = {
      firstname,
      lastname,
      phone:   booking.phone,
      address: booking.address,
    };
    if (validEmail) contactProps["email"] = validEmail;

    let contactId: string;

    // Helper: create contact without email (used as fallback when email is invalid)
    const createContactNoEmail = async (): Promise<string> => {
      const propsNoEmail = { ...contactProps };
      delete propsNoEmail["email"];
      const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST", headers,
        body: JSON.stringify({ properties: propsNoEmail }),
      });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(`Contact create (no email) failed ${r.status}: ${err}`);
      }
      const d = await r.json() as { id: string };
      log.info({ contactId: d.id }, "HubSpot contact created (no email)");
      return d.id;
    };

    if (validEmail) {
      // Try to find existing contact by email
      const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST", headers,
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: validEmail }] }],
          properties: ["id", "email"], limit: 1,
        }),
      });
      const searchData = await searchRes.json() as { results?: Array<{ id: string }> };

      if (searchData.results?.length) {
        contactId = searchData.results[0].id;
        await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: "PATCH", headers,
          body: JSON.stringify({ properties: contactProps }),
        });
        log.info({ contactId }, "HubSpot contact updated");
      } else {
        const createRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
          method: "POST", headers,
          body: JSON.stringify({ properties: contactProps }),
        });
        if (!createRes.ok) {
          const errText = await createRes.text();
          // HubSpot rejects emails it deems invalid — fall back to creating without email
          if (errText.includes("INVALID_EMAIL")) {
            log.warn({ email: validEmail }, "HubSpot: INVALID_EMAIL — retrying without email");
            contactId = await createContactNoEmail();
          } else {
            throw new Error(`Contact create failed ${createRes.status}: ${errText}`);
          }
        } else {
          const created = await createRes.json() as { id: string };
          contactId = created.id;
          log.info({ contactId }, "HubSpot contact created");
        }
      }
    } else {
      contactId = await createContactNoEmail();
    }

    /* ── 2. Create Deal (service visit) ───────────────────────────────────── */
    const dealName    = buildDealName(booking);
    const closeDate   = parseDateIso(booking.preferredDate);

    const dealRes = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
      method: "POST", headers,
      body: JSON.stringify({
        properties: {
          dealname:   dealName,
          dealstage:  "appointmentscheduled",
          pipeline:   "default",
          closedate:  closeDate,
          description: buildNoteBody(booking),
        },
        associations: [{
          to:    { id: contactId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
        }],
      }),
    });

    if (!dealRes.ok) {
      const errText = await dealRes.text();
      log.warn({ errText }, "HubSpot deal create failed — continuing without deal");
    }

    let dealId: string | undefined;
    if (dealRes.ok) {
      const dealData = await dealRes.json() as { id: string };
      dealId = dealData.id;
      log.info({ dealId, dealName }, "HubSpot deal created");
    }

    /* ── 3. Note on Contact (and Deal if created) ────────────────────────── */
    // Notes use crm.objects.contacts.write scope — no extra scope needed
    const noteBody = buildNoteBody(booking);
    const noteAssociations: object[] = [
      {
        to:    { id: contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
      },
    ];
    if (dealId) {
      noteAssociations.push({
        to:    { id: dealId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 }],
      });
    }
    const noteRes = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
      method: "POST", headers,
      body: JSON.stringify({
        properties: {
          hs_timestamp: new Date().toISOString(),
          hs_note_body: noteBody,
        },
        associations: noteAssociations,
      }),
    });
    if (noteRes.ok) log.info({ contactId }, "HubSpot note created");
    else            log.warn({ status: noteRes.status }, "HubSpot note failed (non-critical, may need crm.objects.notes scope)");

    return { ok: true, contactId, dealId };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err }, `HubSpot sync failed: ${msg}`);
    return { ok: false, error: msg };
  }
}

/**
 * Update an existing HubSpot deal's stage (e.g. "appointmentscheduled" → "closedwon").
 * Called when a pending booking is approved and it already has a deal from creation-time sync.
 */
export async function updateDealStageInHubSpot(
  hsDealId: string,
  stage: string,
  log: Logger = silentLog,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env["HUBSPOT_TOKEN"];
  if (!token)    return { ok: false, error: "HUBSPOT_TOKEN not set" };
  if (!hsDealId) return { ok: false, error: "No HS deal ID" };

  const headers: Record<string, string> = {
    Authorization:  `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${hsDealId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ properties: { dealstage: stage } }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Deal stage update failed ${res.status}: ${errText}`);
    }
    log.info({ hsDealId, stage }, "HubSpot deal stage updated");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err }, `HubSpot deal stage update failed: ${msg}`);
    return { ok: false, error: msg };
  }
}

/**
 * Update deal name, close date and description when a booking is rescheduled.
 */
export async function updateDealDateInHubSpot(
  hsDealId: string,
  booking: HsBooking,
  log: Logger = silentLog,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env["HUBSPOT_TOKEN"];
  if (!token)    return { ok: false, error: "HUBSPOT_TOKEN not set" };
  if (!hsDealId) return { ok: false, error: "No HS deal ID" };

  const headers: Record<string, string> = {
    Authorization:  `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${hsDealId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        properties: {
          dealname:    buildDealName(booking),
          closedate:   parseDateIso(booking.preferredDate),
          description: buildNoteBody(booking),
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Deal update failed ${res.status}: ${errText}`);
    }
    log.info({ hsDealId }, "HubSpot deal date/name updated on reschedule");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err }, `HubSpot deal reschedule update failed: ${msg}`);
    return { ok: false, error: msg };
  }
}

/**
 * Permanently delete a HubSpot deal when a booking is cancelled.
 * Step 1: Archive via DELETE (soft-delete, required before purge).
 * Step 2: Purge via batch/purge (permanent delete — deal vanishes from HubSpot UI immediately).
 */
export async function cancelDealInHubSpot(
  hsDealId: string,
  log: Logger = silentLog,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env["HUBSPOT_TOKEN"];
  if (!token)    return { ok: false, error: "HUBSPOT_TOKEN not set" };
  if (!hsDealId) return { ok: false, error: "No HS deal ID" };

  const headers: Record<string, string> = {
    Authorization:  `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    // Step 1: Archive (soft-delete) — required before purge.
    // 204 = archived OK; 404 = already archived. Both acceptable.
    const archiveRes = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${hsDealId}`, {
      method: "DELETE",
      headers,
    });
    if (!archiveRes.ok && archiveRes.status !== 404) {
      const errText = await archiveRes.text();
      throw new Error(`Deal archive failed ${archiveRes.status}: ${errText}`);
    }
    log.info({ hsDealId }, "HubSpot deal archived (step 1/2)");

    // Step 2: Permanently purge — removes from HubSpot UI immediately.
    const purgeRes = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/batch/purge`, {
      method: "POST",
      headers,
      body: JSON.stringify({ inputs: [{ id: hsDealId }] }),
    });
    if (purgeRes.ok || purgeRes.status === 204) {
      log.info({ hsDealId }, "HubSpot deal permanently deleted (purged)");
    } else {
      // Purge may fail on free HubSpot — archive alone still removes from views
      const purgeErr = await purgeRes.text();
      log.warn({ hsDealId, status: purgeRes.status, purgeErr }, "HubSpot purge failed (archived only — non-fatal)");
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ err }, `HubSpot deal delete failed: ${msg}`);
    return { ok: false, error: msg };
  }
}
