import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { displayPath, listDrafts, missingDisplayFiles } from '../src/lib/exhibit.mjs';
import { NAV } from '../src/lib/site-nav.mjs';

const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));

test('six exhibit items, each complete', () => {
  assert.equal(data.items.length, 6);
  for (const it of data.items) {
    for (const k of ['image', 'alt', 'title', 'place', 'note']) assert.ok(it[k], `${it.title || it.image} missing ${k}`);
    assert.ok(fs.existsSync(path.join('public', it.image)), `original missing: ${it.image}`);
  }
  assert.equal(data.items[0].title, 'Cinderello');
});

test('section rows match the nav (minus Home), in order', () => {
  assert.deepEqual(data.sections.map((s) => s.href), NAV.slice(1).map((n) => n.href));
  for (const s of data.sections) assert.ok(s.title && s.desc && s.thumb, s.href);
});

test('displayPath maps originals to resized jpgs', () => {
  assert.equal(displayPath('/images/portfolio/portfolio-64.jpg'), '/images/display/portfolio-64.jpg');
  assert.equal(displayPath('/images/photography_awards/x.png'), '/images/display/x.jpg');
  assert.equal(displayPath('/images/home/music.jpg', 'row'), '/images/display/row-music.jpg');
});

test('listDrafts names draft photos and sections', () => {
  const d = listDrafts({ items: [{ title: 'A', draft: true }, { title: 'B' }], sections: [{ title: 'Music', draft: true }] });
  assert.deepEqual(d, ['photo: A', 'section: Music']);
});

test('missingDisplayFiles reports display images that do not exist', () => {
  const fake = { items: [{ image: '/images/nope/missing-photo.jpg' }], sections: [] };
  assert.deepEqual(missingDisplayFiles(fake, 'public'), ['/images/display/missing-photo.jpg']);
});

test('every display image exists and is at most 1600px wide', async () => {
  assert.deepEqual(missingDisplayFiles(data, 'public'), []);
  for (const it of data.items) {
    const { width } = await sharp(path.join('public', displayPath(it.image))).metadata();
    assert.ok(width <= 1600, `${it.image} display is ${width}px`);
  }
});
