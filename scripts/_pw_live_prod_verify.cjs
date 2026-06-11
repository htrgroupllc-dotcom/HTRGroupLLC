const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL = "https://www.htrgrouptx.com/";
const OUT = path.join(__dirname, "_pw_live_prod_result.json");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

  await page.goto(URL, { waitUntil: "networkidle", timeout: 120000 });

  const html = await page.content();
  const bundleMatch = html.match(/index-utf8-v\d+\.js\?v=(\d+)/);
  const cacheV = bundleMatch ? bundleMatch[1] : null;

  await page.locator("#reviews").scrollIntoViewIfNeeded({ timeout: 60000 });
  await page.waitForTimeout(8000);

  const reviews = await page.evaluate(() => {
    const section = document.querySelector("#reviews, .htr-google-reviews");
    const wrap = document.querySelector(".htr-google-reviews-grid-wrap");
    const htrRows = [...document.querySelectorAll(".htr-reviews-row")];
    const spaceGrids = wrap ? [...wrap.querySelectorAll(".space-y-4 > .grid, .space-y-4 > div.grid")] : [];
    const anyGrids = wrap ? [...wrap.querySelectorAll(".grid")] : [];
    const cards = section ? [...section.querySelectorAll(".htr-google-review-card")] : [];
    const visibleCards = cards.filter((c) => {
      const r = c.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    });
    const rowDivs = spaceGrids.length ? spaceGrids : (htrRows.length ? htrRows : anyGrids.slice(0, 2));
    const first = rowDivs[0] ? [...rowDivs[0].children] : [];
    const second = rowDivs[1] ? [...rowDivs[1].children] : [];
    const firstCols = rowDivs[0] ? getComputedStyle(rowDivs[0]).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
    const secondCols = rowDivs[1] ? getComputedStyle(rowDivs[1]).gridTemplateColumns.split(" ").filter(Boolean).length : 0;
    const firstTops = first.map((c) => Math.round(c.getBoundingClientRect().top));
    const secondTops = second.map((c) => Math.round(c.getBoundingClientRect().top));
    return {
      sectionFound: !!section,
      wrapFound: !!wrap,
      htrRowCount: htrRows.length,
      rowDivCount: rowDivs.length,
      anyGridCount: anyGrids.length,
      visibleCardCount: visibleCards.length,
      firstRowCount: first.length,
      secondRowCount: second.length,
      firstCols,
      secondCols,
      firstRowUniqueTops: [...new Set(firstTops)].length,
      secondRowUniqueTops: [...new Set(secondTops)].length,
      firstRowBelowSecond: first.length && second.length ? firstTops[0] < secondTops[0] : null,
      row0Class: rowDivs[0]?.className || null,
      row1Class: rowDivs[1]?.className || null,
      wrapDisplay: wrap ? getComputedStyle(wrap).display : null,
    };
  });

  await page.locator(".htr-brand-marquee-center").scrollIntoViewIfNeeded({ timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);

  const marquee = await page.evaluate(async () => {
    const leftTrack = document.querySelector(".htr-brand-marquee-center__track--left");
    const rightTrack = document.querySelector(".htr-brand-marquee-center__track--right");
    const visibleCards = (wingSel) => {
      const wing = document.querySelector(wingSel);
      if (!wing) return [];
      const wr = wing.getBoundingClientRect();
      return [...wing.querySelectorAll(".htr-brand-marquee-center__card")].filter((c) => {
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.right > wr.left && r.left < wr.right;
      }).map((c) => {
        const r = c.getBoundingClientRect();
        return { x: (r.left + r.right) / 2, left: r.left, right: r.right };
      });
    };
    const t0L = visibleCards(".htr-brand-marquee-center__wing--left");
    const t0R = visibleCards(".htr-brand-marquee-center__wing--right");
    const tr0 = {
      left: leftTrack ? getComputedStyle(leftTrack).transform : null,
      right: rightTrack ? getComputedStyle(rightTrack).transform : null,
    };
    await new Promise((r) => setTimeout(r, 10000));
    const t1L = visibleCards(".htr-brand-marquee-center__wing--left");
    const t1R = visibleCards(".htr-brand-marquee-center__wing--right");
    const tr1 = {
      left: leftTrack ? getComputedStyle(leftTrack).transform : null,
      right: rightTrack ? getComputedStyle(rightTrack).transform : null,
    };
    const avg = (a) => (a.length ? a.reduce((s, c) => s + c.x, 0) / a.length : null);
    const m0L = avg(t0L), m1L = avg(t1L), m0R = avg(t0R), m1R = avg(t1R);
    const leftCards = leftTrack ? leftTrack.querySelectorAll(".htr-brand-marquee-center__card").length : 0;
    const rightCards = rightTrack ? rightTrack.querySelectorAll(".htr-brand-marquee-center__card").length : 0;
    return {
      sectionFound: !!document.querySelector(".htr-brand-marquee-center"),
      leftTrackClass: leftTrack?.className || null,
      rightTrackClass: rightTrack?.className || null,
      leftCardCount: leftCards,
      rightCardCount: rightCards,
      animLeft: tr0.left !== tr1.left,
      animRight: tr0.right !== tr1.right,
      animLeftName: leftTrack ? getComputedStyle(leftTrack).animationName : null,
      animRightName: rightTrack ? getComputedStyle(rightTrack).animationName : null,
      leftDelta: m0L !== null && m1L !== null ? m1L - m0L : null,
      rightDelta: m0R !== null && m1R !== null ? m1R - m0R : null,
      hasRightEdge: t0R.some((c) => c.right > window.innerWidth - 120) || t1R.some((c) => c.right > window.innerWidth - 120),
      hasLeftEdge: t0L.some((c) => c.left < 120) || t1L.some((c) => c.left < 120),
    };
  });

  const shotReviews = path.join(__dirname, "_pw_live_reviews.png");
  const shotMarquee = path.join(__dirname, "_pw_live_marquee.png");
  await page.locator("#reviews").screenshot({ path: shotReviews }).catch(() => {});
  await page.locator(".htr-brand-marquee-center").screenshot({ path: shotMarquee }).catch(() => {});

  const result = { url: URL, cacheV, reviews, marquee, consoleErrors: consoleErrors.slice(0, 5), shots: { reviews: shotReviews, marquee: shotMarquee } };
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));

  const reviewsOk = reviews.wrapFound && reviews.rowDivCount === 2 && reviews.firstCols === 5 && reviews.firstRowUniqueTops === 1 && reviews.secondRowUniqueTops === 1;
  const marqueeOk = marquee.sectionFound && marquee.animLeft && marquee.animRight && (marquee.leftDelta === null || marquee.leftDelta > 0) && (marquee.rightDelta === null || marquee.rightDelta < 0);
  await browser.close();
  process.exit(reviewsOk && marqueeOk ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
