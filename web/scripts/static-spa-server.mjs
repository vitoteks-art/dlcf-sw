import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = normalize(join(__dirname, '..', 'dist'));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '0.0.0.0';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  const type = mime[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable' });
  createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(JSON.stringify({ ok: true, service: 'dlcf-sw-portal', port }));
    return;
  }

  let requestPath = decodeURIComponent(url.pathname);
  if (requestPath === '/') requestPath = '/index.html';
  const candidate = normalize(join(root, requestPath));

  if (candidate.startsWith(root) && existsSync(candidate) && statSync(candidate).isFile()) {
    sendFile(res, candidate);
    return;
  }

  const fallback = join(root, 'index.html');
  if (existsSync(fallback)) {
    sendFile(res, fallback);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, host, () => {
  console.log(`DLCF SW portal serving ${root} on http://${host}:${port}`);
});
