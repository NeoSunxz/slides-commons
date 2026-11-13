---
version: alpha
name: Bold Signal
description: A confident, high-impact dark system built around one vivid orange card per slide on a near-black diagonal gradient. Archivo Black carries every headline, numeral and section number in sentence case with tight tracking; Space Grotesk carries body copy and wide-tracked uppercase labels. Every slide shares the same chrome — a large orange section number top-left, breadcrumb navigation with active/inactive opacity states top-right, a deck label and page number along the bottom — and composes its content on a strict 12-column × 6-row grid. Titles sit bottom-left. A slides-commons derivative of the "Bold Signal" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 1 'Bold Signal' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file."

colors:
  bg-primary: "#1a1a1a"
  bg-gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)"
  card-bg: "#FF5722"
  text-primary: "#ffffff"
  text-on-card: "#1a1a1a"
  surface: "#262626"
  text-muted: "rgba(255, 255, 255, 0.64)"
  text-faint: "rgba(255, 255, 255, 0.40)"
  rule: "rgba(255, 255, 255, 0.16)"
  on-card-muted: "rgba(26, 26, 26, 0.74)"
  card-tint: "rgba(255, 87, 34, 0.12)"
  stage-bg: "#0e0e0e"

color-aliases:
  accent: card-bg
  slide-bg: bg-primary
  ink: text-on-card

typography:
  hero:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 168px
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: -0.02em
  display:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 128px
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: -0.02em
  statement:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 104px
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: -0.02em
  title:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 88px
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: -0.02em
  quote:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.015em
  card-title:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.02em
  section-num:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 64px
    fontWeight: 400
    lineHeight: 0.8
    letterSpacing: -0.02em
  section-num-xl:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 480px
    fontWeight: 400
    lineHeight: 0.74
    letterSpacing: -0.04em
  stat-xl:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 240px
    fontWeight: 400
    lineHeight: 0.82
    letterSpacing: -0.04em
  stat:
    fontFamily: "Archivo Black, Arial Black, sans-serif"
    fontSize: 104px
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: -0.03em
  lede:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 400
    lineHeight: 1.35
  item-title:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.4
  body-sm:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Space Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    letterSpacing: 0.16em
    textTransform: uppercase

spacing:
  page-x: 96px
  chrome-top: 56px
  frame-top: 168px
  frame-bottom: 120px
  footer-bottom: 48px
  gutter: 32px
  card-pad: "48px 56px"
  label-to-title: 28px
  title-to-body: 32px

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 32px
  frame: "top 168px, left 96px, right 96px, bottom 120px (1728 x 792 px)"
  column-width: 114.67px
  row-height: 105.33px

components:
  chrome-top:
    position: "absolute; top: 56px; left: 96px; right: 96px"
    description: "Flex row, space-between. Left: section number + section name. Right: breadcrumb nav. Present on every slide, including the cover."
  section-number:
    fontFamily: "Archivo Black"
    fontSize: 64px
    color: "{colors.card-bg}"
    description: "Two-digit section ordinal (01, 02, …) top-left, followed 20px later by the section name as a {typography.label} in {colors.text-muted}, baseline-aligned."
  breadcrumbs:
    gap: 40px
    description: "One {typography.label} item per deck section. Inactive items opacity 0.35. The active item opacity 1 with a 3px {colors.card-bg} underline 10px below the text."
  footer:
    position: "absolute; left: 96px; right: 96px; bottom: 48px"
    description: "Deck label left (label style, {colors.text-faint}); page number right in the format '04 / 11' — current page in {colors.text-primary}, '/ total' in {colors.text-faint}, tabular numerals."
  frame:
    display: grid
    gridTemplateColumns: "repeat(12, 1fr)"
    gridTemplateRows: "repeat(6, 1fr)"
    gap: 32px
    description: "The only layout system. Every content block is a direct child of .frame placed with grid-column / grid-row spans."
  card:
    background: "{colors.card-bg}"
    color: "{colors.text-on-card}"
    padding: "48px 56px"
    borderRadius: 0
    description: "The focal orange card. Flex column, space-between: a label at the top, the key content at the bottom-left. One per slide."
  panel:
    background: "{colors.surface}"
    color: "{colors.text-primary}"
    padding: "48px 56px"
    description: "Quiet secondary dark panel, used opposite the orange card (e.g. 'before' column)."
  stack:
    description: "A grid cell laid out as a flex column with justify-content: flex-end so its title lands bottom-left."
  highlight-mark:
    background: "{colors.card-bg}"
    color: "{colors.text-on-card}"
    padding: "0 0.12em"
    description: "<mark> around a short phrase inside a headline: an orange block behind near-black text."
  accent-dot:
    color: "{colors.card-bg}"
    description: "A headline's final period set in orange: <span class=\"dot\">.</span>."
  index-square:
    size: 88px
    background: "{colors.card-bg}"
    description: "Orange square holding a two-digit number (Archivo Black 32px, near-black). Marks numbered list items."
  rule:
    border: "1px solid {colors.rule}"
    description: "Hairline divider between list rows, stat rows and table rows on dark."
  bar:
    description: "Chart bar. Default fill rgba(255,255,255,0.18); the highlighted bar is {colors.card-bg}. Value label above each bar; the highlighted value in Archivo Black 40px orange."
  marks:
    description: "Comparison marks, 24px: filled orange square = yes; 3px orange outline square = partial; 24×4px faint bar = no."
