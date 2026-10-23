import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { displayPath, listDrafts, missingDisplayFiles, homepageImages } from '../src/lib/exhibit.mjs';
import { featuredAward, latest } from '../src/lib/registry-meta.mjs';
import { photographyAwards, travelTrips } from '../src/links/registry.ts';

const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));

test('at least three exhibit items, each complete; no section blurbs', () => {
  assert.ok(data.items.length >= 3);
  for (const it of data.items) {
    for (const k of ['image', 'alt', 'title', 'place']) assert.ok(it[k], `${it.title || it.image} missing ${k}`);
    assert.ok(fs.existsSync(path.join('public', it.image)), `original missing: ${it.image}`);
  }
  assert.equal(data.sections, undefined);
});

test('displayPath maps originals to resized jpgs', () => {
  assert.equal(displayPath('/images/portfolio/portfolio-64.jpg'), '/images/display/portfolio-64.jpg');
  assert.equal(displayPath('/images/photography_awards/x.png'), '/images/display/x.jpg');
  assert.equal(displayPath('/images/trips/rome_2024/colluseum_rome_2024.jpeg', 'row'), '/images/display/row-colluseum_rome_2024.jpg');
});

test('listDrafts names drafts among the first three photos only', () => {
  const items = [{ title: 'A', draft: true }, { title: 'B' }, { title: 'C', draft: true }, { title: 'D', draft: true }];
  assert.deepEqual(listDrafts(items), ['photo: A', 'photo: C']);
});

test('homepageImages: three strip photos and the featured award full-size, trip thumbnails row-size, skipping entries without images', () => {
  const imgs = homepageImages({
    items: [{ image: '/a.jpg' }, { image: '/b.jpg' }, { image: '/c.jpg' }, { image: '/d.jpg' }],
    award: { image: '/award.jpg' },
    trips: [{ image: '/t1.jpg' }, {}, { image: '/t2.jpg' }],
  });
  assert.deepEqual(imgs, [['/a.jpg', 'full'], ['/b.jpg', 'full'], ['/c.jpg', 'full'], ['/award.jpg', 'full'], ['/t1.jpg', 'row'], ['/t2.jpg', 'row']]);
});

test('missingDisplayFiles reports display paths that do not exist', () => {
  assert.deepEqual(missingDisplayFiles(['/images/display/missing-photo.jpg'], 'public'), ['/images/display/missing-photo.jpg']);
});

test('every homepage display image exists and is at most 1600px wide', async () => {
  const paths = homepageImages({ items: data.items, award: featuredAward(photographyAwards), trips: latest(travelTrips, 5) })
    .map(([src, kind]) => displayPath(src, kind));
  assert.deepEqual(missingDisplayFiles(paths, 'public'), []);
  for (const p of paths) {
    const { width } = await sharp(path.join('public', p)).metadata();
    assert.ok(width <= 1600, `${p} is ${width}px`);
  }
});
