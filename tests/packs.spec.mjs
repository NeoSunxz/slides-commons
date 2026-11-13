// Zips, prompts and static scans for all templates, derived from the upstream files.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from './font-cache.mjs';
import {
  SITE, ALL_SLUGS, DECK_STAGE_SLUGS, CDN_SLUGS, NO_WEBFONT_SLUGS, EXTERNAL_WHITELIST,
  UPSTREAM_TEMPLATES, UPSTREAM_SKILL, upstreamDir, skillDesign, readZip, readSiteZip, hostOf,
} from './helpers.mjs';

const sameBytes = (a, b) => Buffer.compare(a, b) === 0;
const zipFile = (entries, slug, name) => entries.find((e) => e.name === `${slug}/${name}`)?.data;
const section = (md, n) => {
  const m = md.match(new RegExp(`^## ${n}\\.[^\\n]*\\n([\\s\\S]*?)(?=^## \\d+\\.|(?![\\s\\S]))`, 'm'));
  return m ? m[1] : '';
};

// ---------------------------------------------------------------------------
// 4. Zips
// ---------------------------------------------------------------------------
for (const slug of ALL_SLUGS) {
  test(`zip ${slug}: file list, integrity and byte-identical upstream files`, async () => {
    const { entries, problems } = readSiteZip(SITE, slug);
    expect(problems, 'zip integrity').toEqual([]);

    const srcDir = upstreamDir(slug);
    const siblings = fs.readdirSync(srcDir).filter((f) => !['template.json', 'template.html', 'design.md'].includes(f));
    const expected = [
      'template.html', 'design.md', 'viewport-base.css', 'LICENSE-templates', 'LICENSE-skill',
      'PROMPT.md', 'PROMPT.zh.md', 'README.md', ...siblings,
    ].map((f) => `${slug}/${f}`).sort();
    expect(entries.filter((e) => !e.isDirectory && !e.isDir).map((e) => e.name).sort()).toEqual(expected);
    // deck-stage.js ships exactly for the deck-stage templates (and nothing else is a sibling).
    expect(siblings.filter((f) => f !== 'deck-stage.js'), 'unexpected sibling assets').toEqual([]);
    expect(siblings.includes('deck-stage.js')).toBe(DECK_STAGE_SLUGS.includes(slug));

    expect(sameBytes(zipFile(entries, slug, 'template.html'), fs.readFileSync(path.join(srcDir, 'template.html'))), 'template.html differs from upstream').toBe(true);
    if (siblings.includes('deck-stage.js')) {
      expect(sameBytes(zipFile(entries, slug, 'deck-stage.js'), fs.readFileSync(path.join(srcDir, 'deck-stage.js'))), 'deck-stage.js differs from upstream').toBe(true);
    }
    expect(sameBytes(zipFile(entries, slug, 'design.md'), fs.readFileSync(skillDesign(slug))), 'design.md is not the skill edition').toBe(true);
    expect(sameBytes(zipFile(entries, slug, 'viewport-base.css'), fs.readFileSync(path.join(UPSTREAM_SKILL, 'viewport-base.css')))).toBe(true);
    expect(sameBytes(zipFile(entries, slug, 'LICENSE-templates'), fs.readFileSync(path.join(UPSTREAM_TEMPLATES, 'LICENSE')))).toBe(true);
    expect(sameBytes(zipFile(entries, slug, 'LICENSE-skill'), fs.readFileSync(path.join(UPSTREAM_SKILL, 'LICENSE')))).toBe(true);
    for (const l of ['LICENSE-templates', 'LICENSE-skill']) {
      const t = zipFile(entries, slug, l).toString();
      expect(t).toContain('MIT License');
      expect(t).toContain('Zara Zhang');
    }
  });
}

// ---------------------------------------------------------------------------
// 5. Prompt exceptions
// ---------------------------------------------------------------------------
test('prompts: file table mentions deck-stage.js exactly for the deck-stage templates', async () => {
  expect(DECK_STAGE_SLUGS.length).toBeGreaterThan(0);
  expect(DECK_STAGE_SLUGS.length).toBeLessThan(ALL_SLUGS.length);
  const wrong = [];
  for (const slug of ALL_SLUGS) {
    const { entries } = readSiteZip(SITE, slug);
    for (const f of ['PROMPT.md', 'PROMPT.zh.md']) {
      const table = section(zipFile(entries, slug, f).toString(), 1);
      expect(table, `${slug} ${f} has a section 1`).not.toBe('');
      const mentions = /deck-stage\.js/.test(table);
      if (mentions !== DECK_STAGE_SLUGS.includes(slug)) wrong.push(`${slug} ${f}: file table ${mentions ? 'mentions' : 'omits'} deck-stage.js`);
    }
  }
  expect(wrong).toEqual([]);
});

