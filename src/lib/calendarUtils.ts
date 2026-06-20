export const CALENDAR_TZ = "America/Chicago";
export const SLOT_START_HOUR = 9;
export const SLOT_END_HOUR = 17;
export const SLOT_STEP_MINS = 30;
export const DEFAULT_DURATION_MINS = 90;

export type CalendarView = "week" | "month" | "year";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES_BY_LANG: Record<string, string[]> = {
  az: ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
  tr: ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"],
  uk: ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"],
  ru: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
};

function localeRoot(locale: string): string {
  return locale.split("-")[0]?.toLowerCase() ?? "en";
}

function isBadMonthToken(s: string): boolean {
  const t = s.trim();
  return /^M?\d{1,2}$/i.test(t);
}

export function monthLongName(d: Date, locale = "en-US"): string {
  const mi = d.getMonth();
  const table = MONTH_NAMES_BY_LANG[localeRoot(locale)];
  if (table?.[mi]) return table[mi];
  try {
    const name = new Intl.DateTimeFormat(locale, { month: "long", timeZone: CALENDAR_TZ }).format(d);
    if (!isBadMonthToken(name)) return name;
  } catch { /* fall through */ }
  return MONTHS_LONG[mi] ?? "";
}

export function monthShortName(d: Date, locale = "en-US"): string {
  const long = monthLongName(d, locale);
  if (long.length <= 4) return long;
  return long.slice(0, 3);
}

export function weekdayShortLabels(locale = "en-US"): string[] {
  const ws = startOfWeek(houstonNow());
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(ws, i);
    try {
      return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: CALENDAR_TZ }).format(d);
    } catch {
      return WEEKDAYS_SHORT[i] ?? "?";
    }
  });
}

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
  const year = new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: CALENDAR_TZ }).format(d);
  return `${monthLongName(d, locale)} ${year}`;
}

export function formatYear(d: Date): string {
  return String(d.getFullYear());
}

function formatWeekDayPart(d: Date, locale: string, withYear: boolean): string {
  const day = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: CALENDAR_TZ }).format(d);
  const month = monthShortName(d, locale);
  if (withYear) {
    const year = new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: CALENDAR_TZ }).format(d);
    return `${day} ${month} ${year}`;
  }
  return `${day} ${month}`;
}

export function formatWeekRange(weekStart: Date, locale = "en-US"): string {
  const end = addDays(weekStart, 6);
  const crossYear = weekStart.getFullYear() !== end.getFullYear();
  const y = new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: CALENDAR_TZ }).format(weekStart);
  return `${formatWeekDayPart(weekStart, locale, crossYear)} – ${formatWeekDayPart(end, locale, true)}, ${y}`;
}

export function formatDayHeader(d: Date, locale = "en-US"): string {
  const day = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: CALENDAR_TZ }).format(d);
  const wd = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: CALENDAR_TZ }).format(d);
  return `${day} ${monthLongName(d, locale)}, ${wd}`;
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

export function isToday(day: Date, now = houstonNow()): boolean {
  return isSameDay(day, now);
}

/** Calendar day strictly before today (Houston). Past days remain selectable for history view. */
export function isPastDay(day: Date, now = houstonNow()): boolean {
  return startOfDay(day).getTime() < startOfDay(now).getTime();
}

/** Booking API date format, e.g. "Apr 15, 2026" (Houston). */
export function formatBookingDate(day: Date): string {
  const houstonStr = day.toLocaleString("en-US", { timeZone: CALENDAR_TZ });
  const d = new Date(houstonStr);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function isoFromDaySlot(day: Date, slotIdx: number): string {
  const d = startOfDay(day);
  const totalMins = SLOT_START_HOUR * 60 + slotIdx * SLOT_STEP_MINS;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const utcGuess = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), h, m));
  const utcStr = utcGuess.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = utcGuess.toLocaleString("en-US", { timeZone: CALENDAR_TZ });
  const offset = new Date(tzStr).getTime() - new Date(utcStr).getTime();
  return new Date(utcGuess.getTime() - offset).toISOString();
}
