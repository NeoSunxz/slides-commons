// The Convert page and the Skills page (English at the root, Chinese under zh/; each page is one language).
// Texts are written here directly (they are site copy, not template data, so they are not in i18n/zh.json).
// Short on purpose: the long explanations live in the prompt and the README. Visuals are inline SVG / CSS only.

import { layout, esc, rootFor, pagePath, isAutoDownload, arrowIcon } from './pages.mjs';
import { KIT_SLUG, SKILLS_SLUG, SKILL_NAMES, INSTALL, KIT_DOWNLOAD_LABEL, SKILLS_DOWNLOAD_LABEL } from './kits.mjs';

const code = (s) => `<code>${esc(s)}</code>`;

const TEXT = {
  en: {
    convert: {
      title: 'Turn your own PPT into a template · slides-commons',
      description: 'Give your coding agent a PowerPoint or slide images and get back a reusable HTML slide template. Everything stays on your computer.',
      eyebrow: 'PERSONAL TOOLKIT',
      h1: ['Turn the deck', 'you already have', 'into a template.'],
      lead: 'Give your coding agent a PowerPoint or slide images. It writes a reusable HTML template from them.',
      copy: 'Copy the prompt',
      copyHelp: 'Paste it into your coding agent, in an empty folder.',
      offline: '· for offline use',
      showPrompt: 'Show the prompt',
      before: 'Your deck',
      after: 'Your template',
      chips: ['colours', 'fonts', 'layouts'],
      stepsTitle: 'How it works',
      steps: [
        ['Copy the prompt', 'Paste it into your coding agent.'],
        ['Hand over your deck', 'Point it to your .pptx or images.'],
        ['Get a template', 'A folder you can make decks from.'],
      ],
      stepsManual: [
        ['Download the kit', 'Unzip it and open your agent there.'],
        ['Paste the prompt', 'Use PROMPT.md from the kit.'],
        ['Get a template', 'A folder you can make decks from.'],
      ],
      inputsTitle: 'PPTX or images?',
      meter: 'Accuracy',
      inputs: [
        ['.pptx', 'Exact', 5, [['ok', 'Theme colours'], ['ok', 'Font sizes'], ['ok', 'Spacing and positions'], ['no', 'Charts and animations']]],
        ['Images', 'Close', 3, [['approx', 'Colours, sampled'], ['approx', 'Sizes, estimated'], ['approx', 'Fonts, look-alikes'], ['ok', 'Mixes with a .pptx']]],
      ],
      legend: { ok: 'kept', approx: 'approximate', no: 'not converted' },
      getTitle: 'What you get',
      getText: 'Same layout as a gallery template.',
      getFiles: [['design.md', 'design system'], ['template.json', 'name, mood, palette'], ['template.html', '8 to 12 sample slides'], ['PROMPT.md', 'make-a-deck prompt'], ['fonts/', 'embedded CJK fonts']],
      thumbsCaption: 'Sample slides from the included example',
      detailsTitle: 'Privacy and use',
      details: [
        'Nothing is uploaded by this site or the kit. Your coding agent is software you choose; if it runs in the cloud, it reads your files like anything else you give it.',
        'For your own use. The template drops logos, photos and confidential text and swaps proprietary fonts for open ones. Do not publish it without the original owner’s permission.',
      ],
      kitLink: KIT_DOWNLOAD_LABEL.en,
      skillsHint: ['Prefer a skill?', 'The same workflow ships as slides-commons-convert.', 'See the skills'],
    },
    skills: {
      title: 'Skills for your coding agent · slides-commons',
      description: 'Three Agent Skills for making slides with a coding agent: make a deck from a template, turn your own PPT into a template, embed CJK fonts.',
      eyebrow: 'AGENT SKILLS',
      h1: ['Skills for', 'your coding', 'agent.'],
      lead: 'Three small Agent Skills for making slides. Install once, use in every project.',
      copy: 'Copy the install prompt',
      copyHelp: 'Paste it into your coding agent. It installs the skills.',
      offline: '· for offline use',
      showPrompt: 'Show the prompt',
      listTitle: 'The three skills',
      skillLine: {
        'slides-commons-deck': 'Make a deck from a template folder.',
        'slides-commons-convert': 'Turn a .pptx or images into a template.',
        'slides-commons-cjk-fonts': 'Embed CJK fonts so a deck works offline.',
      },
      say: 'You can say',
      skillSay: {
        'slides-commons-deck': 'Make a 10-slide deck from this template.',
        'slides-commons-convert': 'Turn deck.pptx into a template I can reuse.',
        'slides-commons-cjk-fonts': 'Embed the Chinese fonts in my slides.html.',
      },
      installTitle: 'Install',
      installLede: 'Easiest: paste the install prompt above. Or copy the folders by hand.',
      tabs: ['macOS and Linux', 'Windows PowerShell', 'One project', 'Other agents'],
      tabHints: ['For all your projects (Claude Code).', 'For all your projects (Claude Code).', 'Run it inside the project folder.', 'Any agent can follow a SKILL.md. Add this to its AGENTS.md and point it at the folders.'],
      copyCode: 'Copy',
      copiedCode: 'Copied',
      afterInstall: 'Then start a new session and just ask for what you want.',
      detailsTitle: 'Details',
      details: [
        'Nothing is uploaded. The skills are instructions and a few local Node 18+ scripts. Your agent may be a cloud service.',
        'MIT licensed. The base stylesheet comes from frontend-slides by Zara Zhang (MIT); this project is independent, not affiliated with or endorsed by her.',
      ],
      kitLink: SKILLS_DOWNLOAD_LABEL.en,
      convertHint: ['Want the convert workflow first?', 'Turn your own PPT into a template'],
    },
  },
  zh: {
    convert: {
      title: '把你自己的 PPT 变成模板 · slides-commons',
      description: '把 PowerPoint 或幻灯片图片交给你的 coding agent，得到可复用的 HTML 幻灯片模板。一切都在你的电脑上完成。',
      eyebrow: '个人工具包',
      h1: ['把你已有的', '幻灯片，', '变成模板。'],
      lead: '把 PowerPoint 或幻灯片图片交给你的 coding agent，它会写出一个可复用的 HTML 模板。',
      copy: '复制提示词',
      copyHelp: '粘贴给你的 coding agent，最好在空文件夹里。',
      offline: '· 离线可用',
      showPrompt: '查看提示词',
      before: '你的幻灯片',
      after: '你的模板',
      chips: ['颜色', '字体', '版式'],
      stepsTitle: '怎么用',
      steps: [
        ['复制提示词', '粘贴给你的 coding agent。'],
        ['交出你的幻灯片', '告诉它 .pptx 或图片在哪里。'],
        ['得到模板', '一个可以直接做幻灯片的文件夹。'],
      ],
      stepsManual: [
        ['下载工具包', '解压，并在其中打开 agent。'],
        ['粘贴提示词', '用工具包里的 PROMPT.zh.md。'],
        ['得到模板', '一个可以直接做幻灯片的文件夹。'],
      ],
      inputsTitle: 'PPTX 还是图片？',
      meter: '准确度',
      inputs: [
        ['.pptx', '精确', 5, [['ok', '主题颜色'], ['ok', '字号'], ['ok', '间距和位置'], ['no', '图表和动画']]],
        ['图片', '接近', 3, [['approx', '颜色：取样'], ['approx', '字号：估计'], ['approx', '字体：近似'], ['ok', '可与 .pptx 混用']]],
      ],
      legend: { ok: '保留', approx: '近似', no: '不转换' },
      getTitle: '你会得到什么',
      getText: '与画廊模板相同的文件夹结构。',
      getFiles: [['design.md', '设计系统'], ['template.json', '名称、情绪、配色'], ['template.html', '8 到 12 页示例'], ['PROMPT.md', '做幻灯片的提示词'], ['fonts/', '嵌入的 CJK 字体']],
      thumbsCaption: '工具包自带示例的幻灯片',
      detailsTitle: '隐私与使用',
      details: [
        '本网站和工具包都不会上传任何东西。你的 coding agent 是你自己选的软件；如果它运行在云端，它读取你的文件就和你交给它的其他东西一样。',
        '仅供你自己使用。模板会去掉标志、照片和机密文字，并把专有字体换成开源字体。没有原所有者许可，不要公开发布。',
      ],
      kitLink: KIT_DOWNLOAD_LABEL.zh,
      skillsHint: ['想用技能？', '同样的流程以 slides-commons-convert 技能提供。', '查看技能'],
    },
    skills: {
      title: 'coding agent 技能包 · slides-commons',
      description: '三个用 coding agent 做幻灯片的 Agent Skills：用模板做幻灯片、把你自己的 PPT 变成模板、嵌入 CJK 字体。',
      eyebrow: 'AGENT 技能',
      h1: ['给你的', 'coding agent', '的技能。'],
      lead: '三个做幻灯片的 Agent Skills。安装一次，每个项目都能用。',
      copy: '复制安装提示词',
      copyHelp: '粘贴给你的 coding agent，它会替你安装。',
      offline: '· 离线可用',
      showPrompt: '查看提示词',
      listTitle: '三个技能',
      skillLine: {
        'slides-commons-deck': '用模板文件夹做幻灯片。',
        'slides-commons-convert': '把 .pptx 或图片变成模板。',
        'slides-commons-cjk-fonts': '嵌入 CJK 字体，离线也能用。',
      },
      say: '你可以这样说',
      skillSay: {
        'slides-commons-deck': '用这个文件夹里的模板做一份 10 页的幻灯片。',
        'slides-commons-convert': '把 deck.pptx 变成一个我可以复用的模板。',
        'slides-commons-cjk-fonts': '把中文字体嵌入我的 slides.html。',
      },
      installTitle: '安装',
      installLede: '最省事：粘贴上面的安装提示词。也可以手动复制文件夹。',
      tabs: ['macOS 和 Linux', 'Windows PowerShell', '仅一个项目', '其他 agent'],
      tabHints: ['对所有项目生效（Claude Code）。', '对所有项目生效（Claude Code）。', '在项目文件夹里运行。', '任何 agent 都能照着 SKILL.md 做。把下面这段加进它的 AGENTS.md，并指向这些文件夹。'],
      copyCode: '复制',
      copiedCode: '已复制',
      afterInstall: '之后开启新会话，直接说出你想做的事。',
      detailsTitle: '详情',
      details: [
        '不会上传任何东西。技能只是说明和几个本地的 Node 18+ 脚本。你的 agent 可能是云服务。',
        'MIT 许可。基础样式表来自 Zara Zhang 的 frontend-slides（MIT）；本项目独立，与她无关联，也未获其背书。',
      ],
      kitLink: SKILLS_DOWNLOAD_LABEL.zh,
      convertHint: ['想先看转换流程？', '把你自己的 PPT 变成模板'],
    },
  },
};

