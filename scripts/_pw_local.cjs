const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = 'C:/Projects/HTRGroupLLC';

function serve(dir, port) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let url = (req.url || '/').split('?')[0];
      let p = path.join(dir, decodeURIComponent(url));
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
      fs.readFile(p, (err, data) => {
        if (err) { res.writeHead(404); return res.end('not found: '+url); }
        const ext = path.extname(p);
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.webp': 'image/webp' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    srv.listen(port, () => resolve(srv));
  });
}

(async () => {
  const port = 4173;
  const srv = await serve(root, port);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const bad = [];
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status()+' '+r.url()); });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(12000);
  console.log('bad', bad.slice(0,15));
  console.log('marquee', await page.locator('.htr-brand-marquee-center').count());
  const track = await page.locator('.htr-brand-marquee-center__track--left').count();
  console.log('track-left', track);
  if (track) {
    const anim = await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).animationName);
    const t0 = await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).transform);
    await page.waitForTimeout(2000);
    const t1 = await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).transform);
    console.log('anim', anim, 'transform changed', t0 !== t1, t0, t1);
    await page.locator('.htr-brand-marquee-center').screenshot({ path: path.join(root,'scripts','center-marquee-local-mobile.png') });
  }
  await browser.close();
  srv.close();
})();
