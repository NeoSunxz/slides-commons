// Zip pack: download from the detail page, verify contents and integrity, open the
// unzipped template.html from file:// and check it renders with no missing local files.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect } from './font-cache.mjs';
import { SLUG, UPSTREAM_TEMPLATE_DIR, settled, fontLoaded, makeTempDir, readZip, extractZip, monitor, countUpstreamSlides, EXTERNAL_WHITELIST, hostOf } from './helpers.mjs';

const EXPECTED_FILES = [
  'template.html', 'deck-stage.js', 'design.md', 'viewport-base.css',
  'LICENSE-templates', 'LICENSE-skill', 'PROMPT.md', 'PROMPT.zh.md', 'README.md',
].map((f) => `${SLUG}/${f}`).sort();

test('download, unzip and open the pack', async ({ page }) => {
  await page.goto(`t/${SLUG}/`);
  const link = page.getByRole('link', { name: /Download assets/i });
  await expect(link).toHaveCount(1);
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  expect(download.suggestedFilename()).toBe(`${SLUG}.zip`);
  expect(await download.failure()).toBeNull();

  const tmp = makeTempDir('slides-commons-zip-');
  const zipPath = path.join(tmp, `${SLUG}.zip`);
  await download.saveAs(zipPath);

  // Listing + integrity
  const { entries, problems } = readZip(fs.readFileSync(zipPath));
  expect(problems, 'zip integrity problems').toEqual([]);
  const files = entries.filter((e) => !e.isDir).map((e) => e.name).sort();
  expect(files).toEqual(EXPECTED_FILES);
  expect(entries.every((e) => e.name.startsWith(`${SLUG}/`)), 'all entries under <slug>/').toBe(true);

  const get = (n) => entries.find((e) => e.name === `${SLUG}/${n}`).data.toString('utf8');
  for (const lic of ['LICENSE-templates', 'LICENSE-skill']) {
    expect(get(lic), lic).toContain('MIT License');
    expect(get(lic), lic).toContain('Zara Zhang');
  }
  expect(get('design.md'), 'design.md should be the fixed-stage (skill) edition').toMatch(/Fixed-Stage Policy/i);

  // The preview font fix must not leak into the pack: originals ship byte-for-byte.
  for (const f of ['template.html', 'deck-stage.js']) {
    const zipped = entries.find((e) => e.name === `${SLUG}/${f}`).data;
    const original = fs.readFileSync(path.join(UPSTREAM_TEMPLATE_DIR, f));
    expect(zipped.equals(original), `${f} in zip differs from upstream`).toBe(true);
  }
  expect(get('template.html')).not.toMatch(/slides-commons/);
  expect(get('template.html'), 'zip template.html keeps the external deck-stage.js').toContain('<script src="deck-stage.js"');
  expect(get('template.html')).not.toContain('data-inlined-from');

  // Prompts warn that the bundled deck-stage.js forces a system font.
  expect(get('PROMPT.md')).toMatch(/deck-stage\.js`? forces a system font/);
  expect(get('PROMPT.zh.md')).toMatch(/deck-stage\.js`? 会在 `<deck-stage>` 上强制使用系统字体/);

  // Prompt sections (round 6): §0 unzip fallbacks in order, §4 CJK font link, §6 no-display fallback.
  const section = (md, n) => {
    const m = md.match(new RegExp(`^## ${n}\\.[^\\n]*\\n([\\s\\S]*?)(?=^## \\d+\\.|(?![\\s\\S]))`, 'm'));
    return m ? m[1] : '';
  };
  const design = get('design.md');
  const lines = design.split(/\r?\n/);
  const cjkStart = lines.findIndex((l) => /^#{2,3}\s.*\bCJK\b/i.test(l));
  expect(cjkStart, 'design.md has a CJK section').toBeGreaterThan(-1);
  const level = lines[cjkStart].match(/^#+/)[0].length;
  let cjkEnd = lines.findIndex((l, i) => i > cjkStart && new RegExp(`^#{1,${level}}\\s`).test(l));
  if (cjkEnd < 0) cjkEnd = lines.length;
  const cjkLinks = [...new Set(lines.slice(cjkStart, cjkEnd).join('\n').match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"'\s)<>`]+/g) ?? [])];
  expect(cjkLinks, 'one CJK font link in design.md').toHaveLength(1);

  for (const [name, noDisplay] of [['PROMPT.md', /no display/], ['PROMPT.zh.md', /没有图形界面/]]) {
    const md = get(name);
    const s0 = section(md, 0);
    const order = ['unzip ', 'tar -xf ', 'python3 -m zipfile -e ', 'Expand-Archive '].map((k) => s0.indexOf(k));
    expect(order.every((x) => x >= 0), `${name} §0 lists all four extract commands (${order})`).toBe(true);
    expect([...order].sort((a, b) => a - b), `${name} §0 order unzip → tar → python → Expand-Archive`).toEqual(order);
    expect(section(md, 4), `${name} §4 contains design.md's CJK font link`).toContain(cjkLinks[0]);
    expect(section(md, 6), `${name} §6 no-display fallback`).toMatch(noDisplay);
  }

  // Extract into a fresh temp dir and open via file://
  const dest = makeTempDir('slides-commons-unzip-');
  extractZip(entries, dest);
  const htmlPath = path.join(dest, SLUG, 'template.html');
  expect(fs.existsSync(htmlPath)).toBe(true);

  const log = monitor(page);
  const fileRequests = [];
  page.on('requestfinished', (r) => { if (r.url().startsWith('file:')) fileRequests.push(r.url()); });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.waitForFunction(() => !!customElements.get('deck-stage') && document.querySelector('deck-stage')?.length > 0);
  await fontLoaded(page, 'JetBrains Mono');
  await settled(log, expect);

  const state = await page.evaluate(() => {
    const d = document.querySelector('deck-stage');
    const active = document.querySelector('[data-deck-active]');
    const r = active?.getBoundingClientRect();
    return { total: d.length, index: d.index, activeW: r?.width ?? 0, activeH: r?.height ?? 0 };
  });
  expect(state.total).toBe(countUpstreamSlides());
  expect(state.activeW).toBeGreaterThan(100);
  expect(state.activeH).toBeGreaterThan(50);
  expect(fileRequests.some((u) => u.endsWith('/deck-stage.js')), `deck-stage.js loaded (file requests: ${fileRequests.join(', ')})`).toBe(true);

  const external = log.requests.filter((r) => /^https?:/.test(r.url));
  expect.soft(log.failed.filter((f) => f.startsWith('file:')), 'failed local file requests').toEqual([]);
  expect.soft(log.failed, 'failed requests').toEqual([]);
  expect.soft(log.consoleErrors, 'console errors').toEqual([]);
  expect.soft(log.pageErrors, 'page errors').toEqual([]);
  expect.soft(external.filter((r) => !EXTERNAL_WHITELIST.includes(hostOf(r.url))).map((r) => r.url), 'off-whitelist').toEqual([]);

  fs.rmSync(tmp, { recursive: true, force: true });
  fs.rmSync(dest, { recursive: true, force: true });
});