// --- inline icons (stroke = currentColor) --------------------------------------
const ICONS = {
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  upload: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 17v-6m-3 3 3-3 3 3"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  download: '<path d="M12 4v11m-4-4 4 4 4-4M5 20h14"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  json: '<path d="M9 4C7 4 7 6 7 8s0 3-2 4c2 1 2 2 2 4s0 4 2 4M15 4c2 0 2 2 2 4s0 3 2 4c-2 1-2 2-2 4s0 4-2 4"/>',
  html: '<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-5 3 2-14"/>',
  prompt: '<path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H11l-5 4v-4a2 2 0 0 1-2-2z"/>',
  font: '<path d="M5 19 11 5h2l6 14M7.5 14h9"/>',
  deck: '<rect x="3" y="5" width="15" height="10" rx="1.5"/><path d="M7 19h13a1 1 0 0 0 1-1V9M6 9h7M6 12h4"/>',
  convert: '<path d="M4 8h13m-3-3 3 3-3 3M20 16H7m3-3-3 3 3 3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  approx: '<path d="M5 10c2-3 5-3 7 0s5 3 7 0M5 16c2-3 5-3 7 0s5 3 7 0"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
};
const icon = (name, size = 22) => `<svg class="kit-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
const FILE_ICON = { 'design.md': 'doc', 'template.json': 'json', 'template.html': 'html', 'PROMPT.md': 'prompt', 'fonts/': 'font' };

// --- shared pieces --------------------------------------------------------------
const hero = ({ lang, kind, T, zipHref, promptId, promptText, visual = '' }) => {
  const auto = isAutoDownload();
  const cp = `<button type="button" class="btn${auto ? ' primary' : ''}" data-copy="${promptId}">${esc(T.copy)}</button>`;
  const dl = `<a class="btn primary" href="${esc(zipHref)}" download>${esc(T.kitLink)}</a>`;
  return `<section class="kit-hero kit-hero-${kind}" data-header-theme>
  <div class="wrap">
    <div class="kit-hero-grid">
      <div class="kit-title"><p class="eyebrow">${esc(T.eyebrow)}</p>
      <h1>${T.h1.map((l) => `<span>${esc(l)}</span>`).join(lang === 'zh' ? '' : ' ')}</h1></div>
      <div class="kit-lead">
        <p>${esc(T.lead)}</p>
        <div class="btn-row">${auto ? cp : `${dl}${cp}`}</div>
        <p class="help">${esc(T.copyHelp)}${auto ? ` <a href="${esc(zipHref)}" download>${esc(T.kitLink)}</a> ${esc(T.offline)}` : ''}</p>
        <p class="copy-status" role="status" aria-live="polite"></p>
        <details class="kit-prompt"><summary>${esc(T.showPrompt)}</summary><pre id="${promptId}" class="prompt">${esc(promptText)}</pre></details>
      </div>
    </div>${visual}
  </div>
