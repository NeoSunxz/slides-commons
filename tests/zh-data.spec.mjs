// Chinese translations of upstream data (src/i18n/zh.json): structure, pages, gallery, prompts.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { test, expect } from './font-cache.mjs';
import {
  ROOT, SITE, ALL_SLUGS, ZH_JSON, ZH_SOURCES, upstreamMeta, readSiteZip, zhNameTokens, zhEnglishRuns,
} from './helpers.mjs';

test.describe.configure({ mode: 'parallel' });

const CJK = /[　-〿㐀-鿿豈-﫿＀-￯]/;
const TERMS = ZH_JSON.terms;
const termLower = new Map(Object.keys(TERMS).map((k) => [k.toLowerCase(), k]));
const term = (tag) => TERMS[termLower.get(String(tag).toLowerCase())];
const norm = (s) => String(s).replace(/`/g, '').replace(/\s+/g, '').replace(/[。.]+$/, '');
const hash12 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 12);
const tr = (slug) => ZH_JSON.templates[slug];
const zipFile = (slug, name) => readSiteZip(SITE, slug).entries.find((e) => e.name === `${slug}/${name}`).data.toString('utf8');

// ---------------------------------------------------------------------------
// 6. Structure of zh.json / zh.sources.json
// ---------------------------------------------------------------------------
test.describe('zh.json structure', () => {
  test('covers exactly the 34 upstream templates', () => {
    expect(Object.keys(ZH_JSON.templates).sort()).toEqual([...ALL_SLUGS]);
    expect(ALL_SLUGS).toHaveLength(34);
  });

  test('every mood and tone tag in use has a non-empty terms entry', () => {
    const missing = [];
    for (const slug of ALL_SLUGS) {
      const m = upstreamMeta(slug);
      for (const tag of [...m.mood, ...m.tone]) if (!term(tag)) missing.push(`${slug}: ${tag}`);
    }
    expect(missing).toEqual([]);
    expect(Object.entries(TERMS).filter(([, v]) => typeof v !== 'string' || !v.trim())).toEqual([]);
    // Unused terms are allowed but should not be stale typos: each key is used by some template.
    const used = new Set(ALL_SLUGS.flatMap((s) => [...upstreamMeta(s).mood, ...upstreamMeta(s).tone].map((t) => t.toLowerCase())));
    expect(Object.keys(TERMS).filter((k) => !used.has(k.toLowerCase())), 'terms nobody uses').toEqual([]);
  });

  test('no empty values; occasion lengths match upstream; fields present for every template', () => {
    const bad = [];
    for (const slug of ALL_SLUGS) {
      const m = upstreamMeta(slug);
      const t = tr(slug);
      for (const f of ['tagline', 'description', 'best_for', 'avoid_for', 'palette_description', 'typography_style']) {
        if (typeof t[f] !== 'string' || !t[f].trim()) bad.push(`${slug}.${f} empty or missing`);
        else if (!CJK.test(t[f])) bad.push(`${slug}.${f} has no Chinese`);
      }
      if (!Array.isArray(t.occasion) || t.occasion.length !== m.occasion.length || t.occasion.some((x) => !String(x).trim())) {
        bad.push(`${slug}.occasion length ${t.occasion?.length} vs upstream ${m.occasion.length}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('zh.sources.json has a hash for every translated field, and the hashes match the current English text', () => {
    const bad = [];
    for (const slug of ALL_SLUGS) {
      const m = upstreamMeta(slug);
      const english = {
        tagline: m.tagline, best_for: m.best_for, avoid_for: m.avoid_for,
        occasion: JSON.stringify(m.occasion), palette_description: m.palette.description, typography_style: m.typography.style,
      };
      for (const f of Object.keys(tr(slug))) {
        const h = ZH_SOURCES[slug]?.[f];
        if (!h) { bad.push(`${slug}.${f}: no hash`); continue; }
        if (f in english && h !== hash12(english[f])) bad.push(`${slug}.${f}: stale (hash differs from the current English text)`);
      }
    }
    expect(bad).toEqual([]);
  });

  test('validate reports no missing, stale or unconfirmed translation (covers description hashes too)', () => {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'validate.mjs')], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '' } });
    const out = `${r.stdout}\n${r.stderr}`;
    expect(r.status, out).toBe(0);
    expect(out.match(/.*(stale|unconfirmed|missing) translation.*/g) ?? []).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 1. Detail pages, all 34, Chinese and English
