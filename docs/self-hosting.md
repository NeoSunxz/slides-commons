# Self-hosting slides-commons (company deployment)

You can build the gallery yourself and serve it inside your network, with your own templates
next to the public ones. The site is plain static files: no server code, no database.

## 1. Get the code

Two repositories: slides-commons (this one, with its upstream submodules) and your own template
repository (start from [`examples/private-source/`](../examples/private-source/README.md)).

```sh
git clone --recurse-submodules https://github.com/NeoSunxz/slides-commons.git
git clone git@your-host:acme/acme-templates.git          # your private templates
cd slides-commons
npm ci                                                    # Node.js 22 or later
```

## 2. Build

```sh
node scripts/build.mjs --extra-sources ../acme-templates/sources.json
```

The site is written to `site/` (use `--out <dir>` for another place). Same on Linux, macOS and
Windows PowerShell. Useful options (each has an environment variable):

| Option | Env | Meaning |
|---|---|---|
| `--extra-sources <file>` | `SC_EXTRA_SOURCES` | Add a sources file (same format as `sources.json`). Repeat the option, or separate several paths with the platform's path delimiter (`:` on Linux/macOS, `;` on Windows). Paths inside the file resolve from the file's own directory. |
| *(file)* | | `sources.local.json` in the slides-commons root (git-ignored) is added automatically. `--no-local-sources` turns that off. |
| `--only-sources <id,...>` | `SC_ONLY_SOURCES` | Build only these sources, for example only yours: `--only-sources acme`. Default: all. |
| `--site-url <url>` | `SC_SITE_URL` | Public base URL of your site, see below. |
| `--no-kits` | `SC_NO_KITS=1` | Skip the Convert and Skills pages and zips. |
| `--out <dir>` | `SC_OUT` | Output directory. |

Check your templates without building: `npm run validate -- --extra-sources ../acme-templates/sources.json`
(also accepts `--only-sources`). It checks metadata, design.md sections, the three screenshots,
external requests, sizes, and that every template slug is unique across all sources.

## 3. Serve

Copy or point any static web server at `site/`:

```sh
python3 -m http.server 8080 --directory site      # quick test (Windows: py -m http.server ...)
npm run serve                                      # built-in, http://127.0.0.1:4173/ (HOST=0.0.0.0 to share)
```

nginx: `root /srv/slides-commons/site;`. IIS: create a site whose physical path is `site/`. All
links are relative, so the site also works under a sub-path (`https://intranet/slides/`). Opening
`site/index.html` from disk (`file://`) works too, including previews; use it for a quick look.

## 4. Prompts that work on your intranet

The "Copy prompt" text tells the coding agent to download the template pack itself. For that the
build needs the address the site will have, otherwise the prompt asks the user to download the zip:

```sh
SC_SITE_URL=https://slides.acme.internal/ node scripts/build.mjs --extra-sources ../acme-templates/sources.json
```

The URL must be reachable from the machines where the agents run. The same build also hosts the
CJK font slices that the pack's `fonts/embed-cjk.mjs` downloads (under `fonts/cjk/`, about 70 MB
for the whole catalogue; the script falls back to jsDelivr if your host is not reachable). With an
air-gapped network, set `SC_SITE_URL` and make sure the site is reachable from the agent machines.
Fonts for the preview pages and the Latin fonts in every pack are already part of the build.

## 5. Upgrading

```sh
cd slides-commons
git pull
git submodule update --init
npm ci
node scripts/build.mjs --extra-sources ../acme-templates/sources.json
```

Then publish `site/` again. Your templates are outside the slides-commons directory, so nothing
conflicts. After you change a template, only the rebuild is needed.

## 6. Adding templates

- Scaffold: `npm run new-template -- <slug> --source-dir ../acme-templates`, edit the files, then
  `npm run screenshots -- --source-dir ../acme-templates --only <slug>` and validate.
- Convert an existing deck (PowerPoint, PDF, HTML) with the **Convert** page's kit, and put the
  resulting folder under `templates/` of your source.

Every template needs `template.html`, `design.md`, `template.json` and three 1920x1080
screenshots. Slugs must be unique across all sources. Private sources get an **Internal** badge;
the pack carries your `LICENSE`, or a `NOTICE.txt` ("internal use only") without one.

## 7. Only your templates

`--only-sources acme` builds a gallery with just your source: home counts, filters, footer and
credits adapt, and the home carousel falls back to the first of your templates that have
screenshots. The public templates are still read to check slug clashes.

## 8. Docker

One image builds the site when the container starts and serves it with nginx (non-root, gzip, sensible
caching, a healthcheck). Published image: `ghcr.io/neosunxz/slides-commons:<version>` (and `latest`).

```sh
docker run -d --name slides -p 8080:80 \
  -e SC_SITE_URL=http://slides.intra/ \
  -v ./acme-templates:/templates:ro \
  ghcr.io/neosunxz/slides-commons:latest
```

- `/templates/sources.json` (if present) is added as `--extra-sources`; the paths inside it resolve
  from `/templates`. Without the mount you get the public templates only.
- `SC_SITE_URL` is the address users reach the site at (prompt download links, CJK font slices).
  `SC_ONLY_SOURCES=acme` builds only your source; `SC_NO_KITS=1` skips the Convert and Skills pages.
- The site is rebuilt on **every start**: after changing templates, `docker restart slides`. The
  first start takes a few seconds to a minute; the container is `healthy` once nginx serves.
- If the build fails (a template breaks the validation rules) the container exits non-zero and the
  log says why; nothing stale is served. Check templates first with `npm run validate`.
- `PORT` changes the port nginx listens on inside the container (default 80; use `-e PORT=8080 -p 8080:8080` where unprivileged processes may not bind port 80, e.g. rootless Podman or some Kubernetes setups).
- Put a TLS-terminating reverse proxy in front for HTTPS (then `SC_SITE_URL` is the https address).
  Read-only root filesystem: add `--tmpfs /tmp --tmpfs /srv/www:uid=101`.

Build the image yourself (the upstream submodules are part of the build context, so check them out first):

```sh
git submodule update --init
docker build -t slides-commons .
```

[`docker-compose.example.yml`](../docker-compose.example.yml) shows the same with Compose. Windows:
use the same commands in PowerShell (use `${PWD}/acme-templates` instead of `./acme-templates` for the volume).
