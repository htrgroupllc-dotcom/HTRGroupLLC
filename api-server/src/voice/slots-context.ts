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
    return "NO_SLOTS: No appointment days are open in the next week. Apologize and offer htrgrouptx.com or callback.";
  }

  const lines: string[] = ["AVAILABLE APPOINTMENTS (Houston time, weekdays only):"];
  for (const fullDate of realDates.slice(0, 5)) {
    const { date: datePart } = parseSlot(`${fullDate} — 9:00 AM`);
    const { times } = await getTimesForDate(datePart, 0);
    const realTimes = times.filter((t) => !t.startsWith(MORE_PREFIX));
    if (!realTimes.length) continue;
    lines.push(
      `- ${shortDateLabel(fullDate)} (${fullDate}): ${realTimes.slice(0, 6).join(", ")}`,
    );
  }
  lines.push(
    "Offer 2–3 options at a time. When the caller picks, set preferredDate to the date part (e.g. Apr 15, 2026), preferredTime to the time (e.g. 9:00 AM), and selectedSlot to the full string like Wed, Apr 15, 2026 — 9:00 AM.",
  );
  return lines.join("\n");
}
