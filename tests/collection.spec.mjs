// M4: the in-repo "style-presets" collection (12 derived from frontend-slides STYLE_PRESETS.md + originals).
// Everything is derived from sources.json and the template directories; nothing per-template is hard-coded.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, expect } from './font-cache.mjs';
import {
  ROOT, SITE, TESTS, COLLECTION, COLLECTION_SLUGS, DERIVED_SLUGS, ORIGINAL_SLUGS, FONTSHARE_SLUGS, GOOGLE_FONT_SLUGS,
  NO_WEBFONT_SLUGS, EXTERNAL_WHITELIST, dirUrl, upstreamDir, upstreamMeta, readSiteZip, readZip, makeTempDir,
  monitor, settled, hostOf,
} from './helpers.mjs';

const REPO_DIR = (slug) => `https://github.com/NeoSunxz/slides-commons/tree/main/collections/style-presets/templates/${slug}`;
const STYLE_PRESETS_MD = 'https://github.com/zarazhangrui/frontend-slides/blob/main/STYLE_PRESETS.md';
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const zfile = (entries, slug, name) => entries.find((e) => e.name === `${slug}/${name}`)?.data;
const ZH = {
  en: { rel: (s) => ['t', s, 'index.html'] },
  zh: { rel: (s) => ['zh', 't', s, 'index.html'] },
};

test('the collection is wired as expected: 16 templates, 12 derived, 4 original', () => {
  expect(COLLECTION, 'style-presets source in sources.json').toBeTruthy();
  expect(COLLECTION_SLUGS).toHaveLength(16);
  expect(DERIVED_SLUGS).toHaveLength(12);
  expect(ORIGINAL_SLUGS.sort()).toEqual(['boardroom-quarterly', 'consulting-report', 'minimal-pitch', 'tech-blue-business']);
  expect(DERIVED_SLUGS.filter((s) => !COLLECTION_SLUGS.includes(s)), 'derivedFrom.slugs names unknown templates').toEqual([]);
  expect(COLLECTION.derivedFrom.url).toBe(STYLE_PRESETS_MD);
  for (const slug of COLLECTION_SLUGS) expect(dirUrl(slug)).toBe(REPO_DIR(slug));
});

// ---------------------------------------------------------------------------
// Attribution
// ---------------------------------------------------------------------------
async function parseDetail(page, html) {
  return page.evaluate((h) => {
    const d = new DOMParser().parseFromString(h, 'text/html');
    const links = (sel) => [...d.querySelectorAll(sel)].map((a) => a.getAttribute('href'));
    const txt = (sel) => d.querySelector(sel)?.textContent.replace(/\s+/g, ' ').trim() ?? '';
    return {
      byHtml: d.querySelector('.hero .by')?.innerHTML ?? '',
      byText: txt('.hero .by'), byLinks: links('.hero .by a'),
      attrText: txt('section.attribution'), attrLinks: links('section.attribution a'),
      footerText: txt('footer'), footerLinks: links('footer a'),
    };
  }, html);
}

