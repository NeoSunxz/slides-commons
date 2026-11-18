// Gallery (EN and ZH): cards, search, filters, hash state, language switch, no-JS, thumbnails, weight.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from './font-cache.mjs';
import { ROOT, ALL_SLUGS, CATALOG, COLLECTION_SLUGS, COLLECTION_SOURCE_ID, SOURCES_JSON, upstreamMeta, artifactPath, monitor, settled } from './helpers.mjs';

const TAGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'tags.json'), 'utf8')).groups;
const groupOfTag = new Map(TAGS.flatMap((g) => g.tags.map((tag) => [tag, g.id])));
const META = ALL_SLUGS.map((slug) => {
  const m = upstreamMeta(slug);
  return { slug, ...m, groups: [...new Set(m.mood.map((x) => groupOfTag.get(x.toLowerCase())))] };
});
// Search matches the original mood/tone tags (not only the 12 groups), the name, tagline, best_for, slug and author.
// The group part of the haystack is the group's label in the page language (English id, or the Chinese label).
const groupLabel = (id, lang) => (lang === 'zh' ? TAGS.find((g) => g.id === id).zh : id);
const searchTextFor = (lang) => (t) => [t.name, t.tagline, ...t.mood, ...t.tone, t.best_for, t.slug, ...t.groups.map((g) => groupLabel(g, lang)), ...authorsOf(t.slug)].join(' ').toLowerCase();
const bySlugs = (list) => list.map((t) => t.slug).sort();
const SCHEMES = ['light', 'dark', 'mixed'];
const authorsOf = (slug) => {
  const t = CATALOG.find((x) => x.slug === slug);
  const meta = upstreamMeta(slug);
  return meta.authors?.length ? meta.authors.map((x) => x.name) : [SOURCES_JSON.sources.find((x) => x.id === t.source).author];
};
const AUTHORS = new Map();
for (const slug of ALL_SLUGS) for (const n of authorsOf(slug)) AUTHORS.set(n, [...(AUTHORS.get(n) ?? []), slug]);
const count = (fn) => META.filter(fn).length;

const LANGS = {
  en: { url: 'gallery/', clear: 'Clear filters', countRe: (n) => new RegExp(`^${n} of ${META.length} templates$`), schemeLabel: { light: 'Light', dark: 'Dark', mixed: 'Mixed' } },
  zh: { url: 'zh/gallery/', clear: '清除筛选', countRe: (n) => new RegExp(`共 ${META.length} 个模板，显示 ${n} 个`) },
};

const visibleSlugs = (page) => page.evaluate(() => [...document.querySelectorAll('#grid > li')]
  .filter((li) => !li.hidden && getComputedStyle(li).display !== 'none')
  .map((li) => li.querySelector('a.card').getAttribute('href').replace(/^(?:\.\.\/)*(?:zh\/)?t\/|\/(index\.html)?$/g, '')).sort());
const chip = (page, group, value) => page.locator(`button.chip[data-group="${group}"][data-value="${value}"]`);

// Moods are the 12 groups of src/tags.json: choose two common groups that give a non-trivial OR and AND.
const GROUP_IDS = TAGS.map((g) => g.id);
const groupCounts = new Map(GROUP_IDS.map((id) => [id, META.filter((t) => t.groups.includes(id)).length]));
const MOODS = [...groupCounts].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);
// "More filters" (author, license) is a collapsed <details>: open it before touching those chips.
const ensureMore = async (page) => {
  const d = page.locator('details.filter-extra');
  if (!(await d.evaluate((e) => e.open))) await d.locator('summary').click();
};

