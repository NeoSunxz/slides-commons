#!/usr/bin/env node
// slides-commons build: sources.json -> site/
//
//   node scripts/build.mjs
//   node scripts/build.mjs --sources tests/fixtures/x.json --out /tmp/site-x
//
// Options (env vars as an alternative, CLI wins):
//   --sources <file>  SC_SOURCES  alternate sources file (default: <repo>/sources.json).
//                                 `path` entries inside it still resolve from the repo root.
//   --out <dir>       SC_OUT      output directory (default: <repo>/site). Deleted and recreated, but
//                                 only if it is missing, empty, the default site/, or holds the
//                                 .slides-commons-build marker that every build writes.
//   SOURCE_DATE_EPOCH             timestamp for zip entries (default: 1980-01-01 00:00 UTC).
//
// Reads every source in sources.json, loads its templates' metadata, injects
// `source` / `license` / `authors`, validates against src/schema/template.schema.json,
// checks slug uniqueness across sources, then regenerates site/ from scratch:
// gallery, detail pages, sandboxed preview copies (with a paging bridge), screenshots,
// per-template zip packs (with prompts) and a credits page.
//
// Zero dependencies. Never writes outside site/; upstream files are only read.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

import { promptEn, promptZh, packReadme } from '../src/prompt.mjs';
import { indexPage, detailPage, creditsPage, setSources, pagePath, LANGS, SITE_NAME } from '../src/pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

function cliOption(name) {
  const argv = process.argv.slice(2);
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === `--${name}`) return argv[k + 1];
    if (argv[k].startsWith(`--${name}=`)) return argv[k].slice(name.length + 3);
  }
  return undefined;
}
const optSources = cliOption('sources') ?? process.env.SC_SOURCES;
const optOut = cliOption('out') ?? process.env.SC_OUT;
const SOURCES_FILE = optSources ? path.resolve(optSources) : path.join(ROOT, 'sources.json');
const SITE = optOut ? path.resolve(optOut) : path.join(ROOT, 'site');

class BuildError extends Error {}
const fail = (msg) => { throw new BuildError(msg); };
const warnings = [];
const warn = (msg) => { warnings.push(msg); console.warn(`warning: ${msg}`); };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);
const rel = (p) => path.relative(ROOT, p) || '.';
// Join a POSIX-style config path ("a/{slug}/b.md") onto a base dir, cross-platform.
const joinCfg = (base, cfgPath, slug) => path.join(base, ...cfgPath.replace(/\{slug\}/g, slug).split('/'));
const urlJoin = (...parts) => parts.map((p, i) => (i === 0 ? p.replace(/\/+$/, '') : p.replace(/^\/+|\/+$/g, ''))).filter(Boolean).join('/');
const repoName = (url) => url.replace(/\/+$/, '').split('/').pop();
const toPosix = (p) => p.split(path.sep).join('/');

function readJson(p) {
  try { return JSON.parse(read(p)); } catch (e) { fail(`cannot read JSON ${rel(p)}: ${e.message}`); }
}

function writeFile(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data);
}

// All files under dir, as paths relative to dir (OS separators).
function walk(dir, base = dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full, base));
    else if (ent.isFile()) out.push(path.relative(base, full));
  }
  return out;
}

// PNG dimensions from the IHDR chunk (for width/height attributes).
function pngSize(file) {
  const fd = fs.openSync(file, 'r');
  try {
    const b = Buffer.alloc(24);
    fs.readSync(fd, b, 0, 24, 0);
    if (b.readUInt32BE(0) !== 0x89504e47) return { width: 1920, height: 1080 };
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  } finally { fs.closeSync(fd); }
}

// ---------------------------------------------------------------------------
// Minimal YAML front matter reader (mappings, scalars, lists, block scalars).
// Enough for design.md front matter; not a general YAML parser.
// ---------------------------------------------------------------------------

