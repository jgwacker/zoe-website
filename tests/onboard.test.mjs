import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist } from './helpers.mjs';

test('the starter blog is hidden: no /blog routes, no Lorem ipsum, empty feed, not in the sitemap', () => {
  assert.equal(fs.existsSync('dist/blog'), false, 'dist/blog exists');
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : e.name.endsWith('.html') ? [`${d}/${e.name}`] : []));
  for (const f of walk('dist')) {
    const html = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(html, /Lorem ipsum/i, `${f} has placeholder copy`);
    assert.doesNotMatch(html, /href="\/blog/, `${f} links to the hidden blog`);
  }
  const rss = fs.readFileSync('dist/rss.xml', 'utf8');
  assert.doesNotMatch(rss, /<item>/);
  const sitemap = fs.readdirSync('dist').filter((n) => n.startsWith('sitemap')).map((n) => fs.readFileSync(`dist/${n}`, 'utf8')).join('');
  assert.doesNotMatch(sitemap, /\/blog/);
});

test('sections with no sub-pages yet read in one column instead of beside an empty list', () => {
  for (const route of ['/geography/', '/guardian-arts/']) {
    const html = readDist(route);
    assert.match(html, /class="layout no-sidebar"/, `${route} should have no sidebar`);
    assert.doesNotMatch(html, /<ol[^>]*class="vlist"[^>]*>\s*<\/ol>/, `${route} renders an empty list`);
  }
  assert.match(readDist('/music/'), /<aside[^>]*class="sidebar"/, 'sections with sub-pages keep the sidebar');
});
