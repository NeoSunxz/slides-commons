// Chinese translations of upstream template data (src/i18n/zh.json) and the staleness
// bookkeeping around them (src/i18n/zh.sources.json). Shared by the build, validate.mjs
// and i18n-sync.mjs.
//
// zh.json is written by a translator and never edited by scripts. zh.sources.json holds,
// for every translated field, a short hash of the English source string the translation
// was made from. `node scripts/i18n-sync.mjs` (re)writes it, and should be run only after
// a person has confirmed that zh.json matches the current English text. The build and
// validate then warn when a source hash differs ("stale") or a translation is missing;
// only structural problems are errors.
//
// Location: by default both files live in src/i18n/. To use another directory (tests,
// trying out a translation) pass `--i18n-dir <dir>` or set `SC_I18N_DIR=<dir>` (the flag
// wins). It is honoured by scripts/build.mjs, scripts/validate.mjs and
// scripts/i18n-sync.mjs (which then writes zh.sources.json into that directory). A relative
// path resolves from the repo root, not the current directory; absolute paths are used as is.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function i18nDirOption() {
  const argv = process.argv.slice(2);
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === '--i18n-dir') return argv[k + 1];
    if (argv[k].startsWith('--i18n-dir=')) return argv[k].slice('--i18n-dir='.length);
  }
  return process.env.SC_I18N_DIR || undefined;
}
const optDir = i18nDirOption();
export const I18N_DIR = optDir ? path.resolve(ROOT, optDir) : path.join(ROOT, 'src', 'i18n');
const DIR = I18N_DIR;
// For messages: repo-relative with '/' (e.g. src/i18n/zh.json), or absolute outside the repo.
const show = (f) => { const r = path.relative(ROOT, f); return r && !r.startsWith('..') && !path.isAbsolute(r) ? r.split(path.sep).join('/') : f; };
export const ZH_FILE = path.join(DIR, 'zh.json');
export const ZH_SOURCES_FILE = path.join(DIR, 'zh.sources.json');
export const FIELDS = ['tagline', 'description', 'best_for', 'avoid_for', 'occasion', 'palette_description', 'typography_style'];

export const hash12 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 12);

/** English source string for each translatable field of a template ('' = nothing to translate). */
export function sourceStrings(t, description) {
  return {
    tagline: t.tagline ?? '',
    description: description ?? '',
    best_for: t.best_for ?? '',
    avoid_for: t.avoid_for ?? '',
    occasion: Array.isArray(t.occasion) && t.occasion.length ? JSON.stringify(t.occasion) : '',
    palette_description: t.palette?.description ?? '',
    typography_style: t.typography?.style ?? '',
  };
}

function readJsonFile(file, problems, what) {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {
    problems.push(`${what} is not valid JSON: ${e.message}`);
    return null;
  }
}

/** Load zh.json and zh.sources.json. Structural problems are pushed to `problems`. */
export function loadZh(problems) {
  // An explicitly chosen directory without zh.json is a mistake (typo), not "no translations".
  if (optDir && !fs.existsSync(ZH_FILE)) problems.push(`${show(ZH_FILE)} not found (--i18n-dir / SC_I18N_DIR)`);
  const zh = readJsonFile(ZH_FILE, problems, show(ZH_FILE));
  const sources = readJsonFile(ZH_SOURCES_FILE, problems, show(ZH_SOURCES_FILE));
  if (zh && (typeof zh.terms !== 'object' || typeof zh.templates !== 'object')) {
    problems.push(`${show(ZH_FILE)} needs "terms" and "templates" objects`);
    return { zh: null, sources };
  }
  return { zh, sources };
}

const isNonEmpty = (v) => typeof v === 'string' && v.trim() !== '';
const termKey = (terms) => {
  const lower = new Map(Object.keys(terms).map((k) => [k.toLowerCase(), k]));
  return (tag) => (tag in terms ? tag : lower.get(String(tag).toLowerCase()));
};

