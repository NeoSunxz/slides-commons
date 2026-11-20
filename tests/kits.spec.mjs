// Convert kit (site/zip/convert-kit.zip), skills pack (site/zip/slides-commons-skills.zip) and their pages
// (convert/, skills/, EN + zh/). Node-only checks first (zips, tools, builds), then the browser checks.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from './font-cache.mjs';
import {
  ROOT, SITE, makeTempDir, readZip, extractZip, normalizeEol, monitor, settled, zhEnglishRuns, zhNameTokens, hostOf, EXTERNAL_WHITELIST,
} from './helpers.mjs';
import { buildPptx, tinyPng, writeZip, THEME, EXPECT } from './pptx-fixture.mjs';

const KIT = 'convert-kit';
const SKILLS = 'slides-commons-skills';
const SKILL_NAMES = ['slides-commons-deck', 'slides-commons-convert', 'slides-commons-cjk-fonts'];
const URL_BASE = 'https://example.test/sc/';
const CJK = /[　-〿㐀-鿿豈-﫿＀-￯]/;

const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); return d; };
test.afterAll(() => { for (const d of tmps) fs.rmSync(d, { recursive: true, force: true }); });

const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const pagePrompt = (siteDir, rel, id) => {
  const html = fs.readFileSync(path.join(siteDir, ...rel), 'utf8');
  const m = html.match(new RegExp(`<pre id="${id}"[^>]*>([\\s\\S]*?)</pre>`));
  return m ? unescapeHtml(m[1]) : null;
};
const loadZip = (siteDir, name) => {
  const z = readZip(fs.readFileSync(path.join(siteDir, 'zip', `${name}.zip`)));
  const files = new Map(z.entries.filter((e) => !e.isDir).map((e) => [e.name, e.data]));
  return { ...z, files, text: (n) => files.get(n)?.toString('utf8') };
};
function build(args) {
  const out = path.join(tmp('sc-kits-'), 'site');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--out', out, ...args], {
    cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_I18N_DIR: '', SC_SITE_URL: '' }, maxBuffer: 64 * 1024 * 1024,
  });
  expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
  return out;
}
const node = (args, opts = {}) => spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });

