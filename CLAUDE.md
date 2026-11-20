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

子 agent（`.claude/agents/`，本地文件，不入库）：
- `site-builder`：实现构建脚本和页面，只改 `scripts/`、`src/` 和 `.github/workflows/`（M3 起；维护者 2026-11-12 同意）
- `site-tester`：构建并用 Playwright 验证，只写 `tests/`，只报告问题不修复
- `release-manager`：提交、更新 CHANGELOG、准备发版，禁止 push 和改写历史
- `template-designer`：设计和编写自有模板，只允许写 `collections/`（M4 起；维护者 2026-11-13 同意，原计划 M6 新增）

每个里程碑顺序：site-builder → site-tester →（有问题回到 builder）→ release-manager。
每个里程碑发版前停下等维护者确认；结束时把进度和下一步写进 `docs/dev/progress.md`。

## 分支与发版

- `main`：已发布版本，受保护，只能通过 PR 合并，网站从这里部署
- `dev`：默认分支，所有开发和外部贡献都先进这里
- 禁止切换到 `main` 上提交
- 发版 = 从 `dev` 向 `main` 提 PR；tag 只打在合并后的 `main` 上
- 提交信息用 Conventional Commits，版本号用语义化版本
- 推送由维护者手动执行，agent 不执行 `git push`
- 远程使用 SSH：`git@github.com:NeoSunxz/slides-commons.git`

---

## 进度与背景

M0 核实结论、里程碑、进度日志和各项计划见 [docs/dev/progress.md](docs/dev/progress.md)。

### 编排经验
- 子 agent 定义文件在会话启动后新增时不会被识别，需用 general-purpose 并让其先读 `.claude/agents/<name>.md`
- 提示词改动后用"全新 agent + 空目录 + 只给 zip 和提示词"做模拟验收，最能暴露问题
