// Shared header theming (Convert / Skills heroes), kit-page redesign (tabs, copy, thumbnails, disclosures)
// and the kit font-stack rule (original font names first). Reads site/ built by the build project.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from './font-cache.mjs';
import { SITE, readZip, normalizeEol } from './helpers.mjs';

const CJK = /[　-〿㐀-鿿豈-﫿＀-￯]/;
const ORANGE = 'rgb(255, 117, 72)'; // #ff7548 = home hero-bottom / closing chapter
const LIME = 'rgb(205, 234, 104)'; // #cdea68 = home process chapter
const LANGS = {
  en: { prefix: '', copied: 'Copied', copy: 'Copy', privacy: 'Privacy and use', details: 'Details', tabs: ['macOS and Linux', 'Windows PowerShell', 'One project'] },
  zh: { prefix: 'zh/', copied: '已复制', copy: '复制', privacy: '隐私与使用', details: '详情', tabs: ['macOS 和 Linux', 'Windows PowerShell', '仅一个项目'] },
};
const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const bg = (loc) => loc.evaluate((el) => getComputedStyle(el).backgroundColor);

// ---------------------------------------------------------------------------
// 1. Header takes the hero colours on Convert / Skills
// ---------------------------------------------------------------------------
for (const [lang, L] of Object.entries(LANGS)) {
  for (const [kind, color] of [['convert', ORANGE], ['skills', LIME]]) {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      test(`[${lang}] ${kind} at ${w}x${h}: header wears the hero colour at the top and returns to neutral below the hero`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(`${L.prefix}${kind}/`);
        const header = page.locator('.site-header');
        const hero = page.locator('.kit-hero');
        expect(await bg(hero), 'hero colour').toBe(color);
        await expect.poll(() => bg(header), { message: 'header at scroll 0' }).toBe(color);
        await expect(header).toHaveAttribute('data-chapter', '0');
        // Still themed while the hero is mostly scrolled past but remains under the header.
        const heroH = await hero.evaluate((el) => el.offsetHeight);
        const headH = await header.evaluate((el) => el.offsetHeight);
        await page.evaluate((y) => scrollTo(0, y), Math.max(40, heroH - headH - 80));
        await expect.poll(() => bg(header)).toBe(color);
        // Past the hero: neutral again, no inline theme left behind.
        await page.evaluate((y) => scrollTo(0, y), heroH + 200);
        await expect.poll(() => header.evaluate((el) => el.hasAttribute('data-chapter'))).toBe(false);
        await expect.poll(() => bg(header)).not.toBe(color);
        expect(await header.evaluate((el) => el.getAttribute('style') ?? '')).not.toMatch(/--bg|--ink|--accent/);
        // Back to the top: coloured again.
        await page.evaluate(() => scrollTo(0, 0));
        await expect.poll(() => bg(header)).toBe(color);
        // Header text stays readable on the hero colour: ink differs from the background.
        const link = await page.locator('.site-nav > a').first().evaluate((el) => getComputedStyle(el).color);
        expect(link).not.toBe(color);
      });
    }
  }

  test(`[${lang}] the Convert / Skills header colours equal the matching home chapters`, async ({ page }) => {
    await page.goto(`${L.prefix}index.html`);
    expect(await bg(page.locator('.home-process')), 'home process chapter == Skills lime').toBe(LIME);
    expect(await bg(page.locator('.home-closing')), 'home closing chapter == Convert orange').toBe(ORANGE);
  });
}

