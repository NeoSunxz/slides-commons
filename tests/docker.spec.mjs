// Docker image smoke tests (Dockerfile, docker/entrypoint.sh, docker/nginx.conf).
//
// NOT part of the default `npm test`: every test here is skipped unless SC_DOCKER_TESTS=1 is set, and also
// when the `docker` CLI / daemon is not usable. A full run builds the image (several minutes the first time)
// and starts three containers that each build the site at start-up.
//
//   SC_DOCKER_TESTS=1 npx playwright test -c tests docker.spec.mjs
//
// Environment
//   SC_DOCKER_TESTS=1            enable
//   SC_DOCKER_NGINX_IMAGE=...    --build-arg NGINX_IMAGE (default nginx:latest; the Dockerfile's own default,
//                                nginx:stable-bookworm, cannot be pulled on some machines)
//   SC_DOCKER_IMAGE=<tag>        use an image that is already built instead of building one
// Needs the upstream submodules checked out (they are part of the build context). Nothing is written in the
// repo; the image and the containers are removed afterwards (an image given by SC_DOCKER_IMAGE is kept).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT, makeTempDir, readZip } from './helpers.mjs';

const ENABLED = process.env.SC_DOCKER_TESTS === '1';
const dockerOk = ENABLED && (() => {
  try { return spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], { encoding: 'utf8', timeout: 20_000 }).status === 0; } catch { return false; }
})();
test.skip(!ENABLED, 'Docker tests are opt-in: set SC_DOCKER_TESTS=1');
test.skip(ENABLED && !dockerOk, 'the docker CLI / daemon is not available');

test.describe.configure({ mode: 'serial' });
test.setTimeout(10 * 60_000);

const EXAMPLE = path.join(ROOT, 'examples', 'private-source');
const NGINX_IMAGE = process.env.SC_DOCKER_NGINX_IMAGE || 'nginx:latest';
const PREBUILT = process.env.SC_DOCKER_IMAGE || '';
const IMAGE = PREBUILT || `slides-commons-test:${process.pid}`;
const NAME = `sc-test-${process.pid}`;

const docker = (args, opts = {}) => spawnSync('docker', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
const started = [];
const tmps = [];
const tmp = (p) => { const d = makeTempDir(p); tmps.push(d); fs.chmodSync(d, 0o755); return d; };

test.afterAll(() => {
  if (!dockerOk) return;
  for (const c of started) docker(['rm', '-f', c]);
  if (!PREBUILT) docker(['rmi', '-f', IMAGE]);
  for (const d of tmps) fs.rmSync(d, { recursive: true, force: true });
});

test('the image builds (--build-arg NGINX_IMAGE) from the repository, submodules included', async () => {
  if (PREBUILT) { expect(docker(['image', 'inspect', IMAGE]).status, `image ${IMAGE} not found`).toBe(0); return; }
  for (const d of ['upstream/templates', 'upstream/skill']) expect(fs.readdirSync(path.join(ROOT, d)).length, `${d} must be checked out`).toBeGreaterThan(0);
  const code = await new Promise((resolve) => {
    const c = spawn('docker', ['build', '--build-arg', `NGINX_IMAGE=${NGINX_IMAGE}`, '-t', IMAGE, ROOT], { stdio: ['ignore', 'pipe', 'pipe'] });
    let tail = '';
    for (const s of [c.stdout, c.stderr]) s.on('data', (d) => { tail = (tail + d).slice(-4000); });
    c.on('close', (status) => { if (status !== 0) console.error(tail); resolve(status); });
  });
  expect(code, 'docker build failed (output tail above)').toBe(0);
});

/** Start a container publishing port 80 on a random loopback port; resolves once /healthz answers. */
async function start(name, { env = {}, mounts = [] } = {}) {
  const args = ['run', '-d', '--name', `${NAME}-${name}`, '-p', '127.0.0.1::80'];
  for (const [k, v] of Object.entries(env)) args.push('-e', `${k}=${v}`);
  for (const m of mounts) args.push('-v', m);
  args.push(IMAGE);
  const r = docker(args);
  expect(r.status, r.stderr).toBe(0);
  const id = `${NAME}-${name}`;
  started.push(id);
  const port = Number(docker(['port', id, '80/tcp']).stdout.trim().split('\n')[0].split(':').pop());
  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 5 * 60_000;
  for (;;) {
    const state = docker(['inspect', '-f', '{{.State.Status}}', id]).stdout.trim();
    if (state !== 'running') throw new Error(`container ${id} is ${state}:\n${docker(['logs', id]).stdout}${docker(['logs', id]).stderr}`);
    try { const h = await fetch(`${base}/healthz`, { signal: AbortSignal.timeout(3000) }); if (h.ok) break; } catch { /* not up yet */ }
    if (Date.now() > deadline) throw new Error(`container ${id}: /healthz never answered:\n${docker(['logs', id]).stdout}`);
    await new Promise((r2) => setTimeout(r2, 2000));
  }
  return { id, base };
}
const get = async (url, init) => { const r = await fetch(url, init); return { status: r.status, headers: r.headers, buf: Buffer.from(await r.arrayBuffer()) }; };
const text = (r) => r.buf.toString('utf8');

test('public build: /, /healthz, a zip (valid, with the site URL in its prompt), zh pages, kits, gzip, non-root', async () => {
  const SITE_URL = 'http://slides.test/';
  const c = await start('public', { env: { SC_SITE_URL: SITE_URL } });
  const home = await get(`${c.base}/`);
  expect(home.status).toBe(200);
  expect(text(home)).toContain('slides-commons');
  const hz = await get(`${c.base}/healthz`);
  expect(hz.status).toBe(200);
  expect(text(hz).trim()).toBe('ok');
  const gallery = await get(`${c.base}/gallery/`);
  expect(text(gallery)).toContain('neo-grid-bold');
  expect((await get(`${c.base}/zh/gallery/`)).status).toBe(200);
  const zip = await get(`${c.base}/zip/neo-grid-bold.zip`);
  expect(zip.status).toBe(200);
  expect(zip.headers.get('content-type')).toMatch(/application\/zip/);
  const z = readZip(zip.buf);
  expect(z.problems, 'zip integrity').toEqual([]);
  const names = z.entries.map((e) => e.name);
  for (const f of ['template.html', 'design.md', 'viewport-base.css', 'LICENSE-templates', 'LICENSE-skill', 'PROMPT.md', 'PROMPT.zh.md']) expect(names).toContain(`neo-grid-bold/${f}`);
  expect(z.entries.find((e) => e.name === 'neo-grid-bold/PROMPT.md').data.toString('utf8')).toContain(`${SITE_URL}zip/neo-grid-bold.zip`);
  expect((await get(`${c.base}/zip/convert-kit.zip`)).status).toBe(200);
  expect((await get(`${c.base}/zip/slides-commons-skills.zip`)).status).toBe(200);
  expect((await get(`${c.base}/zip/no-such-template.zip`)).status).toBe(404);
  const css = text(await get(`${c.base}/gallery/`)).match(/href="([^"]+\.css)"/)?.[1];
  expect(css, 'a stylesheet link on the gallery page').toBeTruthy();
  const cssRes = await get(new URL(css, `${c.base}/gallery/`).href, { headers: { 'accept-encoding': 'gzip' } });
  expect(cssRes.status).toBe(200);
  expect(cssRes.headers.get('content-encoding')).toBe('gzip');
  expect(cssRes.headers.get('x-content-type-options')).toBe('nosniff');
  // unprivileged
  const id = docker(['exec', c.id, 'id', '-u']);
  expect(Number(id.stdout.trim()), 'nginx must not run as root').not.toBe(0);
  const logs = docker(['logs', c.id]);
  expect(logs.stdout + logs.stderr).toMatch(/\[slides-commons\] serving on port 80/);
});

