---
version: alpha
name: Pastel Geometry
description: A friendly, organised light system built around one large rounded off-white card floating on a powder-blue background. Five pastel pills (pink, mint, sage, lavender, violet) stand on the card's right edge as section tabs — consistent width, heights short → medium → tall → medium → short — and the current section's pill slides out. Plus Jakarta Sans carries everything, extra-bold and tightly tracked for headlines, regular for body. Inside the card, content sits on a 12-column × 6-row grid with soft tinted panels, pill-shaped chips, pill bar charts and a CSS-drawn download icon in the top-right corner. A slides-commons derivative of the "Pastel Geometry" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 6 'Pastel Geometry' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file."

colors:
  bg-primary: "#c8d9e6"
  card-bg: "#faf9f7"
  pill-pink: "#f0b4d4"
  pill-mint: "#a8d4c4"
  pill-sage: "#5a7c6a"
  pill-lavender: "#9b8dc4"
  pill-violet: "#7c6aad"
  ink: "#1f2b36"
  ink-muted: "#56636f"
  ink-faint: "#8a96a1"
  rule: "rgba(31, 43, 54, 0.12)"
  tint-blue: "#eaf1f6"
  tint-pink: "#fbe9f2"
  tint-mint: "#e6f3ee"
  tint-lavender: "#ece9f5"
  stage-bg: "#aebfcc"

color-aliases:
  accent: pill-violet
  slide-bg: bg-primary
  text-primary: ink

section-colors:
  "01": pill-pink
  "02": pill-mint
  "03": pill-sage
  "04": pill-lavender
  "05": pill-violet

typography:
  hero:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 136px
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: -0.04em
  display:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 104px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.035em
  statement:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 80px
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: -0.03em
  title:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 68px
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: -0.03em
  quote:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 68px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.025em
  stat-xl:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 220px
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: -0.06em
  section-num-xl:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 220px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.06em
  stat:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 76px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.04em
  subtitle:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.015em
  item-title:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.015em
  lede:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 700
    letterSpacing: 0.02em
  chip:
    fontFamily: "Plus Jakarta Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 700
    letterSpacing: 0.02em

spacing:
  card-x: 96px
  card-y: 72px
  card-size: "1632 x 936 px"
  card-radius: 48px
  card-pad-x: 88px
  chrome-top: 44px
  frame-top: 148px
  frame-bottom: 120px
  gutter: 32px
  panel-radius: 32px
  panel-pad: "44px 48px"

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 32px
  frame: "inside the card: top 148px, left 88px, right 88px, bottom 120px (1456 x 668 px)"
  column-width: 92px
  row-height: 84.67px