// ---------------------------------------------------------------------------
// 1. Zips: structure, integrity, licenses, reproducibility
// ---------------------------------------------------------------------------
test.describe('kit zips', () => {
  test.describe.configure({ mode: 'serial' });
  let kit, skills;
  test.beforeAll(() => { kit = loadZip(SITE, KIT); skills = loadZip(SITE, SKILLS); });

  test('listed in manifest.json under "kits"; zips intact, rooted at their own folder, no unsafe paths', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(SITE, 'manifest.json'), 'utf8'));
    expect(manifest.kits).toEqual([`zip/${KIT}.zip`, `zip/${SKILLS}.zip`]);
    expect(manifest.zips ?? [], 'kits must not be counted as template zips').not.toContain(`zip/${KIT}.zip`);
    for (const [z, root] of [[kit, KIT], [skills, SKILLS]]) {
      expect(z.problems, `${root} zip integrity`).toEqual([]);
      expect(z.entries.filter((e) => !e.name.startsWith(`${root}/`)), `${root}: entries outside the root folder`).toEqual([]);
    }
  });

  test('convert-kit: expected files, licenses, no leftovers', () => {
    const must = [
      'PROMPT.md', 'PROMPT.zh.md', 'README.md', 'LICENSE', 'LICENSE-skill', 'viewport-base.css',
      'tools/pptx-extract.mjs', 'tools/check-template.mjs',
      'spec/design-md.md', 'spec/template-json.md', 'spec/extractor.md', 'spec/font-map.json', 'spec/font-substitution.md',
      'spec/example/design.md', 'spec/example/template.html', 'spec/example/template.json', 'spec/example/LICENSE',
      'deck/PROMPT.md', 'deck/PROMPT.zh.md', 'fonts/embed-cjk.mjs', 'fonts/cjk-ranges.json',
    ];
    expect(must.filter((n) => !kit.files.has(`${KIT}/${n}`)), 'missing files').toEqual([]);
    expect([...kit.files.keys()].filter((n) => /^convert-kit\/fonts\/cjk-licenses\/.+-OFL\.txt$/.test(n)).length, 'CJK OFL licenses').toBeGreaterThanOrEqual(1);
    expect(kit.text(`${KIT}/LICENSE`)).toMatch(/MIT License/);
    expect(kit.text(`${KIT}/LICENSE-skill`)).toMatch(/Zara Zhang/);
    expect(kit.text(`${KIT}/spec/example/LICENSE`)).toMatch(/MIT|Permission is hereby granted/);
    expect(Buffer.compare(kit.files.get(`${KIT}/viewport-base.css`), fs.readFileSync(path.join(ROOT, 'upstream', 'skill', 'viewport-base.css')))).toBe(0);
    expect(kit.files.get(`${KIT}/fonts/embed-cjk.mjs`).equals(fs.readFileSync(path.join(ROOT, 'src', 'embed-cjk.mjs'))), 'embed-cjk.mjs == src/embed-cjk.mjs').toBe(true);
    for (const n of kit.files.keys()) expect(n, 'no placeholder/junk files').not.toMatch(/\.DS_Store|Thumbs\.db|\.orig$|~$/);
  });

  test('skills pack: three skills, README, LICENSE; each skill self-contained with its own licenses', () => {
    expect(kit.files.size).toBeGreaterThan(10);
    for (const n of ['README.md', 'LICENSE']) expect(skills.files.has(`${SKILLS}/${n}`), n).toBe(true);
    expect(skills.text(`${SKILLS}/LICENSE`)).toMatch(/MIT License/);
    const skillDirs = [...new Set([...skills.files.keys()].map((n) => n.split('/')[1]).filter((n) => n && n !== 'README.md' && n !== 'LICENSE'))].sort();
    expect(skillDirs).toEqual([...SKILL_NAMES].sort());
    for (const s of SKILL_NAMES) {
      const base = `${SKILLS}/${s}`;
      expect(skills.files.has(`${base}/SKILL.md`), `${s}/SKILL.md`).toBe(true);
      expect(skills.files.has(`${base}/LICENSE`), `${s}/LICENSE`).toBe(true);
    }
    for (const s of ['slides-commons-deck', 'slides-commons-convert']) {
      expect(skills.files.has(`${SKILLS}/${s}/viewport-base.css`), `${s}/viewport-base.css`).toBe(true);
      expect(skills.text(`${SKILLS}/${s}/LICENSE-skill`), `${s}/LICENSE-skill`).toMatch(/Zara Zhang/);
    }
    for (const s of SKILL_NAMES) {
      expect(skills.files.has(`${SKILLS}/${s}/fonts/embed-cjk.mjs`), `${s}/fonts/embed-cjk.mjs`).toBe(true);
      expect(skills.files.has(`${SKILLS}/${s}/fonts/cjk-ranges.json`), `${s}/fonts/cjk-ranges.json`).toBe(true);
      expect([...skills.files.keys()].some((n) => n.startsWith(`${SKILLS}/${s}/fonts/cjk-licenses/`)), `${s}: CJK OFL licenses`).toBe(true);
    }
    // the convert skill carries the whole kit toolbox
    for (const n of ['tools/pptx-extract.mjs', 'tools/check-template.mjs', 'spec/design-md.md', 'spec/example/LICENSE', 'deck/PROMPT.md']) {
      expect(skills.files.has(`${SKILLS}/slides-commons-convert/${n}`), `convert/${n}`).toBe(true);
    }
    // identical tool bytes in kit and skill
    expect(skills.files.get(`${SKILLS}/slides-commons-convert/tools/pptx-extract.mjs`).equals(kit.files.get(`${KIT}/tools/pptx-extract.mjs`))).toBe(true);
  });

  test('each SKILL.md: YAML frontmatter, name == folder, description non-empty and <= 1024 chars', () => {
    for (const s of SKILL_NAMES) {
      const text = skills.text(`${SKILLS}/${s}/SKILL.md`);
      const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      expect(m, `${s}: frontmatter block at the top`).toBeTruthy();
      const fm = {};
      for (const line of m[1].split(/\r?\n/)) {
        const kv = line.match(/^([A-Za-z_-]+):\s*(.*)$/);
        expect(kv, `${s}: frontmatter line "${line}" is key: value`).toBeTruthy();
        let v = kv[2].trim();
        if (/^".*"$/.test(v)) v = JSON.parse(v); // double-quoted YAML scalar == JSON string for these files
        else if (/^'.*'$/.test(v)) v = v.slice(1, -1).replace(/''/g, "'");
        else expect(v, `${s}: unquoted value must not contain ": " or " #"`).not.toMatch(/: | #/);
        fm[kv[1]] = v;
      }
      expect(fm.name, `${s}: name`).toBe(s);
      expect(fm.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof fm.description).toBe('string');
      expect(fm.description.trim().length, `${s}: description`).toBeGreaterThan(20);
      expect(fm.description.length, `${s}: description length`).toBeLessThanOrEqual(1024);
      expect(text.slice(m[0].length).trim().length, `${s}: body`).toBeGreaterThan(200);
    }
  });

  test('both READMEs are present, English and Chinese, and name every skill / the kit files', () => {
    for (const [z, root] of [[kit, KIT], [skills, SKILLS]]) {
      const t = z.text(`${root}/README.md`);
      expect(t, `${root}/README.md`).toBeTruthy();
      expect(t, `${root} README English`).toMatch(/[A-Za-z]{4,}/);
      expect(CJK.test(t), `${root} README has a Chinese part`).toBe(true);
    }
    for (const s of SKILL_NAMES) expect(skills.text(`${SKILLS}/README.md`), `README names ${s}`).toContain(s);
    for (const n of ['PROMPT.md', 'PROMPT.zh.md', 'tools/pptx-extract.mjs']) expect(kit.text(`${KIT}/README.md`)).toContain(n);
  });

  test('every file referenced in the prompts, READMEs and SKILL.md exists in the zip', () => {
    // Paths the kit ships (resolved against the kit root / the skill folder). Output files the agent creates
    // (extract.json, template.html of the new template, ...) are not in this set on purpose.
    const SHIPPED = /^(?:tools|spec|deck|fonts)\/[A-Za-z0-9_./-]+$|^(?:viewport-base\.css|LICENSE(?:-skill)?|PROMPT(?:\.zh)?\.md|README\.md)$/;
    const OUTPUT = /^fonts\/(fonts\.css|[^/]+\.woff2)$/;
    const check = (label, text, exists, skip = () => false) => {
      const bad = [];
      for (const m of text.matchAll(/`([^`\s]+)`/g)) {
        let t = m[1].replace(/^\.\//, '');
        if (/[<>*{}]/.test(t) || !SHIPPED.test(t) || OUTPUT.test(t) || skip(t)) continue;
        if (t.endsWith('/')) t = t.slice(0, -1);
        if (!exists(t)) bad.push(t);
      }
      expect([...new Set(bad)], `${label}: references to files that are not in the zip`).toEqual([]);
    };
    const kitHas = (t) => kit.files.has(`${KIT}/${t}`) || [...kit.files.keys()].some((n) => n.startsWith(`${KIT}/${t}/`));
    for (const f of ['PROMPT.md', 'PROMPT.zh.md', 'README.md', 'deck/PROMPT.md', 'deck/PROMPT.zh.md']) check(`${KIT}/${f}`, kit.text(`${KIT}/${f}`), kitHas);
    for (const s of SKILL_NAMES) {
      const has = (t) => skills.files.has(`${SKILLS}/${s}/${t}`) || [...skills.files.keys()].some((n) => n.startsWith(`${SKILLS}/${s}/${t}/`));
      // PROMPT.md / README.md named in a SKILL.md are files of the template the skill creates (or of the user's folder), not shipped here.
      check(`${s}/SKILL.md`, skills.text(`${SKILLS}/${s}/SKILL.md`), has, (t) => /^(PROMPT(\.zh)?\.md|README\.md)$/.test(t));
    }
    const anySkillHas = (t) => SKILL_NAMES.some((s) => skills.files.has(`${SKILLS}/${s}/${t}`) || [...skills.files.keys()].some((n) => n.startsWith(`${SKILLS}/${s}/${t}/`)));
    check(`${SKILLS}/README.md`, skills.text(`${SKILLS}/README.md`), (t) => anySkillHas(t) || t === 'LICENSE');
    // the convert skill's SKILL.md also mentions the example's files
    expect(skills.files.has(`${SKILLS}/slides-commons-convert/spec/example/template.html`)).toBe(true);
  });

  test('zip bytes equal a fresh default build (reproducible), and the zips contain no site-URL text', () => {
    const fresh = build([]);
    for (const n of [KIT, SKILLS]) {
      expect(fs.readFileSync(path.join(fresh, 'zip', `${n}.zip`)).equals(fs.readFileSync(path.join(SITE, 'zip', `${n}.zip`))), `${n}.zip: fresh build differs from site/zip`).toBe(true);
    }
    expect(kit.text(`${KIT}/PROMPT.md`)).not.toMatch(/https?:\/\/[^\s)]*\/zip\//);
    for (const s of SKILL_NAMES) expect(skills.text(`${SKILLS}/${s}/SKILL.md`)).not.toMatch(/https?:\/\/[^\s)]*\/zip\//);
  });
});

// ---------------------------------------------------------------------------
// 2. Prompts vs pages; download URL only with --site-url
// ---------------------------------------------------------------------------
test.describe('kit prompts', () => {
  test.describe.configure({ mode: 'serial' });
  test('PROMPT.md / PROMPT.zh.md are byte-equal to the convert page copy text (EN and ZH)', () => {
    const kit = loadZip(SITE, KIT);
    for (const [rel, id, name] of [[['convert', 'index.html'], 'prompt-kit', 'PROMPT.md'], [['zh', 'convert', 'index.html'], 'prompt-kit', 'PROMPT.zh.md']]) {
      const page = pagePrompt(SITE, rel, id);
      expect(page, `${rel.join('/')} #${id}`).toBeTruthy();
      expect(kit.text(`${KIT}/${name}`), `${name} vs ${rel.join('/')}`).toBe(page);
    }
    expect(CJK.test(kit.text(`${KIT}/PROMPT.zh.md`))).toBe(true);
    expect(CJK.test(kit.text(`${KIT}/PROMPT.md`)), 'EN prompt has no Chinese prose').toBe(false);
  });

  test('download URL is in the prompt only with --site-url; page prompt still equals the zip prompt; skills pages likewise', () => {
    const plain = build([]);
    const withUrl = build(['--site-url', URL_BASE]);
    const kitZip = `${URL_BASE}zip/${KIT}.zip`;
    const skillsZip = `${URL_BASE}zip/${SKILLS}.zip`;
    for (const [lang, name, rel] of [['en', 'PROMPT.md', ['convert', 'index.html']], ['zh', 'PROMPT.zh.md', ['zh', 'convert', 'index.html']]]) {
      const a = loadZip(plain, KIT).text(`${KIT}/${name}`);
      const b = loadZip(withUrl, KIT).text(`${KIT}/${name}`);
      expect(a, `${lang} default prompt`).not.toMatch(/example\.test|curl|wget|Invoke-WebRequest/);
      expect(b, `${lang} URL prompt has the kit URL`).toContain(kitZip);
      for (const k of ['curl -fL -o', 'wget -O', 'Invoke-WebRequest']) expect(b, `${lang}: ${k}`).toContain(k);
      expect(pagePrompt(withUrl, rel, 'prompt-kit'), `${lang} page == zip (URL mode)`).toBe(b);
      expect(pagePrompt(plain, rel, 'prompt-kit'), `${lang} page == zip (default)`).toBe(a);
    }
    for (const rel of [['skills', 'index.html'], ['zh', 'skills', 'index.html']]) {
      expect(pagePrompt(withUrl, rel, 'prompt-skills'), `${rel.join('/')} URL mode`).toContain(skillsZip);
      expect(pagePrompt(plain, rel, 'prompt-skills'), `${rel.join('/')} default`).not.toContain('example.test');
    }
    expect(loadZip(withUrl, SKILLS).text(`${SKILLS}/slides-commons-deck/SKILL.md`)).toContain(`${URL_BASE}zip/`);
    expect(loadZip(withUrl, KIT).problems).toEqual([]);
    expect(loadZip(withUrl, SKILLS).problems).toEqual([]);
    // file lists identical: URL mode changes text, not structure (except hosted font shards, which are not in the zips)
    expect(loadZip(withUrl, KIT).entries.map((e) => e.name)).toEqual(loadZip(plain, KIT).entries.map((e) => e.name));
    expect(loadZip(withUrl, SKILLS).entries.map((e) => e.name)).toEqual(loadZip(plain, SKILLS).entries.map((e) => e.name));
  });
});

