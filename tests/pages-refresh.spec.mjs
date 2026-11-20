// Page refresh: header (Home / Gallery / Credits + GitHub), footer (one line per source), disclaimers,
// gallery mood groups (src/tags.json), author + license filters, detail-page features.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from './font-cache.mjs';
import { ROOT, SLUG, CATALOG, SOURCES_JSON, ALL_SLUGS, upstreamMeta, previewFrame, monitor, settled } from './helpers.mjs';

const TAGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'tags.json'), 'utf8')).groups;
const GROUP_OF = new Map(TAGS.flatMap((g) => g.tags.map((t) => [t, g.id])));
const SOURCES = SOURCES_JSON.sources.filter((s) => CATALOG.some((t) => t.source === s.id));
const REPO = 'https://github.com/NeoSunxz/slides-commons';
const authorOf = (s, lang) => (lang === 'zh' ? (s.authorZh ?? s.author) : s.author);
const licenseOf = (slug) => {
  const m = upstreamMeta(slug);
  return m.license ?? SOURCES_JSON.sources.find((s) => s.id === CATALOG.find((t) => t.slug === slug).source).license;
};
const groupsOf = (slug) => [...new Set(upstreamMeta(slug).mood.map((x) => GROUP_OF.get(x.toLowerCase())))];

