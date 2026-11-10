// The built site opened straight from disk (file://), as a visitor might after cloning.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect } from './font-cache.mjs';
import { SITE, SLUG, countUpstreamSlides, monitorContext, previewFrame, deckFacts, settled, fontLoaded } from './helpers.mjs';

const fileUrl = (...p) => pathToFileURL(path.join(SITE, ...p)).href;
const N = countUpstreamSlides();

test.beforeAll(() => {
  expect(fs.existsSync(path.join(SITE, 't', SLUG, 'index.html')), 'site/ must be built (build project)').toBe(true);
});

function expectClean(log, what) {
  expect.soft(log.consoleErrors.filter((e) => /Not allowed to load local resource/i.test(e)), `${what}: "Not allowed to load local resource"`).toEqual([]);
  expect.soft(log.consoleErrors, `${what}: console errors`).toEqual([]);
  expect.soft(log.pageErrors, `${what}: page errors`).toEqual([]);
  expect.soft(log.failed, `${what}: failed requests`).toEqual([]);
  expect.soft(log.badStatus, `${what}: HTTP >= 400`).toEqual([]);
}

test('detail page works from file://: paging, one visible slide, Space Grotesk', async ({ page, context }) => {
  const log = monitorContext(context);
  await page.goto(fileUrl('t', SLUG, 'index.html'));
  const frame = await previewFrame(page);
  await fontLoaded(frame, 'Space Grotesk');
  const counter = page.locator('#counter');
  await expect(counter).toHaveText(`1 / ${N}`);

  let f = await deckFacts(frame);
  expect(f.total).toBe(N);
  expect(f.visibleSlides, 'visible slides on load').toBe(1);
  expect(f.titleFont, 'cover h1.title font').toMatch(/^"?Space Grotesk/);
  expect(f.spaceGroteskLoaded, 'Space Grotesk FontFace loaded').toBe(true);

  const next = page.locator('#next');
  for (let i = 2; i <= N; i++) {
    await next.click();
    await expect(counter).toHaveText(`${i} / ${N}`);
  }
  await expect(next).toBeDisabled();
  f = await deckFacts(frame);
  expect(f.index).toBe(N - 1);
  expect(f.visibleSlides, 'visible slides on last slide').toBe(1);

  await settled(log, expect);
  expectClean(log, 'file:// detail');
});

test('gallery card from file:// lands on t/<slug>/index.html', async ({ page, context }) => {
  const log = monitorContext(context);
  await page.goto(fileUrl('index.html'));
  const card = page.locator('a.card').first();
  await expect(card).toHaveAttribute('href', `t/${SLUG}/index.html`);
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/site/t/${SLUG}/index\\.html$`));
  await expect(page.locator('h1')).toHaveText(/Neo-Grid Bold/);
  await expect(page.locator('iframe#preview')).toHaveCount(1);

  // Every other relative directory link on the page resolves to an index.html too.
  const dirLinks = await page.evaluate(() => [...document.querySelectorAll('a[href]')]
    .map((a) => a.getAttribute('href'))
    .filter((h) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(h) && /\/(?:[?#].*)?$/.test(h)));
  expect(dirLinks, 'relative links still ending in "/" under file://').toEqual([]);
  await previewFrame(page);
  await settled(log, expect);
  expectClean(log, 'file:// gallery → detail');
});

test('"Open in new tab" from file:// opens a working deck', async ({ page, context }) => {
  const log = monitorContext(context);
  await page.goto(fileUrl('t', SLUG, 'index.html'));
  const link = page.locator('a.open-tab');
  await expect(link).toHaveAttribute('target', '_blank');
  const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
  await popup.waitForLoadState('load');
  expect(popup.url().replace(/#.*$/, '')).toBe(fileUrl('preview', SLUG, 'template.html')); // deck-stage adds #<n>
  await popup.waitForFunction(() => document.querySelector('deck-stage')?.length > 0);
  await fontLoaded(popup, 'Space Grotesk');
  let f = await deckFacts(popup);
  expect(f.total).toBe(N);
  expect(f.visibleSlides).toBe(1);
  await popup.keyboard.press('ArrowRight');
  await expect.poll(async () => (await deckFacts(popup)).index).toBe(1);
  await settled(log, expect);
  expectClean(log, 'file:// open-in-new-tab');
});
