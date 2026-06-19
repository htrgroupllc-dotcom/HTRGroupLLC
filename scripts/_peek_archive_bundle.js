const fs = require("fs");
const t = fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js", "utf8");
const markers = ['key: "bookings"', "tabBookings", "adminTab !== \"bookings\"", "showCompleted ? t.allOrders"];
for (const m of markers) {
  const i = t.indexOf(m);
  console.log("\n===", m, "at", i, "===");
  if (i >= 0) console.log(t.slice(i, i + 600));
}
