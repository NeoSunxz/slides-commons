# slides-commons

open HTML slide templates with prompts, for coding agents ／ 开放的 HTML 幻灯片模板库。

公开、开源的静态网站：HTML 幻灯片模板画廊。访客可在线预览、复制提示词、下载素材包（zip），回到本地交给自己的 coding agent 完成幻灯片。
**提示词好不好用、zip 能否直接跑通，优先级高于画廊视觉效果。**

命名：仓库名、网站标题、package 名统一写作 `slides-commons`。不得用 `frontend-slides`、`beautiful-html-templates` 或其变体指代本项目。

---

## 维护者决定（M0 已确认）

| 项 | 决定 |
|---|---|
| 网站语言 | 英文默认 + 中文，用语言切换（英文在根目录，中文在 `zh/`），**同一页面不混用中英文**。上游模板数据的中文译文是固定、可审阅的数据文件 `src/i18n/zh.json`（非运行时机翻），中文页显示译文并注明「以下介绍由本站翻译，以英文原文为准」；缺译文回退英文并警告；`src/i18n/zh.sources.json` 记录英文原文哈希，上游改动后提示译文过期（`npm run i18n:sync` 在确认译文已对应后更新基线）；`design.md` 保持英文。提示词按页面语言复制，zip 内同时带 PROMPT.md 与 PROMPT.zh.md |
| 详情页布局 | 预览保持原尺寸（左预览 + 右侧"Use this template"面板），不要占满全宽；保留"新标签页打开"和"全屏"按钮 |
| 开发平台 | 在 Linux 上开发；所有脚本、命令、产物必须跨平台可用（Linux / macOS / Windows PowerShell）。构建脚本用 Node（`.mjs`），不写 bash-only 或 PowerShell-only 脚本，路径一律用 `path` 模块拼接 |
| 访客环境 | zip 和提示词必须在三大平台都能用：提示词里"打开浏览器"不写死 `open`（macOS），按平台给出 `open` / `xdg-open` / `start` |
| 提示词方案 | "按 design.md 重新生成单文件固定画布"方案（见下文） |
| M1 模板 | `neo-grid-bold` |
| 上游 submodule 指向 | 直接指向原作者仓库（HTTPS，shallow）。以后要换 fork：`git submodule set-url upstream/<name> <fork-url>` |

---

## 上游来源与署名（不得违反）

上游：zarazhangrui 的两个 MIT 仓库
- `upstream/templates` ← beautiful-html-templates（34 个模板，版权 2026 Zara Zhang）
- `upstream/skill` ← frontend-slides（agent skill，版权 2025 Zara Zhang）

规则：
- `upstream/` 只读，禁止修改其中任何文件
- 每个下载的 zip 必须包含该模板来源的 LICENSE（upstream 模板需同时带两份：templates 与 skill 的 LICENSE，因为 zip 混用了两个仓库的文件）
- 网站页脚和每个模板详情页必须注明作者，并链接回原仓库的对应目录
- 根目录维护 `CREDITS.md`，列出所有上游仓库、作者、协议
- 网站文案不得暗示本项目是原作者的官方项目

## 技术约束

- 纯静态站点，无框架，无后端
- 构建脚本用 Node，尽量单文件，读取数据后生成 `site/`
- `site/` 是构建产物，已加入 `.gitignore`，不提交
- 截图等二进制文件直接引用 submodule 里的，不复制进本仓库 git 历史
- 部署到 GitHub Pages，由 GitHub Actions 发布
- 跨平台：见"维护者决定"

## 协作方式

主会话（Opus）只做编排：拆任务、派给子 agent、审结果，不直接写业务代码。

子 agent（`.claude/agents/`）：
- `site-builder`：实现构建脚本和页面，只改 `scripts/`、`src/` 和 `.github/workflows/`（M3 起；维护者 2026-11-12 同意）
- `site-tester`：构建并用 Playwright 验证，只写 `tests/`，只报告问题不修复
- `release-manager`：提交、更新 CHANGELOG、准备发版，禁止 push 和改写历史
- （M6 时新增）`template-designer`：只允许写 `collections/neosun/`

每个里程碑顺序：site-builder → site-tester →（有问题回到 builder）→ release-manager。
每个里程碑发版前停下等维护者确认；结束时把进度和下一步写进本文件"进度"一节。

## 分支与发版

- `main`：已发布版本，受保护，只能通过 PR 合并，网站从这里部署
- `dev`：默认分支，所有开发和外部贡献都先进这里
- 禁止切换到 `main` 上提交
- 发版 = 从 `dev` 向 `main` 提 PR；tag 只打在合并后的 `main` 上
- 提交信息用 Conventional Commits，版本号用语义化版本
- 推送由维护者手动执行，agent 不执行 `git push`
- 远程使用 SSH：`git@github.com:NeoSunxz/slides-commons.git`