// ---------------------------------------------------------------------------
test('zh detail pages (all 34): upstream data is the zh.json translation, tags are terms, source note links upstream', async ({ page }) => {
  await page.goto('about:blank');
  const jobs = ALL_SLUGS.map((slug) => ({ slug, html: fs.readFileSync(path.join(SITE, 'zh', 't', slug, 'index.html'), 'utf8') }));
  const parsed = await page.evaluate((list) => list.map(({ slug, html }) => {
    const d = new DOMParser().parseFromString(html, 'text/html');
    const t = (el) => (el ? el.textContent.trim() : null);
    const dd = (label) => { const dt = [...d.querySelectorAll('dl.meta dt')].find((x) => x.textContent.trim() === label); return dt ? dt.nextElementSibling : null; };
    const h3 = (label) => [...d.querySelectorAll('section.about h3')].find((x) => x.textContent.trim() === label);
    const palNote = h3('配色')?.nextElementSibling;
    const typoNote = d.querySelector('ul.typo')?.nextElementSibling;
    return {
      slug,
      lang: d.documentElement.lang,
      tagline: t(d.querySelector('.hero .tagline')),
      taglineLang: d.querySelector('.hero .tagline')?.closest('[lang]')?.getAttribute('lang'),
      description: t(d.querySelector('section.about > p:not(.source-note)')),
      bestFor: t(dd('适用场景')), avoidFor: t(dd('不适用场景')),
      mood: [...(dd('情绪')?.querySelectorAll('.tag') ?? [])].map(t),
      tone: [...(dd('语气')?.querySelectorAll('.tag') ?? [])].map(t),
      palNote: palNote?.classList.contains('muted') ? t(palNote) : null,
      typoNote: typoNote?.classList.contains('muted') ? t(typoNote) : null,
      note: t(d.querySelector('p.source-note')),
      noteLinks: [...d.querySelectorAll('p.source-note a')].map((a) => a.getAttribute('href')),
      enMarked: [...d.querySelectorAll('main [lang="en"]')].map((e) => `${e.tagName.toLowerCase()}:${t(e).slice(0, 30)}`),
      tagLangs: [...d.querySelectorAll('dl.meta .tag')].map((e) => e.closest('[lang]')?.getAttribute('lang')),
    };
  }), jobs);
  expect(parsed).toHaveLength(34);

  const bad = [];
  for (const r of parsed) {
    const z = tr(r.slug);
    const m = upstreamMeta(r.slug);
    if (r.lang !== 'zh-CN') bad.push(`${r.slug}: html lang ${r.lang}`);
    for (const [name, got, want] of [
      ['tagline', r.tagline, z.tagline], ['description', r.description, z.description], ['best_for', r.bestFor, z.best_for],
      ['avoid_for', r.avoidFor, z.avoid_for], ['palette note', r.palNote, z.palette_description], ['typography style', r.typoNote, z.typography_style],
    ]) {
      if (!got || !CJK.test(got)) bad.push(`${r.slug} ${name}: not Chinese (${String(got).slice(0, 30)})`);
      else if (norm(got) !== norm(want)) bad.push(`${r.slug} ${name}: differs from zh.json`);
    }
    if (JSON.stringify(r.mood) !== JSON.stringify(m.mood.map(term))) bad.push(`${r.slug} mood chips ${r.mood} != ${m.mood.map(term)}`);
    if (JSON.stringify(r.tone) !== JSON.stringify(m.tone.map(term))) bad.push(`${r.slug} tone chips ${r.tone} != ${m.tone.map(term)}`);
    if (!r.note || !/以下介绍由本站翻译，以英文原文为准。/.test(r.note)) bad.push(`${r.slug}: source note text "${r.note}"`);
    const dir = `https://github.com/zarazhangrui/beautiful-html-templates/tree/main/templates/${r.slug}`;
    if (!r.noteLinks.includes(dir)) bad.push(`${r.slug}: source note does not link ${dir}`);
    if (r.enMarked.length !== 1 || !r.enMarked[0].startsWith('h1:')) bad.push(`${r.slug}: lang="en" blocks in main: ${r.enMarked.join(', ')}`);
    if (r.tagLangs.some((l) => l && l.startsWith('en'))) bad.push(`${r.slug}: tag chips marked English`);
  }
  expect(bad).toEqual([]);
});

