import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist, serveDist, launch } from './helpers.mjs';

const AWARD = '/photography/awards/peninsula-photo-competition-2025/';
const LONG = '/photography/awards/npcfk-competition-color-2025/';

test('title band shows the section eyebrow and page title', () => {
  const html = readDist(AWARD);
  assert.match(html, /<section[^>]*class="title-band"[\s\S]*?<p[^>]*class="eyebrow"[^>]*>Photography<\/p>[\s\S]*?<h1[^>]*class="post-title"/);
  assert.match(readDist('/about/'), /<p[^>]*class="eyebrow"[^>]*>About<\/p>/);
  assert.doesNotMatch(readDist('/blog/'), /<p[^>]*class="eyebrow"[^>]*><\/p>/, 'no empty eyebrow');
});

test('sidebar is a numbered list with the current page marked', () => {
  const html = readDist(AWARD);
  const list = html.match(/<ol[^>]*class="vlist"[^>]*>([\s\S]*?)<\/ol>/)?.[1] ?? '';
  assert.match(list, /<span[^>]*class="n"[^>]*>01<\/span>/);
  assert.match(list, /href="\/photography\/awards\/peninsula-photo-competition-2025"[^>]*aria-current="page"/);
  assert.equal((list.match(/aria-current="page"/g) || []).length, 1);
});

test('footer reads "© <year> Zoe Wacker · Menlo Park, California"', () => {
  assert.match(readDist('/about/'), /© \d{4} Zoe Wacker · Menlo Park, California/);
});

test('long page title does not cause sideways scroll at 390px', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + LONG, { waitUntil: 'domcontentloaded' });
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  assert.ok(sw <= iw, `scrollWidth ${sw} > innerWidth ${iw}`);
});
