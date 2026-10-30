import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { splitYear, latest, featuredAward, seasonLabel, recentStubs, roman } from '../src/lib/registry-meta.mjs';
import { photographyAwards, travelTrips, celloPerformances } from '../src/links/registry.ts';

test('splitYear takes the last 4-digit year out of a label', () => {
  assert.deepEqual(splitYear('Egypt 2025'), { name: 'Egypt', year: 2025 });
  assert.deepEqual(splitYear('Re:Set 2023'), { name: 'Re:Set', year: 2023 });
  assert.deepEqual(splitYear('The Shelter: National Photography Competition for Kids June 2026'),
    { name: 'The Shelter: National Photography Competition for Kids June', year: 2026 });
  assert.deepEqual(splitYear('Favorites'), { name: 'Favorites', year: null });
});

test('latest returns the first n entries (the registry is newest-first)', () => {
  assert.deepEqual(latest([{ label: 'a' }, { label: 'b' }, { label: 'c' }], 2).map((x) => x.label), ['a', 'b']);
  assert.equal(latest([{ label: 'a' }], 5).length, 1);
});

test('a new entry at the top of a list becomes the newest shown', () => {
  const fake = { href: '/travel/trips/tahoe-2027', label: 'Tahoe 2027' };
  assert.equal(latest([fake, ...travelTrips], 5)[0], fake);
});

test('featuredAward prefers the flagged entry, else the first', () => {
  assert.equal(featuredAward([{ label: 'a' }, { label: 'b', featured: true }]).label, 'b');
  assert.equal(featuredAward([{ label: 'a' }, { label: 'b' }]).label, 'a');
  assert.equal(featuredAward([]), undefined);
});

test('seasonLabel switches on August 1', () => {
  assert.equal(seasonLabel(new Date(2026, 6, 31)), '2025–26');
  assert.equal(seasonLabel(new Date(2026, 7, 1)), '2026–27');
});

test('registry: every award has a note, Peninsula is featured with an image, newest trips have stops', () => {
  for (const a of photographyAwards) assert.ok(a.note, `${a.label} has no note`);
  const f = featuredAward(photographyAwards);
  assert.equal(f.href, '/photography/awards/peninsula-photo-competition-2025');
  assert.ok(f.image);
  for (const t of latest(travelTrips, 5)) assert.ok(t.note, `${t.label} has no stops`);
  assert.ok(celloPerformances[0].note);
  for (const x of [...photographyAwards, ...travelTrips]) {
    if (x.image) assert.ok(fs.existsSync(path.join('public', x.image)), `missing ${x.image}`);
  }
});

test('recentStubs: two newest awards, newest trip, newest concert, with tones', () => {
  const s = recentStubs({
    awards: [{ href: '/a1', label: 'Alpha Prize 2026', note: 'Winner' }, { href: '/a2', label: 'Beta Salon 2025' }],
    trips: [{ href: '/t1', label: 'Egypt 2025', note: 'Cairo · Giza' }],
    concerts: [{ href: '/c1', label: 'Outside Lands 2026' }],
  });
  assert.deepEqual(s.map((x) => [x.kind, x.name, x.year, x.tone, x.href]), [
    ['Award', 'Alpha Prize', 2026, 'orange', '/a1'],
    ['Award', 'Beta Salon', 2025, 'rose', '/a2'],
    ['Trip', 'Egypt', 2025, 'gold', '/t1'],
    ['Concert', 'Outside Lands', 2026, 'orange', '/c1'],
  ]);
  assert.equal(s[1].note, '');
});

test('recentStubs skips missing entries', () => {
  const s = recentStubs({ awards: [{ href: '/a1', label: 'Alpha 2026' }], trips: [], concerts: [] });
  assert.deepEqual(s.map((x) => x.kind), ['Award']);
});

test('roman numerals for the awards programme', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 9, 10, 14, 39].map(roman), ['I', 'II', 'III', 'IV', 'V', 'IX', 'X', 'XIV', 'XXXIX']);
});
