# 自托管 slides-commons（公司内部部署）

你可以自己构建画廊并在内网提供访问，把公司的模板和公开模板放在一起。站点就是纯静态文件，
没有服务端代码，也没有数据库。

## 1. 获取代码

两个仓库：slides-commons（含上游 submodule）和你们自己的模板仓库（可从
[`examples/private-source/`](../examples/private-source/README.md) 复制样板开始）。

```sh
git clone --recurse-submodules https://github.com/NeoSunxz/slides-commons.git
git clone git@your-host:acme/acme-templates.git          # 你们的私有模板
cd slides-commons
npm ci                                                    # 需要 Node.js 22 及以上
```

## 2. 构建

```sh
node scripts/build.mjs --extra-sources ../acme-templates/sources.json
```

站点输出到 `site/`（用 `--out <目录>` 指定其他位置）。Linux、macOS、Windows PowerShell 通用。
常用参数（都有对应的环境变量）：

| 参数 | 环境变量 | 含义 |
|---|---|---|
| `--extra-sources <文件>` | `SC_EXTRA_SOURCES` | 追加一个来源文件（格式同 `sources.json`）。参数可重复，也可用平台的路径分隔符（Linux/macOS 为 `:`，Windows 为 `;`）写多个路径。文件里的路径相对于该文件所在目录。 |
| （文件） | | slides-commons 根目录或 `sources/` 下的 `sources.local.json`（已被 git 忽略）会自动加入；`--no-local-sources` 可关闭。 |
| `--only-sources <id,...>` | `SC_ONLY_SOURCES` | 只构建这些来源，例如只要自己的：`--only-sources acme`。默认全部。 |
| `--site-url <网址>` | `SC_SITE_URL` | 站点对外网址，见下文。 |
| `--no-kits` | `SC_NO_KITS=1` | 不生成「转换」与「技能」页面和 zip。 |
| `--out <目录>` | `SC_OUT` | 输出目录。 |

不构建、只校验：`npm run validate -- --extra-sources ../acme-templates/sources.json`（同样支持
`--only-sources`）。它检查元数据、design.md 章节、3 张截图、外部请求、体积，以及所有来源之间 slug 是否唯一。

## 3. 提供访问

把任意静态服务器指向 `site/`：

```sh
python3 -m http.server 8080 --directory site      # 快速试用（Windows：py -m http.server ...）
npm run serve                                      # 内置，http://127.0.0.1:4173/（HOST=0.0.0.0 可对外）
```

nginx：`root /srv/slides-commons/site;`。IIS：新建站点，物理路径指向 `site/`。所有链接都是相对的，
所以也可以放在子路径下（`https://intranet/slides/`）。直接从磁盘打开 `site/index.html`
（`file://`）同样可用，包括预览，适合快速查看。

## 4. 让提示词在内网里可用

「复制提示词」的文本会让 coding agent 自己下载模板素材包。这需要构建时知道站点的地址，否则提示词
会让用户先手动下载 zip：

```sh
SC_SITE_URL=https://slides.acme.internal/ node scripts/build.mjs --extra-sources ../acme-templates/sources.json
```

该地址必须能从运行 agent 的机器访问。同一次构建还会托管素材包里 `fonts/embed-cjk.mjs` 要下载的
CJK 字体分片（位于 `fonts/cjk/`，整个目录约 70 MB；你们的站点不可达时脚本会回退到 jsDelivr）。
预览页的字体和每个素材包里的拉丁字体本来就包含在构建产物中。

## 5. 升级

```sh
cd slides-commons
git pull
git submodule update --init
npm ci
node scripts/build.mjs --extra-sources ../acme-templates/sources.json
```

然后重新发布 `site/`。你们的模板在 slides-commons 目录之外，不会产生冲突。修改模板后只需重新构建。

## 6. 添加模板

- 脚手架：`npm run new-template -- <slug> --source-dir ../acme-templates`，编辑生成的文件，再运行
  `npm run screenshots -- --source-dir ../acme-templates --only <slug>` 并校验。
- 用「转换」页面的工具包转换已有的幻灯片（PowerPoint、PDF、HTML），把生成的文件夹放进来源的
  `templates/` 下。

每个模板需要 `template.html`、`design.md`、`template.json` 和三张 1920x1080 截图。slug 在所有来源中
必须唯一。私有来源显示「内部」标签；素材包附带你们的 `LICENSE`，没有时附 `NOTICE.txt`（仅限内部使用）。

## 7. 只显示自己的模板

`--only-sources acme` 只构建你们的来源：首页数量、筛选、页脚和致谢页都会随之调整，首页轮播会回退为
你们前几个有截图的模板。公开模板仍会被读取，用于检查 slug 冲突。

## 8. Docker

一个镜像在容器启动时构建站点，并用 nginx 提供访问（非 root、gzip、合理的缓存、带健康检查）。
发布的镜像：`ghcr.io/neosunxz/slides-commons:<版本>`（以及 `latest`）。

```sh
docker run -d --name slides -p 8080:80 \
  -e SC_SITE_URL=http://slides.intra/ \
  -v ./acme-templates:/templates:ro \
  ghcr.io/neosunxz/slides-commons:latest
```

- 存在 `/templates/sources.json` 时会作为 `--extra-sources` 加入，文件里的路径相对于 `/templates`。
  不挂载则只有公开模板。
- `SC_SITE_URL` 是用户访问站点所用的地址（提示词里的下载链接、CJK 字体分片）。`SC_ONLY_SOURCES=acme`
  只构建你们的来源；`SC_NO_KITS=1` 不生成「转换」「技能」页面。
- 站点**每次启动都会重建**：修改模板后执行 `docker restart slides`。首次启动需要几秒到一分钟；
  nginx 开始提供服务后容器变为 `healthy`。
- 构建失败（模板违反校验规则）时容器以非零状态退出，日志里写明原因，不会提供过期的站点。
  可先用 `npm run validate` 检查模板。
- `PORT` 修改容器内 nginx 监听的端口（默认 80；在不允许非特权进程绑定 80 端口的环境，如 rootless Podman 或部分 Kubernetes，用 `-e PORT=8080 -p 8080:8080`）。
- 需要 HTTPS 时在前面放一个终止 TLS 的反向代理（此时 `SC_SITE_URL` 用 https 地址）。
  只读根文件系统：加 `--tmpfs /tmp --tmpfs /srv/www:uid=101`。

自己构建镜像（上游 submodule 来自构建上下文，所以要先检出）：

```sh
git submodule update --init
docker build -t slides-commons .
```

[`docker/compose.example.yml`](../docker/compose.example.yml) 给出了 Compose 的写法。Windows：在
PowerShell 里用同样的命令（卷写成 `${PWD}/acme-templates`，不要写 `./acme-templates`）。
