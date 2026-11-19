---
version: alpha
name: Consulting Report
description: A white-canvas strategy-deliverable system in which every slide states its conclusion as a full-sentence action title and then proves it with evidence. Source Serif 4 (semibold) carries the action titles; IBM Plex Sans carries everything else with tabular figures. Every content slide shares the same frame — a section tracker (and an optional status tag) at the top, a two-line action title over a hairline, a 654px body band that charts and tables fill to the bottom, a source line, and a footer with the deck label and page number. Deep navy and a ladder of navy tints carry the data; one restrained teal accent marks the single "so-what" fact per slide. Charts (column, horizontal bar, 100% stacked, waterfall, 2×2 bubble matrix, Harvey balls, Gantt) are pure HTML/CSS with direct labels and no gridlines. Original design by slides-commons.
source-note: "Original design by slides-commons (MIT). Not derived from a frontend-slides preset and not modelled on any firm's branding."

colors:
  paper: "#FFFFFF"
  navy: "#0B2545"
  navy-60: "#4F6A8F"
  navy-30: "#A3B3C9"
  navy-12: "#E1E7EF"
  navy-05: "#F3F6F9"
  accent: "#087F79"
  accent-tint: "#E3F1EF"
  ink: "#1B2433"
  muted: "#5A6474"
  faint: "#8C95A3"
  rule: "#D3DAE3"
  stage-bg: "#E9ECF0"

color-aliases:
  slide-bg: paper
  primary: navy
  so-what: accent
  text: ink
  on-navy: paper
  on-navy-muted: navy-30
  on-navy-rule: navy-60

typography:
  cover-title:
    fontFamily: "Source Serif 4, Noto Serif SC, Georgia, serif"
    fontSize: 92px
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: -0.012em
  action-title:
    fontFamily: "Source Serif 4, Noto Serif SC, Georgia, serif"
    fontSize: 46px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.005em
  panel-statement:
    fontFamily: "Source Serif 4, Noto Serif SC, Georgia, serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.22
  section-numeral:
    fontFamily: "Source Serif 4, Noto Serif SC, Georgia, serif"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.05
  big-figure:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 54px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -0.01em
    fontVariantNumeric: tabular-nums
  callout-figure:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 64px
    fontWeight: 600
    lineHeight: 1
  lead:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.38
  chart-title:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.42
  table:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 21px
    fontWeight: 400
    lineHeight: 1.3
    fontVariantNumeric: tabular-nums
  data-label:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 24px
    fontWeight: 600
    fontVariantNumeric: tabular-nums
  axis:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 20px
    fontWeight: 400
  small:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 18px
    fontWeight: 600
    letterSpacing: 0.06em
    textTransform: uppercase
  label-zh:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 20px
    fontWeight: 500
    letterSpacing: 0
    textTransform: none
  source:
    fontFamily: "IBM Plex Sans, Noto Sans SC, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.4

spacing:
  page-x: 80px
  chrome-top: 44px
  action-top: 116px
  title-rule: 248px
  body-top: 276px
  body-bottom: 150px
  source-bottom: 92px
  footer-bottom: 36px
  column-gap: 64px-72px

canvas:
  width: 1920px
  height: 1080px

frame:
  body: "top 276px, left 80px, right 80px, bottom 150px (1760 x 654 px)"
  action-title: "top 116px, max-width 1640px, max two lines (ends before 240px); 1640px holds about 75 Latin characters at 46px or 37 Chinese characters at 44px per line"
  source-line: "bottom 92px, max two lines"

components:
  tracker:
    position: "absolute; top: 44px; left: 80px"
    description: "Ordered list of 3-6 section names. Each item 196px wide with a 4px top bar: {colors.navy-12} inactive, {colors.navy} active. Text {typography.label} (Chinese: {typography.label-zh}), {colors.faint} inactive, {colors.navy} 600 active."
  status-tag:
    description: "Optional. Top-right box: 1.5px {colors.navy} border, {typography.label} in navy, e.g. PRELIMINARY / DRAFT / FINAL. Only when the user states a status; otherwise omit it."
  action-title:
    description: "One full sentence (verb + number + implication), {typography.action-title}, navy, max two lines, followed by a 1px {colors.rule} hairline at 248px."
  source-line:
    description: "'Source:' + 'Note:' in {typography.source}; the two keywords in ink 600, the rest muted. If the user gives no source, a neutral line ('Source: figures provided by the presenter') that is listed as drafted; never an invented organisation."
  footer:
    description: "1px rule, deck label left in {colors.faint}, page number right ('4 / 11', current page navy 600)."
  chart-head:
    description: "Chart title (24px 600 ink) + unit line (20px muted), 1px rule below, 24px gap to the plot."
  callout:
    background: "{colors.navy-05}"
    borderTop: "4px solid {colors.accent}"
    padding: "28px 32px 32px"
    description: "The so-what box: teal label, optional 64px figure, 22px text. At most one per slide; it restates the slide's teal fact."
  column-chart:
    description: "CSS grid of bars, height = value / max. Direct value labels, 2px ink baseline, no y-axis, no gridlines."
  hbar-chart:
    description: "Rows of name (230px) | track | value (92px). Optional dashed reference line (median, target)."
  stacked-column:
    description: "Column whose bar is a flex column-reverse of segments sized in %; 2px white separators; legend aligned to the last column."
  waterfall:
    description: "Each step floats from --lo to --hi; totals navy, movements navy-30, the message steps accent; thin connectors at the running total."
  matrix-2x2:
    description: "Plot with configurable thresholds, quadrant labels in the corners, bubbles positioned by % with diameter by size, letters inside, legend table beside."
  harvey-ball:
    description: "30px circle, 2px navy border, conic-gradient fill at 0/25/50/75/100%."
  data-table:
    description: "Uppercase {typography.label} header (Chinese: {typography.label-zh}) with 2px ink rule, 21px cells 44-64px high (taller when there are fewer rows, so the table ends near the band bottom), hairline rows, numbers right-aligned, flagged rows in accent-tint with a 4px accent left bar, bold total row with 2px rule."
  gantt:
    description: "Workstream column 380px + N period columns; bars positioned by start/width in periods and coloured by workstream type in the navy ladder; milestone diamonds; run-rate summary row whose quoted value is the one teal element."
