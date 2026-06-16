const { chromium } = require("playwright");
const BASE = "https://htrgrouptx.com";
const paths = ["/", "/blog", "/blog/dryer-not-heating", "/gallery"];
const viewports = [{ w: 375, h: 812, name: "iPhoneX" }, { w: 390, h: 844, name: "iPhone14" }];

(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const consoleErrors = [];
    page.on("pageerror", e => consoleErrors.push(e.message));
    page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
    for (const p of paths) {
      consoleErrors.length = 0;
      try {
        await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 90000 });
        await page.waitForTimeout(2000);
      } catch (e) { results.push({ vp: vp.name, path: p, navError: String(e.message).slice(0,120) }); continue; }
      const audit = await page.evaluate(() => {
        const header = document.querySelector("header");
        const hRect = header?.getBoundingClientRect();
        const phones = [...document.querySelectorAll(".header-phone-link, .htr-phone-btn")].slice(0, 6).map(el => {
          const r = el.getBoundingClientRect();
          return { text: (el.textContent||"").trim().slice(0,20), w: r.width, h: r.height, top: r.top, visible: r.width>20 && r.height>20 && r.top>=0 && r.top<(window.innerHeight||800) };
        });
        const book = [...document.querySelectorAll("a")].find(a => /book now/i.test(a.textContent||""));
        const bRect = book?.getBoundingClientRect();
        const marquees = document.querySelectorAll(".htr-brand-marquee");
        const mInfo = [...marquees].map((el,i) => {
          const r = el.getBoundingClientRect();
          const track = el.querySelector(".flex.items-center");
          return { i, h: r.height, w: r.width, trackW: track?.scrollWidth||0 };
        });
        const services = document.getElementById("services");
        const svcRect = services?.getBoundingClientRect();
        const heroBanner = document.querySelector(".htr-hero-banner");
        const heroRect = heroBanner?.getBoundingClientRect();
        const imgs = document.querySelectorAll("main img, section img");
        let broken = 0, loaded = 0;
        imgs.forEach(img => { if (img.complete && img.naturalWidth===0) broken++; else if (img.complete) loaded++; });
        const socials = [...document.querySelectorAll("footer a[href*='facebook'], footer a[href*='instagram']")].map(a => ({ href: a.getAttribute("href"), r: a.getBoundingClientRect().width }));
        const telLinks = [...document.querySelectorAll('a[href^="tel:"]')].slice(0,4).map(a => a.getAttribute("href"));
        return { headerH: hRect?.height, phones, bookNow: book ? { top: bRect?.top, h: bRect?.height, visible: (bRect?.height||0)>0 } : null, marquees: mInfo, servicesTop: svcRect?.top, heroBannerBottom: heroRect?.bottom, brokenImgs: broken, loadedImgs: loaded, socials, telLinks };
      });
      results.push({ vp: vp.name, path: p, audit, consoleErrors: [...consoleErrors].slice(0,5) });
    }
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
