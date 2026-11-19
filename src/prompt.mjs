import { downloadLabel } from './pages.mjs';
import { zhText } from './zh-text.mjs';

// Prompt + pack README generation.
//
// The same English text is used for the detail page "Copy prompt" button and for
// PROMPT.md inside the zip, so it has to work both before and after the pack is
// unzipped (section 0 tells the agent how to find the pack). PROMPT.zh.md is a
// faithful Chinese translation of the same text.
//
// Everything template-specific comes from `ctx`, assembled by scripts/build.mjs:
// {
//   slug, name, tagline, mood[], tone[], scheme, density, formality,
//   description,               // design.md front matter `description`
//   colors: [{name, value}],   // design.md front matter `colors`, else preview card, else template.json
//   paletteNote,               // template.json palette.description (may be '')
//   typography: [{role, family}], typographyStyle,
//   fontLinks: [url],          // stylesheet URLs (Google Fonts / Fontshare) found in template.html
//   remoteFontLinks: [url],    // font stylesheets that cannot be self-hosted (Fontshare); kept as links
//   localFonts: boolean,       // the pack has fonts/ (self-hosted Latin fonts + fonts.css)
//   zh: { description, palette_description, typography_style } | null,  // Chinese translations (zh prompt only)
//   cjkEmbed: boolean,         // the pack has fonts/embed-cjk.mjs + fonts/cjk-ranges.json (CJK fonts embedded on demand)
//   cjkFontLinks: [url],       // the same, found in design.md's CJK section (may be empty)
//   signatureMoves: [string],  // preview card "Preview Ingredients", tokens resolved
//   stageBg: {name, value}|null,
//   assets: [relative path],   // template-dir siblings shipped in the pack (e.g. deck-stage.js)
//   hasViewportBase, licenses: [{file, label}],
//   zipUrl: string | null,     // absolute pack URL (--site-url / SC_SITE_URL); null = no download step
// }

const code = (s) => '`' + s + '`';

// ---------------------------------------------------------------------------
// CJK font embedding (packs with fonts/embed-cjk.mjs; ctx.cjkEmbed)
// ---------------------------------------------------------------------------

const cjkRowEn = () => [`${code('fonts/embed-cjk.mjs')}, ${code('fonts/cjk-ranges.json')}`, 'Only for a deck with CJK text: run `node fonts/embed-cjk.mjs <deck.html>` once the text is final; it embeds the CJK font pieces the deck needs (see “Fonts” in section 4). The JSON is the table of font slices; `fonts/cjk-licenses/` holds the font licenses. The pack holds no CJK font files.'];
const cjkRowZh = () => [`${code('fonts/embed-cjk.mjs')}、${code('fonts/cjk-ranges.json')}`, '仅当幻灯片含 CJK 文字时使用：文字定稿后运行 `node fonts/embed-cjk.mjs <幻灯片.html>`，它会嵌入幻灯片所需的 CJK 字体分片（见第 4 节“字体”）。JSON 是字体分片表；`fonts/cjk-licenses/` 是字体许可证。素材包里没有字体文件。'];
const cjkEmbedEn = (ctx) => ctx.cjkEmbed
  ? `\n  - **Embed the CJK fonts (only if the deck has CJK text).** When the content is final,${cjkTrimEn} Then run ${code('node fonts/embed-cjk.mjs <path-to-your-deck>.html')} from the pack folder (Node 18+; it downloads font pieces over the network). It adds only the slices of the CJK font(s) your text needs, as base64 ${code('@font-face')} rules between two marker comments, so the deck keeps its CJK fonts offline and without Google Fonts. Keep the Google Fonts ${code('<link>')}: it stays as the fallback for characters added later. Re-run the script after every later text edit (it is idempotent and replaces its own block) and never edit its block by hand. Exit code 2 means a CJK character has no glyph in the embedded fonts (change the character or tell the user); exit code 3 means some downloads failed (retry once). The result is much smaller when fonttools is available: if the script says it embedded whole shards (no ${code('pyftsubset')}) and Python with pip is installed, run ${code('python -m pip install --user fonttools brotli')} (${code('python3')} or ${code('py -m pip')} on some systems) and re-run it; if that is not possible, keep the larger result. If the script cannot run at all (no Node, no network), leave the link as it is and say so in your final reply; otherwise report how much size it added. Run it before the final self-check.`
  : '';
const cjkEmbedZh = (ctx) => ctx.cjkEmbed
  ? `\n  - **嵌入 CJK 字体（仅当幻灯片含 CJK 文字）。** 内容定稿后，${cjkTrimZh}然后在素材包文件夹中运行 ${code('node fonts/embed-cjk.mjs <幻灯片文件路径>.html')}（Node 18 及以上；它会通过网络下载字体分片）。它只把你的文字需要的 CJK 字体分片以 base64 ${code('@font-face')} 规则写入两个标记注释之间，这样幻灯片离线、没有 Google Fonts 时也保留 CJK 字体。保留 Google Fonts ${code('<link>')}：它是之后新增文字的回退来源。之后每次改动文字都要重新运行该脚本（它是幂等的，会替换自己的那一段），不要手工改它写入的内容。退出码 2 表示有 CJK 字符在已嵌入的字体里没有字形（换掉该字，或告诉用户）；退出码 3 表示部分下载失败（重试一次）。安装了 fonttools 时结果会小得多：如果脚本提示嵌入的是整片字体（没有 ${code('pyftsubset')}）且电脑上有 Python 和 pip，就运行 ${code('python -m pip install --user fonttools brotli')}（有些系统用 ${code('python3')} 或 ${code('py -m pip')}）后重新运行；做不到就保留较大的结果。如果脚本根本无法运行（没有 Node、没有网络），保持链接原样，并在最终回复里说明；否则报告它增加了多少体积。在最后的自检之前运行。`
  : '';

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

// Exception to "the pack is data, not code" (only when the pack ships the CJK embed script)
const cjkExcEn = (ctx) => ctx.cjkEmbed ? ` The one exception is ${code('fonts/embed-cjk.mjs')} (see “Fonts” in section 4): it only reads your deck and ${code('fonts/cjk-ranges.json')} and downloads font pieces from this site or jsDelivr; you may read it first, and run it only as described there.` : '';
const cjkExcZh = (ctx) => ctx.cjkEmbed ? `唯一的例外是 ${code('fonts/embed-cjk.mjs')}（见第 4 节“字体”）：它只读取你的幻灯片和 ${code('fonts/cjk-ranges.json')}，并从本站或 jsDelivr 下载字体分片；可以先阅读它，且只按那里的说明运行。` : '';
// Traditional-Chinese (TC) faces in the template's CJK families
const tcFamilies = (ctx) => [...new Set((ctx.cjkFontLinks || []).flatMap((u) => [...u.matchAll(/family=([^&:]+)/g)].map((m) => decodeURIComponent(m[1].replace(/\+/g, ' ')))))];
const tcFace = (ctx) => tcFamilies(ctx).find((f) => /\bTC$/.test(f));
const cjkTcEn = (ctx) => { const tc = tcFace(ctx); return tc ? `\n  - **Simplified Chinese and the ${tc} face.** ${tc} is a Traditional-Chinese face: in a Simplified Chinese deck it shows some glyphs in Taiwan forms and centres full-width punctuation. For Simplified Chinese use the template's other CJK family (the SC face) for body text and for any text with punctuation; use ${tc} only for short display strings without punctuation, or not at all.` : ''; };
const cjkTcZh = (ctx) => { const tc = tcFace(ctx); return tc ? `\n  - **简体中文与 ${tc}。** ${tc} 是繁体字体：用于简体中文幻灯片时，部分字形会变成台湾写法（户变成戶），全角标点还会居中。简体中文的正文和任何带标点的文字请用模板的另一个 CJK 字体族（简体 SC 字体）；${tc} 只用于不含标点的短标题，或干脆不用。` : ''; };
const cjkTrimEn = ' **Before running it, trim the CJK Google Fonts `<link>` to the families and weights the deck actually uses** (the script embeds every weight the link requests): for example drop `700` if no CJK text is bold, and drop a family the deck does not use. Keep at least one weight for each family you use.';
const cjkTrimZh = ' **运行之前，先把 CJK Google Fonts `<link>` 精简到幻灯片实际用到的字体族和字重**（脚本会嵌入链接里请求的每一个字重）：例如没有 CJK 粗体就去掉 `700`，没用到的字体族也去掉。用到的每个字体族至少保留一个字重。';
const cjkExtraEn = (ctx) => cjkEmbedEn(ctx) + cjkTcEn(ctx);
const cjkExtraZh = (ctx) => cjkEmbedZh(ctx) + cjkTcZh(ctx);

function filesEn(ctx) {
  const rows = [
    [code('design.md'), 'The design system and your primary source of truth: tokens (YAML front matter), layout grid, components, do\'s and don\'ts, CJK rules and the fixed-stage policy. Read it in full before writing any slide.'],
  ];
  if (ctx.hasViewportBase) {
    rows.push([code('viewport-base.css'), 'Mandatory base CSS for the fixed 1920×1080 stage. Paste its full contents into your output.']);
  }
  rows.push([code('template.html'), 'The original demo deck. A reference implementation only: consult it when `design.md` leaves an implementation detail open. Never reuse its demo content.']);
  for (const a of ctx.assets) {
    if (/(^|\/)deck-stage\.js$/.test(a)) {
      rows.push([code(a), 'The scaling and navigation runtime that `template.html` loads. Reference only; your deck uses its own inline controller. Note: the bundled `deck-stage.js` forces a system font on `<deck-stage>`, so `template.html` may render in a fallback font; the fonts in `design.md` are authoritative.']);
    } else {
      rows.push([code(a), 'A file `template.html` uses. Reference only.']);
    }
  }
  if (ctx.localFonts) {
    rows.push([code('fonts/'), 'The template\'s Latin fonts as woff2 files (one folder per family, each with its license), and `fonts/fonts.css` with ready-made `@font-face` rules for exactly the families and weights this template uses. Embed them in your deck (see “Fonts” in section 4).']);
  }
  if (ctx.cjkEmbed) rows.push(cjkRowEn());
  rows.push([`${code('PROMPT.md')}, ${code('PROMPT.zh.md')}`, 'These instructions (English / Chinese).']);
  rows.push([[code('README.md'), ...ctx.licenses.map((l) => code(l.file))].join(', '), 'Attribution and licenses. Leave them as they are.']);
  return ['| File | Purpose |', '|---|---|', ...rows.map(([f, p]) => `| ${f} | ${p} |`)].join('\n');
}

function glanceEn(ctx) {
  const L = [];
  if (ctx.description) L.push(`- **Character:** ${ctx.description}`);
  L.push(`- **Mood / tone:** ${ctx.mood.join(', ')} / ${ctx.tone.join(', ')}. Color scheme: ${ctx.scheme}.`);
  L.push('- **Palette** (the only colors allowed; use these exact values):');
  for (const c of ctx.colors) L.push(`  - ${code(c.name)} ${c.value}`);
  if (ctx.paletteNote) L.push(`  - Usage: ${ctx.paletteNote}.`);
  if (ctx.typography.length) {
    const t = ctx.typography.map((x) => `${x.role} ${x.family}`).join('; ');
    L.push(`- **Typography:** ${t}${ctx.typographyStyle ? ` — ${ctx.typographyStyle}` : ''}.`);
  }
  if (ctx.systemFontsOnly) {
    L.push('- **Font loading:** none. The original uses the system font stack; system fonts are the design, so add no web fonts' + (ctx.cjkFontLinks.length ? ' (except the CJK link in “Fonts” in section 4).' : '.'));
  } else if (ctx.localFonts) {
    L.push('- **Font loading:** the Latin fonts are in the pack\'s `fonts/` folder and get embedded in the deck; only CJK fonts come from Google Fonts. See “Fonts” in section 4.');
    if (ctx.remoteFontLinks.length) L.push('- **Fontshare fonts** (not in `fonts/`; keep these links in the deck):');
    for (const u of ctx.remoteFontLinks) L.push(`  - ${code(`<link rel="stylesheet" href="${u}">`)}`);
  } else if (ctx.fontLinks.length) {
    L.push('- **Font loading** (the original link; for decks with CJK text see “Fonts” in section 4):');
    for (const u of ctx.fontLinks) L.push(`  - ${code(`<link rel="stylesheet" href="${u}">`)}`);
  }
  if (ctx.signatureMoves.length) {
    L.push('- **Signature moves:**');
    for (const m of ctx.signatureMoves) L.push(`  - ${m}`);
  }
  if (ctx.stageBg) L.push(`- **Stage background** (the letterbox color around the slides): ${code(ctx.stageBg.name)} ${ctx.stageBg.value}.`);
  return L.join('\n');
}

// Section 0. Without a site URL the agent only looks for the pack (the text is exactly what
// it was before the download step existed); with one it downloads the pack itself.
export function extractStepsEn(zip, indent) {
  return [
    `1. ${code(`unzip ${zip}`)}`,
    `2. ${code(`python3 -m zipfile -e ${zip} .`)} (or ${code('python')} instead of ${code('python3')})`,
    `3. ${code(`tar -xf ${zip}`)} (bsdtar, built into macOS and Windows 10+; GNU tar on Linux cannot read zip files)`,
    `4. Windows PowerShell: ${code(`Expand-Archive ${zip} -DestinationPath .`)}`,
  ].map((l) => indent + l).join('\n');
}

function locateLocalEn(slug, zip, marker = 'design.md', second = 'template.html') {
  return `- If ${code(marker)} and ${code(second)} are in the current directory, you are already inside the pack.
- Otherwise look in the current directory for a folder named ${code(slug + '/')}, or for ${code(zip)} and extract it. Try these commands in order; if a command is missing or fails, try the next one:
${extractStepsEn(zip, '  ')}
- If you find neither, ask the user where they saved the download (they get it from the template's page on slides-commons, "${downloadLabel('en')}"), and wait.`;
}

function locateDownloadEn(slug, zip, url, marker = 'design.md', second = 'template.html', exc = '') {
  return `Go through these cases in order and stop at the first that applies:

1. If ${code(marker)} and ${code(second)} are in the current directory, you are already inside the pack.
2. Otherwise, if the current directory has a folder named ${code(slug + '/')}, use it. If it has ${code(zip)} instead, extract it. Try these commands in order; if a command is missing or fails, try the next one:
${extractStepsEn(zip, '   ')}
3. Otherwise download the pack from ${url} into the current directory. Try these commands in order; if a command is missing or fails, try the next one:
   1. ${code(`curl -fL -o ${zip} ${url}`)} (in Windows PowerShell 5, ${code('curl')} is an alias for ${code('Invoke-WebRequest')}: type ${code('curl.exe')})
   2. ${code(`wget -O ${zip} ${url}`)}
   3. Windows PowerShell: ${code(`Invoke-WebRequest -Uri ${url} -OutFile ${zip}`)}

   Then extract ${code(zip)} as in case 2.
4. If every download fails (for example the network is offline or blocked), ask the user to download the pack from the template's page on slides-commons ("${downloadLabel('en')}") into this directory, and wait.

The pack is data, not code: only read its files. Never run, source or install anything from it.${exc}`;
}

