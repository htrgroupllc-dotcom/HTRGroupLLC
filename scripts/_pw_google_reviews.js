const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("https://htrgrouptx.com/#reviews", { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForSelector("#reviews.htr-google-reviews", { timeout: 30000 });
  await page.waitForFunction(() => document.querySelectorAll("#reviews .htr-google-reviews-grid > *").length >= 10, { timeout: 45000 });
  const result = await page.evaluate(() => {
    const section = document.querySelector("#reviews.htr-google-reviews");
    const grid = section?.querySelector(".htr-google-reviews-grid");
    const cards = grid ? [...grid.children] : [];
    const tops = cards.map((c) => Math.round(c.getBoundingClientRect().top));
    const uniqueRows = [...new Set(tops)].sort((a, b) => a - b);
    const stars = [...section.querySelectorAll(".htr-google-star")].slice(0, 5);
    const starColors = stars.map((el) => getComputedStyle(el).fill);
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
    return { cardCount: cards.length, gridCols: cols, rowTops: uniqueRows, rowCount: uniqueRows.length, starColors };
  });
  console.log(JSON.stringify(result, null, 2));
  const yellowOk = result.starColors.every((f) => /251,\s*188,\s*4/i.test(f));
  const layoutOk = result.cardCount === 10 && result.gridCols === 5 && result.rowCount === 2;
  console.log("PASS", yellowOk && layoutOk);
  await browser.close();
  if (!yellowOk || !layoutOk) process.exit(2);
})();
