// Gallery, detail page, attribution, console & network checks.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import {
  SITE, SLUG, UPSTREAM_TEMPLATE_DIR, EXTERNAL_WHITELIST,
  artifactPath, countUpstreamSlides, readZip, normalizeEol, monitor, hostOf,
} from './helpers.mjs';

const DETAIL = `t/${SLUG}/`;
const SOURCE_DIR_URL = `https://github.com/zarazhangrui/beautiful-html-templates/tree/main/templates/${SLUG}`;
const SKILL_REPO = 'https://github.com/zarazhangrui/frontend-slides';
const meta = JSON.parse(fs.readFileSync(path.join(UPSTREAM_TEMPLATE_DIR, 'template.json'), 'utf8'));

async function previewFrame(page) {
  const handle = await page.locator('iframe#preview').elementHandle();
  const frame = await handle.contentFrame();
  await frame.waitForFunction(() => {
    const d = document.querySelector('deck-stage');
    return d && typeof d.length === 'number' && d.length > 0;
  });
  return frame;
}
const deckState = (frame) => frame.evaluate(() => {
  const d = document.querySelector('deck-stage');
  return { index: d.index, total: d.length };
});

// ---------------------------------------------------------------------------
test.describe('gallery', () => {
  test('card shows thumbnail, name, tagline, author and links to the detail page', async ({ page }) => {
    await page.goto('index.html');
    const card = page.locator(`a.card[href="t/${SLUG}/"]`);
    await expect(card).toHaveCount(1);
    await expect(card.locator('h2')).toHaveText(meta.name);
    await expect(card).toContainText(meta.tagline);
    await expect(card.locator('.by')).toContainText('Zara Zhang');

    const img = card.locator('img');
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBeGreaterThan(0);

    await page.screenshot({ path: artifactPath('gallery.png'), fullPage: true });

    await card.click();
    await expect(page).toHaveURL(new RegExp(`/t/${SLUG}/$`));
    await expect(page.locator('h1')).toHaveText(meta.name);
  });
});

