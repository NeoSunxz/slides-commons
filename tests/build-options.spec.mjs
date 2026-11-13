// Build options: --i18n-dir / SC_I18N_DIR and --site-url / SC_SITE_URL. Node only (no browser);
// every build writes to the OS temp dir via --out and nothing touches the repo's site/ or src/.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, SITE, ALL_SLUGS, makeTempDir, readZip, upstreamMeta } from './helpers.mjs';

test.describe.configure({ mode: 'serial' });

const SCRIPT = (n) => path.join(ROOT, 'scripts', `${n}.mjs`);
const I18N_SRC = path.join(ROOT, 'src', 'i18n');
const URL_BASE = 'https://neosunxz.github.io/slides-commons/';

function run(script, args = [], { env = {}, cwd = ROOT } = {}) {
  const r = spawnSync(process.execPath, [script.endsWith('.mjs') ? script : SCRIPT(script), ...args], {
    cwd, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_I18N_DIR: '', SC_SITE_URL: '', ...env },
  });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
}

const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); return d; };
test.afterAll(() => { for (const d of tmps) fs.rmSync(d, { recursive: true, force: true }); });

function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name), base) : [path.relative(base, path.join(dir, e.name)).split(path.sep).join('/')])).sort();
}
function diffTrees(a, b) {
  const fa = walk(a), fb = walk(b);
  const problems = [];
  if (JSON.stringify(fa) !== JSON.stringify(fb)) problems.push(`file lists differ: only in A ${fa.filter((f) => !fb.includes(f)).slice(0, 3)}; only in B ${fb.filter((f) => !fa.includes(f)).slice(0, 3)}`);
  for (const f of fa.filter((x) => fb.includes(x))) if (Buffer.compare(fs.readFileSync(path.join(a, f)), fs.readFileSync(path.join(b, f))) !== 0) problems.push(`differs: ${f}`);
  return problems;
}
const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const pagePrompt = (out, rel, id) => {
  const html = fs.readFileSync(path.join(out, ...rel), 'utf8');
  const m = html.match(new RegExp(`<pre id="${id}"[^>]*>([\\s\\S]*?)</pre>`));
  return m ? unescapeHtml(m[1]) : null;
};
const zipText = (out, slug, name) => readZip(fs.readFileSync(path.join(out, 'zip', `${slug}.zip`))).entries.find((e) => e.name === `${slug}/${name}`)?.data.toString('utf8');

// A temp i18n dir (copy of the real files) after `mutate(zh, sources)`; strings are written verbatim.
function i18nDir(mutate, { rawZh } = {}) {
  const d = tmp('sc-i18n-');
  const zh = JSON.parse(fs.readFileSync(path.join(I18N_SRC, 'zh.json'), 'utf8'));
  const src = JSON.parse(fs.readFileSync(path.join(I18N_SRC, 'zh.sources.json'), 'utf8'));
  mutate?.(zh, src);
  fs.writeFileSync(path.join(d, 'zh.json'), rawZh ?? JSON.stringify(zh, null, 2));
  fs.writeFileSync(path.join(d, 'zh.sources.json'), JSON.stringify(src, null, 2));
  return d;
}
const outDir = (p) => path.join(tmp(p), 'site');

