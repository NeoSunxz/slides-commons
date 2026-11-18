// Shared helpers for the slides-commons Playwright suite. Cross-platform (node:path only).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const TESTS = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(TESTS, '..');
export const SITE = path.join(ROOT, 'site');
export const ARTIFACTS = path.join(TESTS, 'artifacts');
export const SLUG = 'neo-grid-bold';
export const UPSTREAM_TEMPLATE_DIR = path.join(ROOT, 'upstream', 'templates', 'templates', SLUG);

export const EXTERNAL_WHITELIST = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'api.fontshare.com', 'cdn.fontshare.com'];

export function artifactPath(name) {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  return path.join(ARTIFACTS, name);
}

export function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/** Count slides in the upstream deck: direct children of <deck-stage>, as the runtime does. */
export function countUpstreamSlides() {
  const html = fs.readFileSync(path.join(UPSTREAM_TEMPLATE_DIR, 'template.html'), 'utf8');
  const m = html.match(/<deck-stage[^>]*>([\s\S]*?)<\/deck-stage>/i);
  if (!m) return null;
  return (m[1].match(/<section\b/gi) ?? []).length;
}

// ---------------------------------------------------------------------------
// Minimal zip reader (central directory + inflateRawSync), with integrity checks.
// ---------------------------------------------------------------------------
export function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('zip: end of central directory not found');
  const count = buf.readUInt16LE(eocd + 10);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOff = buf.readUInt32LE(eocd + 16);
  const entries = [];
  const problems = [];
  let p = cdOff;
  for (let k = 0; k < count; k++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error(`zip: bad central header at ${p}`);
    const method = buf.readUInt16LE(p + 10);
    const crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nlen).toString('utf8');
    p += 46 + nlen + xlen + clen;

    if (buf.readUInt32LE(lho) !== 0x04034b50) { problems.push(`${name}: bad local header`); continue; }
    const lnlen = buf.readUInt16LE(lho + 26);
    const lxlen = buf.readUInt16LE(lho + 28);
    const lname = buf.slice(lho + 30, lho + 30 + lnlen).toString('utf8');
    if (lname !== name) problems.push(`${name}: local name "${lname}" differs`);
    if (buf.readUInt32LE(lho + 14) !== crc) problems.push(`${name}: local CRC differs from central`);
    const start = lho + 30 + lnlen + lxlen;
    const body = buf.slice(start, start + csize);
    let data;
    if (method === 0) data = body;
    else if (method === 8) data = zlib.inflateRawSync(body);
    else { problems.push(`${name}: unsupported method ${method}`); continue; }
    if (data.length !== usize) problems.push(`${name}: size ${data.length} != declared ${usize}`);
    if ((zlib.crc32(data) >>> 0) !== crc) problems.push(`${name}: CRC mismatch`);
    if (name.includes('..') || name.startsWith('/') || /^[a-zA-Z]:/.test(name) || name.includes('\\')) {
      problems.push(`${name}: unsafe path`);
    }
    entries.push({ name, data, isDir: name.endsWith('/') });
  }
  if (p !== cdOff + cdSize) problems.push(`central directory size mismatch (${p - cdOff} vs ${cdSize})`);
  return { entries, problems };
}

export function extractZip(entries, dest) {
  for (const e of entries) {
    const out = path.join(dest, ...e.name.split('/').filter(Boolean));
    if (!out.startsWith(dest)) throw new Error(`refusing to extract outside dest: ${e.name}`);
    if (e.isDir) fs.mkdirSync(out, { recursive: true });
    else { fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, e.data); }
  }
}

export const normalizeEol = (s) => s.replace(/\r\n?/g, '\n');

