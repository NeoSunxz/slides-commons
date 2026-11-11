// Shared Playwright `test` with a read-through cache for Google Fonts.
//
// Why: fonts.googleapis.com / fonts.gstatic.com are third-party hosts; from some networks
// they intermittently close connections (seen here: net::ERR_CONNECTION_CLOSED after 10 s),
// which made font and console checks flaky for reasons unrelated to the site.
//
// What stays the same: the browser still issues every font request to the real URL, so
// request/whitelist/console checks see exactly what a visitor's browser would request,
// and the font bytes are the real ones (fetched once from Google through the browser's
// own request, then replayed). Only the transport for those two hosts is cached, in the
// OS temp dir, keyed by URL + user agent. A cache miss that cannot be fetched after
// retries aborts the request, so a real outage still fails loudly.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test as base, expect } from '@playwright/test';

const CACHE = path.join(os.tmpdir(), 'slides-commons-test-fontcache');
const FONT_HOSTS = /^https:\/\/(fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net)\//;

function keyFor(url, ua) {
  return crypto.createHash('sha256').update(`${url}\n${ua}`).digest('hex');
}

// Bodies are stored decoded, so drop transfer-level headers before replaying.
function cleanHeaders(h) {
  const out = {};
  for (const [k, v] of Object.entries(h)) {
    if (!/^(content-encoding|content-length|transfer-encoding|connection)$/i.test(k)) out[k] = v;
  }
  return out;
}

async function handle(route) {
  const req = route.request();
  const ua = req.headers()['user-agent'] ?? '';
  const key = keyFor(req.url(), ua);
  const meta = path.join(CACHE, `${key}.json`);
  const body = path.join(CACHE, `${key}.bin`);
  try {
    if (fs.existsSync(meta) && fs.existsSync(body)) {
      const m = JSON.parse(fs.readFileSync(meta, 'utf8'));
      return await route.fulfill({ status: m.status, headers: cleanHeaders(m.headers), body: fs.readFileSync(body) });
    }
  } catch { /* corrupt entry: refetch */ }

  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await route.fetch({ timeout: 20_000 });
      const buf = await res.body();
      if (res.status() === 200) {
        fs.mkdirSync(CACHE, { recursive: true });
        const tmp = `${body}.${process.pid}.${Date.now()}`;
        fs.writeFileSync(tmp, buf);
        fs.renameSync(tmp, body); // atomic for concurrent workers
        fs.writeFileSync(meta, JSON.stringify({ status: res.status(), headers: res.headers(), url: req.url() }));
      }
      return await route.fulfill({ status: res.status(), headers: cleanHeaders(res.headers()), body: buf });
    } catch (e) {
      lastErr = e;
    }
  }
  console.warn(`font cache: giving up on ${req.url()}: ${lastErr?.message}`);
  return route.abort('connectionfailed');
}

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(FONT_HOSTS, handle);
    await use(context);
  },
});

export { expect };
