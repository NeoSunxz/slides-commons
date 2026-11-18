---
version: alpha
name: Tech Blue Business
description: A white-canvas corporate system for company introductions and solution proposals. Navy ink and one tech-blue family (#1e5eff with a navy and a pale tint) carry the identity; a navy-to-cyan gradient is used sparingly — the cover and closing band, the 32px title tick and one highlight per slide. Plus Jakarta Sans (400–800) sets headlines and body, IBM Plex Mono sets uppercase labels, section numbers, codes and dates. Consistent line icons are drawn inline in SVG on a 24px grid with a 1.5 stroke. Slides share a fixed chrome (logo, deck name, section number, hairline, footer) and a top-left title block over a 12-column frame; archetypes cover agenda, company overview, capability grid, layered architecture diagram, delivery process, case study with metrics, Gantt roadmap, service tier matrix, logo wall and contact. Original design by slides-commons.
source-note: "Original design by slides-commons (MIT). Not derived from another template."

colors:
  paper: "#ffffff"
  ink: "#0e1b2e"
  ink-muted: "#4c5b70"
  ink-faint: "#8693a6"
  line: "#dce3ee"
  surface: "#f4f7fc"
  blue: "#1e5eff"
  blue-deep: "#0a2a80"
  blue-soft: "#e8efff"
  cyan: "#22b5f0"
  gradient: "linear-gradient(120deg, #0a2a80 0%, #1e5eff 55%, #22b5f0 100%)"
  bar-neutral: "#c7d1e0"
  stage-bg: "#e6ebf3"

color-aliases:
  slide-bg: paper
  accent: blue
  text: ink

typography:
  hero:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 104px
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: -0.035em
  stat-xl:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 180px
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: -0.05em
    fontVariantNumeric: tabular-nums
  closing:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 84px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.035em
  metric:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 76px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.04em
    fontVariantNumeric: tabular-nums
  tile-number:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 72px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.03em
    fontVariantNumeric: tabular-nums
  title:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 60px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.025em
  figure:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 44px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.03em
    fontVariantNumeric: tabular-nums
  row-title:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.015em
  card-title:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.01em
  lede:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.55
  table:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.3
    fontVariantNumeric: tabular-nums
  small:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: 18px
    fontWeight: 500
    letterSpacing: 0.08em
    textTransform: uppercase

spacing:
  page-x: 112px
  chrome-top: 48px
  head-top: 160px
  frame-top: 330px
  frame-bottom: 128px
  footer-bottom: 48px
  gutter: 32px
  radius: 16px
  card-pad: "36px 40px"
  panel-pad: "40px 44px"

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 32px
  frame: "top 330px, left 112px, right 112px, bottom 128px (1696 x 622 px)"
  column-width: 112px
  row-height: 77px

components:
  chrome-top:
    position: "absolute; top: 48px; left: 112px; right: 112px; height: 56px"
    description: "Flex row, space-between, with a 1px {colors.line} bottom border. Left: 34px logo tile + company name (22px 700) + a 1px divider and the deck name (20px 500 faint). Right: section as a mono label — two-digit section number in blue, name in faint."
  footer:
    position: "absolute; bottom: 48px; left: 112px; right: 112px"
    description: "Mono label, faint, +0.06em. Left: company · confidentiality note. Right: page number '06 / 12' (current in ink), filled by script."
  head:
    position: "absolute; top: 160px; left: 112px; right: 112px"
    description: "Flex row, align-items flex-end. Left (flex 1): label with a 32×4px gradient tick, then the {typography.title} 20px below. Right (optional, flex 0 1 560px): a 24px muted lead sentence. Titles should fit on one line (≤ ~34 Latin characters, ≤ 16 Chinese)."
  frame:
    display: grid
    gridTemplateColumns: "repeat(12, 1fr)"
    gridTemplateRows: "repeat(6, 1fr)"
    gap: 32px
  card:
    border: "1px solid {colors.line}"
    borderRadius: 16px
    padding: "36px 40px"
    description: "White card on white. Used for capability cards, issue rows, stat tiles and diagram-like content. No shadow."
  panel:
    background: "{colors.surface}"
    borderRadius: 16px
    padding: "40px 44px"
    description: "Quiet filled block for narrative side columns (case-study story), summary strips and partner chips."
  icon:
    size: "48px (default), 28px (inline), 36–40px (diagram, chips)"
    description: "Inline SVG <symbol> on a 24×24 viewBox, fill none, stroke currentColor, stroke-width 1.5 (1.75 at 28px), round caps and joins. Referenced with <svg class=\"ico\"><use href=\"#i-name\"/></svg>."
  icon-tile:
    size: 80px
    borderRadius: 20px
    background: "{colors.blue-soft}"
    color: "{colors.blue}"
    description: "Square tile holding a 48px icon. Marks capability cards and issue rows."
  gradient-band:
    description: "Cover and closing only: absolute right 0, full height, 780px wide, background {colors.gradient}, clip-path polygon(200px 0, 100% 0, 100% 100%, 0 100%). Holds abstract white line-art (concentric circles at 18–22% opacity, a few nodes and connectors) or the contact block in white."
  gradient-highlight:
    description: "At most one per content slide: the title tick (always), plus ONE of — the architecture core band, the hero percentage (gradient text), the key Gantt bar, the first step dot, the top border of the lead metric."
  arch-diagram:
    description: "One SVG sized to the frame (1696×622). Layer labels in mono at x 0; layer rows of three 364px boxes (rx 14, white fill, 1.5px {colors.line} stroke, 26px gap); 46px vertical gaps holding 2px blue connectors with an open chevron marker; the delivered layer sits on a gradient band (rx 18) with white boxes on it; a dashed divider and a {colors.surface} 'across all layers' column on the right."
  process-steps:
    description: "Five equal columns. 104px circles (2px blue ring, white fill, 48px blue icon; the first step filled with the gradient and a white icon) joined by a 2px dashed blue line through their centres. Under each: mono meta ('01 · 2 weeks'), 30px title, small description (min-height 3 lines so deliverables align), then deliverables with 28px check icons."
  gantt:
    description: "CSS grid: 300px label column + 24 week columns. Month headers span 4 weeks with a 1px left line that runs down the chart. Rows hold rounded 44px bars in {colors.blue-soft} with navy 600 text; the critical bar uses the gradient with white text; ongoing work is a dashed 2px outline. Milestones are 22px navy diamonds (rotated squares) with a 18px 600 label."
  service-matrix:
    description: "table-layout fixed, first column 560px. Head row 96px with a mono tier label above the 26px tier name and a 2px ink bottom rule; the recommended column has a solid blue head (14px top radius, white text) and {colors.blue-soft} body cells. Body rows 62px with 1px lines; included = 30px blue check-circle icon; not included = 20×2px grey dash; last row (price) bold with a 2px ink bottom rule."
  logo-wall:
    description: "6 × 2 grid of 1px-ruled cells. Placeholder logotypes are text only, all in one grey (#5b6b82), varied by weight, tracking, case and mono to suggest different brands. Replace with real logos converted to the same single grey."
  metric:
    description: "Case-study figure: 3px top border ({colors.line}; the lead metric uses the gradient via border-image), {typography.metric} in navy (lead in blue), small caption."
---

# Tech Blue Business

> **Original design by slides-commons** (MIT). Not derived from another template or preset. Demo content: "Northbridge Systems" proposing a logistics data platform to "Harbor Logistics Group". All companies, people, client names and figures are fictional.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its box and no blocks overlap — in particular that a two-line title does not run into the frame below it. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers, icon sprite).