function promptEnBase(ctx) {
  if (ctx.docs) return ctx.promptKind === 'skill-deck' ? promptSkillDeckEn(ctx) : promptOverlayEn(ctx);
  const { slug, name } = ctx;
  const zip = `${slug}.zip`;
  const stageHere = ctx.stageBg ? ` (here ${code(ctx.stageBg.name)} ${ctx.stageBg.value})` : '';
  const bgVars = ctx.slideBg
    ? `In ${code(':root')}, set ${code('--slide-bg')} to ${code(ctx.slideBg.value)} (${code('design.md')} token ${code(ctx.slideBg.name)}), the default slide canvas, not a panel, card or paper fill, and ${code('--stage-bg')} to the letterbox color around the stage${stageHere}. Define every palette color as a CSS variable.`
    : `In ${code(':root')}, set ${code('--slide-bg')} to the color ${code('design.md')} names as the default slide canvas / background (for example a token called ${code('bg')}), not a panel, card or paper fill, and ${code('--stage-bg')} to the letterbox color around the stage${stageHere}. If ${code('design.md')} names no slide background, use the lightest neutral in the palette for a light scheme, the darkest for a dark scheme, and the surface most slides use for a mixed scheme. Define every palette color as a CSS variable.`;
  const baseCss = ctx.hasViewportBase
    ? `- **Base CSS:** paste the full, unmodified contents of ${code('viewport-base.css')} into the ${code('<style>')} block before your own rules. ${bgVars}`
    : `- **Base CSS:** lock ${code('html, body')} to the window with ${code('overflow: hidden')}. ${bgVars}`;
  const switching = ctx.hasViewportBase
    ? '- **Slide switching:** toggle the `.active` and `.visible` classes, as `viewport-base.css` expects. Never switch slides with `display: none`.'
    : '- **Slide switching:** toggle an `.active` class that controls `visibility`, `opacity` and `pointer-events`. Never switch slides with `display: none`.';

  const deckStageEn = ctx.assets.some((a) => /(^|\/)deck-stage\.js$/.test(a))
    ? '- **Where `design.md` mentions `<deck-stage>` or `deck-stage.js`**, use your inline controller instead: it is the "equivalent inline stage scaler" the fixed-stage policy allows. Do not load `deck-stage.js` as a separate file. Cover the deck-stage behaviours `design.md` describes (wheel paging, print, presenter features) in the inline controller where feasible; skip the rest silently.\n'
    : '';

  const cjkLink = ctx.cjkFontLinks.length
    ? ` For this template that link is: ${ctx.cjkFontLinks.map((u) => code(`<link rel="stylesheet" href="${u}">`)).join(' / ')}.`
    : '';

  const localEn = `- **Fonts:** the Latin fonts are in the pack's ${code('fonts/')} folder; embed them in the deck. Only CJK fonts (if the deck has CJK text) are loaded from Google Fonts. Never link Google Fonts for the Latin families and never reference files in ${code('fonts/')} from the deck: it must stay a single file that works offline.
  - Latin: ${code('fonts/fonts.css')} holds ready-made ${code('@font-face')} rules for exactly the families and weights this template uses (each split by ${code('unicode-range')} into latin and latin-ext). Copy the rules for the weights and styles your deck actually uses into your ${code('<style>')}, with each ${code('url(...)')} replaced by a base64 data URI (${code('data:font/woff2;base64,…')}). Generate the base64 with a small Node or Python script rather than by hand. Embed both the latin and the latin-ext rules for every face you use, so characters such as → or accented letters added in later edits do not silently fall back. Keep the family names, ${code('font-display')} and ${code('unicode-range')} unchanged. Leaving out unused weights applies to per-weight static files; a variable font file covers all its weights, so embed it once. Where ${code('design.md')} says the Latin fonts load from Google Fonts (e.g. under “Known Gaps”), the pack's ${code('fonts/')} supersedes it.
  - Deck without CJK text: no font request at all.
  - Deck with Chinese, Japanese or Korean text: add one Google Fonts ${code('<link>')} for the CJK family only. Take the combined link from the CJK section of ${code('design.md')} and remove its Latin families (they are embedded).${cjkLink} If ${code('design.md')} gives no combined link, request the CJK family it recommends, at the weights it specifies.
  - Font stacks: Latin family first, CJK family second (e.g. ${code('font-family: "Latin Face", "CJK Face", sans-serif')}), so each script falls through to its own face.
  - For CJK runs, the CJK section of ${code('design.md')} overrides the Latin token values: weight, letter-spacing, line-height and uppercase. When the CJK weight differs from the Latin weight of the same element, a font stack alone cannot give each script its own weight: wrap the CJK runs (e.g. ${code('<span class="cjk">')}) and set the CJK weight, ${code('letter-spacing: 0')}, ${code('text-transform: none')} and the CJK line-height there. This rule overrides any claim in ${code('design.md')} that CJK automatically falls through to a heavier weight. Don't wrap by hand: write a small script (Node or Python) that wraps CJK runs (e.g. Unicode ranges U+3000–303F, U+3400–9FFF, U+F900–FAFF, U+FF00–FFEF) in ${code('<span class="cjk">')} before embedding, and make sure CSS selectors such as ${code('.kpi span')} don't accidentally match those wrappers (use child selectors or a class). Search the CSS for every descendant rule like ${code('X span')} (e.g. ${code('.kpi span')}, ${code('.reco-figs span')}): it also matches the ${code('.cjk')} wrappers, so change it to a child selector (${code('X > span')}) or exclude them with ${code(':not(.cjk)')}. In flex containers, wrapping only the CJK part of a text removes the space between Chinese text and numbers: wrap the whole text in one inner span instead. The CJK weight, letter-spacing and line-height apply to the CJK runs only; Latin text keeps the weights that are actually loaded.`;
  const remoteLinks = ctx.remoteFontLinks.map((u) => code(`<link rel="stylesheet" href="${u}">`)).join(' / ');
  const remoteEn = ctx.localFonts && ctx.remoteFontLinks.length
    ? `\n  - Fontshare families: these are not in ${code('fonts/')} (Fontshare fonts cannot be self-hosted here). Keep the template's Fontshare link in the deck, exactly as it is: ${remoteLinks}. This is the one exception to "embed everything"; do not swap these families for another font.`
    : '';
  const fontsEn = ctx.localFonts ? localEn + remoteEn : ctx.systemFontsOnly
    ? `- **Fonts:** this template's design is its system font stack (see ${code('design.md')}). Use exactly that stack and do not add web fonts, font links or font files: the rule that fonts come from Google Fonts or Fontshare does not apply to this template. ${ctx.cjkFontLinks.length ? `For CJK text, ${code('design.md')} allows one exception to the no-web-fonts rule: if the deck contains Chinese, Japanese or Korean text, add this one link and append the CJK family it loads after the Latin stack in every font-family: ${ctx.cjkFontLinks.map((u) => code(`<link rel="stylesheet" href="${u}">`)).join(' / ')}. A deck without CJK text makes no font request at all.` : 'For CJK text, rely on the system CJK fonts the stack falls back to.'}`
    : `- **Fonts:** load them only from Google Fonts or Fontshare, with the exact families and weights from ${code('design.md')}, with one ${code('<link>')} per font service (a single Google Fonts link, not several).
  - Deck without CJK text: use the original link from section 2.
  - Deck with Chinese, Japanese or Korean text: use the combined link from the CJK section of ${code('design.md')} instead of the original one.${cjkLink} If ${code('design.md')} gives no combined link, add the CJK family it recommends, at the weights it specifies, to the original link as one more ${code('family=')} parameter.
  - Font stacks: Latin family first, CJK family second (e.g. ${code('font-family: "Latin Face", "CJK Face", sans-serif')}), so each script falls through to its own face.
  - For CJK runs, the CJK section of ${code('design.md')} overrides the Latin token values: weight, letter-spacing, line-height and uppercase. When the CJK weight differs from the Latin weight of the same element, a font stack alone cannot give each script its own weight: wrap the CJK runs (e.g. ${code('<span class="cjk">')}) and set the CJK weight, ${code('letter-spacing: 0')}, ${code('text-transform: none')} and the CJK line-height there. This rule overrides any claim in ${code('design.md')} that CJK automatically falls through to a heavier weight. Don't wrap by hand: write a small script (Node or Python) that wraps CJK runs (e.g. Unicode ranges U+3000–303F, U+3400–9FFF, U+F900–FAFF, U+FF00–FFEF) in ${code('<span class="cjk">')} before embedding, and make sure CSS selectors such as ${code('.kpi span')} don't accidentally match those wrappers (use child selectors or a class). Search the CSS for every descendant rule like ${code('X span')} (e.g. ${code('.kpi span')}, ${code('.reco-figs span')}): it also matches the ${code('.cjk')} wrappers, so change it to a child selector (${code('X > span')}) or exclude them with ${code(':not(.cjk)')}. In flex containers, wrapping only the CJK part of a text removes the space between Chinese text and numbers: wrap the whole text in one inner span instead. The CJK weight, letter-spacing and line-height apply to the CJK runs only; Latin text keeps the weights that are actually loaded.`;
  const netEn = `- **No other network requests:** no CDNs, remote scripts, remote images or analytics. Draw charts, icons and diagrams with inline SVG or CSS. Embed user-supplied images as data URIs, downscaled to the size they are shown at.${ctx.cdnScripts.length ? `\n- **Charts:** the original ${code('template.html')} loads a script from a CDN (${ctx.cdnScripts.map(code).join(', ')}). Do not copy that. Charts are welcome, but draw them with inline SVG (the default) or canvas code written in the file. Inline a pinned copy of the chart library only if the user explicitly asks for it.` : ''}`;

  const fontCheckEn = ctx.systemFontsOnly
    ? '- the type renders in the stack from `design.md`, and no web fonts or font requests are present' + (ctx.cjkFontLinks.length ? ' (other than the CJK link, for CJK text);' : ';')
    : `- the intended fonts loaded, Latin and CJK (no fallback). ${code('document.fonts.check()')} is not proof: it returns true even when a face failed to load. Instead wait for ${code('document.fonts.ready')} and confirm each expected face appears in ${code('document.fonts')} with status ${code('"loaded"')}, or compare the rendered text width against a fallback font. If a font request fails with a network error, retry or reload before concluding anything; change the import only if the URL itself is wrong;`;
  const netCheckEn = ctx.systemFontsOnly ? (ctx.cjkFontLinks.length ? 'no network requests at all (or, for CJK text, only the one CJK Google Fonts request)' : 'no network requests at all') : ctx.localFonts ? `no network requests at all (or, for CJK text, only the Google Fonts request${ctx.remoteFontLinks.length ? ' and the Fontshare font request' : ''})` : 'no network requests beyond the font hosts';

  return `# Build a slide deck with the ${name} design system

You are a coding agent. The user wants a presentation built as a single self-contained HTML file in the **${name}** style. Everything you need is in the template pack ${code(slug + '/')}. Follow the steps below in order. Always reply to the user in the language they write to you in.

## 0. Locate the pack

${ctx.zipUrl ? locateDownloadEn(slug, zip, ctx.zipUrl, undefined, undefined, cjkExcEn(ctx)) : locateLocalEn(slug, zip)}

All paths below are relative to the ${code(slug + '/')} folder. Do not modify the pack files; write the deck as a new file inside that folder.

## 1. What is in the pack

${filesEn(ctx)}

## 2. The design system at a glance

This summary keeps the essentials in view; it does not replace ${code('design.md')}.

${glanceEn(ctx)}

## 3. Workflow

1. **Ask before building.** In one message, ask the user:
   1. Purpose and audience: what is the deck for (pitch, conference talk, internal review, teaching, …) and who will see it?
   2. Length: roughly how many slides (5–10, 10–20, 20+)?
   3. Content: ask them to paste or point to their material (notes, outline, document, data, images), or to confirm that you should draft it from a topic. Also ask for anything that should appear as deck chrome: speaker name, date, organisation, and a link or URL for the closing slide. Leave out whatever deck chrome they don't give you; never invent it.
   4. Density: speaker-led (low density: one idea per slide, large type, few words), balanced (projected but data-heavy: 2–4 content blocks per slide, body text ≥ 20px on the 1920 stage) or reading-first (high density: self-contained slides read on a screen, more detail)? If they answer in between ("medium", "fairly high"), map it to the nearest option: a projected deck is balanced at most, and only a deck meant to be read rather than presented is reading-first; if unsure, pick balanced and say so.

   Skip any question the user has already answered. Then stop and wait for the reply.
2. **Read ${code('design.md')} completely** (every section, including the fixed-stage policy and the CJK section) before writing any code.
3. **Plan.** Write a slide-by-slide outline: the point of each slide and which layout or components of the system carry it. If the user gave only facts or notes and asked you to organise them, or you drafted the content yourself, show the outline and wait for approval. If the user supplied a ready slide-by-slide structure, follow it and go straight on.
4. **Look up gaps in ${code('template.html')}** only when ${code('design.md')} does not say how to build something (exact CSS for a component, an SVG ornament, a chart). Take the technique, not the text.
5. **Build** one HTML file following sections 4 and 5. Save it inside the pack folder as ${code('<short-deck-name>.html')}; never overwrite ${code('template.html')}.
6. **Self-check** (section 6), fix what you find, then open the deck and report.

## 4. Output requirements

- **One self-contained file.** All CSS and JS inline. No other local files, no npm, no build step, no frameworks.
${baseCss}
- **Fixed stage:** the markup is ${code('.deck-viewport > .deck-stage > section.slide')}, one ${code('section')} per slide. Author every slide at exactly 1920×1080 px using the fixed px sizes from ${code('design.md')}. One inline script scales ${code('.deck-stage')} with ${code('transform: translate(x, y) scale(s)')}, where ${code('s = min(innerWidth / 1920, innerHeight / 1080)')} and ${code('x')}, ${code('y')} center it; recompute on resize. Phones get letterboxing, never a reflowed layout: no media queries, ${code('vw')}/${code('vh')} units or ${code('clamp()')} inside slides. Treat any viewport-relative values in ${code('design.md')} as proportions of 1920×1080.
${switching}
${deckStageEn}- **Navigation:** → / Space / PageDown for next, ← / PageUp for previous, Home / End for first / last, swipe on touch screens, and optionally mouse-wheel paging (debounced, so one wheel gesture moves one slide). Ignore key presses while an input or contenteditable element has focus.
${fontsEn}${cjkExtraEn(ctx)}
${netEn}
- **Details:** respect ${code('prefers-reduced-motion')}; set ${code('<html lang>')} to the deck language and ${code('<title>')} to the deck title; mark code sections with ${code('/* === SECTION === */')} comments.

## 5. Hard constraints

- **Keep the fonts:** the exact families, weights, letter-spacing, line-heights and text-transforms from ${code('design.md')}. Never substitute. If a font does not load, find out why (section 6) instead of replacing it.
- **When ${code('design.md')} contradicts itself** (for example it says the accent color is never a text color, yet an ${code('<em>')} rule colors text with it), follow the stricter rule and tell the user in your final reply.
- **Keep the palette:** only the colors listed above. No new accent, no recoloring, no gradients or shadows unless ${code('design.md')} uses them.
- **Keep the decorative vocabulary:** the marks, rules, stamps, textures and ornaments ${code('design.md')} describes are part of the identity, not optional decoration.
- **Keep the spacing rhythm:** insets, grid, gaps and paddings from ${code('design.md')}.
- **Keep the component grammar:** build with the system's own components and their internal structure (cards, stat blocks, tables, page-number tags, …).
- **Never mix templates.** Do not borrow layouts, colors or type from other templates, presets or generic presentation styles.
- **Missing layout? Design it inside the same system**, with the same fonts, palette, decoration, spacing and chrome, so it would look at home between two original slides. Don't switch styles or drop the content.
- **Real content, drafted when missing.** Use the user's material. Never reuse demo text, numbers, names or logos from ${code('template.html')}. When the user names a topic but gives no content (for example "two pieces of user feedback", "thanks", "goals"), draft that content yourself; never put placeholders such as "TBD" on a slide. Keep drafts plausible and modest. Every drafted item (including any example quote, name or number you made up) must be listed in your final reply (section 6) so the user can review or replace it.
- **Only real links and codes.** Decorations that look functional (QR codes, links, URLs, email addresses) are used only when the user gave a real one; otherwise omit them.
- **Numbers must agree:** section numbers and labels shown on slides must match the slide's page number (the cover is page 1), so they never disagree with the page counter. Section ordinals (such as “Section 03”) are fine; any reference to a page number must equal the footer page number.
- **No internal labels on slides.** Never show the template name (${name} / ${slug}), the words "template" or "preview", file names, paths, or notes about the user's requirements. Visible chrome is real deck content only: title, sections, date, author, page numbers.
- **The user's density choice wins** over any density guidance in ${code('design.md')}. For low and balanced density, keep the system's grid and panel vocabulary but use fewer, larger panels (one idea per slide for low density, 2–4 content blocks for balanced); fill any spare panels with the system's own ornaments, never invented ones. If content does not fit, split it across more slides; never shrink text below the sizes in ${code('design.md')} and never let it overflow.
- **Minimum text size for projected decks (speaker-led and balanced):** the smallest label tokens in ${code('design.md')} (often 14–16px at 1920×1080) shrink to about 9–10px on a 1280px-wide screen and are unreadable when projected. For every projected deck, whatever its density (speaker-led or balanced), raise any body or label text below 20px (at the 1920×1080 stage) to at least 20px, keeping the token's other properties (font, tracking, case); only source and footnote lines may go down to 18px. Reading-first decks keep the ${code('design.md')} sizes. This is the one place where the user's density choice overrides the sizes in ${code('design.md')}.
- **Keep emphasis legible:** highlights and emphasis (marks, accent-colored text, accent fills) must contrast with the panel they sit on. Never put accent on accent, such as an accent highlight or accent-colored text on an accent panel; use another emphasis treatment from the system there.
- **CJK text (Chinese, Japanese, Korean):** letter-spacing 0; use the exact CJK line-heights from ${code('design.md')}, or about 1.75 for body and 1.2 for display if it gives none; never apply ${code('text-transform: uppercase')} to CJK runs; don't force monospace fonts onto CJK; use full-width punctuation and put a space between CJK and Latin text.
- **CJK line breaks:** for CJK text, don't limit width by character count (${code('ch')} units or a ${code('max-width')} in characters); that produces one-character last lines. Use ${code('text-wrap: pretty')} (and ${code('text-wrap: balance')} for short headlines) with ${code('line-break: strict')}.
- **Labels in CJK decks:** write labels and chrome (section labels, captions, page tags) in the deck language. Monospace, uppercase and wide tracking apply to Latin letters and digits only; CJK characters in labels use the CJK face with letter-spacing 0.

## 6. Self-check, then deliver

1. Render the deck in a real browser (Playwright, Puppeteer or headless Chrome, whatever is available) at **1280×720** and at one **phone viewport** (e.g. 390×844), and screenshot every slide (advance with →).
2. On every slide, check:
   - no text overflows or is clipped by its panel;
   - **no panel overlaps or covers another** (a ${code('scrollHeight')} check alone misses this, so look at the screenshots). The template's own chrome (page-number tag, corner marks, stamps) may overlap panels where the original places it that way, but chrome must never cover text;
   - every highlight and emphasis is legible against its panel (no accent on accent);
   - in CJK text, no line ends with a single character or a lone punctuation mark; if one does, adjust the width or the wording;
   - the stage stays 16:9 and letterboxed on the phone;
   ${fontCheckEn}
   - no console errors (offline, the failed Google Fonts request and its console error are expected and fine when the fonts are embedded), and ${netCheckEn}.
3. Fix and re-check until clean. If you cannot render in a browser, say so plainly and review the code by hand; don't claim the check passed.
4. Finally, reread the deck as the audience would and fix any statement the deck itself contradicts (for example a slide claiming "only one X per page" while using X three times).
5. Open the deck in the user's default browser:
   - macOS: ${code('open "<file>.html"')}
   - Linux: ${code('xdg-open "<file>.html"')}
   - Windows: ${code('start "" "<file>.html"')} in cmd, or ${code('Start-Process "<file>.html"')} in PowerShell

   If the command is not available or there is no display (for example a remote or headless session), skip this step and give the user the file's absolute path.
6. Report the file's full path, the slide count, how to navigate, every item you drafted (slide number and text, including any made-up example quotes, names or numbers), any contradictions you resolved in ${code('design.md')}, every place where a legibility rule (contrast or minimum size) made you deviate from its colors or sizes (what changed, from what to what), and open questions. For later changes, edit the same file, keep every constraint above, and run the self-check again.
`;
}

