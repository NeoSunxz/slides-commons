// Clean build. Runs in the "build" project, before every other test.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, SITE, SLUG } from './helpers.mjs';

function npmRun(script, env = {}) {
  // Prefer the npm that launched `npm test` (cross-platform, no shell); fall back to `npm` on PATH.
  const npmCli = process.env.npm_execpath;
  const opts = { cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', ...env } };
  if (npmCli && /\.(c?js|mjs)$/.test(npmCli)) return spawnSync(process.execPath, [npmCli, 'run', script], opts);
  return spawnSync('npm', ['run', script], { ...opts, shell: process.platform === 'win32' });
}

test('npm run build exits 0 from a clean state and emits the expected files', async () => {
  fs.rmSync(SITE, { recursive: true, force: true });
  expect(fs.existsSync(SITE)).toBe(false);

  const t0 = Date.now();
  const r = npmRun('build');
  test.info().annotations.push({ type: 'build-ms', description: String(Date.now() - t0) });
  test.info().annotations.push({ type: 'build-output', description: `${r.stdout}\n${r.stderr}`.trim() });
  expect(r.status, `build output:\n${r.stdout}\n${r.stderr}`).toBe(0);
  expect(r.stderr, 'build printed warnings/errors on stderr').not.toMatch(/warning|error/i);

  for (const rel of [
    'index.html',
    'credits.html',
    path.join('t', SLUG, 'index.html'),
    path.join('preview', SLUG, 'template.html'),
    path.join('zip', `${SLUG}.zip`),
  ]) {
    const p = path.join(SITE, rel);
    expect(fs.existsSync(p), `missing site/${rel}`).toBe(true);
    expect(fs.statSync(p).size, `empty site/${rel}`).toBeGreaterThan(0);
  }
});
