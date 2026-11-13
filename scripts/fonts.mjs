// Self-hosted Latin fonts.
//
// Templates request Latin (and some CJK) fonts from the Google Fonts CSS API. Visitors in
// regions where fonts.googleapis.com / fonts.gstatic.com are blocked would get fallback
// fonts, so the Latin families are served from this site instead, taken from the Fontsource
// npm packages (devDependencies, OFL-licensed, versions pinned by package-lock.json).
//
// Everything here is derived from the templates' own Google Fonts URLs; no family is
// hard-coded. A family that cannot be resolved to a local font is a validation error,
// unless it is a CJK family (still loaded from Google Fonts for now) or is listed in
// GOOGLE_FALLBACK below.

import fs from 'node:fs';
import path from 'node:path';

// Families deliberately left on Google Fonts (none at the moment).
const GOOGLE_FALLBACK = new Set([]);
// CJK families stay on Google Fonts until the subsetting step exists.
// Suffix regex plus known CJK families whose names carry no script suffix.
export const isCjkFamily = (name) =>
  /\b(SC|TC|HK|JP|KR|CJK)\b/.test(name) ||
  /^(ZCOOL |LXGW |Long Cang|Ma Shan Zheng|Zhi Mang Xing|Liu Jian Mao Cao|Yozai|Kaisei |Zen (Antique|Kaku|Maru|Old|Kurenaido)|M PLUS|Shippori|Klee One|Yuji |Hina Mincho|Dela Gothic|Reggae One|RocknRoll One|Stick$|Potta One|Train One|Yusei Magic|DotGothic16|Hachi Maru Pop|Kosugi|Sawarabi|Nanum |Black Han Sans|Do Hyeon|Jua$|Gugi|Hi Melody|East Sea Dokdo|Gaegu|Single Day|Song Myung|Gowun |IBM Plex Sans (KR|JP)|Noto (Sans|Serif) (Mono )?(SC|TC|HK|JP|KR)|Chiron |Cactus Classical|Noto (Sans|Serif) CJK)/.test(name);

// Keep only the CJK families of Google Fonts links (e.g. from design.md's CJK section).
// Links with no CJK family left are dropped; other hosts are dropped as well.
export function cjkOnlyLinks(urls) {
  const out = [];
  for (const raw of urls) {
    let u;
    try { u = new URL(raw); } catch { continue; }
    if (u.hostname !== 'fonts.googleapis.com') continue;
    const fams = u.searchParams.getAll('family').filter((f) => isCjkFamily(f.split(':')[0].replace(/\+/g, ' ')));
    if (!fams.length) continue;
    const display = u.searchParams.get('display');
    out.push(`${u.origin}${u.pathname}?${fams.map((f) => `family=${f.replace(/ /g, '+')}`).join('&')}${display ? `&display=${display}` : ''}`);
  }
  return out;
}
const SUBSETS = ['latin', 'latin-ext'];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// --- Google Fonts URL parsing ------------------------------------------------