// ---------------------------------------------------------------------------
// 2. Kit pages: tabs, copy, thumbnails, disclosures, overflow
// ---------------------------------------------------------------------------
for (const [lang, L] of Object.entries(LANGS)) {
  test.describe(`skills page install tabs [${lang}]`, () => {
    test('click switches the visible panel; one panel visible at a time; labels match', async ({ page }) => {
      await page.goto(`${L.prefix}skills/`);
      const labels = page.locator('.kit-tabbar label');
      expect((await labels.allTextContents()).map((t) => t.trim())).toEqual(L.tabs);
      for (let i = 0; i < 3; i++) {
        await labels.nth(i).click();
        await expect(page.locator(`#kit-tab-${i}`)).toBeChecked();
        for (let j = 0; j < 3; j++) {
          const panel = page.locator(`.kit-panel-${j}`);
          if (i === j) await expect(panel, `panel ${j} visible when tab ${i} active`).toBeVisible();
          else await expect(panel, `panel ${j} hidden when tab ${i} active`).toBeHidden();
        }
      }
    });

    test('keyboard: arrow keys move between tabs and change the panel', async ({ page }) => {
      await page.goto(`${L.prefix}skills/`);
      await page.locator('#kit-tab-0').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#kit-tab-1')).toBeChecked();
      await expect(page.locator('.kit-panel-1')).toBeVisible();
      await expect(page.locator('.kit-panel-0')).toBeHidden();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#kit-tab-2')).toBeChecked();
      await expect(page.locator('.kit-panel-2')).toBeVisible();
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator('#kit-tab-0')).toBeChecked();
      await expect(page.locator('.kit-panel-0')).toBeVisible();
    });

    test('Copy copies exactly the visible command, shows the "copied" label, then reverts', async ({ page, context, baseURL }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseURL).origin });
      await page.goto(`${L.prefix}skills/`);
      for (let i = 0; i < 3; i++) {
        await page.locator('.kit-tabbar label').nth(i).click();
        const btn = page.locator(`.kit-panel-${i} .kit-copy`);
        await expect(btn).toBeVisible();
        await expect(btn).toHaveText(L.copy);
        const expected = await page.locator(`#kit-cmd-${i}`).evaluate((el) => el.textContent);
        expect(expected.length).toBeGreaterThan(20);
        await page.evaluate(() => navigator.clipboard.writeText('__sentinel__'));
        await btn.click();
        await expect(btn).toHaveText(L.copied);
        await expect(btn).toHaveClass(/is-done/);
        expect(normalizeEol(await page.evaluate(() => navigator.clipboard.readText())), `tab ${i} clipboard`).toBe(normalizeEol(expected));
        await expect(btn).toHaveText(L.copy, { timeout: 5000 });
      }
      // The command is the install command for this pack, not something else.
      expect(await page.locator('#kit-cmd-0').textContent()).toContain('slides-commons-skills');
      expect(await page.locator('#kit-cmd-1').textContent()).toContain('Expand-Archive');
    });
  });

  for (const kind of ['convert', 'skills']) {
    test(`[${lang}] ${kind}: every image shows the whole 16:9 slide (no cropping)`, async ({ page }) => {
      await page.goto(`${L.prefix}${kind}/`);
      const imgs = page.locator('main img');
      const n = await imgs.count();
      if (kind === 'convert') expect(n, 'convert page has thumbnails').toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        const img = imgs.nth(i);
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth), { message: `image ${i} loaded` }).toBeGreaterThan(0);
        const r = await img.evaluate((el) => {
          const b = el.getBoundingClientRect();
          return { w: b.width, h: b.height, nw: el.naturalWidth, nh: el.naturalHeight, fit: getComputedStyle(el).objectFit, src: el.getAttribute('src') };
        });
        expect(Math.abs(r.nw / r.nh - 16 / 9), `${r.src}: natural ratio`).toBeLessThan(0.01);
        expect(Math.abs(r.w / r.h - 16 / 9), `${r.src}: rendered box ratio ${r.w}x${r.h}`).toBeLessThan(0.02);
        expect(r.fit, `${r.src}: object-fit must not crop`).not.toBe('cover');
        expect(r.fit, `${r.src}: object-fit must not crop`).not.toBe('none');
      }
    });

    test(`[${lang}] ${kind}: disclosures exist and are collapsed by default; they open on click`, async ({ page }) => {
      await page.goto(`${L.prefix}${kind}/`);
      const name = kind === 'convert' ? L.privacy : L.details;
      const detail = page.locator('details.kit-details');
      await expect(detail).toHaveCount(1);
      await expect(detail.locator('summary')).toHaveText(name);
      expect(await detail.evaluate((el) => el.open), `"${name}" collapsed`).toBe(false);
      await expect(detail.locator('p').first()).toBeHidden();
      const prompt = page.locator('details.kit-prompt');
      await expect(prompt).toHaveCount(1);
      expect(await prompt.evaluate((el) => el.open), 'prompt collapsed').toBe(false);
      await expect(prompt.locator('pre')).toBeHidden();
      for (const d of await page.locator('main details').all()) expect(await d.evaluate((el) => el.open), 'every disclosure starts collapsed').toBe(false);
      await detail.locator('summary').click();
      expect(await detail.evaluate((el) => el.open)).toBe(true);
      await expect(detail.locator('p').first()).toBeVisible();
    });

    for (const [w, h] of [[390, 844], [1440, 900]]) {
      test(`[${lang}] ${kind}: no horizontal overflow at ${w}x${h} (also with the disclosures open)`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(`${L.prefix}${kind}/`);
        await page.evaluate(() => document.querySelectorAll('main details').forEach((d) => { d.open = true; }));
        if (kind === 'skills') for (const i of [0, 1, 2]) {
          await page.locator('.kit-tabbar label').nth(i).click();
          expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `tab ${i}`).toBeLessThanOrEqual(0);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Kit font-stack rule: original font names first
// ---------------------------------------------------------------------------
test.describe('kit font-stack rule', () => {
  const kit = readZip(fs.readFileSync(path.join(SITE, 'zip', 'convert-kit.zip')));
  const text = (n) => kit.entries.find((e) => e.name === n)?.data.toString('utf8');
  const pagePrompt = (rel) => {
    const html = fs.readFileSync(path.join(SITE, ...rel), 'utf8');
    return unescapeHtml(html.match(/<pre id="prompt-kit"[^>]*>([\s\S]*?)<\/pre>/)[1]);
  };

  test('EN convert prompt (page and zip) names "Microsoft YaHei" and its font-stack lines carry no CJK characters', () => {
    for (const [where, p] of [['page', pagePrompt(['convert', 'index.html'])], ['zip', text('convert-kit/PROMPT.md')]]) {
      expect(p, where).toContain('"Microsoft YaHei"');
      const lines = p.split('\n').filter((l) => l.includes('"Microsoft YaHei"'));
      expect(lines.length, `${where}: lines`).toBeGreaterThan(0);
      for (const l of lines) expect(CJK.test(l), `${where}: CJK in "${l.slice(0, 100)}"`).toBe(false);
      expect(p, `${where}: original names first, then the open replacement`).toMatch(/original font names first/i);
      expect(p, where).toContain('"HarmonyOS Sans SC", "Noto Sans SC", sans-serif');
      expect(p, where).toMatch(/never ship proprietary font files/);
      expect(p, where).not.toContain('微软雅黑');
    }
  });

  test('ZH convert prompt (page and zip) contains 微软雅黑 and the same font stack', () => {
    for (const [where, p] of [['page', pagePrompt(['zh', 'convert', 'index.html'])], ['zip', text('convert-kit/PROMPT.zh.md')]]) {
      expect(p, where).toContain('微软雅黑');
      expect(p, where).toContain('"Microsoft YaHei", "微软雅黑", "HarmonyOS Sans SC", "Noto Sans SC", sans-serif');
      expect(p, where).toMatch(/专有字体文件/);
    }
  });

  test('spec/font-substitution.md in convert-kit.zip carries the rule', () => {
    const t = text('convert-kit/spec/font-substitution.md');
    expect(t, 'file present').toBeTruthy();
    expect(t).toMatch(/Font stack for personal templates/);
    expect(t).toContain('"Microsoft YaHei", "HarmonyOS Sans SC", "Noto Sans SC", sans-serif');
    expect(t).toMatch(/original font names first/);
    expect(t).toMatch(/localized family name/);
    expect(t).toMatch(/never ship the proprietary font files/);
    expect(CJK.test(t.split('\n').filter((l) => l.includes('font-family: "Microsoft YaHei"')).join('\n')), 'no CJK in the font-stack example').toBe(false);
  });
});