## Overview

Tech Blue Business is the **reliable corporate deck**: white pages, navy text, tech-blue accents, a sparing gradient and a consistent family of line icons. It is built for the meetings where a company introduces itself or proposes a solution to a client — structured, trustworthy and modern, with diagrams that look engineered rather than decorated.

**Key characteristics**

- White canvas `{colors.paper}` on every slide; the gradient appears as a **band** on the cover and closing slides and as **one highlight** elsewhere.
- Fixed chrome: logo + company + deck name top-left, mono section number top-right, a hairline under them, mono footer with page number.
- Every content slide opens with the **head block**: gradient tick + mono label, a 60px title top-left, an optional lead sentence on the right.
- **Line icons** in one style (24px grid, 1.5 stroke, round caps), usually on an 80px pale-blue tile.
- Cards are white with 1px lines and 16px corners; panels are pale `{colors.surface}`; **no shadows**.
- Numbers are large, navy, extra-bold, with tabular figures.

**Density philosophy: medium-high.** A business audience reads the slides afterwards, so each slide can carry a complete thought: a title, an optional lead, and one structured block (grid of 6 cards, 3 issue rows, a diagram, a table of 7 rows, a 5-row Gantt). Body text stays ≥ 20px; if a block needs more, split the slide.

## Colors

