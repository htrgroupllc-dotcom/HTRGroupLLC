const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";
const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css" };
const mockReviews = Array.from({ length: 20 }, (_, i) => ({
  name: `Reviewer ${i + 1}`, initials: `R${i + 1}`, avatarColor: "#4285F4", rating: 5,
  time: `${i + 1} weeks ago`, textEn: `Great service ${i + 1}`, textEs: `Servicio ${i + 1}`,
}));
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
(async () => {
  const srv = await serve(root, 4190);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route("**/api/google-reviews**", async (route) => {
    await route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({
        ok: true, placeId: "ChIJG17BnG_bZiARTsOUc0JlvyE",
        reviews: mockReviews, rating: 5, userRatingCount: 20,
      }),
    });
  });
  await page.goto("http://127.0.0.1:4190/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.locator("#reviews").scrollIntoViewIfNeeded({ timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll(".htr-google-reviews-grid > *").length >= 10, { timeout: 45000 });
  const reviews = await page.evaluate(() => {
    const grid = document.querySelector(".htr-google-reviews-grid");
    const cards = grid ? [...grid.children] : [];
    const tops = cards.map((c) => Math.round(c.getBoundingClientRect().top));
    const uniqueRows = [...new Set(tops)].sort((a, b) => a - b);
    const cs = grid ? getComputedStyle(grid) : null;
    return {
      cardCount: cards.length,
      cols: cs ? cs.gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      rows: cs ? cs.gridTemplateRows : null,
      rowCount: uniqueRows.length,
      tops: uniqueRows,
      display: cs?.display,
      gridAutoFlow: cs?.gridAutoFlow,
      overflow: cs?.overflow,
      parentOverflow: grid?.parentElement ? getComputedStyle(grid.parentElement).overflow : null,
      gridHeight: grid?.getBoundingClientRect().height,
      sectionHeight: document.querySelector("#reviews")?.getBoundingClientRect().height,
    };
  });
  console.log(JSON.stringify(reviews, null, 2));
  await browser.close();
  srv.close();
  process.exit(reviews.rowCount === 2 && reviews.cols === 5 && reviews.cardCount === 10 ? 0 : 2);
})().catch((e) => { console.error(e); process.exit(1); });
