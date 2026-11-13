---
version: alpha
name: Split Pastel
description: A playful, modern light system built on a two-color vertical split — peach on the left, lavender on the right — with a faint graph-paper grid laid over the lavender side. Outfit carries everything, extra-bold and tightly tracked for headlines. Mint, yellow and pink badge pills with small dark icon circles (abstract CSS shapes) label and annotate; rounded near-black CTA buttons close the story. The split moves between three positions (40/60, 50/50, 60/40) depending on which side carries the slide, and on comparison slides the split itself is the comparison. A slides-commons derivative of the "Split Pastel" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 7 'Split Pastel' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file."

colors:
  bg-peach: "#f5e6dc"
  bg-lavender: "#e4dff0"
  text-dark: "#1a1a1a"
  badge-mint: "#c8f0d8"
  badge-yellow: "#f0f0c8"
  badge-pink: "#f0d4e0"
  white: "#ffffff"
  text-muted: "rgba(26, 26, 26, 0.68)"
  text-faint: "rgba(26, 26, 26, 0.48)"
  rule: "rgba(26, 26, 26, 0.14)"
  grid-line: "rgba(26, 26, 26, 0.07)"
  veil: "rgba(255, 255, 255, 0.6)"
  stage-bg: "#1a1a1a"

color-aliases:
  accent: text-dark
  slide-bg: bg-peach
  text-primary: text-dark

typography:
  stat-xl:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 300px
    fontWeight: 800
    lineHeight: 0.82
    letterSpacing: -0.06em
  section-num-xl:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 440px
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: -0.06em
  hero:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 148px
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: -0.035em
  display:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 112px
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: -0.03em
  statement:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 96px
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.03em
  title:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 76px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.025em
  quote:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: -0.025em
  stat:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 72px
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: -0.04em
  subtitle:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.015em
  item-title:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.015em
  lede:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.5
  badge:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 600
  button:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 24px
    fontWeight: 600
  chrome:
    fontFamily: "Outfit, Helvetica Neue, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 500

spacing:
  page-x: 96px
  split-inner: 80px
  chrome-top: 56px
  frame-top: 176px
  frame-bottom: 136px
  footer-bottom: 52px
  grid-size: 48px
  badge-height: 56px
  button-height: 76px

canvas:
  width: 1920px
  height: 1080px

split:
  sp-40: "768px — light left (title), heavy right (list, chart, table)"
  sp-50: "960px — divider, two-column comparison, closing"
  sp-60: "1152px — heavy left (cover title, hero stat, quote), light right"

components:
  split-background:
    background: "linear-gradient(90deg, {colors.bg-peach} 0 var(--split), {colors.bg-lavender} var(--split) 100%)"
    description: "Hard edge, no blend. --split is set per slide by one of three classes."
  grid-overlay:
    background: "two 1px linear-gradients in {colors.grid-line}, 48px squares"
    description: "Covers the lavender side only, full height, from the split edge to the right edge. Never on the peach side."
  zones:
    description: "Left zone: left 96px → split − 80px. Right zone: split + 80px → right 96px. Both top 176px, bottom 136px, flex column, vertically centered by default. A full-width zone (left/right 96px) is used only for statements that cross the split."
  chrome-top:
    position: "absolute; top: 56px; left: 96px; right: 96px; height: 56px"
    description: "Left (on peach): brand mark (dark circle + mint rounded square, multiply) and the deck owner in 24px 700. Right (on lavender): a small white badge with a star icon and the current section ('02 · Kids')."
  footer:
    position: "absolute; bottom: 52px; left: 96px; right: 96px"
    description: "Deck label left (20px 500 {colors.text-faint}); page number right ('04 / 11', current in 600 dark, '/ 11' faint)."
  badge:
    height: 56px
    borderRadius: 28px
    padding: "0 26px 0 12px"
    description: "Pill in badge-mint, badge-yellow, badge-pink or white; a 32px dark icon circle, then 22px 600 text. Small variant 44px / 18px with a 28px icon."
  icon:
    size: 32px
    description: "Dark circle with one white CSS shape: dot, rounded square, triangle (clip-path), plus, four-point star (clip-path), ring or arrow. Abstract only — no pictograms."
  button:
    height: 76px
    borderRadius: 38px
    description: "Primary: near-black pill, white 24px 600 text, a 44px white icon circle with a dark arrow at the right. Ghost: 2px near-black outline, transparent fill."
  highlight:
    background: "{colors.badge-mint}"
    borderRadius: 0.6em
    padding: "0 0.2em"
    description: "Badge-shaped marker behind 2–4 words of a statement."
  bridge:
    size: 88px
    description: "On the 50/50 comparison slide, a dark 88px arrow circle centered on the split line."
