// Every template: detail page health, paging against the real deck, phone overflow, screenshots.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from './font-cache.mjs';
import {
  SITE, ALL_SLUGS, SAMPLE_SLUGS, CDN_SLUGS, DECK_STAGE_SLUGS, EXTERNAL_WHITELIST, SLUG,
  monitor, settled, hostOf, previewFrame, artifactPath,
} from './helpers.mjs';

test.describe.configure({ mode: 'parallel' });

test('every template on disk (all sources) is in site/manifest.json and has a page, preview and zip', async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(SITE, 'manifest.json'), 'utf8'));
  expect(manifest.templates.map((t) => t.slug).sort()).toEqual([...ALL_SLUGS].sort());
  expect(ALL_SLUGS.length).toBeGreaterThan(34);
  for (const slug of ALL_SLUGS) {
    for (const rel of [['t', slug, 'index.html'], ['zh', 't', slug, 'index.html'], ['zip', `${slug}.zip`]]) {
      expect(fs.existsSync(path.join(SITE, ...rel)), `site/${rel.join('/')}`).toBe(true);
    }
  }
});

// Slides as the preview DOM itself defines them.
const domSlideCount = (frame) => frame.evaluate(() => {
  const d = document.querySelector('deck-stage');
  if (d) return d.querySelectorAll(':scope > [data-deck-slide], :scope > section').length;
  return document.querySelectorAll('.slide').length;
});

function checkClean(log, slug, lang, baseURL) {
  const own = new URL(baseURL).host;
  const external = log.requests.filter((r) => /^https?:/.test(r.url) && new URL(r.url).host !== own);
  const allowed = (h) => EXTERNAL_WHITELIST.includes(h) && (h !== 'cdn.jsdelivr.net' || CDN_SLUGS.includes(slug));
  expect.soft(log.consoleErrors, `${lang} ${slug}: console errors`).toEqual([]);
  expect.soft(log.pageErrors, `${lang} ${slug}: page errors`).toEqual([]);
  expect.soft(log.failed, `${lang} ${slug}: failed requests`).toEqual([]);
  expect.soft(log.badStatus, `${lang} ${slug}: HTTP >= 400`).toEqual([]);
  expect.soft(external.filter((r) => r.isMain).map((r) => r.url), `${lang} ${slug}: external requests from the site page itself`).toEqual([]);
  expect.soft(external.filter((r) => !allowed(hostOf(r.url))).map((r) => r.url), `${lang} ${slug}: hosts outside the whitelist`).toEqual([]);
}

const ZH_SAMPLE = new Set(SAMPLE_SLUGS);

// 8-bit-orbit had a double-advance defect (bridge re-sent keys); it is repeated below as a regression guard.
const REGRESSION_SLUG = '8-bit-orbit';

for (const slug of ALL_SLUGS) {
  test(`[en] ${slug}: no errors; paging 1 / N → N / N and back; counter has data-via`, async ({ page, baseURL }) => {
    const log = monitor(page);
    await page.goto(`t/${slug}/`);
    const frame = await (await page.locator('iframe#preview').elementHandle()).contentFrame();
    await frame.waitForLoadState('load');
    const counter = page.locator('#counter');
    await expect(counter, `${slug}: counter never left the placeholder`).toHaveText(/^\d+ \/ \d+$/);
    const N = await domSlideCount(frame);
    expect(N, `${slug}: slides found in the preview DOM`).toBeGreaterThan(1);
    await expect(counter).toHaveText(`1 / ${N}`);
    await expect(counter).toHaveAttribute('data-via', /.+/);
    await expect(page.locator('#prev')).toBeDisabled();
    const via = await counter.getAttribute('data-via');
    test.info().annotations.push({ type: 'via', description: `${slug}: N=${N} via=${via}` });

    const next = page.locator('#next');
    for (let i = 2; i <= N; i++) {
      await next.click();
      await expect(counter, `${slug}: after Next #${i - 1}`).toHaveText(`${i} / ${N}`);
    }
    await expect(next).toBeDisabled();
    await page.locator('#prev').click();
    await expect(counter).toHaveText(`${N - 1} / ${N}`);
    await expect(next).toBeEnabled();

    // "Slides in demo" is filled from the same count.
    await expect(page.locator('#slide-total')).toHaveText(String(N));

    await settled(log, expect);
    checkClean(log, slug, 'en', baseURL);
  });
}

