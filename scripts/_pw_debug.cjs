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
  const srv = await serve(root, 4175);
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on("pageerror", (e) => console.log("pageerror", e.message));
  p.on("console", (m) => { if (m.type() === "error") console.log("console", m.text()); });
  await p.goto("http://127.0.0.1:4175/", { waitUntil: "load", timeout: 120000 });
  await p.waitForTimeout(5000);
  console.log("count", await p.locator(".htr-brand-marquee-center").count());
  console.log("html has", (await p.content()).includes("htr-brand-marquee-center"));
  await b.close(); srv.close();
})();