components:
  card:
    position: "absolute; left: 96px; top: 72px; 1632 x 936 px"
    background: "{colors.card-bg}"
    borderRadius: 48px
    boxShadow: "0 40px 80px -32px rgba(31,43,54,0.28), 0 2px 8px rgba(31,43,54,0.06)"
    description: "The one white card that holds every slide's content. Same position and size on every slide."
  pills:
    position: "absolute; left: 1704px (24px behind the card's right edge); top: 104px"
    width: 80px
    heights: "104 / 168 / 248 / 168 / 104 px, gap 20px"
    borderRadius: 40px
    description: "Five vertical pills stacked down the right edge in fixed order pink, mint, sage, lavender, violet — one per deck section. Each shows its two-digit section number (18px 700) at 60% opacity; the current section's pill translates 32px outward and its number goes to full opacity."
  action-icon:
    size: 64px
    background: "{colors.tint-blue}"
    description: "A circle in the card's top-right corner with a download arrow drawn in CSS (3px stem, 11px rotated-border chevron, 24px tray). Present on every slide; becomes a violet button inside the closing slide's download row."
  brand:
    description: "Card top-left: a five-bar mini pill mark in the five pill colors, the deck owner in 20px 700, the deck name in 20px 500 {colors.ink-faint}."
  section-chip:
    height: 44px
    borderRadius: 22px
    description: "Card bottom-left: a pill in the current section's color with a white 16px dot and '02 · Section name' (18px 700). Ink text on pink/mint/lavender, white on sage/violet."
  page-number:
    description: "Card bottom-right: '04 / 11' in 20px 700 ink, '/ 11' in {colors.ink-faint}. Filled by script."
  frame:
    display: grid
    gridTemplateColumns: "repeat(12, 1fr)"
    gridTemplateRows: "repeat(6, 1fr)"
    gap: 32px
    description: "The only layout system inside the card. Content blocks are direct children placed by grid-column / grid-row spans."
  panel:
    borderRadius: 32px
    padding: "44px 48px"
    description: "Soft tinted block inside the card: tint-blue, tint-pink, tint-mint or tint-lavender. Never white on the white card, never a shadow."
  highlight:
    background: "{colors.pill-mint}"
    borderRadius: 0.5em
    padding: "0 0.18em"
    description: "Rounded marker behind 2–4 words of a statement headline (pill-pink is the alternative)."
  pill-bar:
    borderRadius: 999px
    description: "Chart bars are full pills. Neutral bars {colors.bg-primary}; the one message bar {colors.pill-violet} with an 800 36px violet value above it."
  meter:
    height: 16px
    borderRadius: 8px
    description: "Horizontal progress pill: {colors.tint-blue} track, fill in a pill color."
---

# Pastel Geometry

> **Attribution.** This design system is a slides-commons derivative of the **"Pastel Geometry"** preset (preset 6) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). The preset defines the font, the seven core colors and the signature elements (rounded card with soft shadow, vertical pills on the right edge with short → medium → tall → medium → short heights, a download/action icon in the corner); the ink colors, tints, grid, type scale, components, slide archetypes and this document were written for slides-commons (MIT). It is not an official frontend-slides file and is not endorsed by its author.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its card or panel and no panels overlap. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Pastel Geometry is a **calm, tidy light system with one object per slide: a big rounded white card** floating on powder blue. It feels like a well-made onboarding guide or a friendly product walkthrough — organised, approachable, modern, never loud.

The structure repeats on every slide:

