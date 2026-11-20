// Credits page redesign (EN + ZH): per-source cards (header row + key/value list), derivative line,
// AGPL callout with "More", three "also credited" cards, header theming, no horizontal overflow.
import { test, expect } from './font-cache.mjs';
import { CATALOG, SOURCES_JSON, monitor, settled } from './helpers.mjs';

const PINK = 'rgb(240, 189, 209)'; // #f0bdd1 credits hero
const SOURCES = SOURCES_JSON.sources.filter((s) => CATALOG.some((t) => t.source === s.id));
const LANGS = {
  en: { url: 'credits.html', facts: ['Author', 'Repository', 'License file'], also: ['Web fonts', 'Convert kit and skills', 'Reference only'], more: 'More', notLegal: /Not legal advice/, notEndorsed: /did not make or endorse/ },
  zh: { url: 'zh/credits.html', facts: ['作者', '仓库', '许可证文件'], also: ['Web 字体', '转换工具包与技能', '仅作参考'], more: '更多', notLegal: /不构成法律意见/, notEndorsed: /并未制作或认可/ },
};
const bg = (loc) => loc.evaluate((el) => getComputedStyle(el).backgroundColor);
const overflowX = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const [lang, L] of Object.entries(LANGS)) {
  test.describe(`credits [${lang}]`, () => {
    test('one card per source: header row (name linked to repo, licence pill, template count) and key/value list', async ({ page }) => {
      const log = monitor(page);
      await page.goto(L.url);
      await settled(log, expect);
      await expect(page.locator('section.credit')).toHaveCount(SOURCES.length);
      for (const s of SOURCES) {
        const card = page.locator(`#src-${s.id}`);
        await expect(card, s.id).toHaveCount(1);
        const head = card.locator('.credit-heading');
        if (s.repo) await expect(head.locator('h2 a'), `${s.id}: name linked to repo`).toHaveAttribute('href', s.repo);
        await expect(head.locator('.credit-license'), `${s.id}: licence pill`).toContainText(s.license);
        const count = CATALOG.filter((t) => t.source === s.id).length;
        await expect(head.locator('.eyebrow'), `${s.id}: template count`).toContainText(String(count));
        const keys = (await card.locator('.credit-facts dt').allTextContents()).map((x) => x.trim());
        for (const k of L.facts.slice(s.private ? 2 : 0)) expect(keys, `${s.id}: key ${k}`).toContain(k);
        expect(await card.locator('.credit-facts dt').count(), `${s.id}: dt/dd pairs`).toBe(await card.locator('.credit-facts dd').count());
        if (s.repo) await expect(card.locator('.credit-facts dd a').first(), `${s.id}: repo link in list`).toBeVisible();
        // the template catalog stays collapsed and lists every template
        const cat = card.locator('details.credit-catalog');
        expect(await cat.evaluate((el) => el.open)).toBe(false);
        expect(await cat.locator('li').count(), `${s.id}: catalog size`).toBe(count);
      }
      expect([...log.consoleErrors, ...log.pageErrors], 'console errors').toEqual([]);
      expect(log.failed, 'failed requests').toEqual([]);
      expect(log.badStatus, 'bad status').toEqual([]);
    });

    test('companion row on upstream sources names frontend-slides and LICENSE-skill', async ({ page }) => {
      await page.goto(L.url);
      for (const s of SOURCES.filter((x) => x.companion)) {
        const row = page.locator(`#src-${s.id} .credit-facts dd`).filter({ hasText: 'LICENSE-skill' });
        await expect(row, s.id).toHaveCount(1);
        await expect(row.locator(`a[href="${s.companion.repo}"]`), s.id).toHaveCount(1);
        await expect(row).toContainText('viewport-base.css');
      }
    });

    test('Style Presets derivative line keeps the STYLE_PRESETS.md and frontend-slides links and the not-endorsed wording', async ({ page }) => {
      await page.goto(L.url);
      const sp = SOURCES.find((s) => s.derivedFrom);
      test.skip(!sp, 'no derived source');
      const note = page.locator(`#src-${sp.id} .credit-note`);
      await expect(note).toHaveCount(1);
      await expect(note).toContainText(L.notEndorsed);
      const hrefs = await note.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(hrefs.some((h) => /STYLE_PRESETS\.md/.test(h)), `STYLE_PRESETS.md link in ${hrefs}`).toBe(true);
      expect(hrefs.some((h) => /zarazhangrui\/frontend-slides/.test(h)), 'frontend-slides link').toBe(true);
      await expect(note).toContainText('Zara Zhang');
    });

    test('Guizang AGPL callout: licence and repo links, not legal advice, "More" disclosure opens', async ({ page }) => {
      await page.goto(L.url);
      const g = SOURCES.find((s) => s.id === 'guizang');
      const box = page.locator('#src-guizang .license-notice');
      await expect(box).toHaveCount(1);
      await expect(box).toContainText('AGPL-3.0');
      await expect(box).toContainText(L.notLegal);
      await expect(box.locator('> p a')).toHaveCount(2);
      await expect(box.locator(`> p a[href="${g.licenseUrl}"]`)).toHaveCount(1);
      await expect(box.locator('> p a[href*="github.com"]').nth(0)).toBeVisible();
      const d = box.locator('details');
      await expect(d.locator('summary')).toHaveText(L.more);
      expect(await d.evaluate((el) => el.open)).toBe(false);
      await expect(d.locator('p')).toBeHidden();
      await d.locator('summary').click();
      await expect(d.locator('p')).toBeVisible();
    });

    test('three "also credited" cards: fonts, kit, reference-only html-ppt-skill (links present)', async ({ page }) => {
      await page.goto(L.url);
      const cards = page.locator('.credits-also .credit-extra');
      await expect(cards).toHaveCount(3);
      expect((await cards.locator('h3').allTextContents()).map((t) => t.trim())).toEqual(L.also);
      await expect(cards.nth(0).locator('a[href="https://fontsource.org"]')).toHaveCount(1);
      await expect(cards.nth(1).locator('a[href="https://github.com/zarazhangrui/frontend-slides"]')).toHaveCount(1);
      await expect(cards.nth(2).locator('a[href="https://github.com/lewislulu/html-ppt-skill"]')).toHaveCount(1);
      await expect(cards.nth(2).locator('a[href="https://github.com/lewislulu"]')).toHaveCount(1);
    });

    test('footer still credits the authors and links back to the repos', async ({ page }) => {
      await page.goto(L.url);
      const footer = page.locator('.site-footer');
      await expect(footer).toContainText('Zara Zhang');
      for (const s of SOURCES.filter((x) => x.repo && !x.private)) {
        await expect(footer.locator(`a[href="${s.repo}"]`).first(), s.id).toHaveCount(1);
      }
    });

    test('header wears the pink hero colour at the top and turns neutral after scrolling past the hero', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(L.url);
      const header = page.locator('.site-header');
      await expect(page.locator('.credits-hero')).toHaveCount(1);
      expect(await bg(page.locator('.credits-hero'))).toBe(PINK);
      await expect.poll(() => bg(header), { message: 'header at scroll 0' }).toBe(PINK);
      const heroH = await page.locator('.credits-hero').evaluate((el) => el.offsetHeight);
      await page.evaluate((y) => scrollTo(0, y), heroH + 300);
      await expect.poll(() => bg(header)).not.toBe(PINK);
      expect(await header.evaluate((el) => el.getAttribute('style') ?? '')).not.toMatch(/--bg|--ink|--accent/);
      await page.evaluate(() => scrollTo(0, 0));
      await expect.poll(() => bg(header)).toBe(PINK);
    });

    for (const [w, h] of [[390, 844], [1440, 900]]) {
      test(`no horizontal overflow at ${w}x${h} (also with every disclosure open)`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(L.url);
        await page.waitForLoadState('load');
        expect(await overflowX(page), 'closed').toBeLessThanOrEqual(0);
        await page.evaluate(() => document.querySelectorAll('main details').forEach((d) => { d.open = true; }));
        expect(await overflowX(page), 'all disclosures open').toBeLessThanOrEqual(0);
        // cards stay inside the viewport
        const off = await page.evaluate(() => [...document.querySelectorAll('.credit, .credit-extra')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).length);
        expect(off, 'cards wider than the viewport').toBe(0);
      });
    }

    test('page is single-language (zh has no untranslated English headings)', async ({ page }) => {
      await page.goto(L.url);
      const txt = await page.locator('.credits-also h2, .credits-lead, .credit-facts dt').allTextContents();
      const joined = txt.join(' ');
      if (lang === 'zh') expect(joined).not.toMatch(/Also credited|Author|Repository|License file/);
      else expect(joined).not.toMatch(/[　-〿㐀-鿿]/);
    });
  });
}
