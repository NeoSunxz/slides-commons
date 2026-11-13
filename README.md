# slides-commons

**Open HTML slide templates with prompts, for coding agents.**

🌐 **Gallery:** https://neosunxz.github.io/slides-commons/ · [中文](https://neosunxz.github.io/slides-commons/zh/)

slides-commons is a static gallery of HTML slide templates. Each template comes with a ready-to-use prompt and a downloadable pack, so your own coding agent (Claude Code, Codex, Cursor, …) can build a new deck in that design — as a single, self-contained HTML file.

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
| `fonts/` | Latin web fonts (woff2) with their OFL licenses |
| `LICENSE-templates`, `LICENSE-skill` | Licenses of the upstream sources |

## Credits

The templates and design documentation are the work of [Zara Zhang](https://github.com/zarazhangrui), from [beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates) and [frontend-slides](https://github.com/zarazhangrui/frontend-slides) (both MIT). slides-commons is an independent community project, **not** an official project of the original author. Fonts are from [Fontsource](https://fontsource.org) under the SIL Open Font License. See [CREDITS.md](CREDITS.md).

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

## License

Site code: MIT © 2026 NeoSunxz and slides-commons contributors — see [LICENSE](LICENSE). Templates and fonts keep their own licenses (see above).

---

## 中文简介

**开放的 HTML 幻灯片模板库，配套提示词，交给你的 coding agent 使用。**

在[画廊](https://neosunxz.github.io/slides-commons/zh/)里预览模板，复制提示词，粘贴给你自己的 coding agent（Claude Code、Codex、Cursor 等）。agent 会自行下载素材包，问清你的演讲用途和内容，按该模板的设计系统生成一份单文件 HTML 幻灯片：固定 1920×1080 画布、自适应缩放，拉丁字体内嵌，离线可用。网络受限时也可以在网页上手动下载 zip。

模板与设计文档出自 [Zara Zhang](https://github.com/zarazhangrui) 的 MIT 开源项目；本项目是独立的社区项目，并非原作者官方项目。详见 [CREDITS.md](CREDITS.md)。
