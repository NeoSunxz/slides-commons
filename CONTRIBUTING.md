# Contributing to slides-commons

Thanks for helping. slides-commons is an open gallery of HTML slide templates with prompts for coding agents. **A prompt that works and a zip that runs outright matter more than gallery looks.** Chinese version: [贡献指南](#贡献指南) below.

## Ways to contribute

- **Report a bug** (site, preview, pack): open a *Bug report* issue.
- **Give prompt feedback**: a prompt confused your agent, or the deck it made was off. Open a *Prompt or agent-output feedback* issue with the template slug, the agent you used, what happened, and the deck if you can share it. This is the most useful kind of report.
- **Add a template**: see [Adding a template](#adding-a-template). Propose it in a *New template proposal* issue first if you want feedback on the direction.
- **Translate**: the Chinese text of each template's tagline, description, best-for and avoid-for lives in `src/i18n/zh.json` (reviewable data, not machine translation at runtime). Fix wording by pull request.

## Development setup

Needs Node.js 22 or later.

```sh
git clone --recurse-submodules git@github.com:NeoSunxz/slides-commons.git
cd slides-commons          # already cloned without submodules? git submodule update --init
npm ci
npx playwright install chromium   # for npm test (add --with-deps on a fresh Linux box)

npm run build      # site/
npm run serve      # http://localhost:4173/
npm run validate   # metadata, licenses, links, collection rules
npm test           # Playwright suite (a few minutes)
```

If `/tmp` is small (tmpfs), run the tests with another temp dir, e.g. `TMPDIR=$HOME/.cache/sc-tmp npm test`. On Windows PowerShell: `$env:TMPDIR="$HOME\.cache\sc-tmp"`.

`upstream/` holds read-only git submodules (third-party content). Never edit it.

## Adding a template

Community templates live in `collections/community/templates/<slug>/` and are credited to you personally.

1. **Scaffold.** `npm run new-template -- my-template-slug` (lowercase, hyphens; unique in the gallery) creates `template.json`, `design.md`, `template.html` and `LICENSE` in `collections/community/`. Every spot you must decide is marked `TODO`, and `npm run validate` fails until none is left.
2. **Design.** Build the demo deck in `template.html` (rules below) and write `design.md` so an agent can build *new* decks in this style: colors, type scale, layout, signature moves, components, slide archetypes, do's and don'ts.
3. **Metadata.** Fill in `template.json`: name, tagline, mood, occasion, tone, formality, density, palette, typography, scheme, best_for, avoid_for. Set `authors` (`name` plus a profile `url`) and `license`. If your template adapts another template of this gallery, add `"derivedFrom": {"source": "<source id>", "slug": "<slug>"}`.
4. **Screenshots.** `npm run screenshots -- --only my-template-slug` writes exactly three PNGs (first, middle, last slide) at 1920×1080 to `collections/community/screenshots/`. Re-run it after every change to `template.html`.
5. **Chinese text.** Add your template to `src/i18n/zh.json` (a missing translation only warns, but please provide one). Maintainers run `npm run i18n:sync` once a translation is confirmed.
6. **Check.** `npm run validate`, `npm run build` (no warnings), `npm test`. Open the built preview and page through it with the keyboard and the mouse wheel.
7. **Pull request** to `dev` (see below).

`npm run validate` enforces for community and other in-repo templates:

- `design.md` front matter has a `description`, and headings (any level) for the fixed-stage policy, CJK, and Signature Moves / Treatments / Elements;
- `template.html` is at most 1.5 MB and uses no `<img>` or raster files (embedded raster `data:` URIs at most 200 KB in total; use CSS and inline SVG);
- exactly 3 PNG screenshots named `<slug>-1.png` to `-3.png`, 1920×1080, at most 1.5 MB each;
- `authors` (each with a URL) and an allowed `license`, with a matching `LICENSE` file in the template directory;
- no leftover `TODO`, a valid and unique slug, a valid `derivedFrom` target, no requests to hosts outside the font and chart CDN allow-list.

## Design rules

- **One HTML file, fixed 1920×1080 stage**, scaled as a whole to the window (inline `viewport-base.css` from `upstream/skill`, unchanged). Phones get bars, not reflow.
- **Paging** works with arrow keys, space, PgUp/PgDn, Home/End, click and swipe, and the mouse wheel (one slide per gesture). The page counter follows the slide. `.slide` elements with the `.active` class are the convention the preview and the screenshot script rely on. The scaffold has all of this.
- **Fonts:** Google Fonts families that are also on [Fontsource](https://fontsource.org) (they are bundled for offline use), or Fontshare as an exception. No other font hosts. CJK text loads Noto fonts from Google Fonts.
- **No raster images, photos, logos, brands or real people.** Abstract shapes only: CSS, inline SVG, gradients.
- **Demo content is fictional**: invented company, people and numbers.
- **CJK:** `design.md` needs a CJK section (font pairing, weights, line height), and the deck should still look right with Chinese text.
- No external scripts except a pinned chart library from jsDelivr if truly needed.
- Keep text inside its box and panels from overlapping at 1920×1080. Body text should stay legible (aim for 24 px or more).

## Licensing and credit

- Submit only your own work, or work whose license allows redistribution. You keep your copyright.
- Allowed licenses: **MIT, Apache-2.0, CC-BY-4.0, CC0-1.0**. Include the full text as `LICENSE` in the template directory. The download pack ships it.
- If you adapt another template (from this gallery or elsewhere), credit it: use `derivedFrom` for gallery templates (the detail page then shows both authors and the pack carries the original license), and say so in `design.md` and the `template.html` header otherwise. The original author must not be presented as having made or endorsed your version.
- Never imply that slides-commons or your template is an official project of another author.
- The packs also contain `viewport-base.css` from frontend-slides (MIT, Zara Zhang) with its license; that is automatic.

## Branches and commits

- Fork, branch from `dev`, and open the pull request **against `dev`**. `main` is only updated by release pull requests from `dev`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat(templates): add neon-harbor`, `fix: ...`, `docs: ...`).
- Do not commit `site/`, `node_modules/` or anything under `upstream/`.

## Review

CI runs `validate + test` and a guard that rejects changes to `upstream/` and flags edits to other sources' templates. A maintainer then checks the license and credit, the design rules above, the preview in a browser (paging, wheel, narrow window), the Chinese text, and runs the pack with a coding agent when the template is new. Expect comments; small fixes are normal. Merged template PRs ship with the next release.

By contributing you agree your contribution is under the license you declared for it (code and docs in this repository: MIT).

---

# 贡献指南

感谢参与。slides-commons 是开放的 HTML 幻灯片模板库，配套提示词，面向 coding agent。**提示词好不好用、zip 能否直接跑通，优先级高于画廊视觉效果。**

## 贡献方式

- **报告 bug**（网站、预览、素材包）：提 *Bug report* issue。
- **提示词反馈**：提示词让你的 agent 困惑，或生成的幻灯片不对。提 *Prompt or agent-output feedback* issue，写明模板 slug、所用 agent、发生了什么，能分享的话附上成品。这是最有价值的反馈。
- **新增模板**：见下文「新增模板」。想先确认方向，可先提 *New template proposal* issue。
- **翻译**：每个模板的 tagline、description、best_for、avoid_for 中文版放在 `src/i18n/zh.json`（可审阅的固定数据，运行时不机翻）。欢迎提 PR 改措辞。

## 开发环境

需要 Node.js 22 及以上。

```sh
git clone --recurse-submodules git@github.com:NeoSunxz/slides-commons.git
cd slides-commons          # 克隆时没带子模块：git submodule update --init
npm ci
npx playwright install chromium   # 跑 npm test 需要（全新 Linux 加 --with-deps）

npm run build      # 生成 site/
npm run serve      # http://localhost:4173/
npm run validate   # 校验元数据、协议、链接、合集规则
npm test           # Playwright 测试（几分钟）
```

`/tmp` 太小（tmpfs）时换临时目录，如 `TMPDIR=$HOME/.cache/sc-tmp npm test`；Windows PowerShell：`$env:TMPDIR="$HOME\.cache\sc-tmp"`。

`upstream/` 是只读的 git 子模块（第三方内容），不要修改。

## 新增模板

社区模板放在 `collections/community/templates/<slug>/`，署名为你本人。

1. **脚手架**：`npm run new-template -- my-template-slug`（小写字母加连字符，全库唯一），会在 `collections/community/` 生成 `template.json`、`design.md`、`template.html`、`LICENSE`。所有要你决定的地方都标了 `TODO`，没清掉前 `npm run validate` 会失败。
2. **设计**：在 `template.html` 里做演示幻灯片（规则见下），并写 `design.md`，让 agent 能按这个风格做*新的*幻灯片：配色、字号、版式、标志性手法、组件、页面类型、该做与不该做。
3. **元数据**：填写 `template.json`：name、tagline、mood、occasion、tone、formality、density、palette、typography、scheme、best_for、avoid_for。设置 `authors`（`name` 加个人主页 `url`）和 `license`。如果改编自画廊里的其他模板，加 `"derivedFrom": {"source": "<来源 id>", "slug": "<slug>"}`。
4. **截图**：`npm run screenshots -- --only my-template-slug` 会在 `collections/community/screenshots/` 生成恰好三张 1920×1080 的 PNG（首页、中间页、末页）。每次改动 `template.html` 后重新生成。
5. **中文译文**：把模板加入 `src/i18n/zh.json`（缺译文只会告警，但请补上）。译文确认后由维护者运行 `npm run i18n:sync`。
6. **自检**：`npm run validate`、`npm run build`（无告警）、`npm test`；在构建出的预览里用键盘和滚轮翻页看一遍。
7. **提 PR** 到 `dev`（见下）。

`npm run validate` 对社区及其他仓库内模板强制检查：

- `design.md` 前置信息有 `description`，并有固定画布规则、CJK、Signature Moves / Treatments / Elements 三类标题（任意级别）；
- `template.html` 不超过 1.5 MB，不用 `<img>` 或位图文件（内嵌位图 `data:` URI 合计不超过 200 KB；请用 CSS 和内联 SVG）；
- 恰好 3 张 PNG 截图，命名 `<slug>-1.png` 到 `-3.png`，1920×1080，每张不超过 1.5 MB；
- `authors`（每位都有链接）、允许的 `license`，以及模板目录中与之匹配的 `LICENSE` 文件；
- 不留 `TODO`，slug 合法且唯一，`derivedFrom` 指向存在的模板，不请求字体与图表 CDN 白名单之外的主机。

## 设计规则

- **单个 HTML 文件，固定 1920×1080 画布**，整体缩放适应窗口（原样内联 `upstream/skill` 的 `viewport-base.css`）。手机上留黑边，不重排。
- **翻页**：方向键、空格、PgUp/PgDn、Home/End、点击、滑动、鼠标滚轮（一次手势一页），页码随之更新。预览和截图脚本依赖带 `.active` 的 `.slide`。脚手架已全部具备。
- **字体**：Google Fonts 且在 [Fontsource](https://fontsource.org) 上也有的字体族（会打包以便离线使用），或 Fontshare（例外）。不用其他字体来源。中文字体用 Google Fonts 的 Noto 系列。
- **不用位图、照片、logo、品牌或真实人物**，只用抽象图形：CSS、内联 SVG、渐变。
- **演示内容是虚构的**：公司、人物、数字都是编的。
- **CJK**：`design.md` 要有 CJK 一节（字体搭配、字重、行高），幻灯片换成中文内容也要好看。
- 不引入外部脚本；确需图表库时，只允许 jsDelivr 上锁定版本的库。
- 文字不溢出，面板不重叠（1920×1080 下）；正文保持清晰可读（建议不小于 24 px）。

## 协议与署名

- 只提交你自己的作品，或协议允许再分发的作品。版权归你。
- 允许的协议：**MIT、Apache-2.0、CC-BY-4.0、CC0-1.0**。把完整协议文本作为 `LICENSE` 放进模板目录，下载包会带上它。
- 改编其他模板时必须署名：画廊内的模板用 `derivedFrom`（详情页会同时显示两位作者，素材包附带原协议）；其他来源则在 `design.md` 和 `template.html` 头部注明。不得暗示原作者制作或认可了你的版本。
- 不得暗示 slides-commons 或你的模板是其他作者的官方项目。
- 素材包里的 `viewport-base.css` 来自 frontend-slides（MIT，Zara Zhang），协议随包附带，自动处理。

## 分支与提交

- Fork 后从 `dev` 拉分支，**向 `dev` 提 PR**。`main` 只通过 `dev` 到 `main` 的发版 PR 更新。
- 提交信息用 [Conventional Commits](https://www.conventionalcommits.org/)（如 `feat(templates): add neon-harbor`）。
- 不要提交 `site/`、`node_modules/` 或 `upstream/` 下的任何内容。

## 评审

CI 会运行 `validate + test`，以及一个守卫：拒绝修改 `upstream/`，并提示对其他来源模板的改动。维护者随后检查协议与署名、上述设计规则、浏览器中的预览（翻页、滚轮、窄窗口）、中文文案；新模板还会用 coding agent 实际跑一遍素材包。出现评审意见很正常。合并的模板 PR 随下一次发版上线。

提交即表示你同意：你的贡献按你声明的协议授权（本仓库的代码与文档为 MIT）。
