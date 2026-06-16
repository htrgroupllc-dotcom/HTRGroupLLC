const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = 'C:/Projects/HTRGroupLLC';

function serve(dir, port) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = path.join(dir, decodeURIComponent((req.url || '/').split('?')[0]));
      if (p.endsWith('/')) p += 'index.html';
      fs.readFile(p, (err, data) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        const ext = path.extname(p);
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('console', (m) => console.log('console', m.type(), m.text()));
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(8000);
  const count = await page.locator('.htr-brand-marquee-center').count();
  const html = await page.content();
  console.log('marquee count', count);
  console.log('has Center in html', html.includes('htr-brand-marquee-center'));
  const out = path.join(root, 'scripts', 'center-marquee-full.png');
  await page.screenshot({ path: out, fullPage: true });
  console.log('screenshot', out);
  await browser.close();
  srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
