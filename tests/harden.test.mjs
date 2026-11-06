import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, serveDist, launch } from './helpers.mjs';

const home = readDist('/');
const about = readDist('/about/');

test('homepage link preview: description, canonical on zoewacker.com, and a real share image', () => {
  const desc = home.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  assert.ok(desc.length > 60, `description is "${desc}"`);
  assert.match(desc, /Zoe Wacker/);
  assert.match(home, /<link rel="canonical" href="https:\/\/zoewacker\.com\/">/);
  const og = home.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? '';
  assert.match(og, /^https:\/\/zoewacker\.com\/images\/display\/[^"]+\.jpg$/, `og:image is ${og}`);
  assert.doesNotMatch(home, /blog-placeholder/);
  assert.match(home, new RegExp(`<meta property="twitter:image" content="${og.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
});

test('every page has a skip link that targets the main landmark', () => {
  for (const [name, html] of [['home', home], ['about', about], ['404', fs.readFileSync('dist/404.html', 'utf8')]]) {
    assert.match(html, /<a class="skip"[^>]*href="#main"[^>]*>Skip to content<\/a>/, `${name}: skip link`);
    assert.match(html, /<main id="main" tabindex="-1"/, `${name}: main#main`);
  }
});

test('homepage heading outline names every section', () => {
  const h2s = [...home.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
  for (const want of ['Now showing', 'Featured photos', 'Music', 'Hi! I’m Zoe.']) {
    assert.ok(h2s.some((h) => h.startsWith(want)), `h2 "${want}" missing from ${JSON.stringify(h2s)}`);
  }
  assert.ok(h2s.some((h) => h.startsWith('Photo awards')));
  assert.ok(h2s.some((h) => h.startsWith('Travel')));
});

test('programme numerals are decorative and strip captions separate title from place', () => {
  assert.match(home, /<span class="n" aria-hidden="true"[^>]*>I<\/span>/);
  assert.doesNotMatch(home, /<span class="n"(?: data-astro-cid-\w+)?>IX<\/span>/);
  assert.match(home, /<figcaption[^>]*><span[^>]*>Cinderello<\/span><span class="sep"[^>]*>·<\/span><span class="sr-only"[^>]*>, <\/span><span[^>]*>[^<]+<\/span><\/figcaption>/);
});

test('404 page exists, uses the layout, and links back to the bill', () => {
  const html = fs.readFileSync('dist/404.html', 'utf8');
  assert.match(html, /<h1[^>]*class="post-title script"[^>]*>Nothing showing here<\/h1>/);
  for (const h of ['/', '/travel', '/photography', '/music', '/academics', '/about']) {
    assert.match(html, new RegExp(`<a href="${h}"`), `404 links ${h}`);
  }
});

test('skip link is hidden until focused, then visible and tall enough to tap', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + '/', { waitUntil: 'load' });
  const before = await page.evaluate(() => document.querySelector('.skip').getBoundingClientRect().bottom);
  assert.ok(before <= 0, `skip link visible before focus (bottom ${before})`);
  await page.keyboard.press('Tab');
  const after = await page.evaluate(() => {
    const el = document.activeElement; const r = el.getBoundingClientRect();
    return { cls: el.className, top: r.top, height: r.height };
  });
  assert.equal(after.cls, 'skip');
  assert.ok(after.top >= 0 && after.height >= 40, `focused skip link at top ${after.top}, height ${after.height}`);
  await page.keyboard.press('Enter');
  const focused = await page.evaluate(() => document.activeElement.id);
  assert.equal(focused, 'main');
  await page.close();
});