### Palette

- **Paper** `{colors.paper}` #ffffff — background of every slide and every card.
- **Ink** `{colors.ink}` #0e1b2e — headlines and primary text (navy-black, 16:1).
- **Ink muted** `{colors.ink-muted}` #4c5b70 — body and captions (7:1).
- **Ink faint** `{colors.ink-faint}` #8693a6 — chrome, mono labels, axis and table sub-labels; 18px and above only.
- **Line** `{colors.line}` #dce3ee — hairlines, card borders, diagram box strokes, grid lines.
- **Surface** `{colors.surface}` #f4f7fc — panels, edge-layer boxes, summary strip, partner chips.
- **Blue** `{colors.blue}` #1e5eff — the accent: icons, label text, connectors, links, the recommended column head, check marks (4.9:1 on white).
- **Blue deep** `{colors.blue-deep}` #0a2a80 — navy for big figures, milestone diamonds and text on pale-blue bars.
- **Blue soft** `{colors.blue-soft}` #e8efff — icon tiles, the recommended column body, standard Gantt bars.
- **Cyan** `{colors.cyan}` #22b5f0 — gradient end stop only; never used on its own (fails contrast for text).
- **Gradient** `{colors.gradient}` — 120°, navy → blue → cyan.

### Gradient budget

The gradient is the brand's loudest element; use it like a highlighter.

- **Always:** the 32×4px tick before every head label.
- **Cover and closing:** the full-height band on the right (780px, slanted left edge).
- **Content slides: at most one more use**, on the single element that matters most — the core layer of an architecture, the hero percentage (as gradient text), the critical-path Gantt bar, the first step of a process, the lead case-study metric.
- Never as a full-slide background, never behind body text, never on cards or table cells.

## Typography

### Font Family

- **Plus Jakarta Sans** (Google Fonts / Fontsource), 400 / 500 / 600 / 700 / 800 — headlines (700–800), body (400), UI text (500–600). Modern, geometric and slightly warm; supports tabular figures.
- **IBM Plex Mono** (Google Fonts / Fontsource), 400 / 500 — labels, section numbers, codes, dates, step meta, table tier labels. Always uppercase with +0.06–0.08em tracking, except in codes and dates.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

**Gotcha:** IBM Plex Mono is loaded at 400/500 only. Never set mono text at 600/700 (the browser would fake-bold it); for bold short labels inside bars or chips use Plus Jakarta Sans 600.