for (const lang of ['en', 'zh']) {
  test(`[${lang}] detail pages: derived templates credit Zara Zhang and STYLE_PRESETS.md; originals show no such credit; back-links go to the repo directory`, async ({ page }) => {
    await page.goto('about:blank');
    const bad = [];
    for (const slug of COLLECTION_SLUGS) {
      const html = read(SITE, ...ZH[lang].rel(slug));
      const r = await parseDetail(page, html);
      const derived = DERIVED_SLUGS.includes(slug);
      // Author line: collection author, linked to the directory in this repo.
      if (!r.byText.includes('NeoSunxz and slides-commons contributors')) bad.push(`${slug}: author line lacks the collection author: ${r.byText}`);
      if (!r.byLinks.includes(REPO_DIR(slug))) bad.push(`${slug}: author line does not link ${REPO_DIR(slug)} (links: ${r.byLinks})`);
      if (!r.attrLinks.includes(REPO_DIR(slug))) bad.push(`${slug}: attribution section does not link ${REPO_DIR(slug)}`);
      if (r.byLinks.concat(r.attrLinks).some((h) => /zarazhangrui\/beautiful-html-templates/.test(h))) bad.push(`${slug}: links to beautiful-html-templates although it is not from there`);
      if (derived) {
        if (!r.byText.includes('Zara Zhang')) bad.push(`${slug}: byline lacks "Zara Zhang"`);
        if (!r.byLinks.includes(STYLE_PRESETS_MD)) bad.push(`${slug}: byline does not link STYLE_PRESETS.md`);
        if (!r.byLinks.includes('https://github.com/zarazhangrui')) bad.push(`${slug}: byline does not link the author`);
        if (!(lang === 'en' ? /based on/ : /基于/).test(r.byText)) bad.push(`${slug}: byline lacks the "based on" wording: ${r.byText}`);
        if (!r.attrLinks.includes(STYLE_PRESETS_MD)) bad.push(`${slug}: attribution lacks the STYLE_PRESETS.md link`);
        if (!r.attrText.includes('Zara Zhang')) bad.push(`${slug}: attribution lacks Zara Zhang`);
        if (!(lang === 'en' ? /did not make, review or endorse/ : /并未制作、审阅或认可/).test(r.attrText)) bad.push(`${slug}: attribution lacks the not-endorsed sentence`);
      } else {
        for (const [where, t] of [['byline', r.byText], ['attribution', r.attrText]]) {
          if (/STYLE_PRESETS|based on|基于|derivative|衍生作品/.test(t)) bad.push(`${slug}: original template shows derivative wording in ${where}: ${t.slice(0, 120)}`);
        }
        if (r.byText.includes('Zara Zhang')) bad.push(`${slug}: original template byline names Zara Zhang`);
        if (r.byLinks.concat(r.attrLinks).includes(STYLE_PRESETS_MD)) bad.push(`${slug}: original template links STYLE_PRESETS.md`);
      }
      // Footer: attribution of both sources, with the partial-derivation wording.
      if (!r.footerText.includes('Zara Zhang')) bad.push(`${slug}: footer lacks Zara Zhang`);
      if (!r.footerLinks.includes(STYLE_PRESETS_MD)) bad.push(`${slug}: footer lacks STYLE_PRESETS.md link`);
      if (!(lang === 'en' ? /some are based on/ : /其中部分基于/).test(r.footerText)) bad.push(`${slug}: footer should say only some templates are derived: ${r.footerText.slice(0, 200)}`);
    }
    expect(bad).toEqual([]);
  });
}

for (const lang of ['en', 'zh']) {
  test(`[${lang}] gallery cards: "based on" credit exactly on derived templates`, async ({ page }) => {
    await page.goto(lang === 'en' ? 'index.html' : 'zh/index.html');
    const cards = await page.evaluate(() => [...document.querySelectorAll('#grid > li')].map((li) => ({
      slug: li.querySelector('a.card').getAttribute('href').replace(/^t\/|\/(index\.html)?$/g, ''),
      source: li.getAttribute('data-source'),
      by: li.querySelector('.by')?.textContent.replace(/\s+/g, ' ').trim() ?? '',
    })));
    const bad = [];
    for (const slug of COLLECTION_SLUGS) {
      const c = cards.find((x) => x.slug === slug);
      if (!c) { bad.push(`${slug}: no card`); continue; }
      if (c.source !== COLLECTION.id) bad.push(`${slug}: data-source=${c.source}`);
      if (!c.by.includes('NeoSunxz and slides-commons contributors')) bad.push(`${slug}: card lacks the author: ${c.by}`);
      const mentions = lang === 'en' ? /based on frontend-slides STYLE_PRESETS\.md by Zara Zhang/ : /基于 Zara Zhang 的 frontend-slides STYLE_PRESETS\.md/;
      if (DERIVED_SLUGS.includes(slug) !== mentions.test(c.by)) bad.push(`${slug}: card credit ${mentions.test(c.by) ? 'present' : 'missing'} but derived=${DERIVED_SLUGS.includes(slug)}: ${c.by}`);
    }
    // Upstream cards stay free of the credit.
    for (const c of cards.filter((x) => x.source !== COLLECTION.id)) if (/STYLE_PRESETS|Zara Zhang.*based/.test(c.by) || /基于/.test(c.by)) bad.push(`${c.slug}: upstream card has derivative wording: ${c.by}`);
    expect(bad).toEqual([]);
  });
}

