const { chromium } = require("playwright");
const css = `
.htr-brand-marquee-center { min-height: 80px; }
.htr-brand-marquee-center__row {
  position: relative;
  overflow: hidden;
  height: 72px;
  min-height: 72px;
}
@media (min-width: 768px) {
  .htr-brand-marquee-center__row { height: 88px; min-height: 88px; }
}
`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto("https://htrgrouptx.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.addStyleTag({ content: css });
  await p.waitForTimeout(3000);
  const d = await p.evaluate(() => {
    const sec = document.querySelector(".htr-brand-marquee-center");
    const row = sec?.querySelector(".htr-brand-marquee-center__row");
    const vis = [...document.querySelectorAll(".htr-brand-marquee-center__card img")].filter((i) => {
      const r = i.getBoundingClientRect();
      return r.width > 0 && r.right > 0 && r.left < innerWidth && r.top < innerHeight && r.bottom > 0;
    });
    return { secH: sec?.offsetHeight, rowH: row?.offsetHeight, visibleImgs: vis.length };
  });
  console.log(d);
  await p.locator(".htr-brand-marquee-center").scrollIntoViewIfNeeded();
  await p.screenshot({ path: "scripts/marquee-after-css-fix.png" });
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
