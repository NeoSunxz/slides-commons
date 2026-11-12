#!/usr/bin/env node
// Standalone validation: the same checks the build runs before it writes anything.
//
//   node scripts/validate.mjs [--sources <file>] [--i18n-dir <dir>] [--site-url <url>]
//   (env: SC_SOURCES, SC_I18N_DIR, SC_SITE_URL; see scripts/build.mjs)
//
// Checks: sources.json, template.json schema, unique slugs across sources, license and
// author present, back-link to the original directory, at least one screenshot,
// design.md with a front matter description, and a static scan of every template's HTML
// and CSS for subresources outside the host whitelist. All problems are reported at once;
// the exit code is 1 if there are any.

import { loadAndCheck, BuildError, rel, SOURCES_FILE } from './build.mjs';

try {
  const { sources, templates, problems } = loadAndCheck();
  if (problems.length) {
    console.error(`validation failed: ${problems.length} problem(s)\n- ${problems.join('\n- ').replace(/\n  - /g, '\n    - ')}`);
    process.exit(1);
  }
  console.log(`ok: ${templates.length} template(s) from ${sources.length} source(s) (${rel(SOURCES_FILE)}) passed all checks`);
} catch (e) {
  if (e instanceof BuildError) {
    console.error(`validation failed: ${e.message}`);
    process.exit(1);
  }
  throw e;
}
