export interface BookingState {
  appliance?: string;
  symptoms?: string;
  brandModel?: string;
  clientName?: string;
  phone?: string;
  city?: string;
  streetAddress?: string;
  zip?: string;
  preferredDate?: string;
  preferredTime?: string;
  selectedSlot?: string;
}

export const BOOKING_FIELD_ORDER = [
  "appliance", "symptoms", "brandModel", "clientName", "phone",
  "city", "streetAddress", "zip", "preferredDate", "preferredTime",
] as const;

export type BookingField = (typeof BOOKING_FIELD_ORDER)[number];

export function missingFields(state: BookingState): BookingField[] {
  const missing: BookingField[] = [];
  if (!state.appliance?.trim()) missing.push("appliance");
  if (!state.symptoms?.trim()) missing.push("symptoms");
  if (!state.brandModel?.trim()) missing.push("brandModel");
  if (!state.clientName?.trim()) missing.push("clientName");
  if (!state.phone?.trim()) missing.push("phone");
  if (!state.city?.trim()) missing.push("city");
  if (!state.streetAddress?.trim()) missing.push("streetAddress");
  if (!state.zip?.trim()) missing.push("zip");
  if (!state.preferredDate?.trim()) missing.push("preferredDate");
  if (!state.preferredTime?.trim()) missing.push("preferredTime");
  return missing;
}

export function mergeBookingState(
  current: BookingState,
  updates: Partial<BookingState>,
): BookingState {
  const next = { ...current };
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    (next as Record<string, string>)[k] = s;
  }
  return next;
}

export function isReadyForScheduling(state: BookingState): boolean {
  const missing = missingFields(state);
  return (
    missing.length <= 2 &&
    missing.every((f) => f === "preferredDate" || f === "preferredTime")
  );
}

export function isReadyToBook(state: BookingState): boolean {
  return (
    missingFields(state).length === 0 &&
    !!state.preferredDate?.trim() &&
    !!state.preferredTime?.trim()
  );
}
