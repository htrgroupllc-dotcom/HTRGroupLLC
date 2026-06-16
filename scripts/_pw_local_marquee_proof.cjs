const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";
function serve(dir, port) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = path.join(dir, decodeURIComponent((req.url || "/").split("?")[0]));
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
  const srv = await serve(root, 4188);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto("http://127.0.0.1:4188/", { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForTimeout(6000);
  await p.locator("#services").scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, 400));
  await p.waitForTimeout(500);
  const d = await p.evaluate(() => {
    const m = document.querySelector(".htr-brand-marquee-center");
    const a = document.querySelector("#about");
    const mr = m?.getBoundingClientRect();
    const ar = a?.getBoundingClientRect();
    const wing = document.querySelector(".htr-brand-marquee-center__wing--left");
    const wr = wing?.getBoundingClientRect();
    const vis = [...document.querySelectorAll(".htr-brand-marquee-center img")].filter((i) => {
      const r = i.getBoundingClientRect();
      return r.width > 10 && r.right > 0 && r.left < innerWidth;
    }).length;
    return { marqueeH: m?.offsetHeight, rowH: m?.querySelector(".htr-brand-marquee-center__row")?.offsetHeight, vis, between: mr && ar ? mr.bottom <= ar.top + 2 : null };
  });
  console.log(d);
  await p.screenshot({ path: "scripts/marquee-local-v36-proof.png" });
  await b.close();
  srv.close();
})();
