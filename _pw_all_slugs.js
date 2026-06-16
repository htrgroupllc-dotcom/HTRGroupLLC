const { chromium } = require('playwright');
const slugs = ['5-signs-refrigerator-needs-repair', 'extend-washing-machine-life', 'dishwasher-not-draining', 'common-oven-problems', 'dryer-vent-cleaning', 'microwave-sparking-not-heating', 'freezer-maintenance-tips', 'range-hood-repair-guide', 'ice-maker-repair-guide', 'cooktop-repair-guide', 'wine-cooler-repair-guide', 'garbage-disposal-repair-guide', 'warming-drawer-repair-guide'];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const failed = [];
  for (const slug of slugs) {
    const errors = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('https://htrgrouptx.com/blog/' + slug, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(500);
    const text = await page.locator('body').innerText();
    if (errors.length) failed.push({ slug, errors });
    else if (text.includes('Article not found')) failed.push({ slug, errors: ['not found'] });
  }
  console.log('failed', JSON.stringify(failed));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
