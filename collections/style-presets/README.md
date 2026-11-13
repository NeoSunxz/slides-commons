# Style Presets collection

Sixteen slide templates for slides-commons, in two groups:

- **12 derived templates** built from the 12 style presets in
  [`STYLE_PRESETS.md`](https://github.com/zarazhangrui/frontend-slides/blob/main/STYLE_PRESETS.md)
  of **frontend-slides** by Zara Zhang (MIT). Each preset in that file is a
  short recipe (fonts, a few colors, some signature elements); this collection
  turns each one into a complete template.
- **4 original templates**: white-background business decks designed from
  scratch by slides-commons contributors. They are not based on Zara Zhang's
  presets or on any other work.

Every template has a demo deck (`template.html`), a full design system
(`design.md`) and metadata (`template.json`), so a coding agent can build new
decks in that style.

## Derivation and credit

Applies to the 12 derived templates only (see the table below):

- Their visual direction (fonts, colors, signature elements) comes from
  frontend-slides' `STYLE_PRESETS.md`, MIT License,
  Copyright (c) 2025 Zara Zhang.
- Their slide layouts, demo content, extended tokens and `design.md` files were
  written by slides-commons contributors and are MIT licensed (see `LICENSE`).
- They are derivative works. They are not made, reviewed or endorsed by the
  frontend-slides author.

The 4 original templates (`consulting-report`, `boardroom-quarterly`,
`minimal-pitch`, `tech-blue-business`) are original works by slides-commons
contributors, MIT licensed (see `LICENSE`).

Every download pack includes this collection's `LICENSE` and the
frontend-slides `LICENSE` (as `LICENSE-skill`). For the derived templates that
license covers the preset they are based on; for all templates it also covers
the `viewport-base.css` shipped in the pack, which comes from frontend-slides.

## Layout

```
templates/<slug>/template.html   demo deck, fixed 1920x1080 stage
templates/<slug>/template.json   metadata (slides-commons template schema)
templates/<slug>/design.md       design system for building new decks
screenshots/<slug>-<n>.png       1920x1080 screenshots, three per template
```

## Templates

All 16 are done.

### Derived from frontend-slides STYLE_PRESETS.md

| Slug | Name | Description | Based on |
|---|---|---|---|
| `bold-signal` | Bold Signal | One vivid orange card on a dark gradient, big section numbers, breadcrumb navigation | Preset 1 |
| `electric-studio` | Electric Studio | White and electric-blue split panels with a black accent bar on the seam | Preset 2 |
| `creative-voltage` | Creative Voltage | Electric-blue and midnight panels, neon-yellow badges, halftone dots, one script accent | Preset 3 |
| `dark-botanical` | Dark Botanical | Italic serif on near-black with soft blurred terracotta, rose and gold circles | Preset 4 |
| `notebook-tabs` | Notebook Tabs | Cream paper sheet with binder holes and pastel section tabs on the right edge | Preset 5 |
| `pastel-geometry` | Pastel Geometry | Rounded white card on powder blue with pastel pill tabs and soft shapes | Preset 6 |
| `split-pastel` | Split Pastel | Peach and lavender split screen, graph-paper grid, badge pills, black CTA buttons | Preset 7 |
| `vintage-editorial` | Vintage Editorial | Cream magazine page, Fraunces masthead, circle-line-dot geometry, bordered CTA boxes | Preset 8 |
| `neon-cyber` | Neon Cyber | Deep navy with cyan and magenta neon, faint grid, particles, HUD panels | Preset 9 |
| `terminal-green` | Terminal Green | A terminal session on GitHub-dark: monospace only, green prompt, diff panes, status bar | Preset 10 |
| `swiss-modern` | Swiss Modern | White page, black type, one red accent, visible 12-column grid, asymmetric layouts | Preset 11 |
| `paper-and-ink` | Paper & Ink | Warm cream pages, charcoal serif, one crimson accent, drop caps and pull quotes | Preset 12 |

### Original slides-commons templates

| Slug | Name | Description | Based on |
|---|---|---|---|
| `consulting-report` | Consulting Report | Strategy-firm deliverable on white: action titles, section tracker, source lines, dense CSS charts | original |
| `boardroom-quarterly` | Boardroom Quarterly | High-density board / QBR deck: KPI cards with deltas, trend charts, RAG status, risk register | original |
| `minimal-pitch` | Minimal Pitch | Quiet investor deck: white canvas, one green accent, very large type, one idea per slide | original |
| `tech-blue-business` | Tech Blue Business | White corporate canvas, tech-blue accents, a sparing gradient band, inline SVG line icons | original |
