// Convert kit / skills update: checker rules, images.md, kit example, Inter Tight, key wording (EN + ZH),
// and the Latin-tracking rule in the four business templates (zh copy, computed styles).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { test, expect } from './font-cache.mjs';
import { ROOT, SITE, makeTempDir, readZip, extractZip } from './helpers.mjs';

const KIT = 'convert-kit';
const SKILLS = 'slides-commons-skills';
const EXAMPLE_DIR = path.join(ROOT, 'collections', 'style-presets', 'templates', 'minimal-pitch');
const FOUR = ['minimal-pitch', 'consulting-report', 'boardroom-quarterly', 'tech-blue-business'];

const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); return d; };
test.afterAll(() => { for (const d of tmps) fs.rmSync(d, { recursive: true, force: true }); });

const loadZip = (name) => {
  const z = readZip(fs.readFileSync(path.join(SITE, 'zip', `${name}.zip`)));
  const files = new Map(z.entries.filter((e) => !e.isDir).map((e) => [e.name, e.data]));
  return { ...z, files, text: (n) => files.get(n)?.toString('utf8') };
};
const node = (args, opts = {}) => spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
const flat = (s) => s.replace(/\s+/g, ' ');

// ---------------------------------------------------------------------------
// 1. check-template: accept / reject, 3 MB warning, decorative-colors
// ---------------------------------------------------------------------------
test.describe('check-template (leftovers, size, decorative-colors)', () => {
  test.describe.configure({ mode: 'serial' });
  let tool, example, root;
  test.beforeAll(() => {
    root = tmp('sc-chk2-');
    const kitDir = path.join(root, 'kit');
    extractZip(loadZip(KIT).entries, kitDir);
    tool = path.join(kitDir, KIT, 'tools', 'check-template.mjs');
    example = path.join(root, 'minimal-pitch');
    fs.mkdirSync(example);
    for (const f of ['design.md', 'template.html', 'template.json']) fs.copyFileSync(path.join(kitDir, KIT, 'spec', 'example', f), path.join(example, f));
    fs.copyFileSync(path.join(kitDir, KIT, 'viewport-base.css'), path.join(example, 'viewport-base.css'));
  });
  let n = 0;
  const variant = (edit) => {
    const d = path.join(root, `v${n++}`, 'minimal-pitch');
    fs.mkdirSync(path.dirname(d));
    fs.cpSync(example, d, { recursive: true });
    edit(d);
    return node([tool, d], { cwd: root });
  };
  const editFile = (name, fn) => (d) => { const p = path.join(d, name); fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); };
  const addToHtmlBody = (s) => (h) => h.replace('</body>', `${s}\n</body>`);

  test('baseline example: OK, no warning about size or decorative-colors', () => {
    const r = variant(() => {});
    expect(r.status, r.stdout).toBe(0);
    expect(r.stdout).not.toMatch(/3 MB|decorative-colors/);
  });

  test('the word "placeholder" in a class name and in prose is accepted', () => {
    const r = variant((d) => {
      editFile('template.html', addToHtmlBody('<div class="photo-placeholder" style="display:none">photo slot</div>'))(d);
      editFile('design.md', (m) => `${m}\n\nPhoto slots are drawn as a neutral placeholder rectangle in the palette.\n`)(d);
    });
    expect(r.status, r.stdout).toBe(0);
    expect(r.stdout).not.toMatch(/^ERROR/m);
  });

  for (const [label, text] of [['TODO', 'TODO write this'], ['TBD', 'Revenue TBD'], ['lorem ipsum', 'Lorem ipsum dolor sit amet'], ['[PLACEHOLDER]', '[PLACEHOLDER]']]) {
    test(`rejects "${label}" in template.html (exit 1, ERROR names leftover)`, () => {
      const r = variant(editFile('template.html', addToHtmlBody(`<p style="display:none">${text}</p>`)));
      expect(r.status, r.stdout).toBe(1);
      expect(r.stdout).toMatch(/^ERROR.*leftover placeholder/mi);
    });
    test(`rejects "${label}" in design.md (exit 1)`, () => {
      const r = variant(editFile('design.md', (m) => `${m}\n\n${text}\n`));
      expect(r.status, r.stdout).toBe(1);
      expect(r.stdout).toMatch(/^ERROR.*design\.md line \d+: leftover/mi);
    });
  }

  test('warns (does not fail) when template.html is above 3 MB', () => {
    const r = variant(editFile('template.html', (h) => `${h}\n<!-- ${'x'.repeat(3.2 * 1024 * 1024)} -->\n`));
    expect(r.status, r.stdout).toBe(0);
    expect(r.stdout).toMatch(/^warning .*above 3 MB/m);
    expect(r.stdout).not.toMatch(/^ERROR/m);
  });

  test('no size warning just below 3 MB', () => {
    const r = variant(editFile('template.html', (h) => `${h}\n<!-- ${'x'.repeat(2.5 * 1024 * 1024)} -->\n`));
    expect(r.status, r.stdout).toBe(0);
    expect(r.stdout).not.toMatch(/above 3 MB/);
  });

  test('decorative-colors: a name that is in colors passes, an unknown one warns (exit 0)', () => {
    const ok = variant(editFile('design.md', (m) => m.replace(/^colors:/m, 'decorative-colors: [ink-faint, rule]\ncolors:')));
    expect(ok.status, ok.stdout).toBe(0);
    expect(ok.stdout).not.toMatch(/decorative-colors/);
    const bad = variant(editFile('design.md', (m) => m.replace(/^colors:/m, 'decorative-colors: [ink-faint, ghostly]\ncolors:')));
    expect(bad.status, bad.stdout).toBe(0);
    expect(bad.stdout).toMatch(/^warning .*decorative-colors.*ghostly/m);
    expect(bad.stdout).not.toMatch(/decorative-colors.*ink-faint/);
  });
});

