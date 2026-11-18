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
// The original a derivative source is based on: { name, author, authorUrl?, url, license }.
const derivedLink = (d) => link(d.url, d.name);
const derivedAuthor = (d) => (d.authorUrl ? link(d.authorUrl, d.author) : esc(d.author));
const githubIcon = '<svg class="github-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.94.1-.73.4-1.22.72-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.78 10.78 0 0 1 5.64 0c2.15-1.45 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z"/></svg>';

// ---------------------------------------------------------------------------
// UI strings
// ---------------------------------------------------------------------------

const STRINGS = {
  en: {
    navHome: 'Home',
    navTemplates: 'Gallery',
    navCredits: 'Credits',
    skipContent: 'Skip to content',
    langLabel: 'Language',
    tagline: 'Open HTML slide templates with prompts, for coding agents.',
    intro: 'Preview a template, download its asset pack, and hand the prompt to your coding agent to build your own deck.',
    heroEyebrow: 'THE OPEN SLIDE LIBRARY',
    heroExplore: 'Explore templates',
    featuredLabel: 'A LOOK INSIDE THE LIBRARY',
    galleryEyebrow: 'THE COLLECTION',
    galleryHeading: 'Find your next look.',
    galleryIntro: 'Browse the collection, find a direction, and make it yours.',
    home: {
      label: 'A COMMON GROUND FOR UNCOMMON SLIDES',
      headline: ['MAKE ROOM', 'FOR IDEAS.'],
      subline: 'Open HTML slide templates, with the design system and prompt to make them your own. Pick a look. Bring your story.',
      formatLabel: 'HTML slides. Open by design.',
      totalLabel: 'designs to start with',
      browse: 'Explore the gallery',
      showcaseLabel: 'SELECTED DESIGNS',
      showcaseTitle: 'Different stories. Different looks.',
      showcaseText: 'A few starting points. Not a single house style.',
      showcaseAction: 'View all templates',
      carouselPrevious: 'Previous template',
      carouselNext: 'Next template',
      carouselRole: 'carousel',
      carouselPause: 'Pause autoplay',
      carouselPlay: 'Start autoplay',
      carouselHint: 'Scroll over the cards to explore · scroll outside to continue',
      previewAction: 'Explore this design',
      processLabel: 'FROM TEMPLATE TO YOUR TALK',
      processTitle: ['Your story.', 'A head start.'],
      processIntro: 'You bring the ideas. The pack brings the visual language. Your coding agent puts them together.',
      packLabel: 'Inside every pack',
      packNote: 'Design notes, reference slides, fonts and licenses. All in one download.',
      processTitles: ['Find a direction', 'Give your agent the prompt', 'Make it your own'],
      processDescriptions: [
        'Browse the gallery and flip through the slides. Choose the typography, colors and rhythm that suit your talk.',
        'Copy the prompt from the template page into your coding agent. Download the asset pack if you want the files locally.',
        'Describe your audience and content. Your agent builds a self-contained HTML deck in the same design language.',
      ],
      originLabel: 'CREDIT WHERE IT BELONGS',
      originTitle: ['Made by people.', 'Shared with everyone.'],
      originText: 'This is an independent community gallery. The templates, their makers, and their original sources are credited openly. Every download includes the applicable licenses.',
      originAction: 'Meet the makers',
      closingLabel: 'READY WHEN YOU ARE',
      closingTitle: ['Find your', 'starting point.'],
    },
    steps: ['<strong>Preview</strong> a template and page through it.', '<strong>Download</strong> the asset pack and unzip it.', '<strong>Paste the prompt</strong> into your coding agent in that folder.'],
    indexTitle: `${SITE_NAME}: HTML slide templates for coding agents`,
    filters: {
      label: 'Filter templates', search: 'Search', searchPlaceholder: 'Name, mood, tone, use…', source: 'Source', scheme: 'Scheme', mood: 'Mood',
      moreMoods: 'More moods', moreFilters: 'More filters', clear: 'Clear filters', count: '{n} of {total} templates', none: 'No template matches these filters.',
    },
    schemeNames: { light: 'Light', dark: 'Dark', mixed: 'Mixed' },
    by: (who) => `by ${who}`,
    byFrom: (who, from) => `by ${who} · from ${from}`,
    byDerived: (who, d) => `by ${who} · based on ${derivedLink(d)} by ${derivedAuthor(d)}`,
    byDerivedPlain: (d) => `based on ${d.name} by ${d.author}`,
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
    attrCompanion: (c) => (c.providesDesign
      ? `The design notes (<code>design.md</code>, fixed-stage edition) and <code>viewport-base.css</code> in the pack come from ${link(c.dirUrl, c.repoName)} by ${esc(c.author)} (${esc(c.license)}).`
      : `<code>viewport-base.css</code> in the pack comes from ${link(c.dirUrl, c.repoName)} by ${esc(c.author)} (${esc(c.license)}); its license ships as <code>LICENSE-skill</code>.`),
    attrDerivedSource: (d, t) => `<strong>${esc(t.name)}</strong> is a derivative work. Its visual direction (fonts, colors, signature elements) is based on ${derivedLink(d)} by ${derivedAuthor(d)} (${esc(d.license)}); the layouts, demo content and design system were written by ${authorList(t.authors)}. ${derivedAuthor(d)} did not make, review or endorse this template.`,
    attrNotOfficial: `${SITE_NAME} only previews and repackages these openly licensed files; the download includes the original license files. This is not the author's official site.`,
    attrTranslation: '',
    footerBy: (s, links) => `Templates by ${authorLink(s)} (${esc(s.license)}): ${links}${s.derivedFrom ? ` · ${s.derivedFrom.slugs ? 'some are ' : ''}based on ${derivedLink(s.derivedFrom)} by ${derivedAuthor(s.derivedFrom)}, who did not make or endorse them` : ''}`,
    footerIndependent: `${SITE_NAME} is an independent community gallery, not affiliated with the original authors.`,
    footerCredits: 'Credits &amp; licenses',
    creditsTitle: `Credits: ${SITE_NAME}`,
    creditsDescription: 'Template authors, sources and licenses.',
    creditsHeading: 'Credits',
    creditsBack: 'Back to the introduction',
    creditsCatalog: 'Template credits',
    creditsCount: (count) => `${count} templates`,
    creditsIntro: `${SITE_NAME} is an independent community gallery. Every template belongs to its author and is used under its open license. Nothing here is an official project of the original authors.`,
    creditsTranslation: '',
    creditsSource: (s) => `${link(s.repo, bare(s.repo))} by ${authorLink(s)} (${esc(s.license)}). Its license ships in every pack as <code>${esc(s.packLicenseName ?? 'LICENSE-templates')}</code>.`,
    creditsDerived: (d, s) => `${d.slugs ? 'Some of these templates are derivative works (the rest are original): their' : 'These templates are derivative works: their'} visual direction (fonts, colors, signature elements) is based on ${derivedLink(d)} by ${derivedAuthor(d)} (${esc(d.license)}). The layouts, demo content and design systems were written by ${esc(s.author)}. ${derivedAuthor(d)} did not make, review or endorse them.`,
    creditsCompanion: (c) => `Companion: ${link(c.repo, c.name)} by ${esc(c.author)} (${esc(c.license)}). The packs use its ${c.designOverride ? 'fixed-stage <code>design.md</code> edition and ' : ''}<code>viewport-base.css</code>; its license ships as <code>LICENSE-skill</code>.`,
    creditsOriginal: 'original',
  },
  zh: {
    navHome: '首页',
    navTemplates: '模板',
    navCredits: '致谢',
    skipContent: '跳转到正文',
    langLabel: '语言',
    tagline: '开放的 HTML 幻灯片模板，附带给 coding agent 的提示词。',
    intro: '在线预览模板，下载素材包，把提示词交给你的 coding agent，生成你自己的幻灯片。',
    heroEyebrow: '开放的幻灯片设计库',
    heroExplore: '探索模板',
    featuredLabel: '模板预览',
    galleryEyebrow: '设计合集',
    galleryHeading: '找到下一份灵感。',
    galleryIntro: '浏览不同设计方向，找到适合你的那一个。',
    home: {
      label: '开放的幻灯片设计库',
      headline: ['让想法', '更有分量。'],
      subline: '开放的 HTML 幻灯片模板，附带完整设计说明与提示词。选一个喜欢的风格，把你的故事交给 coding agent。',
      formatLabel: '用代码表达，用设计讲述。',
      totalLabel: '种设计，等你开始',
      browse: '浏览模板画廊',
      showcaseLabel: '设计选集',
      showcaseTitle: '不同的故事，不同的表达。',
      showcaseText: '不只有一种风格，每个想法都值得被认真呈现。',
      showcaseAction: '查看全部模板',
      carouselPrevious: '上一个模板',
      carouselNext: '下一个模板',
      carouselRole: '轮播',
      carouselPause: '暂停自动轮播',
      carouselPlay: '开启自动轮播',
      carouselHint: '在卡片上滚动切换 · 移到卡片外继续浏览',
      previewAction: '探索这个设计',
      processLabel: '使用方法',
      processTitle: ['你带来故事，', '设计有了起点。'],
      processIntro: '不必从空白页开始。模板给出设计语言，你负责内容，coding agent 负责把它们变成作品。',
      packLabel: '一个素材包，完整的设计语言',
      packNote: '设计说明、参考幻灯片、字体与许可证，一次下载。',
      processTitles: ['选一个方向', '把提示词交给 agent', '讲你自己的故事'],
      processDescriptions: [
        '在画廊里逐页预览，找到适合你的字体、配色与版式，而不是只看一张封面。',
        '复制详情页的提示词，粘贴到 coding agent。也可以下载素材包，在本地使用。',
        '告诉 agent 你的演讲内容与听众，沿用这套设计语言，生成一份独立的 HTML 幻灯片。',
      ],
      originLabel: '开放的设计来源',
      originTitle: ['设计有所来，', '灵感有所往。'],
      originText: '这是独立的社区画廊。每套模板均清楚标注作者与原始来源，素材包附有适用的许可证；本站并非原作者的官方项目。',
      originAction: '了解作者与来源',
      closingLabel: '现在开始',
      closingTitle: ['从好设计', '开始。'],
    },
    steps: ['<strong>预览</strong>模板并翻页查看。', '<strong>下载</strong>素材包并解压。', '在该文件夹中把<strong>提示词</strong>粘贴给你的 coding agent。'],
    indexTitle: `${SITE_NAME}：给 coding agent 用的 HTML 幻灯片模板`,
    filters: {
      label: '筛选模板', search: '搜索', searchPlaceholder: '名称、情绪、语气、用途……', source: '来源', scheme: '配色方案', mood: '情绪',
      moreMoods: '更多情绪', moreFilters: '更多筛选', clear: '清除筛选', count: '共 {total} 个模板，显示 {n} 个', none: '没有符合筛选条件的模板。',
    },
    schemeNames: { light: '浅色', dark: '深色', mixed: '混合' },
    by: (who) => `作者：${who}`,
    byFrom: (who, from) => `作者：${who} · 来源：${from}`,
    byDerived: (who, d) => `作者：${who} · 基于 ${derivedAuthor(d)} 的 ${derivedLink(d)}`,
    byDerivedPlain: (d) => `基于 ${d.author} 的 ${d.name}`,
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
    attrCompanion: (c) => (c.providesDesign
      ? `素材包中的设计说明（<code>design.md</code>，固定画布版）和 <code>viewport-base.css</code> 来自 ${esc(c.author)} 的 ${link(c.dirUrl, c.repoName)}（${esc(c.license)}）。`
      : `素材包中的 <code>viewport-base.css</code> 来自 ${esc(c.author)} 的 ${link(c.dirUrl, c.repoName)}（${esc(c.license)}），许可证文件为 <code>LICENSE-skill</code>。`),
    attrDerivedSource: (d, t) => `<strong>${esc(t.name)}</strong> 是衍生作品。它的视觉方向（字体、配色、标志性元素）基于 ${derivedAuthor(d)} 的 ${derivedLink(d)}（${esc(d.license)}）；版式、演示内容和设计系统由 ${authorList(t.authors)} 编写。${derivedAuthor(d)} 并未制作、审阅或认可此模板。`,
    attrNotOfficial: `${SITE_NAME} 仅预览并重新打包上述开源文件，下载的素材包内附原许可证文件。本站不是原作者的官方站点。`,
    attrTranslation: `本站中文页面上的介绍文字由 ${SITE_NAME} 翻译自上游的英文文本（上游为 MIT 许可）；译文由本项目提供，以英文原文为准。`,
    footerBy: (s, links) => `模板来自 ${authorLink(s)}（${esc(s.license)}）：${links}${s.derivedFrom ? ` · ${s.derivedFrom.slugs ? '其中部分' : ''}基于 ${derivedAuthor(s.derivedFrom)} 的 ${derivedLink(s.derivedFrom)}（其作者并未制作或认可这些模板）` : ''}`,
    footerIndependent: `${SITE_NAME} 是独立的社区画廊，与原作者无关联。`,
    footerCredits: '致谢与许可证',
    creditsTitle: `致谢：${SITE_NAME}`,
    creditsDescription: '模板作者、来源与许可证。',
    creditsHeading: '致谢',
    creditsBack: '返回首页介绍',
    creditsCatalog: '模板署名清单',
    creditsCount: (count) => `${count} 套模板`,
    creditsIntro: `${SITE_NAME} 是独立的社区画廊。所有模板版权归原作者所有，按其开源许可证使用；本站内容均不是原作者的官方项目。`,
    creditsTranslation: `本站中文页面上的模板介绍（简介、设计说明、适用场景、情绪与语气标签等）由 ${SITE_NAME} 翻译自上游的英文文本；上游文本为 MIT 许可，译文由本项目提供，以英文原文为准。模板名称、字体名称和色值保持原样。`,
    creditsSource: (s) => `${link(s.repo, bare(s.repo))}，作者 ${authorLink(s)}（${esc(s.license)}）。每个素材包都附带其许可证文件 <code>${esc(s.packLicenseName ?? 'LICENSE-templates')}</code>。`,
    creditsDerived: (d, s) => `${d.slugs ? '其中部分模板是衍生作品（其余为原创）：' : '这些模板是衍生作品：'}视觉方向（字体、配色、标志性元素）基于 ${derivedAuthor(d)} 的 ${derivedLink(d)}（${esc(d.license)}）；版式、演示内容和设计系统由 ${esc(s.author)} 编写。${derivedAuthor(d)} 并未制作、审阅或认可这些模板。`,
    creditsCompanion: (c) => `配套项目：${esc(c.author)} 的 ${link(c.repo, c.name)}（${esc(c.license)}）。素材包使用其${c.designOverride ? '固定画布版 <code>design.md</code> 和 ' : ''}<code>viewport-base.css</code>，许可证文件为 <code>LICENSE-skill</code>。`,
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
<html lang="${HTML_LANG[lang]}"${page === 'index.html' ? ' class="home-document"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${redirect}<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${alternates}
<link rel="stylesheet" href="${root}assets/site.css">
${page === 'index.html' ? `<link rel="stylesheet" href="${root}assets/home.css">` : ''}
</head>
<body${page === 'index.html' ? ' class="home-page"' : page === 'credits.html' ? ' class="credits-page"' : ''}>
<a class="skip-link" href="#main-content">${S.skipContent}</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${home}index.html">${SITE_NAME}</a>
    <nav class="site-nav">
      <a href="${home}index.html"${page === 'index.html' ? ' aria-current="page"' : ''}>${S.navHome}</a><a href="${home}gallery/"${page === 'gallery/index.html' ? ' aria-current="page"' : ''}>${S.navTemplates}</a><a href="${home}credits.html"${page === 'credits.html' ? ' aria-current="page"' : ''}>${S.navCredits}</a>
      <span class="lang-switch" role="group" aria-label="${S.langLabel}">
        <span class="lang-current" lang="${HTML_LANG[lang]}" aria-current="true">${LANG_NAME[lang]}</span>
        <a href="${esc(altHref(other))}" hreflang="${HTML_LANG[other]}" lang="${HTML_LANG[other]}" data-lang-switch="${other}">${LANG_NAME[other]}</a>
      </span>
    </nav>
  </div>
</header>
<main id="main-content" tabindex="-1" class="wrap${page === 'index.html' ? ' home-main' : page === 'credits.html' ? ' credits-main' : page === 'gallery/index.html' ? ' gallery-main' : ' detail-main'}">
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
  return `<footer class="site-footer compact-footer"><div class="wrap"><span>${SITE_NAME}</span><a href="${home}credits.html">${S.footerCredits}</a></div></footer>`;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export function indexPage({ templates, lang }) {
  const S = STRINGS[lang];
  const H = S.home;
  const page = 'index.html';
  const root = rootFor(pagePath(lang, page));
  const shots = templates.filter((t) => t.thumb?.small);
  const preferred = ['editorial-forest', 'swiss-modern', 'dark-botanical', 'minimal-pitch', 'bold-signal', 'vintage-editorial', 'biennale-yellow', 'neon-cyber', 'pink-script', 'paper-and-ink', 'cobalt-grid', 'pastel-geometry', 'retro-windows', 'electric-studio', 'sakura-chroma', 'terminal-green'];
  const featured = [...new Set([...preferred.map((slug) => shots.find((template) => template.slug === slug)), ...shots].filter(Boolean))].slice(0, 16);
  const wall = [featured.slice(0, 4), featured.slice(4, 8), featured.slice(8, 12), featured.slice(12, 16)].map((column) => {
    const tiles = column.map((template) => `<span class="hero-wall-tile"><img src="${root}assets/screenshots/${esc(template.thumb.small.file)}" width="${template.thumb.small.width}" height="${template.thumb.small.height}" alt="" decoding="async"></span>`).join('');
    return `<div class="hero-wall-column"><div class="hero-wall-track"><div class="hero-wall-group">${tiles}</div><div class="hero-wall-group">${tiles}</div></div></div>`;
  }).join('');
  const arrow = '<span class="round-arrow" aria-hidden="true">↗</span>';
  const boundary = '<div class="chapter-anchor" aria-hidden="true"></div>';
  const showcase = featured.map((template, index) => {
    const shot = template.thumb;
    return `<a class="home-work" href="t/${esc(template.slug)}/" data-slide="${index}"${index > 1 ? ' hidden' : ''}>
      <span class="home-work-image"><img src="${root}assets/screenshots/${esc(shot.file)}" srcset="${root}assets/screenshots/${esc(shot.small.file)} ${shot.small.width}w, ${root}assets/screenshots/${esc(shot.file)} ${shot.width}w" sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1600px) 46vw, 700px" width="${shot.width}" height="${shot.height}" loading="lazy" decoding="async" alt=""><span class="work-open">${esc(H.previewAction)} ${arrow}</span></span>
      <span class="home-work-caption"><span class="work-name" lang="en">${esc(template.name)}</span><span class="work-index">${String(index + 1).padStart(2, '0')}</span></span>
    </a>`;
  }).join('\n');
  const sourceNames = footerSources.filter((s) => templates.some((t) => t.source === s.id))
    .map((source) => `<a href="${esc(source.repo)}"${lang === 'zh' ? ' lang="en"' : ''}><span class="source-name">${githubIcon}<span>${esc(source.name)}<small>${esc(source.author)} · ${esc(source.license)}</small></span></span>${arrow}</a>`).join('');
  const body = `${boundary}<section class="home-chapter home-hero" aria-labelledby="home-title">
  <div class="home-section-top"><span class="eyebrow">01 / ${esc(H.label)}</span><span class="hero-edition">${esc(H.formatLabel)}</span></div>
  <div class="home-hero-content"><h1 id="home-title"><span class="hero-line">${esc(H.headline[0])}</span><span class="hero-line">${esc(H.headline[1])}</span></h1>${featured.length ? `<div class="hero-wall" aria-hidden="true">${wall}</div>` : ''}</div>
  <div class="home-hero-bottom"><span class="hero-count"><strong>${String(templates.length).padStart(2, '0')}</strong><span>${esc(H.totalLabel)}</span></span><p>${esc(H.subline)}</p><a class="home-pill" href="gallery/">${esc(H.browse)} ${arrow}</a></div>
</section>
${boundary}<section class="home-chapter home-showcase" aria-labelledby="showcase-title">
  <div class="home-section-top"><span class="eyebrow">02 / ${esc(H.showcaseLabel)}</span><a class="home-text-link" href="gallery/">${esc(H.showcaseAction)} <span aria-hidden="true">↗</span></a></div>
  <div class="home-showcase-content"><h2 id="showcase-title">${esc(H.showcaseTitle)}</h2><div class="home-carousel" role="region" aria-roledescription="${esc(H.carouselRole)}" aria-labelledby="showcase-title" tabindex="0"><div class="home-carousel-viewport"><div class="home-work-grid" id="home-carousel-track">${showcase}</div></div><div class="home-carousel-controls" hidden><span class="carousel-position" aria-live="off" aria-atomic="true"></span><span class="carousel-hint">${esc(H.carouselHint)}</span><div><button type="button" class="carousel-play" data-pause-label="${esc(H.carouselPause)}" data-play-label="${esc(H.carouselPlay)}" aria-label="${esc(H.carouselPause)}"><span class="carousel-play-icon" aria-hidden="true"></span></button><button type="button" data-carousel-direction="-1" aria-controls="home-carousel-track" aria-label="${esc(H.carouselPrevious)}">←</button><button type="button" data-carousel-direction="1" aria-controls="home-carousel-track" aria-label="${esc(H.carouselNext)}">→</button></div></div></div></div>
</section>
${boundary}<section class="home-chapter home-process" id="how-it-works" aria-labelledby="process-title">
  <div class="home-section-top"><span class="eyebrow">03 / ${esc(H.processLabel)}</span><span class="chapter-counter" aria-hidden="true">03 — 05</span></div>
  <div class="home-process-grid"><div class="home-process-heading"><h2 id="process-title">${H.processTitle.map((line) => `<span>${esc(line)}</span>`).join('')}</h2><p>${esc(H.processIntro)}</p>
    <div class="pack-note"><span>${esc(H.packLabel)}</span><div class="pack-files"><code>design.md</code><code>template.html</code><code>PROMPT.md</code></div><p>${esc(H.packNote)}</p></div>
  </div>
  <ol class="home-process-steps">${H.processTitles.map((title, index) => `<li><span class="home-step-number">0${index + 1}</span><div><h3>${esc(title)}</h3><p>${esc(H.processDescriptions[index])}</p></div></li>`).join('')}</ol></div>
</section>
${boundary}<section class="home-chapter home-origin" id="origins" aria-labelledby="origin-title">
  <div class="home-section-top"><span class="eyebrow">04 / ${esc(H.originLabel)}</span><span class="chapter-counter" aria-hidden="true">04 — 05</span></div>
  <div class="home-origin-content"><div><h2 id="origin-title">${H.originTitle.map((line) => `<span>${esc(line)}</span>`).join('')}</h2><a class="home-text-link" href="credits.html">${esc(H.originAction)} <span aria-hidden="true">↗</span></a></div><div><p>${esc(H.originText)}</p><div class="home-source-list">${sourceNames}</div></div></div>
</section>
${boundary}<section class="home-chapter home-closing" aria-labelledby="closing-title"><div class="home-section-top"><span class="eyebrow">05 / ${esc(H.closingLabel)}</span><span class="chapter-counter" aria-hidden="true">05 — 05</span></div><div class="home-closing-content"><div><h2 id="closing-title">${H.closingTitle.map((line) => `<span>${esc(line)}</span>`).join('')}</h2><a class="home-pill" href="gallery/">${esc(H.browse)} ${arrow}</a></div><a class="closing-orbit" href="gallery/" aria-label="${esc(H.browse)}"><span aria-hidden="true">↗</span></a></div></section>`;
  return layout({ lang, page, title: S.indexTitle, description: S.tagline, body, scripts: ['assets/home.js'], redirectToPreferred: lang === 'en' });
}

export function galleryPage({ templates, lang, zhTerm = () => null }) {
  const S = STRINGS[lang];
  const F = S.filters;
  const page = 'gallery/index.html';
  const root = rootFor(pagePath(lang, page));
  const home = root + LANG_DIR[lang];

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
    return `<li data-source="${esc(t.source)}" data-scheme="${esc(t.scheme)}" data-mood="${esc(t.mood.map((m) => m.toLowerCase()).join('|'))}" data-search="${esc(search)}"><a class="card" href="${home}t/${esc(t.slug)}/">
    ${img}
    <div class="card-body">
      <h2${lang === 'en' ? '' : ' lang="en"'}>${esc(t.name)}</h2>
      <p${taglineZh ? '' : en}>${esc(taglineZh || t.tagline)}</p>
      <p class="by"><span class="chip scheme-chip scheme-${esc(t.scheme)}">${esc(S.schemeNames[t.scheme] ?? t.scheme)}</span> ${esc(S.by(t.authors.map((a) => a.name).join(', ')))}${t.sourceDerived ? ` · ${esc(S.byDerivedPlain(t.sourceDerived))}` : ''}</p>
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

  const body = `<section class="collection-heading" id="collection">
  <div class="collection-title"><p class="eyebrow">${esc(S.galleryEyebrow)} / ${String(templates.length).padStart(2, '0')}</p><h1>${esc(S.galleryHeading)}</h1><p>${esc(S.galleryIntro)}</p></div>
  <div class="fsearch" hidden><label for="q">${F.search}</label><input id="q" type="search" placeholder="${esc(F.searchPlaceholder)}" autocomplete="off" aria-controls="grid"></div>
</section>
<section class="filters" id="filters" aria-label="${F.label}" hidden>
  <div class="filter-toolbar">${schemeGroup}</div>
  <details class="filter-extra"><summary>${F.moreFilters}</summary>${sourceGroup}${moodGroup}</details>
  <p class="fstatus"><span id="fcount" role="status" aria-live="polite" data-template="${esc(F.count)}" data-total="${templates.length}"></span> <button type="button" id="fclear" class="linklike" hidden>${F.clear}</button></p>
</section>
<ul class="grid" id="grid">
${cards}
</ul>
<p id="fnone" class="muted" hidden>${F.none}</p>`;
  return layout({ lang, page, title: `${S.galleryHeading} · ${SITE_NAME}`, description: S.galleryIntro, body, scripts: ['assets/gallery.js'] });
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

  const body = `<p class="crumb"><a href="${home}gallery/">${S.allTemplates}</a></p>
<section class="hero">
  <h1${en}>${esc(t.name)}</h1>
  <p class="tagline"${tagline.a}>${esc(tagline.v)}</p>
  <p class="by">${t.sourceDerived ? S.byDerived(link(t.sourceDirUrl, t.authors.map((a) => a.name).join(', ')), t.sourceDerived) : S.byFrom(authorList(t.authors), link(t.sourceDirUrl, t.sourceRepoName))}</p>
</section>

<div class="detail">
  <div class="detail-workspace">
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
  </div>

  <div class="details">
<section class="about">
  <h2>${S.design}</h2>
  ${S.sourceNote(t) ? `<p class="source-note">${S.sourceNote(t)}</p>` : ''}
  <p${description.a}>${esc(description.v)}</p>
  <div class="design-specs">
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
  <div class="design-tokens">
  <h3>${S.palette}</h3>
  ${paletteNote.v ? `<p class="muted"${paletteNote.a}>${esc(paletteNote.v)}</p>` : ''}
  <ul class="swatches">${swatches}</ul>
  <h3>${S.typography}</h3>
  <ul class="typo">${typo}</ul>
  ${typoStyle.v ? `<p class="muted"${typoStyle.a}>${esc(typoStyle.v)}</p>` : ''}
  </div>
  </div>
  ${shots ? `<div class="design-references"><h3>${S.screenshots}</h3><div class="shots">${shots}</div></div>` : ''}
</section>

<section class="attribution">
  <h2>${S.attribution}</h2>
  <p>${S.attrMain(t)}</p>
  ${t.derived ? `<p>${S.attrDerived(t.derived)}</p>` : ''}
  ${t.sourceDerived ? `<p>${S.attrDerivedSource(t.sourceDerived, t)}</p>` : ''}
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
  const blocks = sources.map((s, index) => {
    const sourceTemplates = templates.filter((t) => t.source === s.id);
    const list = sourceTemplates
      .map((t) => `<li><a href="t/${esc(t.slug)}/"${lang === 'en' ? '' : ' lang="en"'}>${esc(t.name)}</a><span>${link(t.sourceDirUrl, S.creditsOriginal)} · ${esc(t.license)}</span></li>`).join('\n');
    return `<section class="credit">
  <div class="credit-heading"><span class="eyebrow">0${index + 1} / ${esc(S.creditsCount(sourceTemplates.length))}</span><h2><a href="${esc(s.repo)}"${lang === 'zh' ? ' lang="en"' : ''}>${githubIcon}${esc(s.name)}</a></h2><span class="credit-license">${esc(s.license)}</span></div>
  <div class="credit-body">
  <p>${S.creditsSource(s)}</p>
  ${s.derivedFrom ? `<p>${S.creditsDerived(s.derivedFrom, s)}</p>` : ''}
  ${s.companion ? `<p>${S.creditsCompanion(s.companion)}</p>` : ''}
  <details class="credit-catalog"><summary>${esc(S.creditsCatalog)} <span>${sourceTemplates.length}</span></summary><ul>
${list}
  </ul></details></div>
</section>`;
  }).join('\n');
  const body = `<section class="credits-hero"><div class="wrap"><div class="credits-top"><span class="eyebrow">04 / ${S.creditsHeading}</span><a href="index.html#origins">${S.creditsBack} ↗</a></div><div class="credits-intro"><h1>${S.home.originTitle.map((line) => `<span>${esc(line)}</span>`).join('')}</h1><p>${S.creditsIntro}</p></div></div></section>
<div class="wrap credits-content">${blocks}
${S.creditsTranslation ? `<aside class="credits-translation"><p>${S.creditsTranslation}</p></aside>` : ''}</div>`;
  return layout({ lang, page, title: S.creditsTitle, description: S.creditsDescription, body });
}
