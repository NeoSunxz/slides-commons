// Cover overrides: sources/meta/covers/<source-id>/<slug>.png replaces slide 1's thumbnail.
// Read-only checks run against the real site/ build; validation cases run in a sandbox copy of
// the repo (the real sources/meta/covers/ is never written).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, SITE, TESTS, makeTempDir } from './helpers.mjs';

const REAL_COVERS = path.join(ROOT, 'sources', 'meta', 'covers');
const SRC_ID = 'zarazhangrui';
const SLUG = 'soft-editorial';
const REAL_COVER = path.join(REAL_COVERS, SRC_ID, `${SLUG}.png`);
const FIX = path.join(TESTS, 'fixtures', 'sources-two.json');

const tmpDirs = [];
test.afterAll(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });

const read = (...p) => fs.readFileSync(path.join(SITE, ...p), 'utf8');
const shotsIn = (html, slug) => [...html.matchAll(/assets\/screenshots\/((?:thumbs\/)?[^"' ]*)/g)].map((m) => m[1]).filter((f) => f.includes(`${slug}-`));
const pngSize = (buf) => ({ width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) });

test.describe('cover override in the built site', () => {
  test('the real override is a 1920x1080 PNG', () => {
    const b = fs.readFileSync(REAL_COVER);
    expect(b.readUInt32BE(0)).toBe(0x89504e47);
    expect(pngSize(b)).toEqual({ width: 1920, height: 1080 });
  });

  for (const [lang, prefix] of [['en', ''], ['zh', 'zh/']]) {
    test(`${lang}: gallery card thumb and detail first screenshot use ${SLUG}-cover.png`, () => {
      const gallery = read(...(prefix + 'gallery/index.html').split('/'));
      expect(shotsIn(gallery, SLUG), 'gallery card').toEqual([`thumbs/${SLUG}-cover.png`]);

      const detail = read(...(prefix + `t/${SLUG}/index.html`).split('/'));
      const shots = detail.match(/<div class="shots">([\s\S]*?)<\/div>/);
      expect(shots, 'detail .shots block').toBeTruthy();
      const hrefs = [...shots[1].matchAll(/<a href="[^"]*assets\/screenshots\/([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs[0], 'first detail screenshot').toBe(`${SLUG}-cover.png`);
      expect(hrefs.filter((h) => h === `${SLUG}-cover.png`)).toHaveLength(1);
      expect(hrefs, 'upstream shots follow the cover').toEqual([`${SLUG}-cover.png`, `${SLUG}-4.png`, `${SLUG}-6.png`, `${SLUG}-10.png`]);
    });

    test(`${lang}: home page, if it shows ${SLUG}, uses the cover`, () => {
      const home = read(...(prefix + 'index.html').split('/'));
      const files = shotsIn(home, SLUG);
      for (const f of files) expect(f).toMatch(/-cover\.png$/);
    });
  }

  test('the cover and its thumb are copied into site/ byte for byte / downscaled', () => {
    expect(fs.readFileSync(path.join(SITE, 'assets', 'screenshots', `${SLUG}-cover.png`)).equals(fs.readFileSync(REAL_COVER))).toBe(true);
    const thumb = fs.readFileSync(path.join(SITE, 'assets', 'screenshots', 'thumbs', `${SLUG}-cover.png`));
    const s = pngSize(thumb);
    expect(s.width).toBeLessThan(1920);
    expect(s.width / s.height).toBeCloseTo(16 / 9, 1);
  });

  test('other templates are unchanged: no -cover file, first shot is the upstream -N', () => {
    const covers = fs.readdirSync(path.join(SITE, 'assets', 'screenshots')).filter((f) => f.endsWith('-cover.png'));
    expect(covers).toEqual([`${SLUG}-cover.png`]);
    const overrides = fs.readdirSync(path.join(REAL_COVERS, SRC_ID)).filter((f) => f.endsWith('.png'));
    expect(overrides).toEqual([`${SLUG}.png`]);
    for (const slug of ['neo-grid-bold', 'coral']) {
      for (const prefix of ['', 'zh/']) {
        const detail = read(...(prefix + `t/${slug}/index.html`).split('/'));
        const first = shotsIn(detail, slug).find((f) => !f.startsWith('thumbs/'));
        expect(first, `${prefix}${slug}`).toBe(`${slug}-1.png`);
        const gallery = read(...(prefix + 'gallery/index.html').split('/'));
        expect(shotsIn(gallery, slug), `${prefix}${slug} card`).toEqual([`thumbs/${slug}-1.png`]);
      }
    }
  });
});

test('sources/meta/covers/README.md exists and states the upstream licence', () => {
  const f = path.join(REAL_COVERS, 'README.md');
  expect(fs.existsSync(f)).toBe(true);
  const t = fs.readFileSync(f, 'utf8');
  expect(t).toMatch(/upstream licen[cs]e/i);
  expect(t).toMatch(/\bMIT\b/);
  expect(t).toMatch(/zarazhangrui/);
});

// ---------------------------------------------------------------------------
// Validation, in a sandbox repo copy
// ---------------------------------------------------------------------------
function sandbox() {
  const root = makeTempDir('sc-cover-');
  tmpDirs.push(root);
  fs.cpSync(path.join(ROOT, 'scripts'), path.join(root, 'scripts'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'src'), path.join(root, 'src'), { recursive: true });
  fs.mkdirSync(path.join(root, 'sources'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'sources', 'meta'), path.join(root, 'sources', 'meta'), { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}\n');
  try {
    for (const d of ['upstream', 'collections', 'node_modules']) fs.symlinkSync(path.join(ROOT, d), path.join(root, d), 'junction');
  } catch (e) { test.skip(true, `cannot symlink: ${e.code}`); }
  // The home carousel must only name loaded templates.
  fs.writeFileSync(path.join(root, 'src', 'home.json'), JSON.stringify({ carousel: [SLUG, 'coral'] }));
  const cfg = JSON.parse(fs.readFileSync(FIX, 'utf8'));
  cfg.sources[0].include = [SLUG, 'coral'];
  const sources = path.join(root, 'sources', 'sources.json');
  fs.writeFileSync(sources, JSON.stringify(cfg, null, 2));
  return { root, sources, covers: path.join(root, 'sources', 'meta', 'covers') };
}

function run(sb, script, extra = []) {
  const args = [path.join(sb.root, 'scripts', `${script}.mjs`), '--sources', sb.sources, ...extra];
  if (script === 'build') args.push('--out', path.join(sb.root, 'out-site'));
  const r = spawnSync(process.execPath, args, {
    cwd: sb.root, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_NO_LOCAL_SOURCES: '1' },
  });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}`.trim() };
}

test.describe('cover override validation (sandbox copy)', () => {
  test('baseline: the sandbox with the real override validates and builds with the cover', () => {
    const sb = sandbox();
    const v = run(sb, 'validate');
    expect(v.status, v.out).toBe(0);
    const b = run(sb, 'build');
    expect(b.status, b.out).toBe(0);
    expect(fs.existsSync(path.join(sb.root, 'out-site', 'assets', 'screenshots', `${SLUG}-cover.png`))).toBe(true);
    expect(fs.existsSync(path.join(sb.root, 'out-site', 'assets', 'screenshots', 'coral-1.png'))).toBe(true);
  });

  test('unknown slug fails validate and build with a clear message', () => {
    const sb = sandbox();
    fs.copyFileSync(REAL_COVER, path.join(sb.covers, SRC_ID, 'no-such-template.png'));
    for (const script of ['validate', 'build']) {
      const r = run(sb, script);
      expect(r.status, `${script}: ${r.out}`).not.toBe(0);
      expect(r.out, script).toContain(`sources/meta/covers/${SRC_ID}/no-such-template.png`);
      expect(r.out, script).toMatch(/no template "no-such-template" in source "zarazhangrui"/);
    }
  });

  test('wrong size fails validate and build, naming the required size', () => {
    const sb = sandbox();
    const b = Buffer.from(fs.readFileSync(REAL_COVER));
    b.writeUInt32BE(1280, 16);
    b.writeUInt32BE(720, 20);
    fs.writeFileSync(path.join(sb.covers, SRC_ID, `${SLUG}.png`), b);
    for (const script of ['validate', 'build']) {
      const r = run(sb, script);
      expect(r.status, `${script}: ${r.out}`).not.toBe(0);
      expect(r.out, script).toContain(`sources/meta/covers/${SRC_ID}/${SLUG}.png`);
      expect(r.out, script).toMatch(/must be a 1920x1080 PNG/);
    }
  });

  test('non-png name fails validate and build', () => {
    for (const name of [`${SLUG}.jpg`, `${SLUG}.webp`, 'notes.txt']) {
      const sb = sandbox();
      fs.writeFileSync(path.join(sb.covers, SRC_ID, name), 'x');
      for (const script of ['validate', 'build']) {
        const r = run(sb, script);
        expect(r.status, `${name} ${script}: ${r.out}`).not.toBe(0);
        expect(r.out, `${name} ${script}`).toContain(`sources/meta/covers/${SRC_ID}/${name}`);
        expect(r.out, `${name} ${script}`).toMatch(/must be <slug>\.png/);
      }
    }
  });

  test('an override for a source that is not loaded is ignored (even if invalid)', () => {
    const sb = sandbox();
    const dir = path.join(sb.covers, 'not-loaded-source');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'whatever.jpg'), 'junk');
    fs.writeFileSync(path.join(dir, 'ghost.png'), 'junk');
    const v = run(sb, 'validate');
    expect(v.status, v.out).toBe(0);
    expect(v.out).not.toMatch(/not-loaded-source/);
    const b = run(sb, 'build');
    expect(b.status, b.out).toBe(0);
    expect(fs.readdirSync(path.join(sb.root, 'out-site', 'assets', 'screenshots')).filter((f) => f.includes('ghost'))).toEqual([]);
  });

  test('an invalid override in a source that is not loaded in this build does not fail it', () => {
    // The zarazhangrui override is invalid, but the build loads only the minimal fixture source.
    const sb = sandbox();
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'sources-minimal.json'), 'utf8'));
    expect(cfg.sources[0].id).not.toBe(SRC_ID);
    fs.writeFileSync(path.join(sb.covers, SRC_ID, 'bad.txt'), 'x');
    const alt = path.join(sb.root, 'sources', 'alt.json');
    fs.copyFileSync(path.join(ROOT, 'tests', 'fixtures', 'sources-minimal.json'), alt);
    fs.cpSync(path.join(ROOT, 'tests', 'fixtures', 'minimal-src'), path.join(sb.root, 'tests', 'fixtures', 'minimal-src'), { recursive: true });
    const r = spawnSync(process.execPath, [path.join(sb.root, 'scripts', 'validate.mjs'), '--sources', alt], {
      cwd: sb.root, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_NO_LOCAL_SOURCES: '1' },
    });
    expect(`${r.stdout}\n${r.stderr}`).not.toMatch(/covers\//);
  });
});
