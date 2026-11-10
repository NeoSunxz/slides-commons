// Fixture builds, --out guard and serve.mjs binding (no browser needed).
// Fixture builds write to the OS temp dir via --out; they never touch site/.
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, SLUG, TESTS, makeTempDir, readZip } from './helpers.mjs';

const BUILD = path.join(ROOT, 'scripts', 'build.mjs');
const FIX = path.join(TESTS, 'fixtures');

function build(args, { cwd = ROOT, script = BUILD, env = {} } = {}) {
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', ...env },
  });
  return { status: r.status, out: `${r.stdout}\n${r.stderr}`.trim() };
}

const tmpDirs = [];
function tmp(prefix) { const d = makeTempDir(prefix); tmpDirs.push(d); return d; }
test.afterAll(() => { for (const d of tmpDirs) fs.rmSync(d, { recursive: true, force: true }); });

test.describe('fixture builds (--sources / --out)', () => {
  test('duplicate slug across two sources fails clearly', async () => {
    const out = path.join(tmp('sc-dup-'), 'site');
    const r = build(['--sources', path.join(FIX, 'sources-duplicate.json'), '--out', out]);
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toMatch(/duplicate slug "neo-grid-bold"/);
    expect(r.out).toMatch(/up-a/);
    expect(r.out).toMatch(/up-b/);
  });

  test('schema violation fails and names the fields', async () => {
    const out = path.join(tmp('sc-schema-'), 'site');
    const r = build(['--sources', path.join(FIX, 'sources-bad-schema.json'), '--out', out]);
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toMatch(/schema/i);
    expect(r.out).toMatch(/missing required "tagline"/);
    expect(r.out).toMatch(/slide_count: expected integer, got string/);
  });

  test('unknown slug in include fails', async () => {
    const out = path.join(tmp('sc-incl-'), 'site');
    const r = build(['--sources', path.join(FIX, 'sources-unknown-include.json'), '--out', out]);
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toMatch(/unknown template\(s\): no-such-template/);
  });

  test('env vars SC_SOURCES / SC_OUT work like the CLI flags', async () => {
    const out = path.join(tmp('sc-env-'), 'site');
    const r = build([], { env: { SC_SOURCES: path.join(FIX, 'sources-unknown-include.json'), SC_OUT: out } });
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toMatch(/no-such-template/);
  });

  test('valid two-template fixture builds both detail pages and zips', async () => {
    const out = path.join(tmp('sc-two-'), 'site');
    const r = build(['--sources', path.join(FIX, 'sources-two.json'), '--out', out]);
    expect(r.status, r.out).toBe(0);
    expect(r.out).toMatch(/built 2 template/);
    for (const slug of ['neo-grid-bold', 'coral']) {
      expect(fs.existsSync(path.join(out, 't', slug, 'index.html')), `${slug} detail page`).toBe(true);
      const zip = path.join(out, 'zip', `${slug}.zip`);
      expect(fs.existsSync(zip), `${slug} zip`).toBe(true);
      const { entries, problems } = readZip(fs.readFileSync(zip));
      expect(problems, `${slug} zip integrity`).toEqual([]);
      const names = entries.map((e) => e.name);
      for (const f of ['template.html', 'design.md', 'LICENSE-templates', 'LICENSE-skill', 'PROMPT.md', 'PROMPT.zh.md']) {
        expect(names, `${slug} zip`).toContain(`${slug}/${f}`);
      }
    }
    expect(fs.existsSync(path.join(ROOT, 'site', 't', 'coral')), 'fixture build leaked into repo site/').toBe(false);
  });

  test('zips are reproducible with fixed 1980-01-01 timestamps', async () => {
    const a = path.join(tmp('sc-repro-a-'), 'site');
    const b = path.join(tmp('sc-repro-b-'), 'site');
    const env = { SOURCE_DATE_EPOCH: '' };
    const ra = build(['--out', a], { env });
    // A different wall-clock second for the second build.
    await new Promise((res) => setTimeout(res, 1100));
    const rb = build(['--out', b], { env });
    expect(ra.status, ra.out).toBe(0);
    expect(rb.status, rb.out).toBe(0);
    const za = fs.readFileSync(path.join(a, 'zip', `${SLUG}.zip`));
    const zb = fs.readFileSync(path.join(b, 'zip', `${SLUG}.zip`));
    expect(za.equals(zb), 'zip bytes differ between two builds').toBe(true);

    // Every central-directory entry carries DOS date 1980-01-01 00:00.
    const dates = new Set();
    for (let i = 0; i + 4 <= za.length; i++) {
      if (za.readUInt32LE(i) === 0x02014b50) dates.add(`${za.readUInt16LE(i + 14)}/${za.readUInt16LE(i + 12)}`);
    }
    expect([...dates]).toEqual([`${(0 << 9) | (1 << 5) | 1}/0`]);
  });

  test('SOURCE_DATE_EPOCH sets the zip timestamp and stays reproducible', async () => {
    const env = { SOURCE_DATE_EPOCH: String(Date.UTC(2026, 0, 2, 3, 4, 6) / 1000) };
    const a = path.join(tmp('sc-epoch-a-'), 'site');
    const b = path.join(tmp('sc-epoch-b-'), 'site');
    expect(build(['--out', a], { env }).status).toBe(0);
    expect(build(['--out', b], { env }).status).toBe(0);
    const za = fs.readFileSync(path.join(a, 'zip', `${SLUG}.zip`));
    expect(za.equals(fs.readFileSync(path.join(b, 'zip', `${SLUG}.zip`)))).toBe(true);
    const i = za.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    const date = za.readUInt16LE(i + 14);
    expect({ y: (date >> 9) + 1980, m: (date >> 5) & 15, d: date & 31 }).toEqual({ y: 2026, m: 1, d: 2 });
  });
});

