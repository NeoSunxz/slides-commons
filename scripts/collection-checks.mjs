// Stricter checks for templates that live inside this repository (sources with
// `collection: true`). Pure functions: they take the template record and file paths and
// return a list of problem strings, each naming the file and how to fix it.
// Used by scripts/build.mjs (and therefore by `npm run validate`).

import fs from 'node:fs';
import path from 'node:path';

// The one place that lists the licenses a contributed template may use.
// Each entry: SPDX id -> regexes that all must match the LICENSE file text (loose check).
export const ALLOWED_LICENSES = {
  'MIT': [/MIT License|Permission is hereby granted, free of charge/i, /Copyright/i],
  'Apache-2.0': [/Apache License/i, /Version 2\.0/i],
  'CC-BY-4.0': [/Creative Commons/i, /Attribution 4\.0/i],
  'CC0-1.0': [/CC0|Public Domain Dedication/i],
};

export const LIMITS = {
  htmlBytes: 1.5 * 1024 * 1024,        // template.html
  rasterDataUriBytes: 200 * 1024,      // all raster data: URIs together (abstract shapes only)
  screenshotBytes: 1.5 * 1024 * 1024,  // each screenshot
  screenshotCount: 3,
  screenshotSize: { width: 1920, height: 1080 },
};

export const TODO_RE = /\bTODO\b/;
const RASTER_EXT = 'png|jpe?g|gif|webp|avif|bmp|tiff?|ico';

const kb = (n) => `${Math.round(n / 1024)} KB`;

// A heading line (any level) matching `re`.
const hasHeading = (md, re) => md.split(/\r?\n/).some((l) => /^#{1,6}\s/.test(l) && re.test(l));

// Private (internal) sources: ctx.private. The quality rules stay (design.md sections, html size, screenshots,
// no TODO); the open-source rules are relaxed: license list, author URL, LICENSE text and the
// no-raster-images rule (a company template may carry its logo).
// `ctx`: { t, rel, html, htmlFile, designMd, designPath, designFile, screenshots, assets,
//          perTemplateLicense, licensePath, metaPath, metaExplicit }
export function checkCollectionTemplate(ctx) {
  const { t, rel } = ctx;
  const at = `${t.slug}:`;
  const out = [];

  // --- metadata: credit and license ------------------------------------------------------
  if (!ctx.private && !Object.hasOwn(ALLOWED_LICENSES, t.license)) {
    out.push(`${at} ${rel(ctx.metaPath)}: license "${t.license}" is not allowed for collection templates. Fix: set "license" to one of ${Object.keys(ALLOWED_LICENSES).join(', ')}.`);
  }
  if (ctx.perTemplateLicense) {
    if (!ctx.metaExplicit.authors) out.push(`${at} ${rel(ctx.metaPath)}: "authors" is required (this source credits each template's own author). Fix: add "authors": [{"name": "…", "url": "https://github.com/…"}].`);
    if (!ctx.metaExplicit.license) out.push(`${at} ${rel(ctx.metaPath)}: "license" is required (one of ${Object.keys(ALLOWED_LICENSES).join(', ')}).`);
  }
  for (const a of ctx.private ? [] : (t.authors ?? [])) {
    if (!/^https?:\/\//.test(a.url ?? '')) out.push(`${at} ${rel(ctx.metaPath)}: author "${a.name}" has no "url". Fix: add a link to the author's profile or site ("url": "https://…").`);
  }

  // --- LICENSE file ------------------------------------------------------------------------
  if (ctx.perTemplateLicense && !ctx.private) {
    if (!fs.existsSync(ctx.licensePath)) {
      out.push(`${at} ${rel(ctx.licensePath)} is missing. Fix: add the full text of the ${t.license} license as ${path.basename(ctx.licensePath)} in the template directory.`);
    } else {
      const text = fs.readFileSync(ctx.licensePath, 'utf8');
      const tests = ALLOWED_LICENSES[t.license];
      if (tests && !tests.every((re) => re.test(text))) {
        out.push(`${at} ${rel(ctx.licensePath)} does not look like the ${t.license} license declared in template.json. Fix: paste the standard ${t.license} text (or change "license").`);
      }
    }
  }

  // --- design.md ----------------------------------------------------------------------------
  const md = ctx.designMd;
  if (!hasHeading(md, /fixed[\s-]*stage/i)) out.push(`${at} ${rel(ctx.designPath)} has no heading about the fixed-stage policy. Fix: add a section such as "## Fixed-Stage Policy" (1920×1080 canvas scaled as a whole).`);
  if (!hasHeading(md, /\bCJK\b/)) out.push(`${at} ${rel(ctx.designPath)} has no CJK heading. Fix: add a section such as "## CJK & International Content" (font pairing, weights, line height).`);
  if (!hasHeading(md, /signature\s+(moves|treatments|elements)/i)) out.push(`${at} ${rel(ctx.designPath)} has no "Signature Moves" (or Treatments / Elements) heading. Fix: add that section listing what makes the style recognizable.`);

  // --- template.html -------------------------------------------------------------------------
  const htmlBytes = Buffer.byteLength(ctx.html);
  if (htmlBytes > LIMITS.htmlBytes) out.push(`${at} ${rel(ctx.htmlPath)} is ${kb(htmlBytes)}; the limit is ${kb(LIMITS.htmlBytes)}. Fix: remove embedded data or repeated markup.`);
  const bare = ctx.html.replace(/<!--[\s\S]*?-->/g, '');
  if (!ctx.private) {
  if (/<img\b/i.test(bare)) out.push(`${at} ${rel(ctx.htmlPath)} uses <img>. Fix: collection templates use abstract shapes only (CSS, inline SVG); no photos or raster images.`);
  const rasterRef = new RegExp(`(?:url\\(\\s*|\\bsrc\\s*=\\s*|\\bsrcset\\s*=\\s*)["']?(?!data:)[^"')\\s>]*\\.(?:${RASTER_EXT})\\b`, 'i');
  if (rasterRef.test(bare)) out.push(`${at} ${rel(ctx.htmlPath)} references a raster image file. Fix: draw it with CSS or inline SVG instead.`);
  let rasterData = 0;
  for (const m of bare.matchAll(/data:image\/(?:png|jpe?g|gif|webp|avif|bmp)[^"')\s]*/gi)) rasterData += m[0].length;
  if (rasterData > LIMITS.rasterDataUriBytes) out.push(`${at} ${rel(ctx.htmlPath)} embeds ${kb(rasterData)} of raster data: URIs; the limit is ${kb(LIMITS.rasterDataUriBytes)} in total. Fix: use CSS or inline SVG.`);
  for (const a of ctx.assets) {
    if (new RegExp(`\\.(?:${RASTER_EXT})$`, 'i').test(a)) out.push(`${at} asset ${a} is a raster image. Fix: remove it; collection templates use abstract shapes only.`);
  }
  }

  // --- screenshots ----------------------------------------------------------------------------
  const shots = ctx.screenshots;
  if (shots.length !== LIMITS.screenshotCount) {
    out.push(`${at} found ${shots.length} screenshot(s), need exactly ${LIMITS.screenshotCount} named ${t.slug}-1.png … ${t.slug}-3.png in ${rel(ctx.screenshotsDir)}. Fix: run \`npm run screenshots -- --only ${t.slug}\`.`);
  }
  for (const s of shots) {
    const name = rel(s.path);
    if (!/\.png$/i.test(s.file)) { out.push(`${at} ${name} must be a PNG.`); continue; }
    if (s.width !== LIMITS.screenshotSize.width || s.height !== LIMITS.screenshotSize.height) {
      out.push(`${at} ${name} is ${s.width}×${s.height}; it must be ${LIMITS.screenshotSize.width}×${LIMITS.screenshotSize.height}. Fix: regenerate with \`npm run screenshots -- --only ${t.slug}\`.`);
    }
    const bytes = fs.statSync(s.path).size;
    if (bytes > LIMITS.screenshotBytes) out.push(`${at} ${name} is ${kb(bytes)}; the limit is ${kb(LIMITS.screenshotBytes)} each. Fix: simplify the slide or quantize the PNG.`);
  }

  // --- leftover scaffold placeholders -----------------------------------------------------------
  const todoFiles = [
    [ctx.metaPath, fs.readFileSync(ctx.metaPath, 'utf8')],
    [ctx.designPath, md],
    [ctx.htmlPath, ctx.html],
    ...(ctx.perTemplateLicense && !ctx.private && fs.existsSync(ctx.licensePath) ? [[ctx.licensePath, fs.readFileSync(ctx.licensePath, 'utf8')]] : []),
  ];
  for (const [p, text] of todoFiles) {
    const line = text.split(/\r?\n/).findIndex((l) => TODO_RE.test(l));
    if (line >= 0) out.push(`${at} ${rel(p)}:${line + 1} still contains a TODO placeholder from the scaffold. Fix: replace every TODO with real content.`);
  }
  return out;
}
