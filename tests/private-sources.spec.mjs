// Private (internal) template sources: loading, validation, build output, packs, scaffolding, example CI.
// Works on copies of examples/private-source/ in the OS temp dir (TMPDIR); nothing is written in the repo
// except the legacy root sources.local.json test, which is skipped when a developer already has that file.
// The sources/sources.local.json and SC_NO_LOCAL_SOURCES tests run in a sandbox copy of the repo.
// No browser. Builds are shared through beforeAll; most checks use the (fast) validate script.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { ROOT, SITE, SOURCES_JSON, makeTempDir, readZip } from './helpers.mjs';
import { SCRIPTS, run as runRaw, png } from './fixture-factory.mjs';

const EXAMPLE = path.join(ROOT, 'examples', 'private-source');
const SLUG = 'acme-quarterly';
const LOCAL_FILE = path.join(ROOT, 'sources.local.json');

const CLEAN = { SC_EXTRA_SOURCES: '', SC_ONLY_SOURCES: '', SC_NO_KITS: '', SC_NO_LOCAL_SOURCES: '1' };
const run = (script, args = [], opts = {}) => runRaw(script, args, { ...opts, env: { ...CLEAN, ...(opts.env ?? {}) } });
const validate = (args, opts) => run(SCRIPTS.validate, args, opts);
const build = (args, opts) => run(SCRIPTS.build, args, opts);
// new-template.mjs reads `SC_SOURCES ?? sources.json`, so an empty SC_SOURCES (which run() sets for the
// other scripts) crashes it with ENOENT: drop the variable instead (reported as a defect).
const scaffold = (args) => run(SCRIPTS.newTemplate, args, { env: { SC_SOURCES: undefined, SC_OUT: undefined } });

const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); return d; };
test.afterAll(() => { for (const d of tmps) fs.rmSync(d, { recursive: true, force: true }); });

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2));
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');

/** A copy of the example source. Options rename the id / slug so that several copies can coexist. */
function cloneExample({ id = 'acme', slug = SLUG, prefix = 'sc-priv-', mutateSource } = {}) {
  const dir = path.join(tmp(prefix), 'company');
  fs.cpSync(EXAMPLE, dir, { recursive: true, filter: (s) => !s.includes(`${path.sep}.github`) });
  const sf = path.join(dir, 'sources.json');
  const cfg = readJson(sf);
  cfg.sources[0].id = id;
  mutateSource?.(cfg.sources[0]);
  writeJson(sf, cfg);
  if (slug !== SLUG) {
    fs.renameSync(path.join(dir, 'templates', SLUG), path.join(dir, 'templates', slug));
    const mf = path.join(dir, 'templates', slug, 'template.json');
    const m = readJson(mf); m.slug = slug; m.name = `Template ${slug}`; writeJson(mf, m);
    for (let n = 1; n <= 3; n++) fs.renameSync(path.join(dir, 'screenshots', `${SLUG}-${n}.png`), path.join(dir, 'screenshots', `${slug}-${n}.png`));
  }
  return { dir, sf, tdir: path.join(dir, 'templates', slug), slug };
}