// ---------------------------------------------------------------------------
// Chinese (faithful translation of the English text above)
// ---------------------------------------------------------------------------

function filesZh(ctx) {
  const rows = [
    [code('design.md'), '设计系统，也是你的首要依据：设计 token（YAML front matter）、版式网格、组件、Do / Don\'t、CJK 规则和固定画布规范。写任何一页之前先完整读完。'],
  ];
  if (ctx.hasViewportBase) {
    rows.push([code('viewport-base.css'), '固定 1920×1080 画布的必需基础 CSS。把全部内容粘贴进你的产出。']);
  }
  rows.push([code('template.html'), '原作者的示例幻灯片，仅作参考实现：只在 `design.md` 没写清某个实现细节时查阅。不要复用其中的示例内容。']);
  for (const a of ctx.assets) {
    if (/(^|\/)deck-stage\.js$/.test(a)) {
      rows.push([code(a), '`template.html` 加载的缩放与翻页运行时。仅作参考；你的幻灯片使用自己内联的控制脚本。注意：随附的 `deck-stage.js` 会在 `<deck-stage>` 上强制使用系统字体，因此 `template.html` 打开后可能显示为回退字体；字体以 `design.md` 为准。']);
    } else {
      rows.push([code(a), '`template.html` 用到的文件。仅作参考。']);
    }
  }
  if (ctx.localFonts) {
    rows.push([code('fonts/'), '本模板的拉丁字体 woff2 文件（每个字体族一个文件夹，附许可证），以及 `fonts/fonts.css`：恰好覆盖本模板所用字体族和字重的现成 `@font-face` 规则。把它们嵌入你的幻灯片（见第 4 节“字体”）。']);
  }
  if (ctx.cjkEmbed) rows.push(cjkRowZh());
  rows.push([`${code('PROMPT.md')}、${code('PROMPT.zh.md')}`, '本说明（英文 / 中文）。']);
  rows.push([[code('README.md'), ...ctx.licenses.map((l) => code(l.file))].join('、'), '署名与许可证。保持原样。']);
  return ['| 文件 | 用途 |', '|---|---|', ...rows.map(([f, p]) => `| ${f} | ${p} |`)].join('\n');
}

function glanceZh(ctx) {
  const L = [];
  if (ctx.zh?.description) L.push(`- **风格特征**：${ctx.zh.description}`);
  else if (ctx.description) L.push(`- **风格特征**（原文）：${ctx.description}`);
  const zhTags = (zhArr, arr) => (zhArr && zhArr.every(Boolean) ? zhArr.join('、') : arr.join(', '));
  const zhScheme = { light: '浅色', dark: '深色', mixed: '混合' }[ctx.scheme] ?? ctx.scheme;
  L.push(`- **情绪 / 语气**：${zhTags(ctx.zh?.mood, ctx.mood)} / ${zhTags(ctx.zh?.tone, ctx.tone)}。配色方案：${zhScheme}。`);
  L.push('- **配色**（只允许使用这些颜色，取值必须完全一致）：');
  for (const c of ctx.colors) L.push(`  - ${code(c.name)} ${c.value}`);
  if (ctx.zh?.palette_description) L.push(`  - 用法：${ctx.zh.palette_description}。`);
  else if (ctx.paletteNote) L.push(`  - 用法（原文）：${ctx.paletteNote}.`);
  if (ctx.typography.length) {
    const t = ctx.typography.map((x) => `${x.role} ${x.family}`).join('；');
    const style = ctx.zh?.typography_style ? `（${ctx.zh.typography_style}）` : ctx.typographyStyle ? `（原文：${ctx.typographyStyle}）` : '';
    L.push(`- **字体**：${t}${style}。`);
  }
  if (ctx.systemFontsOnly) {
    L.push('- **字体加载**：无。原模板使用系统字体栈；系统字体就是设计本身，不要添加网页字体' + (ctx.cjkFontLinks.length ? '（第 4 节“字体”中的 CJK 链接除外）。' : '。'));
  } else if (ctx.localFonts) {
    L.push('- **字体加载**：拉丁字体在素材包的 `fonts/` 文件夹里，要嵌入你的幻灯片；只有 CJK 字体从 Google Fonts 加载。见第 4 节“字体”。');
    if (ctx.remoteFontLinks.length) L.push('- **Fontshare 字体**（不在 `fonts/` 里；在幻灯片中保留这些链接）：');
    for (const u of ctx.remoteFontLinks) L.push(`  - ${code(`<link rel="stylesheet" href="${u}">`)}`);
  } else if (ctx.fontLinks.length) {
    L.push('- **字体加载**（原模板的链接；幻灯片含 CJK 文字时见第 4 节“字体”）：');
    for (const u of ctx.fontLinks) L.push(`  - ${code(`<link rel="stylesheet" href="${u}">`)}`);
  }
  if (ctx.signatureMoves.length) {
    L.push('- **标志性手法**（原文）：');
    for (const m of ctx.signatureMoves) L.push(`  - ${m}`);
  }
  if (ctx.stageBg) L.push(`- **画布外背景色**（幻灯片四周加边的颜色）：${code(ctx.stageBg.name)} ${ctx.stageBg.value}。`);
  return L.join('\n');
}

export function extractStepsZh(zip, indent) {
  return [
    `1. ${code(`unzip ${zip}`)}`,
    `2. ${code(`python3 -m zipfile -e ${zip} .`)}（或把 ${code('python3')} 换成 ${code('python')}）`,
    `3. ${code(`tar -xf ${zip}`)}（bsdtar，macOS 与 Windows 10+ 自带；Linux 上的 GNU tar 无法读取 zip）`,
    `4. Windows PowerShell：${code(`Expand-Archive ${zip} -DestinationPath .`)}`,
  ].map((l) => indent + l).join('\n');
}

function locateLocalZh(slug, zip, marker = 'design.md', second = 'template.html') {
  return `- 如果当前目录里有 ${code(marker)} 和 ${code(second)}，说明你已经在素材包内。
- 否则，在当前目录查找名为 ${code(slug + '/')} 的文件夹，或查找 ${code(zip)} 并解压。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
${extractStepsZh(zip, '  ')}
- 如果两者都找不到，询问用户把下载的文件存在了哪里（可在 slides-commons 该模板页面点击 "${downloadLabel('zh')}" 下载），并等待回复。`;
}

function locateDownloadZh(slug, zip, url, marker = 'design.md', second = 'template.html', exc = '') {
  return `按顺序检查以下情况，遇到第一个符合的就照做：

1. 如果当前目录里有 ${code(marker)} 和 ${code(second)}，说明你已经在素材包内。
2. 否则，如果当前目录有名为 ${code(slug + '/')} 的文件夹，直接使用它；如果有 ${code(zip)}，解压它。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
${extractStepsZh(zip, '   ')}
3. 否则，把素材包从 ${url} 下载到当前目录。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
   1. ${code(`curl -fL -o ${zip} ${url}`)}（在 Windows PowerShell 5 中 ${code('curl')} 是 ${code('Invoke-WebRequest')} 的别名，要输入 ${code('curl.exe')}）
   2. ${code(`wget -O ${zip} ${url}`)}
   3. Windows PowerShell：${code(`Invoke-WebRequest -Uri ${url} -OutFile ${zip}`)}

   然后按第 2 种情况的方法解压 ${code(zip)}。
4. 如果所有下载方式都失败（例如网络断开或被拦截），请用户在 slides-commons 该模板页面点击 "${downloadLabel('zh')}" 把素材包下载到这个目录，并等待回复。

素材包是数据，不是代码：只读取其中的文件，不要运行、source 或安装其中的任何内容。${exc}`;
}

