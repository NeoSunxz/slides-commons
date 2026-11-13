// Gallery (EN and ZH): cards, search, filters, hash state, language switch, no-JS, thumbnails, weight.
import { test, expect } from './font-cache.mjs';
import { ALL_SLUGS, CATALOG, COLLECTION_SLUGS, COLLECTION_SOURCE_ID, SOURCES_JSON, upstreamMeta, artifactPath, monitor, settled } from './helpers.mjs';

const META = ALL_SLUGS.map((slug) => ({ slug, ...upstreamMeta(slug) }));
const searchText = (t) => [t.name, t.tagline, ...t.mood, ...t.tone, t.best_for, t.slug].join(' ').toLowerCase();
const bySlugs = (list) => list.map((t) => t.slug).sort();
const SCHEMES = ['light', 'dark', 'mixed'];
const count = (fn) => META.filter(fn).length;

const LANGS = {
  en: { url: 'index.html', clear: 'Clear filters', countRe: (n) => new RegExp(`^${n} of ${META.length} templates$`), schemeLabel: { light: 'Light', dark: 'Dark', mixed: 'Mixed' } },
  zh: { url: 'zh/index.html', clear: '清除筛选', countRe: (n) => new RegExp(`共 ${META.length} 个模板，显示 ${n} 个`) },
};

const visibleSlugs = (page) => page.evaluate(() => [...document.querySelectorAll('#grid > li')]
  .filter((li) => !li.hidden && getComputedStyle(li).display !== 'none')
  .map((li) => li.querySelector('a.card').getAttribute('href').replace(/^t\/|\/(index\.html)?$/g, '')).sort());
const chip = (page, group, value) => page.locator(`button.chip[data-group="${group}"][data-value="${value}"]`);

// Moods: choose two common moods that give a non-trivial OR and AND.
const moodCounts = new Map();
for (const t of META) for (const m of t.mood.map((x) => x.toLowerCase())) moodCounts.set(m, (moodCounts.get(m) ?? 0) + 1);
const MOODS = [...moodCounts].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);

