#!/usr/bin/env node
// Render the screenshots of templates that live in this repository.
//
//   npm run screenshots [-- --only <slug>[,<slug>…]] [--sources <file>]
//
// For every source that is NOT a git submodule (upstream/ is read-only third-party content,
// its screenshots are never touched), every template is opened at 1920x1080 in Chromium
// (Playwright), paged with ArrowRight, and written to <source>/<screenshotsDir>/<slug>-<n>.png.
// Slides come from the source's `screenshots.slides` in sources.json (1-based numbers or
// "middle" / "last"; default [1, "middle", "last"]); the n in the file name is the position in
// that list, so a template always gets <slug>-1.png, -2.png, -3.png.
//
// Latin fonts are embedded exactly like in the site preview (scripts/fonts.mjs), so the
// result does not depend on Google Fonts being reachable; Fontshare is still fetched online.
// A slide is a `.slide` element, the current one carries `.active` (the fixed-stage convention
// of viewport-base.css that every collection template follows).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createFontStore, planTemplateFonts, rewriteGoogleFonts, fontFaceCss, dataUrl } from './fonts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function cliOption(name) {
  const argv = process.argv.slice(2);
  for (let k = 0; k < argv.length; k++) {
    if (argv[k] === `--${name}`) return argv[k + 1];
    if (argv[k].startsWith(`--${name}=`)) return argv[k].slice(name.length + 3);
  }
  return undefined;
}
const die = (msg) => { console.error(`screenshots failed: ${msg}`); process.exit(1); };

// Paths of git submodules (".gitmodules"), POSIX style.
function submodulePaths() {
  const f = path.join(ROOT, '.gitmodules');
  if (!fs.existsSync(f)) return [];
  return [...fs.readFileSync(f, 'utf8').matchAll(/^\s*path\s*=\s*(.+?)\s*$/gm)].map((m) => m[1]);
}

function slideNumbers(spec, total) {
  const out = spec.map((s) => {
    if (s === 'last') return total;
    if (s === 'middle') return Math.ceil(total / 2);
    if (Number.isInteger(s) && s >= 1) return Math.min(s, total);
    die(`invalid slide spec ${JSON.stringify(s)} (use a number >= 1, "middle" or "last")`);
  });
  return out;
}

const sourcesFile = cliOption('sources') ?? path.join(ROOT, 'sources.json');
const cfg = JSON.parse(fs.readFileSync(sourcesFile, 'utf8'));
const subs = submodulePaths();
const own = cfg.sources.filter((s) => !subs.some((p) => s.path === p || s.path.startsWith(p + '/')));
if (!own.length) die('no source inside this repository');
const only = cliOption('only')?.split(',').filter(Boolean);

let chromium;
try { ({ chromium } = await import('@playwright/test')); } catch { die('Playwright is not installed (run: npm ci)'); }
const store = createFontStore(ROOT);
const browser = await chromium.launch();
let written = 0;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'slides-commons-shots-'));
try {
  for (const src of own) {
    const L = { templatesDir: 'templates', htmlFile: 'template.html', metaFile: 'template.json', screenshotsDir: 'screenshots', ...(src.layout ?? {}) };
    const sdir = path.join(ROOT, ...src.path.split('/'));
    const tdir = path.join(sdir, ...L.templatesDir.split('/'));
    const outDir = path.join(sdir, ...L.screenshotsDir.split('/'));
    const spec = src.screenshots?.slides ?? [1, 'middle', 'last'];
    const slugs = fs.readdirSync(tdir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(tdir, d.name, L.metaFile)) && fs.existsSync(path.join(tdir, d.name, L.htmlFile)))
      .map((d) => d.name).sort().filter((s) => !only || only.includes(s));
    fs.mkdirSync(outDir, { recursive: true });
    for (const slug of slugs) {
      // Working copy with the Latin fonts embedded.
      const work = path.join(tmp, src.id, slug);
      fs.cpSync(path.join(tdir, slug), work, { recursive: true });
      let html = fs.readFileSync(path.join(work, L.htmlFile), 'utf8');
      const plan = planTemplateFonts(html, store);
      if (plan.errors.length) die(`${slug}: ${plan.errors.join('; ')}`);
      if (plan.faces.length) {
        html = rewriteGoogleFonts(html, plan.requests, new Set(plan.faces.map((f) => f.family)));
        const rules = `<style>${fontFaceCss(plan.faces, dataUrl)}</style>`;
        const m = html.match(/<head\b[^>]*>/i);
        html = m ? html.slice(0, m.index + m[0].length) + rules + html.slice(m.index + m[0].length) : rules + html;
      }
      fs.writeFileSync(path.join(work, L.htmlFile), html);

      const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(pathToFileURL(path.join(work, L.htmlFile)).href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
      if (!total) die(`${slug}: no .slide elements found`);
      const current = () => page.evaluate(() => [...document.querySelectorAll('.slide')].findIndex((s) => s.classList.contains('active')) + 1);
      // Wait until finite animations/transitions have finished and the page has painted.
      const settle = async () => {
        await page.evaluate(async () => {
          await Promise.all(document.getAnimations()
            .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => undefined)));
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        });
        await page.waitForTimeout(150);
      };
      await page.evaluate(() => window.focus());
      const wanted = slideNumbers(spec, total);
      let at = await current();
      for (let k = 0; k < wanted.length; k++) {
        while (at < wanted[k]) {
          const before = at;
          await page.keyboard.press('ArrowRight');
          // The slide only counts as changed when the active index really moved (key locks
          // swallow presses that come too soon), so retry until it does.
          const deadline = Date.now() + 10000;
          while (at === before) {
            if (Date.now() > deadline) die(`${slug}: ArrowRight did not move past slide ${before}`);
            await page.waitForTimeout(100);
            at = await current();
            if (at === before && Date.now() % 1000 < 100) await page.keyboard.press('ArrowRight');
          }
        }
        await settle();
        const file = path.join(outDir, `${slug}-${k + 1}.png`);
        await page.screenshot({ path: file });
        written++;
        console.log(`${path.relative(ROOT, file)}  (slide ${at} of ${total})`);
      }
      if (errors.length) console.warn(`warning: ${slug}: page errors: ${errors.join(' | ')}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`wrote ${written} screenshot(s)`);
