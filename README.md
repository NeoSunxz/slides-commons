English | [中文](README.zh.md)

# slides-commons

Open HTML slide templates with prompts, for coding agents.

Gallery: https://neosunxz.github.io/slides-commons/

## What it is

A static gallery of HTML slide templates. Each template comes with a ready-to-use prompt and a downloadable pack, so your own coding agent (Claude Code, Codex, Cursor, ...) can build a deck in that design as a single HTML file.

## How to use

1. Open the gallery and preview a template.
2. Copy its prompt and paste it into your coding agent. The agent downloads the pack itself; if it can't, download the zip from the template page.
3. Answer the agent's questions about your talk. You get one self-contained HTML file on a fixed 1920×1080 stage, with fonts embedded so it works offline.

## What else is on the site

- [Convert](https://neosunxz.github.io/slides-commons/convert/): turn your own PPT or images into a template. For personal use, runs locally, nothing is uploaded.
- [Skills](https://neosunxz.github.io/slides-commons/skills/): three agent skills (deck, convert, cjk-fonts).
- Self-hosting, private templates, Docker: see [docs/self-hosting.md](docs/self-hosting.md).

  ```sh
  docker run -d -p 8080:80 -e SC_SITE_URL=http://localhost:8080/ ghcr.io/neosunxz/slides-commons:latest
  ```

## Credits

Templates by Zara Zhang ([beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates), [frontend-slides](https://github.com/zarazhangrui/frontend-slides); MIT), Guizang ([guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill); AGPL-3.0) and NeoSun (style presets; MIT). slides-commons is an independent project, not an official project of any of them. Full list: [CREDITS.md](CREDITS.md).

## Development

Requires Node.js 22 or later.

```sh
git clone --recurse-submodules git@github.com:NeoSunxz/slides-commons.git
cd slides-commons
npm ci
npm run build      # build the site into site/
npm run serve      # http://localhost:4173/
npm test           # Playwright tests (run `npx playwright install chromium` first)
```

To add a template or report a prompt problem, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Site code: MIT, see [LICENSE](LICENSE). Templates and fonts keep their own licenses.