test('zh detail pages (all 34): no run of 3+ English words outside lang="en" / names', async ({ page }) => {
  await page.goto('about:blank');
  const jobs = ALL_SLUGS.map((slug) => ({ slug, html: fs.readFileSync(path.join(SITE, 'zh', 't', slug, 'index.html'), 'utf8') }));
  const texts = await page.evaluate((list) => list.map(({ slug, html }) => {
    const d = new DOMParser().parseFromString(html, 'text/html');
    d.querySelectorAll('script,style,pre,code,[lang="en"],a[hreflang="en"]').forEach((e) => e.remove());
    return { slug, parts: [...d.querySelectorAll('main p, main li, main dd, main dt, main h1, main h2, main h3, main summary, main button, main a, footer p, header a, header span')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean) };
  }), jobs);
  const extra = zhNameTokens();
  const bad = [];
  for (const { slug, parts } of texts) for (const p of parts) {
    const runs = zhEnglishRuns(p, extra);
    if (runs.length) bad.push(`${slug}: "${p.slice(0, 60)}" [${runs.join(' | ').slice(0, 50)}]`);
  }
  expect(bad).toEqual([]);
});

test('en detail pages (all 34): no CJK anywhere except the language switcher', async ({ page }) => {
  await page.goto('about:blank');
  const jobs = ALL_SLUGS.map((slug) => ({ slug, html: fs.readFileSync(path.join(SITE, 't', slug, 'index.html'), 'utf8') }));
  const found = await page.evaluate((list) => list.flatMap(({ slug, html }) => {
    const d = new DOMParser().parseFromString(html, 'text/html');
    d.querySelectorAll('[data-lang-switch]').forEach((e) => e.remove());
    d.querySelectorAll('script,style').forEach((e) => e.remove());
    const hits = [];
    const re = /[　-〿㐀-鿿豈-﫿＀-￯]/;
    const w = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (re.test(n.textContent)) hits.push(`${slug}: ${n.textContent.trim().slice(0, 40)}`);
    for (const el of d.querySelectorAll('*')) for (const a of el.attributes) if (re.test(a.value)) hits.push(`${slug}: ${el.tagName.toLowerCase()}@${a.name}`);
    return hits;
  }), jobs);
  expect(found).toEqual([]);
});

// ---------------------------------------------------------------------------
// 2. Gallery
// ---------------------------------------------------------------------------
const visibleSlugs = (page) => page.evaluate(() => [...document.querySelectorAll('#grid > li')]
  .filter((li) => !li.hidden && getComputedStyle(li).display !== 'none')
  .map((li) => li.querySelector('a.card').getAttribute('href').replace(/^t\/|\/(index\.html)?$/g, '')).sort());
const tagsOf = (slug) => [...upstreamMeta(slug).mood, ...upstreamMeta(slug).tone].map((t) => t.toLowerCase());

