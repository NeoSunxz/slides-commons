---
version: alpha
name: Dark Botanical
description: An elegant, premium dark system for atmosphere-first decks. Warm off-white Cormorant at light weights — with italic signature phrases and italic roman numerals — sits on a near-black ground, while soft, blurred, overlapping circles of terracotta, rose and gold glow out of one or two corners. Thin gold vertical lines divide columns and punctuate centred compositions. IBM Plex Sans Light carries body copy and widely tracked uppercase labels. Cover, divider, statement, quote and closing are centred; content slides are left-aligned on a quiet grid. A slides-commons derivative of the "Dark Botanical" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 4 'Dark Botanical' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file."

colors:
  bg-primary: "#0f0f0f"
  text-primary: "#e8e4df"
  text-secondary: "#9a9590"
  accent-warm: "#d4a574"
  accent-pink: "#e8b4b8"
  accent-gold: "#c9b896"
  text-faint: "rgba(232, 228, 223, 0.42)"
  rule: "rgba(232, 228, 223, 0.14)"
  gold-line: "rgba(201, 184, 150, 0.7)"
  gold-tint: "rgba(201, 184, 150, 0.07)"
  stage-bg: "#070707"

color-aliases:
  accent: accent-gold
  slide-bg: bg-primary
  ink: text-primary

typography:
  hero:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 184px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 0.96
    letterSpacing: -0.01em
  numeral-xl:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 300px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 0.8
  stat-xl:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 260px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 0.82
    fontVariantNumeric: lining-nums
  display:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 128px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.01em
  stat:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 96px
    fontWeight: 400
    lineHeight: 0.95
    fontVariantNumeric: lining-nums
  statement:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 84px
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: -0.01em
  title:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 76px
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: -0.01em
  quote:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 76px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.16
  sub:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 52px
    fontWeight: 400
    lineHeight: 1.1
  item-title:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 42px
    fontWeight: 600
    lineHeight: 1.1
  lede:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 30px
    fontWeight: 300
    lineHeight: 1.6
  body:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 25px
    fontWeight: 300
    lineHeight: 1.65
  body-sm:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 21px
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    letterSpacing: 0.22em
    textTransform: uppercase
  house:
    fontFamily: "Cormorant, Cormorant Garamond, Georgia, serif"
    fontSize: 32px
    fontWeight: 400
    fontStyle: italic

spacing:
  page-x: 136px
  chrome-top: 64px
  chrome-bottom: 60px
  content-top: 176px
  content-bottom: 152px
  column-gap: 96px
  label-to-title: 32px
  title-to-body: 32px

canvas:
  width: 1920px
  height: 1080px

components:
  content:
    description: "The safe area: absolute, top 176px, bottom 152px, left/right 136px (1648 x 752px). .content.center stacks children on the slide's vertical axis with centred text."
  orbs:
    description: "A cluster of 2–3 soft circles (520 / 420 / 300px) in an 860px box anchored off one corner (.tr .tl .br .bl, offset about −300px). Each circle is a radial-gradient of one accent (warm, pink or gold, 55–62% at the centre to 0 at 72%), blur(28px), mix-blend-mode screen. .sm scales the cluster to 70%. One large cluster plus at most one small one per slide, never behind body text."
  vline:
    width: 1px
    description: "Thin vertical accent line: a gold gradient that fades in and out at both ends (transparent → {colors.gold-line} 30–70% → transparent). 96–140px tall above or below centred titles; full height between columns."
  chrome:
    description: "Top-left: the house name in Cormorant italic 32px. Top-right: italic gold roman numeral + chapter name label. Bottom-left: occasion label (faint). Bottom-right: page number '04 / 11'."
  programme-row:
    description: "Agenda row: grid 96px / 1fr / auto — italic gold roman numeral (44px), Cormorant 600 42px title + 21px description, time label right. Hairlines above and below."
  note-columns:
    description: "Four columns separated by fading gold vlines: italic numeral at the top; at the bottom a 14px accent dot, Cormorant 600 title, description and a faint 16px label."
  lollipop-chart:
    description: "Vertical stems (2px, secondary 50%) with 18px dots; the highlighted month is a gold stem with a 28px gold dot and a soft 10px gold halo, and its value in Cormorant italic 48px gold. Dashed hairline gridlines, faint tracked month labels."
  table:
    description: "Hairline rows, no fills except the highlighted column: an italic gold Cormorant header with a 2px gold top rule and {colors.gold-tint} cells. Row names in tracked uppercase labels."
