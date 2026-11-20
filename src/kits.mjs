// Texts for the "convert your own PPT or images into a template" kit and the skills collection.
//
// Everything a visitor's coding agent reads is generated here, so that the kit prompt, the kit's
// PROMPT.md, the skills' SKILL.md files and the website pages share one source of truth. Each
// document is written once with both languages side by side (`t(en, zh)`), so the two stay in step.
//
//   convertPrompt(lang, { zipUrl })   the prompt of the convert kit (page button = PROMPT.md in the zip)
//   deckPrompt(lang)                  generic "build a deck from the template folder" prompt (the
//                                     convert kit writes it into every template it makes; it is also
//                                     the body of the slides-commons-deck skill)
//   skillMd(name, { siteUrl })        SKILL.md of one of the three skills (English)
//   skillsInstallPrompt(lang, { zipUrl })
//   kitReadme(), skillsReadme(), fontSubstitutionMd(fontMap)

import { extractStepsEn, extractStepsZh } from './prompt.mjs';

export const KIT_SLUG = 'convert-kit';
export const SKILLS_SLUG = 'slides-commons-skills';
export const SKILL_NAMES = ['slides-commons-deck', 'slides-commons-convert', 'slides-commons-cjk-fonts'];

const c = (s) => '`' + s + '`';
const pick = (lang) => (en, zh) => (lang === 'zh' ? zh : en);
const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

// How the browser is opened on each platform (same wording as the template prompts).
const openStep = (lang) => {
  const t = pick(lang);
  return [
    t('   - macOS: ', '   - macOS：') + c('open "<file>.html"'),
    t('   - Linux: ', '   - Linux：') + c('xdg-open "<file>.html"'),
    t('   - Windows: ', '   - Windows：') + c('start "" "<file>.html"') + t(' in cmd, or ', '（cmd），或 ') + c('Start-Process "<file>.html"') + t(' in PowerShell', '（PowerShell）'),
    '',
    t('   If the command is not available or there is no display (for example a remote or headless session), skip this step and give the user the file\'s absolute path.', '   如果该命令不可用或没有显示器（例如远程或无界面会话），跳过这一步，把文件的绝对路径告诉用户。'),
  ].join('\n');
};

// ---------------------------------------------------------------------------
// CJK font embedding (long form; used by the cjk skill, short form elsewhere)
// ---------------------------------------------------------------------------

// `script` is how the script is called (a path relative to the folder that holds fonts/, or an absolute path).
function cjkEmbedBlock(lang, script, { short = false, target = '<deck.html>', what = 'deck' } = {}) {
  const t = pick(lang);
  const run = c(`node ${script} ${target}`);
  const whatZh = what === 'deck' ? '幻灯片' : '模板';
  if (short) {
    return t(
      `**Embed the CJK fonts (only if the ${what} has CJK text).** When the text is final, trim the CJK Google Fonts ${c('<link>')} to the families and weights the ${what} really uses, then run ${run} (Node 18+; it downloads font pieces over the network). It writes only the font slices your text needs into the ${what} as base64 ${c('@font-face')} rules between two marker comments, so the CJK fonts work offline. Keep the Google Fonts link as the fallback. Re-run it after every text edit; never edit its block by hand. Exit code 2: a character has no glyph; 3: some downloads failed (retry once); 4: no CJK font link found. If it cannot run at all, leave the link and say so in your final reply.`,
      `**嵌入 CJK 字体（仅当${whatZh}含 CJK 文字）。**文字定稿后，先把 CJK Google Fonts ${c('<link>')} 精简到${whatZh}真正用到的字体族和字重，再运行 ${run}（Node 18 及以上；需要联网下载字体分片）。它只把你的文字需要的字体分片以 base64 ${c('@font-face')} 规则写入${whatZh}两个标记注释之间，这样 CJK 字体离线也能用。保留 Google Fonts 链接作为回退。每次改动文字后重新运行；不要手工改它写入的内容。退出码 2：有字符没有字形；3：部分下载失败（重试一次）；4：没有找到 CJK 字体链接。如果它根本无法运行，保持链接原样，并在最终回复里说明。`);
  }
  return [
    t(`Run it on the finished deck: ${run}.`, `在定稿的幻灯片上运行：${run}。`),
    '',
    t('- **When:** the deck contains Chinese, Japanese or Korean text. A deck without CJK text needs nothing.', '- **何时：**幻灯片含中文、日文或韩文。不含 CJK 文字的幻灯片什么都不用做。'),
    t(`- **Before running:** the deck must request its CJK fonts from Google Fonts with a ${c('<link>')} or ${c('@import')}. The script embeds every weight that link requests, so first trim it to the families and weights the deck uses (drop ${c('700')} when no CJK text is bold). Keep at least one weight per family you use.`, `- **运行之前：**幻灯片必须用 ${c('<link>')} 或 ${c('@import')} 从 Google Fonts 请求 CJK 字体。脚本会嵌入链接里请求的每一个字重，所以先把它精简到幻灯片实际用到的字体族和字重（没有 CJK 粗体就去掉 ${c('700')}）。用到的每个字体族至少保留一个字重。`),
    t(`- **What it does:** reads every character of the deck, picks the font slices (unicode-range pieces, the same slicing Google Fonts uses) that contain them, downloads them (this site first, then jsDelivr; no other host) and writes them as base64 ${c('@font-face')} rules between two marker comments. The Google Fonts link stays as the fallback for characters added later.`, `- **它做什么：**读取幻灯片的每个字符，挑出包含这些字符的字体分片（unicode-range 分片，与 Google Fonts 的切法相同），下载（先本站，后 jsDelivr，不访问其他主机），以 base64 ${c('@font-face')} 规则写入两个标记注释之间。Google Fonts 链接保留，作为之后新增字符的回退。`),
    t('- **Families it knows:** Noto Sans SC, Noto Serif SC, LXGW WenKai TC, Noto Sans JP (see `fonts/cjk-ranges.json`). Other CJK families stay on the Google Fonts link (the script says so).', '- **它认识的字体族：**Noto Sans SC、Noto Serif SC、LXGW WenKai TC、Noto Sans JP（见 `fonts/cjk-ranges.json`）。其他 CJK 字体族仍走 Google Fonts 链接（脚本会提示）。'),
    t(`- **Re-run after every text edit.** It is idempotent and replaces only its own block. Never edit that block by hand.`, '- **每次改动文字后都要重新运行。**它是幂等的，只替换自己的那一段。不要手工修改这一段。'),
    t('- **Exit codes:** 0 ok; 1 usage or file error; 2 a CJK character has no glyph in the embedded fonts (change the character or tell the user); 3 some downloads failed (the rest is embedded; retry once); 4 no CJK font link found.', '- **退出码：**0 成功；1 用法或文件错误；2 有 CJK 字符在已嵌入的字体里没有字形（换掉该字，或告诉用户）；3 部分下载失败（其余已嵌入；重试一次）；4 没有找到 CJK 字体链接。'),
    t(`- **Smaller result:** with fonttools installed the script cuts each slice down to the characters used. If it says it embedded whole slices (no ${c('pyftsubset')}) and Python with pip is available, run ${c('python -m pip install --user fonttools brotli')} (${c('python3')} or ${c('py -m pip')} on some systems) and re-run it. If that is not possible, keep the larger result.`, `- **更小的结果：**安装了 fonttools 时，脚本会把每个分片裁剪到只含用到的字符。如果脚本提示嵌入的是整片字体（没有 ${c('pyftsubset')}）且电脑上有 Python 和 pip，就运行 ${c('python -m pip install --user fonttools brotli')}（有些系统用 ${c('python3')} 或 ${c('py -m pip')}）后重新运行；做不到就保留较大的结果。`),
    t('- **If it cannot run** (no Node, no network): leave the Google Fonts link as it is and say so in your final reply. Otherwise report how much size it added.', '- **如果无法运行**（没有 Node、没有网络）：保持 Google Fonts 链接原样，并在最终回复里说明；否则报告它增加了多少体积。'),
    t('- **Traditional-Chinese faces:** LXGW WenKai TC (and any "TC" family) shows some glyphs in Taiwan forms and centres full-width punctuation. For Simplified Chinese use it only for short display strings without punctuation; use Noto Sans SC / Noto Serif SC for body text.', '- **繁体字体：**LXGW WenKai TC（以及任何 “TC” 字体族）会把部分字形显示为台湾写法，并把全角标点居中。简体中文只把它用于不含标点的短标题；正文用 Noto Sans SC / Noto Serif SC。'),
  ].join('\n');
}

// Latin font embedding (optional step; short form for prompts).
function latinEmbedBlock(lang, script, { target = '<deck.html>', what = 'deck' } = {}) {
  const t = pick(lang);
  const run = c(`node ${script} ${target}`);
  const whatZh = what === 'deck' ? '幻灯片' : '模板';
  const pattern = c('https://cdn.jsdelivr.net/npm/@fontsource/<id>@<ver>/files/<id>-latin-<wght>-normal.woff2');
  return t(
    `**Embed the Latin fonts (optional, recommended).** When the fonts are final, run ${run} (Node 18+; needs the network). It reads the Latin families and weights of the Google Fonts ${c('<link>')}, downloads their ${c('latin')} and ${c('latin-ext')} woff2 files (open Fontsource builds from jsDelivr; no other host) and writes them as base64 ${c('@font-face')} rules in one marked block before ${c('</head>')}; the Google link stays as the fallback. Re-run it after changing fonts or weights. Exit code 3: some fonts were not found or failed (they stay on the link; retry once); 4: no Latin Google Fonts link. Without the script, do it by hand: ${pattern} (${c('<id>')} = lowercase hyphenated family name, ${c('<ver>')} = ${c('5')}; also the ${c('latin-ext')} file; variable fonts under ${c('@fontsource-variable/<id>')} with ${c('<id>-latin-wght-normal.woff2')}). If none of this works, keep the Google link and say in your final reply that the ${what} needs the network for its Latin fonts.`,
    `**嵌入拉丁字体（可选，推荐）。**字体定稿后，运行 ${run}（Node 18 及以上；需要联网）。它读取 Google Fonts ${c('<link>')} 里的拉丁字体族和字重，下载对应的 ${c('latin')} 与 ${c('latin-ext')} woff2 文件（来自 jsDelivr 的开源 Fontsource 构建，不访问其他主机），以 base64 ${c('@font-face')} 规则写入 ${c('</head>')} 之前一个带标记的区块；Google 链接保留作为回退。更改字体或字重后重新运行。退出码 3：部分字体没找到或下载失败（它们仍走链接；重试一次）；4：没有拉丁字体的 Google Fonts 链接。没有脚本时手工完成：${pattern}（${c('<id>')} 是小写加连字符的字体族名，${c('<ver>')} 取 ${c('5')}；另有 ${c('latin-ext')} 文件；可变字体在 ${c('@fontsource-variable/<id>')} 下，文件名 ${c('<id>-latin-wght-normal.woff2')}）。都做不到就保留 Google 链接，并在最终回复里说明这个${whatZh}的拉丁字体需要联网。`);
}

// ---------------------------------------------------------------------------
// Generic "build a deck from a template folder" prompt
// ---------------------------------------------------------------------------