const GF_URL = /https:\/\/fonts\.googleapis\.com\/css2?\?[^"'`\s)<>]+/g;

// "ital,opsz,wght@0,6..96,400..900;1,6..96,400..900" -> { opsz: true, variants: [{ital, wght:[lo,hi]}] }
function parseSpec(spec) {
  if (!spec) return { opsz: false, variants: [{ ital: false, wght: [400, 400] }] };
  const [axisList, tuples = ''] = spec.split('@');
  const axes = axisList.split(',');
  const variants = [];
  for (const tuple of tuples.split(';').filter(Boolean)) {
    const vals = tuple.split(',');
    const v = { ital: false, wght: [400, 400] };
    axes.forEach((a, i) => {
      const val = vals[i];
      if (a === 'ital') v.ital = val === '1';
      else if (a === 'wght') {
        const [lo, hi = lo] = val.split('..').map(Number);
        v.wght = [lo, hi];
      }
    });
    variants.push(v);
  }
  if (!variants.length) variants.push({ ital: false, wght: [400, 400] });
  return { opsz: axes.includes('opsz'), variants };
}

// Requests found in a template: [{ url, families: [{ name, param, ...spec }] }]
export function parseRequests(html) {
  const out = [];
  const seen = new Set();
  for (const m of html.matchAll(GF_URL)) {
    const raw = m[0];
    if (seen.has(raw)) continue;
    seen.add(raw);
    const url = new URL(raw.replace(/&amp;/g, '&'));
    const families = url.searchParams.getAll('family').map((param) => {
      const [name, spec] = param.split(':');
      return { name: name.replace(/\+/g, ' '), param, ...parseSpec(spec) };
    });
    out.push({ raw, url, families });
  }
  return out;
}

// --- Fontsource lookup -------------------------------------------------------

export function createFontStore(root) {
  const nm = path.join(root, 'node_modules');
  const cache = new Map();

  const pkgDir = (kind, id) => path.join(nm, kind, id);
  // unicode-range per subset, from the package's unicode.json (same ranges Google Fonts uses).
  const rangeOf = (dir, subset) => {
    try { return JSON.parse(fs.readFileSync(path.join(dir, 'unicode.json'), 'utf8'))[subset] ?? ''; } catch { return ''; }
  };

  // Return { static: dir|null, variable: dir|null, license } for a family name.
  function lookup(name) {
    if (cache.has(name)) return cache.get(name);
    const id = slugify(name);
    const s = pkgDir('@fontsource', id);
    const v = pkgDir('@fontsource-variable', id);
    const r = { id, static: fs.existsSync(s) ? s : null, variable: fs.existsSync(v) ? v : null };
    cache.set(name, r);
    return r;
  }

  const licenseOf = (r) => {
    const dir = r.static ?? r.variable;
    const f = path.join(dir, 'LICENSE');
    return fs.existsSync(f) ? f : null;
  };

  // Faces needed for one family spec. Returns { faces, error }.
  // face: { family, style, weight, file (relative to the fonts dir), src (absolute), range }
  function facesFor(fam) {
    const r = lookup(fam.name);
    if (!r.static && !r.variable) return { error: `no Fontsource package for "${fam.name}" (@fontsource/${r.id})` };
    const faces = [];
    const styles = new Set(fam.variants.map((v) => (v.ital ? 'italic' : 'normal')));
    const useVariable = r.variable && (fam.opsz || !r.static);
    if (useVariable) {
      const axis = fam.opsz ? 'opsz' : 'wght';
      const lo = Math.min(...fam.variants.map((v) => v.wght[0]));
      const hi = Math.max(...fam.variants.map((v) => v.wght[1]));
      for (const style of [...styles].sort()) {
        for (const subset of SUBSETS) {
          const base = `${r.id}-${subset}-${axis}-${style}.woff2`;
          const src = path.join(r.variable, 'files', base);
          if (!fs.existsSync(src)) {
            if (subset === 'latin') return { error: `${fam.name}: variable ${axis} ${style} file missing in @fontsource-variable/${r.id}` };
            continue;
          }
          const cssName = `${axis}${style === 'italic' ? '-italic' : ''}.css`;
          const css = fs.readFileSync(path.join(r.variable, cssName), 'utf8');
          const block = css.split('@font-face').find((b) => b.includes(`${r.id}-${subset}-${axis}-${style}.woff2`)) ?? '';
          const range = rangeOf(r.variable, subset);
          const wm = block.match(/font-weight:\s*([^;]+);/);
          faces.push({ family: fam.name, style, weight: wm ? wm[1].trim() : `${lo} ${hi}`, file: `${r.id}/${base}`, src, range, license: licenseOf(r), id: r.id, format: 'woff2-variations' });
        }
      }
      return { faces };
    }
    // Static: one face per (weight, style, subset).
    const meta = JSON.parse(fs.readFileSync(path.join(r.static, 'metadata.json'), 'utf8'));
    const want = new Set();
    for (const v of fam.variants) {
      for (const w of meta.weights) if (w >= v.wght[0] && w <= v.wght[1]) want.add(`${w}|${v.ital ? 'italic' : 'normal'}`);
      if (v.wght[0] === v.wght[1] && !meta.weights.includes(v.wght[0])) return { error: `${fam.name}: weight ${v.wght[0]} not available in @fontsource/${r.id}` };
    }
    for (const key of [...want].sort()) {
      const [w, style] = key.split('|');
      if (style === 'italic' && !meta.styles.includes('italic')) return { error: `${fam.name}: italic not available in @fontsource/${r.id}` };
      for (const subset of SUBSETS) {
        const base = `${r.id}-${subset}-${w}-${style}.woff2`;
        const src = path.join(r.static, 'files', base);
        if (!fs.existsSync(src)) {
          if (subset === 'latin') return { error: `${fam.name}: ${base} missing in @fontsource/${r.id}` };
          continue;
        }
        const range = rangeOf(r.static, subset);
        faces.push({ family: fam.name, style, weight: w, file: `${r.id}/${base}`, src, range, license: licenseOf(r), id: r.id, format: 'woff2' });
      }
    }
    return { faces };
  }
  return { facesFor, lookup };
}

// --- Per-template plan -------------------------------------------------------

// Returns { faces: [..deduped, sorted], requests, googleFamilies, errors: [] }.
export function planTemplateFonts(html, store) {
  const requests = parseRequests(html);
  const faces = new Map();
  const errors = [];
  for (const req of requests) {
    for (const fam of req.families) {
      if (isCjkFamily(fam.name) || GOOGLE_FALLBACK.has(fam.name)) continue;
      const { faces: fs_, error } = store.facesFor(fam);
      if (error) { errors.push(error); continue; }
      for (const f of fs_) faces.set(`${f.file}|${f.family}|${f.weight}|${f.style}`, f);
    }
  }
  const sorted = [...faces.values()].sort((a, b) => (a.family + a.file).localeCompare(b.family + b.file));
  return { faces: sorted, requests, errors };
}

// @font-face rules. `urlOf(face)` gives the src URL (a relative path or a data: URI).
export const relativeUrl = (prefix) => (f) => `${prefix}${f.file}`;
export const dataUrl = (f) => `data:font/woff2;base64,${fs.readFileSync(f.src).toString('base64')}`;
export function fontFaceCss(faces, urlOf) {
  return faces.map((f) => `@font-face {
  font-family: '${f.family}';
  font-style: ${f.style};
  font-weight: ${f.weight};
  font-display: swap;
  src: url(${urlOf(f)}) format('${f.format}');${f.range ? `\n  unicode-range: ${f.range};` : ''}
}`).join('\n');
}

// Rewrite the Google Fonts requests of a preview copy: Latin families are dropped (they
// are served locally), CJK/fallback families stay. A request without remaining families
// is removed entirely, together with preconnects to the Google font hosts.
export function rewriteGoogleFonts(html, requests, localNames) {
  let out = html;
  let remaining = 0;
  for (const req of requests) {
    const keep = req.families.filter((f) => !localNames.has(f.name));
    if (keep.length === req.families.length) { remaining++; continue; }
    let replacement = null;
    if (keep.length) {
      remaining++;
      const u = new URL(req.url);
      u.search = '';
      const q = keep.map((f) => `family=${f.param.replace(/ /g, '+')}`).join('&') + (req.url.searchParams.get('display') ? `&display=${req.url.searchParams.get('display')}` : '');
      replacement = `${u.origin}${u.pathname}?${q}`;
    }
    const escaped = req.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (replacement) {
      out = out.split(req.raw).join(req.raw.includes('&amp;') ? replacement.replace(/&/g, '&amp;') : replacement);
    } else {
      out = out.replace(new RegExp(`<link\\b[^>]*${escaped}[^>]*>\\s*`, 'gi'), '');
      out = out.replace(new RegExp(`@import\\s+url\\(\\s*['"]?${escaped}['"]?\\s*\\)\\s*;?\\s*`, 'gi'), '');
    }
  }
  if (!remaining) {
    out = out.replace(/<link\b[^>]*rel\s*=\s*["']?preconnect["']?[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\s*/gi, '');
    out = out.replace(/<link\b[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*rel\s*=\s*["']?preconnect["']?[^>]*>\s*/gi, '');
  }
  return out;
}
