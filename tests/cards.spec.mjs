// Gallery card layout (EN + ZH): equal heights within a row, one-line meta row, tagline clamped to
// two lines with the full text in the title attribute.
import { test, expect } from './font-cache.mjs';
import { CATALOG, SOURCES_JSON, monitor } from './helpers.mjs';

const PAGES = { en: 'index.html', zh: 'zh/index.html' };
const WIDTHS = [[1440, 900], [768, 1024], [390, 844]];

async function cardFacts(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const px = (v, fallback) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : fallback);
    const lis = [...document.querySelectorAll('#grid > li')].filter((li) => !li.hidden && getComputedStyle(li).display !== 'none');
    return lis.map((li) => {
      const card = li.querySelector('a.card');
      const cr = card.getBoundingClientRect();
      const lr = li.getBoundingClientRect();
      const tag = li.querySelector('.tag-line');
      const by = li.querySelector('.by');
      const tcs = getComputedStyle(tag);
      const kids = [...by.children].map((c) => { const r = c.getBoundingClientRect(); return { cls: c.className, top: r.top, bottom: r.bottom, left: r.left, right: r.right, text: c.textContent.trim() }; });
      const br = by.getBoundingClientRect();
      const bcs = getComputedStyle(by);
      const credit = by.querySelector('.credit-line');
      const lineH = px(tcs.lineHeight, px(tcs.fontSize, 15) * 1.4);
      return {
        slug: card.getAttribute('href').replace(/^t\/|\/(index\.html)?$/g, ''),
        source: li.getAttribute('data-source'),
        liTop: Math.round(lr.top + window.scrollY), liH: lr.height, cardH: cr.height, cardRight: cr.right, cardLeft: cr.left,
        tagText: tag.textContent.trim(), tagTitle: tag.getAttribute('title'),
        tagClamp: tcs.getPropertyValue('-webkit-line-clamp'), tagOverflow: tcs.overflow,
        tagH: tag.clientHeight, tagScrollH: tag.scrollHeight, lineH,
        byH: br.height, byLineH: px(bcs.lineHeight, px(bcs.fontSize, 14) * 1.4), byRight: br.right, byLeft: br.left,
        byScrollW: by.scrollWidth, byClientW: by.clientWidth,
        byText: by.textContent.replace(/\s+/g, ' ').trim(), kids,
        creditRight: credit?.getBoundingClientRect().right, creditScrollW: credit?.scrollWidth, creditClientW: credit?.clientWidth,
        docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
  });
}

