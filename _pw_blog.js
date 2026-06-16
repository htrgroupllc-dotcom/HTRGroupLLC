const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const slugs = ['5-signs-refrigerator-needs-repair','extend-washing-machine-life','dishwasher-not-draining'];
  for (const slug of slugs) {
    errors.length = 0;
    await page.goto('https://htrgrouptx.com/blog/' + slug, { waitUntil: 'networkidle', timeout: 60000 });
    const bodyText = await page.locator('body').innerText();
    const hasArticle = bodyText.includes('Back to Blog') || bodyText.includes('Volver');
    const hasNotFound = bodyText.includes('Article not found') || bodyText.includes('Art');
    console.log(slug, 'errors:', errors, 'len:', bodyText.length, 'article?', hasArticle, 'notFound?', bodyText.includes('not found'));
  }
  await page.goto('https://htrgrouptx.com/blog', { waitUntil: 'networkidle' });
  errors.length = 0;
  await page.locator('a[href*="/blog/"]').first().click();
  await page.waitForTimeout(3000);
  console.log('click url:', page.url(), 'errors:', errors);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
