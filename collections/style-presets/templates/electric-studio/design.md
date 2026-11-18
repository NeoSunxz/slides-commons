---
version: alpha
name: Electric Studio
description: A bold, clean, high-contrast studio system in which every slide is split into two flat color fields — white and electric blue, or white / blue and near-black — top over bottom or left beside right. A short black accent bar sits on the seam between the panels, brand marks and page chrome sit in the four corners, and one geometric family (Manrope) does everything, from 800-weight headlines and hero quotes with very tight tracking to regular body copy and bold uppercase labels. Spacing is minimal and confident; one idea per slide. A slides-commons derivative of the "Electric Studio" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 2 'Electric Studio' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file."

colors:
  bg-dark: "#0a0a0a"
  bg-white: "#ffffff"
  accent-blue: "#4361ee"
  text-dark: "#0a0a0a"
  text-light: "#ffffff"
  muted-on-white: "rgba(10, 10, 10, 0.62)"
  faint-on-white: "rgba(10, 10, 10, 0.40)"
  rule-on-white: "rgba(10, 10, 10, 0.14)"
  track-on-white: "rgba(10, 10, 10, 0.14)"
  muted-on-color: "rgba(255, 255, 255, 0.78)"
  faint-on-color: "rgba(255, 255, 255, 0.56)"
  rule-on-color: "rgba(255, 255, 255, 0.28)"
  blue-tint: "rgba(67, 97, 238, 0.08)"
  stage-bg: "#050505"

color-aliases:
  accent: accent-blue
  slide-bg: bg-white
  ink: text-dark

typography:
  hero:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 168px
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: -0.04em
  display:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 128px
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: -0.04em
  statement:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 104px
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.035em
  quote:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 88px
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: -0.035em
  title:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 80px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.035em
  sub:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 56px
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.03em
  section-num-xl:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 520px
    fontWeight: 800
    lineHeight: 0.72
    letterSpacing: -0.06em
  stat-xl:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 280px
    fontWeight: 800
    lineHeight: 0.84
    letterSpacing: -0.06em
  stat:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 104px
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: -0.05em
  item-title:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.015em
  lede:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.45
  body-sm:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Manrope, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 700
    letterSpacing: 0.14em
    textTransform: uppercase

spacing:
  page-x: 120px
  chrome-top: 56px
  chrome-bottom: 52px
  pane-top: 152px
  pane-bottom: 128px
  pane-seam-pad-h: 72px
  pane-seam-pad-v: 96px
  edge-bar: "240px x 16px"
  label-to-title: 28px
  title-to-body: 32px

canvas:
  width: 1920px
  height: 1080px

panels:
  split-h: "top pane 0 → --seam, bottom pane --seam → 1080. Seam between 392px and 872px."
  split-v: "left pane 0 → --seam, right pane --seam → 1920. Seam between 720px and 1080px."
  colors: "white, blue or dark; the two panes of one slide are always different colors"

components:
  pane:
    description: "Absolutely positioned flex column filling one side of the seam. Top / left panes clear the corner marks with 152px top padding; bottom / right panes keep 128px bottom padding. Padding on the seam side is 72px (split-h) or 96px (split-v)."
  edge-bar:
    size: "240 x 16px (split-h, horizontal, left-aligned at 120px) or 16 x 240px (split-v, vertical, from the top)"
    background: "{colors.bg-dark}"
    description: "The accent bar on the panel edge. Centred on the seam. Black by default; blue when the slide has no blue pane; white when one pane is black and the other blue."
  corner-marks:
    description: "Four labels at 56px / 52px from top and bottom and 120px from the sides: brand mark + studio name (top-left), document id (top-right, 60% opacity), section name (bottom-left, 60%), page number '04 / 11' (bottom-right). Each mark takes the ink color of the pane it sits on."
  brand-mark:
    size: 32px
    description: "A 32px blue square with a 14px black square in its bottom-right corner. On blue or black panes the square turns white."
  agenda-row:
    description: "Grid 112px / 1fr / auto: blue numeral (Manrope 800 44px), item title (36px 700) + one-line description (22px muted), duration label right. Rows divided by hairlines and fill the pane height."
  column-list:
    description: "Up to four columns on a blue pane, separated by 1px white-28% rules: numeral top (Manrope 800 64px), item title and description at the bottom."
  tick-list:
    description: "Rows of 28px text under a 2px currentColor rule, each with a short dash (on white) or a 16px blue square (on black), separated by hairlines."
  stat-row:
    description: "Blue Manrope 800 104px numeral over a 24px caption whose first words are bold. Three rows share the pane height."
  hbar-chart:
    description: "Horizontal bars: grid 240px name / 1fr track / 120px value. Neutral bars {colors.track-on-white}; the message bar {colors.accent-blue} with a 40px blue 800 value. 2px ink axis rule under the header labels."
  table:
    description: "Full width, table-layout fixed, hairline rows. Header labels with a 2px ink rule; the recommended column header is a solid blue cell and its body cells use {colors.blue-tint}. Marks: filled blue circle = yes, 3px blue ring = partly, short faint bar = no."
  quote:
    description: "Black top pane: a blue Manrope 800 quotation mark (300px) and the quote in {typography.quote}. Blue bottom pane: name (40px 800) and role (22px)."
