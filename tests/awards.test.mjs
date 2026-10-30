import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist, serveDist, launch } from './helpers.mjs';

const AWARDS = {
  'peninsula-photo-competition-2025': ['cinderello.jpg', 'Honorable Mention'],
  'npcfk-competition-color-2025': ['npcfk-color-2025.png', 'Notable Entry'],
  'npcfk-competition-home-2025': ['npcfk-home-2025.jpg', 'Winner · Visionary Voyager'],
  'npcfk-competition-life-in-red-2026': ['npcfk-red-2026.jpg', 'Winner · Dream Snapper'],
  'npcfk-competition-shelter-2026': ['npcfk-shelter-2026.jpg', 'Notable Entry'],
  'no-frames-2026': ['no-frames-2026-colony-panorama.jpg', 'Honorable Mention'],
  'tpoy-competition-2025': ['tpoty2025-places-collection.png', 'Runner-Up'],
  'global-peace-photo-award-2026': ['gppa-2026-1.jpg', 'Shortlisted'],
  'petange-youth-photo-contest-2026': ['npcfk-shelter-2026.jpg', 'Accepted'],
};

for (const [slug, [lead, result]] of Object.entries(AWARDS)) {
  test(`${slug}: hung lead photo with wall label, shown once`, () => {
    const html = readDist(`/photography/awards/${slug}/`);
    const hero = html.match(/<div[^>]*class="hero-band"[^>]*>([\s\S]*?)<main/)?.[1] ?? '';
    assert.match(hero, /class="award-exhibit"/);
    assert.ok(hero.includes(`/images/photography_awards/${lead}`), 'lead image is in the hero');
    assert.match(hero, new RegExp(`<p[^>]*class="badge"[^>]*>${result}</p>`));
    assert.match(hero, /Zoe Wacker, \d{4}/);
    const count = html.split(`/images/photography_awards/${lead}"`).length - 1;
    assert.equal(count, 1, `${lead} appears ${count} times`);
  });
}

test('FIAP contest: the label names its FIAP patronage number', () => {
  const html = readDist('/photography/awards/petange-youth-photo-contest-2026/');
  const hero = html.match(/<div[^>]*class="hero-band"[^>]*>([\s\S]*?)<main/)?.[1] ?? '';
  assert.match(hero, /<dt[^>]*>Recognized by<\/dt>\s*<dd[^>]*>FIAP 2026\/247 · FLPA 230\/26\/01<\/dd>/);
});

test('award label card is paper with a gold result', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/photography/awards/peninsula-photo-competition-2025/', { waitUntil: 'domcontentloaded' });
  const s = await page.evaluate(() => ({
    card: getComputedStyle(document.querySelector('.award-exhibit .label')).backgroundColor,
    badge: getComputedStyle(document.querySelector('.award-exhibit .badge')).color,
  }));
  assert.equal(s.card, 'rgb(255, 251, 246)');
  assert.equal(s.badge, 'rgb(142, 98, 16)');
});
