#!/usr/bin/env node
// slides-commons build: sources.json -> site/
//
//   node scripts/build.mjs
//   node scripts/build.mjs --sources tests/fixtures/x.json --out /tmp/site-x
//
// Options (env vars as an alternative, CLI wins):
//   --sources <file>  SC_SOURCES  alternate sources file (default: <repo>/sources/sources.json).
//                                 `path` entries inside it still resolve from the repo root.
//   --out <dir>       SC_OUT      output directory (default: <repo>/site). Deleted and recreated, but
//                                 only if it is missing, empty, the default site/, or holds the
//                                 .slides-commons-build marker that every build writes.
//   --site-url <url>  SC_SITE_URL public base URL of the deployed site (http/https; a trailing
//                                 slash is added). When set, both prompts tell the agent to
//                                 download <url>zip/<slug>.zip itself if the pack is not there.
//                                 Default: none, and the prompts are unchanged.
//   --extra-sources <file>        SC_EXTRA_SOURCES  more sources files (same format as sources.json),
//                                 e.g. a company's private templates kept outside this repository.
//                                 Repeatable; SC_EXTRA_SOURCES and a single option value may hold
//                                 several paths separated by the platform's path delimiter. Paths
//                                 inside such a file resolve from that file's own directory.
//                                 <repo>/sources.local.json or <repo>/sources/sources.local.json is loaded automatically when it exists
//                                 (only together with the default sources.json; --no-local-sources
//                                 or SC_NO_LOCAL_SOURCES=1 turns that off).
//   --only-sources <id,...>       SC_ONLY_SOURCES   build / validate only these sources (default: all).
//                                 Slug uniqueness is still checked against every source.
//   --no-kits                     SC_NO_KITS=1      skip the convert kit and skills pages/zips.
//   --validate                    run scripts/validate.mjs instead of building (same options).
//   --i18n-dir <dir>  SC_I18N_DIR directory with zh.json and zh.sources.json (default: src/i18n;
//                                 relative paths resolve from the repo root). See scripts/i18n.mjs.
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
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { thumbnail } from './png-thumb.mjs';
import { parseRequests, cjkFamilyEntry, cjkFamiliesIn, cjkRangesJson, createFontStore, planTemplateFonts, fontFaceCss, rewriteGoogleFonts, cjkOnlyLinks, isCjkFamily, dataUrl, relativeUrl } from './fonts.mjs';
import { checkCollectionTemplate } from './collection-checks.mjs';
import { overlayPreviewHtml, metaFileOf, screenshotsDirOf, inlineLocalAssets as inlineLocal } from './overlay.mjs';
import { loadZh, checkZh, resolveZh, zhTerm } from './i18n.mjs';
import { zhText } from '../src/zh-text.mjs';
import { promptEn, promptZh, packReadme } from '../src/prompt.mjs';
import { indexPage, galleryPage, detailPage, creditsPage, setSources, setAutoDownload, pagePath, LANGS, SITE_NAME } from '../src/pages.mjs';
import { convertPage, skillsPage } from '../src/kit-pages.mjs';
import { buildKits } from './kits.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const FONT_STORE = createFontStore(ROOT);

function cliOption(name) {
  const argv = process.argv.slice(2);
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === `--${name}`) return argv[k + 1];
    if (argv[k].startsWith(`--${name}=`)) return argv[k].slice(name.length + 3);
  }
  return undefined;
}
function cliOptions(name) {
  const argv = process.argv.slice(2);
  const out = [];
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === `--${name}`) { if (argv[k + 1] !== undefined) out.push(argv[++k]); }
    else if (argv[k].startsWith(`--${name}=`)) out.push(argv[k].slice(name.length + 3));
  }
  return out;
}
const hasFlag = (name) => process.argv.slice(2).includes(`--${name}`);
const envOn = (v) => v !== undefined && v !== '' && v !== '0' && v.toLowerCase() !== 'false';
const optSources = cliOption('sources') ?? process.env.SC_SOURCES;
const optOut = cliOption('out') ?? process.env.SC_OUT;
const SOURCES_FILE = optSources ? path.resolve(optSources) : path.join(ROOT, 'sources', 'sources.json');
const SITE = optOut ? path.resolve(optOut) : path.join(ROOT, 'site');
const optSiteUrl = cliOption('site-url') ?? process.env.SC_SITE_URL;
const DEFAULT_SOURCES_FILE = path.join(ROOT, 'sources', 'sources.json');
// Local (git-ignored) extra sources: <repo>/sources.local.json and <repo>/sources/sources.local.json.
const LOCAL_SOURCES_FILES = [path.join(ROOT, 'sources.local.json'), path.join(ROOT, 'sources', 'sources.local.json')];
const usesDefaultSources = SOURCES_FILE === DEFAULT_SOURCES_FILE;
const splitPaths = (v) => String(v).split(path.delimiter).map((x) => x.trim()).filter(Boolean);
// Sources files added on top of sources.json: <repo>/sources.local.json or <repo>/sources/sources.local.json (only next to the default
// sources/sources.json), then --extra-sources / SC_EXTRA_SOURCES. Later duplicates of a path are dropped.
const EXTRA_SOURCE_FILES = (() => {
  const list = [];
  if (usesDefaultSources && !hasFlag('no-local-sources') && !envOn(process.env.SC_NO_LOCAL_SOURCES)) list.push(...LOCAL_SOURCES_FILES.filter((x) => fs.existsSync(x)));
  for (const v of [...cliOptions('extra-sources'), ...(process.env.SC_EXTRA_SOURCES ? [process.env.SC_EXTRA_SOURCES] : [])]) {
    for (const p of splitPaths(v)) list.push(path.resolve(p));
  }
  return [...new Set(list)];
})();
// Translations of an extra source: <dir of its sources file>/i18n/{zh.json,zh.sources.json}.
const extraI18nDir = (file) => path.join(path.dirname(file), 'i18n');
const ONLY_SOURCES = (() => {
  const v = cliOptions('only-sources').join(',') || process.env.SC_ONLY_SOURCES || '';
  const ids = v.split(',').map((x) => x.trim()).filter(Boolean);
  return ids.length ? new Set(ids) : null;
})();
const NO_KITS = hasFlag('no-kits') || envOn(process.env.SC_NO_KITS);

// Public site URL for the prompts' download step: null when not configured, else an
// absolute http(s) URL ending in '/'. Throws a message string when it is invalid.
function parseSiteUrl(v) {
  if (v === undefined || v === '') return null;
  let u;
  try { u = new URL(v); } catch { throw `site URL ${JSON.stringify(v)} (--site-url / SC_SITE_URL) is not a valid absolute URL`; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw `site URL ${JSON.stringify(v)} (--site-url / SC_SITE_URL) must use http or https`;
  if (u.search || u.hash || u.username || u.password) throw `site URL ${JSON.stringify(v)} (--site-url / SC_SITE_URL) must not contain credentials, a query or a fragment`;
  const out = u.href;
  return out.endsWith('/') ? out : out + '/';
}

class BuildError extends Error {}
const fail = (msg) => { throw new BuildError(msg); };
const warnings = [];
const warn = (msg) => { warnings.push(msg); console.warn(`warning: ${msg}`); };

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);
// Path relative to the repo when inside it, else absolute (external sources live elsewhere).
const rel = (p) => {
  const r = path.relative(ROOT, p);
  return !r ? '.' : r.startsWith('..') || path.isAbsolute(r) ? p : r;
};
// Join a POSIX-style config path ("a/{slug}/b.md") onto a base dir, cross-platform.
const joinCfg = (base, cfgPath, slug) => path.join(base, ...cfgPath.replace(/\{slug\}/g, slug).split('/'));
const urlJoin = (...parts) => parts.map((p, i) => (i === 0 ? p.replace(/\/+$/, '') : p.replace(/^\/+|\/+$/g, ''))).filter(Boolean).join('/');
const repoName = (url) => String(url ?? '').replace(/\/+$/, '').split('/').pop();
const toPosix = (p) => p.split(path.sep).join('/');
// Back-link to a template's directory in the source's repository. `repoPath` is where the
// source directory lives inside the repo (empty for a repo of its own, e.g. a submodule).
// Overlay sources link to the mapped file (or directory) of the upstream repo instead.
// Null when the source has no repository (private sources): pages then name the source instead.
const templateDirUrl = (src, slug) => {
  if (src.templateUrl) return src.templateUrl.replace(/\{slug\}/g, encodeURIComponent(slug));
  if (!src.repo) return null;
  const o = src.overlay?.templates?.[slug];
  if (o) {
    const target = o.link ?? o.html;
    return urlJoin(src.repo, /\.[a-z0-9]+$/i.test(target) ? 'blob' : 'tree', src.branch, target);
  }
  return urlJoin(src.repo, 'tree', src.branch, src.repoPath ?? '', src.layout.templatesDir, slug);
};

// Source-level derivedFrom applies to the listed slugs only (all templates if no list).
const derivedOf = (src, slug) => {
  const d = src.derivedFrom;
  if (!d) return null;
  return !d.slugs || d.slugs.includes(slug) ? d : null;
};