// ---------------------------------------------------------------------------
test.describe('detail page', () => {
  test('iframe is sandboxed with allow-scripts only', async ({ page }) => {
    await page.goto(DETAIL);
    const sandbox = await page.locator('iframe#preview').getAttribute('sandbox');
    expect(sandbox?.trim()).toBe('allow-scripts');
  });

  for (const vp of [{ width: 1280, height: 800, tag: 'desktop' }, { width: 390, height: 844, tag: 'phone' }]) {
    test(`iframe box is 16:9 and no horizontal scroll at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(DETAIL);
      await previewFrame(page);
      const box = await page.locator('iframe#preview').boundingBox();
      const ratio = box.width / box.height;
      expect(Math.abs(ratio - 16 / 9) / (16 / 9), `iframe ${box.width}x${box.height}`).toBeLessThanOrEqual(0.01);
      const scroll = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(scroll.sw, `scrollWidth ${scroll.sw} > clientWidth ${scroll.cw}`).toBeLessThanOrEqual(scroll.cw);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
      await page.screenshot({ path: artifactPath(`detail-${vp.tag}.png`), fullPage: true });
    });
  }

  test('Prev/Next paging moves the deck and is clamped at both ends', async ({ page }) => {
    const expected = countUpstreamSlides();
    expect(expected, 'upstream deck slide count').toBe(12);
    test.info().annotations.push({ type: 'note', description: `template.json slide_count=${meta.slide_count}, actual=${expected}` });

    await page.goto(DETAIL);
    const frame = await previewFrame(page);
    expect((await deckState(frame)).total).toBe(expected);

    const counter = page.locator('#counter');
    const prev = page.locator('#prev');
    const next = page.locator('#next');
    const iframe = page.locator('iframe#preview');
    await expect(counter).toHaveText(`1 / ${expected}`);
    await expect(prev).toBeDisabled();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2200); // deck overlay fades after 1.8 s
    const shot1 = await iframe.screenshot();
    await next.click();
    await expect(counter).toHaveText(`2 / ${expected}`);
    expect((await deckState(frame)).index).toBe(1);
    await page.waitForTimeout(400);
    const shot2 = await iframe.screenshot();
    expect(shot1.equals(shot2), 'iframe pixels unchanged after Next').toBe(false);
    const active = await frame.evaluate(() => document.querySelector('[data-deck-active]')?.getAttribute('data-label'));
    expect(active).toMatch(/^02\b/);

    await prev.click();
    await expect(counter).toHaveText(`1 / ${expected}`);
    expect((await deckState(frame)).index).toBe(0);
    await expect(prev).toBeDisabled();

    // Walk to the end with the button.
    for (let i = 2; i <= expected; i++) {
      await next.click();
      await expect(counter).toHaveText(`${i} / ${expected}`);
    }
    await expect(next).toBeDisabled();
    // Push past the end with the keyboard: must clamp, not wrap.
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(700);
    await expect(counter).toHaveText(`${expected} / ${expected}`);
    expect((await deckState(frame)).index).toBe(expected - 1);

    // Back to the start and past it.
    for (let i = 0; i < expected + 1; i++) await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText(`1 / ${expected}`);
    expect((await deckState(frame)).index).toBe(0);
  });

  test('arrow keys on the detail page page the deck', async ({ page }) => {
    await page.goto(DETAIL);
    const frame = await previewFrame(page);
    const counter = page.locator('#counter');
    await expect(counter).toHaveText(/^1 \/ \d+$/);
    await page.locator('h1').click(); // focus in the parent document
    await page.keyboard.press('ArrowRight');
    await expect(counter).toHaveText(/^2 \/ \d+$/);
    expect((await deckState(frame)).index).toBe(1);
    await page.keyboard.press('ArrowRight');
    await expect(counter).toHaveText(/^3 \/ \d+$/);
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText(/^2 \/ \d+$/);
    expect((await deckState(frame)).index).toBe(1);
  });

  test('copy prompt buttons put PROMPT.md / PROMPT.zh.md on the clipboard', async ({ page, context, baseURL }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseURL).origin });
    const { entries } = readZip(fs.readFileSync(path.join(SITE, 'zip', `${SLUG}.zip`)));
    const file = (n) => entries.find((e) => e.name === `${SLUG}/${n}`)?.data.toString('utf8');
    const promptEn = file('PROMPT.md');
    const promptZh = file('PROMPT.zh.md');
    expect(promptEn, 'PROMPT.md in zip').toBeTruthy();
    expect(promptZh, 'PROMPT.zh.md in zip').toBeTruthy();

    await page.goto(DETAIL);
    const buttons = page.locator('[data-copy]');
    await expect(buttons).toHaveCount(2);

    for (const [sel, expected, label] of [
      ['[data-copy="prompt-en"]', promptEn, 'en'],
      ['[data-copy="prompt-zh"]', promptZh, 'zh'],
    ]) {
      await page.evaluate(() => navigator.clipboard.writeText('__sentinel__'));
      await page.locator(sel).click();
      await expect(page.locator('.copy-status')).not.toBeEmpty();
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip, `${label} clipboard was not updated`).not.toBe('__sentinel__');
      expect(normalizeEol(clip), `${label} clipboard differs from zip prompt`).toBe(normalizeEol(expected));
    }
  });

  test('attribution: author, license, source links, not official', async ({ page }) => {
    await page.goto(DETAIL);
    const attr = page.locator('section.attribution');
    await expect(attr).toContainText('Zara Zhang');
    await expect(attr).toContainText('MIT');
    await expect(page.locator(`a[href="${SOURCE_DIR_URL}"]`).first()).toBeVisible();
    expect(await page.locator(`a[href^="${SKILL_REPO}"]`).count()).toBeGreaterThan(0);
    await expect(page.locator('.hero .by')).toContainText('Zara Zhang');
  });

  test('"Slides in demo" matches the real slide count of the deck', async ({ page }) => {
    await page.goto(DETAIL);
    const frame = await previewFrame(page);
    const actual = (await deckState(frame)).total;
    expect(actual).toBe(countUpstreamSlides());
    await expect(page.locator('dl.meta dt:text-is("Slides in demo") + dd'),
      `deck has ${actual}; template.json slide_count=${meta.slide_count}`).toHaveText(String(actual));
  });

  test('preview renders with the template\'s declared display font', async ({ page }) => {
    const fontFiles = [];
    page.on('requestfinished', (r) => { if (/fonts\.gstatic\.com\/.*spacegrotesk/i.test(r.url())) fontFiles.push(r.url()); });
    await page.goto(DETAIL);
    const frame = await previewFrame(page);
    await page.waitForLoadState('networkidle');
    await expect.poll(() => fontFiles.length, 'Space Grotesk woff2 requested from fonts.gstatic.com').toBeGreaterThan(0);
    const r = await frame.evaluate(async (family) => {
      await document.fonts.ready;
      const h = document.querySelector('[data-deck-active] h1, [data-deck-active] .title');
      return {
        computed: getComputedStyle(h).fontFamily,
        deckStage: getComputedStyle(document.querySelector('deck-stage')).fontFamily,
        loaded: [...document.fonts].some((f) => f.family.replace(/["']/g, '') === family && f.status === 'loaded'),
      };
    }, meta.typography.display);
    expect.soft(r.computed, `cover title font-family (deck-stage host font is ${r.deckStage})`).toMatch(new RegExp(`^["']?${meta.typography.display}`));
    expect.soft(r.loaded, `${meta.typography.display} never loaded in the preview`).toBe(true);
  });

  test('preview copy carries the font fix; upstream files are untouched', async () => {
    const preview = fs.readFileSync(path.join(SITE, 'preview', SLUG, 'template.html'), 'utf8');
    expect(preview).toContain('deck-stage { font-family: inherit; }');
    const upstream = fs.readFileSync(path.join(UPSTREAM_TEMPLATE_DIR, 'template.html'), 'utf8');
    expect(upstream).not.toContain('slides-commons');
    expect(fs.readFileSync(path.join(SITE, 'preview', SLUG, 'deck-stage.js'))
      .equals(fs.readFileSync(path.join(UPSTREAM_TEMPLATE_DIR, 'deck-stage.js')))).toBe(true);
  });

  test('design description and palette swatches render', async ({ page }) => {
    await page.goto(DETAIL);
    const about = page.locator('section.about');
    const desc = (await about.locator('> p').first().textContent()).trim();
    expect(desc.length, 'design description').toBeGreaterThan(20);
    expect(desc).not.toBe(meta.tagline); // should come from design.md front matter

    const sw = about.locator('.swatches li');
    const expectedColors = Object.entries(meta.palette).filter(([k]) => k !== 'description');
    await expect(sw).toHaveCount(expectedColors.length);
    for (let i = 0; i < expectedColors.length; i++) {
      const s = sw.nth(i).locator('.sw');
      const bb = await s.boundingBox();
      expect(bb && bb.width > 0 && bb.height > 0, `swatch ${i} has no size`).toBe(true);
      const bg = await s.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg, `swatch ${i} background`).not.toMatch(/^(transparent|rgba\(0, 0, 0, 0\))$/);
      await expect(sw.nth(i)).toContainText(expectedColors[i][1]);
    }
  });
});

