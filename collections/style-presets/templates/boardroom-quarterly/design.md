---
version: alpha
name: Boardroom Quarterly
description: A calm, high-density corporate system for board packs and quarterly business reviews on a pure white canvas. One family — Hanken Grotesk 400–700 with tabular lining figures — carries everything. Slate neutrals hold the structure, one corporate blue carries the brand and the actual-data series, and semantic green / amber / red appear only for status and favourable / unfavourable variances. Every content slide shares one frame: a brand bar with section pills, a blue section kicker and a bold headline that states the takeaway, a body band for KPI cards, inline-SVG charts and conditionally coloured tables, and a footer with notes and page number. Components include KPI cards with triangle deltas and sparklines, SVG line and two-panel combo charts, bullet charts, heatmap tables, P&L variance tables, RAG pills, a 5×5 risk matrix and appendix metric tables. Original design by slides-commons.
source-note: "Original design by slides-commons (MIT). Not derived from a frontend-slides preset."

colors:
  paper: "#FFFFFF"
  ink: "#0F172A"
  text: "#1E293B"
  muted: "#475569"
  faint: "#64748B"
  line: "#CBD5E1"
  rule: "#E2E8F0"
  panel: "#F8FAFC"
  blue: "#2357C6"
  blue-60: "#7C9BE0"
  blue-30: "#BCCDF2"
  blue-tint: "#EEF3FD"
  good: "#157F3B"
  good-fill: "#2E9E57"
  good-tint: "#E3F4E9"
  good-strong: "#B9E3C8"
  warn: "#A15C00"
  warn-fill: "#E09B12"
  warn-tint: "#FDF2DC"
  bad: "#B42318"
  bad-fill: "#D9443A"
  bad-tint: "#FCE8E6"
  bad-strong: "#F5BDB7"
  stage-bg: "#E5E9EF"

color-aliases:
  slide-bg: paper
  primary: blue
  favourable: good
  unfavourable: bad
  at-risk: warn

typography:
  cover-title:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 150px
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: -0.035em
  cover-sub:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.015em
  title:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: -0.012em
  kpi-value:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 54px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
    fontVariantNumeric: tabular-nums
  block-title:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.45
  table:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 21px
    fontWeight: 400
    fontVariantNumeric: tabular-nums
  sub:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 19px
    fontWeight: 400
    lineHeight: 1.35
  delta:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 19px
    fontWeight: 600
  axis:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 19px
    fontWeight: 400
  kicker:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 18px
    fontWeight: 700
    letterSpacing: 0.1em
    textTransform: uppercase
  label:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 18px
    fontWeight: 600
    letterSpacing: 0.06em
    textTransform: uppercase
  table-head:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 17px
    fontWeight: 700
    letterSpacing: 0.05em
    textTransform: uppercase
  footer:
    fontFamily: "Hanken Grotesk, Noto Sans SC, sans-serif"
    fontSize: 18px
    fontWeight: 400

spacing:
  page-x: 72px
  brand-bar-top: 36px
  kicker-top: 128px
  title-top: 160px
  body-top: 290px
  body-bottom: 104px
  footer-bottom: 36px
  card-gap: 20px
  column-gap: 52px-56px
  radius: 8px (cards, panels), 4px (cells, chips), 999px (pills)

canvas:
  width: 1920px
  height: 1080px

frame:
  body: "top 290px, left 72px, right 72px, bottom 104px (1776 x 686 px)"
  title: "top 160px, max-width 1640px, max two lines (ends before 270px)"

