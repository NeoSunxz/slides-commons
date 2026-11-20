# 自托管 slides-commons（公司内部部署）

你可以在自己的网络里运行这个画廊，把公司的模板和公开模板放在一起。站点是纯静态文件，没有服务端
代码，也没有数据库。同事在浏览器里打开站点、复制提示词，剩下的由他们的 coding agent 完成。

目录：[用 Docker 快速开始](#1-用-docker-快速开始) ·
[从源码构建](#2-从源码构建) ·
[加入公司的模板](#3-加入公司的模板) ·
[只显示你们自己的模板](#4-只显示你们自己的模板) ·
[同事怎么用](#5-同事怎么用) ·
[受限网络与离线环境](#6-受限网络与离线环境) ·
[参考](#7-参考)

## 1. 用 Docker 快速开始

一个镜像在容器启动时构建站点，并用 nginx 提供服务（非 root、gzip、缓存、健康检查）。公开镜像：
`ghcr.io/neosunxz/slides-commons:<版本>`（以及 `latest`）。

```sh
docker run -d --name slides -p 8080:80 \
  -e SC_SITE_URL=http://slides.intra/ \
  -v "$PWD/acme-templates":/templates:ro \
  ghcr.io/neosunxz/slides-commons:latest
```

- `SC_SITE_URL` 是同事（和他们的 agent）打开站点用的地址。请设置它：不设置时，提示词会让用户手动
  下载素材包，也不会托管字体。
- 挂载目录是可选的。存在 `/templates/sources.json` 时，它会作为你们自己的来源加入（见
  [第 3 节](#3-加入公司的模板)）；没有挂载就只有公开模板。
- 打开 `http://localhost:8080/`。首次启动需要几秒到一分钟；nginx 开始服务后容器变为 `healthy`。

**升级**（slides-commons 出了新版本）：拉取镜像并重建容器。

```sh
docker pull ghcr.io/neosunxz/slides-commons:latest
docker rm -f slides
docker run -d --name slides ...        # 与上面相同的命令
```

用 Compose：`docker compose pull && docker compose up -d`（见
[`docker/compose.example.yml`](../docker/compose.example.yml)）。想让升级可控，就固定版本号
（如 `:0.4.1`）而不是用 `latest`。

**修改模板之后**：执行 `docker restart slides`。站点**每次启动都会重建**，内容来自挂载目录的当前
状态。如果构建失败（某个模板违反了校验规则），容器会以非零状态退出，日志里写明原因，不会提供过期的
站点。先用 `npm run validate` 检查（第 3 节）。

## 2. 从源码构建

不用 Docker，或者要制作模板（截图需要浏览器）时使用。

```sh
git clone --recurse-submodules https://github.com/NeoSunxz/slides-commons.git
cd slides-commons
npm ci                                    # 需要 Node.js 22 及以上
SC_SITE_URL=https://slides.acme.internal/ node scripts/build.mjs --extra-sources ../acme-templates/sources.json
```

站点输出到 `site/`（用 `--out <目录>` 指定其他位置）。Linux、macOS、Windows PowerShell 的命令相同
（PowerShell 里用 `$env:SC_SITE_URL="https://..."` 设置变量，或者用 `--site-url`）。用任何静态
Web 服务器提供 `site/`：

```sh
npm run serve                                      # 内置，http://127.0.0.1:4173/（HOST=0.0.0.0 对外共享）
python3 -m http.server 8080 --directory site       # 快速试用（Windows：py -m http.server ...）
```

nginx：`root /srv/slides-commons/site;`。IIS：新建站点，物理路径指向 `site/`。所有链接都是相对的，
所以站点也能放在子路径下（`https://intranet/slides/`）。直接从磁盘打开 `site/index.html`
（`file://`）可以快速查看，预览也能用；但这样提示词无法下载素材包，给同事用请提供真实地址。

**升级：**

```sh
git pull && git submodule update --init && npm ci
# 用同样的命令重新构建，再重新发布 site/
```

你们的模板在这个目录之外，不会冲突。修改模板后只需重新构建。

## 3. 加入公司的模板

你们的模板放在自己的仓库里（例如 `acme-templates/`），在 slides-commons 目录之外，升级时不会冲突。
完整流程：

1. **复制样板。**把 [`examples/private-source/`](../examples/private-source/README.md) 复制成你们
   自己的仓库。里面有 `sources.json`、一个有效的示例模板（`acme-quarterly`）、三张截图和一个 CI
   工作流。编辑 `sources.json`（字段见下表）。

2. **创建模板**，两种方式：
   - **转换已有的幻灯片。**打开站点的「转换」页面，复制提示词粘贴给你的 coding agent（或下载
     `convert-kit.zip`）。把 PowerPoint `.pptx` 文件或幻灯片图片（截图、导出的页面；PDF 先用
     `pdftoppm -png -r 80 deck.pdf page` 转成图片）交给 agent。不支持 HTML 幻灯片。agent 会写出一个
     文件夹 `<slug>/`，里面有 `design.md`、`template.json`、`template.html`；把它移到
     `acme-templates/templates/<slug>/`。
   - **从脚手架开始：**
     `npm run new-template -- <slug> --source-dir ../acme-templates`，然后编辑文件。所有需要你决定
     的值都标有 `TODO`；全部去掉之前校验不会通过。

3. **截图，然后校验**（在 slides-commons 目录里；截图需要先安装一次 Chromium：
   `npx playwright install chromium`）：

   ```sh
   npm run screenshots -- --source-dir ../acme-templates --only <slug>
   npm run validate -- --extra-sources ../acme-templates/sources.json
   ```

   每个模板需要 `template.html`、`design.md`（含 Fixed-Stage Policy、Signature Moves 和 CJK 章节）、
   `template.json`，以及恰好三张 1920x1080 的 PNG 截图 `screenshots/<slug>-1..3.png`。校验还会检查
   元数据、体积上限、`TODO` 标记、外部请求（只允许字体），以及 slug 在所有来源（包括公开模板）中是否
   唯一。

4. **你们仓库里的 CI。**样板中的 `.github/workflows/validate.yml` 会检出你们的仓库和 slides-commons
   （固定到某个发布标签），在每个 pull request 上运行同样的校验和一次冒烟构建。按需修改
   `SLIDES_COMMONS_REF` 和 `SOURCE_ID`。

5. **重新构建或重启**（Docker：`docker restart slides`；源码：重新构建）。

### 来源文件

你们仓库里的 `sources.json`（schema 见 [`src/schema/sources.schema.json`](../src/schema/sources.schema.json)）：

| 字段 | 含义 |
|---|---|
| `id` | 小写、唯一，例如 `acme`。`--only-sources` 和 `SC_ONLY_SOURCES` 用它。 |
| `name` | 来源名称，显示在卡片、详情页、页脚和致谢页，以及“仅限内部使用”的声明里。 |
| `nameZh` | 同上，用于中文页面（默认同 `name`）。 |
| `author`、`authorZh` | 显示在致谢页的维护者（`authorZh` 只用在中文声明里）。 |
| `private: true` | 把来源标记为内部来源，见下文。 |
| `license` | 任意文字（`Proprietary`、`Internal use only`），不限于开源协议。 |
| `path` | 模板所在目录，相对于本文件（仓库根目录写 `.`）。 |
| `repo` | 可选，你们仓库的链接，在页面上作为来源显示。没有时页面只显示来源名称。 |
| `templateUrl` | 可选，单个模板目录的回链模式，含 `{slug}`，用于不采用 GitHub 链接格式的代码托管（`https://git.acme.internal/templates/-/tree/main/templates/{slug}`）。 |

**「内部」是什么意思。**卡片、详情页、致谢页和页脚都带「内部」标签；不要求 GitHub 回链。条款随素材包
和提示词一起走：提示词（中英文）开头有一行“仅限内部使用：请勿把幻灯片、素材包或其设计发布或传播到
<你们的名称>之外”，素材包 README 也重复这句话。开源相关规则不适用（不限协议列表、不要求作者链接、不要求
`derivedFrom`）；质量规则照旧。

**LICENSE 还是 NOTICE.txt。**模板文件夹里有 `LICENSE` 文件，就放进该模板的素材包；否则用来源目录的
`LICENSE`。两者都没有时，素材包里会有 `NOTICE.txt`（“仅限内部使用，请勿外传”，中英文）。

**中文译文（可选）。**不翻译时，中文页面以英文显示你们的模板。在 `sources.json` 旁边放
`i18n/zh.json` 和 `i18n/zh.sources.json`，格式同 [`src/i18n/zh.json`](../src/i18n/zh.json)：`terms`
（标签译文）与 `templates`（按 slug：`tagline`、`description`、`best_for`、`avoid_for`、`occasion`、
`palette_description`、`typography_style`）。同一个词条或 slug 两边都有时，以 slides-commons 自带的为准。
有人确认译文与英文原文对应后，运行
`npm run i18n:sync -- --extra-sources ../acme-templates/sources.json`，它会把每段英文原文的哈希记入
`zh.sources.json`，之后英文改动时构建会提示译文过期。缺译文时回退到英文并给出警告。

**来源文件放哪里。**除了 `--extra-sources` / `SC_EXTRA_SOURCES`，slides-commons 根目录或 `sources/`
下名为 `sources.local.json` 的文件（已被 git 忽略）也会自动加入。其中的路径相对于该文件所在目录，
它的 `i18n/` 文件夹放在它旁边。`--no-local-sources`（或 `SC_NO_LOCAL_SOURCES=1`）可关闭。

## 4. 只显示你们自己的模板

`SC_ONLY_SOURCES=acme`（或 `--only-sources acme`）会构建一个只含你们来源的画廊：首页计数、筛选、
页脚和致谢页随之调整，轮播改用你们前几个有截图的模板。公开模板仍会被读取，用来检查 slug 冲突。
多个 id 用逗号分隔。

「转换」与「技能」页面及其 zip 无论如何都会生成。`SC_NO_KITS=1`（或 `--no-kits`）可以去掉它们。

## 5. 同事怎么用

1. 打开内网站点（你在 `SC_SITE_URL` 里设置的地址），选一个模板。
2. 点「复制提示词」，粘贴给他们的 coding agent（Claude Code、Codex、Cursor 等）。
3. agent 从你的 `SC_SITE_URL` 下载模板素材包（`zip/<slug>.zip`）并解压，询问用途、页数和密度，然后
   写出一个单文件 HTML 幻灯片。素材包里的字体也来自你们的服务器（第 6 节）。「离线？下载素材包
   （.zip）」这个小链接是给离线工作的人用的。

「转换」与「技能」页面也由内网提供，它们的 zip（`convert-kit.zip`、`slides-commons-skills.zip`）也一样。
「技能」页的安装提示词从同一个站点下载技能包，「转换」提示词也从这里下载工具包，所以没有人需要访问
公网站点。

## 6. 受限网络与离线环境

在设计构建和素材包时已经考虑到：只要 agent 所在的机器能访问你们的站点，没有互联网的内网也能用。
下面是能做到的和做不到的：

| 无需互联网即可使用（设置了 `SC_SITE_URL` 且可访问） | 做法 |
|---|---|
| 站点自己的页面、截图、字体 | 内嵌或复制进 `site/`；没有字体或脚本请求。 |
| 模板**预览**里的拉丁字体 | 以 data URI 内联进预览副本。 |
| 每个**素材包**里的拉丁字体 | 素材包的 `fonts/` 带有 woff2 与 `fonts.css`；提示词要求 agent 把它们以 base64 嵌入幻灯片。 |
| 幻灯片里的 CJK 字体 | 素材包带 `fonts/embed-cjk.mjs`。它只下载幻灯片用到的分片，先从 `<SC_SITE_URL>fonts/cjk/`（由构建托管，约 67 MB）下载，失败才回退 jsDelivr，然后嵌入。 |
| **转换工具包**和技能里的拉丁字体 | `fonts/embed-latin.mjs` 先从 `<SC_SITE_URL>fonts/latin/`（约 9 MB）下载，再回退 jsDelivr。 |
| 提示词、素材包、工具包、技能包的下载 | 全部来自 `SC_SITE_URL`。 |

仍然需要公网的地方：

- 每份幻灯片里的 Google Fonts `<link>` 只是兜底；离线时它静默失败，使用已嵌入的字体。
- 点名了 CJK 字体的模板，其**预览里的 CJK 文字**：预览副本保留了 Google Fonts 链接，离线时显示系统 CJK 字体。素材包和成稿不受影响。
- 没有已安装字体包提供的字体：`neon-cyber` 加载 Fontshare，Noto Serif JP 与 Noto Sans KR 仍走 Google Fonts。
- 三个模板（`coral`、`cartesian`、`retro-windows`）从 jsDelivr 加载 chart.js，离线时图表不显示；提示词会让 agent 不依赖 CDN 绘制图表。两个 `guizang-*` 模板从 jsDelivr 加载 `motion`。
- coding agent 本身当然需要它的模型服务；构建机器需要一次 npm 和 GitHub（或镜像），除非在别处构建后复制 `site/`，或在别处构建 Docker 镜像（`docker save` / `docker load`）。
- 可选：在 agent 所在机器上 `pip install fonttools brotli`，`embed-cjk.mjs` 就能把 CJK 分片裁剪到只含用到的字（否则每个字重会让幻灯片多出几 MB）。

自测：用真实的 `SC_SITE_URL` 构建，然后让一台机器断开互联网（保持连着内网），用提示词做一份幻灯片。

## 7. 参考

### 构建参数

```sh
node scripts/build.mjs [参数]        # npm run build；npm run validate -- 接受同样的参数
```

| 参数 | 环境变量 | 含义 |
|---|---|---|
| `--extra-sources <文件>` | `SC_EXTRA_SOURCES` | 追加一个来源文件（格式同 `sources.json`）。参数可重复，也可用平台的路径分隔符（Linux/macOS 为 `:`，Windows 为 `;`）写多个路径。 |
| `--no-local-sources` | `SC_NO_LOCAL_SOURCES=1` | 忽略 `sources.local.json`。 |
| `--only-sources <id,...>` | `SC_ONLY_SOURCES` | 只构建这些来源。 |
| `--site-url <网址>` | `SC_SITE_URL` | 站点对外网址（自动补尾部斜杠）。提示词从它下载素材包；CJK 与拉丁字体文件托管在它下面。 |
| `--no-kits` | `SC_NO_KITS=1` | 不生成「转换」与「技能」页面和 zip。 |
| `--out <目录>` | `SC_OUT` | 输出目录（默认 `site/`；仅当目录为空、是默认目录或由本工具构建时才会被替换）。 |
| `--sources <文件>` | `SC_SOURCES` | 替换默认的 `sources/sources.json`（测试夹具用）。 |
| `--i18n-dir <目录>` | `SC_I18N_DIR` | slides-commons 自带 `zh.json` / `zh.sources.json` 所在目录。 |
| | `SOURCE_DATE_EPOCH` | zip 条目时间戳（默认 1980-01-01，使构建可复现）。 |

### Docker

| 变量 | 含义 |
|---|---|
| `SC_SITE_URL` | 用户访问站点的地址（提示词下载链接、托管的字体）。 |
| `SC_ONLY_SOURCES` | 要构建的来源 id，逗号分隔，例如 `acme`。 |
| `SC_NO_KITS` | `1` 表示不生成「转换」与「技能」页面。 |
| `SC_EXTRA_SOURCES` | 更多来源文件，写容器内的路径。存在 `/templates/sources.json` 时总会加入。 |
| `PORT` | nginx 在容器内监听的端口（默认 80）。非特权进程不能绑定 80 端口的环境（rootless Podman、部分 Kubernetes）用 `-e PORT=8080 -p 8080:8080`。 |

- **HTTPS：**前面放一个终止 TLS 的反向代理；此时 `SC_SITE_URL` 写 https 地址。
- **只读根文件系统：**加 `--tmpfs /tmp --tmpfs /srv/www:uid=101`。
- **Compose：**[`docker/compose.example.yml`](../docker/compose.example.yml) 给出了同样的 Compose 写法，含可选变量。
- **自己构建镜像**（上游 submodule 属于构建上下文，需先检出）：`git submodule update --init && docker build -t slides-commons .`
- 如果 `/templates` 里有文件但没有 `sources.json`，日志会警告，且不会加入任何模板。

### Windows 说明

用 PowerShell，命令相同。区别：环境变量用 `$env:SC_SITE_URL = "https://..."` 设置，`SC_EXTRA_SOURCES`
里多个路径用 `;` 分隔，挂载卷写 `-v "${PWD}/acme-templates:/templates:ro"`，Python 快速试用服务器是
`py -m http.server`。提示词会按平台给 agent 对应的命令（`open` / `xdg-open` / `start`，没有 `unzip` 时用
`Expand-Archive`），所以 Windows 上的同事不需要额外做什么。

### 只做检查

`npm run validate -- --extra-sources ../acme-templates/sources.json` 运行全部检查但不构建（也接受
`--only-sources`）。构建会先运行同样的检查。
