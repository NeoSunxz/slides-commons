#!/usr/bin/env node
// embed-latin.mjs: embed the Latin web fonts a slide deck (or template) requests from Google Fonts,
// as base64 @font-face rules, so the file renders in its intended fonts offline and in regions where
// Google Fonts is unreachable. The Latin counterpart of embed-cjk.mjs (which handles CJK fonts).
//
//   node fonts/embed-latin.mjs <file.html>            embed (idempotent; re-run after changing the fonts)
//   node fonts/embed-latin.mjs <file.html> --dry-run  plan and report only, change nothing
//   node fonts/embed-latin.mjs <file.html> --site https://slides.example.com/   download from this site first
//
// What it does
//   1. Reads the Google Fonts <link> / @import URLs of the file and takes every family with its weights
//      and styles (CJK families are skipped: embed-cjk.mjs does them).
//   2. Downloads, per family, weight and style, the "latin" and "latin-ext" woff2 files of the open
//      Fontsource package. Sources, in this order:
//        a. the slides-commons site this kit came from (so it works on an intranet / without internet):
//           <siteBase>fonts/latin/static/<id>/<id>-latin-<weight>-normal.woff2
//           (variable fonts: <siteBase>fonts/latin/variable/<id>/<id>-latin-wght-normal.woff2).
//           <siteBase> is read from "siteBase" in the cjk-ranges.json next to this script (set by the
//           site that built the kit), or given with --site <url> (or the SC_SITE_URL variable);
//        b. jsDelivr: https://cdn.jsdelivr.net/npm/@fontsource/<id>@5/files/<id>-latin-<weight>-normal.woff2
//           (variable: @fontsource-variable/<id>, <id>-latin-wght-normal.woff2), then fastly.jsdelivr.net.
//      No other host is contacted. The summary says where the files came from.
//   3. Writes them as @font-face rules (with the standard unicode-range of each subset) into one
//      <style> block between two marker comments, just before </head>. The Google Fonts link stays as
//      the fallback; the embedded rules come later in the file, so they win when they are available.
//
// Zero dependencies; Node 18 or newer; no shell; the file is only changed by replacing its own block.
//
// Exit codes: 0 ok | 1 usage or file error | 3 some fonts could not be downloaded (the rest is
//             embedded; retry once) | 4 no Google Fonts link with a Latin family found

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BEGIN = '<!-- sc-latin-fonts:begin (written by fonts/embed-latin.mjs; do not edit by hand) -->';
const END = '<!-- sc-latin-fonts:end -->';
const HOSTS = ['https://cdn.jsdelivr.net', 'https://fastly.jsdelivr.net'];
const RANGES = {
  latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
};
const CJK_FAMILY = /(^|\s)(SC|TC|HK|JP|KR|CJK)(\s|$)|WenKai|ZCOOL|Ma Shan Zheng|Long Cang|Liu Jian Mao Cao|Zhi Mang Xing|ZEN (Antique|Kaku|Maru|Old)|Shippori|Kosugi|M PLUS|Sawarabi|Yuji|Klee|Zen Kurenaido|Dela Gothic|Reggae One|RocknRoll|Stick|Hachi Maru/i;

const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const siteIdx = args.indexOf('--site');
const siteArg = siteIdx >= 0 ? args[siteIdx + 1] : undefined;
const file = args.find((a, i) => !a.startsWith('--') && !(siteIdx >= 0 && i === siteIdx + 1));
if (!file || args.includes('--help')) {
  console.error('usage: node fonts/embed-latin.mjs <file.html> [--dry-run] [--site <url>]');
  process.exit(file ? 0 : 1);
}
// Site to try before jsDelivr: --site, SC_SITE_URL, or "siteBase" of the cjk-ranges.json beside this script.
let siteBase = siteArg ?? process.env.SC_SITE_URL ?? null;
if (!siteBase) {
  try { siteBase = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'cjk-ranges.json'), 'utf8')).siteBase ?? null; } catch { /* no table */ }
}
if (siteBase) {
  try { siteBase = new URL(siteBase.endsWith('/') ? siteBase : siteBase + '/').href; } catch { console.error(`ignoring invalid site URL: ${siteBase}`); siteBase = null; }
}
let source;
try { source = fs.readFileSync(file, 'utf8'); } catch (e) { console.error(`cannot read ${file}: ${e.message}`); process.exit(1); }

