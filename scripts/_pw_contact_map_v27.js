const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("https://www.htrgrouptx.com/?v=27#contact", { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(5000);
  const script = await page.evaluate(() =>
    document.querySelector('script[src*="index-utf8-v4"]')?.getAttribute("src")
  );
  const paths = await page.evaluate(() => document.querySelectorAll("svg path").length);
  console.log("script", script, "svg_paths", paths);
  await page.screenshot({ path: "C:/Projects/HTRGroupLLC/_prod_contact_map_v27.png", fullPage: false });
  await browser.close();
})();
