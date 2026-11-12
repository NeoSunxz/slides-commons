// Static checks of .github/workflows/*.yml (text only, no YAML dependency).
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { ROOT } from './helpers.mjs';

const DIR = path.join(ROOT, '.github', 'workflows');
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f)) : [];
const strip = (t) => t.replace(/^\s*#.*$/gm, '').replace(/\s+#.*$/gm, '');
const read = (f) => strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
const ci = files.find((f) => /^\s*pull_request\s*:/m.test(read(f)) || /^\s*on:[\s\S]{0,200}pull_request\b/m.test(read(f)));
const pages = files.find((f) => f !== ci && /deploy-pages|configure-pages|upload-pages-artifact|pages:\s*write/.test(read(f)));

test.describe('GitHub Actions workflows', () => {
  test.skip(files.length === 0, `no workflow files yet: ${path.relative(ROOT, DIR)} does not exist or is empty (builder has not created them)`);

  test('a CI workflow and a Pages workflow exist', () => {
    expect(ci, `no workflow with a pull_request trigger among ${files}`).toBeTruthy();
    expect(pages, `no Pages deployment workflow among ${files}`).toBeTruthy();
  });

  test('no pull_request_target anywhere', () => {
    for (const f of files) expect(read(f), f).not.toMatch(/pull_request_target/);
  });

  test('CI triggers on pull_request for dev and main', () => {
    const t = read(ci);
    const m = t.match(/pull_request\s*:\s*\n((?:[ \t]+.*\n?){1,12})/) ?? t.match(/pull_request\s*:\s*\{([^}]*)\}/);
    expect(m, 'pull_request trigger block').toBeTruthy();
    const block = m[1];
    expect(block, 'branches under pull_request').toMatch(/branches/);
    expect(block).toMatch(/\bdev\b/);
    expect(block).toMatch(/\bmain\b/);
  });

  test('every uses: is pinned to a 40-hex commit SHA (local actions excluded)', () => {
    const bad = [];
    for (const f of files) for (const m of read(f).matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)) {
      const ref = m[1].replace(/['"]/g, '');
      if (ref.startsWith('./')) continue;
      if (!/@[0-9a-f]{40}$/.test(ref)) bad.push(`${f}: ${ref}`);
    }
    expect(bad).toEqual([]);
    expect(files.some((f) => /uses:/.test(read(f)))).toBe(true);
  });

  test('every checkout has submodules: recursive and persist-credentials: false', () => {
    const bad = [];
    let seen = 0;
    for (const f of files) {
      const t = read(f);
      for (const m of t.matchAll(/uses:\s*actions\/checkout@[^\n]*\n((?:[ \t]+.*\n?){0,10})/g)) {
        seen++;
        const w = m[1].split(/\n\s*-\s+(?:name|uses|run)\b/)[0]; // this step's with: block only
        if (!/submodules:\s*['"]?recursive['"]?/.test(w)) bad.push(`${f}: checkout without submodules: recursive`);
        if (!/persist-credentials:\s*['"]?false['"]?/.test(w)) bad.push(`${f}: checkout without persist-credentials: false`);
      }
    }
    expect(seen, 'checkout steps found').toBeGreaterThan(0);
    expect(bad).toEqual([]);
  });

  test('permissions are declared at the top level of both files', () => {
    for (const f of files) expect(read(f), `${f}: top-level permissions`).toMatch(/^permissions\s*:/m);
  });

  test('Pages workflow: SC_SITE_URL built from owner/repo; pages: write and id-token: write only there', () => {
    const p = read(pages);
    // SC_SITE_URL is either assigned from the github context directly, or computed in a step from
    // env vars that come from github.repository_owner and the repository name, then exported.
    const direct = /SC_SITE_URL\s*:.*github\.repository(_owner)?\b/.test(p);
    const computed = /github\.repository_owner/.test(p) && /github\.(event\.repository\.name|repository)\b/.test(p)
      && /https:\/\/\$\{?\w+\}?\.github\.io\/\$\{?\w+\}?\//.test(p) && /SC_SITE_URL=.*>>\s*"?\$GITHUB_ENV"?/.test(p);
    expect(direct || computed, 'SC_SITE_URL built from owner/repo').toBe(true);
    expect(p, 'a build step runs with the URL set').toMatch(/node scripts\/build\.mjs|npm run build/);
    expect(p).toMatch(/pages\s*:\s*write/);
    expect(p).toMatch(/id-token\s*:\s*write/);
    for (const f of files.filter((x) => x !== pages)) {
      expect(read(f), `${f} must not have pages: write`).not.toMatch(/pages\s*:\s*write/);
      expect(read(f), `${f} must not have id-token: write`).not.toMatch(/id-token\s*:\s*write/);
    }
  });

  test('ci.yml does not use secrets, and does not use the Pages action or SC_SITE_URL deployment', () => {
    const t = read(ci);
    expect(t).not.toMatch(/\bsecrets\./);
    expect(t).not.toMatch(/deploy-pages|configure-pages/);
  });
});