// A single Next must move exactly one slide, however long the template's transition is.
// (A fixed settle time is the point here: an over-eager retry shows up late.)
for (const slug of ALL_SLUGS) {
  test(`[en] ${slug}: one Next moves exactly one slide, one Prev moves back one`, async ({ page }) => {
    await page.goto(`t/${slug}/`);
    const counter = page.locator('#counter');
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    await page.locator('#next').click();
    await expect(counter).toHaveText(/^[2-9]\d* \/ \d+$/);
    await page.waitForTimeout(2000); // longer than any retry window of the bridge (14 x 110 ms)
    const N = Number((await counter.textContent()).split('/')[1]);
    await expect(counter, `after one Next (settled)`).toHaveText(`2 / ${N}`);
    await page.locator('#prev').click();
    await expect(counter).toHaveText(`1 / ${N}`);
    await page.waitForTimeout(1500);
    await expect(counter, `after one Prev (settled)`).toHaveText(`1 / ${N}`);
  });
}

// Rapid input. Slow-transition decks take about 1.5 s per step, so settle for 2 s per step
// and then re-check that nothing moved further.
for (const slug of ALL_SLUGS) {
  test(`[en] ${slug}: fast double Next = +2, never more; Next then Prev quickly = back to start`, async ({ page }) => {
    await page.goto(`t/${slug}/`);
    const counter = page.locator('#counter');
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    const N = Number((await counter.textContent()).split('/')[1]);
    await page.locator('#next').click();
    await page.locator('#next').click();
    await expect(counter, 'after two quick Next').toHaveText(`3 / ${N}`, { timeout: 15_000 });
    await page.waitForTimeout(2500);
    await expect(counter, 'two quick Next, settled').toHaveText(`3 / ${N}`);

    await page.locator('#next').click();
    await page.locator('#prev').click();
    await page.waitForTimeout(2 * 1800);
    await expect(counter, 'Next then Prev quickly, settled').toHaveText(`3 / ${N}`);
  });
}

// Regression guard for the double-advance seen on 8-bit-orbit: repeat the single-Next check.
for (let i = 1; i <= 5; i++) {
  test(`[en] ${REGRESSION_SLUG}: single Next = exactly +1 (repeat ${i}/5)`, async ({ page }) => {
    await page.goto(`t/${REGRESSION_SLUG}/`);
    const counter = page.locator('#counter');
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    const N = Number((await counter.textContent()).split('/')[1]);
    await page.locator('#next').click();
    await page.waitForTimeout(2500);
    await expect(counter).toHaveText(`2 / ${N}`);
  });
}

for (const slug of ALL_SLUGS.filter((s) => ZH_SAMPLE.has(s))) {
  test(`[zh] ${slug}: no errors; counter reaches 1 / N`, async ({ page, baseURL }) => {
    const log = monitor(page);
    await page.goto(`zh/t/${slug}/`);
    await expect(page.locator('#counter')).toHaveText(/^1 \/ \d+$/);
    await settled(log, expect);
    checkClean(log, slug, 'zh', baseURL);
  });

  test(`${slug}: no horizontal scroll at 390px (en and zh)`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const url of [`t/${slug}/`, `zh/t/${slug}/`]) {
      await page.goto(url);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `${url} horizontal overflow`).toBeLessThanOrEqual(0);
      const f = await page.locator('iframe#preview').boundingBox();
      expect(Math.abs(f.width / f.height - 16 / 9) / (16 / 9), `${url} iframe ${f.width}x${f.height}`).toBeLessThanOrEqual(0.01);
    }
  });
}

test('screenshots of three detail pages: deck-stage, viewport-based, raw-grid', async ({ page }) => {
  const viewportBased = ALL_SLUGS.find((s) => !DECK_STAGE_SLUGS.includes(s) && s !== 'raw-grid');
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [tag, slug] of [['deckstage', SLUG], ['viewport', viewportBased], ['rawgrid', 'raw-grid']]) {
    const log = monitor(page);
    await page.goto(`t/${slug}/`);
    await expect(page.locator('#counter')).toHaveText(/^1 \/ \d+$/);
    await settled(log, expect);
    await page.screenshot({ path: artifactPath(`detail-${tag}-${slug}.png`), fullPage: true });
  }
});
