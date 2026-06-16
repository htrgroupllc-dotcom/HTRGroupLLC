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
  const srv = await serve(root, 4299);
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
  await page.goto("http://127.0.0.1:4299/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.locator("#reviews").scrollIntoViewIfNeeded({ timeout: 60000 });
  await page.waitForFunction(() => {
    const wrap = document.querySelector(".htr-google-reviews-grid-wrap");
    if (!wrap) return false;
    const rows = wrap.querySelectorAll(".space-y-4 > .grid");
    return rows.length === 2 && rows[0].children.length >= 5;
  }, { timeout: 45000 });
  const result = await page.evaluate(() => {
    const wrap = document.querySelector(".htr-google-reviews-grid-wrap");
    const rowDivs = wrap ? [...wrap.querySelectorAll(".space-y-4 > .grid")] : [];
    const first = rowDivs[0] ? [...rowDivs[0].children] : [];
    const second = rowDivs[1] ? [...rowDivs[1].children] : [];
    const firstCols = rowDivs[0] ? getComputedStyle(rowDivs[0]).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
    const firstTops = first.map((c) => Math.round(c.getBoundingClientRect().top));
    const secondTops = second.map((c) => Math.round(c.getBoundingClientRect().top));
    return {
      rowDivCount: rowDivs.length,
      firstRowCount: first.length,
      secondRowCount: second.length,
      firstCols,
      firstRowUniqueTops: [...new Set(firstTops)].length,
      secondRowUniqueTops: [...new Set(secondTops)].length,
      firstRowBelowSecond: firstTops[0] < secondTops[0],
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  srv.close();
  const ok = result.rowDivCount === 2
    && result.firstRowCount === 5
    && result.secondRowCount === 5
    && result.firstCols === 5
    && result.firstRowUniqueTops === 1
    && result.secondRowUniqueTops === 1
    && result.firstRowBelowSecond;
  process.exit(ok ? 0 : 2);
})().catch((e) => { console.error(e); process.exit(1); });
