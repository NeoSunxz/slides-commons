# Reading the output of `tools/pptx-extract.mjs`

```
node tools/pptx-extract.mjs <deck.pptx> --out <work>/extract --media
```

writes `summary.md` (read this first, it is also printed), `extract.json` (everything) and `media/` (the
deck's images). Exit codes: 0 ok, 1 usage, 2 not a readable .pptx (old binary `.ppt`, encrypted, damaged),
3 written but some parts could not be parsed (see `warnings`).

## Coordinates

Everything is in px on a 1920x1080 canvas, the same canvas as the template. If the deck is 4:3 (or another
ratio) the slide is scaled to fit the canvas and centred (`canvas.letterboxed: true`); the template should
then pick the layout it prefers (usually: build 16:9 and redistribute) and say so in `design.md`.
`1pt = 2px` on a 13.33 in wide (16:9) slide; font sizes are already converted. `normAutofit` font scales are
applied.

## `extract.json` map

| Key | Content |
|---|---|
| `slideSize`, `canvas` | original size and the scale/offset to the canvas |
| `theme.colors` | the theme palette: `dk1 lt1 dk2 lt2 accent1..6 hlink folHlink`. `dk1`/`lt1` are the usual text/background, `dk2`/`lt2` the secondary pair |
| `theme.fonts` | `major` (headings) and `minor` (body): `latin`, `ea` (East Asian), `cs`. An empty `ea` means "system fallback" |
| `fontsUsed` | every typeface that actually carries text, by character count, with a `suggestion` from `spec/font-map.json` |
| `colorsUsed` | colours really used by the slides (fills, lines, text), most important first. `fillArea` is the share of an average slide that colour covers; the biggest is the background. `alpha` lists the opacities the colour is used at; `effective` the colour it looks like over the slide background (black at 71% over white is `#4A4A4A`) |
| `masters`, `layouts` | the master and layouts: background, text styles (title/body sizes), decoration shapes that repeat on slides |
| `slides[]` | per slide: `layout`, `background`, `shapes[]`, `notes` |
| `media` | images in the file with pixel size, bytes and where they are used (`usedBy`: pictures, image fills and slide / layout / master backgrounds) |
| `warnings` | what the tool could not convert (charts, SmartArt, animations, EMF, embedded fonts, ...) |

A **shape** has `kind` (`placeholder`, `text`, `shape`, `picture`, `group` (with `children`), `table`, `chart`,
`smartart`, `line`, `other`), `name`, `x y w h` (px), optional `rotation`, `geometry` (`rect`, `roundRect`,
`ellipse`, ... or `custom`), `fill` (`solid` / `gradient` with stops / `image` / `none`; `viaStyle: true` means
the colour came from the shape's theme style; `alpha` is the opacity, `effective` the colour composited over what lies beneath when that is a plain colour, otherwise `effectiveNote`), `cornerRadius` px (`roundRect`) or `cornerRadii` `{tl,tr,br,bl}` (other round-corner presets; worked out from the `adj` guides), `line` (colour, `width` px from `<a:ln w>` or, when absent, from the theme line style named by the shape style's `lnRef idx`, with `widthFrom`; `dash`), `shadow` (`type`, `blur`, `dist` in px, `angle` in degrees, `color`, `alpha`; from the shape or its theme effect style), `effects` (reflection, glow, soft edge, blur, each with its parameters; they are also listed under `warnings` because the template simplifies them), `placeholder` (`title`,
`body`, `ftr`, `sldNum`, ...), `text` and `image`. `text.paragraphs[].runs[]` carry `size` (px), `bold`, `italic`,
`color` (and `colorAlpha` / `colorEffective` when translucent), `font.latin/ea/cs` (theme references already resolved), plus paragraph `align`, `bullet`, `lineHeight`.

## From data to a design

- **Palette:** take the background (largest `fillArea`, or `slides[].background`), the main text colour (most
  `textCharacters`), the accent (theme `accent1`, or the strongest non-neutral in `colorsUsed`), and 2-3
  supporting neutrals. 6-10 named colours is enough, unless the deck has its own palette slide: then keep every role it defines. Do not keep unused theme slots. For a translucent fill use `effective`, not the raw colour. A fill that lies over a photo has no single effective colour: look at the picture.
- **Type scale:** group `runs[].size` of the title placeholder, other headings, body, captions into 5-6 roles.
  Round to sensible px values (keep ratios). Record weight, line-height and case per role.
- **Spacing:** page margin = the min `x` of content shapes (and `1920 - max(x+w)`); the top/bottom chrome
  from header/footer placeholders; gutters from the gaps between columns.
- **Layout archetypes:** cluster the slides by `layout` and by the arrangement of their shapes: cover,
  section divider, title + body, two columns, image + text, big number, table, quote, closing. One archetype
  = one slide in `template.html`.
- **Signature moves:** things that repeat across slides (the master's bar, a rule, a number badge, a colour
  block, rounded corners, shadows). These go to `### Signature Treatments`.
- **Depth:** `shadow` gives blur, distance and angle (a CSS `box-shadow` is `dist*cos(angle) dist*sin(angle) blur color`); reflection, glow and soft edge are not reproduced: say so in `## Known Gaps`.
- **Layouts fewer than 8:** extend inside the system (see `design-md.md`), marking the added ones `(extended)`.
- **Design images (kept by default):** slide, layout and master backgrounds, full-bleed cover or section photos, and decorative textures or patterns. Find them with `media[].usedBy` (entries naming a slide, layout or master background, or a picture or image fill that covers the whole slide or repeats as a pattern) and copy the file from `media/`. They are part of the design and the user's own image (personal use). Embed them in `template.html` as `data:` URIs, downscaled to the size they are shown at (max 1920px wide for full-bleed): JPEG at about quality 80 for photos, PNG only for images that need alpha. Convert locally with Python Pillow if available, else `sips` (macOS) or ImageMagick (`magick` / `convert`); if none exists, embed the original bytes and say so. Show with CSS `background-image` or `<img>`; a source overlay (for example a 71% black mask: a semi-transparent shape on top of the picture, see `fill.alpha`) is a separate layer above it. Aim for 3 MB or less for the whole template (the checker warns above 3 MB); downscale harder if it is exceeded. Declare each kept image in `design.md` (role, where used, size, "the user's own image, personal use"). If the user chose to drop background images, draw an approximation instead and note it in Known Gaps.
- **Logo and wordmark (kept by default, unless the user said "no logo"):** pictures in the master or layout chrome and small pictures on the cover or closing slide that carry the brand mark (look at their `name`, size and `usedBy`). Copy the file from `media/` and embed it as a `data:` URI at the source's position. A wordmark drawn as text in a proprietary font is kept as the original image if one exists in `media/`; otherwise reproduce it as text in the substitute font and note it in Known Gaps.
- **Content images (stand-ins by default):** pictures inside a content slide that illustrate the user's subject, people or products. Draw neutral photo slots in the palette. If the user chose to keep content photos too, copy these files from `media/` as well (downscaled, `data:` URI) as sample photos, list each in `design.md` (role, slide, size) and mark the template "personal use only, contains the source's photos".
- **What not to take:** the user's text, names, numbers and charts' data (and content photos unless asked). Layout and styling only. In the final report list the images kept (design images, logo, sample photos) and the images turned into stand-ins.
