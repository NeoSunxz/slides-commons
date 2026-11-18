---
version: alpha
name: Neon Cyber
description: A futuristic, confident dark system on deep navy with two neon accents — cyan as the primary signal, magenta as the contrast — over a faint 80px cyan grid and slowly drifting CSS particles. Clash Display carries headlines and numerals in sentence case; Satoshi carries body copy and wide-tracked uppercase cyan labels. Content sits in bracket-cornered HUD panels on a 12-column × 6-row grid; exactly one element per slide glows. Shared chrome on every slide - brand mark top-left, section number top-right, deck label, segmented progress bar and page number at the bottom. A slides-commons derivative of the "Neon Cyber" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 9 'Neon Cyber' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file. The preset gives vibe, fonts, three colors and three signature elements; everything else here was developed by slides-commons."

colors:
  navy: "#0a0f1c"
  cyan: "#00ffcc"
  magenta: "#ff00aa"
  navy-2: "#0f1729"
  navy-3: "#16213a"
  ink: "#e6f0ff"
  ink-muted: "rgba(230, 240, 255, 0.68)"
  ink-faint: "rgba(230, 240, 255, 0.42)"
  grid: "rgba(0, 255, 204, 0.06)"
  line: "rgba(0, 255, 204, 0.22)"
  rule: "rgba(230, 240, 255, 0.12)"
  cyan-tint: "rgba(0, 255, 204, 0.08)"
  magenta-tint: "rgba(255, 0, 170, 0.10)"
  stage-bg: "#05080f"

color-aliases:
  accent: cyan
  accent-2: magenta
  slide-bg: navy
  text: ink

effects:
  glow-cyan: "0 0 6px rgba(0, 255, 204, 0.55), 0 0 26px rgba(0, 255, 204, 0.32)"
  glow-magenta: "0 0 6px rgba(255, 0, 170, 0.55), 0 0 26px rgba(255, 0, 170, 0.30)"
  panel-glow: "0 0 0 1px rgba(0, 255, 204, 0.18), 0 0 36px rgba(0, 255, 204, 0.16), inset 0 0 40px rgba(0, 255, 204, 0.06)"
  background: "radial cyan wash top-right (7%), radial magenta wash bottom-left (7%), 80px grid in {colors.grid} masked to fade toward the centre"
  particles: "three tiled radial-gradient dot layers (cyan 1.6px / 230x190, ink 1px / 170x150, magenta 1.6px / 370x290) at 55% opacity, masked away from the centre, drifting 36x52px over 22s alternate on the active slide only"

typography:
  hero:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 184px
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: -0.02em
  display:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 128px
    fontWeight: 600
    lineHeight: 0.94
    letterSpacing: -0.02em
  statement:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 96px
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: -0.02em
  title:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 80px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: -0.02em
  quote:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 68px
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: -0.015em
  card-title:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 44px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.01em
  item-title:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 38px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.01em
  outline-num:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 560px
    fontWeight: 600
    lineHeight: 0.74
    letterSpacing: -0.04em
  gauge:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 150px
    fontWeight: 600
    lineHeight: 0.9
  stat:
    fontFamily: "Clash Display, Satoshi, Arial Narrow, sans-serif"
    fontSize: 88px
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: -0.03em
  lede:
    fontFamily: "Satoshi, Helvetica Neue, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Satoshi, Helvetica Neue, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.45
  body-sm:
    fontFamily: "Satoshi, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Satoshi, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 700
    letterSpacing: 0.22em
    textTransform: uppercase

spacing:
  page-x: 112px
  chrome-top: 56px
  frame-top: 176px
  frame-bottom: 136px
  footer-bottom: 48px
  gutter: 32px
  panel-pad: "40px 48px"
  label-to-title: 28px
  title-to-body: 28px

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 32px
  frame: "top 176px, left 112px, right 112px, bottom 136px (1696 x 768 px)"
  column-width: 112px
  row-height: 101.33px

