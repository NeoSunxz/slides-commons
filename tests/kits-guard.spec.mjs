// The kits build guard: a generated prompt, README or SKILL.md that contains "undefined", "[object Object]"
// or "NaN" fails the build instead of reaching a visitor. Exercised through the CLI (a poisoned --site-url)
// and by calling scripts/kits.mjs buildKits() on a throwaway copy of the repo's kits inputs, with a
// non-throwing `fail` so that every guarded file is reported.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, makeTempDir } from './helpers.mjs';

const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); return d; };
test.afterAll(() => { for (const d of tmps) fs.rmSync(d, { recursive: true, force: true }); });

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

/** A minimal repo root holding what buildKits() reads, copied from the real repo. */
function fakeRoot() {
  const root = tmp('sc-kitroot-');
  const cfg = readJson(path.join(ROOT, 'kits', 'kits.json'));
  const copy = (rel) => {
    const from = path.join(ROOT, ...rel.split('/'));
    const to = path.join(root, ...rel.split('/'));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(from, to, { recursive: true });
  };
  for (const p of ['kits', 'src/schema/template.schema.json', 'src/embed-cjk.mjs', cfg.viewportBase, cfg.viewportBaseLicense, cfg.projectLicense, cfg.example.license,
    ...cfg.example.files.map((f) => `${cfg.example.dir}/${f}`)]) copy(p);
  return { root, cfg };
}

async function runBuildKits({ root, siteUrl = null }) {
  const { buildKits } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'kits.mjs')).href);
  const cfg = readJson(path.join(root, 'kits', 'kits.json'));
  const failures = [];
  const written = [];
  const result = buildKits({
    root, site: path.join(root, 'site'), siteUrl, zipTime: 0,
    makeZip: (entries) => Buffer.from(JSON.stringify(entries.map((e) => e.name ?? e))),
    writeFile: (f) => written.push(path.basename(f)),
    licenseName: () => 'OFL.txt',
    cjkFamilyEntry: (_r, name) => (cfg.cjkFamilies.includes(name) ? { id: name.toLowerCase().replace(/\s+/g, '-'), license: null } : null),
    cjkRangesJson: () => '{}',
    fail: (m) => { failures.push(m); },
  });
  return { failures, written, result };
}

test('baseline: the fake root builds both kits with no failure (so a failure below is the guard, not the fixture)', async () => {
  const { root } = fakeRoot();
  const { failures, written } = await runBuildKits({ root, siteUrl: 'https://example.test/sc/' });
  expect(failures).toEqual([]);
  expect(written.sort()).toEqual(['convert-kit.zip', 'slides-commons-skills.zip']);
});

test('a poisoned site URL is caught in every generated text that embeds the URL: kit PROMPT (EN+ZH), the deck SKILL.md, both install prompts', async () => {
  const { root } = fakeRoot();
  const { failures } = await runBuildKits({ root, siteUrl: 'https://undefined.example/sc/' });
  const named = failures.map((m) => m.match(/^generated text (.+?) contains "(\S+)"/)).filter(Boolean);
  expect(named.length, failures.join('\n')).toBeGreaterThan(0);
  for (const m of named) expect(m[2]).toBe('undefined');
  const files = named.map((m) => m[1]);
  // (the READMEs and the convert / cjk-fonts SKILL.md do not embed the site URL, so this input cannot reach them)
  for (const want of ['convert-kit/PROMPT.md', 'convert-kit/PROMPT.zh.md', 'slides-commons-skills/slides-commons-deck/SKILL.md', 'install prompt (en)', 'install prompt (zh)']) {
    expect(files, `guard for ${want}`).toContain(want);
  }
  // the message shows where the token sits
  expect(failures.find((m) => m.includes('convert-kit/PROMPT.md'))).toMatch(/near: ".*undefined\.example/);
});

test('"[object Object]" and "undefined" coming from the data (font-map.json) fail the build with the file named', async () => {
  for (const [poison, token] of [['undefined', 'undefined'], [{ oops: 1 }, '[object Object]']]) {
    const { root } = fakeRoot();
    const f = path.join(root, 'kits', 'convert', 'spec', 'font-map.json');
    const map = readJson(f);
    map.fonts[0].note = poison;
    fs.writeFileSync(f, JSON.stringify(map));
    const { failures } = await runBuildKits({ root, siteUrl: 'https://example.test/sc/' });
    const hit = failures.find((m) => m.startsWith('generated text '));
    expect(hit, `poison ${token}: ${failures.join(' | ')}`).toBeTruthy();
    expect(hit).toContain('spec/font-substitution.md');
    expect(hit).toContain(`"${token}"`);
  }
});

test('CLI: a poisoned --site-url makes `build` exit non-zero with the message, nothing is published', () => {
  const out = path.join(tmp('sc-kitguard-out-'), 'site');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--site-url', 'https://undefined.example/sc/', '--out', out], {
    cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_NO_LOCAL_SOURCES: '1', SC_SOURCES: '', SC_OUT: '', SC_SITE_URL: '' }, maxBuffer: 64 * 1024 * 1024,
  });
  expect(r.status, `${r.stdout}\n${r.stderr}`).not.toBe(0);
  expect(r.stderr + r.stdout).toMatch(/build failed: generated text \S+ contains "undefined"/);
  expect(fs.existsSync(path.join(out, 'zip', 'convert-kit.zip')), 'a failed build must not leave a finished kit zip').toBe(false);
});

test('the real built kit texts contain none of the guarded tokens (EN + ZH pages of the default build)', () => {
  // The default site/ is a build without a site URL; scan its kit pages and prompts.
  for (const rel of [['convert', 'index.html'], ['zh', 'convert', 'index.html'], ['skills', 'index.html'], ['zh', 'skills', 'index.html']]) {
    const html = fs.readFileSync(path.join(ROOT, 'site', ...rel), 'utf8').replace(/<script[^]*?<\/script>/g, '');
    expect(html, rel.join('/')).not.toMatch(/\bundefined\b|\[object Object\]|\bNaN\b/);
  }
});