---

# Dark Botanical

> **Attribution.** This design system is a slides-commons derivative of the **"Dark Botanical"** preset (preset 4) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). The preset defines the fonts, the six core colors, the layout idea and the signature elements; the safe area, extended tokens, components, slide archetypes and this document were written for slides-commons (MIT). It is not an official frontend-slides file and is not endorsed by its author.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text leaves the content area and no orb sits behind body text. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Dark Botanical feels like an **evening at a perfumer's atelier**: a near-black room (`{colors.bg-primary}` #0f0f0f), warm off-white serif type (`{colors.text-primary}` #e8e4df), and soft pools of colored light — terracotta, rose and gold — glowing out of the corners. Nothing is drawn: the "botanical" quality comes from **abstract blurred circles**, never from leaves or flowers.

Typography is **Cormorant**, a high-contrast display serif, used at regular weight and in **italic for signature phrases**, roman numerals and the cover title. **IBM Plex Sans** at Light (300) carries body copy, and at Regular with wide tracking it sets small uppercase labels. **Thin gold vertical lines** punctuate centred compositions and divide columns.

**Key characteristics**

- Near-black ground, warm off-white type; secondary text in `{colors.text-secondary}`.
- One soft orb cluster (plus at most one small one) per slide, in a corner.
- Gold for numerals, rules and the one highlight; rose for one italic phrase; terracotta mainly inside the orbs.
- Italic Cormorant for the phrase that matters; regular Cormorant for the rest of a headline.
- Thin, fading gold vertical lines.
- Centred cover, divider, statement, quote and closing; left-aligned content slides.

**Density philosophy: medium-low.** Few words, set beautifully. A content slide carries a title and one list of four, three stats, a chart, or a 4-row table. Long text breaks the mood — split it.

## Colors

### Palette

