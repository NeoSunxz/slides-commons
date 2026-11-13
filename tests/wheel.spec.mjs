// Mouse wheel over the preview pages the deck and never scrolls the outer page.
import { test, expect } from './font-cache.mjs';
import { ALL_SLUGS } from './helpers.mjs';

test.describe.configure({ mode: 'parallel' });

async function setup(page, slug) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`t/${slug}/`);
  const counter = page.locator('#counter');
  await expect(counter).toHaveText(/^1 \/ \d+$/);
  const N = Number((await counter.textContent()).split('/')[1]);
  await page.evaluate(() => scrollTo(0, 120));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(120);
  const box = await page.locator('iframe#preview').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  return { counter, N };
}
const scrollY = (page) => page.evaluate(() => scrollY);
// The bridge ignores wheel input for 620 ms after a gesture (plus inertia); wait it out.
const LOCK = 700;

for (const slug of ALL_SLUGS) {
  test(`[en] ${slug}: wheel pages one slide per gesture and leaves the page alone`, async ({ page }) => {
    const { counter, N } = await setup(page, slug);

    await page.mouse.wheel(0, 120);
    await expect(counter, 'wheel down').toHaveText(`2 / ${N}`, { timeout: 15_000 });
    expect(await scrollY(page), 'outer page scrolled by the wheel').toBe(120);

    await page.waitForTimeout(LOCK);
    for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 10); // a small burst, 60 px in total
    await expect(counter, 'burst of 6 small wheel events').toHaveText(`3 / ${N}`, { timeout: 15_000 });
    await page.waitForTimeout(1800); // negative check: the burst must not keep paging
    await expect(counter, 'burst moved more than one slide').toHaveText(`3 / ${N}`);
    expect(await scrollY(page)).toBe(120);

    await page.mouse.wheel(0, -120);
    await expect(counter, 'wheel up').toHaveText(`2 / ${N}`, { timeout: 15_000 });
    expect(await scrollY(page)).toBe(120);
  });
}

for (const slug of ['coral', 'broadside', 'studio']) {
  test(`[en] ${slug}: clicking the template's own nav dot moves the counter, not the page`, async ({ page }) => {
    const { counter, N } = await setup(page, slug);
    const frame = await (await page.locator('iframe#preview').elementHandle()).contentFrame();
    const dots = frame.locator('.nav-dot');
    expect(await dots.count(), 'nav dots in the deck').toBeGreaterThanOrEqual(3);
    // Some templates ignore dot clicks while their own intro animation runs (isAnimating),
    // so click again until the deck reacts.
    const clickUntil = async (i, text) => {
      await expect.poll(async () => { await dots.nth(i).click(); return counter.textContent(); },
        { timeout: 20_000, intervals: [200, 800, 1500], message: `counter after clicking dot ${i + 1}` }).toBe(text);
    };
    await clickUntil(2, `3 / ${N}`);
    expect(await scrollY(page)).toBe(120);
    await clickUntil(0, `1 / ${N}`);
    expect(await scrollY(page)).toBe(120);
  });
}

test('[en] daisy-days: navigating does not scroll the outer page', async ({ page }) => {
  const { counter, N } = await setup(page, 'daisy-days');
  await page.locator('#next').click();
  await expect(counter).toHaveText(`2 / ${N}`, { timeout: 15_000 });
  expect(await scrollY(page), 'Next button').toBe(120);
  await page.keyboard.press('ArrowRight');
  await expect(counter).toHaveText(`3 / ${N}`, { timeout: 15_000 });
  expect(await scrollY(page), 'arrow key').toBe(120);
  // Clicking the button moved the mouse pointer off the preview; put it back over the iframe.
  const box = await page.locator('iframe#preview').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 120);
  await expect(counter).toHaveText(`4 / ${N}`, { timeout: 15_000 });
  expect(await scrollY(page), 'wheel').toBe(120);
  await page.locator('#prev').click();
  await expect(counter).toHaveText(`3 / ${N}`, { timeout: 15_000 });
  expect(await scrollY(page), 'Prev button').toBe(120);
});
