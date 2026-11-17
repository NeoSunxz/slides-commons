# Community collection

Slide templates contributed to slides-commons by the community.

Unlike the other collections, **credit and license are per template**. Every template
lives in `templates/<slug>/` and carries its own:

- `template.json` with `authors` (name and URL) and `license`
- `LICENSE` with the full text of that license

Allowed licenses: MIT, Apache-2.0, CC-BY-4.0, CC0-1.0. The pack that visitors
download includes the template's own `LICENSE`, plus frontend-slides' `LICENSE`
(as `LICENSE-skill`) because the pack ships its `viewport-base.css`.

If a template adapts another template of the gallery, `template.json` sets
`derivedFrom: {source, slug}`; the detail page then credits both authors and the pack
also carries the original's license.

## Layout

```
templates/<slug>/template.html   demo deck, fixed 1920x1080 stage
templates/<slug>/template.json   metadata (slides-commons template schema)
templates/<slug>/design.md       design system for building new decks
templates/<slug>/LICENSE         license of this template
screenshots/<slug>-<n>.png       1920x1080 screenshots, exactly three per template
```

## Adding a template

See [CONTRIBUTING.md](../../CONTRIBUTING.md). Start with
`npm run new-template -- <slug>`.

## Templates

None yet. Yours could be the first.
