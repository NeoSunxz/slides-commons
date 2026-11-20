# Self-hosting slides-commons (company deployment)

You can run the gallery inside your own network, with your company's templates next to the public
ones. The site is plain static files: no server code, no database. Your colleagues open it in a
browser, copy a prompt, and their coding agent does the rest.

Contents: [Quick start with Docker](#1-quick-start-with-docker) ·
[Build from source](#2-build-from-source) ·
[Adding your company's templates](#3-adding-your-companys-templates) ·
[Showing only your templates](#4-showing-only-your-templates) ·
[How colleagues use it](#5-how-colleagues-use-it) ·
[Restricted or offline networks](#6-restricted-or-offline-networks) ·
[Reference](#7-reference)

## 1. Quick start with Docker

One image builds the site when the container starts and serves it with nginx (non-root, gzip,
caching, a healthcheck). Published image: `ghcr.io/neosunxz/slides-commons:<version>` (and `latest`).

```sh
docker run -d --name slides -p 8080:80 \
  -e SC_SITE_URL=http://slides.intra/ \
  -v "$PWD/acme-templates":/templates:ro \
  ghcr.io/neosunxz/slides-commons:latest
```

- `SC_SITE_URL` is the address your colleagues (and their agents) open the site at. Set it:
  without it the prompts ask the user to download the pack by hand and no fonts are hosted.
- The mount is optional. If `/templates/sources.json` exists it is added as your own source
  (see [section 3](#3-adding-your-companys-templates)); without it you get the public templates only.
- Open `http://localhost:8080/`. The first start takes a few seconds to a minute; the container
  is `healthy` once nginx serves.

**Upgrade** (a new slides-commons version): pull the image and recreate the container.

```sh
docker pull ghcr.io/neosunxz/slides-commons:latest
docker rm -f slides
docker run -d --name slides ...        # the same command as above
```

With Compose: `docker compose pull && docker compose up -d` (see [`docker/compose.example.yml`](../docker/compose.example.yml)).
Pin a version (`:0.4.1`) instead of `latest` if you want upgrades to be deliberate.

**After you change templates**: `docker restart slides`. The site is rebuilt on **every start**, from
whatever is in the mounted directory. If the build fails (a template breaks the validation rules)
the container exits non-zero and its log says why; nothing stale is served. Check first with
`npm run validate` (section 3).

## 2. Build from source

Needed if you do not use Docker, or to author templates (screenshots need a browser).

```sh
git clone --recurse-submodules https://github.com/NeoSunxz/slides-commons.git
cd slides-commons
npm ci                                    # Node.js 22 or later
SC_SITE_URL=https://slides.acme.internal/ node scripts/build.mjs --extra-sources ../acme-templates/sources.json
```

The site is written to `site/` (use `--out <dir>` for another place). The same commands work on
Linux, macOS and Windows PowerShell (set the variable with `$env:SC_SITE_URL="https://..."` there, or use `--site-url`).
Serve `site/` with any static web server:

```sh
npm run serve                                      # built-in, http://127.0.0.1:4173/ (HOST=0.0.0.0 to share)
python3 -m http.server 8080 --directory site       # quick test (Windows: py -m http.server ...)
```

nginx: `root /srv/slides-commons/site;`. IIS: a site whose physical path is `site/`. All links are
relative, so the site also works under a sub-path (`https://intranet/slides/`). Opening
`site/index.html` from disk (`file://`) works for a quick look, including previews; prompts then
cannot download packs, so use a real address for colleagues.

**Upgrade:**

```sh
git pull && git submodule update --init && npm ci
# build again with the same command, then publish site/ again
```

Your templates live outside this directory, so nothing conflicts. After you change a template only
the rebuild is needed.

## 3. Adding your company's templates

Your templates live in their own repository (for example `acme-templates/`), outside slides-commons,
so upgrades never conflict with them. One workflow, start to finish:

1. **Copy the sample.** Copy [`examples/private-source/`](../examples/private-source/README.md) to your
   own repository. It holds `sources.json`, one valid example template (`acme-quarterly`), three
   screenshots and a CI workflow. Edit `sources.json` (fields below).

2. **Create templates**, in one of two ways:
   - **Convert an existing deck.** Open the site's **Convert** page, copy its prompt and paste it
     into your coding agent (or download `convert-kit.zip`). Give the agent a PowerPoint `.pptx`
     file, or slide images (screenshots, exported slides; a PDF works once converted to images
     with `pdftoppm -png -r 80 deck.pdf page`). HTML decks are not supported. The agent writes
     a folder `<slug>/` with `design.md`, `template.json` and `template.html`; move it to
     `acme-templates/templates/<slug>/`.
   - **Start from a scaffold:**
     `npm run new-template -- <slug> --source-dir ../acme-templates`, then edit the files. Every
     value you must decide is marked `TODO`; validation fails until all are gone.

3. **Screenshots, then validate** (in the slides-commons checkout; screenshots need Chromium once:
   `npx playwright install chromium`):

   ```sh
   npm run screenshots -- --source-dir ../acme-templates --only <slug>
   npm run validate -- --extra-sources ../acme-templates/sources.json
   ```

   Every template needs `template.html`, `design.md` (with the Fixed-Stage Policy, Signature Moves
   and CJK sections), `template.json` and exactly three 1920x1080 PNG screenshots
   `screenshots/<slug>-1..3.png`. Validation also checks metadata, size limits, `TODO` markers and
   external requests (fonts only), and that every slug is unique across all sources, including the
   public ones.

4. **CI in your repository.** The sample `.github/workflows/validate.yml` checks out your repository
   and slides-commons (pinned to a release tag) and runs the same validation and a smoke build on
   every pull request. Adjust `SLIDES_COMMONS_REF` and `SOURCE_ID`.

5. **Rebuild or restart** (Docker: `docker restart slides`; source: build again).

### The source file

`sources.json` in your repository (the schema is [`src/schema/sources.schema.json`](../src/schema/sources.schema.json)):

| Field | Meaning |
|---|---|
| `id` | Lowercase, unique, for example `acme`. Used by `--only-sources` and `SC_ONLY_SOURCES`. |
| `name` | Source name shown on cards, pages, footer and credits, and in the "internal use only" notices. |
| `nameZh` | Same, shown on the Chinese pages (default: `name`). |
| `author`, `authorZh` | Maintainer shown on the credits page (`authorZh` only in the Chinese notices). |
| `private: true` | Marks the source as internal, see below. |
| `license` | Any text (`Proprietary`, `Internal use only`). Not limited to open-source licenses. |
| `path` | Directory of the templates, relative to this file (`.` for the repository root). |
| `repo` | Optional link to your repository, shown on pages as the source. Without it pages show the source name only. |
| `templateUrl` | Optional back-link pattern for one template's directory, with `{slug}`, for code hosts that do not use the GitHub layout (`https://git.acme.internal/templates/-/tree/main/templates/{slug}`). |

**What "Internal" means.** Cards, detail pages, credits and footer carry an **Internal** badge; no
GitHub back-link is required. The pack and the prompt carry the terms: the prompt (English and
Chinese) starts with a line "Internal use only: do not publish or redistribute the deck, the pack
or its design outside <your name>", and the pack's README repeats it. Open-source rules do not
apply (no license list, no author URL, no `derivedFrom`); quality rules do.

**LICENSE or NOTICE.txt.** If the template's folder has a `LICENSE` file, it goes into that
template's pack; otherwise the source folder's `LICENSE` does. With neither, the pack gets a
`NOTICE.txt` ("Internal use only, do not distribute outside <name>", English and Chinese).

**Chinese translations (optional).** The Chinese pages show your templates in English unless you
translate them. Put `i18n/zh.json` and `i18n/zh.sources.json` next to your `sources.json`, in the
format of [`src/i18n/zh.json`](../src/i18n/zh.json): `terms` (tag translations) and `templates`
(per slug: `tagline`, `description`, `best_for`, `avoid_for`, `occasion`, `palette_description`,
`typography_style`). Where both define the same term or slug, the slides-commons entry wins. After
a person has confirmed that the translations match the English text, run
`npm run i18n:sync -- --extra-sources ../acme-templates/sources.json`; it records a hash of each
English text in `zh.sources.json`, and builds warn when the English changes later. Missing
translations fall back to English with a warning.

**Several places for the source.** Besides `--extra-sources` / `SC_EXTRA_SOURCES`, a file named
`sources.local.json` in the slides-commons root or in `sources/` (git-ignored) is added
automatically. Paths inside it resolve from that file's own directory, and its `i18n/` folder sits next to it.
`--no-local-sources` (or `SC_NO_LOCAL_SOURCES=1`) turns it off.

## 4. Showing only your templates

`SC_ONLY_SOURCES=acme` (or `--only-sources acme`) builds a gallery with just your source: the home
counts, filters, footer and credits adapt, and the carousel falls back to your first templates that
have screenshots. The public templates are still read, to check slug clashes. Several ids are
comma-separated.

The **Convert** and **Skills** pages and their zips are built in either case. `SC_NO_KITS=1` (or
`--no-kits`) leaves them out.

## 5. How colleagues use it

1. Open the intranet site (the address you set in `SC_SITE_URL`) and pick a template.
2. Click **Copy prompt** and paste it into their coding agent (Claude Code, Codex, Cursor, ...).
3. The agent downloads the template pack from your `SC_SITE_URL` (`zip/<slug>.zip`), unpacks it,
   asks about purpose, page count and density, and writes a single HTML deck. The pack's fonts
   come from your server too (section 6). The small **Offline? Download the pack (.zip)** link is for people
   who work offline.

The **Convert** and **Skills** pages are served from the intranet as well, with their zips
(`convert-kit.zip`, `slides-commons-skills.zip`). The Skills page's install prompt downloads the
skills from the same site, and the Convert prompt downloads the kit from it, so no one needs
access to the public site.

## 6. Restricted or offline networks

The build and the packs were made so an intranet with no internet access works once the site is
reachable from the agent machines. What that covers, and what it does not:

| Works without internet (when `SC_SITE_URL` is set and reachable) | How |
|---|---|
| The site's own pages, screenshots, type | Embedded or copied into `site/`; no font or script requests. |
| Latin fonts in the template **previews** | Inlined into the preview copy as data URIs. |
| Latin fonts in every **pack** | The pack's `fonts/` holds the woff2 files and `fonts.css`; the prompt tells the agent to embed them in the deck as base64. |
| CJK fonts in decks | The pack has `fonts/embed-cjk.mjs`. It downloads only the slices a deck uses, first from `<SC_SITE_URL>fonts/cjk/` (hosted by the build, about 67 MB) and only if that fails from jsDelivr, and embeds them. |
| Latin fonts in the **Convert kit** and skills | `fonts/embed-latin.mjs` downloads from `<SC_SITE_URL>fonts/latin/` first (about 9 MB), then jsDelivr. |
| Prompts, packs, kit and skills downloads | All from `SC_SITE_URL`. |

Where the public internet is still needed:

- The Google Fonts `<link>` stays in every deck as a fallback only; offline it fails silently and the embedded fonts are used.
- **CJK text in the previews** of the templates that name CJK fonts: the preview copy keeps a Google Fonts link for those, so offline it shows a system CJK font. Packs and decks are not affected.
- Fonts that no installed package provides: `neon-cyber` loads Fontshare, and Noto Serif JP and Noto Sans KR stay on Google Fonts.
- Three templates (`coral`, `cartesian`, `retro-windows`) load chart.js from jsDelivr, so their charts do not render offline; the prompt tells the agent to draw charts without a CDN. The two `guizang-*` templates load `motion` from jsDelivr.
- The coding agent itself needs its model service, of course, and your build machine needs npm and GitHub (or a mirror) once, unless you build elsewhere and copy `site/`, or build the Docker image elsewhere (`docker save` / `docker load`).
- Optional: `pip install fonttools brotli` on the agent machine lets `embed-cjk.mjs` cut the CJK slices down to the used characters (otherwise a deck grows by a few MB per weight).

Test it: build with the real `SC_SITE_URL`, then disconnect a machine from the internet but not from the
intranet, and make a deck from a prompt.

## 7. Reference

### Build options

```sh
node scripts/build.mjs [options]        # npm run build; the same options work for npm run validate --
```

| Option | Env | Meaning |
|---|---|---|
| `--extra-sources <file>` | `SC_EXTRA_SOURCES` | Add a sources file (same format as `sources.json`). Repeat the option, or separate several paths with the platform's path delimiter (`:` on Linux/macOS, `;` on Windows). |
| `--no-local-sources` | `SC_NO_LOCAL_SOURCES=1` | Ignore `sources.local.json`. |
| `--only-sources <id,...>` | `SC_ONLY_SOURCES` | Build only these sources. |
| `--site-url <url>` | `SC_SITE_URL` | Public base URL of your site (a trailing slash is added). Prompts download packs from it; CJK and Latin font files are hosted under it. |
| `--no-kits` | `SC_NO_KITS=1` | Skip the Convert and Skills pages and zips. |
| `--out <dir>` | `SC_OUT` | Output directory (default `site/`; replaced only if empty, the default, or built by this tool). |
| `--sources <file>` | `SC_SOURCES` | Replace the default `sources/sources.json` (fixtures, tests). |
| `--i18n-dir <dir>` | `SC_I18N_DIR` | Directory with the slides-commons `zh.json` / `zh.sources.json`. |
| | `SOURCE_DATE_EPOCH` | Timestamp of zip entries (default 1980-01-01, so builds are reproducible). |

### Docker

| Variable | Meaning |
|---|---|
| `SC_SITE_URL` | The address users reach the site at (prompt download links, hosted fonts). |
| `SC_ONLY_SOURCES` | Comma-separated source ids to build, for example `acme`. |
| `SC_NO_KITS` | `1` skips the Convert and Skills pages. |
| `SC_EXTRA_SOURCES` | More sources files, by path inside the container. `/templates/sources.json` is always added if it exists. |
| `PORT` | Port nginx listens on inside the container (default 80). Use `-e PORT=8080 -p 8080:8080` where unprivileged processes may not bind port 80 (rootless Podman, some Kubernetes setups). |

- **HTTPS:** put a TLS-terminating reverse proxy in front; `SC_SITE_URL` is then the https address.
- **Read-only root filesystem:** add `--tmpfs /tmp --tmpfs /srv/www:uid=101`.
- **Compose:** [`docker/compose.example.yml`](../docker/compose.example.yml) shows the same with Compose, including the optional variables.
- **Build the image yourself** (the upstream submodules are part of the build context, so check them out first): `git submodule update --init && docker build -t slides-commons .`
- If `/templates` has files but no `sources.json`, the log warns and no templates are added.

### Windows notes

Use PowerShell with the same commands. Differences: environment variables are set with
`$env:SC_SITE_URL = "https://..."`, several paths in `SC_EXTRA_SOURCES` are separated by `;`, bind
mounts use `-v "${PWD}/acme-templates:/templates:ro"`, and the Python quick-test server is `py -m http.server`.
The prompts give agents the right command per platform (`open` / `xdg-open` / `start`, and
`Expand-Archive` when `unzip` is not available), so colleagues on Windows need nothing extra.

### Checking only

`npm run validate -- --extra-sources ../acme-templates/sources.json` runs every check without
building (it also accepts `--only-sources`). The build runs the same checks first.