- **The card** (`{colors.card-bg}` #faf9f7, 48px radius, soft shadow) at the same position and size on every slide. All content lives inside it.
- **The pills** — five vertical pills down the card's right edge, tucked 24px behind it, in fixed order pink → mint → sage → lavender → violet with heights 104 → 168 → 248 → 168 → 104 px. They are the deck's section tabs; the current section's pill slides 32px out.
- **Card chrome:** brand mark + deck name top-left, the download/action icon top-right, the section chip bottom-left, the page number bottom-right.
- **Between them:** a 12 × 6 grid where content is placed by span.

One typeface, **Plus Jakarta Sans**. Headlines are 800 with tight tracking (−0.03 to −0.06em) in sentence case; item titles 700; body 400/500.

**Key characteristics**

- Powder-blue slide (`{colors.bg-primary}`), one rounded off-white card, soft shadow — the only shadow in the system.
- Everything is rounded: pills, chips, panels (32px), bars, meters, avatars. No sharp corners anywhere.
- Each section owns one pill color; that color is used for the section chip, the divider's big pill and a few accents in that section.
- Text is deep slate ink (`{colors.ink}`), never pure black.
- Pastel color carries structure (sections, highlights, data), not decoration for its own sake.

**Density philosophy: medium.** One idea per slide with a supporting block (list of up to 5, a table of up to 4–5 rows, 3 stats). Leave air inside the card; when content grows, split the slide.

## Colors

### Palette

- **Background** (`{colors.bg-primary}` #c8d9e6): every slide. Also the neutral bar color in charts. Stage letterbox `{colors.stage-bg}` #aebfcc is one step darker.
- **Card** (`{colors.card-bg}` #faf9f7): the warm off-white card.
- **Pills** — the five preset accents, always in this order:
  - `{colors.pill-pink}` #f0b4d4 — section 01; quote panel tint; alternative highlight.
  - `{colors.pill-mint}` #a8d4c4 — section 02; the default headline highlight; "do" panel.
  - `{colors.pill-sage}` #5a7c6a — section 03; check badges, meters.
  - `{colors.pill-lavender}` #9b8dc4 — section 04; table header, avatars.
  - `{colors.pill-violet}` #7c6aad — section 05; the accent: hero stat numeral, the message bar in charts, checkboxes, the download button.
- **Derived tokens** (slides-commons additions, no new hues):
  - `{colors.ink}` #1f2b36 — a deep slate from the background's hue; all headlines and key text.
  - `{colors.ink-muted}` #56636f — body and descriptions. `{colors.ink-faint}` #8a96a1 — chrome, axis labels, sources.
  - `{colors.rule}` ink at 12% — hairlines.
  - Tints for panels on the card: `{colors.tint-blue}` #eaf1f6, `{colors.tint-pink}` #fbe9f2, `{colors.tint-mint}` #e6f3ee, `{colors.tint-lavender}` #ece9f5.

### Text on pills

Pink, mint, lavender and the light tints take **ink** text (lavender + ink ≈ 4.8:1). Sage and violet take **white** text (both ≈ 4.6:1). Never put white text on pink, mint or lavender (lavender + white is only 3:1).

### Defaults

- Headlines `{colors.ink}`; body `{colors.ink-muted}`; eyebrows `{colors.ink-muted}`; chrome and sources `{colors.ink-faint}`.
- Emphasis in a headline: `.hl` rounded mint marker (or pink).
- Chart: neutral bars `{colors.bg-primary}`, the one message bar `{colors.pill-violet}`.

Use at most **two** pill colors at full strength in the content area of one slide (plus the chrome). If a slide starts looking like a candy jar, move color to tints.

## Typography

### Font Family

- **Plus Jakarta Sans** — Google Fonts, weights 400 / 500 / 700 / 800. All roles.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet">
```

Set `h1, h2, h3 { font-weight: 800 }` explicitly and load 800; otherwise browsers request 700 for headings and the display voice is lost.

### Type Scale

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `{typography.stat-xl}` | 220 / 0.9, −0.06em | 800 | Hero stat numeral (violet) |
| `{typography.section-num-xl}` | 220 / 1.0, −0.06em | 800 | Number inside the divider's big pill |
| `{typography.hero}` | 136 / 0.98, −0.04em | 800 | Cover title, closing line (2 lines) |
| `{typography.display}` | 104 / 1.0, −0.035em | 800 | Agenda title, divider title |
| `{typography.statement}` | 80 / 1.12, −0.03em | 800 | Statement headline (≤ 3 lines) |
| `{typography.stat}` | 76 / 1.0, −0.04em | 800 | Secondary stat numerals |
| `{typography.title}` | 68 / 1.06, −0.03em | 800 | Standard content-slide title |
| `{typography.quote}` | 68 / 1.2, −0.025em | 700 | Pull quote |
| `{typography.subtitle}` | 36 / 1.15 | 700 | Panel heading, column heading |
| `{typography.lede}` | 32 / 1.45 | 400 | Cover subtitle, stat caption |
| `{typography.item-title}` | 30 / 1.15 | 700 | List / agenda item heading |
| `{typography.body}` | 26 / 1.5 | 400 | Paragraphs, bullets |
| `{typography.body-sm}` | 22 / 1.5 | 400 | Item descriptions, sources |
| `{typography.eyebrow}` | 20, +0.02em | 700 | Small label above a title, sentence case |
| `{typography.chip}` | 18, +0.02em | 700 | Section chip, pill numbers, table header, axis labels |

Minimum on-slide text is 18px (chips and axis labels only); running text never below 22px.

### Signature Treatments

- **Tight, heavy, sentence case.** Headlines are 800 with negative tracking. No all caps (eyebrows and chips are sentence case too), no italics.
- **Eyebrow above title**, 24px gap; body 28px below.
- **Rounded marker** (`.hl`) behind 2–4 words of a statement: `border-radius: 0.5em; padding: 0 0.18em; box-decoration-break: clone`; join the words with `&nbsp;`. One per slide.
- A headline may end with a period on cover and closing ("Welcome to Brightwater.", "See you on Monday.") — friendly, not shouted.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Card | `left: 96px; top: 72px; 1632 × 936`, radius 48px |
| Pills | `left: 1704px; top: 104px`, 80px wide, heights 104/168/248/168/104, gap 20px; active +32px |
| Card top row (brand, action icon) | inside card: `top: 44px; left/right: 88px; height: 64px` |
| Content frame | inside card: `top: 148px; left/right: 88px; bottom: 120px` → 1456 × 668 |
| Card bottom row (section chip, page number) | inside card: `bottom: 44px; left/right: 88px; height: 44px` |

The card, the pills and the four chrome items are identical on every slide; only the active pill, the chip and the page number change.

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 32px; }` — columns 92px, rows 84.67px.

| Span | Width | Used for |
|---|---|---|
| 4 columns | 464px | Side intro (eyebrow + title + body), divider pill |
| 5 columns | 588px | Cover shapes, stat panel |
| 6 columns | 712px | Half panels (two columns, closing checklist) |
| 7–8 columns | 836–960px | Lists, agenda, chart |
| 12 columns | 1456px | Title band, table |

Rows: a 2-row title band (`stack end`, bottom-aligned) over a 4-row content band is the pattern for two-column and table slides; side intros are vertically centered (`stack`).

### Composition rules

- **Intro left, content right** is the default (agenda, list, chart). Titles in a side intro are vertically centered in the card, not pinned to the top.
- Keep the left edge clean: every eyebrow and title starts at the frame's left edge.
- Asymmetric splits (4/8, 5/7, 9/3), never three identical cards in a row.
- One tinted panel or one shape cluster per slide is usually enough.

## Depth and Elevation

The **card** is the only elevated object: `0 40px 80px -32px rgba(31,43,54,0.28), 0 2px 8px rgba(31,43,54,0.06)`. The pills sit *behind* it (lower z-index) so the card overlaps their inner 24px. Panels, chips, bars and avatars inside the card are flat — color only, no shadow, no border. No glassmorphism, no gradients.

## Components

- **Pills (section tabs)**: see tokens. Up to five sections; if a deck has fewer, keep all five pills (the shape rhythm is the signature) and leave the extra ones inactive. Never change the height order or the color order.
- **Action icon**: 64px circle, `{colors.tint-blue}`, CSS download arrow in ink. Purely decorative in the chrome (`aria-hidden`); a real link or button may reuse it in content (closing slide's download row: violet circle, white arrow, inside a white pill row).
- **Brand mark**: five 10px-wide mini pills, 16/26/34/26/16px tall, in the pill colors — the pill rhythm in miniature.
- **Section chip**: 44px pill in the section color, white dot, "02 · Your first week".
- **Panel**: 32px radius, 44×48px padding, a tint background.
- **Agenda row**: grid `16px 48px 1fr auto` — a 16×72px color swatch pill, the number (28px 800 faint), title + one-line description, a timing chip on `{colors.tint-blue}`.
- **Day pill list**: 128×72px pills with the day name (22px 800) on `{colors.tint-mint}`; the current day full mint. Item title + one-line description beside it.
- **Badge**: 48px circle with a CSS check (white on sage) or dash (ink on pink) heading a panel.
- **Stat row**: grid `260px 1fr`: 76px numeral (nowrap), caption (first phrase bold), a 16px meter pill underneath.
- **Pill bar chart** (pure CSS): dotted gridlines with value labels at the left, bars as full pills (`border-radius: 999px`) in a flex row with 48px gaps, height = value / axis max. Neutral bars `{colors.bg-primary}`, message bar `{colors.pill-violet}` with a 36px 800 violet value. Labels in 18px 700 faint; the highlighted label in ink.
- **Table**: inside a 28px-radius `{colors.tint-lavender}` container; header row lavender with ink 18px 700 labels; rows separated by ink-8% hairlines; first column 26px 700; an initials avatar (40px circle in a pill color) before names; reply times as white tag pills.
- **Quote**: on a `{colors.tint-pink}` panel; a two-blob quote mark (two 44×64px pink shapes with one squared corner), the quote bottom-left at 68px 700. Attribution beside the panel: 120px initials avatar circle (lavender, ink initials), name 32px 700, role 22px muted.
- **Checklist**: 40px rounded-square outlines in violet (3px), item title 28px 700 + description.

## Slide Archetypes

The demo deck implements each of these. Coordinates are grid spans inside the card's `.frame`.

1. **Cover** — left `1/span 7`, centered: eyebrow, `hero` title (2 lines), lede, a meta row of three label/value pairs. Right `8/span 5`: a cluster of 6 vertical pills and circles (120px wide) in the five pill colors at staggered heights.
2. **Agenda** — left `1/span 4`: eyebrow, `display` title, one body line. Right `5/span 8`: 5 agenda rows, one per section, each with its section-color swatch.
3. **Section divider** — `1/span 4 × full height`: one big pill in the section color holding the number (`section-num-xl`) and "Chapter". Right `6/span 7`: eyebrow, `display` title, body, a 5-dot progress row (current dot stretched into a pill in the section color).
4. **Statement** — `1/span 11`, centered: eyebrow, `statement` headline with one `.hl` marker, a faint source/footnote line.
5. **List** — left `1/span 4` intro; right `5/span 8`: 5 rows of day pills + title + description.
6. **Two columns** — title band rows 1–2; below, two half panels (`tint-mint` "We do", `tint-pink` "We skip"), each with a badge + `subtitle` heading and 3 rows of bold lead-in + muted continuation.
7. **Stats** — `1/span 5` lavender panel: eyebrow top, `stat-xl` violet numeral + lede bottom. Right `6/span 7`: a `subtitle` heading and 3 stat rows with meters.
8. **Chart** — left `1/span 4` intro; right `5/span 8`: the pill bar chart, 4–8 bars, one violet.
9. **Table** — title band rows 1–2; table `1/span 12 × rows 3–6`, 4 columns, up to 4–5 rows.
10. **Quote** — pink panel `1/span 9` with quote mark and quote (≤ 110 characters at 68px); attribution `10/span 3`, bottom-aligned.
11. **Closing** — left `1/span 6`: eyebrow, `hero` line, contact block. Right `7/span 6` blue panel: a checklist of 3 and a download row at the bottom.

Other layouts (timeline, team, process) should be built from the same parts: a centered side intro, tinted panels, pill shapes and the section color.

## Motion

- `.reveal` elements fade in and rise 24px when their slide gets `.visible`: `0.7s cubic-bezier(0.22, 1, 0.36, 1)`, staggered by `--i` × 80ms (+100ms).
- `.pop` shapes (cover cluster, divider pill, avatar) scale from 0.6 and fade in, staggered 70ms.
- Chart bars grow from the baseline (`scaleY`), meters fill from the left (`scaleX`).
- The active pill eases out 32px (0.6s) when the section changes.
- No bounce, no rotation, no looping motion. `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Keep the card, the five pills and the four chrome items identical on every slide.
- Map each deck section to one pill color, in order, and use that color for the section's chip and divider.
- Use Plus Jakarta Sans 800 with tight tracking for every headline and numeral.
- Round everything: pills, panels, chips, bars, avatars.
- Put tints, not white, behind panels inside the card.
- Split content into more slides rather than shrinking type below the scale.

### Don't

- Don't change the pill order, widths or the short → medium → tall → medium → short rhythm; don't add a sixth pill.
- Don't add shadows to anything except the card; no glassmorphism, no gradients.
- Don't use pure black text or a new accent hue (no saturated blue, red, orange). Violet is the strongest color.
- Don't put white text on pink, mint or lavender.
- Don't center everything or tile identical cards; keep the left-anchored intro + content split.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients on white (frontend-slides "DO NOT USE" list).
- Don't use illustrations, emoji or stock icons; shapes are pills, circles and the CSS download arrow only.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, numerals, quotes (800 / 700) | Plus Jakarta Sans | Noto Sans SC (思源黑体) | 800 → 700/900 |
| Item titles, chips, eyebrows (700) | Plus Jakarta Sans | Noto Sans SC | 700 |
| Body, lede (400) | Plus Jakarta Sans | Noto Sans SC | 400 |

### Mixed-Content Strategy

One stack for all roles, Latin first so Latin glyphs stay in Plus Jakarta Sans and Chinese falls through to Noto Sans SC:

```css
--font: 'Plus Jakarta Sans', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Noto Sans SC on Google Fonts offers 100–900, so 800 headlines resolve to a real weight. For Chinese headlines set `:lang(zh) h1, :lang(zh) h2 { letter-spacing: 0; }` (put `lang="zh-CN"` on `<html>`).

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Noto+Sans+SC:wght@400;500;700;800&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.2–1.3 (raise `hero` / `display` / `title` from ~1.0 to at least 1.2).
- Letter-spacing 0 on CJK text — drop the −0.03 to −0.06em headline tracking and the +0.02em chip tracking.
- Full-width punctuation （，。：；！？「」（））. Drop the friendly final period on Chinese cover/closing titles (use no punctuation).
- Pangu spacing (盘古之白): a space between CJK and Latin/numbers, e.g. `入职第 30 天`.
- Avoid single orphan characters on a headline's last line: rebalance with `<br>` or shorten.
- One font per sentence.

### Aesthetic Notes for This System

The friendliness comes from the **shapes and pastel colors**, so it transfers to Chinese unchanged. Noto Sans SC 700–800 matches Plus Jakarta's 800 headlines well; keep body at 400. Chinese headlines need fewer characters: `hero` at 136px fits about 7–8 characters per line in the cover's 7-column cell, `display` at 104px about 4–5 in a 4-column side intro (use `title` 68px for longer Chinese titles there). Day pills work with two-character labels (周一 / 周二 …); section chips with short names (02 · 第一周).

### Known CJK Gap

Plus Jakarta Sans digits are narrower than Noto's; in mixed numerals like `第 6 天` the Latin digit can look light next to Chinese at 800. Accept it, or set the whole short phrase in one face.

## Iteration Guide

1. Start every slide from the card, the five pills (mark the current section `on`) and the four chrome items.
2. Pick the section color; use it for the chip and at most one more accent.
3. Place an eyebrow + title, left-aligned at the frame's left edge.
4. Add one supporting block: a tinted panel, a list, a chart or a table.
5. Use only the type-scale tokens; never interpolate new sizes.
6. Round every new shape; shadow only on the card.
7. Ink for text, violet for the one strongest highlight.
8. If a slide needs more than one panel, one list and one stat group, split it.
9. Let the script fill page numbers.
10. Verify at 1920×1080, 1280×720 and on a phone: no overflow, no overlap, fonts loaded.

## Known Gaps

- The original preset gives one font family, seven colors, a layout line and four signature elements. Ink colors, tints, the grid, type scale, components and the pills-as-section-tabs behaviour are slides-commons extensions in the spirit of the preset.
- The preset does not define a text color; `{colors.ink}` is derived from the background's hue.
- Charts, meters and tables are hand-built CSS with inline `--h` / `--v` percentages; there is no data binding.
- No image archetype. If photos are used, give them a 32px radius inside the card, no shadow, and keep at most one per slide.