---

## M0 核实结论（上游 commit：templates `e5e204f`，skill `9906a34`）

### 上游文件结构

**templates**（beautiful-html-templates）
- `index.json`：`{schema_version:1, generated_at, template_count:34, templates:[...]}`，每项 12 字段，由 `scripts/build-index.mjs` 从各 `template.json` 生成
- `templates/<slug>/`：`template.html` + `template.json` + `design.md`，其中 10 个另有 `deck-stage.js`
- `screenshots/<slug>-N.png`：每模板 3 张，N 不连续（如 soft-editorial 为 4/6/10），共 102 张 / 32MB
- `runtime/deck-stage.js`：web component，固定 1920×1080 画布整体缩放
- `AGENTS.md`：工作流 = 问场合与情绪 → 从 index 选 3 个 → 做 3 个封面预览 → 用户挑 → 克隆模板目录、替换内容。§3 保留/替换规则、§5 补缺失版式规则可复用进提示词。注意其示例写 `template_count: 28`，实际 34，以文件为准；其中打开文件用 `open`（仅 macOS）

**skill**（frontend-slides）
- `SKILL.md`：单文件、零依赖、**固定 1920×1080 画布**（不可协商）；Phase 1 问用途/页数/内容/密度；Phase 3 读选中模板的 design.md 生成；自检文字溢出与面板重叠
- `STYLE_PRESETS.md`：12 个基础风格，1–8 有完整配色/字体/版式说明，9–12 仅一两行描述；Neon Cyber 用 Fontshare 字体
- `viewport-base.css`（133 行）：固定画布基础样式，要求完整内联
- `html-template.md`、`animation-patterns.md`：生成时的辅助参考
- `bold-template-pack/selection-index.json`：34 项，11 个选择字段 + `preview_md`/`design_md` 路径；顶层 `frontend_slides_policy` 规定 fixed-stage 1920×1080
- `bold-template-pack/templates/<slug>/preview.md`：精简风格卡（配色、字体、signature moves、预览规则）
- `bold-template-pack/templates/<slug>/design.md`：与 templates 仓库的 design.md 相同，**但多一节 "Frontend Slides Fixed-Stage Policy"**
- `bold-template-pack/deck-stage.js` 与 `runtime/deck-stage.js` 相同

### 字段对照

| 字段 | index.json | template.json | selection-index.json |
|---|---|---|---|
| slug, name, tagline, mood[], tone[], formality, density, scheme, best_for, avoid_for | ✓ | ✓ | ✓ |
| occasion[], slide_count | ✓ | ✓ | — |
| palette{}, typography{}, navigation | — | ✓ | — |
| preview_md, design_md | — | — | ✓ |

取值：scheme ∈ light/dark/mixed；formality ∈ low/medium-low/medium/medium-high/high；density 同类。`design.md` 有 YAML frontmatter（version, name, description, colors, typography …），正文约 500 行，含 "CJK & International Content" 节。

### 本项目 schema

以 `template.json` 的 15 个字段为基础，再加：
- `source`：构建时由 `sources.json` 注入，不写在模板文件里
- `license`：默认继承来源，可按模板覆盖
- `authors`：可选，默认继承来源 author
- `derivedFrom`：可选，`{source, slug}`，改编时填写；详情页同时显示原作者与改编者，zip 带原 LICENSE

详情页"设计说明"取 design.md frontmatter 的 `description`；缩略图取编号最小的截图。

### 共享文件依赖

- 没有模板引用 `runtime/`；用 deck-stage 的 10 个模板（creative-mode, editorial-forest, editorial-tri-tone, emerald-editorial, neo-grid-bold, peoples-platform, pin-and-paper, pink-script, soft-editorial, stencil-tablet）目录内自带 `deck-stage.js`，其中 editorial-forest、emerald-editorial 的副本与 runtime 版本不同 → zip 打包模板目录本身即可，**不要**用 runtime 版本替换
- 其余 24 个模板是 vw/vh 视口自适应 + 内联键盘处理，原生**不是**固定画布
- 外部请求白名单：`fonts.googleapis.com`、`fonts.gstatic.com`、`cdn.jsdelivr.net`（chart.js：coral、cartesian、retro-windows，其中 2 处未锁版本）；M4 起加 `api.fontshare.com`。`w3.org`（SVG xmlns）与 `quiver.ai`（SVG 注释）不是请求 → 校验需基于浏览器实际网络请求，不能正则扫源码