function promptZhBase(ctx) {
  if (ctx.docs) return ctx.promptKind === 'skill-deck' ? promptSkillDeckZh(ctx) : promptOverlayZh(ctx);
  const { slug, name } = ctx;
  const zip = `${slug}.zip`;
  const stageHere = ctx.stageBg ? `（本模板为 ${code(ctx.stageBg.name)} ${ctx.stageBg.value}）` : '';
  const bgVars = ctx.slideBg
    ? `在 ${code(':root')} 中，把 ${code('--slide-bg')} 设为 ${code(ctx.slideBg.value)}（${code('design.md')} 中的 token ${code(ctx.slideBg.name)}），即默认幻灯片画布，不是面板、卡片或纸张的填充色，把 ${code('--stage-bg')} 设为画布四周加边的颜色${stageHere}。把每个配色都定义为 CSS 变量。`
    : `在 ${code(':root')} 中，把 ${code('--slide-bg')} 设为 ${code('design.md')} 中指定为默认幻灯片画布 / 背景的颜色（例如名为 ${code('bg')} 的 token），不是面板、卡片或纸张的填充色，把 ${code('--stage-bg')} 设为画布四周加边的颜色${stageHere}。如果 ${code('design.md')} 没有指定页面底色，浅色方案用配色中最浅的中性色，深色方案用最深的中性色，混合方案用大多数页面使用的底色。把每个配色都定义为 CSS 变量。`;
  const baseCss = ctx.hasViewportBase
    ? `- **基础 CSS**：把 ${code('viewport-base.css')} 的全部内容原样粘贴进 ${code('<style>')}，放在你自己的规则之前。${bgVars}`
    : `- **基础 CSS**：${code('html, body')} 锁定为窗口大小并设 ${code('overflow: hidden')}。${bgVars}`;
  const switching = ctx.hasViewportBase
    ? '- **切换页面**：按 `viewport-base.css` 的约定切换 `.active` 和 `.visible` 类。不要用 `display: none` 切换页面。'
    : '- **切换页面**：切换一个控制 `visibility`、`opacity` 和 `pointer-events` 的 `.active` 类。不要用 `display: none` 切换页面。';

  const deckStageZh = ctx.assets.some((a) => /(^|\/)deck-stage\.js$/.test(a))
    ? '- **`design.md` 提到 `<deck-stage>` 或 `deck-stage.js` 的地方**，改用你的内联控制脚本：它就是固定画布规范所允许的"等效内联画布缩放脚本"（equivalent inline stage scaler）。不要以独立文件形式加载 `deck-stage.js`。`design.md` 描述的 deck-stage 行为（滚轮翻页、打印、演讲者功能），能在内联控制脚本中实现的就实现，其余直接略过，不必说明。\n'
    : '';

  const cjkLink = ctx.cjkFontLinks.length
    ? `本模板的这条链接是：${ctx.cjkFontLinks.map((u) => code(`<link rel="stylesheet" href="${u}">`)).join(' / ')}。`
    : '';

  const localZh = `- **字体**：拉丁字体在素材包的 ${code('fonts/')} 文件夹里，要嵌入幻灯片；只有 CJK 字体（幻灯片含 CJK 文字时）从 Google Fonts 加载。不要为拉丁字体链接 Google Fonts，也不要在幻灯片里引用 ${code('fonts/')} 中的文件：它必须保持为单个、可离线使用的文件。
  - 拉丁字体：${code('fonts/fonts.css')} 里是恰好覆盖本模板所用字体族和字重的现成 ${code('@font-face')} 规则（按 ${code('unicode-range')} 拆成 latin 与 latin-ext）。把幻灯片实际用到的字重和字形对应的规则复制进你的 ${code('<style>')}，并把每个 ${code('url(...)')} 换成 base64 data URI（${code('data:font/woff2;base64,…')}）。base64 用一个小的 Node 或 Python 脚本生成，不要手工处理。每个用到的字体都要同时嵌入 latin 与 latin-ext 两组规则，这样之后编辑时加入 → 或带重音的字母也不会悄悄回退。字体族名、${code('font-display')} 和 ${code('unicode-range')} 保持不变。“没用到的字重不要放进去”只适用于按字重分开的静态文件；可变字体文件已覆盖所有字重，只嵌入一次。${code('design.md')} 中说拉丁字体从 Google Fonts 加载的地方（如“Known Gaps”），以素材包的 ${code('fonts/')} 为准。
  - 幻灯片不含 CJK 文字：完全不发起字体请求。
  - 幻灯片含中文、日文或韩文：添加一条只含 CJK 字体族的 Google Fonts ${code('<link>')}。取 ${code('design.md')} CJK 一节给出的合并链接，去掉其中的拉丁字体族（它们已嵌入）。${cjkLink}如果 ${code('design.md')} 没有给出合并链接，就按它推荐的 CJK 字体和规定字重请求。
  - 字体栈：拉丁字体在前，CJK 字体在后（如 ${code('font-family: "Latin Face", "CJK Face", sans-serif')}），让每种文字落到各自的字体上。
  - 对 CJK 文字，${code('design.md')} CJK 一节的设定覆盖拉丁 token 的取值：字重、字间距、行高和大写转换。当同一元素里 CJK 字重与拉丁字重不同时，单靠字体栈无法让两种文字各用各的字重：把 CJK 文字包起来（如 ${code('<span class="cjk">')}），在其中设置 CJK 字重、${code('letter-spacing: 0')}、${code('text-transform: none')} 和 CJK 行高。本规则优先于 ${code('design.md')} 中任何“CJK 会自动回退到更重字重”的说法。不要手工包裹：写一个小脚本（Node 或 Python），在嵌入前把 CJK 文字（如 Unicode 范围 U+3000–303F、U+3400–9FFF、U+F900–FAFF、U+FF00–FFEF）包进 ${code('<span class="cjk">')}，并确保 ${code('.kpi span')} 这类 CSS 选择器不会误匹配这些包裹元素（用子选择器或 class）。另外，在 CSS 里搜索所有形如 ${code('X span')} 的后代选择器（例如 ${code('.kpi span')}、${code('.reco-figs span')}）：它们也会匹配 ${code('.cjk')} 包裹元素，要改成子选择器（${code('X > span')}）或用 ${code(':not(.cjk)')} 排除。在 flex 容器里，只包裹文字中的 CJK 部分会让中文与数字之间的空格消失：改为把整段文字包进一个内层 span。CJK 字重、字间距和行高只作用于 CJK 文字；拉丁文字保持实际加载的字重。`;
  const remoteLinks = ctx.remoteFontLinks.map((u) => code(`<link rel="stylesheet" href="${u}">`)).join(' / ');
  const remoteZh = ctx.localFonts && ctx.remoteFontLinks.length
    ? `\n  - Fontshare 字体：这些字体不在 ${code('fonts/')} 里（Fontshare 的字体无法在此自托管）。在幻灯片中原样保留模板里的 Fontshare 链接：${remoteLinks}。这是“全部嵌入”规则的唯一例外；不要把这些字体换成别的字体。`
    : '';
  const fontsZh = ctx.localFonts ? localZh + remoteZh : ctx.systemFontsOnly
    ? `- **字体**：本模板的设计就是系统字体栈（见 ${code('design.md')}）。严格使用该字体栈，不要添加网页字体、字体链接或字体文件：“字体只从 Google Fonts 或 Fontshare 加载”这条规则不适用于本模板。${ctx.cjkFontLinks.length ? `CJK 文字是 ${code('design.md')} 允许的唯一例外：幻灯片含中文、日文或韩文时，添加下面这一条链接，并把它加载的 CJK 字体族放在每个 font-family 的拉丁字体栈之后：${ctx.cjkFontLinks.map((u) => code(`<link rel="stylesheet" href="${u}">`)).join(' / ')}。不含 CJK 文字的幻灯片完全不发起字体请求。` : 'CJK 文字依靠该字体栈回退到的系统 CJK 字体。'}`
    : `- **字体**：只从 Google Fonts 或 Fontshare 加载，字体族和字重与 ${code('design.md')} 完全一致，每个字体服务只用一个 ${code('<link>')}（Google Fonts 只用一条链接，不要多条）。
  - 幻灯片不含 CJK 文字：使用第 2 节中原模板的链接。
  - 幻灯片含中文、日文或韩文：改用 ${code('design.md')} CJK 一节给出的合并链接，代替原模板的链接。${cjkLink}如果 ${code('design.md')} 没有给出合并链接，就把它推荐的 CJK 字体按规定字重作为一个新的 ${code('family=')} 参数加到原链接上。
  - 字体栈：拉丁字体在前，CJK 字体在后（如 ${code('font-family: "Latin Face", "CJK Face", sans-serif')}），让每种文字落到各自的字体上。
  - 对 CJK 文字，${code('design.md')} CJK 一节的设定覆盖拉丁 token 的取值：字重、字间距、行高和大写转换。当同一元素里 CJK 字重与拉丁字重不同时，单靠字体栈无法让两种文字各用各的字重：把 CJK 文字包起来（如 ${code('<span class="cjk">')}），在其中设置 CJK 字重、${code('letter-spacing: 0')}、${code('text-transform: none')} 和 CJK 行高。本规则优先于 ${code('design.md')} 中任何“CJK 会自动回退到更重字重”的说法。不要手工包裹：写一个小脚本（Node 或 Python），在嵌入前把 CJK 文字（如 Unicode 范围 U+3000–303F、U+3400–9FFF、U+F900–FAFF、U+FF00–FFEF）包进 ${code('<span class="cjk">')}，并确保 ${code('.kpi span')} 这类 CSS 选择器不会误匹配这些包裹元素（用子选择器或 class）。另外，在 CSS 里搜索所有形如 ${code('X span')} 的后代选择器（例如 ${code('.kpi span')}、${code('.reco-figs span')}）：它们也会匹配 ${code('.cjk')} 包裹元素，要改成子选择器（${code('X > span')}）或用 ${code(':not(.cjk)')} 排除。在 flex 容器里，只包裹文字中的 CJK 部分会让中文与数字之间的空格消失：改为把整段文字包进一个内层 span。CJK 字重、字间距和行高只作用于 CJK 文字；拉丁文字保持实际加载的字重。`;
  const netZh = `- **不发起其他网络请求**：不用 CDN、远程脚本、远程图片或统计代码。图表、图标和示意图用内联 SVG 或 CSS 绘制。用户提供的图片缩小到实际显示尺寸后以 data URI 嵌入。${ctx.cdnScripts.length ? `\n- **图表**：原版 ${code('template.html')} 从 CDN 加载了脚本（${ctx.cdnScripts.map(code).join('、')}）。不要照搬。图表可以做，但要用内联 SVG（默认）或写在文件里的 canvas 代码绘制。只有用户明确要求时，才内联一份固定版本的图表库。` : ''}`;

  const fontCheckZh = ctx.systemFontsOnly
    ? '- 文字按 `design.md` 的字体栈渲染，页面中没有网页字体或字体请求' + (ctx.cjkFontLinks.length ? '（含 CJK 文字时的那条 CJK 链接除外）；' : '；')
    : `- 目标字体已加载，包括拉丁字体和 CJK 字体（不是回退字体）。${code('document.fonts.check()')} 不能作为证据：即使字体加载失败它也会返回 true。应等待 ${code('document.fonts.ready')}，再确认每个预期字体都出现在 ${code('document.fonts')} 中且状态为 ${code('"loaded"')}，或者把渲染出的文字宽度与回退字体对比。如果字体请求因网络错误失败，先重试或重新加载再下结论；只有 URL 本身有误时才修改引入方式；`;
  const netCheckZh = ctx.systemFontsOnly ? (ctx.cjkFontLinks.length ? '完全没有网络请求（含 CJK 文字时只允许那条 CJK 字体的 Google Fonts 请求）' : '完全没有网络请求') : ctx.localFonts ? `完全没有网络请求（含 CJK 文字时只允许那条 Google Fonts 请求${ctx.remoteFontLinks.length ? '，以及 Fontshare 字体请求' : ''}）` : '除字体服务外没有其他网络请求';

  return `# 用 ${name} 设计系统制作幻灯片

你是一个 coding agent。用户希望以 **${name}** 风格制作一份演示文稿，产出为单个自包含的 HTML 文件。所需素材都在模板包 ${code(slug + '/')} 中。请按以下步骤依次执行。始终用用户与你对话时使用的语言回复用户。

## 0. 找到素材包

${ctx.zipUrl ? locateDownloadZh(slug, zip, ctx.zipUrl, undefined, undefined, cjkExcZh(ctx)) : locateLocalZh(slug, zip)}

下文所有路径都相对于 ${code(slug + '/')} 文件夹。不要修改素材包里的文件；把幻灯片写成该文件夹里的一个新文件。

## 1. 素材包里有什么

${filesZh(ctx)}

## 2. 设计系统速览

这份摘要用于时刻记住要点，不能代替 ${code('design.md')}。

${glanceZh(ctx)}

## 3. 工作流程

1. **先问再做。** 用一条消息向用户提问：
   1. 用途与受众：这份幻灯片做什么用（融资路演、大会演讲、内部评审、教学……），给谁看？
   2. 篇幅：大约多少页（5–10、10–20、20 以上）？
   3. 内容：请用户粘贴或指明素材（笔记、提纲、文档、数据、图片），或确认由你根据主题起草。同时询问需要出现在页面框架里的信息：演讲者姓名、日期、机构，以及结尾页的链接或网址。页面框架信息用户没提供的就省略，绝不编造。
   4. 密度：演讲型（低密度：一页一个观点，大字号，少文字）、均衡型（投影但数据较多：每页 2–4 个内容块，正文在 1920 画布上 ≥ 20px），还是阅读型（高密度：在屏幕上阅读，每页自成一体，信息更多）？如果用户回答介于两者之间（如“适中”“适中偏高”），就归到最接近的一档：要投影的幻灯片最多算均衡型，只有用来阅读而非演讲的才算阅读型；拿不准就选均衡型并说明。

   用户已经回答过的问题就跳过。问完后停下，等待回复。
2. **完整阅读 ${code('design.md')}**（每一节，包括固定画布规范和 CJK 一节），然后再写代码。
3. **规划。** 写出逐页提纲：每页要讲什么，用设计系统里的哪种版式或组件承载。如果用户只提供了事实或笔记并让你来组织，或者内容是你起草的，先把提纲给用户看并等待确认。如果用户已经给出逐页结构，按其结构直接继续。
4. **只在 ${code('design.md')} 没说明如何实现时才查 ${code('template.html')}**（某个组件的具体 CSS、SVG 装饰、图表）。借鉴手法，不搬文字。
5. **生成**一个 HTML 文件，遵守第 4、5 节。保存在素材包文件夹内，命名为 ${code('<简短的幻灯片名>.html')}；不要覆盖 ${code('template.html')}。
6. **自检**（第 6 节），修正发现的问题，然后打开幻灯片并汇报。

## 4. 产出要求

- **单个自包含文件。** 所有 CSS 和 JS 内联。不依赖其他本地文件，不用 npm、不需要构建步骤、不用框架。
${baseCss}
- **固定画布**：结构为 ${code('.deck-viewport > .deck-stage > section.slide')}，每页一个 ${code('section')}。每页都按精确的 1920×1080 px 制作，使用 ${code('design.md')} 中的固定 px 尺寸。用一段内联脚本对 ${code('.deck-stage')} 设置 ${code('transform: translate(x, y) scale(s)')}，其中 ${code('s = min(innerWidth / 1920, innerHeight / 1080)')}，${code('x')}、${code('y')} 使其居中；窗口尺寸变化时重新计算。手机上加黑边（letterbox），绝不重排版式：幻灯片内部不用媒体查询、${code('vw')}/${code('vh')} 单位或 ${code('clamp()')}。${code('design.md')} 中任何相对视口的数值都按 1920×1080 的比例换算。
${switching}
${deckStageZh}- **翻页**：→ / 空格 / PageDown 下一页，← / PageUp 上一页，Home / End 首页 / 末页，触屏支持滑动；可选支持鼠标滚轮翻页（做防抖，一次滚动只翻一页）。输入框或 contenteditable 元素获得焦点时忽略按键。
${fontsZh}${cjkExtraZh(ctx)}
${netZh}
- **细节**：支持 ${code('prefers-reduced-motion')}；${code('<html lang>')} 设为幻灯片语言，${code('<title>')} 设为幻灯片标题；代码各部分用 ${code('/* === SECTION === */')} 注释标出。

## 5. 硬性约束

- **不换字体**：字体族、字重、字间距、行高和大小写转换都与 ${code('design.md')} 完全一致。绝不替换。字体加载失败时先查明原因（见第 6 节），不要换字体。
- **${code('design.md')} 自相矛盾时**（例如它说强调色绝不用作文字颜色，却有一条 ${code('<em>')} 规则把文字染成该颜色），遵循更严格的规则，并在最终回复里告诉用户。
- **不改配色**：只用上面列出的颜色。不加新强调色，不改色，除非 ${code('design.md')} 本身使用，否则不加渐变或阴影。
- **保留装饰语汇**：${code('design.md')} 描述的标记、线条、印章、纹理和装饰是风格本身的一部分，不是可有可无的点缀。
- **保持间距节奏**：内边距、网格、间隙和留白都按 ${code('design.md')}。
- **保持组件语法**：使用设计系统自己的组件及其内部结构（卡片、数据块、表格、页码标签……）。
- **绝不混用模板。** 不借用其他模板、预设或通用演示风格的版式、配色或字体。
- **缺少某种版式？在同一系统内设计它**，使用相同的字体、配色、装饰、间距和页面框架元素，让它放在两张原版页面之间也毫不违和。不要换风格，也不要删掉内容。
- **内容真实；缺失时自行起草。** 使用用户的素材。绝不复用 ${code('template.html')} 中的示例文字、数字、人名或标志。用户只给了主题而没给内容时（例如“两条用户反馈”“致谢”“目标”），由你自己起草这些内容；页面上绝不放“待补充”之类的占位符。起草的内容要合理、克制。每一条起草的内容（包括你编造的示例引语、人名或数字）都必须列在最终回复里（第 6 节），方便用户审阅或替换。
- **只用真实的链接和码。** 看起来有功能的装饰（二维码、链接、网址、邮箱）只有在用户提供了真实内容时才使用；否则省略。
- **编号必须一致**：页面上显示的章节编号和标签必须与该页的页码一致（封面为第 1 页），不能与页码计数矛盾。
- **页面上不出现内部标签。** 绝不显示模板名（${name} / ${slug}）、"template"/"模板"或"preview"/"预览"字样、文件名、路径，或关于用户需求的备注。页面上可见的框架文字只能是真实内容：标题、章节、日期、作者、页码。
- **以用户选择的密度为准**，它优先于 ${code('design.md')} 中任何关于密度的说法。低密度和均衡型保留设计系统的网格和面板语汇，但使用更少、更大的面板（低密度一页一个观点，均衡型每页 2–4 个内容块）；空余面板用设计系统自己的装饰填充，绝不自创装饰。内容放不下就拆成更多页；字号不得小于 ${code('design.md')} 的规定，也绝不允许溢出。
- **投影型幻灯片（演讲型和均衡型）的最小字号**：${code('design.md')} 中最小的标签 token（通常在 1920×1080 下为 14–16px）在 1280px 宽的屏幕上只有约 9–10px，投影时根本看不清。凡是要投影的幻灯片，无论演讲型还是均衡型，凡是在 1920×1080 画布上小于 20px 的正文和标签文字，一律提高到至少 20px，保留该 token 的其他属性（字体、字距、大小写）；只有来源和脚注行可以降到 18px。阅读型幻灯片保持 ${code('design.md')} 的字号。这是用户的密度选择唯一优先于 ${code('design.md')} 字号的地方。
- **强调必须清晰可读**：高亮与强调（标记、强调色文字、强调色填充）必须与所在面板形成对比。绝不在强调色上叠强调色，比如强调色面板上的强调色高亮或强调色文字；这种位置改用设计系统里的其他强调方式。
- **CJK 文字（中文、日文、韩文）**：字间距为 0；行高使用 ${code('design.md')} 给出的 CJK 精确取值，若没有给出，正文约 1.75、标题约 1.2；绝不对 CJK 文字使用 ${code('text-transform: uppercase')}；不要强制 CJK 使用等宽字体；使用全角标点，CJK 与拉丁文字之间加空格。
- **CJK 换行**：CJK 文字不要按字符数限制宽度（${code('ch')} 单位或以字符数计的 ${code('max-width')}），那会产生只剩一个字的末行。使用 ${code('text-wrap: pretty')}（短标题用 ${code('text-wrap: balance')}）并配合 ${code('line-break: strict')}。
- **CJK 幻灯片中的标签**：标签和页面框架文字（章节标签、说明文字、页码标签）使用幻灯片的语言书写。等宽、大写和加宽字距只作用于拉丁字母和数字；标签中的 CJK 字符使用 CJK 字体，字间距为 0。

## 6. 自检，然后交付

1. 在真实浏览器中渲染幻灯片（Playwright、Puppeteer 或 headless Chrome，有什么用什么），视口分别为 **1280×720** 和一个**手机视口**（如 390×844），为每一页截图（按 → 翻页）。
2. 逐页检查：
   - 没有文字溢出或被所在面板裁切；
   - **没有面板相互重叠或遮挡**（只查 ${code('scrollHeight')} 发现不了这个问题，要看截图）。模板自身的框架元素（页码标签、角标、印章）如果原模板就是这样摆放的，可以压在面板上，但绝不能遮住文字；
   - 每处高亮和强调在所在面板上都清晰可读（没有强调色叠强调色）；
   - CJK 文字中没有以单个字或孤立标点结尾的行；如果有，调整宽度或措辞；
   - 手机上画布保持 16:9 并加黑边；
   ${fontCheckZh}
   - 控制台无报错（离线时 Google Fonts 请求失败及其报错属预期，字体已嵌入就没问题），${netCheckZh}。
3. 修正后重新检查，直到全部通过。如果无法在浏览器中渲染，要明确说明，并人工审查代码；不要声称检查已通过。
4. 最后，以观众的视角通读整份幻灯片，修正幻灯片自身互相矛盾的表述（例如某页声称“每页只有一个 X”，实际却用了三次 X）。
5. 在用户的默认浏览器中打开幻灯片：
   - macOS：${code('open "<file>.html"')}
   - Linux：${code('xdg-open "<file>.html"')}
   - Windows：cmd 中用 ${code('start "" "<file>.html"')}，PowerShell 中用 ${code('Start-Process "<file>.html"')}

   如果该命令不可用，或者没有图形界面（例如远程或无头环境），跳过这一步，直接把文件的绝对路径告诉用户。
6. 汇报文件的完整路径、页数、翻页方式，你起草的每一条内容（页码和文字，包括任何编造的示例引语、人名或数字）、你处理过的 ${code('design.md')} 内部矛盾、因可读性规则（对比度或最小字号）而偏离其配色或字号的每一处（改了什么，从什么改成什么），以及待确认的问题。之后修改时，编辑同一个文件，遵守以上全部约束，并重新自检。
`;
}

// ---------------------------------------------------------------------------
// Overlay templates (ctx.docs set): the author's own SKILL.md and reference docs replace
// design.md, and the author's template is the base file of the deck. Used for upstreams
// such as an agent skill with a non-permissive license (ctx.licenseNotice).
// ---------------------------------------------------------------------------

const licenseFileOf = (ctx) => ctx.licenses[0].file;

// The notice that opens the prompts and the pack README (null when the license is permissive).
export function licenseNoticeEn(ctx) {
  const n = ctx.licenseNotice;
  if (!n) return '';
  return `> **License notice: ${n.license}.** This template is licensed under the ${n.license} by ${n.author}. A deck built from it may count as a derivative work and may have to be released under the ${n.license} as well${n.network ? ' (including offering its source code to anyone who uses it over a network)' : ''}. Evaluate this before any commercial or closed-source use. The full license text is in ${code(licenseFileOf(ctx))}; the original repository is ${n.repoUrl}. This is general information, not legal advice.`;
}
export function licenseNoticeZh(ctx) {
  const n = ctx.licenseNotice;
  if (!n) return '';
  return `> **许可证提示：${n.license}。** 本模板由 ${n.authorZh ? `${n.authorZh} (${n.author})` : n.author} 以 ${n.license} 许可发布。用它制作的幻灯片可能被视为衍生作品，并可能需要同样以 ${n.license} 发布${n.network ? '（包括向通过网络使用它的人提供源代码）' : ''}。用于商业或闭源用途之前请先评估。许可证全文见 ${code(licenseFileOf(ctx))}；原始仓库：${n.repoUrl}。以上为一般性提示，不构成法律意见。`;
}

function filesOverlayEn(ctx) {
  const rows = [
    [code('template.html'), 'The author\'s template and the **base file of your deck**: styles, fonts, WebGL backgrounds, navigation, presenter mode and animation are all built in. It has no finished slides, only an insertion point (`<!-- SLIDES_HERE`).'],
  ];
  for (const a of ctx.assets) rows.push([code(a), 'A file `template.html` loads. Inline it into the deck as described in section 4.']);
  for (const d of ctx.docs) rows.push([code(d.path), d.en]);
  if (ctx.localFonts) rows.push([code('fonts/'), 'The template\'s Latin fonts as woff2 files (one folder per family, each with its license), and `fonts/fonts.css` with ready-made `@font-face` rules for exactly the families and weights this template uses. Embed them in your deck (see “Fonts” in section 4).']);
  if (ctx.cjkEmbed) rows.push(cjkRowEn());
  rows.push([`${code('PROMPT.md')}, ${code('PROMPT.zh.md')}`, 'These instructions (English / Chinese).']);
  rows.push([[code('README.md'), ...ctx.licenses.map((l) => code(l.file))].join(', '), 'Attribution and the license. Leave them as they are.']);
  return ['| File | Purpose |', '|---|---|', ...rows.map(([f, p]) => `| ${f} | ${p} |`)].join('\n');
}

function filesOverlayZh(ctx) {
  const rows = [
    [code('template.html'), '作者的模板，也是**你的幻灯片的基础文件**：样式、字体、WebGL 背景、翻页、演讲者模式和动效都已内置。其中没有成品页面，只有一个插入点（`<!-- SLIDES_HERE`）。'],
  ];
  for (const a of ctx.assets) rows.push([code(a), '`template.html` 加载的文件。按第 4 节的方法内联进幻灯片。']);
  for (const d of ctx.docs) rows.push([code(d.path), d.zh]);
  if (ctx.localFonts) rows.push([code('fonts/'), '本模板的拉丁字体 woff2 文件（每个字体族一个文件夹，附许可证），以及 `fonts/fonts.css`：恰好覆盖本模板所用字体族和字重的现成 `@font-face` 规则。把它们嵌入你的幻灯片（见第 4 节“字体”）。']);
  if (ctx.cjkEmbed) rows.push(cjkRowZh());
  rows.push([`${code('PROMPT.md')}、${code('PROMPT.zh.md')}`, '本说明（英文 / 中文）。']);
  rows.push([[code('README.md'), ...ctx.licenses.map((l) => code(l.file))].join('、'), '署名与许可证。保持原样。']);
  return ['| 文件 | 用途 |', '|---|---|', ...rows.map(([f, p]) => `| ${f} | ${p} |`)].join('\n');
}

const linkTag = (u) => code(`<link rel="stylesheet" href="${u}">`);

