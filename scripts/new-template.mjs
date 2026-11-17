#!/usr/bin/env node
// Scaffold a new template.
//
//   npm run new-template -- <slug> [--collection community] [--sources <file>]
//
// Creates <collection>/templates/<slug>/ with template.json, design.md, template.html and
// LICENSE. Every value you must decide is marked TODO; `npm run validate` fails until all
// TODO markers are gone. Works on Linux, macOS and Windows.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const die = (msg) => { console.error(`new-template failed: ${msg}`); process.exit(1); };

const args = process.argv.slice(2);
let slug = null;
const opt = {};
for (let k = 0; k < args.length; k++) {
  const a = args[k];
  if (a.startsWith('--')) {
    const [name, inline] = a.slice(2).split('=');
    opt[name] = inline ?? args[++k];
  } else if (!slug) slug = a;
  else die(`unexpected argument "${a}"`);
}
if (!slug) die('usage: npm run new-template -- <slug> [--collection community]');
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) die(`slug "${slug}" must be lowercase letters, digits and single hyphens (e.g. "neon-harbor")`);

const sourcesFile = opt.sources ?? process.env.SC_SOURCES ?? path.join(ROOT, 'sources.json');
const cfg = JSON.parse(fs.readFileSync(sourcesFile, 'utf8'));
const collectionId = opt.collection ?? 'community';
const src = cfg.sources.find((s) => s.id === collectionId);
if (!src) die(`no source "${collectionId}" in ${path.relative(ROOT, sourcesFile)}`);
if (!src.collection) die(`source "${collectionId}" is not an in-repo collection (collection: true)`);

// Slugs must be unique across every source.
for (const s of cfg.sources) {
  const d = path.join(ROOT, ...s.path.split('/'), ...(s.layout?.templatesDir ?? 'templates').split('/'), slug);
  if (fs.existsSync(d)) die(`slug "${slug}" already exists: ${path.relative(ROOT, d)}`);
}

const L = { templatesDir: 'templates', metaFile: 'template.json', htmlFile: 'template.html', designFile: 'design.md', licenseFile: 'LICENSE', ...(src.layout ?? {}) };
const dir = path.join(ROOT, ...src.path.split('/'), ...L.templatesDir.split('/'), slug);

const viewportPath = path.join(ROOT, ...(src.companion?.path ?? 'upstream/skill').split('/'), src.companion?.viewportBase ?? 'viewport-base.css');
if (!fs.existsSync(viewportPath)) die(`viewport-base.css not found at ${path.relative(ROOT, viewportPath)} (run: git submodule update --init)`);
const viewport = fs.readFileSync(viewportPath, 'utf8').trim();

const title = slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const year = new Date().getFullYear();

const meta = {
  slug,
  name: `TODO name (suggestion: ${title})`,
  tagline: 'TODO one sentence: what the deck looks like',
  mood: ['TODO'],
  occasion: ['TODO'],
  tone: ['TODO'],
  formality: 'TODO low | medium-low | medium | medium-high | high',
  density: 'TODO low | medium-low | medium | medium-high | high',
  palette: {
    'bg-primary': '#0f172a',
    'text-primary': '#f8fafc',
    accent: '#38bdf8',
    description: 'TODO one line describing the palette',
  },
  typography: {
    display: 'Inter',
    body: 'Inter',
    style: 'TODO one line describing the type',
  },
  scheme: 'TODO light | dark | mixed',
  best_for: 'TODO what this style is good at',
  avoid_for: 'TODO where it does not work',
  slide_count: 3,
  navigation: 'inline script (arrow keys, space, PgUp/PgDn, Home/End, mouse wheel, click, swipe)',
  authors: [{ name: 'TODO your name', url: 'TODO https://github.com/your-name' }],
  license: 'MIT',
};

const design = `---
version: alpha
name: TODO ${title}
description: TODO two or three sentences: the look, the fonts, what every slide shares.

colors:
  bg-primary: "#0f172a"
  text-primary: "#f8fafc"
  accent: "#38bdf8"

typography:
  display: "Inter"
  body: "Inter"
---

# TODO ${title}

## Fixed-Stage Policy

Slides are authored on a fixed 1920×1080 canvas (\`.deck-stage\`) and scaled as a whole to the
window; nothing reflows. Include \`viewport-base.css\` in full and keep the slide count in sync
with the page counter. TODO: add any style-specific stage rules.

## Overview

TODO what the style feels like and when to use it.

## Colors

TODO palette with roles (background, text, accent, muted, rules).

## Typography

TODO fonts (Google Fonts families that exist on Fontsource, or Fontshare), sizes and weights at 1920×1080.

## Layout

TODO canvas margins, grid, chrome (header, footer, page number).

## Signature Moves

TODO three to five things that make this style recognizable. Describe them so an agent can
reproduce them in a new deck.

## Components

TODO cards, tables, charts, quotes.

## Slide Archetypes

TODO cover, section, content, data, closing.

## Do's and Don'ts

TODO

## CJK & International Content

TODO recommended Chinese font pairing (Noto Sans SC / Noto Serif SC), weights, line height, punctuation,
and how mixed Latin/CJK text is handled. Load CJK fonts from Google Fonts.
`;

