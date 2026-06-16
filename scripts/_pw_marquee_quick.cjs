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

(async () => {
  const srv = await serve(root, 4188);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://127.0.0.1:4188/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.locator(".htr-brand-marquee-center").scrollIntoViewIfNeeded({ timeout: 60000 });
  await page.waitForTimeout(2500);
  const result = await page.evaluate(async () => {
    const leftTrack = document.querySelector(".htr-brand-marquee-center__track--left");
    const rightTrack = document.querySelector(".htr-brand-marquee-center__track--right");
    const wingLeft = document.querySelector(".htr-brand-marquee-center__wing--left");
    const wingRight = document.querySelector(".htr-brand-marquee-center__wing--right");
    const visible = (wing) => {
      const wr = wing.getBoundingClientRect();
      return [...wing.querySelectorAll(".htr-brand-marquee-center__card")].filter((c) => {
        const r = c.getBoundingClientRect();
        return r.width > 0 && r.right > wr.left && r.left < wr.right;
      }).map((c) => {
        const r = c.getBoundingClientRect();
        return (r.left + r.right) / 2;
      });
    };
    const t0L = visible(wingLeft);
    const t0R = visible(wingRight);
    const tr0 = { l: getComputedStyle(leftTrack).transform, r: getComputedStyle(rightTrack).transform };
    await new Promise((r) => setTimeout(r, 2000));
    const t1L = visible(wingLeft);
    const t1R = visible(wingRight);
    const tr1 = { l: getComputedStyle(leftTrack).transform, r: getComputedStyle(rightTrack).transform };
    const avg = (a, b) => {
      if (!a.length || !b.length) return null;
      const m0 = a.reduce((s, x) => s + x, 0) / a.length;
      const m1 = b.reduce((s, x) => s + x, 0) / b.length;
      return m1 - m0;
    };
    return {
      leftJustify: leftTrack?.className.includes("justify-end"),
      rightJustify: rightTrack?.className.includes("justify-start"),
      animLeft: tr0.l !== tr1.l,
      animRight: tr0.r !== tr1.r,
      leftDelta: avg(t0L, t1L),
      rightDelta: avg(t0R, t1R),
      leftCards: leftTrack?.children.length,
      rightCards: rightTrack?.children.length,
    };
  });
  console.log(JSON.stringify(result, null, 2));
  const ok = result.leftJustify && result.rightJustify && result.animLeft && result.animRight
    && (result.leftDelta == null || result.leftDelta > 0)
    && (result.rightDelta == null || result.rightDelta < 0);
  console.log(ok ? "PASS" : "FAIL");
  await browser.close();
  srv.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
