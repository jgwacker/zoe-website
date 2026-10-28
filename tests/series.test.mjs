import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readDist } from './helpers.mjs';
import { photographySections } from '../src/links/registry.ts';

const series = JSON.parse(fs.readFileSync('src/data/series.json', 'utf8'));

test('series: Photography sidebar links to the series index', () => {
  assert.ok(photographySections.some((s) => s.href === '/photography/series'));
});

test('series: each series has a short title, a statement of at most 75 words, 10 photos and an overview image', () => {
  assert.ok(series.length >= 1);
  for (const s of series) {
    assert.ok(s.title.split(/\s+/).length <= 5, `${s.slug} title`);
    assert.ok(s.statement.trim().split(/\s+/).length <= 75, `${s.slug} statement`);
    assert.equal(s.photos.length, 10, `${s.slug} photo count`);
    assert.equal(new Set(s.photos).size, 10, `${s.slug} repeats a photo`);
    for (const n of s.photos) assert.ok(fs.existsSync(`public/images/portfolio/portfolio-${n}.jpg`), `${s.slug}: portfolio-${n}`);
    assert.ok(fs.existsSync(path.join('public', s.overview)), `${s.slug} overview`);
  }
});

test('series: index page links to every series with its overview', () => {
  const html = readDist('/photography/series/');
  for (const s of series) {
    assert.match(html, new RegExp(`href="/photography/series/${s.slug}/?"`), `link to ${s.slug}`);
    assert.ok(html.includes(s.overview), `overview for ${s.slug}`);
  }
});

test('series: each series page shows its overview, statement and all 10 photos', () => {
  for (const s of series) {
    const html = readDist(`/photography/series/${s.slug}/`);
    assert.ok(html.includes(s.overview), `${s.slug} overview`);
    assert.ok(html.includes(s.statement.slice(0, 40)), `${s.slug} statement`);
    for (const n of s.photos) assert.ok(html.includes(`/images/portfolio/thumbs/portfolio-${n}.jpg`), `${s.slug} photo ${n}`);
  }
});
