// Prompt font rules across all templates (EN and ZH): CJK-only quoted Google Fonts links,
// display= preserved, CJK display families kept, C-rules present; isCjkFamily unit tests.
import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { SITE, ALL_SLUGS, NO_WEBFONT_SLUGS, upstreamHtml, skillDesign, readSiteZip } from './helpers.mjs';
import { isCjkFamily, cjkOnlyLinks } from '../scripts/fonts.mjs';

// Independent classification (deliberately not the code under test).
const CJK_INDEP = /\b(SC|TC|HK|JP|KR|CJK)\b|^ZCOOL |^LXGW |Long Cang|Ma Shan Zheng|Liu Jian Mao Cao|Zhi Mang Xing|Yozai/;
const GF = /https:\/\/fonts\.googleapis\.com\/css2?\?[^"'`\s)<>]+/g;
const famsOf = (url) => new URL(url.replace(/&amp;/g, '&')).searchParams.getAll('family').map((f) => f.split(':')[0].replace(/\+/g, ' '));
const section = (md, n) => {
  const m = md.match(new RegExp(`^## ${n}\\.[^\\n]*\\n([\\s\\S]*?)(?=^## \\d+\\.|(?![\\s\\S]))`, 'm'));
  return m ? m[1] : '';
};

function cjkSectionLinks(design) {
  const lines = design.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{2,3}\s.*\bCJK\b/i.test(l));
  if (start < 0) return [];
  const level = lines[start].match(/^#+/)[0].length;
  let end = lines.findIndex((l, i) => i > start && new RegExp(`^#{1,${level}}\\s`).test(l));
  if (end < 0) end = lines.length;
  return [...new Set(lines.slice(start, end).join('\n').match(GF) ?? [])];
}

const latinFamilies = new Set();
const allFamilies = new Set();
for (const s of ALL_SLUGS) for (const m of upstreamHtml(s).matchAll(GF)) for (const f of famsOf(m[0])) (CJK_INDEP.test(f) ? allFamilies : latinFamilies).add(f);

test('isCjkFamily: CJK true', () => {
  for (const f of ['Noto Sans SC', 'Noto Serif SC', 'Noto Sans JP', 'ZCOOL XiaoWei', 'ZCOOL KuaiLe', 'Long Cang', 'Ma Shan Zheng', 'Noto Sans TC', 'LXGW WenKai', 'Zhi Mang Xing', 'Liu Jian Mao Cao', 'Noto Serif CJK SC']) {
    expect(isCjkFamily(f), f).toBe(true);
  }
});

test('isCjkFamily: every Latin family used by templates is false', () => {
  expect(latinFamilies.size, 'Latin family count').toBeGreaterThanOrEqual(40);
  console.log(`Latin families: ${latinFamilies.size}`);
  for (const f of latinFamilies) expect(isCjkFamily(f), f).toBe(false);
});

test('cjkOnlyLinks: filters Latin, keeps display, drops all-Latin links', () => {
  const [one] = cjkOnlyLinks(['https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap']);
  expect(one).toBe('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
  expect(cjkOnlyLinks(['https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap'])).toEqual([]);
  expect(cjkOnlyLinks(['https://example.com/css2?family=Noto+Sans+SC'])).toEqual([]);
});

for (const slug of ALL_SLUGS) {
  test(`prompt font links and rules: ${slug}`, () => {
    const { entries } = readSiteZip(SITE, slug);
    const get = (n) => entries.find((e) => e.name === `${slug}/${n}`).data.toString('utf8');
    const design = fs.readFileSync(skillDesign(slug), 'utf8');
    const fromDesign = cjkSectionLinks(design);
    const expectedFams = new Set();
    for (const l of fromDesign) for (const f of famsOf(l)) if (CJK_INDEP.test(f)) expectedFams.add(f);
    const tplLatin = new Set();
    for (const m of upstreamHtml(slug).matchAll(GF)) for (const f of famsOf(m[0])) if (!CJK_INDEP.test(f)) tplLatin.add(f);

    for (const name of ['PROMPT.md', 'PROMPT.zh.md']) {
      const md = get(name);
      const links = [...new Set(md.match(GF) ?? [])];
      const quotedFams = new Set();
      for (const l of links) {
        const fams = famsOf(l);
        expect(fams.length, `${slug} ${name} link without family: ${l}`).toBeGreaterThan(0);
        for (const f of fams) {
          expect(CJK_INDEP.test(f), `${slug} ${name}: non-CJK family "${f}" quoted in ${l}`).toBe(true);
          expect(tplLatin.has(f), `${slug} ${name}: Latin template family "${f}" quoted`).toBe(false);
          quotedFams.add(f);
        }
        expect(new URL(l).searchParams.get('display'), `${slug} ${name}: display= missing in ${l}`).toBeTruthy();
      }
      // CJK families from design.md's CJK section must all survive (incl. ZCOOL/Long Cang/...).
      // System-font-only templates (no web fonts upstream, e.g. raw-grid) deliberately quote no link,
      // even though design.md allows Noto Sans SC for CJK (reported as an observation).
      if (NO_WEBFONT_SLUGS.includes(slug)) { expect(links, `${slug} ${name}: system-font template quotes no link`).toEqual([]); continue; }
      expect([...quotedFams].sort(), `${slug} ${name}: CJK families quoted vs design.md CJK section`).toEqual([...expectedFams].sort());
      if (!expectedFams.size) expect(links, `${slug} ${name}: no link expected`).toEqual([]);
      // Links are only quoted in §4.
      for (const l of links) expect(section(md, 4), `${slug} ${name}: link in §4`).toContain(l);
    }

    // C rules (only meaningful when the pack ships fonts/).
    const hasFonts = entries.some((e) => e.name === `${slug}/fonts/fonts.css`);
    const EN = [/latin and the latin-ext rules/, /embed it once/, /fonts\/.{0,20} supersedes it/, /legibility rule \(contrast or minimum size\)/];
    const ZH = [/latin 与 latin-ext 两组规则/, /只嵌入一次/, /以素材包的 `?fonts\/`? 为准/, /因可读性规则/];
    expect(get('PROMPT.md'), `${slug} EN legibility`).toMatch(EN[3]);
    expect(get('PROMPT.zh.md'), `${slug} ZH legibility`).toMatch(ZH[3]);
    if (hasFonts) {
      for (const r of EN.slice(0, 3)) expect(get('PROMPT.md'), `${slug} EN ${r}`).toMatch(r);
      for (const r of ZH.slice(0, 3)) expect(get('PROMPT.zh.md'), `${slug} ZH ${r}`).toMatch(r);
    }
  });
}
