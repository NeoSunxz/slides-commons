---
version: alpha
name: Notebook Tabs
description: An editorial, organized and tactile system that presents every slide as a sheet of cream paper (#f8f6f1) with a soft shadow, lying on a charcoal desk. Five punched binder holes and a thin pink margin rule run down the left edge; five pastel section tabs — mint, lavender, pink, sky and cream — stick out of the right edge with vertical uppercase labels, and the current section's tab sits forward. Bodoni Moda carries headlines (700, with 400 italic phrases); DM Sans carries body copy, item titles and tracked labels. The current section's tab color also drives highlighter marks, chart highlights and section cards. A slides-commons derivative of the "Notebook Tabs" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 5 'Notebook Tabs' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file."

colors:
  bg-outer: "#2d2d2d"
  bg-page: "#f8f6f1"
  text-primary: "#1a1a1a"
  tab-1: "#98d4bb"
  tab-2: "#c7b8ea"
  tab-3: "#f4b8c5"
  tab-4: "#a8d8ea"
  tab-5: "#ffe6a7"
  text-muted: "rgba(26, 26, 26, 0.66)"
  text-faint: "rgba(26, 26, 26, 0.44)"
  rule: "rgba(26, 26, 26, 0.14)"
  rule-strong: "rgba(26, 26, 26, 0.8)"
  track: "rgba(26, 26, 26, 0.10)"
  margin-line: "rgba(244, 184, 197, 0.9)"
  card: "#ffffff"
  stage-bg: "#1f1f1f"

color-aliases:
  accent: "--sec (the current section's tab color)"
  slide-bg: bg-outer
  ink: text-primary

typography:
  hero:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 152px
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: -0.01em
  section-num-xl:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 360px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 0.78
  stat-xl:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 280px
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: -0.03em
  display:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 112px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.01em
  stat:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 88px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.02em
  statement:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 80px
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: -0.01em
  title:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.01em
  quote:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 68px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.2
  toc-entry:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.1
  lede:
    fontFamily: "Bodoni Moda, Didot, Bodoni 72, Georgia, serif"
    fontSize: 40px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.3
  item-title:
    fontFamily: "DM Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 30px
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "DM Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "DM Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    letterSpacing: 0.12em
    textTransform: uppercase
  tab-label:
    fontFamily: "DM Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    letterSpacing: 0.14em
    textTransform: uppercase
    writingMode: vertical-rl

spacing:
  paper: "left 120px, right 176px, top 64px, bottom 64px (1624 x 952px)"
  sheet-padding: "136px 112px 120px 200px (inside the paper)"
  running-head-top: 56px
  running-foot-bottom: 48px
  binder-holes: "5 x 30px circles at x 44px, 180px apart, centred vertically"
  margin-rule: "2px at x 128px"
  tabs: "5 x 150px, 14px gap, from y 128px; inactive 52px wide, current 64px"
  label-to-title: 24px
  title-to-body: 28px

canvas:
  width: 1920px
  height: 1080px

components:
  paper:
    background: "{colors.bg-page}"
    borderRadius: 6px
    boxShadow: "0 2px 4px rgba(0,0,0,0.18), 0 22px 48px rgba(0,0,0,0.32)"
    description: "The sheet. Its ::before draws the five binder holes (desk-colored circles with an inner shadow); its ::after draws the pink margin rule."
  tabs:
    description: "An <ol> of five tabs fixed to the right edge of the paper, rounded on the outside (0 10px 10px 0), vertical uppercase DM Sans 500 18px labels in near-black. The current section's tab is wider (64px vs 52px) and fully opaque; the others are at 80% opacity. Same five tabs, same order, on every slide."
  section-color:
    description: "Each slide sets --sec to its section's tab color. The chip in the running head, highlighter marks, the divider card, chart highlight, table header and stat bar all use var(--sec)."
  running-head:
    description: "Inside the paper, top 56px: chip + organisation name (left), document type (right), hairline below. Running foot, bottom 48px: section name (left), page number '04 / 11' (right)."
  highlighter:
    description: ".hl — a band of var(--sec) behind the lower 58–92% of the text (linear-gradient), like a marker stroke. 2–8 words, once per slide."
  toc-row:
    description: "Contents row: 22px tab-color swatch, Bodoni 44px entry with a 20px DM Sans description, a dotted leader, page number. Hairlines between, 2px ink rule on top."
  divider-card:
    description: "A 600px-wide card in var(--sec) filling the sheet height, label top, italic Bodoni roman numeral (360px) bottom."
  index-card:
    description: "White card, 1px hairline border, 10px top border in a tab color, 4px radius. Italic Bodoni numeral top, DM Sans 500 title + quote-style description bottom. Four in a 2 x 2 grid."
  ruled-list:
    description: "Rows on notebook ruling: repeating hairlines every 72px under a 2px ink rule, each row with a 10px tab-color dot."
  hbar-chart:
    description: "Rows 340px name / 1fr track / 96px value, 84px tall; neutral bars {colors.track}; the message bar in var(--sec) with a 1.5px ink outline and a Bodoni 700 40px value."
  table:
    description: "Hairline rows; the recommended column has a var(--sec) header with rounded top corners and white body cells. Row names in Bodoni 400 34px; filled / empty 14px dots for scores."
  checklist:
    description: "Rows: 32px square checkbox (2px ink border, 5px radius; done = mint fill + check mark), DM Sans 500 title + description, italic Bodoni date right."
---

# Notebook Tabs

> **Attribution.** This design system is a slides-commons derivative of the **"Notebook Tabs"** preset (preset 5) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). The preset defines the fonts, the eight core colors, the paper-and-tabs layout and the signature elements; the paper geometry, section-color system, extended tokens, components, slide archetypes and this document were written for slides-commons (MIT). It is not an official frontend-slides file and is not endorsed by its author.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- **Tab labels:** the original preset says tab text must scale with the viewport (`clamp(0.5rem, 1vh, 0.7rem)`). On a fixed stage the whole slide already scales, so tab labels are a fixed 18px at 1920×1080. Do not use `vh` or `clamp()` for them.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text leaves the sheet's padding box and tab labels fit their tabs. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Notebook Tabs turns a deck into a **well-kept ring binder**. Every slide is one **sheet of cream paper** (`{colors.bg-page}`) with a soft shadow on a **charcoal desk** (`{colors.bg-outer}` #2d2d2d). Down the left edge: **five punched binder holes** and a thin pink margin rule. Out of the right edge: **five pastel section tabs** with vertical labels — mint, lavender, pink, sky, cream — and the tab of the current section stands forward. The color of that tab becomes the slide's accent (`--sec`): it marks the highlighter stroke, the section card, the chart's message bar and the recommended table column.