// --- 1. what the file requests -------------------------------------------------------------------
// Own block out first, so a re-run reads the original request.
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const blockRe = new RegExp(`\\s*${esc(BEGIN)}[\\s\\S]*?${esc(END)}`, 'g');
const clean = source.replace(blockRe, '');
const urls = [...clean.matchAll(/https:\/\/fonts\.googleapis\.com\/css2\?[^"'\s)<>]+/g)].map((m) => m[0].replace(/&amp;/g, '&'));
const wanted = new Map(); // family -> { weights:Set<number|'var'>, italic:Set }
for (const u of urls) {
  for (const part of new URL(u).search.slice(1).split('&')) {
    if (!part.startsWith('family=')) continue;
    const [rawName, spec = ''] = decodeURIComponent(part.slice(7).replace(/\+/g, ' ')).split(':');
    const name = rawName.trim();
    if (!name || CJK_FAMILY.test(name)) continue;
    const e = wanted.get(name) ?? { styles: new Set() }; // 'normal:400' | 'italic:400' | 'normal:var'
    const [axes = '', values = ''] = spec.split('@');
    const keys = axes.split(',').filter(Boolean);
    const tuples = values ? values.split(';') : [];
    if (!tuples.length) e.styles.add('normal:400');
    for (const tup of tuples) {
      const vals = tup.split(',');
      const ital = keys.includes('ital') ? vals[keys.indexOf('ital')] === '1' : false;
      const w = vals[keys.indexOf('wght')];
      if (w === undefined) { e.styles.add(`${ital ? 'italic' : 'normal'}:400`); continue; }
      if (w.includes('..')) e.styles.add(`${ital ? 'italic' : 'normal'}:var:${w.replace('..', ' ')}`);
      else e.styles.add(`${ital ? 'italic' : 'normal'}:${Number(w)}`);
    }
    wanted.set(name, e);
  }
}
if (!wanted.size) {
  console.error('No Google Fonts <link> / @import with a Latin family found. Nothing to embed (the file may use system fonts, or its CJK fonts only: use embed-cjk.mjs for those).');
  process.exit(4);
}

// --- 2. download ---------------------------------------------------------------------------------
const sourceCounts = new Map(); // where each file came from: host -> count
async function get(kind, id, base) {
  // kind: 'static' (@fontsource) or 'variable' (@fontsource-variable); base: file name.
  const urls = [];
  if (siteBase) urls.push(`${siteBase}fonts/latin/${kind}/${id}/${base}`);
  const pkg = kind === 'static' ? '@fontsource' : '@fontsource-variable';
  for (const host of HOSTS) urls.push(`${host}/npm/${pkg}/${id}@5/files/${base}`);
  for (const url of urls) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (res.status === 404) break; // not there; ask the next source
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 100 && buf.toString('latin1', 0, 4) === 'wOF2') {
          const h = new URL(url).host;
          sourceCounts.set(h, (sourceCounts.get(h) ?? 0) + 1);
          return buf;
        }
      } catch { /* retry, then next source */ }
    }
  }
  return null;
}

const idOf = (family) => family.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const faces = []; // { family, style, weight, subset, data }
const problems = [];
let failed = 0;
for (const [family, e] of wanted) {
  const id = idOf(family);
  const gotVariable = new Map(); // style -> true when the variable file served this style
  for (const key of [...e.styles].sort()) {
    const [style, w, range] = key.split(':');
    const isVar = w === 'var';
    const weight = isVar ? range : String(w);
    let any = false;
    for (const subset of Object.keys(RANGES)) {
      let data = null, usedVariable = false;
      if (!isVar) data = await get('static', id, `${id}-${subset}-${w}-${style}.woff2`);
      if (!data && !gotVariable.has(`${style}:${subset}`)) {
        data = await get('variable', id, `${id}-${subset}-wght-${style}.woff2`);
        usedVariable = Boolean(data);
        if (usedVariable) gotVariable.set(`${style}:${subset}`, true);
      } else if (!data && gotVariable.has(`${style}:${subset}`)) {
        any = true; continue; // the variable file embedded for another weight already covers this one
      }
      if (data) { any = true; faces.push({ family, style, weight: usedVariable ? '100 900' : weight, subset, data }); }
    }
    if (!any) { failed++; problems.push(`${family} ${style} ${isVar ? range : w}`); }
  }
}

// --- 3. write ------------------------------------------------------------------------------------
const seen = new Set();
const rules = [];
for (const f of faces) {
  const k = `${f.family}|${f.style}|${f.weight}|${f.subset}`;
  if (seen.has(k)) continue;
  seen.add(k);
  rules.push(`@font-face{font-family:"${f.family}";font-style:${f.style};font-weight:${f.weight};font-display:swap;src:url(data:font/woff2;base64,${f.data.toString('base64')}) format("woff2");unicode-range:${RANGES[f.subset]}}`);
}
const total = faces.reduce((n, f) => n + f.data.length, 0);
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`${[...wanted.keys()].join(', ')}: ${rules.length} font file(s), ${kb(total)} (${kb(total * 4 / 3)} as base64)${dry ? ' [dry run: file not changed]' : ''}`);
console.log(`Font files downloaded from: ${[...sourceCounts].map(([h, n]) => `${h} ${n}`).join(', ') || 'none'}.`);
for (const p of problems) console.error(`not found on Fontsource / jsDelivr, or the download failed: ${p}. It stays on the Google Fonts link (works online only).`);

if (!dry && rules.length) {
  const block = `${BEGIN}\n<style>\n${rules.join('\n')}\n</style>\n${END}`;
  let out;
  const i = clean.search(/<\/head>/i);
  if (i >= 0) out = `${clean.slice(0, i)}${block}\n${clean.slice(i)}`;
  else out = `${block}\n${clean}`;
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, out);
  fs.renameSync(tmp, file);
  console.log(`written: ${file} (Google Fonts link kept as the fallback). Re-run after changing the fonts or weights.`);
}
process.exit(failed ? 3 : 0);