---

# Electric Studio

> **Attribution.** This design system is a slides-commons derivative of the **"Electric Studio"** preset (preset 2) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). The preset defines the font, the five core colors, the split-panel layout and the signature elements; the panel system, extended tokens, components, slide archetypes and this document were written for slides-commons (MIT). It is not an official frontend-slides file and is not endorsed by its author.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its pane and no text touches the corner marks. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Electric Studio is a **two-panel system**. Every slide is cut into exactly two flat color fields — white and electric blue (`{colors.accent-blue}` #4361ee), or one of them against near-black (`{colors.bg-dark}` #0a0a0a). The default cut is **white on top, blue below**; the same rule turned 90° gives a left/right split. Where the two fields meet, a short, heavy **accent bar** sits on the panel edge, and four small **corner marks** frame the slide: the studio's brand mark, a document id, the section name and the page number.

It reads like a design studio's proposal: sharp, expensive and calm. One family — **Manrope** — carries everything. Headlines, numbers and quotes are Manrope 800 with very tight tracking; body copy is Manrope 400; labels are Manrope 700 in wide-tracked capitals. The **quote is a hero element**: when a slide carries someone's words, the quote is set as large as a headline.

**Key characteristics**

- Two flat panels per slide, never three; the two are always different colors.
- The seam position moves per slide (between 392 and 872px for top/bottom, 720 and 1080px for left/right) to give each slide its own proportion.
- A 240 × 16px accent bar sits on the seam, black by default.
- Brand marks and page chrome sit in the four corners, colored to match the pane under them.
- Manrope only: 800 for display, 700 for labels and item titles, 400 for running text.
- Minimal, confident spacing: big type, few elements, generous empty color.

**Density philosophy: medium.** One idea per slide, set large. A pane holds a title block, or one list, or one stat group — not all three. When a slide wants more, give it another slide with the seam in a different place.

## Colors

### Palette

- **White** (`{colors.bg-white}` #ffffff): the default top / left pane and the reading surface for lists, tables and charts.
- **Electric blue** (`{colors.accent-blue}` #4361ee): the second field on most slides, the accent color for numerals, chart highlights, the recommended table column and the brand mark.
- **Near-black** (`{colors.bg-dark}` #0a0a0a): the third field, used for quote and table-header panes and for the accent bar. It also serves as **text dark** (`{colors.text-dark}`) on white.
- **Text light** (`{colors.text-light}` #ffffff): all text on blue and on black.
- **Derived tokens** (transparencies of the preset colors, not new hues):
  - `{colors.muted-on-white}` black 62% — body copy and labels on white.
  - `{colors.faint-on-white}` black 40% — axis labels, table header labels.
  - `{colors.rule-on-white}` black 14% — hairlines on white. `{colors.track-on-white}` (same value) — neutral chart bars.
  - `{colors.muted-on-color}` white 78% — body copy and labels on blue / black.
  - `{colors.faint-on-color}` white 56% — secondary marks on blue / black.
  - `{colors.rule-on-color}` white 28% — hairlines on blue / black.
  - `{colors.blue-tint}` blue 8% — body cells of the recommended table column.

### Defaults

- Slide background: `{colors.bg-white}`; panes paint over it. Stage background (letterbox): `{colors.stage-bg}`.
- Headlines: `{colors.text-dark}` on white, `{colors.text-light}` on blue and black.
- Body: `{colors.muted-on-white}` on white, `{colors.muted-on-color}` on blue and black.
- Emphasis inside a headline on white: color the phrase blue (`<span class="blue-ink">`), or end a short headline with a blue period.
- **Never set dark text on blue.** White on #4361ee is about 5.0:1; near-black on it is about 4.0:1 and looks muddy. Blue text on white (about 5.0:1) is fine at 28px and up.

Allowed pane pairs: white + blue (default), white + black, blue + black. Never two panes of the same color, never a blue + blue gradient, never a fourth color.

## Typography

### Font Family

- **Manrope** — Google Fonts, weights 400 / 500 / 700 / 800. The only family.
  - 800: every headline, numeral, the hero quote and the cover title.
  - 700: labels (uppercase, +0.14em), item titles, names.
  - 500: chart row names, table cell emphasis.
  - 400: lede, body, captions.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size / line-height | Weight · tracking | Use |
|---|---|---|---|
| `{typography.section-num-xl}` | 520 / 0.72 | 800 · −0.06em | Section-divider numeral |
| `{typography.stat-xl}` | 280 / 0.84 | 800 · −0.06em | The hero number on a stats slide |
| `{typography.hero}` | 168 / 0.92 | 800 · −0.04em | Cover title, closing line (≤ 2 lines) |
| `{typography.display}` | 128 / 0.94 | 800 · −0.04em | Agenda title, divider title |
| `{typography.statement}` | 104 / 1.04 | 800 · −0.035em | Full-width statement (≤ 4 lines) |
| `{typography.stat}` | 104 / 0.95 | 800 · −0.05em | Supporting stat numerals |
| `{typography.quote}` | 88 / 1.08 | 800 · −0.035em | Hero quote (≤ 110 characters) |
| `{typography.title}` | 80 / 1.0 | 800 · −0.035em | Content-slide title |
| `{typography.sub}` | 56 / 1.04 | 800 · −0.03em | Column title, chart takeaway (44px variant) |
| `{typography.item-title}` | 36 / 1.15 | 700 · −0.015em | List and agenda item titles |
| `{typography.lede}` | 34 / 1.4 | 400 | Cover subtitle, stat caption |
| `{typography.body}` | 28 / 1.45 | 400 | Paragraphs, list rows |
| `{typography.body-sm}` | 22 / 1.45 | 400 | Item descriptions, sources |
| `{typography.label}` | 18, +0.14em, UPPERCASE | 700 | Labels, corner marks, table and axis headers |

Minimum on-slide text is 18px (labels only); running text is never below 22px.

### Signature Treatments

- **Tight extra-bold headlines** in sentence case: Manrope 800 at −0.035 to −0.04em. Never all caps, never italic.
- **Quote as hero.** A testimonial or principle is set at 88px 800 with a 300px blue quotation mark above it — the same visual weight as a headline.
- **Blue period / blue phrase.** On white, one short phrase or the final period of a headline may be blue. One per slide.
- **Label above title,** 28px gap; body 32px below.
- **Numbers as heroes,** with units in the numeral (`−38%`, `4.6`).

## Layout

### Panels

Each slide is `.slide.split-h` (top / bottom) or `.slide.split-v` (left / right) with an inline `--seam` in px:

```html
<section class="slide split-h" style="--seam:760px"> … </section>
```

| Pane | Box | Padding |
|---|---|---|
| `.split-h .pane.top` | `top 0 → --seam`, full width | `152px 120px 72px` (content bottom-aligned) |
| `.split-h .pane.bottom` | `--seam → 1080`, full width | `72px 120px 128px` |
| `.split-v .pane.left` | `0 → --seam`, full height | `152px 96px 128px 120px` |
| `.split-v .pane.right` | `--seam → 1920`, full height | `152px 120px 128px 96px` |

The 152px top and 128px bottom padding keep content clear of the corner marks; the 72 / 96px seam padding keeps content clear of the accent bar.

### Corner marks

| Mark | Position |
|---|---|
| Brand (mark + name) | `top 56px; left 120px` |
| Document id | `top 56px; right 120px` (60% opacity) |
| Section name | `bottom 52px; left 120px` (60% opacity) |
| Page number | `bottom 52px; right 120px` |

Add `.inv` to a corner mark when the pane under it is blue or black.

### Composition rules

- Top / left pane: the title block, bottom-aligned (it ends just above the seam). Bottom / right pane: the supporting content, top-aligned from the seam.
- Move the seam to fit the content: a low seam (760–872px) gives a big top pane for a cover or statement; a high seam (392–448px) gives a deep bottom pane for a table or four columns.
- Left-aligned everywhere. No centred slides.
- One accent bar per slide.

## Depth and Elevation

Flat. No shadows, gradients, glows or rounded corners on panels (the only rounding is the circular table marks). Depth comes from the two color fields and the black accent bar on their edge. Hairlines (1px) separate rows; 2px rules in ink or currentColor head lists and tables.

## Components

- **Pane** (`.pane.white|.blue|.dark` + `.top|.bottom|.left|.right`): see Layout.
- **Accent bar** (`.edge-bar`): 240 × 16px on a horizontal seam, 16 × 240px on a vertical one. Black by default; `.blue` when the slide has no blue pane; `.white` when the two panes are black and blue.
- **Brand mark**: 32px blue square with a 14px black square in its corner; white square on colored panes.
- **Agenda rows**: grid `112px 1fr auto`; numeral blue 800 44px; title 36px 700; description 22px; duration label right; hairlines between rows; rows fill the pane height.
- **Column list**: up to four columns on a blue pane; 1px white-28% dividers; numeral 64px 800 at the top, title + description at the bottom.
- **Tick list**: 28px rows under a 2px currentColor rule; dash markers on white, 16px blue squares on black.
- **Stat rows**: three rows, blue 104px 800 numeral + 24px caption with a bold lead-in.
- **Horizontal bar chart**: rows `240px 1fr 120px` (name, track, value), 76px tall; neutral bars `{colors.track-on-white}`, the message bar blue with a 40px 800 blue value. Width = value / axis max.
- **Comparison table**: see tokens; legend on the dark title pane.
- **Quote**: see tokens.
- **Closing steps**: four columns on blue — three dated steps (date 48px 800) and a contact column with a 2px white left rule.

## Slide Archetypes

The demo deck implements each of these.

1. **Cover** — `split-h`, seam 760, white over blue. Top: label, `hero` title (2 lines, blue period), lede. Bottom: three label/value pairs (prepared for / by / date).
2. **Agenda** — `split-v`, seam 720, blue left with label + `display` "Agenda" bottom-left; white right with 5 agenda rows.
3. **Section divider** — `split-h`, seam 760, blue over white. Top: `section-num-xl` numeral bottom-left, "Section two of five" label right. Bottom: `display` title and one sentence side by side.
4. **Statement** — `split-h`, seam 840, white over blue. Top: label + `statement` (≤ 4 lines) with one blue phrase. Bottom: source line.
5. **List (four principles)** — `split-h`, seam 448. Top: label + `title` left, body sentence right. Bottom (blue): four columns.
6. **Two columns (today / proposed)** — `split-v`, seam 960, white left / black right, blue accent bar. Each: label, `sub` title, tick list.
7. **Big number + stats** — `split-v`, seam 1080, blue left with `stat-xl` + lede; white right with three stat rows.
8. **Chart** — `split-h`, seam 808. Top: title column (520px) + horizontal bar chart. Bottom (blue): one-sentence takeaway in `sub` 44px + source.
9. **Comparison table** — `split-h`, seam 392, black over white. Top: label, `title`, legend. Bottom: 4-row table.
10. **Quote** — `split-h`, seam 792, black over blue, white accent bar. Top: blue quotation mark + `quote`. Bottom: name + role.
11. **Closing** — `split-h`, seam 600, white over blue. Top: label + `hero` line with blue period. Bottom: three dated steps + contact.

Other layouts (team, timeline, process) use the same parts: one seam, a bottom-aligned title pane, a top-aligned content pane, an accent bar on the seam.

## Motion

- `.reveal` elements fade in and rise 28px when the slide gets `.visible`: 0.7s `cubic-bezier(0.16, 1, 0.3, 1)`, staggered `--i` × 90ms + 120ms.
- The second pane wipes open from the seam (`clip-path`), 0.8s.
- The accent bar draws along the seam (`scaleX` / `scaleY` from 0), 0.7s after a 0.35s delay.
- Horizontal chart bars grow from the axis (`scaleX`), staggered 70ms.
- No bounce, rotation or looping motion; `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Split every slide into exactly two flat panels, and move the seam to suit the content.
- Put the accent bar on the seam and the four corner marks on every slide.
- Use Manrope 800 with tight tracking for every headline, numeral and quote.
- Use white text on blue and black; dark text only on white.
- Let one quote per deck be a full hero slide.
- Split content into more slides rather than shrinking type below the scale.

### Don't

- Don't add a third panel, a card on top of a panel, or a gradient between panels.
- Don't use any hue other than white, #4361ee and #0a0a0a (and their transparencies).
- Don't round panel corners or add shadows and glows.
- Don't set headlines in all caps or italics, and don't use a second font family.
- Don't centre slides or build identical card grids.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients (frontend-slides "DO NOT USE" list). Note that #4361ee is the preset's own electric blue — keep it exact.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, numerals, quotes (Manrope 800) | Manrope | Noto Sans SC (思源黑体) | 800 |
| Labels, item titles (Manrope 700) | Manrope | Noto Sans SC | 700 |
| Body, lede (Manrope 400) | Manrope | Noto Sans SC | 400 |

### Mixed-Content Strategy

Use one stack with Manrope first and Noto Sans SC as fallback, so Latin glyphs and digits render in Manrope and Chinese characters fall through automatically:

```css
--font: 'Manrope', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Manrope and Noto Sans SC share a geometric, open structure, and both have true 400 / 700 / 800 weights, so mixed lines keep an even color without faux bold.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Noto+Sans+SC:wght@400;500;700;800&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.15–1.25 (raise `hero` / `display` / `title` from 0.92–1.0 to at least 1.15 for Chinese).
- Letter-spacing 0 on CJK text (drop the −0.04em headline tracking and the +0.14em label tracking).
- No `text-transform: uppercase` effect on CJK; labels stay as written.
- Full-width punctuation （，。：；！？「」（））. No period at the end of a Chinese headline, so the blue-period treatment becomes a blue phrase instead.
- Pangu spacing (盘古之白): a space between CJK and Latin/numbers, e.g. `试点 6 个车站`.
- Avoid a single orphan character on the last line of a headline: rebalance with `<br>` or shorten.
- One font per sentence.

### Aesthetic Notes for This System

Electric Studio's character is the **flat color split and the weight of the type**, which carry over to Chinese unchanged. Set Chinese headlines in Noto Sans SC 800 to match Manrope 800. Chinese is denser per character: a 104px `statement` holds 2–3 lines of 12–14 characters. The hero quote works well in Chinese at 80–88px with 「」 quotation marks; keep the blue Latin quotation mark above it as a graphic. Corner marks work with short Chinese labels (洞察 / 系统 / 计划); the page number stays in Manrope digits.

### Known CJK Gap

Noto Sans SC at 800 is slightly heavier and taller than Manrope 800 at the same size. In mixed headlines, keep Latin to names and numbers, or lower the Chinese headline size by about 5%.

## Iteration Guide

1. Pick the split (`split-h` or `split-v`) and the seam for the slide's content.
2. Pick the two pane colors (white + blue by default; black for quotes and table heads).
3. Put the title block bottom-aligned in the top / left pane, with a label 28px above it.
4. Put the supporting content top-aligned in the other pane.
5. Add the accent bar on the seam and the four corner marks, inverting their ink on blue / black.
6. Use only the type scale tokens; never interpolate new sizes.
7. White text on blue and black, dark text on white.
8. If a pane needs more than a title block, one list or one stat group, split the slide.
9. Update the section name in the bottom-left corner; let the script fill page numbers.
10. Verify at 1920×1080, 1280×720 and on a phone: no overflow, nothing touching the corners, fonts loaded.

## Known Gaps

- The original preset gives one font, five colors, a one-line layout ("split panel — white top, blue bottom; brand marks in corners") and four signature elements. The seam system, padding, derived transparencies, type scale and components here are slides-commons extensions in the spirit of the preset.
- Manrope has no italic; there is no italic emphasis in this system.
- The chart and table are hand-built with CSS; bar widths are inline `--w` percentages (value / axis max). There is no data binding.
- No image archetype is included. If photos are used, a photo fills one whole pane edge to edge (square corners, no border) and the accent bar still sits on the seam.