// ---------------------------------------------------------------------------
// Console / network monitor for a page (includes child frames).
// ---------------------------------------------------------------------------
export function monitor(page) {
  const log = { consoleErrors: [], pageErrors: [], failed: [], badStatus: [], requests: [], inflight: new Set() };
  page.on('console', (m) => {
    if (m.type() === 'error') log.consoleErrors.push(`${m.text()} @ ${m.location()?.url ?? ''}`);
  });
  page.on('pageerror', (e) => log.pageErrors.push(String(e?.stack || e)));
  page.on('request', (r) => {
    let frameUrl = '';
    let isMain = true;
    try { const f = r.frame(); frameUrl = f.url(); isMain = f === page.mainFrame(); } catch { /* ignore */ }
    log.requests.push({ url: r.url(), frameUrl, isMain, type: r.resourceType() });
    log.inflight.add(r);
  });
  page.on('requestfinished', (r) => log.inflight.delete(r));
  page.on('requestfailed', (r) => {
    log.inflight.delete(r);
    log.failed.push(`${r.url()} — ${r.failure()?.errorText ?? 'failed'}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) log.badStatus.push(`${res.status()} ${res.url()}`);
  });
  return log;
}

/** Context-wide monitor: also catches popups opened from the page. */
export function monitorContext(context) {
  const log = { consoleErrors: [], pageErrors: [], failed: [], badStatus: [], inflight: new Set() };
  context.on('console', (m) => {
    if (m.type() === 'error') log.consoleErrors.push(`${m.text()} @ ${m.location()?.url ?? ''}`);
  });
  context.on('weberror', (e) => log.pageErrors.push(String(e.error()?.stack || e.error())));
  context.on('request', (r) => log.inflight.add(r));
  context.on('requestfinished', (r) => log.inflight.delete(r));
  context.on('requestfailed', (r) => {
    log.inflight.delete(r);
    log.failed.push(`${r.url()} — ${r.failure()?.errorText ?? 'failed'}`);
  });
  context.on('response', (res) => { if (res.status() >= 400) log.badStatus.push(`${res.status()} ${res.url()}`); });
  return log;
}

/** Wait until every request seen by a monitor has finished or failed (no idle-time heuristics). */
export async function settled(log, expect, timeout = 30_000) {
  await expect.poll(() => [...log.inflight].map((r) => r.url()), { timeout, message: 'requests still in flight' }).toEqual([]);
}

/** Wait (inside a page or frame) until a FontFace of `family` has status "loaded". */
export async function fontLoaded(target, family, timeout = 30_000) {
  await target.waitForFunction((fam) => [...document.fonts].some((f) => f.family.replace(/["']/g, '') === fam && f.status === 'loaded'),
    family, { timeout });
  await target.evaluate(() => document.fonts.ready);
}

/** The detail page's preview frame, once <deck-stage> has upgraded. */
export async function previewFrame(page) {
  const handle = await page.locator('iframe#preview').elementHandle();
  const frame = await handle.contentFrame();
  await frame.waitForFunction(() => {
    const d = document.querySelector('deck-stage');
    return d && typeof d.length === 'number' && d.length > 0;
  });
  return frame;
}

/** Deck state + rendering facts, evaluated inside a page or frame running the deck. */
export function deckFacts(target) {
  return target.evaluate(async () => {
    await document.fonts.ready;
    const d = document.querySelector('deck-stage');
    const slides = [...d.querySelectorAll(':scope > [data-deck-slide]')];
    const visible = slides.filter((s) => {
      const cs = getComputedStyle(s);
      return cs.visibility === 'visible' && Number(cs.opacity) > 0;
    });
    const title = document.querySelector('[data-deck-active] h1.title, [data-deck-active] h1');
    return {
      index: d.index,
      total: d.length,
      visibleSlides: visible.length,
      activeLabel: document.querySelector('[data-deck-active]')?.getAttribute('data-label') ?? null,
      titleFont: title ? getComputedStyle(title).fontFamily : null,
      spaceGroteskLoaded: [...document.fonts].some((f) => /Space Grotesk/.test(f.family) && f.status === 'loaded'),
    };
  });
}

export function hostOf(u) {
  try { return new URL(u).hostname; } catch { return ''; }
}

// ---------------------------------------------------------------------------
// Upstream-derived facts (nothing hardcoded per template).
// ---------------------------------------------------------------------------
export const UPSTREAM_TEMPLATES = path.join(ROOT, 'upstream', 'templates');
export const UPSTREAM_SKILL = path.join(ROOT, 'upstream', 'skill');
const TDIR = path.join(UPSTREAM_TEMPLATES, 'templates');

// Sources come from sources.json, templates from their directories on disk (not from site/,
// which is rebuilt after the spec files are loaded).
export const SOURCES_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources.json'), 'utf8'));
const dirsOf = (src) => {
  const dir = path.join(ROOT, src.path, src.layout.templatesDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(dir, d.name, src.layout.metaFile)))
    .map((d) => ({ slug: d.name, source: src.id, dir: path.join(dir, d.name) }));
};
export const CATALOG = SOURCES_JSON.sources.flatMap(dirsOf).sort((a, b) => a.slug.localeCompare(b.slug));
export const UPSTREAM_SOURCE_ID = 'zarazhangrui';
export const COLLECTION_SOURCE_ID = 'style-presets';
export const COLLECTION = SOURCES_JSON.sources.find((s) => s.id === COLLECTION_SOURCE_ID);
export const ALL_SLUGS = CATALOG.map((t) => t.slug);
export const UP_SLUGS = CATALOG.filter((t) => t.source === UPSTREAM_SOURCE_ID).map((t) => t.slug);
export const COLLECTION_SLUGS = CATALOG.filter((t) => t.source === COLLECTION_SOURCE_ID).map((t) => t.slug);
export const DERIVED_SLUGS = COLLECTION?.derivedFrom?.slugs ?? [];
export const ORIGINAL_SLUGS = COLLECTION_SLUGS.filter((s) => !DERIVED_SLUGS.includes(s));
export const sourceOf = (slug) => CATALOG.find((t) => t.slug === slug)?.source;
export const isUpstream = (slug) => sourceOf(slug) === UPSTREAM_SOURCE_ID;

export const dirUrl = (slug) => {
  const src = SOURCES_JSON.sources.find((x) => x.id === sourceOf(slug));
  const base = `${src.repo}/tree/${src.branch}/${src.repoPath ? `${src.repoPath}/` : ''}`;
  return `${base}${src.layout.templatesDir}/${slug}`;
};
export const upstreamDir = (slug) => CATALOG.find((t) => t.slug === slug).dir;
export const upstreamMeta = (slug) => JSON.parse(fs.readFileSync(path.join(upstreamDir(slug), 'template.json'), 'utf8'));
export const upstreamHtml = (slug) => fs.readFileSync(path.join(upstreamDir(slug), 'template.html'), 'utf8');
export const hasDeckStageJs = (slug) => fs.existsSync(path.join(upstreamDir(slug), 'deck-stage.js'));
export const DECK_STAGE_SLUGS = ALL_SLUGS.filter(hasDeckStageJs);
export const CDN_SLUGS = ALL_SLUGS.filter((s) => /cdn\.jsdelivr\.net/.test(upstreamHtml(s)));
export const GOOGLE_FONT_SLUGS = ALL_SLUGS.filter((s) => /fonts\.googleapis\.com/.test(upstreamHtml(s)));
export const FONTSHARE_SLUGS = ALL_SLUGS.filter((s) => /api\.fontshare\.com/.test(upstreamHtml(s)) && !GOOGLE_FONT_SLUGS.includes(s));
// Neither Google Fonts nor Fontshare: system fonts only.
export const NO_WEBFONT_SLUGS = ALL_SLUGS.filter((s) => !/fonts\.googleapis\.com|api\.fontshare\.com/.test(upstreamHtml(s)));
export const skillDesign = (slug) => (isUpstream(slug)
  ? path.join(UPSTREAM_SKILL, 'bold-template-pack', 'templates', slug, 'design.md')
  : path.join(upstreamDir(slug), 'design.md'));

/** A sample of slugs for the more expensive checks: every 5th + three named ones. */
export const SAMPLE_SLUGS = [...new Set([
  ...ALL_SLUGS.filter((_, i) => i % 5 === 0),
  ...['neo-grid-bold', 'raw-grid', 'coral'].filter((s) => ALL_SLUGS.includes(s)),
])];

export function readSiteZip(outDir, slug) {
  return readZip(fs.readFileSync(path.join(outDir, 'zip', `${slug}.zip`)));
}

// ---------------------------------------------------------------------------
// Chinese-page text rules
// ---------------------------------------------------------------------------
export const ZH_ALLOW = [
  /(https?:\/\/)?github\.com\/\S*/g, /Beautiful HTML Templates/g, /Frontend Slides/g, /\bHTML\b/g,
  /Neo-Grid Bold/g, /Zara Zhang/g, /NeoSunxz and slides-commons contributors/g, /NeoSunxz/g, /STYLE_PRESETS\.md/g, /beautiful-html-templates/g, /frontend-slides/g, /slides-commons/g,
  /Space Grotesk/g, /JetBrains Mono/g, /\bMIT\b/g, /\bGitHub\b/g,
  /Claude Code/g, /\bCodex\b/g, /\bCursor\b/g, /coding agent/g, /\bEsc\b/g,
  /\b[\w-]+\.(md|css|js|html|zip)\b/g, /\.zip\b/g, /#[0-9A-Fa-f]{3,8}\b/g,
];
// Latin tokens that legitimately appear inside Chinese sentences: product / font names (from the
// template's own data), acronyms and the allowlist above. Anything left must not form a run of
// 3 or more English words.
export function zhEnglishRuns(text, extraTokens = []) {
  let rest = text;
  for (const re of ZH_ALLOW) rest = rest.replace(re, ' ');
  for (const tok of extraTokens.filter(Boolean).sort((a, b) => b.length - a.length)) {
    rest = rest.split(tok).join(' ');
  }
  return rest.match(/(?:\b[A-Za-z][A-Za-z'-]*\b[\s,]+){2,}\b[A-Za-z][A-Za-z'-]*\b/g) ?? [];
}


/** zh.json (the Chinese translations of upstream data). */
export const ZH_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'i18n', 'zh.json'), 'utf8'));
export const ZH_SOURCES = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'i18n', 'zh.sources.json'), 'utf8'));

/** Names that may stay Latin inside Chinese sentences: template names, font names, palette keys, tag keys. */
export function zhNameTokens(slugs = ALL_SLUGS) {
  const out = new Set(Object.keys(ZH_JSON.terms));
  for (const slug of slugs) {
    const m = upstreamMeta(slug);
    out.add(m.name);
    Object.entries(m.typography).filter(([k]) => k !== 'style').forEach(([, v]) => out.add(v));
    Object.keys(m.palette).filter((k) => k !== 'description').forEach((k) => out.add(k));
  }
  return [...out];
}