### Type Scale

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `{typography.stat-xl}` | 180 / 0.9, −0.05em | 800 | One hero percentage (gradient text) |
| `{typography.hero}` | 104 / 1.08, −0.035em | 800 | Cover title (2 lines) |
| `{typography.closing}` | 84 / 1.1, −0.035em | 800 | Closing headline |
| `{typography.metric}` | 76 / 1.0, −0.04em | 800 | Case-study metrics |
| `{typography.tile-number}` | 72 / 1.0, −0.03em | 800 | Company stat tiles |
| `{typography.title}` | 60 / 1.15, −0.025em | 700 | Slide title (one line) |
| `{typography.figure}` | 44 / 1.0, −0.03em | 800 | Figures beside list rows |
| `{typography.row-title}` | 34 / 1.2 | 700 | Agenda items |
| `{typography.card-title}` | 28 / 1.25 | 700 | Card and row headings, step titles (30) |
| `{typography.lede}` | 30 / 1.5 | 400 | Cover subtitle, intro paragraph |
| `{typography.body}` | 24 / 1.55 | 400 | Head lead, paragraphs |
| `{typography.table}` | 22 / 1.3 | 400–700 | Table cells, fact lists |
| `{typography.small}` | 20 / 1.5 | 400 | Card descriptions, captions |
| `{typography.label}` | 18 mono, +0.08em, uppercase | 500 | Labels, chrome, footer, meta |

### Number formatting

- **Tabular figures** on all metrics, tables, Gantt labels, page numbers and anything that aligns (`font-variant-numeric: tabular-nums`; the template applies it to `.num`, `.pagenum`, `.metric`, `.tile`, `table`, `.gantt`, `.bar-row`).
- Thousands separators always (`1,350`, `€31,200`). Currency attached (`€412M`, `$4.5M`).
- Suffix units on hero numbers are set at half size in the same weight: `320<small>+</small>`, `€412<small>M</small>`.
- Changes: use a true minus `−42%` (U+2212), not a hyphen. Time: `4 h 30 min`, `14 h`, `6 wks`.
- Percentages keep one decimal only when it matters (`99.2%`, `99.95%`).
- Codes and references in mono: `NB-2026-117`, `C1–C6`, `p.06`.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Chrome top (logo, deck name, section) | `top: 48px; left: 112px; right: 112px; height: 56px`, 1px bottom line |
| Head (label + title + lead) | `top: 160px; left: 112px; right: 112px` |
| Frame (content grid) | `top: 330px; left: 112px; right: 112px; bottom: 128px` → 1696 × 622 |
| Footer (note + page number) | `bottom: 48px; left: 112px; right: 112px` |

Cover and closing narrow the chrome and footer to 1000px so they stay on white, left of the gradient band.

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 32px; }` — columns 112px, rows 77px.

| Span | Width | Used for |
|---|---|---|
| 5 columns | 688px | Callout or story column beside a list |
| 6 columns | 832px | Halves: intro + stat tiles |
| 7 columns | 1008px | Issue rows, case-study results |
| 12 columns | 1696px | Agenda, card grids, diagrams, Gantt, tables, logo wall |

### Composition rules

- **Title top-left, always in the same place.** Corporate decks are scanned; a fixed title position is part of the trust.
- One structured block per slide below the head. Card grids are 3 × 2 or 2 × 2; lists have 3–5 rows; tables ≤ 8 rows; Gantt ≤ 6 rows.
- Left column text, right column structure (callout + rows, story + metrics, intro + tiles).
- Align everything to the frame edges; equal gutters (32px) between cards and rows.

## Icons

All icons are inline SVG symbols defined once at the top of `<body>` and referenced with `<use>`. This keeps the deck single-file and every icon identical in weight.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="i-db" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3"/>…</symbol>
</defs></svg>
<span class="ico-tile"><svg class="ico"><use href="#i-db"/></svg></span>
```

```css
.ico { width: 48px; height: 48px; fill: none; stroke: currentColor; stroke-width: 1.5;
       stroke-linecap: round; stroke-linejoin: round; }
```

**Drawing rules for new icons**

- 24 × 24 viewBox; keep shapes inside a 20 × 20 live area (2px padding); outer circles r = 9.
- Strokes only, `fill: none`, 1.5 stroke at 48px (renders 3px); 1.75 at 28px. Never fill shapes except a 1–1.5px-radius dot.
- Round caps and joins; corner radius 2 on rectangles; one or two primitives per idea (`rect`, `circle`, `ellipse`, `path` with straight lines and simple arcs).
- Same optical size: a square icon fills ~16 × 16, a circle ~18 × 18.
- Color comes from `currentColor`: blue on a pale tile, white on the gradient, navy in text. Never multi-colored, never duotone.
- The template's set: cloud, db, shield, chart, cpu, link, signal, users, layers, clock, alert, box, route, search, pen, code, flag, rocket, check, mail, phone, pin, globe, doc. Reuse before drawing new ones.