components:
  brand-bar:
    description: "Logo square (30px blue, radius 6) + company (22px 700) + divider + deck name (500 muted) left; section pills right (18px 600, active pill blue on blue-tint); 1px line under, 18px padding."
  kicker:
    description: "'02 · Growth' in {typography.kicker}, blue, at top 128px. Appendix slides use a dark 'A1' tag before the word Appendix."
  headline:
    description: "{typography.title} ink, states the takeaway with numbers, one line preferred, two max."
  footer:
    description: "Left: the slide's note or source (18px faint). Right: deck label + page number '7 / 12' (current ink 600)."
  kpi-card:
    border: "1px solid {colors.line}"
    borderRadius: 8px
    padding: "26px 24px 24px"
    description: "4px status strip on top (good-fill / warn-fill / bad-fill / line), uppercase label, 54px value with smaller unit, two delta lines (vs plan, YoY), 132x44 SVG sparkline."
  delta:
    description: "CSS triangle + value + small comparison word. Triangle direction = arithmetic sign; colour = favourability."
  rag-pill:
    description: "Dot + uppercase word (GREEN / AMBER / RED) on the matching tint; never colour alone."
  line-chart:
    description: "Inline SVG with viewBox = pixel size; gridlines rule, axis labels faint 19px, actual blue 4px solid with white-filled dots, plan muted 2.5px dashed, forecast blue 3px dotted over a panel-coloured forecast band, direct end labels."
  combo-chart:
    description: "Two stacked SVG panels sharing the x axis: line (cash) above with its own axis, bars (burn) below with their own scale and value labels; never two y-axes on one panel."
  bullet-chart:
    description: "Per row: name | scale 0-120% with three grey bands | blue bar (attainment) | black target tick at 100% | value + target | attainment chip."
  heatmap-table:
    description: "Cells separated by 4px gaps, coloured in five bins (bad-strong, bad-tint, panel, good-tint, good-strong) with matching text colour; key above right; summary column outlined."
  fin-table:
    description: "Right-aligned tabular figures, parentheses for negatives and costs, variance cells tinted good/bad by favourability, subtotal rows bold with ink rule, ratio rows indented muted."
  risk-matrix:
    description: "5x5 grid, likelihood rows top=5, impact columns; cell tint by score (>=10 bad-tint, 7-9 warn-tint, <=6 good-tint); risk IDs as dark pills."
---

# Boardroom Quarterly

> **Attribution.** Original design by slides-commons (MIT). This system is not derived from a frontend-slides preset. The demo company (Altamira Software), people and all figures are fictional.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles. Inline SVG charts use a `viewBox` equal to their pixel size so SVG text sizes are true px.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its card or cell, no chart labels collide, and the body ends above the footer. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers) and of every component below.

## Overview

Boardroom Quarterly is built for the **board pack**: directors read it before the meeting, scan it during, and keep it as a record. It must be calm, complete and honest about bad news. The look is a modern corporate report: white page, slate type, one confident blue, and status colours that mean exactly one thing each.

The frame repeats on every content slide:

- **Brand bar** (top): logo square, company, deck name; section pills on the right with the current section highlighted; a 1px line under it.
- **Kicker + headline**: a small blue section label (`02 · Growth`) above a 44px bold headline that states the takeaway with numbers.
- **Body band**: 1776 × 686px for KPI cards, charts, tables and panels.
- **Footer**: the slide's note, definition or source on the left; deck label and page number on the right.

**Key characteristics**

- Pure white canvas. Panels use `{colors.panel}` #F8FAFC with a 1px rule and 8px radius; cards use white with a 1px line border.
- One family, Hanken Grotesk, at 400/500/600/700; **tabular lining figures on every number**.
- Blue is the brand and the "actual" series. Green/amber/red are reserved for status and favourability — never decoration, never a data series.
- Every delta shows **direction by shape** (▲ ▼ –) and **favourability by colour**, so "burn ▼ $1.1m" is green.
- Headlines say what happened ("Revenue beat budget by 2.1%; sales and marketing overspend absorbed most of it"), not what the slide contains.
- Footers carry definitions and sources so the body stays clean.

**Density philosophy: high.** A board slide carries one message and all the numbers needed to trust it: six KPI cards, a nine-quarter trend, an 11-line P&L or a 7×10 heatmap is normal. Density is managed by alignment, tabular figures, hairlines and colour discipline — not by shrinking type below 17px.

## Colors

### Palette