### 提示词与 zip 组成

zip（以 `<slug>/` 为根）：
- `template.html`（参考实现，原样）+ 该模板目录内的 `deck-stage.js`（如有）
- `design.md`（取 skill 版本，带 fixed-stage 规则）
- `viewport-base.css`
- `LICENSE-templates`、`LICENSE-skill`
- `PROMPT.md`（与网站"复制提示词"相同内容，英文；另附中文版 `PROMPT.zh.md`）

提示词结构：
1. 素材包里每个文件的用途
2. 设计系统要点（frontmatter + preview.md：配色、字体、signature moves）
3. 工作流：先问用途/页数/密度 → 读完整 design.md → 仅缺细节时参考 template.html → 生成单 HTML 文件，完整内联 viewport-base.css
4. 硬约束：不换字体、不改配色、不混模板（AGENTS.md §3/§5/§6）；固定 1920×1080，手机上加黑边不重排；CJK 规则；单文件零依赖（仅允许字体 CDN）
5. 自检：1280×720 与一个手机视口截图，检查溢出与面板重叠；跨平台打开命令

### 预览翻页

详情页 iframe 用 `sandbox="allow-scripts"`（不加 allow-same-origin）。父页面无法直接给 iframe 发键盘事件 → 构建时生成预览副本（`site/` 内），注入一个小脚本：监听 postMessage，转发为 ArrowLeft/ArrowRight keydown。上游原文件不动。

---

## 里程碑（已按 M0 建议调整）

| 里程碑 | 内容 | 验收 |
|---|---|---|
| M0 | 读上游、核实、定 schema 与提示词 | ✅ 维护者已确认 |
| M0.5 | submodule 接入；`.claude/agents/` 三个子 agent；`dev` 分支 | submodule 可检出，agent 定义就绪 |
| M1 | 单模板 `neo-grid-bold`：构建脚本、详情页预览翻页、复制提示词、zip | 维护者在空目录用 zip + 提示词实际做出幻灯片；**未通过不进入 M2** |
| M2 | 全部 34 模板 + 首页 + 按来源筛选；元数据校验与 slug 去重脚本 | 全部可预览翻页、控制台无报错、署名回链正确 |
| M3 | CI（pull_request，submodules: recursive）+ Pages 部署 | PR 自动校验，合并 main 后线上可访问 |
| M4 | 12 个基础风格 demo，作为独立来源放 `collections/`，署名说明为衍生作品 | 纳入画廊，署名清楚 |
| M5 | 贡献流程：CONTRIBUTING、PR/Issue 模板、校验工作流 | 就绪 |
| M6 | `collections/neosun/` 第一个自有模板 | 跑通 |

---

## 进度

- 2026-11-10：M0 完成并经维护者确认。上游浅克隆参考副本在 `~/projects/refs/`（只读阅读用，不属于本仓库）。
- 2026-11-10：M0.5 完成。`dev` 分支已建；submodule `upstream/templates`（e5e204f）、`upstream/skill`（9906a34）指向原作者仓库；`.claude/agents/` 下 site-builder / site-tester / release-manager 已定义。新克隆需 `git clone --recurse-submodules`，或克隆后 `git submodule update --init`。
- 下一步（M1）：派 site-builder 实现 `neo-grid-bold` 单模板打通（sources.json、构建脚本、详情页预览翻页、复制提示词、zip），再由 site-tester 验证；维护者用 zip + 提示词实际做出一份幻灯片后才进入 M2。
- 待维护者操作：`git push -u origin dev`，并在 GitHub 上把默认分支设为 `dev`、保护 `main`。
- 2026-11-10：M1 构建完成（site-builder）：`npm run build` → `site/`，`npm run serve` → http://localhost:4173/。zip 含 template.html、deck-stage.js、design.md（skill 版）、viewport-base.css、LICENSE-templates、LICENSE-skill、PROMPT.md、PROMPT.zh.md、README.md。根目录 CREDITS.md、LICENSE 已建。`.claude/settings.json` 设 `worktree.bgIsolation: none`（维护者要求在主目录 dev 上工作）。
- 已解决：本机缺 Chromium 系统库的阻塞已由维护者安装依赖解决，Playwright 可正常运行。
- 2026-11-10：M1 经 site-tester 验证通过，`npm test` 39/39：预览翻页与计数 1/12、预览字体修复、复制提示词 EN/ZH 与 zip 内 PROMPT.md/PROMPT.zh.md 逐字节一致、zip 完整性与可复现、`--out` 保护（标记文件 `.slides-commons-build`）、通过 `--sources/--out` 的 fixture 构建。已由 release-manager 在 `dev` 上提交，CHANGELOG.md 建立 `Unreleased` 一节。
- 2026-11-10/11：M1 维护者反馈迭代：
  - 双击打开（file://）时预览坏掉 → 预览副本内联本地脚本；file:// 下目录链接改写为 index.html（`src/site.js`）
  - 详情页保留原布局（左预览 + 右面板），加"新标签页打开"与"全屏"按钮
  - 中英文语言切换：英文在根目录、中文在 `zh/`，同页不混用；"coding agent" 在中文页保留英文
