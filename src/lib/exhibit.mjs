import fs from 'node:fs';
import path from 'node:path';

/** Resized copy of an original image, written by scripts/generate-display.mjs. */
export function displayPath(image, kind = 'full') {
  const name = path.posix.basename(image).replace(/\.[^.]+$/, '');
  return `/images/display/${kind === 'row' ? 'row-' : ''}${name}.jpg`;
}

/** Captions and section blurbs still marked "draft": true, for Zoe to edit. */
export function listDrafts(data) {
  return [
    ...data.items.filter((i) => i.draft).map((i) => `photo: ${i.title}`),
    ...data.sections.filter((s) => s.draft).map((s) => `section: ${s.title}`),
  ];
}

/** Display images referenced by the data that are missing from publicDir. */
export function missingDisplayFiles(data, publicDir) {
  const wanted = [
    ...data.items.map((i) => displayPath(i.image)),
    ...data.sections.map((s) => displayPath(s.thumb, 'row')),
  ];
  return wanted.filter((p) => !fs.existsSync(path.join(publicDir, p)));
}
