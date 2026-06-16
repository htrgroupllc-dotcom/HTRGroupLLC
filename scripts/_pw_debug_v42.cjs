const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";
const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css" };
const srv = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  let p = path.join(root, url === "/" ? "/index.html" : url);
  fs.readFile(p, (e, d) => {
    res.writeHead(e ? 404 : 200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" });
    res.end(e ? "nf" : d);
  });
});
(async () => {
  await new Promise((r) => srv.listen(4184, r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route("**/api/google-reviews**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, reviews: Array.from({ length: 12 }, (_, i) => ({ name: "R" + i, initials: "R", avatarColor: "#4285F4", rating: 5, time: "t", textEn: "x", textEs: "x" })), rating: 5, userRatingCount: 12 }) })
  );
  await page.goto("http://127.0.0.1:4184/#reviews", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => {
    const c = document.querySelector(".htr-google-reviews-grid > *");
    const w = document.querySelector(".htr-brand-marquee-center__wing--left");
    const bleed = document.querySelector(".htr-brand-marquee-center__bleed");
    const btn = document.querySelector('button[aria-label="Next reviews"]');
    const cssHref = document.querySelector('link[href*="index-_bdQPowM"]')?.getAttribute("href");
    return {
      tag: c?.tagName,
      opacity: c ? getComputedStyle(c).opacity : null,
      mask: w ? getComputedStyle(w).maskImage : null,
      webkit: w ? getComputedStyle(w).webkitMaskImage : null,
      bleedW: bleed?.getBoundingClientRect().width,
      vw: window.innerWidth,
      btnDisabled: btn?.disabled,
      pages: document.querySelector(".tabular-nums")?.textContent,
      cssHref,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
  srv.close();
})();
