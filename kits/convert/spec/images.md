# Working from images

Screenshots, exported slides, photos of slides and, often, screenshots of **websites or phone captures**. An
image gives approximations only (see the accuracy note in the prompt). Everything below is done locally.

## Design images vs content photos

| Group | What it is | Default |
|---|---|---|
| **Design images** | Full-bleed or hero background photos, textures and patterns, section-divider photos: they set the mood and would be there whatever the content is. | **Kept** (personal use) |
| **Logo and wordmark** | The source's logo mark and its name set as a logo. | **Kept** (if at least about 48px in the source, see below), unless the user says "no logo" |
| **Content photos** | Photos inside cards, avatars, product and people pictures, screenshots of a product: they illustrate the source's subject. | **Stand-ins**: a neutral photo slot in the palette |

If a picture could be either (a big photo beside the text), ask: does the slide still make sense without it,
with a different photo? Then it is content.

When the user chooses to keep content photos too, they are **sample photos**: list each in `design.md` (role,
slide, displayed size) and mark the template "personal use only, contains the source's photos". The deck prompt
then tells the agent to reuse them only if the user wants to.

**Small logos.** Keep a logo crop only if it is at least about 48px in the source. A smaller mark: redraw it as
simple SVG when the shape is simple (a circle, a letter, a few strokes); otherwise keep the crop at its real size
(do not enlarge it). Note either choice in Known Gaps.

## Cropping pixels out of the user's screenshots

Allowed for every kept image (design image, logo, sample photo).

- Crop at **native resolution**: cut the rectangle out of the original image file and do not resample it up.
  Never resample a crop up. Downscale only to the size it is displayed at (JPEG about quality 80, PNG only when it
  needs alpha), then embed as a `data:` URI. Showing a native crop larger via CSS is allowed (no resampling), but
  above about 2x it looks soft: with phone screenshots most crops are shown larger than their pixels. List the soft
  crops in the final reply and ask for higher-resolution originals if the user has them.
- If the crop is small or soft (a 200 px avatar shown at 400 px, a logo with visible JPEG blocks), keep it anyway
  at its real size, or draw a stand-in, and **say in the final reply that the quality is low**.
- Crop to the picture's own edge: no UI chrome, no mouse pointer, no browser frame, no platform watermark.
- Use Python Pillow (`Image.crop`), ImageMagick (`magick in.png -crop WxH+X+Y out.png`) or `sips` on macOS. If none is
  available, embed whole files and say so.
- **Breakout images.** A subject that overlaps its card edge (a person standing out of a rounded card) goes in a
  separate cut-out layer (PNG with alpha) stacked above the card; the card itself is drawn in CSS.
- **Baked-in text.** Display type printed over a photo must be painted out of the crop, or covered by our live
  text; never leave both, or the words show twice.
- **Rounded corners.** Inset a crop 2-3px inside the source's rounded corners, so no fringe of the backdrop
  shows; apply the radius with CSS `border-radius`.
- Keep crops, colour samples and measurement notes in `<slug>-work/`. It may stay empty (a `.pptx` fills it with
  the extractor output; images may need nothing).

## Screenshots that are not 16:9 slides

A website screenshot, a portrait page or a phone capture is a design reference, not a slide. Work in this order.

1. **Find the page area.** Ignore everything around it: a grey or coloured backdrop, browser or phone chrome,
   status bars, scrollbars, and **platform watermarks** (a stock-site or screenshot-tool mark in a corner or over
   the picture). Do not copy watermarks into the template and do not sample colours from them.
2. **Measure against the page width.** Take the page's own width as the reference (for a phone capture, the
   screen width) and scale to 1920: `px = (measured / pageWidth) * 1920`. Then sizes, margins and gutters are
   proportional to the original, whatever the picture's pixel size. Measure the page width **for each image
   separately**, and when sections of one capture differ in scale (a zoomed-in part, a different device width), use
   a scale factor per screenshot or per section.
3. **Rebuild the vertical rhythm for 16:9.** A page scrolls; a slide does not. Keep the horizontal proportions, but
   do not stack the page's sections into one slide: give each section its own slide and fit it into 1080 px height
   with the page's spacing ratios (margin-to-text, gap-to-gap, title-to-body).
4. **Map web sections to slide archetypes:**

   | Web section | Slide archetype |
   |---|---|
   | Hero (headline, subline, button, big picture) | Cover |
   | Feature grid, three cards | Three-column cards / big-number grid |
   | Alternating image + text rows | Image + text |
   | List of items, pricing rows, FAQ | List rows or table |
   | Testimonial | Quote |
   | Logo strip, partner logos | Optional: a row of neutral stand-in logo slots, or leave out |
   | Stats band | Big number |
   | CTA band, footer | Closing |
   | Nav bar | Chrome (header) only if it repeats; otherwise drop |

   Buttons become plain shapes in the accent colour; hover states, carousels and animations are not converted
   (say so in "Known Gaps").
5. A portrait or phone capture is scaled the same way; a 9:16 layout becomes a centred column or a two-column
   slide. Do not letterbox a phone screen into the slide.

## Fonts from images

Judge the look (serif or sans, weight, width, contrast) and pick an open look-alike from `font-substitution.md`.
Name an **original** font only if the user confirms it or it is certain (for example the credit line reads
"Set in Neue Haas Grotesk"). Otherwise leave the original out of the font stacks and of `design.md`, and go
straight to the open font. A tight display grotesk with negative tracking is Inter Tight.
