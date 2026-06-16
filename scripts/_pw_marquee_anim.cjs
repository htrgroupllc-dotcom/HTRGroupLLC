const { chromium } = require("playwright");
const css = `.htr-brand-marquee-center{min-height:80px}.htr-brand-marquee-center__row{position:relative;overflow:hidden;height:88px;min-height:88px}.htr-brand-marquee-center__wing--left,.htr-brand-marquee-center__wing--right{height:100%}`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto("https://htrgrouptx.com/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.addStyleTag({ content: css });
  for (const state of ["running", "paused"]) {
    await p.evaluate((st) => {
      document.querySelectorAll(".htr-brand-marquee-center__track--left,.htr-brand-marquee-center__track--right").forEach((el) => {
        el.style.animationPlayState = st;
        if (st === "paused") el.style.animation = "none";
      });
    }, state);
    await p.waitForTimeout(300);
    const d = await p.evaluate(() => {
      const countIn = (sel) => {
        const wing = document.querySelector(sel);
        if (!wing) return 0;
        const wr = wing.getBoundingClientRect();
        return [...wing.querySelectorAll("img")].filter((i) => {
          const r = i.getBoundingClientRect();
          return r.right > wr.left + 2 && r.left < wr.right - 2 && r.height > 0;
        }).length;
      };
      return { left: countIn(".htr-brand-marquee-center__wing--left"), right: countIn(".htr-brand-marquee-center__wing--right") };
    });
    console.log(state, d);
  }
  await b.close();
})();
