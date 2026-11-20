# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2026-11-20

### Changed

- Convert and Skills pages redesigned: visual hero, step flow, comparison cards, file tree with thumbnails, install tabs with copy buttons, collapsed details, and about a third of the old copy.
- The header follows the section colour on the kit pages (shared `header-theme.js`, also used by the home page); compact mobile header.
- Compact site footer: brand, disclaimer, authors with repo links and licence tags, and a Credits link; secondary links moved to the Credits page.
- Converted personal templates list the source's original font names first in the font stack, then the open replacement.

### Fixed

- Tests ignore the browser's aborted cross-document view transitions; the flaky file-mode test is stable.

## [0.4.0] - 2026-11-19

### Added

- Private template sources (planned for v0.4.0): `--extra-sources` / `SC_EXTRA_SOURCES` / `sources.local.json`, `private: true` sources with an internal-use prompt line and `NOTICE.txt`, `--only-sources`, `--no-kits`, `nameZh` and per-source `i18n/zh.json`, `new-template --source-dir`, and the starter repo `examples/private-source/`.
- Self-hosting guide in English and Chinese (`docs/self-hosting.md`, `docs/self-hosting.zh.md`).
- Docker image (builds the gallery at start-up, serves it with nginx), `docker-compose.example.yml`, and a workflow that smoke-tests PR builds and publishes to GHCR on tags.
- Convert kit: `embed-latin.mjs`, richer extractor fields and font-map additions; design images (backgrounds, cover photos) are kept by default.
- Tests for private sources, embed-latin, kits guard, rich pptx and Docker (opt-in via `SC_DOCKER_TESTS=1`); `SC_NO_LOCAL_SOURCES` for the Playwright config.
- Convert kit and skills collection: pages `convert/` and `skills/` (EN and zh) with header links. `site/zip/convert-kit.zip` ships `pptx-extract.mjs`, `check-template.mjs`, spec, font map, deck prompts and `embed-cjk`; `site/zip/slides-commons-skills.zip` ships `slides-commons-deck`, `slides-commons-convert` and `slides-commons-cjk-fonts`. For personal reuse: turn your own PPT or images into a template locally, nothing is uploaded.
- Tests for the kits (`tests/kits.spec.mjs`, `tests/pptx-fixture.mjs`).
- Prompt: CJK span selector and flex-spacing pitfalls, CJK weights apply to CJK runs only, clearer section-number wording, note that Google Fonts failing offline is expected.
- `embed-cjk.mjs` reports shard counts per download source.

### Changed

- Pages workflow zip count includes kits and checks the new pages.

### Fixed

- Home: mobile chapters are at least one screen tall (`svh`).
- Style Presets / Consulting Report: no cross-template reference, own line-chart pattern, delta annotation gutter, CJK weights scoped to `.cjk`, Noto Serif SC 700 only, CJK labels at least 20px, cover omission rules, section ordinals, child span selectors, percentage-point style.

## [0.3.1] - 2026-11-19

### Fixed

- Arrows (↗ and ✓/✕) no longer render as emoji on iOS: card and button arrows are inline SVG (`arrowIcon()` in `src/pages.mjs`), the card-title arrow is a CSS mask, and ✓/✕ carry U+FE0E.

## [0.3.0] - 2026-11-19

### Added

- CJK font embedding: packs ship `fonts/embed-cjk.mjs` (zero-dependency Node script), `fonts/cjk-ranges.json` and `fonts/cjk-licenses/`. It embeds the Fontsource unicode-range shards a deck uses as base64 `@font-face` (site `fonts/cjk/` first, then jsDelivr), subsets with `pyftsubset` when available, verifies cmap coverage and keeps the Google link as fallback.
- When a site URL is set, the build hosts the CJK shards at `site/fonts/cjk/` (about 67MB); seven `@fontsource` CJK packages added as devDependencies.
- Tests for CJK embedding (`tests/cjk-embed.spec.mjs`).
- New home page and a separate gallery page (`gallery/`) with a license filter and 12 mood groups (`src/tags.json`; original tags remain searchable).
- GitHub icon in the header; footer lists every source with author and license plus a shortened disclaimer.
- Overlay sources (`scripts/overlay.mjs`, `sources-meta/`): Guizang PPT Skill by 歸藏 (AGPL-3.0, read-only submodule `upstream/guizang`) adds 2 templates, with AGPL notices on the card, detail page, prompt, pack README and credits.
- Reference-only submodule `upstream/html-ppt-skill` (lewislulu); no templates in the gallery.
- Tests for the home page, redesign, Guizang source and validation.

### Changed

- Prompt: new "Embed the CJK fonts" step, an explicit exception for `fonts/embed-cjk.mjs` to the "pack is data" rule, trimming the CJK link to the families and weights actually used, and a TC-face rule for Simplified Chinese decks (8 LXGW WenKai TC templates).
- Detail page rework: collapsible description, good-for/avoid-for cards, palette strip with hover values, typography specimen, screenshot click jumps to the preview, attribution card. Author label is now NeoSun.
- Prompt: balanced density option and a CJK line-wrap hint.
- Four business templates in Style Presets revised (design.md, template.html, screenshots).
- Chinese translations updated.

## [0.2.0] - 2026-11-17

### Added

