import { test, expect } from './font-cache.mjs';
import { artifactPath } from './helpers.mjs';

for (const [width, height] of [[1920, 1080], [1440, 810], [390, 844]]) {
  test(`navigation positions and gutters match on every page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    let baseline;
    for (const url of ['zh/', 'zh/gallery/', 'zh/credits.html', 'zh/t/swiss-modern/']) {
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.locator('.site-header .brand, .site-nav > a, .lang-switch').evaluateAll((elements) => elements.map((element) => {
        const bounds = element.getBoundingClientRect();
        return { left: Math.round(bounds.left), top: Math.round(bounds.top), width: Math.round(bounds.width), height: Math.round(bounds.height) };
      }));
      baseline ??= geometry;
      expect(geometry).toEqual(baseline);
      await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
      await expect.poll(() => page.locator('.site-header').evaluate((element) => element.getBoundingClientRect().top)).toBe(0);
      await expect(page.locator('.site-nav')).toBeInViewport();
    }
  });
}

for (const [width, height] of [[1440, 810], [1280, 720], [390, 844]]) {
  test(`gallery shows a complete preview without scrolling at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('zh/gallery/');
    await expect(page.locator('#filters')).toBeVisible();
    await expect(page.locator('.filter-extra')).not.toHaveAttribute('open');
    const title = await page.locator('.collection-title h1').boundingBox();
    const intro = await page.locator('.collection-title > p:last-child').boundingBox();
    const search = await page.locator('.collection-heading .fsearch').boundingBox();
    expect(intro.x).toBeCloseTo(title.x, 0);
    expect(intro.y).toBeGreaterThan(title.y + title.height);
    if (width > 1000) {
      expect(search.x).toBeGreaterThan(title.x + title.width);
      expect(search.y + search.height).toBeCloseTo(intro.y + intro.height, 0);
    } else expect(search.y).toBeGreaterThan(intro.y + intro.height);
    const preview = page.locator('#grid .card img').first();
    await expect.poll(() => preview.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
    const bounds = await preview.boundingBox();
    expect(bounds.y + bounds.height).toBeLessThan(height - 20);
    expect(bounds.y).toBeLessThan(height * .55);
    await page.screenshot({ path: artifactPath(`gallery-first-screen-${width}.png`) });
    await page.locator('.filter-extra > summary').click();
    await page.locator('[data-group="source"][data-value="style-presets"]').click();
    await page.reload();
    await expect(page.locator('.filter-extra')).toHaveAttribute('open', '');
    await expect(page.locator('[data-group="source"][data-value="style-presets"]')).toHaveAttribute('aria-pressed', 'true');
  });
}

for (const [width, height] of [[1920, 1080], [1440, 810], [1280, 720], [390, 844]]) {
  test(`detail has generous margins and a compact action panel at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('zh/t/swiss-modern/');
    await page.evaluate(() => document.fonts.ready);
    const preview = await page.locator('.frame16x9').boundingBox();
    const panel = await page.locator('.actions').boundingBox();
    const detail = await page.locator('.detail').boundingBox();
    if (width > 1000) {
      expect(panel.width).toBeGreaterThanOrEqual(320);
      expect(panel.width).toBeLessThanOrEqual(380);
      const brand = await page.locator('.site-header .brand').boundingBox();
      expect(detail.x).toBeGreaterThan(brand.x);
      expect(detail.x).toBeLessThanOrEqual(width / 12);
      expect(detail.x).toBeCloseTo(width - detail.x - detail.width, 0);
      expect(await page.locator('.hero h1').evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeLessThanOrEqual(52);
      expect(preview.width / preview.height).toBeCloseTo(16 / 9, 1);
      expect(panel.y).toBeCloseTo(preview.y, 0);
      const hint = await page.locator('.preview .hint').boundingBox();
      expect(hint.y + hint.height).toBeLessThanOrEqual(height - 16);
      const controls = await page.locator('.preview .controls').boundingBox();
      expect(controls.y).toBeGreaterThanOrEqual(preview.y + preview.height);
      expect(controls.x).toBeCloseTo(preview.x, 0);
      expect(controls.width).toBeCloseTo(preview.width, 0);
      const description = await page.locator('.about > p:not(.source-note)').boundingBox();
      expect(description.width).toBeGreaterThan(detail.width * .65);
    } else expect(panel.y).toBeGreaterThan(preview.y + preview.height);
    const details = await page.locator('.detail > .details').boundingBox();
    expect(details.x).toBeCloseTo(detail.x, 0);
    expect(details.width).toBeCloseTo(detail.width, 0);
    expect(details.y).toBeGreaterThanOrEqual(panel.y + panel.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: artifactPath(`detail-balanced-${width}.png`) });
  });
}

for (const language of ['en', 'zh']) {
  test(`${language} long-title detail stays aligned after resizing and scrolling`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.goto(`${language === 'zh' ? 'zh/' : ''}t/boardroom-quarterly/`);
    await page.evaluate(() => document.fonts.ready);
    const heroGeometry = await page.locator('.detail-main .hero > *').evaluateAll((elements) => elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, top: bounds.top, bottom: bounds.bottom };
    }));
    expect(new Set(heroGeometry.map((item) => Math.round(item.left))).size).toBe(1);
    expect(heroGeometry[1].top).toBeGreaterThan(heroGeometry[0].bottom);
    expect(heroGeometry[2].top).toBeGreaterThan(heroGeometry[1].bottom);
    for (const [width, height] of [[1440, 810], [1280, 720], [1920, 1080], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await expect.poll(() => page.locator('.controls').evaluate((controls) => {
        const preview = document.querySelector('.frame16x9').getBoundingClientRect();
        const bounds = controls.getBoundingClientRect();
        return Math.abs(bounds.left - preview.left) < 1 && Math.abs(bounds.right - preview.right) < 1;
      })).toBe(true);
      if (width > 1000) {
        await expect.poll(() => page.locator('.preview .hint').evaluate((hint) => hint.getBoundingClientRect().bottom <= innerHeight - 16)).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
    await page.setViewportSize({ width: 1440, height: 810 });
    await page.locator('.about').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.querySelector('.actions').getBoundingClientRect().bottom <= document.querySelector('.about').getBoundingClientRect().top)).toBe(true);
    await page.locator('.about').evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - 96, behavior: 'instant' }));
    await page.screenshot({ path: artifactPath(`detail-information-${language}.png`) });
  });
}