- **Paper** `{colors.paper}` #FFFFFF — every slide. Letterbox `{colors.stage-bg}` #E5E9EF.
- **Slate neutrals** — `{colors.ink}` #0F172A headlines and key figures; `{colors.text}` #1E293B body; `{colors.muted}` #475569 labels, units and secondary series (plan lines); `{colors.faint}` #64748B axis labels, footers, comparison words; `{colors.line}` #CBD5E1 card borders and strong hairlines; `{colors.rule}` #E2E8F0 table rules and gridlines; `{colors.panel}` #F8FAFC panels and neutral heat cells.
- **Blue** `{colors.blue}` #2357C6 (6.5:1 on white) — logo, kicker, active section pill, actual-data lines and bars, attainment bars, decision boxes. Tints: `{colors.blue-60}` #7C9BE0 (budget bars), `{colors.blue-30}` #BCCDF2 (borders, cover tiles), `{colors.blue-tint}` #EEF3FD (decision box, base-case column, active pill).
- **Semantic** — each with a text colour (≥ 5:1 on white and on its tint), a fill for dots/strips/bars, and a tint for cells:
  - Good / favourable: `{colors.good}` #157F3B · `{colors.good-fill}` #2E9E57 · `{colors.good-tint}` #E3F4E9 · `{colors.good-strong}` #B9E3C8
  - Warn / at risk: `{colors.warn}` #A15C00 · `{colors.warn-fill}` #E09B12 · `{colors.warn-tint}` #FDF2DC
  - Bad / unfavourable: `{colors.bad}` #B42318 · `{colors.bad-fill}` #D9443A · `{colors.bad-tint}` #FCE8E6 · `{colors.bad-strong}` #F5BDB7

### Rules

- Semantic colours encode **meaning against a reference** (plan, target, prior period, risk appetite). If there is no reference, use slate or blue.
- Text on tints always uses the matching text colour (`good` on `good-tint`), never the fill colour.
- Colour is never the only signal: RAG pills carry a word, deltas carry a triangle, heat cells carry the number, the heat key is on the slide.
- Chart series: actual = blue, plan/budget = muted dashed, forecast = blue dotted, prior year = line-grey. A fourth series means the chart needs splitting.
- Avoid red/green as the only distinction for colour-blind readers: keep triangles and words.

## Typography

### Font Family

**Hanken Grotesk** — Google Fonts, weights 400/500/600/700, true tabular figures (`tnum`). Used for everything.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Set `font-variant-numeric: tabular-nums lining-nums` on `.slide`, and on SVG `text` (SVG text does not inherit it in every browser).

### Type Scale

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `{typography.cover-title}` | 150 / 0.98, −0.035em | 700 | Cover period ("Q3 FY27"), the year part in blue |
| `{typography.cover-sub}` | 56 / 1.15 | 600 | Cover subtitle ("Quarterly Business Review") |
| `{typography.kpi-value}` | 54 / 1.05, −0.02em | 700 | KPI card values; unit as a 28px 600 muted `<small>` |
| `{typography.title}` | 44 / 1.18, −0.012em | 700 | Slide headline, max two lines |
| `{typography.block-title}` | 24 / 1.3 | 700 | Chart / table / panel titles |
| `{typography.body}` | 22 / 1.45 | 400 | Body text, list items (21px in panels) |
| `{typography.table}` | 21 | 400 | Table cells (19px in dense appendix tables) |
| `{typography.sub}` | 19 / 1.35 | 400 | Units line under block titles, notes |
| `{typography.delta}` | 18–19 | 600 | Delta values (comparison word 400 faint) |
| `{typography.axis}` | 19 | 400 | Chart axis and category labels |
| `{typography.kicker}` | 18, +0.1em, UPPER | 700 | Section kicker, blue |
| `{typography.label}` | 18, +0.06em, UPPER | 600 | KPI labels, panel labels, section pills (not uppercase) |
| `{typography.table-head}` | 17, +0.05em, UPPER | 700 | Table headers, heat key, chips |
| `{typography.footer}` | 18 | 400 | Footer notes, deck label |

**Floor:** 17px (table headers, chips, small chart labels). Running text ≥ 19px.

### Writing headlines

- One sentence, ≤ 2 lines, sentence case, no final period. Lead with the result, then the cause or the ask.
- Include the number that matters and its reference: "ARR reached $184.6m, 2.1% ahead of plan; we now forecast $196.5m at year end".
- Bad news goes in the headline too ("…the ERP migration is red and needs a contingency"). Boards distrust decks where every headline is good.

## Number Formatting