---

# Split Pastel

> **Attribution.** This design system is a slides-commons derivative of the **"Split Pastel"** preset (preset 7) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). The preset defines the font, the six core colors and the signature elements (split background colors, playful badge pills with icons, a grid pattern overlay on the right panel, rounded CTA buttons); the three split positions, derived tokens, icon set, type scale, components, slide archetypes and this document were written for slides-commons (MIT). It is not an official frontend-slides file and is not endorsed by its author.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its zone and nothing overlaps the chrome. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Split Pastel is a **playful, friendly system built on a split screen**: every slide is peach on the left and lavender on the right, with a hard vertical edge between them and a faint graph-paper grid on the lavender side. It feels like a creative studio's workshop deck or a family brand's season review — upbeat, a little bouncy, but tidy.

What repeats on every slide:

- **The split** — at one of three positions (`sp-40` 768px, `sp-50` 960px, `sp-60` 1152px). The heavier side gets more width.
- **The grid overlay** on the lavender side only.
- **Chrome:** brand top-left on peach, a white section badge top-right on lavender, the deck label bottom-left, the page number bottom-right.
- **Badges** — pastel pills with a small dark icon circle — as eyebrows, tags and annotations.

One typeface, **Outfit**: 800 headlines with tight tracking in sentence case, 600 for badges and buttons, 400 for body.

**Key characteristics**

- Two flat background colors with a hard edge; no gradients, no blending across the split.
- Graph-paper grid (48px, near-black 7%) on the right panel; charts sit on it so the grid doubles as chart paper.
- Badges in mint / yellow / pink / white, each with an abstract icon (dot, square, triangle, plus, star, ring, arrow).
- Near-black is the only strong color: headlines, icon circles, the primary button, the highlighted bar, the active agenda row.
- Rounded everything: badges, buttons, tiles (30–40px radius), bar tops.
- Content in each half is vertically centered; the left side usually holds the title, the right side the evidence.

**Density philosophy: medium-low.** One idea per slide, big type, a few badges. Lists of up to 4–5, tables of up to 4 rows × 3 options, 3 stat tiles. Split rather than cram.

## Colors

### Palette

