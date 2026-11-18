// "Overlay" sources: a read-only upstream (typically a git submodule) that is not organised as
// templates/<slug>/{template.json,design.md,screenshots}. sources.json maps each template onto
// files of the upstream (`overlay.templates.<slug>`), while the metadata, screenshots and demo
// slides live in this repository (`overlay.metaDir`). Nothing here writes into the upstream.
//
// Shared by scripts/build.mjs (site preview) and scripts/screenshots.mjs (same page, no bridge).

import fs from 'node:fs';
import path from 'node:path';

const POSIX = (p) => p.split('/');

export const metaDirOf = (root, src) => path.join(root, ...POSIX(src.overlay.metaDir));
export const metaFileOf = (root, src, slug) => path.join(metaDirOf(root, src), `${slug}.json`);
export const screenshotsDirOf = (root, src) => path.join(metaDirOf(root, src), 'screenshots');

// The template page as the gallery previews it. Only the preview copy changes (never the zip,
// never the upstream file):
//  * demo slides: some upstream templates ship without slides, so the slides listed in
//    `preview.slides` are inserted at `preview.replace`;
//  * inlineModules: `import('./assets/x.js')` of a local file becomes a data: URI import (a
//    sandboxed frame has an opaque origin and could not fetch the file);
//  * replaceScripts: remote <script src> tags are replaced by an inline script, so the preview
//    makes no request to hosts outside the whitelist.
// Returns { html, notes: [string] }.
export function overlayPreviewHtml(html, { entry, srcDir, root }) {
  const p = entry.preview ?? {};
  const notes = [];
  let out = html;

  if (p.slides) {
    const slides = fs.readFileSync(path.join(root, ...POSIX(p.slides)), 'utf8');
    const re = new RegExp(p.replace ?? '', 'i');
    if (!p.replace || !re.test(out)) throw new Error(`preview.replace does not match ${entry.html}`);
    out = out.replace(re, (_, a, b) => `${a}\n${slides}\n${b}`);
    notes.push('demo slides inserted');
  }

  for (const rel of p.inlineModules ?? []) {
    const file = path.join(srcDir, ...POSIX(rel));
    const b64 = fs.readFileSync(file).toString('base64');
    const base = rel.split('/').pop();
    const re = new RegExp(`import\\(\\s*(["'])(?:\\./)?${rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1\\s*\\)`, 'g');
    let n = 0;
    out = out.replace(re, () => { n++; return `import('data:text/javascript;base64,${b64}')`; });
    if (!n) throw new Error(`preview.inlineModules: no import of ${rel} found in ${entry.html}`);
    notes.push(`${base} inlined`);
  }

  for (const r of p.replaceScripts ?? []) {
    const esc = r.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`<script\\b[^>]*\\bsrc\\s*=\\s*["']${esc}["'][^>]*>\\s*</script>`, 'gi');
    let n = 0;
    out = out.replace(re, () => { n++; return `<script>/* slides-commons preview: ${r.src} is not loaded here */${r.with}</script>`; });
    if (!n) throw new Error(`preview.replaceScripts: ${r.src} not found in ${entry.html}`);
    notes.push(`${r.src} replaced`);
  }
  // The preview frame is sandboxed without allow-same-origin: reading localStorage throws a
  // SecurityError, which aborts template scripts that use it unguarded (the deck would never
  // get its key handlers). Give such scripts an in-memory localStorage, installed first in <head>.
  const shim = '<script>/* slides-commons preview: the sandboxed frame has no localStorage; use an in-memory one */' +
    'try{window.localStorage.getItem("x")}catch(e){var __m={};try{Object.defineProperty(window,"localStorage",{configurable:true,value:{' +
    'getItem:function(k){return Object.prototype.hasOwnProperty.call(__m,k)?__m[k]:null},setItem:function(k,v){__m[k]=String(v)},' +
    'removeItem:function(k){delete __m[k]},clear:function(){__m={}},key:function(i){return Object.keys(__m)[i]||null},' +
    'get length(){return Object.keys(__m).length}}})}catch(e2){}}</script>\n';
  const head = out.match(/<head\b[^>]*>/i);
  out = head ? out.slice(0, head.index + head[0].length) + '\n' + shim + out.slice(head.index + head[0].length) : shim + out;
  notes.push('localStorage shim');
  return { html: out, notes };
}

const insideDir = (parent, child) => {
  const r = path.relative(parent, child);
  return r === '' || (!r.startsWith('..') && !path.isAbsolute(r));
};

// Local sibling scripts and stylesheets are inlined into the preview copy: the preview runs in an
// iframe with sandbox="allow-scripts" (opaque origin), and under file:// Chrome refuses to load local
// subresources into such a frame. Inlining makes the preview work over http and file://.
// Remote URLs (font CSS, CDNs) are left as they are.
export const isLocalRef = (ref) => ref && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(ref.trim());

// `root` bounds what may be read (default: dir). Templates that ship at their upstream path
// (overlay `keepPaths`) reference shared files above their own directory (../../assets/x.css).
function readLocalRef(dir, ref, slug, root, warn) {
  let rel;
  try { rel = decodeURI(ref.trim().split(/[?#]/)[0]); } catch { return null; }
  const file = path.resolve(dir, ...rel.split('/'));
  if (!insideDir(root, file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    warn(`${slug}: preview cannot inline ${ref} (not a file inside the template directory)`);
    return null;
  }
  return fs.readFileSync(file, 'utf8');
}

export const attrValue = (attrs, name) => {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
};

export function inlineLocalAssets(html, dir, slug, root = dir, warn = (m) => console.warn(`warning: ${m}`)) {
  let out = html.replace(/<script\b([^>]*)>\s*<\/script\s*>/gi, (tag, attrs) => {
    const src = attrValue(attrs, 'src');
    if (!isLocalRef(src)) return tag;
    const code = readLocalRef(dir, src, slug, root, warn);
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
    const css = readLocalRef(dir, href, slug, root, warn);
    if (css == null) return tag;
    const media = attrValue(tag, 'media');
    const safe = css.replace(/<\/style/gi, '<\\/style');
    return `<style${media ? ` media="${media.replace(/"/g, '&quot;')}"` : ''} data-inlined-from="${href.replace(/"/g, '&quot;')}">\n${safe}\n</style>`;
  });
  return out;
}

