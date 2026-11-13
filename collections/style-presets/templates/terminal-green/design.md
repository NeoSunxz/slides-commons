---
version: alpha
name: Terminal Green
description: A developer-focused dark system that presents every slide as a terminal session on GitHub-dark (#0d1117). JetBrains Mono is the only typeface - 800 for headlines, 400 for body, italic for comment-style labels. Terminal green (#39d353) marks prompts, the blinking block cursor, syntax keys and the one value that matters; a darker green ramp carries markdown heading markers and secondary data. Scan lines sit over everything. Chrome is a terminal title bar on top and a tmux-style status line at the bottom with the current section as the active window. Content sits on a 12-column × 6-row grid and is built from shell idioms - ls listings, git log, diff panes, meters, box-drawn tables, comment blocks and checklists. A slides-commons derivative of the "Terminal Green" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 10 'Terminal Green' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file. The preset gives vibe, one font, two colors and three signature elements; everything else here was developed by slides-commons."

colors:
  bg: "#0d1117"
  green: "#39d353"
  surface: "#161b22"
  surface-2: "#1c2128"
  border: "#30363d"
  text: "#e6edf3"
  muted: "#8b949e"
  faint: "#6e7681"
  green-1: "#0e4429"
  green-2: "#006d32"
  green-3: "#26a641"
  green-soft: "#9be9a8"
  red: "#f85149"
  red-bg: "rgba(248, 81, 73, 0.12)"
  stage-bg: "#010409"

color-aliases:
  accent: green
  slide-bg: bg
  ink: text

effects:
  scan-lines: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 1px, transparent 1px 4px) over the whole slide (z-index above content, pointer-events none), drifting 64px over 9s on the active slide"
  vignette: "radial-gradient(ellipse 90% 85%, transparent 60%, rgba(0,0,0,0.35) 100%)"
  top-glow: "radial-gradient(1400px 600px at 50% -10%, rgba(57,211,83,0.06), transparent 70%) behind content"
  cursor-glow: "0 0 18px rgba(57, 211, 83, 0.45)"

typography:
  hero:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 136px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.03em
  display:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 104px
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: -0.03em
  statement:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 68px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  title:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 60px
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: -0.02em
  quote:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 60px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.32
  section-num:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 400px
    fontWeight: 800
    lineHeight: 0.78
    letterSpacing: -0.05em
  stat-xl:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 232px
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: -0.05em
  stat:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 56px
    fontWeight: 800
    letterSpacing: -0.03em
  lede:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.55
  code:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.75
  body-sm:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 21px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: 20px
    fontWeight: 400
    fontStyle: italic
    description: "a shell comment: '# ' prefix in {colors.faint}, lowercase text in {colors.muted}"

spacing:
  page-x: 120px
  titlebar-height: 72px
  status-height: 56px
  frame-top: 160px
  frame-bottom: 136px
  gutter: 32px
  label-to-title: 24px
  title-to-body: 28px

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 32px
  frame: "top 160px, left 120px, right 120px, bottom 136px (1680 x 784 px)"
  column-width: 110.67px
  row-height: 104px

