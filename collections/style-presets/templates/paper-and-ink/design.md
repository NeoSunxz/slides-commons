---
version: alpha
name: Paper & Ink
description: An editorial, literary light system that sets every slide like a page from a well-made book. Warm cream paper, charcoal ink and one crimson accent. Cormorant Garamond carries headlines, numerals and pull quotes, with italics for emphasis and titles of works; Source Serif 4 carries body text with old-style figures. Signature elements are drop caps, pull quotes between ornamented rules, dot-leader contents, booktabs-style tables and fine horizontal rules with a small crimson diamond. A running head on top and a folio at the bottom frame every page; content sits on a 12-column × 6-row grid inside generous book margins. A slides-commons derivative of the "Paper & Ink" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 12 'Paper & Ink' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file. The preset gives vibe, fonts, three colors and three signature elements; everything else here was developed by slides-commons."

colors:
  cream: "#faf9f7"
  charcoal: "#1a1a1a"
  crimson: "#c41e3a"
  paper-2: "#f1eee8"
  ink-2: "#4a4642"
  ink-3: "#74706a"
  hair: "#d8d3ca"
  crimson-tint: "rgba(196, 30, 58, 0.07)"
  stage-bg: "#e9e5de"

color-aliases:
  accent: crimson
  slide-bg: cream
  ink: charcoal

typography:
  roman:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 440px
    fontWeight: 500
    lineHeight: 0.8
  figure-xl:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 260px
    fontWeight: 600
    lineHeight: 0.82
    letterSpacing: -0.02em
  hero:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 188px
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: -0.01em
  drop-cap:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 176px
    fontWeight: 600
    lineHeight: 0.8
  display:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 132px
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: -0.01em
  figure:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 96px
    fontWeight: 600
    lineHeight: 0.9
  title:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 84px
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: -0.01em
  pull-quote:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 76px
    fontWeight: 500
    fontStyle: italic
    lineHeight: 1.15
  card-title:
    fontFamily: "Cormorant Garamond, Garamond, Times New Roman, serif"
    fontSize: 44px
    fontWeight: 500
    fontStyle: italic
    lineHeight: 1.1
  lede:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: 34px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.45
  essay:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: 29px
    fontWeight: 400
    lineHeight: 1.62
  body:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: 21px
    fontWeight: 400
    lineHeight: 1.5
  caps:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: 17px
    fontWeight: 600
    letterSpacing: 0.18em
    textTransform: uppercase

spacing:
  page-x: 160px
  head-top: 64px
  frame-top: 184px
  frame-bottom: 152px
  folio-bottom: 60px
  gutter: 40px
  kicker-to-title: 24px
  title-to-body: 28px

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 40px
  frame: "top 184px, left 160px, right 160px, bottom 152px (1600 x 744 px)"
  column-width: 96.67px
  row-height: 90.67px

