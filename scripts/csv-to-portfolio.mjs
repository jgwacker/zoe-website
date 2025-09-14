#!/usr/bin/env node
/**
 * csv-to-portfolio.mjs
 *
 * Usage:
 *   node scripts/csv-to-portfolio.mjs data/portfolio.csv --images-prefix "/images/portfolio/"
 *
 * Notes:
 * - No external deps. Minimal CSV parser that supports quoted fields with commas and escaped quotes ("").
 * - Expects header row with: filename,title,description,date,location
 * - Writes: src/data/portfolio.json
 * - If --images-prefix is provided, builds `src` as `${prefix}${filename}` (prefix should start with "/").
 *   Otherwise leaves `src` undefined (page will show a placeholder).
 */

import fs from 'node:fs';
import path from 'node:path';

const [, , csvPath, ...rest] = process.argv;
if (!csvPath) {
  console.error('ERROR: Provide a CSV path. Example:\n  node scripts/csv-to-portfolio.mjs data/portfolio.csv --images-prefix "/images/portfolio/"');
  process.exit(1);
}

let imagesPrefix = null;
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--images-prefix') {
    imagesPrefix = rest[i + 1] || null;
  }
}

// --- tiny CSV parser (handles quotes, commas, escaped quotes) ---
function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { // escaped quote
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += c;
        i++;
        continue;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (c === ',') {
        row.push(field);
        field = '';
        i++;
        continue;
      }
      if (c === '\r') { i++; continue; }
      if (c === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
        continue;
      }
      field += c;
      i++;
    }
  }
  // flush last field/row
  row.push(field);
  rows.push(row);
  // trim trailing blank line
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop();
  }
  return rows;
}

// --- read CSV ---
let csv;
try {
  csv = fs.readFileSync(csvPath, 'utf8');
} catch (e) {
  console.error(`ERROR: Could not read CSV at ${csvPath}\n${e.message}`);
  process.exit(1);
}

const rows = parseCSV(csv);
if (rows.length < 2) {
  console.error('ERROR: CSV must include a header row and at least one data row.');
  process.exit(1);
}

// --- header mapping ---
const header = rows[0].map(h => h.trim().toLowerCase());
const req = ['filename', 'title', 'description', 'date', 'location'];
for (const key of req) {
  if (!header.includes(key)) {
    console.error(`ERROR: Missing required column "${key}" in header. Found: ${header.join(', ')}`);
    process.exit(1);
  }
}
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

// --- build photo objects ---
const photos = [];
const publicDir = path.join(process.cwd(), 'public');
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (row.length === 1 && row[0].trim() === '') continue; // skip blank rows

  const filename = (row[idx.filename] || '').trim();
  const title = (row[idx.title] || '').trim();
  const description = (row[idx.description] || '').trim();
  const date = (row[idx.date] || '').trim();
  const location = (row[idx.location] || '').trim();

  if (!filename || !title) {
    console.warn(`WARN: Row ${r+1}: "filename" and "title" are recommended; skipping if both missing.`);
  }

  // try to validate date (ISO recommended). If invalid, keep as-is.
  let validDate = date;
  if (date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.warn(`WARN: Row ${r+1}: date "${date}" is not a valid Date. It will be kept as-is.`);
    }
  }

  // resolve src if prefix provided
  let src;
  if (imagesPrefix) {
    // normalize to ensure single slash joining
    const cleanPrefix = imagesPrefix.endsWith('/') ? imagesPrefix : imagesPrefix + '/';
    src = `${cleanPrefix}${filename}`.replace(/\/{2,}/g, '/');
    // warn if the file doesn't exist under /public
    const diskPath = path.join(publicDir, src);
    if (!fs.existsSync(diskPath)) {
      console.warn(`WARN: Image not found at public path: ${src} (expected disk: ${diskPath})`);
    }
  }

  photos.push({ title, description, date: validDate, location, ...(src ? { src } : {}) });
}

// --- write JSON data file ---
const outDir = path.join(process.cwd(), 'src', 'data');
const outPath = path.join(outDir, 'portfolio.json');
fs.mkdirSync(outDir, { recursive: true });

try {
  fs.writeFileSync(outPath, JSON.stringify(photos, null, 2) + '\n', 'utf8');
  console.log(`OK: Wrote ${photos.length} items to ${path.relative(process.cwd(), outPath)}`);
} catch (e) {
  console.error(`ERROR: Failed to write ${outPath}\n${e.message}`);
  process.exit(1);
}
