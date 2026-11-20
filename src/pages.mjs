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

import { zhText } from './zh-text.mjs';

export const SITE_NAME = 'slides-commons';
export const LANGS = ['en', 'zh'];
const LANG_DIR = { en: '', zh: 'zh/' };
const HTML_LANG = { en: 'en', zh: 'zh-CN' };
const LANG_NAME = { en: 'English', zh: '中文' };
export const LANG_STORAGE_KEY = 'slides-commons:lang';
// Where this site's own source (build scripts, metadata, demo slides) is published.
export const SITE_REPO = 'https://github.com/NeoSunxz/slides-commons';

// Decorative up-right arrow as inline SVG (U+2197 renders as a colour emoji on iOS).
export function arrowIcon() {
  return '<svg class="arrow-icon" viewBox="0 0 14 14" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 10.5 10.5 3.5M4.5 3.5h6v6"/></svg>';
}

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const repoName = (url) => url.replace(/\/+$/, '').split('/').pop();
const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const authorList = (authors) => authors.map((a) => (a.url ? link(a.url, a.name) : esc(a.name))).join(', ');
const authorLink = (s) => (s.authorUrl ? link(s.authorUrl, s.author) : esc(s.author));
const bare = (url) => url.replace(/^https?:\/\//, '');
// Author shown for a source: the Chinese name on zh pages when the source has one.
// zh pages show the source's Chinese author name (authorZh) where the template's author is the source's author.
const localAuthors = (t, lang) => (lang === 'zh' && t.src?.authorZh ? t.authors.map((a) => (a.name === t.src.author ? { ...a, name: t.src.authorZh } : a)) : t.authors);
// Source name: the Chinese name on zh pages when the source has one (nameZh).
const srcName = (s, lang) => (lang === 'zh' && s.nameZh ? s.nameZh : s.name);
const srcAuthor = (s, lang) => (lang === 'zh' && s.authorZh ? s.authorZh : s.author);
const srcAuthorLink = (s, lang) => (s.authorUrl ? link(s.authorUrl, srcAuthor(s, lang)) : esc(srcAuthor(s, lang)));
const githubIcon = (size = 24) => `<svg class="github-icon" viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
// The original a derivative source is based on: { name, author, authorUrl?, url, license }.
const derivedLink = (d) => (d.url ? link(d.url, d.name) : esc(d.name));
const derivedAuthor = (d) => (d.authorUrl ? link(d.authorUrl, d.author) : esc(d.author));

// ---------------------------------------------------------------------------
// UI strings
// ---------------------------------------------------------------------------

const STRINGS = {
  en: {
    navHome: 'Home',
    navTemplates: 'Gallery',
    navCredits: 'Credits',
    navConvert: 'Convert',
    navSkills: 'Skills',
    skipContent: 'Skip to content',
    langLabel: 'Language',
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
      extras: [
        ['Already have a deck you like?', 'Turn it into a template', 'convert/'],
        ['Working with Claude Code or another agent?', 'Install the skills', 'skills/'],
      ],
      processTitles: ['Find a direction', 'Give your agent the prompt', 'Make it your own'],
      processDescriptions: [
        'Browse the gallery and flip through the slides. Choose the typography, colors and rhythm that suit your talk.',
        'Copy the prompt from the template page and paste it into your coding agent, ideally in an empty folder. It downloads the template pack itself. Offline? The zip is one link away.',
        'Answer its questions about your audience and content. Your agent builds a self-contained HTML deck in the same design language.',
      ],
      processDescriptionsManual: [
        'Browse the gallery and flip through the slides. Choose the typography, colors and rhythm that suit your talk.',
        'Download the asset pack and unzip it. Open your coding agent in that folder and paste the prompt from the template page.',
        'Answer its questions about your audience and content. Your agent builds a self-contained HTML deck in the same design language.',
      ],
      originLabel: 'CREDIT WHERE IT BELONGS',
      originTitle: ['Made by people.', 'Shared with everyone.'],
      originText: 'This is an independent community gallery. The templates, their makers, and their original sources are credited openly. Every download includes the applicable licenses.',
      originAction: 'Meet the makers',
      closingLabel: 'READY WHEN YOU ARE',
      closingTitle: ['Find your', 'starting point.'],
    },
    githubLabel: 'GitHub repository',
    tagline: 'Open HTML slide templates with prompts, for coding agents.',
    intro: 'Preview a template, download its asset pack, and hand the prompt to your coding agent to build your own deck.',
    introAuto: 'Preview a template, copy its prompt, and your coding agent fetches the pack and builds the deck.',
    stepsAuto: ['<strong>Preview</strong> a template and page through it.', '<strong>Copy the prompt</strong> and paste it into your coding agent, ideally in an empty folder. It downloads the template pack itself.', '<strong>Answer its questions</strong>; it builds your deck.'],
    steps: ['<strong>Preview</strong> a template and page through it.', '<strong>Download</strong> the asset pack and unzip it.', '<strong>Paste the prompt</strong> into your coding agent in that folder.'],
    indexTitle: `${SITE_NAME}: HTML slide templates for coding agents`,
    filters: {
      label: 'Filter templates', search: 'Search', searchPlaceholder: 'Name, mood, tone, use…', author: 'Author', license: 'License', scheme: 'Scheme', mood: 'Mood',
      moreFilters: 'More filters', clear: 'Clear filters', count: '{n} of {total} templates', none: 'No template matches these filters.',
    },
    schemeNames: { light: 'Light', dark: 'Dark', mixed: 'Mixed' },
    by: (who) => `by ${who}`,
    byFrom: (who, from) => `by ${who} · from ${from}`,
    byOriginal: (who) => `by ${who}`,
    byDerived: (who, d) => `by ${who} · based on ${link(d.url, d.shortName ?? d.name)} by ${derivedAuthor(d)}`,
    byCard: (who) => `by ${who}`,
    allTemplates: '← All templates',
    livePreview: 'Live preview',
    previewTitle: (name) => `${name} live preview`,
    prev: '← Prev', prevLabel: 'Previous slide',
    next: 'Next →', nextLabel: 'Next slide',
    fullscreen: '⛶ Fullscreen',
    openTab: `Open in new tab ${arrowIcon()}`,
    hint: 'Click into the preview and use the arrow keys to page; Esc leaves fullscreen.',
    useHeading: 'Use this template',
    useStepsAuto: ['Copy the prompt.', 'Paste it into your coding agent (Claude Code, Codex, Cursor, …), ideally in an empty folder. It downloads the template pack itself.', 'Answer its questions.'],
    downloadLink: 'Offline? Download the pack (.zip)',
    offlineNote: 'Unzip it in your working folder, then paste the prompt.',
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
    licenseBadgeTitle: (l) => `Licensed under ${l}: read the license notice before you use this template`,
    licenseNoticeTitle: (l) => `License notice: ${l}`,
    licenseNotice: (n) => `This template is licensed under the ${link(n.licenseUrl, n.license)} by ${n.authorUrl ? link(n.authorUrl, n.author) : esc(n.author)}. Decks generated from it may count as derivative works and may have to be released under the ${esc(n.license)} as well${n.network ? ' (including offering their source code to anyone who uses them over a network)' : ''}. Evaluate this before any commercial or closed-source use. Read the ${link(n.licenseUrl, 'license')} and the ${link(n.repoUrl, 'original repository')}. This is general information, not legal advice.`,
    previewModified: (t) => `This live preview is a modified copy of ${link(t.sourceDirUrl, 'the original template')} by ${authorList(t.authors)}: a paging bridge and self-hosted fonts were added${t.demoSlides ? ', and demo slides were written for this site (the original does not ship a complete demo deck)' : ''}. The modifications are published in the ${link(SITE_REPO, `${SITE_NAME} repository`)}.`,
    internalBadge: 'Internal',
    internalBadgeTitle: (n) => `Internal template of ${n}: for internal use only`,
    internalNoticeTitle: 'Internal template',
    internalNotice: (n) => `This template belongs to ${esc(n)} and is for internal use only. Do not distribute the pack, or decks that reproduce its design, outside ${esc(n)}.`,
    attrInternal: (n) => `Internal template of ${esc(n)}. ${SITE_NAME} only previews and packages it; it is not an official site of the template's author.`,
    footerInternal: (s, name, lang, c) => `Internal templates: ${name} · by ${esc(srcAuthor(s, lang))} · ${esc(s.license)}${c ? ` · <code>viewport-base.css</code> from ${link(c.repo, repoName(c.repo))} by ${esc(c.author)} (${esc(c.license)})` : ''}`,
    creditsInternal: (s, lang) => `Internal source (not published). Maintained by ${srcAuthorLink(s, lang)}. Terms: ${esc(s.license)}. Every pack carries its license file (<code>${esc(s.packLicenseName ?? 'LICENSE')}</code>) or, without one, a <code>NOTICE.txt</code> marking it for internal use only.`,
    creditsIntroInternal: 'Templates marked Internal belong to the organisation that runs this site and are for its internal use only.',
    attrNotOfficial: `${SITE_NAME} only previews and repackages these openly licensed files; it is not the author's official site.`,
    showMore: 'Show more',
    showLess: 'Show less',
    paletteHint: 'Hover or focus a color to see its name and value.',
    specimenSample: 'Aa Bb Cc 0123456789',
    shotJump: 'Jump the preview to this slide',
    shotsHint: 'Click a screenshot to jump the live preview to that slide.',
    attrFacts: { author: 'Author', original: 'Original', license: 'License', source: 'Source' },
    attrTranslation: () => '',
    footerBy: (s, links, lang) => `Templates by ${srcAuthorLink(s, lang)} (${esc(s.license)}) · ${links}${s.derivedFrom ? ` · ${s.derivedFrom.slugs ? 'some ' : ''}based on ${derivedLink(s.derivedFrom)} by ${derivedAuthor(s.derivedFrom)}` : ''}`,
    footerIndependent: `${SITE_NAME} is an independent gallery, not affiliated with the original authors.`,
    footerCredits: 'Credits &amp; licenses',
    creditsTitle: `Credits: ${SITE_NAME}`,
    creditsDescription: 'Template authors, sources and licenses.',
    creditsHeading: 'Credits',
    creditsIntro: `${SITE_NAME} is an independent community gallery. Every template belongs to its author and is used under its open license. Nothing here is an official project of the original authors.`,
    creditsTranslation: '',
    creditsSource: (s, lang) => `${link(s.repo, bare(s.repo))} by ${srcAuthorLink(s, lang)} (${esc(s.license)}). Its license ships in every pack as <code>${esc(s.packLicenseName ?? 'LICENSE-templates')}</code>.`,
    creditsDerived: (d, s) => `${d.slugs ? 'Some of these templates are derivative works (the rest are original): their' : 'These templates are derivative works: their'} visual direction (fonts, colors, signature elements) is based on ${derivedLink(d)} by ${derivedAuthor(d)} (${esc(d.license)}). The layouts, demo content and design systems were written by ${esc(s.author)}. ${derivedAuthor(d)} did not make, review or endorse them.`,
    creditsCompanion: (c) => `Companion: ${link(c.repo, c.name)} by ${esc(c.author)} (${esc(c.license)}). The packs use its ${c.designOverride ? 'fixed-stage <code>design.md</code> edition and ' : ''}<code>viewport-base.css</code>; its license ships as <code>LICENSE-skill</code>.`,
    creditsOriginal: 'original',
    creditsBack: 'Back to the introduction',
    creditsCatalog: 'Template credits',
    creditsCount: (count) => `${count} templates`,
  },
  zh: {
    navHome: '首页',
    navTemplates: '画廊',
    navCredits: '致谢',
    navConvert: '转换',
    navSkills: '技能',
    skipContent: '跳转到正文',
    langLabel: '语言',
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
      extras: [
        ['已经有一份喜欢的幻灯片？', '把它变成模板', 'convert/'],
        ['在用 Claude Code 或其他 agent？', '安装技能', 'skills/'],
      ],
      processTitles: ['选一个方向', '把提示词交给 agent', '讲你自己的故事'],
      processDescriptions: [
        '在画廊里逐页预览，找到适合你的字体、配色与版式，而不是只看一张封面。',
        '复制模板页的提示词，粘贴给你的 coding agent（最好在空文件夹中）。它会自己下载模板素材包。离线？也可以直接下载 zip。',
        '回答 agent 关于听众与内容的问题，它会沿用这套设计语言，生成一份独立的 HTML 幻灯片。',
      ],
      processDescriptionsManual: [
        '在画廊里逐页预览，找到适合你的字体、配色与版式，而不是只看一张封面。',
        '下载素材包并解压，在该文件夹中打开你的 coding agent，粘贴模板页的提示词。',
        '回答 agent 关于听众与内容的问题，它会沿用这套设计语言，生成一份独立的 HTML 幻灯片。',
      ],
      originLabel: '开放的设计来源',
      originTitle: ['设计有所来，', '灵感有所往。'],
      originText: '这是独立的社区画廊。每套模板均清楚标注作者与原始来源，素材包附有适用的许可证；本站并非原作者的官方项目。',
      originAction: '了解作者与来源',
      closingLabel: '现在开始',
      closingTitle: ['从好设计', '开始。'],
    },
    githubLabel: 'GitHub 仓库',
    tagline: '开放的 HTML 幻灯片模板，附带给 coding agent 的提示词。',
    intro: '在线预览模板，下载素材包，把提示词交给你的 coding agent，生成你自己的幻灯片。',
    introAuto: '在线预览模板，复制它的提示词，你的 coding agent 会自己获取素材包并生成幻灯片。',
    stepsAuto: ['<strong>预览</strong>模板并翻页查看。', '<strong>复制提示词</strong>，粘贴给你的 coding agent（最好在空文件夹中）。它会自己下载模板素材包。', '<strong>回答它的问题</strong>，它会生成你的幻灯片。'],
    steps: ['<strong>预览</strong>模板并翻页查看。', '<strong>下载</strong>素材包并解压。', '在该文件夹中把<strong>提示词</strong>粘贴给你的 coding agent。'],
    indexTitle: `${SITE_NAME}：给 coding agent 用的 HTML 幻灯片模板`,
    filters: {
      label: '筛选模板', search: '搜索', searchPlaceholder: '名称、情绪、语气、用途……', author: '作者', license: '许可证', scheme: '配色方案', mood: '情绪',
      moreFilters: '更多筛选', clear: '清除筛选', count: '共 {total} 个模板，显示 {n} 个', none: '没有符合筛选条件的模板。',
    },
    schemeNames: { light: '浅色', dark: '深色', mixed: '混合' },
    by: (who) => `作者：${who}`,
    byFrom: (who, from) => `作者：${who} · 来源：${from}`,
    byOriginal: (who) => `${who} 出品`,
    byDerived: (who, d) => `${who} 出品 · 基于 ${derivedAuthor(d)} 的${link(d.url, d.shortNameZh ?? d.name)}`,
    byCard: (who) => `${who} 出品`,
    allTemplates: '← 全部模板',
    livePreview: '实时预览',
    previewTitle: (name) => `${name} 实时预览`,
    prev: '← 上一页', prevLabel: '上一页',
    next: '下一页 →', nextLabel: '下一页',
    fullscreen: '⛶ 全屏',
    openTab: `在新标签页打开 ${arrowIcon()}`,
    hint: '点击预览区后可用方向键翻页；按 Esc 退出全屏。',
    useHeading: '使用此模板',
    useStepsAuto: ['复制提示词。', '粘贴给你的 coding agent（Claude Code、Codex、Cursor 等），最好在空文件夹中。它会自己下载模板素材包。', '回答它的问题。'],
    downloadLink: '离线？下载素材包（.zip）',
    offlineNote: '在工作文件夹中解压，再粘贴提示词。',
    useSteps: ['下载素材包并解压。', '在该文件夹中打开你的 coding agent（Claude Code、Codex、Cursor 等）。', '粘贴提示词，回答它的问题。'],
    download: '下载素材包（.zip）',
    copy: '复制提示词',
    copyHelp: '提示词会先询问用途、页数、内容和信息密度，再开始制作。素材包中的 <code>PROMPT.zh.md</code> 是同一份内容。',
    showPrompt: '查看提示词',
    design: '设计',
    sourceNote: (t, enUrl) => `以下介绍由本站翻译，以${link(t.src?.overlay || !t.sourceDirUrl ? enUrl : t.sourceDirUrl, '英文原文')}为准。`,
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
    licenseBadgeTitle: (l) => `采用 ${l} 许可：使用此模板前请先阅读许可证提示`,
    licenseNoticeTitle: (l) => `许可证提示：${l}`,
    licenseNotice: (n) => `本模板由${n.authorUrl ? link(n.authorUrl, n.authorZh ?? n.author) : esc(n.authorZh ?? n.author)}以 ${link(n.licenseUrl, n.license)} 许可发布。用它生成的幻灯片可能被视为衍生作品，并可能需要同样以 ${esc(n.license)} 发布${n.network ? '（包括向通过网络使用它的人提供源代码）' : ''}。用于商业或闭源用途之前请先评估。请阅读${link(n.licenseUrl, '许可证全文')}和${link(n.repoUrl, '原始仓库')}。以上为一般性提示，不构成法律意见。`,
    previewModified: (t) => `此实时预览是${authorList(t.authors)}的${link(t.sourceDirUrl, '原始模板')}的修改副本：增加了翻页脚本和自托管字体${t.demoSlides ? '，并为本站编写了演示页面（原作者未提供完整的演示幻灯片）' : ''}。这些修改发布在 ${link(SITE_REPO, `${SITE_NAME} 仓库`)}中。`,
    internalBadge: '内部',
    internalBadgeTitle: (n) => zhText`${n}的内部模板：仅限内部使用`,
    internalNoticeTitle: '内部模板',
    internalNotice: (n) => zhText`本模板属于${esc(n)}，仅限内部使用。请勿将素材包或复刻其设计的幻灯片在${esc(n)}之外传播。`,
    attrInternal: (n) => zhText`${esc(n)}的内部模板。${SITE_NAME} 仅负责预览与打包，不是模板作者的官方站点。`,
    footerInternal: (s, name, lang, c) => `内部模板：${name} · ${esc(srcAuthor(s, lang))} 出品 · ${esc(s.license)}${c ? ` · <code>viewport-base.css</code> 来自 ${esc(c.author)} 的 ${link(c.repo, repoName(c.repo))}（${esc(c.license)}）` : ''}`,
    creditsInternal: (s, lang) => `内部来源（未公开发布）。维护者：${srcAuthorLink(s, lang)}。使用条款：${esc(s.license)}。每个素材包附带其许可证文件（<code>${esc(s.packLicenseName ?? 'LICENSE')}</code>）；没有时附 <code>NOTICE.txt</code>，注明仅限内部使用。`,
    creditsIntroInternal: '标有“内部”的模板属于运营本站的组织，仅限其内部使用。',
    attrNotOfficial: `${SITE_NAME} 仅预览并重新打包这些开源文件，不是原作者的官方站点。`,
    showMore: '展开',
    showLess: '收起',
    paletteHint: '悬停或聚焦某个颜色，可查看它的名称和色值。',
    specimenSample: 'Aa Bb Cc 0123456789',
    shotJump: '把预览跳到这一页',
    shotsHint: '点击截图，实时预览会跳到对应的页面。',
    attrFacts: { author: '作者', original: '原始文件', license: '许可证', source: '来源' },
    attrTranslation: (t, enUrl) => t.src?.overlay
      ? `本站中文页面上的介绍文字由 ${SITE_NAME} 翻译自本站为该模板编写的${link(enUrl, '英文介绍')}；译文由本项目提供，以英文原文为准。`
      : `本站中文页面上的介绍文字由 ${SITE_NAME} 翻译自上游的英文文本（上游为 ${esc(t.license)} 许可）；译文由本项目提供，以英文原文为准。`,
    footerBy: (s, links, lang) => `模板来自 ${srcAuthorLink(s, lang)}（${esc(s.license)}） · ${links}${s.derivedFrom ? ` · ${s.derivedFrom.slugs ? '部分' : ''}基于 ${derivedAuthor(s.derivedFrom)} 的 ${derivedLink(s.derivedFrom)}` : ''}`,
    footerIndependent: `${SITE_NAME} 是独立画廊，与原作者无关联。`,
    footerCredits: '致谢与许可证',
    creditsTitle: `致谢：${SITE_NAME}`,
    creditsDescription: '模板作者、来源与许可证。',
    creditsHeading: '致谢',
    creditsIntro: `${SITE_NAME} 是独立的社区画廊。所有模板版权归原作者所有，按其开源许可证使用；本站内容均不是原作者的官方项目。`,
    creditsTranslation: `本站中文页面上的模板介绍（简介、设计说明、适用场景、情绪与语气标签等）由 ${SITE_NAME} 翻译自上游的英文文本；上游文本按各自的许可证发布（见各模板页面），译文由本项目提供，以英文原文为准。模板名称、字体名称和色值保持原样。`,
    creditsSource: (s, lang) => `${link(s.repo, bare(s.repo))}，作者 ${srcAuthorLink(s, lang)}（${esc(s.license)}）。每个素材包都附带其许可证文件 <code>${esc(s.packLicenseName ?? 'LICENSE-templates')}</code>。`,
    creditsDerived: (d, s) => `${d.slugs ? '其中部分模板是衍生作品（其余为原创）：' : '这些模板是衍生作品：'}视觉方向（字体、配色、标志性元素）基于 ${derivedAuthor(d)} 的 ${derivedLink(d)}（${esc(d.license)}）；版式、演示内容和设计系统由 ${esc(s.author)} 编写。${derivedAuthor(d)} 并未制作、审阅或认可这些模板。`,
    creditsCompanion: (c) => `配套项目：${esc(c.author)} 的 ${link(c.repo, c.name)}（${esc(c.license)}）。素材包使用其${c.designOverride ? '固定画布版 <code>design.md</code> 和 ' : ''}<code>viewport-base.css</code>，许可证文件为 <code>LICENSE-skill</code>。`,
    creditsOriginal: '原始文件',
    creditsBack: '返回首页介绍',
    creditsCatalog: '模板署名清单',
    creditsCount: (count) => `${count} 套模板`,
  },
};

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

