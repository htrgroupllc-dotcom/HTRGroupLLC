const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("https://www.htrgrouptx.com/#contact", { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const script = [...document.querySelectorAll("script[src*=\"index-utf8\"]")].map(s => s.src).join(" ");
    const paths = [...document.querySelectorAll("svg path")];
    let minLat = 999;
    paths.forEach(p => {
      const d = p.getAttribute("d") || "";
      // skip - paths are pixel coords not lat
    });
    return { script, pathCount: paths.length };
  });
  console.log(JSON.stringify(info));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
