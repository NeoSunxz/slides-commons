// pptx-extract on the "rich" fixture (tests/pptx-fixture.mjs buildRichPptx): background images, translucent
// colours with their effective colour, theme line widths (lnRef), shadows and unsupported effects, rounded
// corners, bold/colour on runs, and the font-map entries for the CJK brand fonts. The tool is run as shipped
// (extracted from site/zip/convert-kit.zip). No browser, no network.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, SITE, makeTempDir, readZip, extractZip } from './helpers.mjs';
import { buildRichPptx, buildPptx, BRAND_FONTS, RICH } from './pptx-fixture.mjs';

const KIT = 'convert-kit';
const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); return d; };
test.afterAll(() => { for (const d of tmps) fs.rmSync(d, { recursive: true, force: true }); });

let work, kitDir, tool, out, j, md;
const node = (args) => spawnSync(process.execPath, args, { encoding: 'utf8', cwd: work, maxBuffer: 64 * 1024 * 1024 });
const byName = (slide, name) => slide.shapes.find((s) => s.name === name);
const hex = (r, g, b) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
const over = (fg, a, bg) => { const f = [1, 3, 5].map((i) => parseInt(fg.slice(i, i + 2), 16)); const b = [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16)); return hex(...f.map((c, i) => c * a + b[i] * (1 - a))); };

test.beforeAll(() => {
  work = tmp('sc-rich-');
  kitDir = tmp('sc-rich-kit-');
  const z = readZip(fs.readFileSync(path.join(SITE, 'zip', `${KIT}.zip`)));
  extractZip(z.entries, kitDir);
  tool = path.join(kitDir, KIT, 'tools', 'pptx-extract.mjs');
  fs.writeFileSync(path.join(work, 'rich.pptx'), buildRichPptx());
  out = path.join(work, 'out');
  const r = node([tool, path.join(work, 'rich.pptx'), '--out', out, '--media']);
  expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
  j = JSON.parse(fs.readFileSync(path.join(out, 'extract.json'), 'utf8'));
  md = fs.readFileSync(path.join(out, 'summary.md'), 'utf8');
});

test('rich deck: 3 slides, exit 0, the only warning is the unsupported reflection', () => {
  expect(j.slides).toHaveLength(3);
  expect(j.warnings).toHaveLength(1);
  expect(j.warnings[0]).toMatch(/slide 2: "Mirror" has a reflection effect/);
});

