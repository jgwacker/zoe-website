import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, contrast } from './helpers.mjs';

const css = fs.readFileSync('src/styles/global.css', 'utf8');
const root = css.match(/:root\s*{([^}]*)}/)?.[1] ?? '';
const token = (name) => root.match(new RegExp(`--${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`))?.[1];

test('After Dark tokens have the spec values', () => {
  assert.equal(token('night'), '#1E1424');
  assert.equal(token('night-2'), '#2A1C33');
  assert.equal(token('night-3'), '#362541');
  assert.equal(token('cream'), '#FBEFE3');
  assert.equal(token('mist'), '#C9B6C9');
  assert.equal(token('coral'), '#FF6F59');
  assert.equal(token('rose'), '#FF4F8B');
  assert.equal(token('marigold'), '#FFB13B');
  assert.match(root, /--line:\s*rgba\(251,\s*239,\s*227,\s*\.14\)/);
  assert.match(root, /--display:\s*"Anton", Impact, sans-serif/);
  assert.match(root, /--sans:\s*"DM Sans", system-ui, sans-serif/);
  assert.match(root, /--mono:\s*"DM Mono", ui-monospace, monospace/);
  assert.match(root, /--page-max:\s*1240px/);
});

test('every text color reaches 4.5:1 on night and night-2, and night text on a coral button', () => {
  for (const fg of ['cream', 'mist', 'coral', 'rose', 'marigold']) {
    for (const bg of ['night', 'night-2']) {
      const ratio = contrast(token(fg), token(bg));
      assert.ok(ratio >= 4.5, `--${fg} on --${bg} is ${ratio.toFixed(2)}:1`);
    }
  }
  assert.ok(contrast(token('night'), token('coral')) >= 4.5);
});

test('page is dark, no italics, no Soft Blush fonts', () => {
  assert.match(css, /body\s*{[^}]*background-color:\s*var\(--night\)/);
  assert.match(css, /body\s*{[^}]*color:\s*var\(--cream\)/);
  assert.match(css, /em,\s*i\s*{[^}]*font-style:\s*normal/);
  assert.doesNotMatch(css, /Fraunces|Manrope|Atkinson|@font-face/);
});

test('focus ring and anchor offset', () => {
  assert.match(css, /:focus-visible\s*{[^}]*outline:\s*2px solid var\(--marigold\)/);
  assert.match(css, /\[id\]\s*{[^}]*scroll-margin-top:\s*80px/);
});

test('print stylesheet switches to white paper and dark text', () => {
  const print = css.match(/@media print\s*{([\s\S]*?)\n}/)?.[1] ?? '';
  assert.match(print, /background:\s*#fff/);
  assert.match(print, /color:\s*#1E1424/);
});

test('built pages load Anton, DM Sans and DM Mono only', () => {
  const html = readDist('/about/');
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Anton[^"]*family=DM\+Sans[^"]*family=DM\+Mono/);
  assert.doesNotMatch(html, /Fraunces|Manrope|atkinson/i);
});
