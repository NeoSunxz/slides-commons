#!/usr/bin/env node
// check-template.mjs: structural check of a template folder made with the slides-commons convert kit.
//
//   node tools/check-template.mjs <template-folder>
//
// Checks the files, template.json, the required headings of design.md and the basic rules of
// template.html (fixed 1920x1080 stage, viewport-base.css inlined, one file, no requests except the
// font hosts). It cannot see how the slides look: render them and look at the screenshots as well.
//
// Zero dependencies; Node 18 or newer. Exit codes: 0 no errors (warnings are fine) | 1 errors found |
// 2 usage error or folder not found.

import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir || dir.startsWith('-')) { console.error('usage: node tools/check-template.mjs <template-folder>'); process.exit(2); }
if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { console.error(`not a folder: ${dir}`); process.exit(2); }

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const read = (f) => { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch { return null; } };

// --- files -------------------------------------------------------------------------------------
const html = read('template.html');
const design = read('design.md');
const metaText = read('template.json');
const base = read('viewport-base.css');
if (html === null) err('template.html is missing');
if (design === null) err('design.md is missing');
if (metaText === null) err('template.json is missing');
if (base === null) warn('viewport-base.css is missing: copy it from the kit (the make-a-deck prompts expect it next to design.md)');
if (!fs.existsSync(path.join(dir, 'LICENSE-skill')) && base !== null) warn('LICENSE-skill is missing: viewport-base.css is MIT-licensed (Zara Zhang); keep its license notice next to it');

// --- template.json -----------------------------------------------------------------------------
const LEVELS = ['low', 'medium-low', 'medium', 'medium-high', 'high'];
let meta = null;
if (metaText !== null) {
  try { meta = JSON.parse(metaText); } catch (e) { err(`template.json is not valid JSON: ${e.message}`); }
}
if (meta) {
  const isStr = (v) => typeof v === 'string' && v.trim() !== '';
  const strs = (v) => Array.isArray(v) && v.length > 0 && v.every(isStr);
  const need = {
    slug: (v) => isStr(v) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
    name: isStr, tagline: isStr, mood: strs, occasion: strs, tone: strs,
    formality: (v) => LEVELS.includes(v), density: (v) => LEVELS.includes(v),
    palette: (v) => v && typeof v === 'object' && Object.values(v).length > 0 && Object.values(v).every(isStr),
    typography: (v) => v && typeof v === 'object' && Object.values(v).length > 0 && Object.values(v).every(isStr),
    scheme: (v) => ['light', 'dark', 'mixed'].includes(v),
    best_for: isStr, avoid_for: isStr,
    slide_count: (v) => Number.isInteger(v) && v >= 1,
    navigation: isStr,
  };
  for (const [k, ok] of Object.entries(need)) {
    if (!(k in meta)) err(`template.json: "${k}" is missing`);
    else if (!ok(meta[k])) err(`template.json: "${k}" has an invalid value (see spec/template-json.md)`);
  }
  const optional = ['description', 'license', 'authors', 'derivedFrom'];
  for (const k of Object.keys(meta)) if (!(k in need) && !optional.includes(k)) err(`template.json: unknown field "${k}" (remove it; allowed optional: ${optional.join(', ')})`);
  if (need.slug(meta.slug) && meta.slug !== path.basename(path.resolve(dir))) warn(`template.json slug "${meta.slug}" differs from the folder name "${path.basename(path.resolve(dir))}"`);
}

