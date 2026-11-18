// Home page (EN + ZH): hero, curated carousel (src/home.json), process step 2 per download mode,
// credits chapter, header/footer. Everything is derived from sources.json / src/home.json / src/tags.json.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from './font-cache.mjs';
import { ROOT, CATALOG, SOURCES_JSON, makeTempDir, monitor, settled } from './helpers.mjs';

const HOME = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'home.json'), 'utf8'));
const CAROUSEL = HOME.carousel;
const SOURCES = SOURCES_JSON.sources.filter((s) => CATALOG.some((t) => t.source === s.id));
const CJK = /[　-〿㐀-鿿豈-﫿＀-￯]/;
const PAGES = { en: 'index.html', zh: 'zh/index.html' };
const authorOf = (s, lang) => (lang === 'zh' ? (s.authorZh ?? s.author) : s.author);
const slugOfHref = (h) => h.replace(/^(?:\.\.\/)*t\//, '').replace(/\/(index\.html)?$/, '');

test.describe('home data', () => {
  test('src/home.json lists only existing templates, no duplicates, at least 3 (carousel needs 3)', () => {
    expect(CAROUSEL.length).toBeGreaterThanOrEqual(3);
    expect(new Set(CAROUSEL).size).toBe(CAROUSEL.length);
    for (const slug of CAROUSEL) expect(CATALOG.some((t) => t.slug === slug), `home.json slug "${slug}" is not in the catalog`).toBe(true);
  });
});

for (const [lang, url] of Object.entries(PAGES)) {
  test.describe(`home [${lang}]`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('hero: headline, template count, link to the gallery; five chapters; no console errors or failed requests', async ({ page }) => {
      const log = monitor(page);
      await page.goto(url);
      await expect(page.locator('html')).toHaveAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
      await expect(page.locator('h1#home-title .hero-line')).toHaveCount(2);
      await expect(page.locator('.home-hero .hero-count strong')).toHaveText(String(CATALOG.length).padStart(2, '0'));
      const pill = page.locator('.home-hero a.home-pill');
      await expect(pill).toHaveAttribute('href', 'gallery/');
      await expect(page.locator('section.home-chapter')).toHaveCount(5);
      await settled(log, expect);
      expect(log.consoleErrors).toEqual([]);
      expect(log.pageErrors).toEqual([]);
      expect(log.failed).toEqual([]);
      expect(log.badStatus).toEqual([]);
      // Language purity of the page text (names of templates and sources are marked lang="en" on zh).
      const text = await page.evaluate(() => {
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll('[data-lang-switch], script, style, svg').forEach((e) => e.remove());
        return clone.innerText;
      });
      if (lang === 'en') expect(text.match(CJK), 'CJK on the English home page').toBeNull();
      else expect(text).toMatch(CJK);
    });

    test('hero wall shows only curated templates from src/home.json', async ({ page }) => {
      await page.goto(url);
      const slugs = await page.locator('.hero-wall img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src').match(/thumbs\/(.+)-\d+\.png$/)?.[1]));
      expect(slugs.length).toBeGreaterThan(0);
      for (const s of slugs) expect(CAROUSEL, `hero wall slug ${s}`).toContain(s);
    });

    test('carousel cards are exactly the home.json slugs in order, each linking to an existing detail page', async ({ page }) => {
      await page.goto(url);
      const hrefs = await page.locator('.home-work').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(hrefs.map(slugOfHref)).toEqual(CAROUSEL);
      for (const slug of CAROUSEL) {
        const rel = lang === 'zh' ? ['zh', 't', slug, 'index.html'] : ['t', slug, 'index.html'];
        expect(fs.existsSync(path.join(ROOT, 'site', ...rel)), `site/${rel.join('/')}`).toBe(true);
      }
    });

    test('carousel: next / previous / wrap-around / keyboard move the selected card and the counter', async ({ page }) => {
      await page.goto(url);
      const N = CAROUSEL.length;
      const pos = page.locator('.carousel-position');
      const fmt = (i) => `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
      const selected = () => page.locator('.home-work[data-position="0"]').evaluate((a) => a.getAttribute('href'));
      await expect(pos).toHaveText(fmt(0));
      expect(slugOfHref(await selected())).toBe(CAROUSEL[0]);

      // Pause autoplay so the test is deterministic, then drive the buttons.
      const play = page.locator('.carousel-play');
      if (await play.evaluate((b) => b.classList.contains('is-playing'))) await play.click();
      const next = page.locator('[data-carousel-direction="1"]');
      const prev = page.locator('[data-carousel-direction="-1"]');
      await expect(next).toBeVisible();
      await next.click();
      await expect(pos).toHaveText(fmt(1));
      expect(slugOfHref(await selected())).toBe(CAROUSEL[1]);
      await prev.click();
      await prev.click();
      await expect(pos).toHaveText(fmt(N - 1));
      expect(slugOfHref(await selected()), 'wrap-around to the last card').toBe(CAROUSEL[N - 1]);
      await next.click();
      await expect(pos).toHaveText(fmt(0));

      // Arrow keys on the focused carousel.
      await page.locator('.home-carousel').focus();
      await page.keyboard.press('ArrowRight');
      await expect(pos).toHaveText(fmt(1));
      await page.keyboard.press('ArrowLeft');
      await expect(pos).toHaveText(fmt(0));
      // Only the selected card is interactive.
      expect(await page.locator('.home-work[inert]').count()).toBe(N - 1);
    });

    test('carousel: autoplay advances on its own when the carousel is in view, and the pause button stops it', async ({ page }) => {
      await page.goto(url);
      const pos = page.locator('.carousel-position');
      await page.locator('.home-carousel').scrollIntoViewIfNeeded();
      await page.evaluate(() => document.querySelector('.home-showcase').scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.mouse.move(2, 2); // keep the pointer off the carousel (hover pauses it)
      await expect(page.locator('.home-carousel')).toHaveAttribute('data-autoplay', 'running', { timeout: 10_000 });
      const first = await pos.textContent();
      await expect.poll(() => pos.textContent(), { timeout: 15_000 }).not.toBe(first);
      await page.locator('.carousel-play').click();
      await expect(page.locator('.home-carousel')).toHaveAttribute('data-autoplay', 'paused');
      const held = await pos.textContent();
      await page.waitForTimeout(5200); // longer than the 4.5 s interval: nothing may advance
      expect(await pos.textContent()).toBe(held);
    });

    test('carousel images load for the selected card; thumbnails come from the screenshots folder', async ({ page }) => {
      await page.goto(url);
      const img = page.locator('.home-work[data-position="0"] img');
      await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
      expect(await img.getAttribute('src')).toMatch(/assets\/screenshots\/.+-\d+\.png$/);
    });

    test('credits chapter lists every source that has templates, with author, license and repo link', async ({ page }) => {
      await page.goto(url);
      const items = await page.locator('.home-source-list > a').evaluateAll((as) => as.map((a) => ({
        href: a.getAttribute('href'), small: a.querySelector('small')?.textContent.trim(), name: a.querySelector('.source-name > span > span')?.textContent.trim(),
      })));
      expect(items.map((i) => i.href)).toEqual(SOURCES.map((s) => s.repo));
      for (const s of SOURCES) {
        const item = items.find((i) => i.href === s.repo);
        expect(item.name, s.id).toBe(s.name);
        expect(item.small, s.id).toBe(`${authorOf(s, lang)} · ${s.license}`);
      }
      // The two non-MIT / non-Zara authors named in CLAUDE.md are present.
      const all = items.map((i) => i.small).join(' ');
      expect(all).toContain('Zara Zhang');
      expect(all).toContain('NeoSun');
      expect(all).toContain(lang === 'zh' ? '歸藏' : 'Guizang');
      expect(all).toContain('AGPL-3.0');
      await expect(page.locator('.home-origin a.home-text-link')).toHaveAttribute('href', 'credits.html');
    });
  });
}

// ---------------------------------------------------------------------------
// Process step 2 depends on the download mode: manual (default build) vs. the prompt downloads the pack
// itself (--site-url). Both languages, derived from the HTML the build writes.
// ---------------------------------------------------------------------------
const STEP2 = {
  en: { manual: /Download the asset pack and unzip it/, auto: /downloads the template pack itself/ },
  zh: { manual: /下载素材包并解压/, auto: /自己下载模板素材包/ },
};
const stepsOf = (html) => [...html.matchAll(/<li><span class="home-step-number">\d+<\/span><div><h3>([^<]*)<\/h3><p>([^<]*)<\/p>/g)].map((m) => ({ title: m[1], text: m[2] }));

test.describe('home process steps per mode', () => {
  const out = path.join(makeTempDir('sc-home-url-'), 'site');
  test.beforeAll(() => {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--site-url', 'https://example.github.io/slides-commons/', '--out', out], {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_SITE_URL: '' },
    });
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
  });
  test.afterAll(() => fs.rmSync(path.dirname(out), { recursive: true, force: true }));

  for (const lang of ['en', 'zh']) {
    test(`[${lang}] step 2: manual download text in the default build, "agent downloads the pack" with --site-url`, () => {
      const rel = lang === 'zh' ? ['zh', 'index.html'] : ['index.html'];
      const manual = stepsOf(fs.readFileSync(path.join(ROOT, 'site', ...rel), 'utf8'));
      const auto = stepsOf(fs.readFileSync(path.join(out, ...rel), 'utf8'));
      expect(manual).toHaveLength(3);
      expect(auto).toHaveLength(3);
      expect(manual[1].text).toMatch(STEP2[lang].manual);
      expect(manual[1].text).not.toMatch(STEP2[lang].auto);
      expect(auto[1].text).toMatch(STEP2[lang].auto);
      expect(auto[1].text).not.toMatch(STEP2[lang].manual);
      // Steps 1 and 3 and all titles are the same in both modes.
      expect(auto[0]).toEqual(manual[0]);
      expect(auto[2]).toEqual(manual[2]);
      expect(auto.map((s) => s.title)).toEqual(manual.map((s) => s.title));
    });
  }
});
