import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.xml': 'application/xml', '.woff': 'font/woff', '.json': 'application/json',
};

/** Map a site route like "/about/" to its file in dist/. */
export function resolveDist(route) {
  const clean = decodeURIComponent(route.split('#')[0].split('?')[0]);
  let p = path.join(DIST, clean);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  else if (!path.extname(p)) p = path.join(p, 'index.html');
  return p;
}

export function readDist(route) {
  return fs.readFileSync(resolveDist(route), 'utf8');
}

/** Serve dist/ on a random localhost port (root-relative /images/... URLs work). */
export async function serveDist() {
  const server = http.createServer((req, res) => {
    const file = resolveDist(req.url);
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return { url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

export const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Launch the locally installed Chrome via playwright-core. */
export async function launch() {
  const { chromium } = await import('playwright-core');
  return chromium.launch({ executablePath: CHROME });
}

/** WCAG contrast ratio between two #RRGGBB colors. */
export function contrast(a, b) {
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