// Sections 1-5 (after the "locate the template" step). Shared by the deck prompt and the deck skill.
function deckSections(lang, { cjkScript = 'fonts/embed-cjk.mjs', latinScript = 'fonts/embed-latin.mjs' } = {}) {
  const t = pick(lang);
  const L = [];
  L.push(t('## 1. What is in the folder', '## 1. 文件夹里有什么'));
  L.push('');
  L.push(table(t(['File', 'Purpose'], ['文件', '用途']), [
    [c('design.md'), t('The design system and your primary source of truth: tokens (YAML front matter), layout grid, components, do\'s and don\'ts, CJK rules and the fixed-stage policy. Read it in full before writing any slide.', '设计系统，也是你的首要依据：设计 token（YAML front matter）、版式网格、组件、Do / Don\'t、CJK 规则和固定画布规范。写任何一页之前先完整读完。')],
    [c('template.json'), t('The template\'s card: name, mood, density, palette and typography summary, best / worst uses.', '模板的信息卡：名称、情绪、密度、配色与字体概要、适用与不适用场景。')],
    [c('template.html'), t('The reference deck. Consult it only when `design.md` leaves an implementation detail open (exact CSS of a component, an SVG ornament). Never reuse its demo content.', '参考示例幻灯片。只在 `design.md` 没写清某个实现细节时查阅（组件的具体 CSS、SVG 装饰）。不要复用其中的示例内容。')],
    [c('viewport-base.css'), t('Mandatory base CSS of the fixed 1920×1080 stage (if present). Paste its full contents into your output.', '固定 1920×1080 画布的必需基础 CSS（如果有）。把全部内容粘贴进你的产出。')],
    [c('fonts/'), t('If present: `fonts.css` plus woff2 files (the template\'s Latin fonts) and/or `embed-cjk.mjs` with `cjk-ranges.json` (CJK embedding) and/or `embed-latin.mjs` (Latin embedding). See “Fonts” in section 3.', '如果有：`fonts.css` 与 woff2 文件（模板的拉丁字体），和/或 `embed-cjk.mjs` 与 `cjk-ranges.json`（CJK 嵌入）、`embed-latin.mjs`（拉丁字体嵌入）。见第 3 节“字体”。')],
    [c('LICENSE*'), t('License notices. Leave them as they are.', '许可证声明。保持原样。')],
  ]));
  L.push('');
  L.push(t('## 2. Workflow', '## 2. 工作流'));
  L.push('');
  L.push(t(`1. **Ask before building.** In one message, ask the user:
   1. Purpose and audience: what is the deck for (pitch, conference talk, internal review, teaching, …) and who will see it?
   2. Length: roughly how many slides (5–10, 10–20, 20+)?
   3. Content: ask them to paste or point to their material (notes, outline, document, data, images), or to confirm that you should draft it from a topic. Also ask for anything that should appear as deck chrome: speaker name, date, organisation, and a link or URL for the closing slide. Leave out whatever deck chrome they don't give you; never invent it.
   4. Density: speaker-led (low density: one idea per slide, large type, few words), balanced (projected but data-heavy: 2–4 content blocks per slide, body text ≥ 20px on the 1920 stage) or reading-first (high density: self-contained slides read on a screen)? If they answer in between, map it to the nearest option; a projected deck is balanced at most; if unsure, pick balanced and say so.

   Skip any question the user has already answered. Then stop and wait for the reply.
2. **Read ${c('design.md')} completely** (every section, including the fixed-stage policy and the CJK section) and ${c('template.json')} before writing any code.
3. **Plan.** Write a slide-by-slide outline: the point of each slide and which layout archetype / components of the system carry it. If the user gave only facts or notes and asked you to organise them, or you drafted the content yourself, show the outline and wait for approval. If the user supplied a ready slide-by-slide structure, follow it and go straight on.
4. **Look up gaps in ${c('template.html')}** only when ${c('design.md')} does not say how to build something. Take the technique, not the text.
5. **Build** one HTML file following sections 3 and 4. Save it inside the template folder as ${c('<short-deck-name>.html')}; never overwrite ${c('template.html')}.
6. **Self-check** (section 5), fix what you find, then open the deck and report.`,
  `1. **动手之前先提问。**在一条消息里向用户提问：
   1. 用途和受众：这份幻灯片用来做什么（融资路演、会议演讲、内部汇报、教学……），谁来看？
   2. 篇幅：大约多少页（5–10、10–20、20+）？
   3. 内容：请他们粘贴或指明素材（笔记、大纲、文档、数据、图片），或确认由你根据主题起草。同时询问需要出现在页面边饰里的信息：演讲者姓名、日期、机构、结束页的链接或网址。用户没给的边饰内容就不要放，不要编造。
   4. 密度：演讲型（低密度：一页一个观点、大字、少字）、均衡型（投影但数据较多：每页 2–4 个内容块，1920 画布上正文 ≥ 20px）还是阅读型（高密度：在屏幕上阅读、信息自成一页）？如果回答介于两者之间，就归到最接近的一档；投影的幻灯片最多是均衡型；拿不准就选均衡型并说明。

   用户已经回答过的问题就跳过。然后停下来等回复。
2. **完整阅读 ${c('design.md')}**（每一节，包括固定画布规范和 CJK 一节）以及 ${c('template.json')}，然后才写代码。
3. **规划。**写出逐页大纲：每一页的要点，以及由哪种版式 / 哪些组件承载。如果用户只给了事实或笔记并让你整理，或者内容由你起草，就把大纲给用户看并等待认可；如果用户给了现成的逐页结构，就照着做，直接继续。
4. **在 ${c('template.html')} 里查缺补漏**，仅当 ${c('design.md')} 没说明某个东西怎么做时。取其技法，不取其文字。
5. **构建**一个遵循第 3、4 节的 HTML 文件。保存在模板文件夹里，命名为 ${c('<简短的幻灯片名>.html')}；绝不覆盖 ${c('template.html')}。
6. **自检**（第 5 节），修复发现的问题，然后打开幻灯片并汇报。`));
  L.push('');
  L.push(t('## 3. Output requirements', '## 3. 输出要求'));
  L.push('');
  L.push(t(`- **One self-contained file.** All CSS and JS inline. No other local files, no npm, no build step, no frameworks.
- **Base CSS:** if ${c('viewport-base.css')} exists, paste its full, unmodified contents into the ${c('<style>')} block before your own rules. In ${c(':root')}, set ${c('--slide-bg')} to the color ${c('design.md')} names as the default slide canvas (not a panel, card or paper fill) and ${c('--stage-bg')} to the letterbox color around the stage. Define every palette color as a CSS variable with the names from ${c('design.md')}.
- **Fixed stage:** the markup is ${c('.deck-viewport > .deck-stage > section.slide')}, one ${c('section')} per slide. Author every slide at exactly 1920×1080 px using the fixed px sizes from ${c('design.md')}. One inline script scales ${c('.deck-stage')} with ${c('transform: translate(x, y) scale(s)')}, where ${c('s = min(innerWidth / 1920, innerHeight / 1080)')} and ${c('x')}, ${c('y')} center it; recompute on resize. Phones get letterboxing, never a reflowed layout: no media queries, ${c('vw')}/${c('vh')} units or ${c('clamp()')} inside slides.
- **Slide switching:** toggle the ${c('.active')} and ${c('.visible')} classes (visibility, opacity, pointer-events), as ${c('viewport-base.css')} expects. Never switch slides with ${c('display: none')}.
- **Navigation:** → / Space / PageDown for next, ← / PageUp for previous, Home / End for first / last, swipe on touch screens, and mouse-wheel paging (debounced, one wheel gesture moves one slide). Ignore key presses while an input or contenteditable element has focus. Where ${c('design.md')} mentions a ${c('<deck-stage>')} component or ${c('deck-stage.js')}, use your inline controller instead (it is the "equivalent inline stage scaler" the fixed-stage policy allows).
- **Fonts:** the finished deck must stay one file that works offline, so it never references files in ${c('fonts/')}.
  - If ${c('fonts/fonts.css')} exists: it holds ready-made ${c('@font-face')} rules for exactly the template's Latin families and weights. Copy the rules for the weights and styles you actually use into your ${c('<style>')}, each ${c('url(...)')} replaced by a base64 data URI (${c('data:font/woff2;base64,…')}; generate it with a small Node or Python script, not by hand). Embed both the latin and the latin-ext rules of every face you use, and keep family names, ${c('font-display')} and ${c('unicode-range')} unchanged. A variable font file covers all its weights: embed it once. Do not link Google Fonts for these families.
  - If there is no ${c('fonts/fonts.css')}: keep the one Google Fonts (or Fontshare) ${c('<link>')} that ${c('template.html')} uses for the Latin families, then embed the Latin faces for offline use (Google Fonts only; not for Fontshare or system fonts): ${latinEmbedBlock('en', latinScript)}
  - Where the template uses system fonts on purpose (${c('design.md')} says so), add no web fonts.
  - Deck without Chinese, Japanese or Korean text: no other font request.
  - Deck with CJK text: add one Google Fonts ${c('<link>')} for the CJK family only, taken from the CJK section of ${c('design.md')} (remove its Latin families when those are embedded), then embed the CJK fonts (below). Font stacks: Latin family first, CJK family second, so each script falls through to its own face. For CJK runs the CJK section of ${c('design.md')} overrides the Latin token values (weight, letter-spacing, line-height, uppercase): set them with ${c(':lang(zh)')} (or ${c(':lang(ja)')}, ${c(':lang(ko)')}) rules. Wrap CJK runs in a span (e.g. ${c('<span class="cjk">')}, with a small script) only when ${c('design.md')} gives CJK-specific weight, tracking or line-height that a plain language rule cannot express; otherwise do not wrap. If you wrap, search the CSS for every descendant rule like ${c('X span')} (e.g. ${c('.kpi span')}, ${c('.reco-figs span')}): it also matches the ${c('.cjk')} wrappers, so change it to a child selector (${c('X > span')}) or exclude them with ${c(':not(.cjk)')}. In flex containers, wrapping only the CJK part of a text removes the space between Chinese text and numbers: wrap the whole text in one inner span instead. The CJK weight, letter-spacing and line-height apply to the CJK runs only; Latin text keeps the weights that are actually loaded.
  - ${cjkEmbedBlock('en', cjkScript, { short: true })}
- **No other network requests:** no CDNs, remote scripts, remote images or analytics. Draw charts, icons and diagrams with inline SVG or CSS. Embed images the user supplies as data URIs, downscaled to the size they are shown at.
- **Details:** respect ${c('prefers-reduced-motion')}; set ${c('<html lang>')} to the deck language and ${c('<title>')} to the deck title; mark code sections with ${c('/* === SECTION === */')} comments.`,
  `- **单个自包含文件。**所有 CSS 与 JS 内联。不引用其他本地文件，不用 npm，不需要构建步骤，不用框架。
- **基础 CSS：**如果有 ${c('viewport-base.css')}，把它的全部内容原样粘贴进 ${c('<style>')}，放在你自己的规则之前。在 ${c(':root')} 中，把 ${c('--slide-bg')} 设为 ${c('design.md')} 指定为默认幻灯片画布的颜色（不是面板、卡片或纸张的填充色），把 ${c('--stage-bg')} 设为画布四周加边的颜色。把每个配色都定义为 CSS 变量，名称沿用 ${c('design.md')}。
- **固定画布：**结构为 ${c('.deck-viewport > .deck-stage > section.slide')}，每页一个 ${c('section')}。每页严格按 1920×1080 px 编写，使用 ${c('design.md')} 的固定 px 尺寸。一段内联脚本用 ${c('transform: translate(x, y) scale(s)')} 缩放 ${c('.deck-stage')}，其中 ${c('s = min(innerWidth / 1920, innerHeight / 1080)')}，${c('x')}、${c('y')} 使其居中；窗口大小变化时重新计算。手机上加黑边，绝不重新排版：页面内不用媒体查询、${c('vw')}/${c('vh')} 单位或 ${c('clamp()')}。
- **切换页面：**按 ${c('viewport-base.css')} 的约定切换 ${c('.active')} 和 ${c('.visible')} 类（visibility、opacity、pointer-events）。不要用 ${c('display: none')} 切换页面。
- **翻页：**→ / 空格 / PageDown 下一页，← / PageUp 上一页，Home / End 首页 / 末页，触屏滑动，以及鼠标滚轮翻页（带防抖，一次滚轮手势只翻一页）。输入框或 contenteditable 元素有焦点时忽略按键。${c('design.md')} 提到 ${c('<deck-stage>')} 组件或 ${c('deck-stage.js')} 的地方，改用你的内联控制脚本（它就是固定画布规范所允许的“等效内联画布缩放脚本”）。
- **字体：**成品幻灯片必须保持为单个、离线可用的文件，因此不引用 ${c('fonts/')} 里的文件。
  - 如果有 ${c('fonts/fonts.css')}：里面是恰好覆盖模板所用拉丁字体族和字重的现成 ${c('@font-face')} 规则。把你实际用到的字重和字形对应的规则复制进你的 ${c('<style>')}，每个 ${c('url(...)')} 换成 base64 data URI（${c('data:font/woff2;base64,…')}；用一个小的 Node 或 Python 脚本生成，不要手工处理）。每个用到的字体都要同时嵌入 latin 与 latin-ext 两组规则，字体族名、${c('font-display')} 和 ${c('unicode-range')} 保持不变。可变字体文件已覆盖所有字重，只嵌入一次。不要为这些字体族链接 Google Fonts。
  - 如果没有 ${c('fonts/fonts.css')}：保留 ${c('template.html')} 里为拉丁字体使用的那一条 Google Fonts（或 Fontshare）${c('<link>')}，然后嵌入拉丁字体以便离线使用（仅限 Google Fonts；Fontshare 和系统字体不适用）：${latinEmbedBlock('zh', latinScript)}
  - 模板有意使用系统字体的地方（${c('design.md')} 有说明），不要添加网页字体。
  - 幻灯片不含中文、日文或韩文：不再发起其他字体请求。
  - 幻灯片含 CJK 文字：添加一条只含 CJK 字体族的 Google Fonts ${c('<link>')}，取自 ${c('design.md')} 的 CJK 一节（拉丁字体已嵌入时去掉其中的拉丁字体族），然后嵌入 CJK 字体（见下）。字体栈：拉丁字体在前，CJK 字体在后，让每种文字落到各自的字体上。对 CJK 文字，${c('design.md')} 的 CJK 一节覆盖拉丁 token 的取值（字重、字间距、行高、大写转换）：用 ${c(':lang(zh)')}（或 ${c(':lang(ja)')}、${c(':lang(ko)')}）规则设置。只有当 ${c('design.md')} 给出了 CJK 专用的字重、字间距或行高、而普通的语言规则表达不了时，才用小脚本把 CJK 文字包进 span（如 ${c('<span class="cjk">')}）；否则不要包。如果包了，在 CSS 里搜索所有形如 ${c('X span')} 的后代选择器（例如 ${c('.kpi span')}、${c('.reco-figs span')}）：它们也会匹配 ${c('.cjk')} 包裹元素，要改成子选择器（${c('X > span')}）或用 ${c(':not(.cjk)')} 排除。在 flex 容器里，只包裹文字中的 CJK 部分会让中文与数字之间的空格消失：改为把整段文字包进一个内层 span。CJK 字重、字间距和行高只作用于 CJK 文字；拉丁文字保持实际加载的字重。
  - ${cjkEmbedBlock('zh', cjkScript, { short: true })}
- **不发起其他网络请求：**不用 CDN、远程脚本、远程图片或统计代码。图表、图标和示意图用内联 SVG 或 CSS 绘制。用户提供的图片缩小到实际显示尺寸后以 data URI 嵌入。
- **细节：**尊重 ${c('prefers-reduced-motion')}；${c('<html lang>')} 设为幻灯片语言，${c('<title>')} 设为幻灯片标题；用 ${c('/* === SECTION === */')} 注释标记代码段。`));
  L.push('');
  L.push(t('## 4. Hard constraints', '## 4. 硬性约束'));
  L.push('');
  L.push(t(`- **Keep the fonts:** the exact families, weights, letter-spacing, line-heights and text-transforms from ${c('design.md')}. Never substitute. If a font does not load, find out why (section 5) instead of replacing it.
- **When ${c('design.md')} contradicts itself,** follow the stricter rule and tell the user in your final reply.
- **Keep the palette:** only the colors listed in ${c('design.md')}. No new accent, no recoloring, no gradients or shadows unless ${c('design.md')} uses them.
- **Keep the decorative vocabulary** (marks, rules, stamps, textures, ornaments), **the spacing rhythm** and **the component grammar** that ${c('design.md')} describes: they are the identity of the template.
- **Reuse the template's embedded design images as they are.** If ${c('design.md')} declares background or decorative images (a cover photo, a texture), they are already embedded in ${c('template.html')} as ${c('data:')} URIs: copy that markup and its overlay layers into your deck unchanged. Never re-fetch, redraw, replace or recolour them, and never put the user's own new photos in their place unless the user supplies those photos.
- **Never mix templates.** Do not borrow layouts, colors or type from other templates, presets or generic presentation styles.
- **Missing layout? Design it inside the same system,** with the same fonts, palette, decoration, spacing and chrome. Don't switch styles or drop the content.
- **Real content, drafted when missing.** Use the user's material. Never reuse demo text, numbers, names or logos from ${c('template.html')}. When the user names a topic but gives no content, draft it yourself; never put placeholders such as "TBD" or "Lorem ipsum" on a slide. Keep drafts plausible and modest. Every drafted item (including any made-up quote, name or number) must be listed in your final reply.
- **Only real links and codes:** QR codes, links, URLs and e-mail addresses only when the user gave a real one; otherwise omit them.
- **Numbers must agree:** section numbers and labels on slides must match the slide's page number (the cover is page 1). Section ordinals (such as “Section 03”) are fine; any reference to a page number must equal the footer page number.
- **No internal labels on slides:** never show the template name, the words "template" or "preview", file names, paths or notes about the user's requirements.
- **The user's density choice wins** over density guidance in ${c('design.md')}: fewer, larger blocks for low density. If content does not fit, split it across more slides; never shrink text below the sizes in ${c('design.md')} and never let it overflow.
- **Minimum text size for projected decks (speaker-led and balanced):** raise any body or label text below 20px (on the 1920×1080 stage) to at least 20px, keeping the token's other properties; only source and footnote lines may go down to 18px. Reading-first decks keep the ${c('design.md')} sizes.
- **Keep emphasis legible:** highlights and accent-colored text must contrast with the panel they sit on. Never put accent on accent.
- **CJK text:** letter-spacing 0; the CJK line-heights from ${c('design.md')} (about 1.75 for body and 1.2 for display if it gives none); never ${c('text-transform: uppercase')} on CJK runs; full-width punctuation and a space between CJK and Latin text. Don't limit CJK widths by character count (${c('ch')} units); use ${c('text-wrap: pretty')} / ${c('balance')} with ${c('line-break: strict')} so no line ends with a single character. Write labels and chrome in the deck language, unless ${c('design.md')} marks a string as fixed signature text (for example "PART 1"): that stays as written in every language.`,
  `- **保持字体：**严格使用 ${c('design.md')} 里的字体族、字重、字间距、行高和大小写转换。绝不替换。字体加载不出来时，先找原因（第 5 节），不要换字体。
- **${c('design.md')} 自相矛盾时，**取更严格的规则，并在最终回复里告诉用户。
- **保持配色：**只用 ${c('design.md')} 列出的颜色。不新增强调色，不改色，除非 ${c('design.md')} 本来使用，否则不用渐变和阴影。
- **保持装饰语汇**（标记、线条、印章、纹理、装饰）、**间距节奏**和**组件语法**：${c('design.md')} 描述的这些就是模板的个性。
- **原样沿用模板内嵌的设计图片。**如果 ${c('design.md')} 声明了背景或装饰图片（封面照片、纹理），它们已作为 ${c('data:')} URI 嵌在 ${c('template.html')} 里：把对应的标记和叠加层原样复制进你的幻灯片。不要重新下载、重新绘制、替换或改色，除非用户自己提供了照片，否则也不要用用户的新照片去顶替它们。
- **绝不混用模板。**不要借用其他模板、预设或通用演示风格的版式、颜色和字体。
- **缺少版式？在同一套系统里设计，**用相同的字体、配色、装饰、间距和边饰。不要换风格，也不要丢内容。
- **用真实内容，缺失时代写。**使用用户的素材。绝不复用 ${c('template.html')} 里的示例文字、数字、姓名或标志。用户只给了主题而没给内容时，由你起草；页面上不放 “TBD”“Lorem ipsum” 之类的占位。草稿要合理、克制。每一项代写内容（包括编造的引语、姓名、数字）都必须在最终回复里列出。
- **只用真实的链接和二维码：**二维码、链接、网址、邮箱仅在用户给了真实的才使用，否则省略。
- **数字必须一致：**页面上的章节编号和标签必须与该页页码一致（封面为第 1 页）。章节序号（如“第 03 节”）没有问题；凡是引用页码的地方，都必须与页脚页码一致。
- **页面上不出现内部标签：**绝不显示模板名称、“template”“preview” 字样、文件名、路径或关于用户需求的备注。
- **用户的密度选择优先于** ${c('design.md')} 的密度建议：低密度用更少、更大的内容块。内容放不下就拆成更多页；绝不把文字缩到 ${c('design.md')} 规定的字号以下，也不允许溢出。
- **投影型幻灯片（演讲型和均衡型）的最小字号：**把 1920×1080 画布上小于 20px 的正文或标签文字提高到至少 20px，保持 token 的其他属性；只有来源和脚注行可以降到 18px。阅读型幻灯片沿用 ${c('design.md')} 的字号。
- **保持强调清晰可读：**高亮和强调色文字必须与所在面板形成对比。不要在强调色上再放强调色。
- **CJK 文字：**字间距为 0；使用 ${c('design.md')} 的 CJK 行高（没给就用正文约 1.75、标题约 1.2）；CJK 文字绝不使用 ${c('text-transform: uppercase')}；使用全角标点，CJK 与拉丁文字之间加空格。不要按字符数限制 CJK 宽度（${c('ch')} 单位）；用 ${c('text-wrap: pretty')} / ${c('balance')} 配合 ${c('line-break: strict')}，避免出现单字末行。标签和边饰用幻灯片的语言书写，除非 ${c('design.md')} 把某个字符串标为固定的标志性文字（例如 “PART 1”）：它在任何语言里都保持原样。`));
  L.push('');
  L.push(t('## 5. Self-check, then deliver', '## 5. 自检，然后交付'));
  L.push('');
  L.push(t(`1. Render the deck in a real browser (Playwright, Puppeteer or headless Chrome, whatever is available) at **1280×720** and at one **phone viewport** (e.g. 390×844), and screenshot every slide (advance with →).
2. On every slide, check: no text overflows or is clipped; **no panel overlaps or covers another** (a ${c('scrollHeight')} check alone misses this, so look at the screenshots; the template's own chrome such as page tags or corner marks may overlap where the original places it so, but never covers text); every highlight is legible; in CJK text no line ends with a single character or a lone punctuation mark; the stage stays 16:9 and letterboxed on the phone; the intended fonts loaded, Latin and CJK (${c('document.fonts.check()')} is not proof: wait for ${c('document.fonts.ready')} and confirm each expected face appears in ${c('document.fonts')} with status ${c('"loaded"')}, or compare rendered text widths against a fallback; retry on a network error before concluding); no console errors (offline, the failed Google Fonts request and its console error are expected and fine when the fonts are embedded); no network requests beyond the font hosts (or none at all when everything is embedded).
3. Fix and re-check until clean. If you cannot render in a browser, say so plainly and review the code by hand; don't claim the check passed.
4. Reread the deck as the audience would and fix any statement the deck itself contradicts.
5. Open the deck in the user's default browser:
${openStep('en')}
6. Report the file's full path, the slide count, how to navigate, every item you drafted (slide number and text), every contradiction you resolved in ${c('design.md')}, every place where a legibility rule made you deviate from its colors or sizes (what changed, from what to what), and open questions. For later changes, edit the same file, keep every constraint above, and run the self-check again.`,
  `1. 在真实浏览器（Playwright、Puppeteer 或无头 Chrome，有什么用什么）中，以 **1280×720** 和一个**手机视口**（如 390×844）渲染幻灯片，并为每一页截图（用 → 翻页）。
2. 在每一页检查：没有文字溢出或被裁切；**没有面板重叠或遮挡另一个面板**（只做 ${c('scrollHeight')} 检查会漏掉这一点，所以要看截图；模板自己的边饰，如页码标签、角标，在原设计就是这样放置的地方可以与面板重叠，但绝不遮挡文字）；每处高亮都清晰可读；CJK 文字中没有以单字或孤立标点结尾的行；手机上画布保持 16:9 并加黑边；预期的字体（拉丁与 CJK）都已加载（${c('document.fonts.check()')} 不能作为证明：等待 ${c('document.fonts.ready')}，确认每个预期字体都出现在 ${c('document.fonts')} 中且状态为 ${c('"loaded"')}，或把渲染出的文字宽度与回退字体比较；遇到网络错误先重试再下结论）；控制台没有报错（离线时 Google Fonts 请求失败及其报错属预期，字体已嵌入就没问题）；除字体主机外没有网络请求（全部嵌入时则完全没有）。
3. 修复并重新检查，直到干净。如果无法在浏览器中渲染，就如实说明并人工审阅代码；不要声称检查已通过。
4. 以观众的视角重读一遍幻灯片，修正幻灯片自身前后矛盾的说法。
5. 在用户的默认浏览器中打开幻灯片：
${openStep('zh')}
6. 报告文件的完整路径、页数、如何翻页、你代写的每一项内容（页码和文字）、你在 ${c('design.md')} 中化解的每一处矛盾、每一处因可读性规则而偏离其颜色或字号的地方（改了什么，从什么改成什么），以及遗留问题。之后的修改，编辑同一个文件，遵守以上所有约束，并再次自检。`));
  return L.join('\n');
}

