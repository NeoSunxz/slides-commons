#!/bin/sh
# Container start: build the site, then serve it with nginx.
#
#   /templates/sources.json   (mounted, optional)  added with --extra-sources
#   SC_SITE_URL               public URL of the site (prompts' download links)
#   SC_ONLY_SOURCES           comma-separated source ids to build (default: all)
#   SC_EXTRA_SOURCES          more sources files (path-list), also honoured by the build
#   SC_NO_KITS=1              skip the Convert / Skills pages
#   PORT                      port nginx listens on inside the container (default 80; use 8080 where
#                             unprivileged processes may not bind port 80, for example rootless Podman)
#
# The site is rebuilt on every start. If the build fails nothing is served: the container exits
# non-zero with the build's message in its log (a stale or half-built site is never published).
set -eu

SITE=/srv/www/site
log() { echo "[slides-commons] $*"; }

# Fresh output (a restarted container keeps its old files; the build only clears a directory it made).
rm -rf "$SITE"
mkdir -p "$SITE"

set -- --out "$SITE"
if [ -f /templates/sources.json ]; then
  log "adding /templates/sources.json"
  set -- "$@" --extra-sources /templates/sources.json
elif [ -d /templates ] && [ -n "$(ls -A /templates 2>/dev/null)" ]; then
  log "warning: /templates has files but no sources.json; no templates added (see docs/self-hosting.md)"
fi
[ -n "${SC_SITE_URL:-}" ] && log "site URL: $SC_SITE_URL" || log "SC_SITE_URL is not set: prompts will ask the user to download the pack by hand"
[ -n "${SC_ONLY_SOURCES:-}" ] && log "only sources: $SC_ONLY_SOURCES"

log "building the site (this takes a few seconds to a minute)"
if ! node scripts/build.mjs "$@"; then
  log "BUILD FAILED, not serving. Fix the problem above (for example run: npm run validate -- --extra-sources <your sources.json>) and restart the container."
  exit 1
fi
[ -f "$SITE/index.html" ] || { log "build produced no index.html, not serving"; exit 1; }

PORT="${PORT:-80}"
sed "s/__PORT__/${PORT}/g" /etc/nginx/slides-commons.conf.template > /tmp/nginx.conf
log "serving on port ${PORT}"
exec nginx -c /tmp/nginx.conf -g 'daemon off;'
