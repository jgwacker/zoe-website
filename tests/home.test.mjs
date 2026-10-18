import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, serveDist, launch } from './helpers.mjs';

const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const html = readDist('/');

test('static homepage: first photo, all titles, monogram, intro, section rows', () => {
  assert.match(html, /<img[^>]*data-art[^>]*src="\/images\/display\/cinderello\.jpg"|<img[^>]*src="\/images\/display\/cinderello\.jpg"[^>]*data-art/);
  assert.match(html, /Little stories, <em[^>]*>found<\/em> on the road/);
  for (const it of data.items) assert.ok(html.includes(it.title), `missing title ${it.title}`);
  assert.match(html, /class="monogram"[^>]*>ZW</);
  assert.ok(html.includes('tell little stories'));
  for (const s of data.sections) assert.match(html, new RegExp(`href="${s.href}"`));
  assert.doesNotMatch(html, /src="\/images\/portfolio\/portfolio-/, 'homepage must use resized display images');
});

test('exhibit controls: buttons, arrow keys, ignores typing and modifiers', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  const title = () => page.locator('[data-title]').textContent();

  assert.equal(await title(), data.items[0].title);
  await page.click('[data-next]');
  assert.equal(await title(), data.items[1].title);
  assert.equal(await page.locator('[data-cur]').textContent(), '02');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await title(), data.items[0].title);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await title(), data.items[5].title, 'wraps around to the last photo');

  await page.keyboard.press('Alt+ArrowRight');
  assert.equal(await title(), data.items[5].title, 'modifier keys are ignored');

  await page.evaluate(() => { const i = document.createElement('input'); i.id = 'probe'; document.body.append(i); });
  await page.focus('#probe');
  await page.keyboard.press('ArrowRight');
  assert.equal(await title(), data.items[5].title, 'typing in a field does not change the photo');
});

test('reduced motion swaps the photo instantly with no fade', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  await page.click('[data-next]');
  const state = await page.evaluate(() => {
    const img = document.querySelector('[data-art]');
    return { src: img.getAttribute('src'), fading: img.classList.contains('fade') };
  });
  assert.equal(state.src, '/images/display/portfolio-64.jpg');
  assert.equal(state.fading, false);
});

test('without JavaScript the first photo and label show and controls are hidden', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('[data-art]').isVisible(), true);
  assert.equal(await page.locator('[data-title]').textContent(), 'Cinderello');
  assert.equal(await page.locator('[data-controls]').isVisible(), false);
});

test('homepage has no sideways scroll at 390px', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  assert.ok(sw <= iw, `scrollWidth ${sw} > innerWidth ${iw}`);
});
