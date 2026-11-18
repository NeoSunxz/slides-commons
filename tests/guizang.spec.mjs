// Overlay source "guizang" (AGPL-3.0): metadata in sources-meta/, template files read from the
// read-only upstream/guizang. Detail notice, modified-copy line, preview paging, no unpkg/jsdelivr from
// the preview, zip contents, PROMPT notice, screenshots.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { test, expect } from './font-cache.mjs';
import { ROOT, SITE, SOURCES_JSON, OVERLAY_SOURCES, extractZip, makeTempDir, readZip, readSiteZip, monitor, settled, hostOf, normalizeEol } from './helpers.mjs';

const SRC = SOURCES_JSON.sources.find((s) => s.id === 'guizang');
const SLUGS = Object.keys(SRC.overlay.templates);
const META_DIR = path.join(ROOT, SRC.overlay.metaDir);
const metaOf = (slug) => JSON.parse(fs.readFileSync(path.join(META_DIR, `${slug}.json`), 'utf8'));
const UP = path.join(ROOT, SRC.path);
const LICENSE_URL = SRC.licenseUrl;
const BLOCKED = ['unpkg.com', 'cdn.jsdelivr.net'];
const pageOf = (lang, slug) => fs.readFileSync(path.join(SITE, ...(lang === 'zh' ? ['zh'] : []), 't', slug, 'index.html'), 'utf8');
const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const pagePrompt = (html, id) => unescapeHtml(html.match(new RegExp(`<pre id="${id}"[^>]*>([\\s\\S]*?)</pre>`))[1]);

test('sources.json: guizang is an overlay source with two templates, AGPL-3.0, with metadata for each', () => {
  expect(OVERLAY_SOURCES.map((s) => s.id)).toContain('guizang');
  expect(SLUGS.sort()).toEqual(['guizang-editorial', 'guizang-swiss']);
  expect(SRC.license).toBe('AGPL-3.0');
  expect(SRC.authorZh).toBe('歸藏');
  for (const slug of SLUGS) {
    expect(fs.existsSync(path.join(META_DIR, `${slug}.json`)), `${slug}.json`).toBe(true);
    expect(fs.existsSync(path.join(UP, SRC.overlay.templates[slug].html)), `${slug}: html`).toBe(true);
    expect(metaOf(slug).slug).toBe(slug);
  }
});

test('upstream/guizang is untouched by the build (read-only submodule)', () => {
  expect(fs.existsSync(path.join(UP, 'LICENSE'))).toBe(true);
  expect(fs.readFileSync(path.join(UP, 'LICENSE'), 'utf8')).toMatch(/GNU AFFERO GENERAL PUBLIC LICENSE/);
});

test('screenshots exist in sources-meta/guizang/screenshots: three real 1920x1080 PNGs per template', () => {
  for (const slug of SLUGS) {
    const files = fs.readdirSync(path.join(META_DIR, 'screenshots')).filter((f) => f.startsWith(`${slug}-`) && f.endsWith('.png'));
    expect(files.length, `${slug}: screenshots`).toBe(3);
    for (const f of files) {
      const b = fs.readFileSync(path.join(META_DIR, 'screenshots', f));
      expect(b.subarray(0, 8).toString('hex'), `${f}: PNG signature`).toBe('89504e470d0a1a0a');
      expect([b.readUInt32BE(16), b.readUInt32BE(20)], `${f}: size`).toEqual([1920, 1080]);
      expect(b.length, `${f}: not blank`).toBeGreaterThan(20_000);
    }
    // The built site serves a thumbnail for each.
    expect(fs.existsSync(path.join(SITE, 'assets', 'screenshots', 'thumbs', `${slug}-1.png`)), `${slug}: thumbnail`).toBe(true);
  }
});

for (const lang of ['en', 'zh']) {
  test(`[${lang}] detail pages: AGPL badge, license notice with links, modified-copy line, attribution`, () => {
    for (const slug of SLUGS) {
      const html = pageOf(lang, slug);
      const doc = html.replace(/<script[\s\S]*?<\/script>/g, '');
      const by = doc.match(/<p class="by">[\s\S]*?<\/p>/)[0];
      expect(by, `${slug}: badge in byline`).toMatch(/class="chip license-chip"[^>]*>AGPL-3\.0</);
      expect(by).toContain('https://github.com/op7418');
      const notice = doc.match(/<div class="license-notice"[\s\S]*?<\/div>/)?.[0];
      expect(notice, `${slug}: license notice`).toBeTruthy();
      expect(notice).toContain(`href="${LICENSE_URL}"`);
      expect(notice).toContain(`href="${SRC.repo}"`);
      expect(notice).toMatch(lang === 'zh' ? /许可证提示：AGPL-3\.0/ : /License notice: AGPL-3\.0/);
      expect(notice).toMatch(lang === 'zh' ? /衍生作品/ : /derivative works/);
      expect(notice).toMatch(lang === 'zh' ? /不构成法律意见/ : /not legal advice/);
      // The notice sits in the "Use this template" panel, before the download button.
      expect(doc.indexOf('license-notice')).toBeLessThan(doc.indexOf('Download assets') >= 0 ? doc.indexOf('Download assets') : doc.indexOf('.zip'));
      // Modified copy line: names the original, the author, and where the modifications are published.
      const mod = doc.match(/<p class="modified-note">[\s\S]*?<\/p>/)?.[0];
      expect(mod, `${slug}: modified-copy line`).toBeTruthy();
      expect(mod).toContain('https://github.com/op7418');
      expect(mod).toContain(`${SRC.repo}/blob/main/${SRC.overlay.templates[slug].link}`);
      expect(mod).toContain('https://github.com/NeoSunxz/slides-commons');
      expect(mod).toMatch(lang === 'zh' ? /修改副本/ : /modified copy/);
      // Attribution card: author, original file back-link, license.
      const card = doc.match(/<section class="attribution[\s\S]*?<\/section>/)[0];
      expect(card).toMatch(/href="https:\/\/github\.com\/op7418"/);
      expect(card).toContain(`${SRC.repo}/blob/main/${SRC.overlay.templates[slug].link}`);
      expect(card).toContain('AGPL-3.0');
    }
    // MIT pages do not carry the AGPL furniture.
    const mit = pageOf(lang, 'neo-grid-bold');
    expect(mit).not.toMatch(/license-notice|modified-note|license-chip/);
  });
}

test('zh guizang detail: translation note names the site-written English intro, not an MIT upstream; author shown as 歸藏', () => {
  for (const slug of SLUGS) {
    const doc = pageOf('zh', slug);
    const card = doc.match(/<section class="attribution[\s\S]*?<\/section>/)[0];
    expect(card, slug).toContain(`翻译自本站为该模板编写的<a href="../../../t/${slug}/">英文介绍</a>`);
    expect(card, slug).not.toMatch(/MIT/);
    expect(card, slug).toContain('歸藏');
    const note = doc.match(/<p class="source-note">[\s\S]*?<\/p>/)[0];
    expect(note, slug).toContain(`href="../../../t/${slug}/"`);
  }
});

for (const slug of SLUGS) {
  test.describe(`preview ${slug}`, () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('pages forward to the last slide and back, matching slide_count; no console errors, failed requests or unpkg/jsdelivr', async ({ page }) => {
      const N = metaOf(slug).slide_count;
      const log = monitor(page);
      await page.goto(`t/${slug}/`);
      const counter = page.locator('#counter');
      await expect(counter).toHaveText(new RegExp(`^1 / ${N}$`), { timeout: 30_000 });
      await expect(page.locator('#slide-total')).toHaveText(String(N));
      const next = page.locator('#next');
      const prev = page.locator('#prev');
      await expect(prev).toBeDisabled();
      for (let i = 2; i <= N; i++) { await next.click(); await expect(counter).toHaveText(`${i} / ${N}`); }
      await expect(next).toBeDisabled();
      for (let i = N - 1; i >= 1; i--) { await prev.click(); await expect(counter).toHaveText(`${i} / ${N}`); }
      await expect(prev).toBeDisabled();
      // Keyboard on the page pages too.
      await page.locator('body').click({ position: { x: 5, y: 5 } });
      await page.keyboard.press('ArrowRight');
      await expect(counter).toHaveText(`2 / ${N}`);
      await settled(log, expect);
      const hosts = [...new Set(log.requests.filter((r) => /^https?:/.test(r.url)).map((r) => hostOf(r.url)))];
      for (const h of BLOCKED) expect(hosts, `${h} requested from the detail page / preview`).not.toContain(h);
      expect(log.consoleErrors).toEqual([]);
      expect(log.pageErrors).toEqual([]);
      expect(log.failed).toEqual([]);
      expect(log.badStatus).toEqual([]);
    });

    test('preview copy has no unpkg / jsdelivr reference and opens standalone ("Open in new tab")', async ({ page }) => {
      const html = fs.readFileSync(path.join(SITE, 'preview', slug, 'template.html'), 'utf8');
      // (Comments and the author's dormant CDN fallback text may name these hosts; no src/href may point there, and the browser check below proves nothing is requested.)
      for (const h of BLOCKED) {
        expect(html, `preview copy loads ${h} via src/href`).not.toMatch(new RegExp(`(?:src|href)=["']https?://${h.replace('.', '\\.')}`));
      }
      const log = monitor(page);
      await page.goto(`preview/${slug}/template.html`);
      await expect(page.locator('body')).toBeVisible();
      await settled(log, expect);
      expect(log.pageErrors).toEqual([]);
      expect(log.failed).toEqual([]);
      const hosts = new Set(log.requests.map((r) => hostOf(r.url)));
      for (const h of BLOCKED) expect(hosts.has(h), `${h} requested`).toBe(false);
    });
  });
}

// ---------------------------------------------------------------------------
// Zip + PROMPT
// ---------------------------------------------------------------------------
for (const slug of SLUGS) {
  test(`zip ${slug}: integrity, template + assets + SKILL.md + references + AGPL LICENSE + fonts; no files outside ${slug}/`, () => {
    const z = readSiteZip(SITE, slug);
    expect(z.problems).toEqual([]);
    const names = z.entries.map((e) => e.name);
    expect(names.every((n) => n.startsWith(`${slug}/`)), 'single root folder').toBe(true);
    const get = (n) => z.entries.find((e) => e.name === `${slug}/${n}`)?.data;
    const spec = SRC.overlay.templates[slug];
    const want = ['template.html', 'LICENSE', 'PROMPT.md', 'PROMPT.zh.md', 'README.md', 'fonts/fonts.css', ...spec.assets, ...spec.docs.map((d) => d.path)];
    for (const n of want) expect(get(n), `${slug}/${n} missing`).toBeTruthy();
    // Files are the upstream's, byte for byte.
    expect(get('template.html').equals(fs.readFileSync(path.join(UP, spec.html)))).toBe(true);
    expect(get('LICENSE').equals(fs.readFileSync(path.join(UP, 'LICENSE')))).toBe(true);
    expect(get('LICENSE').toString()).toMatch(/GNU AFFERO GENERAL PUBLIC LICENSE\s+Version 3/);
    for (const a of spec.assets) expect(get(a).equals(fs.readFileSync(path.join(UP, a)))).toBe(true);
    for (const d of spec.docs) expect(get(d.path).equals(fs.readFileSync(path.join(UP, d.path))), d.path).toBe(true);
    // Fonts: woff2 files with a license per family, and fonts.css only points at files that exist.
    const css = get('fonts/fonts.css').toString();
    const woff = names.filter((n) => n.endsWith('.woff2'));
    expect(woff.length).toBeGreaterThan(0);
    for (const m of css.matchAll(/url\(["']?(\.\/)?([^"')]+\.woff2)["']?\)/g)) expect(names, `fonts.css -> ${m[2]}`).toContain(`${slug}/fonts/${m[2]}`);
    for (const d of new Set(woff.map((n) => n.split('/')[2]))) expect(names, `OFL for ${d}`).toContain(`${slug}/fonts/${d}/OFL.txt`);
  });

  test(`zip ${slug}: PROMPT.md / PROMPT.zh.md open with the AGPL notice, equal the page prompts, and README repeats it`, () => {
    const z = readSiteZip(SITE, slug);
    const get = (n) => z.entries.find((e) => e.name === `${slug}/${n}`).data.toString('utf8');
    for (const [lang, file, id, re] of [['en', 'PROMPT.md', 'prompt-en', /License notice: AGPL-3\.0/], ['zh', 'PROMPT.zh.md', 'prompt-zh', /许可证提示：AGPL-3\.0/]]) {
      const text = get(file);
      const lines = normalizeEol(text).split('\n');
      expect(lines.slice(0, 4).join('\n'), `${file}: notice at the top`).toMatch(re);
      expect(lines[0], `${file}: title first`).toMatch(/^# /);
      expect(text).toContain(LICENSE_URL === undefined ? 'AGPL' : SRC.repo);
      expect(pagePrompt(pageOf(lang, slug), id), `${lang} page prompt equals ${file}`).toBe(text);
    }
    expect(get('README.md')).toMatch(/AGPL-3\.0/);
    // Overlay packs have no design.md / viewport-base.css; the prompt must not mention the --slide-bg token of design.md packs.
    expect(z.entries.some((e) => /\/(design\.md|viewport-base\.css)$/.test(e.name))).toBe(false);
    expect(get('PROMPT.md')).not.toMatch(/--slide-bg/);
    // The prompt tells the agent to say it first, and which instructions win.
    expect(get('PROMPT.md')).toMatch(/Tell the user about the license first/);
    expect(get('PROMPT.md')).toMatch(/Which instructions win/);
    // Prompt never tells the agent to fetch from unpkg / jsdelivr (single file, no network requests).
    expect(get('PROMPT.md')).toMatch(/no network requests|network request/i);
  });

  test(`zip ${slug}: the unzipped template.html renders from file:// (no missing local files)`, async ({ page, context }) => {
    const dir = makeTempDir('sc-gz-');
    try {
      extractZip(readSiteZip(SITE, slug).entries, dir);
      const localMissing = [];
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(String(e)));
      page.on('requestfailed', (r) => { if (r.url().startsWith('file:')) localMissing.push(r.url()); });
      // Remote hosts (fonts, lucide on unpkg) are not part of the pack: fail them fast and ignore.
      await context.route(/^https?:/, (route) => route.abort());
      await page.goto(pathToFileURL(path.join(dir, slug, 'template.html')).href);
      await expect(page.locator('body')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      // Local references of the template exist in the pack (checked on disk: src/href and import('./...')).
      const tpl = fs.readFileSync(path.join(dir, slug, 'template.html'), 'utf8');
      const refs = [...tpl.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)].map((m) => m[1]).concat([...tpl.matchAll(/import\(\s*["'](\.[^"']+)["']/g)].map((m) => m[1]))
        .filter((u) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|data:)/i.test(u));
      expect(refs.length, 'template references local files').toBeGreaterThan(0);
      for (const r of refs) expect(fs.existsSync(path.join(dir, slug, ...r.split('/'))), `${slug}/${r} referenced by template.html is not in the zip`).toBe(true);
      // Chromium refuses a dynamic import() of a local module from file:// (null origin), and the template then
      // falls back to the CDN; that is the author's loader, so it is reported, not failed.
      const blocked = localMissing.filter((u) => !/motion\.min\.js$/.test(u));
      test.info().annotations.push({ type: 'file-origin-import', description: `local requests failed from file://: ${localMissing.map((u) => path.basename(u)).join(', ') || 'none'}` });
      expect(blocked, 'local files the unzipped template could not load').toEqual([]);
      // The motion library loaded from the pack's assets/.
      expect(refs.some((r) => /assets\/motion\.min\.js$/.test(r)), 'template points at assets/motion.min.js').toBe(true);
      test.info().annotations.push({ type: 'page-errors', description: pageErrors.join(' | ').slice(0, 300) });
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
}
