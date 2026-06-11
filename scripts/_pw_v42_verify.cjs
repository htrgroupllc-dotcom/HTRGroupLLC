const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";
const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
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
  const srv = await serve(root, 4189);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route("**/api/google-reviews**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, reviews: mockReviews, rating: 5, userRatingCount: 20 }) });
  });
  await page.goto("http://127.0.0.1:4189/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForSelector(".htr-brand-marquee-center", { timeout: 60000 });
  await page.locator(".htr-brand-marquee-center").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const marquee = await page.evaluate(async () => {
    const leftTrack = document.querySelector(".htr-brand-marquee-center__track--left");
    const rightTrack = document.querySelector(".htr-brand-marquee-center__track--right");
    const leftWing = document.querySelector(".htr-brand-marquee-center__wing--left");
    const section = document.querySelector(".htr-brand-marquee-center");
    const t0l = leftTrack ? getComputedStyle(leftTrack).transform : "";
    const t0r = rightTrack ? getComputedStyle(rightTrack).transform : "";
    const maskL = leftWing ? (getComputedStyle(leftWing).webkitMaskImage || getComputedStyle(leftWing).maskImage) : "";
    await new Promise((r) => setTimeout(r, 2000));
    const t1l = leftTrack ? getComputedStyle(leftTrack).transform : "";
    const t1r = rightTrack ? getComputedStyle(rightTrack).transform : "";
    return { leftMoved: t0l !== t1l, rightMoved: t0r !== t1r, maskHasGradient: /gradient/i.test(maskL), bleedFull: Math.abs((section?.getBoundingClientRect().width || 0) - window.innerWidth) < 24 };
  });
  await page.locator("#reviews").scrollIntoViewIfNeeded({ timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll(".htr-google-reviews-grid > *").length >= 10, { timeout: 45000 });
  const reviews = await page.evaluate(() => {
    const grid = document.querySelector(".htr-google-reviews-grid");
    const cards = grid ? [...grid.children] : [];
    const tops = cards.map((c) => Math.round(c.getBoundingClientRect().top));
    const uniqueRows = [...new Set(tops)].sort((a, b) => a - b);
    const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
    const op0 = cards.filter((c) => getComputedStyle(c).opacity === "0").length;
    const stars = [...document.querySelectorAll(".htr-google-reviews .htr-google-star")].slice(0, 3).map((el) => getComputedStyle(el).fill);
    return { cardCount: cards.length, cols, rowCount: uniqueRows.length, op0, stars };
  });
  const arrowsOk = await page.evaluate(async () => {
    const label = document.querySelector("#reviews .tabular-nums")?.textContent?.trim();
    const btn = document.querySelector('button[aria-label="Next reviews"]');
    if (!btn || btn.disabled) return false;
    btn.click();
    await new Promise((r) => setTimeout(r, 500));
    const label2 = document.querySelector("#reviews .tabular-nums")?.textContent?.trim();
    return label === "1 / 2" && label2 === "2 / 2" && document.querySelectorAll(".htr-google-reviews-grid > *").length === 10;
  });
  const yellowOk = reviews.stars.length && reviews.stars.every((f) => /251,\s*188,\s*4/i.test(f));
  const layoutOk = reviews.cardCount === 10 && reviews.cols === 5 && reviews.rowCount === 2 && reviews.op0 === 0;
  const pass = yellowOk && layoutOk && marquee.leftMoved && marquee.rightMoved && marquee.maskHasGradient && marquee.bleedFull && arrowsOk;
  console.log(JSON.stringify({ reviews, marquee, arrowsOk, pass }, null, 2));
  await browser.close();
  srv.close();
  process.exit(pass ? 0 : 2);
})().catch((e) => { console.error(e); process.exit(1); });
