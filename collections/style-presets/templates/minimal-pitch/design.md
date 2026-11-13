---
version: alpha
name: Minimal Pitch
description: A quiet, confident investor-pitch system on a pure white canvas. One family — Manrope — in four weights carries everything: very large semibold headlines with tight tracking, regular body copy and small wide-tracked uppercase labels. Near-black ink, hairline greys and exactly one accent hue (deep green #0b7a55), used once per slide to mark the single thing that matters. Every slide states one idea; the classic pitch arc (cover, problem, solution, product, why now, market, traction, business model, competition, team, ask, close) is built from bottom-anchored titles, hairline-separated figures, nested TAM/SAM/SOM circles, a CSS bar chart, a 2×2 and a use-of-funds stacked bar. Original design by slides-commons.
source-note: "Original design by slides-commons (MIT). Not derived from another template."

colors:
  paper: "#ffffff"
  ink: "#111214"
  ink-muted: "#55585e"
  ink-faint: "#8a8e95"
  rule: "#e6e7e9"
  wash: "#f4f5f3"
  accent: "#0b7a55"
  accent-tint: "#e3f1ea"
  neutral-mid: "#c9cbcf"
  stage-bg: "#e9eae7"

color-aliases:
  slide-bg: paper
  text: ink
  highlight: accent

typography:
  hero:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 168px
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: -0.045em
  stat-xl:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 220px
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: -0.05em
  display:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 112px
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: -0.04em
  title:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 76px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -0.035em
  figure-lg:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: -0.035em
    fontVariantNumeric: tabular-nums
  figure:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.03em
    fontVariantNumeric: tabular-nums
  lede:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 38px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -0.01em
  item-title:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  body:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.5
  source:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 600
    letterSpacing: 0.12em
    textTransform: uppercase

spacing:
  page-x: 120px
  chrome-top: 64px
  frame-top: 184px
  frame-bottom: 152px
  footer-bottom: 56px
  gutter: 40px
  label-to-title: 32px
  title-to-body: 40px

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 40px
  frame: "top 184px, left 120px, right 120px, bottom 152px (1680 x 744 px)"
  column-width: 103.33px
  row-height: 90.67px

components:
  chrome-top:
    position: "absolute; top: 64px; left: 120px; right: 120px"
    description: "Flex row, space-between, centred. Left: wordmark (14px accent dot + company name, Manrope 700 30px, -0.03em). Right: current section as a {typography.label} in {colors.ink-faint}. Identical on every slide."
  footer:
    position: "absolute; bottom: 56px; left: 120px; right: 120px"
    description: "Label style, {colors.ink-faint}. Left: deck line or a data note ('Illustrative demo figures'). Right: page number '04 / 12', current page in {colors.ink}, tabular figures, filled by script."
  frame:
    display: grid
    gridTemplateColumns: "repeat(12, 1fr)"
    gridTemplateRows: "repeat(6, 1fr)"
    gap: 40px
    description: "The only layout system. Content blocks are direct children placed by span."
  cell:
    description: "Flex column. `.end` puts the title at the bottom of its cell (the default for statement slides); space-between puts a label at the top and the payload at the bottom."
  hairline-row:
    border: "1px solid {colors.rule}"
    description: "Every list of figures, people, tiers or goals is separated by 1px hairlines at the top of each row. No boxes, no cards."
  accent-mark:
    color: "{colors.accent}"
    description: "One per slide: a phrase or number in the headline (`.hl`), the highlighted bar, the SOM circle, the 'us' dot in the 2×2, the first use-of-funds segment or the founder monogram."
  cover-dot:
    size: 168px
    background: "{colors.accent}"
    description: "A single filled accent circle, top-right of the frame (top 184px, right 120px). Only on the cover and the closing slide, as bookends."
  bar-chart:
    description: "Pure CSS. Plot = flex row of bars (22px gaps) over 5 dashed-free gridlines (repeating-linear-gradient of 1px {colors.rule} every 20%), 2px {colors.ink} baseline. Bars {colors.wash}, rounded 6px top; the latest/message bar {colors.accent} with its value above in 40px 600 accent. Y labels 18px faint, tabular."
  nested-circles:
    description: "TAM/SAM/SOM as three bottom-tangent circles in one SVG (viewBox 744×744): radii 371 / 246 / 120, all touching the bottom edge. Fills {colors.wash} / {colors.accent-tint} / {colors.accent}. Each circle carries its label (20px 600, +2.4px tracking) and value (56px 600) near its top; values on the accent circle are white."
  quadrant:
    description: "2×2 in SVG: 2px {colors.ink} axes crossing at the centre, the winning quadrant filled {colors.accent-tint}, competitors as 12px ink dots with 26px 600 labels, 'us' as a 22px accent dot with an accent label. Axis captions in label style, faint, with ← → arrows."
  stacked-bar:
    description: "Use of funds: a flex row 88px tall with 6px gaps, segments sized by percentage (`flex: 0 0 calc(P% - 4.5px)` for four segments). First segment accent, second ink, third {colors.neutral-mid}, fourth {colors.wash}. A legend row below uses the same widths: figure (44px) + caption (22px)."
  monogram:
    size: 120px
    description: "People are shown as initials in a 120px {colors.wash} circle (40px 600). The CEO / presenter monogram may use the accent fill with white initials. No photos."
  mock-ui:
    description: "Product screens are drawn as an abstract card: 1px rule border, 24px radius, soft shadow `0 30px 60px -30px rgba(17,18,20,.18)`, real-looking rows of text and thin progress bars. One row highlighted in {colors.accent-tint}; numbered 32px accent pins link the screen to numbered notes beside it."
---

# Minimal Pitch

> **Original design by slides-commons** (MIT). Not derived from another template or preset. Demo content describes "Mise", a fictional company; every name and number is invented.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its cell and no blocks overlap. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Minimal Pitch is a **white, quiet, one-idea-per-slide** system for investor decks. It persuades by restraint: a very large headline, a few numbers set like a financial statement, generous empty space, and one green mark on each slide that tells the reader where to look. It should feel like a calm founder who knows the numbers — not like a startup template.

**Key characteristics**

- Pure white canvas `{colors.paper}`; the letterbox around the stage is a warm light grey `{colors.stage-bg}`.
- One family, **Manrope**, weights 400 / 500 / 600 / 700. Headlines are 600 with negative tracking; never 800.
- Near-black ink, two greys and hairlines. **One accent hue**, deep green `{colors.accent}`, used **once per slide**.
- Titles anchored **bottom-left** of their cell, with a small accent label 32px above.
- Figures sit on hairlines, never in boxes or cards. No shadows except the single product mock.
- Chrome is identical on every slide: wordmark top-left, section name top-right, footer note bottom-left, page number bottom-right.

**Density philosophy: low.** One idea per slide. A slide is complete with a label, a headline and either one visual or up to four figures. If you need a second idea, add a slide. Twelve slides for a seed pitch is normal; 15–18 is fine; cramming is not.

## Colors

### Palette

- **Paper** `{colors.paper}` #ffffff — every slide background.
- **Ink** `{colors.ink}` #111214 — headlines, figures, axis baseline, the second funds segment.
- **Ink muted** `{colors.ink-muted}` #55585e — body, captions, ledes (7.3:1 on white).
- **Ink faint** `{colors.ink-faint}` #8a8e95 — chrome, quiet labels, axis labels, sources. Only for text 18px and above that is not essential reading.
- **Rule** `{colors.rule}` #e6e7e9 — hairlines and chart gridlines.
- **Wash** `{colors.wash}` #f4f5f3 — neutral fills: chart bars, the outer TAM circle, monograms, the last funds segment.
- **Accent** `{colors.accent}` #0b7a55 — the only hue (5.4:1 on white, AA for all text sizes).
- **Accent tint** `{colors.accent-tint}` #e3f1ea — low-strength accent fill: SAM circle, winning quadrant, highlighted product row.
- **Neutral mid** `{colors.neutral-mid}` #c9cbcf — third segment of a stacked bar only.

### Accent rules

- **One accent moment per slide.** Choose the single most important thing: a phrase in the headline, the latest bar, the SOM, "us" in the 2×2, the biggest use of funds. The accent label above the title and the accent dot of the wordmark do not count.
- The accent is a **color for text or a flat fill**. No accent gradients, glows or outlines thicker than 2px.
- To re-theme, change `--accent` and `--accent-tint` together (tint ≈ accent at 12% on white). Keep the accent dark enough for 4.5:1 on white — e.g. ink blue #1d4ed8, oxblood #9b2335, graphite teal #0f6e78. Never use a second accent alongside.

## Typography

### Font Family

**Manrope** (Google Fonts, also on Fontsource): a geometric grotesque with open apertures and excellent figures. It supports tabular numerals (`tnum`) and pairs cleanly with Noto Sans SC (see CJK section).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size / line-height / tracking | Weight | Use |
|---|---|---|---|
| `{typography.stat-xl}` | 220 / 0.9 / −0.05em | 600 | The price or one hero number |
| `{typography.hero}` | 168 / 0.98 / −0.045em | 600 | Cover title, closing line (2 lines) |
| `{typography.display}` | 112 / 1.04 / −0.04em | 600 | Problem statement, the ask |
| `{typography.title}` | 76 / 1.08 / −0.035em | 600 | Standard slide title (≤ 2 lines) |
| `{typography.figure-lg}` | 56 / 1.0 / −0.035em | 600 | Figures in a row of three, unit economics |
| `{typography.figure}` | 44 / 1.05 / −0.03em | 600 | KPIs beside a chart, goals, legend values |
| `{typography.lede}` | 38 / 1.4 | 400 | Cover subtitle, the line under a big number |
| `{typography.item-title}` | 34 / 1.2 / −0.02em | 600 | Column heading, person name |
| `{typography.body}` | 28 / 1.5 | 400 | Body paragraphs (≤ 3 lines) |
| `{typography.small}` | 22 / 1.5 | 400 | Captions under figures, descriptions |
| `{typography.label}` | 18, 600, +0.12em, uppercase | 600 | Slide label (accent), chrome, quiet labels |
| `{typography.source}` | 18 / 1.5 | 400 | Data sources and footnotes |

Running text never goes below 22px; 18px is only for labels, axes, sources and chrome.

### Signature Treatments

- **Big and quiet.** Headlines are huge (76–168px) but semibold, never heavy; tight negative tracking keeps them compact.
- **`text-wrap: balance`** on every heading, so two-line titles split evenly and never leave one word alone.
- **Accent phrase.** Wrap the key phrase or number in `<span class="hl">`. Join short phrases with `&nbsp;` (`1&nbsp;in&nbsp;7`) so they never break.
- **Label above title.** An accent `{typography.label}` 32px above every title names the slide's role ("The problem", "Traction").
- **Sentence case** headlines ending with a period when they are statements. No exclamation marks, no all caps headlines.
- The closing headline may end with an accent period: `<span class="hl">.</span>`.

### Number formatting

- **Tabular figures** (`font-variant-numeric: tabular-nums`) on every number that lines up in a column, row of figures, axis, table, legend or page number. Headlines and running text keep proportional figures — tabular digits look gappy inside sentences.
- Currency symbol attached, no space: `$4.5M`, `$289`, `€18,400`. Thousands with commas in English (`$3,468`, `1,200`).
- Abbreviate large numbers to 2–3 significant digits with an uppercase unit: `$38B`, `$6.2B`, `$410M`, `$61.8k` (lowercase k is fine for thousands). Never mix `M` and `mn` in one deck.
- Ranges use an en dash without spaces: `3–5%`, `20–200 seats`. Changes use a spaced arrow: `214 → 1,200`.
- Units after figures in body text get a space (`4.5 hrs`, `5 mo`); `%` and `×` do not.
- Mark illustrative numbers in the footer note ("Illustrative demo figures") rather than on the slide.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Chrome top (wordmark + section) | `top: 64px; left: 120px; right: 120px` |
| Frame (content grid) | `top: 184px; left: 120px; right: 120px; bottom: 152px` → 1680 × 744 |
| Footer (note + page number) | `bottom: 56px; left: 120px; right: 120px` |

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 40px; }` — columns 103.33px, rows 90.67px.

| Span | Width | Used for |
|---|---|---|
| 5 columns | 677px | Text column beside a visual (solution, traction, market, competition) |
| 6 columns | 820px | Half: price + unit economics |
| 7 columns | 963px | Visual beside a text column (diagram, chart, circles, 2×2, product mock) |
| 9–11 columns | 1253–1540px | Statement headlines |
| 12 columns | 1680px | Rows of figures, team, use of funds |

### Composition rules

- **Bottom-anchored.** Title cells are flex columns with `justify-content: flex-end`. Empty space sits above the title, not below it.
- **Text left, visual right.** For explanation slides: a 5-column text cell (label, title, one body paragraph) and a 7-column visual.
- **Statement over figures.** For problem / why now / team / ask: title in rows 1–3 (or 1–4), a row of 3–4 hairline-topped items in rows 4–6.
- No more than **one visual** per slide. No cards, no panels, no background blocks.
- Leave at least one empty quadrant on every slide.

## Depth and Elevation

Flat. The only shadow in the system is on the product mock (`0 30px 60px -30px rgba(17,18,20,.18)`), to lift it off the page. Rounded corners appear only on objects that represent things (product card 24px, buttons 999px, bars 6–8px). Text blocks have no containers.

## Components

- **Wordmark** (chrome): 14px accent dot + lowercase company name, Manrope 700 30px, −0.03em.
- **Section name** (chrome, right): label style, faint. Use the slide's role (Problem, Market, Team).
- **Footer**: label style, faint. The left side doubles as the place for data notes.
- **Fact row**: three items in a 3-column grid, each with a 1px top hairline, 28px padding, a `{typography.figure-lg}` figure and a 2-line `{typography.small}` caption.
- **Numbered shifts**: three columns with a 2px ink top rule (the first in accent), a faint `01` index, an `{typography.item-title}` heading and a body paragraph.
- **Tier list / goal list / unit economics**: rows separated by hairlines, label left, figure right (`justify-content: space-between`), optional one-line small caption.
- **Flow diagram (SVG)**: inputs as 10px open circles (2px ink stroke) with a 28px 600 label + 20px faint caption right-aligned to their left; connectors as 2px `{colors.rule}` cubic curves converging on one accent node (r 30); the output as a 2px ink rounded rectangle (rx 18) with three ink lines inside. The only accent connector is the one leaving the accent node.
- **Bar chart, nested circles, quadrant, stacked bar, monogram, mock UI**: see the frontmatter components.

### Drawing diagrams

- SVG with an explicit `viewBox` and the same pixel width/height as its grid cell (e.g. 963 × 600 for 7 columns). Text inside SVG uses `font-family: Manrope` via CSS.
- Strokes: 2px for structure (axes, connectors, outlines); 3px only for the accent connector. Round caps.
- Fills only from the palette: wash, accent-tint, accent, ink, white.
- Keep every SVG label inside the viewBox: anchor right-aligned labels (`text-anchor="end"`) at x ≥ their measured width.

## Slide Archetypes

The demo deck implements each of these, in classic pitch order.

1. **Cover** — accent label (round · date), `hero` title (2 lines) and a lede in `1/span 11 × rows 1–5`, bottom-aligned; a full-width meta row in row 6 (presented by / raising / contact) under a hairline; the accent cover-dot top-right.
2. **Problem** — `display` statement with one accent phrase in `1/span 11 × rows 1–4`; a fact row of three figures in rows 5–6.
3. **Solution** — 5-column text (label, `title` in two short sentences, body) + 7-column SVG flow: three inputs → accent node → output.
4. **Product** — 5-column cell: label + title top, three numbered notes bottom; 7-column mock UI card with numbered pins matching the notes.
5. **Why now** — `title` in rows 1–3; three numbered shifts in rows 4–6.
6. **Market size** — 5-column text: label, `title` naming the SOM, a three-row tier list (TAM / SAM / SOM definitions). 7-column nested circles with the values.
7. **Traction** — 5-column text: label, title, three KPIs in a row at the bottom. 7-column bar chart, 12 months, last bar accent with its value.
8. **Business model** — `stat-xl` price with a `/ month` suffix (48px, muted) and a lede; four unit-economics rows on the right (columns 8–12), one figure in accent.
9. **Competition** — 5-column text (label, title, body naming the alternatives) + 7-column 2×2 with "us" in the tinted quadrant.
10. **Team** — `title` in rows 1–2; four people in rows 3–6: monogram, name, accent role, one-line track record.
11. **The ask** — `display` "Raising $X" with the amount in accent, a one-line body (round, runway); three goal rows on the right (now → target); use-of-funds stacked bar with legend across rows 4–6.
12. **Closing** — `hero` two-line sign-off with an accent period, contact rows (hairline, label, 28px value) in columns 9–12, the accent cover-dot top-right.

Other pitch slides (go-to-market, roadmap, financial projection, customer quote) reuse the same parts: a bottom-anchored title, a hairline row of figures and one visual with one accent.

## Motion

- `.reveal` elements fade in and rise 18px when the slide becomes `.visible`: 0.6s `cubic-bezier(0.22, 1, 0.36, 1)`, staggered `--i` × 80ms (+80ms).
- Chart bars grow from the baseline (`scaleY(0 → 1)`, 0.8s), staggered 40ms.
- Nothing loops, bounces or rotates. `prefers-reduced-motion` is handled by viewport-base.css; print forces `.reveal` visible.

## Do's and Don'ts

### Do

- State one idea per slide and make the headline say it.
- Make type very large and leave space; anchor titles bottom-left.
- Use the accent exactly once per slide, on the thing the audience must remember.
- Put numbers on hairlines with tabular figures; format them consistently.
- Show people as monograms and products as abstract mock UIs.
- Write the source or "illustrative" note in the footer.

### Don't

- Don't add a second hue, gradients, glows, emoji or stock icons.
- Don't use boxes, cards or shaded panels for text.
- Don't center-align content slides; the system is left-aligned and bottom-anchored.
- Don't set headlines at 700–800 or in all caps; don't track body text.
- Don't shrink type below the scale to fit more — split the slide.
- Don't use Inter, Roboto, Arial or system fonts as the display face, and don't use the generic indigo `#6366f1` or purple gradients.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

