import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist, serveDist, launch } from './helpers.mjs';

const AWARD = '/photography/awards/peninsula-photo-competition-2025/';

test('header markup: logo with orange period, 8 links, current section marked', () => {
  const html = readDist(AWARD);
  assert.match(html, /Zoe Wacker<span[^>]*aria-hidden="true"[^>]*>\.<\/span>/);
  const nav = html.match(/<nav[^>]*id="site-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  assert.equal((nav.match(/<a /g) || []).length, 8);
  assert.match(nav, /<a[^>]*href="\/photography"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\/photography"/);
  assert.match(html, /<button[^>]*data-menu-toggle[^>]*>/);
});

test('phone menu: toggles, closes on Escape, and works without JS', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + AWARD, { waitUntil: 'domcontentloaded' });
  const toggle = page.locator('[data-menu-toggle]');
  const firstLink = page.locator('#site-nav a').first();
  await assert.doesNotReject(toggle.waitFor({ state: 'visible' }));
  assert.equal(await firstLink.isVisible(), false);
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(await firstLink.isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await firstLink.isVisible(), false);
  assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle')), true);

  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJs = await ctx.newPage();
  await noJs.goto(srv.url + AWARD, { waitUntil: 'domcontentloaded' });
  assert.equal(await noJs.locator('#site-nav a').first().isVisible(), true);
  assert.equal(await noJs.locator('[data-menu-toggle]').isVisible(), false);
  await ctx.close();

  const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desk.goto(srv.url + AWARD, { waitUntil: 'domcontentloaded' });
  assert.equal(await desk.locator('[data-menu-toggle]').isVisible(), false);
  assert.equal(await desk.locator('#site-nav a').first().isVisible(), true);
});
