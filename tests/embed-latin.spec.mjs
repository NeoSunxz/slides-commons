// kits/convert/fonts/embed-latin.mjs (shipped in convert-kit.zip and in the deck / convert skills).
// Network-free: node is started with tests/latin-fetch-shim.mjs, which sends every fetch() to a local
// server that serves woff2 files from node_modules/@fontsource and @fontsource-variable (the same files
// jsDelivr would serve). Chromium renders the result with every http(s) request blocked.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
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
const mode = { cdn: 'ok', fastly: 'ok', fail: new Set() }; // cdn/fastly: 'ok' | 'down'; fail: path fragments that 404

test.beforeAll(async () => {
  const dir = tmp('sc-latin-script-');
  script = path.join(dir, 'fonts', 'embed-latin.mjs');
  fs.mkdirSync(path.dirname(script), { recursive: true });
  fs.copyFileSync(SCRIPT_SRC, script);
  server = http.createServer((req, res) => {
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
test.beforeEach(() => { log.length = 0; mode.cdn = 'ok'; mode.fastly = 'ok'; mode.fail.clear(); });

// Async on purpose: the file server lives in this process.
function runEmbed(args, { shim = true } = {}) {
  return new Promise((resolve) => {
    const c = spawn(process.execPath, [...(shim ? ['--import', pathToFileURL(SHIM).href] : []), script, ...args], {
      cwd: path.dirname(path.dirname(script)),
      env: { ...process.env, SC_TEST_LATIN_BASE: base },
    });
    let out = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => c.kill(), 90_000);
    c.on('close', (status) => { clearTimeout(timer); resolve({ status, out }); });
  });
}

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
