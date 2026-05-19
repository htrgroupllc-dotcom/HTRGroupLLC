import {
  MORE_PREFIX,
  getAvailableDates,
  getTimesForDate,
  parseSlot,
  shortDateLabel,
} from "../lib/booking-slots.js";

export async function buildSchedulingContext(): Promise<string> {
  const { dates } = await getAvailableDates(0);
  const realDates = dates.filter((d) => !d.startsWith(MORE_PREFIX));
  if (!realDates.length) {
    return "NO_SLOTS: No open days this week. Apologize and offer htrgrouptx.com.";
  }

  const lines: string[] = ["AVAILABLE APPOINTMENTS (Houston CT, weekdays):"];
  for (const fullDate of realDates.slice(0, 5)) {
    const { date: datePart } = parseSlot(`${fullDate} — 9:00 AM`);
    const { times } = await getTimesForDate(datePart, 0);
    const realTimes = times.filter((t) => !t.startsWith(MORE_PREFIX));
    if (!realTimes.length) continue;
    lines.push(`- ${shortDateLabel(fullDate)}: ${realTimes.slice(0, 6).join(", ")}`);
  }
  lines.push(
    "Offer 2-3 options. Set preferredDate (Apr 15, 2026), preferredTime (9:00 AM), selectedSlot (Wed, Apr 15, 2026 — 9:00 AM).",
  );
  return lines.join("\n");
}