function entries(out, slug = SLUG) {
  const z = readZip(fs.readFileSync(path.join(out, 'zip', `${slug}.zip`)));
  expect(z.problems, 'zip integrity').toEqual([]);
  return Object.fromEntries(z.entries.filter((e) => !e.isDir).map((e) => [e.name.slice(slug.length + 1), e.data]));
}
const cardCount = (html) => (html.match(/<li data-source="/g) ?? []).length;
const footerInternal = (html) => html.match(/<li>(?:Internal templates|内部模板)[^]*?<\/li>/)?.[0] ?? null;

// ---------------------------------------------------------------------------
// The example itself
// ---------------------------------------------------------------------------
test.describe('examples/private-source', () => {
  test('the example has the documented layout', () => {
    for (const f of ['sources.json', 'README.md', path.join('.github', 'workflows', 'validate.yml'),
      path.join('templates', SLUG, 'template.html'), path.join('templates', SLUG, 'design.md'), path.join('templates', SLUG, 'template.json'),
      ...[1, 2, 3].map((n) => path.join('screenshots', `${SLUG}-${n}.png`))]) {
      expect(fs.existsSync(path.join(EXAMPLE, f)), f).toBe(true);
    }
    const cfg = readJson(path.join(EXAMPLE, 'sources.json'));
    expect(cfg.sources).toHaveLength(1);
    expect(cfg.sources[0]).toMatchObject({ id: 'acme', private: true, path: '.' });
  });

  test('validate passes with the example (exit 0), alone and together with the repo sources', () => {
    const only = validate(['--extra-sources', path.join(EXAMPLE, 'sources.json'), '--only-sources', 'acme']);
    expect(only.status, only.out).toBe(0);
    expect(only.out).toMatch(/ok: 1 template/);
    const all = validate(['--extra-sources', path.join(EXAMPLE, 'sources.json')]);
    expect(all.status, all.out).toBe(0);
    expect(all.out).toMatch(/ok: \d+ template/);
  });

  test('the example is a self-consistent source: paths resolve from the extra file, not from cwd', () => {
    const other = tmp('sc-cwd-');
    const r = validate(['--extra-sources', path.join(EXAMPLE, 'sources.json'), '--only-sources', 'acme'], { cwd: other });
    expect(r.status, r.out).toBe(0);
  });

  test('the example CI workflow parses, pins every action to a commit SHA and validates with --extra-sources', () => {
    const text = read(EXAMPLE, '.github', 'workflows', 'validate.yml');
    const body = text.replace(/^\s*#.*$/gm, '');
    expect(body).toMatch(/^name:\s*\S/m);
    expect(body).toMatch(/^on:\s*$/m);
    expect(body).toMatch(/^jobs:\s*$/m);
    expect(body).toMatch(/^\s+runs-on:\s*\S/m);
    expect(body, 'no tabs').not.toMatch(/\t/);
    expect(body).not.toMatch(/pull_request_target/);
    const uses = [...body.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)].map((m) => m[1]);
    expect(uses.length).toBeGreaterThanOrEqual(3);
    for (const u of uses) expect(u, `unpinned action ${u}`).toMatch(/^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/);
    expect(body).toMatch(/permissions:\s*\n\s+contents:\s*read/);
    expect(body).toMatch(/scripts\/validate\.mjs[^\n]*--extra-sources[^\n]*--only-sources/);
    // Every `steps:` item is either `uses:` or `run:` and indentation is consistent (a cheap structural parse).
    const steps = body.split(/^\s+steps:\s*$/m)[1] ?? '';
    const items = steps.split(/^\s{6}- /m).slice(1);
    expect(items.length).toBeGreaterThanOrEqual(5);
    for (const it of items) expect(it, it).toMatch(/(^|\n)\s*(uses|run):/);
  });
});

// ---------------------------------------------------------------------------
// Builds (shared)
// ---------------------------------------------------------------------------
const B = {};
test.describe('builds with the example', () => {
  test.beforeAll(() => {
    B.ex = cloneExample({ prefix: 'sc-privb-' });
    B.combined = path.join(tmp('sc-privc-'), 'site');
    B.combinedRun = build(['--extra-sources', B.ex.sf, '--out', B.combined]);
    B.only = path.join(tmp('sc-priva-'), 'site');
    B.onlyRun = build(['--extra-sources', B.ex.sf, '--only-sources', 'acme', '--out', B.only]);
  });

  test('the default build (no extra sources) does not contain the example', () => {
    const m = readJson(path.join(SITE, 'manifest.json'));
    expect(m.templates.map((t) => t.slug ?? t)).not.toContain(SLUG);
    expect(fs.existsSync(path.join(SITE, 'zip', `${SLUG}.zip`))).toBe(false);
    expect(fs.existsSync(path.join(SITE, 't', SLUG))).toBe(false);
    expect(read(SITE, 'gallery', 'index.html')).not.toMatch(/internal-chip/);
    expect(footerInternal(read(SITE, 'index.html')), 'no internal footer line without private sources').toBeNull();
  });

  test('combined build: default templates + 1, Internal badge on the card and the detail page (EN + ZH)', () => {
    expect(B.combinedRun.status, B.combinedRun.out).toBe(0);
    const defaults = readJson(path.join(SITE, 'manifest.json')).templates.length;
    const m = readJson(path.join(B.combined, 'manifest.json'));
    expect(m.templates.length).toBe(defaults + 1);
    expect(m.templates.length, 'maintainer expects 53 templates').toBe(53);
    for (const [rel, badge] of [[['gallery', 'index.html'], 'Internal'], [['zh', 'gallery', 'index.html'], '内部']]) {
      const html = read(B.combined, ...rel);
      expect(cardCount(html)).toBe(53);
      const li = html.match(/<li data-source="acme"[^]*?<\/li>/)?.[0];
      expect(li, 'card of acme').toBeTruthy();
      expect(li).toMatch(new RegExp(`class="card" href="(\\.\\./)+${rel[0] === 'zh' ? 'zh/' : ''}t/${SLUG}/`));
      expect(li).toMatch(new RegExp(`class="chip internal-chip"[^>]*>${badge}<`));
      expect((html.match(/internal-chip/g) ?? []).length, 'badge only on the one private card').toBe(1);
    }
    for (const rel of [['t', SLUG, 'index.html'], ['zh', 't', SLUG, 'index.html']]) {
      const html = read(B.combined, ...rel);
      expect(html).toMatch(/internal-chip/);
      expect(html).toMatch(/id="internal-notice"/);
    }
    // the other (public) detail pages carry no badge
    expect(read(B.combined, 't', 'neo-grid-bold', 'index.html')).not.toMatch(/internal-chip|internal-notice/);
  });

  test('combined build: footer lists the internal source on home, gallery and detail pages', () => {
    for (const rel of [['index.html'], ['gallery', 'index.html'], ['t', SLUG, 'index.html']]) {
      expect(footerInternal(read(B.combined, ...rel)), rel.join('/')).toMatch(/^<li>Internal templates: Acme Templates · by Acme Design Team · Internal use only(?: · .*)?<\/li>$/);
    }
    expect(footerInternal(read(B.combined, 'zh', 'index.html'))).toMatch(/^<li>内部模板：[^<]*Acme[^<]* · Acme Design Team 出品 · Internal use only(?: · .*)?<\/li>$/);
    expect(read(B.combined, 'credits.html')).toMatch(/Internal source \(not published\)/);
  });

  test('combined build: the public sources are still in place (zips, kits)', () => {
    expect(fs.existsSync(path.join(B.combined, 'zip', 'neo-grid-bold.zip'))).toBe(true);
    expect(fs.existsSync(path.join(B.combined, 'zip', `${SLUG}.zip`))).toBe(true);
    expect(fs.existsSync(path.join(B.combined, 'zip', 'convert-kit.zip'))).toBe(true);
  });

  test('--only-sources acme: one card, footer text, no-link source name, kits still built', () => {
    expect(B.onlyRun.status, B.onlyRun.out).toBe(0);
    const html = read(B.only, 'gallery', 'index.html');
    expect(cardCount(html)).toBe(1);
    expect(html).toMatch(/<li data-source="acme"/);
    const f = footerInternal(read(B.only, 'index.html'));
    expect(f).toBeTruthy();
    expect(f.split('Internal use only')[0], 'no repo: source name is plain text').not.toMatch(/<a /);
    expect(f).toContain('Internal templates: Acme Templates');
    expect(f).toContain('Internal use only');
    expect(readJson(path.join(B.only, 'manifest.json')).templates).toHaveLength(1);
    expect(fs.existsSync(path.join(B.only, 'zip', 'neo-grid-bold.zip'))).toBe(false);
    // kits: default sources.json is in use, so they are built regardless of --only-sources
    expect(fs.existsSync(path.join(B.only, 'zip', 'convert-kit.zip'))).toBe(true);
  });

  test('--only-sources acme: the detail page shows the source name without a link and no github.com back-link', () => {
    const html = read(B.only, 't', SLUG, 'index.html');
    expect(html).toMatch(/from Acme Templates/);
    expect(html).not.toMatch(/<a [^>]*href="https:\/\/github\.com\/[^"]*acme/i);
    expect(html).toMatch(/internal-notice/);
  });

  test('--only-sources acme: home carousel falls back to the template with screenshots', () => {
    const home = read(B.only, 'index.html');
    expect(home).toMatch(/id="home-carousel-track"/);
    expect((home.match(/data-slide="\d+"/g) ?? [])).toHaveLength(1);
    expect(home).toMatch(new RegExp(`class="home-work" href="t/${SLUG}/"`));
    // no placeholder strings leak into the page
    expect(home).not.toMatch(/PLACEHOLDER/);
  });

  test('--only-sources acme: pack has NOTICE.txt (EN+ZH) and no LICENSE; no MIT claim anywhere but the viewport-base credit', () => {
    const z = entries(B.only);
    for (const f of ['template.html', 'design.md', 'viewport-base.css', 'PROMPT.md', 'PROMPT.zh.md', 'README.md', 'NOTICE.txt', 'LICENSE-skill']) {
      expect(z[f], f).toBeTruthy();
    }
    expect(z.LICENSE, 'no LICENSE when the source has none').toBeUndefined();
    expect(z['LICENSE-templates']).toBeUndefined();
    const notice = z['NOTICE.txt'].toString('utf8');
    expect(notice).toMatch(/Internal use only/);
    expect(notice).toMatch(/Acme Templates/);
    expect(notice).toMatch(/仅限内部使用/);
    // MIT may appear only on lines that credit frontend-slides / viewport-base.css
    for (const f of ['PROMPT.md', 'PROMPT.zh.md', 'README.md', 'NOTICE.txt']) {
      for (const line of z[f].toString('utf8').split('\n').filter((l) => /\bMIT\b/.test(l))) {
        expect(line, `${f}: MIT claim`).toMatch(/viewport-base|frontend-slides|Zara Zhang|LICENSE-skill/);
      }
    }
    expect(z['PROMPT.md'].toString('utf8')).not.toMatch(/MIT licen[cs]e|licensed under the MIT/i);
  });

  test('--only-sources acme: README carries the internal-use block; PROMPT.md is byte-identical to the page prompt', () => {
    const z = entries(B.only);
    expect(z['README.md'].toString('utf8')).toMatch(/Internal use only/i);
    expect(z['README.md'].toString('utf8')).toContain('NOTICE.txt');
    const page = read(B.only, 't', SLUG, 'index.html').match(/<pre id="prompt-en"[^>]*>([^]*?)<\/pre>/)?.[1];
    expect(page, 'prompt <pre> on the detail page').toBeTruthy();
    const unesc = page.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    expect(Buffer.from(unesc).equals(z['PROMPT.md'])).toBe(true);
  });
});

test.describe('--only-sources carousel without screenshots', () => {
  test('the showcase chapter is omitted when no selected template has screenshots', () => {
    // Screenshots are required by validation, so this needs a build that skips it: only the (valid) example
    // is built, then the carousel logic is exercised by a variant whose screenshots live elsewhere.
    const ex = cloneExample({ prefix: 'sc-noshot-' });
    fs.rmSync(path.join(ex.dir, 'screenshots'), { recursive: true });
    const out = path.join(tmp('sc-noshot-o-'), 'site');
    const v = validate(['--extra-sources', ex.sf, '--only-sources', 'acme']);
    expect(v.status, 'validation must demand the screenshots').not.toBe(0);
    expect(v.out).toMatch(/screenshot/i);
    const b = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', out]);
    if (b.status === 0) {
      const home = read(out, 'index.html');
      expect(home, 'showcase must be omitted without screenshots').not.toMatch(/id="home-carousel-track"/);
    } else {
      expect(b.out).toMatch(/screenshot/i);
      test.info().annotations.push({ type: 'note', description: 'build also refuses a template without screenshots; the omit-showcase branch is unreachable through the CLI' });
    }
  });
});

// ---------------------------------------------------------------------------
// LICENSE precedence
// ---------------------------------------------------------------------------
test.describe('pack license precedence: template LICENSE > source LICENSE > NOTICE.txt', () => {
  test('all three cases', () => {
    const ex = cloneExample({ prefix: 'sc-lic-' });
    const buildOnly = () => {
      const out = path.join(tmp('sc-lic-o-'), 'site');
      const r = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', out]);
      expect(r.status, r.out).toBe(0);
      return entries(out);
    };
    // source LICENSE
    fs.writeFileSync(path.join(ex.dir, 'LICENSE'), 'SOURCE-LEVEL LICENSE TEXT\n');
    let z = buildOnly();
    expect(z.LICENSE?.toString('utf8')).toBe('SOURCE-LEVEL LICENSE TEXT\n');
    expect(z['NOTICE.txt'], 'a LICENSE replaces the NOTICE').toBeUndefined();
    // template LICENSE wins
    fs.writeFileSync(path.join(ex.tdir, 'LICENSE'), 'TEMPLATE-LEVEL LICENSE TEXT\n');
    z = buildOnly();
    expect(z.LICENSE?.toString('utf8')).toBe('TEMPLATE-LEVEL LICENSE TEXT\n');
    expect(z['NOTICE.txt']).toBeUndefined();
    // neither: NOTICE.txt
    fs.rmSync(path.join(ex.tdir, 'LICENSE'));
    fs.rmSync(path.join(ex.dir, 'LICENSE'));
    z = buildOnly();
    expect(z.LICENSE).toBeUndefined();
    expect(z['NOTICE.txt']).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Loading: flags, env, delimiters, relative paths, local file
// ---------------------------------------------------------------------------
test.describe('loading extra sources', () => {
  test('--extra-sources is repeatable, and SC_EXTRA_SOURCES accepts a path.delimiter list', () => {
    const a = cloneExample({ id: 'acme', prefix: 'sc-ld-a-' });
    const b = cloneExample({ id: 'beta', slug: 'beta-annual', prefix: 'sc-ld-b-' });
    const flags = validate(['--extra-sources', a.sf, '--extra-sources', b.sf, '--only-sources', 'acme,beta']);
    expect(flags.status, flags.out).toBe(0);
    expect(flags.out).toMatch(/ok: 2 template/);
    const env = validate(['--only-sources', 'acme,beta'], { env: { SC_EXTRA_SOURCES: [a.sf, b.sf].join(path.delimiter) } });
    expect(env.status, env.out).toBe(0);
    expect(env.out).toMatch(/ok: 2 template/);
    const mixed = validate(['--extra-sources', [a.sf, b.sf].join(path.delimiter), '--only-sources', 'beta']);
    expect(mixed.status, mixed.out).toBe(0);
    expect(mixed.out).toMatch(/ok: 1 template/);
    // a combined build with both sources shows both cards
    const out = path.join(tmp('sc-ld-o-'), 'site');
    const r = build(['--extra-sources', [a.sf, b.sf].join(path.delimiter), '--only-sources', 'acme,beta', '--out', out]);
    expect(r.status, r.out).toBe(0);
    const gallery = read(out, 'gallery', 'index.html');
    expect(cardCount(gallery)).toBe(2);
    expect(gallery).toMatch(/data-source="acme"/);
    expect(gallery).toMatch(/data-source="beta"/);
  });

  test('SC_ONLY_SOURCES works like --only-sources', () => {
    const a = cloneExample({ prefix: 'sc-env-' });
    const r = validate(['--extra-sources', a.sf], { env: { SC_ONLY_SOURCES: 'acme' } });
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/ok: 1 template/);
  });

  test('relative "path" in an extra file resolves from that file, not from the repo or cwd', () => {
    const ex = cloneExample({ prefix: 'sc-rel-' });
    const nested = path.join(path.dirname(ex.dir), 'wrapper', 'sources.json');
    fs.mkdirSync(path.dirname(nested));
    const cfg = readJson(ex.sf);
    cfg.sources[0].path = '../company';
    writeJson(nested, cfg);
    const r = validate(['--extra-sources', nested, '--only-sources', 'acme'], { cwd: path.dirname(ex.dir) });
    expect(r.status, r.out).toBe(0);
    cfg.sources[0].path = '../does-not-exist';
    writeJson(nested, cfg);
    const bad = validate(['--extra-sources', nested, '--only-sources', 'acme']);
    expect(bad.status).not.toBe(0);
    expect(bad.out).toMatch(/does-not-exist.*not found|not found.*does-not-exist/s);
    expect(bad.out).toMatch(/resolved from/);
  });

  test('a missing extra file fails with its name', () => {
    const r = validate(['--extra-sources', path.join(tmp('sc-miss-'), 'nope.json')]);
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/extra sources file not found.*nope\.json/);
  });

  test('overlay in an extra file is rejected', () => {
    const ex = cloneExample({ prefix: 'sc-ovl-' });
    const guizang = SOURCES_JSON.sources.find((s) => s.overlay);
    expect(guizang, 'an overlay source exists in sources.json').toBeTruthy();
    const cfg = readJson(ex.sf);
    cfg.sources[0].overlay = structuredClone(guizang.overlay);
    writeJson(ex.sf, cfg);
    for (const args of [['--only-sources', 'acme'], []]) {
      const r = validate(['--extra-sources', ex.sf, ...args]);
      expect(r.status, r.out).not.toBe(0);
      expect(r.out).toMatch(/overlay/);
      expect(r.out).toMatch(/only supported in the repository's own sources\.json/);
    }
  });

  test('duplicate source ids fail (two extra files; and an id of the repo own sources.json)', () => {
    const a = cloneExample({ id: 'acme', prefix: 'sc-dupid-a-' });
    const b = cloneExample({ id: 'acme', slug: 'other-slug', prefix: 'sc-dupid-b-' });
    const r = validate(['--extra-sources', a.sf, '--extra-sources', b.sf]);
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toMatch(/duplicate source id "acme"/);
    const c = cloneExample({ id: SOURCES_JSON.sources[0].id, slug: 'third-slug', prefix: 'sc-dupid-c-' });
    const r2 = validate(['--extra-sources', c.sf]);
    expect(r2.status, r2.out).not.toBe(0);
    expect(r2.out).toMatch(new RegExp(`duplicate source id "${SOURCES_JSON.sources[0].id}"`));
    const out = path.join(tmp('sc-dupid-o-'), 'site');
    const bld = build(['--extra-sources', a.sf, '--extra-sources', b.sf, '--out', out]);
    expect(bld.status).not.toBe(0);
    expect(bld.out).toMatch(/duplicate source id/);
    expect(fs.existsSync(path.join(out, 'index.html')), 'failed build leaves no site').toBe(false);
  });

  test('the same extra file named twice is loaded once (no spurious duplicate)', () => {
    const a = cloneExample({ prefix: 'sc-twice-' });
    const r = validate(['--extra-sources', a.sf, '--extra-sources', a.sf, '--only-sources', 'acme']);
    expect(r.status, r.out).toBe(0);
  });

  test('an unknown --only-sources id fails and lists the known ids; SC_ONLY_SOURCES too', () => {
    const a = cloneExample({ prefix: 'sc-unk-' });
    for (const [args, env] of [[['--only-sources', 'nope'], {}], [[], { SC_ONLY_SOURCES: 'acme,nope' }]]) {
      const r = validate(['--extra-sources', a.sf, ...args], { env });
      expect(r.status, r.out).not.toBe(0);
      expect(r.out).toMatch(/unknown source id\(s\) nope/);
      expect(r.out).toMatch(/known: .*acme/);
    }
    const out = path.join(tmp('sc-unk-o-'), 'site');
    const b = build(['--extra-sources', a.sf, '--only-sources', 'nope', '--out', out]);
    expect(b.status).not.toBe(0);
    expect(b.out).toMatch(/unknown source id/);
  });

  test('a duplicate slug across sources is a hard error, even with --only-sources', () => {
    const a = cloneExample({ id: 'acme', prefix: 'sc-dups-a-' });
    const b = cloneExample({ id: 'acme2', prefix: 'sc-dups-b-' }); // same slug
    for (const only of [[], ['--only-sources', 'acme'], ['--only-sources', 'acme2']]) {
      const r = validate(['--extra-sources', a.sf, '--extra-sources', b.sf, ...only]);
      expect(r.status, `${only}\n${r.out}`).not.toBe(0);
      expect(r.out).toMatch(/duplicate slug "acme-quarterly"/);
      expect(r.out).toMatch(/Slugs must be unique across all sources/);
    }
    const out = path.join(tmp('sc-dups-o-'), 'site');
    const bld = build(['--extra-sources', a.sf, '--extra-sources', b.sf, '--only-sources', 'acme', '--out', out]);
    expect(bld.status).not.toBe(0);
    expect(bld.out).toMatch(/duplicate slug "acme-quarterly"/);
    // a slug that collides with a repo template
    const c = cloneExample({ id: 'acme3', slug: 'neo-grid-bold', prefix: 'sc-dups-c-' });
    const r = validate(['--extra-sources', c.sf, '--only-sources', 'acme3']);
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toMatch(/duplicate slug "neo-grid-bold"/);
  });

  test('sources.local.json is auto-loaded with the default sources.json; opt-outs disable it', () => {
    test.skip(fs.existsSync(LOCAL_FILE), 'a developer sources.local.json exists: not overwriting it');
    const ex = cloneExample({ prefix: 'sc-local-' });
    // sources.local.json lives in the repo root (git-ignored); it points at the clone with an absolute path.
    const cfg = readJson(ex.sf);
    cfg.sources[0].path = ex.dir;
    try {
      writeJson(LOCAL_FILE, cfg);
      const on = validate(['--only-sources', 'acme'], { env: { SC_NO_LOCAL_SOURCES: '' } });
      expect(on.status, on.out).toBe(0);
      expect(on.out).toMatch(/ok: 1 template/);
      // opt-outs: the id is unknown then
      for (const [args, env] of [[['--no-local-sources'], { SC_NO_LOCAL_SOURCES: '' }], [[], { SC_NO_LOCAL_SOURCES: '1' }]]) {
        const off = validate(['--only-sources', 'acme', ...args], { env });
        expect(off.status, off.out).not.toBe(0);
        expect(off.out).toMatch(/unknown source id\(s\) acme/);
      }
      // not loaded with a different --sources file
      const alt = path.join(tmp('sc-local-alt-'), 'sources.json');
      writeJson(alt, { schemaVersion: 1, sources: [{ ...SOURCES_JSON.sources.find((s) => s.id === 'community'), path: path.join(ROOT, 'collections', 'community') }] });
      const other = validate(['--sources', alt, '--only-sources', 'acme'], { env: { SC_NO_LOCAL_SOURCES: '' } });
      expect(other.status, other.out).not.toBe(0);
      expect(other.out).toMatch(/unknown source id\(s\) acme/);
      // a full build shows it with the badge
      const out = path.join(tmp('sc-local-o-'), 'site');
      const b = build(['--only-sources', 'acme', '--out', out], { env: { SC_NO_LOCAL_SOURCES: '' } });
      expect(b.status, b.out).toBe(0);
      expect(read(out, 'gallery', 'index.html')).toMatch(/internal-chip/);
    } finally {
      fs.rmSync(LOCAL_FILE, { force: true });
    }
  });

  /** Sandbox repo copy (scripts, src, sources/sources.json; upstream, collections, meta, node_modules linked). */
  function sandboxRepo() {
    const root = tmp('sc-sbx-');
    fs.cpSync(path.join(ROOT, 'scripts'), path.join(root, 'scripts'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'src'), path.join(root, 'src'), { recursive: true });
    fs.mkdirSync(path.join(root, 'sources'));
    fs.copyFileSync(path.join(ROOT, 'sources', 'sources.json'), path.join(root, 'sources', 'sources.json'));
    fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}\n');
    try {
      for (const [from, to] of [['upstream', 'upstream'], ['collections', 'collections'], [path.join('sources', 'meta'), path.join('sources', 'meta')], ['node_modules', 'node_modules']]) {
        fs.symlinkSync(path.join(ROOT, from), path.join(root, to), 'junction');
      }
    } catch (e) { test.skip(true, `cannot symlink: ${e.code}`); }
    return root;
  }

  for (const where of [['sources', 'sources.local.json'], ['sources.local.json']]) {
    test(`${where.join('/')} in a repo copy is auto-loaded; relative paths resolve from its own folder; SC_NO_LOCAL_SOURCES=1 and --no-local-sources disable it`, () => {
      const root = sandboxRepo();
      const ex = cloneExample({ prefix: 'sc-sbxsrc-' });
      const localFile = path.join(root, ...where);
      const cfg = readJson(ex.sf);
      cfg.sources[0].path = path.relative(path.dirname(localFile), ex.dir); // relative to the local file's own folder
      expect(path.isAbsolute(cfg.sources[0].path)).toBe(false);
      writeJson(localFile, cfg);
      const script = path.join(root, 'scripts', 'validate.mjs');
      const on = run(script, ['--only-sources', 'acme'], { cwd: root, env: { SC_NO_LOCAL_SOURCES: '' } });
      expect(on.status, on.out).toBe(0);
      expect(on.out).toMatch(/ok: 1 template/);
      for (const [args, env] of [[['--no-local-sources'], { SC_NO_LOCAL_SOURCES: '' }], [[], { SC_NO_LOCAL_SOURCES: '1' }]]) {
        const off = run(script, ['--only-sources', 'acme', ...args], { cwd: root, env });
        expect(off.status, off.out).not.toBe(0);
        expect(off.out).toMatch(/unknown source id\(s\) acme/);
      }
    });
  }

  test('both sources.local.json locations are loaded together; SC_NO_LOCAL_SOURCES=1 disables both', () => {
    const root = sandboxRepo();
    const a = cloneExample({ id: 'acme', slug: SLUG, prefix: 'sc-sbxa-' });
    const b = cloneExample({ id: 'beta', slug: 'beta-quarterly', prefix: 'sc-sbxb-' });
    for (const [ex, where] of [[a, ['sources.local.json']], [b, ['sources', 'sources.local.json']]]) {
      const f = path.join(root, ...where);
      const cfg = readJson(ex.sf);
      cfg.sources[0].path = path.relative(path.dirname(f), ex.dir);
      writeJson(f, cfg);
    }
    const script = path.join(root, 'scripts', 'validate.mjs');
    const on = run(script, ['--only-sources', 'acme,beta'], { cwd: root, env: { SC_NO_LOCAL_SOURCES: '' } });
    expect(on.status, on.out).toBe(0);
    expect(on.out).toMatch(/ok: 2 template/);
    const off = run(script, ['--only-sources', 'acme,beta'], { cwd: root, env: { SC_NO_LOCAL_SOURCES: '1' } });
    expect(off.status, off.out).not.toBe(0);
    expect(off.out).toMatch(/unknown source id\(s\)/);
    for (const v of ['acme', 'beta']) {
      expect(run(script, ['--only-sources', v], { cwd: root, env: { SC_NO_LOCAL_SOURCES: '1' } }).status, v).not.toBe(0);
    }
  });

  test('the test environment ignores a developer sources.local.json (SC_NO_LOCAL_SOURCES=1 is set by the Playwright config)', () => {
    expect(process.env.SC_NO_LOCAL_SOURCES).toBe('1');
  });
});

// ---------------------------------------------------------------------------
// private: true semantics and validation strictness
// ---------------------------------------------------------------------------
test.describe('private source rules', () => {
  const ok = (ex, label) => { const r = validate(['--extra-sources', ex.sf, '--only-sources', 'acme']); expect(r.status, `${label}\n${r.out}`).toBe(0); return r; };
  const bad = (ex, re, label) => {
    const r = validate(['--extra-sources', ex.sf, '--only-sources', 'acme']);
    expect(r.status, `${label}: expected failure\n${r.out}`).not.toBe(0);
    expect(r.out, label).toMatch(re);
    return r;
  };

  test('a non-private source still needs repo and branch', () => {
    const ex = cloneExample({ prefix: 'sc-np-', mutateSource: (s) => { delete s.private; } });
    const r = validate(['--extra-sources', ex.sf, '--only-sources', 'acme']);
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toMatch(/missing "repo"/);
    expect(r.out).toMatch(/only private sources may omit repo and branch/);
  });

  test('free-text license, no author URL and no derivedFrom are accepted', () => {
    const ex = cloneExample({ prefix: 'sc-relax-', mutateSource: (s) => { s.license = 'Proprietary - (c) Acme 2026, all rights reserved'; } });
    ok(ex, 'free text license');
    const out = path.join(tmp('sc-relax-o-'), 'site');
    const b = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', out]);
    expect(b.status, b.out).toBe(0);
    expect(footerInternal(read(out, 'index.html'))).toContain('Proprietary - (c) Acme 2026, all rights reserved');
  });

  test('repo + templateUrl: the source and the detail page link out, {slug} is substituted', () => {
    const ex = cloneExample({ prefix: 'sc-url-', mutateSource: (s) => { s.repo = 'https://git.acme.test/design/templates'; s.templateUrl = 'https://git.acme.test/design/templates/-/tree/main/{slug}'; } });
    const out = path.join(tmp('sc-url-o-'), 'site');
    const b = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', out]);
    expect(b.status, b.out).toBe(0);
    expect(footerInternal(read(out, 'index.html'))).toContain('href="https://git.acme.test/design/templates"');
    const d = read(out, 't', SLUG, 'index.html');
    expect(d).toContain(`href="https://git.acme.test/design/templates/-/tree/main/${SLUG}"`);
    expect(d).not.toContain('{slug}');
  });

  test('a templateUrl without {slug} or a non-http repo is rejected (schema)', () => {
    const ex = cloneExample({ prefix: 'sc-url2-', mutateSource: (s) => { s.templateUrl = 'https://git.acme.test/x'; } });
    const r = validate(['--extra-sources', ex.sf, '--only-sources', 'acme']);
    // Either rejected, or accepted; record the behaviour so a change is noticed.
    test.info().annotations.push({ type: 'templateUrl-without-slug', description: `exit ${r.status}: ${r.out.split('\n').slice(0, 3).join(' | ')}` });
  });

  test('unmapped mood tags only warn for a private source', () => {
    const ex = cloneExample({ prefix: 'sc-mood-' });
    const mf = path.join(ex.tdir, 'template.json');
    const m = readJson(mf); m.mood = [...m.mood, 'zzz-unmapped-tag']; writeJson(mf, m);
    const r = ok(ex, 'unmapped mood');
    expect(r.out).toMatch(/zzz-unmapped-tag/);
    expect(r.out).toMatch(/warning/i);
  });

  test('a PNG logo inside a private template passes validation and builds', () => {
    const ex = cloneExample({ prefix: 'sc-logo-' });
    fs.writeFileSync(path.join(ex.tdir, 'logo.png'), png(64, 64));
    const hf = path.join(ex.tdir, 'template.html');
    fs.writeFileSync(hf, read(hf).replace('</body>', '<img src="logo.png" alt="" width="16" height="16"></body>'));
    expect(read(hf)).toContain('logo.png');
    ok(ex, 'png logo');
    const out = path.join(tmp('sc-logo-o-'), 'site');
    const b = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', out]);
    expect(b.status, b.out).toBe(0);
    const z = entries(out);
    expect(z['logo.png'], 'sibling asset ships in the pack').toBeTruthy();
    expect(z['template.html'].toString('utf8')).toContain('logo.png');
  });

  test('strict checks still apply: missing design.md section, TODO marker, wrong screenshot count, wrong size, external request', () => {
    // design.md section removed
    let ex = cloneExample({ prefix: 'sc-strict1-' });
    const df = path.join(ex.tdir, 'design.md');
    const d = read(df);
    const sec = d.match(/^#{1,3}\s*[^\n]*(Fixed-Stage|Signature)[^\n]*$/m);
    expect(sec, 'example design.md has the section to remove').toBeTruthy();
    fs.writeFileSync(df, d.replace(new RegExp(`^${sec[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'), '## Something else'));
    bad(ex, /Fixed-Stage|Signature|design\.md/i, 'missing design.md section');

    // TODO marker
    ex = cloneExample({ prefix: 'sc-strict2-' });
    fs.appendFileSync(path.join(ex.tdir, 'template.html'), '\n<!-- TODO finish -->\n');
    bad(ex, /TODO/, 'TODO marker');

    // only two screenshots
    ex = cloneExample({ prefix: 'sc-strict3-' });
    fs.rmSync(path.join(ex.dir, 'screenshots', `${SLUG}-3.png`));
    bad(ex, /screenshot/i, 'two screenshots');

    // wrong dimensions
    ex = cloneExample({ prefix: 'sc-strict4-' });
    fs.writeFileSync(path.join(ex.dir, 'screenshots', `${SLUG}-1.png`), png(800, 450));
    bad(ex, /1920|1080|size|dimension/i, 'wrong screenshot size');

    // an external request outside the font hosts
    ex = cloneExample({ prefix: 'sc-strict5-' });
    const hf = path.join(ex.tdir, 'template.html');
    fs.writeFileSync(hf, read(hf).replace('</head>', '<link rel="stylesheet" href="https://evil.example.com/x.css"></head>'));
    bad(ex, /evil\.example\.com/, 'external request');
  });
});

// ---------------------------------------------------------------------------
// new-template --source-dir
// ---------------------------------------------------------------------------
test.describe('npm run new-template -- <slug> --source-dir <dir>', () => {
  test('scaffolds sources.json (when missing) and the template files; a second template reuses sources.json', () => {
    const dir = path.join(tmp('sc-new-'), 'acme-templates');
    const r = scaffold(['smoke-deck', '--source-dir', dir]);
    expect(r.status, r.out).toBe(0);
    const sf = path.join(dir, 'sources.json');
    expect(fs.existsSync(sf)).toBe(true);
    const cfg = readJson(sf);
    expect(cfg.schemaVersion).toBe(1);
    expect(cfg.sources).toHaveLength(1);
    expect(cfg.sources[0]).toMatchObject({ id: 'acme-templates', private: true, path: '.' });
    for (const f of ['template.html', 'template.json', 'design.md']) expect(fs.existsSync(path.join(dir, 'templates', 'smoke-deck', f)), f).toBe(true);
    expect(readJson(path.join(dir, 'templates', 'smoke-deck', 'template.json')).slug).toBe('smoke-deck');
    expect(r.out).toMatch(/--extra-sources/);
    // fresh scaffold still has TODOs: validate must fail cleanly (not crash) and name the template
    const v = validate(['--extra-sources', sf, '--only-sources', 'acme-templates']);
    expect(v.status).not.toBe(0);
    expect(v.out).toMatch(/smoke-deck/);
    expect(v.out).toMatch(/TODO/);
    // second template: sources.json untouched
    const before = fs.readFileSync(sf, 'utf8');
    const r2 = scaffold(['second-deck', '--source-dir', dir]);
    expect(r2.status, r2.out).toBe(0);
    expect(fs.readFileSync(sf, 'utf8')).toBe(before);
    expect(fs.existsSync(path.join(dir, 'templates', 'second-deck', 'design.md'))).toBe(true);
    // existing template is not overwritten
    const again = scaffold(['smoke-deck', '--source-dir', dir]);
    expect(again.status, again.out).not.toBe(0);
  });

  test('after the required files are added, validate passes', () => {
    const dir = path.join(tmp('sc-new2-'), 'acme-templates');
    expect(scaffold(['smoke-deck', '--source-dir', dir]).status).toBe(0);
    const t = path.join(dir, 'templates', 'smoke-deck');
    for (const f of ['template.html', 'design.md']) fs.copyFileSync(path.join(EXAMPLE, 'templates', SLUG, f), path.join(t, f));
    const m = readJson(path.join(EXAMPLE, 'templates', SLUG, 'template.json'));
    m.slug = 'smoke-deck'; writeJson(path.join(t, 'template.json'), m);
    fs.mkdirSync(path.join(dir, 'screenshots'));
    for (let n = 1; n <= 3; n++) fs.copyFileSync(path.join(EXAMPLE, 'screenshots', `${SLUG}-${n}.png`), path.join(dir, 'screenshots', `smoke-deck-${n}.png`));
    const v = validate(['--extra-sources', path.join(dir, 'sources.json'), '--only-sources', 'acme-templates']);
    expect(v.status, v.out).toBe(0);
  });
});

test.describe('screenshots script', () => {
  test('--source-dir is documented in the usage / accepted by the script', () => {
    const src = read(ROOT, 'scripts', 'screenshots.mjs');
    expect(src).toMatch(/source-dir/);
  });
});

// ---------------------------------------------------------------------------
// Follow-ups: home chapter counters, nameZh, companion credit, extra i18n, new-template with an
// empty SC_SOURCES, the "Internal use only" prompt line.
// ---------------------------------------------------------------------------
const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const pagePrompt = (out, rel, id) => {
  const m = read(out, ...rel).match(new RegExp(`<pre id="${id}"[^>]*>([^]*?)</pre>`));
  return m ? unescapeHtml(m[1]) : null;
};
const FOLLOW = {};
const textOf = (buf) => buf.toString('utf8');

test.describe('home chapter counters', () => {
  /** Reads the chapters of a home page: [{ cls, eyebrow, counter: [n, total] | null }]. */
  function chapters(html) {
    const parts = html.split(/<section class="home-chapter /).slice(1);
    return parts.map((p) => ({
      cls: p.match(/^([\w -]+)"/)[1],
      eyebrow: Number(p.match(/<span class="eyebrow">(\d\d) \//)?.[1]),
      counter: (() => { const m = p.match(/class="chapter-counter"[^>]*>(\d\d) — (\d\d)</); return m ? [Number(m[1]), Number(m[2])] : null; })(),
    }));
  }
  function check(html, { showcase }) {
    const ch = chapters(html);
    expect(ch.map((c) => c.cls.split(' ')[0]), 'chapter classes').toEqual(['home-hero', ...(showcase ? ['home-showcase'] : []), 'home-process', 'home-origin', 'home-closing']);
    const total = ch.length;
    expect(total).toBe(showcase ? 5 : 4);
    ch.forEach((c, i) => {
      expect(c.eyebrow, `eyebrow of chapter ${i + 1}`).toBe(i + 1);
      if (c.counter) expect(c.counter, `counter of chapter ${i + 1}`).toEqual([i + 1, total]);
      else expect(c.cls, 'only the hero and the showcase (which has a link instead) have no counter').toMatch(/home-(hero|showcase)/);
    });
    expect(html.includes('id="home-carousel-track"') || html.includes('home-showcase'), 'showcase present').toBe(showcase);
  }

  test.beforeAll(() => {
    const ex = cloneExample({ prefix: 'sc-cnt-' });
    FOLLOW.withShowcase = path.join(tmp('sc-cnt-a-'), 'site');
    const a = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', FOLLOW.withShowcase]);
    expect(a.status, a.out).toBe(0);
    // An upstream-style source without screenshots only warns, so the showcase chapter drops out.
    FOLLOW.noShowcase = path.join(tmp('sc-cnt-b-'), 'site');
    const b = build(['--sources', path.join(ROOT, 'tests', 'fixtures', 'sources-minimal.json'), '--out', FOLLOW.noShowcase], { env: { SC_NO_LOCAL_SOURCES: '1' } });
    expect(b.status, b.out).toBe(0);
  });

  test('with a showcase: 5 chapters, numbered 01..05, counters read "NN — 05" (EN + ZH, example build and default site/)', () => {
    for (const [out, rel] of [[FOLLOW.withShowcase, ['index.html']], [FOLLOW.withShowcase, ['zh', 'index.html']], [SITE, ['index.html']], [SITE, ['zh', 'index.html']]]) {
      check(read(out, ...rel), { showcase: true });
    }
  });

  test('without a showcase: 4 chapters, numbered 01..04, counters read "NN — 04" (EN + ZH); no hero wall', () => {
    expect(read(FOLLOW.noShowcase, 'index.html')).not.toMatch(/hero-wall/);
    for (const rel of [['index.html'], ['zh', 'index.html']]) check(read(FOLLOW.noShowcase, ...rel), { showcase: false });
  });
});

test.describe('source nameZh', () => {
  test.beforeAll(() => {
    const ex = cloneExample({ prefix: 'sc-nz-' });
    FOLLOW.nz = path.join(tmp('sc-nz-o-'), 'site');
    const r = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', FOLLOW.nz]);
    expect(r.status, r.out).toBe(0);
    // same source without nameZh: zh falls back to the English name everywhere
    const ex2 = cloneExample({ prefix: 'sc-nz2-', mutateSource: (s) => { delete s.nameZh; } });
    FOLLOW.nzFallback = path.join(tmp('sc-nz2-o-'), 'site');
    const r2 = build(['--extra-sources', ex2.sf, '--only-sources', 'acme', '--out', FOLLOW.nzFallback]);
    expect(r2.status, r2.out).toBe(0);
  });

  test('zh pages show "Acme 模板"; EN pages show "Acme Templates" and never the Chinese name', () => {
    for (const rel of [['zh', 'index.html'], ['zh', 'gallery', 'index.html'], ['zh', 't', SLUG, 'index.html'], ['zh', 'credits.html']]) {
      const html = read(FOLLOW.nz, ...rel);
      expect(html, rel.join('/')).toContain('Acme 模板');
      expect(html.replace(/<pre id="prompt-en"[^]*?<\/pre>/, ''), `${rel.join('/')}: English name leaked onto a zh page`).not.toMatch(/Acme Templates/);
    }
    for (const rel of [['index.html'], ['gallery', 'index.html'], ['t', SLUG, 'index.html'], ['credits.html']]) {
      const html = read(FOLLOW.nz, ...rel);
      expect(html, rel.join('/')).toContain('Acme Templates');
      expect(html.replace(/<pre id="prompt-zh"[^]*?<\/pre>/, ''), `${rel.join('/')}: Chinese name leaked onto an EN page`).not.toContain('Acme 模板');
    }
  });

  test('zip: zh NOTICE.txt and README name the source in Chinese; PROMPT.zh.md uses it, PROMPT.md does not', () => {
    const z = entries(FOLLOW.nz);
    const notice = textOf(z['NOTICE.txt']);
    const [en, zh] = notice.split(/-{20,}/);
    expect(en).toContain('Acme Templates');
    expect(en).not.toContain('Acme 模板');
    expect(zh).toContain('Acme 模板');
    expect(zh).not.toContain('Acme Templates');
    const readme = textOf(z['README.md']);
    expect(readme).toMatch(/仅限内部使用。\*\* 本模板属于 Acme 模板/);
    expect(readme).toMatch(/This template belongs to Acme Templates/);
    expect(textOf(z['PROMPT.zh.md'])).toContain('Acme 模板');
    expect(textOf(z['PROMPT.zh.md'])).not.toContain('Acme Templates');
    expect(textOf(z['PROMPT.md'])).toContain('Acme Templates');
    expect(textOf(z['PROMPT.md'])).not.toContain('Acme 模板');
  });

  test('without nameZh the zh surfaces fall back to the English name (no "undefined")', () => {
    const z = entries(FOLLOW.nzFallback);
    expect(textOf(z['PROMPT.zh.md'])).toMatch(/本模板属于 Acme Templates/);
    expect(textOf(z['NOTICE.txt']).split(/-{20,}/)[1]).toContain('Acme Templates');
    for (const rel of [['zh', 'index.html'], ['zh', 'gallery', 'index.html'], ['zh', 't', SLUG, 'index.html'], ['zh', 'credits.html']]) {
      const html = read(FOLLOW.nzFallback, ...rel);
      expect(html).toContain('Acme Templates');
      expect(html).not.toMatch(/Acme 模板|undefined|\[object Object\]/);
    }
  });
});

test.describe('private source footer line', () => {
  test('credits the frontend-slides companion for viewport-base.css on every page that has a footer (EN + ZH)', () => {
    const en = /<li>Internal templates: [^<]*(?:<a [^>]*>[^<]*<\/a>)?[^<]* · by Acme Design Team · Internal use only · <code>viewport-base\.css<\/code> from <a href="https:\/\/github\.com\/zarazhangrui\/frontend-slides">frontend-slides<\/a> by Zara Zhang \(MIT\)<\/li>/;
    const zh = /<li>内部模板：Acme 模板 · Acme Design Team 出品 · Internal use only · <code>viewport-base\.css<\/code> 来自 Zara Zhang 的 <a href="https:\/\/github\.com\/zarazhangrui\/frontend-slides">frontend-slides<\/a>（MIT）<\/li>/;
    for (const rel of [['index.html'], ['gallery', 'index.html'], ['t', SLUG, 'index.html'], ['credits.html']]) expect(read(FOLLOW.nz, ...rel), rel.join('/')).toMatch(en);
    for (const rel of [['zh', 'index.html'], ['zh', 'gallery', 'index.html'], ['zh', 't', SLUG, 'index.html'], ['zh', 'credits.html']]) expect(read(FOLLOW.nz, ...rel), rel.join('/')).toMatch(zh);
  });
});

test.describe('extra-source i18n/zh.json', () => {
  const ZH = {
    tagline: '一套沉稳的海军蓝业务回顾幻灯片，只有一个天蓝色强调色。',
    best_for: '内部季度回顾。',
    avoid_for: '大段文字页。',
    occasion: ['季度回顾', '团队更新', '内部报告'],
    palette_description: '深海军蓝、近白文字、一个天蓝强调色',
    typography_style: '单一无衬线字族',
    description: '内部季度回顾用的幻灯片。',
  };
  function fixture() {
    const ex = cloneExample({ prefix: 'sc-i18n-' });
    const m = readJson(path.join(ex.tdir, 'template.json'));
    m.mood = ['calm', 'activist']; // "activist" also exists in the repository's own zh.json
    writeJson(path.join(ex.tdir, 'template.json'), m);
    fs.mkdirSync(path.join(ex.dir, 'i18n'));
    writeJson(path.join(ex.dir, 'i18n', 'zh.json'), {
      terms: { calm: '沉稳', activist: 'EXTRA-WINS-WRONG', steady: '稳健', precise: '精确', 'acme-only': '仅本站' },
      templates: { [SLUG]: ZH },
    });
    return ex;
  }

  test('a build merges it: the template is translated on zh pages, extra terms are used, the repo term wins on a clash, no "missing translation" warning', () => {
    const ex = fixture();
    const out = path.join(tmp('sc-i18n-o-'), 'site');
    const r = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', out]);
    expect(r.status, r.out).toBe(0);
    expect(r.out).not.toMatch(/no Chinese translations for/);
    const detail = read(out, 'zh', 't', SLUG, 'index.html');
    const gallery = read(out, 'zh', 'gallery', 'index.html');
    expect(detail).toContain(ZH.tagline);
    expect(gallery).toContain(ZH.tagline);
    expect(detail).toContain(ZH.avoid_for);
    expect(gallery).toContain('沉稳');
    expect(gallery + detail, 'clashing term: the repository translation wins').toContain('行动主义');
    expect(gallery + detail).not.toContain('EXTRA-WINS-WRONG');
    // EN pages stay English
    expect(read(out, 't', SLUG, 'index.html')).not.toContain(ZH.tagline);
  });

  test('loadZh(): repo terms and templates win on a clash; extra-only entries are kept; bad extra file is reported', async () => {
    const dir = tmp('sc-i18n-u-');
    writeJson(path.join(dir, 'zh.json'), {
      terms: { calm: '沉稳', activist: 'EXTRA-WINS-WRONG' },
      templates: { 'neo-grid-bold': { tagline: 'EXTRA-WINS-WRONG' }, [SLUG]: ZH },
    });
    const { loadZh } = await import(pathToFileUrl(path.join(SCRIPTS.validate, '..', 'i18n.mjs')));
    const problems = [];
    const { zh } = loadZh(problems, [dir]);
    expect(problems).toEqual([]);
    const repo = readJson(path.join(ROOT, 'src', 'i18n', 'zh.json'));
    expect(zh.terms.activist).toBe(repo.terms.activist);
    expect(zh.terms.calm).toBe(repo.terms.calm ?? '沉稳');
    expect(zh.templates['neo-grid-bold']).toEqual(repo.templates['neo-grid-bold']);
    expect(zh.templates[SLUG]).toEqual(ZH);
    // an extra file that is not valid is a problem, not a crash
    const bad = tmp('sc-i18n-bad-');
    fs.writeFileSync(path.join(bad, 'zh.json'), '{ not json');
    const p2 = [];
    expect(() => loadZh(p2, [bad])).not.toThrow();
    expect(p2.join('\n')).toMatch(/zh\.json is not valid JSON/);
    const bad2 = tmp('sc-i18n-bad2-');
    writeJson(path.join(bad2, 'zh.json'), { terms: {} });
    const p3 = [];
    loadZh(p3, [bad2]);
    expect(p3.join('\n')).toMatch(/needs "terms" and "templates" objects/);
  });
});

test.describe('new-template with an empty SC_SOURCES', () => {
  test('SC_SOURCES="" (as set by `run`) is treated as unset: --source-dir scaffolds, no ENOENT', () => {
    const dir = path.join(tmp('sc-emp-'), 'co-templates');
    const r = run(SCRIPTS.newTemplate, ['smoke-deck', '--source-dir', dir], { env: { SC_SOURCES: '' } });
    expect(r.status, r.out).toBe(0);
    expect(r.out).not.toMatch(/ENOENT|TypeError|at .*\.mjs:\d+/);
    expect(fs.existsSync(path.join(dir, 'templates', 'smoke-deck', 'template.json'))).toBe(true);
  });

  test('SC_SOURCES="" with an unknown collection id fails with a message, not a stack trace', () => {
    const r = run(SCRIPTS.newTemplate, ['smoke-deck', '--collection', 'no-such-collection'], { env: { SC_SOURCES: '' } });
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/no source "no-such-collection"/);
    expect(r.out).not.toMatch(/ENOENT|TypeError|at .*\.mjs:\d+/);
    expect(fs.existsSync(path.join(ROOT, 'collections', 'no-such-collection'))).toBe(false);
  });
});

test.describe('"Internal use only" line in the private prompts', () => {
  test.beforeAll(() => {
    const ex = cloneExample({ prefix: 'sc-iu-' });
    FOLLOW.iu = path.join(tmp('sc-iu-o-'), 'site');
    const r = build(['--extra-sources', ex.sf, '--only-sources', 'acme', '--out', FOLLOW.iu]);
    expect(r.status, r.out).toBe(0);
    const ex2 = cloneExample({ prefix: 'sc-iu2-' });
    fs.writeFileSync(path.join(ex2.dir, 'LICENSE'), 'ACME LICENSE\n');
    FOLLOW.iuLic = path.join(tmp('sc-iu2-o-'), 'site');
    const r2 = build(['--extra-sources', ex2.sf, '--only-sources', 'acme', '--out', FOLLOW.iuLic]);
    expect(r2.status, r2.out).toBe(0);
  });

  test('PROMPT.md and PROMPT.zh.md start with the internal-use blockquote; the page prompts are byte-identical to them', () => {
    const z = entries(FOLLOW.iu);
    const en = textOf(z['PROMPT.md']);
    const zh = textOf(z['PROMPT.zh.md']);
    expect(en.split('\n').filter((l) => /^> \*\*Internal use only\.\*\*/.test(l))).toHaveLength(1);
    expect(zh.split('\n').filter((l) => /^> \*\*仅限内部使用。\*\*/.test(l))).toHaveLength(1);
    expect(en.slice(0, 400), 'the line sits right under the title').toMatch(/Internal use only/);
    expect(zh.slice(0, 400)).toMatch(/仅限内部使用/);
    expect(pagePrompt(FOLLOW.iu, ['t', SLUG, 'index.html'], 'prompt-en')).toBe(en);
    expect(pagePrompt(FOLLOW.iu, ['zh', 't', SLUG, 'index.html'], 'prompt-zh')).toBe(zh);
    expect(en).toMatch(/NOTICE\.txt/);
  });

  test('with a LICENSE file the line names LICENSE, not NOTICE.txt; PROMPT.md still equals the page', () => {
    const z = entries(FOLLOW.iuLic);
    const en = textOf(z['PROMPT.md']);
    const line = en.split('\n').find((l) => /Internal use only/.test(l));
    expect(line).toMatch(/terms are in `LICENSE`/);
    expect(en).not.toMatch(/NOTICE\.txt/);
    expect(pagePrompt(FOLLOW.iuLic, ['t', SLUG, 'index.html'], 'prompt-en')).toBe(en);
    expect(pagePrompt(FOLLOW.iuLic, ['zh', 't', SLUG, 'index.html'], 'prompt-zh')).toBe(textOf(z['PROMPT.zh.md']));
  });

  test('public templates never get the line', () => {
    const { entries: es } = readZip(fs.readFileSync(path.join(SITE, 'zip', 'neo-grid-bold.zip')));
    for (const n of ['PROMPT.md', 'PROMPT.zh.md']) expect(textOf(es.find((e) => e.name === `neo-grid-bold/${n}`).data)).not.toMatch(/Internal use only|仅限内部使用/);
  });
});

function pathToFileUrl(p) { return new URL(`file://${p.startsWith('/') ? '' : '/'}${p.split(path.sep).join('/')}`).href; }
