import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from './font-cache.mjs';
import { SITE, artifactPath } from './helpers.mjs';

test('interface fonts travel with the render-blocking stylesheet', () => {
  const css = fs.readFileSync(path.join(SITE, 'assets', 'site.css'), 'utf8');
  expect(css.match(/data:font\/woff2;base64,/g)).toHaveLength(2);
  expect(css).not.toContain('./type/');
});

for (const [width, height] of [[1920, 1080], [1440, 810], [1280, 720], [390, 844], [320, 740]]) {
  test(`switching languages keeps hero and navigation geometry stable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const fontRequests = [];
    await page.route('**/assets/type/**', (route) => {
      fontRequests.push(route.request().url());
      return route.abort();
    });
    await page.route('**/assets/site.css', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return route.continue();
    });
    await page.goto('zh/');
    let baseline;
    for (const language of ['zh', 'en', 'zh']) {
      if (language !== 'zh' || baseline) await page.locator(`[data-lang-switch="${language}"]`).click();
      await page.waitForLoadState('domcontentloaded');
      await page.evaluate(() => document.fonts.ready);
      const measurements = await page.evaluate(() => {
        const selectors = ['.brand', '.site-nav', '.lang-switch', '.home-hero h1', '.hero-line', '.hero-wall'];
        return selectors.map((selector) => {
          const element = document.querySelector(selector);
          const bounds = element.getBoundingClientRect();
          return { selector, left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height };
        });
      });
      baseline ??= measurements;
      for (let index = 0; index < baseline.length; index += 1) {
        for (const dimension of ['left', 'top', 'width', 'height']) {
          expect(Math.abs(measurements[index][dimension] - baseline[index][dimension]), `${language} ${measurements[index].selector} ${dimension}`).toBeLessThan(2);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      expect(await page.locator('.hero-line').evaluateAll((lines) => lines.every((line) => line.scrollWidth <= line.clientWidth + 1))).toBe(true);
      expect(await page.evaluate(() => document.fonts.check('700 32px "Commons Sans"'))).toBe(true);
      if (language === 'en') expect(await page.evaluate(() => document.fonts.check('700 32px "Commons Display"'))).toBe(true);
      await page.screenshot({ path: artifactPath(`language-stable-${language}-${width}.png`) });
    }
    expect(fontRequests).toEqual([]);
  });
}

test('cold English render has the intended title font before its first frame', async ({ page }) => {
  await page.addInitScript(() => {
    const shifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) shifts.push(entry.value);
    }).observe({ type: 'layout-shift', buffered: true });
    window.interfaceShifts = shifts;
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => {
        window.firstTitleFontReady = document.fonts.check('700 32px "Commons Display"');
      });
    });
  });
  await page.goto('index.html');
  await expect.poll(() => page.evaluate(() => window.firstTitleFontReady)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => window.interfaceShifts.reduce((total, value) => total + value, 0))).toBeLessThan(.01);
});
