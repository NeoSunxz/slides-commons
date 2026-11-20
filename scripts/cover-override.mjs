#!/usr/bin/env node
// Render slide 1 of a template into sources/meta/covers/<source-id>/<slug>.png (1920x1080).
//
//   npm run screenshots -- --cover-override <source-id>/<slug>
//   node scripts/cover-override.mjs <source-id>/<slug> [--sources <file>]
//
// For upstream templates whose shipped screenshots lack slide 1 (the build takes the lowest
// numbered screenshot as the thumbnail). The build uses the file, when present, as the card, home
// and detail thumbnail and as the first screenshot on the detail page. The upstream is only read.
// Rendering matches scripts/screenshots.mjs: Latin fonts embedded from the font store, 1920x1080,
// wait for fonts and finite animations. Fontshare / CJK families are still fetched online.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createFontStore, planTemplateFonts, rewriteGoogleFonts, fontFaceCss, dataUrl } from './fonts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const die = (msg) => { console.error(`cover-override failed: ${msg}`); process.exit(1); };
const argv = process.argv.slice(2);
const opt = (name) => {
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === `--${name}`) return argv[k + 1];
    if (argv[k].startsWith(`--${name}=`)) return argv[k].slice(name.length + 3);
  }
};
const spec = opt('cover-override') ?? argv.find((a, k) => !a.startsWith('--') && (k === 0 || !['--sources'].includes(argv[k - 1])));
const m = String(spec ?? '').match(/^([^/\\]+)[/\\]([^/\\]+)$/);
if (!m) die('usage: --cover-override <source-id>/<slug>');
const [, sourceId, slug] = m;

const sourcesFile = opt('sources') ?? path.join(ROOT, 'sources', 'sources.json');
const cfg = JSON.parse(fs.readFileSync(sourcesFile, 'utf8'));
const src = cfg.sources.find((s) => s.id === sourceId);
if (!src) die(`unknown source "${sourceId}"`);
if (src.overlay) die(`source "${sourceId}" is an overlay source; render it with npm run screenshots`);
const L = { templatesDir: 'templates', htmlFile: 'template.html', ...(src.layout ?? {}) };
const from = path.join(ROOT, ...src.path.split('/'), ...L.templatesDir.split('/'), slug);
if (!fs.existsSync(path.join(from, L.htmlFile))) die(`${slug}: ${path.join(from, L.htmlFile)} not found`);

let chromium;
try { ({ chromium } = await import('@playwright/test')); } catch { die('Playwright is not installed (run: npm ci)'); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-commons-cover-'));
const browser = await chromium.launch();
try {
  const work = path.join(tmp, slug);
  fs.cpSync(from, work, { recursive: true });
  let html = fs.readFileSync(path.join(work, L.htmlFile), 'utf8');
  const plan = planTemplateFonts(html, createFontStore(ROOT));
  if (plan.errors.length) die(`${slug}: ${plan.errors.join('; ')}`);
  if (plan.faces.length) {
    html = rewriteGoogleFonts(html, plan.requests, new Set(plan.faces.map((f) => f.family)));
    const rules = `<style>${fontFaceCss(plan.faces, dataUrl)}</style>`;
    const h = html.match(/<head\b[^>]*>/i);
    html = h ? html.slice(0, h.index + h[0].length) + rules + html.slice(h.index + h[0].length) : rules + html;
  }
  fs.writeFileSync(path.join(work, L.htmlFile), html);

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(pathToFileURL(path.join(work, L.htmlFile)).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const at = await page.evaluate(() => [...document.querySelectorAll('.slide')].findIndex((s) => s.classList.contains('active') || s.classList.contains('is-active')) + 1);
  if (at > 1) die(`${slug}: the deck opens on slide ${at}, not slide 1`);
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => undefined)));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  // Hide the runtime's own controls (deck-stage keeps them in a shadow root), like upstream shots.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) el.shadowRoot?.querySelectorAll('.overlay, .tapzones').forEach((n) => { n.style.display = 'none'; });
  });
  await page.waitForTimeout(300);
  const outDir = path.join(ROOT, 'sources', 'meta', 'covers', sourceId);
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${slug}.png`);
  await page.screenshot({ path: out });
  if (errors.length) console.warn(`warning: ${slug}: page errors: ${errors.join(' | ')}`);
  console.log(`${path.relative(ROOT, out)}  (${fs.statSync(out).size} bytes)`);
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
