const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("https://htrgrouptx.com/#reviews", { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(5000);
  const data = await page.evaluate(() => {
    const grid = document.querySelector(".htr-google-reviews-grid");
    const cards = grid ? [...grid.children] : [];
    const tops = cards.map((c) => Math.round(c.getBoundingClientRect().top));
    const uniqueRows = [...new Set(tops)].sort((a, b) => a - b);
    const cs = grid ? getComputedStyle(grid) : null;
    return {
      cardCount: cards.length,
      cols: cs ? cs.gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      rows: cs?.gridTemplateRows,
      rowCount: uniqueRows.length,
      tops: uniqueRows,
      gridRect: grid?.getBoundingClientRect(),
      visibleCards: cards.filter((c) => {
        const r = c.getBoundingClientRect();
        return r.height > 0 && r.width > 0 && getComputedStyle(c).opacity !== "0";
      }).length,
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await page.screenshot({ path: "C:/Projects/HTRGroupLLC/scripts/prod-reviews-2rows-check.png", fullPage: false });
  await browser.close();
  process.exit(data.rowCount >= 2 && data.cardCount >= 2 ? 0 : 2);
})().catch((e) => { console.error(e); process.exit(1); });