test('background image per slide: type image + media path, exported, marked used by slide 1, shown in the summary', () => {
  expect(j.slides[0].background).toMatchObject({ type: 'image', media: RICH.slide1.bg, from: 'slide' });
  expect(j.slides[1].background).toMatchObject({ type: 'solid', color: '#FFFFFF' });
  expect(j.media.find((m) => m.file === RICH.slide1.bg)?.usedBy).toEqual(['slide 1']);
  expect(fs.existsSync(path.join(out, 'media', 'image1.png'))).toBe(true);
  expect(md).toMatch(/### Slide 1\nlayout: [^\n]*background: image image1\.png/);
  // a solid background is still printed as a colour
  expect(md).toMatch(/### Slide 2\nlayout: [^\n]*background: #FFFFFF/);
});

test('alpha and effective colour: fill over a solid backdrop is composited; over a photo it says the result depends on the picture', () => {
  const t = RICH.slide2.translucent;
  const glass = byName(j.slides[1], 'Glass').fill;
  expect(glass).toMatchObject({ type: 'solid', color: `#${t.fill}`, alpha: t.alpha });
  expect(glass.effective).toBe(over(`#${t.fill}`, t.alpha, `#${RICH.slide2.backdrop}`));
  const scrim = byName(j.slides[0], 'Scrim').fill;
  expect(scrim).toMatchObject({ color: '#000000', alpha: RICH.slide1.over.alpha });
  expect(scrim.effective, 'no number when the backdrop is a photo').toBeUndefined();
  expect(scrim.effectiveNote).toMatch(/photo/);
  // text colour with alpha: colorAlpha + colorEffective on the run
  const run = byName(j.slides[1], 'Quote').text.paragraphs[0].runs[0];
  expect(run).toMatchObject({ color: `#${RICH.slide2.textAlpha.color}`, colorAlpha: RICH.slide2.textAlpha.alpha });
  expect(run.colorEffective).toBe(over(`#${RICH.slide2.textAlpha.color}`, RICH.slide2.textAlpha.alpha, `#${RICH.slide2.backdrop}`));
  // colorsUsed lists the alphas and the effective colours
  const used = Object.fromEntries(j.colorsUsed.map((c) => [c.hex, c]));
  expect(used['#E4572E'].alpha).toEqual([0.4]);
  expect(used['#E4572E'].effective).toEqual([glass.effective]);
  expect(used['#000000'].alpha).toEqual([0.5]);
  expect(used['#000000'].effective).toBeUndefined();
  // an opaque colour has neither field
  expect(used['#76B041'].alpha).toBeUndefined();
  expect(used['#76B041'].effective).toBeUndefined();
  // and the summary says so in words
  expect(md).toContain(`#E4572E at 40% opacity (looks like ${glass.effective} over the slide background)`);
  expect(md).toMatch(/#000000 at 50% opacity \(over a photo or unknown backdrop/);
  expect(md).toContain(`#1F2A44 @60% (${run.colorEffective})`);
  expect(md).toMatch(/fill #000000 at 50% opacity \(lies over a photo/);
});

test('lnRef: a shape whose line comes from the theme gets the theme width (px), dash and the ref colour', () => {
  const line = byName(j.slides[1], 'Outlined').line;
  expect(line).toMatchObject({ type: 'solid', color: '#2E86AB', viaStyle: true, width: RICH.slide2.lnRefWidthPx, dash: 'dash' });
  expect(line.widthFrom).toMatch(/theme line style 2/);
  expect(md).toMatch(/"?Outlined"?|fill #FFFFFF stroke #2E86AB 4px dash/);
  // shapes without any line stay without one
  expect(byName(j.slides[1], 'Glass').line).toBeUndefined();
});

test('effects: explicit outer shadow, theme effect style shadow, and the unsupported reflection hint', () => {
  const s = RICH.slide2.shadow;
  expect(byName(j.slides[1], 'Shadowed').shadow).toMatchObject({ type: 'outer', blur: s.blur, dist: s.dist, angle: s.angle, color: `#${s.color}`.toUpperCase(), alpha: s.alpha });
  const t = RICH.slide2.themeShadow;
  expect(byName(j.slides[1], 'Themed shadow').shadow).toMatchObject({ type: 'outer', blur: t.blur, dist: t.dist, angle: t.angle });
  const mirror = byName(j.slides[1], 'Mirror');
  expect(mirror.shadow).toBeUndefined();
  expect(mirror.effects).toHaveLength(1);
  expect(mirror.effects[0]).toMatchObject({ type: 'reflection', blur: RICH.slide2.reflection.blur, dist: RICH.slide2.reflection.dist, startAlpha: 0.5, endAlpha: 0 });
  expect(mirror.effects[0].summary).toBeTruthy();
  expect(md).toMatch(/shadow\(outer blur 10px dist 6px angle 45deg #000000 @40%\)/);
  expect(md).toMatch(/reflection\(blur 4px, 50% to 0%\)/);
  expect(md).toMatch(/## Warnings\n\n- slide 2: "Mirror" has a reflection effect/);
  // no effect on a plain shape
  expect(byName(j.slides[1], 'Glass').shadow).toBeUndefined();
  expect(byName(j.slides[1], 'Glass').effects).toBeUndefined();
});

test('roundRect radius from adj (and the 16667 default); a larger guide is capped at half the short side', () => {
  const r = RICH.slide2.roundRect;
  expect(byName(j.slides[1], 'Rounded')).toMatchObject({ geometry: 'roundRect', w: r.w, h: r.h, cornerRadius: r.radius });
  expect(byName(j.slides[1], 'Rounded default').cornerRadius).toBeCloseTo(RICH.slide2.roundRectDefaultRadius, 1);
  expect(byName(j.slides[1], 'Pill').cornerRadius).toBe(r.h / 2);
  expect(byName(j.slides[1], 'Glass').cornerRadius, 'a plain rect has no radius').toBeUndefined();
  expect(md).toMatch(/roundRect radius 50px @1200,100 400x200/);
});

test('bold and colour on runs are kept per run and shown in the summary', () => {
  const runs = byName(j.slides[2], 'Emphasis').text.paragraphs[0].runs;
  expect(runs[0]).toMatchObject({ text: 'Bold teal ', bold: true, color: `#${RICH.runs.color}`, size: RICH.runs.size * 2 });
  expect(runs[1]).toMatchObject({ text: 'plain dark', color: '#111111' });
  expect(runs[1].bold).toBeFalsy();
  expect(md).toMatch(/"Bold teal plain dark" \[80px bold #17BEBB; 80px #111111\]/);
});

test('font-map: every CJK brand font gets the expected open replacement in extract.json and in the summary', () => {
  const used = Object.fromEntries(j.fontsUsed.map((f) => [f.typeface, f]));
  for (const [face, use] of Object.entries(BRAND_FONTS)) {
    expect(used[face], `${face} listed as used`).toBeTruthy();
    expect(used[face].suggestion?.use, `${face} -> ${use}`).toBe(use);
    expect(used[face].suggestion.google, `${face} google spec`).toContain(use.replace(/ /g, '+'));
    expect(md, face).toContain(`${face} - 10 characters, slides 3; suggested open replacement: ${use}`);
  }
});

test('font-map.json and spec/font-substitution.md in the kit: brand fonts present once, replacements embeddable, consistent with kits.json', () => {
  const map = JSON.parse(fs.readFileSync(path.join(kitDir, KIT, 'spec', 'font-map.json'), 'utf8'));
  const kits = JSON.parse(fs.readFileSync(path.join(ROOT, 'kits', 'kits.json'), 'utf8'));
  const norm = (s) => s.toLowerCase().replace(/[\s_-]+/g, '');
  const seen = new Map(); // normalised name -> entry index
  map.fonts.forEach((e, i) => { for (const m of e.match) {
    const k = norm(m);
    expect(!seen.has(k) || seen.get(k) === i, `"${m}" is listed under two entries`).toBe(true);
    seen.set(k, i);
  } });
  for (const [face, use] of Object.entries(BRAND_FONTS)) expect(map.fonts[seen.get(norm(face))]?.use, face).toBe(use);
  for (const e of map.fonts) {
    if (e.embed && /^(cjk|jp)/.test(e.category)) expect(kits.cjkFamilies, `${e.use} is marked embeddable but is not in kits.json cjkFamilies`).toContain(e.use);
    if (e.google) expect(e.google.replace(/\+/g, ' ').startsWith(e.use), `${e.use}: google spec ${e.google}`).toBe(true);
  }
  const sub = fs.readFileSync(path.join(kitDir, KIT, 'spec', 'font-substitution.md'), 'utf8');
  for (const face of Object.keys(BRAND_FONTS)) expect(sub, `font-substitution.md lists ${face}`).toContain(face);
  expect(sub).not.toMatch(/undefined|\[object Object\]/);
});

test('the older fixture still extracts with no warnings and a boolean-free shadow field (no regressions)', () => {
  const f = path.join(work, 'plain.pptx');
  fs.writeFileSync(f, buildPptx());
  const o = path.join(work, 'plain-out');
  const r = node([tool, f, '--out', o]);
  expect(r.status, r.stderr).toBe(0);
  const pj = JSON.parse(fs.readFileSync(path.join(o, 'extract.json'), 'utf8'));
  expect(pj.warnings).toEqual([]);
  for (const s of pj.slides.flatMap((x) => x.shapes)) { expect(s.shadow).toBeUndefined(); expect(s.effects).toBeUndefined(); expect(s.cornerRadius).toBeUndefined(); }
  for (const c of pj.colorsUsed) { expect(c.alpha).toBeUndefined(); expect(c.effective).toBeUndefined(); }
});