## Diagrams and charts

- **Boxes:** white, 1.5px `{colors.line}` stroke, rx 12–14, icon left (40–48px) + title (22–23px 700) + optional sub (18px muted). Boxes in one row share width and height.
- **Connectors:** 2px `{colors.blue}` straight lines (orthogonal, never diagonal), ending in an open chevron marker (`marker-end`, 8px). Vertical between layers, centred on the box above and below. Optional protocol caption in 18px mono blue beside one connector.
- **Grouping:** the delivered / highlighted layer sits on a gradient band (rx 18, 22px padding around its boxes). Cross-cutting concerns live in a `{colors.surface}` column, separated by a dashed (6/8) vertical line.
- **Layer labels:** mono 18px faint, left of each row; the highlighted layer label in blue.
- **Bar comparisons:** horizontal 40px bars, 6px radius, mono row labels, values right in 28px 700; "before" in `{colors.bar-neutral}`, "after" in blue.
- **Gantt:** see components; one gradient bar for the critical phase.
- Build diagrams in one SVG with a `viewBox` equal to its pixel size so coordinates are exact; text inside SVG uses CSS classes so fonts apply.

## Depth and Elevation

Flat with structure: 1px lines and pale fills create hierarchy. No drop shadows, glows, glass or 3D. The only "depth" is the gradient band, which reads as a colored plane behind white content.

## Components

See the frontmatter for exact specs. Summary:

- **Chrome**, **footer**, **head** (tick + label + title + lead).
- **Card** (white, 1px line, 16px radius) and **panel** (surface fill).
- **Icon tile** (80px, 20px radius, pale blue, 48px blue icon).
- **Agenda row**: grid `120px 520px 1fr 80px` — mono number in blue (32px), 34px title, 22px description, mono page ref; the current part on a surface row with a blue title.
- **Fact list**: rows of mono key (220px) + 22px value, 1px lines.
- **Stat tile**: icon top, 72px navy number + small caption bottom; one tile may be solid blue with white content.
- **Issue row**: icon tile + title/description + right-aligned figure with mono caption.
- **Process steps**, **architecture diagram**, **Gantt**, **service matrix**, **logo wall**, **case metric**: see frontmatter.
- **Summary strip**: one surface row with three icon + 22px 600 statements.
- **Partner chip**: 88px surface chip with a 36px blue icon and a 24px 700 name.
- **Contact block** (on the band): 36px name, role, then mail / phone / address rows with 30px white icons and white 35% lines.

## Slide Archetypes

1. **Cover** — mono label with date; `hero` title with the key phrase in gradient text; lede; meta row (prepared for / by / reference) above the footer; gradient band with abstract network line-art on the right.
2. **Agenda** — head with a duration lead; five agenda rows filling the frame; the current part highlighted.
3. **Company overview** — 6-column intro (lede + fact list: founded, industries, certifications) + 2 × 2 stat tiles (one solid blue).
4. **Capabilities** — 3 × 2 capability cards: icon tile, code (C1–C6), card title, two-line description.
5. **Client challenge** — 5-column callout (gradient `stat-xl` percentage, lede, source line) + three issue rows with icons and figures.
6. **Architecture** — full-frame SVG: four layers, the core layer on the gradient band, connectors, cross-cutting column.
7. **Delivery approach** — five process steps with durations and deliverables; summary strip in row 6.
8. **Case study** — 5-column story panel (logotype, tags, challenge, what we did) + three metrics and a before/after bar comparison.
9. **Roadmap** — Gantt over 24 weeks with milestone row, five workstreams, one gradient critical bar, one ongoing dashed bar.
10. **Service matrix** — tier table with the recommended column highlighted and a price row.
11. **Clients and partners** — 6 × 2 logotype wall + technology partner chips.
12. **Closing / contact** — next-steps list with mono dates on white; contact block in white on the gradient band.

