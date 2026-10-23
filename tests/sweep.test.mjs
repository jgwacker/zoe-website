import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resolveDist, serveDist, launch } from './helpers.mjs';

// Pre-existing broken links found on `main` before this redesign. List them here with a
// comment (rather than fixing them in this branch) and report them to the user.
const KNOWN_BROKEN = new Set([
  // Pre-existing on main: masonry gallery CSV row lists "portfolio-32.jpg" without its "portfolio/" folder.
  '/images/portfolio-32.jpg',
]);

function* htmlFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (p.endsWith('.html')) yield p;
  }
}

test('every internal link and image in dist/ resolves', () => {
  const broken = [];
  for (const file of htmlFiles('dist')) {
    const html = fs.readFileSync(file, 'utf8');
    for (const [, url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
      if (KNOWN_BROKEN.has(url)) continue;
      if (!fs.existsSync(resolveDist(url))) broken.push(`${path.relative('dist', file)} -> ${url}`);
    }
  }
  assert.deepEqual([...new Set(broken)], []);
});

const PAGES = ['/', '/about/', '/photography/awards/', '/photography/awards/peninsula-photo-competition-2025/',
  '/photography/awards/npcfk-competition-color-2025/', '/travel/trips/egypt-2025/', '/music/concerts/laufey-2025/',
  '/music/cello/', '/blog/', '/photography/awards/npcfk-competition-shelter-2026/',
  '/academics/summer-programs/johns-hopkins-cty-2026/', '/photography/portfolio/'];

test('no sideways scroll at 390px on the key pages', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const wide = [];
  for (const route of PAGES) {
    await page.goto(srv.url + route, { waitUntil: 'domcontentloaded' });
    const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    if (sw > iw) wide.push(`${route}: ${sw}px`);
  }
  assert.deepEqual(wide, []);
});