- Style Presets collection (16 templates): 12 based on frontend-slides STYLE_PRESETS.md by Zara Zhang, and 4 original white-background business templates (consulting-report, boardroom-quarterly, minimal-pitch, tech-blue-business).
- Source filter in the gallery.
- `npm run screenshots` to generate template screenshots.
- `site/manifest.json` listing the built templates.
- Fontshare fonts are allowed for neon-cyber.
- Chinese translations for all new templates.
- Community collection for contributed templates, with per-template authors and license.
- `npm run new-template` scaffolds a new template.
- Strict checks for collection templates.
- CI guard job for pull requests.
- Issue and PR templates, and CONTRIBUTING.md (EN/中文).
- Latin web fonts are now self-hosted (Fontsource, SIL OFL 1.1): previews no longer need Google Fonts for Latin text.
- Each pack ships `fonts/` (woff2 files, `OFL.txt`, `fonts.css`).
- The prompt asks the agent to embed Latin fonts as base64 so decks work offline. CJK fonts still come from Google Fonts.

### Changed
- Gallery filter is now by author (Zara Zhang, slides-commons, contributors) instead of by source; the hash key is `author=`.
- On the published site the zip download is a small "Offline? Download the pack (.zip)" link under Copy prompt; prompts quote the label the page shows.
- Prompts give each template's concrete `--slide-bg` value from its design.md (41 of 50; the rest keep the generic rule).
- Swiss Modern cover: the lone red circle is replaced by a top-right quarter circle with a black square.

- Gallery cards have equal heights, two-line taglines and a one-line credit.
- Own templates are credited as "slides-commons".
- Detail pages wrap cleanly on narrow screens.
- Pages check counts templates from the manifest instead of a hard-coded number.
- The raw-grid prompt quotes its Noto Sans SC link for CJK text.
- The prompt quotes a CJK-only Google Fonts link.
- CJK family detection now covers ZCOOL, LXGW, Long Cang and similar families.
- The prompt asks the agent to list any legibility deviations from design.md.
- Prompt now drafts missing content itself instead of leaving placeholders, and lists every drafted item in the final reply.
- When design.md contradicts itself, the prompt tells the agent to follow the stricter rule.
- On the published site the usage steps are now "copy the prompt, paste it into your coding agent (it downloads the pack), answer its questions". Copy prompt is the primary button and the zip download is an offline fallback.
- The pack README lists font licenses per family (Yellowtail is Apache 2.0).
- Collection prompts include signature moves taken from design.md.
- The Chinese prompt names the Chinese download button.
- The CJK font-weight rule in the prompt now overrides design.md.
- QR codes and links are only used when the user supplied a real link.
- Section numbers must match page numbers.
- `--slide-bg` wording clarified: it is the canvas background, not the panel color.
- Unzip fallback order is now unzip, python, tar, Expand-Archive.

## [0.1.0] - 2026-11-12

First public release (milestones M1 to M3): a static gallery of 34 HTML slide templates, each with a live preview, a copy-ready prompt and a downloadable pack for your own coding agent.

### Added

- Gallery of all 34 templates from beautiful-html-templates, with search and filters, and attribution linking back to the upstream author and repository.
- English site at the root and Chinese site under `zh/`, with a language switch. Pages never mix languages. Template data has Chinese translations on the Chinese site.
- Detail page with a scaled preview next to a "Use this template" panel, Prev/Next and arrow-key paging, mouse-wheel capture, fullscreen, and open in new tab. Paging works for deck-stage, class-based and geometry-based decks through a postMessage bridge in a build-time preview copy; upstream files stay untouched. Previews also work when opened from `file://`.
- Copy-prompt buttons in English and Chinese, byte-identical to `PROMPT.md` / `PROMPT.zh.md` in the pack. Prompt rules were refined through simulated end-user runs (fresh agent, empty directory, only the zip and prompt), covering unzip fallbacks, headless environments, CJK fonts and line breaks, density, accent contrast and cross-platform open commands. Maintainer acceptance of M1 and M2 is complete.
- Per-template prompt exceptions for templates that need system fonts or a chart library CDN.
- Downloadable pack per template: `template.html`, `deck-stage.js` (when used), skill-edition `design.md`, `viewport-base.css`, `LICENSE-templates`, `LICENSE-skill`, `PROMPT.md`, `PROMPT.zh.md` and `README.md`. Zips are reproducible (fixed 1980-01-01 timestamps, or `SOURCE_DATE_EPOCH`).
- Optional `SC_SITE_URL` setting so prompts can auto-download the pack from the deployed site.
- `npm run validate`: metadata schema checks, slug de-duplication and attribution checks.
- Build options `--sources` / `--out` (and `SC_SOURCES` / `SC_OUT`), with a guard that refuses to clear an output directory lacking the `.slides-commons-build` marker.
- `scripts/serve.mjs` static server, bound to `127.0.0.1:4173` by default.
- GitHub Actions: CI on pull requests (`validate + test`) and a GitHub Pages deployment workflow, with all actions pinned to commit SHAs.
- Playwright test suite covering all 34 templates, gallery, packs, prompts, language trees, scaling, wheel, file:// mode, fixture builds and workflow checks.
- `LICENSE` (MIT), `CREDITS.md` and devcontainer for Codespaces.

### Changed

- Detail page keeps the original two-column layout (preview left, panel right).
- Chinese pages keep "coding agent" in English.

### Fixed

- `<deck-stage>` previews now inherit the template font.
- Preview no longer breaks when the site is opened by double-clicking (`file://`); directory links resolve to `index.html`.
- Test suite is deterministic: Google Fonts responses are cached and fixed waits were replaced by condition-based waits.

[Unreleased]: https://github.com/NeoSunxz/slides-commons/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/NeoSunxz/slides-commons/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/NeoSunxz/slides-commons/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/NeoSunxz/slides-commons/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/NeoSunxz/slides-commons/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/NeoSunxz/slides-commons/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/NeoSunxz/slides-commons/releases/tag/v0.1.0
