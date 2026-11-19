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
| `colorsUsed` | colours really used by the slides (fills, lines, text), most important first. `fillArea` is the share of an average slide that colour covers; the biggest is the background |
| `masters`, `layouts` | the master and layouts: background, text styles (title/body sizes), decoration shapes that repeat on slides |
| `slides[]` | per slide: `layout`, `background`, `shapes[]`, `notes` |
| `media` | images in the file with pixel size, bytes and which slide uses them |
| `warnings` | what the tool could not convert (charts, SmartArt, animations, EMF, embedded fonts, ...) |

A **shape** has `kind` (`placeholder`, `text`, `shape`, `picture`, `group` (with `children`), `table`, `chart`,
`smartart`, `line`, `other`), `name`, `x y w h` (px), optional `rotation`, `geometry` (`rect`, `roundRect`,
`ellipse`, ... or `custom`), `fill` (`solid` / `gradient` with stops / `image` / `none`; `viaStyle: true` means
the colour came from the shape's theme style), `line` (colour, `width` px), `shadow`, `placeholder` (`title`,
`body`, `ftr`, `sldNum`, ...), `text` and `image`. `text.paragraphs[].runs[]` carry `size` (px), `bold`, `italic`,
`color`, `font.latin/ea/cs` (theme references already resolved), plus paragraph `align`, `bullet`, `lineHeight`.

## From data to a design

- **Palette:** take the background (largest `fillArea`, or `slides[].background`), the main text colour (most
  `textCharacters`), the accent (theme `accent1`, or the strongest non-neutral in `colorsUsed`), and 2-3
  supporting neutrals. 6-10 named colours is enough. Do not keep unused theme slots.
- **Type scale:** group `runs[].size` of the title placeholder, other headings, body, captions into 5-6 roles.
  Round to sensible px values (keep ratios). Record weight, line-height and case per role.
- **Spacing:** page margin = the min `x` of content shapes (and `1920 - max(x+w)`); the top/bottom chrome
  from header/footer placeholders; gutters from the gaps between columns.
- **Layout archetypes:** cluster the slides by `layout` and by the arrangement of their shapes: cover,
  section divider, title + body, two columns, image + text, big number, table, quote, closing. One archetype
  = one slide in `template.html`.
- **Signature moves:** things that repeat across slides (the master's bar, a rule, a number badge, a colour
  block, rounded corners, shadows). These go to `### Signature Treatments`.
- **What not to take:** the user's text, names, numbers, photos, logos and charts' data. Layout and styling only.