| Case | Rule | Example |
|---|---|---|
| Figures | Tabular lining numerals everywhere | columns align digit by digit |
| Negatives in financial tables | Parentheses, no minus sign | `(9.5)`, `(7.9%)` |
| Negatives in text, deltas, metrics tables | True minus U+2212 | `−0.9`, `−2 pts` |
| Costs in P&L | Shown in parentheses as negatives; variances signed by favourability (favourable positive) | budget `(18.9)`, actual `(19.8)`, var `(0.9)` |
| Variance % | On absolute values, sign = favourability | `(4.8%)` for a cost overrun |
| Percent vs points | Changes of a percentage are `pts` | `78.5%`, `+0.7 pts` |
| Scale | One scale per table/chart, stated in the header or units line | `USD m`, `$k` |
| Hero values | Currency + number + scale in a smaller unit span | `$184.6`<small>`m`</small> |
| Decimals | One decimal for $m, whole numbers for counts and days, two for ratios < 1 | `13.2`, `2,871`, `0.52×` |
| Multiples | Number + `×` (U+00D7), no space | `0.52×` |
| Thousands | Comma separator | `2,871` |
| Periods | `Q3 FY27`, `FY27`, month abbreviations `Jan`…`Sep`; forecast suffix `F` | `Q4 FY27F` |
| Ranges | En dash | `26–28%`, `1 July – 30 September 2027` |
| Rounding | Totals computed from unrounded data may differ by 0.1; note it in the footer | |

### Delta and favourability

Each delta is `<span class="delta up good">2.1% <small>vs plan</small></span>`:

- **Direction class** = arithmetic sign of the change: `up` ▲, `down` ▼, `flat` –.
- **Colour class** = what the change means: `good`, `bad`, or `neutral` (no target).
- Lower-is-better metrics (cost, burn, churn, CAC payback, days to close, incidents): a decrease is `down good`, an increase `up bad`.
- Show the comparison basis every time (`vs plan`, `YoY`, `QoQ`, `vs Q2`).
- Triangles are CSS borders (`::before`), not ▲▼ glyphs, so they render identically with any font fallback.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Brand bar | `top: 36px; left/right: 72px`, 18px bottom padding + 1px line |
| Kicker | `top: 128px; left: 72px` |
| Headline | `top: 160px; left/right: 72px; max-width: 1640px` |
| Body | `top: 290px; bottom: 104px; left/right: 72px` → 1776 × 686 |
| Footer | `bottom: 36px; left/right: 72px` |

### Body compositions

| Pattern | Columns | Used for |
|---|---|---|
| KPI row + two panels | 6 × 1fr cards (20px gap) over 2 × 1fr panels | Quarter at a glance |
| Chart + side | 1080px + 1fr (56px gap) | Trend line + bridge; combo chart + KPI mini-cards |
| Bullets + side table | 1fr + 520px | Segment attainment + efficiency table |
| Full width | 1776px | P&L, heatmap, RAG table, appendix |
| Matrix + table | 540px + 1fr (52px gap) | Risk register |
| Table + decision box | 1fr + 600–640px | Agenda, outlook |

Charts and tables start with a block title (24px 700) and a units line (19px faint); legends sit top-right of the chart head.

## Components

### KPI card

```html
<div class="kpi s-good">
  <p class="label">Net new ARR</p>
  <p class="v">$13.2<small>m</small></p>
  <span class="delta up good">28% <small>vs plan</small></span>
  <span class="delta up good">31% <small>YoY</small></span>
  <svg class="spark up" width="132" height="44" viewBox="0 0 132 44"><polyline points="…"/><circle cx=".." cy=".." r="4"/></svg>
</div>
```

- 1px line border, 8px radius, white. Top strip 4px: `s-good`, `s-warn`, `s-bad` or none — the card's overall status vs plan.
- Six cards per row at 1776px (≈ 280px each); four per row for 2×2 mini-grids.
- Sparkline: 8 points, `x = 5 + i × (132−10)/(n−1)`, `y = 39 − (v−min)/(max−min) × 34`; blue 2.5px line; last point a 4px dot. For a metric trending the wrong way use `.spark.down` (muted line, red end dot).

### Line chart (inline SVG)

