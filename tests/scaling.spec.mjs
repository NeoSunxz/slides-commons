// Scaled preview (fixed 1920x1080 iframe, CSS-scaled), fullscreen, 8-bit-orbit overlay, detail layout.
import { test, expect } from './font-cache.mjs';
import { SLUG, artifactPath, previewFrame, settled, monitor } from './helpers.mjs';

test.describe.configure({ mode: 'parallel' });

const DETAIL = (lang, slug = SLUG) => (lang === 'en' ? `t/${slug}/` : `zh/t/${slug}/`);
const near = (a, b, tol = 1.5) => Math.abs(a - b) <= tol;

async function geometry(page) {
  return page.evaluate(() => {
    const f = document.getElementById('preview');
    const w = document.getElementById('preview-wrap');
    const r = f.getBoundingClientRect();
    const wr = w.getBoundingClientRect();
    const cs = getComputedStyle(f);
    return {
      css: { w: f.offsetWidth, h: f.offsetHeight, cw: cs.width, ch: cs.height },
      scaled: w.classList.contains('scaled'),
      box: { x: r.x, y: r.y, w: r.width, h: r.height },
      frame: { x: wr.x, y: wr.y, w: wr.width, h: wr.height },
    };
  });
}
const expect169 = (b, what) => expect(Math.abs(b.w / b.h - 16 / 9) / (16 / 9), `${what} ${b.w}x${b.h}`).toBeLessThanOrEqual(0.01);
const fits = (inner, outer) => inner.x >= outer.x - 1.5 && inner.y >= outer.y - 1.5 && inner.x + inner.w <= outer.x + outer.w + 1.5 && inner.y + inner.h <= outer.y + outer.h + 1.5;

// ---------------------------------------------------------------------------
for (const [w, h] of [[1440, 900], [1280, 720], [390, 844]]) {
  test(`scaled preview at ${w}x${h}: iframe is 1920x1080 in CSS, 16:9 and inside its frame`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(DETAIL('en'));
    await previewFrame(page);
    await expect(page.locator('#preview-wrap')).toHaveClass(/scaled/);
    const g = await geometry(page);
    expect([g.css.w, g.css.h], 'iframe CSS size').toEqual([1920, 1080]);
    expect169(g.box, 'iframe bounding box');
    expect(fits(g.box, g.frame), `iframe ${JSON.stringify(g.box)} inside frame ${JSON.stringify(g.frame)}`).toBe(true);
    // The scaled iframe fills the frame (no large empty margin).
    expect(near(g.box.w, g.frame.w, 6), `iframe width ${g.box.w} vs frame ${g.frame.w}`).toBe(true);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, 'horizontal overflow').toBeLessThanOrEqual(0);
  });
}

test('fullscreen: iframe scales to the screen, letterboxed 16:9; normal size after exit', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(DETAIL('en'));
  await previewFrame(page);
  test.skip(!(await page.evaluate(() => document.fullscreenEnabled)), 'fullscreen unsupported');
  const before = await geometry(page);

  await page.locator('#fullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('preview-wrap');
  // Wait until the iframe has been rescaled to the screen (width follows the screen).
  await expect.poll(async () => Math.round((await geometry(page)).box.w), { message: 'iframe rescaled in fullscreen' }).toBeGreaterThan(Math.round(before.box.w) + 100);
  const fs = await geometry(page);
  const vw = await page.evaluate(() => innerWidth), vh = await page.evaluate(() => innerHeight);
  expect([fs.css.w, fs.css.h]).toEqual([1920, 1080]);
  expect169(fs.box, 'fullscreen iframe');
  expect(fits(fs.box, { x: 0, y: 0, w: vw, h: vh }), `fullscreen iframe ${JSON.stringify(fs.box)} within ${vw}x${vh}`).toBe(true);
  // 1440x900 is 16:10, so the 16:9 deck is limited by width and letterboxed top/bottom, centred.
  expect(near(fs.box.w, vw, 2), `width ${fs.box.w} vs screen ${vw}`).toBe(true);
  expect(near(fs.box.y + fs.box.h / 2, vh / 2, 2), 'vertically centred').toBe(true);

  await page.evaluate(() => document.exitFullscreen());
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  await expect.poll(async () => Math.round((await geometry(page)).box.w)).toBe(Math.round(before.box.w));
  const after = await geometry(page);
  expect169(after.box, 'iframe after exit');
  expect(fits(after.box, after.frame)).toBe(true);
});

// ---------------------------------------------------------------------------
test('8-bit-orbit: the deck slide counter does not overlap the feature buttons', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(DETAIL('en', '8-bit-orbit'));
  const frame = await (await page.locator('iframe#preview').elementHandle()).contentFrame();
  await frame.waitForLoadState('load');
  await expect(page.locator('#counter')).toHaveText(/^1 \/ \d+$/);
  const idx = await frame.evaluate(() => [...document.querySelectorAll('.slide')].findIndex((s) => s.querySelectorAll('.pixel-btn').length === 3));
  expect(idx, 'slide with feature buttons exists').toBeGreaterThanOrEqual(0);
  for (let i = 1; i <= idx; i++) {
    await page.locator('#next').click();
    await expect(page.locator('#counter')).toHaveText(new RegExp(`^${i + 1} /`), { timeout: 15_000 });
  }
  // Wait until the slide-change transition has stopped (button position unchanged for 12 frames).
  await frame.evaluate(() => document.fonts.ready);
  await frame.waitForFunction(() => new Promise((resolve) => {
    const el = [...document.querySelectorAll('.slide')].find((x) => x.querySelectorAll('.pixel-btn').length === 3).querySelector('.pixel-btn');
    let last = null, same = 0;
    const tick = () => { const t = el.getBoundingClientRect().top; same = t === last ? same + 1 : 0; last = t; same >= 12 ? resolve(true) : requestAnimationFrame(tick); };
    tick();
  }));
  const res = await frame.evaluate(() => {
    const rc = (r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom });
    const c = rc(document.getElementById('slideCounter').getBoundingClientRect());
    const slide = [...document.querySelectorAll('.slide')].find((x) => x.querySelectorAll('.pixel-btn').length === 3);
    return { c, btns: [...slide.querySelectorAll('.pixel-btn')].map((b) => rc(b.getBoundingClientRect())) };
  });
  expect(res.btns).toHaveLength(3);
  const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  res.btns.forEach((b, i) => expect.soft(overlap(res.c, b), `counter ${JSON.stringify(res.c)} overlaps button ${i + 1} ${JSON.stringify(b)}`).toBe(false));
  await page.locator('#preview-wrap').screenshot({ path: artifactPath('preview-8-bit-orbit-features.png') });
});