test('credits pages (EN+ZH) list the collection with directory links and the partial-derivative wording', async () => {
  for (const [lang, file] of [['en', 'credits.html'], ['zh', path.join('zh', 'credits.html')]]) {
    const html = read(SITE, file);
    for (const slug of COLLECTION_SLUGS) expect(html, `${lang}: credits lacks ${REPO_DIR(slug)}`).toContain(`href="${REPO_DIR(slug)}"`);
    expect(html).toContain(STYLE_PRESETS_MD);
    expect(html).toMatch(lang === 'en' ? /Some of these templates are derivative works \(the rest are original\)/ : /其中部分模板是衍生作品（其余为原创）/);
  }
  expect(read(ROOT, 'CREDITS.md')).toMatch(/STYLE_PRESETS\.md/);
});

// ---------------------------------------------------------------------------
// Zips
// ---------------------------------------------------------------------------
const README_DERIVED = /derivative work of the project credited above/;
const README_ORIGINAL = /This template is original work, written for slides-commons/;

for (const slug of COLLECTION_SLUGS) {
  test(`zip ${slug}: file list, licenses, README wording`, () => {
    const { entries, problems } = readSiteZip(SITE, slug);
    expect(problems, 'zip integrity').toEqual([]);
    const all = entries.filter((e) => !e.isDir).map((e) => e.name).sort();
    const nonFont = all.filter((n) => !n.startsWith(`${slug}/fonts/`));
    expect(nonFont).toEqual(['LICENSE', 'LICENSE-skill', 'PROMPT.md', 'PROMPT.zh.md', 'README.md', 'design.md', 'template.html', 'viewport-base.css'].map((f) => `${slug}/${f}`).sort());
    expect(all.some((n) => n.endsWith('LICENSE-templates')), 'LICENSE-templates must not be in a collection pack').toBe(false);
    expect(all.some((n) => n.endsWith('deck-stage.js')), 'deck-stage.js must not be in a collection pack').toBe(false);
    const hasFonts = all.some((n) => n.startsWith(`${slug}/fonts/`));
    if (GOOGLE_FONT_SLUGS.includes(slug)) {
      expect(all, `${slug}: fonts/fonts.css`).toContain(`${slug}/fonts/fonts.css`);
      expect(all.some((n) => n.endsWith('.woff2'))).toBe(true);
    } else {
      expect(hasFonts, `${slug}: fonts/ only when Google Fonts are used (Fontshare / system fonts ship none)`).toBe(false);
    }

    // Files are the repo's own, byte for byte.
    const dir = upstreamDir(slug);
    expect(Buffer.compare(zfile(entries, slug, 'template.html'), fs.readFileSync(path.join(dir, 'template.html')))).toBe(0);
    expect(Buffer.compare(zfile(entries, slug, 'design.md'), fs.readFileSync(path.join(dir, 'design.md')))).toBe(0);
    expect(Buffer.compare(zfile(entries, slug, 'LICENSE'), fs.readFileSync(path.join(ROOT, COLLECTION.path, 'LICENSE')))).toBe(0);
    expect(Buffer.compare(zfile(entries, slug, 'LICENSE-skill'), fs.readFileSync(path.join(ROOT, 'upstream', 'skill', 'LICENSE')))).toBe(0);
    expect(Buffer.compare(zfile(entries, slug, 'viewport-base.css'), fs.readFileSync(path.join(ROOT, 'upstream', 'skill', 'viewport-base.css')))).toBe(0);
    expect(zfile(entries, slug, 'LICENSE').toString()).toMatch(/MIT License/);
    expect(zfile(entries, slug, 'LICENSE-skill').toString()).toMatch(/MIT License[\s\S]*Zara Zhang/);

    // PROMPT files are non-empty, mention the slug, and the zh one has Chinese while the en one has none.
    const en = zfile(entries, slug, 'PROMPT.md').toString();
    const zh = zfile(entries, slug, 'PROMPT.zh.md').toString();
    expect(en).toContain(`\`${slug}/\``);
    expect(zh).toMatch(/[一-鿿]/);
    expect(en).not.toMatch(/[一-鿿]/);

    const readme = zfile(entries, slug, 'README.md').toString();
    expect(readme).toContain(REPO_DIR(slug));
    expect(readme).toContain('(MIT; see `LICENSE`)');
    expect(readme).toContain('`viewport-base.css`: by Zara Zhang, from [frontend-slides](https://github.com/zarazhangrui/frontend-slides) (MIT; see `LICENSE-skill`)');
    if (DERIVED_SLUGS.includes(slug)) {
      expect(readme).toContain(`[frontend-slides STYLE_PRESETS.md](${STYLE_PRESETS_MD})`);
      expect(readme).toMatch(README_DERIVED);
      expect(readme).toMatch(/the original author did not make or endorse it/);
      expect(readme).not.toMatch(README_ORIGINAL);
    } else {
      expect(readme).not.toMatch(/STYLE_PRESETS|derivative/);
      expect(readme).toMatch(README_ORIGINAL);
      expect(readme).not.toMatch(README_DERIVED);
    }
  });
}

