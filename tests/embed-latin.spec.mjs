// kits/convert/fonts/embed-latin.mjs (shipped in convert-kit.zip and in the deck / convert skills).
// Network-free: node is started with tests/latin-fetch-shim.mjs, which sends every fetch() to a local
// server that serves woff2 files from node_modules/@fontsource and @fontsource-variable (the same files
// jsDelivr would serve). Chromium renders the result with every http(s) request blocked.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { test, expect, chromium } from '@playwright/test';
import { ROOT, SITE, makeTempDir, readZip } from './helpers.mjs';

test.describe.configure({ mode: 'serial' });

const SCRIPT_SRC = path.join(ROOT, 'kits', 'convert', 'fonts', 'embed-latin.mjs');
const SHIM = path.join(ROOT, 'tests', 'latin-fetch-shim.mjs');
const FS = path.join(ROOT, 'node_modules', '@fontsource');
const FSV = path.join(ROOT, 'node_modules', '@fontsource-variable');
const BEGIN = 'sc-latin-fonts:begin';
const END = 'sc-latin-fonts:end';

const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); return d; };
test.afterAll(() => { for (const d of tmps) fs.rmSync(d, { recursive: true, force: true }); });

let server, base, script;
const log = []; // { host, path, status }
const mode = { cdn: 'ok', fastly: 'ok', site: 'ok', siteRoot: null, siteMissing: new Set(), fail: new Set() }; // cdn/fastly: 'ok' | 'down'; fail: path fragments that 404

// Fake deploying site: /site/<prefix>/fonts/latin/<kind>/<id>/<file>. Served from node_modules (same bytes the
// build copies) or, when mode.siteRoot is set, from a built site/ directory. mode.site 'down' = 503 everywhere.
function serveSite(req, res) {
  const entry = { host: req.headers['x-orig-host'], path: req.url, status: 404 };
  log.push(entry);
  const done = (code, body) => { entry.status = code; res.writeHead(code, { 'content-type': 'font/woff2' }).end(body); };
  const m = req.url.match(/\/fonts\/latin\/(static|variable)\/([a-z0-9-]+)\/([^/]+\.woff2)$/);
  if (mode.site === 'down') return done(503, 'down');
  if (!m || [...mode.siteMissing].some((f) => req.url.includes(f))) return done(404, 'no');
  const f = mode.siteRoot
    ? path.join(mode.siteRoot, 'fonts', 'latin', m[1], m[2], m[3])
    : path.join(m[1] === 'static' ? FS : FSV, m[2], 'files', m[3]);
  if (!fs.existsSync(f)) return done(404, 'no');
  done(200, fs.readFileSync(f));
}

