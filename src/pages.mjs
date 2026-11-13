// Page templates for the generated site. Pure functions: data in, HTML string out.
//
// Two complete page trees are generated: English at the site root and Chinese under
// zh/. Shared assets (css/js/screenshots/preview/zip) exist once, at the site root.
// All links are relative, so the site works from any base path (GitHub Pages project
// sites live under /<repo>/) and from file://.
//
// Every UI string comes from STRINGS[lang]; a page uses exactly one language.
// Upstream template data (tagline, design description, best_for / avoid_for, mood / tone
// tags, palette usage, typography style) is shown in Chinese on the zh pages when
// src/i18n/zh.json has a translation (t.zh, resolved by the build). A missing one falls
// back to the English text, marked lang="en". Names, font names and hex codes stay as is.

export const SITE_NAME = 'slides-commons';
export const LANGS = ['en', 'zh'];
const LANG_DIR = { en: '', zh: 'zh/' };
const HTML_LANG = { en: 'en', zh: 'zh-CN' };
const LANG_NAME = { en: 'English', zh: '中文' };
export const LANG_STORAGE_KEY = 'slides-commons:lang';

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const repoName = (url) => url.replace(/\/+$/, '').split('/').pop();
const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const authorList = (authors) => authors.map((a) => (a.url ? link(a.url, a.name) : esc(a.name))).join(', ');
const authorLink = (s) => (s.authorUrl ? link(s.authorUrl, s.author) : esc(s.author));
const bare = (url) => url.replace(/^https?:\/\//, '');

// ---------------------------------------------------------------------------
// UI strings
// ---------------------------------------------------------------------------

const STRINGS = {
  en: {
    navTemplates: 'Templates',
    navCredits: 'Credits',
    langLabel: 'Language',
    tagline: 'Open HTML slide templates with prompts, for coding agents.',
    intro: 'Preview a template, download its asset pack, and hand the prompt to your coding agent to build your own deck.',
    steps: ['<strong>Preview</strong> a template and page through it.', '<strong>Download</strong> the asset pack and unzip it.', '<strong>Paste the prompt</strong> into your coding agent in that folder.'],
    indexTitle: `${SITE_NAME}: HTML slide templates for coding agents`,
    filters: {
      label: 'Filter templates', search: 'Search', searchPlaceholder: 'Name, mood, tone, use…', source: 'Source', scheme: 'Scheme', mood: 'Mood',
      moreMoods: 'More moods', clear: 'Clear filters', count: '{n} of {total} templates', none: 'No template matches these filters.',
    },
    schemeNames: { light: 'Light', dark: 'Dark', mixed: 'Mixed' },
    by: (who) => `by ${who}`,
    byFrom: (who, from) => `by ${who} · from ${from}`,
    allTemplates: '← All templates',
    livePreview: 'Live preview',
    previewTitle: (name) => `${name} live preview`,
    prev: '← Prev', prevLabel: 'Previous slide',
    next: 'Next →', nextLabel: 'Next slide',
    fullscreen: '⛶ Fullscreen',
    openTab: 'Open in new tab ↗',
    hint: 'Click into the preview and use the arrow keys to page; Esc leaves fullscreen.',
    useHeading: 'Use this template',
    useSteps: ['Download the pack and unzip it.', 'Open your coding agent (Claude Code, Codex, Cursor, …) in that folder.', 'Paste the prompt and answer its questions.'],
    download: 'Download assets (.zip)',
    copy: 'Copy prompt',
    copyHelp: 'The prompt asks about purpose, length, content and density before it builds anything. The same text ships as <code>PROMPT.md</code> in the pack.',
    showPrompt: 'Show prompt',
    design: 'Design',
    sourceNote: () => '',
    meta: { mood: 'Mood', tone: 'Tone', scheme: 'Scheme', formality: 'Formality', density: 'Density', slides: 'Slides in demo', bestFor: 'Good for', avoidFor: 'Avoid for' },
    slidesTitle: 'Counted from the live preview',
    values: {},
    palette: 'Palette',
    typography: 'Typography',
    typoRoles: {},
    screenshots: 'Screenshots',
    shotAlt: (name, n) => `${name}, slide ${n}`,
    attribution: 'Attribution',
    attrMain: (t) => `<strong>${esc(t.name)}</strong> was created by ${authorList(t.authors)} and is published in ${link(t.sourceRepoUrl, t.sourceRepoName)} under the ${esc(t.license)} license. Original files: ${link(t.sourceDirUrl, bare(t.sourceDirUrl))}.`,
    attrDerived: (d) => `Adapted from ${link(d.url, d.name)} by ${authorList(d.authors)} (${esc(d.license)}).`,
    attrCompanion: (c) => `The design notes (<code>design.md</code>, fixed-stage edition) and <code>viewport-base.css</code> in the pack come from ${link(c.dirUrl, c.repoName)} by ${esc(c.author)} (${esc(c.license)}).`,
    attrNotOfficial: `${SITE_NAME} only previews and repackages these openly licensed files; the download includes the original license files. This is not the author's official site.`,
    attrTranslation: '',
    footerBy: (s, links) => `Templates by ${authorLink(s)} (${esc(s.license)}): ${links}`,
    footerIndependent: `${SITE_NAME} is an independent community gallery, not affiliated with the original authors.`,
    footerCredits: 'Credits &amp; licenses',
    creditsTitle: `Credits: ${SITE_NAME}`,
    creditsDescription: 'Template authors, sources and licenses.',
    creditsHeading: 'Credits',
    creditsIntro: `${SITE_NAME} is an independent community gallery. Every template belongs to its author and is used under its open license. Nothing here is an official project of the original authors.`,
    creditsTranslation: '',
    creditsSource: (s) => `${link(s.repo, bare(s.repo))} by ${authorLink(s)} (${esc(s.license)}). Its license ships in every pack as <code>LICENSE-templates</code>.`,
    creditsCompanion: (c) => `Companion: ${link(c.repo, c.name)} by ${esc(c.author)} (${esc(c.license)}). The packs use its fixed-stage <code>design.md</code> edition and <code>viewport-base.css</code>; its license ships as <code>LICENSE-skill</code>.`,
    creditsOriginal: 'original',
  },
  zh: {
    navTemplates: '模板',
    navCredits: '致谢',
    langLabel: '语言',
    tagline: '开放的 HTML 幻灯片模板，附带给 coding agent 的提示词。',
    intro: '在线预览模板，下载素材包，把提示词交给你的 coding agent，生成你自己的幻灯片。',
    steps: ['<strong>预览</strong>模板并翻页查看。', '<strong>下载</strong>素材包并解压。', '在该文件夹中把<strong>提示词</strong>粘贴给你的 coding agent。'],
    indexTitle: `${SITE_NAME}：给 coding agent 用的 HTML 幻灯片模板`,
    filters: {
      label: '筛选模板', search: '搜索', searchPlaceholder: '名称、情绪、语气、用途……', source: '来源', scheme: '配色方案', mood: '情绪',
      moreMoods: '更多情绪', clear: '清除筛选', count: '共 {total} 个模板，显示 {n} 个', none: '没有符合筛选条件的模板。',
    },
    schemeNames: { light: '浅色', dark: '深色', mixed: '混合' },
    by: (who) => `作者：${who}`,
    byFrom: (who, from) => `作者：${who} · 来源：${from}`,
    allTemplates: '← 全部模板',
    livePreview: '实时预览',
    previewTitle: (name) => `${name} 实时预览`,
    prev: '← 上一页', prevLabel: '上一页',
    next: '下一页 →', nextLabel: '下一页',
    fullscreen: '⛶ 全屏',
    openTab: '在新标签页打开 ↗',
    hint: '点击预览区后可用方向键翻页；按 Esc 退出全屏。',
    useHeading: '使用此模板',
    useSteps: ['下载素材包并解压。', '在该文件夹中打开你的 coding agent（Claude Code、Codex、Cursor 等）。', '粘贴提示词，回答它的问题。'],
    download: '下载素材包（.zip）',
    copy: '复制提示词',
    copyHelp: '提示词会先询问用途、页数、内容和信息密度，再开始制作。素材包中的 <code>PROMPT.zh.md</code> 是同一份内容。',
    showPrompt: '查看提示词',
    design: '设计',
    sourceNote: (t) => `以下介绍由本站翻译，以${link(t.sourceDirUrl, '英文原文')}为准。`,
    meta: { mood: '情绪', tone: '语气', scheme: '配色方案', formality: '正式程度', density: '信息密度', slides: '演示页数', bestFor: '适用场景', avoidFor: '不适用场景' },
    slidesTitle: '根据实时预览统计',
    values: {
      light: '浅色', dark: '深色', mixed: '混合',
      low: '低', 'medium-low': '中低', medium: '中', 'medium-high': '中高', high: '高',
    },
    palette: '配色',
    typography: '字体',
    typoRoles: { display: '标题', body: '正文', mono: '等宽', serif: '衬线', sans: '无衬线', script: '手写', condensed: '窄体', secondary: '辅助', cn: '中文', jp: '日文', stencil: '模板字' },
    screenshots: '截图',
    shotAlt: (name, n) => `${name}，第 ${n} 页`,
    attribution: '署名',
    attrMain: (t) => `<strong>${esc(t.name)}</strong> 由 ${authorList(t.authors)} 创作，发布于 ${link(t.sourceRepoUrl, t.sourceRepoName)}，采用 ${esc(t.license)} 许可证。原始文件：${link(t.sourceDirUrl, bare(t.sourceDirUrl))}。`,
    attrDerived: (d) => `改编自 ${authorList(d.authors)} 的 ${link(d.url, d.name)}（${esc(d.license)}）。`,
    attrCompanion: (c) => `素材包中的设计说明（<code>design.md</code>，固定画布版）和 <code>viewport-base.css</code> 来自 ${esc(c.author)} 的 ${link(c.dirUrl, c.repoName)}（${esc(c.license)}）。`,
    attrNotOfficial: `${SITE_NAME} 仅预览并重新打包上述开源文件，下载的素材包内附原许可证文件。本站不是原作者的官方站点。`,
    attrTranslation: `本站中文页面上的介绍文字由 ${SITE_NAME} 翻译自上游的英文文本（上游为 MIT 许可）；译文由本项目提供，以英文原文为准。`,
    footerBy: (s, links) => `模板来自 ${authorLink(s)}（${esc(s.license)}）：${links}`,
    footerIndependent: `${SITE_NAME} 是独立的社区画廊，与原作者无关联。`,
    footerCredits: '致谢与许可证',
    creditsTitle: `致谢：${SITE_NAME}`,
    creditsDescription: '模板作者、来源与许可证。',
    creditsHeading: '致谢',
    creditsIntro: `${SITE_NAME} 是独立的社区画廊。所有模板版权归原作者所有，按其开源许可证使用；本站内容均不是原作者的官方项目。`,
    creditsTranslation: `本站中文页面上的模板介绍（简介、设计说明、适用场景、情绪与语气标签等）由 ${SITE_NAME} 翻译自上游的英文文本；上游文本为 MIT 许可，译文由本项目提供，以英文原文为准。模板名称、字体名称和色值保持原样。`,
    creditsSource: (s) => `${link(s.repo, bare(s.repo))}，作者 ${authorLink(s)}（${esc(s.license)}）。每个素材包都附带其许可证文件 <code>LICENSE-templates</code>。`,
    creditsCompanion: (c) => `配套项目：${esc(c.author)} 的 ${link(c.repo, c.name)}（${esc(c.license)}）。素材包使用其固定画布版 <code>design.md</code> 和 <code>viewport-base.css</code>，许可证文件为 <code>LICENSE-skill</code>。`,
    creditsOriginal: '原始文件',
  },
};

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

let footerSources = [];

// Sources shown in the footer of every page (set once by the build).
export function setSources(sources) { footerSources = sources; }

/** Site-relative output path of a page, e.g. "zh/t/neo-grid-bold/index.html". */
export function pagePath(lang, page) {
  return LANG_DIR[lang] + page;
}

// Relative prefix from a page to the site root ("", "../", "../../" …).
const rootFor = (sitePath) => '../'.repeat(sitePath.split('/').length - 1);

function layout({ lang, page, title, description, body, scripts = [], redirectToPreferred = false }) {
  const S = STRINGS[lang];
  const root = rootFor(pagePath(lang, page));
  const home = root + LANG_DIR[lang]; // this language's root
  const other = lang === 'en' ? 'zh' : 'en';
  // Explicit file names (not "dir/") so the switcher also works from file://.
  const altHref = (l) => root + pagePath(l, page);
  const alternates = LANGS.map((l) => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${esc(altHref(l))}">`).join('\n');
  // Only the English home page honours a stored language preference, and only one
  // that the visitor set explicitly with the switcher.
  const redirect = redirectToPreferred
    ? `<script>try{if(localStorage.getItem(${JSON.stringify(LANG_STORAGE_KEY)})==="zh"){location.replace(${JSON.stringify(pagePath('zh', page))}+location.search+location.hash)}}catch(e){}</script>\n`
    : '';
  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${redirect}<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${alternates}
<link rel="stylesheet" href="${root}assets/site.css">
</head>
<body>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${home}index.html">${SITE_NAME}</a>
    <nav class="site-nav">
      <a href="${home}index.html">${S.navTemplates}</a><a href="${home}credits.html">${S.navCredits}</a>
      <span class="lang-switch" role="group" aria-label="${S.langLabel}">
        <span class="lang-current" lang="${HTML_LANG[lang]}" aria-current="true">${LANG_NAME[lang]}</span>
        <a href="${esc(altHref(other))}" hreflang="${HTML_LANG[other]}" lang="${HTML_LANG[other]}" data-lang-switch="${other}">${LANG_NAME[other]}</a>
      </span>
    </nav>
  </div>
</header>
<main class="wrap">
${body}
</main>
${footer(lang, home)}
${['assets/site.js', ...scripts].map((s) => `<script src="${root}${s}"></script>`).join('\n')}
</body>
</html>
`;
}

function footer(lang, home) {
  const S = STRINGS[lang];
  const lines = footerSources.map((s) => {
    const parts = [link(s.repo, repoName(s.repo))];
    if (s.companion) parts.push(link(s.companion.repo, repoName(s.companion.repo)));
    return `<p>${S.footerBy(s, parts.join(' · '))}</p>`;
  }).join('\n    ');
  return `<footer class="site-footer">
  <div class="wrap">
    ${lines}
    <p>${S.footerIndependent} <a href="${home}credits.html">${S.footerCredits}</a></p>
  </div>
</footer>`;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export function indexPage({ templates, lang, zhTerm = () => null }) {
  const S = STRINGS[lang];
  const F = S.filters;
  const page = 'index.html';
  const root = rootFor(pagePath(lang, page));

  const en = lang === 'en' ? '' : ' lang="en"';
  const cards = templates.map((t) => {
    const small = t.thumb?.small;
    const img = small
      ? `<img src="${root}assets/screenshots/${esc(small.file)}" width="${small.width}" height="${small.height}" loading="lazy" decoding="async" alt="">`
      : '<div class="noimg"></div>';
    const z = lang === 'zh' ? t.zh : null;
    // On the zh page search matches the Chinese and the English text; the en page stays English.
    const search = [t.name, t.tagline, ...t.mood, ...t.tone, t.best_for, t.slug,
      ...(z ? [z.tagline, z.best_for, ...z.mood, ...z.tone] : [])].filter(Boolean).join(' ').toLowerCase();
    const taglineZh = z?.tagline;
    return `<li data-source="${esc(t.source)}" data-scheme="${esc(t.scheme)}" data-mood="${esc(t.mood.map((m) => m.toLowerCase()).join('|'))}" data-search="${esc(search)}"><a class="card" href="t/${esc(t.slug)}/">
    ${img}
    <div class="card-body">
      <h2${lang === 'en' ? '' : ' lang="en"'}>${esc(t.name)}</h2>
      <p${taglineZh ? '' : en}>${esc(taglineZh || t.tagline)}</p>
      <p class="by"><span class="chip scheme-chip scheme-${esc(t.scheme)}">${esc(S.schemeNames[t.scheme] ?? t.scheme)}</span> ${esc(S.by(t.authors.map((a) => a.name).join(', ')))}</p>
    </div>
  </a></li>`;
  }).join('\n');

  // Filter groups are built from the data, so new sources / schemes / moods appear on their own.
  const count = (fn) => { const m = new Map(); for (const t of templates) for (const v of fn(t)) m.set(v, (m.get(v) ?? 0) + 1); return m; };
  const moodLabel = (v) => (lang === 'zh' ? zhTerm(v) : null);
  const chip = (group, value, label, n) => {
    const zhLabel = group === 'mood' ? moodLabel(value) : null;
    const attr = group === 'mood' && !zhLabel && lang === 'zh' ? ' lang="en"' : '';
    return `<button type="button" class="chip" data-group="${group}" data-value="${esc(value)}" aria-pressed="false"${attr}>${esc(zhLabel || label)} <span class="n">${n}</span></button>`;
  };

  const sources = footerSources.filter((s) => templates.some((t) => t.source === s.id));
  const sourceGroup = sources.length > 1
    ? `<div class="fgroup" role="group" aria-label="${F.source}"><span class="flabel">${F.source}</span>${sources.map((s) => chip('source', s.id, s.name, templates.filter((t) => t.source === s.id).length)).join('')}</div>`
    : '';
  const schemes = count((t) => [t.scheme]);
  const schemeGroup = `<div class="fgroup" role="group" aria-label="${F.scheme}"><span class="flabel">${F.scheme}</span>${['light', 'dark', 'mixed'].filter((v) => schemes.has(v)).map((v) => chip('scheme', v, S.schemeNames[v], schemes.get(v))).join('')}</div>`;
  const moods = [...count((t) => t.mood.map((m) => m.toLowerCase()))].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const common = moods.filter(([, n]) => n >= 2);
  const rare = moods.filter(([, n]) => n < 2).sort((a, b) => a[0].localeCompare(b[0]));
  const moodGroup = `<div class="fgroup" role="group" aria-label="${F.mood}"><span class="flabel">${F.mood}</span>${common.map(([v, n]) => chip('mood', v, v, n)).join('')}${rare.length ? `<details class="more"><summary>${F.moreMoods} (${rare.length})</summary>${rare.map(([v, n]) => chip('mood', v, v, n)).join('')}</details>` : ''}</div>`;

  const body = `<section class="intro">
  <h1>${esc(S.tagline)}</h1>
  <p class="lead">${esc(S.intro)}</p>
  <ol class="steps">
    ${S.steps.map((s) => `<li>${s}</li>`).join('\n    ')}
  </ol>
</section>
<section class="filters" id="filters" aria-label="${F.label}" hidden>
  <div class="fsearch"><label for="q">${F.search}</label><input id="q" type="search" placeholder="${esc(F.searchPlaceholder)}" autocomplete="off"></div>
  ${sourceGroup}
  ${schemeGroup}
  ${moodGroup}
  <p class="fstatus"><span id="fcount" role="status" aria-live="polite" data-template="${esc(F.count)}" data-total="${templates.length}"></span> <button type="button" id="fclear" class="linklike" hidden>${F.clear}</button></p>
</section>
<ul class="grid" id="grid">
${cards}
</ul>
<p id="fnone" class="muted" hidden>${F.none}</p>`;
  return layout({ lang, page, title: S.indexTitle, description: S.tagline, body, scripts: ['assets/gallery.js'], redirectToPreferred: lang === 'en' });
}

export function detailPage(t, lang) {
  const S = STRINGS[lang];
  const page = `t/${t.slug}/index.html`;
  const root = rootFor(pagePath(lang, page));
  const home = root + LANG_DIR[lang];
  const en = lang === 'en' ? '' : ' lang="en"'; // mark English source content on zh pages
  const val = (v) => esc(S.values[v] ?? v);
  // Chinese text when the zh page has a translation, else the English text marked lang="en".
  const z = lang === 'zh' ? t.zh : null;
  const tr = (field, english) => (z?.[field] ? { v: z[field], a: '' } : { v: english, a: en });
  const tagline = tr('tagline', t.tagline);
  const description = tr('description', t.description || t.tagline);
  const bestFor = tr('best_for', t.best_for);
  const avoidFor = tr('avoid_for', t.avoid_for);
  const paletteNote = tr('palette_description', t.palette.description ?? '');
  const typoStyle = tr('typography_style', t.typography.style ?? '');

  const swatches = t.paletteColors.map((c) => `<li><span class="sw" style="background:${esc(c.value)}"></span><code>${esc(c.name)}</code> <code>${esc(c.value)}</code></li>`).join('');
  const typo = Object.entries(t.typography).filter(([k]) => k !== 'style')
    .map(([k, v]) => `<li><span class="k">${esc(S.typoRoles[k] ?? k)}</span> ${esc(v)}</li>`).join('');
  const tags = (arr, zarr) => arr.map((x, i) => (zarr?.[i] ? `<span class="tag">${esc(zarr[i])}</span>` : `<span class="tag"${en}>${esc(x)}</span>`)).join(' ');
  const shots = t.screenshots.map((s) => `<a href="${root}assets/screenshots/${esc(s.file)}"><img src="${root}assets/screenshots/${esc((s.small ?? s).file)}" width="${(s.small ?? s).width}" height="${(s.small ?? s).height}" loading="lazy" decoding="async" alt="${esc(S.shotAlt(t.name, s.n))}"></a>`).join('');
  const previewHref = `${root}preview/${esc(t.slug)}/${esc(t.htmlFile)}`;
  const promptId = lang === 'zh' ? 'prompt-zh' : 'prompt-en';
  const promptText = lang === 'zh' ? t.promptZh : t.promptEn;

  const body = `<p class="crumb"><a href="${home}index.html">${S.allTemplates}</a></p>
<section class="hero">
  <h1${en}>${esc(t.name)}</h1>
  <p class="tagline"${tagline.a}>${esc(tagline.v)}</p>
  <p class="by">${S.byFrom(authorList(t.authors), link(t.sourceDirUrl, t.sourceRepoName))}</p>
</section>

<div class="detail">
  <section class="preview" aria-label="${S.livePreview}">
    <div class="frame16x9" id="preview-wrap">
      <iframe id="preview" src="${previewHref}" sandbox="allow-scripts" title="${esc(S.previewTitle(t.name))}" loading="eager"></iframe>
    </div>
    <div class="controls">
      <button type="button" id="prev" aria-label="${S.prevLabel}">${S.prev}</button>
      <span id="counter" aria-live="polite">–</span>
      <button type="button" id="next" aria-label="${S.nextLabel}">${S.next}</button>
      <span class="view">
        <button type="button" id="fullscreen" hidden>${S.fullscreen}</button>
        <a class="ctl open-tab" href="${previewHref}" target="_blank" rel="noopener">${S.openTab}</a>
      </span>
    </div>
    <p class="hint">${S.hint}</p>
  </section>

  <aside class="actions">
    <h2>${S.useHeading}</h2>
    <ol class="steps small">
      ${S.useSteps.map((s) => `<li>${s}</li>`).join('\n      ')}
    </ol>
    <div class="btn-row">
      <a class="btn primary" href="${root}zip/${esc(t.slug)}.zip" download>${S.download}</a>
    </div>
    <div class="btn-row">
      <button type="button" class="btn" data-copy="${promptId}">${S.copy}</button>
    </div>
    <p class="help">${S.copyHelp}</p>
    <p class="copy-status" role="status" aria-live="polite"></p>
    <details>
      <summary>${S.showPrompt}</summary>
      <pre id="${promptId}" class="prompt">${esc(promptText)}</pre>
    </details>
  </aside>

  <div class="details">
<section class="about">
  <h2>${S.design}</h2>
  ${S.sourceNote(t) ? `<p class="source-note">${S.sourceNote(t)}</p>` : ''}
  <p${description.a}>${esc(description.v)}</p>
  <dl class="meta">
    <dt>${S.meta.mood}</dt><dd>${tags(t.mood, z?.mood)}</dd>
    <dt>${S.meta.tone}</dt><dd>${tags(t.tone, z?.tone)}</dd>
    <dt>${S.meta.scheme}</dt><dd>${val(t.scheme)}</dd>
    <dt>${S.meta.formality}</dt><dd>${val(t.formality)}</dd>
    <dt>${S.meta.density}</dt><dd>${val(t.density)}</dd>
    <dt>${S.meta.slides}</dt><dd id="slide-total" title="${S.slidesTitle}">–</dd>
    <dt>${S.meta.bestFor}</dt><dd${bestFor.a}>${esc(bestFor.v)}</dd>
    <dt>${S.meta.avoidFor}</dt><dd${avoidFor.a}>${esc(avoidFor.v)}</dd>
  </dl>
  <h3>${S.palette}</h3>
  ${paletteNote.v ? `<p class="muted"${paletteNote.a}>${esc(paletteNote.v)}</p>` : ''}
  <ul class="swatches">${swatches}</ul>
  <h3>${S.typography}</h3>
  <ul class="typo">${typo}</ul>
  ${typoStyle.v ? `<p class="muted"${typoStyle.a}>${esc(typoStyle.v)}</p>` : ''}
  ${shots ? `<h3>${S.screenshots}</h3><div class="shots">${shots}</div>` : ''}
</section>

<section class="attribution">
  <h2>${S.attribution}</h2>
  <p>${S.attrMain(t)}</p>
  ${t.derived ? `<p>${S.attrDerived(t.derived)}</p>` : ''}
  ${t.companionInfo ? `<p>${S.attrCompanion(t.companionInfo)}</p>` : ''}
  <p>${S.attrNotOfficial}</p>
  ${S.attrTranslation ? `<p>${S.attrTranslation}</p>` : ''}
</section>
  </div>
</div>`;

  return layout({ lang, page, title: `${t.name} · ${SITE_NAME}`, description: tagline.v, body, scripts: ['assets/detail.js'] });
}

export function creditsPage({ sources, templates, lang }) {
  const S = STRINGS[lang];
  const page = 'credits.html';
  const blocks = sources.map((s) => {
    const list = templates.filter((t) => t.source === s.id)
      .map((t) => `<li><a href="t/${esc(t.slug)}/"${lang === 'en' ? '' : ' lang="en"'}>${esc(t.name)}</a>: ${link(t.sourceDirUrl, S.creditsOriginal)} · ${esc(t.license)}</li>`).join('\n');
    return `<section class="credit">
  <h2>${esc(s.name)}</h2>
  <p>${S.creditsSource(s)}</p>
  ${s.companion ? `<p>${S.creditsCompanion(s.companion)}</p>` : ''}
  <ul>
${list}
  </ul>
</section>`;
  }).join('\n');
  const body = `<h1>${S.creditsHeading}</h1>
<p>${S.creditsIntro}</p>
${S.creditsTranslation ? `<p>${S.creditsTranslation}</p>` : ''}
${blocks}`;
  return layout({ lang, page, title: S.creditsTitle, description: S.creditsDescription, body });
}
