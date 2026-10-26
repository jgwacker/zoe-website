import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist } from './helpers.mjs';

// Gallery photos that placed in contests, and the award page each one links to.
const AWARDED = {
  'portfolio-32.jpg': ['tpoy-competition-2025'],
  'portfolio-42.jpg': ['peninsula-photo-competition-2025'],
  'portfolio-55.jpg': ['global-peace-photo-award-2026'],
  'portfolio-59.jpg': ['tpoy-competition-2025'],
  'portfolio-60.jpg': ['tpoy-competition-2025'],
  'portfolio-62.jpg': ['tpoy-competition-2025', 'npcfk-competition-color-2025'],
  'portfolio-64.jpg': ['npcfk-competition-home-2025', 'global-peace-photo-award-2026'],
  'portfolio-65.jpg': ['tpoy-competition-2025', 'global-peace-photo-award-2026'],
  'portfolio-70.jpg': ['tpoy-competition-2025'],
  'portfolio-72.jpg': ['npcfk-competition-life-in-red-2026', 'global-peace-photo-award-2026'],
  'portfolio-73.jpg': ['no-frames-2026'],
  'portfolio-74.jpg': ['global-peace-photo-award-2026'],
  'portfolio-75.jpg': ['tpoy-competition-2025'],
  'portfolio-76.jpg': ['tpoy-competition-2025'],
};

function galleryItems() {
  const html = readDist('/photography/masonry/');
  const items = {};
  for (const [fig] of html.matchAll(/<figure[^>]*class="masonry-item"[^>]*>[\s\S]*?<\/figure>/g)) {
    const file = fig.match(/\/images\/portfolio\/(portfolio-\d+\.jpg)"/)?.[1];
    if (file) items[file] = fig;
  }
  return items;
}

test('gallery: every awarded photo shows its awards, linked to the award pages', () => {
  const items = galleryItems();
  for (const [file, slugs] of Object.entries(AWARDED)) {
    assert.ok(items[file], `${file} is in the gallery`);
    const links = [...items[file].matchAll(/class="award"[^>]*>\s*<a href="\/photography\/awards\/([^"/]+)\/?"/g)].map((m) => m[1]);
    assert.deepEqual(links.sort(), [...slugs].sort(), `${file} award links`);
  }
});

test('gallery: photos without awards show no award line', () => {
  const items = galleryItems();
  for (const [file, fig] of Object.entries(items)) {
    if (!AWARDED[file]) assert.doesNotMatch(fig, /class="award"/, `${file} has no award`);
  }
});

test('gallery: new high-res photos are web-sized (≤ 4000 px, ≤ 5 MB)', () => {
  for (const n of [73, 74, 75, 76]) {
    const size = fs.statSync(`public/images/portfolio/portfolio-${n}.jpg`).size;
    assert.ok(size <= 5 * 1024 * 1024, `portfolio-${n}.jpg is ${size} bytes`);
  }
});
