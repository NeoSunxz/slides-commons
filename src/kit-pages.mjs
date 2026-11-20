// The Convert page and the Skills page (English at the root, Chinese under zh/; each page is one language).
// Texts are written here directly (they are site copy, not template data, so they are not in i18n/zh.json).

import { layout, esc, arrowIcon, rootFor, pagePath, isAutoDownload } from './pages.mjs';
import { KIT_SLUG, SKILLS_SLUG, SKILL_NAMES, SKILL_INFO, INSTALL, KIT_DOWNLOAD_LABEL, SKILLS_DOWNLOAD_LABEL } from './kits.mjs';

const code = (s) => `<code>${esc(s)}</code>`;

const TEXT = {
  en: {
    convert: {
      title: 'Turn your own PPT into a template · slides-commons',
      description: 'Give your coding agent a PowerPoint or slide images and get back a reusable HTML slide template. Everything stays on your computer.',
      eyebrow: 'PERSONAL TOOLKIT',
      h1: ['Turn the deck', 'you already have', 'into a template.'],
      lead: 'Give your coding agent a PowerPoint or a few slide images. It reads the colours, type and layouts, and writes a template you can reuse for every future deck. Your files stay on your computer.',
      copy: 'Copy the prompt',
      copyHelp: 'Paste it into your coding agent (Claude Code, Codex, Cursor, …), ideally in an empty folder.',
      offline: 'Offline or a restricted network? The kit is one download away.',
      showPrompt: 'Show the prompt',
      stepsTitle: 'How it works',
      steps: [
        ['Copy the prompt', 'Paste it into your coding agent. It downloads the kit itself and starts with a few questions.'],
        ['Hand over your slides', 'Tell it where your .pptx or images are, name the template, and say what to keep: colours, fonts, layouts.'],
        ['Get a template folder', 'design.md, template.json and a template.html with 8 to 12 sample slides, checked and ready to make decks from.'],
      ],
      stepsManual: [
        ['Download the kit', 'Download the zip and unzip it. Open your coding agent in the unzipped folder.'],
        ['Paste the prompt', 'Paste the prompt (PROMPT.md is in the kit). It asks where your .pptx or images are, how to name the template, and what to keep.'],
        ['Get a template folder', 'design.md, template.json and a template.html with 8 to 12 sample slides, checked and ready to make decks from.'],
      ],
      inputsTitle: 'A PPTX or images?',
      inputs: [
        ['.pptx', 'Most accurate', 'The kit reads the file itself: exact theme colours, font sizes, positions and spacing, layout by layout. Fonts are swapped for open look-alikes. Charts, SmartArt and animations are not converted.'],
        ['Images', 'Close, not exact', 'Screenshots and exported slides work too, and can be mixed with a .pptx. Your agent measures by eye: colours are sampled or guessed, sizes are estimates, fonts are look-alikes. Expect a close cousin, not a copy.'],
      ],
      getTitle: 'What you get',
      getText: 'A folder with the same layout as a gallery template, so it works with the “make a deck” prompt and the slides-commons-deck skill.',
      getFiles: [['design.md', 'the design system: palette, type scale, spacing, layouts, signature moves, CJK rules'], ['template.json', 'name, mood, density, palette and fonts'], ['template.html', '8 to 12 sample slides, one file, 1920×1080, works offline'], ['PROMPT.md', 'the prompt for making decks from it'], ['fonts/', 'CJK font embedding for Chinese, Japanese, Korean']],
      privacyTitle: 'Your files never leave your computer',
      privacy: 'The kit is a prompt and a few local scripts. This website never sees your slides and nothing is uploaded. One honest caveat: your coding agent is software you chose. If it runs in the cloud, it reads your files like anything else you give it, so choose accordingly for confidential decks.',
      useTitle: 'For your own use',
      use: 'The look, brand and wording of a deck belong to whoever made it. By default the template drops logos, photos and confidential text, and swaps proprietary fonts for open ones. Keep the result to yourself; do not publish it without the owner’s permission. It is not meant for the public gallery.',
      back: 'Back to home',
      kitLink: KIT_DOWNLOAD_LABEL.en,
      skillsHint: ['Use it as a skill instead', 'The same workflow ships as the slides-commons-convert skill.', 'See the skills'],
    },
    skills: {
      title: 'Skills for your coding agent · slides-commons',
      description: 'Three Agent Skills for making slides with a coding agent: make a deck from a template, turn your own PPT into a template, embed CJK fonts.',
      eyebrow: 'AGENT SKILLS',
      h1: ['Skills for', 'your coding', 'agent.'],
      lead: 'Three small Agent Skills that teach your agent to build slides the slides-commons way. Install them once and use them in every project.',
      copy: 'Copy the install prompt',
      copyHelp: 'Paste it into your coding agent. It downloads and installs the three skills for you.',
      offline: 'Offline or a restricted network? The skills are one download away.',
      showPrompt: 'Show the prompt',
      listTitle: 'The three skills',
      say: 'You can say',
      skillSay: {
        'slides-commons-deck': '“Make a 10-slide deck from the template in this folder.”',
        'slides-commons-convert': '“Turn deck.pptx into a template I can reuse.”',
        'slides-commons-cjk-fonts': '“Embed the Chinese fonts in my slides.html.”',
      },
      installTitle: 'Install',
      installAgent: ['Let your agent do it', 'Copy the install prompt above. It downloads the package, unzips it and copies the three folders into your skills folder.'],
      installManual: 'By hand',
      unix: 'macOS and Linux (Claude Code, all your projects)',
      windows: 'Windows PowerShell (Claude Code, all your projects)',
      project: 'One project only',
      projectNote: 'Copy the three folders into the project’s .claude/skills/ folder instead.',
      afterInstall: 'Start a new session afterwards. A skill is picked up from its description, so just ask for what you want.',
      othersTitle: 'Other agents',
      others: 'A SKILL.md is plain Markdown instructions, so any coding agent can follow it. Put the folders anywhere and point your agent at them, for example in AGENTS.md:',
      goodTitle: 'Good to know',
      good: [
        'Nothing is uploaded. The skills are instructions and a few local Node 18+ scripts. Your agent itself may be a cloud service; whatever you hand it is subject to that service.',
        'MIT licensed. The base stylesheet in the packages comes from the frontend-slides project by Zara Zhang (MIT); slides-commons is an independent project, not affiliated with or endorsed by her.',
      ],
      back: 'Back to home',
      kitLink: SKILLS_DOWNLOAD_LABEL.en,
      convertHint: ['Want to see the convert workflow first?', 'Turn your own PPT into a template'],
    },
  },
  zh: {
    convert: {
      title: '把你自己的 PPT 变成模板 · slides-commons',
      description: '把 PowerPoint 或幻灯片图片交给你的 coding agent，得到可复用的 HTML 幻灯片模板。一切都在你的电脑上完成。',
      eyebrow: '个人工具包',
      h1: ['把你已有的', '幻灯片，', '变成模板。'],
      lead: '把一份 PowerPoint 或几张幻灯片图片交给你的 coding agent。它会读出颜色、字体和版式，写出一个以后每份幻灯片都能复用的模板。你的文件始终留在你的电脑上。',
      copy: '复制提示词',
      copyHelp: '粘贴给你的 coding agent（Claude Code、Codex、Cursor……），最好在一个空文件夹里。',
      offline: '离线或网络受限？工具包也可以直接下载。',
      showPrompt: '查看提示词',
      stepsTitle: '怎么用',
      steps: [
        ['复制提示词', '粘贴给你的 coding agent。它会自己下载工具包，并先问你几个问题。'],
        ['交出你的幻灯片', '告诉它 .pptx 或图片在哪里，给模板起个名字，并说明要保留什么：颜色、字体、版式。'],
        ['得到模板文件夹', 'design.md、template.json，以及含 8 到 12 页示例的 template.html，已检查过，可直接用来做幻灯片。'],
      ],
      stepsManual: [
        ['下载工具包', '下载 zip 并解压。在解压出的文件夹里打开你的 coding agent。'],
        ['粘贴提示词', '粘贴提示词（工具包里有 PROMPT.zh.md）。它会询问 .pptx 或图片在哪里、模板叫什么、要保留什么。'],
        ['得到模板文件夹', 'design.md、template.json，以及含 8 到 12 页示例的 template.html，已检查过，可直接用来做幻灯片。'],
      ],
      inputsTitle: 'PPTX 还是图片？',
      inputs: [
        ['.pptx', '最准确', '工具包直接读取文件：精确的主题颜色、字号、位置和间距，逐个版式提取。字体会换成开源的近似字体。图表、SmartArt 和动画不会转换。'],
        ['图片', '接近，但不精确', '截图和导出的幻灯片图片也行，还可以和 .pptx 混用。你的 agent 凭目测判断：颜色是取样或猜的，字号是估计的，字体是近似的。得到的是形似的近亲，不是复制品。'],
      ],
      getTitle: '你会得到什么',
      getText: '一个与画廊模板布局相同的文件夹，因此可以配合“制作幻灯片”提示词和 slides-commons-deck 技能使用。',
      getFiles: [['design.md', '设计系统：配色、字号层级、间距、版式、标志性手法、CJK 规则'], ['template.json', '名称、情绪、密度、配色和字体'], ['template.html', '8 到 12 页示例，单文件，1920×1080，离线可用'], ['PROMPT.md', '用它做幻灯片的提示词'], ['fonts/', '中日韩文字的 CJK 字体嵌入']],
      privacyTitle: '你的文件不会离开你的电脑',
      privacy: '工具包只是一段提示词加几个本地脚本。本网站看不到你的幻灯片，也不会上传任何东西。有一点要如实说明：你的 coding agent 是你自己选的软件。如果它运行在云端，它读取你的文件就和你交给它的其他东西一样，所以涉及机密的幻灯片请据此选择。',
      useTitle: '仅供你自己使用',
      use: '一份幻灯片的外观、品牌和文字归其制作者所有。默认情况下，模板会去掉标志、照片和机密文字，并把专有字体换成开源字体。成果请自己留用；没有原所有者许可，不要公开发布。它不适合放进公开画廊。',
      back: '返回首页',
      kitLink: KIT_DOWNLOAD_LABEL.zh,
      skillsHint: ['也可以做成技能使用', '同样的流程以 slides-commons-convert 技能的形式提供。', '查看技能'],
    },
    skills: {
      title: 'coding agent 技能包 · slides-commons',
      description: '三个用 coding agent 做幻灯片的 Agent Skills：用模板做幻灯片、把你自己的 PPT 变成模板、嵌入 CJK 字体。',
      eyebrow: 'AGENT 技能',
      h1: ['给你的', 'coding agent', '的技能。'],
      lead: '三个小巧的 Agent Skills，教你的 agent 用 slides-commons 的方式做幻灯片。安装一次，每个项目都能用。',
      copy: '复制安装提示词',
      copyHelp: '粘贴给你的 coding agent。它会替你下载并安装这三个技能。',
      offline: '离线或网络受限？技能包也可以直接下载。',
      showPrompt: '查看提示词',
      listTitle: '三个技能',
      say: '你可以这样说',
      skillSay: {
        'slides-commons-deck': '“用这个文件夹里的模板做一份 10 页的幻灯片。”',
        'slides-commons-convert': '“把 deck.pptx 变成一个我可以复用的模板。”',
        'slides-commons-cjk-fonts': '“把中文字体嵌入我的 slides.html。”',
      },
      installTitle: '安装',
      installAgent: ['让你的 agent 来装', '复制上面的安装提示词。它会下载技能包、解压，并把三个文件夹复制到你的技能文件夹里。'],
      installManual: '手动安装',
      unix: 'macOS 和 Linux（Claude Code，所有项目）',
      windows: 'Windows PowerShell（Claude Code，所有项目）',
      project: '只对一个项目生效',
      projectNote: '改为把三个文件夹复制到项目的 .claude/skills/ 文件夹里。',
      afterInstall: '之后开启新会话。技能是按其描述被选中的，直接说出你想做的事就行。',
      othersTitle: '其他 agent',
      others: 'SKILL.md 就是普通的 Markdown 说明，任何 coding agent 都能照着做。把文件夹放在任何地方，并让你的 agent 指向它们，例如写进 AGENTS.md：',
      goodTitle: '须知',
      good: [
        '不会上传任何东西。技能只是说明和几个本地的 Node 18+ 脚本。你的 agent 本身可能是云服务；你交给它的内容受该服务的规则约束。',
        'MIT 许可。包里的基础样式表来自 Zara Zhang 的 frontend-slides 项目（MIT）；slides-commons 是独立项目，与她无关联，也未获其背书。',
      ],
      back: '返回首页',
      kitLink: SKILLS_DOWNLOAD_LABEL.zh,
      convertHint: ['想先看看转换流程？', '把你自己的 PPT 变成模板'],
    },
  },
};

