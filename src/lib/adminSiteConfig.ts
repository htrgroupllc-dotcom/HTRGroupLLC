/** Per-site defaults for the shared HTRGroup admin panel. */
export const ADMIN_SITE_CONFIG = {
  defaultBizFilter: "all" as "all" | "appliance" | "dental",
  bookingBizFallback: "appliance" as "appliance" | "dental",
  defaultGallerySite: "appliance" as "appliance" | "dental",
  visitFeeSites: ["appliance", "dental"] as const,
  accent: "#6B7280",
  pageBg: "#F3F4F6",
};

export type BookingBiz = "appliance" | "dental";

const DENTAL_HINT =
  /dental|intraoral|x-?ray|autoclave|operatory|handpiece|nitrous|panoramic|cone beam|c\s?arm|sensor|suction|cavitron|ultrasonic|delivery system|exam chair|dental chair|dental unit|a-?dec|pelton.?crane|dentsply|sirona|planmeca|carestream|schick|air techniques|airstar|acteon|xray|nitrous oxide|sterilizer|amalgam|vacuum.?system|nitrous.?flow/i;

const APPLIANCE_HINT =
  /cooktop|range\b|stove|wall oven|double oven|refrigerator|fridge|freezer|dishwasher|washer|dryer|microwave|vent hood|range hood|garbage disposal|ice maker|wine cooler|compactor|warming drawer|top load|front load|laundry|oven\b|gas range|electric range/i;

/**
 * Prefer equipment text over a stale business_type column (same idea as API resolveDocumentBusinessType).
 * Used for Admin list/Archive filters and badges — does not write to DB.
 */
export function resolveBookingBiz(
  businessType?: string | null,
  appliance?: string | null,
  brandModel?: string | null,
): BookingBiz {
  const hint = `${appliance ?? ""} ${brandModel ?? ""}`.trim();
  if (hint) {
    if (DENTAL_HINT.test(hint)) return "dental";
    if (APPLIANCE_HINT.test(hint)) return "appliance";
  }
  if (businessType === "dental") return "dental";
  if (businessType === "appliance") return "appliance";
  return ADMIN_SITE_CONFIG.bookingBizFallback;
}
