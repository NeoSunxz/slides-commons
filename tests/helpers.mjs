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

export const EXTERNAL_WHITELIST = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

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
  const log = { consoleErrors: [], pageErrors: [], failed: [], badStatus: [], requests: [] };
  page.on('console', (m) => {
    if (m.type() === 'error') log.consoleErrors.push(`${m.text()} @ ${m.location()?.url ?? ''}`);
  });
  page.on('pageerror', (e) => log.pageErrors.push(String(e?.stack || e)));
  page.on('request', (r) => {
    let frameUrl = '';
    let isMain = true;
    try { const f = r.frame(); frameUrl = f.url(); isMain = f === page.mainFrame(); } catch { /* ignore */ }
    log.requests.push({ url: r.url(), frameUrl, isMain, type: r.resourceType() });
  });
  page.on('requestfailed', (r) => {
    log.failed.push(`${r.url()} — ${r.failure()?.errorText ?? 'failed'}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) log.badStatus.push(`${res.status()} ${res.url()}`);
  });
  return log;
}

export function hostOf(u) {
  try { return new URL(u).hostname; } catch { return ''; }
}
