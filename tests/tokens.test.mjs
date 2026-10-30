import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, contrast } from './helpers.mjs';

const css = fs.readFileSync('src/styles/global.css', 'utf8');
const root = css.match(/:root\s*{([^}]*)}/)?.[1] ?? '';
const token = (name) => root.match(new RegExp(`--${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`))?.[1];

const SPEC = {
  cream: '#FBF3EA', blush: '#F8EBE7', paper: '#FFFBF6', ink: '#2A1E1E', muted: '#6F675F',
  'deep-rose': '#87314D', orange: '#D2652C', rose: '#C25E77', gold: '#A87A1C',
  'orange-text': '#9C4A1C', 'rose-text': '#A84862', 'gold-text': '#8E6210',
};

test('Matinee tokens have the spec values', () => {
  for (const [k, v] of Object.entries(SPEC)) assert.equal(token(k), v, `--${k}`);
  assert.match(root, /--hair:\s*rgba\(42,\s*30,\s*30,\s*\.14\)/);
  assert.match(root, /--script:\s*"Sacramento", cursive/);
  assert.match(root, /--serif:\s*"Fraunces", Georgia, serif/);
  assert.match(root, /--soft:\s*"opsz" 144, "SOFT" 100, "WONK" 1/);
  assert.match(root, /--sans:\s*"DM Sans", system-ui, sans-serif/);
  assert.match(root, /--mono:\s*"DM Mono", ui-monospace, monospace/);
  assert.match(root, /--page-max:\s*1240px/);
  assert.match(root, /--h-orange:\s*226,\s*115,\s*58/);
  assert.match(root, /--h-rose:\s*194,\s*94,\s*119/);
  assert.match(root, /--h-gold:\s*201,\s*138,\s*30/);
});

test('body text colours reach 4.5:1 on cream, blush and paper', () => {
  for (const fg of ['ink', 'muted', 'deep-rose', 'orange-text', 'rose-text', 'gold-text']) {
    for (const bg of ['cream', 'blush', 'paper']) {
      const r = contrast(token(fg), token(bg));
      assert.ok(r >= 4.5, `--${fg} on --${bg} is ${r.toFixed(2)}:1`);
    }
  }
});

test('display colours reach 3:1 (large text) on cream and blush', () => {
  for (const fg of ['orange', 'rose', 'gold']) {
    for (const bg of ['cream', 'blush']) {
      const r = contrast(token(fg), token(bg));
      assert.ok(r >= 3, `--${fg} on --${bg} is ${r.toFixed(2)}:1`);
    }
  }
});

test('page is light cream with ink text, no italics, no Anton', () => {
  assert.match(css, /body\s*{[^}]*background-color:\s*var\(--cream\)/);
  assert.match(css, /body\s*{[^}]*color:\s*var\(--ink\)/);
  assert.match(css, /em,\s*i\s*{[^}]*font-style:\s*normal/);
  assert.doesNotMatch(css, /Anton|--night|--neon|--glow-/);
});

test('script text is thickened to a regular pen line', () => {
  assert.match(css, /\.script\s*{[^}]*-webkit-text-stroke:\s*\.011em currentColor[^}]*paint-order:\s*stroke fill/);
});

test('focus ring and anchor offset', () => {
  assert.match(css, /:focus-visible\s*{[^}]*outline:\s*2px solid var\(--deep-rose\)/);
  assert.match(css, /\[id\]\s*{[^}]*scroll-margin-top:\s*80px/);
});

test('reveal only hides content once JavaScript has run, and never under reduced motion', () => {
  assert.match(css, /\.js \.reveal\s*{[^}]*opacity:\s*0/);
  assert.match(css, /\.js \.reveal\.in\s*{[^}]*opacity:\s*1/);
  const rm = css.match(/@media \(prefers-reduced-motion: reduce\)\s*{([\s\S]*?)\n}/)?.[1] ?? '';
  assert.match(rm, /\.js \.reveal\s*{[^}]*opacity:\s*1/);
});

test('print stylesheet switches to white paper and dark text', () => {
  const print = css.match(/@media print\s*{([\s\S]*?)\n}/)?.[1] ?? '';
  assert.match(print, /background:\s*#fff/);
  assert.match(print, /color:\s*#2A1E1E/);
});

test('built pages load Sacramento, Fraunces (soft, wonky), DM Sans and DM Mono, and not Anton', () => {
  const html = readDist('/about/');
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Sacramento&family=Fraunces:opsz,wght,SOFT,WONK@[^"]*family=DM\+Sans[^"]*family=DM\+Mono/);
  assert.doesNotMatch(html, /family=Anton/);
  assert.match(html, /document\.documentElement\.classList\.add\('js'\)/);
});
