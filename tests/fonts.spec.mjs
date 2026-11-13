// Self-hosted Latin fonts: previews with Google blocked, zip fonts/ folders, prompts, sizes.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test as base, expect } from '@playwright/test';
import { SITE, ALL_SLUGS, NO_WEBFONT_SLUGS, upstreamHtml, readSiteZip, hostOf, EXTERNAL_WHITELIST } from './helpers.mjs';

// NOTE: deliberately the plain Playwright test (no Google font cache): Google must be unreachable.
const test = base;
const GOOGLE = /^https?:\/\/fonts\.(googleapis|gstatic)\.com\//;
const isCjk = (name) => /\b(SC|TC|HK|JP|KR|CJK)\b|ZCOOL|Long Cang|Ma Shan Zheng|Liu Jian Mao Cao|Zhi Mang Xing|Yozai/.test(name);

// Families the upstream template requests from Google Fonts, split Latin / CJK (independent of build code).
function upstreamFamilies(slug) {
  const html = upstreamHtml(slug);
  const names = new Set();
  for (const m of html.matchAll(/https:\/\/fonts\.googleapis\.com\/css2?\?[^"'`\s)<>]+/g)) {
    const u = new URL(m[0].replace(/&amp;/g, '&'));
    for (const f of u.searchParams.getAll('family')) names.add(f.split(':')[0].replace(/\+/g, ' '));
  }
  const all = [...names];
  return { latin: all.filter((n) => !isCjk(n)), cjk: all.filter(isCjk) };
}

const WEBFONT_SLUGS = ALL_SLUGS.filter((s) => !NO_WEBFONT_SLUGS.includes(s));
const fileUrl = (...p) => pathToFileURL(path.join(SITE, ...p)).href;

async function checkPreview(page, url, slug, { fileMode }) {
  const requests = [];
  const failed = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.route(GOOGLE, (route) => route.abort('connectionrefused'));
  await page.goto(url);
  const handle = await page.locator('iframe#preview').elementHandle();
  const frame = await handle.contentFrame();
  await frame.waitForLoadState('load');
  const { latin, cjk } = upstreamFamilies(slug);

  // Load every declared face explicitly (unicode-range faces are lazy), then read statuses.
  const faces = await frame.evaluate(async () => {
    const own = [...document.fonts];
    await Promise.all(own.map((f) => f.load().catch(() => null)));
    await document.fonts.ready;
    return [...document.fonts].map((f) => ({ family: f.family.replace(/["']/g, ''), status: f.status, weight: f.weight, style: f.style }));
  });
  const byFamily = new Map();
  for (const f of faces) (byFamily.get(f.family) ?? byFamily.set(f.family, []).get(f.family)).push(f);
  for (const fam of latin) {
    const fs_ = byFamily.get(fam) ?? [];
    expect(fs_.length, `${slug}: no @font-face for Latin family "${fam}" in the preview`).toBeGreaterThan(0);
    expect(fs_.filter((f) => f.status !== 'loaded'), `${slug}: ${fam} faces not loaded`).toEqual([]);
  }
  // Rendering check: text in the first Latin family must differ in width from a fallback only if it loaded.
  // (Covered by FontFace status above; additionally assert nothing errored anywhere.)
  expect(faces.filter((f) => f.status === 'error'), `${slug}: errored faces`).toEqual([]);

  const google = requests.filter((u) => GOOGLE.test(u));
  const css = google.filter((u) => /fonts\.googleapis\.com/.test(u));
  const gstatic = google.filter((u) => /fonts\.gstatic\.com/.test(u));
  expect(gstatic, `${slug}: gstatic requested`).toEqual([]);
  if (cjk.length) {
    expect(css.length, `${slug}: expected the CJK css request`).toBeGreaterThan(0);
    for (const u of css) {
      const fams = new URL(u.replace(/&amp;/g, '&')).searchParams.getAll('family').map((f) => f.split(':')[0].replace(/\+/g, ' '));
      expect(fams.filter((n) => !isCjk(n)), `${slug}: Google css still requests Latin families: ${u}`).toEqual([]);
    }
  } else {
    expect(css, `${slug}: no Google request expected`).toEqual([]);
  }
  // Nothing else leaves the site except the whitelist (jsdelivr charts).
  const other = requests.filter((u) => /^https?:/.test(u) && !GOOGLE.test(u)).map(hostOf).filter((h) => h && !EXTERNAL_WHITELIST.includes(h) && !/^(127\.0\.0\.1|localhost)(:|$)/.test(h));
  expect(other, `${slug}: non-whitelisted hosts`).toEqual([]);
  void failed; void fileMode;
}

for (const slug of WEBFONT_SLUGS) {
  test(`[fonts http] ${slug}: Latin faces load with Google blocked`, async ({ page }) => {
    await checkPreview(page, `t/${slug}/`, slug, { fileMode: false });
  });
}
for (const slug of ['neo-grid-bold', 'coral', ...WEBFONT_SLUGS.filter((s) => upstreamFamilies(s).cjk.length).slice(0, 2)]) {
  test(`[fonts file://] ${slug}: Latin faces load with Google blocked`, async ({ page }) => {
    await checkPreview(page, fileUrl('t', slug, 'index.html'), slug, { fileMode: true });
  });
}

test('[fonts] CJK templates exist and keep a CJK-only Google link in the preview', async () => {
  const cjkSlugs = WEBFONT_SLUGS.filter((s) => upstreamFamilies(s).cjk.length);
  test.info().annotations.push({ type: 'cjk', description: cjkSlugs.join(', ') });
  for (const s of cjkSlugs) {
    const html = fs.readFileSync(path.join(SITE, 'preview', s, 'template.html'), 'utf8');
    for (const m of html.matchAll(/https:\/\/fonts\.googleapis\.com\/css2?\?[^"'`\s)<>]+/g)) {
      const fams = new URL(m[0].replace(/&amp;/g, '&')).searchParams.getAll('family').map((f) => f.split(':')[0].replace(/\+/g, ' '));
      expect(fams.filter((n) => !isCjk(n)), `${s}: Latin family left in Google link`).toEqual([]);
    }
  }
  for (const s of WEBFONT_SLUGS.filter((x) => !cjkSlugs.includes(x))) {
    const html = fs.readFileSync(path.join(SITE, 'preview', s, 'template.html'), 'utf8');
    expect(html, `${s}: no Google reference should remain`).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
  }
});

// ---------------------------------------------------------------------------
// Zip fonts/
// ---------------------------------------------------------------------------
for (const slug of ALL_SLUGS) {
  test(`[fonts zip] ${slug}: fonts.css urls resolve, OFL per family, no unused woff2`, async () => {
    const { entries } = readSiteZip(SITE, slug);
    const names = entries.filter((e) => !e.isDir && !e.isDirectory).map((e) => e.name);
    const fontFiles = names.filter((n) => n.startsWith(`${slug}/fonts/`));
    if (NO_WEBFONT_SLUGS.includes(slug)) {
      expect(fontFiles, `${slug} must have no fonts/`).toEqual([]);
      return;
    }
    const cssEntry = entries.find((e) => e.name === `${slug}/fonts/fonts.css`);
    expect(cssEntry, 'fonts/fonts.css').toBeTruthy();
    const css = cssEntry.data.toString('utf8');
    const urls = [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(0);
    const set = new Set(names);
    for (const u of urls) {
      expect(u, 'no absolute/remote url').not.toMatch(/^[a-z]+:|^\//i);
      expect(set.has(`${slug}/fonts/${u}`), `${slug}: fonts.css references ${u} missing from zip`).toBe(true);
    }
    const woff = fontFiles.filter((n) => n.endsWith('.woff2')).map((n) => n.slice(`${slug}/fonts/`.length));
    expect(woff.filter((w) => !urls.includes(w)), 'unused woff2').toEqual([]);
    for (const w of woff) {
      const e = entries.find((x) => x.name === `${slug}/fonts/${w}`);
      expect(e.data.subarray(0, 4).toString('latin1'), `${w} magic`).toBe('wOF2');
    }
    const dirs = new Set(woff.map((w) => w.split('/')[0]));
    for (const d of dirs) expect(set.has(`${slug}/fonts/${d}/OFL.txt`), `${slug}: ${d}/OFL.txt`).toBe(true);
    for (const n of fontFiles.filter((x) => x.endsWith('OFL.txt'))) {
      expect(dirs.has(n.split('/')[2]), `${n}: license for a family with no files`).toBe(true);
      expect(entries.find((e) => e.name === n).data.toString()).toMatch(/SIL OPEN FONT LICENSE/i);
    }
    // every Latin family the template requests is covered
    for (const fam of upstreamFamilies(slug).latin) {
      expect(css, `${slug}: fonts.css lacks '${fam}'`).toContain(`font-family: '${fam}'`);
    }
  });
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
test('[fonts prompt] Latin-font templates mention fonts/ and base64 (EN+ZH); raw-grid does not', async () => {
  const bad = [];
  for (const slug of ALL_SLUGS) {
    const { entries } = readSiteZip(SITE, slug);
    const en = entries.find((e) => e.name === `${slug}/PROMPT.md`).data.toString();
    const zh = entries.find((e) => e.name === `${slug}/PROMPT.zh.md`).data.toString();
    if (NO_WEBFONT_SLUGS.includes(slug)) {
      if (/fonts\/|base64/.test(en)) bad.push(`${slug} en mentions fonts/ or base64`);
      if (/fonts\/|base64/.test(zh)) bad.push(`${slug} zh mentions fonts/ or base64`);
      continue;
    }
    if (!/`fonts\/`/.test(en) || !/fonts\/fonts\.css/.test(en) || !/base64/.test(en)) bad.push(`${slug} en lacks fonts/ or base64`);
    if (!/`fonts\/`/.test(zh) || !/fonts\/fonts\.css/.test(zh) || !/base64/.test(zh)) bad.push(`${slug} zh lacks fonts/ or base64`);
    const hasCjk = upstreamFamilies(slug).cjk.length > 0;
    // The Latin families must not be offered as a Google link in the prompt.
    for (const [lang, md] of [['en', en], ['zh', zh]]) {
      for (const m of md.matchAll(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/g)) {
        const fams = new URL(m[1].replace(/&amp;/g, '&')).searchParams.getAll('family').map((f) => f.split(':')[0].replace(/\+/g, ' '));
        const latin = fams.filter((n) => !isCjk(n));
        if (latin.length) bad.push(`${slug} ${lang}: prompt links Google for Latin: ${latin}`);
      }
    }
  }
  expect(bad).toEqual([]);
});

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------
test('[fonts size] preview HTML and site/ sizes (flag > 5 MB per file)', async () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const files = walk(SITE).map((f) => ({ f, size: fs.statSync(f).size }));
  const total = files.reduce((a, x) => a + x.size, 0);
  const previews = files.filter((x) => /[\\/]preview[\\/].*\.html$/.test(x.f)).sort((a, b) => b.size - a.size);
  const biggest = [...files].sort((a, b) => b.size - a.size)[0];
  const mb = (n) => (n / 1048576).toFixed(2);
  const msg = `max preview html ${mb(previews[0].size)} MB (${path.relative(SITE, previews[0].f)}); biggest file ${mb(biggest.size)} MB (${path.relative(SITE, biggest.f)}); site/ total ${mb(total)} MB`;
  console.log(msg);
  test.info().annotations.push({ type: 'size', description: msg });
  expect(files.filter((x) => x.size > 5 * 1048576).map((x) => `${path.relative(SITE, x.f)} ${mb(x.size)} MB`), 'files over 5 MB').toEqual([]);
});
