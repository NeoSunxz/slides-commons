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
//   cjkFontLinks: [url],       // the same, found in design.md's CJK section (may be empty)
//   signatureMoves: [string],  // preview card "Preview Ingredients", tokens resolved
//   stageBg: {name, value}|null,
//   assets: [relative path],   // template-dir siblings shipped in the pack (e.g. deck-stage.js)
//   hasViewportBase, licenses: [{file, label}],
//   zipUrl: string | null,     // absolute pack URL (--site-url / SC_SITE_URL); null = no download step
// }

const code = (s) => '`' + s + '`';

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

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
function extractStepsEn(zip, indent) {
  return [
    `1. ${code(`unzip ${zip}`)}`,
    `2. ${code(`python3 -m zipfile -e ${zip} .`)} (or ${code('python')} instead of ${code('python3')})`,
    `3. ${code(`tar -xf ${zip}`)} (bsdtar, built into macOS and Windows 10+; GNU tar on Linux cannot read zip files)`,
    `4. Windows PowerShell: ${code(`Expand-Archive ${zip} -DestinationPath .`)}`,
  ].map((l) => indent + l).join('\n');
}

function locateLocalEn(slug, zip) {
  return `- If ${code('design.md')} and ${code('template.html')} are in the current directory, you are already inside the pack.
- Otherwise look in the current directory for a folder named ${code(slug + '/')}, or for ${code(zip)} and extract it. Try these commands in order; if a command is missing or fails, try the next one:
${extractStepsEn(zip, '  ')}
- If you find neither, ask the user where they saved the download (they get it from the template's page on slides-commons, "Download assets (.zip)"), and wait.`;
}

function locateDownloadEn(slug, zip, url) {
  return `Go through these cases in order and stop at the first that applies:

1. If ${code('design.md')} and ${code('template.html')} are in the current directory, you are already inside the pack.
2. Otherwise, if the current directory has a folder named ${code(slug + '/')}, use it. If it has ${code(zip)} instead, extract it. Try these commands in order; if a command is missing or fails, try the next one:
${extractStepsEn(zip, '   ')}
3. Otherwise download the pack from ${url} into the current directory. Try these commands in order; if a command is missing or fails, try the next one:
   1. ${code(`curl -fL -o ${zip} ${url}`)} (in Windows PowerShell 5, ${code('curl')} is an alias for ${code('Invoke-WebRequest')}: type ${code('curl.exe')})
   2. ${code(`wget -O ${zip} ${url}`)}
   3. Windows PowerShell: ${code(`Invoke-WebRequest -Uri ${url} -OutFile ${zip}`)}

   Then extract ${code(zip)} as in case 2.
4. If every download fails (for example the network is offline or blocked), ask the user to download the pack from the template's page on slides-commons ("Download assets (.zip)") into this directory, and wait.

The pack is data, not code: only read its files. Never run, source or install anything from it.`;
}