---

# Consulting Report

> **Attribution.** Original design by slides-commons (MIT). This system is not derived from a frontend-slides preset and does not reproduce any consulting firm's branding, templates or proprietary chart styles; it follows the general, widely shared conventions of evidence-led business writing (action titles, source lines, direct labelling). The demo deck's companies, people and figures are fictional.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its cell, no chart label collides with another, and the body never reaches the source line. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers) and of every component below.

## Overview

Consulting Report is the look of a **top-tier strategy deliverable**: white paper, navy ink, one disciplined accent, and slides that read as arguments. The reader should be able to read only the action titles, in order, and get the whole story; everything below a title is the evidence for that sentence.

The frame is identical on every content slide:

- **Top:** a section tracker (three to six short section names with a 4px bar above each; the current one navy) and, only when the user states a status, a status tag top-right (`PRELIMINARY`).
- **Action title:** one full sentence in Source Serif 4 semibold, navy, two lines at most, over a hairline.
- **Body band:** 1760 × 654px for charts, tables and text, filled from its top (276px) to its bottom (930px). Usually two columns (chart + so-what, or two charts).
- **Source line:** `Source: … Note: …` in 18px, directly above the footer.
- **Footer:** hairline, deck label left, page number right.

**Key characteristics**

- Pure white `#FFFFFF` canvas on every slide, including the cover. No background tints, photos or gradients.
- Conclusion first: the title states the finding with a number ("Operating margin fell 6.1 points in three years, the steepest decline among five peers"), never a topic ("Margin overview").
- Data in navy and navy tints; **teal marks one fact per slide**, the thing the title is about. That fact may be teal in each place it appears (its bar in two charts, its flagged rows, its option column, the callout that quantifies it), but nothing else on the slide is teal.
- Charts are labelled directly: value labels on bars, no y-axis, no gridlines, no legend boxes when a direct label fits.
- Every evidence slide has a source line. Demo or estimated data says so; data without a known source gets a neutral source line (see "Chrome the user did not provide").
- Dense but orderly: 6–12 numbers per slide is normal; alignment and hairlines keep it calm.

**Density philosophy: high.** One message per slide, but a lot of proof. A typical slide holds an action title, one or two charts or a 10-row table, and a so-what box or three findings. When a slide needs a second message, it needs a second slide.

## Signature Moves

- **Action titles.** Every evidence slide opens with a one-sentence navy serif finding over a hairline, so reading only the titles tells the whole story.
- **One teal fact per slide.** Data is drawn in the navy ladder; teal marks only the so-what, the single fact the title states, wherever that fact appears (its bar, its rows, its option column, its callout). Numerals, bullets and rules are never teal.
- **Section tracker.** Short section names under 4px bars run across the top with the current one in navy; an optional status tag ("Preliminary") sits top-right when the user gives a status.
- **Directly labelled charts.** Values sit on the bars with no y-axis, gridlines or legend boxes, and no red or green; direction comes from the minus sign and the geometry.
- **Source line on every evidence slide.** An 18px "Source: … Note: …" line sits just above the footer and marks demo or estimated data as such.

## Colors

### Palette

