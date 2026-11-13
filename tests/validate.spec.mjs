// `npm run validate` and its failure modes, with fixtures under tests/fixtures/ (nothing is built).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, TESTS } from './helpers.mjs';

const FIX = path.join(TESTS, 'fixtures');
const VALIDATE = path.join(ROOT, 'scripts', 'validate.mjs');

function validate(args = []) {
  const r = spawnSync(process.execPath, [VALIDATE, ...args], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '' } });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}`.trim() };
}

test('npm run validate exits 0 on the real sources', async () => {
  const npmCli = process.env.npm_execpath;
  const opts = { cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '' } };
  const r = npmCli && /\.(c?js|mjs)$/.test(npmCli)
    ? spawnSync(process.execPath, [npmCli, 'run', 'validate'], opts)
    : spawnSync('npm', ['run', 'validate'], { ...opts, shell: process.platform === 'win32' });
  expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
  expect(r.stdout).toMatch(/ok: 34 template\(s\)/);
});

test('validate leaves the repo untouched (site/ is not written)', async () => {
  const marker = path.join(ROOT, 'site', 'index.html');
  const before = fs.existsSync(marker) ? fs.statSync(marker).mtimeMs : null;
  expect(validate().status).toBe(0);
  const after = fs.existsSync(marker) ? fs.statSync(marker).mtimeMs : null;
  expect(after).toBe(before);
});

test('clean fixture source passes (baseline for the failing fixtures)', async () => {
  const r = validate(['--sources', path.join(FIX, 'sources-valid-fixture.json')]);
  expect(r.status, r.out).toBe(0);
});

test('non-whitelisted host in a template is reported with slug and host', async () => {
  const r = validate(['--sources', path.join(FIX, 'sources-badhost.json')]);
  expect(r.status, r.out).not.toBe(0);
  expect(r.out).toMatch(/bad-host/);
  expect(r.out).toMatch(/non-whitelisted host/);
  expect(r.out).toMatch(/evil\.example\.com/);
  expect(r.out, 'a whitelisted host must not be reported').not.toMatch(/fonts\.googleapis\.com/);
});

test('duplicate slug across sources is reported', async () => {
  const r = validate(['--sources', path.join(FIX, 'sources-duplicate.json')]);
  expect(r.status, r.out).not.toBe(0);
  expect(r.out).toMatch(/duplicate slug "neo-grid-bold"/);
});

test('missing license is reported (source level)', async () => {
  const r = validate(['--sources', path.join(FIX, 'sources-nolicense.json')]);
  expect(r.status, r.out).not.toBe(0);
  expect(r.out).toMatch(/license/);
});

test('empty license on a template is reported with its slug', async () => {
  const r = validate(['--sources', path.join(FIX, 'sources-emptylicense.json')]);
  expect(r.status, r.out).not.toBe(0);
  expect(r.out).toMatch(/empty-license/);
  expect(r.out).toMatch(/license/);
});

test('all problems are listed in one run, not just the first', async () => {
  const r = validate(['--sources', path.join(FIX, 'sources-multi.json')]);
  expect(r.status, r.out).not.toBe(0);
  expect(r.out).toMatch(/bad-host[\s\S]*non-whitelisted host/);
  expect(r.out).toMatch(/empty-license[\s\S]*license/);
  expect(r.out).toMatch(/\d+ problem\(s\)/);
});