Chinese pitch decks are a primary use case. Manrope has no CJK glyphs, so Chinese text falls through to **Noto Sans SC (思源黑体)**, whose clean geometric strokes and even colour match Manrope well.

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight (CJK) |
|---|---|---|---|
| Hero, display, title, stat | Manrope 600 | Noto Sans SC | 700 |
| Item titles, figures | Manrope 600 | Noto Sans SC | 600 (falls to 700 if 600 is not loaded) |
| Lede, body, small | Manrope 400 | Noto Sans SC | 400 |
| Labels, chrome | Manrope 600 | Noto Sans SC | 500 |

Chinese at 600 looks lighter than Latin at 600 at display sizes, so headlines step up to Noto Sans SC 700. Load the weights you use:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
```

### Mixed-Content Strategy

One stack, Latin first, so Latin words and **all digits stay in Manrope** (Manrope's figures are better than the CJK font's):

```css
--font: 'Manrope', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

Put `lang="zh-CN"` on `<html>` and add:

```css
:lang(zh) h1, :lang(zh) h2, :lang(zh) .stat-xl { font-weight: 700; letter-spacing: 0; line-height: 1.2; }
:lang(zh) .t-hero { line-height: 1.15; }
:lang(zh) .label, :lang(zh) .section, :lang(zh) .foot { letter-spacing: 0.04em; }
:lang(zh) .body, :lang(zh) .small, :lang(zh) .lede { line-height: 1.75; }
```

