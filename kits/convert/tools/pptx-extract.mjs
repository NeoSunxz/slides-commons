#!/usr/bin/env node
// pptx-extract.mjs: read a .pptx and write down what a designer needs to rebuild its look as an
// HTML slide template: slide size, theme colours and fonts, layouts, and for every slide the
// shapes (type, position and size on a 1920x1080 canvas), text runs (size in px, weight, colour,
// font), fills, lines and images.
//
//   node tools/pptx-extract.mjs <file.pptx> [--out <dir>] [--media] [--json]
//
//   --out <dir>   where to write extract.json and summary.md (default: ./<file>-extract/)
//   --media       also copy the images from the deck into <dir>/media/
//   --json        print the full JSON on stdout instead of the markdown summary
//   --help        this text
//
// Output: extract.json (everything), summary.md (the short version; also printed on stdout).
// Positions and sizes are canvas pixels. If the deck is not 16:9 the slide is scaled to fit the
// canvas height or width (letterboxed) and `canvas.letterboxed` says so. Font sizes are px on
// that canvas (pt * 12700 EMU * scale).
//
// Zero dependencies; Node 18 or newer; no shell; cross-platform. Reads the file, never changes it.
// Unknown elements are skipped; a part that fails to parse is reported in `warnings` and the rest
// is still written.
//
// Exit codes: 0 ok | 1 usage error | 2 not a readable .pptx (missing, legacy .ppt, encrypted,
//             not a zip, no presentation.xml) | 3 written, but some parts could not be parsed
//             (see `warnings` in the output)

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const VERSION = 1;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CANVAS = { width: 1920, height: 1080 };
const EMU_PER_PT = 12700;

class Fail extends Error { constructor(msg, code = 2) { super(msg); this.code = code; } }

// --------------------------------------------------------------------------------------------
// ZIP (central directory; stored and deflate entries)
// --------------------------------------------------------------------------------------------

function openZip(buf) {
  if (buf.length >= 8 && buf.readUInt32BE(0) === 0xd0cf11e0) {
    throw new Fail('this is an old binary .ppt or an encrypted/password-protected file, not a .pptx. Open it in PowerPoint, Keynote or LibreOffice and "Save as" .pptx (remove the password first).');
  }
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Fail('not a zip file (no end-of-central-directory record). A .pptx is a zip archive.');
  let count = buf.readUInt16LE(eocd + 10);
  let cdOff = buf.readUInt32LE(eocd + 16);
  if (count === 0xffff || cdOff === 0xffffffff) {
    const loc = eocd - 20;
    if (loc < 0 || buf.readUInt32LE(loc) !== 0x07064b50) throw new Fail('zip64 archive without a locator');
    const z64 = Number(buf.readBigUInt64LE(loc + 8));
    if (buf.readUInt32LE(z64) !== 0x06064b50) throw new Fail('bad zip64 record');
    count = Number(buf.readBigUInt64LE(z64 + 32));
    cdOff = Number(buf.readBigUInt64LE(z64 + 48));
  }
  const entries = new Map();
  const lower = new Map();
  let p = cdOff;
  for (let n = 0; n < count; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) break;
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const off = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen).replace(/\\/g, '/');
    entries.set(name, { name, flags, method, csize, usize, off });
    lower.set(name.toLowerCase(), name);
    p += 46 + nlen + xlen + clen;
  }
  if (!entries.size) throw new Fail('the zip archive is empty or its directory is damaged');
  const MAX = 512 * 1024 * 1024;
  return {
    names: [...entries.keys()],
    has: (n) => entries.has(n) || lower.has(n.toLowerCase()),
    read(n) {
      const e = entries.get(n) ?? entries.get(lower.get(n.toLowerCase()));
      if (!e) return null;
      if (e.flags & 1) throw new Error(`${e.name} is encrypted`);
      if (e.csize === 0xffffffff || e.usize === 0xffffffff) throw new Error(`${e.name}: zip64 entry not supported`);
      if (buf.readUInt32LE(e.off) !== 0x04034b50) throw new Error(`${e.name}: bad local header`);
      const start = e.off + 30 + buf.readUInt16LE(e.off + 26) + buf.readUInt16LE(e.off + 28);
      const body = buf.subarray(start, start + e.csize);
      if (e.method === 0) return Buffer.from(body);
      if (e.method === 8) return zlib.inflateRawSync(body, { maxOutputLength: Math.min(MAX, Math.max(e.usize * 2, 1 << 20)) });
      throw new Error(`${e.name}: unsupported compression method ${e.method}`);
    },
    size: (n) => entries.get(n)?.usize ?? 0,
  };
}

// --------------------------------------------------------------------------------------------
// XML (small tolerant parser: elements keep their local name; attributes keep their full name)
// --------------------------------------------------------------------------------------------

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (s) => (s.includes('&') ? s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(cp); } catch { return ''; } }
  return ENT[e] ?? m;
}) : s);

function parseXml(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const root = { name: '#root', attrs: {}, children: [], text: '' };
  const stack = [root];
  const n = text.length;
  let i = 0;
  const top = () => stack[stack.length - 1];
  const addText = (s) => { const t = top(); if (t.name === 't' || /\S/.test(s)) t.text += decode(s); };
  while (i < n) {
    const lt = text.indexOf('<', i);
    if (lt < 0) { addText(text.slice(i)); break; }
    if (lt > i) addText(text.slice(i, lt));
    if (text.startsWith('<!--', lt)) { const e = text.indexOf('-->', lt + 4); i = e < 0 ? n : e + 3; continue; }
    if (text.startsWith('<![CDATA[', lt)) { const e = text.indexOf(']]>', lt + 9); top().text += text.slice(lt + 9, e < 0 ? n : e); i = e < 0 ? n : e + 3; continue; }
    if (text[lt + 1] === '?' ) { const e = text.indexOf('?>', lt + 2); i = e < 0 ? n : e + 2; continue; }
    if (text[lt + 1] === '!') { const e = text.indexOf('>', lt + 2); i = e < 0 ? n : e + 1; continue; }
    if (text[lt + 1] === '/') { const e = text.indexOf('>', lt + 2); if (stack.length > 1) stack.pop(); i = e < 0 ? n : e + 1; continue; }
    // open tag: find its end outside quotes
    let j = lt + 1, q = '';
    for (; j < n; j++) {
      const c = text[j];
      if (q) { if (c === q) q = ''; } else if (c === '"' || c === "'") q = c; else if (c === '>') break;
    }
    let inner = text.slice(lt + 1, j);
    const selfClose = inner.endsWith('/');
    if (selfClose) inner = inner.slice(0, -1);
    const m = inner.match(/^([^\s/>]+)/);
    const qname = m ? m[1] : '';
    const node = { name: qname.replace(/^[^:]*:/, ''), attrs: {}, children: [], text: '' };
    for (const a of inner.slice(qname.length).matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) node.attrs[a[1]] = decode(a[2] ?? a[3] ?? '');
    top().children.push(node);
    if (!selfClose) { stack.push(node); if (stack.length > 400) throw new Error('XML nesting too deep'); }
    i = j + 1;
  }
  const top0 = root.children.find((c) => true) ?? root;
  if (stack.length > 1) top0.truncated = true; // elements left open at the end of the file
  return top0;
}

const kids = (n, name) => (n ? n.children.filter((c) => c.name === name) : []);
const kid = (n, name) => (n ? n.children.find((c) => c.name === name) : undefined);
const at = (n, ...names) => { let c = n; for (const nm of names) { c = kid(c, nm); if (!c) return undefined; } return c; };
const num = (v, d) => { const x = Number(v); return v !== undefined && v !== '' && Number.isFinite(x) ? x : d; };
const textOf = (n) => { let s = n.text ?? ''; for (const c of n.children) s += textOf(c); return s; };

// --------------------------------------------------------------------------------------------
// Colours
// --------------------------------------------------------------------------------------------