---

# Bold Signal

> **Attribution.** This design system is a slides-commons derivative of the **"Bold Signal"** preset (preset 1) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). The preset defines the fonts, the five core colors and the signature elements; the grid, extended tokens, components, slide archetypes and this document were written for slides-commons (MIT). It is not an official frontend-slides file and is not endorsed by its author.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its card and no panels overlap. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Bold Signal is a **dark, high-contrast keynote system with one loud object per slide**: a flat, square-cornered orange card (`{colors.card-bg}` #FF5722) on a near-black diagonal gradient. The card is the focal point; everything else is white or grey type set on the grid around it. The look is confident and modern — a product launch on a big stage, a sales kickoff, a founder who wants the room to remember three numbers.

The structure is fixed and repeated on every slide, which is what makes the deck feel engineered:

- **Top-left:** a large orange section number (`01`, `02`, …) in Archivo Black, followed by the section name as a small uppercase label.
- **Top-right:** breadcrumb navigation listing every section of the deck; the current section is fully opaque with an orange underline, the others sit at 35% opacity.
- **Bottom:** the deck label on the left and the page number (`04 / 11`) on the right.
- **Between them:** a 12-column × 6-row grid where content is placed by span. **Titles sit bottom-left** of their cell.

Typography is two faces. **Archivo Black** (a single, very heavy weight) carries every headline, numeral, section number and quotation. **Space Grotesk** (400/500) carries body copy, item titles and wide-tracked uppercase labels. Headlines are **sentence case**, not all caps — the weight does the shouting.

**Key characteristics**

- Dark diagonal gradient on every slide (`{colors.bg-gradient}`); stage background outside the slide is `{colors.stage-bg}`.
- One orange card per slide as the focal point. Square corners, no shadow, no border, no gradient.
- Large orange section numbers top-left, breadcrumbs with opacity states top-right, page number bottom-right — on every slide, cover included.
- Strict 12 × 6 grid inside a 1728 × 792 frame; 32px gutters.
- Titles anchored bottom-left; labels sit 28px above titles, body 32px below.
- Orange is the only hue. Everything else is white, near-black or a transparency of them.

**Density philosophy: medium.** One idea per slide, stated big, with supporting detail kept to the side. A typical slide has a label, a title, the card, and one supporting block (list, stats, table). Empty dark space is part of the look — unlike poster-grid systems, Bold Signal does not need every cell filled. When content grows past the archetypes below, split the slide.

## Colors

### Palette

- **Background** (`{colors.bg-primary}` #1a1a1a) and **Background gradient** (`{colors.bg-gradient}`, 135°, #1a1a1a → #2d2d2d → #1a1a1a): every slide's background. The lighter band runs diagonally through the middle of the slide; it is subtle, never a visible stripe.
- **Card orange** (`{colors.card-bg}` #FF5722): the signal color. Used for the focal card, section numbers, the active breadcrumb underline, index squares, the highlighted chart bar, the highlighted table column header, comparison marks, `<mark>` highlights and the orange final period of a headline.
- **Text primary** (`{colors.text-primary}` #ffffff): headlines and key text on dark.
- **Text on card** (`{colors.text-on-card}` #1a1a1a): all text on the orange card. **Never put white text on the orange card** — white on #FF5722 is about 3.2:1 and reads weak; near-black is about 5.6:1.
- **Derived tokens** (transparencies of the preset colors, not new hues):
  - `{colors.surface}` #262626 — the quiet secondary panel.
  - `{colors.text-muted}` white 64% — body copy and secondary text on dark.
  - `{colors.text-faint}` white 40% — chrome, axis labels, sources, footers.
  - `{colors.rule}` white 16% — hairlines on dark.
  - `{colors.on-card-muted}` #1a1a1a at 74% — labels and secondary text on the card.
  - `{colors.card-tint}` orange 12% — background of a highlighted table column.

### Defaults

- Slide background: `{colors.bg-gradient}`. Stage background (letterbox): `{colors.stage-bg}`.
- Headline color: `{colors.text-primary}` on dark, `{colors.text-on-card}` on the card.
- Body color: `{colors.text-muted}` on dark, `{colors.on-card-muted}` on the card.
- Label color: `{colors.text-muted}` on dark, `{colors.on-card-muted}` on the card.
- Emphasis inside a headline: `<mark>` (orange block, near-black text) or the orange final period.
- Chart: neutral bars white 18%; the one bar that carries the message is orange.

Orange is used **once loudly** per slide (the card, or the mark, or the highlighted bar) plus small repeated accents (section number, breadcrumb underline). If two large orange areas compete, remove one.

## Typography

### Font Family

- **Archivo Black** — Google Fonts, a single weight (400 in CSS, visually black). All headlines, the cover title, section numbers, stat numerals, quotes, card titles, index numbers.
- **Space Grotesk** — Google Fonts, weights 400/500/700. Body, lede, item titles (500), labels (500, uppercase, +0.16em), table text, footers.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
```

**Gotcha:** Archivo Black has only one weight. Always set `font-weight: 400` on Archivo Black elements (including `h1`–`h3`, which default to bold). Asking for 700 or 900 makes the browser synthesise a fake bold that smears the letterforms.

### Type Scale

| Token | Size / line-height | Family | Use |
|---|---|---|---|
| `{typography.section-num-xl}` | 480 / 0.74 | Archivo Black | Section-divider numeral inside the card |
| `{typography.stat-xl}` | 240 / 0.82 | Archivo Black | The one hero number on a stats slide |
| `{typography.hero}` | 168 / 0.9 | Archivo Black | Cover title, closing line (2 lines max) |
| `{typography.display}` | 128 / 0.92 | Archivo Black | Agenda title, section-divider title |
| `{typography.statement}` | 104 / 1.04 | Archivo Black | Full-width statement (≤ 4 lines) |
| `{typography.stat}` | 104 / 0.9 | Archivo Black | Secondary stat numerals |
| `{typography.title}` | 88 / 0.96 | Archivo Black | Standard content-slide title |
| `{typography.quote}` | 72 / 1.1 | Archivo Black | Pull quote on the card |
| `{typography.section-num}` | 64 / 0.8 | Archivo Black | Chrome section number |
| `{typography.card-title}` | 44 / 1.0 | Archivo Black | Column / card heading |
| `{typography.lede}` | 34 / 1.35 | Space Grotesk 400 | Cover subtitle, stat caption |
| `{typography.item-title}` | 34 / 1.15 | Space Grotesk 500 | List item heading, agenda item |
| `{typography.body}` | 28 / 1.4 | Space Grotesk 400 | Body paragraph, comparison bullets |
| `{typography.body-sm}` | 22 / 1.45 | Space Grotesk 400 | Item descriptions, sources, attribution |
| `{typography.label}` | 18 / — , 500, +0.16em, UPPERCASE | Space Grotesk | Labels, breadcrumbs, footer, axis and table headers |

Minimum on-slide text is 18px (labels only); running text is never below 22px.

### Signature Treatments

- **Sentence-case headlines** in Archivo Black with −0.02em tracking (−0.04em at 240px and above). Never all caps for headlines; never italics.
- **Label above title.** Every title has a small uppercase label 28px above it (the slide's topic, a date, a count).
- **Orange final period.** A short declarative headline may end with `<span class="dot">.</span>` in orange. At most one per slide, and only on statements, not on questions or lists.
- **`<mark>` highlight.** Wrap 2–4 words of a headline in `<mark>`: orange block, near-black text, `padding: 0 0.12em`, `box-decoration-break: clone`. Join the words with `&nbsp;` so the block does not split across lines. One per slide.
- **Numbers as heroes.** Stats use Archivo Black at 104–240px; units and symbols (`×`, `%`, `m`) are part of the numeral, not a separate smaller run.
- Body text is never bold for emphasis; promote the phrase to a title or a stat instead.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Chrome top (section number + breadcrumbs) | `top: 56px; left: 96px; right: 96px` |
| Frame (content grid) | `top: 168px; left: 96px; right: 96px; bottom: 120px` → 1728 × 792 |
| Footer (deck label + page number) | `bottom: 48px; left: 96px; right: 96px` |

Chrome is identical on every slide, including cover and closing. Only the section number, section name and active breadcrumb change.

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 32px; }` — columns are 114.67px wide, rows 105.33px tall. Common spans:

| Span | Width | Used for |
|---|---|---|
| 4 columns | 555px | Side title column, closing card |
| 6 columns | 848px | Half: divider card, stats card, comparison columns |
| 8 columns | 1141px | Cover card, quote card, chart, agenda list |
| 12 columns | 1728px | Full-width title rows, tables |

Rows: 6 rows = full height (792px); 2 rows = title band (242px); 4 rows = content band below a title band (517px).

### Composition rules

- **Title bottom-left.** Title cells are flex columns with `justify-content: flex-end`. The reading path is: section number (top-left) → title (bottom-left) → card.
- **Card left, support right** is the default. Cover, divider, stats and quote put the card in columns 1–6/1–8 and supporting content to the right; the closing slide reverses it (card top-right).
- A title band (rows 1–2) over a content band (rows 3–6) is the pattern for two-column comparisons and tables.
- Inside the card: label at the top, key content at the bottom (`justify-content: space-between`). Padding 48px × 56px.
- Leave dark space. A card plus one supporting block is a complete slide.

## Depth and Elevation

Flat. No box-shadows, no glows, no glassmorphism, no rounded corners anywhere. Depth comes only from the orange card against the dark gradient, and from `{colors.surface}` panels being one step lighter than the background. Hairlines (`{colors.rule}`, 1px) separate rows; 2px rules in `currentColor` underline column heads.

## Components

- **Section number + name** (chrome, top-left): `01` Archivo Black 64px orange, then the section name as a muted label, baseline-aligned, 20px gap.
- **Breadcrumbs** (chrome, top-right): an `<ol>` with one short word per section (Intro / Problem / Product / Proof / Next). 40px gap. Inactive `opacity: 0.35`; active `opacity: 1` + 3px orange bottom border with 10px padding. Keep it to 3–6 sections with one-word names.
- **Footer**: deck label left, page number right (`04 / 11`). Page numbers are filled by script from the slide index so they never go stale.
- **Card** (orange) and **panel** (`{colors.surface}`): see tokens. Both square, 48px × 56px padding.
- **Index square**: 88px orange square with a two-digit number (Archivo Black 32px) for numbered lists.
- **Agenda row**: grid `136px 1fr auto`: number (Archivo Black 56px orange), item title + one-line description, duration label. The current item is an orange card row; others are separated by hairlines.
- **Stat row**: grid `340px 1fr`: numeral (Archivo Black 104px) + caption (first line in white 500, second in muted). Rows separated by hairlines.
- **Tick list**: rows of 28px text with a short dash marker (on dark) or an 18px near-black square marker (on the card), separated by hairlines.
- **Bar chart** (pure CSS): y-axis labels (18px, faint, tabular) on the left; dashed `{colors.rule}` gridlines; 2px white-50% baseline; bars in a flex row with 28px gaps; bar height = value / axis max, and the bars container fills the same box as the gridlines (`inset: 0 24px`, no top offset) so a bar of value N ends exactly on the gridline for N; write heights as `calc(N / max * 100%)` rather than rounded percentages. Neutral bars white 18%, the message bar orange with an Archivo Black 40px orange value above it. Month labels as faint labels; the highlighted one in white.
- **Comparison table**: full width, `table-layout: fixed`, rows separated by hairlines. Header row is labels with a 2px white-50% bottom rule; "our" column header is an orange cell, its body cells use `{colors.card-tint}`. First column: row names in Space Grotesk 500 28px. Cells: a mark + 24px text. Marks: filled orange square (yes), orange outline square (partial), short faint bar (no). Include a legend top-right of the title band.
- **Quote**: on the orange card; an Archivo Black opening quote mark (260px, near-black) top-left, the quote in `{typography.quote}` bottom-left. Attribution outside the card, bottom-left of its own cell: 88×8px orange bar, name (Space Grotesk 500 40px), role (body-sm muted).
- **Highlight mark** and **accent dot**: see Signature Treatments.

## Slide Archetypes

The demo deck implements each of these. Coordinates are grid spans inside `.frame`.

1. **Cover** — card `1/span 8 × 1/span 6`: label top (event · date), `{typography.hero}` title bottom-left (2 lines), lede below. Right `9/span 4`: a small 3×3 square mark (two or three orange squares, the rest white 16%) at the top; presenter / audience / date as label + 30px value pairs at the bottom.
2. **Agenda** — left `1/span 4`: label + "Agenda" (`display`) bottom-left. Right `5/span 8`: 5 agenda rows filling the height; the current section is the orange card row.
3. **Section divider** — card `1/span 6 × full height` with label "Section" top and the section number in `section-num-xl` bottom-left. Right `7/span 6`: label, `display` title (two short lines), one body sentence, bottom-aligned.
4. **Statement** — one cell `1/span 11`, bottom-aligned: label, `statement` headline (≤ 4 lines) with one `<mark>` and an orange final period, then a faint source line.
5. **Numbered list** — left `1/span 5`: label, `title`, one body sentence. Right `6/span 7`: up to 4 items, each an index square + item title + one-line description, separated by hairlines.
6. **Two columns (before / after)** — title band `1/span 12 × rows 1–2`. Below, `panel` (left, the old way, dash markers) and `card` (right, the new way, square markers), each `span 6 × rows 3–6`, each with a card-title + label head and 3 tick rows.
7. **Big number + stats** — card `1/span 6`: label top, `stat-xl` numeral + lede bottom. Right `7/span 6`: 3 stat rows.
8. **Chart** — left `1/span 4`: label, `title` (break into short lines), one-sentence takeaway. Right `5/span 8`: the CSS bar chart, 6–10 bars, one orange.
9. **Comparison table** — title band with legend; table `1/span 12 × rows 3–6`, 3–4 columns, up to 5 rows.
10. **Quote** — card `1/span 8` with quote mark and quote (≤ 120 characters at 72px); attribution `9/span 4` bottom-left.
11. **Closing** — left `1/span 8`: label + `hero` line with orange period, bottom-left. Card `9/span 4 × rows 1–4`: label + 3 dated next steps (date in Archivo Black 32px, description 22px). Below it `rows 5–6`: contact lines.

Other layouts (timeline, team, process) should be built from the same parts: a bottom-left title cell, one orange card, hairline-separated rows, and Archivo Black numerals.

## Motion

- Elements with `.reveal` fade in and rise 28px when their slide gets `.visible`: `0.7s cubic-bezier(0.16, 1, 0.3, 1)`, staggered by `--i` × 90ms (+120ms).
- The orange card wipes in from its left edge: `clip-path: inset(0 100% 0 0)` → `inset(0)`, 0.8s, same easing.
- Chart bars grow from the baseline (`scaleY(0)` → `1`, `transform-origin: bottom`), staggered 60ms.
- No bouncing, no rotation, no looping motion. `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Put one orange card on every content slide where there is a single most important thing; make it the first thing the eye lands on.
- Keep the chrome (section number, breadcrumbs, footer) identical and present on every slide.
- Place titles bottom-left with a label above them.
- Use Archivo Black for every headline and number, at `font-weight: 400`, sentence case.
- Use near-black text on the orange card.
- Make numbers huge: 104px for supporting stats, 240px for the hero stat.
- Split content into more slides rather than shrinking type below the scale.

### Don't

- Don't add a second accent hue (no blue, green, yellow, purple). Status and meaning come from orange vs. white vs. faint.
- Don't use white text on the orange card.
- Don't round corners, add shadows, glows, glass effects or gradients to cards.
- Don't set headlines in all caps or italics, and don't fake-bold Archivo Black.
- Don't center-align slides or use identical card grids; the layout is left-anchored and asymmetric.
- Don't use more than one `<mark>` or more than one orange period per slide.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients (frontend-slides "DO NOT USE" list).
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, numerals, quotes (Archivo Black) | Archivo Black | Noto Sans SC (思源黑体) | 900 |
| Body, item titles (Space Grotesk 400/500) | Space Grotesk | Noto Sans SC | 400 / 500 |
| Labels, breadcrumbs, footer (Space Grotesk 500 uppercase) | Space Grotesk | Noto Sans SC | 500 |

### Mixed-Content Strategy

Use one `font-family` stack per role with the Latin face first and Noto Sans SC as fallback, so Latin glyphs render in Archivo Black / Space Grotesk and Chinese characters fall through automatically:

```css
--font-display: 'Archivo Black', 'Noto Sans SC', 'Arial Black', sans-serif;
--font-body: 'Space Grotesk', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Because Archivo Black elements are set at `font-weight: 400`, the Chinese fallback would render at 400 too. Give Chinese headlines their weight explicitly: put `lang="zh-CN"` on `<html>` (or on the element) and add

```css
:lang(zh) .d, :lang(zh) .bignum, :lang(zh) .stat-xl, :lang(zh) blockquote { font-weight: 900; letter-spacing: 0; }
```

Archivo Black has no 900 face, so Latin glyphs inside these elements would then be faux-bolded. Keep Latin words in Chinese headlines short (product names, numbers) or wrap them in `<span lang="en">` with `font-weight: 400`.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.15–1.25 (raise `title` / `display` / `hero` line-heights from 0.9–0.96 to at least 1.15 for Chinese, or lines collide).
- Letter-spacing 0 on CJK text (drop the −0.02em headline tracking and the +0.16em label tracking).
- No `text-transform: uppercase` effect on CJK; labels stay as written.
- Full-width punctuation （，。：；！？「」（））. No period at the end of a Chinese headline — so the orange-period treatment is dropped on Chinese headlines; use `<mark>` for emphasis instead.
- Pangu spacing (盘古之白): a space between CJK and Latin/numbers, e.g. `使用 Pulse 2.0`.
- Avoid single orphan characters on the last line of a headline: rebalance with `<br>` or shorten.
- One font per sentence.

### Aesthetic Notes for This System

Bold Signal's voice comes from **weight and the orange card**, not from Latin letterforms, so it transfers well to Chinese. Set Chinese headlines in **Noto Sans SC 900** to match the mass of Archivo Black. Chinese is denser per character: a Chinese headline of 8–14 characters fits where an English one of 20–30 does, so keep the same sizes but plan for fewer characters. In the `statement` archetype, 2–3 lines of 12–14 characters at 104px is the limit.

Section numbers, page numbers and stat numerals are digits and stay in Archivo Black unchanged. Breadcrumbs work in Chinese with two-character section names (引言 / 问题 / 产品 / 成效 / 下一步); keep them at 18px, opacity states unchanged. The `<mark>` highlight works on a Chinese phrase exactly as in English.

### Known CJK Gap

The faux-bold risk above: in one element, Latin words at 400 and Chinese at 900 cannot both be "true" weights unless they are split into separate spans. Accept slightly lighter-looking mixed headlines rather than synthetic bold on Archivo Black.

## Iteration Guide

1. Start every slide from the chrome (section number, breadcrumbs, footer) and an empty 12 × 6 frame.
2. Decide the slide's one most important thing; put it on the orange card or in a `<mark>`.
3. Place the title bottom-left of its cell with a label above it.
4. Use only the type scale tokens; never interpolate new sizes.
5. Only orange, white, near-black and their transparencies. No new hues.
6. Every corner square, nothing has a shadow.
7. Numbers go big in Archivo Black.
8. If a slide needs more than one card, one list and one stat group, split it.
9. Update the breadcrumb `on` state and section number per section; let the script fill page numbers.
10. Verify at 1920×1080, 1280×720 and on a phone: no overflow, no overlap, fonts loaded.

## Known Gaps

- The original preset gives only fonts, five colors and four signature elements. The grid, spacing, derived transparencies, type scale and components here are slides-commons extensions in the spirit of the preset.
- Archivo Black has one weight and no italic; there is no lighter display option.
- The chart and table are hand-built with CSS; bar heights are inline `--h` percentages (value / axis max). There is no data binding.
- No image archetype is included. If photos are used, place them in a grid cell with square corners and no border, and keep the orange card as the focal point next to them, not on top of them.
