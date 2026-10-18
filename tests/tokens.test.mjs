import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, contrast } from './helpers.mjs';

const css = fs.readFileSync('src/styles/global.css', 'utf8');
const root = css.match(/:root\s*{([^}]*)}/)?.[1] ?? '';
const token = (name) => root.match(new RegExp(`--${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`))?.[1];

test('spec tokens have the spec values', () => {
  assert.equal(token('white'), '#FFFCFA');
  assert.equal(token('wall'), '#F8EBE7');
  assert.equal(token('wall-deep'), '#F1DDD7');
  assert.equal(token('ink'), '#2E2423');
  assert.equal(token('hair'), '#E8D5CE');
  assert.equal(token('orange'), '#E2733A');
  assert.equal(token('rose'), '#C25E77');
  assert.match(root, /--serif:\s*"Fraunces", Georgia, serif/);
  assert.match(root, /--sans:\s*"Manrope", system-ui, sans-serif/);
});

test('every text color reaches 4.5:1 on white and on the blush wall', () => {
  for (const fg of ['ink', 'muted', 'rose-text', 'orange-text']) {
    for (const bg of ['white', 'wall']) {
      const ratio = contrast(token(fg), token(bg));
      assert.ok(ratio >= 4.5, `--${fg} on --${bg} is ${ratio.toFixed(2)}:1`);
    }
  }
});

test('no italics and no Atkinson font remain in global.css', () => {
  assert.match(css, /em,\s*i\s*{[^}]*font-style:\s*normal/);
  assert.doesNotMatch(css, /Atkinson|@font-face/);
});

test('built pages load Fraunces and Manrope', () => {
  const html = readDist('/about/');
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Fraunces[^"]*family=Manrope/);
  assert.doesNotMatch(html, /atkinson/i);
});
