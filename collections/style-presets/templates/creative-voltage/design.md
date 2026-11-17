---
version: alpha
name: Creative Voltage
description: A bold, energetic, retro-modern system built on a split between an electric-blue panel and a midnight-navy panel, with neon-yellow (#d4ff00) as the voltage — pill badges, highlighter blocks, the one hero number and the one highlighted chart bar. Halftone dot screens fade out of the panel corners, and every slide carries one tilted neon script word (Yellowtail) for creative flair. Syne 800 in extended capitals carries short display words, Syne 700 carries sentence-case titles, and Space Mono carries all running text, labels and chrome. A slides-commons derivative of the "Creative Voltage" preset in frontend-slides' STYLE_PRESETS.md by Zara Zhang.
source-note: "slides-commons derivative of frontend-slides STYLE_PRESETS.md preset 3 'Creative Voltage' (MIT, (c) 2025 Zara Zhang). Not an official frontend-slides file."

colors:
  bg-primary: "#0066ff"
  bg-dark: "#1a1a2e"
  accent-neon: "#d4ff00"
  text-light: "#ffffff"
  text-muted: "rgba(255, 255, 255, 0.74)"
  text-faint: "rgba(255, 255, 255, 0.50)"
  rule: "rgba(255, 255, 255, 0.20)"
  ink-on-neon: "#1a1a2e"
  dot-on-blue: "rgba(26, 26, 46, 0.55)"
  dot-on-dark: "rgba(0, 102, 255, 0.55)"
  neon-tint: "rgba(212, 255, 0, 0.10)"
  stage-bg: "#0d0d17"

color-aliases:
  accent: accent-neon
  slide-bg: bg-dark
  ink: ink-on-neon

typography:
  hero:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 132px
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: -0.02em
    textTransform: uppercase
  display:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 112px
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: -0.02em
    textTransform: uppercase
  section-num-outline:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 440px
    fontWeight: 800
    lineHeight: 0.76
    letterSpacing: -0.05em
  stat-xl:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 200px
    fontWeight: 800
    lineHeight: 0.84
    letterSpacing: -0.05em
  stat:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 96px
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: -0.04em
  statement:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 92px
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: -0.02em
  quote:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 84px
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: -0.02em
  title:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.02em
  sub:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: -0.02em
  item-title:
    fontFamily: "Syne, Arial Black, sans-serif"
    fontSize: 38px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.01em
  script:
    fontFamily: "Yellowtail, cursive"
    fontSize: "88px–128px"
    fontWeight: 400
    lineHeight: 1.0
    transform: "rotate(-7deg)"
  lede:
    fontFamily: "Space Mono, Courier New, monospace"
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Space Mono, Courier New, monospace"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Space Mono, Courier New, monospace"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Space Mono, Courier New, monospace"
    fontSize: 18px
    fontWeight: 700
    letterSpacing: 0.08em
    textTransform: uppercase
  badge:
    fontFamily: "Space Mono, Courier New, monospace"
    fontSize: 20px
    fontWeight: 700
    letterSpacing: 0.06em
    textTransform: uppercase

spacing:
  page-x: 96px
  chrome-top: 52px
  chrome-bottom: 48px
  pane-top: 152px
  pane-bottom: 128px
  pane-seam-pad: 80px
  label-to-title: 28px
  title-to-body: 32px

canvas:
  width: 1920px
  height: 1080px

panels:
  default: "blue pane left (0 → --seam), dark pane right (--seam → 1920). Seam between 760px and 1260px."
  reversed: "dark pane leads on the left (.pane.dark.lead), blue trails on the right (.pane.blue.trail) — statement and stats slides."
  full: "one full-bleed pane (.pane.full), blue or dark — divider, chart, table, quote."

components:
  pane:
    description: "Absolutely positioned full-height flex column. Padding 152px top / 128px bottom, 96px on the outer side, 80px on the seam side."
  halftone:
    description: "A dot screen (radial-gradient dots 3.2px on a 16px grid) masked by a radial gradient so it fades out from one corner (--from). Navy dots on blue, blue dots on navy. One or two per slide, always behind content."
  badge:
    background: "{colors.accent-neon}"
    color: "{colors.ink-on-neon}"
    borderRadius: 999px
    padding: "12px 22px 11px"
    description: "Neon pill callout in Space Mono 700 uppercase. Variants: .outline (2px neon ring, neon text), .tilt (rotated −4°). Used for list numbers, 'New' flags, status and the one deadline."
  script-accent:
    color: "{colors.accent-neon}"
    description: "One Yellowtail word or short phrase per slide, neon, rotated −7°, 88–128px, placed so it overlaps the bottom-right of the headline. Decorative: mark it aria-hidden and never put information only in it."
  highlight:
    background: "{colors.accent-neon}"
    color: "{colors.ink-on-neon}"
    description: "Neon block behind 2–4 words of a statement (.hl), box-decoration-break clone, words joined with &nbsp;."
  outline-numeral:
    description: "Section-divider numeral in Syne 800 440px, transparent fill with a 4px white -webkit-text-stroke, top-right of a full blue slide."
  chrome:
    description: "Space Mono 700 18px uppercase. Top-left: event name; top-right: neon section number + section name. Bottom-left: site (50% white); bottom-right: page number '04 / 11'. White on both panels."
  track-list:
    description: "Agenda as a set list: grid 96px / 1fr / auto — neon side number (A1, A2 …), Syne 700 title + mono description, mm:ss duration. The current item carries a 'Now playing' badge."
  bar-chart:
    description: "Vertical bars in {colors.bg-primary} on navy; the message bar neon with a halftone overlay and a Syne 800 40px neon value. Dashed white-20% gridlines, 2px white baseline, mono axis labels."
  table:
    description: "Hairline rows on navy. The recommended column header is a neon cell with 20px top corners; its body cells use {colors.neon-tint} and bold text. Marks: neon dot = yes, neon ring = partly, faint bar = no."
---

# Creative Voltage

> **Attribution.** This design system is a slides-commons derivative of the **"Creative Voltage"** preset (preset 3) in `STYLE_PRESETS.md` of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by Zara Zhang (MIT, © 2025 Zara Zhang). The preset defines the fonts, the four core colors, the split-panel layout and the signature elements; the panel system, extended tokens, the choice of Yellowtail for the script accent, components, slide archetypes and this document were written for slides-commons (MIT). It is not an official frontend-slides file and is not endorsed by its author.

## Frontend Slides Fixed-Stage Policy

Generate every deck as a **fixed 1920×1080 stage** that scales uniformly to the browser viewport. The deck must stay 16:9 on every screen, including phones; it may letterbox or pillarbox, but it must never reflow slide content for a smaller device.

- Include the full contents of `viewport-base.css` in the deck's `<style>` block. It defines `.deck-viewport`, `.deck-stage`, `.slide`, `.slide.active` / `.slide.visible`, print rules and reduced-motion rules.
- Slide visibility is controlled by the `.active` / `.visible` classes (visibility + opacity + pointer-events), never by `display: none`.
- Scale with one transform on `.deck-stage`: `factor = min(innerWidth/1920, innerHeight/1080)`, then `translate(x, y) scale(factor)` with x/y centring the stage.
- Every measurement in this document is in px at 1920×1080. Do not convert them to `vw`, `vh` or `clamp()`; no media queries inside slide styles.
- Verify in rendered screenshots (1920×1080, 1280×720 and one phone viewport) that no text overflows its pane, no display word runs past the seam, and the script accent covers no information. A `scrollHeight` check alone is not enough.

`template.html` in this folder is a working reference implementation of this policy (inline stage scaler, keyboard / wheel / click / swipe paging, auto-filled page numbers).

## Overview

Creative Voltage looks like a **gig poster for a creative-tech event**. Each slide splits into an **electric-blue panel on the left** (`{colors.bg-primary}` #0066ff) and a **midnight-navy panel on the right** (`{colors.bg-dark}` #1a1a2e). **Neon yellow** (`{colors.accent-neon}` #d4ff00) is the voltage: pill badges, a highlighter block, the one hero number, the highlighted chart bar. **Halftone dot screens** fade out of panel corners like cheap print, and one **tilted script word** in neon (Yellowtail) is scrawled across the headline.

Type has three voices:

- **Syne** — 800 in extended capitals for short display words (cover, divider, agenda), 700 in sentence case for titles, statements and quotes.
- **Space Mono** — every running line, label, axis and the chrome. The mono gives the "code on stage" texture.
- **Yellowtail** — one script accent per slide, decorative only.

**Key characteristics**

- Blue left / navy right by default; the seam moves per slide. Some slides reverse it (navy leads) or go full-bleed.
- Neon yellow is used for small, loud things. Never as a panel background.
- Halftone dots in one or two corners per slide, always behind content.
- One script word per slide, tilted −7°, overlapping the headline's bottom-right.
- Syne 800 caps only for ≤ 8 characters per line — the face is very wide.

**Density philosophy: medium.** A title block on one panel and one list, stat group, table or chart on the other. Mono body text takes space; when a list goes past four items or a row past two lines, split the slide.

## Colors

### Palette

- **Electric blue** (`{colors.bg-primary}` #0066ff): the left panel, chart bars, full-bleed divider and quote slides.
- **Midnight navy** (`{colors.bg-dark}` #1a1a2e): the right panel, the default slide background, and the ink on neon (`{colors.ink-on-neon}`).
- **Neon yellow** (`{colors.accent-neon}` #d4ff00): badges, `.hl` highlights, the section number in the chrome, the hero stat on navy, the highlighted bar, the recommended table column, quotation marks and the script accent.
- **White** (`{colors.text-light}`): all headlines and body text on both panels.
- **Derived tokens** (transparencies of the preset colors, not new hues): `{colors.text-muted}` white 74% (body), `{colors.text-faint}` white 50% (chrome, axes), `{colors.rule}` white 20% (hairlines), `{colors.dot-on-blue}` navy 55% and `{colors.dot-on-dark}` blue 55% (halftone dots), `{colors.neon-tint}` neon 10% (table column).

### Defaults

- Slide background `{colors.bg-dark}`; stage background `{colors.stage-bg}`.
- Text: white on blue and navy. Navy text only on neon.
- Neon text is for large type only (stat numerals, chart value, side numbers, script). On blue, neon text is about 4.2:1 — use it only at 40px and up; on navy it is about 14:1.
- **Never set neon text on white, never set white text on neon.**
- Neon covers at most about 5% of a slide. If a slide has a neon hero number, it has no neon highlight block.

## Typography

### Font Family

- **Syne** — Google Fonts, 700 / 800. Display words, titles, statements, quotes, stat numerals, item titles.
- **Space Mono** — Google Fonts, 400 / 700. Lede, body, labels, badges, chrome, axes, table cells.
- **Yellowtail** — Google Fonts, 400. The script accent only.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&family=Yellowtail&display=swap" rel="stylesheet">
```

**Gotcha — Syne width.** Syne widens as it gets heavier. At 800 a capital is about 1em wide (`VOLTLINE` at 100px ≈ 811px); at 700 it is about 30% narrower. Use 800 caps only for short words and keep each line ≤ 8 characters at `hero` 132px in a 1100px-wide pane; use 700 sentence case for anything longer. Measure before you set a long word in 800.

### Type Scale

| Token | Size / line-height | Face | Use |
|---|---|---|---|
| `{typography.section-num-outline}` | 440 / 0.76 | Syne 800, outline | Divider numeral |
| `{typography.stat-xl}` | 200 / 0.84 | Syne 800 | The hero number (neon on navy) |
| `{typography.hero}` | 132 / 0.92, caps | Syne 800 | Cover and closing words |
| `{typography.display}` | 112 / 0.92, caps | Syne 800 | Agenda and divider words |
| `{typography.stat}` | 96 / 0.95 | Syne 800 | Supporting stats |
| `{typography.statement}` | 92 / 1.06 | Syne 700 | Statement (≤ 3 lines) |
| `{typography.quote}` | 84 / 1.08 | Syne 700 | Quote (≤ 110 characters) |
| `{typography.title}` | 72 / 1.0 | Syne 700 | Content-slide title |
| `{typography.sub}` | 48 / 1.04 | Syne 800 | Column heads |
| `{typography.item-title}` | 38 / 1.1 | Syne 700 | List and agenda items |
| `{typography.script}` | 88–128 / 1.0 | Yellowtail | One accent per slide |
| `{typography.lede}` | 30 / 1.45 | Space Mono 400 | Cover line, stat caption |
| `{typography.body}` | 24 / 1.55 | Space Mono 400 | Paragraphs, rows |
| `{typography.body-sm}` | 20 / 1.5 | Space Mono 400 | Descriptions, captions |
| `{typography.badge}` | 20, +0.06em, UPPERCASE | Space Mono 700 | Badges |
| `{typography.label}` | 18, +0.08em, UPPERCASE | Space Mono 700 | Labels, chrome, axes |

Minimum on-slide text is 18px (labels only); running text is never below 20px.

### Signature Treatments

- **Extended caps** for the few big words; **sentence-case Syne 700** for everything that is a sentence.
- **Script accent**: one per slide, overlapping the headline. It repeats or comments on the headline ("the remix", "side A", "no playback"); it never carries new information.
- **Neon badge** before or after a key line ("New", "Now playing", "2027 = projected", the deadline).
- **Highlighter block** (`.hl`) on 2–4 words of a statement.
- **Outline numeral** on the section divider.
- **Halftone** fading from a corner, on the blue panel by default.

## Layout

### Panels

```html
<section class="slide" style="--seam:820px">
  <div class="pane blue"> … </div>   <!-- 0 → 820px -->
  <div class="pane dark"> … </div>   <!-- 820px → 1920px -->
</section>
```

| Pane | Box | Padding |
|---|---|---|
| `.pane.blue` | `left 0; width --seam` | `152px 80px 128px 96px` |
| `.pane.dark` | `left --seam; right 0` | `152px 96px 128px 80px` |
| `.pane.dark.lead` / `.pane.blue.trail` | reversed | mirrored |
| `.pane.full` | whole slide | `152px 96px 128px` |

The title pane is bottom-aligned (`justify-content: flex-end`). The content pane fills its height (lists and stat rows divide it evenly).

### Chrome

| Element | Position |
|---|---|
| Event name | `top 52px; left 96px` |
| Section (neon number + name) | `top 52px; right 96px` |
| Site | `bottom 48px; left 96px` |
| Page number `04 / 11` | `bottom 48px; right 96px` |

### Composition rules

- Seam choices used in the demo: 700–820 (narrow blue title pane, wide list), 960 (even two-column), 1040–1260 (big blue hero, narrow navy facts).
- Left-aligned everywhere; nothing centred.
- Script accents sit over the title pane only and never cross the seam (the pane's clip-path would cut them).

## Depth and Elevation

Flat print. No shadows, no glows (despite the word "neon"), no gradients except the halftone mask. Badges and the recommended table header are the only rounded shapes. Hairlines are white 20%; heads use 2px white or neon rules.

## Components

- **Pane, halftone, badge, script accent, highlight, outline numeral, chrome**: see tokens.
- **Facts list** (cover): 2px neon top rule; rows of mono label + Syne 700 36px value, hairlines between.
- **Set list** (agenda): see tokens.
- **Badge list**: grid `120px 1fr`; a neon number badge, Syne 700 38px title, 20px mono description; rows split the pane height.
- **Comparison columns**: Syne 800 48px head with a label right and a 2px rule (white on blue, neon on navy); mono rows; neon "New" badges at the row ends.
- **Stat rows**: three on blue, Syne 800 96px white + 20px mono caption.
- **Bar chart**, **table**: see tokens.
- **Quote**: full blue slide with halftone top-right; neon Syne 800 quotation mark (280px); quote in `quote`; badge + name (Syne 700 36px) + role.
- **Next steps**: neon Syne 700 36px dates in a 180px column + 22px mono descriptions, hairlines, a tilted neon deadline badge above.

## Slide Archetypes

1. **Cover** — seam 1260. Blue: halftone bottom-left, `hero` caps (2 lines), script accent under the right end of line 2, lede. Navy: tilted badge top, facts list bottom.
2. **Agenda (set list)** — seam 760. Blue: script "side A", `display` caps "Set list", one line. Navy: five set-list rows.
3. **Section divider** — full blue. Halftone top-left, outline numeral top-right, badge, `display` caps title with script accent, one body line.
4. **Statement** — navy leads (seam 1560), narrow blue strip with halftone on the right. Label, `statement` with a neon `.hl`, source.
5. **List** — seam 820. Blue: label, `title`, script, body. Navy: four badge-numbered items.
6. **Two columns** — seam 960. Blue "last year", navy "this year" with "New" badges.
7. **Big number + stats** — navy leads (seam 1160): outline badge, neon `stat-xl`, lede. Blue trail: three stat rows.
8. **Chart** — full navy. Title column 560px with a badge; vertical bars, the projected bar neon + halftone.
9. **Comparison table** — full navy. Title + legend; 5-row tier table with the recommended tier in neon.
10. **Quote** — full blue, see Components.
11. **Closing** — seam 1040. Blue: label, `hero` caps line, script sign-off. Navy: tilted deadline badge, dated steps, contact.

## Motion

- `.reveal` fades in and rises 28px on `.visible`: 0.7s `cubic-bezier(0.16, 1, 0.3, 1)`, staggered `--i` × 90ms + 120ms. Tilted elements keep their rotation while they rise.
- The blue pane wipes open from the left (`clip-path`), 0.8s.
- Halftone fades in last (1.2s after a 0.4s delay).
- Bars grow from the baseline, staggered 60ms.
- No flicker, no looping "neon" animation; `prefers-reduced-motion` is handled by viewport-base.css.

## Do's and Don'ts

### Do

- Keep blue and navy as the two fields, and neon as small, loud marks.
- Use one script accent and at least one badge per slide.
- Use Syne 800 caps only for short words; Syne 700 for sentences.
- Use Space Mono for every running line.
- Put halftone in a corner, behind content.

### Don't

- Don't fill a panel with neon, or set neon on white.
- Don't put information only in the script accent, and don't use more than one per slide.
- Don't add glows, drop shadows or gradients to "make it neon".
- Don't set long words in Syne 800 caps or let them cross the seam.
- Don't centre slides or build identical card grids.
- Don't use Inter, Roboto, Arial or system fonts as the display face; don't use the generic indigo `#6366f1` or purple gradients (frontend-slides "DO NOT USE" list).
- Don't negate CSS functions directly: `-clamp(...)` / `-min(...)` are silently ignored — use `calc(-1 * ...)`.

## CJK & International Content

### Recommended Chinese Pairing

| Role | Latin face | Chinese face | Weight |
|---|---|---|---|
| Display caps, stats (Syne 800) | Syne | Noto Sans SC (思源黑体) | 800 |
| Titles, statements, quotes (Syne 700) | Syne | Noto Sans SC | 700 |
| Body, labels, badges (Space Mono) | Space Mono | Noto Sans SC | 400 / 700 |
| Script accent (Yellowtail) | Yellowtail | — keep the accent in Latin | — |

### Mixed-Content Strategy

```css
--font-display: 'Syne', 'Noto Sans SC', 'Arial Black', sans-serif;
--font-mono: 'Space Mono', 'Noto Sans SC', 'Courier New', monospace;
--font-script: 'Yellowtail', cursive;
```

Latin and digits stay in Syne / Space Mono; Chinese falls through to Noto Sans SC. Space Mono has no CJK glyphs, so Chinese body text renders proportional in Noto Sans SC — that is expected. Keep the script accent in short English (e.g. "live!", "side A"), or drop it on a Chinese slide; do not set Chinese in a Latin script font.

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&family=Yellowtail&family=Noto+Sans+SC:wght@400;700;800&display=swap" rel="stylesheet">
```

### Universal CJK Adjustments

- Line-height: body 1.75–1.85; headlines 1.15–1.25 (raise `hero` / `display` from 0.92 to at least 1.15).
- Letter-spacing 0 on CJK text (drop −0.02em display and +0.08em label tracking).
- `text-transform: uppercase` has no effect on CJK; that is fine.
- Full-width punctuation （，。：；！？「」（））; no period at the end of a Chinese headline.
- Pangu spacing (盘古之白): a space between CJK and Latin/numbers, e.g. `4,200 名创作者`.
- Avoid a single orphan character on the last line of a headline.
- One font per sentence.

### Aesthetic Notes for This System

The voltage comes from **color, badges and halftone**, which work in any script. Noto Sans SC 800 is narrower than Syne 800 caps, so Chinese display words can run 4–6 characters per line at 132px. Badges work well with 2–4 Chinese characters (新, 进行中, 截止 4 月 30 日). The extended-caps texture is lost in Chinese; compensate with bigger neon numbers and one English script accent.

### Known CJK Gap

There is no Chinese equivalent of the extended Syne caps or the Yellowtail script. Chinese slides look a little plainer; keep Latin numerals, badges and halftone to hold the style.

## Iteration Guide

1. Choose the split (blue left / navy right, reversed, or full) and the seam.
2. Put the title block bottom-aligned in one pane; the content fills the other.
3. Decide the one neon focus: a hero number, a highlight block or a highlighted bar.
4. Add one badge and one script accent; check the script covers nothing important.
5. Add halftone to one corner of the blue pane.
6. Use only the type scale tokens; measure Syne 800 words before using them.
7. White on blue and navy; navy only on neon.
8. If a pane needs more than four rows, split the slide.
9. Update the chrome section number; let the script fill page numbers.
10. Verify at 1920×1080, 1280×720 and on a phone: no overflow, nothing crossing the seam, fonts loaded.

## Known Gaps

- The original preset gives two fonts, four colors, a one-line layout ("split panels — electric blue left, dark right; script accents") and four signature elements. It names "script typography" without naming a script font; Yellowtail is a slides-commons choice. The seam system, derived tokens, type scale and components are slides-commons extensions in the spirit of the preset.
- The halftone is a uniform dot grid faded by a mask, not a true variable-size halftone.
- The chart and table are hand-built with CSS; bar heights are inline `--h` percentages (value / axis max). There is no data binding.
- No image archetype is included. If photos are used, put them in the blue pane with a halftone overlay (`mix-blend-mode: multiply`) and keep neon badges on top.
