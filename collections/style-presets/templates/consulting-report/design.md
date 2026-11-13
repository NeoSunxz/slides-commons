---
version: alpha
name: Consulting Report
description: A white-canvas strategy-deliverable system in which every slide states its conclusion as a full-sentence action title and then proves it with evidence. Source Serif 4 (semibold) carries the action titles; IBM Plex Sans carries everything else with tabular figures. Every content slide shares the same frame — a five-segment section tracker and a status tag at the top, a two-line action title over a hairline, a body band for charts and tables, a source line, and a footer with the deck label and page number. Deep navy and a ladder of navy tints carry the data; one restrained teal accent marks the single "so-what" per slide. Charts (column, horizontal bar, 100% stacked, waterfall, 2×2 bubble matrix, Harvey balls, Gantt) are pure HTML/CSS with direct labels and no gridlines. Original design by slides-commons.
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
    letterSpacing: 0.08em
    textTransform: uppercase
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
  action-title: "top 116px, max-width 1640px, max two lines (ends before 240px)"
  source-line: "bottom 92px, max two lines"

components:
  tracker:
    position: "absolute; top: 44px; left: 80px"
    description: "Ordered list of 3-6 section names. Each item 196px wide with a 4px top bar: {colors.navy-12} inactive, {colors.navy} active. Text {typography.label} 18px, {colors.faint} inactive, {colors.navy} 600 active."
  status-tag:
    description: "Top-right box: 1.5px {colors.navy} border, {typography.label} in navy, e.g. PRELIMINARY / DRAFT / FINAL."
  action-title:
    description: "One full sentence (verb + number + implication), {typography.action-title}, navy, max two lines, followed by a 1px {colors.rule} hairline at 248px."
  source-line:
    description: "'Source:' + 'Note:' in {typography.source}; the two keywords in ink 600, the rest muted."
  footer:
    description: "1px rule, deck label left in {colors.faint}, page number right ('4 / 11', current page navy 600)."
  chart-head:
    description: "Chart title (24px 600 ink) + unit line (20px muted), 1px rule below, 24px gap to the plot."
  callout:
    background: "{colors.navy-05}"
    borderTop: "4px solid {colors.accent}"
    padding: "28px 32px 32px"
    description: "The so-what box: teal label, optional 64px figure, 22px text."
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
    description: "Uppercase 18px header with 2px ink rule, 21px cells 44px high, hairline rows, numbers right-aligned, flagged rows in accent-tint with a 4px accent left bar, bold total row with 2px rule."
  gantt:
    description: "Workstream column 380px + N period columns; bars positioned by start/width in periods; milestone diamonds; run-rate summary row."
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

- **Top:** a section tracker (five short section names with a 4px bar above each; the current one navy) and a status tag top-right (`PRELIMINARY`).
- **Action title:** one full sentence in Source Serif 4 semibold, navy, two lines at most, over a hairline.
- **Body band:** 1760 × 654px for charts, tables and text. Usually two columns (chart + so-what, or two charts).
- **Source line:** `Source: … Note: …` in 18px, directly above the footer.
- **Footer:** hairline, deck label left, page number right.

**Key characteristics**

- Pure white `#FFFFFF` canvas on every slide, including the cover. No background tints, photos or gradients.
- Conclusion first: the title states the finding with a number ("Operating margin fell 6.1 points in three years, the steepest decline among five peers"), never a topic ("Margin overview").
- Data in navy and navy tints; **teal appears once per slide** for the thing the title is about (one bar, one row, one option, one callout).
- Charts are labelled directly: value labels on bars, no y-axis, no gridlines, no legend boxes when a direct label fits.
- Every evidence slide has a source line. Demo or estimated data says so.
- Dense but orderly: 6–12 numbers per slide is normal; alignment and hairlines keep it calm.

**Density philosophy: high.** One message per slide, but a lot of proof. A typical slide holds an action title, one or two charts or a 10-row table, and a so-what box or three findings. When a slide needs a second message, it needs a second slide.

## Colors

### Palette

