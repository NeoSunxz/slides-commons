// M5 contribution flow, no browser: strict collection checks (negatives), derivedFrom packs, empty
// perTemplateLicense sources, and scripts/new-template.mjs. All fixtures live in the OS temp dir.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { ROOT, TESTS, SITE, readZip } from './helpers.mjs';
import {
  SCRIPTS, run, png, makeRoot, collectionSource, writeSources, scaffoldGood, realSource, relFromRoot, readText,
} from './fixture-factory.mjs';

const tmpDirs = [];
const tmp = (p) => { const d = makeRoot(p); tmpDirs.push(d); return d; };
test.afterAll(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });

const html_en_by = (h) => (h.match(/<p class="by">[\s\S]*?<\/p>/) ?? [''])[0];
const walkRel = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).map(String).sort() : null);

// ---------------------------------------------------------------------------
// 1. Strict checks fail when they should, each with a clear message
// ---------------------------------------------------------------------------
test.describe('collection checks: negatives', () => {
  let golden; // a passing template, copied for every case
  const SLUG = 'fx-one';

  test.beforeAll(() => {
    golden = tmp('sc-golden-');
    const sf = writeSources(golden, [collectionSource(golden)]);
    scaffoldGood(golden, sf, { slug: SLUG });
  });

  /** Copy the golden fixture, apply `mutate(ctx)`, validate. */
  function validateCase(mutate, { extraSources = [] } = {}) {
    const root = tmp('sc-case-');
    fs.cpSync(golden, root, { recursive: true });
    fs.rmSync(path.join(root, 'sources.json'));
    const src = collectionSource(root);
    const sf = writeSources(root, [src, ...extraSources]);
    const tdir = path.join(root, 'col', 'templates', SLUG);
    const shots = path.join(root, 'col', 'screenshots');
    mutate({ root, tdir, shots, meta: path.join(tdir, 'template.json') });
    return run(SCRIPTS.validate, ['--sources', sf]);
  }
  const editMeta = (fn) => ({ meta }) => { const m = JSON.parse(fs.readFileSync(meta, 'utf8')); fn(m); fs.writeFileSync(meta, JSON.stringify(m, null, 2)); };
  const editFile = (name, fn) => ({ tdir }) => { const p = path.join(tdir, name); fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); };

  test('baseline: the scaffolded and completed template passes', () => {
    const r = validateCase(() => {});
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/^ok: 1 template\(s\)/);
  });

  // [title, mutate, [regexes that must all appear], slug appears?]
  const CASES = [
    ['license not on the allowed list', editMeta((m) => { m.license = 'GPL-3.0'; }), [/license "GPL-3\.0" is not allowed/, /MIT, Apache-2\.0, CC-BY-4\.0, CC0-1\.0/, /template\.json/]],
    ['LICENSE text does not match the declared license', editMeta((m) => { m.license = 'Apache-2.0'; }), [/LICENSE does not look like the Apache-2\.0 license/]],
    ['LICENSE file missing', ({ tdir }) => fs.rmSync(path.join(tdir, 'LICENSE')), [/LICENSE is missing\. Fix: add the full text of the MIT license/]],
    ['authors missing', editMeta((m) => { delete m.authors; }), [/"authors" is required/]],
    ['license missing (falls back to the source label)', editMeta((m) => { delete m.license; }), [/"license" is required/]],
    ['author without url', editMeta((m) => { m.authors = [{ name: 'No Link' }]; }), [/author "No Link" has no "url"/]],
    ['TODO left in design.md', editFile('design.md', (t) => `${t}\nTODO describe the footer\n`), [/design\.md:\d+ still contains a TODO placeholder/]],
    ['TODO left in template.html', editFile('template.html', (t) => t.replace('<body>', '<body>\n<!-- TODO remove -->')), [/template\.html:\d+ still contains a TODO placeholder/]],
    ['TODO left in template.json', editMeta((m) => { m.name = 'TODO name'; }), [/template\.json:\d+ still contains a TODO placeholder/]],
    ['TODO left in LICENSE', editFile('LICENSE', (t) => `${t}\nCopyright TODO\n`), [/LICENSE:\d+ still contains a TODO placeholder/]],
    ['only two screenshots', ({ shots }) => fs.rmSync(path.join(shots, `${SLUG}-3.png`)), [/found 2 screenshot\(s\), need exactly 3/, /npm run screenshots -- --only fx-one/]],
    ['four screenshots', ({ shots }) => fs.writeFileSync(path.join(shots, `${SLUG}-4.png`), png()), [/found 4 screenshot\(s\), need exactly 3/]],
    ['no screenshots', ({ shots }) => fs.rmSync(shots, { recursive: true }), [/found 0 screenshot\(s\), need exactly 3/]],
    ['screenshot of the wrong size', ({ shots }) => fs.writeFileSync(path.join(shots, `${SLUG}-2.png`), png(1280, 720)), [/fx-one-2\.png is 1280.720; it must be 1920.1080/]],
    ['screenshot over 1.5 MB', ({ shots }) => fs.writeFileSync(path.join(shots, `${SLUG}-1.png`), png(1920, 1080, { noise: true })), [/fx-one-1\.png is \d+ KB; the limit is 1536 KB each/]],
    ['<img> in template.html', editFile('template.html', (t) => t.replace('<body>', '<body>\n<img src="data:image/svg+xml,%3Csvg%3E%3C/svg%3E" alt="">')), [/template\.html uses <img>/, /abstract shapes only/]],
    ['raster file referenced from CSS', editFile('template.html', (t) => t.replace('</style>', '.x{background:url("bg.png")}</style>')), [/references a raster image file/]],
    ['raster file as sibling asset', ({ tdir }) => fs.writeFileSync(path.join(tdir, 'photo.png'), png(8, 8)), [/asset photo\.png is a raster image/]],
    ['raster data: URI over 200 KB', editFile('template.html', (t) => t.replace('</style>', `.x{background:url(data:image/png;base64,${'A'.repeat(210 * 1024)})}</style>`)), [/embeds \d+ KB of raster data: URIs; the limit is 200 KB/]],
    ['template.html over 1.5 MB', editFile('template.html', (t) => `${t}\n<!-- ${'x'.repeat(1.6 * 1024 * 1024)} -->`), [/template\.html is \d+ KB; the limit is 1536 KB/]],
    ['design.md without a CJK heading', editFile('design.md', (t) => t.replace(/^## CJK.*$/m, '## International notes')), [/design\.md has no CJK heading/, /Fix: add a section such as "## CJK & International Content"/]],
    ['design.md without a fixed-stage heading', editFile('design.md', (t) => t.replace(/^## Fixed-Stage Policy$/m, '## Canvas')), [/design\.md has no heading about the fixed-stage policy/]],
    ['design.md without Signature Moves', editFile('design.md', (t) => t.replace(/^## Signature Moves$/m, '## Highlights')), [/design\.md has no "Signature Moves"/]],
    ['derivedFrom points at a missing template', editMeta((m) => { m.derivedFrom = { source: 'fxcol', slug: 'no-such-original' }; }), [/derivedFrom\.slug "no-such-original" is not a template in this gallery/]],
    ['derivedFrom names the wrong source', editMeta((m) => { m.derivedFrom = { source: 'zarazhangrui', slug: SLUG }; }), [/derivedFrom\.source "zarazhangrui" does not match the source of "fx-one" \("fxcol"\)/]],
  ];

  for (const [title, mutate, patterns] of CASES) {
    test(`fails: ${title}`, () => {
      const r = validateCase(mutate);
      expect(r.status, `expected failure but got exit 0:\n${r.out}`).not.toBe(0);
      expect(r.out).toMatch(/validation failed/);
      expect(r.out, 'problem must name the template slug').toContain(`${SLUG}:`);
      for (const re of patterns) expect(r.out, `message for "${title}"`).toMatch(re);
    });
  }

  test('a rule only fires for the broken template: a good sibling stays quiet', () => {
    const r = validateCase(({ root, shots }) => {
      // second, good template in the same source
      fs.cpSync(path.join(root, 'col', 'templates', SLUG), path.join(root, 'col', 'templates', 'fx-two'), { recursive: true });
      const mp = path.join(root, 'col', 'templates', 'fx-two', 'template.json');
      fs.writeFileSync(mp, fs.readFileSync(mp, 'utf8').replace(/fx-one/g, 'fx-two'));
      for (let n = 1; n <= 3; n++) fs.copyFileSync(path.join(shots, `${SLUG}-${n}.png`), path.join(shots, `fx-two-${n}.png`));
      fs.rmSync(path.join(shots, `${SLUG}-3.png`)); // break fx-one only
    });
    expect(r.status).not.toBe(0);
    expect(r.out).toContain('fx-one:');
    expect(r.out).not.toContain('fx-two:');
  });

  test('all problems are reported in one run, not just the first', () => {
    const r = validateCase((ctx) => {
      editMeta((m) => { m.license = 'GPL-3.0'; })(ctx);
      editFile('design.md', (t) => `${t}\nTODO later\n`)(ctx);
      fs.rmSync(path.join(ctx.shots, `${SLUG}-3.png`));
      editFile('template.html', (t) => t.replace('<body>', '<body><img src="x.svg">'))(ctx);
    });
    expect(r.status).not.toBe(0);
    for (const re of [/not allowed/, /TODO placeholder/, /need exactly 3/, /uses <img>/]) expect(r.out).toMatch(re);
  });

  test('slug already used by another source is reported with both directories', () => {
    // The fixture template reuses the slug of a real upstream template that is also in the build.
    const up = realSource('zarazhangrui');
    up.include = ['coral'];
    const r = validateCase(({ root, tdir }) => {
      const dst = path.join(root, 'col', 'templates', 'coral');
      fs.renameSync(tdir, dst);
      const mp = path.join(dst, 'template.json');
      fs.writeFileSync(mp, fs.readFileSync(mp, 'utf8').replace(/fx-one/g, 'coral'));
    }, { extraSources: [up] });
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/duplicate slug "coral"/);
    expect(r.out).toMatch(/fxcol/);
    expect(r.out).toMatch(/zarazhangrui/);
  });
});

// ---------------------------------------------------------------------------
// 2. derivedFrom: LICENSE-original-<slug> in the pack, detail page credits both
// ---------------------------------------------------------------------------
test.describe('derivedFrom contribution', () => {
  test('pack carries the original license; detail pages (EN+ZH) credit both authors', () => {
    const root = tmp('sc-derived-');
    const up = realSource('zarazhangrui');
    up.include = ['coral'];
    const src = collectionSource(root);
    const sf = writeSources(root, [up, src]);
    scaffoldGood(root, sf, { slug: 'fx-coral', meta: { derivedFrom: { source: 'zarazhangrui', slug: 'coral' } } });
    // plain sibling (no derivedFrom) for contrast
    scaffoldGood(root, sf, { slug: 'fx-plain' });

    const out = path.join(root, 'site');
    const b = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
    expect(b.status, b.out).toBe(0);

    const { entries, problems } = readZip(fs.readFileSync(path.join(out, 'zip', 'fx-coral.zip')));
    expect(problems).toEqual([]);
    const names = entries.map((e) => e.name);
    for (const f of ['LICENSE', 'LICENSE-skill', 'LICENSE-original-coral', 'PROMPT.md', 'PROMPT.zh.md', 'README.md', 'design.md', 'template.html', 'viewport-base.css']) {
      expect(names, `fx-coral.zip`).toContain(`fx-coral/${f}`);
    }
    const get = (n) => entries.find((e) => e.name === `fx-coral/${n}`).data;
    // The original's license is the real upstream one, byte for byte; the template's own is its LICENSE.
    expect(Buffer.compare(get('LICENSE-original-coral'), fs.readFileSync(path.join(ROOT, 'upstream', 'templates', 'LICENSE')))).toBe(0);
    expect(get('LICENSE-original-coral').toString()).toMatch(/Zara Zhang/);
    expect(Buffer.compare(get('LICENSE'), fs.readFileSync(path.join(root, 'col', 'templates', 'fx-coral', 'LICENSE')))).toBe(0);
    expect(get('LICENSE').toString()).not.toMatch(/Zara Zhang/);
    const readme = get('README.md').toString();
    expect(readme).toContain('LICENSE-original-coral');
    expect(readme).toMatch(/Original template "Coral"/);
    expect(readme).toMatch(/did not make or endorse this version/);

    // A contribution without derivedFrom has no such file.
    const plain = readZip(fs.readFileSync(path.join(out, 'zip', 'fx-plain.zip'))).entries.map((e) => e.name);
    expect(plain.some((n) => /LICENSE-original/.test(n))).toBe(false);
    expect(plain).toContain('fx-plain/LICENSE');

    // Detail pages name the contributor and the original author, and link the original directory.
    const originalDir = 'https://github.com/zarazhangrui/beautiful-html-templates/tree/main/templates/coral';
    for (const [lang, rel] of [['en', ['t', 'fx-coral', 'index.html']], ['zh', ['zh', 't', 'fx-coral', 'index.html']]]) {
      const html = readText(out, ...rel);
      expect(html, `${lang}: contributor`).toContain('Fixture Person');
      expect(html, `${lang}: original author`).toContain('Zara Zhang');
      expect(html, `${lang}: link to the original`).toContain(originalDir);
      expect(html, `${lang}: link to the contributor's directory`).toContain('https://github.com/fixture-owner/fixture-repo/tree/main/col/templates/fx-coral');
      expect(html, `${lang}: contributor profile`).toContain('https://github.com/fixture-person');
    }
    const plainHtml = readText(out, 't', 'fx-plain', 'index.html');
    expect(plainHtml).not.toContain(originalDir);
    expect(plainHtml).not.toMatch(/Adapted from|Original template/);
    expect(html_en_by(plainHtml)).not.toMatch(/Zara Zhang|based on/);
    expect(readText(out, 't', 'fx-coral', 'index.html')).toMatch(/Adapted from/);
  });
});

// ---------------------------------------------------------------------------
// 3. An empty perTemplateLicense source builds and stays invisible
// ---------------------------------------------------------------------------
test.describe('empty community source', () => {
  for (const variant of ['templates/ dir with only .gitkeep']) {
    test(`builds; hidden from gallery filter, credits and footer (${variant})`, () => {
      const root = tmp('sc-empty-');
      const empty = collectionSource(root, { id: 'emptyc', dir: 'empty-col' });
      empty.name = 'Empty Fixture Community';
      if (variant.startsWith('templates')) {
        fs.mkdirSync(path.join(root, 'empty-col', 'templates'), { recursive: true });
        fs.writeFileSync(path.join(root, 'empty-col', 'templates', '.gitkeep'), '');
      } else fs.mkdirSync(path.join(root, 'empty-col'), { recursive: true });
      // Two non-empty sources with distinct authors so that the author filter is shown.
      const a = collectionSource(root, { id: 'fxa', dir: 'col-a' }); a.name = 'Fixture A';
      const bsrc = collectionSource(root, { id: 'fxb', dir: 'col-b' }); bsrc.name = 'Fixture B';
      const sf = writeSources(root, [a, bsrc, empty]);
      scaffoldGood(root, sf, { slug: 'fx-a', id: 'fxa', dir: 'col-a', meta: { authors: [{ name: 'Fixture A', url: 'https://github.com/fixture-a' }] } });
      scaffoldGood(root, sf, { slug: 'fx-b', id: 'fxb', dir: 'col-b', meta: { authors: [{ name: 'Fixture B', url: 'https://github.com/fixture-b' }] } });

      const out = path.join(root, 'site');
      const r = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
      expect(r.status, r.out).toBe(0);
      expect(r.out).toMatch(/built 2 template\(s\) from 3 source\(s\)/);

      for (const [lang, idx, cred] of [['en', path.join('gallery', 'index.html'), 'credits.html'], ['zh', path.join('zh', 'gallery', 'index.html'), path.join('zh', 'credits.html')]]) {
        const gallery = readText(out, idx);
        expect(gallery, `${lang}: chip for the non-empty source A's author`).toMatch(/data-group="author" data-value="Fixture A"/);
        expect(gallery, `${lang}: chip for the non-empty source B's author`).toMatch(/data-group="author" data-value="Fixture B"/);
        expect(gallery, `${lang}: no source chips`).not.toMatch(/data-group="source"/);
        expect(gallery, `${lang}: no chip for the empty source`).not.toMatch(/data-value="emptyc"/);
        expect(gallery).not.toContain('Empty Fixture Community');
        const credits = readText(out, cred);
        expect(credits).toContain('Fixture A');
        expect(credits).toContain('Fixture B');
        expect(credits, `${lang}: empty source must not appear on the credits page`).not.toContain('Empty Fixture Community');
        expect(credits).not.toContain('empty-col');
      }
      // No stray zips or pages for it.
      expect(fs.readdirSync(path.join(out, 'zip')).sort()).toEqual(['fx-a.zip', 'fx-b.zip']);
    });
  }

  test('a source whose templates/ dir is missing fails with a message that names the path', () => {
    // Git does not track empty directories: the repo keeps templates/.gitkeep so that a fresh clone builds.
    const root = tmp('sc-notdir-');
    const empty = collectionSource(root, { id: 'emptyc', dir: 'empty-col' });
    fs.mkdirSync(path.join(root, 'empty-col'), { recursive: true });
    const a = collectionSource(root, { id: 'fxa', dir: 'col-a' });
    const sf = writeSources(root, [a, empty]);
    scaffoldGood(root, sf, { slug: 'fx-a', id: 'fxa', dir: 'col-a' });
    const r = run(SCRIPTS.build, ['--sources', sf, '--out', path.join(root, 'site')]);
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/source emptyc: templates dir \S*empty-col\S*templates not found/);
  });

  test('the real community source keeps templates/.gitkeep and screenshots/.gitkeep (empty dirs are not in git)', () => {
    const c = realSource('community');
    for (const d of ['templates', 'screenshots']) {
      const dir = path.join(ROOT, ...c.path.split('/'), d);
      expect(fs.existsSync(dir), `${dir} exists`).toBe(true);
      expect(fs.readdirSync(dir).length, `${dir} has at least one tracked file`).toBeGreaterThan(0);
    }
  });

  test('with the empty source alone next to one real source, the source filter is hidden', () => {
    const root = tmp('sc-empty1-');
    const empty = collectionSource(root, { id: 'emptyc', dir: 'empty-col' });
    fs.mkdirSync(path.join(root, 'empty-col', 'templates'), { recursive: true });
    const a = collectionSource(root, { id: 'fxa', dir: 'col-a' });
    const sf = writeSources(root, [a, empty]);
    scaffoldGood(root, sf, { slug: 'fx-a', id: 'fxa', dir: 'col-a' });
    const out = path.join(root, 'site');
    const r = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
    expect(r.status, r.out).toBe(0);
    expect(readText(out, 'gallery', 'index.html')).not.toMatch(/data-group="source"/);
  });

  test('validate also passes with the empty source present (real sources.json)', () => {
    const r = run(SCRIPTS.validate, []);
    expect(r.status, r.out).toBe(0);
  });

  test('real site/: no community chip, no community credits section', () => {
    test.skip(!fs.existsSync(path.join(SITE, 'index.html')), 'site/ not built');
    const community = realSource('community');
    const t = path.join(ROOT, community.path, 'templates');
    const hasTemplates = fs.existsSync(t) && fs.readdirSync(t, { withFileTypes: true }).some((d) => d.isDirectory());
    test.skip(hasTemplates, 'the community source has templates now');
    for (const f of ['index.html', 'credits.html', path.join('zh', 'index.html'), path.join('zh', 'credits.html')]) {
      const html = readText(SITE, f);
      expect(html, f).not.toMatch(/data-value="community"/);
      expect(html, f).not.toContain('collections/community');
    }
  });
});

// ---------------------------------------------------------------------------
// 4. npm run new-template
// ---------------------------------------------------------------------------
test.describe('new-template', () => {
  const FILES = ['template.json', 'design.md', 'template.html', 'LICENSE'];

  test('creates the four files, with every decision marked TODO; relative and nested paths work', () => {
    const root = tmp('sc-new-');
    const sf = writeSources(root, [collectionSource(root)]);
    const r = run(SCRIPTS.newTemplate, ['neon-harbor', '--collection', 'fxcol', '--sources', sf]);
    expect(r.status, r.out).toBe(0);
    const dir = path.join(root, 'col', 'templates', 'neon-harbor');
    expect(fs.readdirSync(dir).sort()).toEqual([...FILES].sort());
    for (const f of FILES) {
      expect(r.out, `stdout lists ${f}`).toContain(f);
      expect(fs.statSync(path.join(dir, f)).size, f).toBeGreaterThan(100);
    }
    const meta = JSON.parse(readText(dir, 'template.json'));
    expect(meta.slug).toBe('neon-harbor');
    expect(JSON.stringify(meta)).toMatch(/TODO/);
    // The scaffold is in the new source's own layout; the viewport CSS is inlined into the HTML.
    expect(readText(dir, 'template.html')).toMatch(/\.deck-stage/);
    expect(readText(dir, 'design.md')).toMatch(/^## (Fixed-Stage Policy|Signature Moves|CJK & International Content)$/m);
    expect(readText(dir, 'LICENSE')).toMatch(new RegExp(`Copyright \\(c\\) ${new Date().getFullYear()}`));
    // Next steps mention the commands.
    expect(r.out).toMatch(/npm run screenshots -- --only neon-harbor/);
    expect(r.out).toMatch(/CONTRIBUTING\.md/);
  });

  test('refuses an existing slug and leaves the first copy untouched', () => {
    const root = tmp('sc-new-dup-');
    const sf = writeSources(root, [collectionSource(root)]);
    expect(run(SCRIPTS.newTemplate, ['dup-one', '--collection', 'fxcol', '--sources', sf]).status).toBe(0);
    const p = path.join(root, 'col', 'templates', 'dup-one', 'design.md');
    fs.appendFileSync(p, '\nmy edits\n');
    const before = readText(p);
    const r = run(SCRIPTS.newTemplate, ['dup-one', '--collection', 'fxcol', '--sources', sf]);
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/slug "dup-one" already exists/);
    expect(readText(p)).toBe(before);
  });

  test('refuses a slug that another source already uses (real upstream template)', () => {
    const root = tmp('sc-new-dup2-');
    const sf = writeSources(root, [realSource('zarazhangrui'), collectionSource(root)]);
    const r = run(SCRIPTS.newTemplate, ['coral', '--collection', 'fxcol', '--sources', sf]);
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/slug "coral" already exists/);
    expect(walkRel(path.join(root, 'col', 'templates'))).toBeNull();
  });

  for (const [title, args, re] of [
    ['uppercase / underscore slug', ['Bad_Slug'], /must be lowercase letters, digits and single hyphens/],
    ['double hyphen', ['bad--slug'], /must be lowercase letters/],
    ['leading hyphen', ['-bad'], /unexpected|must be lowercase|usage/],
    ['no slug', [], /usage/],
    ['unknown collection', ['good-slug', '--collection', 'nope'], /no source "nope"/],
    ['non-collection source', ['good-slug', '--collection', 'zarazhangrui'], /not an in-repo collection/],
    ['two slugs', ['one-slug', 'two-slug'], /unexpected argument "two-slug"/],
  ]) {
    test(`rejects ${title} and writes nothing`, () => {
      const root = tmp('sc-new-bad-');
      const sf = writeSources(root, [realSource('zarazhangrui'), collectionSource(root)]);
      const full = args.includes('--collection') ? args : [...args, '--collection', 'fxcol'];
      const r = run(SCRIPTS.newTemplate, [...full, '--sources', sf]);
      expect(r.status, r.out).not.toBe(0);
      expect(r.out).toMatch(re);
      expect(walkRel(path.join(root, 'col'))).toBeNull();
    });
  }

  test('default config: a duplicate or invalid slug is refused without touching the repo', () => {
    const watch = [path.join(ROOT, 'collections', 'community'), path.join(ROOT, 'collections', 'style-presets', 'templates')];
    const before = watch.map(walkRel);
    for (const slug of ['neo-grid-bold', 'bold-signal', 'Not Valid']) {
      const r = run(SCRIPTS.newTemplate, [slug]);
      expect(r.status, `${slug}: ${r.out}`).not.toBe(0);
    }
    expect(watch.map(walkRel)).toEqual(before);
  });

  test('untouched scaffold fails validate and names the slug and each file with TODOs', () => {
    const root = tmp('sc-new-val-');
    const sf = writeSources(root, [collectionSource(root)]);
    run(SCRIPTS.newTemplate, ['raw-scaffold', '--collection', 'fxcol', '--sources', sf]);
    const r = run(SCRIPTS.validate, ['--sources', sf]);
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toContain('raw-scaffold');
    // The metadata placeholders ("formality": "TODO low | ...") are schema errors; they must be called out.
    expect(r.out).toMatch(/formality|scheme|schema/i);
  });

  test('scaffold with only metadata fixed: every file still carrying TODO is listed with its line', () => {
    const root = tmp('sc-new-todo-');
    const sf = writeSources(root, [collectionSource(root)]);
    expect(run(SCRIPTS.newTemplate, ['half-done', '--collection', 'fxcol', '--sources', sf]).status).toBe(0);
    const tdir = path.join(root, 'col', 'templates', 'half-done');
    const meta = JSON.parse(readText(tdir, 'template.json'));
    Object.assign(meta, { formality: 'medium', density: 'low', scheme: 'dark', authors: [{ name: 'A Person', url: 'https://github.com/a-person' }] });
    fs.writeFileSync(path.join(tdir, 'template.json'), JSON.stringify(meta, null, 2));
    const shots = path.join(root, 'col', 'screenshots');
    fs.mkdirSync(shots, { recursive: true });
    for (let n = 1; n <= 3; n++) fs.writeFileSync(path.join(shots, `half-done-${n}.png`), png());
    const r = run(SCRIPTS.validate, ['--sources', sf]);
    expect(r.status, r.out).not.toBe(0);
    for (const f of FILES) expect(r.out, f).toMatch(new RegExp(`${f.replace('.', '\\.')}:\\d+ still contains a TODO placeholder`));
  });

  test('a fully edited scaffold passes validate and builds (end to end)', () => {
    const root = tmp('sc-new-e2e-');
    const sf = writeSources(root, [collectionSource(root)]);
    scaffoldGood(root, sf, { slug: 'e2e-deck' });
    expect(run(SCRIPTS.validate, ['--sources', sf]).status).toBe(0);
    const out = path.join(root, 'site');
    const b = run(SCRIPTS.build, ['--sources', sf, '--out', out]);
    expect(b.status, b.out).toBe(0);
    expect(fs.existsSync(path.join(out, 'zip', 'e2e-deck.zip'))).toBe(true);
  });

  test('package.json wires `npm run new-template` to scripts/new-template.mjs', () => {
    const pkg = JSON.parse(readText(ROOT, 'package.json'));
    expect(pkg.scripts['new-template']).toMatch(/scripts[\\/]new-template\.mjs/);
    expect(fs.existsSync(SCRIPTS.newTemplate)).toBe(true);
    expect(TESTS).toBeTruthy();
  });
});