let footerSources = [];

// Sources shown in the footer of every page (set once by the build).
// Label of the pack download button on detail pages (the prompt quotes it).
export const downloadLabel = (lang) => (autoDownload ? STRINGS[lang].downloadLink : STRINGS[lang].download);

export function setSources(sources) { footerSources = sources; }

// True when the build has a site URL: the prompt then downloads the pack itself, so the
// usage steps start with copying the prompt and the zip becomes the offline fallback.
let autoDownload = false;
export function setAutoDownload(v) { autoDownload = Boolean(v); }
export const isAutoDownload = () => autoDownload;

/** Site-relative output path of a page, e.g. "zh/t/neo-grid-bold/index.html". */
export function pagePath(lang, page) {
  return LANG_DIR[lang] + page;
}

// Relative prefix from a page to the site root ("", "../", "../../" …).
export const rootFor = (sitePath) => '../'.repeat(sitePath.split('/').length - 1);

export function layout({ lang, page, title, description, body, scripts = [], redirectToPreferred = false, styles = [], extraHead = '' }) {
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
  const isHome = page === 'index.html';
  const kind = isHome ? 'home' : page === 'credits.html' ? 'credits' : page === 'gallery/index.html' ? 'gallery' : page === 'convert/index.html' ? 'convert' : page === 'skills/index.html' ? 'skills' : 'detail';
  const cur = (k) => (kind === k ? ' aria-current="page"' : '');
  return `<!doctype html>
<html lang="${HTML_LANG[lang]}"${isHome ? ' class="home-document"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${redirect}<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${alternates}
<link rel="stylesheet" href="${root}assets/site.css">
${styles.map((c) => `<link rel="stylesheet" href="${root}${c}">`).join('\n')}
</head>
<body class="${kind}-page">
<a class="skip-link" href="#main-content">${S.skipContent}</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${home}index.html">${SITE_NAME}</a>
    <nav class="site-nav">
      <a href="${home}index.html"${cur('home')}>${S.navHome}</a><a href="${home}gallery/"${kind === 'gallery' ? ' aria-current="page"' : ''}>${S.navTemplates}</a><a href="${home}convert/"${cur('convert')}>${S.navConvert}</a><a href="${home}skills/"${cur('skills')}>${S.navSkills}</a><a href="${home}credits.html"${cur('credits')}>${S.navCredits}</a>
      <span class="lang-switch" role="group" aria-label="${S.langLabel}">
        <span class="lang-current" lang="${HTML_LANG[lang]}" aria-current="true">${LANG_NAME[lang]}</span>
        <a href="${esc(altHref(other))}" hreflang="${HTML_LANG[other]}" lang="${HTML_LANG[other]}" data-lang-switch="${other}">${LANG_NAME[other]}</a>
      </span>
      <a class="gh-link" href="${SITE_REPO}" aria-label="${S.githubLabel}" title="${S.githubLabel}" rel="noopener">${githubIcon(20)}</a>
    </nav>
  </div>
</header>
<main id="main-content" tabindex="-1" class="wrap ${kind}-main${isHome ? ' home-main' : ''}">
${body}
</main>
${footer(lang, home)}
${['assets/site.js', ...scripts].map((s) => `<script src="${root}${s}"></script>`).join('\n')}
</body>
</html>
`;
}