Type is classic editorial: **Bodoni Moda** — high-contrast, bold for headlines, italic for the phrase that matters — and **DM Sans** for clean body text, item titles and tracked labels.

**Key characteristics**

- One paper sheet per slide, identical position, holes and margin rule.
- Five tabs on the right edge, same order on every slide; the current one is wider and fully opaque.
- Each section owns one pastel; that color is the only accent on its slides.
- Bodoni 700 headlines with an italic 400 phrase; DM Sans for everything else.
- Running head and foot inside the sheet, like a printed report.
- Paper objects: index cards, ruled lines, dotted leaders, checkboxes, highlighter marks.

**Density philosophy: medium-high.** This is a reading-friendly system: contents pages, four index cards, a 6-row chart, a 4-row table and a 4-item checklist all fit comfortably. Keep body text at 22px or more; when a sheet fills up, start a new sheet.

## Colors

### Palette

- **Desk** (`{colors.bg-outer}` #2d2d2d): the slide background around the paper, and the binder holes.
- **Paper** (`{colors.bg-page}` #f8f6f1): the sheet. `{colors.card}` white for index cards and the recommended table column.
- **Ink** (`{colors.text-primary}` #1a1a1a): all headlines and text.
- **Tabs**: `{colors.tab-1}` mint, `{colors.tab-2}` lavender, `{colors.tab-3}` pink, `{colors.tab-4}` sky, `{colors.tab-5}` cream — one per section, in this order.
- **Derived tokens**: `{colors.text-muted}` ink 66% (body), `{colors.text-faint}` ink 44% (running head and foot, axes), `{colors.rule}` ink 14% (hairlines, ruling), `{colors.rule-strong}` ink 80% (2px heads), `{colors.track}` ink 10% (neutral bars), `{colors.margin-line}` tab-3 at 90% (margin rule).

### Defaults

- Text is always ink on paper or ink on a pastel. **Never put white text on a tab color** — all five pastels are too light (ink on them is 10–15:1).
- The slide's accent is `var(--sec)` = its section's tab color. Do not mix tab colors on one slide, except where the color *is* the section key (contents swatches, index-card top borders, the tabs themselves).
- Pastel bars and marks on cream need edges: give the highlighted bar and the stat bar a 1.5px ink outline (`box-shadow: inset 0 0 0 1.5px rgba(26,26,26,.55)`).

## Typography

### Font Family

- **Bodoni Moda** — Google Fonts, variable with an optical-size axis (6–96); weights 400 / 700 and italic 400. Headlines, statements, quotes, stats, contents entries, table row names, italic numerals and dates.
- **DM Sans** — Google Fonts, 400 / 500. Body, item titles, labels, tabs, running head and foot.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

**Gotcha:** keep `font-optical-sizing: auto` so Bodoni's hairlines thicken at smaller sizes. Do not set Bodoni below 32px — its hairlines get too thin for a projector; use DM Sans for small text.

### Type Scale

| Token | Size / line-height | Face | Use |
|---|---|---|---|
| `{typography.section-num-xl}` | 360 / 0.78 | Bodoni italic 400 | Divider-card numeral |
| `{typography.stat-xl}` | 280 / 0.82 | Bodoni 700 | Hero number |
| `{typography.hero}` | 152 / 0.98 | Bodoni 700 | Cover title |
| `{typography.display}` | 112 / 1.0 | Bodoni 700 | Contents, divider and closing titles |
| `{typography.stat}` | 88 / 1.0 | Bodoni 700 | Supporting stats |
| `{typography.statement}` | 80 / 1.14 | Bodoni 400 | Statement (≤ 3 lines) |
| `{typography.title}` | 72 / 1.04 | Bodoni 700 + italic phrase | Content-slide title |
| `{typography.quote}` | 68 / 1.2 | Bodoni italic 400 | Quote (≤ 120 characters) |
| `{typography.toc-entry}` | 44 / 1.1 | Bodoni 400 | Contents entries |
| `{typography.lede}` | 40 / 1.3 | Bodoni italic 400 | Cover subtitle, stat caption |
| `{typography.item-title}` | 30 / 1.2 | DM Sans 500 | Card, checklist and list titles |
| `{typography.body}` | 26 / 1.55 | DM Sans 400 | Paragraphs, ruled rows |
| `{typography.body-sm}` | 22 / 1.5 | DM Sans 400 | Descriptions, sources |
| `{typography.label}` | 18, +0.12em, UPPERCASE | DM Sans 500 | Labels, running head, table headers |
| `{typography.tab-label}` | 18, +0.14em, UPPERCASE, vertical | DM Sans 500 | Tab text |

### Signature Treatments

- **Bold + italic headline**: Bodoni 700 with the key phrase in Bodoni italic 400 — "What we assumed, *what we found*".
- **Highlighter stroke** in the section color on one phrase per slide.
- **Italic Bodoni numerals** (i., ii., II) for cards and section cards.
- **Dotted leaders** on contents rows.
- **Checkboxes** for next steps.

## Layout

### Geometry

| Element | Position (1920×1080) |
|---|---|
| Paper | `left 120; right 176; top 64; bottom 64` → 1624 × 952 |
| Binder holes | 5 × 30px at `x = paper + 44`, centred, 180px apart |
| Margin rule | 2px at `x = paper + 128` |
| Tabs | from `y 128`, 5 × 150px, 14px apart, attached to the paper's right edge |
| Running head | inside the paper, `top 56`, from `x 200` to `right 112`, hairline below |
| Sheet content | padding `136 112 120 200` inside the paper → 1312 × 696 |
| Running foot | inside the paper, `bottom 48` |

### Composition rules

- **Left intro + right content** is the default: a 440–600px intro column (label, title, one sentence, bottom-aligned) and the content filling the rest, 96–112px apart.
- **Title row + content** for comparisons and tables.
- The cover and statement use the full sheet width, left-aligned.
- Nothing goes left of the margin rule except the holes.

## Depth and Elevation

The paper has one soft shadow; tabs have a small shadow. That is all the depth. Index cards are flat white with a hairline border. No gradients except the highlighter band and the ruling; no glass, no glows.

## Components

See the `components` tokens: paper, tabs, section color, running head, highlighter, contents rows, divider card, index cards, ruled list, horizontal bar chart, table, checklist. Also:

- **Cover meta**: three label / value pairs under a 2px ink rule at the bottom of the sheet.
- **Stat block**: hero `stat-xl` + a 240 × 16px `--sec` bar (with ink outline) + italic lede; three stat rows on the right (Bodoni 700 88px + 22px caption).
- **Quote**: a Bodoni 700 quotation mark (280px, ink), the quote in `quote`, then a `--sec` tag with the participant id and a 26px description.

## Slide Archetypes

1. **Cover** — first tab current. Label, `hero` (2 lines), italic `lede`; cover meta at the bottom.
2. **Contents** — intro column (440px) with `display` "Contents"; five contents rows, one per tab.
3. **Section divider** — the section's tab current. Divider card (600px) + label, `display` with an italic word, one sentence.
4. **Statement** — label, `statement` with one highlighter phrase, source.
5. **Index cards** — intro column (460px); four cards 2 × 2, top borders in the four tab colors.
6. **Two columns on ruled paper** — title row; two ruled lists with tag heads ("We assumed" / "We found").
7. **Big number + stats** — stat block.
8. **Chart** — intro column (440px); six-row horizontal bar chart, highlighted row in `--sec`.
9. **Comparison table** — title row with a key on the right; 4-row table.
10. **Quote** — quote block, left-aligned and vertically centred.
11. **Closing checklist** — intro (title + contact at the bottom); four-item checklist, the first done.

## Motion

- `.reveal` fades in and rises 24px on `.visible`: 0.7s `cubic-bezier(0.16, 1, 0.3, 1)`, staggered `--i` × 90ms + 120ms.
- The current tab slides out from behind the paper (24px, 0.7s).
- Highlighter strokes draw left to right (`background-size` 0 → 100%), 0.9s after 0.5s.
- Chart bars grow from the axis, staggered 70ms.
- The paper itself never moves. `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Keep the paper, holes, margin rule and the five tabs identical on every slide; change only which tab is current.
- Set `--sec` per slide to the current section's tab color and use it as the only accent.
- Put the key phrase of a headline in Bodoni italic.
- Use paper objects — index cards, ruling, leaders, checkboxes — rather than generic boxes.
- Give pastel shapes an ink outline when they carry meaning.

### Don't

- Don't put white text on pastels or pastel text on paper.
- Don't change the tab order or colors between slides, or add a sixth color.
- Don't let content run left of the margin rule or under the running head.
- Don't use heavy shadows, gradients or glass on cards.
- Don't set Bodoni below 32px or body text below 22px.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients (frontend-slides "DO NOT USE" list).
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, stats (Bodoni 700) | Bodoni Moda | Noto Serif SC (思源宋体) | 700 |
| Statements, quotes, italic phrases (Bodoni 400) | Bodoni Moda | Noto Serif SC | 400 |
| Body, item titles, labels, tabs (DM Sans) | DM Sans | Noto Sans SC (思源黑体) | 400 / 500 |

### Mixed-Content Strategy

```css
--font-display: 'Bodoni Moda', 'Noto Serif SC', 'Didot', Georgia, serif;
--font-body: 'DM Sans', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Chinese has no italic: on CJK runs set `font-style: normal` and carry the italic phrase's emphasis with the highlighter stroke or with weight (Noto Serif SC 400 inside a 700 headline already contrasts). Vertical tab labels work well in Chinese: with `writing-mode: vertical-rl`, Chinese characters stand upright — use two-character section names (背景 / 发现 / 规律 / 证据 / 下一步).

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&family=DM+Sans:wght@400;500&family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;500&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.2–1.3 (raise `hero` from 0.98 and `display` from 1.0).
- Letter-spacing 0 on CJK text (drop the +0.12/0.14em label and tab tracking).
- No `text-transform: uppercase` effect on CJK.
- Full-width punctuation （，。：；！？「」（））; no period at the end of a Chinese headline.
- Pangu spacing (盘古之白): a space between CJK and Latin/numbers, e.g. `94% 的座位`.
- Avoid a single orphan character on the last line of a headline.
- One font per sentence.

### Aesthetic Notes for This System

The notebook metaphor is language-neutral, and Noto Serif SC 700 (思源宋体) carries the editorial tone of Bodoni well. Chinese headlines can be about 10% smaller than the Latin tokens and still fill the sheet. Dotted leaders, checkboxes and the highlighter work unchanged. Keep numbers and roman numerals in Bodoni.

### Known CJK Gap

No italic in Chinese, so the bold-plus-italic headline becomes bold-plus-regular or bold-plus-highlight. Bodoni's hairline contrast has no Chinese equivalent; Noto Serif SC looks sturdier next to it — keep Latin to numbers and names inside Chinese headlines.

## Iteration Guide

1. Copy the paper, holes, margin rule, tabs and running head/foot unchanged.
2. Mark the current section's tab `.on` and set `--sec` on the slide.
3. Choose the composition: intro column + content, or title row + content.
4. Write the headline in Bodoni 700 with one italic phrase.
5. Build the content from paper objects (cards, ruling, leaders, checkboxes, table).
6. Use the section color once loudly (highlighter, chart bar, table header or card).
7. Use only the type scale tokens.
8. If the sheet fills past its padding, start a new sheet.
9. Let the script fill page numbers.
10. Verify at 1920×1080, 1280×720 and on a phone: no overflow, tab labels fit, fonts loaded.

## Known Gaps

- The original preset gives two fonts, eight colors, a one-line layout ("cream paper card on dark background; colorful tabs on right edge") and four signature elements. The paper geometry, section-color system, type scale and components are slides-commons extensions in the spirit of the preset.
- The preset's viewport-scaled tab text rule is replaced by a fixed 18px under the fixed-stage policy (see above).
- Tabs are decorative and not clickable in the demo; deep-linking to sections would need extra script.
- The chart and table are hand-built with CSS; bar widths are inline `--w` percentages (value / axis max). There is no data binding.
- No image archetype is included. If photos are used, show them as a "pasted print": white 16px border, 1° rotation, small shadow, inside the sheet.
