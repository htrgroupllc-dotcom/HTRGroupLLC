const https = require("https");

const url = process.argv[2] || "https://htrgrouptx.com/assets/index-utf8-v4.js?v=98";

https.get(url, (res) => {
  let d = "";
  res.on("data", (c) => (d += c));
  res.on("end", () => {
    console.log("url:", url);
    console.log("http:", res.statusCode);
    console.log("size:", d.length);
    const checks = [
      "async function downloadBinaryPdf",
      "/api/admin/bookings/${b.id}/invoice-pdf",
      "/api/admin/bookings/${b.id}/invoice-html",
      "/api/employee/bookings/${b.id}/invoice-pdf",
      'iframe.style.height = "10px"',
      "/api/public/invoice-pdf?session_id=",
    ];
    for (const s of checks) console.log(JSON.stringify(s) + ":", d.includes(s));
  });
}).on("error", (e) => {
  console.error(e.message);
  process.exit(1);
});
