#!/usr/bin/env node
// Writes resized copies of the homepage exhibit photos (1600px) and section thumbnails (320px)
// to public/images/display/. Re-run via `npm run thumbnails` after editing src/data/exhibit.json.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { displayPath } from '../src/lib/exhibit.mjs';

const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const jobs = [
  ...data.items.map((i) => [i.image, 'full', 1600]),
  ...data.sections.map((s) => [s.thumb, 'row', 320]),
];
fs.mkdirSync('public/images/display', { recursive: true });

for (const [src, kind, width] of jobs) {
  const input = path.join('public', src);
  const output = path.join('public', displayPath(src, kind));
  if (fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) {
    console.log('skip ', output);
    continue;
  }
  await sharp(input).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(output);
  console.log('wrote', output);
}
