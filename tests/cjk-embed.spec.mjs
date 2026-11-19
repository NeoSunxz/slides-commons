// CJK font embedding: the packs' fonts/embed-cjk.mjs (+ cjk-ranges.json + cjk-licenses/) and the prompts that mention it.
// Network-free: the script's shard sources are pointed at a local http server that serves the woff2 files from
// node_modules/@fontsource/*, by writing a temp copy of the pack's cjk-ranges.json (siteBase / cdn rewritten).
// Playwright blocks every http(s) request while rendering, so a CJK glyph can only come from the embedded font.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { test, expect, chromium } from '@playwright/test';
import {
  ROOT, SITE, ALL_SLUGS, makeTempDir, readSiteZip, extractZip, cjkFamiliesRequested, isCjkPackFile,
} from './helpers.mjs';

test.describe.configure({ mode: 'serial' });
test.setTimeout(180_000);

const FONTSOURCE = path.join(ROOT, 'node_modules', '@fontsource');
const URL_BASE = 'https://neosunxz.github.io/slides-commons/';
const NO_CJK_SLUGS = ['scatterbrain']; // the one template with no CJK family

const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); return d; };
test.afterAll(() => { for (const d of tmps) fs.rmSync(d, { recursive: true, force: true }); });

const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const pagePrompt = (rel, id) => {
  const html = fs.readFileSync(path.join(SITE, ...rel), 'utf8');
  const m = html.match(new RegExp(`<pre id="${id}"[^>]*>([\\s\\S]*?)</pre>`));
  return m ? unescapeHtml(m[1]) : null;
};
const zget = (entries, slug, name) => entries.find((e) => e.name === `${slug}/${name}`)?.data;

