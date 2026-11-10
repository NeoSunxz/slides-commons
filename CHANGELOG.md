# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

M1 (single template `neo-grid-bold`) is built and tested; it awaits the maintainer's hands-on acceptance before release.

### Added

- `sources.json` declaring upstream sources; M1 includes only `neo-grid-bold` from beautiful-html-templates, with frontend-slides as companion.
- `scripts/build.mjs`: validates template metadata against `src/schema/template.schema.json`, injects `source` / `license` / `authors`, and generates `site/` (gallery card and detail page).
- Detail page with a sandboxed preview iframe, Prev/Next and arrow-key paging (1/12) via a postMessage bridge in a build-time preview copy, plus a fix so `<deck-stage>` inherits the template font.
- Copy-prompt buttons (English and Chinese), byte-identical to `PROMPT.md` / `PROMPT.zh.md` in the zip.
- Downloadable template pack: `template.html`, `deck-stage.js`, fixed-stage `design.md`, `viewport-base.css`, `LICENSE-templates`, `LICENSE-skill`, `PROMPT.md`, `PROMPT.zh.md`, `README.md`. Zips are reproducible (fixed 1980-01-01 timestamps, or `SOURCE_DATE_EPOCH`).
- `--sources` / `--out` options (and `SC_SOURCES` / `SC_OUT`), with a guard that refuses to clear an output directory lacking the `.slides-commons-build` marker.
- `scripts/serve.mjs` static server, bound to `127.0.0.1:4173` by default.
- Playwright test suite (39 tests) covering the site, the zip, stage overflow and fixture builds.
- `LICENSE` (MIT) and `CREDITS.md` attributing upstream authors.
