import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist, serveDist, launch } from './helpers.mjs';

test('pages without a sidebar render no sidebar column and align content with the title', async (t) => {
  assert.doesNotMatch(readDist('/about/'), /<aside[^>]*class="sidebar"/);
  assert.match(readDist('/travel/trips/egypt-2025/'), /<aside[^>]*class="sidebar"/);
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/about/', { waitUntil: 'domcontentloaded' });
  const { title, content } = await page.evaluate(() => ({
    title: Math.round(document.querySelector('.post-title').getBoundingClientRect().left),
    content: Math.round(document.querySelector('.content').getBoundingClientRect().left),
  }));
  assert.ok(Math.abs(title - content) <= 2, `title at ${title}px, content at ${content}px`);
});

test('portfolio slideshow photo glows with rounded corners like every other photo', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/photography/portfolio/', { waitUntil: 'domcontentloaded' });
  const s = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.slide-img'));
    return { radius: cs.borderTopLeftRadius, shadow: cs.boxShadow, bg: cs.backgroundColor };
  });
  assert.equal(s.radius, '6px');
  assert.notEqual(s.shadow, 'none');
  assert.notEqual(s.bg, 'rgb(255, 255, 255)');
});