const hex2 = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
const toHex = (r, g, b) => `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
const fromHex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function rgb2hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hsl2rgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => { t = (t + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
const PRESET = { black: '#000000', white: '#FFFFFF', red: '#FF0000', green: '#008000', blue: '#0000FF', yellow: '#FFFF00', gray: '#808080', grey: '#808080', orange: '#FFA500', purple: '#800080', cyan: '#00FFFF', magenta: '#FF00FF', darkGray: '#A9A9A9', lightGray: '#D3D3D3' };

// env: { theme: {colors}, clrMap }
function resolveColor(el, env, phClr) {
  if (!el) return null;
  let hex = null, source = null;
  const v = el.attrs.val;
  switch (el.name) {
    case 'srgbClr': if (/^[0-9a-f]{6}$/i.test(v ?? '')) hex = '#' + v.toUpperCase(); break;
    case 'sysClr': { const l = el.attrs.lastClr; hex = /^[0-9a-f]{6}$/i.test(l ?? '') ? '#' + l.toUpperCase() : (v === 'window' ? '#FFFFFF' : '#000000'); break; }
    case 'prstClr': hex = PRESET[v] ?? null; break;
    case 'scrgbClr': hex = toHex(num(el.attrs.r, 0) / 1000 * 2.55, num(el.attrs.g, 0) / 1000 * 2.55, num(el.attrs.b, 0) / 1000 * 2.55); break;
    case 'hslClr': hex = toHex(...hsl2rgb([num(el.attrs.hue, 0) / 21600000, num(el.attrs.sat, 0) / 100000, num(el.attrs.lum, 0) / 100000])); break;
    case 'schemeClr': {
      if (v === 'phClr') { hex = phClr?.hex ?? null; source = phClr?.source ?? null; break; }
      const mapped = env.clrMap?.[v] ?? v;
      hex = env.theme?.colors?.[mapped] ?? null;
      source = `scheme:${mapped}`;
      break;
    }
    default: return null;
  }
  if (!hex) return null;
  let alpha = 1;
  for (const t of el.children) {
    const val = num(t.attrs.val, 0) / 100000;
    let rgb = fromHex(hex);
    switch (t.name) {
      case 'alpha': alpha = val; break;
      case 'lumMod': { const h = rgb2hsl(rgb); h[2] = Math.min(1, h[2] * val); hex = toHex(...hsl2rgb(h)); break; }
      case 'lumOff': { const h = rgb2hsl(rgb); h[2] = Math.max(0, Math.min(1, h[2] + val)); hex = toHex(...hsl2rgb(h)); break; }
      case 'lum': { const h = rgb2hsl(rgb); h[2] = val; hex = toHex(...hsl2rgb(h)); break; }
      case 'satMod': { const h = rgb2hsl(rgb); h[1] = Math.min(1, h[1] * val); hex = toHex(...hsl2rgb(h)); break; }
      case 'satOff': { const h = rgb2hsl(rgb); h[1] = Math.max(0, Math.min(1, h[1] + val)); hex = toHex(...hsl2rgb(h)); break; }
      case 'tint': hex = toHex(...rgb.map((c) => c * val + 255 * (1 - val))); break;
      case 'shade': hex = toHex(...rgb.map((c) => c * val)); break;
      default: break;
    }
  }
  return { hex, alpha, source };
}

// Colour of `hex` at `alpha` laid over the opaque colour `under` (both '#RRGGBB').
const composite = (hex, alpha, under) => { const a = fromHex(hex), b = fromHex(under); return toHex(...a.map((c, i) => c * alpha + b[i] * (1 - alpha))); };

// A fill property element (solidFill, gradFill, noFill, blipFill, pattFill) -> description.
function readFill(el, env, rels, phClr) {
  if (!el) return null;
  switch (el.name) {
    case 'noFill': return { type: 'none' };
    case 'solidFill': {
      const c = resolveColor(el.children[0], env, phClr);
      return c ? { type: 'solid', color: c.hex, ...(c.alpha < 1 ? { alpha: round(c.alpha, 2) } : {}), ...(c.source ? { from: c.source } : {}) } : null;
    }
    case 'gradFill': {
      const stops = kids(at(el, 'gsLst'), 'gs').map((gs) => {
        const c = resolveColor(gs.children[0], env, phClr);
        return c ? { pos: round(num(gs.attrs.pos, 0) / 1000, 1), color: c.hex, ...(c.alpha < 1 ? { alpha: round(c.alpha, 2) } : {}) } : null;
      }).filter(Boolean);
      const lin = kid(el, 'lin');
      const path = kid(el, 'path');
      return { type: 'gradient', kind: path ? `path-${path.attrs.path ?? 'circle'}` : 'linear', angle: lin ? round(num(lin.attrs.ang, 0) / 60000, 1) : undefined, stops };
    }
    case 'blipFill': {
      const id = at(el, 'blip')?.attrs['r:embed'];
      const rel = id ? rels?.get(id) : null;
      return { type: 'image', media: rel ? rel.target : null };
    }
    case 'pattFill': return { type: 'pattern', preset: el.attrs.prst, fg: resolveColor(at(el, 'fgClr')?.children[0], env, phClr)?.hex, bg: resolveColor(at(el, 'bgClr')?.children[0], env, phClr)?.hex };
    default: return null;
  }
}
const FILL_NAMES = new Set(['noFill', 'solidFill', 'gradFill', 'blipFill', 'pattFill', 'grpFill']);
const fillEl = (spPr) => spPr?.children.find((c) => FILL_NAMES.has(c.name));
const round = (v, d = 0) => { const k = 10 ** d; return Math.round(v * k) / k; };

// --------------------------------------------------------------------------------------------
// Package helpers
// --------------------------------------------------------------------------------------------

const relsPathOf = (part) => { const d = path.posix.dirname(part); return `${d === '.' ? '' : d + '/'}_rels/${path.posix.basename(part)}.rels`; };
const resolveTarget = (part, target) => (target.startsWith('/') ? target.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(part), target)));

function imageSize(buf) {
  try {
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'GIF') return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    if (buf.length > 26 && buf.toString('latin1', 0, 2) === 'BM') return { width: buf.readInt32LE(18), height: Math.abs(buf.readInt32LE(22)) };
    if (buf.length > 30 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') {
      const k = buf.toString('latin1', 12, 16);
      if (k === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (k === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (k === 'VP8L') { const b = buf.readUInt32LE(21); return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 }; }
    }
    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let p = 2;
      while (p + 9 < buf.length) {
        if (buf[p] !== 0xff) { p++; continue; }
        const mk = buf[p + 1];
        if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) return { width: buf.readUInt16BE(p + 7), height: buf.readUInt16BE(p + 5) };
        p += 2 + buf.readUInt16BE(p + 2);
      }
    }
  } catch { /* fall through */ }
  return null;
}

// --------------------------------------------------------------------------------------------
// Main extraction
// --------------------------------------------------------------------------------------------

const fontMap = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(HERE, '..', 'spec', 'font-map.json'), 'utf8')); } catch { return null; }
})();
const norm = (s) => s.toLowerCase().replace(/[\s_-]+/g, '');
function substitutionFor(face) {
  if (!fontMap) return null;
  const f = norm(face);
  for (const e of fontMap.fonts) if (e.match.some((m) => norm(m) === f)) return e;
  return null;
}

// Corner radius (canvas px) of the preset shapes with rounded corners, from their `adj` guides
// (a fraction of the shorter side, 100000 = 100%; the default when a guide is missing is 16667).
function cornerRadii(prst, gds, box) {
  if (!box || !/^round/.test(prst ?? '')) return null;
  const g = {};
  for (const d of gds) { const v = num((d.attrs.fmla ?? '').replace(/^val\s+/, ''), null); if (v !== null && d.attrs.name) g[d.attrs.name] = v; }
  const short = Math.min(box.w, box.h);
  const r = (v) => round(short * Math.min(50000, Math.max(0, v)) / 100000, 1);
  switch (prst) {
    case 'roundRect': return { cornerRadius: r(g.adj ?? 16667) };
    case 'round1Rect': return { cornerRadii: { tl: 0, tr: r(g.adj ?? 16667), br: 0, bl: 0 } };
    case 'round2SameRect': { const t = r(g.adj1 ?? 16667), b = r(g.adj2 ?? 0); return { cornerRadii: { tl: t, tr: t, br: b, bl: b } }; }
    case 'round2DiagRect': { const a = r(g.adj1 ?? 16667), b = r(g.adj2 ?? 0); return { cornerRadii: { tl: a, tr: b, br: a, bl: b } }; }
    default: return null; // snipRoundRect, round*Rect variants not listed: the radius is not worked out
  }
}

// <a:effectLst> -> { shadow, effects }. `shadow` carries the parameters in canvas px; reflection, glow
// and soft edge (which have no plain CSS equivalent) are listed in `effects`.
function readEffects(list, env, pxOf, phClr) {
  const out = { shadow: null, effects: [] };
  if (!list) return out;
  for (const e of list.children) {
    const col = resolveColor(e.children.find((c) => /Clr$/.test(c.name)), env, phClr);
    switch (e.name) {
      case 'outerShdw': case 'innerShdw': case 'prstShdw': {
        if (out.shadow) break;
        out.shadow = {
          type: e.name === 'innerShdw' ? 'inner' : 'outer',
          blur: round(pxOf(num(e.attrs.blurRad, 0)), 1),
          dist: round(pxOf(num(e.attrs.dist, 0)), 1),
          angle: round(num(e.attrs.dir, 0) / 60000, 1),
          ...(col ? { color: col.hex, alpha: round(col.alpha, 2) } : {}),
          ...(e.attrs.rotWithShape === '0' ? { rotWithShape: false } : {}),
        };
        break;
      }
      case 'glow': out.effects.push({ type: 'glow', radius: round(pxOf(num(e.attrs.rad, 0)), 1), ...(col ? { color: col.hex, alpha: round(col.alpha, 2) } : {}), summary: `radius ${round(pxOf(num(e.attrs.rad, 0)), 1)}px${col ? `, ${col.hex}` : ''}` }); break;
      case 'reflection': out.effects.push({ type: 'reflection', blur: round(pxOf(num(e.attrs.blurRad, 0)), 1), dist: round(pxOf(num(e.attrs.dist, 0)), 1), startAlpha: round(num(e.attrs.stA, 100000) / 100000, 2), endAlpha: round(num(e.attrs.endA, 0) / 100000, 2), summary: `blur ${round(pxOf(num(e.attrs.blurRad, 0)), 1)}px, ${round(num(e.attrs.stA, 100000) / 1000)}% to ${round(num(e.attrs.endA, 0) / 1000)}%` }); break;
      case 'softEdge': out.effects.push({ type: 'softEdge', radius: round(pxOf(num(e.attrs.rad, 0)), 1), summary: `radius ${round(pxOf(num(e.attrs.rad, 0)), 1)}px` }); break;
      case 'blur': out.effects.push({ type: 'blur', radius: round(pxOf(num(e.attrs.rad, 0)), 1), summary: `radius ${round(pxOf(num(e.attrs.rad, 0)), 1)}px` }); break;
      default: break;
    }
  }
  return out;
}

const CJK_CHAR = /[⺀-鿿ꥠ-꥿가-퟿豈-﫿︰-﹏＀-￯\u{20000}-\u{3134F}]/u;

function extract(file, opts) {
  let buf;
  try { buf = fs.readFileSync(file); } catch (e) { throw new Fail(`cannot read ${file}: ${e.message}`); }
  const zip = openZip(buf);
  const warnings = [];
  const warn = (m) => { if (!warnings.includes(m) && warnings.length < 200) warnings.push(m); };
  let parseErrors = 0;
  const xmlCache = new Map();
  const xml = (part) => {
    if (xmlCache.has(part)) return xmlCache.get(part);
    let v = null;
    try {
      const b = zip.read(part);
      if (b) {
        v = parseXml(b.toString('utf8'));
        if (v.truncated) { parseErrors++; warn(`${part}: the XML is cut off (damaged file); what could be read is used`); }
      }
    } catch (e) { parseErrors++; warn(`${part}: ${e.message}`); }
    xmlCache.set(part, v);
    return v;
  };
  const relsCache = new Map();
  const rels = (part) => {
    if (relsCache.has(part)) return relsCache.get(part);
    const m = new Map();
    const r = xml(relsPathOf(part));
    for (const rel of kids(r, 'Relationship')) {
      if (rel.attrs.TargetMode === 'External') continue;
      m.set(rel.attrs.Id, { id: rel.attrs.Id, type: (rel.attrs.Type ?? '').split('/').pop(), target: resolveTarget(part, rel.attrs.Target ?? '') });
    }
    relsCache.set(part, m);
    return m;
  };
  const relOfType = (part, type) => [...rels(part).values()].filter((r) => r.type === type);

  const presPart = 'ppt/presentation.xml';
  if (!zip.has(presPart)) throw new Fail('not a PowerPoint file: ppt/presentation.xml is missing');
  const pres = xml(presPart);
  if (!pres) throw new Fail('ppt/presentation.xml could not be parsed');
  const sz = at(pres, 'sldSz');
  const cx = num(sz?.attrs.cx, 12192000), cy = num(sz?.attrs.cy, 6858000);
  const scale = Math.min(CANVAS.width / cx, CANVAS.height / cy);
  const offsetX = (CANVAS.width - cx * scale) / 2, offsetY = (CANVAS.height - cy * scale) / 2;
  const letterboxed = Math.abs(offsetX) > 0.5 || Math.abs(offsetY) > 0.5;
  if (letterboxed) warn(`the slide is ${round(cx / 914400, 2)} x ${round(cy / 914400, 2)} in (not 16:9); positions are scaled to fit and centred on the 1920x1080 canvas`);
  const pxOf = (emu) => emu * scale;
  const baseTr = { sx: scale, sy: scale, tx: offsetX, ty: offsetY };

  const defaultTextStyle = at(pres, 'defaultTextStyle');

  // ---- themes, masters, layouts -----------------------------------------------------------
  const themeCache = new Map();
  function loadTheme(part) {
    if (themeCache.has(part)) return themeCache.get(part);
    const root = xml(part);
    const colors = {};
    const t = at(root, 'themeElements');
    for (const c of at(t, 'clrScheme')?.children ?? []) {
      const e = c.children[0];
      colors[c.name] = e?.name === 'sysClr' ? ('#' + (e.attrs.lastClr ?? '000000')).toUpperCase() : e?.attrs.val ? ('#' + e.attrs.val).toUpperCase() : null;
    }
    const fonts = {};
    for (const [role, nm] of [['major', 'majorFont'], ['minor', 'minorFont']]) {
      const f = at(t, 'fontScheme', nm);
      fonts[role] = { latin: kid(f, 'latin')?.attrs.typeface || null, ea: kid(f, 'ea')?.attrs.typeface || null, cs: kid(f, 'cs')?.attrs.typeface || null };
      const scripts = {};
      for (const sf of kids(f, 'font')) if (sf.attrs.typeface) scripts[sf.attrs.script] = sf.attrs.typeface;
      if (Object.keys(scripts).length) fonts[role].scripts = scripts;
    }
    const fmt = at(t, 'fmtScheme');
    const lineStyles = kids(at(fmt, 'lnStyleLst'), 'ln').map((l) => ({ w: num(l.attrs.w, 0), dash: kid(l, 'prstDash')?.attrs.val ?? null }));
    const effectStyles = kids(at(fmt, 'effectStyleLst'), 'effectStyle').map((e) => kid(e, 'effectLst') ?? null);
    const th = { part, name: root?.attrs.name ?? null, colors, fonts, lineStyles, effectStyles, fontSchemeName: at(t, 'fontScheme')?.attrs.name ?? null };
    themeCache.set(part, th);
    return th;
  }

  const masterCache = new Map();
  function loadMaster(part) {
    if (masterCache.has(part)) return masterCache.get(part);
    const root = xml(part);
    const themeRel = relOfType(part, 'theme')[0];
    const theme = themeRel ? loadTheme(themeRel.target) : { colors: {}, fonts: { major: {}, minor: {} } };
    const cm = at(root, 'clrMap');
    const clrMap = cm ? { ...cm.attrs } : { bg1: 'lt1', tx1: 'dk1', bg2: 'lt2', tx2: 'dk2' };
    const m = { part, root, theme, clrMap, env: { theme, clrMap }, name: null };
    m.txStyles = at(root, 'txStyles');
    m.tree = at(root, 'cSld', 'spTree');
    masterCache.set(part, m);
    return m;
  }
  const layoutCache = new Map();
  function loadLayout(part) {
    if (layoutCache.has(part)) return layoutCache.get(part);
    const root = xml(part);
    const mRel = relOfType(part, 'slideMaster')[0];
    const l = { part, root, master: mRel ? loadMaster(mRel.target) : null, tree: at(root, 'cSld', 'spTree'), name: at(root, 'cSld')?.attrs.name ?? null, type: root?.attrs.type ?? null };
    layoutCache.set(part, l);
    return l;
  }

  // ---- fonts / colours accounting ---------------------------------------------------------
  const fontsUsed = new Map();   // typeface -> { latinChars, eaChars, slides:Set }
  const colorsUsed = new Map();  // hex -> { textChars, fillArea, lines, from:Set }
  const mediaUse = new Map();    // part -> Set(where)
  const noteFont = (face, chars, slideNo, role) => {
    if (!face || !chars || !slideNo) return; // layouts and masters hold prompt text only
    const e = fontsUsed.get(face) ?? { chars: 0, roles: new Set(), slides: new Set() };
    e.chars += chars; e.roles.add(role); e.slides.add(slideNo);
    fontsUsed.set(face, e);
  };
  let colorSlideNo = 0;
  // What lies under the shapes drawn next: the slide background, replaced when a big opaque shape or
  // picture covers most of the slide. Used to work out the effective colour of translucent fills.
  let backdrop = null; // { hex } | { image: true } | null (unknown)
  const effectiveOver = (hex, alpha) => (alpha < 1 && backdrop?.hex ? composite(hex, alpha, backdrop.hex) : null);
  const noteColor = (hex, kind, amount, from, extra = {}) => {
    if (!hex || !colorSlideNo) return; // only what the slides themselves use
    const e = colorsUsed.get(hex) ?? { textChars: 0, fillArea: 0, lines: 0, from: new Set(), alphas: new Set(), effective: new Set() };
    e[kind] += amount;
    if (from) e.from.add(from);
    if (extra.alpha !== undefined && extra.alpha < 1) e.alphas.add(extra.alpha);
    if (extra.effective) e.effective.add(extra.effective);
    colorsUsed.set(hex, e);
  };

  // ---- shape parsing ----------------------------------------------------------------------
  const phKey = (sp) => {
    const ph = at(sp, 'nvSpPr', 'nvPr', 'ph') ?? at(sp, 'nvPicPr', 'nvPr', 'ph') ?? at(sp, 'nvGraphicFramePr', 'nvPr', 'ph');
    if (!ph) return null;
    let type = ph.attrs.type ?? 'body';
    if (type === 'ctrTitle') type = 'title';
    return { type, rawType: ph.attrs.type ?? null, idx: ph.attrs.idx ?? null };
  };
  const shapesOf = (tree) => (tree ? flatten(tree.children) : []);
  function flatten(list) {
    const out = [];
    for (const c of list) {
      if (c.name === 'AlternateContent') { const ch = kid(c, 'Choice') ?? kid(c, 'Fallback'); if (ch) out.push(...flatten(ch.children)); } else out.push(c);
    }
    return out;
  }
  const findPh = (tree, key) => {
    if (!tree || !key) return null;
    const cands = shapesOf(tree).filter((s) => phKey(s));
    return cands.find((s) => key.idx !== null && phKey(s).idx === key.idx && (phKey(s).idx !== '0' || phKey(s).type === key.type))
      ?? cands.find((s) => phKey(s).type === key.type)
      ?? (key.type === 'subTitle' ? cands.find((s) => phKey(s).type === 'body') : null);
  };
  const xfrmOf = (sp) => at(sp, 'spPr', 'xfrm') ?? kid(sp, 'xfrm') ?? at(sp, 'grpSpPr', 'xfrm');

  function boxOf(xf, tr) {
    if (!xf) return null;
    const off = kid(xf, 'off'), ext = kid(xf, 'ext');
    if (!off || !ext) return null;
    const x = num(off.attrs.x, 0), y = num(off.attrs.y, 0), w = num(ext.attrs.cx, 0), h = num(ext.attrs.cy, 0);
    return { x: Math.round(x * tr.sx + tr.tx), y: Math.round(y * tr.sy + tr.ty), w: Math.round(w * tr.sx), h: Math.round(h * tr.sy) };
  }

  // Text. chain: [sp, layoutSp, masterSp]; lstChain: lstStyle nodes from most to least specific.
  function parseText(txBody, chain, lstChain, env, slideNo, fitScale) {
    const paragraphs = [];
    let chars = 0;
    for (const p of kids(txBody, 'p')) {
      const pPr = kid(p, 'pPr');
      const lvl = num(pPr?.attrs.lvl, 0);
      const lvlNodes = lstChain.map((l) => (l ? kid(l, `lvl${lvl + 1}pPr`) : null));
      const pAttr = (k) => { for (const n of [pPr, ...lvlNodes]) if (n?.attrs[k] !== undefined) return n.attrs[k]; };
      const pKid = (nm) => { for (const n of [pPr, ...lvlNodes]) { const c = kid(n, nm); if (c) return c; } };
      const defs = lvlNodes.map((n) => kid(n, 'defRPr'));
      const runs = [];
      let plain = '';
      for (const r of p.children) {
        if (r.name !== 'r' && r.name !== 'fld' && r.name !== 'br') continue;
        const t = r.name === 'br' ? '\n' : (kid(r, 't')?.text ?? '');
        if (r.name !== 'br' && !t) continue;
        const rPr = kid(r, 'rPr') ?? (r.name === 'br' ? kid(r, 'rPr') : null);
        const nodes = [rPr, ...defs].filter(Boolean);
        const ra = (k) => { for (const n of nodes) if (n.attrs[k] !== undefined) return n.attrs[k]; };
        const rk = (nm) => { for (const n of nodes) { const c = kid(n, nm); if (c) return c; } };
        const szRaw = ra('sz');
        const sizePt = (szRaw ? Number(szRaw) / 100 : 18) * fitScale;
        const color = resolveColor(rk('solidFill')?.children[0], env) ?? resolveColor({ name: 'schemeClr', attrs: { val: 'tx1' }, children: [] }, env);
        const faces = {};
        for (const k of ['latin', 'ea', 'cs']) {
          let tf = rk(k)?.attrs.typeface;
          if (tf?.startsWith('+')) {
            const role = tf.startsWith('+mj') ? 'major' : 'minor';
            const slot = tf.endsWith('-ea') ? 'ea' : tf.endsWith('-cs') ? 'cs' : 'latin';
            tf = env.theme.fonts[role]?.[slot] || null;
          }
          if (tf) faces[k] = tf;
        }
        if (!faces.latin) faces.latin = env.theme.fonts.minor?.latin || null;
        const run = {
          text: t,
          size: round(sizePt * EMU_PER_PT * scale, 1),
          ...(ra('b') === '1' ? { bold: true } : {}),
          ...(ra('i') === '1' ? { italic: true } : {}),
          ...(ra('u') && ra('u') !== 'none' ? { underline: true } : {}),
          ...(ra('strike') && ra('strike') !== 'noStrike' ? { strike: true } : {}),
          ...(ra('cap') && ra('cap') !== 'none' ? { caps: ra('cap') } : {}),
          ...(ra('spc') ? { letterSpacing: round(Number(ra('spc')) / 100 * EMU_PER_PT * scale, 2) } : {}),
          ...(ra('baseline') && ra('baseline') !== '0' ? { baseline: Number(ra('baseline')) / 1000 } : {}),
          color: color?.hex ?? null,
          ...(color && color.alpha < 1 ? { colorAlpha: round(color.alpha, 2), ...(effectiveOver(color.hex, color.alpha) ? { colorEffective: effectiveOver(color.hex, color.alpha) } : {}) } : {}),
          font: { ...faces },
        };
        runs.push(run);
        plain += t;
        const cjk = [...t].filter((c) => CJK_CHAR.test(c)).length;
        const lat = [...t].filter((c) => /\S/.test(c)).length - cjk;
        noteFont(faces.latin, lat, slideNo, 'latin');
        noteFont(faces.ea || faces.latin, cjk, slideNo, faces.ea ? 'ea' : 'latin');
        if (color) noteColor(color.hex, 'textChars', cjk + lat, color.source, { alpha: color.alpha, effective: effectiveOver(color.hex, color.alpha) });
        chars += cjk + lat;
      }
      if (!runs.length && !kid(p, 'endParaRPr')) continue;
      const bu = pKid('buNone') ? null : pKid('buChar') ? { char: pKid('buChar').attrs.char } : pKid('buAutoNum') ? { autoNumber: pKid('buAutoNum').attrs.type } : null;
      const spcPct = at(pKid('lnSpc'), 'spcPct')?.attrs.val, spcPts = at(pKid('lnSpc'), 'spcPts')?.attrs.val;
      const bef = at(pKid('spcBef'), 'spcPts')?.attrs.val, aft = at(pKid('spcAft'), 'spcPts')?.attrs.val;
      paragraphs.push({
        ...(lvl ? { level: lvl } : {}),
        align: { l: 'left', ctr: 'center', r: 'right', just: 'justify', dist: 'distribute' }[pAttr('algn')] ?? 'left',
        ...(bu ? { bullet: bu } : {}),
        ...(spcPct ? { lineHeight: round(Number(spcPct) / 100000, 2) } : {}),
        ...(spcPts ? { lineHeightPx: round(Number(spcPts) / 100 * EMU_PER_PT * scale, 1) } : {}),
        ...(bef ? { spaceBefore: round(Number(bef) / 100 * EMU_PER_PT * scale, 1) } : {}),
        ...(aft ? { spaceAfter: round(Number(aft) / 100 * EMU_PER_PT * scale, 1) } : {}),
        ...(pAttr('marL') ? { marginLeft: round(pxOf(Number(pAttr('marL'))), 1) } : {}),
        ...(pAttr('indent') ? { indent: round(pxOf(Number(pAttr('indent'))), 1) } : {}),
        runs: runs.map(mergeRun),
        ...(runs.length === 0 ? { empty: true } : {}),
        _plain: plain,
      });
    }
    return { paragraphs, chars };
  }
  const mergeRun = (r) => r;

  function lstChainFor(chain, key, master) {
    const lst = chain.map((s) => at(s, 'txBody', 'lstStyle'));
    const ph = key?.type;
    const style = ph === 'title' ? 'titleStyle' : ph && ph !== 'dt' && ph !== 'ftr' && ph !== 'sldNum' ? 'bodyStyle' : 'otherStyle';
    return [...lst, master?.txStyles ? kid(master.txStyles, style) : null, defaultTextStyle];
  }

  function parseNode(node, tr, ctx, depth = 0) {
    if (depth > 40) return null;
    const { env, slideNo, tree, masterTree, master } = ctx;
    colorSlideNo = slideNo;
    const kind0 = node.name;
    if (!['sp', 'pic', 'grpSp', 'cxnSp', 'graphicFrame'].includes(kind0)) return null;
    const nv = kid(node, kind0 === 'sp' ? 'nvSpPr' : kind0 === 'pic' ? 'nvPicPr' : kind0 === 'grpSp' ? 'nvGrpSpPr' : kind0 === 'cxnSp' ? 'nvCxnSpPr' : 'nvGraphicFramePr');
    const cNvPr = kid(nv, 'cNvPr');
    const key = phKey(node);
    const out = { kind: 'shape', name: cNvPr?.attrs.name ?? '', ...(cNvPr?.attrs.descr ? { alt: cNvPr.attrs.descr } : {}) };
    if (cNvPr?.attrs.hidden === '1') out.hidden = true;

    // inheritance chain for placeholders
    let chain = [node];
    if (key && ctx.layoutTree) {
      const l = findPh(ctx.layoutTree, key);
      const m = findPh(masterTree, l ? phKey(l) : key);
      chain = [node, l, m].filter(Boolean);
    } else if (key && masterTree && ctx.isLayout) {
      const m = findPh(masterTree, key);
      chain = [node, m].filter(Boolean);
    }
    if (key) out.placeholder = { type: key.rawType ?? 'body', ...(key.idx ? { idx: Number(key.idx) } : {}) };

    if (kind0 === 'grpSp') {
      const gx = at(node, 'grpSpPr', 'xfrm');
      const off = kid(gx, 'off'), ext = kid(gx, 'ext'), cho = kid(gx, 'chOff'), che = kid(gx, 'chExt');
      let sub = tr;
      if (off && ext && cho && che) {
        const ex = num(ext.attrs.cx, 1), ey = num(ext.attrs.cy, 1), cex = num(che.attrs.cx, 0) || ex, cey = num(che.attrs.cy, 0) || ey;
        const kx = ex / cex, ky = ey / cey;
        sub = { sx: tr.sx * kx, sy: tr.sy * ky, tx: tr.tx + tr.sx * (num(off.attrs.x, 0) - num(cho.attrs.x, 0) * kx), ty: tr.ty + tr.sy * (num(off.attrs.y, 0) - num(cho.attrs.y, 0) * ky) };
        if (gx.attrs.rot && gx.attrs.rot !== '0') warn(`group "${out.name}" is rotated; its children are placed without the rotation`);
      }
      out.kind = 'group';
      Object.assign(out, boxOf(gx, tr) ?? {});
      out.children = [];
      for (const c of flatten(node.children)) { const ch = safeParse(c, sub, ctx, depth + 1); if (ch) out.children.push(ch); }
      return out;
    }

    const xf = chain.map(xfrmOf).find(Boolean);
    const box = boxOf(xf, tr);
    if (box) Object.assign(out, box);
    if (xf?.attrs.rot && xf.attrs.rot !== '0') out.rotation = round(Number(xf.attrs.rot) / 60000, 1);
    if (xf?.attrs.flipH === '1') out.flipH = true;
    if (xf?.attrs.flipV === '1') out.flipV = true;

    const spPr = kid(node, 'spPr');
    const geom = chain.map((s) => kid(kid(s, 'spPr'), 'prstGeom') ?? kid(kid(s, 'spPr'), 'custGeom')).find(Boolean);
    if (geom) {
      out.geometry = geom.name === 'prstGeom' ? geom.attrs.prst : 'custom';
      if (geom.name === 'prstGeom') {
        const adj = kids(at(geom, 'avLst'), 'gd').map((g) => num((g.attrs.fmla ?? '').replace(/^val\s+/, ''), null)).filter((v) => v !== null);
        if (adj.length) out.geometryAdjust = adj;
        const radii = cornerRadii(geom.attrs.prst, kids(at(geom, 'avLst'), 'gd'), box);
        if (radii) Object.assign(out, radii);
      }
    }

    // style references (fillRef / lnRef supply the colour of shapes that have no explicit fill)
    const style = kid(node, 'style');
    const refColor = (ref) => resolveColor(ref?.children[0], env);

    // fill
    let fill = null;
    for (const s of chain) { const f = fillEl(kid(s, 'spPr')); if (f && f.name !== 'grpFill') { fill = readFill(f, env, ctx.rels); break; } }
    if (!fill && style && num(at(style, 'fillRef')?.attrs.idx, 0) > 0) {
      const c = refColor(kid(style, 'fillRef'));
      if (c) fill = { type: 'solid', color: c.hex, ...(c.alpha < 1 ? { alpha: round(c.alpha, 2) } : {}), ...(c.source ? { from: c.source } : {}), viaStyle: true };
    }
    if (fill?.type === 'solid' && fill.alpha !== undefined) { const eff = effectiveOver(fill.color, fill.alpha); if (eff) fill.effective = eff; else if (backdrop?.image) fill.effectiveNote = 'lies over a photo: the result depends on the picture'; }
    if (fill?.type === 'image' && fill.media) (mediaUse.get(fill.media) ?? mediaUse.set(fill.media, new Set()).get(fill.media)).add(ctx.where);
    // line: explicit <a:ln> first, then the theme line style named by the shape style's lnRef
    let line = null;
    const ln = chain.map((s) => at(s, 'spPr', 'ln')).find((l) => l && l.children.length) ?? at(spPr, 'ln');
    const lnRef = style ? at(style, 'lnRef') : null;
    const lnIdx = num(lnRef?.attrs.idx, 0);
    const themeLine = lnIdx > 0 ? env.theme?.lineStyles?.[lnIdx - 1] : null;
    if (ln) {
      const f = fillEl(ln);
      const w = ln.attrs.w !== undefined ? round(pxOf(Number(ln.attrs.w)), 1) : undefined;
      if (f?.name === 'noFill') line = { type: 'none' };
      else {
        const lf = f ? readFill(f, env, ctx.rels) : null;
        if (lf || w !== undefined) line = { ...(lf ?? {}), ...(w !== undefined ? { width: w } : {}), ...(kid(ln, 'prstDash') ? { dash: kid(ln, 'prstDash').attrs.val } : {}) };
      }
    }
    if (line?.type !== 'none' && lnIdx > 0) {
      const c = refColor(lnRef);
      if (!line && c) line = { type: 'solid', color: c.hex, ...(c.alpha < 1 ? { alpha: round(c.alpha, 2) } : {}), viaStyle: true };
      else if (line && !line.color && c && !line.type) Object.assign(line, { type: 'solid', color: c.hex, viaStyle: true });
      if (line && line.width === undefined && themeLine?.w) { line.width = round(pxOf(themeLine.w), 1); line.widthFrom = `theme line style ${lnIdx}`; }
      if (line && !line.dash && themeLine?.dash) line.dash = themeLine.dash;
    }
    // effects: explicit <a:effectLst>, else the theme effect style named by effectRef
    const effRef = style ? at(style, 'effectRef') : null;
    const effIdx = num(effRef?.attrs.idx, 0);
    const effList = at(spPr, 'effectLst') ?? (effIdx > 0 ? env.theme?.effectStyles?.[effIdx - 1] ?? null : null);
    const fx = readEffects(effList, env, pxOf, effRef ? resolveColor(effRef.children[0], env) : null);
    if (fx.shadow) out.shadow = fx.shadow;
    if (fx.effects.length) {
      out.effects = fx.effects;
      for (const e of fx.effects) warn(`${ctx.where}: "${out.name}" has a ${e.type} effect (${e.summary}); the template simplifies it (reflection, glow and soft edge are usually dropped or replaced by a plain shadow)`);
    }
    if (fx.shadow && fx.shadow.blur > 60) warn(`${ctx.where}: "${out.name}" has a very soft shadow (blur ${fx.shadow.blur}px); use a CSS box-shadow with similar blur`);
    if (kid(spPr, 'scene3d') || kid(spPr, 'sp3d')) warn(`${ctx.where}: "${out.name}" has a 3-D format (bevel / extrusion); it is flattened in the template`);
    if (fill) out.fill = fill;
    if (line) out.line = line;
    if (fill?.color && box) noteColor(fill.color, 'fillArea', (box.w * box.h) / (CANVAS.width * CANVAS.height), fill.from, { alpha: fill.alpha, effective: fill.effective });
    if (line?.color) noteColor(line.color, 'lines', 1, line.from, { alpha: line.alpha });
    if (fill?.type === 'gradient') for (const s of fill.stops) noteColor(s.color, 'fillArea', box ? (box.w * box.h) / (CANVAS.width * CANVAS.height) / Math.max(1, fill.stops.length) : 0, null, { alpha: s.alpha });

    if (kind0 === 'pic') {
      out.kind = 'picture';
      const blip = at(node, 'blipFill', 'blip');
      const rel = blip?.attrs['r:embed'] ? ctx.rels.get(blip.attrs['r:embed']) : null;
      if (rel) {
        out.image = { media: rel.target };
        const crop = at(node, 'blipFill', 'srcRect');
        if (crop && Object.keys(crop.attrs).length) out.image.crop = Object.fromEntries(Object.entries(crop.attrs).map(([k, v]) => [k, round(Number(v) / 1000, 1)]));
        if (blip.children.some((c) => c.name === 'duotone' || c.name === 'lum' || c.name === 'clrChange')) out.image.recolored = true;
        (mediaUse.get(rel.target) ?? mediaUse.set(rel.target, new Set()).get(rel.target)).add(ctx.where);
        if (/\.(emf|wmf)$/i.test(rel.target)) warn(`${rel.target} is a vector metafile (EMF/WMF): browsers cannot show it; redraw it or export it as PNG`);
      }
      return out;
    }
    if (kind0 === 'cxnSp') { out.kind = 'line'; return out; }
    if (kind0 === 'graphicFrame') {
      const gd = at(node, 'graphic', 'graphicData');
      const uri = gd?.attrs.uri ?? '';
      if (/table/.test(uri)) {
        out.kind = 'table';
        const tbl = kid(gd, 'tbl');
        const cols = kids(at(tbl, 'tblGrid'), 'gridCol').map((g) => round(pxOf(num(g.attrs.w, 0))));
        const rows = kids(tbl, 'tr');
        out.table = { columns: cols, rowCount: rows.length, rowHeights: rows.slice(0, 12).map((r) => round(pxOf(num(r.attrs.h, 0)))), cells: rows.slice(0, 12).map((r) => kids(r, 'tc').slice(0, 8).map((tc) => textOf(kid(tc, 'txBody') ?? { text: '', children: [] }).trim().slice(0, 80))) };
        const firstFill = fillEl(at(rows[0], 'tc', 'tcPr'));
        if (firstFill) out.table.headerFill = readFill(firstFill, env, ctx.rels)?.color;
      } else if (/chart/.test(uri)) {
        out.kind = 'chart';
        const rel = ctx.rels.get(at(gd, 'chart')?.attrs['r:id']);
        const cx = rel ? xml(rel.target) : null;
        const plot = at(cx, 'chart', 'plotArea');
        out.chart = { types: plot ? plot.children.map((c) => c.name).filter((n) => /Chart$/.test(n)) : [], seriesCount: plot ? plot.children.flatMap((c) => kids(c, 'ser')).length : undefined };
        warn('charts are listed but not converted; rebuild them with inline SVG or CSS');
      } else if (/diagram/.test(uri)) {
        out.kind = 'smartart';
        warn('SmartArt diagrams are not converted; rebuild them with shapes');
      } else out.kind = 'graphic';
      return out;
    }

    // sp: text
    const txBody = kid(node, 'txBody');
    if (txBody) {
      const bodyPrs = chain.map((s) => at(s, 'txBody', 'bodyPr')).filter(Boolean);
      const bp = (k) => { for (const b of bodyPrs) if (b.attrs[k] !== undefined) return b.attrs[k]; };
      const fitEl = bodyPrs.map((b) => kid(b, 'normAutofit') ?? kid(b, 'spAutoFit') ?? kid(b, 'noAutofit')).find(Boolean);
      const fitScale = fitEl?.name === 'normAutofit' && fitEl.attrs.fontScale ? Number(fitEl.attrs.fontScale) / 100000 : 1;
      const { paragraphs, chars } = parseText(txBody, chain, lstChainFor(chain, key, master), env, slideNo, fitScale);
      const hasText = paragraphs.some((p) => p._plain.trim());
      if (hasText) {
        out.kind = key ? 'placeholder' : (cNvPr && at(nv, 'cNvSpPr')?.attrs.txBox === '1') ? 'text' : 'shape';
        out.text = {
          anchor: { t: 'top', ctr: 'middle', b: 'bottom' }[bp('anchor')] ?? 'top',
          ...(fitEl ? { autofit: fitEl.name, ...(fitScale !== 1 ? { fontScale: fitScale } : {}) } : {}),
          wrap: bp('wrap') !== 'none',
          insets: { left: round(pxOf(num(bp('lIns'), 91440)), 1), top: round(pxOf(num(bp('tIns'), 45720)), 1), right: round(pxOf(num(bp('rIns'), 91440)), 1), bottom: round(pxOf(num(bp('bIns'), 45720)), 1) },
          ...(bp('vert') && bp('vert') !== 'horz' ? { vertical: bp('vert') } : {}),
          characters: chars,
          paragraphs: paragraphs.map(({ _plain, ...p }) => ({ ...p, text: _plain })),
        };
      } else if (key) out.kind = 'placeholder';
    } else if (key) out.kind = 'placeholder';
    if (out.kind === 'shape' && !out.fill && !out.line && !out.geometry) out.kind = 'other';
    return out;
  }
  function safeParse(n, tr, ctx, depth) {
    try { return parseNode(n, tr, ctx, depth); } catch (e) { parseErrors++; warn(`${ctx.where}: a shape could not be read (${e.message})`); return null; }
  }
  function parseTree(tree, ctx) {
    const out = [];
    for (const c of shapesOf(tree)) {
      const s = safeParse(c, baseTr, ctx, 0);
      if (!s) continue;
      out.push(s);
      // a big picture / opaque fill becomes the backdrop of the shapes drawn above it
      if (ctx.slideNo && s.w && s.h && (s.w * s.h) / (CANVAS.width * CANVAS.height) >= 0.6) {
        if (s.kind === 'picture' || s.fill?.type === 'image') backdrop = { image: true };
        else if (s.fill?.type === 'solid' && !(s.fill.alpha < 1)) backdrop = { hex: s.fill.color };
        else if (s.fill?.type === 'solid' && s.fill.effective) backdrop = { hex: s.fill.effective };
        else if (s.fill?.type === 'gradient') backdrop = null;
      }
    }
    return out;
  }

  function readBackground(root, ctx) {
    const bg = at(root, 'cSld', 'bg');
    if (!bg) return null;
    const pr = kid(bg, 'bgPr');
    if (pr) {
      const f = readFill(fillEl(pr), ctx.env, ctx.rels);
      if (f?.type === 'image' && f.media) (mediaUse.get(f.media) ?? mediaUse.set(f.media, new Set()).get(f.media)).add(ctx.where);
      return f;
    }
    const ref = kid(bg, 'bgRef');
    if (ref) { const c = resolveColor(ref.children[0], ctx.env); return c ? { type: 'solid', color: c.hex, ...(c.source ? { from: c.source } : {}), viaStyle: true } : null; }
    return null;
  }

  // ---- masters / layouts ------------------------------------------------------------------
  const masterOut = new Map();
  function describeMaster(m) {
    if (masterOut.has(m.part)) return masterOut.get(m.part);
    backdrop = null;
    const ctx = { env: m.env, slideNo: 0, masterTree: m.tree, master: m, rels: rels(m.part), where: m.part, isLayout: false };
    const o = {
      file: m.part,
      theme: m.theme.name,
      background: readBackground(m.root, ctx),
      textStyles: Object.fromEntries(['titleStyle', 'bodyStyle', 'otherStyle'].map((k) => {
        const lv = kid(kid(m.txStyles, k), 'lvl1pPr'); const d = kid(lv, 'defRPr');
        return [k, d ? { size: round(num(d.attrs.sz, 1800) / 100 * EMU_PER_PT * scale, 1), bold: d.attrs.b === '1' || undefined } : null];
      })),
      shapes: parseTree(m.tree, ctx),
    };
    masterOut.set(m.part, o);
    return o;
  }
  const layoutOut = new Map();
  function describeLayout(l) {
    if (layoutOut.has(l.part)) return layoutOut.get(l.part);
    backdrop = null;
    const ctx = { env: l.master?.env ?? { theme: { colors: {}, fonts: {} }, clrMap: {} }, slideNo: 0, tree: l.tree, layoutTree: null, masterTree: l.master?.tree, master: l.master, rels: rels(l.part), where: l.part, isLayout: true };
    const o = { file: l.part, name: l.name, type: l.type, background: readBackground(l.root, ctx), shapes: parseTree(l.tree, ctx) };
    layoutOut.set(l.part, o);
    return o;
  }

  // ---- slides -----------------------------------------------------------------------------
  const presRels = rels(presPart);
  const slideParts = kids(at(pres, 'sldIdLst'), 'sldId').map((s) => presRels.get(s.attrs['r:id'])?.target).filter(Boolean);
  if (!slideParts.length) throw new Fail('the presentation has no slides');
  if (slideParts.length > 1000) warn('more than 1000 slides: only the first 1000 are read');
  const slides = [];
  let firstMaster = null;
  const masterUse = new Map();
  slideParts.slice(0, 1000).forEach((part, i) => {
    const no = i + 1;
    try {
      const root = xml(part);
      if (!root) { slides.push({ index: no, file: part, error: 'could not be parsed' }); return; }
      const lRel = relOfType(part, 'slideLayout')[0];
      const layout = lRel ? loadLayout(lRel.target) : null;
      const master = layout?.master ?? null;
      if (master) { firstMaster ??= master; masterUse.set(master.part, (masterUse.get(master.part) ?? 0) + 1); }
      let clrMap = master?.clrMap ?? { bg1: 'lt1', tx1: 'dk1', bg2: 'lt2', tx2: 'dk2' };
      const ovr = at(root, 'clrMapOvr', 'overrideClrMapping');
      if (ovr) clrMap = { ...clrMap, ...ovr.attrs };
      const env = { theme: master?.theme ?? { colors: {}, fonts: { major: {}, minor: {} } }, clrMap };
      const ctx = { env, slideNo: no, tree: at(root, 'cSld', 'spTree'), layoutTree: layout?.tree, masterTree: master?.tree, master, rels: rels(part), where: `slide ${no}` };
      let background = readBackground(root, ctx);
      let bgFrom = 'slide';
      if (!background && layout) { background = readBackground(layout.root, { ...ctx, rels: rels(layout.part) }); bgFrom = 'layout'; }
      if (!background && master) { background = readBackground(master.root, { ...ctx, rels: rels(master.part) }); bgFrom = 'master'; }
      colorSlideNo = no;
      if (background?.color) noteColor(background.color, 'fillArea', 1, background.from);
      backdrop = background?.type === 'solid' && background.color && !(background.alpha < 1) ? { hex: background.color } : background?.type === 'image' ? { image: true } : null;
      const shapes = parseTree(ctx.tree, ctx);
      const notesRel = relOfType(part, 'notesSlide')[0];
      let notes = null;
      if (notesRel) {
        const nroot = xml(notesRel.target);
        const body = shapesOf(at(nroot, 'cSld', 'spTree')).find((s) => phKey(s)?.type === 'body');
        notes = body ? textOf(kid(body, 'txBody') ?? { text: '', children: [] }).trim() || null : null;
      }
      if (kid(root, 'transition')) warn('slide transitions are not converted');
      if (kid(root, 'timing')) warn('animations are not converted');
      slides.push({
        index: no, file: part, ...(root.attrs.show === '0' ? { hidden: true } : {}),
        layout: layout?.name ?? null, layoutFile: layout?.part ?? null,
        background: background ? { ...background, from: bgFrom, ...(background.from ? { colorSource: background.from } : {}) } : null,
        shapes, ...(notes ? { notes } : {}),
      });
    } catch (e) {
      parseErrors++; warn(`slide ${no}: ${e.message}`);
      slides.push({ index: no, file: part, error: e.message });
    }
  });

  const mainMaster = [...masterUse.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const theme = (mainMaster ? loadMaster(mainMaster).theme : firstMaster?.theme) ?? { colors: {}, fonts: {} };
  const layouts = [...layoutCache.values()].map(describeLayout);
  const masters = [...new Set([...masterUse.keys(), ...[...layoutCache.values()].map((l) => l.master?.part).filter(Boolean)])].map((p) => describeMaster(loadMaster(p)));

  // ---- media ------------------------------------------------------------------------------
  const media = [];
  for (const name of zip.names.filter((n) => /^ppt\/media\//i.test(n) && !n.endsWith('/')).sort()) {
    let size = null, bytes = 0;
    try {
      const data = zip.read(name);
      bytes = data.length;
      size = imageSize(data);
      if (opts.media) {
        const dest = path.join(opts.out, 'media', path.basename(name));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, data);
      }
    } catch (e) { warn(`${name}: ${e.message}`); }
    media.push({ file: name, bytes, ...(size ? size : {}), ...(opts.media ? { exported: `media/${path.basename(name)}` } : {}), usedBy: [...(mediaUse.get(name) ?? [])] });
  }
  const embeddedFonts = zip.names.filter((n) => /^ppt\/fonts\//i.test(n));
  if (embeddedFonts.length) warn(`the deck embeds ${embeddedFonts.length} font file(s) (ppt/fonts); they are proprietary or subsetted and must not be reused`);

  const fontList = [...fontsUsed.entries()].sort((a, b) => b[1].chars - a[1].chars).map(([face, e]) => {
    const sub = substitutionFor(face);
    return { typeface: face, characters: e.chars, roles: [...e.roles], slides: [...e.slides].sort((a, b) => a - b), ...(sub ? { suggestion: { use: sub.use, google: sub.google, note: sub.note } } : {}) };
  });
  const nSlides = Math.max(1, slides.length);
  const colorList = [...colorsUsed.entries()].map(([hex, e]) => ({ hex, textCharacters: e.textChars, fillArea: round(e.fillArea / nSlides, 3), lines: e.lines, ...(e.from.size ? { from: [...e.from] } : {}), ...(e.alphas.size ? { alpha: [...e.alphas].sort((x, y) => x - y) } : {}), ...(e.effective.size ? { effective: [...e.effective] } : {}) }))
    .sort((a, b) => (b.fillArea * 2000 + b.textCharacters + b.lines * 5) - (a.fillArea * 2000 + a.textCharacters + a.lines * 5));

  const result = {
    tool: { name: 'pptx-extract', version: VERSION },
    source: path.basename(file),
    slideSize: { emu: { cx, cy }, inches: { width: round(cx / 914400, 2), height: round(cy / 914400, 2) }, aspect: round(cx / cy, 3) },
    canvas: { ...CANVAS, scale: round(scale, 8), scaleNote: 'canvas px = EMU * scale (+ offset)', offsetX: round(offsetX, 1), offsetY: round(offsetY, 1), letterboxed },
    theme: { name: theme.name, fontSchemeName: theme.fontSchemeName, colors: theme.colors, fonts: theme.fonts },
    fontsUsed: fontList,
    colorsUsed: colorList,
    masters, layouts, slides, media,
    stats: { slides: slides.length, layouts: layouts.length, masters: masters.length, mediaFiles: media.length, pictures: slides.reduce((n, s) => n + countKind(s.shapes ?? [], 'picture'), 0) },
    warnings,
  };
  return { result, parseErrors };
}

function countKind(shapes, kind) {
  let n = 0;
  for (const s of shapes) { if (s.kind === kind) n++; if (s.children) n += countKind(s.children, kind); }
  return n;
}

// --------------------------------------------------------------------------------------------
// summary.md
// --------------------------------------------------------------------------------------------

function summarize(r) {
  const L = [];
  const trunc = (s, n) => { s = s.replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  L.push(`# ${r.source}`, '');
  L.push(`- Slides: ${r.stats.slides}; layouts: ${r.stats.layouts}; images in the file: ${r.stats.mediaFiles}`);
  L.push(`- Slide size: ${r.slideSize.inches.width} x ${r.slideSize.inches.height} in (aspect ${r.slideSize.aspect})${r.canvas.letterboxed ? ' - NOT 16:9, scaled to fit and centred' : ''}; all coordinates below are px on a ${r.canvas.width}x${r.canvas.height} canvas`);
  L.push(`- Theme: ${r.theme.name ?? '(unnamed)'}`, '');
  L.push('## Theme colours', '', '| slot | colour |', '|---|---|');
  for (const [k, v] of Object.entries(r.theme.colors)) L.push(`| ${k} | ${v ?? '?'} |`);
  L.push('', '## Theme fonts', '');
  for (const role of ['major', 'minor']) {
    const f = r.theme.fonts[role] ?? {};
    L.push(`- ${role === 'major' ? 'Headings' : 'Body'}: latin ${f.latin ?? '-'}, east-asian ${f.ea || '-'}${f.cs ? `, complex ${f.cs}` : ''}${f.scripts?.Hans ? `, Hans ${f.scripts.Hans}` : ''}`);
  }
  L.push('', '## Fonts actually used (by amount of text)', '');
  if (!r.fontsUsed.length) L.push('(no text found)');
  for (const f of r.fontsUsed.slice(0, 12)) L.push(`- ${f.typeface} - ${f.characters} characters, slides ${f.slides.slice(0, 8).join(',')}${f.slides.length > 8 ? '…' : ''}${f.suggestion ? `; suggested open replacement: ${f.suggestion.use}${f.suggestion.note ? ` (${f.suggestion.note})` : ''}` : '; no entry in spec/font-map.json: pick an open look-alike'}`);
  L.push('', '## Colours actually used (most important first)', '');
  for (const c of r.colorsUsed.slice(0, 12)) L.push(`- ${c.hex}${c.alpha ? ` at ${c.alpha.map((a) => Math.round(a * 100) + '%').join(' / ')} opacity${c.effective ? ` (looks like ${c.effective.join(' / ')} over the slide background)` : ' (over a photo or unknown backdrop: the result depends on what lies beneath)'}` : ''} - covers ${(c.fillArea * 100).toFixed(0)}% of an average slide (shape fills, overlaps counted twice), ${c.textCharacters} text characters, ${c.lines} lines${c.from ? `; ${c.from.join(', ')}` : ''}`);
  L.push('', '## Layouts', '');
  for (const l of r.layouts) {
    const used = r.slides.filter((s) => s.layoutFile === l.file).map((s) => s.index);
    L.push(`- ${l.name ?? l.file}${l.type ? ` [${l.type}]` : ''}: ${l.shapes.length} shapes${used.length ? `; used by slides ${used.slice(0, 12).join(',')}${used.length > 12 ? '…' : ''}` : '; unused'}`);
  }
  const px = (v) => `${v}px`;
  const runStyle = (x) => `${x.size}px${x.bold ? ' bold' : ''}${x.italic ? ' italic' : ''} ${x.color ?? 'no-colour'}${x.colorAlpha ? ` @${Math.round(x.colorAlpha * 100)}%${x.colorEffective ? ` (${x.colorEffective})` : ''}` : ''}`;
  const textInfo = (t) => {
    const runs = t.paragraphs.flatMap((p) => p.runs).filter((x) => x.text.trim());
    if (!runs.length) return '';
    const styles = [...new Set(runs.map(runStyle))];
    const faces = [...new Set(runs.map((x) => x.font.ea || x.font.latin).filter(Boolean))];
    return ` "${trunc(t.paragraphs.map((p) => p.text).join(' / '), 70)}" [${styles.slice(0, 3).join('; ')}${styles.length > 3 ? '; …' : ''}]${faces.length ? ` ${faces.slice(0, 2).join(', ')}` : ''}`;
  };
  const fillInfo = (f) => !f ? '' : f.color ? ` fill ${f.color}${f.alpha !== undefined ? ` at ${Math.round(f.alpha * 100)}% opacity${f.effective ? ` (looks like ${f.effective} over the backdrop)` : f.effectiveNote ? ` (${f.effectiveNote})` : ''}` : ''}` : f.type === 'gradient' ? ' gradient' : f.type === 'image' ? ` image-fill${f.media ? ' ' + f.media.split('/').pop() : ''}` : '';
  const lineInfo = (l) => !l || l.type === 'none' ? '' : ` stroke${l.color ? ' ' + l.color : ''}${l.width !== undefined ? ' ' + px(l.width) : ''}${l.dash ? ' ' + l.dash : ''}`;
  const fxInfo = (s) => `${s.shadow ? ` shadow(${s.shadow.type} blur ${px(s.shadow.blur)} dist ${px(s.shadow.dist)} angle ${s.shadow.angle}deg${s.shadow.color ? ' ' + s.shadow.color + ' @' + Math.round((s.shadow.alpha ?? 1) * 100) + '%' : ''})` : ''}${(s.effects ?? []).map((e) => ` ${e.type}(${e.summary})`).join('')}`;
  const radiusInfo = (s) => s.cornerRadius !== undefined ? ` radius ${px(s.cornerRadius)}` : s.cornerRadii ? ` radii ${Object.entries(s.cornerRadii).map(([k, v]) => `${k}${v}`).join(' ')}px` : '';
  const line = (s, ind) => {
    const g = s.x !== undefined ? ` @${s.x},${s.y} ${s.w}x${s.h}` : '';
    const img = s.image ? ` ${s.image.media?.split('/').pop()}` : '';
    return `${ind}- ${s.kind}${s.placeholder ? ` (${s.placeholder.type})` : ''}${s.geometry && s.geometry !== 'rect' && s.geometry !== s.kind ? ` ${s.geometry}` : ''}${radiusInfo(s)}${g}${fillInfo(s.fill)}${lineInfo(s.line)}${fxInfo(s)}${img}${s.text ? textInfo(s.text) : ''}`;
  };
  const decor = [...r.masters.map((m) => ['master', m]), ...r.layouts.map((l) => ['layout ' + (l.name ?? ''), l])].map(([n, o]) => [n, o.shapes.filter((x) => !x.placeholder && x.kind !== 'other')]).filter(([, d]) => d.length);
  if (decor.length) {
    L.push('', '## Decoration on masters and layouts (repeats on every slide that uses them)', '');
    for (const [n, d] of decor) { L.push(`${n}:`); for (const x of d.slice(0, 8)) L.push(line(x, '  ')); }
  }
  L.push('', '## Slides', '');
  for (const s of r.slides) {
    if (s.error) { L.push(`### Slide ${s.index}: could not be read (${s.error})`, ''); continue; }
    const title = s.shapes.find((x) => x.placeholder && /title/i.test(x.placeholder.type) && x.text)?.text.paragraphs[0]?.text;
    L.push(`### Slide ${s.index}${title ? `: ${trunc(title, 60)}` : ''}${s.hidden ? ' (hidden)' : ''}`);
    L.push(`layout: ${s.layout ?? '?'}; background: ${s.background ? (s.background.color ? s.background.color + (s.background.alpha !== undefined ? ` at ${Math.round(s.background.alpha * 100)}%` : '') : s.background.type === 'image' ? `image ${s.background.media?.split('/').pop() ?? '?'}` : s.background.type) : '-'}${s.background?.from && s.background.from !== 'slide' ? ` (from ${s.background.from})` : ''}`);
    let shown = 0;
    const walk = (list, ind) => { for (const x of list) { if (shown >= 14) return; shown++; L.push(line(x, ind)); if (x.children) walk(x.children, ind + '  '); } };
    walk(s.shapes, '');
    const total = (function c(l) { return l.reduce((n, x) => n + 1 + (x.children ? c(x.children) : 0), 0); })(s.shapes);
    if (total > shown) L.push(`- … ${total - shown} more shapes (see extract.json)`);
    L.push('');
  }
  if (r.media.length) {
    L.push('## Images in the file', '');
    for (const m of r.media.slice(0, 20)) L.push(`- ${m.file.replace('ppt/', '')} - ${(m.bytes / 1024).toFixed(0)} KB${m.width ? `, ${m.width}x${m.height}` : ''}${m.usedBy.length ? `, used by ${m.usedBy.slice(0, 4).join(', ')}` : ''}`);
    L.push('');
  }
  if (r.warnings.length) { L.push('## Warnings', ''); for (const w of r.warnings) L.push(`- ${w}`); L.push(''); }
  return L.join('\n');
}

