const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";
const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css" };
function serve(dir, port) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      let p = path.join(dir, url === "/" ? "/index.html" : url);
      fs.readFile(p, (err, data) => {
        if (err) { res.writeHead(404); return res.end("not found"); }
        res.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" });
        res.end(data);
      });
    });
    srv.listen(port, () => resolve(srv));
  });
}
async function check(page, count, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#reviews").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelectorAll(".htr-google-reviews-grid > *").length > 0, { timeout: 30000 });
  return page.evaluate(() => {
    const grid = document.querySelector(".htr-google-reviews-grid");
    const cards = grid ? [...grid.children] : [];
    const tops = [...new Set(cards.map((c) => Math.round(c.getBoundingClientRect().top)))].sort((a, b) => a - b);
    const cs = grid ? getComputedStyle(grid) : null;
    return {
      cardCount: cards.length,
      cols: cs ? cs.gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      rowCount: tops.length,
      rows: cs?.gridTemplateRows,
    };
  });
}
(async () => {
  const srv = await serve(root, 4191);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const mock = (n) => Array.from({ length: n }, (_, i) => ({
    name: `R${i}`, initials: "R", avatarColor: "#4285F4", rating: 5,
    time: "1w", textEn: "x", textEs: "x",
  }));
  await page.route("**/api/google-reviews**", async (route) => {
    await route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({ ok: true, placeId: "ChIJG17BnG_bZiARTsOUc0JlvyE", reviews: mock(20), rating: 5, userRatingCount: 20 }),
    });
  });
  await page.goto("http://127.0.0.1:4191/", { waitUntil: "networkidle" });
  const widths = [768, 1024, 1280, 1440];
  const out = {};
  for (const w of widths) out[`w${w}`] = await check(page, 20, w);
  await browser.close();
  srv.close();
  console.log(JSON.stringify(out, null, 2));
})();
