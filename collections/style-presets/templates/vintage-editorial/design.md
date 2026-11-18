---
version: alpha
name: Vintage Editorial
description: A witty, confident light system that treats every slide as a page of a small independent magazine. Warm cream paper, near-black Fraunces headlines at 900/700 with italic 400 for deks and asides, Work Sans for body and wide-tracked uppercase labels. A masthead with an editorial double rule tops every page and an italic folio sits at the bottom. The only ornaments are abstract geometric shapes — a circle outline, a straight line and a solid dot, sometimes with a warm sand disc — and bold 4px-bordered boxes for calls to action. Key pages are centered; working pages use an asymmetric 12-column grid. A slides-commons derivative of the "Vintage Editorial" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 8 'Vintage Editorial' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file."

colors:
  bg-cream: "#f5f3ee"
  text-primary: "#1a1a1a"
  text-secondary: "#555555"
  accent-warm: "#e8d4c0"
  text-faint: "#8a8782"
  rule: "rgba(26, 26, 26, 0.18)"
  rule-strong: "#1a1a1a"
  paper: "#fbfaf7"
  stage-bg: "#e9e6df"

color-aliases:
  accent: accent-warm
  slide-bg: bg-cream
  ink: text-primary

typography:
  hero:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 168px
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: -0.02em
  numeral-xl:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 220px
    fontWeight: 900
    lineHeight: 1.0
    letterSpacing: -0.02em
  stat:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 160px
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: -0.01em
  display:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 120px
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: -0.02em
  statement:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 84px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.015em
  title:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 76px
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: -0.02em
  quote:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 72px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.18
    letterSpacing: -0.01em
  box-title:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 48px
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: -0.015em
  subtitle:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
  dek:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 40px
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.3
  item-title:
    fontFamily: "Fraunces, Georgia, Times New Roman, serif"
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 26px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 21px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Work Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 500
    letterSpacing: 0.18em
    textTransform: uppercase

spacing:
  page-x: 120px
  masthead-top: 64px
  frame-top: 196px
  frame-bottom: 156px
  folio-bottom: 56px
  gutter: 40px
  stroke: 2px
  box-border: 4px
  box-pad: "36px 44px"

canvas:
  width: 1920px
  height: 1080px

grid:
  columns: 12
  rows: 6
  gap: 40px
  frame: "top 196px, left 120px, right 120px, bottom 156px (1680 x 728 px)"
  column-width: 103.33px
  row-height: 88px

components:
  masthead:
    position: "absolute; top: 64px; left: 120px; right: 120px"
    description: "Three-part grid: publication name left (Fraunces 900 30px), issue line center and date right (labels). Below it an editorial double rule: 2px near-black, then 1px near-black 8px lower."
  folio:
    position: "absolute; bottom: 56px; left: 120px; right: 120px"
    description: "Section name left and URL right as faint labels; page number center in Fraunces italic 24px ('04 / 11', '/ 11' faint)."
  geo:
    description: "The only ornament: a 2px near-black circle outline, a 2px straight line and a solid near-black dot, combined (line leaving the circle and ending in the dot; dot centered in a ring; line through a ring). Optionally one warm sand disc. Abstract only, never pictorial."
  bordered-box:
    border: "4px solid {colors.text-primary}"
    background: "{colors.paper} or {colors.accent-warm}"
    padding: "36px 44px"
    description: "Call-to-action box, square corners, no shadow: label, Fraunces 900 48px title, a line of body, then a 2px rule and the action (URL or address in Work Sans 600) with a drawn arrow."
  warm-marker:
    background: "linear-gradient(transparent 58%, {colors.accent-warm} 58% 92%, transparent 92%)"
    description: "Highlighter stroke across the lower half of 1–3 words in a headline."
  rules:
    description: "2px near-black rules open lists, tables and stat rows; 1px {colors.rule} hairlines separate items; a 2px vertical rule divides two columns."
---

# Vintage Editorial

