import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, serveDist, launch } from './helpers.mjs';
import { photographyAwards, travelTrips, musicConcerts, celloPerformances } from '../src/links/registry.ts';

const html = readDist('/');
const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const section = (cls) => html.match(new RegExp(`<(?:ol|div|ul)[^>]*class="${cls}"[^>]*>([\\s\\S]*?)</(?:ol|div|ul)>`))?.[1] ?? '';
const hrefs = (s) => [...s.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

test('poster: headliner, season line, tagline and billed sections', () => {
  assert.match(html, /<h1[^>]*class="headliner"[^>]*>ZOE WACKER<\/h1>/);
  assert.match(html, /presents<\/b> the \d{4}–\d{2} season/); // <b> carries Astro's scope attribute
  assert.ok(html.includes('“aha!” moments.'));
  for (const h of ['/photography', '/travel', '/music', '/geography', '/guardian-arts', '/academics', '/about', '/photography/awards', '/music/concerts']) {
    assert.match(html, new RegExp(`<a[^>]*href="${h}"`), `bill links ${h}`);
  }
});

test('glow strip shows the first three exhibit photos, resized', () => {
  for (const it of data.items.slice(0, 3)) assert.ok(html.includes(it.title), `missing ${it.title}`);
  assert.ok(!html.includes(data.items[3].title), 'only three photos');
});

test('set list links every registry award, with the featured card', () => {
  assert.deepEqual(hrefs(section('setlist')), photographyAwards.map((a) => a.href));
  assert.match(html, /<a[^>]*class="awardcard"[^>]*href="\/photography\/awards\/peninsula-photo-competition-2025"/);
  assert.ok(html.includes('Read the story →'));
});

test('tour dates show the five newest trips in order; concerts the six newest; the newest cello performance', () => {
  assert.deepEqual(hrefs(section('tour')), travelTrips.slice(0, 5).map((t) => t.href));
  assert.deepEqual(hrefs(section('gigs')), musicConcerts.slice(0, 6).map((c) => c.href));
  assert.match(html, new RegExp(`<a[^>]*class="cello"[^>]*href="${celloPerformances[0].href}"`));
});

test('meet the headliner: ZW monogram and no photo of Zoe', () => {
  assert.match(html, /class="monogram"[^>]*>ZW</);
  assert.ok(html.includes('Hi! I’m Zoe.'));
  for (const p of ['/images/home/about.jpg', '650_award_2025', 'zoe_']) assert.ok(!html.includes(p), `photo of Zoe: ${p}`);
});

test('homepage uses resized images only, with no undefined/null and no empty img', () => {
  const srcs = [...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(srcs.length >= 8);
  for (const s of srcs) assert.match(s, /^\/images\/display\//);
  assert.doesNotMatch(html, />\s*(undefined|null)\s*</);
});

test('homepage has no sideways scroll at 390px', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + '/', { waitUntil: 'load' });
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  assert.ok(sw <= iw, `scrollWidth ${sw} > innerWidth ${iw}`);
});
