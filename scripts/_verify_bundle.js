const fs = require("fs");
const t = fs.readFileSync("C:/Projects/HTRGroupLLC/assets/index-utf8-v4.js", "utf8");
const checks = [
  "async function downloadBinaryPdf",
  "/api/admin/bookings/${b.id}/invoice-pdf",
  "/api/admin/bookings/${b.id}/invoice-html",
  "/api/employee/bookings/${b.id}/invoice-pdf",
  'iframe.style.height = "10px"',
  "/api/public/invoice-pdf?session_id=",
];
for (const s of checks) {
  console.log(JSON.stringify(s) + ":", t.includes(s));
}
console.log("size:", t.length);