- 2026-11-11：两次模拟验收（全新 agent 只拿 zip + 提示词，在空目录制作）均产出高质量幻灯片：中文 8 页演讲型、英文 10 页高密度 QBR。据此修了提示词 15 处（解压回退链、无显示器回退、CJK 字体链接取自 design.md、CJK 字重/行高、用户密度优先、强调色对比、chrome 重叠豁免、滚轮翻页、询问演讲者/日期/链接、字体加载核验方式、大纲确认条件、`--slide-bg` 取色）。
- 测试稳定化：`tests/font-cache.mjs` 缓存 Google Fonts 响应（本机网络偶发 ERR_CONNECTION_CLOSED），去掉所有固定等待；`npm test` 72/72，约 17 秒。
- 2026-11-11：维护者亲手验收 M1 通过（其 agent 用 zip + 提示词做出 8 页中文幻灯片，质量好）。据其反馈再补提示词：中文孤字换行、演讲型最小字号 20px、成稿后通读自查矛盾。
- 2026-11-11：M2 开发与验证完成：34 模板全部构建；画廊（搜索、配色/情绪筛选，状态在 URL hash，来源筛选数据驱动、仅一个来源时隐藏）；缩略图自写 PNG 缩小（32MB→4.5MB，缓存在 `node_modules/.cache/slides-commons/thumbs`，冷构建约 21 秒，CI 需缓存）；预览桥接适配三类翻页机制（deck-stage 10 / class 22 / geometry 2：8-bit-orbit、daisy-days），页数取自实际渲染；提示词按数据生成例外（系统字体 raw-grid、禁用 CDN 图表 coral/cartesian/retro-windows、无 deck-stage 的模板不提该文件）；`npm run validate`（构建同样调用）；`npm test` 268/268，约 2.5 分钟。
  - 桥接教训：「按键被接受」只能以页码真的变化为准，别把动画/transition 当证据，否则带按键锁的模板（broadside/grove/monochrome/signal/studio，约 1 秒锁）会丢第二次点击。
  - 上游小错误：monochrome 演示文案写 11/18，实际 16 页，站点显示 16。
- 2026-11-12：M2 反馈迭代：预览 iframe 固定 1920×1080 后整体缩放（与截图一致）；预览内滚轮拦截、一次手势翻一页、页码随任何来源同步；详情页 1440px 两栏 + 右侧 sticky 面板；中文译文接入（见上表）；页码初始化改为页面反复 ping 直到收到首个状态。`npm test` 337 通过 1 跳过（约 3 分钟）。
  - 待补：给 i18n 加 `SC_I18N_DIR` 之类的注入点，使「缺译文回退 / 译文过期告警 / zh.json 结构错误」可测（目前该测试 skip）。
- 2026-11-12：M2 经维护者实测通过。M3 开发：`.github/workflows/ci.yml`（pull_request→dev/main，validate + test，只读权限，Action 全部固定到提交哈希）与 `pages.yml`（push main → 构建并部署，构建时 `SC_SITE_URL=https://<owner>.github.io/<repo>/`，产物自检）。提示词自动下载素材包已实现：`SC_SITE_URL` / `--site-url`（未设置时产物与之前逐字节一致）；`SC_I18N_DIR` / `--i18n-dir` 使翻译缺失/过期/结构错误可测。`npm test` 371 通过 0 跳过（约 3.3 分钟）。
  - 工作流尚未在 GitHub 上实际运行过。Pages 检查里 zip 数量 34 是写死的，增减模板/来源时同步修改。
  - 维护者一次性设置：默认分支 dev；Pages source = GitHub Actions；main 分支保护（需 PR + 必过检查 `validate + test`，禁强推）。