// ---------------------------------------------------------------------------
// Detail layout
// ---------------------------------------------------------------------------
const rect = (page, sel) => page.locator(sel).first().evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, top: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom + scrollY, bottom: r.bottom }; });

for (const lang of ['en', 'zh']) {
  for (const [w, h] of [[1440, 900], [1920, 1080]]) {
    test(`[${lang}] layout ${w}x${h}: two columns, sticky panel, details stay in the preview column`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(DETAIL(lang));
      await previewFrame(page);
      const main = await rect(page, 'main.wrap');
      expect(main.w, 'container width').toBeLessThanOrEqual(1440 + 0.5);
      const pv = await rect(page, '.detail > .preview');
      const panel = await rect(page, '.detail > .actions');
      expect(panel.x, `panel.left ${panel.x} vs preview.right ${pv.r}`).toBeGreaterThanOrEqual(pv.r - 0.5);
      expect(panel.r).toBeLessThanOrEqual(w + 0.5);

      // Nothing in the details column runs under the panel.
      const offenders = await page.evaluate((previewRight) => [...document.querySelectorAll('.detail > .details *')]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > previewRight + 1; })
        .map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 40)), pv.r);
      expect(offenders, 'elements of the details column wider than the preview column').toEqual([]);
      const det = await rect(page, '.detail > .details');
      expect(det.r).toBeLessThanOrEqual(pv.r + 1);

      // Sticky panel keeps top:16px after scrolling.
      await page.evaluate(() => scrollTo(0, 600));
      await expect.poll(async () => Math.round((await rect(page, '.detail > .actions')).top)).toBe(16);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over).toBeLessThanOrEqual(0);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: artifactPath(`detail-${lang}-${w}.png`), fullPage: true });
    });

    test(`[${lang}] ${w}x${h}: with "Show prompt" open the panel stays in the viewport and overlaps nothing`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(DETAIL(lang));
      await previewFrame(page);
      await page.locator('.actions details > summary').click();
      await expect(page.locator('.actions pre.prompt')).toBeVisible();
      await page.evaluate(() => scrollTo(0, 400));
      await expect.poll(async () => Math.round((await rect(page, '.detail > .actions')).top)).toBe(16);
      const panel = await rect(page, '.detail > .actions');
      expect(panel.bottom, 'panel bottom within the viewport').toBeLessThanOrEqual(h + 0.5);
      const scrollable = await page.locator('.actions').evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight, oy: getComputedStyle(el).overflowY }));
      expect(['auto', 'scroll']).toContain(scrollable.oy);
      const pv = await rect(page, '.detail > .preview');
      expect(panel.x).toBeGreaterThanOrEqual(pv.r - 0.5);
      // The prompt box is inside the panel.
      const pre = await page.locator('.actions pre.prompt').evaluate((el) => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right }; });
      expect(pre.l).toBeGreaterThanOrEqual(panel.x - 0.5);
      expect(pre.r).toBeLessThanOrEqual(panel.r + 0.5);
    });
  }

  for (const [w, h] of [[390, 844], [900, 800]]) {
    test(`[${lang}] ${w}x${h}: stacked preview, panel, details; no overflow`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(DETAIL(lang));
      await previewFrame(page);
      const pv = await rect(page, '.detail > .preview');
      const panel = await rect(page, '.detail > .actions');
      const det = await rect(page, '.detail > .details');
      expect(panel.y, 'panel below the preview').toBeGreaterThanOrEqual(pv.b - 0.5);
      expect(det.y, 'details below the panel').toBeGreaterThanOrEqual(panel.b - 0.5);
      const pos = await page.locator('.actions').evaluate((el) => getComputedStyle(el).position);
      expect(pos).not.toBe('sticky');
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, 'horizontal overflow').toBeLessThanOrEqual(0);
      await page.locator('.actions details > summary').click();
      await expect(page.locator('.actions pre.prompt')).toBeVisible();
      const over2 = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over2, 'overflow with prompt open').toBeLessThanOrEqual(0);
      const panel2 = await rect(page, '.detail > .actions');
      const det2 = await rect(page, '.detail > .details');
      expect(det2.y).toBeGreaterThanOrEqual(panel2.b - 0.5);
    });
  }
}

test('screenshots: previews of 8-bit-orbit, raw-grid, coral', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const slug of ['8-bit-orbit', 'raw-grid', 'coral']) {
    const log = monitor(page);
    await page.goto(DETAIL('en', slug));
    await expect(page.locator('#counter')).toHaveText(/^1 \/ \d+$/);
    await settled(log, expect);
    await page.locator('#preview-wrap').screenshot({ path: artifactPath(`preview-${slug}.png`) });
  }
});