components:
  running-head:
    position: "absolute; top 64px; left 160px; right 160px"
    description: "Press name left (10px crimson diamond + caps), running title right (caps, {colors.ink-3}); 1px charcoal rule 16px below."
  folio:
    position: "absolute; bottom 60px; left 160px; right 160px"
    description: "Section name left (caps, {colors.ink-3}); folio right: page number in Cormorant 600 28px charcoal + 'of 11' in Cormorant italic 24px {colors.ink-3}. Filled by script."
  kicker:
    description: "Crimson caps line above every title ('ii. The lead titles'), 24px gap."
  ornament-rule:
    description: "1px charcoal hairlines either side of a 10px crimson diamond (a rotated square), 18px gaps. Width 200–320px as a section ornament, or full column width above a pull quote."
  double-rule:
    description: "Two 1px charcoal lines 3px apart (5px total) — closes a pull quote."
  rule-system:
    description: "2px charcoal for the top and bottom of lists and tables (booktabs), 1px charcoal under headings and table heads, 1px {colors.hair} between rows."
  drop-cap:
    description: "::first-letter of the first paragraph: floated Cormorant 600 176px crimson, line-height 0.8, spans four lines of 29px text."
  essay-columns:
    description: "Two CSS columns, 80px gap, 1px {colors.hair} column rule; paragraphs after the first indented 1.5em, no space between; signature in Cormorant italic 34px."
  contents:
    description: "Dot-leader rows: crimson italic lower-case roman numeral (Cormorant 36px), entry title (Cormorant 600 44px), dotted 2px {colors.ink-3} leader, page number (Cormorant 500 32px), italic description line beneath."
  book-list:
    description: "Rows: an abstract 64×96px book block (charcoal, crimson, or paper with a charcoal border; two fine rules near the top), title in Cormorant italic 44px, author in Source Serif 600 + italic note, date (Cormorant 600 30px) and format right-aligned."
  pull-quote:
    description: "Full-width ornament rule, quote in Cormorant italic 76px with crimson upright quotation marks hanging into the margin, a double rule, attribution as caps name + italic source."
  figures:
    description: "Hero figure in crimson Cormorant 600 260px with an italic lede; three secondary figures (Cormorant 96px) in a booktabs block, each with a bold first caption line."
  fine-bars:
    description: "Horizontal bar chart inside booktabs rules: 300px name column, 14px bars in charcoal (the key bar crimson), values in Cormorant 600 34px right-aligned, an italic source line below."
  table:
    description: "Booktabs: 2px charcoal top and bottom, 1px charcoal under the caps header, hairlines between rows, no vertical lines. Titles of works in Cormorant italic 34px; the lead row on {colors.crimson-tint} with a crimson title."
---

# Paper & Ink

> **Attribution.** This design system is a slides-commons derivative of the **"Paper & Ink"** preset (preset 12) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). It is not an official frontend-slides file and is not endorsed by its author.
>
> **What comes from the preset:** the vibe (editorial, literary, thoughtful), the fonts (Cormorant Garamond + Source Serif 4), the three colors (warm cream #faf9f7, charcoal #1a1a1a, crimson accent #c41e3a) and the three signature ideas (drop caps, pull quotes, elegant horizontal rules). The preset is only these few lines.
>
> **What slides-commons developed:** everything else — the warm grey steps and tint, the type scale and figure styles, the book-margin grid, the running head and folio, the ornament and booktabs rule system, the contents, book-list, essay, figures, chart and table components, the archetypes, the motion rules and this document (MIT).

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its block and no blocks overlap. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled folios).

## Overview

Paper & Ink treats the deck as **a short, beautifully set book**. Each slide is a page: a running head with the press name and title, generous margins, a folio at the foot. Type does almost all the work — a high-contrast Garamond for display and a sturdy text serif for reading — with one crimson accent used the way a printer uses a second ink: for initials, ornaments, numerals and one figure.

**Key characteristics**

- Warm cream page, charcoal text and rules, crimson as a second ink. No other hues.
- Display in Cormorant Garamond, often mixing roman and *italic* in one headline ("Fewer books, *longer lives*").
- Drop caps on essay pages, pull quotes between ornamented rules, dot-leader contents, booktabs tables.
- Fine rules everywhere: hairlines, double rules, a small crimson diamond as the only ornament.
- Calm, left-anchored compositions with book margins (160px sides).

**Density philosophy: medium.** This system can carry real reading — an essay slide of 120–160 words in two columns is in character. Elsewhere, one idea per page with a few lines of text. Never crowd the margins.

## Colors

### Palette

