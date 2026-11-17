// Builds throwaway collection fixtures in the OS temp dir for the contribution-flow tests.
// Nothing is ever written inside the repo. Source `path` values in sources.json are resolved
// from the repo root by the build, so fixtures are referenced with a relative path ("../../tmp/...").
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { ROOT, SOURCES_JSON } from './helpers.mjs';

export const SCRIPTS = {
  build: path.join(ROOT, 'scripts', 'build.mjs'),
  validate: path.join(ROOT, 'scripts', 'validate.mjs'),
  newTemplate: path.join(ROOT, 'scripts', 'new-template.mjs'),
};

const CLEAN_ENV = { SC_SOURCES: '', SC_OUT: '', SC_I18N_DIR: '', SC_SITE_URL: '' };
export function run(script, args, { cwd = ROOT, env = {} } = {}) {
  const r = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', env: { ...process.env, ...CLEAN_ENV, ...env }, maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}`.trim() };
}

// ---------------------------------------------------------------------------
// PNG writer (8-bit RGB or grayscale), enough for screenshots of a given size.
// ---------------------------------------------------------------------------
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const head = Buffer.alloc(8); head.writeUInt32BE(data.length, 0); head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
};
/** `noise: true` fills the image with random bytes so it does not compress (for size-limit tests). */
export function png(width = 1920, height = 1080, { noise = false } = {}) {
  const ch = noise ? 1 : 3; // noisy images are grayscale to keep the file just over the limit
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = noise ? 0 : 2;
  const stride = width * ch + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const o = y * stride;
    if (noise) { for (let x = 0; x < width; x++) raw[o + 1 + x] = (Math.random() * 256) | 0; }
    else { for (let x = 0; x < width; x++) { raw[o + 1 + x * 3] = 24; raw[o + 2 + x * 3] = 32; raw[o + 3 + x * 3] = 48; } }
  }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: noise ? 0 : 6 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------------------
// Fixture root
// ---------------------------------------------------------------------------
export function makeRoot(prefix = 'sc-coll-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}
/** Path of `abs` relative to the repo root, with "/" separators, as the build expects in sources.json. */
export function relFromRoot(abs) {
  const r = path.relative(ROOT, abs);
  if (path.isAbsolute(r)) throw new Error(`cannot express ${abs} relative to ${ROOT} (different drive?)`);
  return r.split(path.sep).join('/');
}

export const realSource = (id) => structuredClone(SOURCES_JSON.sources.find((s) => s.id === id));

/** A community-like collection source pointing at <root>/<dir>. */
export function collectionSource(root, { id = 'fxcol', dir = 'col', extra = {} } = {}) {
  const community = realSource('community');
  return {
    ...community,
    id, name: `Fixture ${id}`, author: 'Fixture Authors', license: 'per template',
    repo: 'https://github.com/fixture-owner/fixture-repo', repoPath: dir,
    path: relFromRoot(path.join(root, dir)),
    ...extra,
  };
}

export function writeSources(root, sources, name = 'sources.json') {
  const file = path.join(root, name);
  fs.writeFileSync(file, JSON.stringify({ schemaVersion: 1, sources }, null, 2));
  return file;
}

export const GOOD_META = (slug, over = {}) => ({
  slug,
  name: `Fixture ${slug}`,
  tagline: 'A plain fixture deck for the contribution checks.',
  mood: ['plain'], occasion: ['testing'], tone: ['neutral'],
  formality: 'medium', density: 'low',
  palette: { 'bg-primary': '#0f172a', 'text-primary': '#f8fafc', accent: '#38bdf8', description: 'Navy and sky.' },
  typography: { display: 'Inter', body: 'Inter', style: 'One family.' },
  scheme: 'dark',
  best_for: 'Tests.', avoid_for: 'Real talks.',
  slide_count: 3,
  navigation: 'arrow keys',
  authors: [{ name: 'Fixture Person', url: 'https://github.com/fixture-person' }],
  license: 'MIT',
  ...over,
});

/**
 * Create a complete, passing template in <root>/<dir>: scaffold it with scripts/new-template.mjs, then
 * replace every TODO. This also proves the scaffold is a sound starting point.
 * Returns the template directory.
 */
export function scaffoldGood(root, sourcesFile, { slug, id = 'fxcol', dir = 'col', meta = {} }) {
  const r = run(SCRIPTS.newTemplate, [slug, '--collection', id, '--sources', sourcesFile]);
  if (r.status !== 0) throw new Error(`new-template failed:\n${r.out}`);
  const tdir = path.join(root, dir, 'templates', slug);
  for (const f of ['design.md', 'template.html', 'LICENSE']) {
    const p = path.join(tdir, f);
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/TODO/g, 'Done'));
  }
  fs.writeFileSync(path.join(tdir, 'template.json'), JSON.stringify(GOOD_META(slug, meta), null, 2) + '\n');
  const shots = path.join(root, dir, 'screenshots');
  fs.mkdirSync(shots, { recursive: true });
  const img = png();
  for (let n = 1; n <= 3; n++) fs.writeFileSync(path.join(shots, `${slug}-${n}.png`), img);
  return tdir;
}

export const readText = (...p) => fs.readFileSync(path.join(...p), 'utf8');
