// Validation and gallery-data checks that must FAIL when they should (fixtures live in the OS temp dir):
// unmapped mood tag, overlay metadata problems, duplicate slugs against an overlay source, and the
// license filter showing only when licenses are mixed. No browser.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { ROOT } from './helpers.mjs';
import { SCRIPTS, run, makeRoot, collectionSource, writeSources, scaffoldGood, realSource, relFromRoot, readText } from './fixture-factory.mjs';

const tmpDirs = [];
const tmp = (p) => { const d = makeRoot(p); tmpDirs.push(d); return d; };
test.afterAll(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });

test.describe('mood tag mapping (src/tags.json)', () => {
  test('a mood tag that is in no group fails validate and build, naming the tag and the template', () => {
    const root = tmp('sc-tag-');
    const sf = writeSources(root, [collectionSource(root)]);
    scaffoldGood(root, sf, { slug: 'fx-tag', meta: { mood: ['clean', 'zzz-unmapped-tag'] } });
    const v = run(SCRIPTS.validate, ['--sources', sf]);
    expect(v.status, v.out).not.toBe(0);
    expect(v.out).toMatch(/zzz-unmapped-tag/);
    expect(v.out).toMatch(/fx-tag/);
    const out = path.join(root, 'site');
    const b = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
    expect(b.status, b.out).not.toBe(0);
    expect(b.out).toMatch(/zzz-unmapped-tag/);
    expect(fs.existsSync(path.join(out, 'index.html')), 'a failed build leaves no half-written site').toBe(false);
  });

  test('mapped tags (case-insensitive) pass; a template with several tags of one group counts once', () => {
    const root = tmp('sc-tag-ok-');
    const sf = writeSources(root, [collectionSource(root)]);
    scaffoldGood(root, sf, { slug: 'fx-ok', meta: { mood: ['Bold', 'confident', 'punchy'] } });
    const out = path.join(root, 'site');
    const b = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
    expect(b.status, b.out).toBe(0);
    const html = readText(out, 'gallery', 'index.html');
    expect(html).toMatch(/data-group="mood" data-value="bold"[^>]*>Bold <span class="n">1<\/span>/);
    expect(html).toMatch(/data-mood="bold"/);
    expect(html, 'raw tags are not data-mood values').not.toMatch(/data-mood="[^"]*(confident|punchy)/);
  });
});

test.describe('license filter visibility', () => {
  test('one license in the whole catalog: no license group in the gallery (EN and ZH)', () => {
    const root = tmp('sc-lic1-');
    const sf = writeSources(root, [collectionSource(root)]);
    scaffoldGood(root, sf, { slug: 'fx-a' });
    scaffoldGood(root, sf, { slug: 'fx-b' });
    const out = path.join(root, 'site');
    const b = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
    expect(b.status, b.out).toBe(0);
    for (const rel of [['gallery', 'index.html'], ['zh', 'gallery', 'index.html']]) {
      const html = readText(out, ...rel);
      expect(html, rel.join('/')).not.toMatch(/data-group="license"/);
      expect(html, rel.join('/')).not.toMatch(/license-chip/);
    }
  });

  test('two licenses: the license group and per-license counts appear; the odd one out is counted once', () => {
    const root = tmp('sc-lic2-');
    const sf = writeSources(root, [collectionSource(root)]);
    scaffoldGood(root, sf, { slug: 'fx-a' });
    const tb = scaffoldGood(root, sf, { slug: 'fx-b', meta: { license: 'Apache-2.0' } });
    fs.writeFileSync(path.join(tb, 'LICENSE'), 'Apache License\nVersion 2.0, January 2004\nCopyright 2026 Fixture Person\n');
    scaffoldGood(root, sf, { slug: 'fx-c' });
    const out = path.join(root, 'site');
    const b = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
    expect(b.status, b.out).toBe(0);
    const html = readText(out, 'gallery', 'index.html');
    expect(html).toMatch(/data-group="license" data-value="MIT"[^>]*>MIT <span class="n">2<\/span>/);
    expect(html).toMatch(/data-group="license" data-value="Apache-2\.0"[^>]*>Apache-2\.0 <span class="n">1<\/span>/);
  });
});