function parseScalar(raw) {
  let v = raw.trim();
  if (v.startsWith('"')) {
    const end = findClosingQuote(v, '"');
    try { return JSON.parse(v.slice(0, end + 1)); } catch { return v.slice(1, end); }
  }
  if (v.startsWith("'")) {
    const end = findClosingQuote(v, "'");
    return v.slice(1, end).replace(/''/g, "'");
  }
  const hash = v.search(/\s#/);
  if (hash >= 0) v = v.slice(0, hash).trim();
  return v;
}

function findClosingQuote(s, q) {
  for (let i = 1; i < s.length; i++) {
    if (q === '"' && s[i] === '\\') { i++; continue; }
    if (s[i] === q) {
      if (q === "'" && s[i + 1] === "'") { i++; continue; }
      return i;
    }
  }
  return s.length - 1;
}

function parseYaml(text) {
  const lines = text.split(/\r?\n/);
  let i = 0;
  const indentOf = (l) => l.match(/^ */)[0].length;
  const skippable = (l) => /^\s*(#.*)?$/.test(l);

  function block(indent) {
    // Decide mapping vs list from the first meaningful line.
    while (i < lines.length && skippable(lines[i])) i++;
    if (i >= lines.length) return null;
    const isList = lines[i].trimStart().startsWith('- ') || lines[i].trim() === '-';
    const out = isList ? [] : {};
    while (i < lines.length) {
      const line = lines[i];
      if (skippable(line)) { i++; continue; }
      const ind = indentOf(line);
      if (ind < indent) break;
      if (ind > indent) { i++; continue; } // stray deeper line; ignore
      const body = line.slice(ind);
      if (isList) {
        if (!body.startsWith('-')) break;
        i++;
        const rest = body.slice(1).trim();
        out.push(rest ? parseScalar(rest) : block(indent + 2));
        continue;
      }
      const m = body.match(/^("[^"]*"|'[^']*'|[^:#][^:]*?)\s*:(?:\s+(.*))?$/);
      if (!m) { i++; continue; }
      const key = m[1].replace(/^["']|["']$/g, '');
      const val = (m[2] ?? '').trim();
      i++;
      if (val === '' ) {
        const nextIdx = lines.slice(i).findIndex((l) => !skippable(l));
        const next = nextIdx >= 0 ? lines[i + nextIdx] : null;
        out[key] = next && indentOf(next) > indent ? block(indentOf(next)) : '';
      } else if (/^[|>][+-]?$/.test(val)) {
        const parts = [];
        let bi = null;
        while (i < lines.length) {
          const l = lines[i];
          if (l.trim() === '') { parts.push(''); i++; continue; }
          const li = indentOf(l);
          if (li <= indent) break;
          if (bi === null) bi = li;
          parts.push(l.slice(bi));
          i++;
        }
        while (parts.length && parts[parts.length - 1] === '') parts.pop();
        out[key] = val[0] === '|' ? parts.join('\n') : parts.join('\n').replace(/([^\n])\n(?!\n)/g, '$1 ');
      } else {
        out[key] = parseScalar(val);
      }
    }
    return out;
  }
  return block(0) ?? {};
}

function frontMatter(md) {
  const m = md.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  return m ? parseYaml(m[1]) : {};
}

// ---------------------------------------------------------------------------
// Tiny JSON Schema checker (subset; see src/schema/template.schema.json)
// ---------------------------------------------------------------------------

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v;
}

function validate(value, schema, root, at = '$', errors = []) {
  if (schema.$ref) {
    const ref = schema.$ref.replace(/^#\//, '').split('/').reduce((o, k) => o?.[k], root);
    if (!ref) { errors.push(`${at}: unresolved $ref ${schema.$ref}`); return errors; }
    validate(value, ref, root, at, errors);
  }
  const t = typeOf(value);
  if (schema.type) {
    const types = [].concat(schema.type);
    const ok = types.some((x) => x === t || (x === 'number' && t === 'integer'));
    if (!ok) { errors.push(`${at}: expected ${types.join('|')}, got ${t}`); return errors; }
  }
  if ('const' in schema && value !== schema.const) errors.push(`${at}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at}: ${JSON.stringify(value)} not in [${schema.enum.join(', ')}]`);
  if (t === 'string') {
    if (schema.minLength != null && value.length < schema.minLength) errors.push(`${at}: shorter than ${schema.minLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${at}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
  }
  if ((t === 'integer' || t === 'number') && schema.minimum != null && value < schema.minimum) errors.push(`${at}: below ${schema.minimum}`);
  if (t === 'array') {
    if (schema.minItems != null && value.length < schema.minItems) errors.push(`${at}: fewer than ${schema.minItems} items`);
    if (schema.items) value.forEach((v, k) => validate(v, schema.items, root, `${at}[${k}]`, errors));
  }
  if (t === 'object') {
    const keys = Object.keys(value);
    if (schema.minProperties != null && keys.length < schema.minProperties) errors.push(`${at}: fewer than ${schema.minProperties} properties`);
    for (const r of schema.required ?? []) if (!(r in value)) errors.push(`${at}: missing required "${r}"`);
    const props = schema.properties ?? {};
    for (const k of keys) {
      if (k in props) validate(value[k], props[k], root, `${at}.${k}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${at}: unexpected property "${k}"`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        validate(value[k], schema.additionalProperties, root, `${at}.${k}`, errors);
      }
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Zip writer (deflate via node:zlib, no deps)
// ---------------------------------------------------------------------------

const crc32 = zlib.crc32 ?? (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

// DOS date/time in UTC so the bytes do not depend on the build machine's time zone.
function dosDateTime(d) {
  const time = (d.getUTCHours() << 11) | (d.getUTCMinutes() << 5) | (d.getUTCSeconds() >> 1);
  const date = ((d.getUTCFullYear() - 1980) << 9) | ((d.getUTCMonth() + 1) << 5) | d.getUTCDate();
  return { time, date };
}

// Fixed entry timestamp for reproducible zips: SOURCE_DATE_EPOCH if set, else 1980-01-01.
function zipTimestamp() {
  const min = Date.UTC(1980, 0, 1);
  const max = Date.UTC(2107, 11, 31, 23, 59, 58);
  const epoch = Number(process.env.SOURCE_DATE_EPOCH);
  if (process.env.SOURCE_DATE_EPOCH && Number.isFinite(epoch)) {
    return new Date(Math.min(max, Math.max(min, epoch * 1000)));
  }
  return new Date(min);
}

// entries: [{ name: 'dir/' } | { name: 'dir/file', data: Buffer }]
function makeZip(entries, mtime) {
  const { time, date } = dosDateTime(mtime);
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, 'utf8');
    const isDir = e.name.endsWith('/');
    const raw = isDir ? Buffer.alloc(0) : e.data;
    const crc = isDir ? 0 : crc32(raw);
    let method = 0;
    let body = raw;
    if (!isDir && raw.length) {
      const deflated = zlib.deflateRawSync(raw, { level: 9 });
      if (deflated.length < raw.length) { method = 8; body = deflated; }
    }
    const flags = 0x0800; // UTF-8 names
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(flags, 6);
    lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(time, 10);
    lh.writeUInt16LE(date, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(body.length, 18);
    lh.writeUInt32LE(raw.length, 22);
    lh.writeUInt16LE(name.length, 26);
    lh.writeUInt16LE(0, 28);
    locals.push(lh, name, body);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE((3 << 8) | 20, 4); // made by: UNIX, spec 2.0 (so unzip applies the modes below)
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(flags, 8);
    ch.writeUInt16LE(method, 10);
    ch.writeUInt16LE(time, 12);
    ch.writeUInt16LE(date, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(body.length, 20);
    ch.writeUInt32LE(raw.length, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt16LE(0, 30); // extra
    ch.writeUInt16LE(0, 32); // comment
    ch.writeUInt16LE(0, 34); // disk
    ch.writeUInt16LE(0, 36); // internal attrs
    ch.writeUInt32LE(isDir ? ((0o40755 << 16) | 0x10) >>> 0 : (0o100644 << 16) >>> 0, 38);
    ch.writeUInt32LE(offset, 42);
    centrals.push(ch, name);

    offset += lh.length + name.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, cd, end]);
}

// ---------------------------------------------------------------------------
// Load sources + templates
// ---------------------------------------------------------------------------

const LAYOUT_DEFAULTS = {
  templatesDir: 'templates',
  metaFile: 'template.json',
  htmlFile: 'template.html',
  designFile: 'design.md',
  screenshotsDir: 'screenshots',
  licenseFile: 'LICENSE',
};

function loadSources() {
  const cfgPath = SOURCES_FILE;
  const cfg = readJson(cfgPath);
  if (!Array.isArray(cfg.sources) || !cfg.sources.length) fail('sources.json: "sources" must be a non-empty array');
  const ids = new Set();
  return cfg.sources.map((s, k) => {
    const where = `sources.json sources[${k}]`;
    for (const f of ['id', 'name', 'author', 'license', 'repo', 'branch', 'path']) {
      if (typeof s[f] !== 'string' || !s[f]) fail(`${where}: missing "${f}"`);
    }
    if (ids.has(s.id)) fail(`${where}: duplicate source id "${s.id}"`);
    ids.add(s.id);
    const dir = path.join(ROOT, ...s.path.split('/'));
    if (!exists(dir)) fail(`${where}: path ${s.path} not found (run: git submodule update --init)`);
    const layout = { ...LAYOUT_DEFAULTS, ...(s.layout ?? {}) };
    let companion = null;
    if (s.companion) {
      const c = s.companion;
      for (const f of ['id', 'name', 'author', 'license', 'repo', 'branch', 'path']) {
        if (typeof c[f] !== 'string' || !c[f]) fail(`${where}.companion: missing "${f}"`);
      }
      const cdir = path.join(ROOT, ...c.path.split('/'));
      if (!exists(cdir)) fail(`${where}.companion: path ${c.path} not found (run: git submodule update --init)`);
      companion = { ...c, dir: cdir };
    }
    if (s.include != null && !Array.isArray(s.include)) fail(`${where}: "include" must be an array of slugs`);
    return { ...s, dir, layout, companion };
  });
}

function loadTemplates(sources, schema) {
  const all = [];
  const bySlug = new Map();
  for (const src of sources) {
    const tdir = path.join(src.dir, ...src.layout.templatesDir.split('/'));
    if (!exists(tdir)) fail(`source ${src.id}: templates dir ${rel(tdir)} not found`);
    let slugs = fs.readdirSync(tdir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && exists(path.join(tdir, d.name, src.layout.metaFile)))
      .map((d) => d.name).sort();
    if (src.include) {
      const missing = src.include.filter((s) => !slugs.includes(s));
      if (missing.length) fail(`source ${src.id}: include lists unknown template(s): ${missing.join(', ')}`);
      slugs = slugs.filter((s) => src.include.includes(s));
    }
    for (const dirName of slugs) {
      const dir = path.join(tdir, dirName);
      const metaPath = path.join(dir, src.layout.metaFile);
      const meta = readJson(metaPath);
      const record = {
        ...meta,
        source: src.id,
        license: meta.license ?? src.license,
        authors: meta.authors ?? [{ name: src.author, ...(src.authorUrl ? { url: src.authorUrl } : {}) }],
      };
      const errors = validate(record, schema, schema);
      if (errors.length) fail(`${rel(metaPath)} failed schema validation:\n  - ${errors.join('\n  - ')}`);
      if (record.slug !== dirName) fail(`${rel(metaPath)}: slug "${record.slug}" does not match its directory "${dirName}"`);
      if (bySlug.has(record.slug)) {
        const other = bySlug.get(record.slug);
        fail(`duplicate slug "${record.slug}": source "${other.source}" (${rel(other.dir)}) and source "${src.id}" (${rel(dir)})`);
      }
      const t = { ...record, dir, src };
      bySlug.set(t.slug, t);
      all.push(t);
    }
  }
  return { templates: all, bySlug };
}

// ---------------------------------------------------------------------------
// Per-template data for pages, prompt and zip
// ---------------------------------------------------------------------------

function screenshotsFor(src, slug) {
  const dir = path.join(src.dir, ...src.layout.screenshotsDir.split('/'));
  if (!exists(dir)) return [];
  const re = new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.(png|jpe?g|webp)$`, 'i');
  return fs.readdirSync(dir)
    .map((f) => ({ f, m: f.match(re) }))
    .filter((x) => x.m)
    .map(({ f, m }) => {
      const full = path.join(dir, f);
      const size = /\.png$/i.test(f) ? pngSize(full) : { width: 1920, height: 1080 };
      return { file: f, path: full, n: Number(m[1]), ...size };
    })
    .sort((a, b) => a.n - b.n);
}

// "Preview Ingredients" bullets from the companion preview card.
function previewIngredients(md) {
  const sec = md.match(/^##\s+Preview Ingredients\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m);
  if (!sec) return { palette: [], typography: [], moves: [] };
  const out = { palette: [], typography: [], moves: [] };
  for (const line of sec[1].split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*([^:]+):\s*(.+)$/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase();
    const val = m[2].trim();
    if (key === 'palette') {
      out.palette = val.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
        const mm = p.match(/^(.+?)\s+(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))$/);
        return mm ? { name: mm[1].trim(), value: mm[2] } : null;
      }).filter(Boolean);
    } else if (key === 'typography') {
      out.typography = val.split(';').map((p) => p.trim()).filter((p) => p && !/^see\b/i.test(p) && !/^\{/.test(p));
    } else if (key.startsWith('signature move')) {
      out.moves.push(val);
    }
  }
  return out;
}

// Resolve design-token references like {colors.paper} / {components.frame} in prose.
function resolveTokens(text, colors) {
  return text.replace(/`?\{([a-z0-9_-]+)\.([a-z0-9_.-]+)\}`?/gi, (_, group, key) => {
    if (group === 'colors' && colors[key]) return `\`${key}\` ${colors[key]}`;
    return `\`${key.split('.').pop()}\``;
  });
}

// Stylesheet URLs from Google Fonts / Fontshare referenced by the template.
function fontLinks(html) {
  const urls = new Set();
  const re = /https:\/\/(?:fonts\.googleapis\.com\/css2?\?|api\.fontshare\.com\/v2\/css\?)[^"'\s)<>]+/g;
  for (const m of html.matchAll(re)) urls.add(m[0].replace(/&amp;/g, '&'));
  return [...urls];
}

const isHexish = (v) => typeof v === 'string' && /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(v.trim());

function buildContext(t) {
  const { src } = t;
  const L = src.layout;
  const comp = src.companion;

  // design.md: companion override first, template's own as fallback.
  let designPath = path.join(t.dir, L.designFile);
  let designFrom = 'template';
  if (comp?.designOverride) {
    const p = joinCfg(comp.dir, comp.designOverride, t.slug);
    if (exists(p)) { designPath = p; designFrom = 'companion'; }
    else warn(`${t.slug}: companion design.md not found at ${rel(p)}; using the template's own design.md`);
  }
  if (!exists(designPath)) fail(`${t.slug}: no design.md (looked at ${rel(designPath)})`);
  const designMd = read(designPath);
  const fm = frontMatter(designMd);

  let preview = { palette: [], typography: [], moves: [] };
  if (comp?.previewCard) {
    const p = joinCfg(comp.dir, comp.previewCard, t.slug);
    if (exists(p)) preview = previewIngredients(read(p));
    else warn(`${t.slug}: preview card not found at ${rel(p)}`);
  }

  let viewportBasePath = null;
  if (comp?.viewportBase) {
    viewportBasePath = joinCfg(comp.dir, comp.viewportBase, t.slug);
    if (!exists(viewportBasePath)) fail(`${t.slug}: companion viewportBase not found at ${rel(viewportBasePath)}`);
  }

  const htmlPath = path.join(t.dir, L.htmlFile);
  if (!exists(htmlPath)) fail(`${t.slug}: ${rel(htmlPath)} not found`);
  const html = read(htmlPath);

  // Colors: design.md front matter > preview card > template.json palette.
  const fmColors = fm.colors && typeof fm.colors === 'object' && !Array.isArray(fm.colors) ? fm.colors : {};
  let colors = Object.entries(fmColors).filter(([, v]) => isHexish(v)).map(([name, value]) => ({ name, value: String(value) }));
  if (!colors.length) colors = preview.palette;
  const paletteColors = Object.entries(t.palette).filter(([k, v]) => k !== 'description' && isHexish(v)).map(([name, value]) => ({ name, value }));
  if (!colors.length) colors = paletteColors;
  const colorMap = Object.fromEntries(colors.map((c) => [c.name, c.value]));
  const stageKey = Object.keys(colorMap).find((k) => /^stage[-_]?bg$/i.test(k));

  const typography = Object.entries(t.typography).filter(([k]) => k !== 'style').map(([role, family]) => ({ role, family }));

  // Sibling assets shipped with template.html (never the meta / design files).
  const skip = new Set([L.metaFile, L.htmlFile, L.designFile].map((f) => path.normalize(f)));
  const assets = walk(t.dir).filter((f) => !skip.has(path.normalize(f)) && !/(^|[\\/])\.[^\\/]+$/.test(f)).map(toPosix);

  const srcLicense = path.join(src.dir, L.licenseFile);
  if (!exists(srcLicense)) fail(`source ${src.id}: license file ${rel(srcLicense)} not found`);
  const licenses = [{ file: 'LICENSE-templates', path: srcLicense }];
  if (comp) {
    const p = path.join(comp.dir, comp.licenseFile ?? 'LICENSE');
    if (!exists(p)) fail(`companion ${comp.id}: license file ${rel(p)} not found`);
    licenses.push({ file: 'LICENSE-skill', path: p });
  }

  const ctx = {
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    mood: t.mood,
    tone: t.tone,
    scheme: t.scheme,
    density: t.density,
    formality: t.formality,
    description: typeof fm.description === 'string' ? fm.description.trim() : '',
    colors,
    paletteNote: (t.palette.description ?? '').replace(/\.\s*$/, ''),
    typography,
    typographyStyle: t.typography.style ?? '',
    fontLinks: fontLinks(html),
    signatureMoves: preview.moves.map((m) => resolveTokens(m, colorMap)),
    stageBg: stageKey ? { name: stageKey, value: colorMap[stageKey] } : null,
    assets,
    hasViewportBase: Boolean(viewportBasePath),
    licenses,
  };

  const sourceDirUrl = urlJoin(src.repo, 'tree', src.branch, L.templatesDir, t.slug);
  const companionInfo = comp ? {
    repoName: repoName(comp.repo),
    author: comp.author,
    license: comp.license,
    dirUrl: comp.designOverride
      ? urlJoin(comp.repo, 'tree', comp.branch, path.posix.dirname(comp.designOverride.replace(/\{slug\}/g, t.slug)))
      : comp.repo,
  } : null;

  return { ctx, designPath, designFrom, viewportBasePath, htmlPath, html, assets, licenses, sourceDirUrl, companionInfo, paletteColors };
}

// ---------------------------------------------------------------------------
// Output directory safety
// ---------------------------------------------------------------------------

// Marker written into every build output. The build only clears a directory that
// is missing, empty, the default <repo>/site, or carries this marker.
const MARKER = '.slides-commons-build';
const MARKER_TEXT = 'Generated by scripts/build.mjs (slides-commons). This whole directory is build output and is safe to delete.\n';
const DEFAULT_SITE = path.join(ROOT, 'site');

function isInside(parent, child) {
  const r = path.relative(parent, child);
  return r === '' || (!r.startsWith('..') && !path.isAbsolute(r));
}

function prepareOutDir(sources) {
  const sourceDirs = sources.flatMap((s) => [s.dir, s.companion?.dir].filter(Boolean));
  // Never, marker or not: the filesystem root, anything containing the repo or a
  // source, or a directory inside a (read-only) source.
  if (SITE === path.parse(SITE).root || isInside(SITE, ROOT) ||
      sourceDirs.some((d) => isInside(SITE, d) || isInside(d, SITE))) {
    fail(`refusing to clear ${SITE}: it is the filesystem root, contains the repo or a source, or is inside a source`);
  }
  let stat = null;
  try { stat = fs.statSync(SITE); } catch { /* does not exist */ }
  if (stat) {
    if (!stat.isDirectory()) fail(`refusing to clear ${SITE}: it is not a directory`);
    const allowed = SITE === DEFAULT_SITE ||
      fs.readdirSync(SITE).length === 0 ||
      exists(path.join(SITE, MARKER));
    if (!allowed) fail(`refusing to clear ${SITE}: not empty and not a previous build output (missing marker ${MARKER})`);
    fs.rmSync(SITE, { recursive: true, force: true });
  }
  fs.mkdirSync(SITE, { recursive: true });
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

// Changes made to the site's preview copy only (never to upstream, never to the zip).
//
// Local sibling scripts and stylesheets are inlined: the preview runs in an iframe with
// sandbox="allow-scripts" (opaque origin), and under file:// Chrome refuses to load local
// subresources into such a frame. Inlining makes the preview work over http and file://.
// Remote URLs (font CSS, CDNs) are left as they are.
const isLocalRef = (ref) => ref && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(ref.trim());

function readLocalRef(dir, ref, slug) {
  let rel;
  try { rel = decodeURI(ref.trim().split(/[?#]/)[0]); } catch { return null; }
  const file = path.resolve(dir, ...rel.split('/'));
  if (!isInside(dir, file) || !exists(file) || !fs.statSync(file).isFile()) {
    warn(`${slug}: preview cannot inline ${ref} (not a file inside the template directory)`);
    return null;
  }
  return read(file);
}

const attrValue = (attrs, name) => {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
};

function inlineLocalAssets(html, dir, slug) {
  let out = html.replace(/<script\b([^>]*)>\s*<\/script\s*>/gi, (tag, attrs) => {
    const src = attrValue(attrs, 'src');
    if (!isLocalRef(src)) return tag;
    const code = readLocalRef(dir, src, slug);
    if (code == null) return tag;
    if (/\b(defer|async)\b/i.test(attrs) && !/type\s*=\s*["']?module/i.test(attrs)) {
      warn(`${slug}: preview inlines ${src}, which was loaded with defer/async; it now runs in place`);
    }
    const kept = attrs
      .replace(/\s+(?:src|defer|async|integrity|crossorigin)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, '')
      .trim();
    // "</script" inside the code would end the element early; "<\/" is equivalent in JS
    // strings, templates, regexes and comments.
    const safe = code.replace(/<\/script/gi, '<\\/script');
    return `<script${kept ? ' ' + kept : ''} data-inlined-from="${src.replace(/"/g, '&quot;')}">\n${safe}\n</script>`;
  });
  out = out.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = (attrValue(tag, 'rel') || '').toLowerCase().split(/\s+/);
    const href = attrValue(tag, 'href');
    if (!rel.includes('stylesheet') || !isLocalRef(href)) return tag;
    const css = readLocalRef(dir, href, slug);
    if (css == null) return tag;
    const media = attrValue(tag, 'media');
    const safe = css.replace(/<\/style/gi, '<\\/style');
    return `<style${media ? ` media="${media.replace(/"/g, '&quot;')}"` : ''} data-inlined-from="${href.replace(/"/g, '&quot;')}">\n${safe}\n</style>`;
  });
  return out;
}

function preparePreview(html, bridge, dir, slug) {
  let out = inlineLocalAssets(html, dir, slug);
  // deck-stage.js sets a system font-family on its :host, which overrides the font the
  // template sets on <body>. An outer-document rule beats :host, so restore inheritance.
  if (/<deck-stage[\s>]/i.test(out)) {
    const fix = '\n<!-- slides-commons preview fix: let <deck-stage> inherit the template font (deck-stage.js forces a system font on :host) -->\n' +
      '<style>deck-stage { font-family: inherit; }</style>\n';
    const head = out.toLowerCase().indexOf('</head>');
    out = head >= 0 ? out.slice(0, head) + fix + out.slice(head) : fix + out;
  }
  const tag = `\n<script>/* slides-commons preview bridge (added by the site build; not part of the original template) */\n${bridge}</script>\n`;
  const idx = out.toLowerCase().lastIndexOf('</body>');
  return idx >= 0 ? out.slice(0, idx) + tag + out.slice(idx) : out + tag;
}

function main() {
  const started = Date.now();
  const schema = readJson(path.join(SRC, 'schema', 'template.schema.json'));
  const sources = loadSources();
  const { templates, bySlug } = loadTemplates(sources, schema);
  if (!templates.length) fail('no templates found');

  const bridge = read(path.join(SRC, 'preview-bridge.js'));
  const zipTime = zipTimestamp();

  prepareOutDir(sources);
  writeFile(path.join(SITE, '.nojekyll'), '');
  writeFile(path.join(SITE, MARKER), MARKER_TEXT);
  fs.mkdirSync(path.join(SITE, 'assets'), { recursive: true });
  fs.copyFileSync(path.join(SRC, 'styles.css'), path.join(SITE, 'assets', 'site.css'));
  fs.copyFileSync(path.join(SRC, 'detail.js'), path.join(SITE, 'assets', 'detail.js'));
  fs.copyFileSync(path.join(SRC, 'site.js'), path.join(SITE, 'assets', 'site.js'));

  setSources(sources.filter((s) => templates.some((t) => t.source === s.id)));

  const pageData = [];
  for (const t of templates) {
    const info = buildContext(t);
    const { ctx } = info;

    // Screenshots used by this template.
    const shots = screenshotsFor(t.src, t.slug);
    if (!shots.length) warn(`${t.slug}: no screenshots found`);
    for (const s of shots) {
      const dest = path.join(SITE, 'assets', 'screenshots', s.file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(s.path, dest);
    }

    // Preview copy: template dir minus meta/design files, bridge injected into the HTML copy.
    const pdir = path.join(SITE, 'preview', t.slug);
    writeFile(path.join(pdir, t.src.layout.htmlFile), preparePreview(info.html, bridge, t.dir, t.slug));
    for (const a of info.assets) {
      const dest = path.join(pdir, ...a.split('/'));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(t.dir, ...a.split('/')), dest);
    }

    // Prompt + zip.
    const en = promptEn(ctx);
    const zh = promptZh(ctx);
    const credits = [{
      what: `Template "${t.name}" (${['template.html', ...info.assets].map((f) => '`' + f + '`').join(', ')}${info.designFrom === 'template' ? ', `design.md`' : ''})`,
      author: t.authors.map((a) => a.name).join(', '),
      project: repoName(t.src.repo),
      license: t.license,
      licenseFile: 'LICENSE-templates',
      url: info.sourceDirUrl,
    }];
    if (t.src.companion) {
      const files = [info.designFrom === 'companion' ? '`design.md` (fixed-stage edition)' : null, info.viewportBasePath ? '`viewport-base.css`' : null].filter(Boolean);
      if (files.length) {
        credits.push({
          what: files.join(' and '),
          author: t.src.companion.author,
          project: repoName(t.src.companion.repo),
          license: t.src.companion.license,
          licenseFile: 'LICENSE-skill',
          url: info.companionInfo.dirUrl,
        });
      }
    }
    const readme = packReadme(ctx, credits, SITE_NAME);

    const z = `${t.slug}/`;
    const entries = [
      { name: z },
      { name: z + t.src.layout.htmlFile, data: fs.readFileSync(info.htmlPath) },
      ...info.assets.map((a) => ({ name: z + a, data: fs.readFileSync(path.join(t.dir, ...a.split('/'))) })),
      { name: z + 'design.md', data: fs.readFileSync(info.designPath) },
      ...(info.viewportBasePath ? [{ name: z + 'viewport-base.css', data: fs.readFileSync(info.viewportBasePath) }] : []),
      ...info.licenses.map((l) => ({ name: z + l.file, data: fs.readFileSync(l.path) })),
      { name: z + 'PROMPT.md', data: Buffer.from(en, 'utf8') },
      { name: z + 'PROMPT.zh.md', data: Buffer.from(zh, 'utf8') },
      { name: z + 'README.md', data: Buffer.from(readme, 'utf8') },
    ];
    // Add intermediate directory entries for nested assets.
    const dirs = new Set();
    for (const e of entries) {
      const parts = e.name.split('/');
      for (let k = 2; k < parts.length; k++) dirs.add(parts.slice(0, k).join('/') + '/');
    }
    dirs.delete(z);
    const zipEntries = [entries[0], ...[...dirs].sort().map((name) => ({ name })), ...entries.slice(1)];
    writeFile(path.join(SITE, 'zip', `${t.slug}.zip`), makeZip(zipEntries, zipTime));

    // Derived-from info (optional).
    let derived = null;
    if (t.derivedFrom) {
      const o = bySlug.get(t.derivedFrom.slug);
      const osrc = sources.find((s) => s.id === t.derivedFrom.source);
      if (!osrc) fail(`${t.slug}: derivedFrom.source "${t.derivedFrom.source}" is not in sources.json`);
      derived = {
        name: o?.name ?? t.derivedFrom.slug,
        url: urlJoin(osrc.repo, 'tree', osrc.branch, osrc.layout.templatesDir, t.derivedFrom.slug),
        authors: o?.authors ?? [{ name: osrc.author, url: osrc.authorUrl }],
        license: o?.license ?? osrc.license,
      };
    }

    const data = {
      ...t,
      htmlFile: t.src.layout.htmlFile,
      description: ctx.description,
      paletteColors: info.paletteColors,
      screenshots: shots,
      thumb: shots[0] ?? null,
      sourceRepoUrl: t.src.repo,
      sourceRepoName: repoName(t.src.repo),
      sourceDirUrl: info.sourceDirUrl,
      companionInfo: info.companionInfo,
      derived,
      promptEn: en,
      promptZh: zh,
    };
    for (const lang of LANGS) {
      writeFile(path.join(SITE, ...pagePath(lang, `t/${t.slug}/index.html`).split('/')), detailPage(data, lang));
    }
    pageData.push(data);
  }

  for (const lang of LANGS) {
    writeFile(path.join(SITE, ...pagePath(lang, 'index.html').split('/')), indexPage({ templates: pageData, lang }));
    writeFile(path.join(SITE, ...pagePath(lang, 'credits.html').split('/')), creditsPage({ sources, templates: pageData, lang }));
  }

  const ms = Date.now() - started;
  console.log(`built ${templates.length} template(s) from ${sources.length} source(s) into ${rel(SITE).startsWith('..') ? SITE : rel(SITE)}${path.sep} in ${ms} ms` +
    (warnings.length ? ` (${warnings.length} warning(s))` : ''));
}

try {
  main();
} catch (e) {
  if (e instanceof BuildError) {
    console.error(`build failed: ${e.message}`);
    process.exit(1);
  }
  throw e;
}