// --- design.md ---------------------------------------------------------------------------------
if (design !== null) {
  const lines = design.split(/\r?\n/);
  const headings = lines.filter((l) => /^#{1,6}\s/.test(l));
  const has = (re) => headings.some((h) => re.test(h));
  if (!design.startsWith('---')) err('design.md has no YAML front matter at the top (--- ... ---)');
  else {
    const end = lines.indexOf('---', 1);
    const fm = end > 0 ? lines.slice(1, end).join('\n') : '';
    for (const k of ['name', 'description', 'colors', 'typography']) if (!new RegExp(`^${k}:`, 'm').test(fm)) err(`design.md front matter has no "${k}:"`);
    if (meta?.palette) {
      const hexes = new Set([...fm.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0].toLowerCase()));
      const missing = Object.entries(meta.palette).filter(([k, v]) => k !== 'description' && /^#[0-9a-f]{6}$/i.test(v) && !hexes.has(v.toLowerCase()));
      if (missing.length) warn(`template.json palette colours not found in design.md front matter: ${missing.map(([k, v]) => `${k} ${v}`).join(', ')}`);
    }
  }
  if (!has(/fixed[\s-]*stage/i)) err('design.md has no "Fixed-Stage Policy" heading');
  if (!has(/\bCJK\b/)) err('design.md has no "CJK & International Content" heading');
  if (!has(/signature\s+(moves|treatments|elements)/i)) err('design.md has no "Signature Treatments" (or Moves / Elements) heading');
  for (const [name, re] of [['Overview', /overview/i], ['Colors', /colou?rs/i], ['Typography', /typography/i], ['Layout', /layout/i], ['Components', /components/i], ['Slide Archetypes', /archetypes/i], ["Do's and Don'ts", /do['’]?s/i], ['Iteration Guide', /iteration/i], ['Known Gaps', /known gaps/i]]) {
    if (!has(re)) warn(`design.md has no "${name}" section (see spec/design-md.md)`);
  }
  const todo = lines.findIndex((l) => /\b(TODO|TBD|PLACEHOLDER|lorem ipsum)\b/i.test(l));
  if (todo >= 0) err(`design.md line ${todo + 1}: leftover placeholder text`);
}

// --- template.html -----------------------------------------------------------------------------
if (html !== null) {
  const bare = html.replace(/<!--[\s\S]*?-->/g, '');
  if (!/<html[^>]*\blang=/i.test(bare)) warn('<html> has no lang attribute');
  if (!/<title>[^<]+<\/title>/i.test(bare)) warn('template.html has no <title>');
  if (!/1920/.test(bare) || !/1080/.test(bare)) err('template.html never mentions 1920 and 1080: the stage must be a fixed 1920x1080 canvas');
  if (base !== null) {
    const squash = (s) => s.replace(/\s+/g, ' ').trim();
    if (!squash(bare).includes(squash(base))) err('the full text of viewport-base.css is not inlined in template.html (paste it unmodified into the <style> block)');
  }
  if (/<script[^>]+\bsrc=/i.test(bare)) err('template.html loads a script file (<script src>); everything must be inline');
  if (/<link[^>]+rel=["']?stylesheet/i.test(bare)) {
    for (const m of bare.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi)) if (!/^https:\/\/(fonts\.googleapis\.com|api\.fontshare\.com)\//.test(m[1]) && /stylesheet/i.test(m[0])) err(`template.html links a stylesheet that is not a font service: ${m[1]}`);
  }
  const allowed = /^https?:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|api\.fontshare\.com|cdn\.fontshare\.com)(\/|$)/;
  const bad = new Set();
  for (const m of bare.matchAll(/(?:\bsrc|\bhref|\bposter|\baction)\s*=\s*["'](https?:\/\/[^"']+)["']/gi)) if (!allowed.test(m[1])) bad.add(m[1]);
  for (const m of bare.matchAll(/(?:url\(\s*|@import\s+)["']?(https?:\/\/[^"')\s]+)/gi)) if (!allowed.test(m[1])) bad.add(m[1]);
  for (const u of bad) err(`template.html makes a request to ${u}: only Google Fonts / Fontshare are allowed`);
  const n = (bare.match(/<section\b[^>]*\bclass=["'][^"']*\bslide\b/gi) ?? []).length;
  if (n === 0) err('template.html has no <section class="slide"> elements');
  else {
    if (meta?.slide_count && meta.slide_count !== n) warn(`template.json says slide_count ${meta.slide_count}, template.html has ${n} slides`);
    if (n < 8 || n > 12) warn(`template.html has ${n} slides; 8 to 12 is the usual range (one per layout pattern)`);
  }
  if (/<img\b[^>]+\bsrc=["'](?!data:)/i.test(bare)) err('template.html references an image file; embed it as a data: URI or draw it with CSS / SVG');
  const media = ((bare.replace(base ?? '', '').match(/@media[^{]*\{/g) ?? []).filter((m) => !/print|prefers-reduced-motion/.test(m))).length;
  if (media) warn(`template.html has ${media} @media rule(s); slides must not reflow: use only the stage scaling from viewport-base.css`);
  const slideCss = [...bare.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n').replace(base ?? '', '');
  if (/\b\d+(\.\d+)?v[wh]\b/.test(slideCss)) warn('template.html uses vw / vh units in its CSS (outside viewport-base.css); use px on the 1920x1080 stage');
  if (/\b(TODO|TBD|PLACEHOLDER|lorem ipsum)\b/i.test(bare)) err('template.html contains placeholder text (TODO / TBD / PLACEHOLDER / lorem ipsum)');
  const bytes = Buffer.byteLength(html);
  if (bytes > 1.5 * 1024 * 1024) warn(`template.html is ${(bytes / 1024 / 1024).toFixed(1)} MB; downscale embedded images or fonts`);
}

for (const e of errors) console.log(`ERROR   ${e}`);
for (const w of warnings) console.log(`warning ${w}`);
console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s)` : `\nOK: no errors${warnings.length ? `, ${warnings.length} warning(s)` : ''}`);
process.exit(errors.length ? 1 : 0);
