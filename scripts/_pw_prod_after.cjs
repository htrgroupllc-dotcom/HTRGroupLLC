const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('https://htrgrouptx.com/?nocache=' + Date.now(), { waitUntil: 'networkidle', timeout: 120000 });
  await page.locator('.htr-brand-marquee-center').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const track = await page.locator('.htr-brand-marquee-center__track--left').count();
  const anim = track ? await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).animationName) : 'n/a';
  const t0 = track ? await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).transform) : 'n/a';
  await page.waitForTimeout(2000);
  const t1 = track ? await page.locator('.htr-brand-marquee-center__track--left').evaluate(n => getComputedStyle(n).transform) : 'n/a';
  const jsHref = await page.locator('script[type="module"]').getAttribute('src');
  console.log('js', jsHref, 'track', track, 'anim', anim, 'moved', t0 !== t1);
  if (track) await page.locator('.htr-brand-marquee-center').screenshot({ path: 'C:/Projects/HTRGroupLLC/scripts/center-marquee-prod-after.png' });
  await browser.close();
})();