const hero = ({ lang, kind, T, zipHref, promptId, promptText, home, btnCopy }) => {
  const auto = isAutoDownload();
  const cp = `<button type="button" class="btn${auto ? ' primary' : ''}" data-copy="${promptId}">${esc(T.copy)}</button>`;
  const dl = `<a class="btn primary" href="${esc(zipHref)}" download>${esc(T.kitLink)}</a>`;
  return `<section class="kit-hero kit-hero-${kind}">
  <div class="wrap">
    <div class="kit-top"><span class="eyebrow">${esc(T.eyebrow)}</span><a href="${home}index.html">${esc(T.back)} ${arrowIcon()}</a></div>
    <div class="kit-hero-grid">
      <h1>${T.h1.map((l) => `<span>${esc(l)}</span>`).join('')}</h1>
      <div class="kit-lead">
        <p>${esc(T.lead)}</p>
        <div class="btn-row">${auto ? cp : `${dl}${cp}`}</div>
        <p class="help">${esc(T.copyHelp)}</p>
        ${auto ? `<p class="help offline"><a href="${esc(zipHref)}" download>${esc(T.kitLink)}</a><br>${esc(T.offline)}</p>` : ''}
        <p class="copy-status" role="status" aria-live="polite"></p>
        <details class="kit-prompt"><summary>${esc(T.showPrompt)}</summary><pre id="${promptId}" class="prompt">${esc(promptText)}</pre></details>
      </div>
    </div>
  </div>
</section>`;
};

