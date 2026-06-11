const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("https://htrgrouptx.com/#brands", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const sec = document.getElementById("brands");
    if (!sec) return { error: "no #brands" };
    const rows = sec.querySelectorAll(":scope > .relative.w-full.overflow-hidden, :scope > div > .relative.w-full.overflow-hidden");
    const marquees = sec.querySelectorAll(".relative.w-full.overflow-hidden");
    const rects = [...marquees].map((el, i) => {
      const r = el.getBoundingClientRect();
      return { i, top: r.top, height: r.height, width: r.width, visible: r.height > 0 && r.width > 0 };
    });
    return { marqueeCount: marquees.length, rects, sectionHeight: sec.getBoundingClientRect().height };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: process.env.TEMP + "/brands.png", fullPage: false });
  await browser.close();
})();