> **Attribution.** This design system is a slides-commons derivative of the **"Vintage Editorial"** preset (preset 8) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). The preset defines the fonts, the four core colors and the signature elements (abstract geometric shapes — circle outline + line + dot, bold bordered CTA boxes, witty conversational copy, no illustrations); the masthead and folio, derived tokens, grid, type scale, components, slide archetypes and this document were written for slides-commons (MIT). It is not an official frontend-slides file and is not endorsed by its author.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its block, no geometric ornament runs through text, and nothing overlaps the masthead or folio. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Vintage Editorial reads like **a well-set page from a small, opinionated magazine**: cream paper, a proper masthead, big soft-serif headlines, italic asides and copy that is allowed to be funny. It suits anyone with a voice — an editor's annual letter, a studio's brand story, a talk that wants the room to smile.

What repeats on every slide:

- **Masthead** — publication name, issue line and date over an editorial double rule.
- **Folio** — section name, italic page number centered, URL.
- **Geometry** — one small composition of circle outline + line + dot per slide (or none). Never an illustration.
- **Type** — Fraunces 900/700 for headlines and numbers, Fraunces italic 400 for deks, numerals in lists and witty asides, Work Sans for body and labels.

**Key characteristics**

- Cream (`{colors.bg-cream}`) everywhere; near-black and mid-grey text; one warm sand accent.
- **Key pages are centered** (cover, divider, statement, quote) — the preset's "centered content" — while working pages (contents, lists, columns, stats, chart, table, closing) use a left-aligned 12-column grid so the deck never becomes "everything centered".
- Rules do the structuring: 2px near-black rules open every list and table, 1px hairlines separate rows.
- Witty, conversational copy is part of the system: deks and asides undercut the headline.
- Flat, square, no shadows, no rounded corners except circles.

**Density philosophy: medium.** Editorial pages can hold a little more reading than keynote slides — 4 list items with a sentence each, 3 stats with a two-line caption, a 4-row table — but always one idea per page and plenty of cream.

## Colors

### Palette

