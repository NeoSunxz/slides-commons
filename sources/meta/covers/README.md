# Cover overrides

`<source-id>/<slug>.png` is a 1920x1080 render of slide 1 of an upstream template, used by the
build as the card, home and detail thumbnail when the upstream ships no screenshot of its cover
(for example `zarazhangrui/soft-editorial`, whose screenshots start at slide 4).

These are slides-commons renders of third-party templates, made from the template's own
`template.html`. The rendered design remains the work of its upstream author and keeps the
upstream licence (MIT for `zarazhangrui`); they are not new works and carry no separate licence.

Create or refresh one with `npm run screenshots -- --cover-override <source-id>/<slug>`
(`scripts/cover-override.mjs`). The build fails if a file here names a template that does not exist
in its source, or is not 1920x1080.