test('collection zips are reproducible: two fresh builds give identical bytes, equal to site/', () => {
  const outs = [makeTempDir('sc-coll-a-'), makeTempDir('sc-coll-b-')].map((d) => path.join(d, 'site'));
  try {
    for (const out of outs) {
      const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--out', out], {
        cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '', SC_I18N_DIR: '', SC_SITE_URL: '' },
      });
      expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
    }
    for (const slug of COLLECTION_SLUGS) {
      const [a, b] = outs.map((o) => fs.readFileSync(path.join(o, 'zip', `${slug}.zip`)));
      expect(Buffer.compare(a, b), `${slug}: two builds differ`).toBe(0);
      expect(Buffer.compare(a, fs.readFileSync(path.join(SITE, 'zip', `${slug}.zip`))), `${slug}: differs from site/`).toBe(0);
    }
  } finally { for (const o of outs) fs.rmSync(path.dirname(o), { recursive: true, force: true }); }
});

// ---------------------------------------------------------------------------
// Previews page through the bridge
// ---------------------------------------------------------------------------
test.describe('collection previews', () => {
  test.describe.configure({ mode: 'parallel' });
  for (const slug of COLLECTION_SLUGS) {
    test(`${slug}: 1 / N -> 2 / N and back, N = template.json slide_count; clean console; whitelisted hosts only`, async ({ page, baseURL }) => {
      const log = monitor(page);
      const N = upstreamMeta(slug).slide_count;
      expect(N, 'slide_count in template.json').toBeGreaterThan(1);
      await page.goto(`t/${slug}/`);
      const counter = page.locator('#counter');
      await expect(counter, `${slug}: counter never initialised`).toHaveText(`1 / ${N}`);
      await expect(page.locator('#slide-total')).toHaveText(String(N));
      await page.locator('#next').click();
      await expect(counter).toHaveText(`2 / ${N}`);
      await page.waitForTimeout(1200); // an extra, late advance would show up here
      await expect(counter).toHaveText(`2 / ${N}`);
      await page.locator('#prev').click();
      await expect(counter).toHaveText(`1 / ${N}`);
      await settled(log, expect);

      const own = new URL(baseURL).host;
      const hosts = [...new Set(log.requests.map((r) => r.url).filter((u) => /^https?:/.test(u)).map(hostOf).filter((h) => h !== hostOf(baseURL) && h !== own))];
      expect(log.consoleErrors, 'console errors').toEqual([]);
      expect(log.pageErrors, 'page errors').toEqual([]);
      expect(log.failed, 'failed requests').toEqual([]);
      expect(log.badStatus, 'HTTP >= 400').toEqual([]);
      expect(hosts.filter((h) => !EXTERNAL_WHITELIST.includes(h)), 'hosts outside the whitelist').toEqual([]);
      expect(hosts, 'no CDN script in a collection template').not.toContain('cdn.jsdelivr.net');
      if (FONTSHARE_SLUGS.includes(slug)) expect(hosts.sort(), 'Fontshare templates talk to Fontshare only').toEqual(['api.fontshare.com', 'cdn.fontshare.com'].filter((h) => hosts.includes(h)));
      if (GOOGLE_FONT_SLUGS.includes(slug)) expect(hosts.filter((h) => /fontshare/.test(h)), 'unexpected Fontshare').toEqual([]);
      test.info().annotations.push({ type: 'hosts', description: `${slug}: ${hosts.join(', ') || '(none)'}` });
    });
  }
});