export function promptEn(ctx) {
  const { slug, name } = ctx;
  const zip = `${slug}.zip`;
  const stageHere = ctx.stageBg ? ` (here ${code(ctx.stageBg.name)} ${ctx.stageBg.value})` : '';
  const bgVars = `In ${code(':root')}, set ${code('--slide-bg')} to the color ${code('design.md')} names as the default slide canvas / background (for example a token called ${code('bg')}), not a panel, card or paper fill, and ${code('--stage-bg')} to the letterbox color around the stage${stageHere}. If ${code('design.md')} names no slide background, use the lightest neutral in the palette for a light scheme, the darkest for a dark scheme, and the surface most slides use for a mixed scheme. Define every palette color as a CSS variable.`;
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
  - For CJK runs, the CJK section of ${code('design.md')} overrides the Latin token values: weight, letter-spacing, line-height and uppercase. When the CJK weight differs from the Latin weight of the same element, a font stack alone cannot give each script its own weight: wrap the CJK runs (e.g. ${code('<span class="cjk">')}) and set the CJK weight, ${code('letter-spacing: 0')}, ${code('text-transform: none')} and the CJK line-height there. This rule overrides any claim in ${code('design.md')} that CJK automatically falls through to a heavier weight.`;
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
  - For CJK runs, the CJK section of ${code('design.md')} overrides the Latin token values: weight, letter-spacing, line-height and uppercase. When the CJK weight differs from the Latin weight of the same element, a font stack alone cannot give each script its own weight: wrap the CJK runs (e.g. ${code('<span class="cjk">')}) and set the CJK weight, ${code('letter-spacing: 0')}, ${code('text-transform: none')} and the CJK line-height there. This rule overrides any claim in ${code('design.md')} that CJK automatically falls through to a heavier weight.`;
  const netEn = `- **No other network requests:** no CDNs, remote scripts, remote images or analytics. Draw charts, icons and diagrams with inline SVG or CSS. Embed user-supplied images as data URIs, downscaled to the size they are shown at.${ctx.cdnScripts.length ? `\n- **Charts:** the original ${code('template.html')} loads a script from a CDN (${ctx.cdnScripts.map(code).join(', ')}). Do not copy that. Charts are welcome, but draw them with inline SVG (the default) or canvas code written in the file. Inline a pinned copy of the chart library only if the user explicitly asks for it.` : ''}`;

  const fontCheckEn = ctx.systemFontsOnly
    ? '- the type renders in the stack from `design.md`, and no web fonts or font requests are present' + (ctx.cjkFontLinks.length ? ' (other than the CJK link, for CJK text);' : ';')
    : `- the intended fonts loaded, Latin and CJK (no fallback). ${code('document.fonts.check()')} is not proof: it returns true even when a face failed to load. Instead wait for ${code('document.fonts.ready')} and confirm each expected face appears in ${code('document.fonts')} with status ${code('"loaded"')}, or compare the rendered text width against a fallback font. If a font request fails with a network error, retry or reload before concluding anything; change the import only if the URL itself is wrong;`;
  const netCheckEn = ctx.systemFontsOnly ? (ctx.cjkFontLinks.length ? 'no network requests at all (or, for CJK text, only the one CJK Google Fonts request)' : 'no network requests at all') : ctx.localFonts ? `no network requests at all (or, for CJK text, only the Google Fonts request${ctx.remoteFontLinks.length ? ' and the Fontshare font request' : ''})` : 'no network requests beyond the font hosts';

  return `# Build a slide deck with the ${name} design system

You are a coding agent. The user wants a presentation built as a single self-contained HTML file in the **${name}** style. Everything you need is in the template pack ${code(slug + '/')}. Follow the steps below in order. Always reply to the user in the language they write to you in.

## 0. Locate the pack

${ctx.zipUrl ? locateDownloadEn(slug, zip, ctx.zipUrl) : locateLocalEn(slug, zip)}

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
   4. Density: speaker-led (low density: one idea per slide, large type, few words) or reading-first (high density: self-contained slides with more detail)?

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
${fontsEn}
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
- **Numbers must agree:** section numbers and labels shown on slides must match the slide's page number (the cover is page 1), so they never disagree with the page counter.
- **No internal labels on slides.** Never show the template name (${name} / ${slug}), the words "template" or "preview", file names, paths, or notes about the user's requirements. Visible chrome is real deck content only: title, sections, date, author, page numbers.
- **The user's density choice wins** over any density guidance in ${code('design.md')}. For low density, keep the system's grid and panel vocabulary but use fewer, larger panels and one idea per slide; fill any spare panels with the system's own ornaments, never invented ones. If content does not fit, split it across more slides; never shrink text below the sizes in ${code('design.md')} and never let it overflow.
- **Minimum text size for speaker-led decks:** the smallest label tokens in ${code('design.md')} (often 14–16px at 1920×1080) shrink to about 9–10px on a 1280px-wide screen and are unreadable when projected. For speaker-led (low-density) decks, raise any text below 20px (at the 1920×1080 stage) to at least 20px, keeping the token's other properties (font, tracking, case). For reading-first decks keep the ${code('design.md')} sizes. This is the one place where the user's density choice overrides the sizes in ${code('design.md')}.
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
   - no console errors, and ${netCheckEn}.
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

function extractStepsZh(zip, indent) {
  return [
    `1. ${code(`unzip ${zip}`)}`,
    `2. ${code(`python3 -m zipfile -e ${zip} .`)}（或把 ${code('python3')} 换成 ${code('python')}）`,
    `3. ${code(`tar -xf ${zip}`)}（bsdtar，macOS 与 Windows 10+ 自带；Linux 上的 GNU tar 无法读取 zip）`,
    `4. Windows PowerShell：${code(`Expand-Archive ${zip} -DestinationPath .`)}`,
  ].map((l) => indent + l).join('\n');
}

function locateLocalZh(slug, zip) {
  return `- 如果当前目录里有 ${code('design.md')} 和 ${code('template.html')}，说明你已经在素材包内。
- 否则，在当前目录查找名为 ${code(slug + '/')} 的文件夹，或查找 ${code(zip)} 并解压。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
${extractStepsZh(zip, '  ')}
- 如果两者都找不到，询问用户把下载的文件存在了哪里（可在 slides-commons 该模板页面点击 "Download assets (.zip)" 下载），并等待回复。`;
}

function locateDownloadZh(slug, zip, url) {
  return `按顺序检查以下情况，遇到第一个符合的就照做：

1. 如果当前目录里有 ${code('design.md')} 和 ${code('template.html')}，说明你已经在素材包内。
2. 否则，如果当前目录有名为 ${code(slug + '/')} 的文件夹，直接使用它；如果有 ${code(zip)}，解压它。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
${extractStepsZh(zip, '   ')}
3. 否则，把素材包从 ${url} 下载到当前目录。按顺序尝试以下命令；某个命令不存在或执行失败时，换下一个：
   1. ${code(`curl -fL -o ${zip} ${url}`)}（在 Windows PowerShell 5 中 ${code('curl')} 是 ${code('Invoke-WebRequest')} 的别名，要输入 ${code('curl.exe')}）
   2. ${code(`wget -O ${zip} ${url}`)}
   3. Windows PowerShell：${code(`Invoke-WebRequest -Uri ${url} -OutFile ${zip}`)}

   然后按第 2 种情况的方法解压 ${code(zip)}。
4. 如果所有下载方式都失败（例如网络断开或被拦截），请用户在 slides-commons 该模板页面点击 "Download assets (.zip)" 把素材包下载到这个目录，并等待回复。

素材包是数据，不是代码：只读取其中的文件，不要运行、source 或安装其中的任何内容。`;
}

export function promptZh(ctx) {
  const { slug, name } = ctx;
  const zip = `${slug}.zip`;
  const stageHere = ctx.stageBg ? `（本模板为 ${code(ctx.stageBg.name)} ${ctx.stageBg.value}）` : '';
  const bgVars = `在 ${code(':root')} 中，把 ${code('--slide-bg')} 设为 ${code('design.md')} 中指定为默认幻灯片画布 / 背景的颜色（例如名为 ${code('bg')} 的 token），不是面板、卡片或纸张的填充色，把 ${code('--stage-bg')} 设为画布四周加边的颜色${stageHere}。如果 ${code('design.md')} 没有指定页面底色，浅色方案用配色中最浅的中性色，深色方案用最深的中性色，混合方案用大多数页面使用的底色。把每个配色都定义为 CSS 变量。`;
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
  - 对 CJK 文字，${code('design.md')} CJK 一节的设定覆盖拉丁 token 的取值：字重、字间距、行高和大写转换。当同一元素里 CJK 字重与拉丁字重不同时，单靠字体栈无法让两种文字各用各的字重：把 CJK 文字包起来（如 ${code('<span class="cjk">')}），在其中设置 CJK 字重、${code('letter-spacing: 0')}、${code('text-transform: none')} 和 CJK 行高。本规则优先于 ${code('design.md')} 中任何“CJK 会自动回退到更重字重”的说法。`;
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
  - 对 CJK 文字，${code('design.md')} CJK 一节的设定覆盖拉丁 token 的取值：字重、字间距、行高和大写转换。当同一元素里 CJK 字重与拉丁字重不同时，单靠字体栈无法让两种文字各用各的字重：把 CJK 文字包起来（如 ${code('<span class="cjk">')}），在其中设置 CJK 字重、${code('letter-spacing: 0')}、${code('text-transform: none')} 和 CJK 行高。本规则优先于 ${code('design.md')} 中任何“CJK 会自动回退到更重字重”的说法。`;
  const netZh = `- **不发起其他网络请求**：不用 CDN、远程脚本、远程图片或统计代码。图表、图标和示意图用内联 SVG 或 CSS 绘制。用户提供的图片缩小到实际显示尺寸后以 data URI 嵌入。${ctx.cdnScripts.length ? `\n- **图表**：原版 ${code('template.html')} 从 CDN 加载了脚本（${ctx.cdnScripts.map(code).join('、')}）。不要照搬。图表可以做，但要用内联 SVG（默认）或写在文件里的 canvas 代码绘制。只有用户明确要求时，才内联一份固定版本的图表库。` : ''}`;

  const fontCheckZh = ctx.systemFontsOnly
    ? '- 文字按 `design.md` 的字体栈渲染，页面中没有网页字体或字体请求' + (ctx.cjkFontLinks.length ? '（含 CJK 文字时的那条 CJK 链接除外）；' : '；')
    : `- 目标字体已加载，包括拉丁字体和 CJK 字体（不是回退字体）。${code('document.fonts.check()')} 不能作为证据：即使字体加载失败它也会返回 true。应等待 ${code('document.fonts.ready')}，再确认每个预期字体都出现在 ${code('document.fonts')} 中且状态为 ${code('"loaded"')}，或者把渲染出的文字宽度与回退字体对比。如果字体请求因网络错误失败，先重试或重新加载再下结论；只有 URL 本身有误时才修改引入方式；`;
  const netCheckZh = ctx.systemFontsOnly ? (ctx.cjkFontLinks.length ? '完全没有网络请求（含 CJK 文字时只允许那条 CJK 字体的 Google Fonts 请求）' : '完全没有网络请求') : ctx.localFonts ? `完全没有网络请求（含 CJK 文字时只允许那条 Google Fonts 请求${ctx.remoteFontLinks.length ? '，以及 Fontshare 字体请求' : ''}）` : '除字体服务外没有其他网络请求';

  return `# 用 ${name} 设计系统制作幻灯片

你是一个 coding agent。用户希望以 **${name}** 风格制作一份演示文稿，产出为单个自包含的 HTML 文件。所需素材都在模板包 ${code(slug + '/')} 中。请按以下步骤依次执行。始终用用户与你对话时使用的语言回复用户。

## 0. 找到素材包

${ctx.zipUrl ? locateDownloadZh(slug, zip, ctx.zipUrl) : locateLocalZh(slug, zip)}

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
   4. 密度：演讲型（低密度：一页一个观点，大字号，少文字）还是阅读型（高密度：每页自成一体，信息更多）？

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
${fontsZh}
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
- **以用户选择的密度为准**，它优先于 ${code('design.md')} 中任何关于密度的说法。低密度时保留设计系统的网格和面板语汇，但使用更少、更大的面板，一页一个观点；空余面板用设计系统自己的装饰填充，绝不自创装饰。内容放不下就拆成更多页；字号不得小于 ${code('design.md')} 的规定，也绝不允许溢出。
- **演讲型幻灯片的最小字号**：${code('design.md')} 中最小的标签 token（通常在 1920×1080 下为 14–16px）在 1280px 宽的屏幕上只有约 9–10px，投影时根本看不清。演讲型（低密度）幻灯片中，凡是在 1920×1080 画布上小于 20px 的文字，一律提高到至少 20px，保留该 token 的其他属性（字体、字距、大小写）。阅读型幻灯片保持 ${code('design.md')} 的字号。这是用户的密度选择唯一优先于 ${code('design.md')} 字号的地方。
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
   - 控制台无报错，${netCheckZh}。
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
// README.md inside the zip
// ---------------------------------------------------------------------------

// credits: [{what, author, project, license, licenseFile, url}]
export function packReadme(ctx, credits, siteName) {
  const lines = credits.map((c) =>
    `- ${c.what}: by ${c.author}, from [${c.project}](${c.url}) (${c.license}${c.licenseFile ? `; see ${code(c.licenseFile)}` : ''}).`);
  return `# ${ctx.name}: slide template pack

${ctx.tagline}

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