for (const [lang, L] of Object.entries(LANGS)) {
  test.describe(`gallery [${lang}]`, () => {
    test.beforeEach(async ({ page }) => { await page.goto(L.url); await expect(page.locator('#filters')).toBeVisible(); });

    test('one card per template (all sources), each linking to its detail page; count text', async ({ page }) => {
      expect(META.length).toBeGreaterThan(34);
      expect(await visibleSlugs(page)).toEqual([...ALL_SLUGS]);
      await expect(page.locator('#fcount')).toHaveText(L.countRe(META.length));
      await expect(page.locator('#fclear')).toBeHidden();
    });

    test('search narrows results ("retro")', async ({ page }) => {
      const expected = bySlugs(META.filter((t) => searchText(t).includes('retro')));
      expect(expected.length, 'sanity: some templates match "retro"').toBeGreaterThan(0);
      expect(expected.length).toBeLessThan(META.length);
      await page.locator('#q').fill('retro');
      expect(await visibleSlugs(page)).toEqual(expected);
      await expect(page.locator('#fcount')).toHaveText(L.countRe(expected.length));
      // Two words are ANDed; nonsense shows the empty state.
      await page.locator('#q').fill('retro windows');
      expect(await visibleSlugs(page)).toEqual(bySlugs(META.filter((t) => ['retro', 'windows'].every((w) => searchText(t).includes(w)))));
      await page.locator('#q').fill('zzzz-no-such-template');
      expect(await visibleSlugs(page)).toEqual([]);
      await expect(page.locator('#fnone')).toBeVisible();
    });

    test('scheme chips show and apply counts derived from template.json', async ({ page }) => {
      const derived = Object.fromEntries(SCHEMES.map((s) => [s, count((t) => t.scheme === s)]));
      expect(Object.values(derived).reduce((a, b) => a + b, 0)).toBe(META.length);
      for (const s of SCHEMES.filter((x) => derived[x] > 0)) {
        await expect(chip(page, 'scheme', s).locator('.n'), `${s} chip number`).toHaveText(String(derived[s]));
        await chip(page, 'scheme', s).click();
        await expect(chip(page, 'scheme', s)).toHaveAttribute('aria-pressed', 'true');
        expect(await visibleSlugs(page), `${s} filter`).toEqual(bySlugs(META.filter((t) => t.scheme === s)));
        await expect(page.locator('#fcount')).toHaveText(L.countRe(derived[s]));
        await chip(page, 'scheme', s).click();
      }
      // Two schemes in the same group are ORed.
      await chip(page, 'scheme', 'light').click();
      await chip(page, 'scheme', 'dark').click();
      expect(await visibleSlugs(page)).toEqual(bySlugs(META.filter((t) => ['light', 'dark'].includes(t.scheme))));
    });

    test('mood: OR inside the group, AND across groups; Clear filters resets', async ({ page }) => {
      const [m1, m2] = MOODS;
      const has = (t, m) => t.mood.map((x) => x.toLowerCase()).includes(m);
      await chip(page, 'mood', m1).click();
      expect(await visibleSlugs(page), `mood ${m1}`).toEqual(bySlugs(META.filter((t) => has(t, m1))));
      await chip(page, 'mood', m2).click();
      const orSet = META.filter((t) => has(t, m1) || has(t, m2));
      expect(await visibleSlugs(page), `mood ${m1} OR ${m2}`).toEqual(bySlugs(orSet));
      expect(orSet.length).toBeGreaterThan(META.filter((t) => has(t, m1)).length);

      await chip(page, 'scheme', 'light').click();
      const andSet = orSet.filter((t) => t.scheme === 'light');
      expect(await visibleSlugs(page), `(${m1} OR ${m2}) AND light`).toEqual(bySlugs(andSet));
      expect(andSet.length).toBeLessThan(orSet.length);

      await page.locator('#q').fill('a');
      const withText = andSet.filter((t) => searchText(t).includes('a'));
      expect(await visibleSlugs(page)).toEqual(bySlugs(withText));

      const clear = page.locator('#fclear');
      await expect(clear).toBeVisible();
      await expect(clear).toHaveText(L.clear);
      await clear.click();
      expect(await visibleSlugs(page)).toEqual([...ALL_SLUGS]);
      await expect(page.locator('#q')).toHaveValue('');
      await expect(page.locator('button.chip[aria-pressed="true"]')).toHaveCount(0);
      await expect(clear).toBeHidden();
      expect(new URL(page.url()).hash).toBe('');
    });

    test('hash state restores filters on reload and survives the language switch', async ({ page }) => {
      const [m1, m2] = MOODS;
      await chip(page, 'scheme', 'dark').click();
      await chip(page, 'mood', m1).click();
      await chip(page, 'mood', m2).click();
      await page.locator('#q').fill('e');
      const hash = new URL(page.url()).hash;
      expect(hash).toMatch(/scheme=dark/);
      expect(hash).toContain(`mood=${m1},${m2}`);
      expect(hash).toMatch(/q=e/);
      const before = await visibleSlugs(page);
      expect(before.length).toBeGreaterThan(0);

      await page.reload();
      expect(await visibleSlugs(page), 'after reload').toEqual(before);
      await expect(chip(page, 'scheme', 'dark')).toHaveAttribute('aria-pressed', 'true');
      await expect(chip(page, 'mood', m1)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#q')).toHaveValue('e');

      // The language switch carries the same hash and the other page applies it.
      const other = lang === 'en' ? 'zh' : 'en';
      const sw = page.locator(`a[data-lang-switch="${other}"]`);
      expect(await sw.getAttribute('href')).toContain(hash);
      await sw.click();
      await expect(page).toHaveURL(new RegExp(lang === 'en' ? '/zh/index\\.html' : '/index\\.html'));
      expect(new URL(page.url()).hash).toBe(hash);
      await expect(page.locator('#filters')).toBeVisible();
      expect(await visibleSlugs(page), 'after language switch').toEqual(before);
    });

    test('source group lists every source with its count and filters cards', async ({ page }) => {
      const ids = SOURCES_JSON.sources.map((x) => x.id);
      expect(ids.length).toBeGreaterThan(1);
      await expect(page.locator('button.chip[data-group="source"]')).toHaveCount(ids.length);
      for (const id of ids) {
        const mine = CATALOG.filter((t) => t.source === id).map((t) => t.slug).sort();
        await expect(chip(page, 'source', id).locator('.n'), `${id} chip number`).toHaveText(String(mine.length));
        await chip(page, 'source', id).click();
        expect(await visibleSlugs(page), `source ${id}`).toEqual(mine);
        await expect(page.locator('#fcount')).toHaveText(L.countRe(mine.length));
        expect(new URL(page.url()).hash).toContain(`source=${id}`);
        await chip(page, 'source', id).click();
      }
      // Source ANDs with scheme.
      await chip(page, 'source', COLLECTION_SOURCE_ID).click();
      await chip(page, 'scheme', 'dark').click();
      expect(await visibleSlugs(page)).toEqual(bySlugs(META.filter((t) => COLLECTION_SLUGS.includes(t.slug) && t.scheme === 'dark')));
    });

    test('thumbnails load for every card after scrolling; no console errors', async ({ page }) => {
      const log = monitor(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      const n = await page.locator('#grid img').count();
      expect(n).toBe(META.length);
      for (let i = 0; i < n; i++) await page.locator('#grid img').nth(i).scrollIntoViewIfNeeded();
      await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('#grid img')].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute('src'))),
        { message: 'thumbnails without naturalWidth' }).toEqual([]);
      await settled(log, expect);
      expect(log.consoleErrors).toEqual([]);
      expect(log.failed).toEqual([]);
      expect(log.badStatus).toEqual([]);
    });

    test('screenshots: desktop and phone', async ({ page }) => {
      for (const [tag, w, h] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(L.url);
        const n = await page.locator('#grid img').count();
        for (let i = 0; i < n; i += 4) await page.locator('#grid img').nth(i).scrollIntoViewIfNeeded();
        await page.locator('#grid img').nth(n - 1).scrollIntoViewIfNeeded();
        await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('#grid img')].every((i) => i.complete))).toBe(true);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over, `${lang} ${tag} horizontal overflow`).toBeLessThanOrEqual(0);
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: artifactPath(`gallery-${lang}-${tag}.png`), fullPage: true });
      }
    });
  });
}

