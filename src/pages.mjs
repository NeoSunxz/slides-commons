// Page templates for the generated site. Pure functions: data in, HTML string out.
// All links are relative so the site works from any base path (GitHub Pages
// project sites live under /<repo>/). `root` is the relative prefix to site/.

export const SITE_NAME = 'slides-commons';
export const SITE_TAGLINE = 'Open HTML slide templates with prompts, for coding agents.';
export const SITE_TAGLINE_ZH = '开放的 HTML 幻灯片模板库：在线预览，复制提示词，下载素材包，交给你的 coding agent 完成幻灯片。';

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const repoName = (url) => url.replace(/\/+$/, '').split('/').pop();
const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const authorList = (authors) => authors.map((a) => (a.url ? link(a.url, a.name) : esc(a.name))).join(', ');

function layout({ root, title, description, body, scripts = [] }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="${root}assets/site.css">
</head>
<body>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${root}index.html">${SITE_NAME}</a>
    <nav><a href="${root}index.html">Templates</a><a href="${root}credits.html">Credits</a></nav>
  </div>
</header>
<main class="wrap">
${body}
</main>
${footer(root, footerSources)}
${scripts.map((s) => `<script src="${root}${s}"></script>`).join('\n')}
</body>
</html>
`;
}
let footerSources = [];

// Sources shown in the footer of every page (set once by the build).
export function setSources(sources) { footerSources = sources; }

function footer(root, sources) {
  const lines = sources.map((s) => {
    const parts = [link(s.repo, repoName(s.repo))];
    if (s.companion) parts.push(link(s.companion.repo, repoName(s.companion.repo)));
    return `<p>Templates by ${s.authorUrl ? link(s.authorUrl, s.author) : esc(s.author)} (${esc(s.license)}): ${parts.join(' · ')}</p>`;
  }).join('\n    ');
  return `<footer class="site-footer">
  <div class="wrap">
    ${lines}
    <p>${SITE_NAME} is an independent community gallery, not affiliated with the original authors. <a href="${root}credits.html">Credits &amp; licenses</a></p>
    <p class="zh">${SITE_NAME} 是独立的社区画廊，与原作者无关联。</p>
  </div>
</footer>`;
}

// ---------------------------------------------------------------------------

export function indexPage({ templates }) {
  const root = '';
  const cards = templates.map((t) => {
    const img = t.thumb
      ? `<img src="assets/screenshots/${esc(t.thumb.file)}" width="${t.thumb.width}" height="${t.thumb.height}" loading="lazy" alt="">`
      : '<div class="noimg"></div>';
    return `<li><a class="card" href="t/${esc(t.slug)}/">
    ${img}
    <div class="card-body">
      <h2>${esc(t.name)}</h2>
      <p>${esc(t.tagline)}</p>
      <p class="by">by ${esc(t.authors.map((a) => a.name).join(', '))}</p>
    </div>
  </a></li>`;
  }).join('\n');
  const body = `<section class="intro">
  <h1>${esc(SITE_TAGLINE)}</h1>
  <p class="zh">${esc(SITE_TAGLINE_ZH)}</p>
  <ol class="steps">
    <li><strong>Preview</strong> a template and page through it.</li>
    <li><strong>Download</strong> the asset pack and unzip it.</li>
    <li><strong>Paste the prompt</strong> into your coding agent in that folder.</li>
  </ol>
</section>
<ul class="grid">
${cards}
</ul>`;
  return layout({ root, title: `${SITE_NAME}: HTML slide templates for coding agents`, description: SITE_TAGLINE, body });
}

// ---------------------------------------------------------------------------

export function detailPage(t) {
  const root = '../../';
  const swatches = t.paletteColors.map((c) => `<li><span class="sw" style="background:${esc(c.value)}"></span><code>${esc(c.name)}</code> <code>${esc(c.value)}</code></li>`).join('');
  const typo = Object.entries(t.typography).filter(([k]) => k !== 'style')
    .map(([k, v]) => `<li><span class="k">${esc(k)}</span> ${esc(v)}</li>`).join('');
  const tags = (arr) => arr.map((x) => `<span class="tag">${esc(x)}</span>`).join(' ');
  const shots = t.screenshots.map((s) => `<a href="${root}assets/screenshots/${esc(s.file)}"><img src="${root}assets/screenshots/${esc(s.file)}" width="${s.width}" height="${s.height}" loading="lazy" alt="${esc(t.name)}, slide ${s.n}"></a>`).join('');

  const derived = t.derived
    ? `<p>Adapted from ${link(t.derived.url, t.derived.name)} by ${authorList(t.derived.authors)} (${esc(t.derived.license)}).</p>`
    : '';
  const companion = t.companionInfo
    ? `<p>The design notes (<code>design.md</code>, fixed-stage edition) and <code>viewport-base.css</code> in the pack come from ${link(t.companionInfo.dirUrl, t.companionInfo.repoName)} by ${esc(t.companionInfo.author)} (${esc(t.companionInfo.license)}).</p>`
    : '';

  const body = `<p class="crumb"><a href="${root}index.html">← All templates</a></p>
<section class="hero">
  <h1>${esc(t.name)}</h1>
  <p class="tagline">${esc(t.tagline)}</p>
  <p class="by">by ${authorList(t.authors)} · from ${link(t.sourceDirUrl, t.sourceRepoName)}</p>
</section>

<div class="detail">
  <section class="preview" aria-label="Live preview">
    <div class="frame16x9">
      <iframe id="preview" src="${root}preview/${esc(t.slug)}/${esc(t.htmlFile)}" sandbox="allow-scripts" title="${esc(t.name)} live preview" loading="eager"></iframe>
    </div>
    <div class="controls">
      <button type="button" id="prev" aria-label="Previous slide">← Prev</button>
      <span id="counter" aria-live="polite">–</span>
      <button type="button" id="next" aria-label="Next slide">Next →</button>
      <a class="full" href="${root}preview/${esc(t.slug)}/${esc(t.htmlFile)}" target="_blank" rel="noopener">Open full screen ↗</a>
    </div>
    <p class="hint">Tip: click into the preview and use the arrow keys. <span class="zh">点击预览区后可用方向键翻页。</span></p>
  </section>

  <aside class="actions">
    <h2>Use this template</h2>
    <ol class="steps small">
      <li>Download the pack and unzip it.</li>
      <li>Open your coding agent (Claude Code, Codex, Cursor, …) in that folder.</li>
      <li>Paste the prompt and answer its questions.</li>
    </ol>
    <div class="btn-row">
      <a class="btn primary" href="${root}zip/${esc(t.slug)}.zip" download>Download assets (.zip)</a>
    </div>
    <p class="zh help">下载素材包，解压后在该文件夹中打开你的 coding agent。</p>
    <div class="btn-row">
      <button type="button" class="btn" data-copy="prompt-en">Copy prompt</button>
      <button type="button" class="btn ghost" data-copy="prompt-zh">复制中文提示词</button>
    </div>
    <p class="zh help">复制提示词，粘贴给 coding agent；它会先问你用途、页数、内容和密度。</p>
    <p class="copy-status" role="status" aria-live="polite"></p>
    <details>
      <summary>Show prompt</summary>
      <pre id="prompt-en" class="prompt">${esc(t.promptEn)}</pre>
    </details>
    <details>
      <summary>查看中文提示词</summary>
      <pre id="prompt-zh" class="prompt" lang="zh">${esc(t.promptZh)}</pre>
    </details>
  </aside>
</div>

<section class="about">
  <h2>Design</h2>
  <p>${esc(t.description || t.tagline)}</p>
  <dl class="meta">
    <dt>Mood</dt><dd>${tags(t.mood)}</dd>
    <dt>Tone</dt><dd>${tags(t.tone)}</dd>
    <dt>Scheme</dt><dd>${esc(t.scheme)}</dd>
    <dt>Formality</dt><dd>${esc(t.formality)}</dd>
    <dt>Density</dt><dd>${esc(t.density)}</dd>
    <dt>Slides in demo</dt><dd id="slide-total" title="Counted from the live preview">–</dd>
    <dt>Good for</dt><dd>${esc(t.best_for)}</dd>
    <dt>Avoid for</dt><dd>${esc(t.avoid_for)}</dd>
  </dl>
  <h3>Palette</h3>
  ${t.palette.description ? `<p class="muted">${esc(t.palette.description)}</p>` : ''}
  <ul class="swatches">${swatches}</ul>
  <h3>Typography</h3>
  <ul class="typo">${typo}</ul>
  ${t.typography.style ? `<p class="muted">${esc(t.typography.style)}</p>` : ''}
  ${shots ? `<h3>Screenshots</h3><div class="shots">${shots}</div>` : ''}
</section>

<section class="attribution">
  <h2>Attribution</h2>
  <p><strong>${esc(t.name)}</strong> was created by ${authorList(t.authors)} and is published in ${link(t.sourceRepoUrl, t.sourceRepoName)} under the ${esc(t.license)} license. Original files: ${link(t.sourceDirUrl, t.sourceDirUrl.replace(/^https?:\/\//, ''))}.</p>
  ${derived}
  ${companion}
  <p>${SITE_NAME} only previews and repackages these openly licensed files; the download includes the original license files. This is not the author's official site. <span class="zh">本站仅预览并重新打包上述开源文件，下载包内附原许可证；本站不是原作者的官方站点。</span></p>
</section>`;

  return layout({
    root,
    title: `${t.name}: ${SITE_NAME}`,
    description: t.tagline,
    body,
    scripts: ['assets/detail.js'],
  });
}

// ---------------------------------------------------------------------------

export function creditsPage({ sources, templates }) {
  const root = '';
  const blocks = sources.map((s) => {
    const list = templates.filter((t) => t.source === s.id)
      .map((t) => `<li><a href="t/${esc(t.slug)}/">${esc(t.name)}</a>: ${link(t.sourceDirUrl, 'original')} · ${esc(t.license)}</li>`).join('\n');
    const comp = s.companion
      ? `<p>Companion: ${link(s.companion.repo, s.companion.name)} by ${esc(s.companion.author)} (${esc(s.companion.license)}). The packs use its fixed-stage <code>design.md</code> edition and <code>viewport-base.css</code>; its license ships as <code>LICENSE-skill</code>.</p>`
      : '';
    return `<section class="credit">
  <h2>${esc(s.name)}</h2>
  <p>${link(s.repo, s.repo.replace(/^https?:\/\//, ''))} by ${s.authorUrl ? link(s.authorUrl, s.author) : esc(s.author)} (${esc(s.license)}). Its license ships in every pack as <code>LICENSE-templates</code>.</p>
  ${comp}
  <ul>
${list}
  </ul>
</section>`;
  }).join('\n');
  const body = `<h1>Credits</h1>
<p>${SITE_NAME} is an independent community gallery. Every template belongs to its author and is used under its open license. Nothing here is an official project of the original authors.</p>
<p class="zh">${SITE_NAME} 是独立的社区画廊。所有模板版权归原作者所有，按其开源许可证使用；本站不是原作者的官方项目。</p>
${blocks}`;
  return layout({ root, title: `Credits: ${SITE_NAME}`, description: 'Template authors, sources and licenses.', body });
}