// --out guard. Probed against a throwaway copy of scripts/ + src/ + the minimal fixture
// in the OS temp dir, so a missing guard can only ever delete files in that copy.
test.describe('--out guard', () => {
  function sandboxRepo() {
    const root = tmp('sc-guard-');
    fs.cpSync(path.join(ROOT, 'scripts'), path.join(root, 'scripts'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'src'), path.join(root, 'src'), { recursive: true });
    fs.cpSync(path.join(FIX, 'minimal-src'), path.join(root, 'tests', 'fixtures', 'minimal-src'), { recursive: true });
    fs.copyFileSync(path.join(FIX, 'sources-minimal.json'), path.join(root, 'sources-minimal.json'));
    for (const d of ['.git', 'upstream', 'node_modules']) {
      fs.mkdirSync(path.join(root, d), { recursive: true });
      fs.writeFileSync(path.join(root, d, 'keep.txt'), 'keep');
    }
    fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}\n');
    return root;
  }
  const sentinels = (root) => [
    path.join('scripts', 'build.mjs'), path.join('src', 'pages.mjs'), path.join('.git', 'keep.txt'),
    path.join('upstream', 'keep.txt'), path.join('node_modules', 'keep.txt'),
    path.join('tests', 'fixtures', 'minimal-src', 'LICENSE'), 'package.json', 'sources-minimal.json',
  ].filter((p) => fs.existsSync(path.join(root, p)));

  test('sanity: a normal --out inside the copy builds', async () => {
    const root = sandboxRepo();
    const r = build(['--sources', 'sources-minimal.json', '--out', 'site-alt'], { cwd: root, script: path.join(root, 'scripts', 'build.mjs') });
    expect(r.status, r.out).toBe(0);
    expect(fs.existsSync(path.join(root, 'site-alt', 't', 'fixture-ok', 'index.html'))).toBe(true);
  });

  for (const target of ['.', 'src', 'scripts', '.git', 'upstream', 'node_modules', 'tests', path.join('tests', 'fixtures', 'minimal-src')]) {
    test(`--out ${target} is refused and nothing is deleted`, async () => {
      const root = sandboxRepo();
      const before = sentinels(root);
      const r = build(['--sources', 'sources-minimal.json', '--out', target], { cwd: root, script: path.join(root, 'scripts', 'build.mjs') });
      const missing = before.filter((p) => !fs.existsSync(path.join(root, p)));
      expect.soft(missing, `files deleted by --out ${target}`).toEqual([]);
      expect.soft(r.status, `--out ${target} was accepted:\n${r.out}`).not.toBe(0);
      if (r.status !== 0) expect.soft(r.out).toMatch(/refusing/);
    });
  }
});

test('serve.mjs binds to 127.0.0.1 by default', async () => {
  const lan = Object.values(os.networkInterfaces()).flat()
    .find((i) => i && i.family === 'IPv4' && !i.internal)?.address;
  const port = 4300 + Math.floor(Math.random() * 500);
  const env = { ...process.env, PORT: String(port) };
  delete env.HOST;
  const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'serve.mjs')], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise((res, rej) => {
      child.stdout.once('data', res);
      child.once('exit', (c) => rej(new Error(`serve exited ${c}`)));
    });
    const tryConnect = (host) => new Promise((res) => {
      const s = net.connect({ host, port, timeout: 1500 }, () => { s.destroy(); res(true); });
      s.on('error', () => res(false));
      s.on('timeout', () => { s.destroy(); res(false); });
    });
    expect(await tryConnect('127.0.0.1')).toBe(true);
    if (lan) expect(await tryConnect(lan), `reachable on LAN address ${lan}`).toBe(false);
    else test.info().annotations.push({ type: 'note', description: 'no non-loopback IPv4 interface; LAN check skipped' });
  } finally {
    child.kill();
  }
});