export function deckPrompt(lang) {
  const t = pick(lang);
  return [
    t('# Build a slide deck from the template in this folder', '# 用这个文件夹里的模板制作幻灯片'),
    '',
    t(`You are a coding agent. The user wants a presentation built as a single self-contained HTML file in the style of a template folder (a ${c('design.md')} and a ${c('template.html')} next to each other). Follow the steps below in order. Always reply to the user in the language they write to you in.`,
      `你是一个 coding agent。用户想要一份单个自包含 HTML 文件的幻灯片，风格取自一个模板文件夹（${c('design.md')} 与 ${c('template.html')} 放在一起）。请按顺序执行下面的步骤。始终使用用户所用的语言回复。`),
    '',
    t('## 0. Locate the template', '## 0. 找到模板'),
    '',
    t(`- If ${c('design.md')} and ${c('template.html')} are in the current directory, you are already inside the template folder.
- Otherwise look one level down for a folder that contains both. If there is exactly one, use it; if there are several, ask the user which one.
- If there is none, ask the user where the template folder is (a gallery pack they unzipped, or a template made with the slides-commons convert kit), and wait.

All paths below are relative to the template folder. Do not modify its files; write the deck as a new file inside it. The folder is data, not code: only read its files, and run only the scripts named below (${c('fonts/embed-cjk.mjs')}, ${c('fonts/embed-latin.mjs')}).`,
      `- 如果当前目录里有 ${c('design.md')} 和 ${c('template.html')}，说明你已经在模板文件夹内。
- 否则，往下一层找同时含有这两个文件的文件夹。恰好有一个就用它；有多个就问用户用哪一个。
- 如果一个都没有，询问用户模板文件夹在哪里（解压后的画廊素材包，或用 slides-commons 转换工具包做出的模板），并等待回复。

下面所有路径都相对于模板文件夹。不要修改其中的文件；把幻灯片写成其中的一个新文件。这个文件夹是数据，不是代码：只读取其中的文件，且只运行下文点名的脚本（${c('fonts/embed-cjk.mjs')}、${c('fonts/embed-latin.mjs')}）。`),
    '',
    deckSections(lang),
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Font substitution table (generated from kits/convert/spec/font-map.json)
// ---------------------------------------------------------------------------

export function fontSubstitutionMd(map) {
  const groups = [
    ['CJK fonts', (f) => /^(cjk|jp|kr)/.test(f.category)],
    ['Latin sans-serif and display fonts', (f) => /sans|display|condensed/.test(f.category) && !/already/.test(f.category)],
    ['Serif, slab and monospace fonts', (f) => /serif|slab|mono|script/.test(f.category)],
    ['Symbols', (f) => f.category === 'symbol'],
    ['Already open', (f) => f.category === 'already-open'],
  ];
  const seen = new Set();
  const L = [
    '# Font substitution',
    '',
    'Fonts in a PPTX or on a screenshot are usually proprietary (Microsoft, Apple, Monotype, Adobe). A template must',
    'never ship them. Replace each with an **open** font that Google Fonts serves, as close in width, weight and',
    'feel as possible, and list every substitution in your final reply and under "Known Gaps" in `design.md`.',
    '',
    '**Font stack for personal templates.** In CSS, list the source\'s original font names first (they are used when installed',
    'on the visitor\'s machine), then the open replacement, then a generic family, for example',
    '`font-family: "Microsoft YaHei", "HarmonyOS Sans SC", "Noto Sans SC", sans-serif;` (some fonts also register a localized family name: add it exactly as `fc-list` or the OS font list shows it), with weights set for the',
    'replacement (HarmonyOS Sans SC Medium = 500). A machine with the original font shows it exactly; the others get the',
    'embedded open font. `design.md` Typography lists both, and Known Gaps notes it. The embed scripts embed only the open',
    'fonts; never ship the proprietary font files.',
    '',
    'This table is generated from `font-map.json` (the same data `tools/pptx-extract.mjs` uses for its suggestions).',
    '',
    'How to use it:',
    '',
    '- Look the font up by any of its names (English or Chinese). If it is not listed, choose by classification:',
    '  neutral grotesque -> Inter or Arimo; humanist sans -> Nunito Sans or Open Sans; geometric sans -> Jost or',
    '  Outfit; didone / high-contrast serif -> Playfair Display or Bodoni Moda; old-style serif -> EB Garamond or',
    '  Lora; transitional serif -> Libre Baskerville or Tinos; slab -> Zilla Slab; condensed -> Barlow Condensed or',
    '  Archivo Narrow; monospace -> JetBrains Mono; handwriting -> Caveat.',
    '- Keep the weights the source uses (regular / medium / semibold / bold). A source font with fewer weights than',
    '  the replacement still gets the nearest one.',
    '- A deck with Chinese, Japanese or Korean text needs a CJK family **and** a Latin family; list both in the',
    '  font stack, Latin first. The Latin part of a CJK font is rarely the one the source used.',
    '- `google` is the family spec for `https://fonts.googleapis.com/css2?family=<spec>&display=swap`; join several',
    '  families with `&family=`. One `<link>` per deck, only the weights you use.',
    '- CJK families marked "embed" can be embedded into the finished deck by `fonts/embed-cjk.mjs` (offline use).',
    '',
  ];
  for (const [title, test] of groups) {
    const rows = map.fonts.filter((f) => test(f) && !seen.has(f));
    if (!rows.length) continue;
    rows.forEach((f) => seen.add(f));
    L.push(`## ${title}`, '');
    if (title === 'Already open') {
      L.push(`These are open Google Fonts families already: ${rows.flatMap((f) => f.match).join(', ')}. Use them as they are.`, '');
      continue;
    }
    L.push(table(['Font in the source', 'Use instead', 'Google Fonts spec', 'Note'], rows.map((f) => [f.match.join(', '), f.use + (f.embed ? ' (embed)' : ''), f.google ? c(f.google) : '-', f.note])), '');
  }
  return L.join('\n');
}

// ---------------------------------------------------------------------------
// Convert: your own PPTX or images -> a template folder
// ---------------------------------------------------------------------------

export const KIT_DOWNLOAD_LABEL = { en: 'Download the kit (.zip)', zh: '下载工具包（.zip）' };
export const SKILLS_DOWNLOAD_LABEL = { en: 'Download the skills (.zip)', zh: '下载技能包（.zip）' };

// Sections 1-6 of the convert workflow. `root` names the folder that holds tools/, spec/ and fonts/.
function convertSections(lang, { skill = false } = {}) {
  const t = pick(lang);
  const root = skill ? t('this skill\'s folder (the folder that holds this SKILL.md)', '本技能的文件夹（放着这个 SKILL.md 的文件夹）') : t(`the kit folder ${c('convert-kit/')}`, `工具包文件夹 ${c('convert-kit/')}`);
  // Every command is run from the user's working folder; the kit is addressed by its folder path.
  const K = skill ? '<skill folder>/' : 'convert-kit/';
  const L = [];
  L.push(t('## Ground rules', '## 基本规则'));
  L.push('');
  L.push(t(`- **Personal reuse.** The result is the user's private template for their own decks. The look, brand and text of the source belong to whoever made it: do not publish the template, and say so in the final reply. (If the user wants to share it, they need the owner's permission; it does not belong in the public gallery as it is.)
- **Everything stays local.** Never upload the user's files, never send their content to a website, online converter, OCR or image service. The only network use allowed is fonts (Google Fonts, jsDelivr) and, for the prompt, downloading this kit. Do not copy the source file anywhere outside the work folders below.
- **Take the design, not the content.** The template carries layout, colours, type and decoration, nothing else. **Design images are kept by default** (slide / layout / master backgrounds, full-bleed cover or section photos, decorative textures and patterns): see section 4 for how. Remove logos, content photographs (pictures that illustrate the user's subject, people or products; they become neutral placeholder blocks in the palette), real names, numbers, dates and confidential text from the sample slides unless the user explicitly says to keep them (a kept logo is embedded as a ${c('data:')} URI from the file's own images, downscaled). Write invented, modest sample content in the language the user writes in (or the deck's own language).
- **Never ship the source's fonts.** They are proprietary or licensed. Substitute open fonts using ${c('spec/font-substitution.md')} and list every substitution.
- **Be honest about accuracy.** From a ${c('.pptx')} the numbers (colours, sizes, positions) are exact; fonts, effects and animations are approximated. From images everything is an approximation: colours are sampled or guessed, sizes are measured by eye, fonts are guessed. Say which in the final reply.
- **Same folder layout as a gallery template,** so the result works with the "make a deck" prompt and skill (${c('slides-commons-deck')}): ${c('design.md')}, ${c('template.json')}, ${c('template.html')}, ${c('viewport-base.css')}, ${c('LICENSE-skill')}, ${c('PROMPT.md')}, ${c('PROMPT.zh.md')}, ${c('README.md')}, and ${c('fonts/')} for CJK embedding.
- **One path convention.** Run every command from the user's working folder (the folder that contains ${c(K)}${skill ? '; use the absolute path of the skill folder' : ''}). Kit files are named by their path inside the kit (${c('tools/…')}, ${c('spec/…')}, ${c('fonts/…')}, ${c('deck/…')}) and are called as ${c(K + 'tools/…')} in commands. The output ${c('<slug>/')} and the work folder ${c('<slug>-work/')} are created in the working folder, never inside ${c(K)}.${skill ? '' : ` If you are inside the kit, the working folder is its parent: go there (or use absolute paths).`}
- **Do not modify ${root}.** Write only the output folder and the work folder.`,
  `- **个人复用。**成果是用户自己用来做幻灯片的私人模板。源文件的外观、品牌和文字归其制作者所有：不要公开发布这个模板，并在最终回复里说明。（如果用户想分享，需要原作者的许可；它不能原样放进公开画廊。）
- **一切都在本地。**绝不上传用户的文件，绝不把内容发送到任何网站、在线转换器、OCR 或图片服务。唯一允许的联网用途是字体（Google Fonts、jsDelivr），以及（提示词方式下）下载本工具包。不要把源文件复制到下面两个工作文件夹之外的任何地方。
- **取设计，不取内容。**模板只携带版式、颜色、字体和装饰，别的都不带。**设计图片默认保留**（幻灯片 / 版式 / 母版的背景、整幅封面或章节页照片、装饰纹理和图案），做法见第 4 节。示例页里去掉标志、内容照片（用来说明用户主题、人物或产品的图片，改成配色里的中性占位块）、真实姓名、数字、日期和机密文字，除非用户明确说要保留（保留的标志用文件自带的图片缩小后以 ${c('data:')} URI 嵌入）。示例内容由你编写，要虚构、克制，语言用用户所用的语言（或幻灯片本身的语言）。
- **绝不附带源文件的字体。**它们是专有或有授权限制的。按 ${c('spec/font-substitution.md')} 换成开源字体，并列出每一处替换。
- **如实说明精度。**从 ${c('.pptx')} 得到的数字（颜色、字号、位置）是精确的；字体、特效和动画是近似的。从图片得到的一切都是近似：颜色是取样或估计的，字号是目测的，字体是猜的。最终回复里要说明是哪种情况。
- **文件夹布局与画廊模板相同，**这样成果可以配合“制作幻灯片”提示词和技能（${c('slides-commons-deck')}）使用：${c('design.md')}、${c('template.json')}、${c('template.html')}、${c('viewport-base.css')}、${c('LICENSE-skill')}、${c('PROMPT.md')}、${c('PROMPT.zh.md')}、${c('README.md')}，以及用于 CJK 嵌入的 ${c('fonts/')}。
- **统一的路径约定。**所有命令都在用户的工作文件夹里运行（即包含 ${c(K)} 的那个文件夹${skill ? '；技能文件夹用绝对路径' : ''}）。工具包里的文件用它在包内的路径称呼（${c('tools/…')}、${c('spec/…')}、${c('fonts/…')}、${c('deck/…')}），命令里写成 ${c(K + 'tools/…')}。输出文件夹 ${c('<slug>/')} 和工作文件夹 ${c('<slug>-work/')} 创建在工作文件夹里，绝不放进 ${c(K)} 里面。${skill ? '' : '如果你当前在工具包里面，工作文件夹就是它的上一级：切换过去（或使用绝对路径）。'}
- **不要修改${root}。**只写输出文件夹和工作文件夹。`));
  L.push('');
  L.push(t('## 1. Ask before converting', '## 1. 转换之前先提问'));
  L.push('');
  L.push(t(`In one message, ask the user:

1. **The source:** the path of a ${c('.pptx')} file, or the image files / folder (screenshots, exported slides, photos of slides; 3–12 images, one per distinct layout is plenty). Other formats: ${c('.ppt')}, ${c('.odp')}, ${c('.key')} or PDF cannot be read directly; ask them to export to ${c('.pptx')} (Keynote: File > Export To > PowerPoint) or to images. A PDF can be turned into images with ${c('pdftoppm -png -r 80 file.pdf page')} if poppler is installed.
2. **Name and slug:** a display name (e.g. "Quarterly Review") and a slug (lowercase letters, digits, single hyphens: ${c('quarterly-review')}). Suggest both from the file name, without brand names. The template goes to ${c('./<slug>/')} in the user's current folder (never inside ${root}) unless they say otherwise.
3. **What to keep:** colours, fonts (as open look-alikes), layouts, header/footer chrome, background and decorative images, logo, content photographs. Default: colours, type hierarchy, layouts, chrome and background/decorative images; no logo, no content photographs. If they also want the background images dropped, use a drawn approximation (CSS/SVG) instead.
4. **Language and CJK:** the language of the sample content, and whether decks made from this template will contain Chinese, Japanese or Korean text (this decides the CJK section of ${c('design.md')} and whether CJK fonts are embedded).
5. **Confirm personal use:** this template is for their own decks.

Skip any question already answered, then stop and wait for the reply.`,
  `在一条消息里向用户提问：

1. **源文件：**${c('.pptx')} 文件的路径，或图片文件 / 文件夹（截图、导出的幻灯片、拍下来的幻灯片照片；3–12 张就够，每种不同的版式一张即可）。其他格式：${c('.ppt')}、${c('.odp')}、${c('.key')} 或 PDF 无法直接读取；请他们导出为 ${c('.pptx')}（Keynote：文件 > 导出到 > PowerPoint）或导出为图片。如果装了 poppler，PDF 可以用 ${c('pdftoppm -png -r 80 file.pdf page')} 转成图片。
2. **名称和 slug：**显示名称（如 “Quarterly Review”）和 slug（小写字母、数字、单个连字符：${c('quarterly-review')}）。根据文件名建议两者，不要带品牌名。模板默认写到用户当前文件夹下的 ${c('./<slug>/')}（绝不放进${root}里面），除非他们另有指定。
3. **要保留什么：**颜色、字体（用开源近似字体）、版式、页眉页脚边饰、背景与装饰图片、标志、内容照片。默认：颜色、字体层级、版式、边饰以及背景 / 装饰图片；不要标志，不要内容照片。如果用户连背景图片也不要，就改用绘制的近似效果（CSS / SVG）。
4. **语言与 CJK：**示例内容的语言，以及用这个模板做的幻灯片是否会含中文、日文或韩文（这决定 ${c('design.md')} 的 CJK 一节，以及是否嵌入 CJK 字体）。
5. **确认个人使用：**这个模板用于他们自己的幻灯片。

用户已经回答过的问题就跳过，然后停下来等回复。`));
  L.push('');
  L.push(t('## 2. Read the source', '## 2. 读取源文件'));
  L.push('');
  L.push(t(`**A .pptx file.** Run (Node 18+; paths with spaces in quotes):

${'```'}
node ${K}tools/pptx-extract.mjs "<deck.pptx>" --out "<slug>-work/extract" --media
${'```'}

Read ${c('summary.md')} completely (it is also printed), then open ${c('extract.json')} for what you need in detail. ${c('spec/extractor.md')} explains the fields and how to turn them into a palette, a type scale, spacing and layout archetypes. Exit code 2 means the file is unreadable (old ${c('.ppt')}, password-protected, damaged): tell the user how to re-save it as ${c('.pptx')}; 3 means partial output (read the warnings). If Node is not available, unzip the ${c('.pptx')} (it is a zip file) and read ${c('ppt/theme/theme1.xml')}, ${c('ppt/slideMasters')}, ${c('ppt/slideLayouts')} and ${c('ppt/slides')} by hand. It also lists effects the template will simplify (reflection, glow, soft edge) and the effective colour of translucent fills. Look at the images in ${c('<slug>-work/extract/media/')} only to understand the design; do not copy them into the template unless the user said to keep the logo.

Optional visual reference: if LibreOffice is installed (${c('soffice')}), ${c('soffice --headless --convert-to pdf --outdir "<slug>-work/render" "<deck.pptx>"')} and then ${c('pdftoppm -png -r 60')} give PNGs of the source slides to look at. If it is not installed, do without it; never install software without asking.

**Images.** View every image yourself (you need image viewing; if your tools cannot show images, say so and ask for a ${c('.pptx')} or for a description of colours and fonts instead). For each image note: the layout type, background, where text blocks sit (as a fraction of the width, converted to px on a 1920-wide canvas), relative text sizes, colours, decoration, header/footer chrome. Sample exact hex colours if you can (for example with Python Pillow ${c('Image.getpixel')} or a small Node script on the image file); otherwise estimate by eye and mark them approximate. Identify fonts by their look (serif or sans, weight, width, contrast) and pick open look-alikes with ${c('spec/font-substitution.md')}.

If the user gives both a ${c('.pptx')} and images, the ${c('.pptx')} is the truth and the images show what it should look like.`,
  `**.pptx 文件。**运行（Node 18 及以上；路径含空格时加引号）：

${'```'}
node ${K}tools/pptx-extract.mjs "<deck.pptx>" --out "<slug>-work/extract" --media
${'```'}

完整阅读 ${c('summary.md')}（它也会打印在终端里），再按需打开 ${c('extract.json')} 查看细节。${c('spec/extractor.md')} 说明了各字段，以及如何把它们变成配色、字号层级、间距和版式类型。退出码 2 表示文件无法读取（旧版 ${c('.ppt')}、有密码、已损坏）：告诉用户如何另存为 ${c('.pptx')}；3 表示只输出了一部分（读一下 warnings）。如果没有 Node，就解压 ${c('.pptx')}（它是个 zip 文件），手工阅读 ${c('ppt/theme/theme1.xml')}、${c('ppt/slideMasters')}、${c('ppt/slideLayouts')} 和 ${c('ppt/slides')}。它还会列出模板需要简化的特效（倒影、发光、柔化边缘）以及半透明填充的实际颜色。${c('<slug>-work/extract/media/')} 里的图片只用来理解设计；除非用户说要保留标志，否则不要复制进模板。

可选的视觉参考：如果装了 LibreOffice（${c('soffice')}），用 ${c('soffice --headless --convert-to pdf --outdir "<slug>-work/render" "<deck.pptx>"')}，再用 ${c('pdftoppm -png -r 60')} 就能得到源幻灯片的 PNG 来观看。没装就不用；没问过用户不要安装软件。

**图片。**你要自己查看每一张图片（需要具备看图能力；如果你的工具看不了图片，就如实说明，并改为索取 ${c('.pptx')} 或对颜色和字体的文字描述）。对每张图片记下：版式类型、背景、文字块的位置（按占宽度的比例换算成 1920 宽画布上的 px）、文字的相对大小、颜色、装饰、页眉页脚边饰。能取样就取精确的十六进制颜色（例如用 Python Pillow 的 ${c('Image.getpixel')} 或一个小的 Node 脚本读图片文件）；否则目测估计并标注为近似。按外观（衬线还是无衬线、字重、宽度、对比）判断字体，并用 ${c('spec/font-substitution.md')} 选开源近似字体。

如果用户同时给了 ${c('.pptx')} 和图片，以 ${c('.pptx')} 为准，图片表示它应有的样子。`));
  L.push('');
  L.push(t('## 3. Derive the design system', '## 3. 提炼设计系统'));
  L.push('');
  L.push(t(`Before writing files, settle these (jot them down; they become ${c('design.md')}):

- **Palette:** 6–10 named colours with roles (slide background, text, muted text, rules, accent, tinted fills, stage background around the slide). Exact hex values. If the source defines its own palette roles (for example a colour-palette slide), keep all of them, even beyond 10; every colour keeps a role name (never a hue name). Use the effective colour of translucent fills, and say in the design that it is an overlay.
- **Type scale:** 5–6 roles (display / title / subtitle / body / label / caption) in px at 1920×1080 with weight, line-height, letter-spacing and case, plus the font families (substituted by open fonts; keep the original name in the notes).
- **Spacing:** page margins, gutters, vertical rhythm, the grid, where chrome sits (header, footer, page number, logo position).
- **Layout archetypes:** one per distinct layout of the source (cover, section divider, title + bullets, two columns, image + text, big number, quote, table, timeline, closing, …). Target 8–12; with more distinct layouts keep the most used or most distinctive and say what you left out under "Known Gaps". **With fewer than 8,** extend inside the same system: build the missing archetypes (for example agenda, big number, two columns, quote, closing) from the source's own rules (its palette card, chrome, type scale, spacing, signature moves), never from outside styles. Mark each extended layout "(extended)" in the Slide Archetypes of design.md and in a comment in template.html, list them in "Known Gaps" as not present in the source, and aim for 8–12 in total.
- **Signature moves:** the 4–8 things that repeat and make it recognisable (a colour bar, a rule under the title, a number badge, corner marks, rounded cards, a shadow style). If a chrome string is signature text that must stay as written in every language (for example a Latin "PART 1 PART 2" strip or "CONTENTS" in a Chinese deck), name it in design.md as **fixed signature text**; the deck prompt then keeps it as is, and translates all other labels.
- **Depth:** shadows, borders, overlays, or none.
Follow the source's proportions; do not "improve" the design. Where the source breaks a rule of good slide design (tiny text, low contrast), reproduce the look but record it in "Known Gaps", and in the sample slides keep presentation text (titles, body, labels, cards) at 20px or more, the same minimum the deck prompt applies to projected decks; only source lines, footnotes and the page number may go down to 18px. If the source is smaller, enlarge to that minimum and record it in "Known Gaps".`,
  `写文件之前，先定下这些（先记下来；它们会变成 ${c('design.md')}）：

- **配色：**6–10 个带角色的命名颜色（幻灯片背景、文字、次要文字、分隔线、强调色、浅色填充、幻灯片四周的画布背景）。十六进制值要精确。如果源文件自带配色角色（例如一页配色卡），全部保留，可以超过 10 个；每个颜色都用角色命名（不用色相名）。半透明填充使用其实际颜色，并在设计里注明它是叠层。
- **字号层级：**5–6 个角色（大标题 / 标题 / 副标题 / 正文 / 标签 / 说明），在 1920×1080 上的 px 尺寸，含字重、行高、字间距和大小写，以及字体族（换成开源字体；原字体名写进备注）。
- **间距：**页边距、栏距、纵向节奏、网格、边饰的位置（页眉、页脚、页码、标志位置）。
- **版式类型：**源文件里每一种不同的版式一个（封面、章节页、标题加要点、双栏、图文、大数字、引语、表格、时间线、结束页……）。目标是 8–12 个；版式更多时，保留最常用或最有特色的，并在“Known Gaps”里写明舍弃了什么。**不足 8 个时，**在同一套系统里扩展：用源文件自己的规则（它的配色卡、边饰、字号层级、间距、标志性手法）补出缺少的类型（例如目录、大数字、双栏、引语、结束页），绝不借用外部风格。每个扩展出的版式在 design.md 的 Slide Archetypes 和 template.html 的注释里标注 “(extended)”，并在 “Known Gaps” 里列为源文件中没有的，总数争取 8–12 个。
- **标志性手法：**反复出现、让它一眼可辨的 4–8 样东西（色条、标题下的线、数字徽章、角标、圆角卡片、阴影风格）。如果某个边饰字符串是在任何语言里都必须保持原样的标志性文字（例如中文幻灯片里的拉丁 “PART 1 PART 2” 条带或 “CONTENTS”），在 design.md 里把它明确写为**固定标志性文字**；制作幻灯片时它保持原样，其他标签则按幻灯片语言书写。
- **层次：**阴影、边框、叠层，或者没有。
遵循源文件的比例；不要“改进”设计。源文件违背好幻灯片原则的地方（字太小、对比度低），照样复现外观，但记在“Known Gaps”里，并且示例页里的演示文字（标题、正文、标签、卡片）保持在 20px 以上，与制作幻灯片提示词对投影型幻灯片的最小字号一致；只有来源行、脚注和页码可以降到 18px。源文件更小时，放大到这个下限，并记入 “Known Gaps”。`));
  L.push('');
  L.push(t('## 4. Write the template folder', '## 4. 写出模板文件夹'));
  L.push('');
  L.push(t(`Create ${c('<slug>/')} (in the user's current folder) with:

- ${c('template.json')}: follow ${c('spec/template-json.md')}. Exactly the 15 fields, the same palette names as ${c('design.md')}, open font names in ${c('typography')}.
- ${c('design.md')}: follow ${c('spec/design-md.md')} (the required sections) and use ${c('spec/example/design.md')} as the model of structure and depth; copy its "Frontend Slides Fixed-Stage Policy" section (the heading contains "Fixed-Stage") unchanged. Fill the "CJK & International Content" section for the fonts you chose (look at ${c('spec/font-substitution.md')}), even when the sample slides have no CJK text. In "Known Gaps" list every approximation.
- ${c('template.html')}: 8–12 slides, one per layout archetype, filled with invented sample content, built like ${c('spec/example/template.html')}. Requirements: one file, all CSS and JS inline; the full unmodified ${c('viewport-base.css')} inlined in the ${c('<style>')} block; fixed 1920×1080 stage (${c('.deck-viewport > .deck-stage > section.slide')}) scaled by one inline script; navigation by keys (→ ← Space PageUp PageDown Home End), mouse wheel (debounced) and swipe; page numbers filled by script; colours as CSS variables named like ${c('design.md')}; sizes in px from the type scale; ${c('<html lang>')}, ${c('<title>')}; respect ${c('prefers-reduced-motion')}; charts, icons and decoration as inline SVG or CSS; images only as ${c('data:')} URIs (the kept design images, and a kept logo). No external request except the font services. Aim for ≤ 3 MB for the whole template; if it is larger, downscale the images harder.
- ${c('viewport-base.css')} and ${c('LICENSE-skill')}: copy from ${root}, unchanged (the license is MIT, Zara Zhang, from the frontend-slides project; keep it next to the CSS).
- ${c('PROMPT.md')} and ${c('PROMPT.zh.md')}: copy ${c('deck/PROMPT.md')} and ${c('deck/PROMPT.zh.md')} from ${root} unchanged. They are the generic "build a deck from the template in this folder" prompt.
- ${c('README.md')}: five lines: what this is, which deck or images it was made from and when, "personal use only; the design belongs to the original owner", the substituted fonts, and how to use it (open your coding agent in this folder and paste ${c('PROMPT.md')}, or use the ${c('slides-commons-deck')} skill).
- ${c('fonts/')}: copy ${c('fonts/embed-cjk.mjs')}, ${c('fonts/cjk-ranges.json')}, ${c('fonts/cjk-licenses/')} and ${c('fonts/embed-latin.mjs')} from ${root} unchanged, so decks made from this template can embed CJK and Latin fonts.
- ${c('screenshots/')} (optional, only if a browser automation tool is available): ${c('<slug>-1.png')} … ${c('<slug>-3.png')} at 1920×1080 (cover, a content slide, a data or closing slide).

**Design images in ${c('template.html')}.** Use ${c('media[].usedBy')} in ${c('extract.json')} to find them. Keep (by default) every slide, layout or master background, full-bleed cover or section photo, and decorative texture or pattern; they are part of the design, and the user's own image (personal use). Do not keep content images (pictures inside a content slide that illustrate the user's subject, people or products): draw neutral placeholder blocks in the palette instead; the same for logos unless the user asked. How to embed a kept image: (1) downscale it locally to the size it is shown at (max 1920px wide for full-bleed): JPEG at about quality 80 for photos, PNG only for images that need alpha; use Python Pillow if available, else ${c('sips')} on macOS or ImageMagick (${c('magick')} / ${c('convert')}); if none is available, embed the original bytes and say so in the report. (2) Embed it in ${c('template.html')} as a ${c('data:')} URI, shown with CSS ${c('background-image')} or ${c('<img>')}. (3) Put any overlay the source had (for example a 71% black mask) as a separate layer above it, not baked into the picture. (4) Declare each kept image in ${c('design.md')} (in ${c('## Components')} or ${c('## Signature Treatments')}): role, where it is used, size shown, and that it is the user's own image for personal use. If the user chose to drop background images, use a drawn approximation (CSS or SVG) and list it in ${c('## Known Gaps')}.

**Font stack: the original names first, then the open replacement.** This is the user's own deck, so every ${c('font-family')} lists the source's original font names first (they are used if installed on the machine; some fonts also register a localized family name, so add that name exactly as ${c('fc-list')} or the OS font list shows it), then the open replacement, then a generic family, for example ${c('font-family: "Microsoft YaHei", "HarmonyOS Sans SC", "Noto Sans SC", sans-serif;')}. A machine that has the original font shows it exactly; any other machine gets the embedded open font. Set weights for the replacement (for example HarmonyOS Sans SC Medium = 500). ${c('design.md')} Typography lists both the originals and the replacements, and "Known Gaps" notes it. The embed scripts still embed only the open fonts; **never ship proprietary font files**.

**Fonts in ${c('template.html')}.** Latin: one Google Fonts ${c('<link>')} with exactly the families and weights used (the open substitutes), then embed them (optional, recommended, because the kit holds no Latin font files): ${latinEmbedBlock('en', K + 'fonts/embed-latin.mjs', { target: '"<slug>/template.html"', what: 'template' })} CJK: if the sample slides contain CJK text, add one Google Fonts ${c('<link>')} for the CJK families (trimmed to the weights used) and embed them: ${cjkEmbedBlock('en', K + 'fonts/embed-cjk.mjs', { short: true, target: '"<slug>/template.html"', what: 'template' })}`,
  `创建 ${c('<slug>/')}（在用户当前文件夹里），内含：

- ${c('template.json')}：遵循 ${c('spec/template-json.md')}。恰好 15 个字段，配色名称与 ${c('design.md')} 一致，${c('typography')} 里写开源字体名。
- ${c('design.md')}：遵循 ${c('spec/design-md.md')}（必需的各节），并以 ${c('spec/example/design.md')} 作为结构和详细程度的范本；原样复制其中的 “Frontend Slides Fixed-Stage Policy” 一节（标题含 “Fixed-Stage”）。即使示例页没有 CJK 文字，也要针对你选的字体填写 “CJK & International Content” 一节（参考 ${c('spec/font-substitution.md')}）。在 “Known Gaps” 里列出每一处近似。
- ${c('template.html')}：8–12 页，每种版式类型一页，用虚构的示例内容填充，做法参照 ${c('spec/example/template.html')}。要求：单个文件，所有 CSS 与 JS 内联；完整、未经修改的 ${c('viewport-base.css')} 内联在 ${c('<style>')} 里；固定 1920×1080 画布（${c('.deck-viewport > .deck-stage > section.slide')}），由一段内联脚本缩放；键盘翻页（→ ← 空格 PageUp PageDown Home End）、鼠标滚轮（带防抖）和滑动；页码由脚本填充；颜色用 CSS 变量，命名与 ${c('design.md')} 一致；尺寸用字号层级里的 px；${c('<html lang>')}、${c('<title>')}；尊重 ${c('prefers-reduced-motion')}；图表、图标和装饰用内联 SVG 或 CSS；图片只以 ${c('data:')} URI 形式出现（保留的设计图片和保留的标志）。除字体服务外不发起任何外部请求。整个模板力求不超过 3 MB；超出就把图片缩得更小。
- ${c('viewport-base.css')} 和 ${c('LICENSE-skill')}：从${root}原样复制（协议为 MIT，作者 Zara Zhang，来自 frontend-slides 项目；与 CSS 放在一起）。
- ${c('PROMPT.md')} 和 ${c('PROMPT.zh.md')}：从${root}原样复制 ${c('deck/PROMPT.md')} 与 ${c('deck/PROMPT.zh.md')}。它们是通用的“用这个文件夹里的模板制作幻灯片”提示词。
- ${c('README.md')}：五行：这是什么、由哪份幻灯片或哪些图片在何时做成、“仅限个人使用；设计归原所有者所有”、替换过的字体，以及用法（在这个文件夹里打开你的 coding agent 并粘贴 ${c('PROMPT.md')}，或使用 ${c('slides-commons-deck')} 技能）。
- ${c('fonts/')}：从${root}原样复制 ${c('fonts/embed-cjk.mjs')}、${c('fonts/cjk-ranges.json')}、${c('fonts/cjk-licenses/')} 和 ${c('fonts/embed-latin.mjs')}，这样用这个模板做的幻灯片可以嵌入 CJK 和拉丁字体。
- ${c('screenshots/')}（可选，仅当有浏览器自动化工具时）：${c('<slug>-1.png')} … ${c('<slug>-3.png')}，1920×1080（封面、一页内容页、一页数据页或结束页）。

**${c('template.html')} 里的设计图片。**用 ${c('extract.json')} 里的 ${c('media[].usedBy')} 找出它们。默认保留所有幻灯片 / 版式 / 母版背景、整幅封面或章节页照片，以及装饰纹理和图案：它们属于设计的一部分，也是用户自己的图片（个人使用）。不保留内容图片（内容页里用来说明用户主题、人物或产品的图片）：改画配色里的中性占位块；标志同理，除非用户要求保留。保留图片的嵌入方法：（1）在本地把它缩小到实际显示的尺寸（整幅图最宽 1920px）：照片用 JPEG、质量约 80，需要透明度的图片才用 PNG；有 Python Pillow 就用它，否则 macOS 用 ${c('sips')}，或用 ImageMagick（${c('magick')} / ${c('convert')}）；都没有就嵌入原始字节，并在报告里说明。（2）以 ${c('data:')} URI 嵌入 ${c('template.html')}，用 CSS ${c('background-image')} 或 ${c('<img>')} 显示。（3）源文件里的叠加层（例如 71% 黑色蒙版）作为独立图层放在图片之上，不要烧进图片里。（4）在 ${c('design.md')}（${c('## Components')} 或 ${c('## Signature Treatments')}）里逐一声明保留的图片：用途、使用位置、显示尺寸，并注明这是用户自己的图片、仅限个人使用。如果用户选择不要背景图片，就改用绘制的近似效果（CSS 或 SVG），并写进 ${c('## Known Gaps')}。

**字体栈：先写原字体，再写开源替代。**这是用户自己的幻灯片，所以每个 ${c('font-family')} 先列出源文件的原字体名（按本机已安装字体使用，中英文名都写），再列开源替代字体，最后是通用族，例如 ${c('font-family: "Microsoft YaHei", "微软雅黑", "HarmonyOS Sans SC", "Noto Sans SC", sans-serif;')}。有原字体的电脑会精确显示原字体，没有的电脑显示嵌入的开源字体。字重按替代字体写（例如 HarmonyOS Sans SC Medium 用 500）。${c('design.md')} 的 Typography 同时列出原字体和替代字体，“Known Gaps” 注明这一点。嵌入脚本仍只嵌开源字体；**绝不附带专有字体文件**。

**${c('template.html')} 里的字体。**拉丁字体：一条 Google Fonts ${c('<link>')}，恰好包含用到的字体族和字重（开源替代字体），然后嵌入它们（可选，推荐，因为工具包里没有拉丁字体文件）：${latinEmbedBlock('zh', K + 'fonts/embed-latin.mjs', { target: '"<slug>/template.html"', what: 'template' })} CJK：如果示例页含 CJK 文字，添加一条 CJK 字体族的 Google Fonts ${c('<link>')}（精简到用到的字重）并嵌入：${cjkEmbedBlock('zh', K + 'fonts/embed-cjk.mjs', { short: true, target: '"<slug>/template.html"', what: 'template' })}`));
  L.push('');
  L.push(t('## 5. Self-check', '## 5. 自检'));
  L.push('');
  L.push(t(`1. Run ${c(`node ${K}tools/check-template.mjs "<slug>"`)} and fix every error (warnings: fix or justify).
2. Render ${c('<slug>/template.html')} in a real browser (Playwright, Puppeteer or headless Chrome, whatever is available) at **1920×1080**, **1280×720** and a phone viewport (**390×844**), and screenshot every slide (advance with →). Check on every slide: no text overflows or is clipped; no panel overlaps another (look at the screenshots, a ${c('scrollHeight')} check misses this); contrast of text on its background (4.5:1, large text 3:1); the intended fonts are really loaded (wait for ${c('document.fonts.ready')} and check ${c('document.fonts')}); no console errors (offline, the failed Google Fonts request and its console error are expected and fine when the fonts are embedded); no network request except the font services; in CJK text no line ends with a single character.
3. **Fidelity.** Pick 3–4 source slides with different layouts. Compare each side by side with the template slide for the same archetype: from a ${c('.pptx')}, with the LibreOffice render if you made one, otherwise with the numbers in ${c('extract.json')}; from images, with the image itself. Check proportions (title position and size, margins), colours, weight and density of the type, decoration. Fix every visible difference that is within scope; list the rest.
4. If you can, write the three screenshots into ${c('<slug>/screenshots/')}.
5. Open ${c('<slug>/template.html')} in the user's default browser:
${openStep('en')}`,
  `1. 运行 ${c(`node ${K}tools/check-template.mjs "<slug>"`)}，修复每一个错误（警告：修复，或说明理由）。
2. 在真实浏览器（Playwright、Puppeteer 或无头 Chrome，有什么用什么）中以 **1920×1080**、**1280×720** 和一个手机视口（**390×844**）渲染 ${c('<slug>/template.html')}，并为每一页截图（用 → 翻页）。在每一页检查：没有文字溢出或被裁切；没有面板重叠（要看截图，只做 ${c('scrollHeight')} 检查会漏掉）；文字与背景的对比度（4.5:1，大字 3:1）；预期的字体真的加载了（等待 ${c('document.fonts.ready')} 并检查 ${c('document.fonts')}）；控制台没有报错（离线时 Google Fonts 请求失败及其报错属预期，字体已嵌入就没问题）；除字体服务外没有网络请求；CJK 文字中没有以单字结尾的行。
3. **还原度。**挑 3–4 页版式不同的源幻灯片，逐一与同一版式类型的模板页并排比较：来自 ${c('.pptx')} 时，用 LibreOffice 渲染图（如果做了），否则用 ${c('extract.json')} 里的数字；来自图片时，用图片本身。检查比例（标题的位置和大小、页边距）、颜色、字体的字重和疏密、装饰。修复范围内每一处肉眼可见的差异；其余的列出来。
4. 如果可以，把三张截图写进 ${c('<slug>/screenshots/')}。
5. 在用户的默认浏览器中打开 ${c('<slug>/template.html')}：
${openStep('zh')}`));
  L.push('');
  L.push(t('## 6. Final reply', '## 6. 最终回复'));
  L.push('');
  L.push(t(`Report: the full path of the template folder; the slide count and which archetype each slide shows; **everything that is an approximation** (fonts replaced, original name to open font; gradients, shadows and effects simplified; charts, SmartArt, animations and transitions not converted; **the design images kept (file name in the source, role, size) and the images removed (content photographs, logos), each listed one by one;** other things removed such as names; for images, which colours were sampled and which guessed, and that sizes were measured by eye); layouts of the source that you left out; anything you could not verify (for example no browser to render in); how to make a deck with it (open the coding agent in the template folder and paste ${c('PROMPT.md')}, or use the ${c('slides-commons-deck')} skill); and a reminder that the template is for personal use and the design belongs to the source's owner. Mention that ${c('<slug>-work/')} holds extraction data (including the images of the source) and can be deleted.`,
  `报告：模板文件夹的完整路径；页数，以及每一页展示哪种版式类型；**所有属于近似的地方**（替换的字体，原字体名到开源字体；被简化的渐变、阴影和特效；没有转换的图表、SmartArt、动画和切换效果；**保留了哪些设计图片（源文件中的文件名、用途、尺寸）以及去掉了哪些图片（内容照片、标志），逐条列出；**被去掉的姓名等；对图片来说，哪些颜色是取样的、哪些是猜的，以及字号是目测的）；源文件中被你舍弃的版式；你无法验证的事项（例如没有可用来渲染的浏览器）；如何用它制作幻灯片（在模板文件夹里打开 coding agent 并粘贴 ${c('PROMPT.md')}，或使用 ${c('slides-commons-deck')} 技能）；并提醒这个模板仅限个人使用，设计归源文件的所有者所有。说明 ${c('<slug>-work/')} 里是提取数据（包括源文件的图片），可以删除。`));
  return L.join('\n');
}

// Files of the kit (section 1 of the prompt).
function kitFilesTable(lang) {
  const t = pick(lang);
  return table(t(['File', 'Purpose'], ['文件', '用途']), [
    [c('tools/pptx-extract.mjs'), t('Reads a .pptx and writes `summary.md` + `extract.json` (+ the images): slide size, theme colours and fonts, layouts, every shape with position and size on a 1920×1080 canvas, text runs, fills, images. Zero dependencies, Node 18+.', '读取 .pptx 并写出 `summary.md` + `extract.json`（以及图片）：幻灯片尺寸、主题颜色与字体、版式、每个形状在 1920×1080 画布上的位置和大小、文字片段、填充、图片。零依赖，Node 18 及以上。')],
    [c('tools/check-template.mjs'), t('Checks a finished template folder (files, `template.json`, required `design.md` headings, `template.html` rules).', '检查做好的模板文件夹（文件、`template.json`、`design.md` 必需的标题、`template.html` 的规则）。')],
    [c('spec/design-md.md'), t('The required structure of `design.md`.', '`design.md` 必需的结构。')],
    [c('spec/template-json.md'), t('The fields of `template.json`.', '`template.json` 的字段说明。')],
    [c('spec/extractor.md'), t('How to read the extractor output and turn it into a design.', '如何阅读提取结果并把它变成设计。')],
    [`${c('spec/font-substitution.md')}, ${c('spec/font-map.json')}`, t('Proprietary fonts mapped to open ones (also used by the extractor).', '专有字体到开源字体的对照表（提取工具也用它）。')],
    [c('spec/example/'), t('A complete, finished template (Minimal Pitch, MIT): `design.md`, `template.json`, `template.html`, `LICENSE`. The model for structure and depth. Never reuse its content or look.', '一个完整成品模板（Minimal Pitch，MIT）：`design.md`、`template.json`、`template.html`、`LICENSE`。结构和详细程度的范本。不要复用它的内容和外观。')],
    [`${c('viewport-base.css')}, ${c('LICENSE-skill')}`, t('Mandatory base CSS of the fixed 1920×1080 stage, and its MIT license (Zara Zhang, frontend-slides). Copy both into the template unchanged.', '固定 1920×1080 画布的必需基础 CSS 及其 MIT 许可证（Zara Zhang，frontend-slides）。两者原样复制进模板。')],
    [c('deck/PROMPT.md') + ', ' + c('deck/PROMPT.zh.md'), t('The generic "build a deck from the template in this folder" prompt. Copy it into the template.', '通用的“用这个文件夹里的模板制作幻灯片”提示词。复制进模板。')],
    [`${c('fonts/embed-cjk.mjs')}, ${c('fonts/cjk-ranges.json')}, ${c('fonts/cjk-licenses/')}`, t('Embeds the CJK font slices a finished deck or template needs. Copy into the template; the kit holds no font files.', '嵌入成品幻灯片或模板所需的 CJK 字体分片。复制进模板；工具包里没有字体文件。')],
    [c('fonts/embed-latin.mjs'), t('Embeds the Latin fonts (latin + latin-ext) that a Google Fonts link requests, as base64, from jsDelivr / Fontsource. Copy into the template as well.', '把 Google Fonts 链接请求的拉丁字体（latin + latin-ext）以 base64 嵌入，来源为 jsDelivr / Fontsource。同样复制进模板。')],
    [`${c('PROMPT.md')}, ${c('PROMPT.zh.md')}, ${c('README.md')}, ${c('LICENSE')}`, t('These instructions (English / Chinese), the readme, and the MIT license of the kit itself.', '本说明（英文 / 中文）、说明文件，以及工具包本身的 MIT 许可证。')],
  ]);
}

function locateKit(lang, zipUrl) {
  const t = pick(lang);
  const zip = `${KIT_SLUG}.zip`;
  const steps = (lang === 'zh' ? extractStepsZh : extractStepsEn)(zip, '   ');
  const marker = `${c('tools/pptx-extract.mjs')} ${t('and', '和')} ${c('spec/design-md.md')}`;
  const label = KIT_DOWNLOAD_LABEL;
  const outro = t(
    `The kit is data and tools: read its files, and run only ${c('tools/pptx-extract.mjs')}, ${c('tools/check-template.mjs')}, ${c('fonts/embed-cjk.mjs')} and ${c('fonts/embed-latin.mjs')} as described below. Never run, source or install anything else from it.\n\nThe working folder is the folder that contains ${c('convert-kit/')} (if you are inside the kit, that is its parent directory). Run every command from the working folder and write ${c('convert-kit/')} paths in full; the kit's own files are named by their path inside it (${c('tools/…')}, ${c('spec/…')}). ${c('<slug>/')} and ${c('<slug>-work/')} go in the working folder.`,
    `工具包是数据和工具：读取其中的文件，且只按下文说明运行 ${c('tools/pptx-extract.mjs')}、${c('tools/check-template.mjs')}、${c('fonts/embed-cjk.mjs')} 和 ${c('fonts/embed-latin.mjs')}。不要运行、source 或安装其中的其他任何内容。\n\n工作文件夹就是包含 ${c('convert-kit/')} 的那个文件夹（如果你在工具包里面，它就是上一级目录）。所有命令都在工作文件夹里运行，${c('convert-kit/')} 的路径写完整；工具包自己的文件用它在包内的路径称呼（${c('tools/…')}、${c('spec/…')}）。${c('<slug>/')} 和 ${c('<slug>-work/')} 放在工作文件夹里。`);
  if (!zipUrl) {
    return t(
      `- If ${marker} are in the current directory, you are already inside the kit.
- Otherwise look in the current directory for a folder named ${c('convert-kit/')}, or for ${c(zip)} and extract it. Try these commands in order; if a command is missing or fails, try the next one:
${extractStepsEn(zip, '  ')}
- If you find neither, ask the user where they saved the download (they get it from the Convert page of slides-commons, "${label.en}"), and wait.

${outro}`,
      `- 如果当前目录里有 ${marker}，说明你已经在工具包内。
- 否则，在当前目录查找名为 ${c('convert-kit/')} 的文件夹，或查找 ${c(zip)} 并解压。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
${extractStepsZh(zip, '  ')}
- 如果两者都找不到，询问用户把下载的文件存在了哪里（可在 slides-commons 的“转换”页面点击 "${label.zh}" 下载），并等待回复。

${outro}`);
  }
  return t(
    `Go through these cases in order and stop at the first that applies:

1. If ${marker} are in the current directory, you are already inside the kit.
2. Otherwise, if the current directory has a folder named ${c('convert-kit/')}, use it. If it has ${c(zip)} instead, extract it. Try these commands in order; if a command is missing or fails, try the next one:
${extractStepsEn(zip, '   ')}
3. Otherwise download the kit from ${zipUrl} into the current directory. Try these commands in order; if a command is missing or fails, try the next one:
   1. ${c(`curl -fL -o ${zip} ${zipUrl}`)} (in Windows PowerShell 5, ${c('curl')} is an alias for ${c('Invoke-WebRequest')}: type ${c('curl.exe')})
   2. ${c(`wget -O ${zip} ${zipUrl}`)}
   3. Windows PowerShell: ${c(`Invoke-WebRequest -Uri ${zipUrl} -OutFile ${zip}`)}

   Then extract ${c(zip)} as in case 2.
4. If every download fails (for example the network is offline or blocked), ask the user to download the kit from the Convert page of slides-commons ("${label.en}") into this directory, and wait.

${outro}`,
    `按顺序检查以下情况，遇到第一个符合的就照做：

1. 如果当前目录里有 ${marker}，说明你已经在工具包内。
2. 否则，如果当前目录有名为 ${c('convert-kit/')} 的文件夹，直接使用它；如果有 ${c(zip)}，解压它。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
${extractStepsZh(zip, '   ')}
3. 否则，把工具包从 ${zipUrl} 下载到当前目录。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
   1. ${c(`curl -fL -o ${zip} ${zipUrl}`)}（在 Windows PowerShell 5 中 ${c('curl')} 是 ${c('Invoke-WebRequest')} 的别名，要输入 ${c('curl.exe')}）
   2. ${c(`wget -O ${zip} ${zipUrl}`)}
   3. Windows PowerShell：${c(`Invoke-WebRequest -Uri ${zipUrl} -OutFile ${zip}`)}

   然后按第 2 种情况的方法解压 ${c(zip)}。
4. 如果所有下载方式都失败（例如网络断开或被拦截），请用户在 slides-commons 的“转换”页面点击 "${label.zh}" 把工具包下载到这个目录，并等待回复。

${outro}`);
}

export function convertPrompt(lang, { zipUrl = null } = {}) {
  const t = pick(lang);
  return [
    t('# Turn a PowerPoint or images into a slides-commons template', '# 把 PowerPoint 或图片变成 slides-commons 模板'),
    '',
    t(`You are a coding agent. The user wants to reuse the look of an existing slide deck (a ${c('.pptx')} file) or of some slide images as a **template for their own future decks**: a folder with ${c('design.md')}, ${c('template.json')} and ${c('template.html')}, in the same format as the slides-commons gallery templates. This is for the user's **personal use**, and everything happens on their computer. Follow the steps below in order. Always reply to the user in the language they write to you in.`,
      `你是一个 coding agent。用户想把一份现有幻灯片（${c('.pptx')} 文件）或一些幻灯片图片的外观，复用为**自己以后做幻灯片用的模板**：一个含 ${c('design.md')}、${c('template.json')} 和 ${c('template.html')} 的文件夹，格式与 slides-commons 画廊里的模板相同。这是供用户**个人使用**的，一切都在他们自己的电脑上完成。请按顺序执行下面的步骤。始终使用用户所用的语言回复。`),
    '',
    t('## 0. Locate the kit', '## 0. 找到工具包'),
    '',
    locateKit(lang, zipUrl),
    '',
    t('## What is in the kit', '## 工具包里有什么'),
    '',
    kitFilesTable(lang),
    '',
    convertSections(lang),
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Skills (Agent Skills: a folder with SKILL.md + supporting files)
// ---------------------------------------------------------------------------

export const SKILL_INFO = {
  'slides-commons-deck': {
    en: 'Make a slide deck from a template folder (a gallery pack or a converted template).',
    zh: '用模板文件夹（画廊素材包或转换出来的模板）制作幻灯片。',
    descriptionEn: 'Build a single-file HTML slide deck (fixed 1920x1080 canvas, keyboard and swipe navigation, works offline) in the style of a slides-commons template folder (design.md + template.html), such as a gallery pack or a template made with slides-commons-convert. Use when the user asks for slides, a presentation, a pitch deck or a talk in a given template or style, or to make a deck from a template folder. 用模板制作 HTML 幻灯片、演示文稿、路演 PPT。',
  },
  'slides-commons-convert': {
    en: 'Turn your own .pptx or slide images into a reusable template folder (personal use).',
    zh: '把你自己的 .pptx 或幻灯片图片变成可复用的模板文件夹（个人使用）。',
    descriptionEn: 'Turn the user\'s own PowerPoint (.pptx) or slide images/screenshots into a reusable slides-commons template folder (design.md, template.json, template.html) for personal reuse. Runs locally; nothing is uploaded. Use when the user wants to reuse the look of an existing deck or of slide images as a template, or asks to convert a PPT/PPTX into an HTML slide template. 把 PPT/PPTX 或幻灯片图片转换成 HTML 幻灯片模板。',
  },
  'slides-commons-cjk-fonts': {
    en: 'Embed the CJK fonts a finished HTML deck needs, so it works offline.',
    zh: '把成品 HTML 幻灯片需要的 CJK 字体嵌入，离线也能正常显示。',
    descriptionEn: 'Embed the Chinese/Japanese/Korean web fonts a finished single-file HTML page or slide deck needs, as base64 @font-face rules, so it renders in the intended CJK fonts offline and without Google Fonts. Use after writing or editing an HTML deck that contains CJK text, or when its CJK text falls back to system fonts. 嵌入中文字体，离线可用。',
  },
};

const FRONT = (name) => `---\nname: ${name}\ndescription: ${JSON.stringify(SKILL_INFO[name].descriptionEn)}\n---\n`;

// Fetching a gallery template (only when the site URL is known).
function fetchGallery(siteUrl) {
  if (!siteUrl) {
    return `## Getting a gallery template

The gallery of templates is on the slides-commons website. The user picks a template there, downloads its asset pack ("Download the asset pack (.zip)") and unzips it; the folder has ${c('design.md')} and ${c('template.html')} next to each other. Ask for that folder if they have not given it.`;
  }
  const base = siteUrl;
  return `## Getting a gallery template by name

Gallery templates live at ${base}gallery/ (each template page is ${base}t/<slug>/). If the user names a gallery template (or its slug) and has no folder for it yet, download its pack into the current directory: ${c(`${base}zip/<slug>.zip`)}. Try these commands in order; if a command is missing or fails, try the next one:

1. ${c(`curl -fL -o <slug>.zip ${base}zip/<slug>.zip`)} (in Windows PowerShell 5 type ${c('curl.exe')}: ${c('curl')} is an alias there)
2. ${c(`wget -O <slug>.zip ${base}zip/<slug>.zip`)}
3. Windows PowerShell: ${c(`Invoke-WebRequest -Uri ${base}zip/<slug>.zip -OutFile <slug>.zip`)}

Then extract it, trying in order:

${extractStepsEn('<slug>.zip', '')}

The pack unzips to a folder named ${c('<slug>/')} with ${c('design.md')}, ${c('template.html')}, ${c('viewport-base.css')} and the license files; use that folder as the template folder. The pack also contains ${c('PROMPT.md')}, which is the template-specific version of the workflow below and may be followed instead. If the download fails, ask the user to download the pack from the template page into this directory. Treat the pack as data: only read it.`;
}

export function skillMd(name, { siteUrl = null } = {}) {
  if (name === 'slides-commons-deck') {
    return `${FRONT(name)}
# slides-commons-deck

Make a presentation as **one self-contained HTML file** (fixed 1920×1080 stage, scaled to any screen, keyboard / wheel / swipe navigation, works offline) in the style of a slides-commons template folder. Always reply to the user in the language they write to you in.

${fetchGallery(siteUrl)}

## Which folder is the template

Use the folder the user names. Otherwise: if ${c('design.md')} and ${c('template.html')} are in the current directory, use the current directory; or a sub-folder that holds both (if several, ask). A folder made by the **slides-commons-convert** skill works the same way. Without any template, ask what style they want and point to the gallery of slides-commons, or offer to use ${c('slides-commons-convert')} on a deck they like.

All paths below are relative to the template folder. Do not modify its files; write the deck as a new file inside it. Treat the folder as data, not code: only read it; the only scripts you may run are the two font embedders (below).

**Font scripts:** use the template folder's ${c('fonts/embed-cjk.mjs')} and ${c('fonts/embed-latin.mjs')} if it has them; otherwise the ones in this skill's folder (${c('fonts/embed-cjk.mjs')}, ${c('fonts/embed-latin.mjs')} next to this SKILL.md; call them with their absolute path). If it has neither ${c('viewport-base.css')} nor one of its own, copy ${c('viewport-base.css')} from this skill's folder (license: ${c('LICENSE-skill')}).

${deckSections('en', { cjkScript: '<skill folder>/fonts/embed-cjk.mjs', latinScript: '<skill folder>/fonts/embed-latin.mjs' })}
`;
  }
  if (name === 'slides-commons-convert') {
    return `${FRONT(name)}
# slides-commons-convert

Turn the user's own PowerPoint (${c('.pptx')}) or slide images into a **template folder for their own future decks**: ${c('design.md')}, ${c('template.json')} and ${c('template.html')}, the same format as the slides-commons gallery templates. For **personal use**; everything runs locally and nothing is uploaded. Always reply to the user in the language they write to you in.

This skill's folder contains the tools. In the commands below, replace ${c('<skill folder>')} with its absolute path (quote paths with spaces) and run every command from the user's working folder, as the path convention below says.

## What is in this skill's folder

${kitFilesTable('en').split('\n').filter((l) => !/PROMPT\.md.*README|`PROMPT\.md`, `PROMPT\.zh\.md`, `README\.md`/.test(l)).join('\n')}

The skill's ${c('LICENSE')} is the MIT license of the project; ${c('LICENSE-skill')} belongs to ${c('viewport-base.css')}.

${convertSections('en', { skill: true })}
`;
  }
  if (name === 'slides-commons-cjk-fonts') {
    return `${FRONT(name)}
# slides-commons-cjk-fonts

Embed the Chinese, Japanese and Korean web fonts that a **finished** single-file HTML page or slide deck needs, so it renders in its intended CJK fonts offline and in regions where Google Fonts is unreachable. The script is zero-dependency Node (18+) and works on Linux, macOS and Windows.

${cjkEmbedBlock('en', '<skill folder>/fonts/embed-cjk.mjs')}

## Files in this skill's folder

${table(['File', 'Purpose'], [
    [c('fonts/embed-cjk.mjs'), 'The script. Run it with Node; read it first if you like: it only reads the deck and `cjk-ranges.json`, downloads font pieces from the slides-commons site or jsDelivr, and writes the deck.'],
    [c('fonts/cjk-ranges.json'), 'The table of font slices (unicode-range pieces) per family and weight.'],
    [c('fonts/cjk-licenses/'), 'The licenses of the fonts (SIL Open Font License).'],
    [c('LICENSE'), 'MIT license of this project (the script).'],
  ])}

## Typical sequence

1. The deck is finished, or at least its text is. It has a Google Fonts link for its CJK families, e.g. ${c('<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">')}. If it has none, add one for the family the deck's CSS names (Noto Sans SC for sans, Noto Serif SC for serif; see ${c('fonts/cjk-ranges.json')} for the families the script knows) at the weights it uses.
2. Trim that link to the weights actually used.
3. ${c('node "<skill folder>/fonts/embed-cjk.mjs" "<deck.html>"')}
4. Open the deck (offline if you can) and check that CJK text shows in the intended face.
5. Re-run after every text edit.

**CJK typography reminders** when you also touch the deck's CSS: letter-spacing 0 and no ${c('text-transform: uppercase')} on CJK runs; line-height about 1.75 for body and 1.2 for headlines; full-width punctuation and a space between CJK and Latin text; ${c('text-wrap: pretty')} with ${c('line-break: strict')} to avoid one-character last lines.
`;
  }
  throw new Error(`unknown skill ${name}`);
}

// ---------------------------------------------------------------------------
// Install: commands per platform (shared by the READMEs and the Skills page)
// ---------------------------------------------------------------------------

export const INSTALL = {
  unix: {
    user: 'mkdir -p ~/.claude/skills\ncp -R slides-commons-skills/slides-commons-* ~/.claude/skills/',
    project: 'mkdir -p .claude/skills\ncp -R /path/to/slides-commons-skills/slides-commons-* .claude/skills/',
  },
  windows: {
    user: 'New-Item -ItemType Directory -Force "$HOME\\.claude\\skills" | Out-Null\nCopy-Item -Recurse -Force .\\slides-commons-skills\\slides-commons-* "$HOME\\.claude\\skills\\"',
    project: 'New-Item -ItemType Directory -Force ".claude\\skills" | Out-Null\nCopy-Item -Recurse -Force C:\\path\\to\\slides-commons-skills\\slides-commons-* ".claude\\skills\\"',
  },
  unzipUnix: 'unzip slides-commons-skills.zip',
  unzipWindows: 'Expand-Archive slides-commons-skills.zip -DestinationPath .',
  agentsLine: 'For slides and presentations, follow the instructions in ./slides-commons-skills/slides-commons-deck/SKILL.md (turn your own deck into a template: .../slides-commons-convert/SKILL.md).',
};

export function skillsInstallPrompt(lang, { zipUrl = null } = {}) {
  const t = pick(lang);
  const zip = `${SKILLS_SLUG}.zip`;
  const steps = (lang === 'zh' ? extractStepsZh : extractStepsEn)(zip, '   ');
  const names = SKILL_NAMES.map(c).join(t(', ', '、'));
  const get = zipUrl
    ? t(`Download ${zipUrl} into a new temporary folder (try these in order; if a command is missing or fails, try the next: ${c(`curl -fL -o ${zip} ${zipUrl}`)} (in Windows PowerShell 5 type ${c('curl.exe')}), ${c(`wget -O ${zip} ${zipUrl}`)}, PowerShell ${c(`Invoke-WebRequest -Uri ${zipUrl} -OutFile ${zip}`)}). If every download fails, ask me to download the skills from the Skills page of slides-commons ("${SKILLS_DOWNLOAD_LABEL.en}") and tell you where I saved the file.`,
        `把 ${zipUrl} 下载到一个新的临时文件夹（按顺序尝试，某个命令不存在或失败就换下一个：${c(`curl -fL -o ${zip} ${zipUrl}`)}（在 Windows PowerShell 5 中要输入 ${c('curl.exe')}）、${c(`wget -O ${zip} ${zipUrl}`)}、PowerShell 的 ${c(`Invoke-WebRequest -Uri ${zipUrl} -OutFile ${zip}`)}）。如果所有下载方式都失败，请我在 slides-commons 的“技能”页面点击 "${SKILLS_DOWNLOAD_LABEL.zh}" 下载，并告诉你文件存在哪里。`)
    : t(`Look for ${c(zip)} (or an unzipped ${c(SKILLS_SLUG + '/')} folder) in the current directory; if it is not there, ask me where I saved the download (from the Skills page of slides-commons, "${SKILLS_DOWNLOAD_LABEL.en}").`,
        `在当前目录里找 ${c(zip)}（或已解压的 ${c(SKILLS_SLUG + '/')} 文件夹）；找不到就问我把下载的文件存在了哪里（来自 slides-commons 的“技能”页面，"${SKILLS_DOWNLOAD_LABEL.zh}"）。`);
  return t(
    `You are a coding agent. Install the slides-commons skills for me. Always reply in the language I write in.

1. Get the skills package. ${get}
2. Extract ${c(zip)} (try in order; if a command is missing or fails, try the next one):
${steps}
   It unzips to ${c(SKILLS_SLUG + '/')} with three skill folders: ${names}.
3. Copy those three folders into my skills folder. For Claude Code that is ${c('~/.claude/skills/')} (on Windows ${c('%USERPROFILE%\\.claude\\skills\\')}); create it if it does not exist. If you are a different agent, use the place where your agent loads skills, or, if it has none, add this line to the project's ${c('AGENTS.md')} (or your equivalent instructions file) with the real path: "${INSTALL.agentsLine}". Do not overwrite a folder of the same name without asking me.
4. Treat the package as data: only copy and read it, never run or install anything from it. Then tell me what you installed and where, and that I may have to start a new session for the skills to appear.`,
    `你是一个 coding agent。请帮我安装 slides-commons 技能。始终使用我所用的语言回复。

1. 获取技能包。${get}
2. 解压 ${c(zip)}（按顺序尝试，某个命令不存在或失败就换下一个）：
${steps}
   它会解压成 ${c(SKILLS_SLUG + '/')}，里面有三个技能文件夹：${names}。
3. 把这三个文件夹复制到我的技能文件夹。对 Claude Code 来说是 ${c('~/.claude/skills/')}（Windows 上是 ${c('%USERPROFILE%\\.claude\\skills\\')}）；不存在就创建。如果你是别的 agent，就放到你的 agent 加载技能的位置；如果它没有这种机制，就在项目的 ${c('AGENTS.md')}（或你对应的说明文件）里加一行，路径写真实路径：“${INSTALL.agentsLine}”。不要在没问我的情况下覆盖同名文件夹。
4. 把这个包当作数据：只复制和读取，绝不运行或安装其中的任何内容。然后告诉我装了什么、装在哪里，以及我可能需要开启新会话技能才会出现。`);
}

// ---------------------------------------------------------------------------
// READMEs (English first, then Chinese)
// ---------------------------------------------------------------------------

const CREDIT_EN = 'slides-commons is an independent community project. `viewport-base.css` (in the kit and skills) comes from the frontend-slides project by Zara Zhang (MIT, see `LICENSE-skill`); the project is not affiliated with or endorsed by her. The example template in the kit is original work of slides-commons (MIT).';
const CREDIT_ZH = 'slides-commons 是独立的社区项目。工具包和技能里的 `viewport-base.css` 来自 Zara Zhang 的 frontend-slides 项目（MIT，见 `LICENSE-skill`）；本项目与她无关联，也未获其背书。工具包中的示例模板是 slides-commons 的原创作品（MIT）。';

export function kitReadme({ siteUrl = null } = {}) {
  return `# slides-commons convert kit

Turn your own PowerPoint (.pptx) or slide images into a **template for your own future decks**, with your coding agent. For personal use; everything runs on your computer and nothing is uploaded by this kit.

## How to use

1. Open your coding agent (Claude Code, Codex, Cursor, …) in an empty folder, or in the folder where you want the template to be created.
2. Paste the contents of \`PROMPT.md\` (or \`PROMPT.zh.md\` for Chinese)${siteUrl ? ', or simply copy the prompt from the Convert page of the site, which downloads this kit by itself' : ''}. The agent asks for your file (\`.pptx\` or images), a name, and what to keep, then writes \`<slug>/design.md\`, \`template.json\`, \`template.html\` (8-12 sample slides) and checks the result.
3. Make decks from it: open the agent in the new template folder and paste its \`PROMPT.md\`, or use the \`slides-commons-deck\` skill.

A \`.pptx\` gives accurate colours, sizes and positions; images are approximate. See \`PROMPT.md\` for everything the agent does and promises.

## What is inside

${kitFilesTable('en')}

## Licenses

${CREDIT_EN}

---

# slides-commons 转换工具包

用你的 coding agent，把你自己的 PowerPoint（.pptx）或幻灯片图片变成**你以后做幻灯片用的模板**。仅限个人使用；一切都在你的电脑上运行，本工具包不会上传任何东西。

## 用法

1. 在一个空文件夹（或你想创建模板的文件夹）里打开你的 coding agent（Claude Code、Codex、Cursor……）。
2. 粘贴 \`PROMPT.zh.md\` 的内容（英文用 \`PROMPT.md\`）${siteUrl ? '，或者直接从网站“转换”页面复制提示词，它会自己下载本工具包' : ''}。agent 会询问你的文件（\`.pptx\` 或图片）、名称和要保留的内容，然后写出 \`<slug>/design.md\`、\`template.json\`、\`template.html\`（8–12 页示例）并检查结果。
3. 用它做幻灯片：在新的模板文件夹里打开 agent 并粘贴其中的 \`PROMPT.md\`，或者使用 \`slides-commons-deck\` 技能。

\`.pptx\` 能得到准确的颜色、字号和位置；图片是近似的。agent 做的所有事和作出的承诺见 \`PROMPT.zh.md\`。

## 里面有什么

${kitFilesTable('zh')}

## 许可证

${CREDIT_ZH}
`;
}

export function skillsReadme({ siteUrl = null } = {}) {
  const skillRows = (lang) => SKILL_NAMES.map((n) => [c(n), SKILL_INFO[n][lang]]);
  return `# slides-commons skills

Three [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills) for making slides with a coding agent. Each is a folder with a \`SKILL.md\` and the files it needs.

${table(['Skill', 'What it does'], skillRows('en'))}

## Install

**Let your agent do it:** copy the install prompt from the Skills page of the slides-commons site${siteUrl ? ' (it downloads this package itself)' : ''} and paste it into your agent.

**By hand.** Unzip, then copy the three \`slides-commons-*\` folders into your skills folder.

Claude Code, for all your projects (macOS / Linux):

\`\`\`
${INSTALL.unzipUnix}
${INSTALL.unix.user}
\`\`\`

Claude Code, for all your projects (Windows PowerShell):

\`\`\`
${INSTALL.unzipWindows}
${INSTALL.windows.user}
\`\`\`

For one project only, copy them into \`<project>/.claude/skills/\` instead:

\`\`\`
${INSTALL.unix.project}
\`\`\`

Start a new session afterwards. Ask for what you want ("make a deck from the template in this folder", "turn this deck.pptx into a template") and the skill is picked up by its description.

**Other agents.** A \`SKILL.md\` is plain Markdown instructions, so any coding agent can follow it. Put the folders anywhere and point your agent at them, for example in \`AGENTS.md\`:

\`\`\`
${INSTALL.agentsLine}
\`\`\`

Every path inside a skill is relative to its own folder.

## Notes

- Nothing is uploaded: the skills only give instructions and local tools (Node 18+ scripts). Your agent itself may be a cloud service; whatever you hand it is subject to that service.
- ${CREDIT_EN}
- License: MIT (\`LICENSE\`); \`LICENSE-skill\` goes with \`viewport-base.css\`; the CJK font licenses are in \`fonts/cjk-licenses/\`.

---

# slides-commons 技能包

三个用 coding agent 做幻灯片的 [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills)。每个技能是一个文件夹，里面有 \`SKILL.md\` 和它需要的文件。

${table(['技能', '作用'], skillRows('zh'))}

## 安装

**让你的 agent 来装：**从 slides-commons 网站的“技能”页面复制安装提示词${siteUrl ? '（它会自己下载本技能包）' : ''}，粘贴给你的 agent。

**手动安装。**解压后，把三个 \`slides-commons-*\` 文件夹复制到你的技能文件夹。

Claude Code，对你所有项目生效（macOS / Linux）：

\`\`\`
${INSTALL.unzipUnix}
${INSTALL.unix.user}
\`\`\`

Claude Code，对你所有项目生效（Windows PowerShell）：

\`\`\`
${INSTALL.unzipWindows}
${INSTALL.windows.user}
\`\`\`

只对某一个项目生效，则复制到 \`<项目>/.claude/skills/\`：

\`\`\`
${INSTALL.unix.project}
\`\`\`

之后开启新会话。直接说出你的需求（“用这个文件夹里的模板做一份幻灯片”“把 deck.pptx 变成模板”），技能会按其描述被选中。

**其他 agent。**\`SKILL.md\` 就是普通的 Markdown 说明，任何 coding agent 都能照着做。把文件夹放在任何地方，并让你的 agent 指向它们，例如写进 \`AGENTS.md\`：

\`\`\`
${INSTALL.agentsLine}
\`\`\`

技能里的所有路径都相对于它自己的文件夹。

## 说明

- 不会上传任何东西：技能只提供说明和本地工具（Node 18+ 脚本）。你的 agent 本身可能是云服务；你交给它的内容受该服务的规则约束。
- ${CREDIT_ZH}
- 许可证：MIT（\`LICENSE\`）；\`LICENSE-skill\` 对应 \`viewport-base.css\`；CJK 字体的许可证在 \`fonts/cjk-licenses/\`。
`;
}
