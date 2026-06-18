export const BOOKING_TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

export function getHoustonNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
}

/** Earliest bookable calendar day: today, or tomorrow if Houston time is after 17:00. */
export function getMinBookingDate(): Date {
  const houston = getHoustonNow();
  const min = new Date(houston);
  if (houston.getHours() >= 17) min.setDate(min.getDate() + 1);
  min.setHours(0, 0, 0, 0);
  return min;
}

export function skipToNextBusinessDay(d: Date): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isDayFullyBooked(
  taken: string[],
  slots: readonly string[] = BOOKING_TIME_SLOTS,
): boolean {
  if (taken.length === 0) return false;
  const takenSet = new Set(taken);
  return slots.every(s => takenSet.has(s));
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatBookingDateStr(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function isBookingDateToday(dateStr: string): boolean {
  return dateStr === formatBookingDateStr(getHoustonNow());
}

export function slotToMinutes(time: string): number {
  const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(time.trim());
  if (!m) return 0;
  let h = parseInt(m[1]!, 10);
  const min = parseInt(m[2]!, 10);
  const isPM = m[3]!.toUpperCase() === "PM";
  if (isPM && h !== 12) h += 12;
  if (!isPM && h === 12) h = 0;
  return h * 60 + min;
}

/** Slots that are no longer bookable for the given date (Houston CT). */
export function getPastTimeSlots(
  dateStr: string,
  slots: readonly string[] = BOOKING_TIME_SLOTS,
): string[] {
  if (!isBookingDateToday(dateStr)) return [];
  const houston = getHoustonNow();
  if (houston.getHours() >= 17) return [...slots];
  const cutoffMins = houston.getHours() * 60 + houston.getMinutes() + 60;
  return slots.filter(slot => slotToMinutes(slot) <= cutoffMins);
}
