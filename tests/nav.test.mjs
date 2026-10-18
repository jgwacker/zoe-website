import test from 'node:test';
import assert from 'node:assert/strict';
import { NAV, isActive, sectionLabel } from '../src/lib/site-nav.mjs';

test('NAV lists the eight sections in order', () => {
  assert.deepEqual(NAV.map((n) => n.label),
    ['Home', 'About', 'Travel', 'Photography', 'Music', 'Geography', 'Guardian Arts', 'Academics']);
});

test('isActive matches the section and its sub-pages only', () => {
  assert.equal(isActive('/', '/'), true);
  assert.equal(isActive('/', '/about/'), false);
  assert.equal(isActive('/photography', '/photography/awards/no-frames-2026/'), true);
  assert.equal(isActive('/photography', '/photography'), true);
  assert.equal(isActive('/music', '/musical/'), false);
});

test('sectionLabel names the section from the first path segment', () => {
  assert.equal(sectionLabel('/photography/awards/no-frames-2026/'), 'Photography');
  assert.equal(sectionLabel('/guardian-arts/'), 'Guardian Arts');
  assert.equal(sectionLabel('/about'), 'About');
  assert.equal(sectionLabel('/'), '');
  assert.equal(sectionLabel('/blog/first-post/'), '');
});
