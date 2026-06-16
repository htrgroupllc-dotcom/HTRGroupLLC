const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = "C:/Projects/HTRGroupLLC";
function serve(dir, port) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      console.log("req", url);
      let p = path.join(dir, url === "/" ? "/index.html" : url);
      if (p.endsWith("/")) p += "index.html";
      fs.readFile(p, (err, data) => {
        if (err) { res.writeHead(404); return res.end("not found " + p); }
        const ext = path.extname(p);
        const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".png": "image/png", ".json": "application/json" };
        res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
        res.end(data);
      });
    });
    srv.listen(port, () => resolve(srv));
  });
}
(async () => {
  const srv = await serve(root, 4176);
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on("pageerror", (e) => console.log("pageerror", e.message));
  p.on("requestfailed", (r) => console.log("fail", r.url(), r.failure()?.errorText));
  await p.goto("http://127.0.0.1:4176/", { waitUntil: "networkidle", timeout: 120000 });
  const rootHtml = await p.locator("#root").innerHTML();
  console.log("root len", rootHtml.length);
  console.log("root snippet", rootHtml.slice(0, 500));
  await b.close(); srv.close();
})();