for (const [lang, L] of Object.entries(LANGS)) {
  test.describe(`gallery [${lang}]`, () => {
    const searchText = searchTextFor(lang);
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
      const has = (t, m) => t.groups.includes(m);
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
      await expect(page).toHaveURL(new RegExp(lang === 'en' ? '/zh/gallery/' : '/gallery/'));
      expect(new URL(page.url()).hash).toBe(hash);
      await expect(page.locator('#filters')).toBeVisible();
      expect(await visibleSlugs(page), 'after language switch').toEqual(before);
    });

    test('author group lists each resolved author with its count and filters cards (hash round-trip)', async ({ page }) => {
      expect(AUTHORS.size).toBeGreaterThan(1);
      await ensureMore(page);
      await expect(page.locator('button.chip[data-group="source"]'), 'no source chips any more').toHaveCount(0);
      await expect(page.locator('button.chip[data-group="author"]')).toHaveCount(AUTHORS.size);
      for (const [name, slugs] of AUTHORS) {
        await expect(chip(page, 'author', name).locator('.n'), `${name} chip number`).toHaveText(String(slugs.length));
        await chip(page, 'author', name).click();
        expect(await visibleSlugs(page), `author ${name}`).toEqual([...slugs].sort());
        await expect(page.locator('#fcount')).toHaveText(L.countRe(slugs.length));
        const hash = new URL(page.url()).hash;
        expect(hash).toMatch(/^#author=/);
        expect(hash).not.toMatch(/source=/);
        await page.reload();
        await expect(chip(page, 'author', name)).toHaveAttribute('aria-pressed', 'true');
        expect(await visibleSlugs(page), `author ${name} after reload`).toEqual([...slugs].sort());
        await chip(page, 'author', name).click();
        expect(new URL(page.url()).hash).toBe('');
      }
      // Several authors are ORed; the author group ANDs with scheme.
      const names = [...AUTHORS.keys()];
      for (const n of names) await chip(page, 'author', n).click();
      expect(await visibleSlugs(page)).toEqual([...ALL_SLUGS]);
      expect(new URL(page.url()).hash).toContain('author=');
      await page.reload();
      for (const n of names) await expect(chip(page, 'author', n)).toHaveAttribute('aria-pressed', 'true');
      for (const n of names.slice(1)) await chip(page, 'author', n).click();
      await chip(page, 'scheme', 'dark').click();
      expect(await visibleSlugs(page)).toEqual(bySlugs(META.filter((t) => t.scheme === 'dark' && AUTHORS.get(names[0]).includes(t.slug))));
    });

    test('cards carry data-author (and data-source)', async ({ page }) => {
      const got = await page.evaluate(() => [...document.querySelectorAll('#grid > li')].map((li) => [li.querySelector('a.card').getAttribute('href').replace(/^(?:\.\.\/)*(?:zh\/)?t\/|\/(index\.html)?$/g, ''), li.getAttribute('data-author'), li.getAttribute('data-source')]));
      expect(got.length).toBe(META.length);
      for (const [slug, author, source] of got) {
        expect(author, slug).toBe(authorsOf(slug).join('|'));
        expect(source, slug).toBe(CATALOG.find((t) => t.slug === slug).source);
      }
    });

    test('old #source=<id> hash is ignored: page loads unfiltered, no chip pressed, no errors', async ({ page }) => {
      const log = monitor(page);
      await page.goto(`${L.url}#source=${COLLECTION_SOURCE_ID}`);
      await expect(page.locator('#filters')).toBeVisible();
      expect(await visibleSlugs(page)).toEqual([...ALL_SLUGS]);
      await expect(page.locator('button.chip[aria-pressed="true"]')).toHaveCount(0);
      await expect(page.locator('#fclear')).toBeHidden();
      await expect(page.locator('#fcount')).toHaveText(L.countRe(META.length));
      // A real filter still works afterwards.
      await ensureMore(page);
      const [name, slugs] = [...AUTHORS][0];
      await chip(page, 'author', name).click();
      expect(await visibleSlugs(page)).toEqual([...slugs].sort());
      expect(log.consoleErrors).toEqual([]);
    });

    test('author hash from a link applies on load; unknown author shows nothing and Clear recovers', async ({ page }) => {
      const [name, slugs] = [...AUTHORS][0];
      await page.goto(`${L.url}#author=${encodeURIComponent(name)}`);
      expect(await visibleSlugs(page)).toEqual([...slugs].sort());
      await page.goto(`${L.url}#author=Nobody+Atall`);
      await page.reload();
      expect(await visibleSlugs(page)).toEqual([]);
      await page.locator('#fclear').click();
      expect(await visibleSlugs(page)).toEqual([...ALL_SLUGS]);
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

test('EN gallery: first load transfers less than 2.5 MB', async ({ page }) => {
  const requests = [];
  page.on('requestfinished', (r) => requests.push(r));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('gallery/');
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
      await expect(page.locator('#grid a.card').first()).toHaveAttribute('href', /^(?:\.\.\/)+(?:zh\/)?t\/.+\//);
    });
  }
});