// Mood filter groups (src/tags.json): every mood tag of every template must belong to one.
let TAG_GROUPS = null;
function tagGroups() {
  if (!TAG_GROUPS) {
    const groups = readJson(path.join(SRC, 'tags.json')).groups;
    const byTag = new Map();
    for (const g of groups) for (const tag of g.tags) {
      if (byTag.has(tag)) fail(`src/tags.json: mood tag "${tag}" is in two groups ("${byTag.get(tag)}" and "${g.id}")`);
      byTag.set(tag, g.id);
    }
    TAG_GROUPS = { groups, byTag };
  }
  return TAG_GROUPS;
}
// Group ids of a template's mood tags (in the order of tags.json), or null for unmapped tags.
const moodGroupsOf = (t) => {
  const { groups, byTag } = tagGroups();
  const ids = new Set();
  const missing = [];
  for (const m of t.mood ?? []) { const id = byTag.get(String(m).toLowerCase()); if (id) ids.add(id); else missing.push(m); }
  return { ids: groups.map((g) => g.id).filter((id) => ids.has(id)), missing };
};

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

// Read one sources file. `base` is the directory its relative paths resolve from: the repo root for
// sources.json (and --sources), the file's own directory for extra files. Extra sources may be
// private (no repository, any license text) and inherit the repo's frontend-slides companion
// (viewport-base.css) unless they name their own.
function readSourcesFile(file, { base, extra, sourceSchema, defaultCompanion }) {
  const cfg = readJson(file);
  const name = extra ? rel(file) : 'sources.json';
  if (extra) {
    const terrs = validate(cfg, sourceSchema, sourceSchema, '$');
    if (terrs.length) fail(`${name} is invalid:\n  - ${terrs.join('\n  - ')}`);
  }
  if (!Array.isArray(cfg.sources) || !cfg.sources.length) fail(`${name}: "sources" must be a non-empty array`);
  return cfg.sources.map((s, k) => {
    const where = `${name} sources[${k}]`;
    const need = ['id', 'name', 'author', 'license', 'path', ...(s.private ? [] : ['repo', 'branch'])];
    for (const f of need) {
      if (typeof s[f] !== 'string' || !s[f]) fail(`${where}: missing "${f}"${s.private ? '' : ' (only private sources may omit repo and branch)'}`);
    }
    const serrs = validate(s, sourceSchema.$defs.source, sourceSchema, '$');
    if (serrs.length) fail(`${where} (${s.id}) is invalid:\n  - ${serrs.join('\n  - ')}`);
    if (extra && s.overlay) fail(`${where} (${s.id}): "overlay" is only supported in the repository's own sources.json`);
    if (s.include != null && !Array.isArray(s.include)) fail(`${where}: "include" must be an array of slugs`);
    const dir = path.resolve(base, s.path);
    const layout = { ...LAYOUT_DEFAULTS, ...(s.layout ?? {}) };
    const companion = s.companion ? { ...s.companion } : (extra && defaultCompanion ? { ...defaultCompanion } : null);
    return { ...s, dir, layout, companion, file, base, extra, private: Boolean(s.private), where };
  });
}

// All sources: sources.json first, then the extra files. Existence of directories is checked only for
// the selected sources (--only-sources), so a build of one source does not need the others checked out.
function loadSources() {
  const sourceSchema = readJson(path.join(SRC, 'schema', 'sources.schema.json'));
  const own = readSourcesFile(SOURCES_FILE, { base: ROOT, extra: false, sourceSchema });
  // The companion extra sources inherit: the first repo source that has one, reduced to what a pack needs.
  const comp = own.find((s) => s.companion?.viewportBase)?.companion;
  let defaultCompanion = null;
  if (comp) {
    const { designOverride, previewCard, ...rest } = comp;
    defaultCompanion = { ...rest, __repoRelative: true };
  }
  const extras = EXTRA_SOURCE_FILES.flatMap((f) => {
    if (!exists(f)) fail(`extra sources file not found: ${f}`);
    return readSourcesFile(f, { base: path.dirname(f), extra: true, sourceSchema, defaultCompanion });
  });
  const all = [...own, ...extras];
  const byId = new Map();
  for (const s of all) {
    if (byId.has(s.id)) fail(`${s.where}: duplicate source id "${s.id}" (also in ${rel(byId.get(s.id).file)})`);
    byId.set(s.id, s);
  }
  if (ONLY_SOURCES) {
    const unknown = [...ONLY_SOURCES].filter((id) => !byId.has(id));
    if (unknown.length) fail(`--only-sources / SC_ONLY_SOURCES: unknown source id(s) ${unknown.join(', ')} (known: ${[...byId.keys()].join(', ')})`);
  }
  return all.map((s) => {
    const selected = !ONLY_SOURCES || ONLY_SOURCES.has(s.id);
    const out = { ...s, selected };
    if (!exists(s.dir)) {
      if (!selected) return { ...out, missing: true };
      fail(`${s.where}: path ${s.path} not found${s.extra ? ` (resolved from ${rel(path.dirname(s.file))})` : ' (run: git submodule update --init)'}`);
    }
    if (s.companion) {
      const c = s.companion;
      for (const f of ['id', 'name', 'author', 'license', 'path']) {
        if (typeof c[f] !== 'string' || !c[f]) fail(`${s.where}.companion: missing "${f}"`);
      }
      if (!c.__repoRelative && !c.repo) fail(`${s.where}.companion: missing "repo"`);
      // An inherited companion is a path in this repo; an explicit one resolves like "path".
      const cdir = path.resolve(c.__repoRelative ? ROOT : s.base, c.path);
      if (!exists(cdir)) {
        if (c.__repoRelative) return { ...out, companion: null }; // upstream/skill not checked out: no viewport-base.css
        if (selected) fail(`${s.where}.companion: path ${c.path} not found (run: git submodule update --init)`);
      }
      const { __repoRelative, ...cc } = c;
      out.companion = { ...cc, dir: cdir };
    }
    if (s.overlay) {
      const mdir = path.resolve(s.base, s.overlay.metaDir);
      if (selected) {
        if (!exists(mdir)) fail(`${s.where}: overlay.metaDir ${s.overlay.metaDir} not found`);
        for (const [slug, o] of Object.entries(s.overlay.templates)) {
          for (const f of [o.html, ...(o.assets ?? []), ...o.docs.map((d) => d.path)]) {
            if (!exists(path.join(s.dir, ...f.split('/')))) fail(`${s.where}: overlay template "${slug}": ${s.path}/${f} not found (run: git submodule update --init)`);
          }
        }
      }
    }
    return out;
  });
}

// `problems` (optional array): per-template problems are collected there instead of
// stopping at the first one, so the validate script can report everything at once.
// Every source is read (so slugs are unique across all of them), but only the selected ones
// (--only-sources) are returned in `templates` and reported on; `bySlug` holds all, each with `selected`.
function loadTemplates(sources, schema, problems = null) {
  const all = [];
  const bySlug = new Map();
  const report = (msg) => { if (problems) problems.push(msg); else fail(msg); };
  for (const src of sources) {
    if (src.missing) continue; // not selected and not checked out
    const sel = src.selected;
    const tdir = path.join(src.dir, ...src.layout.templatesDir.split('/'));
    if (!src.overlay && !exists(tdir)) { if (sel) fail(`source ${src.id}: templates dir ${rel(tdir)} not found`); else continue; }
    let slugs = src.overlay
      ? Object.keys(src.overlay.templates).sort()
      : fs.readdirSync(tdir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && exists(path.join(tdir, d.name, src.layout.metaFile)))
        .map((d) => d.name).sort();
    if (src.include) {
      const missing = src.include.filter((s) => !slugs.includes(s));
      if (missing.length && sel) fail(`source ${src.id}: include lists unknown template(s): ${missing.join(', ')}`);
      slugs = slugs.filter((s) => src.include.includes(s));
    }
    if (src.derivedFrom?.slugs && sel) {
      const unknown = src.derivedFrom.slugs.filter((x) => !slugs.includes(x));
      if (unknown.length) fail(`source ${src.id}: derivedFrom.slugs lists unknown template(s): ${unknown.join(', ')}`);
    }
    for (const dirName of slugs) {
      const dir = src.overlay ? src.dir : path.join(tdir, dirName);
      const metaPath = src.overlay ? metaFileOf(ROOT, src, dirName) : path.join(dir, src.layout.metaFile);
      let meta;
      try { meta = readJson(metaPath); } catch (e) {
        if (e instanceof BuildError && (problems || !sel)) { if (sel) problems.push(e.message); continue; }
        throw e;
      }
      const record = {
        ...meta,
        source: src.id,
        license: meta.license ?? src.license,
        authors: meta.authors ?? [{ name: src.author, ...(src.authorUrl ? { url: src.authorUrl } : {}) }],
      };
      const errors = validate(record, schema, schema);
      if (errors.length) { if (sel) report(`${rel(metaPath)} failed schema validation:\n  - ${errors.join('\n  - ')}`); continue; }
      if (record.slug !== dirName) { if (sel) report(`${rel(metaPath)}: slug "${record.slug}" does not match its directory "${dirName}"`); continue; }
      if (bySlug.has(record.slug)) {
        const other = bySlug.get(record.slug);
        if (sel || other.selected) report(`duplicate slug "${record.slug}": source "${other.source}" (${rel(other.dir)}) and source "${src.id}" (${rel(dir)}). Slugs must be unique across all sources; rename the template directory and its "slug".`);
        continue;
      }
      const t = { ...record, dir, src, selected: sel, overlay: src.overlay?.templates[dirName] ?? null, metaExplicit: { authors: meta.authors != null, license: meta.license != null }, metaPath };
      bySlug.set(t.slug, t);
      if (sel) all.push(t);
    }
  }
  return { templates: all, bySlug };
}