</section>`;
};

const details = (title, paras) => `<details class="kit-details"><summary>${esc(title)}</summary>${paras.map((p) => `<p>${esc(p)}</p>`).join('')}</details>`;

// Mock PowerPoint slide: shapes only (no text, so it reads the same in both languages).
const MOCK_SLIDE = `<div class="mock-slide" aria-hidden="true">
  <span class="mock-strip"></span><span class="mock-title"></span>
  <span class="mock-bullets"><i></i><i></i><i></i></span>
  <span class="mock-chart"><b></b><b></b><b></b><b></b></span>
  <span class="mock-theme"><s></s><s></s><s></s><s></s></span>
</div>`;

const flow = (T, thumbs) => `
    <div class="kit-flow">
      <figure class="kit-flow-before">${MOCK_SLIDE}<figcaption><span class="kit-pill">.pptx</span> ${esc(T.before)}</figcaption></figure>
      <div class="kit-extract" aria-hidden="true"><ul>${T.chips.map((c) => `<li>${esc(c)}</li>`).join('')}</ul><svg viewBox="0 0 60 12" preserveAspectRatio="none"><path d="M0 6h56M50 1l6 5-6 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <figure class="kit-flow-after"><div class="kit-folder"><div class="kit-folder-head">${icon('folder', 20)}<span>my-template/</span></div>
        <div class="kit-folder-thumbs">${thumbs.length ? thumbs.map((t) => `<img src="${esc(t.src)}" width="${t.width}" height="${t.height}" alt="" loading="lazy" decoding="async">`).join('') : '<i></i><i></i><i></i>'}</div>
        <div class="kit-folder-files">${T.getFiles.slice(0, 3).map(([f]) => code(f)).join('')}</div></div>
        <figcaption>${esc(T.after)}</figcaption></figure>
    </div>`;

export function convertPage({ lang, kit, example = null }) {
  const T = TEXT[lang].convert;
  const page = 'convert/index.html';
  const root = rootFor(pagePath(lang, page));
  const home = root + pagePath(lang, 'index.html').replace(/index\.html$/, '');
  const zipHref = `${root}zip/${KIT_SLUG}.zip`;
  const auto = isAutoDownload();
  const thumbs = (example?.thumbs ?? []).slice(0, 3).map((t) => ({ ...t, src: `${root}assets/screenshots/${t.file}` }));
  const steps = (auto ? T.steps : T.stepsManual);
  const stepIcons = [auto ? 'copy' : 'download', 'upload', 'folder'];
  const stepsHtml = steps.map(([h, p], i) => `<li><span class="kit-step-icon">${icon(stepIcons[i], 26)}<em>0${i + 1}</em></span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('');
  const inputs = T.inputs.map(([tag, h, level, rows], i) => `<article class="kit-card kit-card-${i}"><div class="kit-card-head"><span class="kit-tag">${esc(tag)}</span><h3>${esc(h)}</h3></div>
    <div class="kit-meter" role="img" aria-label="${esc(T.meter)} ${level}/5"><span>${esc(T.meter)}</span><i>${Array.from({ length: 5 }, (_, n) => `<b${n < level ? ' class="on"' : ''}></b>`).join('')}</i></div>
    <ul class="kit-checks">${rows.map(([k, text]) => `<li class="is-${k}"><span class="kit-mark">${icon(k === 'ok' ? 'check' : k === 'no' ? 'cross' : 'approx', 14)}<span class="sr-only">${esc(T.legend[k])}: </span></span>${esc(text)}</li>`).join('')}</ul></article>`).join('');
  const tree = `<ul class="kit-tree"><li class="kit-tree-root">${icon('folder', 20)}<code>my-template/</code></li>${T.getFiles.map(([f, d]) => `<li>${icon(FILE_ICON[f] ?? 'doc', 18)}${code(f)}<span>${esc(d)}</span></li>`).join('')}</ul>`;
  const strip = thumbs.length ? `<figure class="kit-strip"><div>${thumbs.map((t) => `<img src="${esc(t.src)}" width="${t.width}" height="${t.height}" alt="" loading="lazy" decoding="async">`).join('')}</div><figcaption>${esc(T.thumbsCaption)}</figcaption></figure>` : '';
  const body = `${hero({ lang, kind: 'convert', T, zipHref, promptId: 'prompt-kit', promptText: lang === 'zh' ? kit.promptZh : kit.promptEn, visual: flow(T, thumbs) })}
<div class="wrap kit-content">
  <section class="kit-section" aria-labelledby="kit-steps"><h2 id="kit-steps">${esc(T.stepsTitle)}</h2><ol class="kit-steps">${stepsHtml}</ol></section>
  <section class="kit-section" aria-labelledby="kit-inputs"><h2 id="kit-inputs">${esc(T.inputsTitle)}</h2><div class="kit-cards">${inputs}</div></section>
  <section class="kit-section" aria-labelledby="kit-get"><h2 id="kit-get">${esc(T.getTitle)}</h2><p class="kit-lede">${esc(T.getText)}</p><div class="kit-get">${tree}${strip}</div></section>
  <section class="kit-section kit-end">${details(T.detailsTitle, T.details)}
  <p class="kit-next"><span>${esc(T.skillsHint[0])}</span> ${esc(T.skillsHint[1])} <a class="home-text-link" href="${home}skills/">${esc(T.skillsHint[2])} ${arrowIcon()}</a></p></section>
</div>`;
  return layout({ lang, page, title: T.title, description: T.description, body, scripts: ['assets/header-theme.js', 'assets/detail.js', 'assets/kits.js'], styles: ['assets/kits.css'] });
}

