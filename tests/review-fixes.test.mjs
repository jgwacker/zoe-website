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

test('portfolio slideshow photo has a halo with rounded corners like every other photo', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/photography/portfolio/', { waitUntil: 'domcontentloaded' });
  const s = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.slide-img'));
    return { radius: cs.borderTopLeftRadius, shadow: cs.boxShadow, bg: cs.backgroundColor };
  });
  assert.equal(s.radius, '8px');
  assert.notEqual(s.shadow, 'none');
  assert.notEqual(s.bg, 'rgb(255, 255, 255)');
});

// After Dark final review fixes.
const textContrastProbe = () => {
  const lum = (rgb) => {
    const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map((x) => Number(x) / 255)
      .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own || !el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.color.includes('rgba(0, 0, 0, 0)')) continue;
    const ratio = 1.05 / (lum(cs.color) + 0.05);
    if (ratio < 4.5) bad.push(`${el.tagName}.${el.className} ${cs.color} ${ratio.toFixed(2)}`);
  }
  return bad;
};

test('print: every visible text run is dark enough on white paper, and no dark cards', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.emulateMedia({ media: 'print' });
  for (const route of ['/', '/photography/awards/peninsula-photo-competition-2025/', '/travel/trips/egypt-2025/']) {
    await page.goto(srv.url + route, { waitUntil: 'domcontentloaded' });
    assert.deepEqual((await page.evaluate(textContrastProbe)).slice(0, 8), [], route);
  }
  await page.goto(srv.url + '/photography/awards/peninsula-photo-competition-2025/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.award-exhibit .label')).backgroundColor), 'rgba(0, 0, 0, 0)');
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('.bill a').first().isVisible(), true, 'homepage section links still print');
});

test('phone without JS: header is not sticky, so the always-open menu scrolls away', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(srv.url + '/travel/trips/egypt-2025/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.site-header')).position), 'static');
});

test('phone landscape: the open menu fits the screen and scrolls, so every link is reachable', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
  await page.goto(srv.url + '/about/', { waitUntil: 'domcontentloaded' });
  await page.click('[data-menu-toggle]');
  const s = await page.evaluate(() => {
    const nav = document.querySelector('#site-nav');
    return { bottom: nav.getBoundingClientRect().bottom, vh: innerHeight, oy: getComputedStyle(nav).overflowY };
  });
  assert.ok(s.bottom <= s.vh, `menu bottom ${s.bottom} > viewport ${s.vh}`);
  assert.equal(s.oy, 'auto');
});

test('homepage tour rows without a photo render no empty thumbnail box', () => {
  const tour = readDist('/').match(/<div[^>]*class="tour"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
  const boxes = (tour.match(/class="thumb"/g) || []).length;
  const imgs = (tour.match(/<img /g) || []).length;
  assert.equal(boxes, imgs);
});