- 2026-11-13：v0.1.0 发布（PR #1 合并到 main，提交 97816b0；Pages 上线 https://neosunxz.github.io/slides-commons/ ，详情页路径 `t/<slug>/`；GitHub Release v0.1.0）。main 已保护（需 PR + 必过 `validate + test`），默认分支 dev。
- 2026-11-13：「只给提示词、不放 zip」模拟验收通过（curl 下载 → python 解压 → 8 页中文演讲型）。据此改提示词（维护者确认）：缺内容由 agent 代写、页面不放占位、最终回复逐条列出代写内容；design.md 自相矛盾取更严格的规则；CJK 字重规则优先于 design.md；二维码/链接仅在用户给了真实链接时使用；章节编号与页码一致；`--slide-bg` 取画布底色而非面板色；解压顺序 unzip → python → tar → Expand-Archive。演讲型面板下限不设。`npm test` 374 通过。
  - 待定：`--slide-bg` 目前是通用措辞，未按模板从数据推导具体色值。
- 下一步：自托管字体（见下方计划），然后 M4。

### 编排经验
- 子 agent 定义文件在会话启动后新增时不会被识别，需用 general-purpose 并让其先读 `.claude/agents/<name>.md`
- 提示词改动后用"全新 agent + 空目录 + 只给 zip 和提示词"做模拟验收，最能暴露问题

### 计划：提示词自动下载素材包（M3 部署 Pages 后开发）

目标：用户只复制提示词，agent 自己下载并解压素材包，无需手动下载。网页"下载素材包"按钮保留（离线/受限网络用）。

前提：zip 需要公网地址，依赖 M3 的 GitHub Pages 部署。

设计：
- 站点地址配置项 `siteUrl`（配置文件 + 环境变量 `SC_SITE_URL` 覆盖），预期默认 `https://neosunxz.github.io/slides-commons/`（自定义域名则改此项，待维护者确认）。
- 构建时把 `<siteUrl>zip/<slug>.zip` 写入提示词（EN/ZH 两份）。未配置 `siteUrl`（如本地预览）时，提示词不含下载步骤，保持现状。
- 提示词 §0 改为：先看当前目录是否已有 `<slug>/` 文件夹或 zip → 没有则下载，按顺序尝试，命令缺失或失败就换下一个：`curl -fLO <url>` → `wget <url>` → PowerShell `Invoke-WebRequest -Uri <url> -OutFile <file>`；下载后沿用现有解压回退链；全部失败再请用户手动下载。
- 校验：zip 内 PROMPT.md 与网页提示词仍逐字节一致（同一份 siteUrl 生成）；测试加：配置了 siteUrl 时提示词含该网址与下载命令链，未配置时不含。
- 验收：模拟验收时只给提示词、不放 zip，让全新 agent 自行下载完成（需 Pages 已上线）。

### 计划：自托管字体（M2 起，解决网络受限地区访问不了 Google Fonts）

问题：fonts.googleapis.com / fonts.gstatic.com 在网络受限地区常加载失败或很慢；预览与 agent 生成的幻灯片都会回退系统字体。

方案（字体均为 OFL 开源，可再分发）：
1. 预览副本：构建时把 Google Fonts 链接换成站点自带的 woff2 + @font-face（只改 `site/` 预览副本，上游不动）。
2. zip：放入该模板用到的字体文件；提示词要求优先用本地字体。
3. 生成的幻灯片：字体以 base64 嵌入 HTML 保持单文件。拉丁字体体积小可直接嵌；Noto Sans SC 很大，需按实际用到的字符裁剪（pyftsubset 等）再嵌——分第二步做。
- 备选（更轻、不保证）：用 jsDelivr 的 `@fontsource` 镜像（jsDelivr 已在白名单）。
- 落地顺序：预览 + 拉丁字体 → 中文裁剪。需注意白名单与"无外部请求"校验随之收紧。

### M2 待处理事项（来自 M1）
- raw-grid 原版用系统字体栈，与提示词"只用 Google Fonts/Fontshare"冲突；coral、cartesian、retro-windows 依赖 jsdelivr 的 chart.js，与"无 CDN"冲突 → 提示词需按模板加例外
- schema `additionalProperties: false`：上游新增字段会让构建失败（有意为之，可作为上游变化的告警）
- 访客网络连不上 Google Fonts 时预览会回退系统字体（本机就偶发）——是否需要提示或兜底待定
- 详情页色板用 template.json 的色名，提示词用 design.md 的色名，可统一
- template.json 的 slide_count 与实际页数可能不符（neo-grid-bold 写 13，实际 12）→ 以实际渲染为准
- ~~zip 时间戳固定化（可复现构建）~~ M1 已完成（默认 1980-01-01，支持 `SOURCE_DATE_EPOCH`）
- ~~serve.mjs 默认监听所有网卡~~ M1 已改为默认 127.0.0.1（`HOST=0.0.0.0` 可对外）