components:
  brand:
    position: "chrome, top-left (top 56px, left 112px)"
    description: "14px cyan diamond (rotated square, cyan glow) + product name as a label in {colors.ink}. The diamond pulses slowly on cover and closing only."
  section-tag:
    position: "chrome, top-right"
    description: "Section number in Clash Display 600 30px cyan + section name as a muted label. Cover and agenda show the name only (no '00')."
  footer:
    position: "absolute; left 112px; right 112px; bottom 48px"
    description: "Deck label (faint label) left, segmented progress bar, page number '04 / 11' right. Both are filled by script."
  progress:
    description: "One 28x4px segment per slide, 6px apart. Past = cyan 50%, current = magenta with magenta glow, future = ink 14%."
  hud-panel:
    background: "rgba(15, 23, 41, 0.82)"
    border: "1px solid {colors.line}"
    padding: "40px 48px"
    description: "Square panel with 28px L-shaped bracket corners (2px, cyan; magenta on .mag panels) drawn by one ::before with eight gradients. .on adds a 60% cyan border and {effects.panel-glow}. At most one .on panel per slide."
  glow-text:
    description: ".glow = cyan + {effects.glow-cyan}; .glow-m = magenta + {effects.glow-magenta}. One word or number per slide."
  outline-number:
    description: "Section-divider numeral, transparent fill, 3px cyan -webkit-text-stroke, cyan drop-shadow."
  grid-floor:
    description: "Cover and closing only. A plane with 96px cyan 42% gridlines, rotateX(78deg) in a 520px perspective, scrolling toward the viewer (3.2s loop), masked so the footer zone stays at 22%."
  ring-gauge:
    size: 500px
    description: "conic-gradient ring 22px thick (cyan to the value, ink 8% for the rest) with a cyan drop-shadow, an inner tick ring every 6deg, value in Clash Display 150px glow + one-line caption."
  path-diagram:
    description: "Request-path diagram from nodes (26px circles, 3px stroke, filled = endpoint) and wires: dashed magenta (slow/long), solid glowing cyan (fast/short), dotted ink 30% (async)."
  line-chart:
    description: "Inline SVG, viewBox in data units, preserveAspectRatio none, vector-effect non-scaling-stroke. Hero series solid cyan 4px with drop-shadow glow and a fading cyan area; comparison series magenta 3px dashed. End points are HTML dots with Clash value labels above them."
  table:
    description: "Rows split by {colors.rule}; header row on {colors.navy-2}; the highlighted column has a {colors.navy-3} header with a 3px cyan top bar and {colors.cyan-tint} cells; bad values in magenta."
---

# Neon Cyber

> **Attribution.** This design system is a slides-commons derivative of the **"Neon Cyber"** preset (preset 9) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). It is not an official frontend-slides file and is not endorsed by its author.
>
> **What comes from the preset:** the vibe (futuristic, techy, confident), the fonts (Clash Display + Satoshi from Fontshare), the three colors (deep navy #0a0f1c, cyan #00ffcc, magenta #ff00aa) and the three signature ideas (particle backgrounds, neon glow, grid patterns). The preset is only these few lines.
>
> **What slides-commons developed:** everything else — the derived navy steps, text tints and transparencies, the glow recipes, the type scale, the 12 × 6 grid and chrome, the HUD panel with bracket corners, the segmented progress bar, the perspective grid floor, the ring gauge, the path diagram, the SVG line chart, the slide archetypes, the motion rules and this document (MIT).

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its panel and no panels overlap. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers and progress bar).

## Overview

Neon Cyber is a **dark keynote system that feels like a control room**: deep navy, a faint cyan grid, a scatter of cyan and magenta particles near the edges, and content held in square HUD panels with bracket corners. Two neon colors do all the talking, with fixed roles:

