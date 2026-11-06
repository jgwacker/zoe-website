import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, serveDist, launch } from './helpers.mjs';
import { photographyAwards, travelTrips, musicConcerts, celloPerformances } from '../src/links/registry.ts';
import { recentStubs, latest } from '../src/lib/registry-meta.mjs';

const html = readDist('/');
const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const section = (cls) => html.match(new RegExp(`<(?:ol|div|ul)[^>]*class="${cls}(?: [^"]*)?"[^>]*>([\\s\\S]*?)</(?:ol|div|ul)>`))?.[1] ?? '';
const hrefs = (s) => [...s.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

test('poster: script headliner with an orange period, season line, tagline and billed sections', () => {
  assert.match(html, /<h1[^>]*class="headliner script"[^>]*>Zoe Wacker<span[^>]*>\.<\/span><\/h1>/);
  assert.match(html, /presents<\/b> the \d{4}–\d{2} season/);
  assert.ok(html.includes('“aha!” moments.'));
  const bill = html.match(/<nav[^>]*class="bill"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  assert.deepEqual(hrefs(bill), ['/photography', '/travel', '/music', '/geography', '/guardian-arts', '/academics']);
  assert.doesNotMatch(bill, /class="row r3"/);
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
  for (const it of data.items.slice(1, 4)) assert.ok(html.includes(it.title), `missing ${it.title}`);
  assert.ok(!html.includes(data.items[4].title), 'only four photos');
});

test('programme lists the four newest awards with Roman numerals, an All awards link, and the featured card', () => {
  assert.deepEqual(hrefs(section('programme')), latest(photographyAwards, 4).map((a) => a.href));
  assert.match(section('programme'), /<span[^>]*class="n"[^>]*>I<\/span>/);
  assert.match(html, /<a[^>]*class="more"[^>]*href="\/photography\/awards"[^>]*>All awards →<\/a>/);
  assert.match(html, /<a[^>]*class="awardcard"[^>]*href="\/photography\/awards\/global-peace-photo-award-2026"/);
  assert.match(html, /class="awardcard"[\s\S]*?<img[^>]*src="\/images\/display\/gppa-2026-5\.jpg"/);
  assert.ok(html.includes('Read the story →'));
  assert.match(html, /<h2[^>]*class="script"[^>]*>Photo <em[^>]*>awards<\/em><\/h2>/);
});

test('travel dates show the five newest trips; concerts the six newest; the newest cello performance', () => {
  assert.deepEqual(hrefs(section('tour')), travelTrips.slice(0, 5).map((t) => t.href));
  assert.deepEqual(hrefs(section('gigs')), musicConcerts.slice(0, 6).map((c) => c.href));
  assert.match(html, new RegExp(`<a[^>]*class="cello"[^>]*href="${celloPerformances[0].href}"`));
});

test('about: script ZW monogram and no photo of Zoe', () => {
  assert.match(html, /class="monogram script"[^>]*>ZW</);
  assert.ok(html.includes('Hi! I’m Zoe.'));
  for (const p of ['/images/home/about.jpg', '650_award_2025', 'zoe_']) assert.ok(!html.includes(p), `photo of Zoe: ${p}`);
});

test('homepage uses resized images only, with no undefined/null text', () => {
  const srcs = [...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1]);
  const tripThumbs = travelTrips.slice(0, 5).filter((t) => t.image).length;
  assert.equal(srcs.length, 4 + 1 + tripThumbs);
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