- **Cream** (`{colors.cream}` #faf9f7) — *preset*. The page; a very faint warm radial highlight gives it depth.
- **Charcoal** (`{colors.charcoal}` #1a1a1a) — *preset*. Text, headings, all structural rules, book blocks.
- **Crimson** (`{colors.crimson}` #c41e3a) — *preset*. Drop caps, ornaments, kickers, contents numerals, the hero figure, the key chart bar, the lead table row's title, quotation marks.
- **Derived by slides-commons** (warm steps between cream and charcoal; no new hues):
  - `{colors.paper-2}` #f1eee8 — a slightly darker paper for blocks.
  - `{colors.ink-2}` #4a4642 — secondary text (ledes, captions), about 9:1 on cream.
  - `{colors.ink-3}` #74706a — tertiary text (folios, running title, sources), about 4.8:1.
  - `{colors.hair}` #d8d3ca — hairlines between rows, column rules.
  - `{colors.crimson-tint}` crimson 7% — the highlighted table row.
  - `{colors.stage-bg}` #e9e5de — letterbox.

Crimson on cream is about 5.9:1, safe for 21px text and up. Use it sparingly: about three small accents and one large one per page.

## Typography

### Font Family

- **Cormorant Garamond** — Google Fonts, 500 and 600, roman and italic. Headlines, numerals, drop caps, pull quotes, titles of works, contents entries, folios.
- **Source Serif 4** — Google Fonts, optical-size axis 8–60, 400 and 600, plus 400 italic. Body, ledes (italic), captions, caps labels, table text.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
```

Set `font-optical-sizing: auto` so Source Serif 4 picks its display or text cut by size.

### Figures

Body text uses **old-style figures** (`font-variant-numeric: oldstyle-nums` on `.slide`), so numbers sit quietly in sentences. Display numbers, folios, dates and tables switch to **lining figures** (`lining-nums`; tables also `tabular-nums`).

### Type Scale

| Token | Size / line-height | Family | Use |
|---|---|---|---|
| `{typography.roman}` | 440 / 0.8 | Cormorant 500 crimson | Part numeral (I, II, III) |
| `{typography.figure-xl}` | 260 / 0.82 | Cormorant 600 crimson | One hero figure |
| `{typography.hero}` | 188 / 0.9 | Cormorant 600 | Cover and closing (2 lines, 2nd often italic) |
| `{typography.drop-cap}` | 176 / 0.8 | Cormorant 600 crimson | Essay initial |
| `{typography.display}` | 132 / 0.95 | Cormorant 600 | Contents, part titles |
| `{typography.figure}` | 96 / 0.9 | Cormorant 600 | Secondary figures |
| `{typography.title}` | 84 / 1.02 | Cormorant 600 | Slide titles, roman + italic |
| `{typography.pull-quote}` | 76 / 1.15 | Cormorant 500 italic | Pull quotes (≤ 130 characters) |
| `{typography.card-title}` | 44 / 1.1 | Cormorant 500 italic | Column heads, book titles |
| `{typography.lede}` | 34 / 1.45 | Source Serif 400 italic | Subtitles, figure captions |
| `{typography.essay}` | 29 / 1.62 | Source Serif 400 | Essay columns |
| `{typography.body}` | 26 / 1.6 | Source Serif 400 | Body |
| `{typography.body-sm}` | 21 / 1.5 | Source Serif 400 | Notes, sources, descriptions |
| `{typography.caps}` | 17, 600, +0.18em, UPPERCASE | Source Serif | Running head, kickers, folio section, table heads |

Minimum on-slide text: 17px for letter-spaced caps only; running text never below 21px.

### Signature Treatments

- **Roman + italic headlines.** Set the emphatic half of a headline in italic 500: `Publication <em>dates</em>`. One italic phrase per headline.
- **Italic for titles of works**, as in print: book, film and journal titles are always italic.
- **Drop cap** on the first paragraph of any essay or letter slide; never more than one per slide.
- **Hanging punctuation** in pull quotes: the opening quotation mark sits in the margin (negative text-indent, matching padding).
- **Lower-case roman numerals** for contents and sections (`i.`, `ii.`), crimson italic; capital romans for parts.
- No bold in running text; use italic. No all-caps except the 17px letter-spaced caps.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Running head (rule below) | `top: 64px; left: 160px; right: 160px` |
| Frame (content grid) | `top: 184px; left: 160px; right: 160px; bottom: 152px` → 1600 × 744 |
| Folio | `bottom: 60px; left: 160px; right: 160px` |

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 40px; }` — columns 96.67px, rows 90.67px.

| Span | Width | Used for |
|---|---|---|
| 3 columns | 370px | Imprint, colophon |
| 4 columns | 507px | Side title column |
| 5 columns | 643px | Part numeral, figures block |
| 6–7 columns | 780–917px | Columns, chart, hero figure, contents |
| 8 columns | 1053px | Book list, cover title |
| 10–12 columns | 1327–1600px | Pull quote, essay, tables |

### Composition rules

- Left-anchored, like a book page: titles and text start on the left margin; a narrower column on the right for supporting matter (imprint, dates, figures).
- Title blocks bottom-aligned in their cell; contents, divider and pull quote vertically centred like a title page.
- Rules close blocks: 2px top and bottom on lists and tables.
- Generous white space is part of the look; never fill the margins.

## Depth and Elevation

None. Paper is flat: no shadows, no cards, no rounded corners, no gradients except the barely visible warm page highlight. Hierarchy comes from type size, italic, crimson and rules.

## Components

See the `components` tokens above for exact specs: running head, folio, kicker, ornament rule, double rule, rule system, drop cap, essay columns, contents, book list, pull quote, figures, fine bars, table.

## Slide Archetypes

The demo deck implements each of these. Coordinates are grid spans inside `.frame`.

1. **Title page** — cols 1–8: short ornament rule, crimson kicker, `hero` title (second line italic crimson), italic lede. Cols 10–12 with a 1px left rule: caps line at top, imprint pairs (caps + Cormorant 32px) at the bottom.
2. **Contents** — cols 1–4: kicker, italic `display` "Contents", one sentence. Cols 6–12: 4–6 dot-leader entries, vertically centred.
3. **Part divider** — cols 1–5: "Part" caps + crimson `roman` numeral. Cols 6–12: kicker, `display` title (roman + italic line), epigraph with a 2px crimson left rule.
4. **Letter / essay** — title band; two essay columns with a drop cap, 120–160 words, signature.
5. **Book list** — cols 1–4: kicker, title, sentence. Cols 5–12: 4 book rows inside booktabs rules.
6. **Two columns** — title band; two columns split by a 1px charcoal rule; italic column heads; numbered notes (left italic quotes, right plain answers).
7. **Figures** — cols 1–6: kicker, crimson `figure-xl`, italic lede. Cols 8–12: three figures in a booktabs block.
8. **Chart** — cols 1–4: kicker, title, sentence. Cols 6–12: fine bars, ≤ 6 rows, source line.
9. **Table** — title band; booktabs table, ≤ 6 rows × 5 columns.
10. **Pull quote** — cols 2–11, vertically centred: ornament rule, quote, double rule, attribution.
11. **Colophon / closing** — cols 1–7: kicker, `hero` line (italic second line), ornament rule. Cols 9–12: dates list (top), colophon and contact (bottom).

Other layouts: a timeline is a dates list; a biography is a part divider with an epigraph; an image page (if ever needed) is a single plate with an italic caption under a hairline.

## Motion

- `.reveal`: slow fade + 14px rise, 1s `cubic-bezier(0.25, 1, 0.5, 1)`, 110ms stagger — like ink settling.
- `.draw`: rules and bars draw out from the centre (ornaments) or from the left (bars), 1.1s.
- No loops, no bounce, no rotation. `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Write and set the deck like a book: running head, folio, contents, parts.
- Use italics for emphasis and titles of works, crimson for initials and ornaments.
- Let one slide carry real prose when the content deserves it, with a drop cap.
- Use booktabs rules for lists, figures and tables.
- Keep wide margins and quiet pages.

### Don't

- Don't add hues (no gold, navy or green), and don't tint the paper further.
- Don't use bold body text, underlines or all-caps headlines.
- Don't use cards, shadows, rounded corners, icons or illustrations; the diamond and the rules are the only ornaments.
- Don't use more than one drop cap, one pull quote or one hero figure per slide.
- Don't swap in a sans-serif for "modern" contrast; don't use Inter, Roboto, Arial or system fonts, purple gradients or `#6366f1` (frontend-slides "DO NOT USE"); don't centre every page.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, figures, quotes (Cormorant Garamond) | Cormorant Garamond | Noto Serif SC (思源宋体) | 600 / 700 |
| Body, ledes (Source Serif 4) | Source Serif 4 | Noto Serif SC | 400 |
| Caps labels, running head | Source Serif 4 | Noto Serif SC | 600 |

### Mixed-Content Strategy

```css
--font-display: 'Cormorant Garamond', 'Noto Serif SC', 'Garamond', serif;
--font-body: 'Source Serif 4', 'Noto Serif SC', 'Georgia', serif;
```

A serif Chinese face keeps the bookish voice; do not fall back to a sans. Cormorant is small on its body (low x-height) — Chinese in Noto Serif SC will look larger at the same size, so set Chinese headlines about 10% smaller than the Latin scale.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.8–1.9; headlines 1.2–1.3 (raise `hero` and `display` from 0.9–0.95).
- Letter-spacing 0 on CJK (drop the +0.18em caps tracking; uppercase has no effect).
- **No italics on Chinese.** The roman + italic headline device becomes roman + crimson: `出版<span class="cr">日程</span>`. Book titles use 《》 instead of italics.
- **Drop cap:** a single Chinese character as an initial works, but set it at about 3 lines (≈ 132px) in Noto Serif SC 700 rather than 4; or omit the drop cap and keep the crimson first character inline.
- Paragraph indent: two full-width characters (`text-indent: 2em`) instead of 1.5em.
- Full-width punctuation （，。：；！？「」）; quotation marks 「」 or “”; pull-quote hanging punctuation is dropped for Chinese.
- Pangu spacing between CJK and Latin/numbers: `预订量 38,400 册`.
- Avoid a single orphan character on the last line of a headline.

### Aesthetic Notes for This System

Noto Serif SC carries the literary tone well, and the rules, ornaments, running head and folio transfer unchanged. Use 600–700 for Chinese headlines (Cormorant 600 is light; Noto Serif SC 400 would look too thin next to the rules). Contents pages work with Chinese numerals (一、二、三) in crimson. Old-style figures do not apply to Chinese text; numbers stay in the Latin face.

### Known CJK Gap

There is no Chinese italic, so the system loses one of its main emphasis tools in Chinese. Crimson and weight (Noto Serif SC 700) replace it; use them as sparingly as the italics they replace.

## Iteration Guide

1. Start from the running head, folio and an empty 12 × 6 frame inside 160px margins.
2. Decide what this page is in book terms: title page, contents, part, essay, list, plate, table, quotation, colophon.
3. Crimson kicker, then a title with one italic phrase.
4. Only the type scale tokens; Cormorant for display, Source Serif 4 for reading.
5. Crimson for initials, ornaments, numerals and at most one large element.
6. Rules: 2px booktabs, 1px heads, hairlines between rows, the diamond ornament.
7. Italics for titles of works; old-style figures in text, lining in display and tables.
8. Split rather than crowd the margins.
9. Update the folio section name; the script fills page numbers.
10. Verify at 1920×1080, 1280×720 and a phone; check italics and both weights loaded.

## Known Gaps

- The original preset is four lines: vibe, fonts, three colors, three signature ideas. The warm greys, grid, chrome, rule system, components and archetypes here are slides-commons developments in the spirit of the preset.
- Source Serif 4's small-caps feature is not in the Google Fonts subset, so caps labels are letter-spaced uppercase, not true small caps.
- The chart and tables are hand-built with CSS; bar widths are inline `--w` percentages (value / axis max). No data binding.
- The drop cap uses `::first-letter`; browsers measure its box generously, so automated "text inside box" checks may flag the essay block even when it renders correctly — check the screenshot.
