const fs = require("fs");
const t = fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js", "utf8");
const markers = [
  "onOpenBooking",
  "mobileTab(\"bookings\")",
  "showSeparator",
  "showSepRow",
  "Archive, ShieldOff",
  "adminTab, setAdminTab",
];
for (const m of markers) {
  const i = t.indexOf(m);
  console.log("\n===", m, "===");
  if (i >= 0) console.log(t.slice(Math.max(0, i - 80), i + 500));
}