test.describe('overlay source checks', () => {
  /** A copy of the real guizang source whose metadata directory is a fixture copy that tests can break. */
  function overlayFixture() {
    const root = tmp('sc-ovl-');
    const meta = path.join(root, 'meta');
    fs.cpSync(path.join(ROOT, 'sources-meta', 'guizang'), meta, { recursive: true });
    const src = realSource('guizang');
    src.overlay.metaDir = relFromRoot(meta);
    const sf = writeSources(root, [src]);
    return { root, meta, src, sf };
  }
  const editJson = (file, fn) => { const j = JSON.parse(fs.readFileSync(file, 'utf8')); fn(j); fs.writeFileSync(file, JSON.stringify(j, null, 2)); };

  test('baseline: the copied overlay builds 2 templates', () => {
    const { root, sf } = overlayFixture();
    const v = run(SCRIPTS.validate, ['--sources', sf]);
    expect(v.status, v.out).toBe(0);
    expect(v.out).toMatch(/2 template\(s\)/);
  });

  test('missing metadata directory fails and names it', () => {
    const { root, src } = overlayFixture();
    src.overlay.metaDir = relFromRoot(path.join(root, 'nope'));
    const sf = writeSources(root, [src], 'bad.json');
    const v = run(SCRIPTS.validate, ['--sources', sf]);
    expect(v.status, v.out).not.toBe(0);
    expect(v.out).toMatch(/overlay\.metaDir .* not found/);
  });

  test('missing <slug>.json for an overlay template fails and names the slug', () => {
    const { meta, sf } = overlayFixture();
    fs.rmSync(path.join(meta, 'guizang-swiss.json'));
    const v = run(SCRIPTS.validate, ['--sources', sf]);
    expect(v.status, v.out).not.toBe(0);
    expect(v.out).toMatch(/guizang-swiss/);
  });

  test('overlay metadata violating the schema fails (wrong type, missing field, unknown mood tag)', () => {
    for (const [name, mutate, re] of [
      ['slide_count type', (j) => { j.slide_count = 'many'; }, /slide_count/],
      ['missing tagline', (j) => { delete j.tagline; }, /tagline/],
      ['unmapped mood', (j) => { j.mood = ['zzz-unmapped-tag']; }, /zzz-unmapped-tag/],
    ]) {
      const { meta, sf } = overlayFixture();
      editJson(path.join(meta, 'guizang-editorial.json'), mutate);
      const v = run(SCRIPTS.validate, ['--sources', sf]);
      expect(v.status, `${name}: ${v.out}`).not.toBe(0);
      expect(v.out, name).toMatch(re);
    }
  });

  test('an overlay template with no screenshots: validate fails naming the slug and the command; build only warns', () => {
    const { root, meta, sf } = overlayFixture();
    for (const f of fs.readdirSync(path.join(meta, 'screenshots'))) if (f.startsWith('guizang-swiss-')) fs.rmSync(path.join(meta, 'screenshots', f));
    const v = run(SCRIPTS.validate, ['--sources', sf]);
    expect(v.status, v.out).not.toBe(0);
    expect(v.out).toMatch(/guizang-swiss: no screenshot .*npm run screenshots/);
    const out = path.join(root, 'site');
    const b = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
    expect(b.status, b.out).toBe(0);
    expect(b.out).toMatch(/guizang-swiss: no screenshot/);
    expect(fs.existsSync(path.join(out, 't', 'guizang-swiss', 'index.html'))).toBe(true);
  });

  test('a slug that collides with an overlay template in another source fails as a duplicate', () => {
    const { root, src } = overlayFixture();
    const col = collectionSource(root, { id: 'fxdup', dir: 'col-dup' });
    const sf = writeSources(root, [src, col], 'dup.json');
    scaffoldGood(root, sf, { slug: 'guizang-swiss', id: 'fxdup', dir: 'col-dup' });
    const v = run(SCRIPTS.validate, ['--sources', sf]);
    expect(v.status, v.out).not.toBe(0);
    expect(v.out).toMatch(/duplicate slug "guizang-swiss"/);
  });

  test('an overlay template pointing at a file that is not in the submodule fails', () => {
    const { root, src } = overlayFixture();
    src.overlay.templates['guizang-swiss'].html = 'assets/does-not-exist.html';
    const sf = writeSources(root, [src], 'badhtml.json');
    const v = run(SCRIPTS.validate, ['--sources', sf]);
    expect(v.status, v.out).not.toBe(0);
    expect(v.out).toMatch(/does-not-exist/);
  });
});