export function convertPage({ lang, kit }) {
  const T = TEXT[lang].convert;
  const page = 'convert/index.html';
  const root = rootFor(pagePath(lang, page));
  const home = root + pagePath(lang, 'index.html').replace(/index\.html$/, '');
  const zipHref = `${root}zip/${KIT_SLUG}.zip`;
  const auto = isAutoDownload();
  const steps = (auto ? T.steps : T.stepsManual).map(([h, p], i) => `<li><span class="kit-step-number">0${i + 1}</span><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></li>`).join('');
  const inputs = T.inputs.map(([tag, h, p], i) => `<article class="kit-card kit-card-${i}"><span class="kit-tag">${esc(tag)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></article>`).join('');
  const files = T.getFiles.map(([f, d]) => `<li>${code(f)}<span>${esc(d)}</span></li>`).join('');
  const body = `${hero({ lang, kind: 'convert', T, zipHref, promptId: 'prompt-kit', promptText: lang === 'zh' ? kit.promptZh : kit.promptEn, home })}
<div class="wrap kit-content">
  <section class="kit-section" aria-labelledby="kit-steps"><h2 id="kit-steps">${esc(T.stepsTitle)}</h2><ol class="kit-steps">${steps}</ol></section>
  <section class="kit-section" aria-labelledby="kit-inputs"><h2 id="kit-inputs">${esc(T.inputsTitle)}</h2><div class="kit-cards">${inputs}</div></section>
  <section class="kit-section" aria-labelledby="kit-get"><h2 id="kit-get">${esc(T.getTitle)}</h2><div class="kit-get"><p>${esc(T.getText)}</p><ul class="kit-files">${files}</ul></div></section>
  <section class="kit-section kit-notes">
    <article class="kit-note" aria-labelledby="kit-privacy"><h2 id="kit-privacy">${esc(T.privacyTitle)}</h2><p>${esc(T.privacy)}</p></article>
    <article class="kit-note" aria-labelledby="kit-use"><h2 id="kit-use">${esc(T.useTitle)}</h2><p>${esc(T.use)}</p></article>
  </section>
  <p class="kit-next"><span>${esc(T.skillsHint[0])}</span> ${esc(T.skillsHint[1])} <a class="home-text-link" href="${home}skills/">${esc(T.skillsHint[2])} ${arrowIcon()}</a></p>
</div>`;
  return layout({ lang, page, title: T.title, description: T.description, body, scripts: ['assets/detail.js'], styles: ['assets/kits.css'] });
}

