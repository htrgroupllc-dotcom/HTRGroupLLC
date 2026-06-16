const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const failed = [];
  page.on('requestfailed', r => failed.push(r.url()));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
  await page.goto('https://htrgrouptx.com/', { waitUntil: 'networkidle', timeout: 120000 });
  await page.locator('#services').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const el = page.locator('.htr-brand-marquee-center');
  console.log('prod marquee count', await el.count());
  if (await el.count()) {
    const t0 = await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).transform);
    await page.waitForTimeout(2500);
    const t1 = await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).transform);
    const animL = await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).animationName);
    console.log('anim', animL, 't0', t0, 't1', t1);
    await el.screenshot({ path: 'C:/Projects/HTRGroupLLC/scripts/center-marquee-prod-before.png' });
  }
  console.log('failed sample', failed.slice(0,8));
  await browser.close();
})();