test('EN home: first load transfers less than 2.5 MB', async ({ page }) => {
  const requests = [];
  page.on('requestfinished', (r) => requests.push(r));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('index.html');
  await expect(page.locator('#filters')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.readyState)).toBe('complete');
  await settled({ inflight: new Set(requests.filter((r) => !r.response)) }, expect).catch(() => {});
  let total = 0;
  for (const r of requests) { const s = await r.sizes(); total += s.responseBodySize + s.responseHeadersSize; }
  test.info().annotations.push({ type: 'transfer', description: `${requests.length} requests, ${(total / 1024).toFixed(0)} KiB` });
  expect(total, `first load transferred ${(total / 1048576).toFixed(2)} MB`).toBeLessThan(2.5 * 1024 * 1024);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const [lang, L] of Object.entries(LANGS)) {
    test(`[${lang}] all cards are visible and the filter panel stays hidden`, async ({ page }) => {
      await page.goto(L.url);
      expect(await visibleSlugs(page)).toEqual([...ALL_SLUGS]);
      await expect(page.locator('#filters')).toBeHidden();
      await expect(page.locator('#fnone')).toBeHidden();
      // Cards are plain links.
      await expect(page.locator('#grid a.card').first()).toHaveAttribute('href', /^t\/.+\//);
    });
  }
});
