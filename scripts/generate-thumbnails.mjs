#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PORTFOLIO_DIR = 'public/images/portfolio';
const THUMBS_DIR = 'public/images/portfolio/thumbs';
const THUMB_WIDTH = 600; // pixels
const QUALITY = 80; // JPEG quality

async function generateThumbnails() {
  // Create thumbs directory if it doesn't exist
  if (!fs.existsSync(THUMBS_DIR)) {
    fs.mkdirSync(THUMBS_DIR, { recursive: true });
  }

  // Get all jpg files in portfolio directory
  const files = fs.readdirSync(PORTFOLIO_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  console.log(`Found ${files.length} images to process...`);

  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const inputPath = path.join(PORTFOLIO_DIR, file);
    const outputPath = path.join(THUMBS_DIR, file);

    // Skip if thumbnail already exists and is newer than source
    if (fs.existsSync(outputPath)) {
      const srcStat = fs.statSync(inputPath);
      const thumbStat = fs.statSync(outputPath);
      if (thumbStat.mtime >= srcStat.mtime) {
        skipped++;
        continue;
      }
    }

    try {
      await sharp(inputPath)
        .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: QUALITY })
        .toFile(outputPath);
      processed++;
      console.log(`  ✓ ${file}`);
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }

  console.log(`\nDone! Processed: ${processed}, Skipped: ${skipped}`);
}

generateThumbnails();
