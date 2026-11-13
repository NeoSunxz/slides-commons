// Prompt rules: EN and ZH prompts (zip PROMPT.md / PROMPT.zh.md) carry the current rules,
// no longer carry the old placeholder wording, and do not contradict each other.
import { test, expect } from '@playwright/test';
import { SITE, SLUG, readSiteZip, NO_WEBFONT_SLUGS } from './helpers.mjs';

const get = (entries, slug, name) => entries.find((e) => e.name === `${slug}/${name}`).data.toString('utf8');

const RULES = {
  en: [
    [/Real content, drafted when missing/, 'drafted-content rule'],
    [/never put placeholders such as "TBD" on a slide/, 'no TBD placeholders'],
    [/must be listed in your final reply/, 'drafted items listed in final reply'],
    [/When `design\.md` contradicts itself/, 'design.md self-contradiction rule'],
    [/follow the stricter rule/, 'stricter rule'],
    [/overrides any claim in `design\.md` that CJK automatically falls through/, 'CJK weight override'],
    [/Only real links and codes/, 'real links rule'],
    [/QR codes/, 'QR mention'],
    [/section numbers and labels shown on slides must match the slide's page number/, 'section numbers = page numbers'],
    [/not a panel, card or paper fill/, '--slide-bg is canvas, not panel'],
  ],
  zh: [
    [/内容真实；缺失时自行起草/, 'drafted-content rule'],
    [/绝不放“待补充”之类的占位符/, 'no 待补充 placeholders'],
    [/都必须列在最终回复里/, 'drafted items listed in final reply'],
    [/自相矛盾时/, 'design.md self-contradiction rule'],
    [/遵循更严格的规则/, 'stricter rule'],
    [/优先于 `design\.md` 中任何“CJK 会自动回退到更重字重”的说法/, 'CJK weight override'],
    [/只用真实的链接和码/, 'real links rule'],
    [/二维码/, 'QR mention'],
    [/章节编号和标签必须与该页的页码一致/, 'section numbers = page numbers'],
    [/不是面板、卡片或纸张的填充色/, '--slide-bg is canvas, not panel'],
  ],
};
const OLD = {
  en: [/mark them clearly and list them/, /if you need placeholders/i, /any placeholders or open questions/],
  zh: [/需要占位时明确标出/, /所有占位内容或待确认/, /不编造事实或数据；需要占位/],
};

for (const slug of [SLUG, 'raw-grid', 'coral']) {
  test(`prompt rules present, old placeholder wording gone, EN/ZH consistent (${slug})`, () => {
    const { entries } = readSiteZip(SITE, slug);
    for (const [lang, file] of [['en', 'PROMPT.md'], ['zh', 'PROMPT.zh.md']]) {
      const md = get(entries, slug, file);
      for (const [re, label] of RULES[lang]) if (!(label === 'CJK weight override' && NO_WEBFONT_SLUGS.includes(slug))) expect.soft(md, `${slug} ${file}: ${label}`).toMatch(re);
      for (const re of OLD[lang]) expect.soft(md, `${slug} ${file}: old wording ${re}`).not.toMatch(re);
    }
    const en = get(entries, slug, 'PROMPT.md');
    const zh = get(entries, slug, 'PROMPT.zh.md');
    // No remaining instruction to leave placeholders, in either language.
    expect.soft(en.match(/placeholder/gi) ?? [], `${slug} EN: remaining "placeholder" mentions (only the prohibition is allowed)`).toHaveLength(1);
    expect.soft(zh.match(/占位/g) ?? [], `${slug} ZH: remaining "占位" mentions (only the prohibition is allowed)`).toHaveLength(1);
    // Same structure: identical number of top-level sections and hard-constraint bullets.
    const count = (md, re) => (md.match(re) ?? []).length;
    expect.soft(count(zh, /^## \d+\./gm), `${slug}: section count EN vs ZH`).toBe(count(en, /^## \d+\./gm));
    const bullets = (md) => {
      const m = md.match(/^## 5\.[^\n]*\n([\s\S]*?)(?=^## \d+\.)/m);
      return m ? count(m[1], /^- \*\*/gm) : -1;
    };
    expect.soft(bullets(zh), `${slug}: §5 bullet count EN vs ZH`).toBe(bullets(en));
    expect.soft(bullets(en)).toBeGreaterThan(0);
  });
}
