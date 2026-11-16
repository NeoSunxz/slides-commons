// Usage steps / button order (with and without a site URL), pack README font licenses,
// "Signature moves" in prompts, and the ZH download-button label quoted in the ZH prompt.
// Node only: builds into the OS temp dir via --out; the default site/ is the no-URL build.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, SITE, ALL_SLUGS, COLLECTION_SLUGS, UP_SLUGS, UPSTREAM_SKILL, makeTempDir, readZip } from './helpers.mjs';

const URL_BASE = 'https://neosunxz.github.io/slides-commons/';
let urlOut, tmpRoot;

test.beforeAll(() => {
  tmpRoot = makeTempDir('sc-flow-');
  urlOut = path.join(tmpRoot, 'site');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--out', urlOut, '--site-url', URL_BASE], {
    cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_I18N_DIR: '', SC_SITE_URL: '' },
  });
  expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
});
test.afterAll(() => { if (tmpRoot) fs.rmSync(tmpRoot, { recursive: true, force: true }); });

const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const strip = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const detail = (root, lang, slug) => read(root, ...(lang === 'zh' ? ['zh'] : []), 't', slug, 'index.html');
const zipEntries = (root, slug) => readZip(fs.readFileSync(path.join(root, 'zip', `${slug}.zip`))).entries;
const zipText = (root, slug, name) => zipEntries(root, slug).find((e) => e.name === `${slug}/${name}`)?.data.toString('utf8');
const olItems = (html, cls) => {
  const m = html.match(new RegExp(`<ol class="${cls}">([\\s\\S]*?)</ol>`));
  return m ? [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => strip(x[1])) : null;
};

const SAMPLE = ['neo-grid-bold', 'creative-voltage', 'bold-signal'].filter((s) => ALL_SLUGS.includes(s));
const AUTO = {
  en: { steps: ['Copy the prompt.', 'Paste it into your coding agent (Claude Code, Codex, Cursor, …), ideally in an empty folder. It downloads the template pack itself.', 'Answer its questions.'], offline: 'Offline or restricted network? Download the pack (.zip)', copy: 'Copy prompt', dl: 'Download assets (.zip)' },
  zh: { steps: ['复制提示词。', '粘贴给你的 coding agent（Claude Code、Codex、Cursor 等），最好在空文件夹中。它会自己下载模板素材包。', '回答它的问题。'], offline: '处于离线或受限网络？请下载素材包（.zip）', copy: '复制提示词', dl: '下载素材包（.zip）' },
};

