// English / Chinese site trees: errors, language purity, switcher, zh detail, layout.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect } from './font-cache.mjs';
import { SITE, SLUG, zhNameTokens, zhEnglishRuns, EXTERNAL_WHITELIST, countUpstreamSlides, monitor, artifactPath, settled, fontLoaded, hostOf, previewFrame } from './helpers.mjs';

const N = countUpstreamSlides();
const UPSTREAM_DIR = `https://github.com/zarazhangrui/beautiful-html-templates/tree/main/templates/${SLUG}`;

// [name, http path, file path parts]
const PAGES = {
  en: [
    ['home', 'index.html', ['index.html']],
    ['credits', 'credits.html', ['credits.html']],
    ['detail', `t/${SLUG}/`, ['t', SLUG, 'index.html']],
  ],
  zh: [
    ['home', 'zh/index.html', ['zh', 'index.html']],
    ['credits', 'zh/credits.html', ['zh', 'credits.html']],
    ['detail', `zh/t/${SLUG}/`, ['zh', 't', SLUG, 'index.html']],
  ],
};
const fileUrl = (parts) => pathToFileURL(path.join(SITE, ...parts)).href;

// ---------------------------------------------------------------------------
// 1. Errors / network on every page, both trees, http and file://
// ---------------------------------------------------------------------------
for (const mode of ['http', 'file']) {
  for (const lang of ['en', 'zh']) {
    for (const [name, httpPath, fileParts] of PAGES[lang]) {
      test(`[${mode}] ${lang} ${name}: no errors, no failed requests, whitelist respected`, async ({ page, baseURL }) => {
        const log = monitor(page);
        await page.goto(mode === 'http' ? httpPath : fileUrl(fileParts));
        if (name === 'detail') await fontLoaded(await previewFrame(page), 'Space Grotesk');
        await settled(log, expect);
        await expect(page.locator('html')).toHaveAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

        const ownHost = new URL(baseURL).host;
        const external = log.requests.filter((r) => /^https?:/.test(r.url) && (mode === 'file' || new URL(r.url).host !== ownHost));
        expect.soft(log.consoleErrors, 'console errors').toEqual([]);
        expect.soft(log.pageErrors, 'page errors').toEqual([]);
        expect.soft(log.failed, 'failed requests').toEqual([]);
        expect.soft(log.badStatus, 'HTTP >= 400').toEqual([]);
        expect.soft(external.filter((r) => r.isMain).map((r) => r.url), 'external requests from the site page itself').toEqual([]);
        expect.soft(external.filter((r) => !EXTERNAL_WHITELIST.includes(hostOf(r.url))).map((r) => r.url), 'off-whitelist').toEqual([]);
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 2. No mixed language
// ---------------------------------------------------------------------------
// Visible text nodes + user-facing attributes, with the nearest [lang] of each.
function collectText(page) {
  return page.evaluate(() => {
    const out = [];
    const langOf = (el) => el.closest('[lang]')?.getAttribute('lang') ?? '';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent.replace(/\s+/g, ' ').trim();
      const el = n.parentElement;
      if (!text || !el || el.closest('script,style,noscript')) continue;
      if (!el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
      out.push({
        text, lang: langOf(el), tag: el.tagName.toLowerCase(),
        inCode: !!el.closest('code'), inSwitch: !!el.closest('[data-lang-switch]'),
        where: (el.closest('[class]')?.className || el.tagName).toString().slice(0, 40),
      });
    }
    for (const el of document.querySelectorAll('[aria-label],[title],[alt],[placeholder]')) {
      for (const a of ['aria-label', 'title', 'alt', 'placeholder']) {
        const v = el.getAttribute(a);
        if (v && v.trim()) out.push({ text: v.trim(), lang: langOf(el), tag: `${el.tagName.toLowerCase()}@${a}`, inCode: false, inSwitch: !!el.closest('[data-lang-switch]'), where: a });
      }
    }
    return out;
  });
}

const CJK = /[　-〿㐀-鿿豈-﫿＀-￯]/;
// Proper nouns and identifiers allowed untranslated on zh pages.


test('en pages: no CJK outside the 中文 switcher', async ({ page }) => {
  const bad = [];
  for (const [name, httpPath] of PAGES.en) {
    await page.goto(httpPath);
    for (const t of await collectText(page)) {
      if (CJK.test(t.text) && !t.inSwitch) bad.push(`${name} <${t.tag}> .${t.where}: ${t.text.slice(0, 80)}`);
    }
  }
  expect(bad).toEqual([]);
});

test('zh pages: chrome is Chinese; no run of 3+ English words outside lang="en"', async ({ page }) => {
  const bad = [];
  const extra = zhNameTokens();
  for (const [name, httpPath] of PAGES.zh) {
    await page.goto(httpPath);
    for (const t of await collectText(page)) {
      if (t.lang.startsWith('en') || t.inCode) continue;
      const runs = zhEnglishRuns(t.text, extra);
      if (runs.length) bad.push(`${name} <${t.tag}> .${t.where}: ${t.text.slice(0, 80)}  [English: ${runs.join(' | ').slice(0, 60)}]`);
    }
  }
  expect(bad).toEqual([]);
});

test('zh detail: upstream data is shown in Chinese (no lang="en" blocks except the template name), with a translation note', async ({ page }) => {
  await page.goto(`zh/t/${SLUG}/`);
  const note = page.locator('p.source-note');
  await expect(note).toHaveCount(1);
  await expect(note).toHaveText(/以下介绍由本站翻译，以英文原文为准。/);
  await expect(note.locator(`a[href="https://github.com/zarazhangrui/beautiful-html-templates/tree/main/templates/${SLUG}"]`)).toHaveCount(1);
  const marked = await page.locator('main [lang="en"]').evaluateAll((els) => els.map((e) => `${e.tagName.toLowerCase()}: ${e.textContent.trim().slice(0, 40)}`));
  expect(marked, 'English-marked elements in main').toEqual(['h1: Neo-Grid Bold']);
  for (const sel of ['.hero .tagline', 'section.about > p:not(.source-note)', 'dl.meta dd', 'section.about .muted']) {
    const texts = await page.locator(`main ${sel}`).allTextContents();
    for (const t of texts) if (/[A-Za-z]{4,}/.test(t) && !CJK.test(t)) expect.soft(CJK.test(t), `${sel} is English-only: ${t.slice(0, 50)}`).toBe(true);
  }
});

test('both trees: lang switch markup and hreflang alternates point at the counterpart page', async ({ page }) => {
  for (const lang of ['en', 'zh']) {
    const other = lang === 'en' ? 'zh' : 'en';
    for (let i = 0; i < PAGES[lang].length; i++) {
      const [name, httpPath] = PAGES[lang][i];
      const counterpart = PAGES[other][i][1];
      await page.goto(httpPath);
      await expect(page.locator('nav.site-nav .lang-switch')).toHaveCount(1);
      await expect(page.locator('.lang-current[aria-current="true"]')).toHaveCount(1);
      await expect(page.locator(`a[data-lang-switch="${other}"]`)).toHaveCount(1);
      const abs = (h) => new URL(h, page.url()).pathname.replace(/index\.html$/, '');
      const alt = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => [l.hreflang, l.getAttribute('href')])));
      expect(Object.keys(alt).sort(), `${lang} ${name} alternates`).toEqual(['en', 'zh-CN']);
      const self = new URL(page.url()).pathname.replace(/index\.html$/, '');
      expect(abs(alt[lang === 'en' ? 'en' : 'zh-CN']), `${lang} ${name} self alternate`).toBe(self);
      expect(abs(alt[lang === 'en' ? 'zh-CN' : 'en']), `${lang} ${name} other alternate`).toBe('/' + counterpart.replace(/index\.html$/, ''));
      const sw = await page.locator(`a[data-lang-switch="${other}"]`).getAttribute('href');
      expect(abs(sw), `${lang} ${name} switch link`).toBe('/' + counterpart.replace(/index\.html$/, ''));
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Switcher behaviour
// ---------------------------------------------------------------------------
for (const mode of ['http', 'file']) {
  test(`[${mode}] detail switcher maps en <-> zh for the same slug`, async ({ page }) => {
    await page.goto(mode === 'http' ? `t/${SLUG}/` : fileUrl(['t', SLUG, 'index.html']));
    await page.locator('a[data-lang-switch="zh"]').click();
    await expect(page).toHaveURL(new RegExp(`/zh/t/${SLUG}/(index\\.html)?$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page.locator('main h1')).toHaveText('Neo-Grid Bold');
    await page.locator('a[data-lang-switch="en"]').click();
    await expect(page).toHaveURL(new RegExp(`/(site/)?t/${SLUG}/(index\\.html)?$`));
    expect(page.url()).not.toMatch(/\/zh\//);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
}

test('language choice: 中文 is remembered for "/", detail pages never redirect, English clears it', async ({ page }) => {
  await page.goto('index.html');
  await page.locator('a[data-lang-switch="zh"]').click();
  await expect(page).toHaveURL(/\/zh\/index\.html$/);
  expect(await page.evaluate(() => localStorage.getItem('slides-commons:lang'))).toBe('zh');

  await page.goto('/');
  await expect(page).toHaveURL(/\/zh\/index\.html$/);
  await page.goto('index.html');
  await expect(page).toHaveURL(/\/zh\/index\.html$/);

  // Detail and credits pages never redirect: they carry no redirect code at all
  // (deterministic), and loading them with 'zh' stored keeps the URL.
  for (const parts of [['t', SLUG, 'index.html'], ['credits.html'], ['zh', 'index.html'], ['zh', 't', SLUG, 'index.html'], ['zh', 'credits.html']]) {
    const html = fs.readFileSync(path.join(SITE, ...parts), 'utf8');
    expect(html, `${parts.join('/')} contains redirect code`).not.toMatch(/location\.(replace|assign|href\s*=)|slides-commons:lang/);
  }
  const homeHtml = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
  expect(homeHtml, 'only the English home reads the stored language').toMatch(/slides-commons:lang/);
  await page.goto(`t/${SLUG}/`, { waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(new URL(page.url()).pathname).toBe(`/t/${SLUG}/`);
  await page.goto('credits.html', { waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(new URL(page.url()).pathname).toBe('/credits.html');

  // Choose English from the zh home.
  await page.goto('zh/index.html');
  await page.locator('a[data-lang-switch="en"]').click();
  await expect(page).toHaveURL(/\/index\.html$/);
  expect(page.url()).not.toMatch(/\/zh\//);
  expect(await page.evaluate(() => localStorage.getItem('slides-commons:lang'))).not.toBe('zh');
  await page.goto('/', { waitUntil: 'load' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(new URL(page.url()).pathname).toBe('/');
});

// ---------------------------------------------------------------------------
// 5. zh detail page
// ---------------------------------------------------------------------------
test('zh detail: paging 1/12 → 12/12, 演示页数, Chinese attribution, upstream link', async ({ page }) => {
  await page.goto(`zh/t/${SLUG}/`);
  await previewFrame(page);
  const counter = page.locator('#counter');
  await expect(counter).toHaveText(`1 / ${N}`);
  for (let i = 2; i <= N; i++) {
    await page.locator('#next').click();
    await expect(counter).toHaveText(`${i} / ${N}`);
  }
  await expect(page.locator('#next')).toBeDisabled();
  await expect(page.locator('dl.meta dt:text-is("演示页数") + dd')).toHaveText(String(N));
  await expect(page.getByRole('link', { name: '下载素材包（.zip）' })).toHaveAttribute('href', `../../../zip/${SLUG}.zip`);

  const attr = page.locator('section.attribution');
  await expect(attr.locator('h2')).toHaveText('署名');
  await expect(attr).toContainText('Zara Zhang');
  await expect(attr).toContainText('MIT');
  await expect(attr).toContainText('不是原作者的官方站点');
  expect(await attr.locator(`a[href="${UPSTREAM_DIR}"]`).count()).toBeGreaterThan(0);
  expect(await page.locator('a[href^="https://github.com/zarazhangrui/frontend-slides"]').count()).toBeGreaterThan(0);
  await expect(page.locator('footer.site-footer')).toContainText('与原作者无关联');

  const text = await page.locator('body').innerText();
  const claims = text.split(/(?<=[。.!?])|\n/).filter((s) => /官方/.test(s) && !/不是|无关联|非/.test(s));
  expect(claims, 'Chinese sentences that could claim official status').toEqual([]);
});

// ---------------------------------------------------------------------------
// 6. Layout (both languages)
// ---------------------------------------------------------------------------
for (const lang of ['en', 'zh']) {
  const url = lang === 'en' ? `t/${SLUG}/` : `zh/t/${SLUG}/`;

  test(`[${lang}] 1440x900: preview left of the panel, 16:9, controls row complete`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url);
    await previewFrame(page);
    const f = await page.locator('iframe#preview').boundingBox();
    const p = await page.locator('.actions').boundingBox();
    expect(Math.abs(f.width / f.height - 16 / 9) / (16 / 9), `iframe ${f.width}x${f.height}`).toBeLessThanOrEqual(0.01);
    expect(p.x, `panel.left ${p.x} vs iframe.right ${f.x + f.width}`).toBeGreaterThan(f.x + f.width);
    expect(p.y, 'panel starts near the preview top').toBeLessThan(f.y + f.height);
    const controls = page.locator('.controls');
    await expect(controls.locator('a.open-tab')).toBeVisible();
    await expect(controls.locator('#fullscreen')).toHaveCount(1);
    if (await page.evaluate(() => document.fullscreenEnabled)) await expect(controls.locator('#fullscreen')).toBeVisible();
    await page.screenshot({ path: artifactPath(`detail-desktop-${lang}.png`), fullPage: true });
    test.info().annotations.push({ type: 'geometry', description: `iframe x=${Math.round(f.x)} w=${Math.round(f.width)} h=${Math.round(f.height)}; panel x=${Math.round(p.x)} w=${Math.round(p.width)}` });
  });

  test(`[${lang}] 390x844: stacked, no horizontal scroll, controls row complete`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url);
    await previewFrame(page);
    const f = await page.locator('iframe#preview').boundingBox();
    const p = await page.locator('.actions').boundingBox();
    expect(Math.abs(f.width / f.height - 16 / 9) / (16 / 9)).toBeLessThanOrEqual(0.01);
    expect(p.y, 'panel below the preview').toBeGreaterThanOrEqual(f.y + f.height);
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(scroll, 'horizontal overflow').toBeLessThanOrEqual(0);
    await expect(page.locator('.controls a.open-tab')).toBeVisible();
    await expect(page.locator('.controls #fullscreen')).toHaveCount(1);
    await page.screenshot({ path: artifactPath(`detail-phone-${lang}.png`), fullPage: true });
  });
}