Other business slides (team, org chart, pricing breakdown, risk register, SWOT, KPI dashboard) reuse the same parts: head block, cards or rows with icon tiles, tables with a highlighted column, one gradient highlight.

## Motion

- `.reveal` fades in and rises 16px when the slide gets `.visible`: 0.6s `cubic-bezier(0.22, 1, 0.36, 1)`, staggered `--i` × 70ms (+80ms).
- Comparison bars grow from the left (`scaleX`, 0.9s).
- No looping, bouncing or parallax. `prefers-reduced-motion` is handled by viewport-base.css; print forces `.reveal` visible.

## Do's and Don'ts

### Do

- Keep the chrome and head block in exactly the same place on every slide.
- Use icons from the sprite, always on the same 24px grid with the same stroke.
- Spend the gradient once per slide; let blue, navy and pale blue do the rest.
- Use tabular figures and thousands separators for every number.
- Mark fictional or illustrative data in the footer.
- Replace placeholder logotypes with real logos in one grey only.

### Don't

- Don't use filled, duotone, emoji or stock icons, or mix icon sets.
- Don't add drop shadows, glassmorphism, 3D or glowing effects.
- Don't put the gradient behind text blocks or use it as a full-slide background on content slides.
- Don't introduce other hues (green/red status colors included); show status with check icons, dashes and navy vs. blue.
- Don't center titles or vary their position from slide to slide.
- Don't use Inter, Roboto, Arial or system fonts as the display face, and don't use the generic indigo `#6366f1` or purple gradients.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

