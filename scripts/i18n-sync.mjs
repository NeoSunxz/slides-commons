#!/usr/bin/env node
// Record which English text the Chinese translations were made from.
//
//   node scripts/i18n-sync.mjs [--i18n-dir <dir>]   (or SC_I18N_DIR; default src/i18n)
//
// Writes zh.sources.json next to zh.json (src/i18n/ by default): for every translated field of every loaded template, a
// short sha256 hash of the current English source string. Run it ONLY after a translator
// or maintainer has confirmed that src/i18n/zh.json matches the current English text;
// afterwards the build and validate warn about every field whose English source changes.

import fs from 'node:fs';
import path from 'node:path';
import { loadAndCheck, buildContext, BuildError, EXTRA_SOURCE_FILES, extraI18nDir } from './build.mjs';
import { FIELDS, ZH_FILE, ZH_SOURCES_FILE, hash12, sourceStrings } from './i18n.mjs';

try {
  const { templates } = loadAndCheck({ strictScreenshots: false });
  const zh = JSON.parse(fs.readFileSync(ZH_FILE, 'utf8'));
  const out = {};
  let fields = 0;
  for (const t of templates.sort((a, b) => a.slug.localeCompare(b.slug))) {
    const tr = zh.templates?.[t.slug];
    if (!tr) continue;
    const src = sourceStrings(t, buildContext(t).ctx.description);
    out[t.slug] = {};
    for (const f of FIELDS) {
      if (src[f] && tr[f] !== undefined) { out[t.slug][f] = hash12(src[f]); fields++; }
    }
  }
  fs.writeFileSync(ZH_SOURCES_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(`wrote ${ZH_SOURCES_FILE}: ${fields} field hash(es) for ${Object.keys(out).length} template(s)`);
  // Extra sources with their own <dir>/i18n/zh.json: hashes of their translated templates.
  for (const f of EXTRA_SOURCE_FILES) {
    const dir = extraI18nDir(f);
    const zf = path.join(dir, 'zh.json');
    if (!fs.existsSync(zf)) continue;
    const ezh = JSON.parse(fs.readFileSync(zf, 'utf8'));
    const eout = {};
    let n = 0;
    for (const t of templates.filter((x) => ezh.templates?.[x.slug])) {
      const src = sourceStrings(t, buildContext(t).ctx.description);
      eout[t.slug] = {};
      for (const fld of FIELDS) if (src[fld] && ezh.templates[t.slug][fld] !== undefined) { eout[t.slug][fld] = hash12(src[fld]); n++; }
    }
    const target = path.join(dir, 'zh.sources.json');
    fs.writeFileSync(target, JSON.stringify(eout, null, 2) + '\n');
    console.log(`wrote ${target}: ${n} field hash(es) for ${Object.keys(eout).length} template(s)`);
  }
} catch (e) {
  if (e instanceof BuildError) { console.error(`i18n-sync failed: ${e.message}`); process.exit(1); }
  throw e;
}