test.beforeAll(async () => {
  const dir = tmp('sc-latin-script-');
  script = path.join(dir, 'fonts', 'embed-latin.mjs');
  fs.mkdirSync(path.dirname(script), { recursive: true });
  fs.copyFileSync(SCRIPT_SRC, script);
  server = http.createServer((req, res) => {
    if (req.url.startsWith('/site/')) return serveSite(req, res);
    const m = req.url.match(/^\/(cdn|fastly)\/npm\/(@fontsource(?:-variable)?)\/([^/@]+)@[^/]+\/files\/([^/]+\.woff2)$/);
    const entry = { host: req.headers['x-orig-host'], path: req.url, status: 404 };
    log.push(entry);
    const done = (code, body) => { entry.status = code; res.writeHead(code, { 'content-type': 'font/woff2' }).end(body); };
    if (!m) return done(404, 'no');
    if (mode[m[1]] === 'down') return done(503, 'down');
    if ([...mode.fail].some((f) => req.url.includes(f))) return done(404, 'no');
    const f = path.join(m[2] === '@fontsource' ? FS : FSV, m[3], 'files', m[4]);
    if (!f.startsWith(FS) && !f.startsWith(FSV)) return done(404, 'no');
    if (!fs.existsSync(f)) return done(404, 'no');
    done(200, fs.readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { await new Promise((r) => (server ? server.close(r) : r())); });
test.beforeEach(() => { log.length = 0; mode.cdn = 'ok'; mode.fastly = 'ok'; mode.site = 'ok'; mode.siteRoot = null; mode.siteMissing.clear(); mode.fail.clear(); });

// Async on purpose: the file server lives in this process.
function runEmbed(args, { shim = true, env = {}, script: scriptPath = script } = {}) {
  return new Promise((resolve) => {
    const e = { ...process.env, SC_SITE_URL: '', SC_TEST_SITE_HOSTS: SITE_HOSTS, SC_TEST_LATIN_BASE: base, ...env };
    const c = spawn(process.execPath, [...(shim ? ['--import', pathToFileURL(SHIM).href] : []), scriptPath, ...args], {
      cwd: path.dirname(path.dirname(scriptPath)),
      env: e,
    });
    let out = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => c.kill(), 90_000);
    c.on('close', (status) => { clearTimeout(timer); resolve({ status, out }); });
  });
}

const SITE_HOSTS = 'site-a.test,site-b.test,site-c.test';
const LINK = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Playfair+Display:ital,wght@0,400;1,400&family=Noto+Sans+SC:wght@400;700&display=swap';
const deck = ({ link = LINK, head = true, body = '<h1 style="font-family:\'Space Grotesk\';font-weight:700">Łódź Hello</h1><p style="font-family:\'Playfair Display\';font-style:italic">Ścieżka italic</p>' } = {}) => `<!doctype html>
<html lang="en">${head ? '<head><meta charset="utf-8"><title>t</title>' : ''}
${link ? `<link rel="stylesheet" href="${link}">` : '<style>body{font-family:Helvetica,Arial,sans-serif}</style>'}
${head ? '</head>' : ''}<body>${body}</body></html>
`;
function writeDeck(opts) {
  const f = path.join(tmp('sc-latin-deck-'), 'deck.html');
  fs.writeFileSync(f, deck(opts));
  return f;
}
const faces = (html) => [...html.matchAll(/@font-face\{font-family:"([^"]+)";font-style:(\w+);font-weight:([^;]+);font-display:swap;src:url\(data:font\/woff2;base64,([A-Za-z0-9+/=]+)\) format\("woff2"\);unicode-range:([^}]+)\}/g)]
  .map((m) => ({ family: m[1], style: m[2], weight: m[3], b64: m[4], range: m[5] }));
const b64Of = (...p) => fs.readFileSync(path.join(...p)).toString('base64');

test('usage: no file and a missing file are exit 1', async () => {
  let r = await runEmbed([]);
  expect(r.status, r.out).toBe(1);
  expect(r.out).toMatch(/usage: node fonts\/embed-latin\.mjs/);
  r = await runEmbed([path.join(tmp('sc-latin-none-'), 'nope.html')]);
  expect(r.status, r.out).toBe(1);
  expect(r.out).toMatch(/cannot read/);
  expect(log, 'no request on a usage error').toEqual([]);
});

test('exit 4 and the file untouched: system fonts only, or only CJK families', async () => {
  for (const link of [null, 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap']) {
    const f = writeDeck({ link });
    const before = fs.readFileSync(f);
    const r = await runEmbed([f]);
    expect(r.status, r.out).toBe(4);
    expect(r.out).toMatch(/No Google Fonts <link>/);
    expect(fs.readFileSync(f).equals(before)).toBe(true);
  }
  expect(log).toEqual([]);
});

test('--dry-run: reports the plan, exit 0, file byte-identical', async () => {
  const f = writeDeck();
  const before = fs.readFileSync(f);
  const r = await runEmbed([f, '--dry-run']);
  expect(r.status, r.out).toBe(0);
  expect(r.out).toMatch(/Space Grotesk, Playfair Display: \d+ font file\(s\).*\[dry run: file not changed\]/);
  expect(r.out).not.toMatch(/Noto Sans SC/);
  expect(fs.readFileSync(f).equals(before)).toBe(true);
});

test('embeds latin AND latin-ext as base64 @font-face for every family/weight/style; skips CJK; keeps the Google link', async () => {
  const f = writeDeck();
  const r = await runEmbed([f]);
  expect(r.status, r.out).toBe(0);
  expect(r.out).toMatch(/Space Grotesk, Playfair Display: 8 font file\(s\)/);
  const html = fs.readFileSync(f, 'utf8');
  expect(html.split(BEGIN).length - 1, 'one begin marker').toBe(1);
  expect(html.split(END).length - 1, 'one end marker').toBe(1);
  expect(html.indexOf(BEGIN)).toBeLessThan(html.indexOf('</head>'));
  expect(html, 'the Google link stays as the fallback').toContain(LINK);
  expect(html.indexOf(LINK), 'embedded rules come after the link so they win').toBeLessThan(html.indexOf(BEGIN));
  const got = faces(html);
  const want = [
    ['Space Grotesk', 'normal', '400', FS, 'space-grotesk', 'space-grotesk-%s-400-normal.woff2'],
    ['Space Grotesk', 'normal', '700', FS, 'space-grotesk', 'space-grotesk-%s-700-normal.woff2'],
    ['Playfair Display', 'normal', '400', FS, 'playfair-display', 'playfair-display-%s-400-normal.woff2'],
    ['Playfair Display', 'italic', '400', FS, 'playfair-display', 'playfair-display-%s-400-italic.woff2'],
  ];
  expect(got).toHaveLength(want.length * 2);
  for (const [family, style, weight, root, id, pattern] of want) {
    for (const subset of ['latin', 'latin-ext']) {
      const g = got.find((x) => x.family === family && x.style === style && x.weight === weight && (subset === 'latin' ? x.range.startsWith('U+0000-00FF') : x.range.startsWith('U+0100-02BA')));
      expect(g, `${family} ${style} ${weight} ${subset}`).toBeTruthy();
      expect(g.b64, `${family} ${style} ${weight} ${subset}: embedded bytes are the Fontsource file`).toBe(b64Of(root, id, 'files', pattern.replace('%s', subset)));
    }
  }
  expect(got.some((x) => /Noto Sans SC/.test(x.family)), 'CJK is not embedded by this script').toBe(false);
  // only jsDelivr hosts were asked for, via the documented Fontsource path
  expect(log.length).toBeGreaterThan(0);
  for (const e of log) {
    expect(['cdn.jsdelivr.net', 'fastly.jsdelivr.net']).toContain(e.host);
    expect(e.path).toMatch(/\/npm\/@fontsource(-variable)?\/[a-z0-9-]+@5\/files\/[a-z0-9-]+-latin(-ext)?-(\d+|wght)-(normal|italic)\.woff2$/);
  }
  expect(r.out).toMatch(/written: /);
});

test('variable fonts: a weight range uses @fontsource-variable once per style and writes "min max"', async () => {
  const f = writeDeck({ link: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,100..900;1,100..900&display=swap' });
  const r = await runEmbed([f]);
  expect(r.status, r.out).toBe(0);
  const got = faces(fs.readFileSync(f, 'utf8'));
  expect(got).toHaveLength(4); // normal+italic x latin+latin-ext
  for (const g of got) expect(g.weight).toBe('100 900');
  expect(got.find((g) => g.style === 'normal' && g.range.startsWith('U+0000')).b64).toBe(b64Of(FSV, 'fraunces', 'files', 'fraunces-latin-wght-normal.woff2'));
  expect(got.find((g) => g.style === 'italic' && g.range.startsWith('U+0100')).b64).toBe(b64Of(FSV, 'fraunces', 'files', 'fraunces-latin-ext-wght-italic.woff2'));
});

test('idempotent: a second run (and a third with --dry-run) leaves the file byte-identical, one block only', async () => {
  const f = writeDeck();
  expect((await runEmbed([f])).status).toBe(0);
  const once = fs.readFileSync(f);
  const r2 = await runEmbed([f]);
  expect(r2.status, r2.out).toBe(0);
  expect(fs.readFileSync(f).equals(once), 'second run changed the file').toBe(true);
  expect((await runEmbed([f, '--dry-run'])).status).toBe(0);
  expect(fs.readFileSync(f).equals(once)).toBe(true);
  expect(fs.readFileSync(f, 'utf8').split(BEGIN).length - 1).toBe(1);
  expect(fs.readdirSync(path.dirname(f)), 'no temp file left behind').toEqual(['deck.html']);
});

test('re-run after changing the fonts replaces the block (old families gone, no duplicate rules)', async () => {
  const f = writeDeck();
  expect((await runEmbed([f])).status).toBe(0);
  const next = fs.readFileSync(f, 'utf8').replace(LINK, 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400&display=swap');
  fs.writeFileSync(f, next);
  const r = await runEmbed([f]);
  expect(r.status, r.out).toBe(0);
  const got = faces(fs.readFileSync(f, 'utf8'));
  expect(got.map((g) => `${g.family}|${g.weight}`).sort()).toEqual(['Space Grotesk|400', 'Space Grotesk|400']);
  expect(fs.readFileSync(f, 'utf8').split(BEGIN).length - 1).toBe(1);
});

test('a file without </head> gets the block at the top; the file still has its body untouched', async () => {
  const f = writeDeck({ head: false });
  const r = await runEmbed([f]);
  expect(r.status, r.out).toBe(0);
  const html = fs.readFileSync(f, 'utf8');
  expect(html.startsWith(`<!-- ${BEGIN}`)).toBe(true);
  expect(html).toContain('<h1 style="font-family:\'Space Grotesk\';font-weight:700">Łódź Hello</h1>');
});

test('first host down: falls back to fastly.jsdelivr.net, exit 0, same bytes', async () => {
  mode.cdn = 'down';
  const f = writeDeck({ link: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400&display=swap' });
  const r = await runEmbed([f]);
  expect(r.status, r.out).toBe(0);
  expect(log.some((e) => e.host === 'cdn.jsdelivr.net' && e.status === 503)).toBe(true);
  expect(log.some((e) => e.host === 'fastly.jsdelivr.net' && e.status === 200)).toBe(true);
  expect(faces(fs.readFileSync(f, 'utf8'))).toHaveLength(2);
});

test('exit 3: one family is not on Fontsource, the rest is embedded and the missing one is named', async () => {
  const f = writeDeck({ link: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400&family=No+Such+Family:wght@400&display=swap' });
  const r = await runEmbed([f]);
  expect(r.status, r.out).toBe(3);
  expect(r.out).toMatch(/not found on Fontsource \/ jsDelivr.*No Such Family normal 400/);
  expect(faces(fs.readFileSync(f, 'utf8')).map((g) => g.family)).toEqual(['Space Grotesk', 'Space Grotesk']);
});

test('exit 3 and the file untouched when nothing can be downloaded (both hosts down)', async () => {
  mode.cdn = 'down'; mode.fastly = 'down';
  const f = writeDeck();
  const before = fs.readFileSync(f);
  const r = await runEmbed([f]);
  expect(r.status, r.out).toBe(3);
  expect(fs.readFileSync(f).equals(before)).toBe(true);
  expect(fs.readFileSync(f, 'utf8')).not.toContain(BEGIN);
});

test('@import form of the Google Fonts URL and &amp; in HTML are understood', async () => {
  const f = path.join(tmp('sc-latin-imp-'), 'deck.html');
  fs.writeFileSync(f, `<!doctype html><html><head><style>@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&amp;display=swap');</style></head><body>x</body></html>`);
  const r = await runEmbed([f]);
  expect(r.status, r.out).toBe(0);
  expect(faces(fs.readFileSync(f, 'utf8')).map((g) => g.weight)).toEqual(['700', '700']);
});

test('rendered offline: every embedded face loads in Chromium with all http(s) requests blocked', async () => {
  const f = writeDeck();
  expect((await runEmbed([f])).status).toBe(0);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const attempted = [];
    await context.route(/^https?:/, (route) => { attempted.push(route.request().url()); return route.abort(); });
    const page = await context.newPage();
    await page.goto(pathToFileURL(f).href);
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => [...document.fonts].filter((x) => /Space Grotesk|Playfair/.test(x.family)).map((x) => `${x.family}|${x.style}|${x.weight}|${x.status}`).sort()), { timeout: 15_000 })
      .toEqual(expect.arrayContaining([
        'Space Grotesk|normal|700|loaded',
        'Playfair Display|italic|400|loaded',
      ]));
    // the latin-ext faces (Ł, ź, Ś) loaded too: the text uses both subsets
    const states = await page.evaluate(() => [...document.fonts].filter((x) => x.family === 'Space Grotesk' && x.weight === '700').map((x) => `${/^U\+0*100-/i.test(x.unicodeRange) ? 'latin-ext' : /^U\+0*-FF/i.test(x.unicodeRange) ? 'latin' : x.unicodeRange}:${x.status}`).sort());
    expect(states).toEqual(['latin-ext:loaded', 'latin:loaded']);
    expect(attempted.filter((u) => !/fonts\.googleapis\.com/.test(u)), 'nothing but the (blocked) Google link was requested').toEqual([]);
  } finally { await browser.close(); }
});

test('shipping: embed-latin.mjs is in convert-kit.zip and the deck + convert skills, byte-identical to the source; not in the cjk-fonts skill', () => {
  const src = fs.readFileSync(SCRIPT_SRC);
  const kit = readZip(fs.readFileSync(path.join(SITE, 'zip', 'convert-kit.zip')));
  const skills = readZip(fs.readFileSync(path.join(SITE, 'zip', 'slides-commons-skills.zip')));
  const get = (z, n) => z.entries.find((e) => e.name === n)?.data;
  expect(get(kit, 'convert-kit/fonts/embed-latin.mjs')?.equals(src), 'convert-kit').toBe(true);
  for (const s of ['slides-commons-deck', 'slides-commons-convert']) expect(get(skills, `slides-commons-skills/${s}/fonts/embed-latin.mjs`)?.equals(src), s).toBe(true);
  expect(get(skills, 'slides-commons-skills/slides-commons-cjk-fonts/fonts/embed-latin.mjs')).toBeUndefined();
  // the kit's own prompt and README tell the agent about it
  expect(get(kit, 'convert-kit/README.md').toString('utf8')).toContain('fonts/embed-latin.mjs');
  expect(get(kit, 'convert-kit/PROMPT.md').toString('utf8')).toContain('embed-latin.mjs');
  expect(get(kit, 'convert-kit/PROMPT.zh.md').toString('utf8')).toContain('embed-latin.mjs');
});

// ---------------------------------------------------------------------------------------------
// Site-first order. Fake site hosts (site-a/b/c.test) are served by the same local server.
// ---------------------------------------------------------------------------------------------
const ONE = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap'; // 4 files
const hostsOf = (entries) => [...new Set(entries.map((e) => e.host))].sort();
const countOf = (out, host) => Number((out.match(new RegExp(`Font files downloaded from: .*?${host.replace(/\./g, '\\.')} (\\d+)`)) ?? [])[1] ?? 0);
function scriptCopy(siteBase) {
  const dir = tmp('sc-latin-sb-');
  const s = path.join(dir, 'fonts', 'embed-latin.mjs');
  fs.mkdirSync(path.dirname(s), { recursive: true });
  fs.copyFileSync(SCRIPT_SRC, s);
  if (siteBase !== undefined) fs.writeFileSync(path.join(dir, 'fonts', 'cjk-ranges.json'), JSON.stringify({ schema: 1, siteBase, families: {} }));
  return s;
}

test.describe('site first, then jsDelivr', () => {
  test('--site: every file comes from the site, at the documented path; jsDelivr is never asked; summary counts the site', async () => {
    const f = writeDeck({ link: ONE });
    const r = await runEmbed([f, '--site', 'https://site-a.test/slides-commons/']);
    expect(r.status, r.out).toBe(0);
    expect(hostsOf(log)).toEqual(['site-a.test']);
    expect(log).toHaveLength(4);
    for (const e of log) expect(e.path).toMatch(/^\/site\/slides-commons\/fonts\/latin\/static\/space-grotesk\/space-grotesk-latin(-ext)?-(400|700)-normal\.woff2$/);
    expect(r.out).toMatch(/Font files downloaded from: site-a\.test 4\./);
    // same bytes as the Fontsource file
    expect(faces(fs.readFileSync(f, 'utf8')).find((g) => g.weight === '700' && g.range.startsWith('U+0000')).b64).toBe(b64Of(FS, 'space-grotesk', 'files', 'space-grotesk-latin-700-normal.woff2'));
  });

  test('--site without a trailing slash works; SC_SITE_URL works the same', async () => {
    let r = await runEmbed([writeDeck({ link: ONE }), '--site', 'https://site-a.test/slides-commons']);
    expect(r.status, r.out).toBe(0);
    expect(log[0].path).toBe('/site/slides-commons/fonts/latin/static/space-grotesk/space-grotesk-latin-400-normal.woff2');
    log.length = 0;
    r = await runEmbed([writeDeck({ link: ONE })], { env: { SC_SITE_URL: 'https://site-b.test/x/' } });
    expect(r.status, r.out).toBe(0);
    expect(hostsOf(log)).toEqual(['site-b.test']);
    expect(r.out).toMatch(/site-b\.test 4/);
  });

  test('siteBase of the cjk-ranges.json beside the script is used when no flag / variable is given', async () => {
    const r = await runEmbed([writeDeck({ link: ONE })], { script: scriptCopy('https://site-c.test/pages/') });
    expect(r.status, r.out).toBe(0);
    expect(hostsOf(log)).toEqual(['site-c.test']);
    expect(log[0].path).toMatch(/^\/site\/pages\/fonts\/latin\/static\//);
  });

  test('siteBase null / no table: jsDelivr only (unchanged behaviour)', async () => {
    for (const s of [scriptCopy(null), scriptCopy()]) {
      log.length = 0;
      const r = await runEmbed([writeDeck({ link: ONE })], { script: s });
      expect(r.status, r.out).toBe(0);
      expect(hostsOf(log)).toEqual(['cdn.jsdelivr.net']);
      expect(r.out).toMatch(/Font files downloaded from: cdn\.jsdelivr\.net 4\./);
    }
  });

  test('precedence: --site beats SC_SITE_URL beats siteBase', async () => {
    const s = scriptCopy('https://site-c.test/');
    let r = await runEmbed([writeDeck({ link: ONE }), '--site', 'https://site-a.test/'], { script: s, env: { SC_SITE_URL: 'https://site-b.test/' } });
    expect(r.status, r.out).toBe(0);
    expect(hostsOf(log), 'flag wins').toEqual(['site-a.test']);
    log.length = 0;
    r = await runEmbed([writeDeck({ link: ONE })], { script: s, env: { SC_SITE_URL: 'https://site-b.test/' } });
    expect(r.status, r.out).toBe(0);
    expect(hostsOf(log), 'env beats siteBase').toEqual(['site-b.test']);
    log.length = 0;
    r = await runEmbed([writeDeck({ link: ONE })], { script: s });
    expect(hostsOf(log), 'siteBase last').toEqual(['site-c.test']);
  });

  test('the site lacks some files: those fall back to jsDelivr, the rest stay on the site; summary counts per host', async () => {
    mode.siteMissing.add('-700-'); // site has 400 only
    const f = writeDeck({ link: ONE });
    const r = await runEmbed([f, '--site', 'https://site-a.test/']);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/Font files downloaded from: site-a\.test 2, cdn\.jsdelivr\.net 2\./);
    expect(log.filter((e) => e.host === 'site-a.test' && /-700-/.test(e.path)).every((e) => e.status === 404)).toBe(true);
    expect(log.filter((e) => e.host === 'cdn.jsdelivr.net' && /-700-/.test(e.path))).toHaveLength(2);
    expect(log.filter((e) => e.host === 'fastly.jsdelivr.net'), 'fastly untouched').toHaveLength(0);
    expect(faces(fs.readFileSync(f, 'utf8'))).toHaveLength(4);
  });

  test('the site is down (503): every file comes from jsDelivr, exit 0; a 404 is not retried, a 503 is', async () => {
    mode.site = 'down';
    const r = await runEmbed([writeDeck({ link: ONE }), '--site', 'https://site-a.test/']);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/Font files downloaded from: cdn\.jsdelivr\.net 4\./);
    expect(r.out).not.toMatch(/site-a\.test \d/);
    expect(log.filter((e) => e.host === 'site-a.test').length, 'site asked first, with a retry on 5xx').toBeGreaterThanOrEqual(4);
    // the first request of the run went to the site, not to jsDelivr
    expect(log[0].host).toBe('site-a.test');
  });

  test('site down AND jsDelivr cdn down: fastly is the last resort', async () => {
    mode.site = 'down'; mode.cdn = 'down';
    const r = await runEmbed([writeDeck({ link: ONE }), '--site', 'https://site-a.test/']);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/Font files downloaded from: fastly\.jsdelivr\.net 4\./);
  });

  test('variable fonts come from fonts/latin/variable/ on the site', async () => {
    const f = writeDeck({ link: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,100..900;1,100..900&display=swap' });
    const r = await runEmbed([f, '--site', 'https://site-a.test/']);
    expect(r.status, r.out).toBe(0);
    expect(hostsOf(log)).toEqual(['site-a.test']);
    expect(log.some((e) => e.status === 200 && /\/fonts\/latin\/variable\/fraunces\/fraunces-latin-ext-wght-italic\.woff2$/.test(e.path))).toBe(true);
    expect(r.out).toMatch(/site-a\.test 4\./);
  });

  test('an invalid --site is reported and ignored: jsDelivr only', async () => {
    const r = await runEmbed([writeDeck({ link: ONE }), '--site', 'not a url']);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/ignoring invalid site URL/);
    expect(hostsOf(log)).toEqual(['cdn.jsdelivr.net']);
  });

  test('a host that is neither the site nor jsDelivr is never contacted (shim would throw)', async () => {
    const r = await runEmbed([writeDeck({ link: ONE }), '--site', 'https://site-a.test/']);
    expect(r.out).not.toMatch(/UNEXPECTED HOST/);
    expect(hostsOf(log).every((h) => ['site-a.test', 'cdn.jsdelivr.net', 'fastly.jsdelivr.net'].includes(h))).toBe(true);
  });

  test('--site value is not mistaken for the file name', async () => {
    const f = writeDeck({ link: ONE });
    const r = await runEmbed(['--site', 'https://site-a.test/', f, '--dry-run']);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/dry run/);
  });
});

// ---------------------------------------------------------------------------------------------
// Build output: fonts/latin/ exists only for a site-URL build.
// ---------------------------------------------------------------------------------------------
test.describe('build hosts Latin fonts for the convert kit', () => {
  const FONT_MAP = JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'convert', 'spec', 'font-map.json'), 'utf8'));
  let withUrl, without;
  const build = (out, args, env = {}) => spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--out', out, ...args], {
    cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_I18N_DIR: '', SC_SITE_URL: '', ...env },
  });

  test.beforeAll(() => {
    withUrl = path.join(tmp('sc-latin-build-'), 'site');
    without = path.join(tmp('sc-latin-build-'), 'site');
    const a = build(withUrl, ['--site-url', 'https://site.example/slides-commons/']);
    expect(a.status, a.stdout + a.stderr).toBe(0);
    expect(a.stdout).toMatch(/hosted \d+ Latin font files/);
    const b = build(without, []);
    expect(b.status, b.stdout + b.stderr).toBe(0);
  });

  const L = (root, ...p) => path.join(root, 'fonts', 'latin', ...p);

  test('without a site URL there is no fonts/latin/ (the default site/ too)', () => {
    expect(fs.existsSync(L(without))).toBe(false);
    expect(fs.existsSync(L(SITE)), 'the suite\'s own site/ has no site URL').toBe(false);
  });

  test('with a site URL: sampled substitutes have latin + latin-ext woff2 and a licence file', () => {
    const samples = [
      ['static', 'arimo', ['400', '700']],
      ['static', 'eb-garamond', ['400', '700']],
      ['static', 'inter', ['400', '700']],
      ['static', 'carlito', ['400', '700']],
      ['static', 'open-sans', ['400', '600', '700']],
    ];
    for (const [kind, id, weights] of samples) {
      for (const w of weights) for (const sub of ['latin', 'latin-ext']) {
        const f = L(withUrl, kind, id, `${id}-${sub}-${w}-normal.woff2`);
        expect(fs.existsSync(f), `${kind}/${id} ${sub} ${w}`).toBe(true);
        expect(fs.readFileSync(f).toString('latin1', 0, 4), `${id} is woff2`).toBe('wOF2');
      }
    }
    // Fraunces variable: normal + italic
    for (const style of ['normal', 'italic']) for (const sub of ['latin', 'latin-ext']) {
      expect(fs.existsSync(L(withUrl, 'variable', 'fraunces', `fraunces-${sub}-wght-${style}.woff2`)), `fraunces variable ${sub} ${style}`).toBe(true);
    }
    // Bytes equal the Fontsource package
    expect(fs.readFileSync(L(withUrl, 'static', 'arimo', 'arimo-latin-400-normal.woff2')).equals(fs.readFileSync(path.join(FS, 'arimo', 'files', 'arimo-latin-400-normal.woff2')))).toBe(true);
    expect(fs.readFileSync(L(withUrl, 'variable', 'fraunces', 'fraunces-latin-wght-normal.woff2')).equals(fs.readFileSync(path.join(FSV, 'fraunces', 'files', 'fraunces-latin-wght-normal.woff2')))).toBe(true);
  });

  test('every hosted family directory has a licence file (OFL / Apache) with real text', () => {
    let dirs = 0;
    for (const kind of ['static', 'variable']) {
      for (const id of fs.readdirSync(L(withUrl, kind))) {
        dirs++;
        const files = fs.readdirSync(L(withUrl, kind, id));
        expect(files.some((n) => n.endsWith('.woff2')), `${kind}/${id} has fonts`).toBe(true);
        const lic = files.filter((n) => !n.endsWith('.woff2'));
        expect(lic.length, `${kind}/${id}: licence file`).toBeGreaterThanOrEqual(1);
        expect(lic.some((n) => /^(OFL|LICENSE|APACHE|UFL)/i.test(n)), `${kind}/${id}: ${lic}`).toBe(true);
        expect(fs.statSync(L(withUrl, kind, id, lic[0])).size, `${kind}/${id}: ${lic[0]} not empty`).toBeGreaterThan(200);
      }
    }
    expect(dirs).toBeGreaterThan(50);
  });

  test('Yellowtail (Apache 2.0) ships its own licence text, not OFL', () => {
    const d = L(withUrl, 'static', 'yellowtail');
    const lic = fs.readdirSync(d).filter((n) => !n.endsWith('.woff2'));
    expect(lic.length).toBe(1);
    expect(fs.readFileSync(path.join(d, lic[0]), 'utf8')).toMatch(/Apache License/i);
  });

  test('every non-CJK font-map substitute is hosted: embed-latin served from the built site needs no jsDelivr request', async () => {
    const links = [];
    for (const f of FONT_MAP.fonts) {
      if (!f.google) continue;
      if (/^(Noto\+(Sans|Serif)\+(SC|TC|JP|KR)|LXGW)/.test(f.google)) continue;
      links.push(`https://fonts.googleapis.com/css2?family=${f.google}&display=swap`);
    }
    expect(links.length).toBeGreaterThan(10);
    mode.siteRoot = path.join(withUrl);
    const html = `<!doctype html><html><head>${links.map((l) => `<link rel="stylesheet" href="${l}">`).join('\n')}</head><body>x</body></html>`;
    const f = path.join(tmp('sc-latin-map-'), 'deck.html');
    fs.writeFileSync(f, html);
    const r = await runEmbed([f, '--dry-run', '--site', 'https://site-a.test/']);
    expect(r.status, r.out).toBe(0);
    expect(log.filter((e) => e.host !== 'site-a.test'), 'nothing fell back to jsDelivr').toEqual([]);
    expect(log.filter((e) => e.status !== 200).map((e) => `${e.status} ${e.path}`), 'every requested file exists on the built site').toEqual([]);
    expect(r.out).toMatch(/Font files downloaded from: site-a\.test \d+\.$/m);
  });

  test('the kit built with a site URL carries siteBase in cjk-ranges.json (what embed-latin reads)', () => {
    const z = readZip(fs.readFileSync(path.join(withUrl, 'zip', 'convert-kit.zip')));
    const e = z.entries.find((x) => x.name === 'convert-kit/fonts/cjk-ranges.json');
    expect(e, 'cjk-ranges.json in the kit').toBeTruthy();
    expect(JSON.parse(e.data.toString('utf8')).siteBase).toBe('https://site.example/slides-commons/');
    const z0 = readZip(fs.readFileSync(path.join(without, 'zip', 'convert-kit.zip')));
    expect(JSON.parse(z0.entries.find((x) => x.name === 'convert-kit/fonts/cjk-ranges.json').data.toString('utf8')).siteBase).toBeNull();
  });
});

// ---------------------------------------------------------------------------------------------
// Docs: relative links resolve.
// ---------------------------------------------------------------------------------------------
test.describe('self-hosting docs: relative links resolve', () => {
  for (const rel of ['docs/self-hosting.md', 'docs/self-hosting.zh.md', 'examples/private-source/README.md']) {
    test(rel, () => {
      const file = path.join(ROOT, ...rel.split('/'));
      const text = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
      const links = [...text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]).filter((l) => !/^([a-z]+:|#|\/\/)/i.test(l));
      const bad = [];
      for (const l of links) {
        const target = path.resolve(path.dirname(file), decodeURIComponent(l.split('#')[0].split('?')[0]));
        if (!l.split('#')[0]) continue;
        if (!target.startsWith(ROOT) || !fs.existsSync(target)) bad.push(l);
      }
      expect(bad, `broken relative links in ${rel}`).toEqual([]);
    });
  }
});
