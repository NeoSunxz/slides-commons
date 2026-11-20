[English](README.md) | 中文

# slides-commons

开放的 HTML 幻灯片模板库，配套提示词，交给你的 coding agent 使用。

画廊：https://neosunxz.github.io/slides-commons/

## 这是什么

一个静态的 HTML 幻灯片模板画廊。每个模板都有可直接使用的提示词和素材包，你自己的 coding agent（Claude Code、Codex、Cursor 等）就能按该模板的设计生成一份单文件 HTML 幻灯片。

## 怎么用

1. 打开画廊，预览模板。
2. 复制模板的提示词，粘贴给你的 coding agent。agent 会自己下载素材包；下载不了时，到模板页手动下载 zip。
3. 回答 agent 关于演讲的提问。最终得到一个自包含的 HTML 文件：固定 1920×1080 画布，字体已内嵌，离线可用。

## 站点上的其他内容

- [转换](https://neosunxz.github.io/slides-commons/zh/convert/)：把你自己的 PPT 或图片变成模板。仅供个人使用，在本地运行，不上传任何内容。
- [技能](https://neosunxz.github.io/slides-commons/zh/skills/)：三个 agent 技能（deck、convert、cjk-fonts）。
- 自托管、私有模板、Docker：见 [docs/self-hosting.zh.md](docs/self-hosting.zh.md)。

  ```sh
  docker run -d -p 8080:80 -e SC_SITE_URL=http://localhost:8080/ ghcr.io/neosunxz/slides-commons:latest
  ```

## 致谢

模板来自 Zara Zhang（[beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates)、[frontend-slides](https://github.com/zarazhangrui/frontend-slides)；MIT）、歸藏 Guizang（[guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill)；AGPL-3.0）和 NeoSun（风格预设；MIT）。slides-commons 是独立项目，不是上述任何作者的官方项目。完整名单见 [CREDITS.md](CREDITS.md)。

## 开发

需要 Node.js 22 或更高版本。

```sh
git clone --recurse-submodules git@github.com:NeoSunxz/slides-commons.git
cd slides-commons
npm ci
npm run build      # 构建站点到 site/
npm run serve      # http://localhost:4173/
npm test           # Playwright 测试（先运行 `npx playwright install chromium`）
```

想新增模板或反馈提示词问题，见 [CONTRIBUTING.md](CONTRIBUTING.md#贡献指南)。

## 许可

站点代码：MIT，见 [LICENSE](LICENSE)。模板和字体沿用各自的许可。