// One compact line per source: author, license, repositories (and what it is based on). Every
// author stays listed; the full credits are on the credits page.
function footer(lang, home) {
  const S = STRINGS[lang];
  const lines = footerSources.map((s) => {
    if (s.private) return `<li>${S.footerInternal(s, s.repo ? link(s.repo, srcName(s, lang)) : esc(srcName(s, lang)), lang, s.companion)}</li>`;
    const parts = [link(s.repo, repoName(s.repo))];
    if (s.companion) parts.push(link(s.companion.repo, repoName(s.companion.repo)));
    return `<li>${S.footerBy(s, parts.join(' · '), lang)}</li>`;
  }).join('\n      ');
  return `<footer class="site-footer">
  <div class="wrap">
    <ul class="footer-credits">
      ${lines}
    </ul>
    <p class="footer-note">${S.footerIndependent} <a href="${home}credits.html">${S.footerCredits}</a></p>
  </div>
</footer>`;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export function indexPage({ templates, lang, featured: featuredSlugs = [] }) {
  const S = STRINGS[lang];
  const H = S.home;
  const page = 'index.html';
  const root = rootFor(pagePath(lang, page));
  // Curated list (src/home.json): templates whose first screenshot shows finished content.
  const featured = featuredSlugs.map((slug) => templates.find((t) => t.slug === slug)).filter((t) => t?.thumb?.small);
  const wall = [0, 4, 8, 12].map((from) => featured.slice(from, from + 4)).filter((c) => c.length).map((column) => {
    const tiles = column.map((t) => `<span class="hero-wall-tile"><img src="${root}assets/screenshots/${esc(t.thumb.small.file)}" width="${t.thumb.small.width}" height="${t.thumb.small.height}" alt="" decoding="async"></span>`).join('');
    return `<div class="hero-wall-column"><div class="hero-wall-track"><div class="hero-wall-group">${tiles}</div><div class="hero-wall-group">${tiles}</div></div></div>`;
  }).join('');
  const arrow = `<span class="round-arrow" aria-hidden="true">${arrowIcon()}</span>`;
  const boundary = '<div class="chapter-anchor" aria-hidden="true"></div>';
  const en = lang === 'zh' ? ' lang="en"' : '';
  const showcase = featured.map((t, index) => {
    const shot = t.thumb;
    return `<a class="home-work" href="t/${esc(t.slug)}/" data-slide="${index}"${index > 1 ? ' hidden' : ''}>
      <span class="home-work-image"><img src="${root}assets/screenshots/${esc(shot.file)}" srcset="${root}assets/screenshots/${esc(shot.small.file)} ${shot.small.width}w, ${root}assets/screenshots/${esc(shot.file)} ${shot.width}w" sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1600px) 46vw, 700px" width="${shot.width}" height="${shot.height}" loading="lazy" decoding="async" alt=""><span class="work-open">${esc(H.previewAction)} ${arrow}</span></span>
      <span class="home-work-caption"><span class="work-name"${en}>${esc(t.name)}</span><span class="work-index">${String(index + 1).padStart(2, '0')}</span></span>
    </a>`;
  }).join('\n');
  const sourceList = footerSources.map((s) => (s.private
    ? `<a href="${s.repo ? esc(s.repo) : `credits.html#src-${esc(s.id)}`}"><span class="source-name"><span><span${s.nameZh && lang === 'zh' ? '' : en}>${esc(srcName(s, lang))}</span><small>${esc(S.internalBadge)} · ${esc(srcAuthor(s, lang))} · ${esc(s.license)}</small></span></span>${arrow}</a>`
    : `<a href="${esc(s.repo)}"><span class="source-name">${githubIcon(24)}<span><span${en}>${esc(s.name)}</span><small>${esc(srcAuthor(s, lang))} · ${esc(s.license)}</small></span></span>${arrow}</a>`)).join('');
  const steps = autoDownload ? H.processDescriptions : H.processDescriptionsManual;
  // Chapter numbers follow what is shown (the showcase needs at least one screenshot).
  const total = featured.length ? 5 : 4;
  let chapter = 0;
  const num = () => String(++chapter).padStart(2, '0');
  const counter = () => `${String(chapter).padStart(2, '0')} — ${String(total).padStart(2, '0')}`;
  const body = `${boundary}<section class="home-chapter home-hero" aria-labelledby="home-title">
  <div class="home-section-top"><span class="eyebrow">${num()} / ${esc(H.label)}</span><span class="hero-edition">${esc(H.formatLabel)}</span></div>
  <div class="home-hero-content"><h1 id="home-title"><span class="hero-line">${esc(H.headline[0])}</span><span class="hero-line">${esc(H.headline[1])}</span></h1>${featured.length ? `<div class="hero-wall" aria-hidden="true">${wall}</div>` : ''}</div>
  <div class="home-hero-bottom"><span class="hero-count"><strong>${String(templates.length).padStart(2, '0')}</strong><span>${esc(H.totalLabel)}</span></span><p>${esc(H.subline)}</p><a class="home-pill" href="gallery/">${esc(H.browse)} ${arrow}</a></div>
</section>
${featured.length ? `${boundary}<section class="home-chapter home-showcase" aria-labelledby="showcase-title">
  <div class="home-section-top"><span class="eyebrow">${num()} / ${esc(H.showcaseLabel)}</span><a class="home-text-link" href="gallery/">${esc(H.showcaseAction)} ${arrowIcon()}</a></div>
  <div class="home-showcase-content"><h2 id="showcase-title">${esc(H.showcaseTitle)}</h2><div class="home-carousel" role="region" aria-roledescription="${esc(H.carouselRole)}" aria-labelledby="showcase-title" tabindex="0"><div class="home-carousel-viewport"><div class="home-work-grid" id="home-carousel-track">${showcase}</div></div><div class="home-carousel-controls" hidden><span class="carousel-position" aria-live="off" aria-atomic="true"></span><span class="carousel-hint">${esc(H.carouselHint)}</span><div><button type="button" class="carousel-play" data-pause-label="${esc(H.carouselPause)}" data-play-label="${esc(H.carouselPlay)}" aria-label="${esc(H.carouselPause)}"><span class="carousel-play-icon" aria-hidden="true"></span></button><button type="button" data-carousel-direction="-1" aria-controls="home-carousel-track" aria-label="${esc(H.carouselPrevious)}">←</button><button type="button" data-carousel-direction="1" aria-controls="home-carousel-track" aria-label="${esc(H.carouselNext)}">→</button></div></div></div></div>
</section>` : ''}
${boundary}<section class="home-chapter home-process" id="how-it-works" aria-labelledby="process-title">
  <div class="home-section-top"><span class="eyebrow">${num()} / ${esc(H.processLabel)}</span><span class="chapter-counter" aria-hidden="true">${counter()}</span></div>
  <div class="home-process-grid"><div class="home-process-heading"><h2 id="process-title">${H.processTitle.map((line) => `<span>${esc(line)}</span>`).join('')}</h2><p>${esc(H.processIntro)}</p>
    <div class="pack-note"><span>${esc(H.packLabel)}</span><div class="pack-files"><code>design.md</code><code>template.html</code><code>PROMPT.md</code></div><p>${esc(H.packNote)}</p></div>
    <ul class="home-extras">${H.extras.map(([lead, label, href]) => `<li><span>${esc(lead)}</span> <a class="home-text-link" href="${href}">${esc(label)} ${arrowIcon()}</a></li>`).join('')}</ul>
  </div>
  <ol class="home-process-steps">${H.processTitles.map((title, index) => `<li><span class="home-step-number">0${index + 1}</span><div><h3>${esc(title)}</h3><p>${esc(steps[index])}</p></div></li>`).join('')}</ol></div>
</section>
${boundary}<section class="home-chapter home-origin" id="origins" aria-labelledby="origin-title">
  <div class="home-section-top"><span class="eyebrow">${num()} / ${esc(H.originLabel)}</span><span class="chapter-counter" aria-hidden="true">${counter()}</span></div>
  <div class="home-origin-content"><div><h2 id="origin-title">${H.originTitle.map((line) => `<span>${esc(line)}</span>`).join('')}</h2><a class="home-text-link" href="credits.html">${esc(H.originAction)} ${arrowIcon()}</a></div><div><p>${esc(H.originText)}</p><div class="home-source-list">${sourceList}</div></div></div>
</section>
${boundary}<section class="home-chapter home-closing" aria-labelledby="closing-title"><div class="home-section-top"><span class="eyebrow">${num()} / ${esc(H.closingLabel)}</span><span class="chapter-counter" aria-hidden="true">${counter()}</span></div><div class="home-closing-content"><div><h2 id="closing-title">${H.closingTitle.map((line) => `<span>${esc(line)}</span>`).join('')}</h2><a class="home-pill" href="gallery/">${esc(H.browse)} ${arrow}</a></div><a class="closing-orbit" href="gallery/" aria-label="${esc(H.browse)}">${arrowIcon()}</a></div></section>`;
  return layout({ lang, page, title: S.indexTitle, description: S.tagline, body, scripts: ['assets/home.js'], styles: ['assets/home.css'], redirectToPreferred: lang === 'en' });
}

export function galleryPage({ templates, lang, tags }) {
  const S = STRINGS[lang];
  const F = S.filters;
  const page = 'gallery/index.html';
  const root = rootFor(pagePath(lang, page));
  const home = root + LANG_DIR[lang];
  const groupLabel = (g) => (lang === 'zh' ? g.zh : g.en);

  const cards = templates.map((t) => {
    const small = t.thumb?.small;
    const img = small
      ? `<img src="${root}assets/screenshots/${esc(small.file)}" width="${small.width}" height="${small.height}" loading="lazy" decoding="async" alt="">`
      : '<div class="noimg"></div>';
    const z = lang === 'zh' ? t.zh : null;
    const labels = t.moodGroups.map((id) => groupLabel(tags.find((g) => g.id === id)));
    // Search matches the original mood and tone tags too (the filter itself shows only the groups).
    // On the zh page it matches the Chinese and the English text; the en page stays English.
    const search = [t.name, t.tagline, ...t.mood, ...t.tone, t.best_for, t.slug, ...labels, t.authors.map((a) => a.name).join(' '), t.licenseNotice ? t.license : '', t.internal ? 'internal 内部' : '',
      ...(z ? [z.tagline, z.best_for, ...z.mood, ...z.tone] : [])].filter(Boolean).join(' ').toLowerCase();
    const taglineZh = z?.tagline;
    const lic = t.licenseNotice ? `<span class="chip license-chip" title="${esc(S.licenseBadgeTitle(t.license))}">${esc(t.license)}</span>` : '';
    const internal = t.internal ? `<span class="chip internal-chip" title="${esc(S.internalBadgeTitle(lang === 'zh' && t.sourceNameZh ? t.sourceNameZh : t.sourceName))}">${esc(S.internalBadge)}</span>` : '';
    return `<li data-source="${esc(t.source)}" data-author="${esc(t.authors.map((a) => a.name).join('|'))}" data-license="${esc(t.license)}" data-scheme="${esc(t.scheme)}" data-mood="${esc(t.moodGroups.join('|'))}" data-search="${esc(search)}"><a class="card" href="${home}t/${esc(t.slug)}/">
    ${img}
    <div class="card-body">
      <h2${lang === 'en' ? '' : ' lang="en"'}>${esc(t.name)}</h2>
      <p class="tag-line" title="${esc(taglineZh || t.tagline)}"${taglineZh ? '' : (lang === 'en' ? '' : ' lang="en"')}>${esc(taglineZh || t.tagline)}</p>
      <p class="by"><span class="chip scheme-chip scheme-${esc(t.scheme)}">${esc(S.schemeNames[t.scheme] ?? t.scheme)}</span>${internal}${lic}<span class="credit-line">${esc(S.byCard(localAuthors(t, lang).map((a) => a.name).join(', ')))}</span></p>
    </div>
  </a></li>`;
  }).join('\n');

  // Filter groups are built from the data, so new authors / schemes appear on their own.
  const count = (fn) => { const m = new Map(); for (const t of templates) for (const v of fn(t)) m.set(v, (m.get(v) ?? 0) + 1); return m; };
  const chip = (group, value, label, n) => `<button type="button" class="chip" data-group="${group}" data-value="${esc(value)}" aria-pressed="false">${esc(label)} <span class="n">${n}</span></button>`;

  const authorMap = new Map();
  const authorLabel = new Map();
  for (const t of templates) localAuthors(t, lang).forEach((a, i) => authorLabel.set(t.authors[i].name, a.name));
  for (const t of templates) for (const a of t.authors) authorMap.set(a.name, (authorMap.get(a.name) ?? 0) + 1);
  const authorChips = [...authorMap].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const sourceGroup = authorChips.length > 1
    ? `<div class="fgroup" role="group" aria-label="${F.author}"><span class="flabel">${F.author}</span>${authorChips.map(([name, n]) => chip('author', name, authorLabel.get(name) ?? name, n)).join('')}</div>`
    : '';
  const licenses = count((t) => [t.license]);
  // Only offered when the gallery mixes licenses (and then a visitor can pick the ones they can use).
  const licenseGroup = licenses.size > 1
    ? `<div class="fgroup" role="group" aria-label="${F.license}"><span class="flabel">${F.license}</span>${[...licenses].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, n]) => chip('license', name, name, n)).join('')}</div>`
    : '';
  const schemes = count((t) => [t.scheme]);
  const schemeGroup = `<div class="fgroup" role="group" aria-label="${F.scheme}"><span class="flabel">${F.scheme}</span>${['light', 'dark', 'mixed'].filter((v) => schemes.has(v)).map((v) => chip('scheme', v, S.schemeNames[v], schemes.get(v))).join('')}</div>`;
  const moods = count((t) => t.moodGroups);
  const moodGroup = `<div class="fgroup" role="group" aria-label="${F.mood}"><span class="flabel">${F.mood}</span>${tags.filter((g) => moods.has(g.id)).map((g) => chip('mood', g.id, groupLabel(g), moods.get(g.id))).join('')}</div>`;
  const extra = [sourceGroup, licenseGroup].filter(Boolean).join('');

  const body = `<section class="collection-heading" id="collection">
  <div class="collection-title"><p class="eyebrow">${esc(S.galleryEyebrow)} / ${String(templates.length).padStart(2, '0')}</p><h1>${esc(S.galleryHeading)}</h1><p>${esc(S.galleryIntro)}</p></div>
  <div class="fsearch" hidden><label for="q">${F.search}</label><input id="q" type="search" placeholder="${esc(F.searchPlaceholder)}" autocomplete="off" aria-controls="grid"></div>
</section>
<section class="filters" id="filters" aria-label="${F.label}" hidden>
  <div class="filter-toolbar">${schemeGroup}${moodGroup}</div>
  ${extra ? `<details class="filter-extra"><summary>${F.moreFilters}</summary>${extra}</details>` : ''}
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
  t = { ...t, authors: localAuthors(t, lang), sourceName: lang === 'zh' && t.sourceNameZh ? t.sourceNameZh : t.sourceName };
  const enUrl = `${rootFor(pagePath(lang, `t/${t.slug}/index.html`))}t/${t.slug}/`;
  const page = `t/${t.slug}/index.html`;
  const root = rootFor(pagePath(lang, page));
  const home = root + LANG_DIR[lang];
  const en = lang === 'en' ? '' : ' lang="en"'; // mark English source content on zh pages
  const val = (v) => esc(S.values[v] ?? v);
  // Chinese text when the zh page has a translation, else the English text marked lang="en".
  const z = lang === 'zh' ? t.zh : null;
  const hasZh = Boolean(z && Object.values(z).some((v) => (Array.isArray(v) ? v.some(Boolean) : v)));
  const tr = (field, english) => (z?.[field] ? { v: z[field], a: '' } : { v: english, a: en });
  const tagline = tr('tagline', t.tagline);
  const description = tr('description', t.description || t.tagline);
  const bestFor = tr('best_for', t.best_for);
  const avoidFor = tr('avoid_for', t.avoid_for);
  const paletteNote = tr('palette_description', t.palette.description ?? '');
  const typoStyle = tr('typography_style', t.typography.style ?? '');

  // One continuous strip; name and value appear on hover / keyboard focus (and on tap).
  const swatches = t.paletteColors.map((c) => `<li><button type="button" class="swatch" style="--c:${esc(c.value)}" aria-label="${esc(`${c.name} ${c.value}`)}"><span class="swatch-tip"><b>${esc(c.name)}</b><code>${esc(c.value)}</code></span></button></li>`).join('');
  // Fonts that are self-hosted get a specimen line set in the real font (assets/specimen/<slug>.css).
  const typo = Object.entries(t.typography).filter(([k]) => k !== 'style').map(([k, v]) => {
    const sp = t.specimen?.roles?.[k];
    return `<li><span class="k">${esc(S.typoRoles[k] ?? k)}</span> <span class="fname">${esc(v)}</span>${sp ? `<span class="specimen" aria-hidden="true" style="font-family:'${esc(sp.family)}',sans-serif;font-weight:${sp.weight}">${esc(S.specimenSample)}</span>` : ''}</li>`;
  }).join('');
  const tags = (arr, zarr) => arr.map((x, i) => (zarr?.[i] ? `<span class="tag">${esc(zarr[i])}</span>` : `<span class="tag"${en}>${esc(x)}</span>`)).join(' ');
  // Each screenshot jumps the live preview to its slide (data-slide: number, "middle" or "last").
  const shots = t.screenshots.map((s) => `<a href="${root}assets/screenshots/${esc(s.file)}"${s.slide != null ? ` data-slide="${esc(s.slide)}" title="${esc(S.shotJump)}"` : ''}><img src="${root}assets/screenshots/${esc((s.small ?? s).file)}" width="${(s.small ?? s).width}" height="${(s.small ?? s).height}" loading="lazy" decoding="async" alt="${esc(S.shotAlt(t.name, s.n))}"></a>`).join('');
  const previewHref = `${root}preview/${esc(t.slug)}/${esc(t.htmlFile)}`;
  const promptId = lang === 'zh' ? 'prompt-zh' : 'prompt-en';
  const promptText = lang === 'zh' ? t.promptZh : t.promptEn;
  const authors = t.authors.map((a) => a.name).join(', ');

  const body = `<p class="crumb"><a href="${home}gallery/">${S.allTemplates}</a></p>
<section class="hero">
  <h1${en}>${esc(t.name)}</h1>
  <p class="tagline"${tagline.a}>${esc(tagline.v)}</p>
  <p class="by">${t.internal ? `<span class="chip internal-chip" title="${esc(S.internalBadgeTitle(t.sourceName))}">${esc(S.internalBadge)}</span> ` : ''}${t.licenseNotice ? `<span class="chip license-chip" title="${esc(S.licenseBadgeTitle(t.license))}">${esc(t.license)}</span> ` : ''}${t.internal ? S.byFrom(authorList(t.authors), t.sourceDirUrl ? link(t.sourceDirUrl, t.sourceName) : esc(t.sourceName)) : t.sourceDerived ? S.byDerived(link(t.sourceDirUrl, authors), t.sourceDerived) : t.src?.collection ? S.byOriginal(link(t.sourceDirUrl, authors)) : S.byFrom(authorList(t.authors), link(t.sourceDirUrl, t.sourceRepoName))}</p>
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
${t.licenseNotice ? `    <p class="modified-note">${S.previewModified(t)}</p>\n` : ''}  </section>

  <aside class="actions">
    <h2>${S.useHeading}</h2>
${t.internal ? `    <div class="license-notice internal-notice" role="note" id="internal-notice">
      <p class="license-notice-title">${esc(S.internalNoticeTitle)}</p>
      <p>${S.internalNotice(t.sourceName)}</p>
    </div>\n` : ''}${t.licenseNotice ? `    <div class="license-notice" role="note" id="license-notice">
      <p class="license-notice-title">${esc(S.licenseNoticeTitle(t.license))}</p>
      <p>${S.licenseNotice(t.licenseNotice)}</p>
    </div>\n` : ''}    <ol class="steps small">
      ${(autoDownload ? S.useStepsAuto : S.useSteps).map((s) => `<li>${s}</li>`).join('\n      ')}
    </ol>
${(() => {
    const zipHref = `${root}zip/${esc(t.slug)}.zip`;
    const dl = `<a class="btn primary" href="${zipHref}" download>${S.download}</a>`;
    const cp = `<button type="button" class="btn${autoDownload ? ' primary' : ''}" data-copy="${promptId}">${S.copy}</button>`;
    return autoDownload
      ? `    <div class="btn-row">${cp}</div>\n    <p class="help offline"><a href="${zipHref}" download>${S.downloadLink}</a><br>${S.offlineNote}</p>`
      : `    <div class="btn-row">${dl}</div>\n    <div class="btn-row">${cp}</div>`;
  })()}
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
  ${S.sourceNote(t, enUrl) && (lang !== 'zh' || hasZh) ? `<p class="source-note">${S.sourceNote(t, enUrl)}</p>` : ''}
  <div class="desc" data-more="${esc(S.showMore)}" data-less="${esc(S.showLess)}"><p id="desc"${description.a}>${esc(description.v)}</p></div>
  <div class="fit">
    <section class="fit-card good" aria-labelledby="fit-good"><h3 id="fit-good">${S.meta.bestFor}</h3><p${bestFor.a}>${esc(bestFor.v)}</p></section>
    <section class="fit-card avoid" aria-labelledby="fit-avoid"><h3 id="fit-avoid">${S.meta.avoidFor}</h3><p${avoidFor.a}>${esc(avoidFor.v)}</p></section>
  </div>
  <dl class="meta">
    <dt>${S.meta.mood}</dt><dd>${tags(t.mood, z?.mood)}</dd>
    <dt>${S.meta.tone}</dt><dd>${tags(t.tone, z?.tone)}</dd>
    <dt>${S.meta.scheme}</dt><dd>${val(t.scheme)}</dd>
    <dt>${S.meta.formality}</dt><dd>${val(t.formality)}</dd>
    <dt>${S.meta.density}</dt><dd>${val(t.density)}</dd>
    <dt>${S.meta.slides}</dt><dd id="slide-total" title="${S.slidesTitle}">–</dd>
  </dl>
  <div class="design-specs">
    <div class="design-tokens">
      <h3>${S.palette}</h3>
      ${paletteNote.v ? `<p class="muted"${paletteNote.a}>${esc(paletteNote.v)}</p>` : ''}
      <ul class="palette-strip">${swatches}</ul>
      <p class="muted small">${S.paletteHint}</p>
    </div>
    <div class="design-tokens">
      <h3>${S.typography}</h3>
      <ul class="typo">${typo}</ul>
      ${typoStyle.v ? `<p class="muted"${typoStyle.a}>${esc(typoStyle.v)}</p>` : ''}
    </div>
  </div>
  ${shots ? `<div class="design-references"><h3>${S.screenshots}</h3><p class="muted small">${S.shotsHint}</p><div class="shots">${shots}</div></div>` : ''}
</section>

<section class="attribution attr-card" aria-labelledby="attr-title">
  <h2 id="attr-title">${S.attribution}</h2>
  <dl class="attr-facts">
    <dt>${S.attrFacts.author}</dt><dd>${authorList(t.authors)}</dd>
    ${t.sourceDirUrl ? `<dt>${S.attrFacts.original}</dt><dd><a href="${esc(t.sourceDirUrl)}">${esc(bare(t.sourceDirUrl))}</a></dd>` : `<dt>${S.attrFacts.source}</dt><dd>${esc(t.sourceName)}</dd>`}
    <dt>${S.attrFacts.license}</dt><dd>${esc(t.license)}</dd>
  </dl>
  <ul class="attr-notes">
    ${t.derived ? `<li>${S.attrDerived(t.derived)}</li>` : ''}
    ${t.sourceDerived ? `<li>${S.attrDerivedSource(t.sourceDerived, t)}</li>` : ''}
    ${t.companionInfo ? `<li>${S.attrCompanion(t.companionInfo)}</li>` : ''}
    ${S.attrTranslation(t, enUrl) && (lang !== 'zh' || hasZh) ? `<li>${S.attrTranslation(t, enUrl)}</li>` : ''}
  </ul>
  <p class="attr-official">${t.internal ? S.attrInternal(t.sourceName) : S.attrNotOfficial}</p>
</section>
  </div>
</div>`;

  return layout({ lang, page, title: `${t.name} · ${SITE_NAME}`, description: tagline.v, body, scripts: ['assets/detail.js'], styles: t.specimen ? [t.specimen.css] : [] });
}

export function creditsPage({ sources, templates, lang }) {
  const S = STRINGS[lang];
  const page = 'credits.html';
  const blocks = sources.map((s, index) => {
    const sourceTemplates = templates.filter((t) => t.source === s.id).map((t) => ({ ...t, authors: localAuthors(t, lang) }));
    const list = sourceTemplates
      .map((t) => `<li><a href="t/${esc(t.slug)}/"${lang === 'en' ? '' : ' lang="en"'}>${esc(t.name)}</a><span>${t.sourceDirUrl ? `${link(t.sourceDirUrl, S.creditsOriginal)} · ` : ''}${authorList(t.authors)} · ${esc(t.license)}</span></li>`).join('\n');
    const notice = templates.find((t) => t.source === s.id && t.licenseNotice)?.licenseNotice;
    const heading = s.private
      ? (s.repo ? `<a href="${esc(s.repo)}"${lang === 'zh' && !s.nameZh ? ' lang="en"' : ''}>${esc(srcName(s, lang))}</a>` : `<span${lang === 'zh' && !s.nameZh ? ' lang="en"' : ''}>${esc(srcName(s, lang))}</span>`)
      : `<a href="${esc(s.repo)}"${lang === 'zh' ? ' lang="en"' : ''}>${githubIcon(32)}${esc(s.name)}</a>`;
    return `<section class="credit" id="src-${esc(s.id)}">
  <div class="credit-heading"><span class="eyebrow">0${index + 1} / ${esc(S.creditsCount(sourceTemplates.length))}</span><h2>${heading}</h2><span class="credit-license">${s.private ? `${esc(S.internalBadge)} · ` : ''}${esc(s.license)}</span></div>
  <div class="credit-body">
  <p>${s.private ? S.creditsInternal(s, lang) : S.creditsSource(s, lang)}</p>
  ${notice ? `<p class="license-notice"><strong>${esc(S.licenseNoticeTitle(notice.license))}</strong> ${S.licenseNotice(notice)}</p>` : ''}
  ${s.derivedFrom ? `<p>${S.creditsDerived(s.derivedFrom, s)}</p>` : ''}
  ${s.companion ? `<p>${S.creditsCompanion(s.companion)}</p>` : ''}
  <details class="credit-catalog"><summary>${esc(S.creditsCatalog)} <span>${sourceTemplates.length}</span></summary><ul>
${list}
  </ul></details></div>
</section>`;
  }).join('\n');
  const body = `<section class="credits-hero"><div class="wrap"><div class="credits-top"><span class="eyebrow">04 / ${S.creditsHeading}</span><a href="index.html#origins">${S.creditsBack} ${arrowIcon()}</a></div><div class="credits-intro"><h1>${S.home.originTitle.map((line) => `<span>${esc(line)}</span>`).join('')}</h1><p>${S.creditsIntro}${sources.some((s) => s.private) ? ` ${S.creditsIntroInternal}` : ''}</p></div></div></section>
<div class="wrap credits-content">${blocks}
${S.creditsTranslation ? `<aside class="credits-translation"><p>${S.creditsTranslation}</p></aside>` : ''}</div>`;
  return layout({ lang, page, title: S.creditsTitle, description: S.creditsDescription, body, scripts: [] });
}