// ---------------------------------------------------------------------------
// 1. Packs and prompts (default build in site/)
// ---------------------------------------------------------------------------
test('packs: CJK tooling present exactly where the template asks for a CJK family; prompts agree; PROMPT.md == page', () => {
  const bad = [];
  const withCjk = [];
  for (const slug of ALL_SLUGS) {
    const { entries } = readSiteZip(SITE, slug);
    const names = entries.filter((e) => !e.isDir && !e.isDirectory).map((e) => e.name);
    const fams = cjkFamiliesRequested(entries, slug);
    const has = names.filter((n) => isCjkPackFile(n));
    const script = names.includes(`${slug}/fonts/embed-cjk.mjs`);
    const table = names.includes(`${slug}/fonts/cjk-ranges.json`);
    const lic = names.filter((n) => n.startsWith(`${slug}/fonts/cjk-licenses/`));
    if (fams.length) {
      withCjk.push(slug);
      if (!script) bad.push(`${slug}: requests ${fams} but has no fonts/embed-cjk.mjs`);
      if (!table) bad.push(`${slug}: no fonts/cjk-ranges.json`);
      if (!lic.length) bad.push(`${slug}: no fonts/cjk-licenses/*`);
      if (table) {
        const j = JSON.parse(zget(entries, slug, 'fonts/cjk-ranges.json').toString('utf8'));
        if (j.schema !== 1) bad.push(`${slug}: cjk-ranges.json schema ${j.schema}`);
        if (j.siteBase !== null) bad.push(`${slug}: default build has siteBase ${j.siteBase}`);
        if (!/^https:\/\/cdn\.jsdelivr\.net\//.test(j.cdn)) bad.push(`${slug}: cdn ${j.cdn}`);
        for (const f of fams) {
          const e = j.families[f];
          if (!e) { bad.push(`${slug}: table lacks ${f}`); continue; }
          if (!/^\d+\.\d+\.\d+$|^v?\d+/.test(String(e.version))) bad.push(`${slug}: ${f} version ${e.version}`);
          if (!lic.some((n) => n.includes(`/${e.id}-`))) bad.push(`${slug}: no license file for ${e.id}`);
          if (!Object.keys(e.shardsByWeight).length) bad.push(`${slug}: ${f} no shards`);
        }
      }
      // the script is the repo's src/embed-cjk.mjs, byte for byte
      if (script && Buffer.compare(zget(entries, slug, 'fonts/embed-cjk.mjs'), fs.readFileSync(path.join(ROOT, 'src', 'embed-cjk.mjs'))) !== 0) bad.push(`${slug}: embed-cjk.mjs differs from src/embed-cjk.mjs`);
      // no CJK font files in the pack: shards are downloaded on demand
      if (names.some((n) => /\/fonts\/.*(noto-(sans|serif)-[a-z]+|zcool|lxgw|long-cang|ma-shan-zheng)[^/]*\.woff2$/i.test(n) && /cjk/i.test(n))) bad.push(`${slug}: CJK woff2 shipped`);
    } else if (has.length) bad.push(`${slug}: no CJK family requested but has ${has.join(', ')}`);

    for (const [lang, name, rel, id] of [['en', 'PROMPT.md', ['t', slug, 'index.html'], 'prompt-en'], ['zh', 'PROMPT.zh.md', ['zh', 't', slug, 'index.html'], 'prompt-zh']]) {
      const text = zget(entries, slug, name).toString('utf8');
      const mentions = text.includes('fonts/embed-cjk.mjs');
      if (mentions !== (script && fams.length > 0)) bad.push(`${slug} ${lang}: prompt ${mentions ? 'mentions' : 'omits'} fonts/embed-cjk.mjs but pack ${script ? 'has' : 'lacks'} it`);
      if (script && !/embed-cjk\.mjs <[^>]+>/.test(text)) bad.push(`${slug} ${lang}: no usage line`);
      if (pagePrompt(rel, id) !== text) bad.push(`${slug} ${lang}: page prompt differs from zip ${name}`);
    }
  }
  test.info().annotations.push({ type: 'packs-with-cjk', description: `${withCjk.length}/${ALL_SLUGS.length}` });
  expect(ALL_SLUGS.filter((s) => !withCjk.includes(s)), 'templates without CJK tooling').toEqual(NO_CJK_SLUGS.filter((s) => ALL_SLUGS.includes(s)));
  expect(bad).toEqual([]);
});

// ---------------------------------------------------------------------------
// 2. The script, against a local shard server
// ---------------------------------------------------------------------------
let pack;        // extracted pack dir
let server, base; // local shard server
const hits = [];
let siteShards = true; // false: the site path answers 404 (forces the CDN path)

test.beforeAll(async () => {
  const slug = ALL_SLUGS.find((s) => cjkFamiliesRequested(readSiteZip(SITE, s).entries, s).includes('Noto Serif SC'));
  expect(slug, 'a template requesting Noto Serif SC').toBeTruthy();
  const { entries } = readSiteZip(SITE, slug);
  const root = tmp('sc-cjk-pack-');
  extractZip(entries, root);
  pack = path.join(root, slug);
  server = http.createServer((req, res) => {
    hits.push(req.url);
    const m = req.url.match(/^\/(?:fonts\/cjk\/([^/]+)|cdn\/@fontsource\/([^/@]+)@[^/]+\/files)\/([^/]+\.woff2)$/);
    const isSite = req.url.startsWith('/fonts/cjk/');
    if (!m || (isSite && !siteShards)) { res.writeHead(404).end('no'); return; }
    const f = path.join(FONTSOURCE, m[1] ?? m[2], 'files', m[3]);
    if (!f.startsWith(FONTSOURCE) || !fs.existsSync(f)) { res.writeHead(404).end('no'); return; }
    res.writeHead(200, { 'content-type': 'font/woff2' }).end(fs.readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { await new Promise((r) => (server ? server.close(r) : r())); });

/** Write a cjk-ranges.json whose sources are `siteBase` and `cdn`; returns its path. */
function rangesFile(siteBase, cdn) {
  const j = JSON.parse(fs.readFileSync(path.join(pack, 'fonts', 'cjk-ranges.json'), 'utf8'));
  j.siteBase = siteBase;
  j.cdn = cdn;
  const f = path.join(tmp('sc-cjk-ranges-'), 'ranges.json');
  fs.writeFileSync(f, JSON.stringify(j));
  return f;
}
const goodRanges = () => rangesFile(`${base}/`, `${base}/cdn`);

// Async on purpose: the shard server lives in this process, so a blocking spawnSync would starve it.
function runEmbed(deck, ranges, flags = []) {
  return new Promise((resolve) => {
    const c = spawn(process.execPath, [path.join(pack, 'fonts', 'embed-cjk.mjs'), deck, '--ranges', ranges, ...flags], { cwd: pack });
    let out = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => c.kill(), 150_000);
    c.on('close', (status) => { clearTimeout(timer); resolve({ status, out }); });
  });
}

const LINK = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap">';
const deckHtml = ({ link = LINK, h1 = '幻灯片设计', p = '开放的模板库，欢迎使用。' } = {}) => `<!doctype html>
<html lang="zh"><head><meta charset="utf-8"><title>t</title>
${link}
<style>body{font-family:'Noto Serif SC',serif;font-size:40px} h1{font-weight:700} p{font-weight:400}</style>
</head><body><h1>${h1}</h1><p>${p}</p></body></html>
`;
function writeDeck(opts) {
  const f = path.join(tmp('sc-cjk-deck-'), 'deck.html');
  fs.writeFileSync(f, deckHtml(opts));
  return f;
}

test('script: usage error without a file is exit 1', () => {
  const r = spawnSync(process.execPath, [path.join(pack, 'fonts', 'embed-cjk.mjs')], { cwd: pack, encoding: 'utf8' });
  expect(r.status).toBe(1);
  expect(r.stderr).toMatch(/usage/i);
});

test('script: Chinese deck, exit 0, marker block before </head>, Google link kept, idempotent, --dry-run changes nothing', async () => {
  const ranges = goodRanges();
  const deck = writeDeck();
  const before = fs.readFileSync(deck, 'utf8');

  const dry = await runEmbed(deck, ranges, ['--dry-run']);
  expect(dry.status, dry.out).toBe(0);
  expect(fs.readFileSync(deck, 'utf8'), '--dry-run must not modify the file').toBe(before);
  expect(dry.out).toMatch(/dry run/i);

  hits.length = 0;
  const r = await runEmbed(deck, ranges, ['--no-subset']);
  expect(r.status, r.out).toBe(0);
  expect(r.out).toMatch(/Coverage OK/);
  expect(hits.length, 'shards were fetched from the local server').toBeGreaterThan(0);
  expect(hits.every((u) => u.startsWith('/fonts/cjk/')), `site path first, no CDN needed: ${hits}`).toBe(true);
  const out = fs.readFileSync(deck, 'utf8');
  const b = out.indexOf('<!-- slides-commons:cjk-embed:begin');
  const e = out.indexOf('<!-- slides-commons:cjk-embed:end -->');
  const head = out.search(/<\/head>/i);
  expect(b, 'begin marker').toBeGreaterThan(-1);
  expect(e).toBeGreaterThan(b);
  expect(e, 'block ends before </head>').toBeLessThan(head);
  expect(out.slice(head - 1, head), 'block sits right before </head>').toBe('\n');
  expect(out, 'Google Fonts link kept').toContain(LINK);
  const block = out.slice(b, e);
  expect(block).toMatch(/font-family:'Noto Serif SC'/);
  expect(block).toMatch(/font-weight:400/);
  expect(block).toMatch(/font-weight:700/);
  expect(block).toMatch(/unicode-range:U\+/);
  expect(block).toMatch(/data:font\/woff2;base64,/);
  expect(out.replace(/<!-- slides-commons:cjk-embed:begin[\s\S]*?cjk-embed:end -->\s*/, ''), 'rest of the deck unchanged').toBe(before);

  const again = await runEmbed(deck, ranges, ['--no-subset']);
  expect(again.status, again.out).toBe(0);
  expect(fs.readFileSync(deck, 'utf8'), 'idempotent: re-run yields the same file').toBe(out);
  // dry-run on an embedded deck is also a no-op
  expect((await runEmbed(deck, ranges, ['--dry-run'])).status).toBe(0);
  expect(fs.readFileSync(deck, 'utf8')).toBe(out);

  // after a text edit the block is replaced, not duplicated
  fs.writeFileSync(deck, out.replace('幻灯片设计', '幻灯片模板'));
  expect((await runEmbed(deck, ranges, ['--no-subset'])).status).toBe(0);
  const edited = fs.readFileSync(deck, 'utf8');
  expect(edited.match(/cjk-embed:begin/g).length).toBe(1);
  expect(edited).toContain('幻灯片模板');
});

test('script: falls back to the CDN source when the site does not host the shards', async () => {
  const deck = writeDeck();
  siteShards = false;
  hits.length = 0;
  try {
    const r = await runEmbed(deck, goodRanges(), ['--no-subset']);
    expect(r.status, r.out).toBe(0);
    expect(hits.some((u) => u.startsWith('/fonts/cjk/')), 'site tried first').toBe(true);
    expect(hits.some((u) => u.startsWith('/cdn/@fontsource/noto-serif-sc@')), 'then the CDN').toBe(true);
  } finally { siteShards = true; }
  expect(fs.readFileSync(deck, 'utf8')).toContain('cjk-embed:begin');
});

test('script: exit 4 without a CJK font link (CJK text present)', async () => {
  const deck = writeDeck({ link: '' });
  const before = fs.readFileSync(deck, 'utf8');
  const r = await runEmbed(deck, goodRanges());
  expect(r.status, r.out).toBe(4);
  expect(r.out).toMatch(/Google Fonts <link>/);
  expect(fs.readFileSync(deck, 'utf8'), 'file untouched').toBe(before);
});

test('script: exit 0 and no change for a deck with no CJK text', async () => {
  const deck = writeDeck({ h1: 'Hello', p: 'World' });
  const before = fs.readFileSync(deck, 'utf8');
  const r = await runEmbed(deck, goodRanges());
  expect(r.status, r.out).toBe(0);
  expect(fs.readFileSync(deck, 'utf8')).toBe(before);
});

test('script: exit 2 for a CJK character no embedded font has (Hangul in a Simplified-Chinese-only deck)', async () => {
  const deck = writeDeck({ p: '한국어 와 中文' });
  const r = await runEmbed(deck, goodRanges(), ['--no-subset']);
  expect(r.status, r.out).toBe(2);
  expect(r.out).toMatch(/no embedded font has a glyph/);
  expect(r.out).toContain('한');
  // the covered characters are still embedded
  expect(fs.readFileSync(deck, 'utf8')).toContain('cjk-embed:begin');
});

test('script: exit 3 when the shard sources are unreachable', () => {
  // A port nothing listens on: bind then close.
  const dead = http.createServer();
  return new Promise((resolve, reject) => {
    dead.listen(0, '127.0.0.1', () => {
      const port = dead.address().port;
      dead.close(async () => {
        try {
          const deck = writeDeck({ h1: '设计', p: '' });
          const before = fs.readFileSync(deck, 'utf8');
          const r = await runEmbed(deck, rangesFile(`http://127.0.0.1:${port}/`, `http://127.0.0.1:${port}/cdn`), ['--no-subset']);
          expect(r.status, r.out).toBe(3);
          expect(r.out).toMatch(/could not be downloaded/);
          expect(fs.readFileSync(deck, 'utf8'), 'nothing embedded, nothing broken').toBe(before);
          resolve();
        } catch (e) { reject(e); }
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 3. Rendering with every http(s) request blocked
// ---------------------------------------------------------------------------
async function renderFacts(deck) {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const attempted = [];
    await context.route(/^https?:/, (route) => { attempted.push(route.request().url()); return route.abort(); });
    const page = await context.newPage();
    await page.goto(`file://${deck.split(path.sep).join('/').replace(/^([A-Za-z]):/, '/$1:')}`);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.fonts].filter((f) => f.status === 'unloaded').map((f) => f.load().catch(() => null))));
    const faces = await page.evaluate(() => [...document.fonts].map((f) => ({ family: f.family.replace(/"/g, ''), weight: f.weight, status: f.status })));
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    const per = {};
    for (const sel of ['h1', 'p']) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      const text = await page.$eval(sel, (el) => el.textContent);
      per[sel] = { fonts, chars: [...text].length };
    }
    return { attempted, faces, per };
  } finally { await browser.close(); }
}

test('rendering, all external network blocked: every CJK glyph comes from the embedded font; both weights load; control deck falls back', async () => {
  const deck = writeDeck();
  const control = await renderFacts(deck);
  // Control: without embedding, the blocked Google link leaves only system fonts.
  expect(control.attempted.some((u) => u.includes('fonts.googleapis.com')), 'the deck does try Google').toBe(true);
  for (const sel of ['h1', 'p']) expect(control.per[sel].fonts.some((f) => f.isCustomFont), `control ${sel}: no custom font`).toBe(false);

  const r = await runEmbed(deck, goodRanges(), ['--no-subset']);
  expect(r.status, r.out).toBe(0);
  const got = await renderFacts(deck);
  for (const sel of ['h1', 'p']) {
    const { fonts, chars } = got.per[sel];
    expect(fonts.length, `${sel}: platform fonts`).toBeGreaterThan(0);
    expect(fonts.filter((f) => !f.isCustomFont || !f.familyName.startsWith('Noto Serif SC')), `${sel}: glyphs rendered in a system fallback`).toEqual([]);
    expect(fonts.reduce((n, f) => n + f.glyphCount, 0), `${sel}: every character in the embedded font`).toBe(chars);
  }
  const loaded = got.faces.filter((f) => f.family === 'Noto Serif SC' && f.status === 'loaded');
  expect(new Set(loaded.map((f) => f.weight)), 'both weights loaded').toEqual(new Set(['400', '700']));
  expect(got.faces.filter((f) => f.status === 'error'), 'no face failed').toEqual([]);
});

// ---------------------------------------------------------------------------
// 4. Subset path (only where fonttools is installed)
// ---------------------------------------------------------------------------
function hasSubsetter() {
  for (const cmd of [['pyftsubset'], ['python3', '-m', 'fontTools.subset'], ['python', '-m', 'fontTools.subset'], ['py', '-3', '-m', 'fontTools.subset']]) {
    const r = spawnSync(cmd[0], [...cmd.slice(1), '--help'], { stdio: 'ignore' });
    if (!r.error && r.status === 0) return true;
  }
  return false;
}
test('script: pyftsubset path shrinks the result and keeps coverage (skipped without fonttools)', async () => {
  test.skip(!hasSubsetter(), 'pyftsubset / python fontTools not installed on this machine');
  const ranges = goodRanges();
  const whole = writeDeck(), cut = writeDeck();
  expect((await runEmbed(whole, ranges, ['--no-subset'])).status).toBe(0);
  const r = await runEmbed(cut, ranges);
  expect(r.status, r.out).toBe(0);
  expect(r.out).toMatch(/cut down to the used characters/);
  expect(fs.statSync(cut).size).toBeLessThan(fs.statSync(whole).size);
  expect(r.out).toMatch(/Coverage OK/);
});

test('script: --no-subset embeds whole shards and still covers every character', async () => {
  const deck = writeDeck();
  const r = await runEmbed(deck, goodRanges(), ['--no-subset']);
  expect(r.status, r.out).toBe(0);
  expect(r.out).toMatch(/whole shards/);
  expect(r.out).toMatch(/Coverage OK/);
});

// ---------------------------------------------------------------------------
// 5. Site build: shards hosted only with a site URL
// ---------------------------------------------------------------------------
test('site build: fonts/cjk/ hosted only with siteUrl (shards + license, siteBase in the table); absent in the default build', () => {
  expect(fs.existsSync(path.join(SITE, 'fonts', 'cjk')), 'default site/ has no fonts/cjk').toBe(false);

  const out = tmp('sc-cjk-site-');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--out', out, '--site-url', URL_BASE], {
    cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_I18N_DIR: '', SC_SITE_URL: '' }, timeout: 170_000, maxBuffer: 64 * 1024 * 1024,
  });
  expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
  const root = path.join(out, 'fonts', 'cjk');
  expect(fs.existsSync(root), 'site/fonts/cjk').toBe(true);

  let total = 0, files = 0;
  const walkSize = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walkSize(p); else { total += fs.statSync(p).size; files++; } } };
  walkSize(root);
  test.info().annotations.push({ type: 'fonts/cjk', description: `${files} files, ${(total / 1048576).toFixed(1)} MB` });

  const bad = [];
  for (const slug of ALL_SLUGS) {
    const { entries } = readSiteZip(out, slug);
    const t = zget(entries, slug, 'fonts/cjk-ranges.json');
    if (!t) continue;
    const j = JSON.parse(t.toString('utf8'));
    if (j.siteBase !== URL_BASE) bad.push(`${slug}: siteBase ${j.siteBase}`);
    for (const [family, e] of Object.entries(j.families)) {
      const dir = path.join(root, e.id);
      if (!fs.existsSync(dir)) { bad.push(`${slug}: site/fonts/cjk/${e.id}/ missing (${family})`); continue; }
      if (!fs.readdirSync(dir).some((f) => /^(OFL|LICENSE)\.txt$/.test(f))) bad.push(`${e.id}: no OFL.txt / LICENSE.txt`);
      // Every weight the pack's own template requests has all its shards hosted.
      const wanted = new Set();
      for (const f of ['template.html', 'design.md']) {
        const text = zget(entries, slug, f)?.toString('utf8') ?? '';
        for (const m of text.matchAll(/https:\/\/fonts\.googleapis\.com\/css2?\?[^"'`\s)<>]+/g)) {
          const u = new URL(m[0].replace(/&amp;/g, '&'));
          for (const p of u.searchParams.getAll('family')) {
            const [name, spec = ''] = p.split(':');
            if (name.replace(/\+/g, ' ') !== family) continue;
            const ws = (spec.match(/\d{3}(?:\.\.\d{3})?/g) ?? ['400']);
            for (const w of ws) { const [lo, hi = lo] = w.split('..').map(Number); for (const x of e.weights) if (x >= lo && x <= hi) wanted.add(x); }
          }
        }
      }
      for (const w of wanted) for (const k of e.shardsByWeight[w] ?? []) {
        const f = path.join(dir, `${e.id}-${k}-${w}-normal.woff2`);
        if (!fs.existsSync(f)) bad.push(`${slug}: shard ${e.id}-${k}-${w} not hosted`);
        else if (fs.readFileSync(f).subarray(0, 4).toString('latin1') !== 'wOF2') bad.push(`${f}: not woff2`);
      }
    }
  }
  expect(bad.slice(0, 20)).toEqual([]);
  // Files stay under GitHub Pages' per-file limits used by pages.yml (25 MB).
  const biggest = fs.readdirSync(root, { recursive: true }).map((f) => path.join(root, f)).filter((f) => fs.statSync(f).isFile()).reduce((m, f) => Math.max(m, fs.statSync(f).size), 0);
  expect(biggest).toBeLessThan(25 * 1024 * 1024);
});
