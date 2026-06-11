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

const mockReviews = Array.from({ length: 12 }, (_, i) => ({
  name: `Reviewer ${i + 1}`, initials: `R${i + 1}`, avatarColor: "#4285F4", rating: 5,
  time: `${i + 1} weeks ago`, textEn: `Great service ${i + 1}`, textEs: `Servicio ${i + 1}`,
  publishTime: Date.now() - i * 86400000,
}));

(async () => {
  const srv = await serve(root, 4301);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route("**/api/google-reviews**", async (route) => {
    await route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify({
        ok: true, placeId: "ChIJG17BnG_bZiARTsOUc0JlvyE",
        reviews: mockReviews, rating: 5, userRatingCount: 12,
      }),
    });
  });
  await page.goto("http://127.0.0.1:4301/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.locator("#reviews").scrollIntoViewIfNeeded({ timeout: 60000 });
  await page.waitForTimeout(2000);

  const reviews = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".htr-reviews-row")];
    const first = rows[0] ? [...rows[0].children] : [];
    const second = rows[1] ? [...rows[1].children] : [];
    const firstCols = rows[0] ? getComputedStyle(rows[0]).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
    const firstTops = first.map((c) => Math.round(c.getBoundingClientRect().top));
    const secondTops = second.map((c) => Math.round(c.getBoundingClientRect().top));
    return {
      htrRowCount: rows.length,
      firstRowCount: first.length,
      secondRowCount: second.length,
      firstCols,
      firstRowUniqueTops: [...new Set(firstTops)].length,
      secondRowUniqueTops: [...new Set(secondTops)].length,
      firstRowBelowSecond: firstTops[0] < secondTops[0],
    };
  });

  await page.locator(".htr-brand-marquee-center").scrollIntoViewIfNeeded();
  const marquee = await page.evaluate(async () => {
    const leftTrack = document.querySelector(".htr-brand-marquee-center__track--left");
    const rightTrack = document.querySelector(".htr-brand-marquee-center__track--right");
    const strips = (t) => t ? t.querySelectorAll(".htr-brand-marquee-center__strip").length : 0;
    const visible = (wingSel) => {
      const wing = document.querySelector(wingSel);
      if (!wing) return [];
      const wr = wing.getBoundingClientRect();
      return [...wing.querySelectorAll(".htr-brand-marquee-center__card")].filter((c) => {
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.right > wr.left && r.left < wr.right;
      }).map((c) => ({ x: (c.getBoundingClientRect().left + c.getBoundingClientRect().right) / 2 }));
    };
    const t0L = visible(".htr-brand-marquee-center__wing--left");
    const t0R = visible(".htr-brand-marquee-center__wing--right");
    const tr0 = { left: getComputedStyle(leftTrack).transform, right: getComputedStyle(rightTrack).transform };
    await new Promise((r) => setTimeout(r, 10000));
    const t1L = visible(".htr-brand-marquee-center__wing--left");
    const t1R = visible(".htr-brand-marquee-center__wing--right");
    const tr1 = { left: getComputedStyle(leftTrack).transform, right: getComputedStyle(rightTrack).transform };
    const avg = (a) => (a.length ? a.reduce((s, c) => s + c.x, 0) / a.length : null);
    return {
      leftStrips: strips(leftTrack),
      rightStrips: strips(rightTrack),
      animLeft: tr0.left !== tr1.left,
      animRight: tr0.right !== tr1.right,
      leftDelta: avg(t0L) !== null && avg(t1L) !== null ? avg(t1L) - avg(t0L) : null,
      rightDelta: avg(t0R) !== null && avg(t1R) !== null ? avg(t1R) - avg(t0R) : null,
      hasLeftEdge: t0L.some((c) => c.x < 150) || t1L.some((c) => c.x < 150),
      hasRightEdge: t0R.some((c) => c.x > window.innerWidth - 150) || t1R.some((c) => c.x > window.innerWidth - 150),
    };
  });

  console.log(JSON.stringify({ reviews, marquee }, null, 2));
  const ok = reviews.htrRowCount === 2 && reviews.firstRowCount === 5 && reviews.secondRowCount === 5
    && reviews.firstCols === 5 && reviews.firstRowBelowSecond
    && marquee.leftStrips === 2 && marquee.rightStrips === 2
    && marquee.animLeft && marquee.animRight
    && marquee.hasLeftEdge && marquee.hasRightEdge;
  await browser.close();
  srv.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
