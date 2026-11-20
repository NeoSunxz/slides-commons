# design.md: required structure

`design.md` is the primary source of truth of a template: any coding agent that reads it (and nothing else)
must be able to build a new slide in this style. The gallery templates all follow the layout below, and the
"make a deck" prompts and the `slides-commons-deck` skill expect it. A complete worked example is in
`example/design.md` (Minimal Pitch). Copy its structure, not its content.

## File layout

```
---
version: alpha
name: <Display name>
description: <3-5 sentences: the character of the system, its palette in words, its type, what each slide states.>
source-note: "Converted from <the user's own deck / images> for personal reuse. Not for redistribution."

colors:            # every colour used, as name: "#rrggbb"
  paper: "#ffffff"
  ink: "#111214"
  ...
color-aliases:     # which colour plays which role
  slide-bg: paper
  text: ink
  highlight: accent
typography:        # the type scale, one entry per role, sizes in px at 1920x1080
  display: { fontFamily: "...", fontSize: 112px, fontWeight: 600, lineHeight: 1.04, letterSpacing: -0.04em }
  title:   { ... }
  body:    { ... }
  label:   { ... }
spacing:           # page margins, gutters, vertical rhythm (px)
canvas: { width: 1920px, height: 1080px }
grid:              # columns, gap, frame
components:        # chrome (header/footer/page number), cards, bars, tables, ...
---

# <Display name>
```

The front matter can be written as block YAML (as in the example) or as the compact `{ ... }` form above.
Use real values, never placeholders.

## Sections after the title (use these exact `##` headings)

| Heading | What it must say |
|---|---|
| `## Frontend Slides Fixed-Stage Policy` | **Required** (the heading must contain "Fixed-Stage"; use exactly the heading the example has, `## Frontend Slides Fixed-Stage Policy`). Copy this section from `example/design.md` unchanged: a fixed 1920x1080 stage scaled as a whole, `viewport-base.css` inlined, `.active`/`.visible` switching, no `vw`/`vh`/media queries inside slides. |
| `## Overview` | What the system is, its key characteristics (5-8 bullets), the density philosophy (low / balanced / high), and what content it suits. |
| `## Colors` | The palette with role and hex of each colour, where each may and may not be used (text, fills, accents), contrast notes. An `### Accent rules` subsection if the accent is limited. |
| `## Typography` | `### Font Family` (families, weights, fallbacks, **the open font used and the original it replaces**; the CSS stack lists the original font names first (used when installed locally), then the open replacement, then a generic family (some fonts also register a localized family name: add it exactly as `fc-list` or the OS font list shows it), e.g. `"Microsoft YaHei", "HarmonyOS Sans SC", "Noto Sans SC", sans-serif`, with the replacement's weights; never ship the original font files), `### Type Scale` (a table: role, size px, weight, line-height, tracking, case, where used), and **`### Signature Treatments`** (or `Signature Moves` / `Signature Elements`): the 4-8 recurring moves that make the style recognisable (a rule under titles, a colour band, a number style, ...). That heading is **required**. |
| `## Layout` | Canvas and chrome (what repeats on every slide and where), the grid, composition rules (alignment, margins, how titles sit). |
| `## Depth and Elevation` | Shadows, borders, overlays, or "none: flat". |
| `## Components` | Each reusable piece with its measurements: cards, stat blocks, tables, list rows, charts, callouts, the page-number tag. Drawn with CSS or inline SVG. |
| `## Slide Archetypes` | One entry per layout pattern found in the source. If the source has fewer than 8, add the missing archetypes inside the same system (from the source's own palette card, chrome, type scale, spacing) and mark each one `(extended)`; aim for 8-12 in total (cover, section divider, title + bullets, two columns, image + text, big number, quote, table, timeline, closing, ...): purpose, grid placement, which components. These map 1:1 to the slides of `template.html`. |
| `## Motion` | Transitions between slides and entrance effects, or "none". Respect `prefers-reduced-motion`. |
| `## Do's and Don'ts` | `### Do` and `### Don't` lists, concrete. |
| `## CJK & International Content` | **Required** (heading must contain "CJK"). The recommended Chinese / Japanese pairing (see `font-substitution.md`), weights per role, line-height 1.15-1.25 headlines and 1.7-1.8 body, letter-spacing 0 for CJK, no uppercase, full-width punctuation, Latin/CJK spacing, minimum sizes, the Google Fonts link with the CJK families, how numbers and units are written. |
| `## Iteration Guide` | 5-8 numbered steps for building a new slide in this system. |
| `## Known Gaps` | What the system does not cover (no photo style, no chart style, ...) and what the converter approximated (substituted fonts and the original-first font stack, simplified gradients, a drawn stand-in for a background image the user chose to drop, content photos replaced by placeholder blocks). Be honest here. |

The validator `tools/check-template.mjs` checks the three required headings (Fixed-Stage, Signature
Treatments/Moves/Elements, CJK) and warns when one of the others is missing.

## Writing rules

- Measurements are px at 1920x1080. A size read from a PPTX comes from `extract.json` (already in canvas px);
  a size read from an image is measured against the 1920-wide picture, or estimated and marked "approx.".
- Name colours by role (`paper`, `ink`, `accent`, `wash`, `rule`), not by hue. 6-10 colours is the usual size; when the source defines its own palette roles (a colour-palette slide), keep all of them, with every colour role-named. A translucent fill is written as its effective colour, noted as an overlay.
- Name chrome strings that must stay as written in every language (for example a Latin `PART 1 ... PART 4` strip) under Signature Treatments as **fixed signature text**; the deck prompt translates every other label.
- State the original source facts you are unsure of ("heading font looks like a didone serif; substituted by
  Playfair Display") in `## Known Gaps`, not in the body.
- Never copy the user's text, names, logos, numbers or content photographs into `design.md`. Describe the pattern. Design images that are kept (backgrounds, full-bleed cover or section photos, textures) are the exception: declare each one in `## Components` or `### Signature Treatments` with its role, where it is used, the size it is shown at, any overlay layer (for example a 71% black mask) and that it is the user's own image, embedded for personal use. Describe it, do not paste it; the pixels live in `template.html` as a `data:` URI.
