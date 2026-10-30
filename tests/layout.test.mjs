import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist, serveDist, launch } from './helpers.mjs';

const AWARD = '/photography/awards/peninsula-photo-competition-2025/';
const LONG = '/photography/awards/npcfk-competition-color-2025/';

test('title band shows the section eyebrow and page title', () => {
  const html = readDist(AWARD);
  assert.match(html, /<section[^>]*class="title-band"[\s\S]*?<p[^>]*class="eyebrow"[^>]*>Photography<\/p>[\s\S]*?<h1[^>]*class="post-title[^"]*"/);
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

test('footer reads "Menlo Park, California · © <year>" under a decorative outlined name', () => {
  const html = readDist('/about/');
  assert.match(html, /<div[^>]*class="big script"[^>]*aria-hidden="true"[^>]*>Zoe Wacker<\/div>/);
  assert.match(html, /Menlo Park, California · © \d{4}/);
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

const SHELTER = '/photography/awards/npcfk-competition-shelter-2026/';

test('short titles are script; titles over 40 characters switch to the serif long-title', () => {
  assert.match(readDist(SHELTER), /<h1[^>]*class="post-title long-title"/);
  assert.match(readDist('/about/'), /<h1[^>]*class="post-title script"/);
});

test('long title fits its box at 360px and 390px', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  for (const width of [360, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(srv.url + SHELTER, { waitUntil: 'domcontentloaded' });
    const { sw, cw } = await page.evaluate(() => {
      const h = document.querySelector('.post-title');
      return { sw: h.scrollWidth, cw: h.clientWidth };
    });
    assert.ok(sw <= cw, `${width}px: title scrollWidth ${sw} > clientWidth ${cw}`);
    await page.close();
  }
});

test('printing a page gives a white background and dark text', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/travel/trips/egypt-2025/', { waitUntil: 'domcontentloaded' });
  await page.emulateMedia({ media: 'print' });
  const s = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    return { bg: b.backgroundColor, fg: getComputedStyle(document.querySelector('.content p')).color };
  });
  assert.equal(s.bg, 'rgb(255, 255, 255)');
  assert.equal(s.fg, 'rgb(42, 30, 30)');
});
