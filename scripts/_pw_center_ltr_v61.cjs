const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";

function serve(dir, port) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      let p = path.join(dir, url === "/" ? "/index.html" : url);
      if (p.endsWith("/")) p += "index.html";
      fs.readFile(p, (err, data) => {
        if (err) { res.writeHead(404); return res.end("not found"); }
        const ext = path.extname(p);
        const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".png": "image/png" };
        res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
        res.end(data);
      });
    });
    srv.listen(port, () => resolve(srv));
  });
}

function parseTx(m) {
  if (!m || m === "none") return null;
  const nums = m.match(/-?[\d.]+/g);
  if (!nums || nums.length < 4) return null;
  return { tx: parseFloat(nums[4]) };
}

(async () => {
  const srv = await serve(root, 4178);
  const browser = await chromium.launch();
  const results = {};
  for (const vp of [{ w: 1280, h: 900, name: "desktop" }, { w: 390, h: 844, name: "mobile" }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto("http://127.0.0.1:4178/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector(".htr-brand-marquee-center", { timeout: 30000 });
    await page.waitForTimeout(600);
    const sample = await page.evaluate(async () => {
      const seam = document.querySelector(".htr-brand-marquee-center__seam");
      const track = document.querySelector(".htr-brand-marquee-center__track");
      const viewport = document.querySelector(".htr-brand-marquee-center__viewport");
      const cs = track ? getComputedStyle(track) : null;
      const rect = viewport?.getBoundingClientRect();
      const midX = rect ? rect.left + rect.width / 2 : 0;
      const cards = [...document.querySelectorAll(".htr-brand-marquee-center__card")];
      const atCenter = cards.filter((c) => {
        const r = c.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        return Math.abs(cx - midX) < 40 && r.width > 0;
      }).length;
      const t0 = track ? getComputedStyle(track).transform : null;
      await new Promise((r) => setTimeout(r, 2000));
      const t1 = track ? getComputedStyle(track).transform : null;
      return {
        hasSeam: !!seam,
        animName: cs?.animationName,
        animDuration: cs?.animationDuration,
        moving: t0 !== t1,
        logosAtCenter: atCenter,
        trackCount: document.querySelectorAll(".htr-brand-marquee-center__track").length,
        wingCount: document.querySelectorAll(".htr-brand-marquee-center__wing").length,
        t0,
        t1,
      };
    });
    results[vp.name] = sample;
    console.log(vp.name, JSON.stringify(sample, null, 2));
  }
  await browser.close();
  srv.close();

  const d = results.desktop;
  const ok =
    !d.hasSeam &&
    d.wingCount === 0 &&
    d.trackCount === 1 &&
    d.animName === "htr-marquee-center-ltr" &&
    parseFloat(d.animDuration) >= 90 &&
    d.moving &&
    d.logosAtCenter >= 1;
  console.log("PASS", ok);
  process.exit(ok ? 0 : 1);
})();
