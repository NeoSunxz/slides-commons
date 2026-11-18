import { test, expect } from './font-cache.mjs';
import { ALL_SLUGS, artifactPath } from './helpers.mjs';

for (const lang of ['en', 'zh']) {
  const prefix = lang === 'zh' ? 'zh/' : '';
  for (const [width, height] of [[1920, 1080], [1440, 810], [390, 844]]) {
    test(`${lang} credits align with the gallery at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`${prefix}gallery/`);
      const galleryBounds = await page.locator('.collection-heading').boundingBox();
      await page.goto(`${prefix}credits.html`);
      await page.evaluate(() => document.fonts.ready);
      const creditBounds = await page.locator('.credit').first().boundingBox();
      const titleBounds = await page.locator('.credits-top').boundingBox();
      expect(creditBounds.x).toBeCloseTo(galleryBounds.x, 0);
      expect(creditBounds.width).toBeCloseTo(galleryBounds.width, 0);
      expect(titleBounds.x).toBeCloseTo(galleryBounds.x, 0);
      expect(titleBounds.width).toBeCloseTo(galleryBounds.width, 0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('.credit-heading .github-icon')).toHaveCount(2);
      await expect(page.locator('.credit-catalog li')).toHaveCount(ALL_SLUGS.length);
      await page.screenshot({ path: artifactPath(`credits-${lang}-${width}.png`), fullPage: true });
      await page.locator('.credit-catalog summary').last().click();
      await expect(page.locator('.credit-catalog').last()).toHaveAttribute('open', '');
      await expect(page.locator('.credit-catalog').last().locator('li').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }

  test(`${lang} chapter 04 expands into credits and returns to the same chapter`, async ({ page }) => {
    await page.addInitScript(() => {
      window.addEventListener('pagereveal', (event) => {
        document.documentElement.dataset.pageTransition = String(Boolean(event.viewTransition));
      });
    });
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto(`${prefix}index.html#origins`);
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(2214);
    const origin = page.locator('.home-origin');
    const background = await origin.evaluate((element) => getComputedStyle(element).backgroundColor);
    await expect.poll(() => page.locator('.site-header').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(background);
    const heading = await origin.locator('h2').innerText();
    await expect(origin.locator('.github-icon')).toHaveCount(2);
    await origin.locator('.home-text-link').click();
    await expect(page).toHaveURL(/credits\.html$/);
    await expect(page.locator('html')).toHaveAttribute('data-page-transition', 'true');
    expect(await page.locator('.credits-hero').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(background);
    await expect(page.locator('.credits-hero h1')).toHaveText(heading.replace(/\n/g, ''));
    expect(await page.locator('.credits-hero').evaluate((element) => getComputedStyle(element).viewTransitionName)).toBe('origins-surface');
    await page.locator('.credits-top a').click();
    await expect(page).toHaveURL(/index\.html#origins$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(2214);
    await expect(page.locator('.home-origin h2')).toBeInViewport();
  });
}