const skillsFlow = (skillIcons) => `
    <div class="kit-flow kit-flow-skills" aria-hidden="true">
      <ul class="kit-skill-chips">${SKILL_NAMES.map((n, i) => `<li>${icon(skillIcons[i % 3], 20)}${code(n)}</li>`).join('')}</ul>
      <div class="kit-extract"><svg viewBox="0 0 60 12" preserveAspectRatio="none"><path d="M0 6h56M50 1l6 5-6 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="mock-agent"><div class="mock-agent-bar"><s></s><s></s><s></s></div>
        <div class="mock-agent-body"><i class="you"></i><i class="bot"></i><i class="bot short"></i><span class="mock-agent-input"><b></b></span></div></div>
    </div>`;

export function skillsPage({ lang, skills }) {
  const T = TEXT[lang].skills;
  const page = 'skills/index.html';
  const root = rootFor(pagePath(lang, page));
  const home = root + pagePath(lang, 'index.html').replace(/index\.html$/, '');
  const zipHref = `${root}zip/${SKILLS_SLUG}.zip`;
  const skillIcons = ['deck', 'convert', 'font'];
  const list = SKILL_NAMES.map((n, i) => `<li class="kit-card kit-skill"><span class="kit-skill-icon">${icon(skillIcons[i % 3], 24)}</span><h3>${code(n)}</h3><p>${esc(T.skillLine[n])}</p>
    <div class="kit-chat"><span class="kit-chat-label">${esc(T.say)}</span><p class="kit-bubble">${esc(T.skillSay[n])}</p></div></li>`).join('');
  const cmds = [`${INSTALL.unzipUnix}\n${INSTALL.unix.user}`, `${INSTALL.unzipWindows}\n${INSTALL.windows.user}`, INSTALL.unix.project, INSTALL.agentsLine];
  const tabInputs = T.tabs.map((_, i) => `<input class="kit-tab-input" type="radio" name="kit-install-tab" id="kit-tab-${i}"${i === 0 ? ' checked' : ''}>`).join('');
  const tabLabels = T.tabs.map((t, i) => `<label for="kit-tab-${i}">${esc(t)}</label>`).join('');
  const panels = cmds.map((cmd, i) => `<div class="kit-panel kit-panel-${i}"><p class="kit-panel-hint">${esc(T.tabHints[i])}</p><div class="kit-codebox"><pre id="kit-cmd-${i}"><code>${esc(cmd)}</code></pre><button type="button" class="kit-copy" data-copy-code="kit-cmd-${i}" data-done="${esc(T.copiedCode)}">${esc(T.copyCode)}</button></div></div>`).join('');
  const body = `${hero({ lang, kind: 'skills', T, zipHref, promptId: 'prompt-skills', promptText: lang === 'zh' ? skills.installZh : skills.installEn, visual: skillsFlow(skillIcons) })}
<div class="wrap kit-content">
  <section class="kit-section" aria-labelledby="kit-list"><h2 id="kit-list">${esc(T.listTitle)}</h2><ul class="kit-cards kit-cards-3">${list}</ul></section>
  <section class="kit-section" aria-labelledby="kit-install"><h2 id="kit-install">${esc(T.installTitle)}</h2>
    <p class="kit-lede">${esc(T.installLede)}</p>
    <div class="kit-install-card"><div class="kit-tabs">${tabInputs}<div class="kit-tabbar">${tabLabels}</div><div class="kit-panels">${panels}</div></div>
    <p class="kit-after">${esc(T.afterInstall)}</p></div>
  </section>
  <section class="kit-section kit-end">
    ${details(T.detailsTitle, T.details)}
    <p class="kit-next"><span>${esc(T.convertHint[0])}</span> <a class="home-text-link" href="${home}convert/">${esc(T.convertHint[1])} ${arrowIcon()}</a></p>
  </section>
</div>`;
  return layout({ lang, page, title: T.title, description: T.description, body, scripts: ['assets/header-theme.js', 'assets/detail.js', 'assets/kits.js'], styles: ['assets/kits.css'] });
}
