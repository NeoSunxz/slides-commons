# slides-commons

**Open HTML slide templates with prompts, for coding agents.**

🌐 **Site:** https://neosunxz.github.io/slides-commons/ · [Gallery](https://neosunxz.github.io/slides-commons/gallery/) · [中文](https://neosunxz.github.io/slides-commons/zh/)

slides-commons is a static site with an introduction and a separate gallery of HTML slide templates. Each template comes with a ready-to-use prompt and a downloadable pack, so your own coding agent (Claude Code, Codex, Cursor, …) can build a new deck in that design — as a single, self-contained HTML file.

## How to use

1. **Browse** the gallery and preview a template (arrow keys, wheel or buttons to page through).
2. **Copy the prompt** from the template page and paste it into your coding agent.
3. The agent **downloads the pack** itself (or download the zip and put it in your working folder), asks about your talk, and builds the deck.

The result is one HTML file on a fixed 1920×1080 stage that scales to any screen, with the Latin fonts embedded so it also works offline.

## What's in a pack

| File | Purpose |
|---|---|
| `PROMPT.md` / `PROMPT.zh.md` | The same prompt as on the website (English / Chinese) |
| `design.md` | The full design system: colors, type, layouts, rules |
| `template.html` | Reference implementation of the template |
| `viewport-base.css` | Fixed-stage base styles, inlined into the generated deck |
| `fonts/` | Bundled Latin web fonts (woff2) with their licenses; Fontshare fonts remain remote |
| `LICENSE` or `LICENSE-templates`, `LICENSE-skill` | Applicable template and companion licenses |

## Credits

The gallery includes 34 templates by [Zara Zhang](https://github.com/zarazhangrui) and 16 Style Presets templates by NeoSunxz and slides-commons contributors (12 derived from Zara Zhang's visual presets, four original). All templates are MIT licensed. slides-commons is an independent community project, **not** an official project of the original authors. Font licenses and source details are listed in [CREDITS.md](CREDITS.md).

## Development

Requires Node.js 22 or later.

```sh
git clone --recurse-submodules git@github.com:NeoSunxz/slides-commons.git
cd slides-commons
npm ci
npm run build      # build the site into site/
npm run serve      # http://localhost:4173/
npm run validate   # check template metadata, licenses and links
npm test           # Playwright tests (run `npx playwright install chromium` first)
```

Upstream templates live in read-only git submodules under `upstream/`. Development happens on the `dev` branch; `main` holds released versions and is deployed to GitHub Pages.

The desktop homepage uses five equal viewport chapters below a shared 72px sticky navigation bar, with contrasting backgrounds and scroll-linked whole-panel stacking. A wheel gesture moves one chapter, without snap-back or letting trackpad momentum enter the carousel. Navigation follows the current chapter's palette. Mobile, reduced-motion settings, enlarged content and disabled JavaScript use natural document flow. The separate gallery does not load homepage animations.

The build embeds the two small Latin interface fonts in the shared stylesheet, avoiding a second font download and late font replacement when switching languages. Chinese text uses the local system font stack. English and Chinese hero titles share line-box geometry with optically adjusted font sizes, while navigation keeps consistent sizing across languages. Template preview fonts and download packs are unchanged.

Chapter 01 pairs the headline with a dense four-column animated wall of 16 template styles; reduced motion keeps it static. Chapter 02 has a centered, layered 16-template carousel with 4.5-second autoplay, arrows, keyboard, mobile swipes and wheel navigation over the cards. Scrolling outside the cards continues through the page. Autoplay pauses on hover, keyboard focus, hidden tabs, offscreen chapters and reduced motion; a pause control is also provided. Chapter 05's arrow follows the pointer continuously through full rotations, unless reduced motion is enabled. Chapter 04 and the credits page share a pink surface and a progressive cross-document view transition; unsupported browsers use normal navigation. All pages share the same gutters and navigation geometry. Gallery search sits beside the title and introduction, with source and mood filters behind “More filters”. Detail pages balance a 16:9 preview with a wider action panel. Homepage and credits footers stay compact; licenses remain in the credits, detail pages and download packs.

Detail pages use an aligned preview-and-controls workspace beside a compact action panel. The complete 16:9 preview and its controls fit the initial desktop viewport when space allows. Design descriptions span the content width below the workspace, with metadata and visual specifications arranged in separate columns; the action panel stays within the workspace while scrolling. Mobile layouts return to a single reading column.

## License

Site code: MIT © 2026 NeoSunxz and slides-commons contributors — see [LICENSE](LICENSE). Templates and fonts keep their own licenses (see above).

---

## 中文简介

**开放的 HTML 幻灯片模板库，配套提示词，交给你的 coding agent 使用。**

在[画廊](https://neosunxz.github.io/slides-commons/zh/gallery/)里预览模板，复制提示词，粘贴给你自己的 coding agent（Claude Code、Codex、Cursor 等）。agent 会自行下载素材包，问清你的演讲用途和内容，按该模板的设计系统生成一份单文件 HTML 幻灯片：固定 1920×1080 画布、自适应缩放，拉丁字体内嵌，离线可用。网络受限时也可以在网页上手动下载 zip。

画廊包含 [Zara Zhang](https://github.com/zarazhangrui) 的 34 套模板，以及社区新增的 16 套模板（12 套基于其视觉预设衍生，4 套原创），均采用 MIT 许可。本项目是独立社区项目，并非原作者官方项目。详见 [CREDITS.md](CREDITS.md)。