- **Cyan** (#00ffcc) is the signal: the product, the new way, the number we want remembered. It is the only color that glows by default.
- **Magenta** (#ff00aa) is the contrast: the old way, the competitor, the slow path, the warning — and the "you are here" segment of the progress bar.

Typography is two Fontshare faces. **Clash Display** (500/600) — wide, geometric, slightly mechanical — carries every headline, numeral and quote in sentence case. **Satoshi** (400/500/700) carries body copy, item descriptions and uppercase cyan labels with very wide tracking (+0.22em).

**Key characteristics**

- Navy background with two soft color washes, an 80px grid that fades toward the centre and CSS particles that fade away from it — text always sits on calm navy.
- Exactly **one glowing thing per slide**: a word, a number, a panel or a line. Glow is emphasis; spread around, it becomes noise.
- HUD panels: square, 1px cyan-22% border, 28px bracket corners. No rounded corners anywhere.
- Shared chrome on every slide: brand top-left, section top-right, deck label + progress + page number at the bottom.
- Strict 12 × 6 grid in a 1696 × 768 frame; content is left-anchored and asymmetric.

**Density philosophy: medium.** One idea per slide with one supporting structure (a list, a diagram, a gauge, a table). Navy space is part of the look. Split slides rather than shrinking type.

## Colors

### Palette

- **Navy** (`{colors.navy}` #0a0f1c) — *preset*. Every slide background, overlaid with a cyan radial wash (top-right, 7%) and a magenta radial wash (bottom-left, 7%).
- **Cyan** (`{colors.cyan}` #00ffcc) — *preset*. Labels, section numbers, the brand diamond, the hero data series, the highlighted table column, the one glowing word or panel.
- **Magenta** (`{colors.magenta}` #ff00aa) — *preset*. Contrast series, "before" panels (`.hud.mag`), bad values in tables, the current progress segment, the quote attribution rule.
- **Derived by slides-commons** (navy steps and transparencies; no new hues):
  - `{colors.navy-2}` #0f1729 and `{colors.navy-3}` #16213a — panel surface and raised surface (table head), one and two steps lighter than navy.
  - `{colors.ink}` #e6f0ff — text. Pure white looks harsh next to neon; this white is tinted toward the navy.
  - `{colors.ink-muted}` 68% and `{colors.ink-faint}` 42% — body copy; chrome, axes and sources.
  - `{colors.grid}` cyan 6% — background grid; `{colors.line}` cyan 22% — panel borders and chart axes; `{colors.rule}` ink 12% — neutral hairlines.
  - `{colors.cyan-tint}` cyan 8% and `{colors.magenta-tint}` magenta 10% — highlighted cells and active rows.
  - `{colors.stage-bg}` #05080f — letterbox around the stage.

### Glow recipes

- Text: `text-shadow: {effects.glow-cyan}` (or `glow-magenta`). Use on Clash Display at 40px or larger only; small glowing text blurs.
- Panels: `{effects.panel-glow}` together with a 60% cyan border.
- Shapes and lines: `filter: drop-shadow(0 0 6–14px rgba(0,255,204,0.45–0.7))`.
- Body text, labels and tables never glow.

### Contrast

Cyan on navy is about 14:1 and magenta on navy about 5.2:1, so both are safe for large text; for magenta text below 24px prefer ink with a magenta marker. Never put text on a solid cyan or magenta fill except the 4px progress segments (no text).

## Typography

### Font Family

- **Clash Display** — Fontshare, 500 and 600. Headlines, numerals, quotes, item titles, section numbers.
- **Satoshi** — Fontshare, 400/500/700. Body, ledes, descriptions, labels (700, uppercase, +0.22em), table text, chrome.

```html
<link rel="preconnect" href="https://api.fontshare.com">
<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600&f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
```

The stylesheet comes from `api.fontshare.com`; the font files from `cdn.fontshare.com`.

**Gotcha (Fontshare API):** with some weight lists the combined `f[]=…&f[]=…` request silently returns only one of the two families (for example `clash-display@500,600&f[]=satoshi@400,500,700` returns Clash Display only). Use the exact query above, and confirm in the browser that both families load (`document.fonts.check('400 20px Satoshi')`). If one is missing, use two `<link>` tags, one family each.

### Type Scale

| Token | Size / line-height | Family | Use |
|---|---|---|---|
| `{typography.outline-num}` | 560 / 0.74 | Clash 600, outline | Section-divider numeral |
| `{typography.hero}` | 184 / 0.9 | Clash 600 | Cover title, closing line (2 lines max) |
| `{typography.gauge}` | 150 / 0.9 | Clash 600 | Value inside the ring gauge |
| `{typography.display}` | 128 / 0.94 | Clash 600 | Agenda and divider titles |
| `{typography.statement}` | 96 / 1.04 | Clash 600 | Full-width statement (≤ 3 lines) |
| `{typography.stat}` | 88 / 0.9 | Clash 600 | Stat readouts; units at 0.5em |
| `{typography.title}` | 80 / 1.0 | Clash 600 | Standard slide title (1 line preferred) |
| `{typography.quote}` | 68 / 1.12 | Clash 500 | Pull quote |
| `{typography.card-title}` | 44 / 1.05 | Clash 500 | Panel heading |
| `{typography.item-title}` | 38 / 1.1 | Clash 500 | List item, agenda item (40) |
| `{typography.lede}` | 34 / 1.4 | Satoshi 400 | Cover subtitle |
| `{typography.body}` | 28 / 1.45 | Satoshi 400 | Body paragraph |
| `{typography.body-sm}` | 22 / 1.45 | Satoshi 400 | Descriptions, captions, sources |
| `{typography.label}` | 18, 700, +0.22em, UPPERCASE | Satoshi | Labels, chrome, table headers |

Minimum on-slide text is 18px (labels and axes); running text is never below 22px.

### Signature Treatments

- **Sentence-case Clash headlines**, −0.02em tracking (−0.03 to −0.04em at 88px+). Never all caps for headlines.
- **Cyan label above every title**, 28px gap. Labels in magenta (`.label.m`) only inside magenta panels or attribution.
- **One glowing word.** Put the key number or word of the headline in `.glow` (cyan) or `.glow-m` (magenta, for the bad number). Join multi-word phrases with `&nbsp;`.
- **Units small.** In stat readouts the unit is a `<small>` at 0.5em: `11<small>ms</small>`.
- **Power-on flicker.** Glowing elements may use `.power` — a 0.9s stepped flicker to full opacity when the slide appears. Once per slide.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Chrome top (brand + section) | `top: 56px; left: 112px; right: 112px; height: 40px` |
| Frame (content grid) | `top: 176px; left: 112px; right: 112px; bottom: 136px` → 1696 × 768 |
| Footer (deck label, progress, page number) | `bottom: 48px; left: 112px; right: 112px` |

Chrome sits above the background layers (`z-index: 2`) and is identical on every slide; only the section tag changes.

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 32px; }` — columns 112px, rows 101.33px.

| Span | Width | Used for |
|---|---|---|
| 3 columns | 400px | Cover meta, quote attribution |
| 4 columns | 544px | Side title column (agenda, chart) |
| 5 columns | 688px | Featured panel, gauge, closing panel |
| 6 columns | 848px | Half: two-column panels, divider halves |
| 7–8 columns | 992–1136px | List rows, chart, agenda rows |
| 12 columns | 1696px | Title bands, tables |

Rows: a 2-row title band (234px) over a 4-row content band (501px) is the standard content slide.

### Composition rules

- Titles are bottom-aligned in their cell (`.stack`, `justify-content: flex-end`).
- Asymmetric: one large element (panel, numeral, gauge) on one side, a lighter structure on the other. No identical card grids — a list is one featured panel plus hairline rows, not four equal cards.
- Background effects never compete with text: grid fades toward the centre, particles fade away from it, the floor is only on cover and closing.

## Depth and Elevation

Depth is light, not shadow: panels are one navy step lighter with a cyan hairline, and the single `.on` panel adds a soft cyan glow. No drop shadows, no glassmorphism (panels are opaque navy, not blurred), no rounded corners, no gradients on panels.

## Components

- **Brand** (chrome top-left): cyan diamond + product label.
- **Section tag** (chrome top-right): `02` in Clash 600 30px cyan + section name label.
- **Footer**: deck label, progress segments, page number — filled by script from the slide index.
- **HUD panel** (`.hud`, `.hud.on`, `.hud.mag`): see tokens. Content inside is a flex column; label at top, key content at the bottom.
- **Agenda rows**: 4 HUD rows, grid `120px 1fr auto`: number (Clash 52px; faint, cyan + glow on the current row), title (Clash 500 40px) + one-line description (22px), duration label.
- **Featured panel + rows** (list): `.hud.on` holding a one-word cyan glow keyword (Clash 96px), a card-title and one sentence; next to it 3 hairline rows with a cyan number (Clash 36px), item title (Clash 500 38px) and description (24px).
- **Path diagram**: nodes and wires (see tokens) with 20px labels below; a readout (Clash 112px + caption) at the bottom of each panel.
- **Ring gauge**: see tokens; caption ≤ 40 characters.
- **Stat readouts**: 3 columns separated by 1px `{colors.line}` verticals: number, item title (Satoshi 500 26px), caption.
- **Line chart**: see tokens; y-axis labels 18px faint on the left, dashed hairline gridlines, x labels as faint labels; legend under the chart takeaway.
- **Table**: see tokens. Up to 5 rows × 4 columns, 26px cells.
- **Quote**: cyan glowing Clash quote mark (280px), quote in Clash 500 68px (≤ 110 characters). Attribution in a 3-column cell with a 2px magenta left rule.
- **Command pill**: a cyan-bordered box with a glowing `›` and a command in Satoshi 500 30px (no monospace face in this system).
- **Orbit** (decorative): thin cyan circle with a dashed magenta inner ring and one magenta dot, partly off-canvas; quote slides only.

## Slide Archetypes

The demo deck implements each of these. Coordinates are grid spans inside `.frame`.

1. **Cover** — grid floor behind. `1/span 9 × rows 1–4`: label, `hero` title (2 lines, one glowing word or digit), lede. `10/span 3`: meta pairs (label + 28px value).
2. **Agenda** — `1/span 4`: label, `display` "Agenda", one sentence. `5/span 8`: 4 HUD agenda rows; the current one `.on`.
3. **Section divider** — `1/span 6`: outline numeral. `7/span 6`: label, `display` title, body.
4. **Statement** — `1/span 11`, bottom-aligned: a 17-segment scale (first cyan, last magenta) as a visual "range", label, `statement` with one `.glow-m` number, source line.
5. **List** — title band; featured `.hud.on` `1/span 5 × rows 3–6`; 3 hairline rows `6/span 7`.
6. **Two columns** — title band; `.hud.mag` (before, magenta path) and `.hud.on` (after, cyan path), each `span 6 × rows 3–6`.
7. **Stats** — ring gauge `1/span 5`; title `6/span 7 × rows 1–3`; 3 readouts `rows 4–6`.
8. **Chart** — `1/span 4`: label, title, takeaway, legend. `5/span 8`: SVG line chart, 8–14 points, two series max.
9. **Comparison table** — title band; table `1/span 12 × rows 3–6`.
10. **Quote** — orbit decoration; quote `1/span 9`; attribution `10/span 3 × rows 3–6`.
11. **Closing** — grid floor. `1/span 7 × rows 1–5`: label, `hero` line with a glowing word, command pill. `.hud.on` `8/span 5 × rows 2–5`: 3 dated steps (Clash 30px cyan date, 24px text, 20px sub-line). Contact details go in the footer deck label.

Build other layouts (timeline, architecture, team) from the same parts: a bottom-left title, one `.on` element, HUD panels, hairline rows and Clash numerals.

## Motion

- `.reveal`: fade + 24px rise, 0.7s `cubic-bezier(0.16, 1, 0.3, 1)`, staggered `--i` × 90ms + 120ms.
- `.power`: stepped flicker to full opacity (0.9s) for the one glowing element.
- `.sweep`: path wires draw left-to-right (`scaleX`), 1s. `.draw`: the hero chart line draws in via `stroke-dashoffset`, 1.6s.
- Ambient loops — particles drift (22s), grid floor scrolls (3.2s), brand diamond pulses (2.4s) — run **only on the active slide** and are switched off entirely under `prefers-reduced-motion: reduce` with `animation: none !important` (viewport-base.css only shortens durations, which would make an infinite loop flicker).
- Keep effects cheap: animate `transform` and `opacity` only (the floor animates `background-position` on one layer). No canvas, no JavaScript particles, no `backdrop-filter`.

## Do's and Don'ts

### Do

- Keep one glowing element per slide and make it the thing you want remembered.
- Use cyan for "ours / new / fast" and magenta for "theirs / old / slow" consistently through the deck.
- Keep text on calm navy; check that particles and grid never sit behind body copy.
- Use Clash Display for every headline and number, Satoshi for everything else.
- Use the HUD bracket corners on panels; keep corners square.

### Don't

- Don't make body text, labels or tables glow, and don't stack glows (glowing text inside a glowing panel).
- Don't add a third hue (no purple, no yellow). Status comes from cyan vs. magenta vs. ink.
- Don't use purple gradients, the generic indigo `#6366f1`, glassmorphism or blurred panels (frontend-slides "DO NOT USE").
- Don't use Inter, Roboto, Arial or system fonts as the display face, and don't fall back to a monospace font for "techy" flavor.
- Don't center everything or build identical card grids.
- Don't animate particles with JavaScript or run loops on hidden slides.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, numerals, quotes (Clash Display 600/500) | Clash Display | Noto Sans SC (思源黑体) | 700 / 500 |
| Body, descriptions (Satoshi 400/500) | Satoshi | Noto Sans SC | 400 / 500 |
| Labels, chrome (Satoshi 700 uppercase) | Satoshi | Noto Sans SC | 500 |

### Mixed-Content Strategy

Use one stack per role, Latin face first, Noto Sans SC as fallback:

```css
--font-display: 'Clash Display', 'Noto Sans SC', 'Arial Narrow', sans-serif;
--font-body: 'Satoshi', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Clash Display headlines are set at 600, so Chinese falls back to Noto Sans SC 600 if loaded; load 700 and set `:lang(zh) .h { font-weight: 700; }` for a heavier match. Clash Display is wide; Noto Sans SC is not — Chinese headlines look narrower at the same size, which is fine.

### Loading

Fontshare has no Chinese faces; load Noto Sans SC from Google Fonts next to the Fontshare link:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.15–1.25 (raise `hero`, `display`, `title` from 0.9–1.0 or lines collide).
- Letter-spacing 0 on CJK (drop −0.02em headline tracking and the +0.22em label tracking).
- `text-transform: uppercase` has no effect on CJK; labels stay as written.
- Full-width punctuation （，。：；！？「」）. Pangu spacing between CJK and Latin/numbers: `延迟降到 11 ms`.
- Avoid a single orphan character on the last line of a headline; rebalance with `<br>`.
- One font per sentence.

### Aesthetic Notes for This System

The neon look comes from color and light, not Latin letterforms, so it carries over to Chinese well. Keep glow on short Chinese phrases (2–4 characters) or numbers; glowing CJK strokes blur faster than Latin, so use glow only at 56px and above. Chinese headlines need fewer characters: 8–14 per line at 80–128px. Numerals and units stay in Clash Display.

### Known CJK Gap

Clash Display and Satoshi have no CJK glyphs and Fontshare offers no Chinese family, so Chinese text always renders in Noto Sans SC, which is calmer and narrower than Clash. Accept the contrast; don't try to stretch Chinese glyphs.

## Iteration Guide

1. Start from the chrome and an empty 12 × 6 frame on navy with grid and particles.
2. Decide the slide's one glowing element.
3. Title bottom-left of its cell, cyan label above.
4. Use only the type scale tokens.
5. Cyan = ours, magenta = contrast, ink for everything else.
6. HUD panels square with bracket corners; one `.on` at most.
7. Numbers in Clash, units at 0.5em.
8. Split the slide if it needs more than one panel group and one list or chart.
9. Update the section tag per section; the script fills page numbers and progress.
10. Verify at 1920×1080, 1280×720 and on a phone; confirm both Fontshare families loaded and reduced motion stops all loops.

## Known Gaps

- The original preset is four lines: vibe, fonts, three colors, three signature ideas. The palette extensions, effects, grid, components and archetypes here are slides-commons developments in the spirit of the preset.
- Fontshare is a third-party font host (`api.fontshare.com` + `cdn.fontshare.com`); it is allowed for this template as an approved exception to the Google-Fonts-only rule.
- The chart and gauge are hand-built (inline SVG / CSS); values are typed in by hand. No data binding.
- No image archetype. If screenshots are needed, place them inside a HUD panel with square corners, never under particles.