components:
  titlebar:
    position: "absolute; top 0; left 0; right 0; height 72px"
    description: "{colors.surface} bar with a 1px {colors.border} bottom rule. Three 16px hollow circles (first filled {colors.border}) — never red/yellow/green traffic lights — then the file path '~/talks/<deck> — <slide-file>' in 20px {colors.muted} with the deck name in {colors.text} 500, and a faint 'zsh · 196×54' on the right."
  status-line:
    position: "absolute; bottom 0; left 0; right 0; height 56px"
    description: "tmux-style. Session name on a solid {colors.green} block in {colors.bg} 700; then one window per deck section '0:intro 1:problem …'; the current section on {colors.green-1} in {colors.green} 700 with a trailing '*'. Right: team name and page number '04 / 11' (filled by script)."
  prompt-line:
    description: "'$' in {colors.green} 700 + command in {colors.text}, 26px. Types in with a stepped clip-path. Output lines in {colors.muted}; 'done' / 'ok' in green."
  md-heading:
    description: "Titles carry markdown markers: '#' for display titles, '##' for slide titles, in {colors.green-3} 400, followed by the title in {colors.text} 700/800."
  cursor:
    description: "Block cursor 0.6em × 0.9em, {colors.green} with {effects.cursor-glow}, blinking 1.06s steps(1). Cover and closing headline only."
  selection:
    description: "<span class=sel>: text in {colors.green} on {colors.green-1}, like a terminal selection. One phrase per slide."
  pane:
    description: "Code/diff panel: {colors.surface} with 1px {colors.border}; 56px header (ref name in {colors.text} 500 + a muted meta right); line-numbered code list (64px gutter of {colors.faint} numbers, 32px +/− marker column)."
  diff-lines:
    description: "Added: green 10% background, '+' in green. Removed: {colors.red-bg} background, '−' in {colors.red}. Context lines plain."
  syntax:
    description: "key/keyword {colors.green} 700; string {colors.green-soft}; number {colors.text} with a {colors.green-3} underline; comment {colors.muted} italic; punctuation {colors.faint}."
  ls-listing:
    description: "Agenda rows: grid 210px / 120px / 1fr — permissions (22px faint), duration (green-3), directory name (500) with an italic muted description; current row on {colors.surface-2} with a 4px green inset left bar and green text."
  git-log:
    description: "List rows: grid 56px / 160px / 1fr / auto — '*' graph mark, short hash in green-3, message (500) + italic description, delta in green 700 right."
  meter:
    description: "htop-style: label + value (56px 800) on one line, then '[' segmented bar ']' (14px cells, 6px gaps; filled green or green-3 over {colors.border} empty cells), then a 21px caption."
  block-bars:
    description: "Vertical bar chart with bars made of 14px blocks / 4px gaps (repeating-linear-gradient). Neutral bars {colors.green-2}, the highlighted bar {colors.green}. Target as a dashed green-3 line with its y-axis label in green-3 700."
  box-table:
    description: "Every cell boxed with 1px {colors.border} like CLI table output; header row on {colors.surface}; numeric columns right-aligned with tabular numerals; deltas green 700; a total row on {colors.surface-2}."
  comment-quote:
    description: "Quote set as a block comment: '/*' and ' */' in {colors.faint}, an '*' gutter, quote in italic 400 60px, one phrase in green, attribution '— Name' with the name in green 700."
  checklist:
    description: "Closing next steps as markdown tasks: '[x]' green 700 with struck-through muted text for done, '[ ]' faint for open; italic date line under each."
---

# Terminal Green