test('prompts: CDN templates carry the Charts bullet, the others do not', async () => {
  expect(CDN_SLUGS.length).toBeGreaterThan(0);
  const wrong = [];
  for (const slug of ALL_SLUGS) {
    const { entries } = readSiteZip(SITE, slug);
    const en = zipFile(entries, slug, 'PROMPT.md').toString();
    const zh = zipFile(entries, slug, 'PROMPT.zh.md').toString();
    const isCdn = CDN_SLUGS.includes(slug);
    const enBullet = en.split('\n').find((l) => /^- \*\*Charts:\*\*/.test(l)) ?? '';
    const zhBullet = zh.split('\n').find((l) => /^- \*\*图表\*\*/.test(l)) ?? '';
    if (isCdn) {
      if (!/cdn\.jsdelivr\.net/.test(enBullet) || !/\b(not|don't|do not)\b/i.test(enBullet)) wrong.push(`${slug} en: Charts bullet missing or does not forbid the CDN`);
      if (!/cdn\.jsdelivr\.net/.test(zhBullet) || !/不要/.test(zhBullet)) wrong.push(`${slug} zh: 图表 bullet missing or does not forbid the CDN`);
      expect(en, `${slug} still forbids other CDNs`).toMatch(/No other network requests/);
    } else if (enBullet || zhBullet) {
      wrong.push(`${slug}: has a Charts bullet but no CDN in the original`);
    }
  }
  expect(wrong).toEqual([]);
});

test('prompts: templates without web fonts say system fonts are the design, no font link required', async () => {
  expect(NO_WEBFONT_SLUGS.length).toBeGreaterThan(0);
  for (const slug of NO_WEBFONT_SLUGS) {
    const { entries } = readSiteZip(SITE, slug);
    const en = zipFile(entries, slug, 'PROMPT.md').toString();
    const zh = zipFile(entries, slug, 'PROMPT.zh.md').toString();
    expect.soft(en, `${slug} en`).toMatch(/system fonts are the design/i);
    expect.soft(en, `${slug} en: rule "Google Fonts or Fontshare" must be marked as not applying`).toMatch(/does not apply to this template/);
    expect.soft(zh, `${slug} zh`).toMatch(/系统字体就是设计本身/);
    for (const [lang, md] of [['en', en], ['zh', zh]]) {
      const links = md.match(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/g) ?? [];
      expect.soft(links, `${slug} ${lang}: prompt asks for a Google Fonts <link>`).toEqual([]);
    }
  }
  // And the converse: every template that has web fonts shows its font link.
  for (const slug of ALL_SLUGS.filter((s) => !NO_WEBFONT_SLUGS.includes(s))) {
    const en = zipFile(readSiteZip(SITE, slug).entries, slug, 'PROMPT.md').toString();
    expect.soft(en, `${slug}: font link in the prompt`).toMatch(/<link[^>]+(fonts\.googleapis\.com|api\.fontshare\.com)/);
  }
});

// ---------------------------------------------------------------------------
// 6. Detail-page prompt text == zip prompt, EN and ZH, all templates
// ---------------------------------------------------------------------------
test('detail pages: prompt <pre> text equals the zip PROMPT files byte for byte (68 pages)', async ({ page }) => {
  await page.goto('about:blank');
  const jobs = [];
  for (const slug of ALL_SLUGS) {
    const { entries } = readSiteZip(SITE, slug);
    for (const [lang, rel, id, zipName] of [
      ['en', ['t', slug, 'index.html'], 'prompt-en', 'PROMPT.md'],
      ['zh', ['zh', 't', slug, 'index.html'], 'prompt-zh', 'PROMPT.zh.md'],
    ]) {
      jobs.push({ slug, lang, id, html: fs.readFileSync(path.join(SITE, ...rel), 'utf8'), expected: zipFile(entries, slug, zipName).toString('utf8') });
    }
  }
  // DOMParser gives the same textContent the Copy button reads, without loading 68 pages.
  const results = await page.evaluate((list) => list.map((j) => {
    const doc = new DOMParser().parseFromString(j.html, 'text/html');
    const pres = doc.querySelectorAll(`pre#${j.id}`);
    const copy = doc.querySelectorAll('[data-copy]');
    return { slug: j.slug, lang: j.lang, pres: pres.length, copy: copy.length, copyId: copy[0]?.getAttribute('data-copy'), text: pres[0]?.textContent ?? null, expected: j.expected };
  }), jobs);
  const bad = [];
  for (const r of results) {
    if (r.pres !== 1 || r.copy !== 1 || r.copyId !== `prompt-${r.lang}`) bad.push(`${r.lang} ${r.slug}: ${r.pres} pre, ${r.copy} copy button(s)`);
    else if (r.text !== r.expected) bad.push(`${r.lang} ${r.slug}: prompt text differs (page ${r.text.length} chars, zip ${r.expected.length})`);
  }
  expect(results).toHaveLength(ALL_SLUGS.length * 2);
  expect(bad).toEqual([]);
});

// ---------------------------------------------------------------------------
// 8. Static scan of the built previews
// ---------------------------------------------------------------------------
function scanHosts(text) {
  const html = text.replace(/<!--[\s\S]*?-->/g, '');
  const urls = [];
  for (const tag of html.matchAll(/<(script|img|iframe|source|video|audio|embed|object|image|use|link|input)\b[^>]*>/gi)) {
    for (const a of tag[0].matchAll(/\b(src|srcset|poster|data|xlink:href|href)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      const n = a[1].toLowerCase();
      if (n === 'href' && !/^(link|image|use)$/i.test(tag[1])) continue;
      const v = a[2] ?? a[3];
      urls.push(...(n === 'srcset' ? v.split(',').map((x) => x.trim().split(/\s+/)[0]) : [v]));
    }
  }
  const css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).concat([...html.matchAll(/\bstyle\s*=\s*"([^"]*)"/gi)].map((m) => m[1])).join('\n');
  for (const m of css.matchAll(/@import\s+(?:url\(\s*)?["']?([^"')\s;]+)/gi)) urls.push(m[1]);
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)/gi)) urls.push(m[1]);
  // Requests made from script text.
  for (const m of html.matchAll(/\b(?:fetch|import|XMLHttpRequest[^;]*?open|EventSource|WebSocket|sendBeacon)\s*\(\s*(?:["'`](?:GET|POST)["'`]\s*,\s*)?["'`]([^"'`]+)/g)) urls.push(m[1]);
  return [...new Set(urls.filter((u) => /^(?:https?:|wss?:)?\/\//i.test(u.trim())).map((u) => hostOf(u.trim().startsWith('//') ? `https:${u.trim()}` : u.trim().replace(/^wss?:/, 'https:'))))];
}

test('static scan: built preview HTML/CSS loads nothing from non-whitelisted hosts', async () => {
  const bad = [];
  for (const slug of ALL_SLUGS) {
    const dir = path.join(SITE, 'preview', slug);
    for (const f of fs.readdirSync(dir)) {
      if (!/\.(html|css)$/i.test(f)) continue;
      const hosts = scanHosts(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const h of hosts) if (!EXTERNAL_WHITELIST.includes(h)) bad.push(`${slug}/${f}: ${h}`);
      if (hosts.includes('cdn.jsdelivr.net') && !CDN_SLUGS.includes(slug)) bad.push(`${slug}/${f}: cdn.jsdelivr.net but upstream has none`);
    }
  }
  expect(bad).toEqual([]);
});

test('static scan: preview copies have no local script/stylesheet references left', async () => {
  const bad = [];
  for (const slug of ALL_SLUGS) {
    // Look at tags only: inlined script bodies may mention <script src=...> in comments.
    const html = fs.readFileSync(path.join(SITE, 'preview', slug, 'template.html'), 'utf8')
      .replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, '$1</script>')
      .replace(/(<style\b[^>]*>)[\s\S]*?<\/style\s*>/gi, '$1</style>');
    for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']?([^"'\s>]+)/gi)) if (!/^(https?:)?\/\//i.test(m[1])) bad.push(`${slug}: <script src="${m[1]}">`);
    for (const m of html.matchAll(/<link\b[^>]*rel=["']?stylesheet[^>]*>/gi)) if (!/href=["']?(https?:)?\/\//i.test(m[0])) bad.push(`${slug}: ${m[0].slice(0, 80)}`);
  }
  expect(bad).toEqual([]);
});
