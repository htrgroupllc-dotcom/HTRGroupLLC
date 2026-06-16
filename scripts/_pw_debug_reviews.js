const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });
  await page.goto("https://htrgrouptx.com/#reviews", { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => {
    const grid = document.querySelector(".htr-google-reviews-grid");
    const names = grid ? [...grid.querySelectorAll("p.font-semibold")].map((p) => p.textContent.trim()) : [];
    return {
      directChildren: grid?.children?.length ?? 0,
      names,
      gridHTMLlen: grid?.innerHTML?.length ?? 0,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
