/** Per-site defaults for the shared HTRGroup admin panel. */
export const ADMIN_SITE_CONFIG = {
  defaultBizFilter: "appliance" as "all" | "appliance" | "dental",
  bookingBizFallback: "appliance" as "appliance" | "dental",
  defaultGallerySite: "appliance" as "appliance" | "dental",
  visitFeeSites: ["appliance", "dental"] as const,
  accent: "#6B7280",
  pageBg: "#F3F4F6",
};