export function promptOverlayEn(ctx) {
  const { slug, name } = ctx;
  const zip = `${slug}.zip`;
  const n = ctx.licenseNotice;
  const lic = n ? n.license : 'its license';
  const doc = (suffix) => ctx.docs.find((d) => d.path.endsWith(suffix))?.path;
  const readOrder = ctx.docs.map((d) => code(d.path)).join(', ');
  const L = [];
  if (ctx.description) L.push(`- **Character:** ${ctx.description}`);
  L.push(`- **Mood / tone:** ${ctx.mood.join(', ')} / ${ctx.tone.join(', ')}. Color scheme: ${ctx.scheme}.`);
  L.push(`- **Themes** (pick exactly one with ${code('data-theme')} on ${code('<html>')}; never write color values by hand):`);
  for (const c of ctx.colors) L.push(`  - ${code(c.name)} ${c.value}`);
  if (ctx.paletteNote) L.push(`  - Usage: ${ctx.paletteNote}.`);
  if (ctx.typography.length) L.push(`- **Typography:** ${ctx.typography.map((x) => `${x.role} ${x.family}`).join('; ')}${ctx.typographyStyle ? ` — ${ctx.typographyStyle}` : ''}.`);
  const cjkLinks = ctx.cjkFontLinks.map(linkTag).join(' / ');

  return `# Build a slide deck with the ${name} template

${licenseNoticeEn(ctx)}

You are a coding agent. The user wants a presentation built as a single self-contained HTML file from the **${name}** template. Everything you need is in the template pack ${code(slug + '/')}. Follow the steps below in order. Always reply to the user in the language they write to you in.

**Which instructions win.** This template comes from an agent skill whose own ${code('SKILL.md')} is part of the pack. Follow ${code('SKILL.md')} and its references for the design: styles, themes, layouts, components, quality rules. Where it conflicts with this prompt on the points listed in section 4 (single file, no network requests, images, tooling that is not in the pack, update check), this prompt wins. Read ${code('SKILL.md')} as if its paths were relative to this pack: ${code('assets/template.html')} means ${code('template.html')} here, ${code('<SKILL_ROOT>')} means the pack folder.

## 0. Locate the pack

${ctx.zipUrl ? locateDownloadEn(slug, zip, ctx.zipUrl, 'SKILL.md', undefined, cjkExcEn(ctx)) : locateLocalEn(slug, zip, 'SKILL.md')}

All paths below are relative to the ${code(slug + '/')} folder. Do not modify the pack files; write the deck as a new file inside that folder.

## 1. What is in the pack

${filesOverlayEn(ctx)}

## 2. The design at a glance

This summary keeps the essentials in view; it does not replace ${code('SKILL.md')} and its references.

${L.join('\n')}
- **Navigation, built in:** ← → / wheel / touch swipe / dots / Esc for the overview; ${code('B')} for static (low-power) mode; ${code('P')} for presenter mode. Do not replace or remove them.

## 3. Workflow

1. **Tell the user about the license first, before you build anything.** In your first message, say plainly: this template is licensed under the ${lic} by ${n ? n.author : 'its author'}; a deck built from it may count as a derivative work and may have to be released under the ${lic} too${n?.network ? ' (including offering its source to anyone who uses it over a network)' : ''}; they should evaluate that before commercial or closed-source use; the full text is in ${code(licenseFileOf(ctx))}. If they need a closed-source or commercial deck and cannot accept this, say so and suggest picking a differently licensed template instead of building this one. Put this in the same message as the questions below; do not wait for an extra confirmation unless they raise a concern.
2. **Ask before building.** In one message (the style is already decided by this template; skip the author's style question), ask the user:
   1. Purpose and audience: what is the deck for (talk, launch, salon, internal review, …) and who will see it?
   2. Length: roughly how many slides or how many minutes?
   3. Content: ask them to paste or point to their material (notes, outline, document, data, images), or to confirm that you should draft it from a topic. Also ask for the speaker name, date, organisation and any link for the closing slide; leave out whatever they don't give you, never invent it.
   4. Theme: offer the theme presets from ${code(doc('themes.md') ?? doc('themes-swiss.md') ?? 'the themes file')} with a recommendation, or use the default.
   5. Images: only images the user supplies are used. Ask whether they have any. You cannot generate images (see section 4).
   6. Hard constraints: anything that must or must not appear. If they want to present live, ask for the timing so the speaker notes can be planned (${code(doc('presenter-mode.md') ?? 'presenter-mode.md')}).

   Skip any question the user has already answered. Then stop and wait for the reply.
3. **Read** ${readOrder} completely, in this order, before writing any code, and ${code('template.html')} down to the end of its ${code('<style>')} block (it is the only source of class names).
4. **Plan.** Write the slide-by-slide plan the author's documents ask for (layouts, light/dark rhythm, one line per slide). If the user gave only facts or notes, or you drafted the content yourself, show the plan and wait for approval; if they supplied a ready slide-by-slide structure, follow it.
5. **Build:** copy ${code('template.html')} to ${code('<short-deck-name>.html')} inside the pack folder (never overwrite ${code('template.html')}) and fill in the slides at the insertion point, following the author's documents and section 4. Replace every placeholder in square brackets: the template writes the Chinese words for “required” or “optional” right after the opening bracket (code points U+5FC5 U+586B or U+9009 U+586B); search the file for them.
6. **Self-check** (section 6), fix what you find, then open the deck and report.

## 4. Output requirements

- **One self-contained file.** The deck is the copied template with your slides; its CSS, WebGL and navigation scripts are already inline. Add nothing external:
  - **Motion:** the template loads ${code('./assets/motion.min.js')} with a jsDelivr fallback. Replace that whole loading step with an import of ${code('assets/motion.min.js')} embedded as a base64 data URI (${code("await import('data:text/javascript;base64,…')")}, generated with a small Node or Python script) and delete the CDN fallback; keep the final catch that makes ${code('[data-anim]')} elements visible.
  - **Icons:** the template loads Lucide from ${code('unpkg.com/lucide@latest')} (unpinned). Delete that script tag and the ${code('lucide.createIcons()')} call. Where the author's documents say to use Lucide icons, use small inline SVG line icons instead (24×24 viewBox, ${code('stroke="currentColor"')}, stroke width 1.5 to 2, round caps, no fill), in the same Lucide-like style; never emoji.
  - **Images:** only images the user supplies, embedded as data URIs, downscaled to about twice their displayed size (JPEG or WebP; keep the deck under roughly 8 MB). The author's image generation (GPT-Image prompts, ${code('references/image-prompts.md')}), screenshot backgrounds (${code('assets/screenshot-backgrounds/')}) and ${code('images/')} folder are not part of this pack: do not use them. Layouts that need an image but have none: use the text-only layouts, or build a graphic from CSS or inline SVG; never leave a placeholder.
- **Viewport-relative by design.** This template is laid out with ${code('vw')} / ${code('vh')} units, not a fixed 1920×1080 stage. Keep it that way: do not add a stage scaler, do not convert units, follow the author's size rules. The fixed-canvas rules that apply to other templates on slides-commons do not apply here.
- **Fonts:** the template requests its fonts with a Google Fonts ${code('<link>')} (and ${code('preconnect')} links) in ${code('<head>')}. Replace them as follows. Never link Google Fonts for the Latin families and never reference files in ${code('fonts/')} from the deck: it must stay a single file that works offline.
  - Latin: ${code('fonts/fonts.css')} holds ready-made ${code('@font-face')} rules for exactly the families and weights this template uses (each split by ${code('unicode-range')} into latin and latin-ext). Copy the rules for the weights and styles your deck actually uses into your ${code('<style>')}, with each ${code('url(...)')} replaced by a base64 data URI (${code('data:font/woff2;base64,…')}). Generate the base64 with a small Node or Python script rather than by hand. Embed both the latin and the latin-ext rules for every face you use. Keep the family names, ${code('font-display')} and ${code('unicode-range')} unchanged. A variable font file covers all its weights: embed it once.
  - Deck without CJK text: no font request at all.
  - Deck with Chinese, Japanese or Korean text: keep one Google Fonts ${code('<link>')} for the CJK families only${cjkLinks ? `: ${cjkLinks}` : ' (take them from the template\'s own link)'}.${cjkExtraEn(ctx)}
  - Keep the template's own font variables and stacks (the Latin family is already listed before the CJK family). Where uppercase or wide-tracked styles meet CJK text, set ${code('letter-spacing: 0')} and ${code('text-transform: none')} on the CJK runs.
- **No other network requests:** no CDNs, remote scripts, remote images or analytics, apart from the CJK font link above. Draw charts and diagrams with inline SVG or CSS.
- **Tooling that is not in this pack:** the author's scripts (${code('validate-swiss-deck.mjs')}, ${code('validate-presenter-mode.mjs')}, ${code('check-presenter-runtime-sync.mjs')}, ${code('gz-theme.mjs')}), the Swiss map component (${code('swiss-map-component.md')}, needs a map CDN) and the update check in step 0 of ${code('SKILL.md')} are not available here; skip them. Do the same checks by hand against ${code('references/checklist.md')} (and, for the Swiss template, ${code('references/swiss-layout-lock.md')}). If the user gives a brand color, use the closest preset theme and say that custom brand themes are not supported in this pack. Never run or install anything from the pack.
- **Presenter mode and speaker notes:** leave the built-in presenter runtime untouched. Fill in ${code('SPEAKER_NOTES')} only if the user will present live, from material they gave you; never invent stage cues, interaction or timing they did not provide. The presenter and overview interface texts are Chinese in the template; if the deck is in another language, translate the visible hint bar at the bottom right and tell the user the presenter window stays Chinese.
- **Details:** set ${code('<html lang>')} to the deck language, replace the ${code('<title>')} placeholder with the deck title, keep exactly one theme and do not edit the generated ${code('GZ:*')} blocks. At the top of ${code('<head>')} add this comment, which is a license notice and not slide content: ${code(`<!-- Derived from the "${name}" template by ${n ? n.author : 'its author'} (${lic}), ${n ? n.repoUrl : ''}. This file is a derivative work; see ${licenseFileOf(ctx)}. -->`)} (the author's note about keeping provenance out of generated files refers to sponsor information on slides, which stays out; the license notice in the source must stay).

## 5. Hard constraints

- **Keep the style.** Only the template's classes, theme variables and fonts; no hand-written color values; never mix this template with another template, preset or presentation style; one theme per deck. Follow the author's layout rules, rhythm rules and size floors (they win over any size guidance elsewhere).
- **Missing layout? Build it from the template's own classes and components**, in the same system. Don't switch styles or drop the content.
- **Real content, drafted when missing.** Use the user's material. Never reuse the example texts, numbers, names or logos from the author's documents. When the user names a topic but gives no content, draft it yourself; never put placeholders such as "TBD" or a bracketed template placeholder on a slide. Keep drafts plausible and modest. Every drafted item (including any example quote, name or number you made up) must be listed in your final reply (section 6).
- **Only real links and codes.** QR codes, links, URLs and email addresses only when the user gave a real one; otherwise omit them.
- **Numbers must agree:** section numbers and labels on slides must match the slide's page number, so they never disagree with the page counter. Section ordinals (such as “Section 03”) are fine; any reference to a page number must equal the footer page number.
- **No internal labels on slides.** Never show the template name (${name} / ${slug}), the author's or sponsors' names, the words "template" or "preview", file names, paths or notes about the user's requirements. Visible chrome is real deck content only.
- **The user's density choice wins** over the author's density guidance: fewer, larger blocks for low density. If content does not fit, split it across more slides; never shrink text below the author's size floors and never let it overflow.
- **Keep emphasis legible:** accent colors need contrast with the surface they sit on; never put accent on accent. Use the author's accent text variables.
- **CJK text (Chinese, Japanese, Korean):** letter-spacing 0 and no uppercase on CJK runs; use the template's CJK families and line-heights; full-width punctuation and a space between CJK and Latin text; no one-character last lines (${code('text-wrap: pretty')} / ${code('balance')}, ${code('line-break: strict')}; don't limit widths in ${code('ch')} units).

## 6. Self-check, then deliver

1. Render the deck in a real browser (Playwright, Puppeteer or headless Chrome, whatever is available) at **1920×1080**, **1440×900** and **1280×720** (landscape screens; the template is not designed for portrait phones, so no phone check is needed), and screenshot every slide (advance with →; wait about 2 seconds per slide so the entrance animation has finished).
2. On every slide, check:
   - no text overflows or is clipped; nothing touches the bottom navigation dots or the corner hint;
   - no panel overlaps or covers another (look at the screenshots, a ${code('scrollHeight')} check misses this);
   - emphasis is legible (no accent on accent), and the theme rhythm follows the author's rules (list the ${code('class="slide')} lines and look);
   - for the Swiss template: every section has a registered ${code('data-layout')}, one accent color only, no gradients, shadows or rounded corners;
   - in CJK text, no line ends with a single character or a lone punctuation mark;
   - the intended fonts loaded, Latin and CJK (no fallback). ${code('document.fonts.check()')} is not proof: wait for ${code('document.fonts.ready')} and confirm each expected face appears in ${code('document.fonts')} with status ${code('"loaded"')}, or compare rendered text widths against a fallback font. If a font request fails with a network error, retry or reload before concluding anything;
   - no leftover bracketed placeholders (see step 5 of the workflow) or sample text (search the file), no console errors (offline, the failed Google Fonts request and its console error are expected and fine when the fonts are embedded), and no network requests at all (or, for CJK text, only the one Google Fonts request).
3. Fix and re-check until clean. If you cannot render in a browser, say so plainly and review the code by hand; don't claim the check passed.
4. Reread the deck as the audience would and fix any statement the deck itself contradicts.
5. Open the deck in the user's default browser:
   - macOS: ${code('open "<file>.html"')}
   - Linux: ${code('xdg-open "<file>.html"')}
   - Windows: ${code('start "" "<file>.html"')} in cmd, or ${code('Start-Process "<file>.html"')} in PowerShell

   If the command is not available or there is no display, skip this step and give the user the file's absolute path.
6. Report the file's full path, the slide count, how to navigate (including ${code('B')} and ${code('P')}), every item you drafted (slide number and text), every deviation from the author's documents (and why), and open questions. Repeat the license reminder: the deck is a derivative of an ${lic} template and may have to be released under the ${lic}; keep ${code(licenseFileOf(ctx))} with it and evaluate this before commercial or closed-source use. For later changes, edit the same file, keep every constraint above, and run the self-check again.
`;
}

