import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, serveDist, launch } from './helpers.mjs';
import { photographyAwards, travelTrips, musicConcerts, celloPerformances } from '../src/links/registry.ts';
import { recentStubs, after } from '../src/lib/registry-meta.mjs';

const html = readDist('/');
const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const section = (cls) => html.match(new RegExp(`<(?:ol|div|ul)[^>]*class="${cls}(?: [^"]*)?"[^>]*>([\\s\\S]*?)</(?:ol|div|ul)>`))?.[1] ?? '';
const hrefs = (s) => [...s.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

test('poster: script headliner with an orange period, season line, tagline and billed sections', () => {
  assert.match(html, /<h1[^>]*class="headliner script"[^>]*>Zoe Wacker<span[^>]*>\.<\/span><\/h1>/);
  assert.match(html, /presents<\/b> the \d{4}–\d{2} season/);
  assert.ok(html.includes('“aha!” moments.'));
  const bill = html.match(/<nav[^>]*class="bill"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const rows = [...bill.matchAll(/<div[^>]*class="row[^"]*"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => m[1]).join('');
  assert.deepEqual(hrefs(rows), ['/photography', '/travel', '/music', '/geography', '/guardian-arts', '/academics']);
  assert.doesNotMatch(bill, /class="row r3"/);
  assert.doesNotMatch(bill, /class="support"/, 'no location line duplicating the tour');
  assert.match(html, /<header[^>]*class="site-header slim"/, 'homepage header is slim');
});

test('ticket stubs: two newest awards, newest trip, newest concert, in order', () => {
  const want = recentStubs({ awards: photographyAwards, trips: travelTrips, concerts: musicConcerts }).map((s) => s.href);
  assert.deepEqual(hrefs(section('stubs')), want);
  assert.equal(want.length, 4);
});

test('the first exhibit photo is the poster key art, the next three are the strip', () => {
  const poster = html.match(/<section[^>]*class="poster"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  const keyImg = poster.match(/<figure[^>]*class="key"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/)?.[1];
  assert.ok(keyImg?.endsWith('/cinderello.jpg'), `key photo is ${keyImg}`);
  assert.ok(poster.includes(data.items[0].title));
  assert.ok(poster.indexOf('class="key"') < poster.indexOf('class="bill"'), 'key photo sits above the bill');
  if (data.items[0].note && !data.items[0].draft) assert.ok(poster.includes(`“${data.items[0].note}”`), 'her note is under the key photo');
  if (data.items[0].year) assert.match(poster, new RegExp(`<span[^>]*>${data.items[0].year}<\\/span>`), 'year in the key caption');
  for (const it of data.items.slice(1, 4)) {
    assert.ok(html.includes(it.place), `missing ${it.place}`);
    if (it.draft) assert.ok(!html.includes(`<span>${it.title}</span>`), `draft title "${it.title}" shipped as a caption`);
    else assert.ok(html.includes(it.title), `missing ${it.title}`);
  }
  assert.equal((html.match(/<figure[^>]*class="p\d/g) || []).length, 3, 'three strip photos');
});

test('programme lists the four newest awards with Roman numerals, an All awards link, and the featured card', () => {
  assert.deepEqual(hrefs(section('programme')), after(photographyAwards, 2, 4).map((a) => a.href), 'programme starts after the two stub awards');
  assert.match(section('programme'), /<span[^>]*class="n"[^>]*>I<\/span>/);
  const results = [...section('programme').matchAll(/<span[^>]*class="t"[^>]*>([^<]+)<span/g)].map((m) => m[1]);
  assert.deepEqual(results, after(photographyAwards, 2, 4).map((a) => a.result), 'each row leads with its result');
  assert.match(html, /<a[^>]*class="more"[^>]*href="\/photography\/awards"[^>]*>All awards →<\/a>/);
  assert.match(html, /<a[^>]*class="awardcard"[^>]*href="\/photography\/awards\/global-peace-photo-award-2026"/);
  assert.match(html, /class="awardcard"[\s\S]*?<img[^>]*src="\/images\/display\/gppa-2026-5\.jpg"/);
  assert.ok(html.includes('Read the story →'));
  assert.match(html, /<h2[^>]*class="script"[^>]*>Photo <em[^>]*>awards<\/em><\/h2>/);
});

test('travel dates show the five newest trips; concerts the six newest; the newest cello performance', () => {
  assert.deepEqual(hrefs(section('tour')), after(travelTrips, 1, 5).map((t) => t.href), 'tour starts after the stub trip');
  assert.deepEqual(hrefs(section('gigs')), after(musicConcerts, 1, 6).map((c) => c.href), 'crowd list starts after the stub concert');
  assert.match(html, new RegExp(`<a[^>]*class="cello"[^>]*href="${celloPerformances[0].href}"`));
});

test('about: script ZW monogram and no photo of Zoe, placed right after the strip', () => {
  assert.match(html, /class="monogram script"[^>]*>ZW</);
  assert.ok(html.indexOf('id="meet"') > html.indexOf('class="strip"') && html.indexOf('id="meet"') < html.indexOf('id="awards"'), 'meet block sits between the strip and the awards');
  assert.ok(html.includes('Hi! I’m Zoe.'));
  for (const p of ['/images/home/about.jpg', '650_award_2025', 'zoe_']) assert.ok(!html.includes(p), `photo of Zoe: ${p}`);
});

test('homepage uses resized images only, with no undefined/null text', () => {
  const srcs = [...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1]);
  const shown = after(travelTrips, 1, 5);
  const tripThumbs = shown.every((t) => t.image) ? shown.length : 0; // all or nothing
  assert.equal(srcs.length, 4 + 1 + tripThumbs);
  if (!tripThumbs) assert.match(html, /class="tour no-thumbs"/);
  for (const s of srcs) assert.match(s, /^\/images\/display\//);
  assert.doesNotMatch(html, />\s*(undefined|null)\s*</);
});

test('homepage: no sideways scroll, and the name and section headings stay on one line', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  for (const width of [360, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(srv.url + '/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const lines = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return new Set([...rg.getClientRects()].map((x) => Math.round(x.top))).size; };
      return {
        sw: document.documentElement.scrollWidth, iw: window.innerWidth,
        h1: lines(document.querySelector('.headliner')),
        h2: [...document.querySelectorAll('.home h2')].map((h) => [h.textContent.trim(), lines(h)]),
      };
    });
    assert.ok(r.sw <= r.iw, `${width}px: scrollWidth ${r.sw} > ${r.iw}`);
    assert.equal(r.h1, 1, `${width}px: name wraps`);
    for (const [txt, n] of r.h2) assert.equal(n, 1, `${width}px: "${txt}" wraps`);
    await page.close();
  }
});

test('stub hover halo follows the stub accent; the monogram does not react to hover', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/', { waitUntil: 'load' });
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')));
  const shadowAfterHover = async (sel) => { await page.hover(sel); await page.waitForTimeout(700); return page.evaluate((s) => getComputedStyle(document.querySelector(s)).boxShadow, sel); };
  assert.match(await shadowAfterHover('.stub.gold'), /201, 138, 30/, 'gold stub hovers with a marigold halo');
  assert.match(await shadowAfterHover('.stub.orange'), /226, 115, 58/, 'orange stub hovers with an apricot halo');
  const rest = await page.evaluate(() => getComputedStyle(document.querySelector('.monogram')).boxShadow);
  assert.equal(await shadowAfterHover('.monogram'), rest, 'monogram halo is unchanged on hover');
});

test('homepage header is slim at every width: Menu toggle, nav hidden until opened, visible without JS', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  const toggle = page.locator('[data-menu-toggle]');
  const firstLink = page.locator('#site-nav a').first();
  await toggle.waitFor({ state: 'visible' });
  assert.equal(await firstLink.isVisible(), false);
  const posterBefore = await page.evaluate(() => document.querySelector('.poster').getBoundingClientRect().top);
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(await firstLink.isVisible(), true);
  const open = await page.evaluate(() => { const n = document.querySelector('#site-nav'); const r = n.getBoundingClientRect(); return { pos: getComputedStyle(n).position, w: r.width, posterTop: document.querySelector('.poster').getBoundingClientRect().top }; });
  assert.equal(open.pos, 'absolute', 'desktop panel drops under the toggle');
  assert.ok(open.w <= 360, `panel is ${open.w}px wide`);
  assert.equal(open.posterTop, posterBefore, 'opening the menu does not move the poster');
  await page.keyboard.press('Escape');
  assert.equal(await firstLink.isVisible(), false);
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const noJs = await ctx.newPage();
  await noJs.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  assert.equal(await noJs.locator('#site-nav a').first().isVisible(), true);
  await ctx.close();
});
