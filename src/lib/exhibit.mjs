import fs from 'node:fs';
import path from 'node:path';

/** Resized copy of an original image, written by scripts/generate-display.mjs. */
export function displayPath(image, kind = 'full') {
  const name = path.posix.basename(image).replace(/\.[^.]+$/, '');
  return `/images/display/${kind === 'row' ? 'row-' : ''}${name}.jpg`;
}

/** Captions still marked "draft": true among the first `count` photos (the ones the homepage shows). */
export function listDrafts(items, count = 3) {
  return items.slice(0, count).filter((i) => i.draft).map((i) => `photo: ${i.title}`);
}

/** Display paths that are missing from publicDir. */
export function missingDisplayFiles(paths, publicDir) {
  return paths.filter((p) => !fs.existsSync(path.join(publicDir, p)));
}

/** Originals the homepage shows, with their display size: strip photos and the award card full-size, trip thumbnails row-size. */
export function homepageImages({ items, award, trips }) {
  return [
    ...items.slice(0, 3).map((i) => [i.image, 'full']),
    ...(award?.image ? [[award.image, 'full']] : []),
    ...trips.filter((t) => t.image).map((t) => [t.image, 'row']),
  ];
}
