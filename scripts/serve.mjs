#!/usr/bin/env node
// Zero-dependency static server for site/.
//
//   node scripts/serve.mjs            # http://localhost:4173/
//   PORT=8080 node scripts/serve.mjs  # (PowerShell: $env:PORT=8080; node scripts/serve.mjs)
//
// HOST defaults to 127.0.0.1 (local only); set HOST=0.0.0.0 to expose it on the network.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.zip': 'application/zip',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    return send(res, 400, 'Bad Request');
  }
  if (pathname.includes('\0')) return send(res, 400, 'Bad Request');

  // Resolve inside ROOT only (handles ../, encoded separators and Windows backslashes).
  const segments = pathname.split(/[\\/]+/).filter(Boolean);
  if (segments.some((s) => s === '..' || /^[a-zA-Z]:$/.test(s))) return send(res, 403, 'Forbidden');
  let file = path.join(ROOT, ...segments);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden');

  let stat;
  try { stat = fs.statSync(file); } catch { return send(res, 404, 'Not Found'); }

  if (stat.isDirectory()) {
    // Directory URLs must end with "/" so relative links resolve (same as GitHub Pages).
    if (!pathname.endsWith('/')) {
      const u = new URL(req.url, 'http://x');
      return send(res, 301, 'Moved Permanently', { Location: u.pathname + '/' + u.search });
    }
    file = path.join(file, 'index.html');
    try { stat = fs.statSync(file); } catch { return send(res, 404, 'Not Found'); }
  }
  if (!stat.isFile()) return send(res, 404, 'Not Found');

  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
});

if (!fs.existsSync(ROOT)) {
  console.error('site/ does not exist yet; run "npm run build" first.');
  process.exit(1);
}

server.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? `port ${PORT} is already in use; set PORT to another value` : e.message);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`serving site/ at http://${HOST.includes(':') ? `[${HOST}]` : HOST}:${PORT}/  (Ctrl+C to stop)`);
});