test('collection: system-font or Fontshare templates match their source declaration', () => {
  // Every collection template is either Google (fonts/ shipped), Fontshare or system fonts; the three sets partition it.
  const g = COLLECTION_SLUGS.filter((s) => GOOGLE_FONT_SLUGS.includes(s));
  const f = COLLECTION_SLUGS.filter((s) => FONTSHARE_SLUGS.includes(s));
  const n = COLLECTION_SLUGS.filter((s) => NO_WEBFONT_SLUGS.includes(s));
  expect(g.length + f.length + n.length).toBe(COLLECTION_SLUGS.length);
  expect(f, 'Fontshare users').toContain('neon-cyber');
});

// ---------------------------------------------------------------------------
// Screenshots
// ---------------------------------------------------------------------------
test('screenshots: three valid PNGs per collection template, referenced by its detail page', () => {
  const dir = path.join(ROOT, COLLECTION.path, 'screenshots');
  const files = fs.readdirSync(dir);
  const bad = [];
  for (const slug of COLLECTION_SLUGS) {
    const mine = files.filter((f) => new RegExp(`^${slug}-\\d+\\.png$`).test(f)).sort();
    if (mine.length !== 3) bad.push(`${slug}: ${mine.length} screenshots (${mine})`);
    for (const f of mine) {
      const b = fs.readFileSync(path.join(dir, f));
      if (b.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') { bad.push(`${f}: not a PNG`); continue; }
      const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
      if (w < 800 || Math.abs(w / h - 16 / 9) > 0.02) bad.push(`${f}: ${w}x${h} is not a >=800px 16:9 image`);
      if (b.length < 5000) bad.push(`${f}: suspiciously small (${b.length} bytes)`);
    }
    const page = read(SITE, 't', slug, 'index.html');
    const refs = [...page.matchAll(/assets\/screenshots\/([^"]+\.png)/g)].map((m) => m[1]);
    if (new Set(refs).size < 3) bad.push(`${slug}: detail page references ${new Set(refs).size} screenshot file(s)`);
    for (const r of new Set(refs)) if (!fs.existsSync(path.join(SITE, 'assets', 'screenshots', r))) bad.push(`${slug}: site/assets/screenshots/${r} missing`);
  }
  const stray = files.filter((f) => f.endsWith('.png') && !COLLECTION_SLUGS.some((s) => new RegExp(`^${s}-\\d+\\.png$`).test(f)));
  expect(stray, 'screenshots for unknown templates').toEqual([]);
  expect(bad).toEqual([]);
});

// ---------------------------------------------------------------------------
// validate: derivedFrom.slugs
// ---------------------------------------------------------------------------
test.describe('validate: derivedFrom.slugs', () => {
  const run = (f) => {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'validate.mjs'), '--sources', path.join(TESTS, 'fixtures', f)], {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, SC_SOURCES: '', SC_OUT: '' },
    });
    return { status: r.status, out: `${r.stdout}\n${r.stderr}` };
  };
  test('an unknown slug is rejected and named', () => {
    const r = run('sources-derived-unknown.json');
    expect(r.status, r.out).not.toBe(0);
    expect(r.out).toMatch(/derivedFrom\.slugs lists unknown template\(s\): ghost-template/);
  });
  test('a list of known slugs passes (baseline)', () => {
    const r = run('sources-derived-known.json');
    expect(r.status, r.out).toBe(0);
  });
});