Chinese company introductions and solution proposals (公司介绍、解决方案、投标方案) are a key use case for this template. Plus Jakarta Sans and IBM Plex Mono have no CJK glyphs; Chinese falls through to **Noto Sans SC (思源黑体)**, whose neutral geometry sits well next to Plus Jakarta Sans.

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight (CJK) |
|---|---|---|---|
| Hero, closing, metrics, stat tiles | Plus Jakarta Sans 800 | Noto Sans SC | 900 |
| Titles, card and row titles | Plus Jakarta Sans 700 | Noto Sans SC | 700 |
| Body, lede, table | Plus Jakarta Sans 400 | Noto Sans SC | 400 |
| Medium UI text (chips, facts) | Plus Jakarta Sans 500–600 | Noto Sans SC | 500 |
| Labels, section names (mono) | IBM Plex Mono 500 | Noto Sans SC | 500 |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
```

### Mixed-Content Strategy

Latin first, so Latin words and **all digits** keep Plus Jakarta Sans / Plex Mono and Chinese characters fall through:

```css
--font: 'Plus Jakarta Sans', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--mono: 'IBM Plex Mono', 'Noto Sans SC', 'PingFang SC', monospace;
```

Put `lang="zh-CN"` on `<html>` and add:

```css
:lang(zh) .head h2 { letter-spacing: 0; line-height: 1.25; }
:lang(zh) .s-cover h1, :lang(zh) .s-close h2 { letter-spacing: 0; line-height: 1.22; font-weight: 900; }
:lang(zh) .label, :lang(zh) .section, :lang(zh) .foot, :lang(zh) .cover-meta span { letter-spacing: 0.04em; }
:lang(zh) .lede, :lang(zh) .body, :lang(zh) .small { line-height: 1.75; }
:lang(zh) .small { font-size: 22px; }
```

Weight 800 has no exact Noto Sans SC match (it ships 100–900 in the variable font; Google serves the weights you request), so request 900 for hero/metric roles and 700 for titles.

### Universal CJK Adjustments

- **Line-height:** titles 1.2–1.3; hero 1.2; body 1.7–1.8; table cells 1.4. Raise row heights in tables and cards if two-line Chinese cells appear.
- **Tracking:** 0 on Chinese headlines and body; mono-style labels +0.04em max (uppercase has no effect).
- **Sizes:** Chinese descriptions ≥ 22px (raise `.small` from 20px); table text 22–24px.
- **Title length:** the head title must stay on one line — ≤ 16 Chinese characters at 60px with a lead, ≤ 24 without. Card titles ≤ 10 characters; agenda titles ≤ 8.
- **Punctuation:** full-width （，。：；！？「」）; no period at the end of titles, card titles or table cells.
- **Spacing (盘古之白):** a space between Chinese and Latin or digits: `覆盖 14 个国家`, `基于 Northbridge Core`.
- **No orphans:** headings use `text-wrap: balance`; still check that no line ends with a single character.
- **Mono labels in Chinese:** short Chinese labels (`公司概况`, `解决方案架构`) work in the mono stack — they render in Noto Sans SC 500. Keep the gradient tick.

### Numbers in Chinese business decks

- Keep Arabic numerals (Plus Jakarta Sans, tabular) for all metrics: `1,350 名`, `14 个国家`, `99.9%`.
- Large amounts in **万 / 亿**, with the unit as a half-size suffix in the same weight: `4.12<small>亿元</small>`, `3,120<small>万</small>`. Choose one convention per deck — do not mix `€412M` and `4.12 亿欧元`.
- Prices: `¥31,200/月` or `3.12 万元/月`; tables: right-align or centre consistently, keep the unit in the column header (`月费（元）`) so cells hold numbers only.
- Dates: `2027 年 1 月 11 日` in body text; `2027.01.11` or `01/11` in mono contexts (Gantt, next-steps list). Weeks: `第 21 周`, durations `6 周`, `24 周`.
- Percent changes: `−42%` or `下降 42%`; growth `+18%` or `增长 18%`. Keep the sign glyph in the Latin face.

### Aesthetic Notes for This System

The corporate blue look is very familiar in Chinese business culture, so restraint is what makes it look premium: keep the white space, keep the gradient to one highlight, and resist adding drop shadows or 3D icons. Noto Sans SC 700 titles next to blue line icons read crisp and modern. In the architecture diagram, Chinese box titles of 4–7 characters (`事件数据湖`, `规则引擎`, `到达时间预测`) fit the 364px boxes at 23px; set SVG Chinese labels with `font-weight: 700; letter-spacing: 0` explicitly, because SVG text does not get the `:lang` rules above unless its classes are listed.

### Known CJK Gap

IBM Plex Mono has no Chinese; mixed labels like `第 03 部分` render the digits in Plex Mono and the characters in Noto Sans SC, which is intended. Noto Sans SC from Google Fonts may load slowly or fail on networks in mainland China; the stack falls back to PingFang SC / Microsoft YaHei, which keep the layout intact. If fonts must be guaranteed offline, embed a subset of Noto Sans SC containing only the characters used.

## Iteration Guide

1. Copy the chrome, head block and empty frame; update the section number and name.
2. Write the title as a claim (≤ 34 Latin / 16 Chinese characters), with an optional one-sentence lead.
3. Choose one structured block from the archetypes; keep it to the row/card limits.
4. Add icons from the sprite (or draw new ones with the rules above).
5. Decide the single gradient highlight for the slide, if any.
6. Format numbers (tabular, separators, units) and mark demo data in the footer.
7. Verify at 1920×1080, 1280×720 and on a phone: no overflow, title does not reach the frame, fonts loaded.

## Known Gaps

- No photo archetype. If photos are required (team, site), place them in 16px-radius frames at grid spans, no border, and keep icons and gradient off the image.
- The icon set covers technology, logistics and contact topics; other domains need new icons drawn to the same rules.
- Diagrams and charts are hand-placed SVG and CSS; there is no data binding. No line or pie chart is included — build them in SVG with 2–3px blue strokes, line gridlines and the gradient only on the key series.
- Plus Jakarta Sans's hyphen is wide; avoid hyphenated words in large headlines where it reads like a dash.
