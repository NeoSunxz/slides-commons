# sources-meta/guizang

slides-commons data for the templates taken from [op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill)
(Guizang PPT Skill by 歸藏 / op7418), which is licensed under the **AGPL-3.0**
(see `upstream/guizang/LICENSE`). The upstream is a read-only git submodule and has no
per-template metadata, screenshots or demo slides, so they live here. `sources.json`
(`overlay` of the `guizang` source) maps each slug to the upstream files.

- `<slug>.json`: template metadata (written for slides-commons from the author's README and SKILL.md).
- `demo/<slug>.slides.html`: demo slides for the gallery preview, inserted into the author's template at build
  time. The upstream template ships without a complete demo deck. They are adapted from the author's layout
  skeletons and are therefore licensed under the AGPL-3.0 as well.
- `screenshots/<slug>-<n>.png`: written by `npm run screenshots` (rendered from the same preview page).

Nothing in `upstream/` is modified. The pack zips and the preview copies are built from the upstream
files by `scripts/build.mjs`; the preview copies carry the modifications listed on each detail page.
