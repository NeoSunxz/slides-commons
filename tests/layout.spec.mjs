// Detail-page layout, "Open in new tab" (http) and fullscreen.
import { test, expect } from '@playwright/test';
import { SLUG, countUpstreamSlides, monitorContext, previewFrame, deckFacts } from './helpers.mjs';

const DETAIL = `t/${SLUG}/`;
const N = countUpstreamSlides();

for (const [w, h] of [[1440, 900], [1920, 1080], [1366, 768]]) {
  test(`layout ${w}x${h}: iframe 16:9, no horizontal scroll, controls present`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(DETAIL);
    await previewFrame(page);
    const box = await page.locator('iframe#preview').boundingBox();
    const ratio = box.width / box.height;
    expect(Math.abs(ratio - 16 / 9) / (16 / 9), `iframe ${box.width}x${box.height}`).toBeLessThanOrEqual(0.01);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(scroll, 'horizontal overflow').toBeLessThanOrEqual(0);
    const controls = page.locator('.controls');
    for (const sel of ['#prev', '#counter', '#next', '#fullscreen', 'a.open-tab']) await expect(controls.locator(sel)).toHaveCount(1);
    const cb = await controls.boundingBox();
    test.info().annotations.push({ type: 'geometry', description: `iframe ${Math.round(box.width)}x${Math.round(box.height)} at x=${Math.round(box.x)},y=${Math.round(box.y)}; controls bottom ${Math.round(cb.y + cb.height)}` });
  });
}

test('"Open in new tab" (http) opens a popup running the deck without errors', async ({ page, context }) => {
  const log = monitorContext(context);
  await page.goto(DETAIL);
  const link = page.locator('a.open-tab');
  await expect(link).toHaveText(/Open in new tab/);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('href', `../../preview/${SLUG}/template.html`);
  await expect(page.locator('a.full')).toHaveCount(0);

  const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
  await popup.waitForLoadState('load');
  expect(popup.url()).toMatch(new RegExp(`/preview/${SLUG}/template\\.html(#\\d+)?$`));
  await popup.waitForFunction(() => document.querySelector('deck-stage')?.length > 0);
  const f = await deckFacts(popup);
  expect(f.total).toBe(N);
  expect(f.visibleSlides).toBe(1);
  expect(f.titleFont).toMatch(/^"?Space Grotesk/);
  await popup.keyboard.press('ArrowRight');
  await expect.poll(async () => (await deckFacts(popup)).index).toBe(1);
  await popup.waitForLoadState('networkidle');
  expect.soft(log.consoleErrors, 'console errors').toEqual([]);
  expect.soft(log.pageErrors, 'page errors').toEqual([]);
  expect.soft(log.failed, 'failed requests').toEqual([]);
  expect.soft(log.badStatus, 'HTTP >= 400').toEqual([]);
});

test('fullscreen button fullscreens #preview-wrap; arrows page; exit works', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(DETAIL);
  const frame = await previewFrame(page);
  const btn = page.locator('#fullscreen');
  const supported = await page.evaluate(() => !!document.fullscreenEnabled);
  test.info().annotations.push({ type: 'fullscreenEnabled', description: String(supported) });
  if (!supported) {
    await expect(btn, 'button must stay hidden when fullscreen is unsupported').toBeHidden();
    test.skip(true, 'document.fullscreenEnabled is false in this browser');
  }
  await expect(btn).toBeVisible();
  const counter = page.locator('#counter');
  await expect(counter).toHaveText(`1 / ${N}`);

  await btn.click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('preview-wrap');
  // The iframe should fill the fullscreen wrapper while keeping the deck letterboxed.
  const geo = await page.evaluate(() => {
    const r = document.getElementById('preview').getBoundingClientRect();
    return { w: r.width, h: r.height, sw: screen.width, sh: screen.height, iw: innerWidth, ih: innerHeight };
  });
  test.info().annotations.push({ type: 'fullscreen-geometry', description: JSON.stringify(geo) });

  await page.keyboard.press('ArrowRight');
  await expect(counter).toHaveText(`2 / ${N}`);
  expect((await deckFacts(frame)).index).toBe(1);
  await page.keyboard.press('ArrowRight');
  await expect(counter).toHaveText(`3 / ${N}`);
  await page.keyboard.press('ArrowLeft');
  await expect(counter).toHaveText(`2 / ${N}`);

  // Esc is handled by the browser UI, which headless may not emulate; try it, then fall back.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const afterEsc = await page.evaluate(() => document.fullscreenElement?.id ?? null);
  test.info().annotations.push({ type: 'escape-exits-fullscreen', description: String(afterEsc === null) });
  if (afterEsc !== null) await page.evaluate(() => document.exitFullscreen());
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();

  // Back inline: layout restored, paging still works.
  const box = await page.locator('iframe#preview').boundingBox();
  expect(Math.abs(box.width / box.height - 16 / 9) / (16 / 9)).toBeLessThanOrEqual(0.01);
  await page.locator('#next').click();
  await expect(counter).toHaveText(`3 / ${N}`);
});
