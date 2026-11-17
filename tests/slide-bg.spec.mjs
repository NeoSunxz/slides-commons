// Per-template --slide-bg in prompts: concrete value (EN+ZH, page == zip) or generic wording.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { SITE, ALL_SLUGS, readZip } from './helpers.mjs';

const GENERIC = ['broadside', 'editorial-tri-tone', 'pin-and-paper', 'pink-script', 'retro-windows', 'scatterbrain', 'signal', 'stencil-tablet', 'studio'];
const CONCRETE_EXPECTED = { 'neo-grid-bold': ['#ECECE8', 'bg'], vellum: ['#2A3870', 'navy'], 'swiss-modern': ['#ffffff', 'white'] };

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const zipFile = (slug, name) => readZip(fs.readFileSync(path.join(SITE, 'zip', `${slug}.zip`))).entries.find((e) => e.name === `${slug}/${name}`)?.data.toString('utf8');
const pagePrompt = (slug, lang) => {
  const html = fs.readFileSync(path.join(SITE, ...(lang === 'zh' ? ['zh'] : []), 't', slug, 'index.html'), 'utf8');
  const m = html.match(new RegExp(`<pre id="prompt-${lang}"[^>]*>([\\s\\S]*?)</pre>`));
  return m ? decode(m[1]) : null;
};
const RE = {
  en: /set `--slide-bg` to `(#[0-9a-fA-F]+)` \(`design\.md` token `([\w-]+)`\)/,
  zh: /把 `--slide-bg` 设为 `(#[0-9a-fA-F]+)`（`design\.md` 中的 token `([\w-]+)`）/,
};
const GENERIC_RE = { en: /set `--slide-bg` to the color `design\.md` names/, zh: /把 `--slide-bg` 设为 `design\.md` 中指定为/ };
const info = (slug, lang) => {
  const txt = zipFile(slug, lang === 'en' ? 'PROMPT.md' : 'PROMPT.zh.md');
  const m = txt.match(RE[lang]);
  return { txt, m, generic: GENERIC_RE[lang].test(txt) };
};

test.describe('--slide-bg in prompts', () => {
  for (const [slug, [value, name]] of Object.entries(CONCRETE_EXPECTED)) {
    for (const lang of ['en', 'zh']) {
      test(`${slug} [${lang}]: concrete ${value} (token ${name})`, () => {
        test.skip(!ALL_SLUGS.includes(slug), `${slug} not in catalog`);
        const { m, generic } = info(slug, lang);
        expect(m, 'concrete sentence').not.toBeNull();
        expect(generic).toBe(false);
        expect(m[1].toLowerCase()).toBe(value.toLowerCase());
        expect(m[2]).toBe(name);
      });
    }
  }
  for (const lang of ['en', 'zh']) {
    test(`signal [${lang}]: generic wording, no hex pinned`, () => {
      const { m, generic } = info('signal', lang);
      expect(m).toBeNull();
      expect(generic).toBe(true);
    });
  }

  test('every slug is concrete or generic, never both/neither; generic set is exactly the known nine (EN+ZH agree)', () => {
    const bad = [], generic = { en: [], zh: [] };
    for (const slug of ALL_SLUGS) for (const lang of ['en', 'zh']) {
      const { m, generic: g } = info(slug, lang);
      if (!!m === g) bad.push(`${slug} ${lang}: concrete=${!!m} generic=${g}`);
      if (g) generic[lang].push(slug);
    }
    expect(bad).toEqual([]);
    expect(generic.en).toEqual(generic.zh);
    const known = GENERIC.filter((s) => ALL_SLUGS.includes(s)).sort();
    expect([...generic.en].sort()).toEqual(known);
  });

  test('every concrete value is a valid hex, appears in that template\'s design.md, and EN/ZH agree', () => {
    const bad = [];
    let n = 0;
    for (const slug of ALL_SLUGS) {
      const en = info(slug, 'en').m, zh = info(slug, 'zh').m;
      if (!en && !zh) continue;
      n++;
      if (!en || !zh) { bad.push(`${slug}: only one language is concrete`); continue; }
      if (en[1] !== zh[1] || en[2] !== zh[2]) bad.push(`${slug}: EN ${en[1]}/${en[2]} vs ZH ${zh[1]}/${zh[2]}`);
      if (!/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(en[1])) bad.push(`${slug}: ${en[1]} is not a valid hex`);
      const design = zipFile(slug, 'design.md').toLowerCase();
      if (!design.includes(en[1].toLowerCase())) bad.push(`${slug}: ${en[1]} not found in design.md`);
      if (!design.includes(en[2].toLowerCase())) bad.push(`${slug}: token ${en[2]} not found in design.md`);
    }
    expect(n).toBeGreaterThan(0);
    expect(bad).toEqual([]);
  });

  test('page prompt equals zip prompt for every template (EN and ZH)', () => {
    const bad = [];
    for (const slug of ALL_SLUGS) for (const [lang, file] of [['en', 'PROMPT.md'], ['zh', 'PROMPT.zh.md']]) {
      if (pagePrompt(slug, lang) !== zipFile(slug, file)) bad.push(`${slug} ${lang}`);
    }
    expect(bad).toEqual([]);
  });
});