test.describe('zh gallery', () => {
  test.beforeEach(async ({ page }) => { await page.goto('zh/index.html'); await expect(page.locator('#filters')).toBeVisible(); });

  test('card taglines are Chinese and equal zh.json; mood chips are Chinese with English data-value', async ({ page }) => {
    const cards = await page.evaluate(() => [...document.querySelectorAll('#grid > li')].map((li) => ({
      slug: li.querySelector('a.card').getAttribute('href').replace(/^t\/|\/(index\.html)?$/g, ''),
      tagline: li.querySelector('.card-body p:not(.by)').textContent.trim(),
    })));
    expect(cards).toHaveLength(34);
    for (const c of cards) expect.soft(norm(c.tagline), `${c.slug} card tagline`).toBe(norm(tr(c.slug).tagline));

    const chips = await page.evaluate(() => [...document.querySelectorAll('button.chip[data-group="mood"]')].map((b) => ({
      value: b.getAttribute('data-value'), label: b.cloneNode(true), text: [...b.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(),
    })).map(({ value, text }) => ({ value, text })));
    expect(chips.length).toBeGreaterThan(5);
    for (const c of chips) {
      expect.soft(c.value, 'data-value stays English').toMatch(/^[a-z0-9-]+$/i);
      expect.soft(c.text, `chip ${c.value} label`).toBe(term(c.value));
      expect.soft(CJK.test(c.text) || /^[A-Za-z0-9-]+$/.test(c.text), `chip ${c.value} label "${c.text}"`).toBe(true);
    }
  });

  test('search 复古 and retro find the retro templates (>= 4)', async ({ page }) => {
    const byZh = ALL_SLUGS.filter((s) => [...upstreamMeta(s).mood, ...upstreamMeta(s).tone].some((t) => term(t).includes('复古')));
    const byEn = ALL_SLUGS.filter((s) => tagsOf(s).some((t) => t.includes('retro')));
    expect(byZh.length, 'templates with a 复古 tag').toBeGreaterThanOrEqual(4);
    expect(byEn.length).toBeGreaterThanOrEqual(4);
    for (const [q, must] of [['复古', byZh], ['retro', byEn]]) {
      await page.locator('#q').fill(q);
      const vis = await visibleSlugs(page);
      expect(vis.length, `"${q}" shows some but not all`).toBeGreaterThanOrEqual(4);
      expect(vis.length).toBeLessThan(34);
      expect(must.filter((s) => !vis.includes(s)), `templates tagged for "${q}" missing from the results`).toEqual([]);
    }
  });

  test('#mood=retro yields the same card set on / and /zh/', async ({ page }) => {
    const expected = ALL_SLUGS.filter((s) => upstreamMeta(s).mood.map((m) => m.toLowerCase()).includes('retro')).sort();
    expect(expected.length).toBeGreaterThan(0);
    await page.goto('zh/index.html#mood=retro');
    const zh = await visibleSlugs(page);
    await page.goto('index.html#mood=retro');
    const en = await visibleSlugs(page);
    expect(zh).toEqual(expected);
    expect(en).toEqual(expected);
  });
});

test('EN gallery: data-search attributes contain no CJK', async () => {
  const html = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');
  const attrs = [...html.matchAll(/data-search="([^"]*)"/g)].map((m) => m[1]);
  expect(attrs).toHaveLength(34);
  expect(attrs.filter((a) => CJK.test(a)).length).toBe(0);
  expect(CJK.test(html.replace(/<a[^>]*data-lang-switch[^>]*>[^<]*<\/a>/g, ''))).toBe(false);
});

// ---------------------------------------------------------------------------
// 5. PROMPT.zh.md uses the translations; PROMPT.md is untouched English
// ---------------------------------------------------------------------------
test('zips (all 34): PROMPT.zh.md carries the zh.json strings (not marked 原文); signature moves stay marked 原文; PROMPT.md has no CJK', async () => {
  const bad = [];
  for (const slug of ALL_SLUGS) {
    const zh = zipFile(slug, 'PROMPT.zh.md');
    const en = zipFile(slug, 'PROMPT.md');
    const z = tr(slug);
    if (CJK.test(en)) bad.push(`${slug}: PROMPT.md contains CJK`);
    const line = (prefix) => zh.split('\n').find((l) => l.startsWith(prefix)) ?? '';
    const character = line('- **风格特征**');
    if (!norm(character).includes(norm(z.description))) bad.push(`${slug}: 风格特征 line lacks the zh.json description`);
    if (/（原文）/.test(character)) bad.push(`${slug}: 风格特征 still marked （原文）`);
    const typo = line('- **字体**：');
    if (!norm(typo).includes(norm(z.typography_style))) bad.push(`${slug}: 字体 line lacks the zh.json typography style`);
    if (/（原文）/.test(typo)) bad.push(`${slug}: 字体 line still marked （原文）`);
    const palette = zh.split('\n').find((l) => /^\s+- 用法：/.test(l)) ?? '';
    if (!norm(palette).includes(norm(z.palette_description))) bad.push(`${slug}: palette 用法 line lacks the zh.json palette note`);
    if (/（原文）/.test(palette)) bad.push(`${slug}: palette line marked （原文）`);
    const moves = zh.split('\n').find((l) => l.startsWith('- **标志性手法**')) ?? '';
    if (!/（原文）/.test(moves)) bad.push(`${slug}: signature moves line is not marked （原文）`);
    const mood = line('- **情绪 / 语气**');
    for (const tag of [...upstreamMeta(slug).mood, ...upstreamMeta(slug).tone]) if (!mood.includes(term(tag))) bad.push(`${slug}: mood line lacks ${term(tag)}`);
  }
  expect(bad).toEqual([]);
});

// ---------------------------------------------------------------------------
// 3 + 4. Fallback / staleness with injected translation files
// ---------------------------------------------------------------------------
test('fixture translation files: no way to inject (scripts/i18n.mjs hard-codes src/i18n/zh*.json)', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'scripts', 'i18n.mjs'), 'utf8');
  const hasHook = /process\.env\.SC_[A-Z_]*(I18N|ZH)|cliOption\(['"](i18n|zh)/i.test(src + fs.readFileSync(path.join(ROOT, 'scripts', 'build.mjs'), 'utf8'));
  test.info().annotations.push({ type: 'finding', description: hasHook ? 'an i18n override exists; wire up fixture tests' : 'no way to inject a fixture translation file: ZH_FILE / ZH_SOURCES_FILE are fixed paths under src/i18n' });
  test.skip(!hasHook, 'no way to inject a fixture translation file (missing-translation fallback, stale-hash warning and structural-error exit codes cannot be tested without editing src/i18n)');
});