// ---------------------------------------------------------------------------
// 2. images.md and the kit example
// ---------------------------------------------------------------------------
test.describe('images.md and example', () => {
  test('spec/images.md is in the convert kit and the convert skill, same bytes as the source', () => {
    const src = fs.readFileSync(path.join(ROOT, 'kits', 'convert', 'spec', 'images.md'));
    expect(src.length).toBeGreaterThan(500);
    const kit = loadZip(KIT);
    const skills = loadZip(SKILLS);
    expect(kit.files.get(`${KIT}/spec/images.md`)?.equals(src), 'kit images.md').toBe(true);
    expect(skills.files.get(`${SKILLS}/slides-commons-convert/spec/images.md`)?.equals(src), 'skill images.md').toBe(true);
    expect(skills.files.has(`${SKILLS}/slides-commons-deck/spec/images.md`), 'deck skill does not need it').toBe(false);
  });

  test('kit and skill example files are byte-identical to the gallery minimal-pitch template', () => {
    const kit = loadZip(KIT);
    const skills = loadZip(SKILLS);
    for (const f of ['design.md', 'template.html', 'template.json']) {
      const src = fs.readFileSync(path.join(EXAMPLE_DIR, f));
      expect(kit.files.get(`${KIT}/spec/example/${f}`)?.equals(src), `kit example ${f}`).toBe(true);
      expect(skills.files.get(`${SKILLS}/slides-commons-convert/spec/example/${f}`)?.equals(src), `skill example ${f}`).toBe(true);
    }
    expect(JSON.parse(kit.text(`${KIT}/spec/example/template.json`)).slug).toBe('minimal-pitch');
    expect(fs.existsSync(path.join(ROOT, 'kits', 'convert', 'example')), 'old kits/convert/example/ is gone').toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. Inter Tight: font-map entries and hosting
// ---------------------------------------------------------------------------
test.describe('Inter Tight', () => {
  const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'convert', 'spec', 'font-map.json'), 'utf8'));
  const entry = (name) => map.fonts.find((f) => f.match.some((m) => m.toLowerCase() === name.toLowerCase()));

  test('tight display grotesks map to Inter Tight with a Google spec', () => {
    for (const n of ['Helvetica Now Display', 'Neue Haas Grotesk Display', 'Neue Montreal', 'Aeonik', 'General Sans', 'SF Pro Display']) {
      const e = entry(n);
      expect(e, `font-map entry for ${n}`).toBeTruthy();
      expect(e.use).toBe('Inter Tight');
      expect(e.google).toMatch(/^Inter\+Tight:wght@/);
      expect(e.embed, 'Latin family, not a CJK embed').toBe(false);
    }
  });

  test('the package is a devDependency and installed with woff2 files', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.devDependencies['@fontsource/inter-tight']).toBeTruthy();
    const files = path.join(ROOT, 'node_modules', '@fontsource', 'inter-tight', 'files');
    for (const w of ['400', '700']) for (const s of ['latin', 'latin-ext']) {
      expect(fs.existsSync(path.join(files, `inter-tight-${s}-${w}-normal.woff2`)), `${s} ${w}`).toBe(true);
    }
  });

  test('a site-URL build hosts Inter Tight under fonts/latin/static/inter-tight with a licence', () => {
    const out = path.join(tmp('sc-intertight-'), 'site');
    const r = node([path.join(ROOT, 'scripts', 'build.mjs'), '--out', out, '--site-url', 'https://site.example/slides-commons/'], {
      cwd: ROOT, env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_I18N_DIR: '', SC_SITE_URL: '' },
    });
    expect(r.status, r.stdout + r.stderr).toBe(0);
    const d = path.join(out, 'fonts', 'latin', 'static', 'inter-tight');
    expect(fs.existsSync(d), 'inter-tight dir').toBe(true);
    const names = fs.readdirSync(d);
    for (const w of ['400', '700']) for (const s of ['latin', 'latin-ext']) {
      const f = `inter-tight-${s}-${w}-normal.woff2`;
      expect(names, f).toContain(f);
      expect(fs.readFileSync(path.join(d, f)).subarray(0, 4).toString('latin1'), `${f} is woff2`).toBe('wOF2');
    }
    expect(names.some((n) => /OFL|LICENSE/i.test(n)), 'licence file').toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Prompt / SKILL wording (loose, meaning-based)
// ---------------------------------------------------------------------------
test.describe('wording', () => {
  let kit, skills, tpl;
  test.beforeAll(() => { kit = loadZip(KIT); skills = loadZip(SKILLS); tpl = loadZip('neo-grid-bold'); });

  const convertEn = () => [['kit PROMPT.md', kit.text(`${KIT}/PROMPT.md`)], ['convert SKILL.md', skills.text(`${SKILLS}/slides-commons-convert/SKILL.md`)]];

  test('convert (EN): logo/wordmark kept by default, keep-photos option, stand-in wording', () => {
    for (const [name, raw] of convertEn()) {
      const t = flat(raw);
      expect(t, `${name}: logo kept by default`).toMatch(/logo and wordmark/i);
      expect(t, `${name}: logo in the default-keep list`).toMatch(/(by default|default)[^.]{0,200}logo|logo[^.]{0,200}(by default|default|kept)/i);
      expect(t, `${name}: keep content photos option`).toMatch(/keep (the )?content photo|keep them|content photos? (too|as well)|keep content photographs/i);
      expect(t, `${name}: stand-in wording`).toMatch(/stand-in/i);
      expect(t, `${name}: no "logos are dropped"`).not.toMatch(/logos? (is|are) (always )?(dropped|removed)/i);
      expect(t, `${name}: mentions images.md`).toMatch(/images\.md/);
    }
  });

  test('convert (ZH prompt): logo kept by default, keep-photos option, stand-in wording', () => {
    const t = flat(kit.text(`${KIT}/PROMPT.zh.md`));
    expect(t).toMatch(/默认保留[^。]{0,120}标志/);
    expect(t).toMatch(/连内容照片一起保留|保留内容照片/);
    expect(t).toMatch(/stand-in|占位/);
    expect(t).not.toMatch(/标志[^。]{0,10}(一律|都)(丢弃|去掉)/);
  });

  test('re-run order: Latin first, CJK second (EN and ZH, kit prompts, deck prompts, skills)', () => {
    const en = [
      kit.text(`${KIT}/PROMPT.md`), kit.text(`${KIT}/deck/PROMPT.md`),
      skills.text(`${SKILLS}/slides-commons-deck/SKILL.md`), skills.text(`${SKILLS}/slides-commons-convert/SKILL.md`),
      skills.text(`${SKILLS}/slides-commons-convert/deck/PROMPT.md`),
    ];
    for (const raw of en) expect(flat(raw)).toMatch(/Latin first[^.]{0,40}CJK second|Latin script first|Latin first/i);
    for (const raw of [kit.text(`${KIT}/PROMPT.zh.md`), kit.text(`${KIT}/deck/PROMPT.zh.md`), skills.text(`${SKILLS}/slides-commons-convert/deck/PROMPT.zh.md`)]) {
      expect(flat(raw)).toMatch(/先拉丁[、，,]?\s*后\s*CJK/);
    }
  });

  test('deck prompts mark Latin display words in Chinese decks (lang="en" / .latin, own letter-spacing)', () => {
    const en = [kit.text(`${KIT}/deck/PROMPT.md`), skills.text(`${SKILLS}/slides-commons-deck/SKILL.md`), skills.text(`${SKILLS}/slides-commons-convert/deck/PROMPT.md`)];
    for (const raw of en) {
      const t = flat(raw);
      expect(t).toMatch(/lang="en"/);
      expect(t).toMatch(/class="latin"/);
      expect(t).toMatch(/letter-spacing/);
    }
    const zh = [kit.text(`${KIT}/deck/PROMPT.zh.md`), skills.text(`${SKILLS}/slides-commons-convert/deck/PROMPT.zh.md`)];
    for (const raw of zh) {
      const t = flat(raw);
      expect(t).toMatch(/lang="en"/);
      expect(t).toMatch(/class="latin"/);
      expect(t).toMatch(/字间距|letter-spacing/);
    }
  });

  test('per-template prompts (EN and ZH) carry the Latin-marking sentence when they have CJK rules', () => {
    for (const f of ['PROMPT.md', 'PROMPT.zh.md']) {
      const t = flat(tpl.text(`neo-grid-bold/${f}`));
      expect(t, f).toMatch(/lang="en"/);
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Four business templates: Latin run keeps tracking in a Chinese page, CJK stays 0
// ---------------------------------------------------------------------------
test.describe('zh copy: Latin tracking vs CJK tracking', () => {
  for (const slug of FOUR) {
    test(`${slug}: .latin span computes tracking, Chinese heading text computes 0`, async ({ page }) => {
      const src = path.join(ROOT, 'collections', 'style-presets', 'templates', slug, 'template.html');
      let html = fs.readFileSync(src, 'utf8');
      expect(html, 'English file declares lang="en" on <html>').toMatch(/<html[^>]*lang="en"/);
      html = html.replace(/(<html[^>]*)lang="en"/, '$1lang="zh-CN"');
      // First heading of the first slide, rewritten to a Chinese heading with one Latin run.
      const m = html.match(/<h1\b([^>]*)>[\s\S]*?<\/h1>/);
      expect(m, 'has an <h1>').toBeTruthy();
      html = html.replace(m[0], `<h1${m[1]}><span class="latin" id="t-latin">Forecast</span><span id="t-cjk">备货预测</span></h1>`);
      const dir = tmp('sc-zhlatin-');
      const file = path.join(dir, 'template.html');
      fs.writeFileSync(file, html);
      await page.goto(pathToFileURL(file).href);
      const r = await page.evaluate(() => {
        const px = (el) => { const v = getComputedStyle(el).letterSpacing; return v === 'normal' ? 0 : parseFloat(v); };
        const latin = document.getElementById('t-latin');
        const cjk = document.getElementById('t-cjk');
        return { latin: px(latin), latinRaw: getComputedStyle(latin).letterSpacing, cjk: px(cjk), h1: px(latin.parentElement), size: parseFloat(getComputedStyle(latin).fontSize) };
      });
      expect(Number.isFinite(r.latin) && r.latin !== 0, `latin tracking is ${r.latinRaw}`).toBe(true);
      expect(r.latin, 'tight (negative) tracking in px').toBeLessThan(0);
      expect(Math.abs(r.latin), 'a few percent of the font size').toBeLessThan(r.size * 0.2);
      expect(r.cjk, 'CJK text tracking').toBe(0);
      expect(r.h1, 'heading itself').toBe(0);
    });
  }

  test('English renders keep a non-zero reset-free state: no :lang(zh) rule applies at lang="en"', async ({ page }) => {
    const src = path.join(EXAMPLE_DIR, 'template.html');
    await page.goto(pathToFileURL(src).href);
    const r = await page.evaluate(() => {
      const h = document.querySelector('h1');
      return { lang: document.documentElement.lang, ls: (() => { const v = getComputedStyle(h).letterSpacing; return v === 'normal' ? 0 : parseFloat(v); })() };
    });
    expect(r.lang).toBe('en');
    expect(r.ls, 'English hero keeps its tight tracking').toBeLessThan(0);
  });
});