- **Background** (`{colors.bg-primary}` #0f0f0f): every slide. Stage `{colors.stage-bg}`.
- **Text primary** (`{colors.text-primary}` #e8e4df): headlines, stat numerals, key table cells.
- **Text secondary** (`{colors.text-secondary}` #9a9590): body, labels, chart stems (about 6.4:1 on the background).
- **Gold** (`{colors.accent-gold}` #c9b896): numerals, chapter numbers, vlines, the hero stat, the highlighted chart point and table column, an italic word.
- **Rose** (`{colors.accent-pink}` #e8b4b8): one italic phrase per statement, the quotation mark, orbs.
- **Terracotta** (`{colors.accent-warm}` #d4a574): orbs and accent dots.
- **Derived tokens**: `{colors.text-faint}` off-white 42% (chrome, axes), `{colors.rule}` off-white 14% (hairlines), `{colors.gold-line}` gold 70% (vlines), `{colors.gold-tint}` gold 7% (table column).

### Defaults

- Headline: `{colors.text-primary}`; one italic phrase may be gold or rose.
- Body: `{colors.text-secondary}`. Labels: `{colors.text-secondary}`; chrome: `{colors.text-faint}`.
- At most two accent colors in text per slide (e.g. rose phrase + gold phrase in one statement).
- No accent color as a fill behind text except the 7% gold tint.

## Typography

### Font Family

- **Cormorant** — Google Fonts, 400 / 600 and italic 400 / 600. All headlines, numerals (with `font-variant-numeric: lining-nums`), quotes, item titles, the house name.
- **IBM Plex Sans** — Google Fonts, 300 / 400. Lede and body (300), small text and labels (400).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,600;1,400;1,600&family=IBM+Plex+Sans:wght@300;400&display=swap" rel="stylesheet">
```

**Gotcha:** Cormorant defaults to old-style figures. Set `font-variant-numeric: lining-nums` on stats, chart values and dates, or numbers will bob up and down.

### Type Scale

| Token | Size / line-height | Face | Use |
|---|---|---|---|
| `{typography.numeral-xl}` | 300 / 0.8 | Cormorant italic, gold | Divider roman numeral |
| `{typography.stat-xl}` | 260 / 0.82 | Cormorant italic, gold | Hero number |
| `{typography.hero}` | 184 / 0.96 | Cormorant italic | Cover title (168 on closing) |
| `{typography.display}` | 128 / 1.0 | Cormorant | Agenda and divider titles |
| `{typography.stat}` | 96 / 0.95 | Cormorant | Supporting stats |
| `{typography.statement}` | 84 / 1.14 | Cormorant | Centred statement (≤ 3 lines) |
| `{typography.title}` | 76 / 1.04 | Cormorant | Content-slide title |
| `{typography.quote}` | 76 / 1.16 | Cormorant italic | Quote (≤ 110 characters) |
| `{typography.sub}` | 52 / 1.1 | Cormorant | Column titles |
| `{typography.item-title}` | 42 / 1.1 | Cormorant 600 | List and agenda items |
| `{typography.lede}` | 30 / 1.6 | Plex Sans 300 | Subtitles, captions |
| `{typography.body}` | 25 / 1.65 | Plex Sans 300 | Paragraphs, rows |
| `{typography.body-sm}` | 21 / 1.6 | Plex Sans 400 | Descriptions, sources |
| `{typography.label}` | 18, +0.22em, UPPERCASE | Plex Sans 400 | Labels, chrome, table row names |

Minimum on-slide text is 18px (labels); running text is never below 21px, and Plex Light (300) is only used at 25px and up.

### Signature Treatments

- **Italic signature phrase**: in a regular-weight headline, set the key words in italic (`<em>`), sometimes in gold or rose: "Four scents, *one hour*".
- **Italic roman numerals** in gold for chapters, agenda items and list items (i, ii, iii …; capitals II for the divider).
- **Thin vertical line** above a centred title or between a statement and its source.
- **Lining figures** for every number.
- Never bold for emphasis in body copy; use italic Cormorant in the headline instead.

## Layout

### Safe area and chrome

| Element | Position |
|---|---|
| House name | `top 64px; left 136px` |
| Chapter (numeral + name) | `top 64px; right 136px` |
| Content area | `top 176px; bottom 152px; left/right 136px` (1648 × 752) |
| Occasion label | `bottom 60px; left 136px` |
| Page number | `bottom 60px; right 136px` |

### Composition rules

- **Centred slides** (cover, divider, statement, quote, closing): one vertical axis, generous space, a vline as punctuation.
- **Content slides** (agenda, list, two columns, stats, chart, table): left-aligned; a title block bottom-aligned on the left or a title row on top, separated from the content by a full-height vline or 72–96px of space.
- Orbs go in the corner opposite the heaviest text. Two clusters on a slide sit in diagonal corners.
- Leave the centre dark. Nothing fills the full width except tables.

## Depth and Elevation

Depth comes only from the **blurred light** of the orbs against black. No cards, panels, borders around content, shadows or glass. The one exception is the soft 10px gold halo around the highlighted chart point. Hairlines are 1px off-white 14%.

## Components

- **Orbs**, **vline**, **chrome**, **programme rows**, **note columns**, **lollipop chart**, **table**: see tokens.
- **Then / now columns**: two columns either side of a full-height vline; label, Cormorant `sub` with one italic word, three 26px Plex Light rows between hairlines (the "now" column in primary text).
- **Stat block**: hero `stat-xl` italic gold + lede on the left; vline; three stat rows (96px Cormorant + 21px caption) on the right.
- **Quote**: rose italic quotation mark (240px), `quote`, a vline, name in Cormorant 600 34px, role below.
- **Closing dates**: up to three centred items divided by vlines — italic gold date (44px) over a 21px caption.

## Slide Archetypes

1. **Cover** (centred) — label, vline 140px, `hero` italic (2 lines), lede, date label. Orbs top-right + small bottom-left.
2. **Agenda** — left 520px: label, `display` with an italic second line, body; vline; five programme rows.
3. **Chapter divider** (centred) — `numeral-xl` "II", label, `display` with one italic word, one line. Orbs top-left + small bottom-right.
4. **Statement** (centred) — vline, `statement` with one rose and one gold italic phrase, vline, attribution.
5. **List** — title row (title left, body right-aligned), then four note columns.
6. **Two columns** — then / now, see Components.
7. **Big number + stats** — see Components.
8. **Chart** — left 520px title block; lollipop chart with 12 months, one highlighted.
9. **Comparison table** — title row + note on the right; 4-row table with the recommended column in gold.
10. **Quote** (centred) — see Components.
11. **Closing** (centred) — label, `hero` "With gratitude", three dates, contact label.

## Motion

- `.reveal` fades in and rises 20px on `.visible`: 0.9s `cubic-bezier(0.16, 1, 0.3, 1)`, staggered `--i` × 110ms + 150ms — slower than other systems.
- Orb clusters fade in over 1.6s and drift 30px into place over 2.4s.
- Vlines draw from the top (`scaleY`), 1.1s.
- Chart stems rise from the axis, staggered 50ms.
- No looping motion; `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Keep the ground near-black and the type warm off-white.
- Use one orb cluster per slide (plus one small one at most), in a corner.
- Put the important phrase of a headline in italic.
- Use gold italic roman numerals for structure.
- Use thin gold vertical lines as punctuation and dividers.
- Use lining figures for numbers.

### Don't

- Don't draw leaves, flowers or any illustration — only abstract CSS circles.
- Don't put orbs behind paragraphs or table text.
- Don't use bold Cormorant above 600, or Plex Light below 25px.
- Don't add cards, borders, shadows or glassmorphism.
- Don't centre content slides (lists, tables, charts); only the five centred archetypes are centred.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients (frontend-slides "DO NOT USE" list).
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, quotes, numerals (Cormorant) | Cormorant | Noto Serif SC (思源宋体) | 400 (600 for item titles) |
| Body, lede (Plex Sans 300) | IBM Plex Sans | Noto Sans SC (思源黑体) | 300 |
| Labels, small text (Plex Sans 400) | IBM Plex Sans | Noto Sans SC | 400 |

### Mixed-Content Strategy

```css
--font-display: 'Cormorant', 'Noto Serif SC', 'Cormorant Garamond', Georgia, serif;
--font-body: 'IBM Plex Sans', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Chinese has no italic. Browsers will slant Noto Serif SC to fake one, which looks wrong — for Chinese, replace the italic signature phrase with **color** (gold or rose) and keep `font-style: normal` on CJK runs:

```css
:lang(zh) em, :lang(zh) .t-hero, :lang(zh) blockquote { font-style: normal; }
```

Latin words and numerals inside a Chinese headline may stay italic if wrapped in `<span lang="en">`.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,600;1,400;1,600&family=IBM+Plex+Sans:wght@300;400&family=Noto+Serif+SC:wght@400;600&family=Noto+Sans+SC:wght@300;400&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.25–1.35 (raise `hero` from 0.96 and `title` from 1.04).
- Letter-spacing 0 on CJK text (drop the +0.22em label tracking; use +0.08em at most).
- No `text-transform: uppercase` effect on CJK.
- Full-width punctuation （，。：；！？「」（））; Chinese quotes in 「」, keep the rose Latin quotation mark as a graphic.
- Pangu spacing (盘古之白): a space between CJK and Latin/numbers, e.g. `共 1,840 瓶`.
- Avoid a single orphan character on the last line of a headline.
- One font per sentence.

### Aesthetic Notes for This System

The mood comes from **dark space, soft light and a refined serif**, and Noto Serif SC (思源宋体) carries it well at 400. Set Chinese headlines about 10% smaller than the Latin tokens (Cormorant has a small x-height, so its sizes are large) and use color, not italics, for the signature phrase. Roman numerals stay in Latin; Chinese chapter names (第二章 · 新系列) work in the chrome as plain labels.

### Known CJK Gap

No italic for Chinese: the italic signature is replaced by color. Noto Serif SC is heavier than Cormorant 400 at the same size; if headlines look dense, use Noto Serif SC 300.

## Iteration Guide

1. Decide whether the slide is centred (cover, divider, statement, quote, closing) or a content slide.
2. Place one orb cluster in the corner opposite the heaviest text.
3. Write the headline in regular Cormorant and put its key phrase in italic.
4. Add gold structure: roman numerals, one vline.
5. Use only the type scale tokens; lining figures for numbers.
6. Keep body text in Plex Light at 25px+, secondary color.
7. Gold and rose only as small accents; no fills.
8. If a content slide needs more than one list, stat group, chart or table, split it.
9. Update the chapter in the chrome; let the script fill page numbers.
10. Verify at 1920×1080, 1280×720 and on a phone: no overflow, no orb behind body text, fonts loaded.

## Known Gaps

- The original preset gives two fonts, six colors, a one-line layout ("centered content on dark; abstract soft shapes in corner") and five signature elements. The safe area, orb recipe, type scale and components are slides-commons extensions in the spirit of the preset. Content slides are left-aligned to avoid the frontend-slides "everything centered" anti-pattern.
- `filter: blur()` with `mix-blend-mode: screen` is rendered slightly differently by each browser; orbs may look a touch brighter in Safari.
- The chart and table are hand-built with CSS; stem heights are inline `--h` percentages (value / axis max). There is no data binding.
- No image archetype is included. If photos are used, show one at a time in a soft-edged frame (`mask-image` radial fade), never as a full-bleed background.