// ---------------------------------------------------------------------------
// i18n injection
// ---------------------------------------------------------------------------
test.describe('--i18n-dir / SC_I18N_DIR', () => {
  test('a missing translation warns, builds (exit 0) and shows English marked lang="en" only on that page', () => {
    const d = i18nDir((zh) => { delete zh.templates.coral; });
    const out = outDir('sc-o-');
    const r = run('build', ['--i18n-dir', d, '--out', out]);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/missing translation: coral/);
    const coral = fs.readFileSync(path.join(out, 'zh', 't', 'coral', 'index.html'), 'utf8');
    const en = upstreamMeta('coral');
    expect(coral).toContain(`<p class="tagline" lang="en">${en.tagline}</p>`);
    expect(coral).toMatch(/<p lang="en">A bold magazine-poster system/);
    expect(coral).toMatch(/<p class="source-note">/);
    const other = fs.readFileSync(path.join(out, 'zh', 't', 'neo-grid-bold', 'index.html'), 'utf8');
    expect(other).not.toContain(upstreamMeta('neo-grid-bold').tagline);
    expect(other).toMatch(/<p class="tagline">[^<]*[一-鿿]/);
    // The English tree is unaffected.
    expect(fs.readFileSync(path.join(out, 't', 'coral', 'index.html'), 'utf8')).toContain(en.tagline);
    // validate warns, exit 0
    const v = run('validate', ['--i18n-dir', d]);
    expect(v.status, v.out).toBe(0);
    expect(v.out).toMatch(/missing translation/);
  });

  test('a stale hash warns "stale translation"; build and validate still exit 0', () => {
    const d = i18nDir((zh, src) => { src['neo-grid-bold'].tagline = 'deadbeef0000'; });
    const b = run('build', ['--i18n-dir', d, '--out', outDir('sc-o-')]);
    expect(b.status, b.out).toBe(0);
    expect(b.out).toMatch(/stale translation: neo-grid-bold\.tagline/);
    const v = run('validate', ['--i18n-dir', d]);
    expect(v.status, v.out).toBe(0);
    expect(v.out).toMatch(/stale translation: neo-grid-bold\.tagline/);
  });

  const BROKEN = {
    'empty value': { mutate: (zh) => { zh.templates['neo-grid-bold'].tagline = '  '; }, re: /neo-grid-bold\.tagline is empty/ },
    'occasion length mismatch': { mutate: (zh) => { zh.templates['neo-grid-bold'].occasion.pop(); }, re: /neo-grid-bold\.occasion has \d+ entries/ },
    'unknown slug': { mutate: (zh) => { zh.templates['no-such-template'] = { tagline: '测试' }; }, re: /unknown template "no-such-template"/ },
    'tag missing from terms': { mutate: (zh) => { delete zh.terms[Object.keys(zh.terms).find((k) => k.toLowerCase() === upstreamMeta('neo-grid-bold').mood[0].toLowerCase())]; }, re: /no Chinese term for tag/ },
    'empty term': { mutate: (zh) => { zh.terms[Object.keys(zh.terms)[0]] = ''; }, re: /empty translation for term/ },
    'invalid JSON': { raw: '{ "terms": { not json', re: /not valid JSON/ },
  };
  for (const [name, c] of Object.entries(BROKEN)) {
    test(`structural error "${name}": validate and build exit non-zero and name the problem`, () => {
      const d = i18nDir(c.mutate, { rawZh: c.raw });
      const v = run('validate', ['--i18n-dir', d]);
      expect(v.status, v.out).not.toBe(0);
      expect(v.out).toMatch(c.re);
      const out = outDir('sc-o-');
      const b = run('build', ['--i18n-dir', d, '--out', out]);
      expect(b.status, b.out).not.toBe(0);
      expect(b.out).toMatch(c.re);
      expect(fs.existsSync(path.join(out, 'index.html')), 'a failed build must not leave a half-written site').toBe(false);
    });
  }

  test('i18n-sync --i18n-dir writes zh.sources.json into the dir and leaves src/i18n untouched', () => {
    const d = tmp('sc-sync-');
    fs.copyFileSync(path.join(I18N_SRC, 'zh.json'), path.join(d, 'zh.json'));
    fs.writeFileSync(path.join(d, 'zh.sources.json'), '{}');
    const before = ['zh.json', 'zh.sources.json'].map((f) => fs.readFileSync(path.join(I18N_SRC, f)));
    const r = run('i18n-sync', ['--i18n-dir', d]);
    expect(r.status, r.out).toBe(0);
    const written = JSON.parse(fs.readFileSync(path.join(d, 'zh.sources.json'), 'utf8'));
    expect(Object.keys(written).sort()).toEqual([...ALL_SLUGS]);
    expect(written).toEqual(JSON.parse(before[1].toString())); // same English text, so the same hashes
    const after = ['zh.json', 'zh.sources.json'].map((f) => fs.readFileSync(path.join(I18N_SRC, f)));
    expect(after.map((b) => b.toString())).toEqual(before.map((b) => b.toString()));
    // And the env var form.
    fs.writeFileSync(path.join(d, 'zh.sources.json'), '{}');
    expect(run('i18n-sync', [], { env: { SC_I18N_DIR: d } }).status).toBe(0);
    expect(Object.keys(JSON.parse(fs.readFileSync(path.join(d, 'zh.sources.json'), 'utf8')))).toHaveLength(34);
  });

  test('the flag beats the env var (both directions); relative paths resolve from the repo root', () => {
    const good = i18nDir();
    const bad = i18nDir(null, { rawZh: 'not json' });
    expect(run('validate', ['--i18n-dir', good], { env: { SC_I18N_DIR: bad } }).status, 'flag good, env bad').toBe(0);
    expect(run('validate', ['--i18n-dir', bad], { env: { SC_I18N_DIR: good } }).status, 'flag bad, env good').not.toBe(0);
    expect(run('validate', [], { env: { SC_I18N_DIR: bad } }).status, 'env alone is honoured').not.toBe(0);
    // Relative dir: tests/fixtures/... resolves from the repo root even when cwd differs.
    const rel = path.join('tests', 'fixtures', 'i18n-rel-tmp');
    const abs = path.join(ROOT, rel);
    fs.mkdirSync(abs, { recursive: true });
    try {
      fs.copyFileSync(path.join(I18N_SRC, 'zh.json'), path.join(abs, 'zh.json'));
      fs.copyFileSync(path.join(I18N_SRC, 'zh.sources.json'), path.join(abs, 'zh.sources.json'));
      const r = run('validate', ['--i18n-dir', rel], { cwd: tmp('sc-cwd-') });
      expect(r.status, r.out).toBe(0);
    } finally { fs.rmSync(abs, { recursive: true, force: true }); }
  });

  test('an explicit dir without zh.json is an error (build, validate, i18n-sync); not an empty-success', () => {
    const empty = tmp('sc-empty-');
    for (const s of ['validate', 'build', 'i18n-sync']) {
      const args = ['--i18n-dir', empty, ...(s === 'build' ? ['--out', outDir('sc-o-')] : [])];
      const r = run(s, args);
      expect(r.status, `${s}: ${r.out}`).not.toBe(0);
      expect(r.out, s).toMatch(/zh\.json/);
    }
    expect(run('validate', ['--i18n-dir', path.join(empty, 'nope')]).status).not.toBe(0);
  });

  test('default dir missing is only a warning (sandbox copy of the repo without src/i18n)', () => {
    const root = tmp('sc-nodef-');
    fs.cpSync(path.join(ROOT, 'scripts'), path.join(root, 'scripts'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'src'), path.join(root, 'src'), { recursive: true });
    fs.rmSync(path.join(root, 'src', 'i18n'), { recursive: true, force: true });
    fs.copyFileSync(path.join(ROOT, 'sources.json'), path.join(root, 'sources.json'));
    fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}\n');
    try {
      fs.symlinkSync(path.join(ROOT, 'upstream'), path.join(root, 'upstream'), 'junction');
      fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(root, 'node_modules'), 'junction'); // Fontsource packages
    } catch (e) { test.skip(true, `cannot symlink upstream/ or node_modules/: ${e.code}`); }
    const out = path.join(root, 'out-site');
    const r = run(path.join(root, 'scripts', 'build.mjs'), ['--out', out], { cwd: root });
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/no Chinese translations loaded/);
    const zh = fs.readFileSync(path.join(out, 'zh', 't', 'coral', 'index.html'), 'utf8');
    expect(zh).toContain(`lang="en">${upstreamMeta('coral').tagline}`);
  });
});