test('example private source with SC_ONLY_SOURCES=acme: only acme, internal badge, NOTICE.txt in the zip, no public template', async () => {
  const c = await start('private', { env: { SC_SITE_URL: 'http://slides.test/', SC_ONLY_SOURCES: 'acme' }, mounts: [`${EXAMPLE}:/templates:ro`] });
  const gallery = text(await get(`${c.base}/gallery/`));
  expect(gallery).toContain('acme-quarterly');
  expect(gallery).toContain('Internal');
  expect(gallery).not.toContain('neo-grid-bold');
  expect((await get(`${c.base}/t/acme-quarterly/`)).status).toBe(200);
  expect((await get(`${c.base}/zip/neo-grid-bold.zip`)).status, 'public zip must not exist').toBe(404);
  const zip = await get(`${c.base}/zip/acme-quarterly.zip`);
  expect(zip.status).toBe(200);
  const z = readZip(zip.buf);
  expect(z.problems).toEqual([]);
  const by = Object.fromEntries(z.entries.filter((e) => !e.isDir).map((e) => [e.name.replace(/^acme-quarterly\//, ''), e.data]));
  expect(by['NOTICE.txt']).toBeTruthy();
  expect(by['PROMPT.md'].toString('utf8')).toMatch(/Internal use only/);
  expect(by['PROMPT.md'].toString('utf8')).toContain('http://slides.test/zip/acme-quarterly.zip');
  expect(by['PROMPT.md'].toString('utf8')).not.toMatch(/licensed under the MIT/i);
  const logs = docker(['logs', c.id]);
  expect(logs.stdout + logs.stderr).toMatch(/adding \/templates\/sources\.json/);
  expect(logs.stdout + logs.stderr).toMatch(/only sources: acme/);
});

test('a broken source: the container exits non-zero, says BUILD FAILED, and serves nothing', async () => {
  const dir = tmp('sc-docker-broken-');
  fs.writeFileSync(path.join(dir, 'sources.json'), JSON.stringify({ schemaVersion: 1, sources: [{ id: 'broken', name: 'Broken', author: 'x', license: 'x', private: true, path: '.' }] }));
  const name = `${NAME}-broken`;
  started.push(name);
  const r = docker(['run', '--name', name, '-p', '127.0.0.1::80', '-v', `${dir}:/templates:ro`, IMAGE], { timeout: 5 * 60_000 });
  expect(r.status, `container must exit non-zero\n${r.stdout}\n${r.stderr}`).not.toBe(0);
  const logs = docker(['logs', name]);
  const all = logs.stdout + logs.stderr;
  expect(all).toMatch(/BUILD FAILED, not serving/);
  expect(all).toMatch(/build failed/i);
  expect(all, 'nginx must not have started').not.toMatch(/serving on port/);
  expect(docker(['inspect', '-f', '{{.State.ExitCode}}', name]).stdout.trim()).not.toBe('0');
});
