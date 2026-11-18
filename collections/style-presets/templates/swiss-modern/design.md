---
version: alpha
name: Swiss Modern
description: A clean, precise light system in the International Typographic Style. A pure white page shows its own 12-column grid as faint full-height lines; type is pure black; one signal red (#ff3300) marks the single most important word, number, shape or column on each slide. Archivo 800 carries headlines, numerals and small uppercase labels with very tight tracking; Nunito carries body text. Composition is asymmetric and built from flat geometric shapes — circle, square, triangle, half and quarter circle — and heavy black rules. A 12-column header and footer sit on the same grid as the content. A slides-commons derivative of the "Swiss Modern" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 11 'Swiss Modern' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file. The preset gives vibe, fonts, three colors and three signature elements; everything else here was developed by slides-commons."

colors:
  white: "#ffffff"
  black: "#000000"
  red: "#ff3300"
  field: "#f2f2f2"
  grey: "#d4d4d4"
  text-2: "#595959"
  grid: "rgba(0, 0, 0, 0.07)"
  hair: "rgba(0, 0, 0, 0.18)"
  stage-bg: "#e6e6e6"

color-aliases:
  accent: red
  slide-bg: white
  ink: black

typography:
  mega:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 300px
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: -0.055em
  stat-xl:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 320px
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: -0.06em
  section-num:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 400px
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: -0.06em
  hero:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 168px
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: -0.045em
  stat:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 128px
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: -0.05em
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 120px
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: -0.04em
  statement:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 92px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.035em
  title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 72px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.03em
  quote:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 68px
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: -0.03em
  card-title:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 36px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -0.02em
  lede:
    fontFamily: "Nunito, Helvetica Neue, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 400
    lineHeight: 1.38
  body:
    fontFamily: "Nunito, Helvetica Neue, Arial, sans-serif"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Nunito, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 800
    letterSpacing: 0.06em
    textTransform: uppercase

spacing:
  page-x: 96px
  header-top: 52px
  frame-top: 168px
  frame-bottom: 128px
  footer-bottom: 44px
  gutter: 32px
  panel-pad: "40px 44px"
  label-to-title: 28px
  title-to-body: 28px

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 32px
  frame: "top 168px, left 96px, right 96px, bottom 128px (1728 x 784 px)"
  column-width: 114.67px
  column-pitch: 146.67px
  row-height: 104px
  visible: "both edges of every column drawn as 1px {colors.grid} lines over the full slide height (one repeating-linear-gradient on .slide::before, inset 96px left and right)"

components:
  header:
    position: "absolute; top 52px; left 96px; right 96px"
    description: "A 12-column grid (same columns as the frame) with a 2px black rule under it. Cols 1–3: 18px red square + organisation; cols 4–7: project name in {colors.text-2}; cols 9–11: section number in red + section name; col 12: page number '04 / 11', right-aligned. All labels."
  footer:
    position: "absolute; bottom 44px; left 96px; right 96px"
    description: "Same 12-column grid with a 1px black rule above. Cols 1–4: author/organisation; cols 5–8: status ('Draft for discussion'). Labels in {colors.text-2}."
  rule-heavy:
    description: "4px black rule on top of list blocks, stat blocks and table heads; 2px under the header; 1px {colors.hair} between rows."
  shapes:
    description: "Flat, borderless, pure black, pure red or grey: circle (border-radius 50%), square, triangle (clip-path), half circle (2:1, top corners round), quarter circle (one corner 100%). Sized to grid cells; never rotated except by 90/180 degrees; no outlines, no shadows."
  slab:
    description: "Solid black grid block (divider) with white label at the top and a white Archivo 800 numeral at the bottom, overflow clip."
  field:
    description: "Light grey {colors.field} block for quiet 'before' content; padding 40px 44px."
  black-panel:
    description: "Black block with white text for the 'after' / system content; red marks the key element inside it."
  line-diagram:
    description: "Transit-style strip: 10px white (on black) or 8px black (on white) line, 48–52px station circles with 8px rings, the current stop filled red, labels below as uppercase labels."
  paired-bars:
    description: "Horizontal bar chart: 220px name column (Archivo 800 22px), two 34px bars per row (grey = before, black = after; the key row's after-bar red with black value), value inside the bar end in Archivo 800 20px, 2px black axis with tick labels."
  table:
    description: "No vertical lines. Header cells: small grey uppercase kicker + Archivo 800 26px name, 4px black rule below. Row headers are labels. The recommended column has a red header (black text) and {colors.field} cells in Nunito 700."
  timeline:
    description: "4 milestones on an 8px black line; 52px rings (white fill, 8px black border); the current milestone filled red with a red label."
---

# Swiss Modern

> **Attribution.** This design system is a slides-commons derivative of the **"Swiss Modern"** preset (preset 11) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). It is not an official frontend-slides file and is not endorsed by its author.
>
> **What comes from the preset:** the vibe (clean, precise, Bauhaus-inspired), the fonts (Archivo 800 + Nunito 400), the three colors (pure white, pure black, red accent #ff3300) and the three signature ideas (visible grid, asymmetric layouts, geometric shapes). The preset is only these few lines.
>
> **What slides-commons developed:** everything else — the grey steps, the rendering of the visible grid, the type scale (including Archivo 800 for labels and Nunito 700 for emphasis), the 12-column header and footer, the shape vocabulary and its rules, the components (slab, field, line diagram, paired bars, option table, timeline), the archetypes, the motion rules and this document (MIT).

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its block and no blocks overlap. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Swiss Modern is a **grid you can see**. Every slide is a white page with its 12 columns drawn as faint hairlines from top to bottom; header, content and footer all snap to those columns. Black does the work, red points at the one thing that matters, and flat geometric shapes give each slide a composition rather than decoration.

**Key characteristics**

- White page, black type, red used once per slide (plus the small red square and section number in the header).
- The grid is visible: both edges of every column, full height, 7% black.
- Asymmetric layouts: big type or one big shape on one side, a structured block (list, table, stats) on the other. Staircases and offsets, never mirror symmetry.
- Flat shapes only: circle, square, triangle, half circle, quarter circle. Black, red or grey. No outlines, no shadows, no gradients, no rounded rectangles.
- Archivo 800 everywhere type must be strong (headlines, numbers, labels); Nunito 400 for reading text.

**Density philosophy: medium.** A Swiss slide is ordered, not empty: header, footer and grid are always present, so a single statement already feels complete, and a full option table still feels calm. Split when a block would break the grid.

## Colors

### Palette

- **White** (`{colors.white}` #ffffff) — *preset*. The page.
- **Black** (`{colors.black}` #000000) — *preset*. Type, rules, shapes, slabs, panels.
- **Red** (`{colors.red}` #ff3300) — *preset*. One key element per slide: a word in the headline, the hero number, a shape, the current station, the recommended column header. Also the header's brand square and section number, and labels that introduce titles.
- **Derived by slides-commons** (greys between the preset black and white; no new hues):
  - `{colors.field}` #f2f2f2 — quiet blocks and the recommended table column body.
  - `{colors.grey}` #d4d4d4 — "before" bars and inactive shapes.
  - `{colors.text-2}` #595959 — secondary text (7:1 on white).
  - `{colors.grid}` black 7% — the visible grid. `{colors.hair}` black 18% — row hairlines.
  - `{colors.stage-bg}` #e6e6e6 — letterbox.

### Contrast rules

Red #ff3300 on white is about 3.5:1 — use it for text only at 36px and above, or for labels in Archivo 800 (18px bold uppercase, which reads as large text in practice; keep red labels short). **On a red fill, use black text** (about 6:1), never white (3.5:1).

## Typography

### Font Family

- **Archivo** — Google Fonts, weight 800 only. Headlines, numerals, card titles, labels, table heads, header/footer.
- **Nunito** — Google Fonts, 400 and 700 (+400 italic available). Ledes, body, captions, table cells.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Nunito:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

Load Archivo at 800 only; never let the browser synthesise other weights.

### Type Scale

| Token | Size / line-height | Family | Use |
|---|---|---|---|
| `{typography.section-num}` | 400 / 0.8 | Archivo 800 | Numeral in the divider slab |
| `{typography.stat-xl}` | 320 / 0.8 | Archivo 800 | One hero number (red) |
| `{typography.mega}` | 300 / 0.8 | Archivo 800 | Cover word (one short word) |
| `{typography.hero}` | 168 / 0.88 | Archivo 800 | Closing line |
| `{typography.stat}` | 128 / 0.85 | Archivo 800 | Secondary numbers |
| `{typography.display}` | 120 / 0.92 | Archivo 800 | Agenda / divider titles |
| `{typography.statement}` | 92 / 1.0 | Archivo 800 | Statement (≤ 3 lines) |
| `{typography.title}` | 72 / 1.0 | Archivo 800 | Slide titles (one line) |
| `{typography.quote}` | 68 / 1.06 | Archivo 800 | Quotes (≤ 110 characters) |
| `{typography.card-title}` | 36 / 1.05 | Archivo 800 | Block and list headings |
| `{typography.lede}` | 34 / 1.38 | Nunito 400 | Cover subtitle, hero caption |
| `{typography.body}` | 26 / 1.5 | Nunito 400 | Body, table cells |
| `{typography.body-sm}` | 22 / 1.45 | Nunito 400 | Descriptions, sources (grey) |
| `{typography.label}` | 18, +0.06em, UPPERCASE | Archivo 800 | Labels, header, footer, row heads |

Minimum on-slide text 18px; running text never below 22px.

### Signature Treatments

- **Tight, heavy, sentence case.** Archivo 800 with −0.03em to −0.06em tracking; tighter as size grows. Never italics, never all-caps headlines (labels are the only uppercase).
- **Flush left, ragged right.** Every text block is left-aligned on a column edge; nothing is centred or justified.
- **Red word.** One word or number in a headline in red (`<span class="red">`), joined with `&nbsp;` if multi-word. Or a red full stop on a closing line.
- **Red label, black title.** A short red uppercase label sits 28px above titles.
- **Numbers as type.** Units are part of the numeral (`−58%`, `2,400`); the minus sign is a real `−`.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Header (12-col grid, 2px rule below) | `top: 52px; left: 96px; right: 96px` |
| Frame (content grid) | `top: 168px; left: 96px; right: 96px; bottom: 128px` → 1728 × 784 |
| Footer (12-col grid, 1px rule above) | `bottom: 44px; left: 96px; right: 96px` |
| Visible grid | `.slide::before`, `left: 96px; right: 96px; top: 0; bottom: 0` |

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 32px; }` — columns 114.67px, pitch 146.67px, rows 104px. The visible grid uses the same numbers, so every block edge lands on a drawn line.

| Span | Width | Used for |
|---|---|---|
| 3 columns | 408px | One principle, a stat block, contact |
| 4 columns | 555px | Side title column, cover circle |
| 5 columns | 701px | Divider slab, "before" field |
| 7 columns | 995px | List, chart, "after" panel, hero number |
| 12 columns | 1728px | Title bands, tables, timelines |

### Composition rules

- **Asymmetry.** Give one side the weight (big type, a slab, a large shape) and the other the structure. Leave whole columns empty on purpose.
- **Staircase.** Repeated items (principles, milestones) step down by half a row (56px) per item instead of sitting in a flat row of equal cards.
- **Shapes sit on the grid.** A shape's width is a whole number of columns (or its height a whole number of rows); its edge aligns to a column line. Shapes may touch but not overlap text.
- **Titles at the bottom of their band** (`justify-content: flex-end`), list and stat blocks start with a 4px black rule.

## Depth and Elevation

None. Flat colour, flat shapes, rules. No shadows, gradients, transparency effects, blur or rounded rectangles. Hierarchy comes from size, weight, black vs. red, and the 4px / 2px / 1px rule system.

## Components

See the `components` tokens above for exact specs.

- **Header / footer** — on every slide; update the section number and name per section.
- **Shapes** — the only decoration; one composition per slide (1–3 shapes).
- **Slab** (divider), **field** (before), **black panel** (after).
- **Agenda list** — 4px top rule, 5 rows split by hairlines: red Archivo number (32px), title (Archivo 800 36px) + grey description (22px), duration label right.
- **Principles** — 4 staircase columns: 4px rule, 88px shape, red number label, card-title, grey description.
- **Line diagram**, **paired bars**, **option table**, **timeline** — see tokens.

## Slide Archetypes

The demo deck implements each of these. Coordinates are grid spans inside `.frame`.

1. **Cover** — row 1, cols 1–7: three label/value meta pairs. Cols 1–8 bottom: `mega` word + lede. Cols 9–12: red circle (rows 1–4), black square (col 9, row 5), black bar (row 6).
2. **Agenda** — cols 1–4: red label, `display` "Agenda", one sentence. Cols 6–12: agenda list.
3. **Section divider** — slab cols 1–5 full height with `section-num`; cols 7–12: red square, red label, `display` title, body.
4. **Statement** — cols 1–10 rows 2–6: red label, `statement` with one red phrase, grey source. Black quarter circle cols 11–12 rows 1–2, tucked into the top-right corner.
5. **Principles** — title band cols 1–7 rows 1–2; 4 staircase columns (3 cols each) rows 3–6.
6. **Two columns** — title band; grey field cols 1–5 (abstract "today" shapes + caption); black panel cols 6–12 (line diagram + caption).
7. **Stats** — cols 1–7: red label, red `stat-xl`, lede. Cols 9–12: two stat blocks (4px rule, label, `stat`, body).
8. **Chart** — cols 1–4: label, title, takeaway, legend. Cols 6–12: paired bars, ≤ 6 rows.
9. **Table** — title band; option table cols 1–12 rows 3–6, ≤ 4 options × 5 rows.
10. **Quote** — cols 1–9 rows 1–5: red label + quote; cols 1–6 row 6: attribution with 4px rule; cols 11–12: red half circle (top) and black circle (bottom).
11. **Closing** — cols 1–9 rows 1–3: label + `hero` with red full stop; cols 10–12: contact; rows 5–6: timeline across 12 columns.

Other layouts: a team slide is a staircase of names with shapes as avatars (no photos); a process is the timeline; a map is a line diagram.

## Motion

- `.reveal`: fade + 24px rise, 0.6s `cubic-bezier(0.22, 1, 0.36, 1)`, staggered 80ms.
- `.pop`: shapes scale from 0.6 to 1 with a fade, 0.8s.
- `.wipe`: bars and lines draw from the left (`scaleX`), 0.9s.
- No loops, no rotation, no bounce. Motion is quick and mechanical. `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Keep the grid visible and put every edge on a grid line.
- Use red once per slide for the one thing to remember.
- Build compositions from 1–3 flat shapes and heavy rules.
- Use Archivo 800 for every number and headline; Nunito for reading text.
- Leave columns empty; asymmetry is the point.

### Don't

- Don't add colours: no blue, no yellow, no tints of red. Greys only as defined.
- Don't centre text or compositions, and don't build rows of identical cards.
- Don't use outlines, shadows, rounded rectangles, gradients or glass effects; don't use illustrations or icons — only the five shapes.
- Don't put white text on red.
- Don't use Inter, Roboto, Arial or system fonts as the display face, purple gradients or `#6366f1` (frontend-slides "DO NOT USE").
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, numbers, labels (Archivo 800) | Archivo | Noto Sans SC (思源黑体) | 900 (labels 700) |
| Body (Nunito 400/700) | Nunito | Noto Sans SC | 400 / 700 |

### Mixed-Content Strategy

```css
--font-display: 'Archivo', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
--font-body: 'Nunito', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Archivo elements are set at 800; load Noto Sans SC 900 and set `:lang(zh) .d { font-weight: 900; }` so Chinese headlines match Archivo's mass (Archivo is only loaded at 800, so Latin glyphs in those elements fall back to the 800 face — no synthetic bold).

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Nunito:ital,wght@0,400;0,700;1,400&family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.15–1.25 (raise `mega`, `hero`, `display` from 0.8–0.92 or lines collide).
- Letter-spacing 0 on CJK — drop the −0.03 to −0.06em tracking, which crushes Chinese strokes.
- Labels: `text-transform: uppercase` has no effect on CJK; keep labels to 2–6 characters.
- Full-width punctuation （，。：；！？「」）. A red full stop works with the Chinese 。 too.
- Pangu spacing between CJK and Latin/numbers: `等待时间减少 58%`.
- Flush left; avoid a single orphan character on the last line.
- One font per sentence.

### Aesthetic Notes for This System

The Swiss look transfers to Chinese cleanly — it lives in the grid, the shapes and black vs. red. Chinese sits naturally on a square grid: keep headline line lengths to whole columns (e.g. 8–12 characters at 72px across 7 columns). Noto Sans SC 900 has the right weight for headlines; use 400 for body and grey captions. The `mega` cover word can be two Chinese characters.

### Known CJK Gap

Nunito's rounded terminals have no Chinese counterpart on Google Fonts; Chinese body text in Noto Sans SC is slightly more rigid than the Latin. This suits the Swiss style and needs no workaround.

## Iteration Guide

1. Start from header, footer, the visible grid and an empty 12 × 6 frame.
2. Decide the slide's one red element.
3. Put the heavy element on one side, the structure on the other.
4. Titles bottom-aligned with a red label above.
5. Only the type scale tokens; Archivo 800 or Nunito.
6. Shapes from the five, sized to the grid, black/red/grey.
7. Rules: 4px over blocks, 2px under the header, 1px between rows.
8. Split rather than break the grid.
9. Update the header section; the script fills page numbers.
10. Verify at 1920×1080, 1280×720 and a phone; check every edge sits on a grid line.

## Known Gaps

- The original preset is four lines: vibe, fonts, three colors, three signature ideas. The greys, grid rendering, chrome, shape rules, components and archetypes here are slides-commons developments in the spirit of the preset.
- Nunito (a rounded sans) is the preset's choice; a stricter Swiss system would use a grotesque for body text. It is kept for fidelity to the preset.
- Charts and tables are hand-built in CSS; bar widths are inline `--w` percentages (value / axis max). No data binding.
- No image archetype. If photos are needed, crop them to whole grid cells, full-bleed within the cell, no borders, and keep red off them.