- `<svg width="1080" height="560" viewBox="0 0 1080 560">`; plot inset `left 72, right 150, top 24, bottom 56`.
- Scales: `x(i) = L + i × plotW / (n−1)`; `y(v) = T + plotH − (v − yMin) / (yMax − yMin) × plotH`. Choose round `yMin`/`yMax` (e.g. 100–200) with 4–6 gridlines; the axis need not start at 0 for levels (it must for bars).
- Layers, back to front: gridlines (`rule`, 1.5px) + y labels (right-aligned, 14px left of the plot) → forecast band (`panel` rect over forecast periods) → plan (`muted` 2.5px, dash 8 7) → forecast (`blue` 3px, dash 3 7, round caps) → actual (`blue` 4px) → dots (white fill, 3px blue stroke; the latest actual filled, r 9) → value labels (18px 600 muted, 18px above points) → end labels (latest actual 26px 700 blue; plan and forecast end labels 20px 700 to the right of the last point).
- Move a value label below its point when it would hit an axis label or another line.
- Bold the current period's x label.

### Two-panel combo (inline SVG)

Do not put two y-axes on one panel. Stack two panels on one x axis: top panel line (e.g. cash, axis 60–110), 64px gap with a panel label ("Monthly net burn, $m"), bottom panel bars on their own scale (no axis, values inside the bar tops, white on the dark current-quarter bars). Month labels under the bottom panel; year labels under the first month of each year.

### Bullet chart (CSS)

- Row grid `250px 1fr 120px 110px`, 90px high: name + small descriptor | scale | value + `tgt` | attainment chip.
- Scale 0–120% of target: bands `0–90` `#EEF1F5`, `90–100` `#E2E7EE`, `100–120` `#F6F8FA`; bar 16px blue with `width: calc(var(--v) / 120 * 100%)`; target tick 4px ink at 100%.
- Chip colours: ≥ 100% good, 95–99% warn, < 95% bad (state thresholds in the footer). Total row behind a 1.5px ink rule; tick labels under the last row.

### Heatmap table

`table.heat` with `border-spacing: 4px`, 64px cells, 21px 600 numbers. Five bins `h1`…`h5` (bad-strong, bad-tint, panel, good-tint, good-strong) with matching text colours; the key (`.heat-key`) top-right lists the bin ranges. Outline the summary column with `box-shadow: inset 0 0 0 2px ink`. Up to 8 rows × 12 columns.

### Financial table

`table.fin`: first column left, all figures right; `table-layout: fixed` with a `<colgroup>` that has exactly one `<col>` per column. Optional group header row (`th.grp`, centred, 1px rule) above the column headers. Rows: line items 21px; subtotal rows `tr.sum` 700 ink with 1.5px ink top rule; ratio rows `tr.ratio` indented, 19px muted. Variance cells `td.f` (favourable: good on good-tint) / `td.u` (unfavourable: bad on bad-tint); ratio deltas `td.n` muted. A comment column (left-aligned, muted 20px) explains every material variance. A column separator `.sep` (1px line) divides current from prior period.

### RAG status table

Columns: initiative | owner | next milestone | due | budget used (90px bar + %) | status pill | trend triangle | comment. Status pills `.rag.g/.a/.r` show a dot and the word. A summary row of pills above the table ("4 on track · 2 at risk · 1 off track"). Any red item gets an **escalation panel** below: 1px bad-strong border, 5px bad-fill left bar, three columns *What happened / Impact / Ask*. Define G/A/R in the footer.

### Risk register

- Matrix: CSS grid `34px 30px repeat(5, 1fr)` × `repeat(5, 1fr) 30px 30px`; rows are likelihood 5→1 (top→bottom), columns impact 1→5. Cell tint by score L×I: ≥ 10 `bad-tint`, 7–9 `warn-tint`, ≤ 6 `good-tint`. Risk IDs as dark pills (`.rid`) in their cell.
- Table: ID pill | risk | owner | score (cell tinted by band) | trend | mitigation. Below: "Changes since last register" panel listing raised, lowered and closed risks.

### Other parts

- **Decision box** (`.decide`): blue-tint panel with blue-30 border, blue label, numbered items (30px blue circles) with a 22px bold title and a 19px muted detail.
- **Agenda table**: time (faint) | item (bold lead) | lead | purpose chip (`.chip`, `.chip.dec` for decisions).
- **Went well / needs attention panels**: panel with a 4px good-fill or warn-fill top border, square bullet in the same colour, bold lead phrase.
- **Appendix**: dark `A1` tag in the kicker, descriptive headline, dense table (19px, 46px rows) with a definition column (17px faint) and a coloured QoQ column.

## Slide Archetypes

The demo deck (12 slides) implements each of these.

