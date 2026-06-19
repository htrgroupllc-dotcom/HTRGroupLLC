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

/** Same label on dental + appliance admin (matches API COALESCE default). */
export function resolveBookingBiz(businessType?: string | null): BookingBiz {
  if (businessType === "dental") return "dental";
  if (businessType === "appliance") return "appliance";
  return ADMIN_SITE_CONFIG.bookingBizFallback;
}