/**
 * Checks. Errors go to `problems`; missing / stale translations go to `warn`.
 * items: [{ t, description }]. strictSlugs: also reject zh.json slugs that no loaded template has.
 */
export function checkZh({ zh, sources }, items, problems, warn, { strictSlugs }) {
  if (!zh) {
    warn(`no Chinese translations loaded (${show(ZH_FILE)}); zh pages fall back to English`);
    return;
  }
  const find = termKey(zh.terms);
  for (const [k, v] of Object.entries(zh.terms)) if (!isNonEmpty(v)) problems.push(`i18n: empty translation for term "${k}"`);
  const loaded = new Set(items.map((i) => i.t.slug));
  if (strictSlugs) {
    for (const slug of Object.keys(zh.templates)) if (!loaded.has(slug)) problems.push(`i18n: zh.json has translations for unknown template "${slug}"`);
  }
  if (!sources) warn(`${show(ZH_SOURCES_FILE)} is missing: staleness cannot be checked (run node scripts/i18n-sync.mjs after confirming zh.json)`);
  for (const { t, description } of items) {
    const tr = zh.templates[t.slug];
    // A translated template must have every tag in `terms` (error); an untranslated one
    // (e.g. a newly added source) only gets warnings, like its other fields.
    for (const tag of [...t.mood, ...t.tone]) {
      if (find(tag)) continue;
      if (tr) problems.push(`i18n: ${t.slug}: no Chinese term for tag "${tag}" in zh.json terms`);
      else warn(`missing translation: term "${tag}" (used by ${t.slug})`);
    }
    if (!tr) { warn(`missing translation: ${t.slug} (all fields; English shown on zh pages)`); continue; }
    const src = sourceStrings(t, description);
    for (const f of FIELDS) {
      if (!src[f]) continue;
      const v = tr[f];
      if (v === undefined) { warn(`missing translation: ${t.slug}.${f}`); continue; }
      if (f === 'occasion') {
        if (!Array.isArray(v) || v.some((x) => !isNonEmpty(x))) { problems.push(`i18n: ${t.slug}.occasion must be an array of non-empty strings`); continue; }
        if (v.length !== t.occasion.length) { problems.push(`i18n: ${t.slug}.occasion has ${v.length} entries but the template has ${t.occasion.length}`); continue; }
      } else if (!isNonEmpty(v)) { problems.push(`i18n: ${t.slug}.${f} is empty`); continue; }
      const h = sources?.[t.slug]?.[f];
      if (sources && h !== undefined && h !== hash12(src[f])) warn(`stale translation: ${t.slug}.${f} (English source changed)`);
      else if (sources && h === undefined) warn(`unconfirmed translation: ${t.slug}.${f} (no source hash; run node scripts/i18n-sync.mjs after confirming)`);
    }
  }
}

/** The Chinese values for a template; a missing / unusable value is null (page falls back to English). */
export function resolveZh(t, description, zh) {
  if (!zh) return null;
  const tr = zh.templates?.[t.slug] ?? {};
  const find = termKey(zh.terms ?? {});
  const src = sourceStrings(t, description);
  const pick = (f) => (src[f] && isNonEmpty(tr[f]) ? tr[f] : null);
  const tags = (arr) => arr.map((x) => { const k = find(x); return k ? zh.terms[k] : null; });
  return {
    tagline: pick('tagline'),
    description: pick('description'),
    best_for: pick('best_for'),
    avoid_for: pick('avoid_for'),
    palette_description: pick('palette_description'),
    typography_style: pick('typography_style'),
    occasion: Array.isArray(tr.occasion) && tr.occasion.length === t.occasion.length ? tr.occasion : null,
    mood: tags(t.mood),
    tone: tags(t.tone),
  };
}

/** Chinese label for a mood value (for gallery chips); null if there is none. */
export function zhTerm(zh, tag) {
  if (!zh) return null;
  const k = termKey(zh.terms)(tag);
  return k ? zh.terms[k] : null;
}