for (const [lang, url] of Object.entries(PAGES)) {
  for (const [w, h] of WIDTHS) {
    test.describe(`cards [${lang}] ${w}px`, () => {
      test.use({ viewport: { width: w, height: h } });

      test('one card per template; no horizontal page overflow; clean console', async ({ page }) => {
        const log = monitor(page);
        await page.goto(url);
        await expect(page.locator('#grid > li').first()).toBeVisible();
        const cards = await cardFacts(page);
        expect(cards).toHaveLength(CATALOG.length);
        expect(cards[0].docOverflow, 'horizontal overflow').toBeLessThanOrEqual(0);
        expect(log.consoleErrors).toEqual([]);
        expect(log.pageErrors).toEqual([]);
      });

      test('cards in the same grid row have identical heights', async ({ page }) => {
        await page.goto(url);
        await expect(page.locator('#grid > li').first()).toBeVisible();
        const cards = await cardFacts(page);
        const rows = new Map();
        for (const c of cards) rows.set(c.liTop, [...(rows.get(c.liTop) ?? []), c]);
        const bad = [];
        let multi = 0;
        for (const [top, row] of rows) {
          if (row.length > 1) multi++;
          const hs = row.map((c) => c.cardH);
          if (Math.max(...hs) - Math.min(...hs) > 1) bad.push(`row at y=${top}: ${row.map((c) => `${c.slug}=${c.cardH.toFixed(1)}`).join(', ')}`);
          // The card fills its grid cell (no gap under a short card).
          for (const c of row) if (Math.abs(c.liH - c.cardH) > 1) bad.push(`${c.slug}: card ${c.cardH.toFixed(1)}px in a ${c.liH.toFixed(1)}px grid cell`);
        }
        expect(bad).toEqual([]);
        if (w >= 700) expect(multi, 'rows with more than one card').toBeGreaterThan(3);
        else expect(multi, 'phone: one card per row').toBe(0);
      });

      test('meta row (scheme chip + credit) stays on one line inside the card', async ({ page }) => {
        await page.goto(url);
        await expect(page.locator('#grid > li').first()).toBeVisible();
        const cards = await cardFacts(page);
        const bad = [];
        for (const c of cards) {
          const [chip, credit] = c.kids;
          if (c.kids.length !== 2 || !/scheme-chip/.test(chip?.cls) || credit?.cls !== 'credit-line') { bad.push(`${c.slug}: .by children are ${JSON.stringify(c.kids.map((k) => k.cls))}`); continue; }
          if (Math.abs(chip.top - credit.top) > 6) bad.push(`${c.slug}: chip and credit on different lines (tops ${chip.top.toFixed(0)} / ${credit.top.toFixed(0)})`);
          if (c.byH > c.byLineH * 1.6) bad.push(`${c.slug}: meta row is ${c.byH.toFixed(0)}px tall (line ${c.byLineH.toFixed(0)}px)`);
          if (credit.right > c.cardRight + 0.5 || c.byScrollW > c.byClientW + 1) bad.push(`${c.slug}: credit "${credit.text}" runs past the card (right ${credit.right.toFixed(0)} > ${c.cardRight.toFixed(0)}; scrollW ${c.byScrollW} > ${c.byClientW})`);
          if (c.creditScrollW > c.creditClientW + 1) bad.push(`${c.slug}: credit text is clipped`);
        }
        expect(bad).toEqual([]);
      });

      test('meta row credit text is the short form', async ({ page }) => {
        await page.goto(url);
        await expect(page.locator('#grid > li').first()).toBeVisible();
        const cards = await cardFacts(page);
        const bad = [];
        for (const c of cards) {
          const credit = c.kids[1]?.text ?? '';
          const src = SOURCES_JSON.sources.find((s) => s.id === c.source);
          const author = src.author;
          const authors = c.kids[1].text;
          const re = lang === 'en' ? /^by [^·]+$/ : /^[^·]+ 出品$/;
          if (!re.test(credit)) bad.push(`${c.slug}: credit "${credit}"`);
          if (/·|based on|基于|Adapted/.test(credit)) bad.push(`${c.slug}: credit carries more than the author: "${credit}"`);
          if (c.source === 'style-presets' && !credit.includes('slides-commons')) bad.push(`${c.slug}: expected slides-commons in "${authors}" (source author ${author})`);
          if (c.source === 'zarazhangrui' && !credit.includes('Zara Zhang')) bad.push(`${c.slug}: expected Zara Zhang in "${credit}"`);
        }
        expect(bad).toEqual([]);
      });

      test('tagline is clamped to two lines and its full text is in the title attribute', async ({ page }) => {
        await page.goto(url);
        await expect(page.locator('#grid > li').first()).toBeVisible();
        const cards = await cardFacts(page);
        const bad = [];
        let clamped = 0;
        for (const c of cards) {
          if (c.tagClamp !== '2') bad.push(`${c.slug}: -webkit-line-clamp is "${c.tagClamp}"`);
          if (c.tagOverflow !== 'hidden') bad.push(`${c.slug}: tagline overflow is ${c.tagOverflow}`);
          if (c.tagH > c.lineH * 2 + 2) bad.push(`${c.slug}: tagline shows ${(c.tagH / c.lineH).toFixed(1)} lines (${c.tagH}px, line ${c.lineH.toFixed(1)}px)`);
          if (c.tagTitle !== c.tagText) bad.push(`${c.slug}: title attribute is not the full tagline ("${c.tagTitle}" vs "${c.tagText}")`);
          if (c.tagScrollH > c.tagH + 1) clamped++;
        }
        expect(bad).toEqual([]);
        // The clamp is not vacuous: at least one real tagline is cut at the narrow widths.
        if (w <= 768 && lang === 'en') expect(clamped, 'cards whose tagline was actually clamped').toBeGreaterThan(0);
        test.info().annotations.push({ type: 'clamped', description: `${clamped} of ${cards.length} taglines clamped` });
      });
    });
  }
}

test('filtering keeps equal heights per row (the visible subset reflows)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('index.html#scheme=dark');
  await expect(page.locator('#grid > li').first()).toBeVisible();
  const cards = await cardFacts(page);
  expect(cards.length).toBeGreaterThan(3);
  expect(cards.length).toBeLessThan(CATALOG.length);
  const rows = new Map();
  for (const c of cards) rows.set(c.liTop, [...(rows.get(c.liTop) ?? []), c.cardH]);
  for (const [top, hs] of rows) expect(Math.max(...hs) - Math.min(...hs), `row y=${top}`).toBeLessThanOrEqual(1);
});
