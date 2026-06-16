const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";
const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css" };
const srv = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  let p = path.join(root, url === "/" ? "/index.html" : url);
  fs.readFile(p, (e, d) => { res.writeHead(e ? 404 : 200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" }); res.end(e ? "nf" : d); });
});
(async () => {
  await new Promise((r) => srv.listen(4190, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route("**/api/google-reviews**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, reviews: Array.from({ length: 12 }, (_, i) => ({ name: "R" + i, initials: "R", avatarColor: "#4285F4", rating: 5, time: "t", textEn: "x", textEs: "x" })), rating: 5, userRatingCount: 12 }) }));
  await page.goto("http://127.0.0.1:4190/#reviews", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  const before = await page.evaluate(() => ({ label: document.querySelector("#reviews .tabular-nums")?.textContent, disabled: document.querySelector('button[aria-label="Next reviews"]')?.disabled }));
  await page.evaluate(() => document.querySelector('button[aria-label="Next reviews"]')?.click());
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({ label: document.querySelector("#reviews .tabular-nums")?.textContent, count: document.querySelectorAll(".htr-google-reviews-grid > *").length }));
  console.log({ before, after });
  await browser.close();
  srv.close();
})();