> **Attribution.** This design system is a slides-commons derivative of the **"Terminal Green"** preset (preset 10) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). It is not an official frontend-slides file and is not endorsed by its author.
>
> **What comes from the preset:** the vibe (developer-focused, hacker aesthetic), the font (JetBrains Mono, monospace only), the two colors (GitHub dark #0d1117, terminal green #39d353) and the three signature ideas (scan lines, blinking cursor, code syntax styling). The preset is only these few lines.
>
> **What slides-commons developed:** everything else — the neutral steps (modelled on GitHub's dark UI), the darker green ramp (modelled on GitHub's contribution-graph greens), the single error red for removed diff lines, the syntax color mapping, the type scale, the 12 × 6 grid, the title bar and tmux status line chrome, the shell-idiom components (ls, git log, diff panes, meters, block bars, box tables, comment quotes, checklists), the archetypes, the motion rules and this document (MIT).

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its pane and no panes overlap. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Terminal Green treats the deck as **a terminal session the speaker is driving**. Every slide has a title bar showing the "file" being presented and a tmux status line showing which section ("window") we are in. Content is made of things engineers read every day — a prompt, an `ls` listing, `git log`, a config diff, a benchmark table — so the audience parses each slide instantly.

**JetBrains Mono is the only typeface.** Hierarchy comes from size (21–232px), weight (400 body, 700 titles, 800 display and numbers), color (text / muted / green) and italics (comments). Headlines carry markdown markers (`#`, `##`) in dark green.

**Key characteristics**

- GitHub-dark background with a faint green glow at the top, scan lines and a soft vignette over everything.
- Green is the signal: prompts, the cursor, syntax keys, the active status window, the highlighted bar, the one number. Everything else is GitHub greys.
- Labels are shell comments: `# the cost of waiting` — lowercase, italic, muted.
- One blinking block cursor, on the cover and closing headlines only.
- Content is left-aligned on a strict 12 × 6 grid; nothing is centred.

**Density philosophy: medium.** Monospace is wide: about 46 characters fit across the full frame at 60px, 26 at 104px. Keep titles to one or two lines, body text to two or three. A slide is one command and its output.

## Colors

### Palette

- **Background** (`{colors.bg}` #0d1117) — *preset* ("GitHub dark"). Every slide.
- **Terminal green** (`{colors.green}` #39d353) — *preset*. Prompts, cursor, keys, active window, highlighted values and bars, `[x]` marks.
- **Derived by slides-commons — neutrals** (GitHub dark UI steps):
  - `{colors.surface}` #161b22 — title bar, status line, panes, table header.
  - `{colors.surface-2}` #1c2128 — current agenda row, table total row.
  - `{colors.border}` #30363d — every border and hairline; empty meter cells.
  - `{colors.text}` #e6edf3 — primary text. `{colors.muted}` #8b949e — body, comments, captions. `{colors.faint}` #6e7681 — line numbers, axes, punctuation.
- **Derived by slides-commons — green ramp** (darker steps of the preset green, as in GitHub's contribution graph):
  - `{colors.green-1}` #0e4429 — selection background, active status window.
  - `{colors.green-2}` #006d32 — neutral chart bars, divider slash.
  - `{colors.green-3}` #26a641 — markdown markers, hashes, durations, secondary meters, target lines.
  - `{colors.green-soft}` #9be9a8 — strings in code.
- **Derived by slides-commons — one error hue:** `{colors.red}` #f85149 and `{colors.red-bg}` — **only** for removed diff lines, failures and the `−` count in a diffstat. Never decorative.
- `{colors.stage-bg}` #010409 — letterbox.

### Defaults

Headlines `{colors.text}` with one green phrase; body `{colors.muted}`; labels `# comment` style; numbers that matter in green 800. Green on #0d1117 is about 9.6:1; muted grey about 6:1; faint grey about 4.2:1 (axes and line numbers only).

## Typography

### Font Family

**JetBrains Mono** — Google Fonts, 400 / 500 / 700 / 800 and 400 italic. Nothing else; no sans fallback for headlines.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;0,800;1,400&display=swap" rel="stylesheet">
```

Keep `font-variant-ligatures: contextual` on: JetBrains Mono's code ligatures (`&&`, `->`, `!=`) are part of the look.

### Type Scale

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `{typography.section-num}` | 400 / 0.78 | 800 | Divider numeral `02/` (slash in green-2) |
| `{typography.stat-xl}` | 232 / 0.86 | 800 | Hero number; unit/secondary part at 0.42em in green-3 |
| `{typography.hero}` | 136 / 1.0 | 800 | Cover and closing headline (2 lines, ≤ 12 chars each) |
| `{typography.display}` | 104 / 1.02 | 800 | Agenda / divider titles with `#` |
| `{typography.statement}` | 68 / 1.25 | 700 | Statement (≤ 3 lines, ≤ 30 chars per line) |
| `{typography.title}` | 60 / 1.12 | 700 | Slide titles with `##` |
| `{typography.quote}` | 60 / 1.32 | 400 italic | Comment-block quote |
| `{typography.stat}` | 56 | 800 | Meter values |
| `{typography.lede}` | 30 / 1.5 | 400 | Cover subtitle, hero stat caption |
| `{typography.body}` | 26 / 1.55 | 400 | Body, list items, prompt lines |
| `{typography.code}` | 26 / 1.75 | 400 | Diff panes |
| `{typography.body-sm}` | 21 / 1.5 | 400 | Descriptions (often italic), captions, sources |
| `{typography.label}` | 20, italic | 400 | `# comment` labels |
| chrome | 19–20 | 400/500/700 | Title bar, status line, table headers |

Minimum on-slide text is 18px (axes); running text never below 21px.

### Signature Treatments

- **Markdown markers.** `#` before display titles, `##` before slide titles, in green-3 400.
- **Comment labels.** `# lowercase italic` above every title; 24px gap.
- **Prompt lines.** `$ command` introduces a listing, table or log; it types in once.
- **Selection highlight.** One phrase per slide as `.sel` (green on green-1).
- **Code ligatures** stay on; numbers in tables use tabular figures.
- Never all caps (except an acronym like CI); terminal text is lowercase-friendly.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Title bar | `top: 0; height: 72px`, full width, padding 0 40px |
| Frame (content grid) | `top: 160px; left: 120px; right: 120px; bottom: 136px` → 1680 × 784 |
| Status line | `bottom: 0; height: 56px`, full width |

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 32px; }` — columns 110.67px, rows 104px.

| Span | Width | Used for |
|---|---|---|
| 4 columns | 539px | Side title column (agenda, list, chart) |
| 5 columns | 681px | Closing checklist |
| 6 columns | 824px | Diff panes, divider halves, stats halves |
| 8 columns | 1107px | ls listing, git log, chart, cover headline |
| 12 columns | 1680px | Title bands, tables, quote |

### Composition rules

- Titles bottom-aligned in their cell; a prompt line sits directly above the output it introduces.
- Left column = what we're saying (comment, title, one sentence). Right column = the evidence (listing, log, chart).
- Panes and tables have square corners and 1px borders; nothing floats.

## Depth and Elevation

Flat, like a terminal. Depth = surface steps (#0d1117 → #161b22 → #1c2128) and 1px `{colors.border}` lines. The only glows are the cursor, the hero number and the divider numeral (soft green text-shadow, ≤ 48px). No shadows, no rounded corners (except the three title-bar circles), no gradients on panels.

## Components

See the `components` tokens above for exact specs. Summary:

- **Title bar** and **status line** — chrome on every slide; update the file path and the active window per slide.
- **Prompt line** — `$` + command; output below.
- **ls listing** (agenda), **git log** (numbered list), **diff panes** (two columns), **meters** (stats), **block bars** (chart), **box table** (comparison), **comment quote**, **checklist** (closing).
- **Cursor** and **selection** — one each at most per slide.

## Slide Archetypes

The demo deck implements each of these. Coordinates are grid spans inside `.frame`.

1. **Cover** — `1/span 8`: prompt + one output line at the top; `hero` headline (second line green + cursor) and lede at the bottom. `9/span 4 × rows 3–6`: a `talk.yml` block (comment, keys in green, strings in green-soft, date as number).
2. **Agenda** — `1/span 4`: comment label, `display` `# agenda`, one sentence. `5/span 8`: prompt `ls -l agenda/` + 5 listing rows, current row highlighted.
3. **Section divider** — `1/span 6`: `02/` numeral. `7/span 6`: `$ cd 02-…`, `display` title, one sentence, a text progress bar `[████░░░░] 2/5`.
4. **Statement** — `1/span 11`, bottom-aligned, with a 4px green-3 left rule: label, `statement` (one `.sel` phrase, one green phrase), source line.
5. **List** — `1/span 4`: label, `## title`, sentence. `5/span 8`: `$ git log --oneline` + 4 commits with deltas.
6. **Two columns** — title band with a diffstat right; two `pane`s `span 6 × rows 3–6`: before (removed lines) and after (added lines), ≤ 8 lines each, ≤ 34 characters per line.
7. **Stats** — `1/span 6`: label, `stat-xl` value, lede. `7/span 6`: 3 meters.
8. **Chart** — `1/span 4`: label, title, takeaway. `5/span 8`: block bars, 8–12 bars, labels only on the first and highlighted bar, target line.
9. **Table** — title band (label, title, prompt line); `box-table` `1/span 12 × rows 3–6`, ≤ 5 rows + total.
10. **Quote** — `1/span 12`, vertically centred: `comment-quote` (≤ 90 characters).
11. **Closing** — `1/span 7`: label, `hero` line (green second line + cursor), contact lines. `8/span 5`: `$ cat NEXT.md` + checklist (3 items).

Other layouts: a timeline is `git log` with dates; an architecture is a `tree` listing (`├──`, `└──`) in a pane; a team slide is a `whoami`-style key/value block.

## Motion

- `.reveal`: lines "print" in order — opacity in 4 steps + 12px rise, 0.45s, `--i` × 110ms stagger.
- `.type`: prompt lines type in with `clip-path` in 28 steps, 0.9s.
- `.grow` / `.fill`: bars and meters fill in 10–16 discrete steps (not smooth), like a progress bar.
- Cursor blinks (1.06s, steps). Scan lines drift slowly on the active slide only.
- `prefers-reduced-motion: reduce`: `animation: none !important` on the cursor and scan lines (solid cursor, static lines); viewport-base.css shortens all transitions.

## Do's and Don'ts

### Do

- Write slides as commands and their output; make every label a `# comment`.
- Keep the title bar path and the active status window in sync with the slide.
- Use green for the one thing that matters on each slide, green-3 for structure.
- Use real-looking but obviously fictional commands, hashes and paths.
- Split slides when text exceeds the character budgets above.

### Don't

- Don't add a second typeface — no sans for headlines, no serif for quotes.
- Don't use red except for removed lines and failures; no other hues at all (no blue keywords, no purple strings).
- Don't use macOS red/yellow/green traffic lights; the three title-bar dots stay grey.
- Don't put more than one cursor or one `.sel` on a slide, and don't let the cursor blink on content slides.
- Don't make scan lines strong enough to hurt legibility (keep ≤ 0.22 alpha, 1px every 4px).
- Don't use Inter, Roboto, Arial or system fonts, purple gradients or the generic indigo `#6366f1` (frontend-slides "DO NOT USE"); don't centre everything.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, numbers (JetBrains Mono 700/800) | JetBrains Mono | Noto Sans SC (思源黑体) | 700 / 900 |
| Body, comments (JetBrains Mono 400) | JetBrains Mono | Noto Sans SC | 400 |
| Code, commands | JetBrains Mono | — keep code in English | — |

### Mixed-Content Strategy

```css
--font-mono: 'JetBrains Mono', 'Noto Sans SC', ui-monospace, Menlo, Consolas, monospace;
```

Latin and digits render in JetBrains Mono; Chinese falls through to Noto Sans SC. CJK glyphs are full-width (2 Latin cells in a terminal) — in JetBrains Mono at 26px a Latin cell is 15.6px and a Chinese glyph about 26px, so columns of mixed text will not align character-for-character. Align with grid columns, not with spaces.

Keep commands, paths, keys, hashes and code in English; translate comments, titles, descriptions and the status-line section names (`0:引言 1:问题 …`).

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;0,800;1,400&family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.2–1.3.
- Letter-spacing 0 on CJK (drop the −0.02/−0.03em headline tracking).
- **No italics on CJK.** Comment labels and the quote are italic in Latin; for Chinese set `:lang(zh) .label, :lang(zh) blockquote { font-style: normal; }` — synthetic oblique Chinese looks broken. Keep the `#` prefix and muted color to mark comments.
- Full-width punctuation （，。：；！？「」）. Pangu spacing between CJK and Latin/numbers: `CI 从 41 分钟降到 6 分钟`.
- Avoid a single orphan character on the last line of a headline.
- One font per sentence.

### Aesthetic Notes for This System

The terminal look survives translation because it lives in the chrome, the prompts, the green and the shell structures, not in the prose. Chinese headlines in Noto Sans SC 900 next to JetBrains Mono 800 digits look right. Chinese is denser: a `hero` line of 6–8 characters, a `title` of 10–14.

### Known CJK Gap

There is no free monospace CJK face on Google Fonts that matches JetBrains Mono, so Chinese text is proportional (Noto Sans SC). Accept that mixed lines do not sit on the monospace cell grid.

## Iteration Guide

1. Start from the title bar, the status line and an empty 12 × 6 frame.
2. Pick the shell idiom that fits the content (listing, log, diff, meter, table, comment).
3. Comment label, then `##` title, then one sentence — bottom-aligned.
4. Only the type scale tokens; only JetBrains Mono.
5. Green for the one key value; green-3 for structure; red only for removals.
6. One cursor (cover/closing), one selection, at most.
7. Update the file path and active window; let the script fill page numbers.
8. Check the character budget; split rather than shrink.
9. Keep scan lines subtle and check text over them at 1280×720.
10. Verify at 1920×1080, 1280×720 and a phone; fonts loaded (400, 700, 800 and italic).

## Known Gaps

- The original preset is four lines: vibe, font, two colors, three signature ideas. The neutral steps, green ramp, error red, syntax mapping, grid, chrome and components here are slides-commons developments in the spirit of the preset.
- Charts and tables are hand-built with CSS; bar heights are inline `--h` percentages (value / axis max). No data binding.
- The status-line clock and terminal size are static decoration.
- No image archetype. If a screenshot is needed, put it in a `pane` with a header naming the file; never under the scan lines at full strength.
