export const CALENDAR_TZ = "America/Chicago";
export const SLOT_START_HOUR = 9;
export const SLOT_END_HOUR = 17;
export const SLOT_STEP_MINS = 30;
export const DEFAULT_DURATION_MINS = 90;

export type CalendarView = "week" | "month" | "year";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function houstonNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: CALENDAR_TZ }));
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const dow = x.getDay();
  return addDays(x, -dow);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function formatMonthYear(d: Date, locale = "en-US"): string {
  return d.toLocaleDateString(locale, { month: "long", year: "numeric", timeZone: CALENDAR_TZ });
}

export function formatYear(d: Date): string {
  return String(d.getFullYear());
}

export function formatWeekRange(weekStart: Date, locale = "en-US"): string {
  const end = addDays(weekStart, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", timeZone: CALENDAR_TZ };
  const yOpts: Intl.DateTimeFormatOptions = { year: "numeric", timeZone: CALENDAR_TZ };
  const s = weekStart.toLocaleDateString(locale, opts);
  const e = end.toLocaleDateString(locale, { ...opts, year: weekStart.getFullYear() !== end.getFullYear() ? "numeric" : undefined });
  const y = weekStart.toLocaleDateString(locale, yOpts);
  return `${s} – ${e}, ${y}`;
}

export function formatDayHeader(d: Date, locale = "en-US"): string {
  return d.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric", timeZone: CALENDAR_TZ });
}

export function formatTime(iso: string, locale = "en-US"): string {
  return new Date(iso).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true, timeZone: CALENDAR_TZ });
}

export function isoRangeForView(view: CalendarView, anchor: Date): { from: string; to: string } {
  if (view === "week") {
    const from = startOfWeek(anchor);
    const to = addDays(from, 7);
    return { from: from.toISOString(), to: to.toISOString() };
  }
  if (view === "month") {
    const from = startOfMonth(anchor);
    const to = addMonths(from, 1);
    return { from: from.toISOString(), to: to.toISOString() };
  }
  const from = startOfYear(anchor);
  const to = new Date(anchor.getFullYear() + 1, 0, 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function slotIndexFromIso(iso: string): number {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CALENDAR_TZ, hour: "numeric", minute: "numeric", hour12: false,
  }).formatToParts(d);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return ((h - SLOT_START_HOUR) * 60 + m) / SLOT_STEP_MINS;
}

export function dayIndexInWeek(iso: string, weekStart: Date): number {
  const d = new Date(iso);
  const day = new Date(d.toLocaleString("en-US", { timeZone: CALENDAR_TZ }));
  const ws = new Date(weekStart.toLocaleString("en-US", { timeZone: CALENDAR_TZ }));
  day.setHours(12, 0, 0, 0);
  ws.setHours(12, 0, 0, 0);
  return Math.round((day.getTime() - ws.getTime()) / 86_400_000);
}

export function isoFromWeekSlot(weekStart: Date, dayIdx: number, slotIdx: number): string {
  const d = addDays(weekStart, dayIdx);
  const totalMins = SLOT_START_HOUR * 60 + slotIdx * SLOT_STEP_MINS;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const utcGuess = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), h, m));
  const utcStr = utcGuess.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = utcGuess.toLocaleString("en-US", { timeZone: CALENDAR_TZ });
  const offset = new Date(tzStr).getTime() - new Date(utcStr).getTime();
  return new Date(utcGuess.getTime() - offset).toISOString();
}

export function eventColor(status: string, isOverdue: boolean): string {
  if (status === "completed") return "#16a34a";
  if (status === "cancelled") return "#9ca3af";
  if (isOverdue) return "#ea580c";
  if (status === "approved") return "#2563eb";
  return "#d97706";
}

export { MONTHS_SHORT, MONTHS_LONG, WEEKDAYS_SHORT };

export function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = startOfWeek(first);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i));
  return cells;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
