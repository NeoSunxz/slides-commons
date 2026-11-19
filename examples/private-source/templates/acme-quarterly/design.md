---
version: alpha
name: Acme Quarterly
description: A calm business-review system on a deep navy canvas. One family, Inter, carries everything: bold display headlines, regular body copy and small wide-tracked uppercase labels. Near-white text and exactly one sky-blue accent, used for labels and the rule above each figure. Every slide states one idea with up to three large figures.
source-note: "Example template of the slides-commons private-source skeleton. Simplified from the minimal-pitch idea of slides-commons (MIT)."

colors:
  bg-primary: "#0f172a"
  text-primary: "#f8fafc"
  accent: "#38bdf8"
  stage-bg: "#020617"

color-aliases:
  slide-bg: bg-primary
  text: text-primary
  highlight: accent

typography:
  display:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: 144px
    fontWeight: 700
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: 36px
    fontWeight: 400
---

# Acme Quarterly

Origin: a deliberately tiny example for the private-source skeleton, simplified from the
"minimal-pitch" idea of the slides-commons style presets (MIT). Replace it with your own templates.

## Fixed-Stage Policy

Slides are authored on a fixed 1920×1080 canvas (`.deck-stage`) and scaled as a whole to the
window; nothing reflows. Include `viewport-base.css` in full and keep the slide count in sync with
the page counter. Slides are `section.slide` elements inside `.deck-viewport > .deck-stage`.

## Overview

A quiet, confident review deck for internal use: few words, large figures, one accent.

## Colors

- `bg-primary` #0f172a: slide background.
- `text-primary` #f8fafc: all text; muted text uses the same color at 64% opacity.
- `accent` #38bdf8: eyebrow labels and the 4px rule above each figure. Never for body text.
- `stage-bg` #020617: the letterbox around the scaled stage.

## Typography

Inter only (Google Fonts, weights 400 and 700). Cover title 144px bold, slide titles 80px bold,
lede 36px regular, figure numbers 56px bold, eyebrow 24px uppercase with 0.18em tracking, footer 22px.

## Layout

120px left and right margins, 120px top, 96px bottom. The footer (deck label left, page counter
right) sits 48px from the bottom edge. Content never enters the footer band.

## Signature Moves

- A small uppercase eyebrow in the accent color above every title.
- Three figures in a row, each under a 4px accent rule, number large and caption below.
- One idea per slide; at most three figures or three points.
- A quiet footer with the deck label and a page counter on every slide.

## Components

Figure column (`.cols div`): accent top rule, big number, one-line caption. Lede paragraph: 36px,
muted, 1200px maximum width.

## Slide Archetypes

Cover (eyebrow, two-line title, lede), highlights (title and three figures), closing (title and
next steps).

## Do's and Don'ts

- Do keep one accent and one family.
- Don't add a second accent color, shadows or decorative images.

## CJK & International Content

For Chinese text pair Inter with Noto Sans SC (weights 400 and 700), line height 1.6 for body and
1.25 for titles, letter-spacing 0, no uppercase transformation. Use full-width punctuation and a
thin space between CJK and Latin runs. Load Noto Sans SC from Google Fonts together with Inter.
