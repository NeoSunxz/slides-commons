# slides-commons: one image that builds the gallery when the container starts, then serves it.
#
#   git submodule update --init            # REQUIRED before building: upstream/ comes from the build context
#   docker build -t slides-commons .
#   docker run -p 8080:80 -e SC_SITE_URL=http://localhost:8080/ -v ./acme-templates:/templates:ro slides-commons
#
# See docs/self-hosting.md (Docker).

ARG NGINX_IMAGE=nginx:stable-bookworm

# ---- build stage: dependencies, and a check that the build works -----------------------------
FROM node:22-bookworm-slim AS builder
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    npm_config_audit=false npm_config_fund=false
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci \
 # The site build does not use Playwright (tests and screenshots do); the font packages stay.
 && rm -rf node_modules/@playwright node_modules/playwright node_modules/playwright-core node_modules/.bin/playwright*

COPY LICENSE .gitmodules ./
COPY sources ./sources
COPY scripts ./scripts
COPY src ./src
COPY kits ./kits
COPY collections ./collections
COPY upstream ./upstream

# Fail fast, with a clear message, when the submodules were not checked out.
RUN for d in $(sed -n 's/^[[:space:]]*path[[:space:]]*=[[:space:]]*//p' .gitmodules); do \
      if [ -z "$(ls -A "$d" 2>/dev/null)" ]; then \
        echo "ERROR: $d is empty. Run 'git submodule update --init' in the repository, then build again." >&2; exit 1; \
      fi; \
    done

# Build once: proves the image works and warms the thumbnail cache that the start-up build reuses.
RUN node scripts/build.mjs --out /tmp/warm-site \
 && rm -rf /tmp/warm-site \
 # The site only uses the woff2 files of the font packages; the legacy .woff copies are about 200 MB.
 && find node_modules/@fontsource node_modules/@fontsource-variable -name '*.woff' -delete

# ---- runtime stage ---------------------------------------------------------------------------
# The official nginx image (Debian, no package installs needed) plus the node binary from the build stage.
FROM ${NGINX_IMAGE}
LABEL org.opencontainers.image.title="slides-commons" \
      org.opencontainers.image.description="Open HTML slide templates with prompts, for coding agents. Builds the gallery at start-up and serves it with nginx." \
      org.opencontainers.image.source="https://github.com/NeoSunxz/slides-commons" \
      org.opencontainers.image.licenses="MIT"

COPY --from=builder /usr/local/bin/node /usr/local/bin/node

WORKDIR /app
COPY --from=builder --chown=nginx:nginx /app /app
COPY docker/nginx.conf /etc/nginx/slides-commons.conf.template
COPY --chmod=0755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh
# (a checkout with CRLF line endings would break the shell script)
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh /etc/nginx/slides-commons.conf.template \
 # /srv/www belongs to the unprivileged user: the build may delete and recreate its site directory there.
 && mkdir -p /srv/www /templates && chown nginx:nginx /srv/www \
 && rm -f /etc/nginx/conf.d/default.conf

ENV NODE_ENV=production PORT=80
USER nginx
EXPOSE 80
# Healthy once the start-up build has finished and nginx answers.
HEALTHCHECK --interval=15s --timeout=5s --start-period=180s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD []
