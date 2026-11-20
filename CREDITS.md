# Credits

slides-commons is an independent community gallery. It is **not** an official project of any of the authors below. All templates and design documentation remain the work of their original authors and are redistributed under their licenses.

## Upstream sources

| Source | Author | License | Used for |
|---|---|---|---|
| [beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates) | [Zara Zhang](https://github.com/zarazhangrui) | MIT (© 2026 Zara Zhang) | HTML slide templates, metadata, screenshots, per-template `design.md` (`upstream/templates`) |
| [frontend-slides](https://github.com/zarazhangrui/frontend-slides) | [Zara Zhang](https://github.com/zarazhangrui) | MIT (© 2025 Zara Zhang) | Fixed-stage `design.md` variants, `preview.md` style cards, `viewport-base.css`, generation workflow (`upstream/skill`) |
| [slides-commons Style Presets](https://github.com/NeoSunxz/slides-commons/tree/main/collections/style-presets) | NeoSunxz and slides-commons contributors | MIT | Full templates (layouts, demo content, `design.md`, screenshots) in `collections/style-presets` |
| [guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) | [歸藏 (Guizang)](https://github.com/op7418) | **AGPL-3.0** | 2 templates (`assets/template.html`, `assets/template-swiss.html`), `motion.min.js`, `SKILL.md` and `references/*.md` (`upstream/guizang`) |

Both are included as read-only git submodules under `upstream/`. Every downloadable template pack ships with the corresponding `LICENSE` files.

## Web fonts

Latin web fonts bundled in previews and template packs come from the [Fontsource](https://fontsource.org) npm packages (`@fontsource/*`, `@fontsource-variable/*`; packaging MIT-licensed by the Fontsource contributors). The fonts themselves are open source and unmodified. Most are under the SIL Open Font License 1.1; Yellowtail is under the Apache License 2.0. Each font's license and copyright holders are in the `OFL.txt` or `LICENSE.txt` shipped next to it (`fonts/<family>/` in every pack and on the site). CJK fonts also come from Fontsource (OFL-1.1, [fontsource.org](https://fontsource.org)), unmodified: Noto Sans SC, Noto Serif SC and Noto Sans JP (Google / Adobe, the Noto project authors); LXGW WenKai TC (The LXGW WenKai Project Authors); ZCOOL XiaoWei and ZCOOL KuaiLe (ZCOOL); Long Cang (Google Fonts). Packs carry only the embed script, a shard table and the licenses (`fonts/cjk-licenses/`); the font files themselves are downloaded on the visitor's request from this site or jsDelivr. Templates that use Fontshare fonts (Clash Display, Satoshi) load them from Fontshare (`api.fontshare.com`, `cdn.fontshare.com`); those fonts are not bundled and remain under the Fontshare license terms.

## Derivative collections

The Style Presets collection (`collections/style-presets`) is a derivative work. Its visual direction (fonts, colors and signature elements of each template) is based on the 12 presets in [`STYLE_PRESETS.md`](https://github.com/zarazhangrui/frontend-slides/blob/main/STYLE_PRESETS.md) of [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by [Zara Zhang](https://github.com/zarazhangrui) (MIT, © 2025 Zara Zhang). The layouts, demo content, extended tokens and `design.md` files were written by slides-commons contributors and are MIT licensed. These templates were not made, reviewed or endorsed by Zara Zhang. Their packs include this collection's `LICENSE`, frontend-slides' `LICENSE` (as `LICENSE-skill`) and `viewport-base.css` from frontend-slides.

## Convert kit and skills pack

The convert kit (`convert-kit.zip`) and the skills pack (`slides-commons-skills.zip`) are for personal reuse: they run locally and upload nothing. Both carry `viewport-base.css` from [frontend-slides](https://github.com/zarazhangrui/frontend-slides) by [Zara Zhang](https://github.com/zarazhangrui) (MIT, © 2025 Zara Zhang), with its `LICENSE` included as `LICENSE-skill`. They also include the Minimal Pitch example (written by this project, MIT) and the CJK font tooling (`embed-cjk.mjs`, shard table and licenses), whose fonts are credited in the Web fonts section above.

## Docker image

The optional Docker image (`Dockerfile`) is built on the official [nginx](https://hub.docker.com/_/nginx) image (BSD-2-Clause) and copies the [Node.js](https://nodejs.org/) binary (MIT) from the official `node` image. Neither is modified. The image contains this repository and its upstream submodules, so the notices above apply to it as well.

## html-ppt-skill (reference only)

[html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) by [lewis](https://github.com/lewislulu) (MIT) is included as the read-only git submodule `upstream/html-ppt-skill` for future reference material. None of its files are currently shown on the site or shipped in packs.

## Guizang PPT Skill

Templates `guizang-editorial` and `guizang-swiss` come from [guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) by [歸藏 (Guizang)](https://github.com/op7418), included as the read-only git submodule `upstream/guizang`.

- **License: AGPL-3.0 (copyleft).** Every pack ships the full text as `LICENSE`. Decks built from these templates may be derivative works and may have to be released under the AGPL-3.0. This is general information, not legal advice.
- Used files: `assets/template.html`, `assets/template-swiss.html`, `assets/motion.min.js`, `SKILL.md` and the `references/*.md` listed in `sources.json`, unmodified in the packs. The site preview is a modified copy (paging bridge, self-hosted fonts, demo slides); the modifications are published in this repository.
- Third-party code inside the upstream template: Motion (`motion.min.js`, MIT, https://motion.dev); Lucide (ISC), which the packs do not load.
- Metadata (`sources-meta/guizang/*.json`), demo slides and screenshots were written by slides-commons from the author's README and SKILL.md; the demo slides are adapted from the author's layout skeletons and are therefore also AGPL-3.0. They were not made or endorsed by the author.

## Derived content

The prompts (`PROMPT.md`) generated by slides-commons are derived from the workflows in the upstream `AGENTS.md` and `SKILL.md`.

## slides-commons

Site code (build scripts, pages, styles, tests) © slides-commons contributors, MIT — see [LICENSE](LICENSE).