1. **Cover** — logo + company, confidentiality chip; blue label, `Q3 FY27` (period in blue), "Quarterly Business Review"; meta row (meeting date, presenters, period); abstract 6×6 tile grid in slate → blue with two green and one amber tile.
2. **Agenda + decisions** — timed agenda table with purpose chips; decision box with three asks; pre-reads.
3. **Quarter at a glance** — six KPI cards with status strips, deltas and sparklines; "What went well" and "Needs attention" panels (4 items each).
4. **Trend** — SVG line chart (actual, plan, forecast) + net-new bridge with diverging bars + forecast-basis note.
5. **Segments** — bullet charts vs target + sales-efficiency table with outlier cells.
6. **Regional heatmap** — 6 regions × 9 months + Q3 column, five-bin colouring with key.
7. **P&L** — actual vs budget vs prior year with variance colouring and comments.
8. **Cash & runway** — two-panel combo chart + four mini KPI cards + definition panel.
9. **Initiatives** — RAG table with budget bars and trends + escalation panel for the red item.
10. **Risk register** — 5×5 matrix + register table + changes since last quarter.
11. **Outlook** — plan / low / base / high table with the base column highlighted + decisions box.
12. **Appendix** — five-quarter operating metrics with definitions and coloured QoQ.

Other board slides (headcount, customer cohorts, product roadmap, audit findings) reuse the same parts: block title + units line, blue for actuals, semantic colour only against a reference, definitions in the footer.

## Motion

Minimal. `.reveal` fades and rises 12px (0.5s, 70ms stagger). Horizontal bars `.growx` grow from the left; SVG actual/cash lines draw in once via `stroke-dashoffset` (`.draw`). Nothing loops. Board decks are often printed or exported to PDF — every slide must be complete without motion. `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- State the takeaway in the headline, including bad news.
- Show every metric against a reference (plan, target, prior period) and name the reference.
- Use triangles for direction and colour for favourability; keep words on RAG pills.
- Use tabular figures, consistent decimals and one scale per table.
- Put definitions, sources and thresholds in the footer.
- Reconcile numbers across slides (KPI cards ↔ P&L ↔ appendix ↔ charts).
- Split a slide when a table needs more than ~12 rows at 44px.

### Don't

- Don't use red/green/amber decoratively or as ordinary series colours.
- Don't put two y-axes on one chart; stack panels instead.
- Don't use pie, donut, gauge or 3D charts; use bars, bullets or a table.
- Don't use tinted slide backgrounds, gradients, drop shadows or glassmorphism; the canvas is white and flat.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients.
- Don't shrink text below 17px to fit; cut columns or move detail to the appendix.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

Chinese board packs and 季度经营分析会 decks are a primary use case. Everything in this system is sans-serif, which maps directly onto Noto Sans SC (思源黑体).

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Cover title, headlines | Hanken Grotesk 700 | **Noto Sans SC** | 700 |
| KPI values, table figures | Hanken Grotesk 700 / 400 | (digits stay in Hanken Grotesk) | — |
| Block titles, bold lead phrases | Hanken Grotesk 700 | Noto Sans SC | 700 |
| Body, tables, notes | Hanken Grotesk 400 | Noto Sans SC | 400 |
| Labels, kicker, chips, pills | Hanken Grotesk 600–700 | Noto Sans SC | 500–700 |

Hanken Grotesk's open, slightly geometric forms sit well beside Noto Sans SC: similar x-height-to-CJK-body proportion and stroke contrast, so mixed lines like 「新增 ARR 创季度新高」 look even.

### Mixed-Content Strategy

```css
--font: 'Hanken Grotesk', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Latin letters and all digits render in Hanken Grotesk (tabular), Chinese falls through to Noto Sans SC. Keep numbers as digits even in Chinese text so tables and KPI cards keep their alignment.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

Set `lang="zh-CN"` on `<html>` and add:

```css
:lang(zh) .title             { line-height: 1.3; letter-spacing: 0; }
:lang(zh) .s-cover .h1b      { line-height: 1.3; letter-spacing: 0; }
:lang(zh) .slide             { line-height: 1.6; }
:lang(zh) .wn li, :lang(zh) .small, :lang(zh) .decide li p { line-height: 1.65; }
:lang(zh) .label, :lang(zh) .kicker,
:lang(zh) table.fin th, :lang(zh) table.heat th { letter-spacing: 0.04em; text-transform: none; }
```

