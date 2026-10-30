import test from 'node:test';
import assert from 'node:assert/strict';
import { serveDist, launch } from './helpers.mjs';

const PAGES = ['/', '/about/', '/photography/awards/npcfk-competition-shelter-2026/', '/travel/trips/egypt-2025/', '/academics/summer-programs/johns-hopkins-cty-2026/'];

test('no sideways scroll at 360px and 390px on key pages', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  for (const width of [360, 390]) for (const p of PAGES) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    await page.goto(srv.url + p, { waitUntil: 'load' });
    const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    assert.ok(sw <= iw, `${p} at ${width}px: scrollWidth ${sw} > ${iw}`);
    await page.close();
  }
});

test('with JavaScript off, every .reveal element is visible', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(srv.url + '/', { waitUntil: 'load' });
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')].filter((el) => getComputedStyle(el).opacity !== '1').length);
  assert.equal(hidden, 0);
});

test('under reduced motion, reveal elements are visible without waiting for scroll', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(srv.url + '/', { waitUntil: 'load' });
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')].filter((el) => getComputedStyle(el).opacity !== '1').length);
  assert.equal(hidden, 0);
});

test('scrolling reveals content when JavaScript is on', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/', { waitUntil: 'load' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
  await page.waitForTimeout(400);
  const notIn = await page.evaluate(() => [...document.querySelectorAll('.reveal')].filter((el) => !el.classList.contains('in')).length);
  assert.equal(notIn, 0);
});

// Screen contrast: each visible text run against its nearest opaque background.
// Body-size text needs 4.5:1; text 24px and up (or 18.66px bold) needs 3:1. Decorative aria-hidden text is skipped.
const screenContrastProbe = () => {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = ([r, g, b]) => [r, g, b].map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = rgb(getComputedStyle(e).backgroundColor);
      if (c.length < 4 || c[3] === 1) return c;
    }
    return rgb(getComputedStyle(document.body).backgroundColor);
  };
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[aria-hidden="true"]')) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own || !el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    const fg = rgb(cs.color);
    if (fg.length > 3 && fg[3] < 0.5) continue;
    const [a, b] = [lum(fg), lum(bgOf(el))].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const size = parseFloat(cs.fontSize), large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) bad.push(`${el.tagName}.${el.className} "${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}`);
  }
  return bad;
};

test('on screen, every visible text run meets WCAG AA against its background', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const route of ['/', '/about/', '/photography/awards/peninsula-photo-competition-2025/', '/travel/trips/egypt-2025/', '/photography/portfolio/']) {
    await page.goto(srv.url + route, { waitUntil: 'load' });
    assert.deepEqual((await page.evaluate(screenContrastProbe)).slice(0, 10), [], route);
  }
});
