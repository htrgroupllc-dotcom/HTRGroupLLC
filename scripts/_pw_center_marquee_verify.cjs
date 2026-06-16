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
(async () => {
  const srv = await serve(root, 4177);
  const browser = await chromium.launch();
  for (const vp of [{ w: 1280, h: 900, name: "desktop" }, { w: 390, h: 844, name: "mobile" }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    await page.goto("http://127.0.0.1:4177/", { waitUntil: "networkidle", timeout: 120000 });
    await page.locator("#services").scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const sample = await page.evaluate(async () => {
      const leftTrack = document.querySelector(".htr-brand-marquee-center__track--left");
      const rightTrack = document.querySelector(".htr-brand-marquee-center__track--right");
      const img = document.querySelector(".htr-brand-marquee-center__card img");
      const bottomImg = document.querySelector(".htr-brand-marquee img");
      const style = img ? getComputedStyle(img) : null;
      const bottomStyle = bottomImg ? getComputedStyle(bottomImg) : null;
      const t0 = { left: leftTrack ? getComputedStyle(leftTrack).transform : null, right: rightTrack ? getComputedStyle(rightTrack).transform : null };
      await new Promise((r) => setTimeout(r, 1500));
      const t1 = { left: leftTrack ? getComputedStyle(leftTrack).transform : null, right: rightTrack ? getComputedStyle(rightTrack).transform : null };
      const stageW = document.querySelector(".htr-brand-marquee-center__stage")?.getBoundingClientRect().width || 0;
      const leftAnim = getComputedStyle(leftTrack).animationName;
      const rightAnim = getComputedStyle(rightTrack).animationName;
      return {
        centerFilter: style?.filter,
        bottomFilter: bottomStyle?.filter,
        animLeft: t0.left !== t1.left,
        animRight: t0.right !== t1.right,
        animationNames: { left: leftAnim, right: rightAnim },
        stageFullWidth: Math.abs(stageW - window.innerWidth) < 12,
        marqueeCount: document.querySelectorAll(".htr-brand-marquee-center").length,
      };
    });
    console.log(vp.name, JSON.stringify(sample));
  }
  await browser.close();
  srv.close();
})();
