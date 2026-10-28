import fs from 'node:fs';

/** Gallery CSV rows keyed by portfolio number: { title, description, date, location }. */
export function galleryInfo(file = 'data/photography-masonry.csv') {
  const rows = [];
  let row = [], cell = '', q = false;
  const src = fs.readFileSync(file, 'utf8');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (q) { if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const out = {};
  for (const [filename, title, description, date, location] of rows.slice(1)) {
    const n = filename?.match(/portfolio-(\d+)\.jpg/)?.[1];
    if (n) out[n] = { title, description, date, location };
  }
  return out;
}
