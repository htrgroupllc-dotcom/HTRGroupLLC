const { chromium } = require("playwright");
const BASE = "https://htrgrouptx.com";
const paths = ["/", "/blog", "/blog/washer-wont-spin", "/gallery"];
const viewports = [{ w: 375, h: 812, name: "375x812" }, { w: 390, h: 844, name: "390x844" }];

(async () => {
  const browser = await chromium.launch();
  const summary = [];
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    for (const p of paths) {
      const errs = [];
      page.on("pageerror", (e) => errs.push(e.message));
      await page.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(2500);
      const data = await page.evaluate(() => {
        const strip = document.querySelector(".htr-header-mobile-strip");
        const links = strip ? [...strip.querySelectorAll("a")].map((a) => {
          const r = a.getBoundingClientRect();
          return { text: (a.textContent||"").trim().slice(0,22), href: a.getAttribute("href"), ok: r.height >= 40 && r.width >= 60 };
        }) : [];
        const marquees = [...document.querySelectorAll(".htr-brand-marquee")].map((el,i) => ({ i, h: el.getBoundingClientRect().height, w: el.getBoundingClientRect().width }));
        const broken = [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0).length;
        const social = [...document.querySelectorAll("footer a[target=_blank]")].map((a) => ({ href: a.href, w: a.getBoundingClientRect().width }));
        const aside = document.querySelector(".htr-blog-post-aside");
        return { strip: !!strip, links, marquees, broken, socialOk: social.every((s) => s.href.startsWith("http") && s.w > 20), aside: !!aside, order: aside ? getComputedStyle(aside).order : null };
      });
      summary.push({ vp: vp.name, path: p, errs, data });
    }
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(summary, null, 2));
})();