const LANG = {
  en: { prefix: '', note: /not affiliated with the original authors/, official: /not the author's official site/, nav: ['Home', 'Gallery', 'Convert', 'Skills', 'Credits'], gallery: 'gallery/', clear: 'Clear filters' },
  zh: { prefix: 'zh/', note: /与原作者无关联/, official: /不是原作者的官方站点/, nav: ['首页', '画廊', '转换', '技能', '致谢'], gallery: 'zh/gallery/', clear: '清除筛选' },
};
const PAGES = (lang) => {
  const p = LANG[lang].prefix;
  return [['home', `${p}index.html`], ['gallery', `${p}gallery/`], ['credits', `${p}credits.html`], ['detail', `${p}t/${SLUG}/`], ['detail (AGPL)', `${p}t/guizang-swiss/`]];
};

// ---------------------------------------------------------------------------
// Header and footer on every page
// ---------------------------------------------------------------------------
for (const lang of ['en', 'zh']) {
  const L = LANG[lang];
  test(`[${lang}] header: five nav links, current page marked, GitHub icon link to the repo, language switch`, async ({ page }) => {
    for (const [name, url] of PAGES(lang)) {
      await page.goto(url);
      const links = page.locator('header.site-header nav.site-nav > a:not(.gh-link)');
      await expect(links, `${name}: nav links`).toHaveCount(5);
      expect((await links.allTextContents()).map((t) => t.trim()), `${name}: nav labels`).toEqual(L.nav);
      const gh = page.locator('header.site-header a.gh-link');
      await expect(gh, `${name}: GitHub link`).toHaveCount(1);
      await expect(gh).toHaveAttribute('href', REPO);
      await expect(gh.locator('svg')).toHaveCount(1);
      expect(await gh.getAttribute('aria-label'), `${name}: accessible name`).toBeTruthy();
      await expect(page.locator('header.site-header a[data-lang-switch]')).toHaveCount(1);
      // Exactly the right entry is aria-current (details belong to the gallery).
      const current = await page.locator('header.site-header [aria-current="page"]').allTextContents();
      if (name === 'home') expect(current.map((t) => t.trim())).toEqual([L.nav[0]]);
      if (name === 'gallery') expect(current.map((t) => t.trim())).toEqual([L.nav[1]]);
      if (name === 'credits') expect(current.map((t) => t.trim())).toEqual([L.nav[4]]);
    }
  });

  test(`[${lang}] header links resolve (Home, Gallery, Credits) and the header stays sticky`, async ({ page }) => {
    await page.goto(`${L.prefix}t/${SLUG}/`);
    const hrefs = await page.locator('header.site-header nav.site-nav > a:not(.gh-link)').evaluateAll((as) => as.map((a) => a.href));
    for (const h of hrefs) {
      const r = await page.request.get(h);
      expect(r.status(), h).toBe(200);
    }
    expect(await page.locator('header.site-header').evaluate((h) => getComputedStyle(h).position)).toBe('sticky');
    await page.evaluate(() => scrollTo(0, 900));
    expect(await page.locator('header.site-header').evaluate((h) => Math.round(h.getBoundingClientRect().top))).toBe(0);
  });

  test(`[${lang}] footer: one line per source with its author, license and repo link, on every page; disclaimer present`, async ({ page }) => {
    for (const [name, url] of PAGES(lang)) {
      await page.goto(url);
      const items = page.locator('footer.site-footer .footer-credits > li');
      await expect(items, `${name}: footer lines`).toHaveCount(SOURCES.length);
      for (let i = 0; i < SOURCES.length; i++) {
        const s = SOURCES[i];
        const li = items.nth(i);
        const text = (await li.textContent()).replace(/\s+/g, ' ');
        expect(text, `${name}: author of ${s.id}`).toContain(authorOf(s, lang));
        expect(text, `${name}: license of ${s.id}`).toContain(s.license);
        const hrefs = await li.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
        expect(hrefs, `${name}: repo link of ${s.id}`).toContain(s.repo);
        expect(hrefs, `${name}: author link of ${s.id}`).toContain(s.authorUrl ?? s.repo);
      }
      // Wording the maintainer fixed: Zara Zhang, NeoSun, Guizang (AGPL-3.0).
      const all = (await page.locator('footer.site-footer .footer-credits').textContent());
      for (const w of ['Zara Zhang', 'NeoSun', lang === 'zh' ? '歸藏' : 'Guizang', 'AGPL-3.0', 'frontend-slides']) expect(all, `${name}: footer mentions ${w}`).toContain(w);
      expect(all, `${name}: style presets derivation`).toMatch(lang === 'zh' ? /部分基于/ : /some based on/);
      // Short disclaimer, with the credits link.
      const note = page.locator('footer.site-footer .footer-note');
      await expect(note).toHaveText(L.note);
      await expect(note.locator('a')).toHaveAttribute('href', /credits\.html$/);
      // No project name variants (CLAUDE.md naming rule) and no "official" claim anywhere in the footer.
      const footer = await page.locator('footer.site-footer').textContent();
      expect(footer).not.toMatch(/beautiful-html-templates\s+gallery|frontend-slides\s+gallery/i);
    }
  });

  test(`[${lang}] detail pages carry the attribution card with the "not the official site" disclaimer`, async ({ page }) => {
    for (const slug of ['neo-grid-bold', 'swiss-modern', 'guizang-editorial']) {
      await page.goto(`${L.prefix}t/${slug}/`);
      const card = page.locator('section.attribution.attr-card');
      await expect(card).toHaveCount(1);
      await expect(card.locator('.attr-official')).toHaveText(L.official);
      const facts = await card.locator('.attr-facts dd').allTextContents();
      expect(facts, slug).toHaveLength(3);
      await expect(card.locator('.attr-facts a').first(), `${slug}: author link`).toHaveAttribute('href', /^https:\/\/github\.com\//);
      // Back-link to the original directory / file.
      const original = await card.locator('.attr-facts dd a').nth(1).getAttribute('href');
      expect(original, slug).toMatch(/^https:\/\/github\.com\/.+\/(tree|blob)\/main\//);
    }
  });
}

// ---------------------------------------------------------------------------
// Gallery: mood groups, author, license
// ---------------------------------------------------------------------------
const visible = (page) => page.evaluate(() => [...document.querySelectorAll('#grid > li')].filter((li) => !li.hidden && getComputedStyle(li).display !== 'none')
  .map((li) => li.querySelector('a.card').getAttribute('href').replace(/^(?:\.\.\/)*(?:zh\/)?t\//, '').replace(/\/(index\.html)?$/, '')).sort());
const ensureMore = async (page) => {
  const d = page.locator('details.filter-extra');
  if (!(await d.evaluate((e) => e.open))) await d.locator('summary').click();
};

test('tags.json: every mood tag of every template maps to exactly one of the 12 groups', () => {
  expect(TAGS.map((g) => g.id)).toEqual(['bold', 'warm', 'editorial', 'calm', 'elegant', 'playful', 'professional', 'modern', 'retro', 'tech', 'crafted', 'artistic']);
  expect(TAGS.map((g) => g.zh)).toEqual(['大胆', '温暖', '杂志', '沉静', '优雅', '俏皮', '专业', '现代', '复古', '科技', '手作', '文艺']);
  const seen = new Map();
  for (const g of TAGS) for (const t of g.tags) { expect(t, `tag "${t}" is lower-case`).toBe(t.toLowerCase()); expect(seen.has(t), `tag "${t}" in two groups`).toBe(false); seen.set(t, g.id); }
  const unmapped = ALL_SLUGS.flatMap((s) => upstreamMeta(s).mood.filter((m) => !GROUP_OF.has(m.toLowerCase())).map((m) => `${s}:${m}`));
  expect(unmapped).toEqual([]);
});

for (const lang of ['en', 'zh']) {
  const L = LANG[lang];
  test.describe(`gallery filters [${lang}]`, () => {
    test.beforeEach(async ({ page }) => { await page.goto(L.gallery); await expect(page.locator('#filters')).toBeVisible(); });

    test('mood filter shows exactly the 12 groups (ids, labels, counts); original tags are not chips', async ({ page }) => {
      const chips = page.locator('button.chip[data-group="mood"]');
      await expect(chips).toHaveCount(12);
      const got = await chips.evaluateAll((bs) => bs.map((b) => ({ id: b.dataset.value, label: b.childNodes[0].textContent.trim(), n: b.querySelector('.n').textContent })));
      expect(got).toEqual(TAGS.map((g) => ({ id: g.id, label: lang === 'zh' ? g.zh : g.en, n: String(ALL_SLUGS.filter((s) => groupsOf(s).includes(g.id)).length) })));
      for (const old of ['confident', 'punchy', 'nostalgic']) await expect(page.locator(`button.chip[data-value="${old}"]`)).toHaveCount(0);
    });

    test('every mood group chip filters to its templates; original mood and tone tags still searchable', async ({ page }) => {
      for (const g of TAGS) {
        const chip = page.locator(`button.chip[data-group="mood"][data-value="${g.id}"]`);
        await chip.click();
        expect(await visible(page), `group ${g.id}`).toEqual(ALL_SLUGS.filter((s) => groupsOf(s).includes(g.id)).sort());
        await chip.click();
      }
      // "punchy" is a raw tag inside the Bold group, not a chip, but search finds it.
      const raw = ALL_SLUGS.filter((s) => upstreamMeta(s).mood.some((m) => m.toLowerCase() === 'punchy'));
      expect(raw.length).toBeGreaterThan(0);
      await page.locator('#q').fill('punchy');
      expect(await visible(page)).toEqual(expect.arrayContaining(raw));
    });

    test('license filter is shown (licenses are mixed) with a count per license; AGPL-3.0 selects only the Guizang templates', async ({ page }) => {
      const licenses = new Map();
      for (const s of ALL_SLUGS) licenses.set(licenseOf(s), [...(licenses.get(licenseOf(s)) ?? []), s]);
      expect(licenses.size, 'licenses are mixed in the catalog').toBeGreaterThan(1);
      await ensureMore(page);
      await expect(page.locator('details.filter-extra [role="group"]').filter({ has: page.locator('[data-group="license"]') })).toHaveCount(1);
      await expect(page.locator('button.chip[data-group="license"]')).toHaveCount(licenses.size);
      for (const [lic, slugs] of licenses) {
        const chip = page.locator(`button.chip[data-group="license"][data-value="${lic}"]`);
        await expect(chip.locator('.n')).toHaveText(String(slugs.length));
        await chip.click();
        expect(await visible(page), `license ${lic}`).toEqual([...slugs].sort());
        expect(new URL(page.url()).hash).toBe(`#license=${encodeURIComponent(lic)}`);
        await chip.click();
      }
      // Hash round trip + AND with scheme.
      await page.goto(`${L.gallery}#license=AGPL-3.0`);
      await expect(page.locator('button.chip[data-group="license"][data-value="AGPL-3.0"]')).toHaveAttribute('aria-pressed', 'true');
      expect(await visible(page)).toEqual(['guizang-editorial', 'guizang-swiss']);
      await page.locator('button.chip[data-group="scheme"][data-value="dark"]').click();
      expect(await visible(page)).toEqual(['guizang-editorial', 'guizang-swiss'].filter((s) => upstreamMeta(s).scheme === 'dark'));
    });

    test('author chips include Zara Zhang, NeoSun and Guizang; scheme counts add up to the catalog size', async ({ page }) => {
      await ensureMore(page);
      for (const [name, n] of [['Zara Zhang', 34], ['NeoSun', 16], ['Guizang', 2]]) {
        await expect(page.locator(`button.chip[data-group="author"][data-value="${name}"] .n`), name).toHaveText(String(n));
      }
      let sum = 0;
      for (const n of await page.locator('button.chip[data-group="scheme"] .n').allTextContents()) sum += Number(n);
      expect(sum).toBe(CATALOG.length);
    });

    test('guizang cards: AGPL-3.0 badge next to the scheme chip and author; other cards have no license badge', async ({ page }) => {
      const cards = await page.evaluate(() => [...document.querySelectorAll('#grid > li')].map((li) => ({
        slug: li.querySelector('a.card').getAttribute('href').replace(/^(?:\.\.\/)*(?:zh\/)?t\//, '').replace(/\/(index\.html)?$/, ''),
        badge: li.querySelector('.license-chip')?.textContent.trim() ?? null,
        title: li.querySelector('.license-chip')?.getAttribute('title') ?? '',
        credit: li.querySelector('.credit-line')?.textContent.trim(),
      })));
      for (const c of cards) {
        if (c.slug.startsWith('guizang-')) {
          expect(c.badge, c.slug).toBe('AGPL-3.0');
          expect(c.title, c.slug).toMatch(lang === 'zh' ? /AGPL-3\.0.*许可证提示/ : /AGPL-3\.0.*license notice/);
          expect(c.credit, c.slug).toBe(lang === 'zh' ? '歸藏 出品' : 'by Guizang');
        } else expect(c.badge, `${c.slug} shows a license badge although it is plain MIT`).toBeNull();
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Detail page features
// ---------------------------------------------------------------------------
for (const lang of ['en', 'zh']) {
  const L = LANG[lang];
  test.describe(`detail features [${lang}]`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('description is collapsed with a "Show more" toggle that expands and collapses it', async ({ page }) => {
      await page.goto(`${L.prefix}t/${SLUG}/`);
      const desc = page.locator('.about .desc');
      const toggle = desc.locator('button.desc-toggle');
      await expect(toggle).toHaveCount(1);
      await expect(desc).toHaveClass(/is-clamped/);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(toggle).toHaveText(await desc.getAttribute('data-more'));
      const collapsed = await desc.locator('p').evaluate((p) => p.getBoundingClientRect().height);
      await toggle.click();
      await expect(desc).not.toHaveClass(/is-clamped/);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(toggle).toHaveText(await desc.getAttribute('data-less'));
      expect(await desc.locator('p').evaluate((p) => p.getBoundingClientRect().height)).toBeGreaterThan(collapsed);
      await toggle.click();
      await expect(desc).toHaveClass(/is-clamped/);
    });

    test('"good for" and "avoid for" cards carry the template text', async ({ page }) => {
      await page.goto(`${L.prefix}t/${SLUG}/`);
      const m = upstreamMeta(SLUG);
      await expect(page.locator('.fit-card.good')).toHaveCount(1);
      await expect(page.locator('.fit-card.avoid')).toHaveCount(1);
      if (lang === 'en') {
        await expect(page.locator('.fit-card.good p')).toHaveText(m.best_for);
        await expect(page.locator('.fit-card.avoid p')).toHaveText(m.avoid_for);
      } else {
        expect(await page.locator('.fit-card.good p').textContent()).toMatch(/[一-鿿]/);
      }
    });

    test('palette strip: one swatch per color; hover and keyboard focus reveal name and value', async ({ page }) => {
      await page.goto(`${L.prefix}t/${SLUG}/`);
      const colors = Object.entries(upstreamMeta(SLUG).palette).filter(([k]) => k !== 'description');
      const items = page.locator('.palette-strip li');
      await expect(items).toHaveCount(colors.length);
      // Strip is one continuous row: all swatches on the same line, no gaps larger than a pixel.
      const boxes = await items.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.right, r.top]; }));
      for (let i = 1; i < boxes.length; i++) { expect(Math.abs(boxes[i][2] - boxes[0][2])).toBeLessThan(1); expect(Math.abs(boxes[i][0] - boxes[i - 1][1])).toBeLessThan(1.5); }
      for (let i = 0; i < colors.length; i++) {
        const tip = items.nth(i).locator('.swatch-tip');
        await expect(tip, 'tip hidden by default').toBeHidden();
        await items.nth(i).locator('.swatch').hover();
        await expect(tip).toBeVisible();
        await expect(tip).toContainText(colors[i][0]);
        await expect(tip).toContainText(colors[i][1]);
        await page.mouse.move(2, 2);
        await expect(tip).toBeHidden();
      }
      await items.first().locator('.swatch').focus();
      await expect(items.first().locator('.swatch-tip')).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(items.first().locator('.swatch-tip')).toBeHidden();
      await expect(items.nth(1).locator('.swatch-tip')).toBeVisible();
    });

    test('typography specimen: one row per font role, set in that font', async ({ page }) => {
      await page.goto(`${L.prefix}t/${SLUG}/`);
      const typo = Object.entries(upstreamMeta(SLUG).typography).filter(([k]) => k !== 'style');
      const rows = page.locator('.typo > li');
      await expect(rows).toHaveCount(typo.length);
      for (let i = 0; i < typo.length; i++) {
        await expect(rows.nth(i).locator('.fname')).toHaveText(typo[i][1]);
        expect(await rows.nth(i).locator('.specimen').getAttribute('style')).toContain(typo[i][1]);
      }
    });

    test('screenshot thumbnails jump the live preview to that slide (counter changes, no navigation)', async ({ page }) => {
      const log = monitor(page);
      await page.goto(`${L.prefix}t/${SLUG}/`);
      await previewFrame(page);
      const counter = page.locator('#counter');
      await expect(counter).toHaveText(/^1 \/ \d+$/);
      const total = Number((await counter.textContent()).split('/')[1]);
      const shots = page.locator('.shots a[data-slide]');
      const n = await shots.count();
      expect(n).toBe(3);
      const url = page.url();
      for (const i of [n - 1, 1, 0]) {
        const want = Number(await shots.nth(i).getAttribute('data-slide'));
        await shots.nth(i).click();
        await expect(counter).toHaveText(`${Math.min(want, total)} / ${total}`);
        expect(page.url(), 'clicking a screenshot must not navigate').toBe(url);
      }
      await settled(log, expect);
      expect(log.consoleErrors).toEqual([]);
    });
  });
}

// ---------------------------------------------------------------------------
// Credits page: every source that has templates, every template with its original link
// ---------------------------------------------------------------------------
for (const lang of ['en', 'zh']) {
  test(`[${lang}] credits page: one section per source with templates (repo, license, author) and one line per template`, async ({ page }) => {
    await page.goto(`${LANG[lang].prefix}credits.html`);
    const sections = page.locator('section.credit');
    await expect(sections).toHaveCount(SOURCES.length);
    for (let i = 0; i < SOURCES.length; i++) {
      const s = SOURCES[i];
      const sec = sections.nth(i);
      await expect(sec.locator('.credit-heading h2 a'), s.id).toHaveAttribute('href', s.repo);
      await expect(sec.locator('.credit-license'), s.id).toHaveText(s.license);
      const own = CATALOG.filter((t) => t.source === s.id);
      await expect(sec.locator('.credit-catalog li'), `${s.id}: template lines`).toHaveCount(own.length);
      await expect(sec.locator('.credit-heading .eyebrow')).toContainText(String(own.length));
      const body = (await sec.textContent()).replace(/\s+/g, ' ');
      expect(body, `${s.id}: author`).toContain(authorOf(s, lang));
      // Each template line links its detail page and its original location.
      const hrefs = await sec.locator('.credit-catalog li a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      for (const t of own) expect(hrefs.some((h) => h.includes(`t/${t.slug}/`)), `${s.id}/${t.slug}: detail link`).toBe(true);
      expect(hrefs.filter((h) => /^https:\/\/github\.com\//.test(h)).length, `${s.id}: original links`).toBeGreaterThanOrEqual(own.length);
    }
    // Sources without templates (the empty community source) are not listed.
    expect(await page.locator('section.credit').allTextContents().then((a) => a.join(' '))).not.toContain('Community contributors');
  });
}
