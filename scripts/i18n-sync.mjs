#!/usr/bin/env node
// Record which English text the Chinese translations were made from.
//
//   node scripts/i18n-sync.mjs
//
// Writes src/i18n/zh.sources.json: for every translated field of every loaded template, a
// short sha256 hash of the current English source string. Run it ONLY after a translator
// or maintainer has confirmed that src/i18n/zh.json matches the current English text;
// afterwards the build and validate warn about every field whose English source changes.

import fs from 'node:fs';
import { loadAndCheck, buildContext, BuildError } from './build.mjs';
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
} catch (e) {
  if (e instanceof BuildError) { console.error(`i18n-sync failed: ${e.message}`); process.exit(1); }
  throw e;
}
