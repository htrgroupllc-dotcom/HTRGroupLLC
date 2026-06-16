const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("https://www.htrgrouptx.com/#contact", { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(3000);
  const n = await page.evaluate(() => {
    const paths = document.querySelectorAll("svg path, svg polygon");
    return paths.length;
  });
  console.log("svg_paths", n);
  await page.screenshot({ path: "C:/Projects/HTRGroupLLC/_prod_contact_map.png", fullPage: false });
  await browser.close();
})();