// ---------------------------------------------------------------------------
test.describe('every page', () => {
  for (const url of ['index.html', DETAIL, 'credits.html']) {
    test(`footer with attribution and no "official" claims on ${url}`, async ({ page }) => {
      await page.goto(url);
      const footer = page.locator('footer.site-footer');
      await expect(footer).toHaveCount(1);
      await expect(footer).toContainText('Zara Zhang');
      await expect(footer).toContainText('MIT');
      expect(await footer.locator('a[href="https://github.com/zarazhangrui/beautiful-html-templates"]').count()).toBeGreaterThan(0);
      expect(await footer.locator(`a[href="${SKILL_REPO}"]`).count()).toBeGreaterThan(0);
      await expect(footer).toContainText(/not affiliated/i);

      const text = await page.locator('body').innerText();
      const bad = text.split(/(?<=[.!?。])\s*|\n/)
        .filter((s) => /official|官方/i.test(s))
        .filter((s) => !/\b(not|nothing|no|isn't)\b|不是|无关联|非/i.test(s));
      expect(bad, 'sentences that could claim official status').toEqual([]);
    });
  }

  for (const url of ['index.html', DETAIL, 'credits.html', `preview/${SLUG}/template.html`]) {
    test(`no console errors, failed requests, or off-whitelist hosts on ${url}`, async ({ page, baseURL }) => {
      const log = monitor(page);
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      if (url === DETAIL) await previewFrame(page);
      await page.waitForTimeout(500);
      await page.waitForLoadState('networkidle');

      const own = new URL(baseURL).host;
      const external = log.requests.filter((r) => /^https?:/.test(r.url) && new URL(r.url).host !== own);
      const isPreviewPage = url.startsWith('preview/');
      // Site's own documents (main frame of index/detail/credits) must not go external at all.
      const siteExternal = isPreviewPage ? [] : external.filter((r) => r.isMain);
      const offList = external.filter((r) => !EXTERNAL_WHITELIST.includes(hostOf(r.url)));

      test.info().annotations.push({ type: 'requests', description: log.requests.map((r) => `${r.isMain ? 'main' : 'frame'} ${r.url}`).join('\n') });
      expect.soft(log.consoleErrors, 'console errors').toEqual([]);
      expect.soft(log.pageErrors, 'page errors').toEqual([]);
      expect.soft(log.failed, 'failed requests').toEqual([]);
      expect.soft(log.badStatus, 'HTTP >= 400').toEqual([]);
      expect.soft(siteExternal.map((r) => r.url), 'external requests from the site page itself').toEqual([]);
      expect.soft(offList.map((r) => r.url), 'external requests outside whitelist').toEqual([]);
    });
  }
});