- **Cream** (`{colors.bg-cream}` #f5f3ee): every slide. Stage letterbox `{colors.stage-bg}` #e9e6df.
- **Text primary** (`{colors.text-primary}` #1a1a1a): headlines, numerals, rules, geometry, box borders.
- **Text secondary** (`{colors.text-secondary}` #555): body copy, deks, labels (≈ 6.7:1 on cream).
- **Accent warm** (`{colors.accent-warm}` #e8d4c0): the highlighter stroke, the warm disc in a geometric composition, the main CTA box fill, the recommended table column, the highlighted chart dot. It is a background color only — never text.
- **Derived tokens** (slides-commons additions):
  - `{colors.text-faint}` #8a8782 — folio, axis labels, column-head dates (large or decorative only, ≈ 3.3:1).
  - `{colors.rule}` near-black at 18% — hairlines; `{colors.rule-strong}` near-black — 2px structural rules.
  - `{colors.paper}` #fbfaf7 — the secondary bordered box, a shade lighter than the page.

### Defaults

- Headline `{colors.text-primary}`; body, deks and labels `{colors.text-secondary}`; folio and axes `{colors.text-faint}`.
- Emphasis inside a headline: the warm marker, or an italic Fraunces phrase.
- Warm sand appears **once** per slide as a filled area.

## Typography

### Font Family

- **Fraunces** — Google Fonts, variable (optical size 9–144, weight 100–900, italic). Use 900 for hero/display/stats, 700 for titles and item heads, italic 400 for deks, quotes, list numerals and asides. Optical sizing is automatic (`font-optical-sizing: auto`), which keeps 160px numerals crisp and 30px heads sturdy.
- **Work Sans** — Google Fonts, 400 / 500 / 600. Body (400), labels (500, uppercase, +0.18em), action lines in boxes (600).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size / line-height | Face | Use |
|---|---|---|---|
| `{typography.numeral-xl}` | 220 / 1.0 | Fraunces 900 | Roman numeral on a part divider |
| `{typography.hero}` | 168 / 0.94 | Fraunces 900 | Cover and closing headline (2 lines) |
| `{typography.stat}` | 160 / 0.9 | Fraunces 900 | Stat numerals |
| `{typography.display}` | 120 / 0.98 | Fraunces 900 | Contents, divider title |
| `{typography.statement}` | 84 / 1.1 | Fraunces 700 | Centered statement (≤ 3 lines) |
| `{typography.title}` | 76 / 1.02 | Fraunces 700 | Working-page title |
| `{typography.quote}` | 72 / 1.18 | Fraunces italic 400 | Pull quote |
| `{typography.box-title}` | 48 / 1.05 | Fraunces 900 | CTA box title |
| `{typography.dek}` | 40 / 1.3 | Fraunces italic 400 | Dek under a headline (30px when set beside a title) |
| `{typography.subtitle}` | 40 / 1.15 | Fraunces 700 | Column heads |
| `{typography.item-title}` | 34 / 1.15 | Fraunces 700 | List and stat heads (36px on stats) |
| `{typography.body}` | 26 / 1.55 | Work Sans 400 | Paragraphs (24px for stat captions, 30px in two-column pairs) |
| `{typography.body-sm}` | 21 / 1.5 | Work Sans 400 | Sources, list descriptions, sign-off |
| `{typography.label}` | 16, 500, +0.18em, UPPERCASE | Work Sans | Kickers, masthead, folio, table sub-heads |

Minimum on-slide text is 16px (uppercase labels only); running text never below 21px.

### Signature Treatments

- **Kicker → headline → dek.** A small uppercase label, then the Fraunces headline, then an italic dek that comments on it ("Spoiler: it was mostly the bridge."). This trio is the voice of the system.
- **Italic numerals** for list and contents numbers (1, 2, 3 or i., ii., iii.) and for the folio page number.
- **Warm marker** across the lower 58–92% of 1–3 words (`.mk`), joined with `&nbsp;`. One per slide.
- **Italic aside** inside body text (`.it`, Fraunces italic) for the punchline of a sentence.
- Headlines in sentence case, ending with a period when they are statements ("We were late. On purpose.").
- Body text is never bold for emphasis; use italics.

### Copy voice

Witty and conversational, never snarky about the reader. Short declaratives, one joke per slide at most, usually in the dek or an aside — the data itself stays accurate and plain.

## Layout

### Canvas and chrome

| Element | Position (1920×1080) |
|---|---|
| Masthead | `top: 64px; left/right: 120px`, 18px padding-bottom, 2px rule + 1px rule 8px below |
| Frame | `top: 196px; left/right: 120px; bottom: 156px` → 1680 × 728 |
| Folio | `bottom: 56px; left/right: 120px` |

### The grid

`.frame { display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(6, 1fr); gap: 40px; }` — columns 103.33px, rows 88px.

| Span | Width | Used for |
|---|---|---|
| 4–5 columns | 533–677px | Side intro (contents, chart) |
| 6 columns | 820px | Two-column halves, contents list, closing text |
| 10 columns (2–11) | 1373px | Centered statement and quote |
| 12 columns | 1680px | Title bands, list grid, stats row, table |

### Composition rules

- **Centered pages** (cover, divider, statement, quote): one centered column, generous cream, a geometric composition placed in a corner or behind empty space — never under text.
- **Working pages**: title band rows 1–2 (bottom-aligned kicker + title, optionally a dek or note flush right), content rows 3–6 opened by a 2px rule.
- Two columns are divided by a 2px vertical rule, not by boxes.
- One bordered box style per slide group; boxes appear only for calls to action.

## Depth and Elevation

None. No shadows, no gradients (except the highlighter stroke), no rounded rectangles. Depth comes from weight contrast (900 vs. 400 italic), rules and the warm fill. Borders are either 1px hairlines, 2px structural rules, or 4px CTA box borders.

## Components

- **Masthead** and **folio**: see tokens. Change only the folio's section name per part.
- **Geometric composition** (`.geo`, absolutely positioned, `aria-hidden`): 2px ring + 2px line + 20–26px dot, optionally a warm disc (inside or overlapping the ring). Recipes used in the demo: ring with a centered dot (statement, cover corner); ring with a line leaving its center and ending in a dot (contents, closing, cover); a numeral inside a ring with a line through it ending in a dot (divider); a ring around the highlighted chart dot (chart). Keep at most one composition per slide and keep it clear of text.
- **Contents list**: 2px top rule; rows of italic numeral, Fraunces 700 title, dotted leader, italic page number; a one-line description under each title.
- **Numbered list**: 2-column grid with a 2px top rule; italic 56px numeral, Fraunces 700 head, one sentence of body.
- **Two columns**: column heads in Fraunces 700 40px with a faint date label; rows of 30px body separated by hairlines; the "after" side ends each row with an italic aside.
- **Stats row**: three columns divided by hairlines under a 2px rule; Fraunces 900 160px numeral, a 36px head, a two-line caption. One numeral may carry the warm marker.
- **Lollipop chart** (pure CSS — a line + dot chart that echoes the geometry): hairline gridlines with faint labels, 2px baseline, 2px stems with 24px dots, value labels in Fraunces 700 above each dot; the highlighted point is a 40px warm dot with a 4px near-black border inside a 96px ring, its value in Fraunces 900 44px. Stem height = value / axis max.
- **Editorial table**: no fills except the recommended column (`{colors.accent-warm}`); header row in Fraunces 700 36px with a faint uppercase kicker above each option, 2px rules top and bottom, hairlines between rows; row heads Work Sans 500 22px secondary.
- **Pull quote**: 128px ring holding a Fraunces 900 opening quote, the quote in Fraunces italic 72px, attribution line flanked by two 64px rules.
- **CTA boxes**: primary box filled warm, secondary box on `{colors.paper}`; both 4px near-black borders, square; action row with a 2px top rule and a drawn arrow (56px line + rotated-border head).

## Slide Archetypes

The demo deck implements each of these.

1. **Cover** (centered) — kicker, `hero` headline in two short sentences, italic dek, a byline flanked by rules. A ring + warm disc + line + dot composition in the lower-right corner and a small ring-and-dot top-left.
2. **Contents** — left `1/span 5`: kicker, `display` "Contents", a witty paragraph, a ring-and-line composition low on the left. Right `7/span 6`: the contents list (5 parts).
3. **Part divider** (centered) — Roman numeral in a ring with a line through it ending in a dot; `display` title; italic dek.
4. **Statement** (centered, `2/span 10`) — kicker, `statement` with one warm marker, a source line; a ring-and-dot top-left.
5. **Numbered list** — title band with a flush-right italic dek; 4 items in two columns.
6. **Two columns** — title band; promised vs. happened, divided by a vertical rule; italic punchlines on the right.
7. **Stats** — title band; three stat columns.
8. **Chart** — left `1/span 4` intro; right `5/span 8` lollipop chart, 5–8 points, one highlighted.
9. **Table** — title band with a flush-right note; editorial table, 3 options × 4 rows, one warm column.
10. **Quote** (centered) — ring quote mark, italic quote (≤ 90 characters at 72px), ruled attribution.
11. **Closing** — left `1/span 6`: kicker, `hero` two-word call ("Write back."), italic dek, sign-off; right `8/span 5`: a warm CTA box and a paper CTA box; a ring-line-dot composition above the text.

Other layouts (timeline, team, process) should reuse the same parts: kicker + title + dek, rules, italic numerals, one geometric composition, one warm fill.

## Motion

- `.reveal` elements fade in and rise 18px when their slide gets `.visible`: `0.8s cubic-bezier(0.25, 1, 0.5, 1)`, staggered by `--i` × 90ms (+120ms). Calm, like turning a page.
- Geometry fades in (`.fade`); lines draw from their start point (`scaleX` from 0, 1.1s).
- Chart stems rise from the baseline (`scaleY`).
- No bounce, no rotation, no looping. `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Keep the masthead and folio on every slide.
- Write a dek: let the italic line under a headline carry the wit.
- Center the key pages; grid the working pages.
- Use rules (2px / 1px) for structure instead of cards.
- Use warm sand once per slide as a fill.
- Use bordered boxes only for calls to action.
- Split content into more pages rather than shrinking type.

### Don't

- Don't use illustrations, icons, emoji or photos-as-decoration; the only ornaments are circles, lines and dots.
- Don't run a geometric line through text, or put text over a ring's outline.
- Don't round box corners or add shadows; don't add a second accent hue.
- Don't set body copy in Fraunces or headlines in Work Sans.
- Don't center every slide — working pages are left-aligned on the grid.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients on white (frontend-slides "DO NOT USE" list).
- Don't let the jokes touch the numbers: wit goes in deks and asides, data stays exact.
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Headlines, numerals, box titles (Fraunces 900/700) | Fraunces | Noto Serif SC (思源宋体) | 900 / 700 |
| Deks, quotes, asides (Fraunces italic 400) | Fraunces italic | Noto Serif SC (upright — CJK has no italic) | 400 |
| Body, labels (Work Sans) | Work Sans | Noto Sans SC (思源黑体) | 400 / 500 |

The serif/sans split carries over: Song/Ming-style serif for display, Hei sans for body.

### Mixed-Content Strategy

Latin face first in every stack, so Latin and digits stay in Fraunces / Work Sans:

```css
--font-display: 'Fraunces', 'Noto Serif SC', Georgia, serif;
--font-body: 'Work Sans', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif;
```

Do not let the browser synthesise italics on Chinese: put `lang="zh-CN"` on `<html>` and add `:lang(zh) .it, :lang(zh) .dek, :lang(zh) blockquote { font-style: normal; }`. For Chinese deks and asides, mark the voice with color (`{colors.text-secondary}`) and the serif face instead of italics.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700&family=Work+Sans:wght@400;500;600&family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@400;500&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.2–1.3 (raise `hero` / `display` / `title` from ~1.0 to at least 1.2).
- Letter-spacing 0 on CJK headlines; drop the +0.18em label tracking (keep labels short instead).
- No `text-transform: uppercase` effect on CJK.
- Full-width punctuation （，。：；！？「」（））. The two-sentence cover headline works well in Chinese with full-width periods: 我们迟到了。故意的。
- Pangu spacing (盘古之白): a space between CJK and Latin/numbers, e.g. `第 7 期`.
- Avoid single orphan characters on a headline's last line: rebalance with `<br>` or shorten.
- One font per sentence.

### Aesthetic Notes for This System

The magazine feel transfers naturally to Chinese: Noto Serif SC 900 has the same soft weight as Fraunces 900, and a Song-style masthead reads instantly as editorial. Chinese headlines need fewer characters: `hero` at 168px fits about 7–8 characters per line centered; `title` at 76px about 18 characters across a 12-column title band. Contents numerals can switch to Chinese ordinals (一、二、三) in Noto Serif SC. The warm marker works on 2–4 Chinese characters exactly as in English.

### Known CJK Gap

Fraunces italic has no Chinese counterpart, so mixed italic deks lose their italic voice on the Chinese part. Keep deks fully Chinese or fully Latin.

## Iteration Guide

1. Start every slide from the masthead, folio and an empty 12 × 6 frame.
2. Decide: centered key page or gridded working page.
3. Write the kicker, headline and dek first; make the dek the joke, if there is one.
4. Structure content with rules (2px to open, 1px between rows).
5. Use only the type-scale tokens; never interpolate new sizes.
6. Add at most one geometric composition, clear of text, and at most one warm fill.
7. Use a bordered box only for an action.
8. If a page needs more than 4 list items, 3 stats or 4 table rows, split it.
9. Update the folio section name; let the script fill page numbers.
10. Verify at 1920×1080, 1280×720 and on a phone: no overflow, no overlap, no ornament through text, fonts loaded.

## Known Gaps

- The original preset gives two fonts, four colors, a layout line and four signature elements. The masthead and folio, derived tokens, grid, type scale, components and archetypes are slides-commons extensions in the spirit of the preset.
- Fraunces' high-contrast numerals have hairline diagonals (the 4, the 7) that can touch a comma at 160px; keep the −0.01em tracking on stat numerals and avoid tighter settings.
- Charts and tables are hand-built CSS with inline `--h` percentages; there is no data binding.
- No image archetype. If photos are used, set them square-cornered within the grid with a 1px hairline frame and a Work Sans caption; never as backgrounds.