- **Paper** (`{colors.paper}` #FFFFFF): every slide background. `--slide-bg` is paper; the letterbox (`--stage-bg`) is a light grey `{colors.stage-bg}` #E9ECF0 so the white page reads as a page.
- **Navy** (`{colors.navy}` #0B2545): action titles, cover title, totals in charts, the focus series, active tracker segment, table header rule colour for emphasis, the recommendation panel.
- **Navy ladder** — the only series colours:
  - `{colors.navy-60}` #4F6A8F — second series, neutral pills, list dashes.
  - `{colors.navy-30}` #A3B3C9 — neutral series, waterfall movements, comparison bars.
  - `{colors.navy-12}` #E1E7EF — lightest series, tracks, inactive tracker bars, Gantt gridlines.
  - `{colors.navy-05}` #F3F6F9 — callout and panel fill.
- **Accent** (`{colors.accent}` #087F79, teal; ≈ 4.8:1 on white) and **accent tint** (`{colors.accent-tint}` #E3F1EF): the so-what. The highlighted bar, the flagged table rows, the recommended option column, the quick-win quadrant, the callout's top border and label, a `.hl` phrase in body text, the current row of a contents slide, the numbers of the decisions requested.
- **Ink** (`{colors.ink}` #1B2433): body text and data labels. **Muted** (`{colors.muted}` #5A6474): units, secondary text, source line. **Faint** (`{colors.faint}` #8C95A3): footer, inactive tracker. **Rule** (`{colors.rule}` #D3DAE3): hairlines.

- **On navy** (aliases, not new colours): `{color-aliases.on-navy}` = paper for statements and figures; `{color-aliases.on-navy-muted}` = navy-30 #A3B3C9 (≈ 7:1 on navy) for labels and captions; `{color-aliases.on-navy-rule}` = navy-60 #4F6A8F for rules inside a navy panel.

The tokens above are the complete palette. Do not introduce other hex values, `rgba()` tints of white or black, or opacity-faded text; use the nearest token instead.

### Defaults and rules

- Text on navy panels is paper (white); labels and captions on navy are navy-30; rules on navy are navy-60. Teal is never used on navy (too little contrast).
- White text on the accent is allowed on fills ≥ 20px tall (stacked segments, bubbles); otherwise use accent-coloured text on white.
- Negative numbers are **not** red. This system has no semantic red/green: direction comes from the minus sign and the chart geometry, emphasis from teal. (If a client insists on red/green, use them only in tables, never as series colours.)
- **Teal test:** cover the title and look at the teal; every teal element must point to the same fact. If teal marks two different facts, or marks something structural (a list numeral, a bullet, a category in a legend that is not the title's subject), one of them is wrong.

## Typography

### Font Family

- **Source Serif 4** — Google Fonts, weight 600 (400 available). Action titles, cover title, recommendation statement, section numerals in tables of contents and findings lists.
- **IBM Plex Sans** — Google Fonts, weights 400/500/600. Everything else: body, labels, chart titles, data labels, tables, trackers, sources, footers. Plex has true tabular figures; Source Serif 4 is only used where column alignment does not matter.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:wght@400;600&display=swap" rel="stylesheet">
```

Set `font-variant-numeric: tabular-nums lining-nums` on `.slide` so every figure in tables and charts aligns.

### Type Scale

| Token | Size / line-height | Family | Use |
|---|---|---|---|
| `{typography.cover-title}` | 92 / 1.06 | Source Serif 4 600 | Cover title, up to 3 lines |
| `{typography.callout-figure}` | 64 / 1.0 | Plex Sans 600 | The one figure in a callout |
| `{typography.big-figure}` | 54 / 1.0 | Plex Sans 600 | Executive-summary figures |
| `{typography.action-title}` | 46 / 1.2 | Source Serif 4 600 | Action title, max 2 lines |
| `{typography.panel-statement}` | 40 / 1.22 | Source Serif 4 600 | Recommendation statement on navy |
| `{typography.section-numeral}` | 34–40 | Source Serif 4 600 | Numbered findings, contents numerals |
| `{typography.lead}` | 26 / 1.38 | Plex Sans 600 | Lead sentence in summary rows |
| `{typography.chart-title}` | 24 / 1.3 | Plex Sans 600 | Chart / table title; data labels on bars |
| `{typography.body}` | 22 / 1.42 | Plex Sans 400 | Findings, bullets, callout text |
| `{typography.table}` | 21 / 1.3 | Plex Sans 400 | Table cells, bullet lists |
| `{typography.axis}` | 20 | Plex Sans 400 | Category labels, unit lines, small notes |
| `{typography.label}` | 18, 600, +0.06em, UPPERCASE | Plex Sans | Latin tracker, labels, table headers, tags, pills, Gantt bar labels |
| `{typography.label-zh}` | 20, 500, 0, no transform | Noto Sans SC | The same roles when the text is Chinese |
| `{typography.source}` | 18 / 1.4 | Plex Sans 400 | Source and note line, footer |

**Size floor (the one rule; every other size in this document respects it):** nothing on a slide is smaller than 18px. 18px is allowed only for uppercase Latin labels (`{typography.label}`), axis tick numbers, the source line and the footer. Chinese text is never smaller than 20px except in the source line and the footer, which stay 18px in every language. Table cells and chart labels stay ≥ 19px (Chinese ≥ 20px).

### Writing action titles

- One sentence, 12–22 words, **max two lines**. The title box is 1640px wide: about 75 Latin characters per line at 46px. If it needs three lines, the slide has two messages.
- Pattern: *subject + verb + quantified finding + implication*. "Energy and empty running explain 4.8 of the 6.1-point margin decline; pricing and mix recovered only 2.3 points."
- Sentence case, no final period, no colon-led labels ("Margin: down"), no questions.
- The number in the title must appear in the evidence below it (same rounding).
- Contents, cover and appendix may use descriptive titles; every evidence slide may not.

## Number Formatting

| Case | Rule | Example |
|---|---|---|
| Figures | Tabular lining numerals everywhere (`tabular-nums lining-nums`) | `58.0` aligned over `412.0` |
| Decimals | Same precision within a column or series; one decimal for €m and percentage points | `4.5`, `0.8`, `12.7` |
| Negatives | True minus sign U+2212 (`−`), not a hyphen; no parentheses in this system | `−6.1 pts`, `−0.6` |
| Changes | Explicit sign on deltas | `+1.6`, `−3.1` |
| Units | In the chart/table unit line (`€m`, `% of revenue`), not repeated in every cell; keep the unit on hero figures | header `Revenue, €m`, cells `58.0`; figure `€412m` |
| Percent vs points | Changes in a percentage are `pts` (percentage points) | margin `8.9%` → `2.8%` = `−6.1 pts` |
| Currency | Symbol before number, scale suffix lowercase, no space | `€23.6m`, `$4.5bn`, `€61` |
| Thousands | Comma separator in English, 4+ digits | `1,900`, `1,180` |
| Ranges | En dash, no spaces | `FY21–FY24`, `26–28%` |
| Rounding | Shares in 100% charts may not sum to 100; say so in the note | `Note: shares may not sum to 100% due to rounding.` |
| Alignment | Numbers right-aligned in tables; text left; headers follow their column |  |

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Tracker | `top: 44px; left: 80px` (items 196px wide, 6px gap) |
| Status tag | `top: 44px; right: 80px` |
| Action title | `top: 116px; left/right: 80px; max-width: 1640px` |
| Title hairline | `top: 248px` (as `.slide.content::after`) |
| Body | `top: 276px; bottom: 150px; left/right: 80px` → 1760 × 654 |
| Source line | `bottom: 92px` (≤ 2 lines) |
| Footer | `bottom: 36px`, 1px top rule, 12px padding |

### Body compositions

| Split | Columns | Used for |
|---|---|---|
| `c-6-6` | 1fr 1fr, 72px gap | Two charts side by side; chart + chart-with-callout |
| `c-7-5` | 7fr 5fr, 72px gap | Chart + findings list |
| `c-8-4` | 1180px + rest | Wide chart (waterfall) + callout |
| Matrix | 1040px + rest, 64px gap | 2×2 + legend table |
| Full width | 1760px | Data table, options table, Gantt |

Within a column: chart head → 24px → plot → 12px → category labels.

### Filling the body band

The body band runs from 276px to 930px (654px). Every content slide uses all of it: the lowest element (a chart's category labels, the last table row, the bottom of a callout) ends between 890px and 930px, and the columns of a split end on the same line. A slide whose evidence stops halfway down reads as unfinished, however good the chart.

- **Start at the top, end at the bottom.** Body content starts at 276px; never centre a short block vertically in the band.
- **Size charts from the band, not from the demo.** Plot height `--ph` = 654 − chart head (≈ 94px) − category labels (≈ 40px) − anything else in the column (legend, callout + gap). A chart alone in its column gets `--ph` ≈ 500px; a chart above a callout ≈ 300–340px. Horizontal bars: make the track 40–56px and the row gap 18–28px so the rows fill the space above whatever closes the column.
- **Columns are flex columns.** Give each column `display: flex; flex-direction: column; height: 100%` and put the closing element (callout, note, total, key figure) last with `margin-top: auto`, so both columns end at the band bottom.
- **Tables:** 44px rows for 10–12 body rows; with fewer rows raise the row height (up to 64px) so the total row ends near 930px.
- **Lists and findings:** three findings rarely fill a column. Add one supporting element that proves the same fact: a callout with the key figure, a 3–5 row mini table, or a small bar chart. Do not stretch the line spacing or add filler bullets.
- **Split or merge.** If the evidence needs more than the band at the floor sizes, it is two messages: split into two slides. If it fills less than half the band and no honest supporting element exists, merge it into the neighbouring slide that argues the same message (as a second chart in a `c-6-6`), rather than leaving white space.

The demo deck shows the pattern: slide 4 (column chart at full column height beside bars closed by a bottom-aligned callout), slide 5 (stacked columns beside findings closed by a callout), slide 6 (a full-height waterfall), slide 7 (table rows sized to the band).

## Components

### Chrome

- **Tracker**: `<ol class="tracker">` with one `<li>` per section; add `.on` to the current section. Keep names to one or two words (Summary / Diagnosis / Options / Recommendation / Roadmap). The cover has no tracker.
- **Status tag** (optional): `<span class="tag">Preliminary</span>`. Use PRELIMINARY, DRAFT, FOR DISCUSSION or FINAL, only when the user gives a status.
- **Source line**: `<p class="source"><b>Source:</b> … <b>Note:</b> …</p>`. Name the data source the user gave and say "Demo data" / "Estimate" where true.
- **Footer**: deck label (client · project · meeting) and `<span class="pagenum" data-pagenum></span>`, filled by script.

### Chrome the user did not provide

The frame is fixed, but its contents come from the user. Do not invent facts to fill it:

- **Status tag:** omit it when the user states no status (the tracker stands alone; nothing replaces the tag). If the user asks for a tag without wording, use `DRAFT` and list it as drafted.
- **Source line:** keep one on every evidence slide. When the user gives no source, write a neutral line such as `Source: figures provided by the presenter.` / 「资料来源：汇报人提供的数据」, add `Note: estimate` where the figure is an estimate, and list these lines as drafted in your final reply. Never name an organisation, survey or report the user did not mention.
- **Cover:** brand line = the organisation the user named (otherwise omit the brand line; keep the abstract mark only if there is a name beside it). Meta columns only for fields the user gave (two columns are fine); date only if given.
- **Footer deck label:** built from the deck title the user gave (and client / meeting if given).

### Column chart (pure CSS)

```html
<div class="colchart" style="--n:4; --max:10; --ph:400px;">
  <div class="plot">
    <div class="bar focus" style="--v:8.9"><b>8.9</b></div>
    …
    <div class="bar hi" style="--v:2.8"><b>2.8</b></div>
  </div>
  <div class="xlab"><span>FY21</span>…</div>
</div>
```

- `.plot` is a grid of `--n` equal columns, `align-items: end`, height `--ph`, 2px ink baseline. Each `.bar` is `width: var(--bw, 55%)` and `height: calc(var(--v) / var(--max) * 100%)`.
- `--max` = a round number ≥ 1.1 × the largest value (leaves room for the label).
- Value label `<b>` sits 8px above the bar (24px, 600). No y-axis, no gridlines.
- Colours: neutral `navy-30`; series in focus `navy`; the one message bar `.hi` = accent (its label teal too).
- Annotations inside `.plot`: `.ref` — dashed horizontal line at `--y` from `--x0`; `.delta` — vertical bracket from `--y0` to `--y1` with a teal label (e.g. "−6.1 pts").

### Horizontal bar chart

- `.hrow` grid `230px 1fr 92px`: name | track (40px high) | value right-aligned. `.fill` width = `--v / --max`. Sort rows by value; the subject row `.hi` in accent with teal name and value.
- Negative-only data (declines) is drawn as magnitude bars with `−` labels; mixed signs need a centre axis (two half-tracks).
- Reference line: `.hbars-plot > .refline` at `--v`, dashed navy, label below the last row ("Peer median −2.3").

### 100% stacked column

- `.bar.stack` is `display: flex; flex-direction: column-reverse`; each `.seg` has `height: calc(var(--s) * 1%)` and shows its share inside (19px). 2px paper border-top separates segments.
- Segment colours bottom-up: `c1` accent (the component the title is about), `c2` navy, `c3` navy-60 (white text), `c4` navy-30, `c5` navy-12 (ink text). Max five segments; merge the rest into "Other".
- Absolute totals go above the columns (`<b>€61</b>`); the unit line says so.
- Legend to the right, items in stack order with heights matching the last column's segments so each label sits beside its segment. Bold the one or two series the title names.

### Waterfall (pure CSS)

```html
<div class="wf" style="--n:8; --max:12; --ph:410px;">
  <div class="plot">
    <div class="step total"><div class="b" style="--lo:0;--hi:8.9"></div><span class="v" style="--lo:0;--hi:8.9">8.9</span></div>
    <div class="step up"><div class="b" style="--lo:8.9;--hi:10.5"></div><span class="v" …>+1.6</span></div>
    <div class="step down hi"><div class="b" style="--lo:8.1;--hi:11.2"></div><span class="v" …>−3.1</span></div>
    …
  </div>
  <div class="xlab"><span class="t">FY21 margin</span>…</div>
</div>
```

- Compute a running total. For an increase: `lo` = previous total, `hi` = new total. For a decrease: `hi` = previous total, `lo` = new total. Totals start at 0.
- `.b` is absolutely positioned: `bottom: lo/max`, `height: (hi−lo)/max`, 18% side inset. Connectors (`::after`, 1.5px faint) run to the next bar at the running total: top edge for `.up`/`.total`, bottom edge for `.down`.
- Labels: above the bar for totals and increases, below for decreases; explicit sign on movements.
- Colours: totals navy; movements navy-30; the movements the title names `.hi` accent.
- **Check:** the last total must equal the first plus the sum of movements. Write the arithmetic out before building.

### 2×2 matrix

- Set `--xmax`, `--ymax` (axis ranges) and `--xt`, `--yt` (thresholds) on `.matrix`; the quadrant grid splits at the thresholds, so quadrants need not be equal.
- Bubbles: `left = x/xmax`, `bottom = y/ymax`, `translate(-50%, 50%)`, diameter `--d` (e.g. 28px + 8px × value). Put a letter inside, not a name; list names in a legend table beside the matrix.
- Quadrant labels in the four outer corners (18px uppercase); the target quadrant (e.g. high impact / low complexity) gets the accent tint and teal label, its bubbles teal.
- Before finishing, check every bubble clears the corner labels and other bubbles (centre distance > sum of radii).

### Harvey balls

`<i class="hb" style="--v:75"></i>` — 30px circle, 2px navy border, `conic-gradient(navy 0 calc(var(--v) * 1%), white 0)`. Values 0 / 25 / 50 / 75 / 100 only; full = most favourable (say so in the note). Always pair with a 1–3 word text label in the cell.

### Data table

- `table.data`, `table-layout: fixed`, explicit `<colgroup>` widths. Header: 18px uppercase muted, 2px ink bottom rule. Cells: 21px, 44px rows, 1px rule rows, `white-space: nowrap` (shorten text rather than wrap).
- Numbers `.r` right-aligned with matching decimals; units in the header (`Revenue, €m`).
- Flag rows the title talks about with `tr.flag` (accent tint + 4px accent left bar). Total row `tr.total`: 600 weight, 2px ink top rule.
- In-cell bars (`.util`): 120×12px track in navy-12 with a navy-60 fill (accent in flagged rows), followed by the value.
- Status pills (`.pill`): 1.5px outline, `{typography.label}` (18px uppercase; Chinese 20px); accent for the action the title is about, navy-60 otherwise.
- Max ≈ 12 body rows + total at 44px. More rows → split or move to an appendix.

### Options table

Criteria column 400px + one column per option. The header cell holds a label ("Option B · Recommended"), the option name (26px 600 navy) and a one-line description. The recommended column: accent tint on every cell, 6px accent top border, values in navy 600. Quantitative rows first, Harvey-ball rows next, "Overall assessment" last behind a 2px rule.

### Gantt roadmap

- `.gantt` grid: `380px repeat(N, 1fr)`; header row of periods; per workstream a `.ws` cell (name + small owner/lever) and a `.lane` spanning all periods, 76px high, with faint period gridlines.
- `.gbar` position: `left = s/N`, `width = w/N` (start index and length in periods). Colours by workstream type in the navy ladder (navy / navy-60 with paper text, navy-30 with navy text) with a legend. Bars carry a short label (`{typography.label}` size: 18px 600, Chinese 20px).
- `.ms` milestone diamonds at `--at` (period boundary). Keep diamonds inside the lane (`--at < N`).
- Optional summary row (`.ws.sum` + `.lane.sum`) for the cumulative value per period; the value the title quotes (usually the last) is the slide's one teal element.

### Other parts

- **Callout** (`.callout`): navy-05 fill, 4px accent top border, teal label, optional 64px figure, 22px text. At most one per slide, and it quantifies the slide's teal fact.
- **Findings list** (`.findings`): serif navy numeral (34px) + 22px paragraph with a bold navy lead phrase, hairline-separated.
- **Dash list** (`ul.dash`): 21px items with a 12×2px navy-60 dash.
- **Recommendation panel** (`.reco-panel`): navy block; label in on-navy-muted (navy-30), paper serif statement, three paper figures (46px) above captions in navy-30, behind a 1px navy-60 rule.
- **Decisions list**: 36px outlined accent number squares, 24px navy heading, 20px muted detail. The decisions are the recommendation slide's teal fact, so nothing else on that slide is teal.

## Slide Archetypes

The demo deck (11 slides) implements each of these.

1. **Cover** — brand mark + firm name top-left, status tag top-right; label (meeting · date) in teal, `cover-title` (≤ 3 lines; use `&#8209;` non-breaking hyphens in compound words), sub-title 32px muted; three meta columns (prepared for / engagement / status) with hairlines; an abstract rising-bar motif bottom-right (navy tints → navy → one teal bar).
2. **Executive summary** — three rows *Situation / Complication / Resolution*: label column 240px, lead sentence + 2 dash bullets, a big figure right. The resolution row is accent-tinted with a 4px teal left bar.
3. **Contents** — numbered sections (serif numerals, title, one-line description, page number), the current section in teal with a teal top rule; right column: the questions this document answers, closed by a bottom-aligned panel. A contents slide works as a divider: the "current" section is the one that starts on the next page, and the tracker marks that same section (the demo's contents is page 3, Diagnosis starts on page 4, so both the row and the tracker show Diagnosis). If the contents slide comes before the first section, highlight section 1. Section numbers are ordinals (1, 2, 3 …) matching the order of the tracker, never page numbers; the right-hand column gives the page on which each section starts, which must equal that slide's footer page number. Recount after adding or removing slides.
4. **Two charts** — column chart with reference line and delta bracket + peer horizontal bars with median line + callout.
5. **Stacked composition** — 100% stacked columns with totals and aligned legend + three numbered findings.
6. **Bridge** — waterfall across 8 steps + callout with the key figure + dash bullets.
7. **Data table** — 11 rows + total, in-cell bars, flagged rows, action pills.
8. **Prioritisation** — 2×2 bubble matrix with uneven thresholds + legend table.
9. **Options** — 3-option table with Harvey balls and a recommended column.
10. **Recommendation** — navy panel with the recommendation and three figures; decisions requested; key risks table.
11. **Roadmap** — Gantt with milestones, bars in the navy ladder, and an EBIT run-rate row whose final value is the teal fact.

Other slide types (market sizing, customer segmentation, org chart, interview quotes) are built from the same parts: an action title, a chart head, navy-ladder data with one teal fact, a source line, and a body that fills the band.

## Motion

Quiet and functional. `.reveal` elements fade and rise 14px (0.5s, staggered 70ms by `--i`); bars `.grow` scale up from the baseline, horizontal fills `.growx` from the left (0.7s). Nothing loops, bounces or rotates. `prefers-reduced-motion` is handled by viewport-base.css. A printed or exported deck must read identically without motion.

## Do's and Don'ts

### Do

- Write the action title first; build the slide to prove it.
- Label data directly and delete axes, gridlines and legends the labels make redundant.
- Use teal for one fact per slide, the so-what; everything else navy ladder.
- Fill the body band to its bottom (890–930px); size charts from the band height.
- Keep units in headers and unit lines, decimals consistent, minus signs real.
- Put a source line on every evidence slide; mark demo, estimated and illustrative data; use a neutral source line (listed as drafted) when the user gives none.
- Reconcile numbers across slides (summary ↔ charts ↔ tables ↔ recommendation).
- Split a slide rather than shrink type below the size floor.

### Don't

- Don't use topic titles ("Market overview") on evidence slides, or titles longer than two lines.
- Don't add a second accent hue, colours outside the palette (including `rgba()` whites), red/green semantics, gradients, shadows, rounded cards or 3D/pie/donut charts.
- Don't invent chrome: no status tag the user did not give, no named sources, firms or dates the user did not mention.
- Don't tint the slide background; the canvas is always pure white.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients.
- Don't copy a real firm's logo, colours, tracker or chart styling; keep the brand mark abstract.
- Don't wrap table cells to fit long text — shorten the text or widen the column.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

Chinese strategy and steering-committee decks are a primary use case for this system. The serif/sans split maps directly onto 宋体/黑体 conventions.

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Action title, cover title, recommendation statement | Source Serif 4 600 | **Noto Serif SC** (思源宋体) | 600–700 |
| Lead sentences, chart titles, emphasis | IBM Plex Sans 600 | **Noto Sans SC** (思源黑体) | 500–700 |
| Body, tables, chart labels, sources | IBM Plex Sans 400 | Noto Sans SC | 400 |
| Labels, tracker, table headers | IBM Plex Sans 600 | Noto Sans SC | 500 |

Source Serif 4 and Noto Serif SC share the same design lineage (Adobe's Source family), so mixed Latin/Chinese action titles look like one typeface. If the deck must stay all-sans (some clients prefer 黑体 titles), set the title stack to `'IBM Plex Sans', 'Noto Sans SC'` at 700 — keep everything else unchanged.

### Mixed-Content Strategy

Latin first, Chinese fallback, in one stack per role:

```css
--font-title: 'Source Serif 4', 'Noto Serif SC', Georgia, serif;
--font-sans:  'IBM Plex Sans', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Latin letters and digits render in Source Serif 4 / IBM Plex Sans; Chinese characters fall through to Noto. Figures inside Chinese sentences therefore stay in Plex Sans tabular digits — keep it that way so tables align.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Source+Serif+4:wght@400;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;700&display=swap" rel="stylesheet">
```

Load only the weights you use; Noto Serif SC is large.

### Universal CJK Adjustments

Add `lang="zh-CN"` to `<html>` and these overrides:

```css
:lang(zh) .action      { font-size: 44px; font-weight: 700; line-height: 1.3; }
:lang(zh) .s-cover h1  { font-size: 84px; line-height: 1.2; }
:lang(zh) .lead        { line-height: 1.5; }
:lang(zh) .slide       { line-height: 1.6; }
:lang(zh) ul.dash li, :lang(zh) .findings p { line-height: 1.65; }
/* labels: 20px, weight 500, no uppercase ({typography.label-zh}) */
:lang(zh) :is(.label, .tracker li, .tag, table.data th, .gantt > .h, .gantt > .ws small,
              .pill, .gbar, .hbars-plot .refline span) { font-size: 20px; font-weight: 500; text-transform: none; }
:lang(zh) .tracker li.on { font-weight: 700; }
/* CJK letter-spacing is 0 everywhere: titles, labels, figures */
:lang(zh) .slide, :lang(zh) .slide * { letter-spacing: 0 !important; }
```

`template.html` already contains this block (inactive while `<html lang="en">`); copy it as is.

- **Weights:** Noto Serif SC 700 for action titles (600 looks thin next to Latin 600); Noto Sans SC 400 for body and tables, 500 for labels, 700 for lead sentences and chart titles. Never below 400.
- **Sizes:** follow the size floor in Typography: Chinese text ≥ 20px everywhere (labels, tracker, tag, table headers, pills, Gantt labels, chart labels, table cells, body); only the source line and footer stay 18px.
- **Letter-spacing:** 0 for all Chinese text, including titles, labels and the tracker. The positive tracking of Latin uppercase labels and the negative tracking of Latin titles do not apply.
- **Action-title length:** the 1640px title box holds **37 Chinese characters per line at 44px** (a Latin letter or digit counts as about half). Write 20–60 characters. Up to about 34 characters fit on one line; 35–60 characters take two lines: insert a manual `<br>` at a phrase boundary (usually after the comma that separates finding and implication) so the two lines are of similar length, each ≤ 34 characters. More than 60 characters, or a title that needs a third line, means the slide has two messages: split it. Do not narrow the title box to force a break. Chinese titles state the conclusion the same way: 「若整合四个低效仓库并引入能源价格联动，<br>经营利润率可在 FY26 回升至 8.5%」.
- **Line breaking:** `text-wrap: balance` can split a word (联｜动). Break titles manually with `<br>` at a phrase boundary, or wrap units that must stay together in `<span style="white-space:nowrap">`. Never leave one character alone on the last line. Do not use `word-break: keep-all` for Chinese.
- **Punctuation:** full-width （，。：；！？「」） in Chinese sentences; no final 。 in titles; half-width punctuation inside numbers and English names.
- **Mixed CN/EN numbers:** one space between Chinese and Latin/digits (盘古之白): 「营收 €412m，拥有 11 个仓库」. No space between a number and %, or between a currency symbol and a number. Units may stay Latin (`€m`, `pts`) or become Chinese in the unit line (单位：百万欧元); be consistent per deck.
- **Number scale:** for Chinese audiences prefer 万 / 亿 in prose (「4.12 亿欧元」) but keep table and chart values in one consistent scale with the unit in the header (`营收（百万欧元）`). Percentage-point changes: 「下降 6.1 个百分点」 in titles, `−6.1 pts` or `−6.1 个百分点` in charts.
- **Dates and periods:** `FY21–FY24`, `2025 年第二季度` or `2025Q2` — pick one style per deck.
- **Tracker:** two- to four-character section names (摘要 / 诊断 / 方案 / 建议 / 路线图) at 20px fit the 196px segments; uppercase and tracking do not apply.

### Aesthetic Notes for This System

The system's authority comes from the serif title over a hairline and from orderly, directly labelled data; both transfer to Chinese unchanged. A Chinese action title in Noto Serif SC 700 reads like a formal report heading; body text in Noto Sans SC 400 keeps tables crisp. Chinese text is denser, so the same evidence takes fewer lines and a Chinese slide is more likely to stop halfway down the band. Fill the freed space the way "Filling the body band" describes (taller charts, a callout or mini table that proves the same fact), not with more bullets.

### Known CJK Gap

`text-wrap: balance` and automatic line breaking are tuned for Latin; Chinese titles need manual breaks. Noto Serif SC has no exact 600 match for Source Serif 4 600 in all browsers; 700 is the closest visual match. Harvey-ball and tracker components are language-neutral.

## Iteration Guide

1. Write all action titles first, in order; check the story reads from titles alone.
2. For each slide pick the one chart type that proves the title (comparison → bars, composition → stacked, change decomposition → waterfall, prioritisation → 2×2, choice → options table, plan → Gantt).
3. Compute every derived number (totals, bridges, shares, paybacks) before building; reconcile across slides.
4. Build on the fixed frame: tracker `.on`, action title, body split, source line, footer; status tag only if the user gave a status.
5. Navy ladder for data, teal for the one so-what fact (run the teal test).
6. Use only the type tokens and palette tokens above; respect the size floor.
7. Size every chart and table from the 654px band so the body ends between 890px and 930px.
8. Verify at 1920×1080, 1280×720 and one phone viewport: no overflow, no label collisions, body clear of the source line, no half-empty body band, fonts loaded.

## Known Gaps

- Charts are hand-built HTML/CSS with inline `--v` values; there is no data binding. Change a value and its label together.
- No line-chart component; for time series with many points, use the SVG line pattern from the Boardroom Quarterly template recoloured to the navy ladder.
- No image archetype. If a photo or logo is unavoidable, place it in a body column with square corners and no border, never behind text.
- The cover motif is decorative; do not turn it into a fake chart with invented values.