Manrope 700 exists, so Latin words inside a 700 Chinese headline render with a true bold, not a synthetic one.

### Universal CJK Adjustments

- **Line-height:** headlines 1.15–1.25 (the Latin 0.98–1.08 makes Chinese lines touch); body 1.7–1.8; captions 1.6.
- **Tracking:** 0 on Chinese headlines and body (drop the −0.03 to −0.045em tracking); labels +0.04em at most. `text-transform: uppercase` has no effect on Chinese.
- **Length:** a Chinese headline of 8–14 characters fills the space of a 20–30 character English one. `hero` holds 2 lines of ≤ 7 characters; `display` 2 lines of ≤ 12; `title` 2 lines of ≤ 14 in a 5-column cell.
- **Punctuation:** full-width （，。：；！？「」）. Chinese statement headlines end **without** a period; drop the accent-period treatment and use an accent phrase instead.
- **Spacing (盘古之白):** a space between Chinese and Latin words or numbers: `融资 4500 万元`, `使用 Mise 的餐厅`.
- **No orphans:** keep `text-wrap: balance` and check that no line holds a single character; rebalance with `<br>` or shorten.
- **Minimum sizes:** Chinese body text ≥ 24px for presentations (22px reads small in CJK); labels ≥ 18px.

### Numbers in Chinese decks