const html = `<!DOCTYPE html>
<!--
  TODO ${title}. Remove this TODO line and describe the template here.
  Fixed 1920x1080 stage, scaled as a whole to the browser window.
  Fictional demo content only: no real people, brands or photos.
-->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TODO ${title} - demo deck</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">

<style>
:root {
    --bg-primary: #0f172a;
    --text-primary: #f8fafc;
    --accent: #38bdf8;
    --text-muted: rgba(248, 250, 252, 0.64);
    --stage-bg: #020617;
    --slide-bg: var(--bg-primary);
    --font-display: 'Inter', Arial, sans-serif;
    --font-body: 'Inter', Arial, sans-serif;
    --pad-x: 120px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

/* ===========================================
   FIXED 16:9 STAGE: MANDATORY BASE STYLES
   (viewport-base.css from frontend-slides, included in full)
   =========================================== */
${viewport}

/* ===========================================
   TEMPLATE STYLES (authored at 1920x1080)
   =========================================== */
.slide { color: var(--text-primary); font-family: var(--font-body); padding: 120px var(--pad-x) 96px; }
.slide > * { position: relative; }
.eyebrow { font-size: 24px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); }
h1 { font-family: var(--font-display); font-size: 144px; line-height: 1.02; font-weight: 700; margin-top: 32px; }
h2 { font-family: var(--font-display); font-size: 80px; line-height: 1.1; font-weight: 700; }
p.lede { font-size: 36px; line-height: 1.4; color: var(--text-muted); margin-top: 40px; max-width: 1200px; }
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-top: 72px; }
.cols div { border-top: 4px solid var(--accent); padding-top: 24px; font-size: 32px; line-height: 1.4; }
.cols b { display: block; font-size: 56px; margin-bottom: 8px; }
.foot { position: absolute; left: var(--pad-x); right: var(--pad-x); bottom: 48px; display: flex; justify-content: space-between; font-size: 22px; color: var(--text-muted); }
</style>
</head>
<body>
<div class="deck-viewport">
<main class="deck-stage" id="deckStage" aria-live="polite">

    <section class="slide active visible" data-label="Cover">
        <p class="eyebrow">TODO eyebrow</p>
        <h1>TODO Cover title</h1>
        <p class="lede">TODO one line that sets up the talk. Use fictional names only.</p>
        <footer class="foot"><span>TODO deck label</span><span data-pagenum></span></footer>
    </section>

    <section class="slide" data-label="Content">
        <p class="eyebrow">TODO section</p>
        <h2>TODO Content slide title</h2>
        <div class="cols">
            <div><b>TODO</b>First point</div>
            <div><b>TODO</b>Second point</div>
            <div><b>TODO</b>Third point</div>
        </div>
        <footer class="foot"><span>TODO deck label</span><span data-pagenum></span></footer>
    </section>

    <section class="slide" data-label="Closing">
        <p class="eyebrow">TODO closing</p>
        <h2>TODO Closing title</h2>
        <p class="lede">TODO next steps or thank-you line.</p>
        <footer class="foot"><span>TODO deck label</span><span data-pagenum></span></footer>
    </section>

</main>
</div>

<script>
/* Stage scaling, paging (keys, wheel, click, swipe) and page counter. Keep as is, or extend. */
(function () {
    const stage = document.getElementById('deckStage');
    const slides = Array.from(stage.querySelectorAll(':scope > .slide'));
    let current = 0;

    const pad = (n) => String(n).padStart(2, '0');
    slides.forEach((s, i) => s.querySelectorAll('[data-pagenum]').forEach((el) => { el.textContent = pad(i + 1) + ' / ' + pad(slides.length); }));

    function fit() {
        const f = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        const x = (window.innerWidth - 1920 * f) / 2;
        const y = (window.innerHeight - 1080 * f) / 2;
        stage.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + f + ')';
    }
    fit();
    window.addEventListener('resize', fit);

    function show(i) {
        current = Math.max(0, Math.min(i, slides.length - 1));
        slides.forEach((s, n) => { s.classList.toggle('active', n === current); s.classList.toggle('visible', n === current); });
    }
    show(0);

    document.addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); show(current + 1); }
        else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); show(current - 1); }
        else if (e.key === 'Home') { e.preventDefault(); show(0); }
        else if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
    });
    /* One slide per wheel gesture: accumulate, then lock while trackpad inertia keeps firing */
    let acc = 0, last = 0, lockUntil = 0;
    window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return;
        e.preventDefault();
        const now = performance.now();
        if (now < lockUntil) { if (now - last < 120) lockUntil = Math.max(lockUntil, now + 250); last = now; return; }
        if (now - last > 200) acc = 0;
        last = now;
        acc += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (Math.abs(acc) >= 40) { show(current + (acc > 0 ? 1 : -1)); acc = 0; lockUntil = now + 650; }
    }, { passive: false });
    document.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        show(current + (e.clientX < window.innerWidth / 3 ? -1 : 1));
    });
    let x0 = null;
    document.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    });
})();
</script>
</body>
</html>
`;

const license = `MIT License

Copyright (c) ${year} TODO your name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

fs.mkdirSync(dir, { recursive: true });
const files = [
  [L.metaFile, JSON.stringify(meta, null, 2) + '\n'],
  [L.designFile, design],
  [L.htmlFile, html],
  ...(src.perTemplateLicense ? [[L.licenseFile, license]] : []),
];
for (const [name, text] of files) fs.writeFileSync(path.join(dir, name), text);

const relDir = path.relative(ROOT, dir);
console.log(`created ${relDir}${path.sep}`);
for (const [name] of files) console.log(`  ${name}`);
console.log(`
Next:
  1. Replace every TODO in those files (npm run validate lists what is left).
  2. Design the deck in ${path.join(relDir, L.htmlFile)} and describe it in ${L.designFile}.
  3. npm run screenshots -- --only ${slug}${opt.sources ? ` --sources ${opt.sources}` : ''}
  4. Add Chinese translations to src/i18n/zh.json, then npm run validate && npm test.
  See CONTRIBUTING.md.`);