export function skillsPage({ lang, skills }) {
  const T = TEXT[lang].skills;
  const page = 'skills/index.html';
  const root = rootFor(pagePath(lang, page));
  const home = root + pagePath(lang, 'index.html').replace(/index\.html$/, '');
  const zipHref = `${root}zip/${SKILLS_SLUG}.zip`;
  const list = SKILL_NAMES.map((n) => `<li class="kit-card"><h3>${code(n)}</h3><p>${esc(SKILL_INFO[n][lang])}</p><p class="kit-say"><span>${esc(T.say)}</span> ${esc(T.skillSay[n])}</p></li>`).join('');
  const block = (title, cmd) => `<div class="kit-cmd"><h4>${esc(title)}</h4><pre><code>${esc(cmd)}</code></pre></div>`;
  const body = `${hero({ lang, kind: 'skills', T, zipHref, promptId: 'prompt-skills', promptText: lang === 'zh' ? skills.installZh : skills.installEn, home })}
<div class="wrap kit-content">
  <section class="kit-section" aria-labelledby="kit-list"><h2 id="kit-list">${esc(T.listTitle)}</h2><ul class="kit-cards kit-cards-3">${list}</ul></section>
  <section class="kit-section" aria-labelledby="kit-install"><h2 id="kit-install">${esc(T.installTitle)}</h2>
    <p class="kit-lede"><strong>${esc(T.installAgent[0])}.</strong> ${esc(T.installAgent[1])}</p>
    <h3>${esc(T.installManual)}</h3>
    <div class="kit-cmds">
      ${block(T.unix, `${INSTALL.unzipUnix}\n${INSTALL.unix.user}`)}
      ${block(T.windows, `${INSTALL.unzipWindows}\n${INSTALL.windows.user}`)}
      ${block(T.project, INSTALL.unix.project)}
    </div>
    <p class="muted">${esc(T.projectNote)} ${esc(T.afterInstall)}</p>
  </section>
  <section class="kit-section kit-notes">
    <article class="kit-note" aria-labelledby="kit-others"><h2 id="kit-others">${esc(T.othersTitle)}</h2><p>${esc(T.others)}</p><pre><code>${esc(INSTALL.agentsLine)}</code></pre></article>
    <article class="kit-note" aria-labelledby="kit-good"><h2 id="kit-good">${esc(T.goodTitle)}</h2>${T.good.map((g) => `<p>${esc(g)}</p>`).join('')}</article>
  </section>
  <p class="kit-next"><span>${esc(T.convertHint[0])}</span> <a class="home-text-link" href="${home}convert/">${esc(T.convertHint[1])} ${arrowIcon()}</a></p>
</div>`;
  return layout({ lang, page, title: T.title, description: T.description, body, scripts: ['assets/detail.js'], styles: ['assets/kits.css'] });
}