// --------------------------------------------------------------------------------------------
// CLI
// --------------------------------------------------------------------------------------------

function usage(code) {
  const text = 'usage: node tools/pptx-extract.mjs <file.pptx> [--out <dir>] [--media] [--json]\n' +
    '  --out <dir>  write extract.json and summary.md there (default ./<file>-extract/)\n' +
    '  --media      also copy the deck\'s images into <dir>/media/\n' +
    '  --json       print the full JSON on stdout instead of the summary\n' +
    'exit codes: 0 ok | 1 usage | 2 not a readable .pptx | 3 written, some parts could not be parsed';
  (code ? console.error : console.log)(text);
  process.exit(code);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) usage(0);
  const flag = (n) => { const i = args.indexOf(n); if (i < 0) return false; args.splice(i, 1); return true; };
  const opt = (n) => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v ?? null; };
  const media = flag('--media');
  const json = flag('--json');
  const out = opt('--out');
  const [file, ...rest] = args;
  if (!file || file.startsWith('-') || rest.length) usage(1);
  const outDir = path.resolve(out ?? `${path.basename(file).replace(/\.[^.]*$/, '')}-extract`);
  try {
    const { result, parseErrors } = extract(file, { media, out: outDir });
    const summary = summarize(result);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'extract.json'), JSON.stringify(result, null, 1) + '\n');
    fs.writeFileSync(path.join(outDir, 'summary.md'), summary + '\n');
    if (json) process.stdout.write(JSON.stringify(result, null, 1) + '\n');
    else {
      process.stdout.write(summary + '\n');
      console.error(`written: ${path.join(outDir, 'extract.json')} and ${path.join(outDir, 'summary.md')}${media ? ` and ${path.join(outDir, 'media')}${path.sep}` : ''}`);
    }
    process.exit(parseErrors ? 3 : 0);
  } catch (e) {
    if (e instanceof Fail) { console.error(`error: ${e.message}`); process.exit(e.code); }
    console.error(`error: unexpected failure while reading ${file}: ${e.stack ?? e.message}`);
    process.exit(2);
  }
}

main();