- **Paper** (`{colors.paper}` #FFFFFF): every slide background. `--slide-bg` is paper; the letterbox (`--stage-bg`) is a light grey `{colors.stage-bg}` #E9ECF0 so the white page reads as a page.
- **Navy** (`{colors.navy}` #0B2545): action titles, cover title, totals in charts, the focus series, active tracker segment, table header rule colour for emphasis, the recommendation panel.
- **Navy ladder** — the only series colours:
  - `{colors.navy-60}` #4F6A8F — second series, neutral pills, list dashes.
  - `{colors.navy-30}` #A3B3C9 — neutral series, waterfall movements, comparison bars.
  - `{colors.navy-12}` #E1E7EF — lightest series, tracks, inactive tracker bars, Gantt gridlines.
  - `{colors.navy-05}` #F3F6F9 — callout and panel fill.
- **Accent** (`{colors.accent}` #087F79, teal; ≈ 4.8:1 on white) and **accent tint** (`{colors.accent-tint}` #E3F1EF): the so-what. The highlighted bar, the flagged table rows, the recommended option column, the quick-win quadrant, the callout's top border and label, a `.hl` phrase in body text.
- **Ink** (`{colors.ink}` #1B2433): body text and data labels. **Muted** (`{colors.muted}` #5A6474): units, secondary text, source line. **Faint** (`{colors.faint}` #8C95A3): footer, inactive tracker. **Rule** (`{colors.rule}` #D3DAE3): hairlines.

### Defaults and rules

- Text on navy panels is white; labels on navy use a light teal `#9FD8D3`.
- White text on the accent is allowed on fills ≥ 20px tall (stacked segments, bubbles, Gantt bars); otherwise use accent-coloured text on white.
- Negative numbers are **not** red. This system has no semantic red/green: direction comes from the minus sign and the chart geometry, emphasis from teal. (If a client insists on red/green, use them only in tables, never as series colours.)
- If two things on one slide are teal, one of them is wrong.

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
| `{typography.label}` | 18, 600, +0.08em, UPPERCASE | Plex Sans | Tracker, labels, table headers, tags |
| `{typography.source}` | 18 / 1.4 | Plex Sans 400 | Source and note line, footer |

**Floor:** nothing on a slide is smaller than 18px. Table cells and chart labels stay ≥ 19px.

### Writing action titles

- One sentence, 12–22 words, **max two lines** at 46px (≈ 75 characters per line). If it needs three lines, the slide has two messages.
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

Within a column: chart head → 24px → plot → 12px → category labels. Callouts align to the top of the body band.

## Components

### Chrome

- **Tracker**: `<ol class="tracker">` with one `<li>` per section; add `.on` to the current section. Keep names to one or two words (Summary / Diagnosis / Options / Recommendation / Roadmap). The cover has no tracker.
- **Status tag**: `<span class="tag">Preliminary</span>`. Use PRELIMINARY, DRAFT, FOR DISCUSSION or FINAL.
- **Source line**: `<p class="source"><b>Source:</b> … <b>Note:</b> …</p>`. Always name the data source and say "Demo data" / "Estimate" where true.
- **Footer**: deck label (client · project · meeting) and `<span class="pagenum" data-pagenum></span>`, filled by script.

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
- Status pills (`.pill`): 1.5px outline, uppercase 17px; accent for the recommended action, navy-60 otherwise.
- Max ≈ 12 body rows + total at 44px. More rows → split or move to an appendix.

### Options table

Criteria column 400px + one column per option. The header cell holds a label ("Option B · Recommended"), the option name (26px 600 navy) and a one-line description. The recommended column: accent tint on every cell, 6px accent top border, values in navy 600. Quantitative rows first, Harvey-ball rows next, "Overall assessment" last behind a 2px rule.

### Gantt roadmap

- `.gantt` grid: `380px repeat(N, 1fr)`; header row of periods; per workstream a `.ws` cell (name + small owner/lever) and a `.lane` spanning all periods, 76px high, with faint period gridlines.
- `.gbar` position: `left = s/N`, `width = w/N` (start index and length in periods). Colours by workstream type (accent / navy / navy-30) with a legend. Bars carry a short label (17px 600).
- `.ms` milestone diamonds at `--at` (period boundary). Keep diamonds inside the lane (`--at < N`).
- Optional summary row (`.ws.sum` + `.lane.sum`) for the cumulative value per period, last value in accent.

### Other parts

- **Callout** (`.callout`): navy-05 fill, 4px accent top border, teal label, optional 64px figure, 22px text. One per slide.
- **Findings list** (`.findings`): serif teal numeral + 22px paragraph with a bold navy lead phrase, hairline-separated.
- **Dash list** (`ul.dash`): 21px items with a 12×2px navy-60 dash.
- **Recommendation panel** (`.reco-panel`): navy block, white serif statement, three figures (46px) behind a white 28% rule.
- **Decisions list**: 36px outlined accent number squares, 24px navy heading, 20px muted detail.

## Slide Archetypes

The demo deck (11 slides) implements each of these.

1. **Cover** — brand mark + firm name top-left, status tag top-right; label (meeting · date) in teal, `cover-title` (≤ 3 lines; use `&#8209;` non-breaking hyphens in compound words), sub-title 32px muted; three meta columns (prepared for / engagement / status) with hairlines; an abstract rising-bar motif bottom-right (navy tints → navy → one teal bar).
2. **Executive summary** — three rows *Situation / Complication / Resolution*: label column 240px, lead sentence + 2 dash bullets, a big figure right. The resolution row is accent-tinted with a 4px teal left bar.
3. **Contents** — numbered sections (serif numerals, title, one-line description, page number), the current section in teal with a teal top rule; right column: the questions this document answers.
4. **Two charts** — column chart with reference line and delta bracket + peer horizontal bars with median line + callout.
5. **Stacked composition** — 100% stacked columns with totals and aligned legend + three numbered findings.
6. **Bridge** — waterfall across 8 steps + callout with the key figure + dash bullets.
7. **Data table** — 11 rows + total, in-cell bars, flagged rows, action pills.
8. **Prioritisation** — 2×2 bubble matrix with uneven thresholds + legend table.
9. **Options** — 3-option table with Harvey balls and a recommended column.
10. **Recommendation** — navy panel with the recommendation and three figures; decisions requested; key risks table.
11. **Roadmap** — Gantt with milestones and an EBIT run-rate row.

Other slide types (market sizing, customer segmentation, org chart, interview quotes) are built from the same parts: an action title, a chart head, navy-ladder data with one teal element, a source line.

## Motion

Quiet and functional. `.reveal` elements fade and rise 14px (0.5s, staggered 70ms by `--i`); bars `.grow` scale up from the baseline, horizontal fills `.growx` from the left (0.7s). Nothing loops, bounces or rotates. `prefers-reduced-motion` is handled by viewport-base.css. A printed or exported deck must read identically without motion.

## Do's and Don'ts

### Do

- Write the action title first; build the slide to prove it.
- Label data directly and delete axes, gridlines and legends the labels make redundant.
- Use one teal element per slide for the so-what; everything else navy ladder.
- Keep units in headers and unit lines, decimals consistent, minus signs real.
- Put a source line on every evidence slide; mark demo, estimated and illustrative data.
- Reconcile numbers across slides (summary ↔ charts ↔ tables ↔ recommendation).
- Split a slide rather than shrink type below 18px.

### Don't

- Don't use topic titles ("Market overview") on evidence slides, or titles longer than two lines.
- Don't add a second accent hue, red/green semantics, gradients, shadows, rounded cards or 3D/pie/donut charts.
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
:lang(zh) .action      { font-size: 44px; font-weight: 700; line-height: 1.3; letter-spacing: 0; }
:lang(zh) .s-cover h1  { font-size: 84px; line-height: 1.2; letter-spacing: 0; }
:lang(zh) .lead        { line-height: 1.5; }
:lang(zh) .slide       { line-height: 1.6; }
:lang(zh) ul.dash li, :lang(zh) .findings p { line-height: 1.65; }
:lang(zh) .label, :lang(zh) .tracker li, :lang(zh) .tag,
:lang(zh) table.data th { letter-spacing: 0.02em; text-transform: none; }
```

- **Weights:** Noto Serif SC 700 for action titles (600 looks thin next to Latin 600); Noto Sans SC 400 for body and tables, 500 for labels, 700 for lead sentences and chart titles. Never below 400.
- **Sizes:** body text ≥ 20px, table cells ≥ 20px, chart labels ≥ 19px. Chinese at 18px is only for the source line.
- **Action-title length:** 22–36 characters (two lines of ≤ 20 characters at 44px). Chinese titles state the conclusion the same way: 「若整合四个低效仓库并引入能源价格联动，经营利润率可在 FY26 回升至 8.5%」.
- **Line breaking:** `text-wrap: balance` can split a word (联｜动). Break titles manually with `<br>` at a phrase boundary, or wrap units that must stay together in `<span style="white-space:nowrap">`. Never leave one character alone on the last line. Do not use `word-break: keep-all` for Chinese.
- **Punctuation:** full-width （，。：；！？「」） in Chinese sentences; no final 。 in titles; half-width punctuation inside numbers and English names.
- **Mixed CN/EN numbers:** one space between Chinese and Latin/digits (盘古之白): 「营收 €412m，拥有 11 个仓库」. No space between a number and %, or between a currency symbol and a number. Units may stay Latin (`€m`, `pts`) or become Chinese in the unit line (单位：百万欧元); be consistent per deck.
- **Number scale:** for Chinese audiences prefer 万 / 亿 in prose (「4.12 亿欧元」) but keep table and chart values in one consistent scale with the unit in the header (`营收（百万欧元）`). Percentage-point changes: 「下降 6.1 个百分点」 in titles, `−6.1 pts` or `−6.1 个百分点` in charts.
- **Dates and periods:** `FY21–FY24`, `2025 年第二季度` or `2025Q2` — pick one style per deck.
- **Tracker:** two-character section names (摘要 / 诊断 / 方案 / 建议 / 路线图) fit the 196px segments; uppercase and tracking do not apply.

### Aesthetic Notes for This System

The system's authority comes from the serif title over a hairline and from orderly, directly labelled data; both transfer to Chinese unchanged. A Chinese action title in Noto Serif SC 700 reads like a formal report heading; body text in Noto Sans SC 400 keeps tables crisp. Chinese text is denser, so the same body band holds the same evidence with fewer lines; resist filling the freed space with more bullets.

### Known CJK Gap

`text-wrap: balance` and automatic line breaking are tuned for Latin; Chinese titles need manual breaks. Noto Serif SC has no exact 600 match for Source Serif 4 600 in all browsers; 700 is the closest visual match. Harvey-ball and tracker components are language-neutral.

## Iteration Guide

1. Write all action titles first, in order; check the story reads from titles alone.
2. For each slide pick the one chart type that proves the title (comparison → bars, composition → stacked, change decomposition → waterfall, prioritisation → 2×2, choice → options table, plan → Gantt).
3. Compute every derived number (totals, bridges, shares, paybacks) before building; reconcile across slides.
4. Build on the fixed frame: tracker `.on`, action title, body split, source line, footer.
5. Navy ladder for data, one teal element for the so-what.
6. Use only the type tokens above; never go below 18px.
7. Verify at 1920×1080, 1280×720 and one phone viewport: no overflow, no label collisions, body clear of the source line, fonts loaded.

## Known Gaps

- Charts are hand-built HTML/CSS with inline `--v` values; there is no data binding. Change a value and its label together.
- No line-chart component; for time series with many points, use the SVG line pattern from the Boardroom Quarterly template recoloured to the navy ladder.
- No image archetype. If a photo or logo is unavoidable, place it in a body column with square corners and no border, never behind text.
- The cover motif is decorative; do not turn it into a fake chart with invented values.