// ---------------------------------------------------------------------------
// 3. tools/pptx-extract.mjs on a generated fixture
// ---------------------------------------------------------------------------
test.describe('pptx-extract', () => {
  test.describe.configure({ mode: 'serial' });
  let tool, work;
  test.beforeAll(() => {
    work = tmp('sc-pptx-');
    // run the tool exactly as shipped: extracted from the zip
    const kitDir = path.join(tmp('sc-kit-x-'));
    extractZip(loadZip(SITE, KIT).entries, kitDir);
    tool = path.join(kitDir, KIT, 'tools', 'pptx-extract.mjs');
    fs.writeFileSync(path.join(work, 'deck.pptx'), buildPptx());
    fs.writeFileSync(path.join(work, 'cut.pptx'), buildPptx({ truncateSlide2: true }));
  });
  const run = (...args) => node([tool, ...args], { cwd: work });

  test('exit 0; extract.json has theme colours, theme fonts, fonts used, 3 slides, canvas 1920x1080', () => {
    const out = path.join(work, 'out');
    const r = run(path.join(work, 'deck.pptx'), '--out', out, '--media');
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/Slides: 3/);
    const j = JSON.parse(fs.readFileSync(path.join(out, 'extract.json'), 'utf8'));
    expect(fs.existsSync(path.join(out, 'summary.md'))).toBe(true);
    expect(j.canvas).toMatchObject({ width: 1920, height: 1080, letterboxed: false });
    for (const [k, v] of Object.entries(THEME.colors)) expect(j.theme.colors[k], `theme colour ${k}`).toBe(`#${v}`);
    expect(j.theme.fonts.major).toMatchObject({ latin: THEME.major, ea: THEME.ea });
    expect(j.theme.fonts.minor).toMatchObject({ latin: THEME.minor, ea: THEME.ea });
    const used = Object.fromEntries(j.fontsUsed.map((f) => [f.typeface, f]));
    expect(Object.keys(used).sort()).toEqual(['Calibri', 'Georgia', 'Microsoft YaHei']);
    expect(used['Microsoft YaHei'].suggestion.use).toBe('Noto Sans SC');
    expect(used.Georgia.slides).toEqual([1]);
    expect(j.slides).toHaveLength(3);
    expect(j.warnings, 'no warnings on a valid deck').toEqual([]);
    expect(j.colorsUsed.map((c) => c.hex)).toEqual(expect.arrayContaining(['#E4572E', '#1F2A44', '#EEF1F6']));
  });

  test('shapes: 1920x1080 coordinates, text runs (size px, bold, colour, font), CJK text intact, picture + media', () => {
    const out = path.join(work, 'out2');
    expect(run(path.join(work, 'deck.pptx'), '--out', out, '--media').status).toBe(0);
    const j = JSON.parse(fs.readFileSync(path.join(out, 'extract.json'), 'utf8'));
    const [s1, s2, s3] = j.slides;
    const title = s1.shapes.find((s) => s.name === 'Title 1');
    expect(title).toMatchObject({ kind: 'placeholder', placeholder: { type: 'title' }, x: EXPECT.title.x, y: EXPECT.title.y, w: EXPECT.title.w, h: EXPECT.title.h });
    expect(title.text.paragraphs[0].runs[0]).toMatchObject({ text: 'Quarterly Review', size: EXPECT.title.sizePx, bold: true, color: '#E4572E', font: { latin: 'Georgia' } });
    const bar = s1.shapes.find((s) => s.name === 'Accent bar');
    expect(bar).toMatchObject({ kind: 'shape', x: 0, y: 0, w: 40, h: 1080, geometry: 'rect', fill: { type: 'solid', color: '#E4572E' } });
    const pic = s1.shapes.find((s) => s.kind === 'picture');
    expect(pic).toMatchObject({ x: EXPECT.picture.x, y: EXPECT.picture.y, w: EXPECT.picture.w, h: EXPECT.picture.h, alt: 'logo', image: { media: 'ppt/media/image1.png' } });
    expect(s1.background, 'background inherited from the master').toMatchObject({ type: 'solid', color: '#EEF1F6', from: 'master' });

    const cjk = s2.shapes.find((s) => s.name === 'Heading').text.paragraphs[0].runs[0];
    expect(cjk).toMatchObject({ text: EXPECT.cjk, size: 72, font: { latin: 'Calibri', ea: 'Microsoft YaHei' } });
    const body = s2.shapes.find((s) => s.name === 'Body').text.paragraphs.map((p) => p.text);
    expect(body).toEqual(['Revenue grew 24%', '利润率提升']);
    expect(s3.shapes[0].text.paragraphs[0].runs[0]).toMatchObject({ text: 'Thank you', size: 120, color: '#1F2A44' });

    expect(j.media).toHaveLength(1);
    expect(j.media[0]).toMatchObject({ file: 'ppt/media/image1.png', width: 2, height: 2, exported: 'media/image1.png' });
    expect(j.media[0].usedBy).toEqual(['slide 1']);
    expect(fs.readFileSync(path.join(out, 'media', 'image1.png')).equals(tinyPng()), 'exported image is byte-identical').toBe(true);
    // the summary mentions the same facts a reader (the agent) will use
    const md = fs.readFileSync(path.join(out, 'summary.md'), 'utf8');
    expect(md).toContain('中文标题：增长与复盘');
    expect(md).toMatch(/@120,80 1200x160/);
  });

  test('without --media no media/ folder; --json prints the whole JSON on stdout', () => {
    const out = path.join(work, 'out3');
    const r = run(path.join(work, 'deck.pptx'), '--out', out, '--json');
    expect(r.status, r.stderr).toBe(0);
    expect(fs.existsSync(path.join(out, 'media'))).toBe(false);
    const j = JSON.parse(r.stdout.slice(r.stdout.indexOf('{'), r.stdout.lastIndexOf('}') + 1));
    expect(j.slides).toHaveLength(3);
  });

  test('a 4:3 deck is letterboxed onto the 1920x1080 canvas', () => {
    const buf = buildPptx();
    // Rewrite presentation.xml with a 4:3 slide size by rebuilding via the same zip writer.
    const z = readZip(buf);
    const files = z.entries.filter((e) => !e.isDir).map((e) => [e.name, e.name === 'ppt/presentation.xml' ? Buffer.from(e.data.toString('utf8').replace('cx="12192000" cy="6858000"', 'cx="9144000" cy="6858000"')) : e.data]);
    fs.writeFileSync(path.join(work, 'four3.pptx'), writeZip(files));
    const out = path.join(work, 'out43');
    expect(run(path.join(work, 'four3.pptx'), '--out', out).status).toBe(0);
    const j = JSON.parse(fs.readFileSync(path.join(out, 'extract.json'), 'utf8'));
    expect(j.canvas.letterboxed).toBe(true);
    expect(j.canvas.offsetX).toBeGreaterThan(0);
    const bar = j.slides[0].shapes.find((s) => s.name === 'Accent bar');
    expect(bar.h, 'scaled to the canvas height').toBe(1080);
    expect(bar.x, 'shifted by the letterbox offset').toBeGreaterThan(0);
  });

  test('exit codes: no args 1; --help 0; missing file 2; not a zip 2; legacy .ppt 2; truncated slide XML 3 (output still written, warning names the part)', () => {
    let r = run();
    expect(r.status, `no args: ${r.stdout}${r.stderr}`).toBe(1);
    expect(r.stderr + r.stdout).toMatch(/usage/i);
    expect(run('--help').status).toBe(0);

    r = run(path.join(work, 'does-not-exist.pptx'), '--out', path.join(work, 'o-missing'));
    expect(r.status, r.stderr).toBe(2);
    expect(r.stderr).toMatch(/error/i);

    fs.writeFileSync(path.join(work, 'notzip.pptx'), 'this is plain text, not a zip file\n'.repeat(20));
    r = run(path.join(work, 'notzip.pptx'), '--out', path.join(work, 'o-notzip'));
    expect(r.status, r.stderr).toBe(2);
    expect(r.stderr).toMatch(/zip/i);

    fs.writeFileSync(path.join(work, 'old.ppt'), Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(600)]));
    r = run(path.join(work, 'old.ppt'), '--out', path.join(work, 'o-old'));
    expect(r.status, r.stderr).toBe(2);
    expect(r.stderr).toMatch(/\.ppt|binary|password/i);

    // a zip that is not a presentation
    fs.writeFileSync(path.join(work, 'empty.pptx'), writeZip([['hello.txt', 'hi']]));
    expect(run(path.join(work, 'empty.pptx'), '--out', path.join(work, 'o-empty')).status).toBe(2);

    const out = path.join(work, 'o-cut');
    r = run(path.join(work, 'cut.pptx'), '--out', out);
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(3);
    const j = JSON.parse(fs.readFileSync(path.join(out, 'extract.json'), 'utf8'));
    expect(j.warnings.join('\n')).toMatch(/slide2\.xml/);
    expect(j.slides, 'the other slides are still extracted').toHaveLength(3);
    expect(j.slides[0].shapes.length).toBeGreaterThan(0);
    expect(r.stdout).toMatch(/## Warnings/);
    expect(JSON.stringify(j.slides[2])).toContain('Thank you');
  });

  test('never modifies the input file', () => {
    const f = path.join(work, 'deck.pptx');
    const before = fs.readFileSync(f);
    expect(run(f, '--out', path.join(work, 'o-ro')).status).toBe(0);
    expect(fs.readFileSync(f).equals(before)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. tools/check-template.mjs
// ---------------------------------------------------------------------------
test.describe('check-template', () => {
  test.describe.configure({ mode: 'serial' });
  let tool, example, root;
  test.beforeAll(() => {
    root = tmp('sc-check-');
    const kitDir = path.join(root, 'kit');
    extractZip(loadZip(SITE, KIT).entries, kitDir);
    tool = path.join(kitDir, KIT, 'tools', 'check-template.mjs');
    // As the builder described: the example's own files + viewport-base.css next to them, in a folder named by the slug.
    example = path.join(root, 'minimal-pitch');
    fs.mkdirSync(example);
    for (const f of ['design.md', 'template.html', 'template.json']) fs.copyFileSync(path.join(kitDir, KIT, 'spec', 'example', f), path.join(example, f));
    fs.copyFileSync(path.join(kitDir, KIT, 'viewport-base.css'), path.join(example, 'viewport-base.css'));
  });
  const check = (dir) => node([tool, dir], { cwd: root });
  const copyTo = (name, mutate) => {
    const d = path.join(root, name);
    fs.cpSync(example, d, { recursive: true });
    mutate(d);
    return d;
  };

  test('passes on the example (exit 0, "OK", no ERROR lines)', () => {
    const r = check(example);
    expect(r.status, r.stdout + r.stderr).toBe(0);
    expect(r.stdout).toMatch(/^OK: no errors/m);
    expect(r.stdout).not.toMatch(/^ERROR/m);
  });

  test('fails (exit 1) on broken copies, naming the problem', () => {
    const cases = [
      ['no-json', (d) => fs.rmSync(path.join(d, 'template.json')), /template\.json is missing/],
      ['bad-json', (d) => fs.writeFileSync(path.join(d, 'template.json'), '{ not json'), /not valid JSON/],
      ['bad-scheme', (d) => { const p = path.join(d, 'template.json'); const j = JSON.parse(fs.readFileSync(p, 'utf8')); j.scheme = 'purple'; fs.writeFileSync(p, JSON.stringify(j)); }, /"scheme" has an invalid value/],
      ['extra-field', (d) => { const p = path.join(d, 'template.json'); const j = JSON.parse(fs.readFileSync(p, 'utf8')); j.bogus = 1; fs.writeFileSync(p, JSON.stringify(j)); }, /unknown field "bogus"/],
      ['no-frontmatter', (d) => { const p = path.join(d, 'design.md'); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/^---[\s\S]*?\n---\n/, '')); }, /no YAML front matter/],
      ['no-fixed-stage', (d) => { const p = path.join(d, 'design.md'); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/^(#{1,6}.*)Fixed[- ]Stage(.*)$/gim, '$1Something$2')); }, /Fixed-Stage Policy/],
      ['script-src', (d) => { const p = path.join(d, 'template.html'); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('</head>', '<script src="deck.js"></script></head>')); }, /loads a script file/],
      ['cdn-request', (d) => { const p = path.join(d, 'template.html'); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('</head>', '<link rel="stylesheet" href="https://evil.example/x.css"></head>')); }, /not a font service|only Google Fonts/],
      ['no-slides', (d) => { const p = path.join(d, 'template.html'); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/<section\b/g, '<div').replace(/<\/section>/g, '</div>')); }, /no <section class="slide"> elements/],
      ['placeholder', (d) => { const p = path.join(d, 'template.html'); fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('</body>', '<p>TODO later</p></body>')); }, /placeholder text/],
      ['viewport-base-not-inlined', (d) => fs.appendFileSync(path.join(d, 'viewport-base.css'), '\n.sc-test-extra{color:red}\n'), /viewport-base\.css is not inlined/],
    ];
    for (const [name, mutate, re] of cases) {
      const d = copyTo(`broken-${name}`, mutate);
      const r = check(d);
      expect(r.status, `${name}: ${r.stdout}`).toBe(1);
      expect(r.stdout, name).toMatch(/^ERROR/m);
      expect(r.stdout, name).toMatch(re);
      expect(r.stdout, name).toMatch(/\d+ error\(s\)/);
    }
  });

  test('missing viewport-base.css is only a warning; usage error / missing folder exit 2', () => {
    const d = copyTo('no-base', (x) => fs.rmSync(path.join(x, 'viewport-base.css')));
    const r = check(d);
    expect(r.status, r.stdout).toBe(0);
    expect(r.stdout).toMatch(/^warning .*viewport-base\.css is missing/m);
    expect(node([tool], { cwd: root }).status).toBe(2);
    expect(check(path.join(root, 'no-such-folder')).status).toBe(2);
    expect(check(path.join(example, 'template.json')).status, 'a file, not a folder').toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 5. Pages: convert/ and skills/ (EN + ZH)
// ---------------------------------------------------------------------------
const PAGES = {
  en: { prefix: '', nav: ['Home', 'Gallery', 'Convert', 'Skills', 'Credits'], pages: { convert: 'convert/', skills: 'skills/' }, lang: 'en' },
  zh: { prefix: 'zh/', nav: ['首页', '画廊', '转换', '技能', '致谢'], pages: { convert: 'zh/convert/', skills: 'zh/skills/' }, lang: 'zh-CN' },
};
const COPY = { convert: 'prompt-kit', skills: 'prompt-skills' };
const NAV_PATHS = (prefix) => [`${prefix}index.html`, `${prefix}gallery/`, `${prefix}convert/`, `${prefix}skills/`, `${prefix}credits.html`];
const CURRENT = { convert: 2, skills: 3 };

for (const [lang, L] of Object.entries(PAGES)) {
  for (const [kind, url] of Object.entries(L.pages)) {
    test.describe(`${kind} page [${lang}]`, () => {
      test('loads: lang attribute, one h1, no console errors / failed requests, no off-whitelist hosts, no external request from the page', async ({ page, baseURL }) => {
        const log = monitor(page);
        await page.goto(url);
        await expect(page.locator('html')).toHaveAttribute('lang', L.lang);
        await expect(page.locator('h1')).toHaveCount(1);
        await settled(log, expect);
        expect(log.consoleErrors, 'console errors').toEqual([]);
        expect(log.pageErrors, 'page errors').toEqual([]);
        expect(log.failed, 'failed requests').toEqual([]);
        expect(log.badStatus, 'HTTP >= 400').toEqual([]);
        const own = new URL(baseURL).host;
        const external = log.requests.filter((r) => /^https?:/.test(r.url) && new URL(r.url).host !== own);
        expect(external.filter((r) => !EXTERNAL_WHITELIST.includes(hostOf(r.url))).map((r) => r.url), 'off-whitelist').toEqual([]);
        expect(external.filter((r) => r.isMain).map((r) => r.url), 'external requests from the page itself').toEqual([]);
      });

      test('header nav: five links in order, hrefs point at the right pages (all 200), current page marked, language switch goes to the counterpart', async ({ page, baseURL }) => {
        await page.goto(url);
        const links = page.locator('header.site-header nav.site-nav > a:not(.gh-link)');
        await expect(links).toHaveCount(5);
        expect((await links.allTextContents()).map((t) => t.trim())).toEqual(L.nav);
        const resolved = await links.evaluateAll((as) => as.map((a) => a.href));
        const expected = NAV_PATHS(L.prefix).map((p) => new URL(p, baseURL).href);
        // directory links may be written with or without index.html
        const norm = (u) => u.replace(/index\.html$/, '');
        expect(resolved.map(norm)).toEqual(expected.map(norm));
        for (const href of resolved) {
          const res = await page.request.get(href);
          expect(res.status(), href).toBe(200);
        }
        const current = await page.locator('header.site-header [aria-current="page"]').evaluateAll((els) => els.filter((e) => e.tagName === 'A').map((e) => e.textContent.trim()));
        expect(current).toEqual([L.nav[CURRENT[kind]]]);
        const sw = page.locator('header.site-header a[data-lang-switch]');
        await expect(sw).toHaveCount(1);
        const counterpart = new URL(await sw.evaluate((a) => a.href));
        expect(counterpart.pathname.endsWith(`/${(lang === 'en' ? PAGES.zh : PAGES.en).pages[kind]}index.html`) || counterpart.pathname.endsWith(`/${(lang === 'en' ? PAGES.zh : PAGES.en).pages[kind]}`)).toBe(true);
        await sw.click();
        await expect(page.locator('html')).toHaveAttribute('lang', lang === 'en' ? 'zh-CN' : 'en');
        await expect(page.locator('header.site-header [aria-current="page"]').filter({ hasText: (lang === 'en' ? PAGES.zh : PAGES.en).nav[CURRENT[kind]] })).toHaveCount(1);
        // brand link and the GitHub link
        await page.goto(url);
        await expect(page.locator('a.gh-link')).toHaveAttribute('href', 'https://github.com/NeoSunxz/slides-commons');
      });

      test('copy button: puts exactly the prompt on the clipboard', async ({ page, context, baseURL }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseURL).origin });
        await page.goto(url);
        const id = COPY[kind];
        const btn = page.locator('[data-copy]');
        await expect(btn).toHaveCount(1);
        await expect(btn).toHaveAttribute('data-copy', id);
        await expect(btn).toBeVisible();
        const expected = await page.locator(`pre#${id}`).evaluate((el) => el.textContent);
        expect(expected.length).toBeGreaterThan(200);
        await page.evaluate(() => navigator.clipboard.writeText('__sentinel__'));
        await btn.click();
        await expect(page.locator('.copy-status')).not.toBeEmpty();
        const clip = await page.evaluate(() => navigator.clipboard.readText());
        expect(clip).not.toBe('__sentinel__');
        expect(normalizeEol(clip)).toBe(normalizeEol(expected));
        if (kind === 'convert') {
          const kit = loadZip(SITE, KIT);
          expect(normalizeEol(clip), 'clipboard == zip prompt').toBe(normalizeEol(kit.text(`${KIT}/${lang === 'en' ? 'PROMPT.md' : 'PROMPT.zh.md'}`)));
        }
      });

      test('download links point at an existing zip that matches site/zip', async ({ page, baseURL }) => {
        await page.goto(url);
        const zipName = kind === 'convert' ? `${KIT}.zip` : `${SKILLS}.zip`;
        const hrefs = await page.locator('a[href$=".zip"]').evaluateAll((as) => as.map((a) => a.href));
        expect(hrefs.length).toBeGreaterThan(0);
        for (const h of hrefs) {
          expect(h.endsWith(`/zip/${zipName}`), h).toBe(true);
          const res = await page.request.get(h);
          expect(res.status()).toBe(200);
          expect((await res.body()).equals(fs.readFileSync(path.join(SITE, 'zip', zipName)))).toBe(true);
        }
      });

      for (const [w, h] of [[390, 844], [1440, 900]]) {
        test(`no horizontal overflow at ${w}x${h}`, async ({ page }) => {
          await page.setViewportSize({ width: w, height: h });
          await page.goto(url);
          await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
          const over = await page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            return [...document.querySelectorAll('body *')].filter((el) => {
              if (el.closest('pre, .kit-prompt')) return false; // scrolls inside its own box
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.right > vw + 1 && getComputedStyle(el).position !== 'fixed';
            }).slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${el.className} right=${Math.round(el.getBoundingClientRect().right)}`);
          });
          expect(over, `elements wider than the ${w}px viewport`).toEqual([]);
        });
      }

      test('language purity: no Chinese on EN, no run of 3+ English words on ZH (outside code / prompt / lang="en")', async ({ page }) => {
        await page.goto(url);
        // open the prompt so the visible-text walk could see it; it is excluded below (it is a prompt, checked separately)
        const texts = await page.evaluate(() => {
          const out = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const text = n.textContent.replace(/\s+/g, ' ').trim();
            const el = n.parentElement;
            if (!text || !el || el.closest('script,style,noscript,pre,code')) continue;
            out.push({ text, lang: el.closest('[lang]')?.getAttribute('lang') ?? '', inSwitch: !!el.closest('[data-lang-switch]'), tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 30) });
          }
          for (const el of document.querySelectorAll('[aria-label],[title],[alt]')) {
            for (const a of ['aria-label', 'title', 'alt']) {
              const v = el.getAttribute(a);
              if (v?.trim()) out.push({ text: v.trim(), lang: el.closest('[lang]')?.getAttribute('lang') ?? '', inSwitch: !!el.closest('[data-lang-switch]'), tag: `${el.tagName.toLowerCase()}@${a}`, cls: '' });
            }
          }
          const meta = document.querySelector('meta[name="description"]')?.content;
          if (meta) out.push({ text: meta, lang: document.documentElement.lang, inSwitch: false, tag: 'meta', cls: 'description' });
          out.push({ text: document.title, lang: document.documentElement.lang, inSwitch: false, tag: 'title', cls: '' });
          return out;
        });
        const bad = [];
        const extra = zhNameTokens();
        for (const t of texts) {
          if (lang === 'en') {
            if (CJK.test(t.text) && !t.inSwitch) bad.push(`<${t.tag}> ${t.text.slice(0, 80)}`);
          } else {
            if (t.lang.startsWith('en')) continue;
            const runs = zhEnglishRuns(t.text, extra);
            if (runs.length) bad.push(`<${t.tag}> .${t.cls}: ${t.text.slice(0, 80)} [English: ${runs.join(' | ').slice(0, 60)}]`);
          }
        }
        expect(bad).toEqual([]);
        // the prompt on the page is in the page's language
        const prompt = await page.locator(`pre#${COPY[kind]}`).evaluate((el) => el.textContent);
        if (lang === 'en') expect(CJK.test(prompt.replace(/[^\n]*(Chinese|中文)[^\n]*/g, '')), 'EN prompt body has no CJK prose (lines naming Chinese excluded)').toBe(false);
        else expect(CJK.test(prompt), 'ZH prompt is Chinese').toBe(true);
      });
    });
  }
}

test('home: the process section links to the convert and skills pages (EN + ZH)', async ({ page }) => {
  for (const [lang, L] of Object.entries(PAGES)) {
    await page.goto(`${L.prefix}index.html`);
    for (const sub of ['convert/', 'skills/']) {
      const links = await page.locator(`main a[href*="${sub}"]`).evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(links.length, `${lang} home links to ${sub}`).toBeGreaterThan(0);
      const res = await page.request.get(new URL(links[0], page.url()).href);
      expect(res.status(), `${lang} ${sub}`).toBe(200);
    }
  }
});

// ---------------------------------------------------------------------------
// 6. Home on a phone: every chapter fills at least the viewport height
// ---------------------------------------------------------------------------
for (const [lang, L] of Object.entries(PAGES)) {
  test(`home [${lang}] at 390x844: every chapter is at least as tall as the viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${L.prefix}index.html`);
    const info = await page.evaluate(() => ({
      vh: window.innerHeight,
      chapters: [...document.querySelectorAll('section.home-chapter')].map((s) => ({ id: s.id || s.className, h: s.getBoundingClientRect().height })),
    }));
    expect(info.chapters.length).toBe(5);
    for (const c of info.chapters) expect(c.h, `chapter ${c.id} (${c.h}px) vs viewport ${info.vh}px`).toBeGreaterThanOrEqual(info.vh - 1);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
}