export function promptOverlayZh(ctx) {
  const { slug, name } = ctx;
  const zip = `${slug}.zip`;
  const n = ctx.licenseNotice;
  const lic = n ? n.license : '该许可证';
  const doc = (suffix) => ctx.docs.find((d) => d.path.endsWith(suffix))?.path;
  const readOrder = ctx.docs.map((d) => code(d.path)).join('、');
  const zhTags = (zhArr, arr) => (zhArr && zhArr.every(Boolean) ? zhArr.join('、') : arr.join(', '));
  const zhScheme = { light: '浅色', dark: '深色', mixed: '混合' }[ctx.scheme] ?? ctx.scheme;
  const L = [];
  if (ctx.zh?.description) L.push(`- **风格特征**：${ctx.zh.description}`);
  else if (ctx.description) L.push(`- **风格特征**（原文）：${ctx.description}`);
  L.push(`- **情绪 / 语气**：${zhTags(ctx.zh?.mood, ctx.mood)} / ${zhTags(ctx.zh?.tone, ctx.tone)}。配色方案：${zhScheme}。`);
  const pn = ctx.zh?.palette_description ?? ctx.paletteNote;
  L.push(`- **主题**（在 ${code('<html>')} 上用 ${code('data-theme')} 只选一套；绝不手写色值）：`);
  for (const c of ctx.colors) L.push(`  - ${code(c.name)} ${c.value}`);
  if (pn) L.push(`  - 用法：${pn}。`);
  if (ctx.typography.length) {
    const style = ctx.zh?.typography_style ? `（${ctx.zh.typography_style}）` : ctx.typographyStyle ? `（原文：${ctx.typographyStyle}）` : '';
    L.push(`- **字体**：${ctx.typography.map((x) => `${x.role} ${x.family}`).join('；')}${style}。`);
  }
  const cjkLinks = ctx.cjkFontLinks.map(linkTag).join(' / ');

  return `# 用 ${name} 模板制作幻灯片

${licenseNoticeZh(ctx)}

你是一个 coding agent。用户希望以 **${name}** 模板制作一份演示文稿，产出为单个自包含的 HTML 文件。所需素材都在模板包 ${code(slug + '/')} 中。请按以下步骤依次执行。始终用用户与你对话时使用的语言回复用户。

**以谁为准。** 这个模板来自一个 agent skill，该 skill 自己的 ${code('SKILL.md')} 就在素材包里。设计方面（风格、主题、版式、组件、质量规则）以 ${code('SKILL.md')} 及其参考文档为准。第 4 节列出的几点（单文件、不发起网络请求、图片、素材包里没有的工具、更新检查）如果与它冲突，以本提示词为准。阅读 ${code('SKILL.md')} 时，把其中的路径当作相对于本素材包：这里的 ${code('assets/template.html')} 就是 ${code('template.html')}，${code('<SKILL_ROOT>')} 就是素材包文件夹。

## 0. 找到素材包

${ctx.zipUrl ? locateDownloadZh(slug, zip, ctx.zipUrl, 'SKILL.md', undefined, cjkExcZh(ctx)) : locateLocalZh(slug, zip, 'SKILL.md')}

下文所有路径都相对于 ${code(slug + '/')} 文件夹。不要修改素材包里的文件；把幻灯片写成该文件夹里的一个新文件。

## 1. 素材包里有什么

${filesOverlayZh(ctx)}

## 2. 设计速览

这份摘要用于时刻记住要点，不能代替 ${code('SKILL.md')} 及其参考文档。

${L.join('\n')}
- **内置翻页**：← → / 滚轮 / 触屏滑动 / 圆点 / Esc 总览；${code('B')} 切换静态（低功耗）模式；${code('P')} 进入演讲者模式。不要替换或删除它们。

## 3. 工作流程

1. **动手之前，先把许可证的事告诉用户。** 在你的第一条消息里明确说明：本模板由 ${n ? (n.authorZh ?? n.author) : '原作者'} 以 ${lic} 许可发布；用它制作的幻灯片可能被视为衍生作品，并可能需要同样以 ${lic} 发布${n?.network ? '（包括向通过网络使用它的人提供源代码）' : ''}；用于商业或闭源用途之前请先评估；许可证全文见 ${code(licenseFileOf(ctx))}。如果用户需要闭源或商业用途而无法接受，就如实说明，并建议改选其他许可证的模板，而不是继续制作。这段话和下面的问题放在同一条消息里；除非用户提出顾虑，否则不必额外等待确认。
2. **先问再做。**（风格已由本模板确定，跳过作者清单里的风格问题。）用一条消息向用户提问：
   1. 用途与受众：这份幻灯片做什么用（演讲、发布、沙龙、内部评审……），给谁看？
   2. 篇幅：大约多少页，或多少分钟？
   3. 内容：请用户粘贴或指明素材（笔记、提纲、文档、数据、图片），或确认由你根据主题起草。同时询问演讲者姓名、日期、机构，以及结尾页的链接；用户没提供的就省略，绝不编造。
   4. 主题：从 ${code(doc('themes.md') ?? doc('themes-swiss.md') ?? '主题文档')} 中给出主题预设并推荐一套，或使用默认主题。
   5. 图片：只使用用户提供的图片。询问是否有图片。你无法生成图片（见第 4 节）。
   6. 硬性约束：必须出现或不能出现的内容。如果要现场演讲，询问时长，以便规划演讲备注（${code(doc('presenter-mode.md') ?? 'presenter-mode.md')}）。

   用户已经回答过的问题就跳过。问完后停下，等待回复。
3. **完整阅读** ${readOrder}（按此顺序），再写代码；同时把 ${code('template.html')} 读到 ${code('<style>')} 块末尾（它是类名的唯一来源）。
4. **规划。** 写出作者文档要求的逐页规划（版式、深浅节奏、每页一行说明）。如果用户只提供了事实或笔记，或者内容是你起草的，先把规划给用户看并等待确认；如果用户已经给出逐页结构，按其结构直接继续。
5. **生成**：把 ${code('template.html')} 复制为素材包文件夹内的 ${code('<简短的幻灯片名>.html')}（不要覆盖 ${code('template.html')}），按作者文档和第 4 节在插入点填入页面。替换所有 ${code('[必填]')} / ${code('[选填]')} 占位符。
6. **自检**（第 6 节），修正发现的问题，然后打开幻灯片并汇报。

## 4. 产出要求

- **单个自包含文件。** 幻灯片就是复制后的模板加上你的页面；它的 CSS、WebGL 和翻页脚本已经内联。不要添加任何外部内容：
  - **动效：** 模板加载 ${code('./assets/motion.min.js')}，失败时回落到 jsDelivr。把整个加载步骤改成引入以 base64 data URI 嵌入的 ${code('assets/motion.min.js')}（${code("await import('data:text/javascript;base64,…')")}，用一个小的 Node 或 Python 脚本生成），并删掉 CDN 回落；保留最后那个让 ${code('[data-anim]')} 元素可见的 catch。
  - **图标：** 模板从 ${code('unpkg.com/lucide@latest')}（未锁定版本）加载 Lucide。删除该 script 标签和 ${code('lucide.createIcons()')} 调用。作者文档要求使用 Lucide 图标的地方，改用小型内联 SVG 线性图标（24×24 viewBox，${code('stroke="currentColor"')}，线宽 1.5 到 2，圆角端点，不填充），保持类似 Lucide 的风格；绝不用 emoji。
  - **图片：** 只使用用户提供的图片，以 data URI 嵌入，缩小到约为显示尺寸的两倍（JPEG 或 WebP；整份文件控制在约 8 MB 内）。作者的配图生成（GPT-Image 提示词、${code('references/image-prompts.md')}）、截图背景（${code('assets/screenshot-backgrounds/')}）和 ${code('images/')} 文件夹都不在本素材包里：不要使用。需要图片但没有图片的版式：改用纯文字版式，或用 CSS / 内联 SVG 做图形；绝不留占位符。
- **按设计就是相对视口的。** 本模板用 ${code('vw')} / ${code('vh')} 单位排版，不是固定 1920×1080 画布。保持这一点：不要加画布缩放脚本，不要换算单位，遵守作者的字号规则。slides-commons 上其他模板适用的固定画布规则在这里不适用。
- **字体：** 模板在 ${code('<head>')} 里用一条 Google Fonts ${code('<link>')}（以及 ${code('preconnect')} 链接）请求字体。按下面的方法替换。不要为拉丁字体链接 Google Fonts，也不要在幻灯片里引用 ${code('fonts/')} 中的文件：它必须保持为单个、可离线使用的文件。
  - 拉丁字体：${code('fonts/fonts.css')} 里是恰好覆盖本模板所用字体族和字重的现成 ${code('@font-face')} 规则（按 ${code('unicode-range')} 拆成 latin 与 latin-ext）。把幻灯片实际用到的字重和字形对应的规则复制进你的 ${code('<style>')}，并把每个 ${code('url(...)')} 换成 base64 data URI（${code('data:font/woff2;base64,…')}）。base64 用一个小的 Node 或 Python 脚本生成，不要手工处理。每个用到的字体都要同时嵌入 latin 与 latin-ext 两组规则。字体族名、${code('font-display')} 和 ${code('unicode-range')} 保持不变。可变字体文件已覆盖所有字重，只嵌入一次。
  - 幻灯片不含 CJK 文字：完全不发起字体请求。
  - 幻灯片含中文、日文或韩文：保留一条只含 CJK 字体族的 Google Fonts ${code('<link>')}${cjkLinks ? `：${cjkLinks}` : '（取自模板自带的链接）'}。${cjkExtraZh(ctx)}
  - 保留模板自带的字体变量和字体栈（拉丁字体已排在 CJK 字体之前）。大写或加宽字距的样式遇到 CJK 文字时，对 CJK 文字设 ${code('letter-spacing: 0')} 和 ${code('text-transform: none')}。
- **不发起其他网络请求**：除上面的 CJK 字体链接外，不用 CDN、远程脚本、远程图片或统计代码。图表和示意图用内联 SVG 或 CSS 绘制。
- **本素材包里没有的工具：** 作者的脚本（${code('validate-swiss-deck.mjs')}、${code('validate-presenter-mode.mjs')}、${code('check-presenter-runtime-sync.mjs')}、${code('gz-theme.mjs')}）、瑞士风地图组件（${code('swiss-map-component.md')}，需要地图 CDN）以及 ${code('SKILL.md')} 第 0 步的更新检查在这里都不可用，直接跳过。对照 ${code('references/checklist.md')}（瑞士风模板还要对照 ${code('references/swiss-layout-lock.md')}）手工完成同样的检查。如果用户给了品牌色，就用最接近的预设主题，并说明本素材包不支持自定义品牌主题。绝不运行或安装素材包里的任何内容。
- **演讲者模式与演讲备注：** 不要改动内置的演讲者运行时。只有用户要现场演讲时，才根据用户给你的素材填写 ${code('SPEAKER_NOTES')}；绝不编造用户没有提供的舞台提示、互动或时间安排。模板里演讲者界面和总览界面的文字是中文；如果幻灯片是其他语言，把右下角可见的提示条翻译成该语言，并告诉用户演讲者窗口仍是中文。
- **细节：** ${code('<html lang>')} 设为幻灯片语言，把 ${code('<title>')} 占位符替换为幻灯片标题，只用一套主题，不要改动自动生成的 ${code('GZ:*')} 区块。在 ${code('<head>')} 最上方加入这条注释，它是许可证声明，不是页面内容：${code(`<!-- Derived from the "${name}" template by ${n ? n.author : 'its author'} (${lic}), ${n ? n.repoUrl : ''}. This file is a derivative work; see ${licenseFileOf(ctx)}. -->`)}（作者关于“生成物里不要写来源信息”的说明指的是页面上的赞助方信息，那些仍然不出现；源码里的许可证声明必须保留。）

## 5. 硬性约束

- **保持风格。** 只用模板自带的类、主题变量和字体；不手写色值；绝不把本模板与其他模板、预设或通用演示风格混用；一份幻灯片只用一套主题。遵守作者的版式规则、节奏规则和字号下限（它们优先于其他任何字号说法）。
- **缺少某种版式？用模板自带的类和组件在同一系统内搭建**，不要换风格，也不要删掉内容。
- **内容真实；缺失时自行起草。** 使用用户的素材。绝不复用作者文档中的示例文字、数字、人名或标志。用户只给了主题而没给内容时，由你自己起草；页面上绝不放“待补充”或 ${code('[必填]')} 之类的占位符。起草的内容要合理、克制。每一条起草的内容（包括你编造的示例引语、人名或数字）都必须列在最终回复里（第 6 节）。
- **只用真实的链接和码。** 二维码、链接、网址、邮箱只有在用户提供了真实内容时才使用；否则省略。
- **编号必须一致**：页面上显示的章节编号和标签必须与该页的页码一致，不能与页码计数矛盾。
- **页面上不出现内部标签。** 绝不显示模板名（${name} / ${slug}）、作者或赞助方的名字、"template"/"模板"或"preview"/"预览"字样、文件名、路径，或关于用户需求的备注。页面上可见的框架文字只能是真实内容。
- **以用户选择的密度为准**，它优先于作者关于密度的说法：低密度用更少、更大的内容块。内容放不下就拆成更多页；字号不得小于作者的字号下限，也绝不允许溢出。
- **强调必须清晰可读**：强调色必须与所在表面形成对比，绝不在强调色上叠强调色；使用作者提供的强调色文字变量。
- **CJK 文字（中文、日文、韩文）**：CJK 文字字间距为 0、不用大写转换；使用模板的 CJK 字体族和行高；使用全角标点，CJK 与拉丁文字之间加空格；不要出现只剩一个字的末行（${code('text-wrap: pretty')} / ${code('balance')}，${code('line-break: strict')}；不要用 ${code('ch')} 单位限制宽度）。

## 6. 自检，然后交付

1. 在真实浏览器中渲染幻灯片（Playwright、Puppeteer 或 headless Chrome，有什么用什么），视口分别为 **1920×1080**、**1440×900** 和 **1280×720**（横屏；模板不是为竖屏手机设计的，所以不用做手机检查），为每一页截图（按 → 翻页；每页等待约 2 秒，让入场动画结束）。
2. 逐页检查：
   - 没有文字溢出或被裁切；没有东西碰到底部导航圆点或角落提示条；
   - 没有面板相互重叠或遮挡（要看截图，只查 ${code('scrollHeight')} 发现不了这个问题）；
   - 强调清晰可读（没有强调色叠强调色），主题节奏符合作者的规则（列出 ${code('class="slide')} 所在行，人工看一遍）；
   - 瑞士风模板：每个 section 都有已登记的 ${code('data-layout')}，只有一种强调色，没有渐变、阴影或圆角；
   - CJK 文字中没有以单个字或孤立标点结尾的行；
   - 目标字体已加载，包括拉丁字体和 CJK 字体（不是回退字体）。${code('document.fonts.check()')} 不能作为证据：应等待 ${code('document.fonts.ready')}，再确认每个预期字体都出现在 ${code('document.fonts')} 中且状态为 ${code('"loaded"')}，或者把渲染出的文字宽度与回退字体对比。如果字体请求因网络错误失败，先重试或重新加载再下结论；
   - 没有残留的 ${code('[必填]')} / ${code('[选填]')} 占位符或示例文字（在文件中搜索），控制台无报错（离线时 Google Fonts 请求失败及其报错属预期，字体已嵌入就没问题），完全没有网络请求（含 CJK 文字时只允许那条 Google Fonts 请求）。
3. 修正后重新检查，直到全部通过。如果无法在浏览器中渲染，要明确说明，并人工审查代码；不要声称检查已通过。
4. 以观众的视角通读整份幻灯片，修正幻灯片自身互相矛盾的表述。
5. 在用户的默认浏览器中打开幻灯片：
   - macOS：${code('open "<file>.html"')}
   - Linux：${code('xdg-open "<file>.html"')}
   - Windows：cmd 中用 ${code('start "" "<file>.html"')}，PowerShell 中用 ${code('Start-Process "<file>.html"')}

   如果该命令不可用，或者没有图形界面，跳过这一步，直接把文件的绝对路径告诉用户。
6. 汇报文件的完整路径、页数、翻页方式（包括 ${code('B')} 和 ${code('P')}），你起草的每一条内容（页码和文字）、你对作者文档的每一处偏离（以及原因），以及待确认的问题。再次提醒许可证：这份幻灯片是 ${lic} 模板的衍生作品，可能需要同样以 ${lic} 发布；请把 ${code(licenseFileOf(ctx))} 与它放在一起，并在商业或闭源使用之前先评估。之后修改时，编辑同一个文件，遵守以上全部约束，并重新自检。
`;
}

// ---------------------------------------------------------------------------
// Skill decks (ctx.promptKind === 'skill-deck'): an agent skill that ships complete example
// decks. Each deck is a folder with index.html + style.css that loads shared stylesheets and a
// runtime from the skill's assets/ folder by relative path; the pack keeps that layout, so the
// files work unmodified. The deliverable is ONE self-contained HTML file built from the deck.
// ---------------------------------------------------------------------------

const baseName = (p) => p.split('/').pop();

