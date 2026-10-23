import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const EXT = new Set(['.astro', '.css', '.ts', '.mjs', '.js', '.md', '.mdx']);
const BANNED = [
  /#2337ff/i, /var\(--accent\b/, /--gray/, /gray-gradient/, /Atkinson/, /var\(--box-shadow\)/,
  /var\(--black\)/, /--theme-text-light/, /--color-text-dim/, /--theme-bg-offset/,
];

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (EXT.has(path.extname(p))) yield p;
  }
}

test('no legacy theme colors or fonts remain in src/', () => {
  const hits = [];
  for (const file of walk('src')) {
    const text = fs.readFileSync(file, 'utf8');
    for (const re of BANNED) if (re.test(text)) hits.push(`${file}: ${re}`);
  }
  assert.deepEqual(hits, []);
});

test('legacy alias block is gone from global.css', () => {
  assert.doesNotMatch(fs.readFileSync('src/styles/global.css', 'utf8'), /--accent\s*:/);
});

test('global.css gives figures rounded glowing photos and mono captions', () => {
  const css = fs.readFileSync('src/styles/global.css', 'utf8');
  assert.match(css, /figure > img,\s*figure > video\s*{[^}]*border-radius:\s*6px/);
  assert.match(css, /figure:nth-of-type\(3n\+1\) > img[^{]*{[^}]*var\(--glow-coral\)/);
  assert.match(css, /figure:nth-of-type\(3n\+2\) > img[^{]*{[^}]*var\(--glow-rose\)/);
  assert.match(css, /figure:nth-of-type\(3n\) > img[^{]*{[^}]*var\(--glow-gold\)/);
  assert.match(css, /figcaption\s*{[^}]*font-family:\s*var\(--mono\)/);
});