- **Weights:** Noto Sans SC 700 for headlines and bold leads, 500 for labels and pills, 400 for body and tables. Avoid 300 and below on projected slides.
- **Sizes:** body ≥ 20px, table cells ≥ 20px, KPI labels ≥ 18px. The 17px table-head token becomes 18px for Chinese.
- **Headline length:** ≤ 30 characters on one line at 44px; up to two lines of ≤ 28 characters. Structure: 结论 + 数字 + 原因/请求 — 「营收超预算 2.1%，销售与市场费用超支抵消了大部分」.
- **Line breaking:** break long headlines manually at a phrase boundary with `<br>`; never leave one character alone on a line; keep numbers with their units (`<span style="white-space:nowrap">184.6 百万美元</span>`). Do not use `word-break: keep-all` for Chinese.
- **Punctuation:** full-width （，。：；！？「」） in Chinese text, no final 。 in headlines; half-width inside numbers, units and English names.
- **Mixed CN/EN numbers:** space between Chinese and Latin/digits (「新增 ARR 1,320 万美元」); none between a number and % or a currency symbol and its number.
- **Number scale:** Chinese boards read 万 / 亿 naturally. Pick one scale per deck and say it in the units line: `单位：百万元` (tables, two decimal places max) or `单位：亿元`. KPI hero values may use Chinese scale words as the unit span: `1.85`<small>`亿美元`</small>. Do not mix 万 and 百万 on one slide.
- **Negatives:** parentheses in financial tables (`(9.5)`) are understood by Chinese finance readers; elsewhere use `−`. Percentage-point changes: `+0.7 个百分点` in text, `+0.7 pts` or `+0.7pp` in compact cells.
- **Colour semantics in China:** in Chinese markets red often means *up* (stock tickers). This system uses colour for **favourability**, not direction, and always pairs it with a triangle; state this once in the footer of the KPI slide (「三角表示变动方向，颜色表示有利/不利」). If the audience expects red = up, keep triangles and words and switch only the heatmap to a single-hue blue scale.
- **Periods and dates:** `2027 年第三季度` / `2027Q3` / `FY27 Q3` — choose one per deck; month columns `1月`…`9月`.
- **RAG pills:** use 正常 / 关注 / 预警 (or 绿 / 黄 / 红) with the dot; never colour alone.
- **Section pills:** two- to four-character names (概览 / 增长 / 财务 / 执行 / 展望) fit the brand bar.

### Aesthetic Notes for This System

The system's calm comes from slate type, generous hairline structure and disciplined colour; all of it carries over. Chinese headlines in Noto Sans SC 700 are visually heavier than Latin at the same size — keep 44px and do not add letter-spacing. Chinese text is shorter per idea, so the "What went well / Needs attention" panels hold four items comfortably; do not add a fifth to fill space.

### Known CJK Gap

Hanken Grotesk has no CJK glyphs, so Chinese runs in mixed headlines come from Noto Sans SC; their 700 is slightly blacker than Hanken's 700. Acceptable; do not synthesise weights. SVG `<text>` uses the same stack, but long Chinese axis labels need manual shortening because SVG text does not wrap.

## Iteration Guide

1. List the board's questions and the decisions you need; write the agenda and the decision box first.
2. Write every headline as a takeaway with its number and reference.
3. Assemble the data and reconcile it (KPI cards = P&L = appendix = charts) before building.
4. Pick components: scorecard → KPI cards; trend → SVG line; attainment → bullets; region × month → heatmap; P&L → fin table; programs → RAG table; risks → matrix + register; outlook → range table.
5. Apply colour last: blue for actuals, slate for everything else, semantic colours only against a reference.
6. Put definitions, sources and thresholds in the footer.
7. Verify at 1920×1080, 1280×720 and a phone viewport: no overflow, no label collisions, body above the footer, fonts loaded, numbers aligned.

## Known Gaps

- SVG charts are static: point coordinates are computed when the deck is written (formulas above). Recompute when data changes; there is no data binding.
- No map, cohort-triangle or org-chart component; build them from the table and heatmap parts.
- No image archetype. Logos in the brand bar should be a simple abstract mark or a supplied SVG at 30px height.
- The cover tile grid is decorative; do not label it or present it as data.