// ---------------------------------------------------------------------------
// Per-template data for pages, prompt and zip
// ---------------------------------------------------------------------------

// Small (<= 640 px wide) copy of a screenshot for gallery cards and the detail page.
// Cached by content hash under node_modules/.cache so only the first build pays for it.
const THUMB_WIDTH = 640;
const THUMB_CACHE = path.join(ROOT, 'node_modules', '.cache', 'slides-commons', 'thumbs');
function smallScreenshot(s) {
  if (!/\.png$/i.test(s.file)) return null;
  const buf = fs.readFileSync(s.path);
  const key = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 20) + `-${THUMB_WIDTH}.png`;
  const cached = path.join(THUMB_CACHE, key);
  let data = null;
  try { data = fs.readFileSync(cached); } catch { /* not cached yet */ }
  const size = data ? pngSizeOf(data) : null;
  if (data && size) return { data, ...size };
  const t = thumbnail(buf, THUMB_WIDTH);
  if (!t) return null;
  try { fs.mkdirSync(THUMB_CACHE, { recursive: true }); fs.writeFileSync(cached, t.data); } catch { /* cache is optional */ }
  return t;
}
function pngSizeOf(buf) {
  return buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47 ? { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) } : null;
}

function screenshotsFor(src, slug) {
  const dir = src.overlay ? screenshotsDirOf(ROOT, src) : path.join(src.dir, ...src.layout.screenshotsDir.split('/'));
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

// Signature moves for templates without a preview card: the top-level bullets of the first
// "Signature Treatments / Moves / Elements" heading in design.md (up to 5, each cut to its
// first sentence when long). Empty when design.md has no such section.
function designSignatureMoves(md) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{2,4}\s+signature\s+(treatments?|moves?|elements?)\b/i.test(l));
  if (start < 0) return [];
  const level = lines[start].match(/^#+/)[0].length;
  const out = [];
  let cur = null;
  for (const l of lines.slice(start + 1)) {
    const h = l.match(/^(#+)\s/);
    if (h && h[1].length <= level) break;
    const b = l.match(/^[-*]\s+(.*\S)\s*$/);
    if (b) { if (cur) out.push(cur); cur = b[1]; }
    else if (cur && /^\s+\S/.test(l)) cur += ' ' + l.trim();
    else if (cur && !l.trim()) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out.slice(0, 5).map((m) => {
    if (m.length <= 220) return m;
    const sent = m.match(/^.{40,220}?[.!?](?=\s|$)/);
    return sent ? sent[0] : m.slice(0, 217).replace(/\s+\S*$/, '') + '…';
  });
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
  const re = /https:\/\/(?:fonts\.googleapis\.com\/css2?\?|api\.fontshare\.com\/v2\/css\?)[^"'`\s)<>]+/g;
  for (const m of html.matchAll(re)) urls.add(m[0].replace(/&amp;/g, '&'));
  return [...urls];
}

// The "CJK & International Content" (or similar) section of design.md, if any.
function cjkSection(md) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{2,3}\s.*\bCJK\b/i.test(l));
  if (start < 0) return '';
  const level = lines[start].match(/^#+/)[0].length;
  let end = lines.length;
  for (let k = start + 1; k < lines.length; k++) {
    const m = lines[k].match(/^(#+)\s/);
    if (m && m[1].length <= level) { end = k; break; }
  }
  return lines.slice(start, end).join('\n');
}

const isHexish = (v) => typeof v === 'string' && /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(v.trim());


// Default slide canvas color, read from design.md. Returns {name, value, how} only when a
// statement is explicit and unambiguous; otherwise null and the prompt keeps its generic wording.
function deriveSlideBg(designMd, colorMap) {
  const hit = (name, how) => (name && Object.hasOwn(colorMap, name) && /^#[0-9a-f]{3,8}$/i.test(colorMap[name]) ? { name, value: colorMap[name], how } : null);
  const alias = designMd.match(/^\s*slide-bg:\s*["']?([\w-]+)["']?\s*$/m);
  const a = alias && hit(alias[1], 'front matter alias `slide-bg`');
  if (a) return a;
  const lines = designMd.split(/\r?\n/).filter((l) => !/frontend-slides/i.test(l));
  for (const l of lines) {
    const m = l.match(/\*\*Default (?:(?:slide|page|surface|canvas)\s+)*(?:background|surface|canvas)[:\s]*\*\*[:\s\u2014-]*`?\{colors\.([\w-]+)\}`?(.*)$/i)
      ?? l.match(/^\s*default-background:\s*"\{colors\.([\w-]+)\}"()/i);
    if (!m) continue;
    // Two tokens each qualified with "for ..." (e.g. desktop vs window body) is not a single default.
    if (/^`?\s*for\b/.test(m[2]) && /\{colors\.[\w-]+\}`?\s+for\b/.test(m[2])) continue;
    const r = hit(m[1], 'design.md "Default ... background/surface" line');
    if (r) return r;
  }
  for (const l of lines) {
    const m = l.match(/^\s*[-*]\s+\*\*[^*]+\*\*\s*\(`\{colors\.([\w-]+)\}`[^)]*\):.*\b(?:default (?:slide )?background|universal (?:slide )?background)/i);
    const r = m && hit(m[1], 'color bullet described as the default/universal slide background');
    if (r) return r;
  }
  return null;
}

// Licenses that need no special emphasis. Anything else (AGPL, GPL, CC-BY-SA, unknown, ...)
// gets a license badge on the card and a notice on the detail page, pack README and prompts.
const PERMISSIVE = /^(MIT|ISC|Apache-2\.0|BSD-[23]-Clause|0BSD|Zlib|CC0-1\.0|CC-BY-4\.0|Unlicense)$/i;
const strongLicense = (license) => typeof license === 'string' && !PERMISSIVE.test(license.trim());
function licenseNoticeInfo(t) {
  const { src } = t;
  return {
    license: t.license,
    author: t.authors.map((a) => a.name).join(', '),
    authorUrl: t.authors[0]?.url ?? src.authorUrl ?? null,
    authorZh: src.authorZh ?? null,
    repoUrl: src.repo,
    licenseUrl: src.licenseUrl ?? urlJoin(src.repo, 'blob', src.branch, 'LICENSE'),
    network: /^agpl/i.test(t.license),
  };
}

// NOTICE.txt of a private template pack without a LICENSE file (English, then Chinese).
function internalNoticeText(t, { skill, fonts }) {
  const who = t.src.name;
  const whoZh = t.src.nameZh ?? who;
  const authors = t.authors.map((a) => a.name).join(', ');
  const third = [skill ? 'viewport-base.css (frontend-slides by Zara Zhang, MIT; see LICENSE-skill)' : null, fonts ? 'the web fonts in fonts/ (their own licenses are next to the files)' : null].filter(Boolean);
  return `INTERNAL USE ONLY

Internal use only — do not distribute outside ${who}.

Template: ${t.name} (${t.slug})
Author: ${authors}
Terms: ${t.license}
${third.length ? `\nThird-party files in this pack keep their own licenses: ${third.join('; ')}.\n` : ''}
------------------------------------------------------------

仅限内部使用

${zhText`仅限内部使用，请勿外传（不得在${whoZh}之外传播）。`}
${third.length ? `\n本素材包中的第三方文件遵循各自的许可证（viewport-base.css 见 LICENSE-skill；fonts/ 下的字体许可证在字体文件旁）。\n` : ''}`;
}

function buildContext(t) {
  const { src } = t;
  const L = src.layout;
  const comp = src.companion;

  // design.md: companion override first, template's own as fallback. Overlay templates have
  // no design.md: their design documents are listed in sources.json (`docs`), the summary
  // comes from the metadata file.
  const ov = t.overlay;
  let designPath = ov ? null : path.join(t.dir, L.designFile);
  let designFrom = ov ? 'overlay' : 'template';
  if (!ov && comp?.designOverride) {
    const p = joinCfg(comp.dir, comp.designOverride, t.slug);
    if (exists(p)) { designPath = p; designFrom = 'companion'; }
    else warn(`${t.slug}: companion design.md not found at ${rel(p)}; using the template's own design.md`);
  }
  if (!ov && !exists(designPath)) fail(`${t.slug}: no design.md (looked at ${rel(designPath)})`);
  const designMd = ov ? '' : read(designPath);
  const fm = ov ? { description: t.description ?? '' } : frontMatter(designMd);

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

  const htmlPath = path.join(t.dir, ...(ov ? ov.html : L.htmlFile).split('/'));
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

  const slideBg = deriveSlideBg(designMd, colorMap);
  if (process.env.SC_DEBUG_SLIDEBG) console.log(`SLIDEBG\t${t.slug}\t${slideBg ? `${slideBg.name}\t${slideBg.value}\t${slideBg.how}` : '-\t-\t(generic wording)'}`);

  const typography = Object.entries(t.typography).filter(([k]) => k !== 'style').map(([role, family]) => ({ role, family }));

  // Sibling assets shipped with template.html (never the meta / design files).
  const skip = new Set([L.metaFile, L.htmlFile, L.designFile, ...(src.perTemplateLicense || src.private ? [L.licenseFile] : [])].map((f) => path.normalize(f)));
  const assets = ov ? (ov.assets ?? []) : walk(t.dir).filter((f) => !skip.has(path.normalize(f)) && !/(^|[\\/])\.[^\\/]+$/.test(f)).map(toPosix);

  // perTemplateLicense: every template directory carries its own LICENSE (community contributions).
  // Private sources: the template's or the source's LICENSE if there is one, else a NOTICE.txt
  // ("internal use only"), written below once we know what else the pack contains.
  let licenses;
  let internalNotice = false;
  if (src.private) {
    const own = [[path.join(t.dir, L.licenseFile), 'LICENSE'], [path.join(src.dir, L.licenseFile), src.packLicenseName ?? 'LICENSE']].find(([p]) => exists(p));
    if (own) licenses = [{ file: own[1], path: own[0] }];
    else { licenses = [{ file: 'NOTICE.txt', path: null, data: null }]; internalNotice = true; }
  } else {
    const srcLicense = src.perTemplateLicense ? path.join(t.dir, L.licenseFile) : path.join(src.dir, L.licenseFile);
    if (!exists(srcLicense)) {
      if (src.perTemplateLicense) fail(`${t.slug}: ${rel(srcLicense)} is missing. Fix: add the full text of the ${t.license ?? 'chosen'} license as ${path.basename(srcLicense)} in the template directory.`);
      fail(`source ${src.id}: license file ${rel(srcLicense)} not found`);
    }
    licenses = [{ file: src.packLicenseName ?? (src.perTemplateLicense ? 'LICENSE' : 'LICENSE-templates'), path: srcLicense }];
  }
  if (comp) {
    const p = path.join(comp.dir, comp.licenseFile ?? 'LICENSE');
    if (!exists(p)) fail(`companion ${comp.id}: license file ${rel(p)} not found`);
    licenses.push({ file: 'LICENSE-skill', path: p });
  }

  // Latin fonts served locally (see scripts/fonts.mjs). Overlay templates may request their
  // fonts from a shared stylesheet (@import lines only, a "font manifest" such as assets/fonts.css
  // that every deck of the upstream loads): the requests are read from the shipped stylesheets too,
  // and a family only requested there is kept only if the template's own files mention it.
  let fontText = html;
  let fontPlan;
  if (ov) {
    const css = assets.filter((a) => /\.css$/i.test(a)).map((a) => read(path.join(t.dir, ...a.split('/'))));
    const stripCss = (c) => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@import\s+[^;]+;/g, '').trim();
    const rest = [html, ...css.filter((c) => stripCss(c))].join('\n');
    fontText = [html, ...css].join('\n');
    fontPlan = planTemplateFonts(fontText, FONT_STORE);
    const mentioned = (fam) => new RegExp(`(^|[^\\w-])${fam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w-]|$)`).test(rest);
    fontPlan.faces = fontPlan.faces.filter((f) => mentioned(f.family));
    // Latin families no longer requested from Google Fonts in the preview copy, used or not.
    fontPlan.localNames = new Set(fontPlan.requests.flatMap((r) => r.families.map((f) => f.name)).filter((n) => !isCjkFamily(n)));
  } else {
    fontPlan = planTemplateFonts(html, FONT_STORE);
  }

  if (internalNotice) licenses[0].data = Buffer.from(internalNoticeText(t, { skill: Boolean(comp), fonts: fontPlan.faces.length > 0 }), 'utf8');

  const cjk = cjkFamiliesIn(ROOT, [fontText, designMd]);
  // Weights of those families the template's links ask for (ranges expand to the published weights).
  const cjkWeights = new Map();
  for (const text of [fontText, designMd]) {
    for (const req of parseRequests(text)) {
      for (const fam of req.families) {
        const e = cjk.get(fam.name);
        if (!e) continue;
        if (!cjkWeights.has(e.id)) cjkWeights.set(e.id, new Set());
        for (const v of fam.variants) for (const w of e.weights) if (w >= v.wght[0] && w <= v.wght[1]) cjkWeights.get(e.id).add(w);
      }
    }
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
    fontLinks: fontLinks(fontText),
    // Font stylesheets from hosts that cannot be self-hosted (Fontshare): kept as links.
    remoteFontLinks: fontLinks(fontText).filter((u) => new URL(u).hostname !== 'fonts.googleapis.com'),
    localFonts: fontPlan.faces.length > 0,
    // Overlay: the CJK families the template itself requests (there is no design.md CJK section).
    cjkFontLinks: cjkOnlyLinks(fontLinks(ov ? fontText : cjkSection(designMd))),
    // The pack carries fonts/embed-cjk.mjs when a CJK family Fontsource has is requested anywhere in the template or its design.md.
    cjkEmbed: cjk.size > 0,
    signatureMoves: (preview.moves.length ? preview.moves : designSignatureMoves(designMd)).map((m) => resolveTokens(m, colorMap)),
    slideBg,
    stageBg: stageKey ? { name: stageKey, value: colorMap[stageKey] } : null,
    // Detected from the template itself, never from slugs:
    systemFontsOnly: fontLinks(fontText).length === 0 && !/@font-face/i.test(fontText),
    cdnScripts: [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)["']/gi)].map((m) => m[1]),
    assets,
    hasViewportBase: Boolean(viewportBasePath),
    licenses,
    // Overlay templates: the author's own docs replace design.md in the prompt (paths as in the pack).
    docs: ov ? ov.docs : null,
    promptKind: ov?.prompt ?? null,
    credit: { author: t.authors.map((a) => a.name).join(', '), license: t.license, repoUrl: src.repo ?? '' },
    // Overlay `keepPaths`: the HTML ships at its upstream path; deckDir is its folder in the pack.
    htmlName: ov?.keepPaths ? ov.html : L.htmlFile,
    deckDir: ov?.keepPaths ? path.posix.dirname(ov.html) : null,
    slideCount: t.slide_count,
    licenseNotice: !src.private && strongLicense(t.license) ? licenseNoticeInfo(t) : null,
    internal: src.private ? { name: src.name, nameZh: src.nameZh ?? src.name } : null,
  };

  const sourceDirUrl = templateDirUrl(src, t.slug);
  const companionInfo = comp ? {
    repoName: repoName(comp.repo),
    author: comp.author,
    license: comp.license,
    providesDesign: Boolean(comp.designOverride),
    dirUrl: comp.designOverride
      ? urlJoin(comp.repo, 'tree', comp.branch, path.posix.dirname(comp.designOverride.replace(/\{slug\}/g, t.slug)))
      : comp.repo,
  } : null;

  return { ctx, cjk, cjkWeights, fontPlan, designPath, designFrom, overlay: ov, viewportBasePath, htmlPath, html, assets, licenses, sourceDirUrl, companionInfo, paletteColors };
}

// ---------------------------------------------------------------------------
// Checks shared by the build and scripts/validate.mjs
// ---------------------------------------------------------------------------

// Hosts a template may load things from (Fontshare: stylesheet + font files).
const HOST_WHITELIST = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'api.fontshare.com', 'cdn.fontshare.com'];

// Hosts of external subresources found by a static scan of src / srcset / <link href> /
// @import / url(). Comments, xmlns attributes, plain <a href> links and data: URIs are
// not requests and are ignored.
function externalHosts(text) {
  const html = text.replace(/<!--[\s\S]*?-->/g, '');
  const urls = [];
  const attr = /\b(src|srcset|poster|data|href|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  for (const m of html.matchAll(/<(script|img|iframe|source|video|audio|embed|object|image|use|link|input)\b[^>]*>/gi)) {
    const tag = m[1].toLowerCase();
    for (const a of m[0].matchAll(attr)) {
      const name = a[1].toLowerCase();
      if ((name === 'href' || name === 'xlink:href') && !['link', 'image', 'use'].includes(tag)) continue;
      const v = a[2] ?? a[3];
      if (name === 'srcset') urls.push(...v.split(',').map((x) => x.trim().split(/\s+/)[0]));
      else urls.push(v);
    }
  }
  const css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1])
    .concat([...html.matchAll(/\bstyle\s*=\s*"([^"]*)"/gi)].map((m) => m[1]))
    .join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/@import\s+(?:url\(\s*)?["']?([^"')\s;]+)/gi)) urls.push(m[1]);
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)/gi)) urls.push(m[1]);
  const hosts = new Set();
  for (const raw of urls) {
    const u = raw.trim();
    if (!/^(?:https?:)?\/\//i.test(u)) continue;
    try { hosts.add(new URL(u.startsWith('//') ? 'https:' + u : u).host.toLowerCase()); } catch { hosts.add(u); }
  }
  return [...hosts];
}

// Collect every problem with the loaded templates (does not stop at the first one).
function checkTemplates(templates, problems, { strictScreenshots = true, bySlug = null } = {}) {
  const items = []; // { t, description } for the i18n check
  for (const t of templates) {
    const at = `${t.slug}:`;
    if (typeof t.license !== 'string' || !t.license) problems.push(`${at} no license (set it in the source or the template)`);
    if (!t.authors?.length || t.authors.some((a) => !a.name)) problems.push(`${at} no author to credit`);

    // Attribution and back-link target.
    const L = t.src.layout;
    const expected = templateDirUrl(t.src, t.slug);
    if (!t.src.private && !/^https:\/\/.+\/(?:tree|blob)\/.+\/.+/.test(expected)) problems.push(`${at} cannot build a back-link to the original (got "${expected}")`);

    if (!t.src.collection && !t.src.private && !screenshotsFor(t.src, t.slug).length) { // collections get the stricter check below
      const msg = `${at} no screenshot in ${rel(t.src.overlay ? screenshotsDirOf(ROOT, t.src) : path.join(t.src.dir, ...L.screenshotsDir.split('/')))} named ${t.slug}-<n>.png${t.src.overlay ? ' (run: npm run screenshots)' : ''}`;
      if (strictScreenshots) problems.push(msg); else warn(msg);
    }

    let info;
    try { info = buildContext(t); } catch (e) {
      if (e instanceof BuildError) { problems.push(e.message); continue; }
      throw e;
    }
    const mg = moodGroupsOf(t);
    if (mg.missing.length && t.src.private) warn(`${at} mood tag(s) not in any group of src/tags.json: ${mg.missing.map((m) => `"${m}"`).join(', ')} (no mood filter for them; the tags still work in search)`);
    else if (mg.missing.length) problems.push(`${at} mood tag(s) not in any group of src/tags.json: ${mg.missing.map((m) => `"${m}"`).join(', ')}. Fix: add each tag to the matching group (bold, warm, editorial, calm, elegant, playful, professional, modern, retro, tech, crafted, artistic).`);
    for (const e of info.fontPlan.errors) problems.push(`${at} local font: ${e} (run npm ci; or add the package to devDependencies)`);
    items.push({ t, description: info.ctx.description });
    if (!info.ctx.description) problems.push(info.designPath ? `${at} ${rel(info.designPath)} has no front matter "description"` : `${at} ${rel(t.metaPath)} needs a "description"`);

    // derivedFrom must point at a template of this gallery.
    if (t.derivedFrom) {
      const o = (bySlug ?? new Map(templates.map((x) => [x.slug, x]))).get(t.derivedFrom.slug);
      if (!o && t.src.private) warn(`${at} derivedFrom.slug "${t.derivedFrom.slug}" is not a template of this gallery; the original is not credited on the page`);
      else if (!o) problems.push(`${at} ${rel(t.metaPath)}: derivedFrom.slug "${t.derivedFrom.slug}" is not a template in this gallery. Fix: use the slug of an existing template.`);
      else if (o.source !== t.derivedFrom.source && !t.src.private) problems.push(`${at} ${rel(t.metaPath)}: derivedFrom.source "${t.derivedFrom.source}" does not match the source of "${o.slug}" ("${o.source}").`);
    }

    // Stricter rules for templates that live in this repository.
    if (t.src.collection || t.src.private) {
      problems.push(...checkCollectionTemplate({
        t, rel, private: Boolean(t.src.private),
        metaPath: t.metaPath, metaExplicit: t.metaExplicit,
        html: info.html, htmlPath: info.htmlPath,
        designMd: info.designPath ? read(info.designPath) : '', designPath: info.designPath,
        screenshots: screenshotsFor(t.src, t.slug),
        screenshotsDir: path.join(t.src.dir, ...L.screenshotsDir.split('/')),
        assets: info.assets,
        perTemplateLicense: Boolean(t.src.perTemplateLicense),
        licensePath: path.join(t.dir, L.licenseFile),
      }));
    }

    // Static host scan of the template and its sibling stylesheets.
    const texts = [[L.htmlFile, info.html]];
    for (const a of info.assets) {
      if (/\.css$/i.test(a)) texts.push([a, `<style>${read(path.join(t.dir, ...a.split('/')))}</style>`]);
    }
    for (const [name, text] of texts) {
      const bad = externalHosts(text).filter((h) => !HOST_WHITELIST.includes(h) && !(t.overlay?.allowHosts ?? []).includes(h));
      if (bad.length) problems.push(`${at} ${name} loads from non-whitelisted host(s): ${bad.join(', ')}`);
    }
  }
  return items;
}


// Which slide a screenshot shows: a number, "middle" or "last" (resolved against the live deck).
// Upstream templates number their screenshots by slide; collections and overlay sources are
// rendered by scripts/screenshots.mjs, where <slug>-<n> is the n-th entry of `screenshots.slides`.
function screenshotSlide(src, n) {
  if (!src.collection && !src.overlay) return n;
  const spec = src.screenshots?.slides ?? [1, 'middle', 'last'];
  return spec[n - 1] ?? null;
}

// Typography specimen: the fonts of a template that are self-hosted (Latin subset only), as a
// small stylesheet shared by both languages. Roles whose font is not available (system stacks,
// CJK families) get no specimen.
function specimenFor(t, faces) {
  const latin = faces.filter((f) => /-latin-/.test(f.file) && !/-latin-ext-/.test(f.file) && f.style === 'normal');
  const roles = {};
  const used = new Map();
  for (const [role, value] of Object.entries(t.typography ?? {})) {
    if (role === 'style' || typeof value !== 'string') continue;
    const name = value.split(/[,/]/)[0].trim();
    const cands = latin.filter((f) => f.family === name);
    if (!cands.length) continue;
    const target = role === 'display' ? 700 : 400;
    let best = null;
    for (const f of cands) {
      const [lo, hi = lo] = String(f.weight).split(/\s+/).map(Number);
      const w = Math.min(Math.max(target, lo), hi);
      const d = Math.abs(w - target);
      if (!best || d < best.d) best = { f, w, d };
    }
    roles[role] = { family: name, weight: best.w };
    used.set(best.f.file, best.f);
  }
  return Object.keys(roles).length ? { roles, faces: [...used.values()] } : null;
}

// Load sources and templates and run all checks. Returns what the build needs.
// The build only warns about a missing screenshot (the page still works without a
// thumbnail); scripts/validate.mjs treats it as an error.
function loadAndCheck({ strictScreenshots = true } = {}) {
  const schema = readJson(path.join(SRC, 'schema', 'template.schema.json'));
  const sources = loadSources();
  const problems = [];
  let siteUrl = null;
  try { siteUrl = parseSiteUrl(optSiteUrl); } catch (e) { problems.push(String(e)); }
  const { templates, bySlug } = loadTemplates(sources, schema, problems);
  const items = checkTemplates(templates, problems, { strictScreenshots, bySlug });
  if (!templates.length && !problems.length) problems.push('no templates found');
  // Chinese translations: structural problems are errors, missing / stale ones warnings.
  const { zh, sources: zhSources } = loadZh(problems, EXTRA_SOURCE_FILES.map(extraI18nDir));
  // zh.json covers the repository's own templates only; private templates are shown in English on
  // the zh pages (one warning for all of them instead of one per field).
  const strictSlugs = usesDefaultSources && !ONLY_SOURCES && !sources.some((s) => s.include);
  const privateItems = items.filter((i) => i.t.src.private && !zh?.templates?.[i.t.slug]);
  if (privateItems.length) warn(`no Chinese translations for ${privateItems.length} private template(s) (${privateItems.map((i) => i.t.slug).join(', ')}); English is shown on the zh pages`);
  checkZh({ zh, sources: zhSources }, items.filter((i) => !privateItems.includes(i)), problems, warn, { strictSlugs });
  return { sources, templates, bySlug, problems, zh, siteUrl };
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
const inlineLocalAssets = (html, dir, slug, root = dir) => inlineLocal(html, dir, slug, root, warn);

function preparePreview(html, bridge, dir, slug, root = dir) {
  let out = inlineLocalAssets(html, dir, slug, root);
  // deck-stage.js sets a system font-family on its :host, which overrides the font the
  // template sets on <body>. An outer-document rule beats :host, so restore inheritance.
  if (/<deck-stage[\s>]/i.test(out)) {
    const fix = '\n<!-- slides-commons preview fix: let <deck-stage> inherit the template font (deck-stage.js forces a system font on :host) -->\n' +
      '<style>deck-stage { font-family: inherit; }</style>\n';
    const head = out.toLowerCase().indexOf('</head>');
    out = head >= 0 ? out.slice(0, head) + fix + out.slice(head) : fix + out;
  }
  // No scroll chaining out of the frame (touch / trackpad must not scroll the outer page).
  const chain = '\n<style>/* slides-commons preview fix */ html, body, * { overscroll-behavior: none; }</style>\n';
  const headEnd = out.toLowerCase().indexOf('</head>');
  out = headEnd >= 0 ? out.slice(0, headEnd) + chain + out.slice(headEnd) : chain + out;
  const tag = `\n<script>/* slides-commons preview bridge (added by the site build; not part of the original template) */\n${bridge}</script>\n`;
  const idx = out.toLowerCase().lastIndexOf('</body>');
  return idx >= 0 ? out.slice(0, idx) + tag + out.slice(idx) : out + tag;
}

// Licenses of the fonts embedded in previews: site/fonts/<family-slug>/OFL.txt. (The font
// files themselves are embedded as data: URIs in the preview copies, see above.)
function copyFontLicense(f) {
  const dir = path.join(SITE, 'fonts', f.id);
  const lic = path.join(dir, fontLicenseName(f));
  if (f.license && !exists(lic)) { fs.mkdirSync(dir, { recursive: true }); fs.copyFileSync(f.license, lic); }
}
// What a font's license file actually is (read from the file, never assumed).
const fontLicenseKind = (f) => {
  const txt = f.license ? read(f.license) : '';
  if (/SIL OPEN FONT LICENSE/i.test(txt)) return { short: 'SIL OFL 1.1', long: 'SIL Open Font License 1.1', file: 'OFL.txt' };
  if (/Apache License/i.test(txt)) return { short: 'Apache 2.0', long: 'Apache License 2.0', file: 'LICENSE.txt' };
  if (/Permission is hereby granted, free of charge/i.test(txt)) return { short: 'MIT', long: 'MIT License', file: 'LICENSE.txt' };
  return { short: 'see its license file', long: 'see its license file', file: 'LICENSE.txt' };
};
const fontLicenseName = (f) => fontLicenseKind(f).file;
// One summary for a template's fonts: "SIL OFL 1.1" or "SIL Open Font License 1.1: Inter, Roboto; Apache License 2.0: Yellowtail".
function fontLicenseSummary(faces) {
  const groups = new Map();
  for (const f of faces) {
    const k = fontLicenseKind(f);
    if (!groups.has(k.long)) groups.set(k.long, { ...k, families: new Set(), files: new Set() });
    const g = groups.get(k.long);
    g.families.add(f.family);
    if (f.license) g.files.add(`fonts/<family>/${k.file}`);
  }
  const list = [...groups.values()];
  const names = list.map((g) => (list.length > 1 ? `${g.long}: ${[...g.families].sort().join(', ')}` : g.long)).join('; ');
  const files = [...new Set(list.flatMap((g) => [...g.files]))].join(', ');
  return { license: names, licenseFile: files || null, short: [...new Set(list.map((g) => g.short))].join(' / ') };
}

// fonts/ inside the pack: the woff2 files this template needs, one license per family, and
// fonts.css with ready-made @font-face rules (relative URLs) for the agent to embed.
function packFontEntries(z, faces) {
  if (!faces.length) return [];
  const seen = new Set();
  const out = [{ name: z + 'fonts/fonts.css', data: Buffer.from(`/* Self-hosted Latin fonts for this template (from Fontsource; each family's license is next to its files).\n   Embed the rules you use in your deck with the url() replaced by a base64 data: URI. */\n${fontFaceCss(faces, relativeUrl(''))}\n`, 'utf8') }];
  for (const f of faces) {
    if (!seen.has(f.file)) { seen.add(f.file); out.push({ name: z + 'fonts/' + f.file, data: fs.readFileSync(f.src) }); }
    const lic = `${f.id}/${fontLicenseName(f)}`;
    if (f.license && !seen.has(lic)) { seen.add(lic); out.push({ name: z + 'fonts/' + lic, data: fs.readFileSync(f.license) }); }
  }
  return out;
}

// fonts/embed-cjk.mjs + fonts/cjk-ranges.json (the shard table) + the families' licenses.
// No font files: the script downloads the shards a finished deck needs (see src/embed-cjk.mjs).
function packCjkEntries(z, cjk, siteUrl) {
  if (!cjk.size) return [];
  const out = [
    { name: z + 'fonts/embed-cjk.mjs', data: fs.readFileSync(path.join(SRC, 'embed-cjk.mjs')) },
    { name: z + 'fonts/cjk-ranges.json', data: Buffer.from(cjkRangesJson(cjk, siteUrl ?? null), 'utf8') },
  ];
  for (const [, e] of cjk) if (e.license) out.push({ name: `${z}fonts/cjk-licenses/${e.id}-${fontLicenseName({ license: e.license })}`, data: fs.readFileSync(e.license) });
  return out;
}

// Shards the packs' embed script may fetch from this site (only when siteUrl is set; otherwise
// jsDelivr is the only source). Only weights some template requests; written once per family.
const hostedCjk = new Map();
function hostCjk(e, weights) {
  const done = hostedCjk.get(e.id) ?? new Set();
  hostedCjk.set(e.id, done);
  for (const w of [...(weights ?? [])].sort((a, b) => a - b)) {
    if (done.has(w)) continue;
    done.add(w);
    for (const k of e.shardsByWeight[w]) {
      const f = `${e.id}-${k}-${w}-normal.woff2`;
      const dest = path.join(SITE, 'fonts', 'cjk', e.id, f);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(e.dir, 'files', f), dest);
    }
  }
  if (e.license) writeFile(path.join(SITE, 'fonts', 'cjk', e.id, fontLicenseName({ license: e.license })), fs.readFileSync(e.license));
}

// Latin font files the convert kit's fonts/embed-latin.mjs may fetch from this site (only when
// siteUrl is set; otherwise jsDelivr is the only source). Layout mirrors the script's requests:
// fonts/latin/static/<id>/<id>-<subset>-<weight>-<style>.woff2 (@fontsource) and
// fonts/latin/variable/<id>/<id>-<subset>-wght-<style>.woff2 (@fontsource-variable), latin + latin-ext.
// Wanted: the families (and weights) the gallery's templates request plus the kit's font-map substitutes.
const latinWanted = new Map(); // family -> Set('style|weight' | 'style|var')
function wantLatin(families) {
  for (const fam of families) {
    if (isCjkFamily(fam.name)) continue;
    const set = latinWanted.get(fam.name) ?? new Set();
    latinWanted.set(fam.name, set);
    for (const v of fam.variants) {
      const style = v.ital ? 'italic' : 'normal';
      set.add(v.wght[0] === v.wght[1] ? `${style}|${v.wght[0]}` : `${style}|var`);
    }
  }
}
function hostLatin(fontMapPath) {
  const map = JSON.parse(fs.readFileSync(fontMapPath, 'utf8'));
  for (const f of map.fonts) {
    if (!f.google) continue;
    for (const r of parseRequests(`https://fonts.googleapis.com/css2?family=${f.google}`)) wantLatin(r.families);
  }
  let bytes = 0, files = 0;
  const copy = (src, kind, id, name) => {
    const dest = path.join(SITE, 'fonts', 'latin', kind, id, name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    bytes += fs.statSync(src).size; files++;
  };
  for (const [name, keys] of [...latinWanted].sort((a, b) => a[0].localeCompare(b[0]))) {
    const r = FONT_STORE.lookup(name);
    // A variable package also serves any weight range the script may ask for (a handful of families).
    if (r.variable) for (const k of [...keys]) keys.add(`${k.split('|')[0]}|var`);
    for (const key of keys) {
      const [style, w] = key.split('|');
      for (const subset of ['latin', 'latin-ext']) {
        const st = r.static && w !== 'var' ? path.join(r.static, 'files', `${r.id}-${subset}-${w}-${style}.woff2`) : null;
        const va = r.variable ? path.join(r.variable, 'files', `${r.id}-${subset}-wght-${style}.woff2`) : null;
        if (st && fs.existsSync(st)) copy(st, 'static', r.id, path.basename(st));
        else if (va && fs.existsSync(va)) copy(va, 'variable', r.id, path.basename(va));
      }
    }
    for (const [kind, dir] of [['static', r.static], ['variable', r.variable]]) {
      const lic = dir && path.join(dir, 'LICENSE');
      if (lic && fs.existsSync(path.join(SITE, 'fonts', 'latin', kind, r.id)) && fs.existsSync(lic)) writeFile(path.join(SITE, 'fonts', 'latin', kind, r.id, fontLicenseName({ license: lic })), fs.readFileSync(lic));
    }
  }
  return { files, bytes };
}

function main() {
  const started = Date.now();
  const { sources, templates, bySlug, problems, zh: zhData, siteUrl } = loadAndCheck({ strictScreenshots: false });
  if (problems.length) fail(`${problems.length} problem(s) found:\n- ${problems.join('\n- ').replace(/\n  - /g, '\n    - ')}`);

  const bridge = read(path.join(SRC, 'preview-bridge.js'));
  const zipTime = zipTimestamp();

  prepareOutDir(sources);
  writeFile(path.join(SITE, '.nojekyll'), '');
  writeFile(path.join(SITE, MARKER), MARKER_TEXT);
  fs.mkdirSync(path.join(SITE, 'assets'), { recursive: true });
  // The site's own type (OFL, from the Fontsource packages) is embedded in the stylesheet, so the
  // site makes no font requests and also renders from file://. Copies + licenses go to assets/type/.
  let siteCss = read(path.join(SRC, 'styles.css'));
  for (const font of [
    { package: '@fontsource-variable/dm-sans', file: 'dm-sans-latin-wght-normal.woff2', name: 'dm-sans' },
    { package: '@fontsource/barlow-condensed', file: 'barlow-condensed-latin-700-normal.woff2', name: 'barlow-condensed' },
  ]) {
    const packageDir = path.join(ROOT, 'node_modules', ...font.package.split('/'));
    const bytes = fs.readFileSync(path.join(packageDir, 'files', font.file));
    siteCss = siteCss.replace(`./type/${font.name}.woff2`, `data:font/woff2;base64,${bytes.toString('base64')}`);
    writeFile(path.join(SITE, 'assets', 'type', font.name + '.woff2'), bytes);
    writeFile(path.join(SITE, 'assets', 'type', font.name + '-LICENSE.txt'), fs.readFileSync(path.join(packageDir, 'LICENSE')));
  }
  writeFile(path.join(SITE, 'assets', 'site.css'), siteCss);
  fs.copyFileSync(path.join(SRC, 'detail.js'), path.join(SITE, 'assets', 'detail.js'));
  fs.copyFileSync(path.join(SRC, 'site.js'), path.join(SITE, 'assets', 'site.js'));
  fs.copyFileSync(path.join(SRC, 'gallery.js'), path.join(SITE, 'assets', 'gallery.js'));

  fs.copyFileSync(path.join(SRC, 'header-theme.js'), path.join(SITE, 'assets', 'header-theme.js'));
  fs.copyFileSync(path.join(SRC, 'home.js'), path.join(SITE, 'assets', 'home.js'));
  fs.copyFileSync(path.join(SRC, 'home.css'), path.join(SITE, 'assets', 'home.css'));
  fs.copyFileSync(path.join(SRC, 'kits.css'), path.join(SITE, 'assets', 'kits.css'));
  fs.copyFileSync(path.join(SRC, 'kits.js'), path.join(SITE, 'assets', 'kits.js'));
  fs.copyFileSync(path.join(SRC, 'credits.css'), path.join(SITE, 'assets', 'credits.css'));
  fs.copyFileSync(path.join(SRC, 'credits.js'), path.join(SITE, 'assets', 'credits.js'));
  // Home page carousel / hero wall: a curated list of templates whose first screenshot is complete.
  const homeSlugs = readJson(path.join(SRC, 'home.json')).carousel;
  // Only the repository's own sources.json must list real templates (--sources fixture builds contain few).
  // (A build restricted with --only-sources shows the curated slugs that exist, see below.)
  if (usesDefaultSources && !ONLY_SOURCES) {
    for (const slug of homeSlugs) if (!templates.some((t) => t.slug === slug)) fail(`src/home.json: carousel template "${slug}" does not exist`);
  }

  const shownSources = sources.filter((s) => templates.some((t) => t.source === s.id));
  setSources(shownSources);
  setAutoDownload(Boolean(siteUrl));

  const pageData = [];
  for (const t of templates) {
    const info = buildContext(t);
    const { ctx } = info;
    const tz = resolveZh(t, ctx.description, zhData);
    ctx.zh = tz; // Chinese data for PROMPT.zh.md (null values fall back to English)
    // Absolute pack URL for the prompts' download step (null: no download step).
    ctx.zipUrl = siteUrl ? new URL(`zip/${encodeURIComponent(t.slug)}.zip`, siteUrl).href : null;

    // Screenshots used by this template.
    const shots = screenshotsFor(t.src, t.slug);
    for (const s of shots) {
      s.slide = screenshotSlide(t.src, s.n);
      const dest = path.join(SITE, 'assets', 'screenshots', s.file);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(s.path, dest);
      const small = smallScreenshot(s);
      if (small) {
        const sd = path.join(SITE, 'assets', 'screenshots', 'thumbs', s.file);
        fs.mkdirSync(path.dirname(sd), { recursive: true });
        fs.writeFileSync(sd, small.data);
        s.small = { file: `thumbs/${s.file}`, width: small.width, height: small.height };
      } else {
        s.small = { file: s.file, width: s.width, height: s.height };
      }
    }

    // Preview copy: template dir minus meta/design files, bridge injected into the HTML copy.
    const pdir = path.join(SITE, 'preview', t.slug);
    let previewHtml = info.html;
    if (t.overlay) {
      try { previewHtml = overlayPreviewHtml(previewHtml, { entry: t.overlay, srcDir: t.dir, root: ROOT }).html; } catch (e) { fail(`${t.slug}: ${e.message}`); }
    }
    const faces = info.fontPlan.faces;
    // keepPaths templates load shared files from above their own directory; inline them first
    // so the font requests inside shared stylesheets are rewritten as well.
    const baseDir = t.overlay?.keepPaths ? path.dirname(info.htmlPath) : t.dir;
    if (t.overlay?.keepPaths) previewHtml = inlineLocalAssets(previewHtml, baseDir, t.slug, t.dir);
    if (faces.length) {
      previewHtml = rewriteGoogleFonts(previewHtml, info.fontPlan.requests, info.fontPlan.localNames ?? new Set(faces.map((f) => f.family)));
      const rules = `\n<style data-slides-commons-fonts>/* self-hosted Latin fonts, embedded because a sandboxed preview frame cannot fetch font files over file:// or without CORS (added by the site build; the original loads them from Google Fonts; licenses: fonts/<family>/OFL.txt) */\n${fontFaceCss(faces, dataUrl)}\n</style>\n`;
      const m = previewHtml.match(/<head\b[^>]*>/i);
      previewHtml = m ? previewHtml.slice(0, m.index + m[0].length) + rules + previewHtml.slice(m.index + m[0].length) : rules + previewHtml;
    }
    const previewOut = preparePreview(previewHtml, bridge, baseDir, t.slug, t.dir);
    if (t.overlay) {
      // The preview copy of an overlay template must not reach beyond the whitelist (allowHosts only covers the original).
      const bad = externalHosts(previewOut).filter((h) => !HOST_WHITELIST.includes(h));
      if (bad.length) fail(`${t.slug}: preview copy still loads from non-whitelisted host(s): ${bad.join(', ')} (see overlay preview.replaceScripts in sources.json)`);
    }
    writeFile(path.join(pdir, t.src.layout.htmlFile), previewOut);
    for (const f of faces) copyFontLicense(f);
    for (const a of (t.overlay ? [] : info.assets)) {
      const dest = path.join(pdir, ...a.split('/'));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(t.dir, ...a.split('/')), dest);
    }

    // Prompt + zip.
    const en = promptEn(ctx);
    const zh = promptZh(ctx);
    const credits = [{
      what: `Template "${t.name}" (${[t.overlay?.keepPaths ? t.overlay.html : 'template.html', ...info.assets, ...(t.overlay ? t.overlay.docs.map((d) => d.path) : [])].map((f) => '`' + f + '`').join(', ')}${info.designFrom === 'template' ? ', `design.md`' : ''})`,
      author: t.authors.map((a) => a.name).join(', '),
      project: t.src.repo ? repoName(t.src.repo) : t.src.name,
      license: t.license,
      licenseFile: info.licenses[0].file,
      url: info.sourceDirUrl,
    }];
    // A private source has no public original: the pack README names the source instead of a link.
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
    const srcDerived = derivedOf(t.src, t.slug);
    if (srcDerived) {
      const d = srcDerived;
      credits.push({
        what: 'Visual direction (fonts, colors, signature elements) of this derivative template; the author did not make or endorse it',
        author: d.author,
        project: d.name,
        license: d.license,
        licenseFile: t.src.companion?.author === d.author ? (info.licenses.find((l) => l.path !== info.licenses[0].path)?.file ?? null) : null,
        url: d.url,
      });
    }
    if (faces.length) {
      credits.push({
        what: 'Latin web fonts in `fonts/` (the families the template requests from Google Fonts)',
        author: 'their respective authors (named in each font license)',
        project: 'Fontsource',
        license: fontLicenseSummary(faces).license,
        licenseFile: fontLicenseSummary(faces).licenseFile,
        url: 'https://fontsource.org',
      });
    }
    if (info.cjk.size) {
      credits.push({
        what: 'CJK web fonts: `fonts/embed-cjk.mjs` downloads the pieces a finished deck needs (the pack holds only the script, a table of font slices and the licenses in `fonts/cjk-licenses/`)',
        author: 'their respective authors (named in each font license)',
        project: 'Fontsource',
        license: fontLicenseSummary([...info.cjk].map(([family, e]) => ({ family, license: e.license }))).license,
        licenseFile: fontLicenseSummary([...info.cjk].map(([family, e]) => ({ family, license: e.license }))).licenseFile?.replace(/fonts\/<family>\/(OFL|LICENSE)\.txt/g, 'fonts/cjk-licenses/<family>-$1.txt') ?? null,
        url: 'https://fontsource.org',
      });
    }
    // Template-level derivedFrom: the original's LICENSE travels with the pack.
    const extraLicenses = [];
    if (t.derivedFrom) {
      const o = bySlug.get(t.derivedFrom.slug);
      const osrc = sources.find((s) => s.id === t.derivedFrom.source);
      if (o && osrc) {
        const lp = osrc.perTemplateLicense ? path.join(o.dir, osrc.layout.licenseFile) : path.join(osrc.dir, osrc.layout.licenseFile);
        if (!info.licenses.some((l) => l.path === lp) && exists(lp)) {
          const file = `LICENSE-original-${o.slug}`;
          extraLicenses.push({ file, path: lp });
          credits.push({
            what: `Original template "${o.name}", which this template adapts`,
            author: o.authors.map((a) => a.name).join(', '),
            project: o.name,
            license: o.license,
            licenseFile: file,
            url: templateDirUrl(osrc, o.slug),
          });
        }
      }
    }
    const readme = packReadme({
      ...ctx,
      packClosing: t.src.private
        ? `This template is internal to ${t.src.name}: for internal use only, see \`${info.licenses[0].file}\`. ${SITE_NAME} is an independent open-source tool that only packages it; it is not affiliated with the authors of the third-party files credited above.`
        : t.src.collection
        ? (srcDerived
          ? `${SITE_NAME} is an independent community gallery. This template is a derivative work of the project credited above (visual direction), written for ${SITE_NAME}; the original author did not make or endorse it. Files are licensed as listed above.`
          : t.derivedFrom
          ? `This template adapts the template credited above; the original author did not make or endorse this version. Files are licensed as listed above. ${SITE_NAME} is an independent community gallery.`
          : `This template is original work, written for ${SITE_NAME}. \`viewport-base.css\` is the only file taken from another project (see the credits above). ${SITE_NAME} is an independent community gallery and is not affiliated with or endorsed by the author of that file.`)
        : undefined,
    }, credits, SITE_NAME);

    if (siteUrl) for (const [, e] of info.cjk) hostCjk(e, info.cjkWeights.get(e.id));
    if (siteUrl) for (const r of info.fontPlan.requests) wantLatin(r.families);
    const z = `${t.slug}/`;
    const entries = [
      { name: z },
      { name: z + (t.overlay?.keepPaths ? t.overlay.html : t.src.layout.htmlFile), data: fs.readFileSync(info.htmlPath) },
      ...info.assets.map((a) => ({ name: z + a, data: fs.readFileSync(path.join(t.dir, ...a.split('/'))) })),
      ...(info.designPath ? [{ name: z + 'design.md', data: fs.readFileSync(info.designPath) }] : []),
      ...(t.overlay ? t.overlay.docs.map((d) => ({ name: z + d.path, data: fs.readFileSync(path.join(t.dir, ...d.path.split('/'))) })) : []),
      ...(info.viewportBasePath ? [{ name: z + 'viewport-base.css', data: fs.readFileSync(info.viewportBasePath) }] : []),
      ...packFontEntries(z, faces),
      ...packCjkEntries(z, info.cjk, siteUrl),
      ...[...info.licenses, ...extraLicenses].map((l) => ({ name: z + l.file, data: l.data ?? fs.readFileSync(l.path) })),
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
        url: templateDirUrl(osrc, t.derivedFrom.slug),
        authors: o?.authors ?? [{ name: osrc.author, url: osrc.authorUrl }],
        license: o?.license ?? osrc.license,
      };
    }

    const spec = specimenFor(t, info.fontPlan.faces);
    if (spec) writeFile(path.join(SITE, 'assets', 'specimen', `${t.slug}.css`), `/* Latin subsets of this template's self-hosted fonts, for the typography specimen (licenses: fonts/<family>/OFL.txt). */\n${fontFaceCss(spec.faces, dataUrl)}\n`);

    const data = {
      ...t,
      moodGroups: moodGroupsOf(t).ids,
      specimen: spec ? { css: `assets/specimen/${t.slug}.css`, roles: spec.roles } : null,
      htmlFile: t.src.layout.htmlFile,
      description: ctx.description,
      zh: tz,
      paletteColors: info.paletteColors,
      screenshots: shots,
      thumb: shots[0] ?? null,
      sourceRepoUrl: t.src.repo ?? null,
      sourceRepoName: t.src.repo ? repoName(t.src.repo) : t.src.name,
      internal: t.src.private,
      sourceName: t.src.name,
      sourceNameZh: t.src.nameZh ?? null,
      sourceDirUrl: info.sourceDirUrl,
      sourceDerived: srcDerived,
      companionInfo: info.companionInfo,
      derived,
      promptEn: en,
      promptZh: zh,
      licenseNotice: ctx.licenseNotice,
      demoSlides: Boolean(t.overlay?.preview?.slides),
    };
    for (const lang of LANGS) {
      writeFile(path.join(SITE, ...pagePath(lang, `t/${t.slug}/index.html`).split('/')), detailPage(data, lang));
    }
    pageData.push(data);
  }

  // Convert kit + skills collection: two more zips and their pages.
  // Whenever the repository's own sources.json is used (extra sources and --only-sources do not matter;
  // --sources fixture builds stay minimal), kits/ exists and --no-kits is not given.
  const kits = usesDefaultSources && !NO_KITS && fs.existsSync(path.join(ROOT, 'kits', 'kits.json'))
    ? buildKits({ root: ROOT, site: SITE, siteUrl, makeZip, zipTime, writeFile, licenseName: fontLicenseName, cjkFamilyEntry, cjkRangesJson, fail })
    : null;
  if (kits && siteUrl) {
    const h = hostLatin(path.join(ROOT, 'kits', 'convert', 'spec', 'font-map.json'));
    console.log(`hosted ${h.files} Latin font files (${(h.bytes / 1048576).toFixed(1)} MB) under fonts/latin/ for the convert kit`);
  }
  if (kits) {
    // Sample slides of the kit's own example template (kits/kits.json "example"), if it is in this build.
    const exampleDir = readJson(path.join(ROOT, 'kits', 'kits.json')).example?.dir ?? '';
    const exampleData = pageData.find((d) => d.slug === path.posix.basename(exampleDir.replace(/\\/g, '/')));
    const example = { thumbs: (exampleData?.screenshots ?? []).filter((s) => s.small).slice(0, 3).map((s) => ({ file: s.small.file, width: s.small.width, height: s.small.height })) };
    for (const lang of LANGS) {
      writeFile(path.join(SITE, ...pagePath(lang, 'convert/index.html').split('/')), convertPage({ lang, kit: kits.convert, example }));
      writeFile(path.join(SITE, ...pagePath(lang, 'skills/index.html').split('/')), skillsPage({ lang, skills: kits.skills }));
    }
  }

  // Home carousel: the curated slugs that exist (and have a screenshot); none of them (a restricted
  // build): the first templates that have one.
  const withShot = pageData.filter((d) => d.thumb?.small);
  let featuredSlugs = homeSlugs.filter((slug) => withShot.some((d) => d.slug === slug));
  if (!featuredSlugs.length) featuredSlugs = withShot.slice(0, 16).map((d) => d.slug);

  for (const lang of LANGS) {
    writeFile(path.join(SITE, ...pagePath(lang, 'index.html').split('/')), indexPage({ templates: pageData, lang, featured: featuredSlugs }));
    writeFile(path.join(SITE, ...pagePath(lang, 'gallery/index.html').split('/')), galleryPage({ templates: pageData, lang, tags: tagGroups().groups }));
    writeFile(path.join(SITE, ...pagePath(lang, 'credits.html').split('/')), creditsPage({ sources: shownSources, templates: pageData, lang }));
  }

  // Machine-readable list of what was built (the Pages workflow checks the zip count against it).
  writeFile(path.join(SITE, 'manifest.json'), JSON.stringify({
    sources: shownSources.map((s) => s.id),
    templates: templates.map((t) => ({ slug: t.slug, source: t.source, ...(t.src.private ? { private: true } : {}) })),
    zips: templates.map((t) => `zip/${t.slug}.zip`),
    kits: kits ? kits.zips : [],
  }, null, 2) + '\n');

  const ms = Date.now() - started;
  console.log(`built ${templates.length} template(s) from ${sources.length} source(s) into ${rel(SITE).startsWith('..') ? SITE : rel(SITE)}${path.sep} in ${ms} ms` +
    (warnings.length ? ` (${warnings.length} warning(s))` : ''));
}

export { loadAndCheck, buildContext, BuildError, rel, SOURCES_FILE, EXTRA_SOURCE_FILES, extraI18nDir };

// Run only when executed directly (scripts/validate.mjs imports this file).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    // --validate: same as `node scripts/validate.mjs` (dynamic import without await: validate.mjs
    // imports this file, which must finish evaluating first).
    if (hasFlag('validate')) import('./validate.mjs');
    else main();
  } catch (e) {
    if (e instanceof BuildError) {
      console.error(`build failed: ${e.message}`);
      process.exit(1);
    }
    throw e;
  }
}
