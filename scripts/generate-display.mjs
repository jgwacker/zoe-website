#!/usr/bin/env node
// Writes resized copies of homepage images to public/images/display/: exhibit photos and the featured award (1600px),
// trip thumbnails (320px). Re-run via `npm run thumbnails` after editing src/data/exhibit.json or the registry.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { displayPath, homepageImages } from '../src/lib/exhibit.mjs';
import { featuredAward } from '../src/lib/registry-meta.mjs';
import { photographyAwards, travelTrips } from '../src/links/registry.ts';

const WIDTH = { full: 1600, row: 320 };
const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const jobs = [
  ...data.items.map((i) => [i.image, 'full']),
  ...homepageImages({ items: [], award: featuredAward(photographyAwards), trips: travelTrips }),
];
fs.mkdirSync('public/images/display', { recursive: true });

for (const [src, kind] of new Map(jobs.map((j) => [j.join('|'), j])).values()) {
  const input = path.join('public', src);
  const output = path.join('public', displayPath(src, kind));
  if (fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) {
    console.log('skip ', output);
    continue;
  }
  await sharp(input).rotate().resize({ width: WIDTH[kind], withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(output);
  console.log('wrote', output);
}