- Keep Arabic numerals in Manrope with tabular figures in columns: `2.1 亿`, `61.8 万`, `24%`.
- Use Chinese units for large amounts: **万 / 亿** (`380 亿美元`, `4,500 万元` or `4500 万元`). Do not mix `$38B` and `380 亿美元` in one deck — pick one convention.
- Put the unit after the number with a space, in the same weight but ~0.5× size if it is a hero figure: `<b>4500<small>万元</small></b>`.
- Currency: `¥` / `￥` attached (`¥289`); `元/月` as a suffix (`289 元/月`). Dates: `2026 年 11 月`, or `2026.11` in chrome.
- Percent and ratio stay ASCII: `24%`, `1/7`. Ranges use `–` or `至`: `3–5%`, `20 至 200 座`.

### Aesthetic Notes for This System

The quietness transfers well to Chinese: large Noto Sans SC 700 headlines with lots of white space read as calm and premium. Keep the accent phrase short (2–6 characters, e.g. `七分之一`). Chinese labels above titles work without letter-spacing (`问题`, `市场规模`, `融资计划`). In the chrome, the section name can be 2–4 characters.

### Known CJK Gap

Noto Sans SC is large; loading it from Google Fonts adds noticeable weight and depends on network access in mainland China. If it fails, the stack falls back to PingFang SC / Microsoft YaHei, which still work with this layout. SVG text in diagrams does not inherit `:lang` rules automatically — set `font-weight: 700` and `letter-spacing: 0` on Chinese SVG labels explicitly.

## Iteration Guide

1. Write the one-sentence point of each slide first; that sentence is the headline.
2. Start from the chrome and an empty 12 × 6 frame.
3. Put the title bottom-left with an accent label above it.
4. Add at most one visual or one row of figures.
5. Choose the single accent moment; everything else is ink and grey.
6. Format every number with the rules above and switch on tabular figures where numbers align.
7. Update the section name; let the script fill page numbers.
8. Verify at 1920×1080, 1280×720 and on a phone: no overflow, no overlap, fonts loaded.

## Known Gaps

- One family only: there is no serif or mono for contrast. Code or tickers should be set in Manrope 500 with tabular figures.
- Charts are hand-built (CSS bars, SVG circles and quadrant); values are inline percentages (`--h: value / axis max`). There is no data binding and no line-chart archetype — build one in SVG with a 3px accent polyline and hairline gridlines if needed.
- No photo archetype. If a real photo is needed (team, product), place it in a grid cell with an 8px radius, no border, and keep the accent off the photo.
- The product mock is drawn with HTML; it is not a screenshot frame. Replace it with a real screenshot only if the product UI is equally calm.
