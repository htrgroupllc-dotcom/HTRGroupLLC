import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });

export const HOUR_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

export const MORE_PREFIX = "__MORE__";

export function parseSlot(slot: string): { display: string; date: string; time: string } {
  const sep = slot.lastIndexOf(" — ");
  const datePart = sep >= 0 ? slot.slice(0, sep) : slot;
  const timePart = sep >= 0 ? slot.slice(sep + 3) : "";
  return { display: slot, date: datePart.replace(/^\w+,\s*/, ""), time: timePart };
}

export function shortDateLabel(fullDate: string): string {
  const parts = fullDate.replace(/,/g, "").split(/\s+/);
  return `${parts[0] ?? ""} ${parts[1] ?? ""} ${parts[2] ?? ""}`.trim();
}

export function getNext7Days(): Array<{ dayName: string; datePart: string; fullDate: string }> {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days: Array<{ dayName: string; datePart: string; fullDate: string }> = [];
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  for (let d = 1; d <= 14 && days.length < 7; d++) {
    const dt = new Date(now);
    dt.setDate(now.getDate() + d);
    if (dt.getDay() === 0 || dt.getDay() === 6) continue;
    const datePart = `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
    days.push({ dayName: DAYS[dt.getDay()]!, datePart, fullDate: `${DAYS[dt.getDay()]}, ${datePart}` });
  }
  return days;
}

async function dateHasSlot(datePart: string): Promise<boolean> {
  for (const time of HOUR_SLOTS) {
    const { rows } = await pool.query(
      `SELECT 1 FROM bookings WHERE preferred_date=$1 AND preferred_time=$2 AND status IN ('pending','approved')
       UNION ALL SELECT 1 FROM blocked_slots WHERE slot_date=$1 AND slot_time=$2 LIMIT 1`,
      [datePart, time],
    );
    if (!rows.length) return true;
  }
  return false;
}

export async function getAvailableDates(skip = 0): Promise<{ dates: string[]; hasMore: boolean }> {
  const available: string[] = [];
  for (const { datePart, fullDate } of getNext7Days()) {
    if (await dateHasSlot(datePart)) available.push(fullDate);
  }
  const page = available.slice(skip, skip + 5);
  const hasMore = available.length > skip + 5;
  if (hasMore) {
    const next = available[skip + 5];
    return { dates: [...page, `${MORE_PREFIX}:${next ? shortDateLabel(next) : ""}`], hasMore };
  }
  return { dates: page, hasMore };
}

export async function getTimesForDate(datePart: string, skip = 0): Promise<{ times: string[]; hasMore: boolean }> {
  const available: string[] = [];
  for (const time of HOUR_SLOTS) {
    const { rows } = await pool.query(
      `SELECT 1 FROM bookings WHERE preferred_date=$1 AND preferred_time=$2 AND status IN ('pending','approved')
       UNION ALL SELECT 1 FROM blocked_slots WHERE slot_date=$1 AND slot_time=$2 LIMIT 1`,
      [datePart, time],
    );
    if (!rows.length) available.push(time);
  }
  const page = available.slice(skip, skip + 5);
  const hasMore = available.length > skip + 5;
  if (hasMore) {
    return { times: [...page, `${MORE_PREFIX}:${available[skip + 5] ?? ""}`], hasMore };
  }
  return { times: page, hasMore };
}

export async function blockSlotHour(date: string, time: string, reason: string): Promise<void> {
  await pool.query(
    `INSERT INTO blocked_slots (slot_date, slot_time, reason) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
    [date, time, reason],
  ).catch(() => {});
}