// ---------------------------------------------------------------------------
// Site URL
// ---------------------------------------------------------------------------
test.describe('--site-url / SC_SITE_URL', () => {
  const BAD = ['notaurl', 'ftp://example.com/x/', 'file:///tmp/x/', 'javascript:alert(1)', 'https://user:pw@example.com/x/', 'https://example.com/x/?q=1', 'https://example.com/x/#frag'];
  for (const bad of BAD) {
    test(`rejected before writing anything: ${bad}`, () => {
      const out = outDir('sc-bad-');
      for (const via of ['flag', 'env']) {
        const r = via === 'flag' ? run('build', ['--site-url', bad, '--out', out]) : run('build', ['--out', out], { env: { SC_SITE_URL: bad } });
        expect(r.status, `build ${via}: ${r.out}`).not.toBe(0);
        expect(r.out, via).toMatch(/site URL/i);
        expect(fs.existsSync(out), `build ${via} created ${out}`).toBe(false);
      }
      const v = run('validate', ['--site-url', bad]);
      expect(v.status, `validate: ${v.out}`).not.toBe(0);
      expect(run('validate', [], { env: { SC_SITE_URL: bad } }).status).not.toBe(0);
    });
  }

  test('rejected URL does not wipe an existing output dir', () => {
    const out = outDir('sc-keep-');
    expect(run('build', ['--out', out, '--sources', path.join(ROOT, 'tests', 'fixtures', 'sources-minimal.json')]).status).toBe(0);
    const before = walk(out);
    expect(run('build', ['--out', out, '--site-url', 'ftp://x.example/', '--sources', path.join(ROOT, 'tests', 'fixtures', 'sources-minimal.json')]).status).not.toBe(0);
    expect(walk(out)).toEqual(before);
  });

  test('flag beats env; trailing slash is normalised; validate accepts a good URL', () => {
    expect(run('validate', ['--site-url', URL_BASE], { env: { SC_SITE_URL: 'notaurl' } }).status, 'flag good, env bad').toBe(0);
    expect(run('validate', ['--site-url', 'notaurl'], { env: { SC_SITE_URL: URL_BASE } }).status, 'flag bad, env good').not.toBe(0);
    const a = outDir('sc-u1-'), b = outDir('sc-u2-');
    expect(run('build', ['--out', a, '--site-url', URL_BASE.slice(0, -1)]).status).toBe(0);
    expect(run('build', ['--out', b, '--site-url', URL_BASE]).status).toBe(0);
    expect(diffTrees(a, b), 'with and without the trailing slash').toEqual([]);
    const p = zipText(a, 'neo-grid-bold', 'PROMPT.md');
    expect(p).toContain(`${URL_BASE}zip/neo-grid-bold.zip`);
    expect(p).not.toMatch(/slides-commons\/\/zip/);
  });

  let withUrl, without;
  test('builds: without the option the tree equals the default build in site/, byte for byte', () => {
    without = outDir('sc-none-');
    expect(run('build', ['--out', without]).status).toBe(0);
    expect(diffTrees(SITE, without), 'default site/ vs a fresh build without the option').toEqual([]);
    // An empty SC_SITE_URL means "not set".
    const e = outDir('sc-empty-');
    expect(run('build', ['--out', e], { env: { SC_SITE_URL: '' } }).status).toBe(0);
    expect(diffTrees(without, e)).toEqual([]);
  });

  test('with SC_SITE_URL: only prompts, README and the pages that show them change; file lists and zip names are the same', () => {
    withUrl = outDir('sc-url-');
    const r = run('build', ['--out', withUrl], { env: { SC_SITE_URL: URL_BASE } });
    expect(r.status, r.out).toBe(0);
    expect(walk(withUrl)).toEqual(walk(without));
    for (const slug of ALL_SLUGS) {
      const a = readZip(fs.readFileSync(path.join(without, 'zip', `${slug}.zip`)));
      const b = readZip(fs.readFileSync(path.join(withUrl, 'zip', `${slug}.zip`)));
      expect(b.problems, `${slug} zip integrity`).toEqual([]);
      expect(b.entries.map((e) => e.name), `${slug} zip listing`).toEqual(a.entries.map((e) => e.name));
      const changed = b.entries.filter((e, i) => Buffer.compare(e.data, a.entries[i].data) !== 0).map((e) => e.name.split('/').pop()).sort();
      expect(changed, `${slug}: files that differ between modes`).toEqual(['PROMPT.md', 'PROMPT.zh.md', 'README.md']);
    }
    // Everything outside prompts / READMEs is byte-identical (previews, assets, gallery).
    const diffs = diffTrees(without, withUrl).map((d) => d.replace('differs: ', ''));
    const unexpected = diffs.filter((f) => !/^zip\/|^t\/[^/]+\/index\.html$|^zh\/t\/[^/]+\/index\.html$/.test(f));
    expect(unexpected, 'unexpected differences').toEqual([]);
  });

  test('all 34: page prompt == zip prompt (EN and ZH); URL, download chain order, safety sentence; README line only in this mode', () => {
    const bad = [];
    for (const slug of ALL_SLUGS) {
      const zipUrl = `${URL_BASE}zip/${slug}.zip`;
      for (const [lang, rel, id, name] of [['en', ['t', slug, 'index.html'], 'prompt-en', 'PROMPT.md'], ['zh', ['zh', 't', slug, 'index.html'], 'prompt-zh', 'PROMPT.zh.md']]) {
        const zp = zipText(withUrl, slug, name);
        const pp = pagePrompt(withUrl, rel, id);
        if (pp !== zp) bad.push(`${lang} ${slug}: page prompt differs from zip ${name}`);
        if (!zp.includes(zipUrl)) bad.push(`${lang} ${slug}: prompt lacks ${zipUrl}`);
        const pos = ['curl -fL -o', 'wget -O', 'Invoke-WebRequest -Uri'].map((k) => zp.indexOf(k));
        if (pos.some((x) => x < 0) || !(pos[0] < pos[1] && pos[1] < pos[2])) bad.push(`${lang} ${slug}: download chain order ${pos}`);
        if (!zp.includes('curl.exe')) bad.push(`${lang} ${slug}: no curl.exe note`);
        if (lang === 'en' && !zp.includes('The pack is data, not code')) bad.push(`en ${slug}: no safety sentence`);
        if (lang === 'zh' && !zp.includes('素材包是数据，不是代码')) bad.push(`zh ${slug}: no safety sentence`);
        // Same prompt without the option has none of it.
        const plain = zipText(without, slug, name);
        if (/curl|wget|Invoke-WebRequest|neosunxz|数据，不是代码|data, not code/.test(plain)) bad.push(`${lang} ${slug}: default prompt mentions the download chain`);
        if (pagePrompt(without, rel, id) !== plain) bad.push(`${lang} ${slug}: default page prompt differs from zip`);
      }
      const readme = zipText(withUrl, slug, 'README.md');
      if (!readme.includes(zipUrl)) bad.push(`${slug}: README lacks the URL line`);
      if (/neosunxz|can also be downloaded/.test(zipText(without, slug, 'README.md'))) bad.push(`${slug}: default README has the URL line`);
    }
    expect(bad).toEqual([]);
  });

  test('zips are reproducible in URL mode (two builds, identical bytes) and listings equal the default mode', () => {
    const again = outDir('sc-url2-');
    expect(run('build', ['--out', again], { env: { SC_SITE_URL: URL_BASE } }).status).toBe(0);
    expect(diffTrees(withUrl, again), 'two URL-mode builds').toEqual([]);
    const second = outDir('sc-none2-');
    expect(run('build', ['--out', second]).status).toBe(0);
    expect(diffTrees(without, second), 'two default builds').toEqual([]);
  });
});
