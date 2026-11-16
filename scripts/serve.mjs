// Minimal static server for previewing dist/ locally. Usage: node scripts/serve.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.argv[2] || process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4' };

http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  let file = path.join(dist, rel);
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  let status = 200;
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { file = path.join(dist, '404.html'); status = 404; }
  res.writeHead(status, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Robots-Tag': 'noindex, nofollow' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Preview: http://localhost:${port}/`));