function buttons(html) {
  const aside = html.match(/<aside class="actions">([\s\S]*?)<\/aside>/)[1];
  const list = [];
  for (const m of aside.matchAll(/<(a|button)\b([^>]*class="btn[^"]*"[^>]*)>([\s\S]*?)<\/\1>/g)) {
    list.push({ kind: /data-copy/.test(m[2]) ? 'copy' : /download/.test(m[2]) ? 'download' : 'other', primary: /class="btn primary"/.test(m[2]), text: strip(m[3]) });
  }
  return { aside, list };
}

test.describe('1. usage steps and button order', () => {
  for (const lang of ['en', 'zh']) {
    for (const slug of SAMPLE) {
      test(`[site URL] ${lang} ${slug}: auto-download steps, Copy first and primary, Download secondary, offline note`, () => {
        const { aside, list } = buttons(detail(urlOut, lang, slug));
        expect(olItems(aside, 'steps small')).toEqual(AUTO[lang].steps);
        expect(list.map((b) => b.kind)).toEqual(['copy', 'download']);
        expect(list.map((b) => b.primary)).toEqual([true, false]);
        expect(list[0].text).toBe(AUTO[lang].copy);
        expect(list[1].text).toBe(AUTO[lang].dl);
        expect(aside).toContain('class="help offline"');
        expect(strip(aside)).toContain(AUTO[lang].offline);
        // Note sits between the two buttons (Download is the offline fallback).
        expect(aside.indexOf('data-copy')).toBeLessThan(aside.indexOf('help offline'));
        expect(aside.indexOf('help offline')).toBeLessThan(aside.indexOf('download>'));
      });
      test(`[local build] ${lang} ${slug}: download-first steps, Download primary first, no offline note`, () => {
        const { aside, list } = buttons(detail(SITE, lang, slug));
        const steps = olItems(aside, 'steps small');
        expect(steps).not.toEqual(AUTO[lang].steps);
        expect(steps[0]).toMatch(lang === 'en' ? /^Download the pack and unzip it/ : /^下载素材包并解压/);
        expect(list.map((b) => b.kind)).toEqual(['download', 'copy']);
        expect(list.map((b) => b.primary)).toEqual([true, false]);
        expect(aside).not.toContain('help offline');
        expect(strip(aside)).not.toContain(AUTO[lang].offline);
      });
    }
    test(`[home ${lang}] intro/steps change only with a site URL`, () => {
      const rel = lang === 'zh' ? ['zh', 'index.html'] : ['index.html'];
      const withUrl = read(urlOut, ...rel), plain = read(SITE, ...rel);
      const lead = (h) => strip(h.match(/<p class="lead">([\s\S]*?)<\/p>/)[1]);
      const steps = (h) => olItems(h, 'steps');
      expect(lead(withUrl)).not.toBe(lead(plain));
      expect(steps(withUrl)).toHaveLength(3);
      expect(steps(plain)).toHaveLength(3);
      expect(steps(withUrl)[1]).toMatch(lang === 'en' ? /Copy the prompt/ : /复制提示词/);
      expect(steps(withUrl)[1]).toMatch(lang === 'en' ? /downloads the template pack itself/ : /自己下载模板素材包/);
      expect(steps(plain)[1]).toMatch(lang === 'en' ? /Download/ : /下载/);
      expect(steps(plain).join(' ')).not.toMatch(/downloads the template pack itself|自己下载模板素材包/);
      expect(lead(withUrl)).toMatch(lang === 'en' ? /copy its prompt/ : /复制它的提示词/);
    });
  }
  test('every detail page in both modes uses the matching step set (all templates, EN+ZH)', () => {
    const bad = [];
    for (const slug of ALL_SLUGS) for (const lang of ['en', 'zh']) {
      const a = olItems(detail(urlOut, lang, slug), 'steps small');
      const b = olItems(detail(SITE, lang, slug));
      if (JSON.stringify(a) !== JSON.stringify(AUTO[lang].steps)) bad.push(`${lang} ${slug}: url mode steps`);
      if (/help offline/.test(detail(SITE, lang, slug))) bad.push(`${lang} ${slug}: offline note in local mode`);
      if (!/help offline/.test(detail(urlOut, lang, slug))) bad.push(`${lang} ${slug}: no offline note in url mode`);
      void b;
    }
    expect(bad).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
test.describe('2. pack README font licenses', () => {
  const kindOf = (txt) => (/SIL OPEN FONT LICENSE/i.test(txt) ? 'SIL Open Font License 1.1' : /Apache License/i.test(txt) ? 'Apache License 2.0' : /Permission is hereby granted/i.test(txt) ? 'MIT License' : null);
  const fileOf = (txt) => (/SIL OPEN FONT LICENSE/i.test(txt) ? 'OFL.txt' : 'LICENSE.txt');

  test('README font line matches the license files shipped per family; fonts.css header does not claim OFL', () => {
    const bad = [];
    for (const root of [SITE, urlOut]) for (const slug of ALL_SLUGS) {
      const ents = zipEntries(root, slug);
      const lic = ents.filter((e) => new RegExp(`^${slug}/fonts/[^/]+/(OFL|LICENSE)\\.txt$`).test(e.name));
      const readme = zipText(root, slug, 'README.md');
      const line = readme.split('\n').find((l) => /Latin web fonts in `fonts\/`/.test(l));
      if (!lic.length) { if (line) bad.push(`${slug}: README has a font line but no fonts/`); continue; }
      if (!line) { bad.push(`${slug}: fonts shipped but README has no font line`); continue; }
      const paren = line.match(/\(([^()]*)\)\s*\.?$/)?.[1] ?? '';
      const fams = lic.map((e) => ({ id: e.name.split('/')[2], kind: kindOf(e.data.toString('utf8')), file: e.name.split('/')[3], text: e.data.toString('utf8') }));
      for (const f of fams) {
        if (!f.kind) bad.push(`${slug}: ${f.id} license file unrecognised`);
        if (f.file !== fileOf(f.text)) bad.push(`${slug}: ${f.id} shipped as ${f.file}`);
        if (!paren.includes(f.kind)) bad.push(`${slug}: README lacks "${f.kind}" for ${f.id}: ${paren}`);
        if (!paren.includes(`fonts/<family>/${f.file}`)) bad.push(`${slug}: README lacks fonts/<family>/${f.file}`);
      }
      const kinds = new Set(fams.map((f) => f.kind));
      if (kinds.size > 1) {
        // Mixed: each kind is listed with its families.
        for (const k of kinds) {
          const m = paren.match(new RegExp(`${k}: ([^;]*?)(?:;|$)`));
          const listed = m ? m[1].split(',').map((x) => x.trim().toLowerCase().replace(/\s+/g, '-')) : [];
          const want = fams.filter((f) => f.kind === k).map((f) => f.id).sort();
          // Family names in the line are display names; ids are lowercase-dashed.
          const norm = (a) => a.map((x) => x.replace(/[^a-z0-9]/g, ''));
          if (!norm(want).every((w) => norm(listed).includes(w))) bad.push(`${slug}: ${k} families ${want} not matched by "${m?.[1]}"`);
        }
      } else if (/:/.test(paren.split(';')[0].replace(/see.*/, ''))) bad.push(`${slug}: single-license line lists families: ${paren}`);
      const css = ents.find((e) => e.name === `${slug}/fonts/fonts.css`)?.data.toString('utf8');
      const head = css.match(/^\/\*[\s\S]*?\*\//)?.[0] ?? '';
      if (/SIL OFL|Open Font License/i.test(head)) bad.push(`${slug}: fonts.css header claims OFL`);
      if (!/license/i.test(head)) bad.push(`${slug}: fonts.css header does not point to licenses`);
    }
    expect(bad).toEqual([]);
  });

  test('creative-voltage: OFL for Space Mono and Syne, Apache 2.0 for Yellowtail', () => {
    test.skip(!ALL_SLUGS.includes('creative-voltage'));
    const readme = zipText(SITE, 'creative-voltage', 'README.md');
    const line = readme.split('\n').find((l) => /Latin web fonts/.test(l));
    expect(line).toMatch(/SIL Open Font License 1\.1: Space Mono, Syne/);
    expect(line).toMatch(/Apache License 2\.0: Yellowtail/);
    expect(line).toContain('`fonts/<family>/OFL.txt`');
    expect(line).toContain('`fonts/<family>/LICENSE.txt`');
    const names = zipEntries(SITE, 'creative-voltage').map((e) => e.name);
    expect(names).toContain('creative-voltage/fonts/yellowtail/LICENSE.txt');
    expect(zipText(SITE, 'creative-voltage', 'fonts/yellowtail/LICENSE.txt')).toMatch(/Apache License/);
    expect(names).not.toContain('creative-voltage/fonts/yellowtail/OFL.txt');
    expect(zipText(SITE, 'creative-voltage', 'fonts/fonts.css')).not.toMatch(/SIL OFL/);
  });

  test('an OFL-only template still says one plain license without a family list', () => {
    const readme = zipText(SITE, 'neo-grid-bold', 'README.md');
    const line = readme.split('\n').find((l) => /Latin web fonts/.test(l));
    expect(line).toMatch(/\(SIL Open Font License 1\.1; see `fonts\/<family>\/OFL\.txt`\)/);
  });
});

// ---------------------------------------------------------------------------
test.describe('3. Signature moves in prompts', () => {
  const movesOf = (prompt, lang) => {
    const lines = prompt.split('\n');
    const i = lines.findIndex((l) => (lang === 'en' ? /^- \*\*Signature moves:\*\*/ : /^- \*\*标志性手法\*\*（原文）：/).test(l));
    if (i < 0) return null;
    const out = [];
    for (const l of lines.slice(i + 1)) { const m = l.match(/^ {2}- (.+)$/); if (!m) break; out.push(m[1]); }
    return out;
  };
  for (const root of ['local', 'url']) {
    test(`[${root}] all ${COLLECTION_SLUGS.length} collection prompts (EN+ZH) have 1-5 signature bullets; EN and ZH agree`, () => {
      const base = root === 'local' ? SITE : urlOut;
      const bad = [];
      expect(COLLECTION_SLUGS).toHaveLength(16);
      for (const slug of COLLECTION_SLUGS) {
        const en = movesOf(zipText(base, slug, 'PROMPT.md'), 'en');
        const zh = movesOf(zipText(base, slug, 'PROMPT.zh.md'), 'zh');
        for (const [l, m] of [['en', en], ['zh', zh]]) {
          if (!m) bad.push(`${slug} ${l}: no signature line`);
          else if (m.length < 1 || m.length > 5) bad.push(`${slug} ${l}: ${m.length} bullets`);
          else if (m.some((x) => !x.trim() || x.length > 260)) bad.push(`${slug} ${l}: empty/overlong bullet`);
          else if (m.some((x) => /\{(colors|components|typography)\./.test(x))) bad.push(`${slug} ${l}: unresolved token`);
        }
        if (en && zh && JSON.stringify(en) !== JSON.stringify(zh)) bad.push(`${slug}: EN and ZH bullets differ (ZH shows original text)`);
        // Page prompt equals zip prompt.
        const page = detail(base, 'en', slug).match(/<pre id="prompt-en"[^>]*>([\s\S]*?)<\/pre>/);
        if (!page || decode(page[1]) !== zipText(base, slug, 'PROMPT.md')) bad.push(`${slug}: page prompt differs from zip`);
      }
      expect(bad).toEqual([]);
    });
  }

  test('upstream prompts: bullets are exactly the preview card "Signature move" lines (count and leading text), EN and ZH', () => {
    const bad = [];
    for (const slug of UP_SLUGS) {
      const card = fs.readFileSync(path.join(UPSTREAM_SKILL, 'bold-template-pack', 'templates', slug, 'preview.md'), 'utf8');
      const want = [...card.matchAll(/^\s*-\s*Signature move[^:]*:\s*(.+)$/gim)].map((m) => m[1].trim());
      for (const [name, lang] of [['PROMPT.md', 'en'], ['PROMPT.zh.md', 'zh']]) {
        const got = movesOf(zipText(SITE, slug, name), lang) ?? [];
        if (got.length !== want.length) { bad.push(`${slug} ${lang}: ${got.length} bullets, card has ${want.length}`); continue; }
        got.forEach((g, i) => {
          const head = want[i].split(/\{/)[0].slice(0, 30);
          if (!g.startsWith(head)) bad.push(`${slug} ${lang} #${i}: "${g.slice(0, 40)}" does not start like "${head}"`);
        });
      }
    }
    expect(bad).toEqual([]);
  });

  test('upstream prompts do not differ between local and URL mode except the download text (EN: no signature change)', () => {
    const bad = [];
    for (const slug of UP_SLUGS.slice(0, 6)) {
      const a = movesOf(zipText(SITE, slug, 'PROMPT.md'), 'en'), b = movesOf(zipText(urlOut, slug, 'PROMPT.md'), 'en');
      if (JSON.stringify(a) !== JSON.stringify(b)) bad.push(slug);
    }
    expect(bad).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
test.describe('4. ZH prompt quotes the ZH download button label', () => {
  test('quoted label equals the zh page button text exactly; no English label in ZH prompts', () => {
    const bad = [];
    for (const root of [SITE, urlOut]) for (const slug of ALL_SLUGS) {
      const btn = buttons(detail(root, 'zh', slug)).list.find((b) => b.kind === 'download').text;
      const zh = zipText(root, slug, 'PROMPT.zh.md');
      if (btn !== '下载素材包（.zip）') bad.push(`${slug}: zh button text is "${btn}"`);
      const quotes = [...zh.matchAll(/点击 "([^"]+)"/g)].map((m) => m[1]);
      if (!quotes.length) bad.push(`${slug}: ZH prompt quotes no button`);
      for (const q of quotes) if (q !== btn) bad.push(`${slug}: quotes "${q}" but button is "${btn}"`);
      if (/Download assets/.test(zh)) bad.push(`${slug}: ZH prompt still names the English button`);
      // EN prompt still quotes the EN button.
      const en = zipText(root, slug, 'PROMPT.md');
      const enBtn = buttons(detail(root, 'en', slug)).list.find((b) => b.kind === 'download').text;
      if (!en.includes(`"${enBtn}"`)) bad.push(`${slug}: EN prompt does not quote "${enBtn}"`);
    }
    expect(bad).toEqual([]);
  });
});
