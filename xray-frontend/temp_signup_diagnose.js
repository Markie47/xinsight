const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE_LOG', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR', err.toString()));
  page.on('requestfailed', req => console.log('REQUEST_FAILED', req.url(), req.failure()?.errorText));
  await page.goto('http://localhost:3000/signup');
  await page.waitForTimeout(3000);
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log('ROOT_HTML', rootHtml.slice(0, 500));
  await browser.close();
})();
