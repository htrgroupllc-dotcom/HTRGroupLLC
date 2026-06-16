const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:8765";
const paths = ["/", "/blog", "/blog/dryer-not-heating", "/gallery"];
const viewports = [{ w: 375, h: 812, name: "375x812" }, { w: 390, h: 844, name: "390x844" }];

(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const p of paths) {
      errors.length = 0;
      await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 120000 });
      await page.waitForTimeout(1500);
      const data = await page.evaluate(() => {
        const strip = document.querySelector(".htr-header-mobile-strip");
        const stripLinks = strip ? [...strip.querySelectorAll("a")].map((a) => ({
          t: (a.textContent || "").trim().slice(0, 24),
          h: a.getAttribute("href"),
          r: a.getBoundingClientRect(),
        })) : [];
        const aside = document.querySelector(".htr-blog-post-aside");
        const marquees = [...document.querySelectorAll(".htr-brand-marquee")].map((el, i) => {
          const r = el.getBoundingClientRect();
          return { i, w: r.width, h: r.height };
        });
        const broken = [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0).length;
        const social = [...document.querySelectorAll("footer a[target=_blank]")].slice(0, 3).map((a) => a.getAttribute("href"));
        return {
          stripVisible: !!strip && strip.getBoundingClientRect().height > 0,
          stripLinks,
          asideOrder: aside ? getComputedStyle(aside).order : null,
          marqueeCount: marquees.length,
          marquees,
          brokenImgs: broken,
          social,
          pageErrors: window.__errs || [],
        };
      });
      out.push({ vp: vp.name, path: p, errors: [...errors], data });
    }
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})();