- **Peach** (`{colors.bg-peach}` #f5e6dc): the left side of every slide; the "before" / "old" side on comparisons.
- **Lavender** (`{colors.bg-lavender}` #e4dff0): the right side, always under the grid overlay; the "after" / "new" side.
- **Text dark** (`{colors.text-dark}` #1a1a1a): all headlines and key text, icon circles, the primary button, the highlighted chart bar, the active agenda row. Also the stage letterbox.
- **Badge mint** (`{colors.badge-mint}` #c8f0d8), **badge yellow** (`{colors.badge-yellow}` #f0f0c8), **badge pink** (`{colors.badge-pink}` #f0d4e0): badge fills, stat tiles, the highlighted table column (yellow), the headline marker (mint), cover shapes.
- **Derived tokens** (slides-commons additions, no new hues):
  - White — badges and tiles that must stand out on either side; the neutral chart bar.
  - `{colors.text-muted}` dark at 68% — body copy. `{colors.text-faint}` dark at 48% — chrome, axis labels, secondary table text.
  - `{colors.rule}` dark at 14% — hairlines. `{colors.grid-line}` dark at 7% — the overlay grid.
  - `{colors.veil}` white at 60% — rounded rows (agenda, next steps) sitting on the grid.

All text is dark on every background (≥ 12:1 for headlines on both halves). Never put white text on a pastel; white text appears only on near-black (the primary button and the active agenda row).

### Defaults

- Headline `{colors.text-dark}`, body `{colors.text-muted}`, chrome `{colors.text-faint}`.
- Emphasis: the mint `.hl` marker in a statement, or a near-black element (bar, row, button).
- Badge colors rotate mint → yellow → pink → white; avoid putting a badge on a same-colored shape.

## Typography

### Font Family

- **Outfit** — Google Fonts, weights 400 / 500 / 600 / 700 / 800. All roles.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Set `h1, h2, h3 { font-weight: 800 }` explicitly.

### Type Scale

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `{typography.section-num-xl}` | 440 / 0.8, −0.06em | 800 | Divider number, bottom-left of the peach side |
| `{typography.stat-xl}` | 300 / 0.82, −0.06em | 800 | Hero stat |
| `{typography.hero}` | 148 / 0.94, −0.035em | 800 | Cover title, closing line (2 lines) |
| `{typography.display}` | 112 / 0.96, −0.03em | 800 | Agenda and divider titles |
| `{typography.statement}` | 96 / 1.04, −0.03em | 800 | Statement crossing the split (≤ 3 lines) |
| `{typography.title}` | 76 / 1.0, −0.025em | 800 | Standard content title (side column) |
| `{typography.quote}` | 72 / 1.12, −0.025em | 700 | Pull quote |
| `{typography.stat}` | 72 / 1.0, −0.04em | 800 | Stat tile numerals |
| `{typography.subtitle}` | 40 / 1.1 | 700 | Small panel headings |
| `{typography.item-title}` | 34 / 1.15 | 700 | List items |
| `{typography.lede}` | 32 / 1.4 | 400 | Cover subtitle, stat caption |
| `{typography.body}` | 26 / 1.5 | 400 | Paragraphs |
| `{typography.body-sm}` | 22 / 1.5 | 400 | Sources, roles, legends |
| `{typography.button}` | 24 | 600 | CTA buttons |
| `{typography.badge}` | 22 (18 small) | 600 | Badges |
| `{typography.chrome}` | 20 | 500 | Footer, axis labels |

Minimum on-slide text is 18px (small badges, axis labels); running text never below 22px.

### Signature Treatments

- **Sentence case, tight, heavy.** No all caps anywhere, no italics.
- **Badge above title** as the eyebrow (36px gap), never a plain uppercase label.
- **Badge-shaped marker** (`.hl`, mint, 0.6em radius) behind 2–4 words of a statement, joined with `&nbsp;`. One per slide.
- **Headlines may end with a period** on cover, statement and closing ("Small hands, big projects.") — it reads confident and playful.
- Break two-line titles by hand with `<br>` so the last line is never a single short word.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Split edge | `x = 768 / 960 / 1152` (`.sp-40` / `.sp-50` / `.sp-60`) |
| Grid overlay | `left: split; right: 0; top: 0; bottom: 0` |
| Chrome top | `top: 56px; left/right: 96px; height: 56px` |
| Left zone | `left: 96px; width: split − 176px; top: 176px; bottom: 136px` |
| Right zone | `left: split + 80px; right: 96px; top: 176px; bottom: 136px` |
| Footer | `bottom: 52px; left/right: 96px` |

### Choosing the split

| Split | Left / right width | Use when |
|---|---|---|
| `sp-40` (768) | 592 / 976 | The right side carries a list, chart, table or agenda; the left holds badge + title + one sentence |
| `sp-50` (960) | 784 / 784 | Section divider, comparison (left = before, right = after), closing |
| `sp-60` (1152) | 976 / 592 | The left carries the slide (cover title, hero stat, quote); the right holds badges, tiles or attribution |

Vary the split through the deck (the demo uses all three), but don't change it between every slide for no reason — consecutive slides of the same archetype keep the same split.

### Composition rules

- Each zone is a vertical flex column, centered by default; the divider's number is bottom-aligned.
- **Title side = peach, evidence side = lavender.** Charts and tables always go on the grid.
- **Statements may cross the split** (full-width zone): dark text reads on both colors, and crossing the edge is part of the look. Keep the badge and source line on the peach side.
- Keep 80px between any content and the split edge; only the comparison bridge circle sits on the edge.
- Left-aligned text everywhere. Nothing centered except inside badges and buttons.

## Depth and Elevation

Flat. No shadows, no glass, no gradients other than the hard-edged split itself. Separation comes from color: white tiles and badges over lavender, pastel tiles over the grid, near-black elements for the strongest accent. Hairlines are 2px `{colors.rule}`.

## Components

- **Brand mark**: a 28px near-black circle overlapped by a 28px mint rounded square (`mix-blend-mode: multiply`), then the name.
- **Section badge** (chrome, top-right): small white badge with a star icon, "02 · Kids".
- **Badge**: see tokens. Use one icon per meaning and keep it consistent through the deck (the demo: star = highlight/section, dot = time/date, triangle = feedback, plus = new/added, ring = old/previous, square = product).
- **Icon circle**: see tokens. Larger variants (44px in buttons and list tiles, 56px in the divider's icon row, 88px for the bridge) scale the inner shape.
- **Buttons**: primary dark pill with a white arrow circle; ghost outline pill. At most two buttons side by side.
- **Agenda row**: 104px-tall rounded row (`{colors.veil}`), a 64px number circle in a badge color, title + description, a faint duration. The current item is a near-black row with white text.
- **List tile**: 96px rounded square (30px radius) in a badge color holding a 44px icon circle; title 34px 700 + one line of body.
- **Tick list**: rows separated by 2px rules, a 32px icon circle per row; the "old" side uses outlined faint circles and muted text.
- **Bridge**: 88px dark arrow circle centered on the split, vertically centered on the slide (comparison slide only).
- **Stat tile**: 36px-radius tile in a badge color or white, grid `200px 1fr`: numeral (72px 800, nowrap) + bold caption line + muted line.
- **Bar chart** on the grid: dashed `{colors.rule}` gridlines with faint labels, a 3px near-black baseline, bars with 24px rounded tops in white, the message bar near-black with a 40px 800 value and a small yellow badge inside the bar's top ("New kit"). Bar height = value / axis max.
- **Comparison table** on the grid: `border-collapse: separate`; header cells are option names (30px 700) with a faint 18px sub-label; the recommended column is a yellow column with 32px rounded top and bottom and a "Most picked" small badge on its top edge. Row headers 22px 600 muted; cells 26px 500. Included / not included marks are a 22px filled dark circle / a 2px faint outlined circle.
- **Quote**: a CSS quote mark made of two dark 52px circles with tails; the quote 72px 700 on peach. Attribution on the right in a white 40px-radius card (96px initials circle in pink, name 34px 700, role 22px) plus one badge.
- **Next-steps list**: veil rows with a date badge (148px column) + title + description.

## Slide Archetypes

The demo deck implements each of these.

1. **Cover** (`sp-60`) — left: yellow badge, `hero` title (2 lines, ends with a period), lede, two buttons. Right: three pastel shapes (circle, rounded square, tall pill) in the corners of the lavender side and a staggered column of four badges in the middle.
2. **Agenda** (`sp-40`) — left: badge, `display` title, one body line. Right: 5 agenda rows, the first (current) one near-black.
3. **Section divider** (`sp-50`) — left: `section-num-xl` number bottom-left + a small line under it. Right: badge, `display` title (two lines), body, a row of four 56px icon circles.
4. **Statement** (`sp-40`, full-width zone) — badge, `statement` headline crossing the split with one `.hl`, a source line.
5. **List** (`sp-40`) — left: badge, `title`, body. Right: 4 list tiles + text.
6. **Comparison** (`sp-50`) — the split is the comparison: left = old (white badge, `title`, outlined tick list), right = new (mint badge, `title`, filled tick list); the bridge arrow on the edge.
7. **Big number + stats** (`sp-60`) — left: badge, `stat-xl` numeral, lede. Right: 3 stat tiles (mint, pink, white).
8. **Chart** (`sp-40`) — left: badge, `title`, body that states the takeaway. Right: the bar chart on the grid, 4–8 bars, one near-black.
9. **Comparison table** (`sp-40`) — left: badge, `title`, body, legend. Right: the table, 3 options × up to 4 rows, one recommended column.
10. **Quote** (`sp-60`) — left: quote mark + quote (≤ 120 characters at 72px). Right: the attribution card and one badge.
11. **Closing** (`sp-50`) — left: yellow "Thank you!" badge, `hero` call to action with a period, two buttons, a contact line. Right: "What happens next" and 3 dated rows.

Other layouts (timeline, team, process) should reuse the same parts: choose a split, title on peach, evidence on the grid, badges for labels.

## Motion

- `.reveal` elements fade in and rise 24px when their slide gets `.visible` (0.6–0.7s `cubic-bezier(0.22, 1, 0.36, 1)`), staggered by `--i` × 80ms (+100ms).
- `.bounce` shapes and icons scale up from 0.5 with a small overshoot (`cubic-bezier(0.34, 1.3, 0.64, 1)`), staggered 90ms — the one playful touch.
- Chart bars grow from the baseline with the same overshoot curve.
- No looping or continuous motion. `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Keep the peach | lavender split on every slide, with the grid on the lavender side only.
- Pick the split position for the content: heavy side wider.
- Use badges (pastel pill + dark icon circle) for every eyebrow, tag and date.
- Use near-black for the one strongest element on the slide.
- Let statements cross the split; keep everything else 80px clear of it.
- Use the split as the comparison when comparing two states.

### Don't

- Don't add a gradient or blur between the two halves, and don't put the grid on the peach side.
- Don't introduce a saturated accent (no orange, blue, purple); color comes from the three badge pastels.
- Don't use white text on pastels or pastel text on pastels.
- Don't use illustrations, emoji or pictogram icon sets; icons are abstract CSS shapes in dark circles.
- Don't center whole slides or tile identical cards; keep left-aligned zones.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients on white (frontend-slides "DO NOT USE" list).
- Don't add drop shadows to badges, tiles or buttons.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, numerals, quote (800 / 700) | Outfit | Noto Sans SC (思源黑体) | 800 → 700/900 |
| Badges, buttons, item titles (600 / 700) | Outfit | Noto Sans SC | 500 / 700 |
| Body, lede (400) | Outfit | Noto Sans SC | 400 |

### Mixed-Content Strategy

One stack for every role, Latin first so Latin and numerals stay in Outfit:

```css
--font: 'Outfit', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Noto Sans SC on Google Fonts has 100–900, so 800 headlines map to a real weight. Add `lang="zh-CN"` on `<html>` and `:lang(zh) h1, :lang(zh) h2, :lang(zh) blockquote { letter-spacing: 0; }`.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700;800&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.2–1.3 (raise `hero` / `display` / `title` / `statement` from ~1.0 to at least 1.2).
- Letter-spacing 0 on CJK text (drop the negative headline tracking).
- Full-width punctuation （，。：；！？「」（））. Drop the final period on Chinese headlines.
- Pangu spacing (盘古之白): a space between CJK and Latin/numbers, e.g. `第 4 季`.
- Avoid single orphan characters on a headline's last line: rebalance with `<br>` or shorten.
- One font per sentence.

### Aesthetic Notes for This System

The playfulness lives in the **split, badges and bouncy shapes**, so it carries into Chinese without change. Use Noto Sans SC 700–800 for headlines (Outfit's round geometry pairs best with the heavier weights) and 400 for body. Chinese headlines need fewer characters per line: `hero` at 148px fits about 6 characters per line in the `sp-60` left zone; `title` at 76px about 7 characters in the `sp-40` left zone. A statement crossing the split works well in Chinese at 96px with 14–16 characters per line. Badges take 2–6 characters comfortably (第二季 · 创意回顾).

### Known CJK Gap

Outfit's numerals are rounder and lighter than Noto Sans SC at the same weight; in mixed headlines like `第 4 季` the digit can look slightly lighter. Accept it, or bump the numeral to 900 in its own span.

## Iteration Guide

1. Choose the split (`sp-40`, `sp-50`, `sp-60`) from which side carries the slide.
2. Add the grid overlay, the chrome (brand, section badge, footer) and the two zones.
3. Title side on peach: badge + title + one sentence.
4. Evidence side on the grid: list, chart, table, tiles or badges.
5. Use only the type-scale tokens; never interpolate new sizes.
6. One near-black emphasis per slide; pastels for everything else.
7. Round every new shape; no shadows.
8. If a zone needs more than ~5 items, split the slide.
9. Update the section badge text; let the script fill page numbers.
10. Verify at 1920×1080, 1280×720 and on a phone: no overflow, no overlap, fonts loaded.

## Known Gaps

- The original preset gives one font family, six colors, the split layout and four signature elements. The three split positions, zones, derived transparencies, icon set, type scale, components and archetypes are slides-commons extensions in the spirit of the preset.
- The preset names no accent beyond the badge pastels; near-black is used as the emphasis color.
- Charts and tables are hand-built CSS with inline `--h` percentages; there is no data binding.
- No image archetype. If photos are used, put them on the lavender side in a 36px-radius frame with no shadow, and keep the title on peach.