function assetRole(a) {
  const f = baseName(a);
  if (/\.css$/.test(f) && /(^|\/)themes\//.test(a)) return 'theme';
  if (f === 'fonts.css') return 'fonts';
  if (f === 'base.css') return 'base';
  if (f === 'animations.css') return 'animations';
  if (f === 'runtime.js') return 'runtime';
  if (/\.css$/.test(f)) return 'style';
  return 'other';
}

const ASSET_EN = {
  style: 'This deck\'s own stylesheet, scoped under its `.tpl-…` class: the deck\'s identity. Inline it into the deck (section 4).',
  base: 'Shared design tokens and layout primitives: the fixed 1920×1080 canvas, the slide stack (`.slide` / `.is-active`), header and footer chrome. Inline it unmodified.',
  fonts: 'The font manifest: nothing but `@import` lines for Google Fonts. Do not inline it; replace it with embedded fonts (“Fonts” in section 4).',
  runtime: 'The deck runtime: keyboard, touch swipe, overview, notes drawer, presenter window, canvas scaling. Inline it unmodified.',
  animations: 'The CSS entry animations (`data-anim`, `anim-*`). Inline it unmodified.',
  theme: 'A color theme (token overrides) the deck can use. Inline only the one theme you choose.',
  other: 'A file the deck loads.',
};
const ASSET_ZH = {
  style: '这套幻灯片自己的样式表，作用域限定在它的 `.tpl-…` 类下：它就是这套幻灯片的个性所在。内联进你的幻灯片（第 4 节）。',
  base: '共用的设计 token 与布局基础：固定 1920×1080 画布、页面堆叠（`.slide` / `.is-active`）、页眉页脚。原样内联。',
  fonts: '字体清单：里面只有 Google Fonts 的 `@import` 行。不要内联；改用嵌入字体（第 4 节“字体”）。',
  runtime: '幻灯片运行时：键盘、触屏滑动、总览、备注抽屉、演讲者窗口、画布缩放。原样内联。',
  animations: 'CSS 入场动画（`data-anim`、`anim-*`）。原样内联。',
  theme: '幻灯片可用的一套配色主题（token 覆盖）。只内联你选定的那一套。',
  other: '幻灯片加载的文件。',
};

function filesSkillDeck(ctx, zh) {
  const T = zh ? ASSET_ZH : ASSET_EN;
  const rows = [
    [code(ctx.htmlName), zh
      ? `作者的示例幻灯片（${ctx.slideCount} 页），也是**你的幻灯片的结构来源**：版式、类名和各种页面类型都在这里。其中的示例内容只供参考结构，绝不复用。`
      : `The author's example deck (${ctx.slideCount} slides) and the **structural source of your deck**: its layouts, class names and slide types. Its demo content is reference for structure only; never reuse it.`],
  ];
  for (const a of ctx.assets) rows.push([code(a), T[assetRole(a)]]);
  for (const d of ctx.docs) rows.push([code(d.path), zh ? d.zh : d.en]);
  if (ctx.localFonts) rows.push([code('fonts/'), zh
    ? '本模板的拉丁字体 woff2 文件（每个字体族一个文件夹，附许可证），以及 `fonts/fonts.css`：恰好覆盖本模板所用字体族和字重的现成 `@font-face` 规则。把它们嵌入你的幻灯片（见第 4 节“字体”）。'
    : 'The deck\'s Latin fonts as woff2 files (one folder per family, each with its license), and `fonts/fonts.css` with ready-made `@font-face` rules for exactly the families and weights this deck uses. Embed them in your deck (see “Fonts” in section 4).']);
  if (ctx.cjkEmbed) rows.push(zh ? cjkRowZh() : cjkRowEn());
  rows.push(zh
    ? [`${code('PROMPT.md')}、${code('PROMPT.zh.md')}`, '本说明（英文 / 中文）。']
    : [`${code('PROMPT.md')}, ${code('PROMPT.zh.md')}`, 'These instructions (English / Chinese).']);
  rows.push(zh
    ? [[code('README.md'), ...ctx.licenses.map((l) => code(l.file))].join('、'), '署名与许可证。保持原样。']
    : [[code('README.md'), ...ctx.licenses.map((l) => code(l.file))].join(', '), 'Attribution and the license. Leave them as they are.']);
  return (zh ? ['| 文件 | 用途 |', '|---|---|'] : ['| File | Purpose |', '|---|---|']).concat(rows.map(([f, p]) => `| ${f} | ${p} |`)).join('\n');
}

const credit = (ctx) => `<!-- Based on the "${ctx.name}" deck of ${repoBase(ctx.credit.repoUrl)} by ${ctx.credit.author} (${ctx.credit.license}), ${ctx.credit.repoUrl}. Keep the license notice in ${licenseFileOf(ctx)} with this file. -->`;
const repoBase = (u) => u.replace(/\/+$/, '').split('/').pop();

export function promptSkillDeckEn(ctx) {
  const { slug, name } = ctx;
  const zip = `${slug}.zip`;
  const dir = ctx.deckDir;
  const themes = ctx.assets.filter((a) => assetRole(a) === 'theme');
  const hasNotesDoc = ctx.docs.some((d) => d.path.endsWith('presenter-mode.md'));
  const cjkLinks = ctx.cjkFontLinks.map(linkTag).join(' / ');
  const readOrder = ctx.docs.map((d) => code(d.path)).join(', ');
  const stylePath = ctx.assets.find((a) => assetRole(a) === 'style');
  const L = [];
  if (ctx.description) L.push(`- **Character:** ${ctx.description}`);
  L.push(`- **Mood / tone:** ${ctx.mood.join(', ')} / ${ctx.tone.join(', ')}. Color scheme: ${ctx.scheme}.`);
  L.push('- **Palette** (the deck\'s own CSS variables; use these exact values and no other colors):');
  for (const c of ctx.colors) L.push(`  - ${code(c.name)} ${c.value}`);
  if (ctx.paletteNote) L.push(`  - Usage: ${ctx.paletteNote}.`);
  if (ctx.typography.length) L.push(`- **Typography:** ${ctx.typography.map((x) => `${x.role} ${x.family}`).join('; ')}${ctx.typographyStyle ? ` — ${ctx.typographyStyle}` : ''}.`);
  L.push(`- **Canvas:** a fixed 1920×1080 stage that ${code(baseName(ctx.assets.find((a) => assetRole(a) === 'runtime') ?? 'runtime.js'))} scales to the window (letterboxed, never reflowed), so a pixel value means the same thing on every screen.`);
  if (themes.length) L.push(`- **Themes:** the example deck lists ${themes.map((a) => code(baseName(a).replace(/\.css$/, ''))).join(', ')} in ${code('data-themes')} (the ${code('T')} key cycles them). Your deck uses exactly one.`);
  L.push('- **Navigation, built in:** ← → / Space / PageUp / PageDown / Home / End, swipe on touch screens, `F` fullscreen, `O` overview, `N` notes drawer, `S` presenter window, `#/N` deep link. Do not replace or remove them.');

  return `# Build a slide deck in the ${name} style

You are a coding agent. The user wants a presentation built as a single self-contained HTML file from the **${name}** example deck. Everything you need is in the pack ${code(slug + '/')}. Follow the steps below in order. Always reply to the user in the language they write to you in.

**Which instructions win.** This deck comes from an agent skill whose own ${code('SKILL.md')} and guides are part of the pack. Follow them for the design: slide types, class names, tokens, animation, speaker notes, quality rules. Where they conflict with this prompt on the points listed in section 4 (single file, network requests, images, tooling that is not in the pack), this prompt wins.

## 0. Locate the pack

${ctx.zipUrl ? locateDownloadEn(slug, zip, ctx.zipUrl, 'SKILL.md', dir + '/index.html', cjkExcEn(ctx)) : locateLocalEn(slug, zip, 'SKILL.md', dir + '/index.html')}

All paths below are relative to the ${code(slug + '/')} folder. The pack keeps the author's folder layout, so the deck's relative links (${code('../../../assets/…')}) resolve as they are. Do not modify the pack's files; write your files as new files.

## 1. What is in the pack

${filesSkillDeck(ctx, false)}

## 2. The design at a glance

This summary keeps the essentials in view; it does not replace ${code('SKILL.md')} and the deck's own files.

${L.join('\n')}

## 3. Workflow

1. **Ask before building.** In one message (the style is already decided by this deck; skip the question about themes and starting points) ask the user:
   1. Purpose and audience: what is the deck for, and who will see it?
   2. Length: roughly how many slides or how many minutes?
   3. Content: ask them to paste or point to their material (notes, outline, document, data), or to confirm that you should draft it from a topic. Also ask for the language of the deck, the speaker name, date, organisation and any link for the closing slide; leave out whatever they don't give you, never invent it.
   4. Density: few large blocks per slide, or a dense, document-like deck?
   5. Images and logo: only files the user supplies are used. Ask whether they have any (see section 4).
   6. Hard constraints: anything that must or must not appear.${hasNotesDoc ? ' If they want to present live, ask for the timing so the speaker script can be planned.' : ''}

   Skip any question the user has already answered. Then stop and wait for the reply.
2. **Read** ${readOrder} completely, in this order, then ${code(ctx.htmlName)} and ${stylePath ? code(stylePath) : 'the deck stylesheet'} down to the last line. The example deck's markup and its stylesheet are the only source of class names.
3. **Plan.** Map the user's content onto the slide types the example deck already has (cover, section, content, data, code, closing, …); one line per slide with the slide type you will reuse. If the user gave only facts or notes, or you drafted the content yourself, show the plan and wait for approval; if they supplied a ready slide-by-slide structure, follow it.
4. **Build the deck file.** Copy ${code(ctx.htmlName)} to ${code(dir + '/work.html')} (never overwrite ${code('index.html')}) and replace its slides with yours, reusing the example slides' markup and classes. Keep the ${code('<link>')} and ${code('<script>')} lines as they are for now, so you can open ${code(dir + '/work.html')} in a browser while you work.
5. **Make it one file.** Write a small Node or Python script (not by hand) that reads ${code(dir + '/work.html')} and writes ${code('<short-deck-name>.html')} into the pack folder, with every local stylesheet and script inlined in its original position, as described in section 4. Run it again after every change to the work file.
6. **Self-check** (section 6), fix what you find, then open the deck and report.

## 4. Output requirements

- **One self-contained file.** The final ${code('<short-deck-name>.html')} has no local file references and no external requests. In the work file's order:
  - each ${code('<link rel="stylesheet" href="…">')} to a local file (${ctx.assets.filter((a) => /\.css$/.test(a) && assetRole(a) !== 'fonts').map((a) => code(baseName(a))).join(', ')}) becomes a ${code('<style>')} block with that file's text, unmodified;
  - ${code('fonts.css')} is not inlined; the fonts come from “Fonts” below;
  - the ${code('<script src="…runtime.js">')} becomes an inline ${code('<script>')} with the file's text, unmodified (write ${code('<\\/script')} for any ${code('</script')} inside the code);${themes.length ? `
  - **Theme:** the example deck links one theme with ${code('<link id="theme-link">')} and lists alternatives in ${code('data-themes')} for the ${code('T')} key, which loads theme files by URL. A single file cannot do that: inline the one theme the user chose (default: the linked one) as a ${code('<style>')} block in the same position, remove ${code('data-themes')}, and leave out the key hint for ${code('T')}.` : ''}
- **Fixed canvas.** Keep the structure (${code('.deck')} containing ${code('.slide')} elements) and let the runtime scale it. Do not set ${code('data-fit')}, do not convert units to ${code('vw')} / ${code('vh')}, do not add a second scaler.
- **Fonts.** Never link Google Fonts for the Latin families and never reference files in ${code('fonts/')} from the deck: it must stay one file that works offline.
  - Latin: ${code('fonts/fonts.css')} holds ready-made ${code('@font-face')} rules for exactly the families and weights this deck uses (each split by ${code('unicode-range')} into latin and latin-ext). Copy the rules for the weights and styles your deck actually uses into a ${code('<style>')} block (in the position of the removed ${code('fonts.css')} link), with each ${code('url(...)')} replaced by a base64 data URI (${code('data:font/woff2;base64,…')}); let the script do it. Embed both the latin and the latin-ext rules for every face you use. Keep the family names, ${code('font-display')} and ${code('unicode-range')} unchanged. A variable font file covers all its weights: embed it once.
  - Deck without CJK text: no font request at all.
  - Deck with Chinese, Japanese or Korean text: add Google Fonts ${code('<link>')} tags for the CJK families only${cjkLinks ? `: ${cjkLinks}` : ''}.${cjkExtraEn(ctx)}
  - Keep the deck's own font variables and stacks (the Latin family is already listed before the CJK family). Where uppercase or wide-tracked styles meet CJK text, set ${code('letter-spacing: 0')} and ${code('text-transform: none')} on the CJK runs.
- **No other network requests:** no CDNs, remote scripts, remote images or analytics, apart from the CJK font links above. Draw charts, icons and diagrams with inline SVG or CSS.
- **Images and logo:** only files the user supplies, embedded as data URIs, downscaled to about twice their displayed size (JPEG or WebP; keep the deck under roughly 8 MB). A logo is declared with ${code('data-logo')} on ${code('<body>')} as the author's guide describes, with a data URI as its value. The author's demo images, image layouts and the ${code('assets/demo-images/')} folder are not part of this pack. A slide that needs an image but has none: use a text or graphic layout of the example deck, or build the graphic from CSS or inline SVG; never leave a placeholder.
- **Not in this pack:** the author's scripts (${code('new-deck.sh')}, ${code('render.sh')}, ${code('verify-output')}), the ${code('templates/single-page/')} layouts, the other example decks, the theme library (apart from the themes listed above), the canvas FX scripts and the showcase pages. Where ${code('SKILL.md')} tells you to start from a single-page layout or to run a script, start from the example deck's own slides and do the equivalent by hand (section 3, steps 4 and 5). Installing the skill (${code('npx skills add')}) is not needed. Never run or install anything from the pack.
- **Speaker notes:** notes go in ${code('<div class="notes">')} or ${code('<aside class="notes">')} inside the slide (hidden on the slide, shown by the ${code('N')} key and in the presenter window); presenter-only text never appears on the slide itself. ${hasNotesDoc ? 'This deck is built around the presenter window: keep a notes block on every slide, written from the material the user gave you in the length and style the presenter guide asks for; every note you draft goes into the list in your final reply.' : 'Add notes only if the user will present live, from material they gave you; never invent stage cues, interaction or timing they did not provide.'} Leave the presenter runtime untouched.
- **Details:** set ${code('<html lang>')} to the deck language; replace the ${code('<title>')}; give every slide a ${code('data-title')} (the overview uses it); keep each ${code('.slide-number')} element's ${code('data-current')} and ${code('data-total')} correct for its slide and the final slide count (the runtime only updates the first one); replace every piece of the example's content: texts, names, handles, e-mail addresses, URLs, dates and numbers. Hints in the deck's chrome that name keys which no longer work (for example ${code('T')} when you removed ${code('data-themes')}) must go. At the top of ${code('<head>')} add this comment, which is a license notice and not slide content: ${code(credit(ctx))}

## 5. Hard constraints

- **Keep the style.** Only this deck's classes, CSS variables, palette and fonts. Colors outside the palette are not allowed. Never mix this deck with another deck, preset or presentation style. The skill's rule applies: tokens instead of literal colors in anything you write yourself (the deck's own stylesheet is the exception, it stays as shipped).
- **Missing slide type? Build it from the deck's own classes and components**, in the same system. Don't switch styles or drop the content.
- **Real content, drafted when missing.** Use the user's material. Never reuse the example texts, numbers, names or logos. When the user names a topic but gives no content, draft it yourself; never put placeholders such as "TBD" or "Lorem ipsum" on a slide. Keep drafts plausible and modest. Every drafted item (including any example quote, name or number you made up) must be listed in your final reply (section 6).
- **Only real links and codes.** QR codes, links, URLs and e-mail addresses only when the user gave a real one; otherwise omit them.
- **Numbers must agree:** section numbers, step numbers and labels on slides must match the slide's page number and the page counter. Section ordinals (such as “Section 03”) are fine; any reference to a page number must equal the footer page number.
- **No internal labels on slides.** Never show the deck or template name (${name} / ${slug}), the author's name or handle, the words "template", "preview" or "html-ppt", file names, paths or notes about the user's requirements. Visible chrome is real deck content only.
- **The user's density choice wins**: fewer, larger blocks for low density. If content does not fit, split it across more slides; never shrink text below the sizes the example deck uses for the same role and never let it overflow or clip.
- **Keep emphasis legible:** text on an accent fill uses the accent-ink variable; accent colors need contrast with the surface they sit on; never put accent on accent.
- **CJK text (Chinese, Japanese, Korean):** letter-spacing 0 and no uppercase on CJK runs; use the deck's CJK font family and line-heights; full-width punctuation and a space between CJK and Latin text; no one-character last lines (${code('text-wrap: pretty')} / ${code('balance')}, ${code('line-break: strict')}; don't limit widths in ${code('ch')} units).

## 6. Self-check, then deliver

1. Render ${code('<short-deck-name>.html')} (the final single file, not the work file) in a real browser (Playwright, Puppeteer or headless Chrome, whatever is available) at **1920×1080** and **1280×720**, and once at a phone size (**390×844**, where the stage must be scaled down and letterboxed, never reflowed). Screenshot every slide (advance with →; wait about 1 second per slide so the entrance animation has finished).
2. On every slide, check:
   - no text overflows or is clipped; nothing is cut off at the stage edge;
   - no panel overlaps or covers another, and the slide number, footer and progress bar do not collide with content (look at the screenshots; a ${code('scrollHeight')} check misses this);
   - emphasis is legible (accent-ink on accent fills, no accent on accent);
   - in CJK text, no line ends with a single character or a lone punctuation mark;
   - the intended fonts loaded, Latin and CJK (no fallback). ${code('document.fonts.check()')} is not proof: wait for ${code('document.fonts.ready')} and confirm each expected face appears in ${code('document.fonts')} with status ${code('"loaded"')}, or compare rendered text widths against a fallback font. If a font request fails with a network error, retry or reload before concluding anything;
   - no leftover example content or placeholders (search the file for the example's texts, names, handles and URLs), no console errors (offline, the failed Google Fonts request and its console error are expected and fine when the fonts are embedded), and no network requests at all (or, for CJK text, only the Google Fonts request).
3. Also check: the slide count equals the number of ${code('.slide')} elements; the page counter and every ${code('.slide-number')} agree with it; ${code('O')} opens an overview that shows all slides; ← and → reach the first and last slide.
4. Fix and re-check until clean. If you cannot render in a browser, say so plainly and review the code by hand; don't claim the check passed.
5. Reread the deck as the audience would and fix any statement the deck itself contradicts.
6. Open the deck in the user's default browser:
   - macOS: ${code('open "<file>.html"')}
   - Linux: ${code('xdg-open "<file>.html"')}
   - Windows: ${code('start "" "<file>.html"')} in cmd, or ${code('Start-Process "<file>.html"')} in PowerShell

   If the command is not available or there is no display, skip this step and give the user the file's absolute path.
7. Report the file's full path, the slide count, how to navigate (including ${code('F')}, ${code('O')} and ${code('S')}), every item you drafted (slide number and text), every deviation from the author's documents (and why), and open questions. Mention that the pack's ${code(licenseFileOf(ctx))} stays with the deck. For later changes, edit the work file, rebuild the final file with your script, keep every constraint above, and run the self-check again.
`;
}

export function promptSkillDeckZh(ctx) {
  const { slug, name } = ctx;
  const zip = `${slug}.zip`;
  const dir = ctx.deckDir;
  const themes = ctx.assets.filter((a) => assetRole(a) === 'theme');
  const hasNotesDoc = ctx.docs.some((d) => d.path.endsWith('presenter-mode.md'));
  const cjkLinks = ctx.cjkFontLinks.map(linkTag).join(' / ');
  const readOrder = ctx.docs.map((d) => code(d.path)).join('、');
  const stylePath = ctx.assets.find((a) => assetRole(a) === 'style');
  const zhTags = (zhArr, arr) => (zhArr && zhArr.every(Boolean) ? zhArr.join('、') : arr.join(', '));
  const zhScheme = { light: '浅色', dark: '深色', mixed: '混合' }[ctx.scheme] ?? ctx.scheme;
  const L = [];
  if (ctx.zh?.description) L.push(`- **风格特征**：${ctx.zh.description}`);
  else if (ctx.description) L.push(`- **风格特征**（原文）：${ctx.description}`);
  L.push(`- **情绪 / 语气**：${zhTags(ctx.zh?.mood, ctx.mood)} / ${zhTags(ctx.zh?.tone, ctx.tone)}。配色方案：${zhScheme}。`);
  const pn = ctx.zh?.palette_description ?? ctx.paletteNote;
  L.push('- **配色**（这套幻灯片自己的 CSS 变量；只用这些色值，不用其他颜色）：');
  for (const c of ctx.colors) L.push(`  - ${code(c.name)} ${c.value}`);
  if (pn) L.push(`  - 用法：${pn}。`);
  if (ctx.typography.length) {
    const style = ctx.zh?.typography_style ? `（${ctx.zh.typography_style}）` : ctx.typographyStyle ? `（原文：${ctx.typographyStyle}）` : '';
    L.push(`- **字体**：${ctx.typography.map((x) => `${x.role} ${x.family}`).join('；')}${style}。`);
  }
  L.push(`- **画布**：固定 1920×1080 的舞台，由 ${code(baseName(ctx.assets.find((a) => assetRole(a) === 'runtime') ?? 'runtime.js'))} 缩放到窗口大小（加边，绝不重排），所以同一个像素值在任何屏幕上含义都相同。`);
  if (themes.length) L.push(`- **主题**：示例幻灯片在 ${code('data-themes')} 中列出 ${themes.map((a) => code(baseName(a).replace(/\.css$/, ''))).join('、')}（${code('T')} 键循环切换）。你的幻灯片只用其中一套。`);
  L.push('- **内置翻页与操作**：← → / 空格 / PageUp / PageDown / Home / End，触屏滑动，`F` 全屏，`O` 总览，`N` 备注抽屉，`S` 演讲者窗口，`#/N` 深链接。不要替换或删除它们。');

  return `# 用 ${name} 风格制作幻灯片

你是一个 coding agent。用户希望以 **${name}** 示例幻灯片为基础制作一份演示文稿，产出为单个自包含的 HTML 文件。所需素材都在素材包 ${code(slug + '/')} 中。请按以下步骤依次执行。始终用用户与你对话时使用的语言回复用户。

**以谁为准。** 这套幻灯片来自一个 agent skill，该 skill 自己的 ${code('SKILL.md')} 和指南就在素材包里。设计方面（页面类型、类名、token、动效、演讲备注、质量规则）以它们为准。第 4 节列出的几点（单文件、网络请求、图片、素材包里没有的工具）如果与它们冲突，以本提示词为准。

## 0. 找到素材包

${ctx.zipUrl ? locateDownloadZh(slug, zip, ctx.zipUrl, 'SKILL.md', dir + '/index.html', cjkExcZh(ctx)) : locateLocalZh(slug, zip, 'SKILL.md', dir + '/index.html')}

下文所有路径都相对于 ${code(slug + '/')} 文件夹。素材包保留了作者的文件夹结构，所以幻灯片里的相对链接（${code('../../../assets/…')}）原样可用。不要修改素材包里的文件；你写的文件都作为新文件创建。

## 1. 素材包里有什么

${filesSkillDeck(ctx, true)}

## 2. 设计速览

这份摘要用于时刻记住要点，不能代替 ${code('SKILL.md')} 和这套幻灯片自己的文件。

${L.join('\n')}

## 3. 工作流程

1. **先问再做。**（风格已由这套幻灯片确定，跳过关于主题和起点的问题。）用一条消息向用户提问：
   1. 用途与受众：这份幻灯片做什么用，给谁看？
   2. 篇幅：大约多少页，或多少分钟？
   3. 内容：请用户粘贴或指明素材（笔记、提纲、文档、数据），或确认由你根据主题起草。同时询问幻灯片使用的语言、演讲者姓名、日期、机构，以及结尾页的链接；用户没提供的就省略，绝不编造。
   4. 密度：每页少量大块内容，还是密集的文档式？
   5. 图片与徽标：只使用用户提供的文件。询问是否有（见第 4 节）。
   6. 硬性约束：必须出现或不能出现的内容。${hasNotesDoc ? '如果要现场演讲，询问时长，以便规划逐字稿。' : ''}

   用户已经回答过的问题就跳过。问完后停下，等待回复。
2. **完整阅读** ${readOrder}（按此顺序），再读 ${code(ctx.htmlName)} 和 ${stylePath ? code(stylePath) : '这套幻灯片的样式表'} 直到最后一行。示例幻灯片的标记和样式表是类名的唯一来源。
3. **规划。** 把用户的内容映射到示例幻灯片已有的页面类型上（封面、章节、正文、数据、代码、结尾……）；每页一行，写明你要复用的页面类型。如果用户只提供了事实或笔记，或者内容是你起草的，先把规划给用户看并等待确认；如果用户已经给出逐页结构，按其结构直接继续。
4. **生成工作文件。** 把 ${code(ctx.htmlName)} 复制为 ${code(dir + '/work.html')}（不要覆盖 ${code('index.html')}），把其中的页面换成你的，复用示例页面的标记和类名。暂时保持 ${code('<link>')} 和 ${code('<script>')} 行不变，这样你在制作过程中可以直接在浏览器里打开 ${code(dir + '/work.html')}。
5. **合成单个文件。** 写一个小的 Node 或 Python 脚本（不要手工处理），读取 ${code(dir + '/work.html')}，把 ${code('<简短的幻灯片名>.html')} 写到素材包文件夹里，按第 4 节的说明把每个本地样式表和脚本内联在原来的位置。每次修改工作文件后都重新运行它。
6. **自检**（第 6 节），修正发现的问题，然后打开幻灯片并汇报。

## 4. 产出要求

- **单个自包含文件。** 最终的 ${code('<简短的幻灯片名>.html')} 没有本地文件引用，也没有外部请求。按工作文件中的顺序：
  - 每个指向本地文件的 ${code('<link rel="stylesheet" href="…">')}（${ctx.assets.filter((a) => /\.css$/.test(a) && assetRole(a) !== 'fonts').map((a) => code(baseName(a))).join('、')}）换成一个 ${code('<style>')} 块，内容是该文件的原文；
  - ${code('fonts.css')} 不内联；字体按下面的“字体”处理；
  - ${code('<script src="…runtime.js">')} 换成内联的 ${code('<script>')}，内容是该文件的原文（代码中出现的 ${code('</script')} 写成 ${code('<\\/script')}）；${themes.length ? `
  - **主题：** 示例幻灯片用 ${code('<link id="theme-link">')} 引入一套主题，并在 ${code('data-themes')} 中列出备选，让 ${code('T')} 键按 URL 加载主题文件。单个文件做不到这一点：把用户选定的那一套主题（默认是被链接的那套）以 ${code('<style>')} 块内联在同一位置，删除 ${code('data-themes')}，并去掉关于 ${code('T')} 键的提示。` : ''}
- **固定画布。** 保持结构（${code('.deck')} 里放 ${code('.slide')} 元素），让运行时缩放。不要设置 ${code('data-fit')}，不要把单位换成 ${code('vw')} / ${code('vh')}，不要再加第二个缩放脚本。
- **字体。** 不要为拉丁字体链接 Google Fonts，也不要在幻灯片里引用 ${code('fonts/')} 中的文件：它必须保持为单个、可离线使用的文件。
  - 拉丁字体：${code('fonts/fonts.css')} 里是恰好覆盖本幻灯片所用字体族和字重的现成 ${code('@font-face')} 规则（按 ${code('unicode-range')} 拆成 latin 与 latin-ext）。把幻灯片实际用到的字重和字形对应的规则复制进一个 ${code('<style>')} 块（放在被移除的 ${code('fonts.css')} 链接原来的位置），并把每个 ${code('url(...)')} 换成 base64 data URI（${code('data:font/woff2;base64,…')}）；让脚本来做。每个用到的字体都要同时嵌入 latin 与 latin-ext 两组规则。字体族名、${code('font-display')} 和 ${code('unicode-range')} 保持不变。可变字体文件已覆盖所有字重，只嵌入一次。
  - 幻灯片不含 CJK 文字：完全不发起字体请求。
  - 幻灯片含中文、日文或韩文：只为 CJK 字体族添加 Google Fonts ${code('<link>')}${cjkLinks ? `：${cjkLinks}` : ''}。${cjkExtraZh(ctx)}
  - 保留这套幻灯片自带的字体变量和字体栈（拉丁字体已排在 CJK 字体之前）。大写或加宽字距的样式遇到 CJK 文字时，对 CJK 文字设 ${code('letter-spacing: 0')} 和 ${code('text-transform: none')}。
- **不发起其他网络请求**：除上面的 CJK 字体链接外，不用 CDN、远程脚本、远程图片或统计代码。图表、图标和示意图用内联 SVG 或 CSS 绘制。
- **图片与徽标：** 只使用用户提供的文件，以 data URI 嵌入，缩小到约为显示尺寸的两倍（JPEG 或 WebP；整份文件控制在约 8 MB 内）。徽标按作者指南的方式在 ${code('<body>')} 上用 ${code('data-logo')} 声明，值为 data URI。作者的演示图片、图片版式和 ${code('assets/demo-images/')} 文件夹不在本素材包里。需要图片但没有图片的页面：改用示例幻灯片里的文字或图形版式，或用 CSS / 内联 SVG 做图形；绝不留占位符。
- **本素材包里没有的内容：** 作者的脚本（${code('new-deck.sh')}、${code('render.sh')}、${code('verify-output')}）、${code('templates/single-page/')} 版式、其他示例幻灯片、主题库（上面列出的主题除外）、canvas 特效脚本和展示页面。${code('SKILL.md')} 里要求你从单页版式开始或运行脚本的地方，改为从示例幻灯片自己的页面开始，并手工完成同样的事（第 3 节第 4、5 步）。不需要安装这个 skill（${code('npx skills add')}）。绝不运行或安装素材包里的任何内容。
- **演讲备注：** 备注写在页面内的 ${code('<div class="notes">')} 或 ${code('<aside class="notes">')} 里（页面上隐藏，由 ${code('N')} 键和演讲者窗口显示）；仅供演讲者看的文字绝不出现在页面上。${hasNotesDoc ? '这套幻灯片就是围绕演讲者窗口设计的：每一页都保留一个备注块，根据用户给你的素材，按演讲指南要求的篇幅和风格来写；你起草的每一条备注都要列进最终回复的清单。' : '只有用户要现场演讲时，才根据用户给你的素材添加备注；绝不编造用户没有提供的舞台提示、互动或时间安排。'}不要改动演讲者运行时。
- **细节：** ${code('<html lang>')} 设为幻灯片语言；替换 ${code('<title>')}；给每一页加 ${code('data-title')}（总览会用到）；让每个 ${code('.slide-number')} 元素的 ${code('data-current')} 和 ${code('data-total')} 与它所在的页和最终页数一致（运行时只会更新第一个）；替换示例里的全部内容：文字、人名、账号、邮箱、网址、日期和数字。幻灯片页面框架里提到已失效按键的提示（例如删除 ${code('data-themes')} 之后的 ${code('T')}）要去掉。在 ${code('<head>')} 最上方加入这条注释，它是许可证声明，不是页面内容：${code(credit(ctx))}

## 5. 硬性约束

- **保持风格。** 只用这套幻灯片自带的类、CSS 变量、配色和字体。不允许使用配色以外的颜色。绝不把它与其他幻灯片、预设或通用演示风格混用。适用 skill 的规则：你自己写的内容用 token 而不是字面色值（这套幻灯片自己的样式表是例外，保持原样）。
- **缺少某种页面类型？用这套幻灯片自带的类和组件在同一系统内搭建**，不要换风格，也不要删掉内容。
- **内容真实；缺失时自行起草。** 使用用户的素材。绝不复用示例里的文字、数字、人名或标志。用户只给了主题而没给内容时，由你自己起草；页面上绝不放“待补充”或 "Lorem ipsum" 之类的占位符。起草的内容要合理、克制。每一条起草的内容（包括你编造的示例引语、人名或数字）都必须列在最终回复里（第 6 节）。
- **只用真实的链接和码。** 二维码、链接、网址、邮箱只有在用户提供了真实内容时才使用；否则省略。
- **编号必须一致**：页面上显示的章节编号、步骤编号和标签必须与该页的页码和页码计数一致。
- **页面上不出现内部标签。** 绝不显示这套幻灯片或模板的名字（${name} / ${slug}）、作者的名字或账号、"template"/"模板"、"preview"/"预览"或 "html-ppt" 字样、文件名、路径，或关于用户需求的备注。页面上可见的框架文字只能是真实内容。
- **以用户选择的密度为准**：低密度用更少、更大的内容块。内容放不下就拆成更多页；字号不得小于示例幻灯片里同类角色所用的字号，也绝不允许溢出或被裁切。
- **强调必须清晰可读**：强调色填充上的文字用 accent-ink 变量；强调色必须与所在表面形成对比，绝不在强调色上叠强调色。
- **CJK 文字（中文、日文、韩文）**：CJK 文字字间距为 0、不用大写转换；使用这套幻灯片的 CJK 字体族和行高；使用全角标点，CJK 与拉丁文字之间加空格；不要出现只剩一个字的末行（${code('text-wrap: pretty')} / ${code('balance')}，${code('line-break: strict')}；不要用 ${code('ch')} 单位限制宽度）。

## 6. 自检，然后交付

1. 在真实浏览器中渲染 ${code('<简短的幻灯片名>.html')}（最终的单个文件，不是工作文件）（Playwright、Puppeteer 或 headless Chrome，有什么用什么），视口分别为 **1920×1080** 和 **1280×720**，并再用一次手机尺寸（**390×844**，舞台必须整体缩小并加边，绝不重排）。为每一页截图（按 → 翻页；每页等待约 1 秒，让入场动画结束）。
2. 逐页检查：
   - 没有文字溢出或被裁切；没有东西在舞台边缘被截断；
   - 没有面板相互重叠或遮挡，页码、页脚和进度条没有与内容冲突（要看截图，只查 ${code('scrollHeight')} 发现不了这个问题）；
   - 强调清晰可读（强调色填充上用 accent-ink，没有强调色叠强调色）；
   - CJK 文字中没有以单个字或孤立标点结尾的行；
   - 目标字体已加载，包括拉丁字体和 CJK 字体（不是回退字体）。${code('document.fonts.check()')} 不能作为证据：应等待 ${code('document.fonts.ready')}，再确认每个预期字体都出现在 ${code('document.fonts')} 中且状态为 ${code('"loaded"')}，或者把渲染出的文字宽度与回退字体对比。如果字体请求因网络错误失败，先重试或重新加载再下结论；
   - 没有残留的示例内容或占位符（在文件中搜索示例里的文字、人名、账号和网址），控制台无报错（离线时 Google Fonts 请求失败及其报错属预期，字体已嵌入就没问题），完全没有网络请求（含 CJK 文字时只允许 Google Fonts 请求）。
3. 另外检查：页数等于 ${code('.slide')} 元素的数量；页码计数和每个 ${code('.slide-number')} 都与之一致；${code('O')} 能打开显示全部页面的总览；← 和 → 能到达第一页和最后一页。
4. 修正后重新检查，直到全部通过。如果无法在浏览器中渲染，要明确说明，并人工审查代码；不要声称检查已通过。
5. 以观众的视角通读整份幻灯片，修正幻灯片自身互相矛盾的表述。
6. 在用户的默认浏览器中打开幻灯片：
   - macOS：${code('open "<file>.html"')}
   - Linux：${code('xdg-open "<file>.html"')}
   - Windows：cmd 中用 ${code('start "" "<file>.html"')}，PowerShell 中用 ${code('Start-Process "<file>.html"')}

   如果该命令不可用，或者没有图形界面，跳过这一步，直接把文件的绝对路径告诉用户。
7. 汇报文件的完整路径、页数、翻页方式（包括 ${code('F')}、${code('O')} 和 ${code('S')}），你起草的每一条内容（页码和文字）、你对作者文档的每一处偏离（以及原因），以及待确认的问题。说明素材包里的 ${code(licenseFileOf(ctx))} 要与幻灯片放在一起。之后修改时，编辑工作文件，用你的脚本重新生成最终文件，遵守以上全部约束，并重新自检。
`;
}

// ---------------------------------------------------------------------------
// README.md inside the zip
// ---------------------------------------------------------------------------

// credits: [{what, author, project, license, licenseFile, url}]
export function packReadme(ctx, credits, siteName) {
  const lines = credits.map((c) =>
    `- ${c.what}: by ${c.author}, from ${c.url ? `[${c.project}](${c.url})` : c.project} (${c.license}${c.licenseFile ? `; see ${c.licenseFile.split(', ').map(code).join(', ')}` : ''}).`);
  const notice = licenseNoticeEn(ctx);
  const noticeZh = licenseNoticeZh(ctx);
  // Private (internal) templates: no open license is claimed anywhere.
  const internal = ctx.internal
    ? `\n> **Internal use only.** This template belongs to ${ctx.internal.name}; do not distribute this pack outside it.\n>\n> **仅限内部使用。** ${zhText`本模板属于${ctx.internal.nameZh}，请勿将素材包外传。`}\n`
    : '';
  return `# ${ctx.name}: slide template pack

${ctx.tagline}
${internal}${notice ? `\n${notice}\n\n${noticeZh}\n` : ''}
## How to use

1. Unzip this archive. It creates a folder named ${code(ctx.slug + '/')}.
2. Open your coding agent (Claude Code, Codex, Cursor, …) in that folder or in the folder that contains it.
3. Paste the contents of ${code('PROMPT.md')} into the agent and answer its questions. It builds a single HTML deck in this style.
${ctx.zipUrl ? `\nThis pack can also be downloaded from ${ctx.zipUrl}.\n` : ''}
中文：解压后在该文件夹（或其上一级）打开你的 coding agent，把 ${code('PROMPT.zh.md')} 的内容粘贴给它，回答它的问题即可。

## Credits

${lines.join('\n')}
- ${code('PROMPT.md')}, ${code('PROMPT.zh.md')} and this README: written by ${siteName}.

${ctx.packClosing ?? `The template and design files are unmodified copies of the originals. ${siteName} is an independent community gallery that repackages openly licensed templates; it is not affiliated with or endorsed by the original authors.`}
`;
}

// Private (internal) templates: one line under the prompt's title, so the agent does not publish or
// redistribute the result outside the organisation. (Page prompt and PROMPT.md are the same text.)
function withInternalLine(text, line) {
  const i = text.indexOf('\n');
  return i < 0 ? text : `${text.slice(0, i)}\n\n${line}${text.slice(i)}`;
}
export function promptEn(ctx) {
  const t = promptEnBase(ctx);
  return ctx.internal ? withInternalLine(t, `> **Internal use only.** This template belongs to ${ctx.internal.name}; its terms are in ${code(licenseFileOf(ctx))}. Do not publish or redistribute the deck, the pack or its design outside ${ctx.internal.name}.`) : t;
}
export function promptZh(ctx) {
  const t = promptZhBase(ctx);
  return ctx.internal ? withInternalLine(t, zhText`> **仅限内部使用。** 本模板属于${ctx.internal.nameZh}，使用条款见 ${code(licenseFileOf(ctx))}。请勿把幻灯片、素材包或其设计发布或传播到${ctx.internal.nameZh}之外。`) : t;
}
