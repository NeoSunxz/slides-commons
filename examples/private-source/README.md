# Private template source (example)

A ready-to-copy skeleton for a company's own slide templates, to be shown in a self-hosted
[slides-commons](https://github.com/NeoSunxz/slides-commons) gallery. Your templates live in
their own repository, outside slides-commons, so `git pull` on slides-commons never conflicts
with them.

```
sources.json                 one private source: id, name, author, license text
templates/<slug>/            template.html, design.md, template.json (one folder per template)
screenshots/<slug>-1..3.png  three 1920x1080 screenshots per template
LICENSE                      optional; without it every pack gets a NOTICE.txt (internal use only)
.github/workflows/validate.yml   example CI (checks out slides-commons and validates)
```

The example template `acme-quarterly` is a tiny, valid template (3 slides) simplified from the
"minimal-pitch" idea of the slides-commons style presets (MIT).

## Use it

1. Copy this directory to your own repository (for example `acme-templates/`).
2. Edit `sources.json`: `id` (lowercase, unique), `name` (shown as the source and in the
   "internal use only" notice), `author`, `license` (any text, for example `Proprietary`).
   Optional: `repo` (a link to your repository, shown on pages), `templateUrl` (a link pattern
   with `{slug}` for hosts that do not use the GitHub URL layout).
3. Replace the example with your templates. The fastest way to start one:

   ```sh
   # in the slides-commons checkout
   npm run new-template -- my-template --source-dir ../acme-templates
   npm run screenshots -- --source-dir ../acme-templates --only my-template
   ```

   Or convert an existing deck with the convert kit and drop the resulting folder into `templates/`.
4. Check and build (in the slides-commons checkout):

   ```sh
   npm run validate -- --extra-sources ../acme-templates/sources.json
   node scripts/build.mjs --extra-sources ../acme-templates/sources.json
   ```

   To always include it, put the same file's content in `sources.local.json` in the slides-commons
   root (it is git-ignored) or set `SC_EXTRA_SOURCES=/path/to/sources.json`.

Details, hosting and upgrades: [docs/self-hosting.md](https://github.com/NeoSunxz/slides-commons/blob/dev/docs/self-hosting.md).

## What a private source does differently

- Cards and pages show an **Internal** badge; no GitHub back-link is required (the source name is
  shown instead); the footer and credits list it as internal.
- The license can be any text. If the source directory or a template directory has a `LICENSE`
  file it goes into the pack; otherwise the pack gets a `NOTICE.txt` ("Internal use only, do not
  distribute outside <source name>").
- Quality rules still apply: design.md sections (Fixed-Stage Policy, Signature Moves, CJK), exactly
  3 PNG screenshots at 1920x1080, no requests except the font hosts, size limits, no `TODO`.
  Open-source rules do not: no license list, no author URL, no `derivedFrom`; logos as raster images are allowed.
- A template slug must be unique across all sources, including slides-commons' own.
- Chinese pages show your templates in English unless you provide translations.

---

# 私有模板来源（示例）

给公司自有幻灯片模板准备的、可直接复制的目录样板，用于自托管的
[slides-commons](https://github.com/NeoSunxz/slides-commons) 画廊。模板放在你们自己的仓库里，
不在 slides-commons 目录内，所以升级 slides-commons（`git pull`）不会冲突。

```
sources.json                 一个私有来源：id、名称、作者、协议文字
templates/<slug>/            template.html、design.md、template.json（每个模板一个文件夹）
screenshots/<slug>-1..3.png  每个模板 3 张 1920x1080 截图
LICENSE                      可选；没有时每个素材包会附 NOTICE.txt（仅限内部使用）
.github/workflows/validate.yml   CI 示例（检出 slides-commons 并校验）
```

示例模板 `acme-quarterly` 很小但完整有效（3 页），由 slides-commons 风格预设中的 “minimal-pitch”
思路（MIT）简化而来。

## 使用方法

1. 把本目录复制成你们自己的仓库（例如 `acme-templates/`）。
2. 编辑 `sources.json`：`id`（小写、唯一）、`name`（作为来源名，也出现在“仅限内部使用”声明里）、
   `author`、`license`（任意文字，如 `Proprietary`）。可选：`repo`（仓库链接，会显示在页面上）、
   `templateUrl`（含 `{slug}` 的链接模板，用于不采用 GitHub 链接格式的代码托管）。
3. 用自己的模板替换示例。最快的起步方式：

   ```sh
   # 在 slides-commons 目录里
   npm run new-template -- my-template --source-dir ../acme-templates
   npm run screenshots -- --source-dir ../acme-templates --only my-template
   ```

   也可以用「转换」工具包把已有的幻灯片转成模板，再把生成的文件夹放进 `templates/`。
4. 校验与构建（在 slides-commons 目录里）：

   ```sh
   npm run validate -- --extra-sources ../acme-templates/sources.json
   node scripts/build.mjs --extra-sources ../acme-templates/sources.json
   ```

   想一直包含它：把该文件内容放到 slides-commons 根目录的 `sources.local.json`（已被 git 忽略），
   或设置环境变量 `SC_EXTRA_SOURCES=/path/to/sources.json`。

部署与升级见 [docs/self-hosting.zh.md](https://github.com/NeoSunxz/slides-commons/blob/dev/docs/self-hosting.zh.md)。

## 私有来源有什么不同

- 卡片与详情页显示「内部」标签；不强制 GitHub 回链（显示来源名）；页脚和致谢页把它列为内部来源。
- 协议可以写任意文字。来源目录或模板目录里有 `LICENSE` 就放进素材包；没有则附 `NOTICE.txt`
  （“仅限内部使用，请勿外传”）。
- 质量规则照旧：design.md 的必备章节（Fixed-Stage Policy、Signature Moves、CJK）、恰好 3 张 1920x1080
  的 PNG 截图、除字体外无外部请求、体积上限、不得残留 `TODO`。开源相关规则放宽：不限协议列表、
  不要求作者链接、不要求 `derivedFrom`，允许位图（如公司 logo）。
- 模板 slug 必须在所有来源（包括 slides-commons 自带的）中唯一。
- 中文页面默认显示英文介绍，除非你提供译文。
