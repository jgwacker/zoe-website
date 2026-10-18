# Soft Blush Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle Zoe's whole Astro site in the "3D-1a Soft Blush, no italics" look, with a new exhibit homepage and gallery-style award pages, without changing any page content or URL.

**Architecture:** Design tokens and base typography live in `src/styles/global.css`. Shared components (Header, Footer, `Page.astro` title band, numbered `LinkList` sidebar, global `<figure>` styling) carry the look to all ~50 pages automatically. The homepage (`Exhibit.astro` plus `src/data/exhibit.json`) and the 8 award pages (`AwardExhibit.astro` in a new `hero` slot of `Page.astro`) get dedicated components. Tests are `node:test` files that check the built `dist/` HTML, plus browser tests driven by `playwright-core` against the locally installed Google Chrome.

**Tech Stack:** Astro 5, plain CSS custom properties, Google Fonts (Fraunces and Manrope), sharp (image resizing, already a dependency), Node 22 `node:test`, and `playwright-core` (new devDependency, which uses the system Chrome and downloads no browser).

**Spec:** `docs/superpowers/specs/2026-10-18-soft-blush-redesign-design.md`
**Reference mockup:** `design/themes/3D-1a/index.html` (homepage) and `design/themes/3D-1a/award.html` (award page). Open them in Chrome to compare.

## Global Constraints

- All work happens on branch `soft-blush-redesign`. Never commit to or push `main` during this plan. The final task pushes the branch only.
- **Token values (from the spec):** `--white:#FFFCFA`, `--wall:#F8EBE7`, `--wall-deep:#F1DDD7`, `--ink:#2E2423`, `--hair:#E8D5CE`, `--orange:#E2733A`, `--rose:#C25E77`, `--serif:"Fraunces", Georgia, serif`, `--sans:"Manrope", system-ui, sans-serif`.
- **Contrast fix (allowed by spec §1, "darken slightly if any pair falls short"):**
  - `--muted` becomes `#6F5E59`. The spec's `#7A6863` measured 4.52:1 on the wall, too close to the limit.
  - Add `--rose-text:#A84B65` and `--orange-text:#A9481A` for small text. Measured `#C25E77` on white is 3.98:1, and `#E2733A` is 3.05:1.
  - `--rose` and `--orange` stay for large display words, dots, borders and rules only.
- No italics anywhere: `em, i { font-style: normal; }`.
- No page content, URL or `src/links/registry.ts` changes, except the 8 award pages (Task 7) and `src/pages/index.astro` (Task 6).
- No school name, contact form, email, or photo of Zoe in any new element.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```
- **Test command:** `npm test`, which builds the site and then runs every `tests/*.test.mjs`. To run one file after a build, use `node --test tests/<file>.test.mjs`.

## Review Focus

1. **390px phone width:** a very long page title (e.g. "I Spy Something-“Color” : National Photography Competition for Kids November 2025") and the 8-item nav must wrap and never cause sideways scrolling. Tested in Task 3 on that exact page, and swept across all key pages in Task 8.
2. **JavaScript disabled or failed:** the homepage still shows the first photo and its label with no dead arrow buttons, and on a phone the nav links are still reachable without the Menu script. Tested in Tasks 2 and 6.
3. **Stray key presses:** arrow keys pressed while typing in a form field, or with a modifier (Cmd/Alt + arrow is browser back and forward), must not change the exhibit photo. Tested in Task 6.
4. **Missing display image:** if an exhibit photo is renamed or `npm run thumbnails` wasn't re-run, the build must fail with a clear "run npm run thumbnails" message instead of shipping a broken image. Tested in Task 5.
5. **Reduced motion and Escape:** reduced-motion users get instant photo changes with no crossfade, and Escape closes the phone menu and returns focus to the Menu button. Tested in Tasks 6 and 2.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/styles/global.css` | Rewrite (T1, T4) | Tokens, base typography, links, global figure/caption style, `.eyebrow` utility |
| `src/components/BaseHead.astro` | Modify (T1) | Load Fraunces and Manrope from Google Fonts; drop Atkinson preloads |
| `src/lib/site-nav.mjs` | Create (T2) | `NAV` list, `isActive(href, path)`, `sectionLabel(path)` |
| `src/components/Header.astro` | Rewrite (T2) | Logo, nav from `NAV`, phone Menu toggle |
| `src/layouts/Page.astro` | Rewrite (T3) | Title band (eyebrow + h1), optional `hero` slot band, sidebar grid |
| `src/components/LinkList.astro` | Rewrite (T3) | Numbered vertical list with `aria-current`; token-styled grid |
| `src/components/Footer.astro` | Rewrite (T3) | Blush footer line |
| `src/layouts/BlogPost.astro`, `src/pages/blog/index.astro`, `src/pages/photography/portfolio/index.astro`, `src/pages/photography/awards/peninsula-photo-competition-2025.astro` | Modify (T4) | Replace legacy color variables |
| `src/layouts/Site.astro`, `src/components/Footer_bak.astro` | Delete (T4) | Unused legacy files |
| `src/data/exhibit.json` | Create (T5) | Homepage exhibit photos and section rows (with `draft` flags) |
| `src/lib/exhibit.mjs` | Create (T5) | `displayPath`, `listDrafts`, `missingDisplayFiles` |
| `scripts/generate-display.mjs` | Create (T5) | Write resized images to `public/images/display/` |
| `src/components/Exhibit.astro` | Create (T6) | Homepage exhibit wall, label and slideshow script |
| `src/pages/index.astro` | Rewrite (T6) | Exhibit, intro with ZW monogram, section rows |
| `src/components/AwardExhibit.astro` | Create (T7) | Hung award photo and wall label |
| 8 files in `src/pages/photography/awards/` | Modify (T7) | Use `AwardExhibit` in the `hero` slot; remove duplicate lead figure |
| `tests/helpers.mjs` and `tests/*.test.mjs` | Create (T1–T8) | Dist readers, static server, browser launcher, tests |
| `package.json` | Modify (T1, T5) | `test` scripts, `playwright-core` devDependency, `thumbnails` script |
| `CLAUDE.md` | Modify (T8) | Document tokens, `hero` slot, exhibit data and `npm test` |

---

### Task 1: Branch, test harness, design tokens and fonts

**Files:**
- Modify: `package.json`
- Create: `tests/helpers.mjs`, `tests/tokens.test.mjs`
- Rewrite: `src/styles/global.css`
- Modify: `src/components/BaseHead.astro` (font block, lines 33–35)
- Delete: `public/fonts/atkinson-regular.woff`, `public/fonts/atkinson-bold.woff` (if present)

**Interfaces:**
- Produces (used by every later task):
  - `tests/helpers.mjs` exports `readDist(route): string`, `resolveDist(route): string`, `serveDist(): Promise<{url, close}>`, `launch(): Promise<Browser>` and `contrast(hexA, hexB): number`.
  - CSS tokens `--white --wall --wall-deep --ink --muted --hair --orange --orange-text --rose --rose-text --serif --sans --page-max --mat-shadow`, and the global `.eyebrow` class.

- [ ] **Step 1: Create the branch and add the browser-test dependency**

```bash
cd /Users/jgwacker/zoewacker
git checkout -b soft-blush-redesign
npm install --save-dev playwright-core@1.48.2
```

Then edit `package.json` `"scripts"` so it reads:

```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "thumbnails": "node scripts/generate-thumbnails.mjs",
    "test": "astro build && node --test \"tests/**/*.test.mjs\"",
    "test:only": "node --test \"tests/**/*.test.mjs\""
  },
```

- [ ] **Step 2: Write the test helpers**

Create `tests/helpers.mjs`:

```js
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.xml': 'application/xml', '.woff': 'font/woff', '.json': 'application/json',
};

/** Map a site route like "/about/" to its file in dist/. */
export function resolveDist(route) {
  const clean = decodeURIComponent(route.split('#')[0].split('?')[0]);
  let p = path.join(DIST, clean);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  else if (!path.extname(p)) p = path.join(p, 'index.html');
  return p;
}

export function readDist(route) {
  return fs.readFileSync(resolveDist(route), 'utf8');
}

/** Serve dist/ on a random localhost port (root-relative /images/... URLs work). */
export async function serveDist() {
  const server = http.createServer((req, res) => {
    const file = resolveDist(req.url);
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  return { url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

export const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Launch the locally installed Chrome via playwright-core. */
export async function launch() {
  const { chromium } = await import('playwright-core');
  return chromium.launch({ executablePath: CHROME });
}

/** WCAG contrast ratio between two #RRGGBB colors. */
export function contrast(a, b) {
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 3: Write the failing token test**

Create `tests/tokens.test.mjs`:

```js
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
```

- [ ] **Step 4: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL. `spec tokens have the spec values` fails with `undefined !== '#FFFCFA'`, and the fonts test fails.

- [ ] **Step 5: Rewrite `src/styles/global.css`**

Replace the whole file with:

```css
/* Soft Blush theme. See docs/superpowers/specs/2026-10-18-soft-blush-redesign-design.md */
:root {
	--white: #FFFCFA;
	--wall: #F8EBE7;
	--wall-deep: #F1DDD7;
	--ink: #2E2423;
	--muted: #6F5E59;
	--hair: #E8D5CE;
	--orange: #E2733A;
	--orange-text: #A9481A;
	--rose: #C25E77;
	--rose-text: #A84B65;
	--serif: "Fraunces", Georgia, serif;
	--sans: "Manrope", system-ui, sans-serif;
	--page-max: 1140px;
	--mat-shadow: 0 1px 0 rgba(0, 0, 0, .04), 0 26px 50px -22px rgba(90, 40, 30, .45), 0 8px 18px -10px rgba(90, 40, 30, .25);

	/* Legacy aliases so not-yet-converted files keep working; removed in Task 4. */
	--accent: var(--rose-text);
	--accent-dark: var(--ink);
	--black: 46, 36, 35;
	--gray: 111, 94, 89;
	--gray-light: 241, 221, 215;
	--gray-dark: 46, 36, 35;
	--gray-gradient: var(--white), var(--white);
	--box-shadow: var(--mat-shadow);
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
	margin: 0;
	padding: 0;
	background: var(--white);
	color: var(--ink);
	font-family: var(--sans);
	font-size: 17px;
	line-height: 1.7;
	text-align: left;
	overflow-wrap: break-word;
	overflow-x: hidden;
}
main {
	width: var(--page-max);
	max-width: calc(100% - 32px);
	margin: 0 auto;
	padding: 48px 0 32px;
}
h1, h2, h3, h4, h5, h6 {
	margin: 0 0 .5rem 0;
	font-family: var(--serif);
	font-weight: 400;
	color: var(--ink);
	line-height: 1.15;
}
h1 { font-size: clamp(36px, 5vw, 60px); }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.1rem; }
strong, b { font-weight: 700; }
em, i { font-style: normal; }
h1 em, h2 em, h3 em, blockquote em { color: var(--rose); }
a { color: var(--rose-text); text-decoration: none; }
a:hover { color: var(--rose-text); text-decoration: underline; text-underline-offset: 3px; }
a:visited { color: var(--rose-text); }
p { margin: 0 0 1em; }
.prose p { margin-bottom: 1.5em; }
textarea { width: 100%; font-size: 16px; }
input { font-size: 16px; }
table { width: 100%; }
img { max-width: 100%; height: auto; border-radius: 2px; }
code { padding: 2px 5px; background-color: var(--wall); border-radius: 2px; }
pre { padding: 1.5em; border-radius: 4px; }
pre > code { all: unset; }
blockquote {
	border-left: 3px solid var(--rose);
	padding: 0 0 0 20px;
	margin: 0;
	font-family: var(--serif);
	font-size: 1.25em;
	line-height: 1.4;
}
hr { border: none; border-top: 1px solid var(--hair); }
.eyebrow {
	margin: 0;
	font-family: var(--sans);
	font-size: 11.5px;
	font-weight: 700;
	letter-spacing: .2em;
	text-transform: uppercase;
	color: var(--rose-text);
}
@media (max-width: 720px) {
	body { font-size: 16px; }
	main { padding: 32px 0 24px; }
}

.sr-only {
	border: 0;
	padding: 0;
	margin: 0;
	position: absolute !important;
	height: 1px;
	width: 1px;
	overflow: hidden;
	clip: rect(1px, 1px, 1px, 1px);
	clip-path: inset(50%);
	white-space: nowrap;
}
```

- [ ] **Step 6: Switch the fonts in `src/components/BaseHead.astro`**

Replace these lines:

```astro
<!-- Font preloads -->
<link rel="preload" href="/fonts/atkinson-regular.woff" as="font" type="font/woff" crossorigin />
<link rel="preload" href="/fonts/atkinson-bold.woff" as="font" type="font/woff" crossorigin />
```

with:

```astro
<!-- Fonts: Fraunces (titles) + Manrope (body). Roman only, no italics. -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Manrope:wght@400;500;600;700&display=swap"
/>
```

Then remove the old font files, if present:

```bash
git rm -q --ignore-unmatch public/fonts/atkinson-regular.woff public/fonts/atkinson-bold.woff
```

- [ ] **Step 7: Run the tests and confirm they pass**

Run: `npm test`
Expected: all 4 tests in `tokens.test.mjs` PASS, and the build succeeds.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tests/helpers.mjs tests/tokens.test.mjs src/styles/global.css src/components/BaseHead.astro
git commit -q -F - <<'EOF'
add Soft Blush design tokens, fonts and test harness

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Nav model and header with phone menu

**Files:**
- Create: `src/lib/site-nav.mjs`, `tests/nav.test.mjs`, `tests/header.test.mjs`
- Rewrite: `src/components/Header.astro`
- Keep, don't edit: `src/components/HeaderLink.astro`, which is still imported by `src/content/blog/using-mdx.mdx`

**Interfaces:**
- Consumes: `readDist`, `serveDist` and `launch` from `tests/helpers.mjs`.
- Produces: `src/lib/site-nav.mjs` exports:
  - `NAV: {href: string, label: string}[]`, 8 entries starting with Home
  - `isActive(href: string, path: string): boolean`
  - `sectionLabel(path: string): string`, which returns `''` when there is no matching section
- Produces: the header DOM contract: `header.site-header[data-header]`, `button[data-menu-toggle][aria-controls="site-nav"]`, `nav#site-nav`.

- [ ] **Step 1: Write the failing unit test**

Create `tests/nav.test.mjs`:

```js
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
```

- [ ] **Step 2: Write the failing header tests**

Create `tests/header.test.mjs`:

```js
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
```

- [ ] **Step 3: Run them and confirm they fail**

Run: `npm test`
Expected: FAIL. `nav.test.mjs` fails with `Cannot find module '../src/lib/site-nav.mjs'`, and the header markup test fails because there's no `id="site-nav"`.

- [ ] **Step 4: Create `src/lib/site-nav.mjs`**

```js
/** Primary site navigation, shared by the header and the page title band. */
export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/travel', label: 'Travel' },
  { href: '/photography', label: 'Photography' },
  { href: '/music', label: 'Music' },
  { href: '/geography', label: 'Geography' },
  { href: '/guardian-arts', label: 'Guardian Arts' },
  { href: '/academics', label: 'Academics' },
];

/** True when `path` is the nav item's page or one of its sub-pages. */
export function isActive(href, path) {
  const p = path.replace(/\/+$/, '') || '/';
  if (href === '/') return p === '/';
  return p === href || p.startsWith(href + '/');
}

/** The section label for a URL path ("/photography/awards/x/" -> "Photography"), or ''. */
export function sectionLabel(path) {
  const first = path.split('/').filter(Boolean)[0];
  if (!first) return '';
  return NAV.find((n) => n.href === '/' + first)?.label ?? '';
}
```

- [ ] **Step 5: Rewrite `src/components/Header.astro`**

```astro
---
import { NAV, isActive } from '../lib/site-nav.mjs';
const path = Astro.url.pathname;
---

<header class="site-header" data-header>
	<div class="bar">
		<a class="mark" href="/">Zoe Wacker<span aria-hidden="true">.</span></a>
		<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav" data-menu-toggle>Menu</button>
		<nav id="site-nav" aria-label="Site">
			<ul>
				{NAV.map((n) => (
					<li><a href={n.href} aria-current={isActive(n.href, path) ? 'page' : undefined}>{n.label}</a></li>
				))}
			</ul>
		</nav>
	</div>
</header>

<script>
	const header = document.querySelector('[data-header]');
	const toggle = header?.querySelector('[data-menu-toggle]');
	if (header && toggle) {
		header.classList.add('js');
		const setOpen = (open) => {
			header.classList.toggle('open', open);
			toggle.setAttribute('aria-expanded', String(open));
		};
		toggle.addEventListener('click', () => setOpen(!header.classList.contains('open')));
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && header.classList.contains('open')) {
				setOpen(false);
				toggle.focus();
			}
		});
	}
</script>

<style>
	.site-header { background: var(--white); border-bottom: 1px solid var(--hair); }
	.bar {
		width: var(--page-max);
		max-width: calc(100% - 32px);
		margin: 0 auto;
		padding: 24px 0;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px 24px;
	}
	.mark { font-family: var(--serif); font-size: 28px; line-height: 1; color: var(--ink); text-decoration: none; }
	.mark:visited, .mark:hover { color: var(--ink); text-decoration: none; }
	.mark span { color: var(--orange); }
	nav ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 24px; }
	nav a {
		font-size: 12.5px;
		font-weight: 600;
		letter-spacing: .14em;
		text-transform: uppercase;
		color: var(--muted);
		text-decoration: none;
		padding-bottom: 3px;
		border-bottom: 2px solid transparent;
	}
	nav a:visited { color: var(--muted); }
	nav a:hover, nav a[aria-current='page'] { color: var(--ink); border-color: var(--orange); text-decoration: none; }
	.menu-toggle {
		display: none;
		align-self: center;
		font: 600 12px/1 var(--sans);
		letter-spacing: .14em;
		text-transform: uppercase;
		color: var(--ink);
		background: transparent;
		border: 1px solid var(--ink);
		border-radius: 999px;
		padding: 10px 16px;
		cursor: pointer;
	}
	@media (max-width: 860px) {
		.bar { align-items: center; padding: 16px 0; }
		nav { flex-basis: 100%; }
		nav ul { flex-direction: column; gap: 0; }
		nav li a { display: block; padding: 12px 0; border-bottom: 1px solid var(--hair); }
		.site-header.js .menu-toggle { display: inline-flex; }
		.site-header.js nav { display: none; }
		.site-header.js.open nav { display: block; }
	}
</style>
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `npm test`
Expected: `nav.test.mjs` (3 tests) and `header.test.mjs` (2 tests) PASS, and `tokens.test.mjs` still passes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/site-nav.mjs src/components/Header.astro tests/nav.test.mjs tests/header.test.mjs
git commit -q -F - <<'EOF'
restyle header with shared nav model and phone menu

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Page layout title band, hero slot, numbered sidebar, footer

**Files:**
- Rewrite: `src/layouts/Page.astro`, `src/components/LinkList.astro`, `src/components/Footer.astro`
- Create: `tests/layout.test.mjs`

**Interfaces:**
- Consumes: `sectionLabel` from `src/lib/site-nav.mjs`, and `readDist`, `serveDist` and `launch` from the helpers.
- Produces:
  - `Page.astro` accepts props `title`, `description` and the slots `sidebar`, `hero` (new, optional, rendered full-width on a blush band right under the title band) and the default slot.
  - DOM contract: `section.title-band > .band-inner > p.eyebrow + h1.post-title`, `div.hero-band` (only when the hero slot is used), and `ol.vlist > li > a[aria-current] > span.n + span.t`.

- [ ] **Step 1: Write the failing layout tests**

Create `tests/layout.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist, serveDist, launch } from './helpers.mjs';

const AWARD = '/photography/awards/peninsula-photo-competition-2025/';
const LONG = '/photography/awards/npcfk-competition-color-2025/';

test('title band shows the section eyebrow and page title', () => {
  const html = readDist(AWARD);
  assert.match(html, /<section[^>]*class="title-band"[\s\S]*?<p[^>]*class="eyebrow"[^>]*>Photography<\/p>[\s\S]*?<h1[^>]*class="post-title"/);
  assert.match(readDist('/about/'), /<p[^>]*class="eyebrow"[^>]*>About<\/p>/);
  assert.doesNotMatch(readDist('/blog/'), /<p[^>]*class="eyebrow"[^>]*><\/p>/, 'no empty eyebrow');
});

test('sidebar is a numbered list with the current page marked', () => {
  const html = readDist(AWARD);
  const list = html.match(/<ol[^>]*class="vlist"[^>]*>([\s\S]*?)<\/ol>/)?.[1] ?? '';
  assert.match(list, /<span[^>]*class="n"[^>]*>01<\/span>/);
  assert.match(list, /href="\/photography\/awards\/peninsula-photo-competition-2025"[^>]*aria-current="page"/);
  assert.equal((list.match(/aria-current="page"/g) || []).length, 1);
});

test('footer reads "© <year> Zoe Wacker · Menlo Park, California"', () => {
  assert.match(readDist('/about/'), /© \d{4} Zoe Wacker · Menlo Park, California/);
});

test('long page title does not cause sideways scroll at 390px', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + LONG, { waitUntil: 'domcontentloaded' });
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  assert.ok(sw <= iw, `scrollWidth ${sw} > innerWidth ${iw}`);
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npm test`
Expected: FAIL, because there's no `title-band`, no `ol.vlist`, and the footer text doesn't match.

- [ ] **Step 3: Rewrite `src/layouts/Page.astro`**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { sectionLabel } from '../lib/site-nav.mjs';

const { title = 'Untitled', description = '' } = Astro.props;
const eyebrow = sectionLabel(Astro.url.pathname);
const hasHero = Astro.slots.has('hero');
---
<html lang="en">
  <head>
    <BaseHead title={title} description={description} />
  </head>
  <body>
    <Header />
    <section class="title-band">
      <div class="band-inner">
        {eyebrow && <p class="eyebrow">{eyebrow}</p>}
        <h1 class="post-title">{title}</h1>
      </div>
    </section>
    {hasHero && (
      <div class="hero-band">
        <slot name="hero" />
      </div>
    )}
    <main class="container">
      <div class="layout">
        <aside class="sidebar">
          <slot name="sidebar" />
        </aside>
        <section class="content">
          <slot />
        </section>
      </div>
    </main>
    <Footer />
  </body>
</html>

<style>
  .title-band { background: var(--wall); padding: 56px 16px 40px; }
  .band-inner { width: var(--page-max); max-width: 100%; margin: 0 auto; }
  .post-title {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(32px, 5vw, 60px);
    line-height: 1.05;
    margin: 10px 0 0;
    overflow-wrap: anywhere;
  }
  .hero-band {
    background: linear-gradient(180deg, var(--wall) 0 86%, var(--wall-deep) 86% 100%);
    padding: 8px 16px 72px;
  }
  .layout { display: grid; grid-template-columns: minmax(200px, 240px) minmax(0, 1fr); gap: 56px; }
  .layout:has(.sidebar:empty) { grid-template-columns: minmax(0, 1fr); }
  .sidebar:empty { display: none; }
  .sidebar { position: sticky; top: 24px; align-self: start; }
  .content { min-width: 0; }
  @media (max-width: 860px) {
    .title-band { padding: 36px 16px 28px; }
    .hero-band { padding: 4px 16px 48px; }
    .layout { grid-template-columns: minmax(0, 1fr); gap: 32px; }
    .sidebar { position: static; }
  }
</style>
```

- [ ] **Step 4: Rewrite `src/components/LinkList.astro`**

```astro
---
const { items = [], orientation = 'grid' } = Astro.props;
const norm = (h) => h.replace(/\/+$/, '') || '/';
const here = norm(Astro.url.pathname);
const num = (i) => String(i + 1).padStart(2, '0');
---
{orientation === 'vertical' ? (
  <ol class="vlist" role="list">
    {items.map((it, i) => (
      <li>
        <a href={it.href} aria-current={norm(it.href) === here ? 'page' : undefined}>
          <span class="n">{num(i)}</span><span class="t">{it.label}</span>
        </a>
      </li>
    ))}
  </ol>
) : (
  <ul class="grid" role="list">
    {items.map((it) => (
      <li>
        <a href={it.href}>{it.label}</a>
        {it.desc && <p class="desc">{it.desc}</p>}
      </li>
    ))}
  </ul>
)}

<style>
  .vlist { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--ink); }
  .vlist a {
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 10px;
    align-items: baseline;
    padding: 12px 4px;
    border-bottom: 1px solid var(--hair);
    color: var(--ink);
    font-size: 15px;
    line-height: 1.35;
    text-decoration: none;
    transition: background .2s, padding .2s;
  }
  .vlist a:visited { color: var(--ink); }
  .vlist a:hover { background: var(--wall); padding-left: 10px; text-decoration: none; color: var(--ink); }
  .vlist .n { font-family: var(--serif); font-size: 15px; color: var(--muted); }
  .vlist a[aria-current='page'] { box-shadow: inset 3px 0 0 var(--orange); padding-left: 12px; font-weight: 600; }
  .vlist a[aria-current='page'] .n { color: var(--orange-text); }
  .grid {
    list-style: none;
    margin: .5rem 0 1.5rem;
    padding: 0;
    display: grid;
    gap: .75rem 1.25rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .grid a { color: var(--rose-text); text-decoration: none; }
  .grid a:hover { text-decoration: underline; text-underline-offset: 3px; }
  .desc { margin: .2rem 0 0; color: var(--muted); font-size: .95rem; }
  @media (prefers-reduced-motion: reduce) { .vlist a { transition: none; } }
</style>
```

- [ ] **Step 5: Rewrite `src/components/Footer.astro`**

```astro
---
const year = new Date().getFullYear();
---
<footer class="site-footer">
	<span>© {year} Zoe Wacker · Menlo Park, California</span>
</footer>

<style>
	.site-footer {
		margin-top: 64px;
		padding: 28px 16px 48px;
		background: var(--wall);
		color: var(--muted);
		font-size: 13px;
		text-align: center;
	}
</style>
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `npm test`
Expected: the 4 tests in `layout.test.mjs` PASS, and every earlier test still passes.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/Page.astro src/components/LinkList.astro src/components/Footer.astro tests/layout.test.mjs
git commit -q -F - <<'EOF'
add blush title band, hero slot, numbered sidebar and footer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Global photo style, remaining layouts and legacy cleanup

**Files:**
- Modify: `src/styles/global.css` (append the figure rules; delete the legacy aliases block)
- Modify: `src/layouts/BlogPost.astro`, `src/pages/blog/index.astro`, `src/pages/photography/portfolio/index.astro` (line ~104), `src/pages/photography/awards/peninsula-photo-competition-2025.astro` (its local `<style>`)
- Delete: `src/layouts/Site.astro` (only `.bak` files import it), `src/components/Footer_bak.astro`
- Create: `tests/leftovers.test.mjs`

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces: the global rule that every `figure > img` / `figure > video` gets a white mat and shadow, and every `figcaption` is a wall label. Task 7 relies on this.

- [ ] **Step 1: Write the failing leftovers test**

Create `tests/leftovers.test.mjs`:

```js
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

test('global.css gives figures a white mat and wall-label captions', () => {
  const css = fs.readFileSync('src/styles/global.css', 'utf8');
  assert.match(css, /figure > img,\s*figure > video\s*{[^}]*box-shadow:\s*var\(--mat-shadow\)/);
  assert.match(css, /figcaption\s*{[^}]*border-top:\s*1px solid var\(--hair\)/);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test`
Expected: FAIL. The hits list includes `src/layouts/Site.astro`, `src/components/Footer_bak.astro`, `src/layouts/BlogPost.astro`, `src/pages/blog/index.astro`, `src/pages/photography/awards/peninsula-photo-competition-2025.astro` and `src/styles/global.css`.

- [ ] **Step 3: Append the global photo rules to `src/styles/global.css`** (just before the `.sr-only` block)

```css
/* Every photo on the site hangs in a white mat with a wall-label caption. */
figure { margin: 2rem 0; }
figure > img,
figure > video {
	display: block;
	margin: 0 auto;
	max-width: 100%;
	height: auto;
	background: #fff;
	padding: 12px;
	border-radius: 0;
	box-shadow: var(--mat-shadow);
}
figcaption {
	max-width: 36rem;
	margin: 14px auto 0;
	padding-top: 10px;
	border-top: 1px solid var(--hair);
	font-family: var(--sans);
	font-size: 13px;
	line-height: 1.5;
	color: var(--muted);
	text-align: left;
	font-style: normal;
}
@media (max-width: 860px) {
	figure > img, figure > video { padding: 8px; }
}
```

Then delete the whole legacy alias block from `:root` (the comment line `/* Legacy aliases … */` and the 8 lines `--accent` through `--box-shadow`).

- [ ] **Step 4: Replace legacy variables in the remaining files**

```bash
cd /Users/jgwacker/zoewacker
# Blog layout + blog index
sed -i '' \
  -e 's/rgb(var(--gray-dark))/var(--ink)/g' \
  -e 's/rgb(var(--gray))/var(--muted)/g' \
  -e 's/rgb(var(--black))/var(--ink)/g' \
  -e 's/rgb(var(--accent))/var(--rose-text)/g' \
  -e 's/var(--box-shadow)/var(--mat-shadow)/g' \
  src/layouts/BlogPost.astro src/pages/blog/index.astro
# Peninsula award page's local caption color
sed -i '' 's/var(--color-text-dim, #666)/var(--muted)/g' src/pages/photography/awards/peninsula-photo-competition-2025.astro
# Portfolio slide background
sed -i '' 's/background: #f4f4f4;/background: var(--wall);/' src/pages/photography/portfolio/index.astro
git rm -q src/layouts/Site.astro src/components/Footer_bak.astro
```

In `src/layouts/BlogPost.astro`, also change `.last-updated-on { font-style: italic; }` to `.last-updated-on { font-style: normal; }`.

Then remove page-local rounded corners that would fight the mat:

```bash
grep -rln "\.photo img {[^}]*border-radius" src/pages | xargs -r sed -i '' -E 's/(\.photo img \{[^}]*)border-radius: *[0-9]+px;?/\1/'
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npm test`
Expected: the 3 tests in `leftovers.test.mjs` PASS, and all earlier tests pass. If `leftovers` still lists a file, open it and replace that variable with the matching token: `--accent` becomes `--rose-text`, gray text becomes `--muted`, `--black` becomes `--ink`, gray backgrounds become `--wall`, and `--box-shadow` becomes `--mat-shadow`. Then re-run.

- [ ] **Step 6: Commit**

```bash
git add -A src/styles/global.css src/layouts src/components src/pages tests/leftovers.test.mjs
git commit -q -F - <<'EOF'
apply gallery photo style site-wide and remove legacy theme colors

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Exhibit data, helpers and display images

**Files:**
- Create: `src/data/exhibit.json`, `src/lib/exhibit.mjs`, `scripts/generate-display.mjs`, `tests/exhibit-data.test.mjs`
- Create (generated): `public/images/display/*.jpg`
- Modify: `package.json` (`thumbnails` script)

**Interfaces:**
- Consumes: `NAV` from `src/lib/site-nav.mjs`.
- Produces:
  - `src/data/exhibit.json` has the shape `{ items: Item[6], sections: Section[7] }`.
    - `Item = { image, alt, title, place, year: number|null, note, award?: string, href?: string, draft?: true }`
    - `Section = { href, title, desc, thumb, draft?: true }`
  - `src/lib/exhibit.mjs` exports:
    - `displayPath(image: string, kind?: 'full'|'row'): string`, which returns `/images/display/<name>.jpg` or `/images/display/row-<name>.jpg`
    - `listDrafts(data): string[]`
    - `missingDisplayFiles(data, publicDir: string): string[]`

- [ ] **Step 1: Write the failing data tests**

Create `tests/exhibit-data.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { displayPath, listDrafts, missingDisplayFiles } from '../src/lib/exhibit.mjs';
import { NAV } from '../src/lib/site-nav.mjs';

const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));

test('six exhibit items, each complete', () => {
  assert.equal(data.items.length, 6);
  for (const it of data.items) {
    for (const k of ['image', 'alt', 'title', 'place', 'note']) assert.ok(it[k], `${it.title || it.image} missing ${k}`);
    assert.ok(fs.existsSync(path.join('public', it.image)), `original missing: ${it.image}`);
  }
  assert.equal(data.items[0].title, 'Cinderello');
});

test('section rows match the nav (minus Home), in order', () => {
  assert.deepEqual(data.sections.map((s) => s.href), NAV.slice(1).map((n) => n.href));
  for (const s of data.sections) assert.ok(s.title && s.desc && s.thumb, s.href);
});

test('displayPath maps originals to resized jpgs', () => {
  assert.equal(displayPath('/images/portfolio/portfolio-64.jpg'), '/images/display/portfolio-64.jpg');
  assert.equal(displayPath('/images/photography_awards/x.png'), '/images/display/x.jpg');
  assert.equal(displayPath('/images/home/music.jpg', 'row'), '/images/display/row-music.jpg');
});

test('listDrafts names draft photos and sections', () => {
  const d = listDrafts({ items: [{ title: 'A', draft: true }, { title: 'B' }], sections: [{ title: 'Music', draft: true }] });
  assert.deepEqual(d, ['photo: A', 'section: Music']);
});

test('missingDisplayFiles reports display images that do not exist', () => {
  const fake = { items: [{ image: '/images/nope/missing-photo.jpg' }], sections: [] };
  assert.deepEqual(missingDisplayFiles(fake, 'public'), ['/images/display/missing-photo.jpg']);
});

test('every display image exists and is at most 1600px wide', async () => {
  assert.deepEqual(missingDisplayFiles(data, 'public'), []);
  for (const it of data.items) {
    const { width } = await sharp(path.join('public', displayPath(it.image))).metadata();
    assert.ok(width <= 1600, `${it.image} display is ${width}px`);
  }
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test tests/exhibit-data.test.mjs`
Expected: FAIL with `Cannot find module '../src/lib/exhibit.mjs'`.

- [ ] **Step 3: Create `src/lib/exhibit.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';

/** Resized copy of an original image, written by scripts/generate-display.mjs. */
export function displayPath(image, kind = 'full') {
  const name = path.posix.basename(image).replace(/\.[^.]+$/, '');
  return `/images/display/${kind === 'row' ? 'row-' : ''}${name}.jpg`;
}

/** Captions and section blurbs still marked "draft": true, for Zoe to edit. */
export function listDrafts(data) {
  return [
    ...data.items.filter((i) => i.draft).map((i) => `photo: ${i.title}`),
    ...data.sections.filter((s) => s.draft).map((s) => `section: ${s.title}`),
  ];
}

/** Display images referenced by the data that are missing from publicDir. */
export function missingDisplayFiles(data, publicDir) {
  const wanted = [
    ...data.items.map((i) => displayPath(i.image)),
    ...data.sections.map((s) => displayPath(s.thumb, 'row')),
  ];
  return wanted.filter((p) => !fs.existsSync(path.join(publicDir, p)));
}
```

- [ ] **Step 4: Create `src/data/exhibit.json`**

Cinderello's caption is Zoe's own words, from the Peninsula award page. Everything marked `"draft": true` is for Zoe to rewrite.

```json
{
  "items": [
    {
      "image": "/images/photography_awards/cinderello.jpg",
      "alt": "A caretaker sweeps the red carpets of the vast Mosque–Madrasa of Sultan Ḥasan in Cairo, light falling across the stone walls.",
      "title": "Cinderello",
      "place": "Mosque–Madrasa of Sultan Ḥasan, Cairo",
      "year": 2025,
      "note": "A man was sweeping the carpets, and the light caught the dust just right.",
      "award": "Honorable Mention · Peninsula Photo Contest 2025",
      "href": "/photography/awards/peninsula-photo-competition-2025"
    },
    {
      "image": "/images/portfolio/portfolio-64.jpg",
      "alt": "A Nubian woman in a bright headscarf laughing as she plays a frame drum in front of an ochre wall.",
      "title": "Frame Drum",
      "place": "Nubian village, Aswan, Egypt",
      "year": 2025,
      "note": "She couldn’t stop laughing while she played.",
      "award": "Winner · National Photography Competition for Kids",
      "href": "/photography/awards/npcfk-competition-home-2025",
      "draft": true
    },
    {
      "image": "/images/portfolio/portfolio-72.jpg",
      "alt": "A woman in Day of the Dead calavera face paint, a crown of red roses and a red dress, at night.",
      "title": "Día de los Muertos",
      "place": "Mission District, San Francisco",
      "year": null,
      "note": "Calavera face paint, red roses and a red fan at the Day of the Dead celebration.",
      "award": "Winner · National Photography Competition for Kids",
      "href": "/photography/awards/npcfk-competition-life-in-red-2026",
      "draft": true
    },
    {
      "image": "/images/portfolio/portfolio-45.jpg",
      "alt": "A black cat walking across a patterned mosque carpet.",
      "title": "Visitor",
      "place": "Cairo, Egypt",
      "year": 2025,
      "note": "A black cat crossing the patterned prayer carpet.",
      "draft": true
    },
    {
      "image": "/images/portfolio/portfolio-53.jpg",
      "alt": "A bright red Nubian house with a blue arched door.",
      "title": "Blue Door",
      "place": "Nubian village, Aswan, Egypt",
      "year": 2025,
      "note": "A red house and an arched blue door in full sun.",
      "draft": true
    },
    {
      "image": "/images/portfolio/portfolio-21.jpg",
      "alt": "Two king penguins standing side by side on grass.",
      "title": "You’ve Got Me",
      "place": "Tierra del Fuego, Chile",
      "year": 2025,
      "note": "Two king penguins who have each other’s backs.",
      "draft": true
    }
  ],
  "sections": [
    { "href": "/about", "title": "About", "desc": "Who I am and what I’m into right now.", "thumb": "/images/home/about.jpg", "draft": true },
    { "href": "/travel", "title": "Travel", "desc": "Egypt and Chile 2025, London and Rome 2024, Paris 2023, and more.", "thumb": "/images/trips/egypt_2025/nile_cruise_egypt_2025.jpg", "draft": true },
    { "href": "/photography", "title": "Photography", "desc": "My portfolio and the contests I’ve entered.", "thumb": "/images/photography_awards/cinderello.jpg", "draft": true },
    { "href": "/music", "title": "Music", "desc": "Cello, orchestra, and concerts from Laufey to Outside Lands.", "thumb": "/images/home/music.jpg", "draft": true },
    { "href": "/geography", "title": "Geography", "desc": "Maps, places, and the history behind them.", "thumb": "/images/home/geography.jpg", "draft": true },
    { "href": "/guardian-arts", "title": "Guardian Arts", "desc": "Arts projects and programs.", "thumb": "/images/home/photography.jpg", "draft": true },
    { "href": "/academics", "title": "Academics", "desc": "Summer programs and my school years.", "thumb": "/images/home/academics.jpg", "draft": true }
  ]
}
```

- [ ] **Step 5: Create `scripts/generate-display.mjs`**

```js
#!/usr/bin/env node
// Writes resized copies of the homepage exhibit photos (1600px) and section thumbnails (320px)
// to public/images/display/. Re-run via `npm run thumbnails` after editing src/data/exhibit.json.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { displayPath } from '../src/lib/exhibit.mjs';

const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const jobs = [
  ...data.items.map((i) => [i.image, 'full', 1600]),
  ...data.sections.map((s) => [s.thumb, 'row', 320]),
];
fs.mkdirSync('public/images/display', { recursive: true });

for (const [src, kind, width] of jobs) {
  const input = path.join('public', src);
  const output = path.join('public', displayPath(src, kind));
  if (fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) {
    console.log('skip ', output);
    continue;
  }
  await sharp(input).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(output);
  console.log('wrote', output);
}
```

In `package.json`, change the `thumbnails` script to:

```json
    "thumbnails": "node scripts/generate-thumbnails.mjs && node scripts/generate-display.mjs",
```

- [ ] **Step 6: Generate the images and run the tests**

```bash
npm run thumbnails
node --test tests/exhibit-data.test.mjs
```

Expected: the script prints `wrote public/images/display/...` for 13 files (6 full, 7 row). All 6 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/exhibit.json src/lib/exhibit.mjs scripts/generate-display.mjs package.json public/images/display tests/exhibit-data.test.mjs
git commit -q -F - <<'EOF'
add homepage exhibit data and resized display images

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 6: Exhibit homepage

**Files:**
- Create: `src/components/Exhibit.astro`, `tests/home.test.mjs`
- Rewrite: `src/pages/index.astro`

**Interfaces:**
- Consumes: `src/data/exhibit.json`, `displayPath`, `listDrafts` and `missingDisplayFiles` (Task 5), `FullBleed.astro` (unchanged), and the `.eyebrow` class (Task 1).
- Produces: the homepage DOM contract:
  - `[data-show]` (JSON of slides), `img[data-art]`, `[data-title]`, `[data-cur]`
  - `button[data-prev]`, `button[data-next]`, `[data-controls]` (hidden without JS)
  - `.monogram`, `ul.rows`

- [ ] **Step 1: Write the failing homepage tests**

Create `tests/home.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, serveDist, launch } from './helpers.mjs';

const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const html = readDist('/');

test('static homepage: first photo, all titles, monogram, intro, section rows', () => {
  assert.match(html, /<img[^>]*data-art[^>]*src="\/images\/display\/cinderello\.jpg"|<img[^>]*src="\/images\/display\/cinderello\.jpg"[^>]*data-art/);
  assert.match(html, /Little stories, <em[^>]*>found<\/em> on the road/);
  for (const it of data.items) assert.ok(html.includes(it.title), `missing title ${it.title}`);
  assert.match(html, /class="monogram"[^>]*>ZW</);
  assert.ok(html.includes('tell little stories'));
  for (const s of data.sections) assert.match(html, new RegExp(`href="${s.href}"`));
  assert.doesNotMatch(html, /src="\/images\/portfolio\/portfolio-/, 'homepage must use resized display images');
});

test('exhibit controls: buttons, arrow keys, ignores typing and modifiers', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  const title = () => page.locator('[data-title]').textContent();

  assert.equal(await title(), data.items[0].title);
  await page.click('[data-next]');
  assert.equal(await title(), data.items[1].title);
  assert.equal(await page.locator('[data-cur]').textContent(), '02');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await title(), data.items[0].title);
  await page.keyboard.press('ArrowLeft');
  assert.equal(await title(), data.items[5].title, 'wraps around to the last photo');

  await page.keyboard.press('Alt+ArrowRight');
  assert.equal(await title(), data.items[5].title, 'modifier keys are ignored');

  await page.evaluate(() => { const i = document.createElement('input'); i.id = 'probe'; document.body.append(i); });
  await page.focus('#probe');
  await page.keyboard.press('ArrowRight');
  assert.equal(await title(), data.items[5].title, 'typing in a field does not change the photo');
});

test('reduced motion swaps the photo instantly with no fade', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  await page.click('[data-next]');
  const state = await page.evaluate(() => {
    const img = document.querySelector('[data-art]');
    return { src: img.getAttribute('src'), fading: img.classList.contains('fade') };
  });
  assert.equal(state.src, '/images/display/portfolio-64.jpg');
  assert.equal(state.fading, false);
});

test('without JavaScript the first photo and label show and controls are hidden', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('[data-art]').isVisible(), true);
  assert.equal(await page.locator('[data-title]').textContent(), 'Cinderello');
  assert.equal(await page.locator('[data-controls]').isVisible(), false);
});

test('homepage has no sideways scroll at 390px', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + '/', { waitUntil: 'domcontentloaded' });
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  assert.ok(sw <= iw, `scrollWidth ${sw} > innerWidth ${iw}`);
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npm test`
Expected: FAIL. The static test finds no `data-art` image, and the browser tests time out waiting for `[data-next]`.

- [ ] **Step 3: Create `src/components/Exhibit.astro`**

```astro
---
import { displayPath } from '../lib/exhibit.mjs';

interface Item { image: string; alt: string; title: string; place: string; year: number | null; note: string; award?: string; href?: string }
const { items } = Astro.props as { items: Item[] };

const pad = (n: number) => String(n).padStart(2, '0');
const show = items.map((it) => ({
  src: displayPath(it.image),
  alt: it.alt,
  title: it.title,
  meta: [it.place, it.year].filter(Boolean).join(' · '),
  note: it.note,
  award: it.award ?? '',
  href: it.href ?? '',
}));
const first = show[0];
---

<section class="room" aria-label="Featured photographs">
  <div class="room-head">
    <div>
      <p class="eyebrow">Gallery One · Now showing</p>
      <h1>Little stories, <em>found</em> on the road</h1>
    </div>
    <p class="counter"><b data-cur>01</b> / <span>{pad(show.length)}</span></p>
  </div>
  <div class="exhibit" data-show={JSON.stringify(show)}>
    <div class="frame">
      <img data-art src={first.src} alt={first.alt} />
    </div>
    <aside class:list={['label', { 'has-award': first.award }]} data-label aria-live="polite">
      <p class="no" data-no>No. 01</p>
      <h2 data-title>{first.title}</h2>
      <p class="meta" data-meta>{first.meta}</p>
      <p class="note" data-note>{first.note}</p>
      <a class="award" data-award href={first.href || undefined}>{first.award}</a>
      <div class="controls" data-controls hidden>
        <button type="button" data-prev aria-label="Previous photograph">&larr;</button>
        <button type="button" data-next aria-label="Next photograph">&rarr;</button>
        <div class="dots" data-dots aria-hidden="true"></div>
      </div>
    </aside>
  </div>
  <ol class="sr-only" aria-label="All featured photographs">
    {show.map((s) => <li>{s.title}, {s.meta}</li>)}
  </ol>
</section>

<script>
  const root = document.querySelector<HTMLElement>('[data-show]');
  if (root) {
    const show = JSON.parse(root.dataset.show!);
    const q = <T extends Element>(s: string) => document.querySelector<T>(s)!;
    const img = q<HTMLImageElement>('[data-art]');
    const label = q<HTMLElement>('[data-label]');
    const dots = q<HTMLElement>('[data-dots]');
    const award = q<HTMLAnchorElement>('[data-award]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pad = (n: number) => String(n).padStart(2, '0');
    let i = 0;

    show.forEach(() => dots.appendChild(document.createElement('i')));
    q<HTMLElement>('[data-controls]').hidden = false;

    const swap = (s: { src: string; alt: string }) => {
      img.onload = img.onerror = () => img.classList.remove('fade');
      img.src = s.src;
      img.alt = s.alt;
    };

    function render(animate: boolean) {
      const s = show[i];
      if (animate && !reduce) {
        img.classList.add('fade');
        setTimeout(() => swap(s), 220);
      } else {
        swap(s);
      }
      q('[data-no]').textContent = 'No. ' + pad(i + 1);
      q('[data-title]').textContent = s.title;
      q('[data-meta]').textContent = s.meta;
      q('[data-note]').textContent = s.note;
      award.textContent = s.award;
      if (s.href) award.setAttribute('href', s.href); else award.removeAttribute('href');
      label.classList.toggle('has-award', !!s.award);
      q('[data-cur]').textContent = pad(i + 1);
      [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
    }

    const go = (d: number) => { i = (i + d + show.length) % show.length; render(true); };
    q('[data-prev]').addEventListener('click', () => go(-1));
    q('[data-next]').addEventListener('click', () => go(1));
    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });
    render(false);
  }
</script>

<style>
  .room {
    background: linear-gradient(180deg, var(--wall) 0%, var(--wall) 82%, var(--wall-deep) 82%, var(--wall-deep) 100%);
    padding: 72px 48px 96px;
  }
  .room-head { max-width: 1240px; margin: 0 auto 44px; display: flex; justify-content: space-between; align-items: end; gap: 24px; flex-wrap: wrap; }
  .room-head h1 { font-family: var(--serif); font-weight: 400; font-size: clamp(40px, 5vw, 64px); line-height: 1.02; margin: 8px 0 0; }
  .room-head h1 em { color: var(--rose); }
  .counter { font-family: var(--serif); font-size: 22px; color: var(--muted); margin: 0; }
  .counter b { color: var(--ink); font-weight: 400; }
  .exhibit { max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 56px; align-items: center; }
  .frame { display: flex; justify-content: center; align-items: center; height: min(68vh, 640px); }
  .frame img {
    max-height: 100%; width: auto; max-width: 100%; object-fit: contain;
    background: #fff; padding: 14px; border-radius: 0; box-shadow: var(--mat-shadow);
    transition: opacity .45s ease;
  }
  .frame img.fade { opacity: 0; }
  .label { background: var(--white); padding: 22px 22px 20px; box-shadow: 0 10px 24px -16px rgba(90, 40, 30, .35); border-top: 3px solid var(--rose); font-size: 13.5px; line-height: 1.5; }
  .label p { margin: 0; }
  .label .no { font-size: 10.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
  .label h2 { font-family: var(--serif); font-weight: 400; font-size: 28px; line-height: 1.1; margin: 8px 0 4px; }
  .label .meta { color: var(--muted); }
  .label .note { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--hair); color: var(--ink); }
  .label .award { display: none; margin-top: 14px; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--orange-text); }
  .label .award::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--orange); margin-right: 8px; vertical-align: 1px; }
  .label.has-award { border-top-color: var(--orange); }
  .label.has-award .award { display: block; }
  .controls { display: flex; gap: 10px; margin-top: 22px; align-items: center; }
  .controls[hidden] { display: none; }
  .controls button { width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--ink); background: transparent; color: var(--ink); font-size: 18px; cursor: pointer; font-family: var(--sans); transition: background .2s, color .2s; }
  .controls button:hover, .controls button:focus-visible { background: var(--ink); color: var(--white); }
  .dots { display: flex; gap: 7px; margin-left: 10px; }
  .dots :global(i) { width: 6px; height: 6px; border-radius: 50%; background: var(--hair); display: block; }
  .dots :global(i.on) { background: var(--rose); }
  @media (max-width: 900px) {
    .room { padding: 44px 16px 64px; }
    .room-head { margin-bottom: 28px; }
    .exhibit { grid-template-columns: minmax(0, 1fr); gap: 28px; }
    .frame { height: auto; }
    .frame img { max-height: 62vh; padding: 8px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .frame img, .controls button { transition: none; }
  }
</style>
```

- [ ] **Step 4: Rewrite `src/pages/index.astro`**

```astro
---
import FullBleed from '@layouts/FullBleed.astro';
import Exhibit from '@components/Exhibit.astro';
import exhibit from '../data/exhibit.json';
import { displayPath, listDrafts, missingDisplayFiles } from '../lib/exhibit.mjs';

const missing = missingDisplayFiles(exhibit, 'public');
if (missing.length) {
  throw new Error(`Missing homepage display images. Run \`npm run thumbnails\`. Missing: ${missing.join(', ')}`);
}
const drafts = listDrafts(exhibit);
if (drafts.length) {
  console.warn(`[exhibit] ${drafts.length} draft caption(s) for Zoe to edit in src/data/exhibit.json: ${drafts.join('; ')}`);
}
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
---

<FullBleed title="Zoe Wacker">
  <Exhibit items={exhibit.items} />

  <section class="intro">
    <div class="side">
      <span class="monogram" aria-hidden="true">ZW</span>
      <p><b>Zoe Wacker</b>Photographer, cellist, map enthusiast. Menlo Park, California.</p>
    </div>
    <div>
      <blockquote>“Hi! I’m Zoe, a middle schooler who’s always juggling a bunch of different interests. Right now, I’m into geography and travel, playing cello and music, and parkour with mixed-martial arts. I also love discovering new places, digging into history, and snapping photos that <em>tell little stories.</em>”</blockquote>
      <p class="sig">Welcome to my highlight reel</p>
    </div>
  </section>

  <section class="index" aria-label="Sections">
    <h2 class="eyebrow">The rooms</h2>
    <ul class="rows" role="list">
      {exhibit.sections.map((s, i) => (
        <li>
          <a href={s.href}>
            <span class="n">{roman[i]}</span>
            <span class="t">{s.title}</span>
            <span class="d">{s.desc}</span>
            <img class="th" src={displayPath(s.thumb, 'row')} alt="" loading="lazy" />
          </a>
        </li>
      ))}
    </ul>
  </section>
</FullBleed>

<style>
  .intro { max-width: 1240px; margin: 0 auto; padding: 96px 48px 40px; display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 56px; }
  .intro .side { display: flex; gap: 18px; align-items: flex-start; }
  .monogram {
    flex: none; width: 96px; height: 96px; border-radius: 50%;
    display: grid; place-items: center;
    background: var(--wall); border: 1px solid var(--hair);
    color: var(--rose-text); font-family: var(--serif); font-size: 34px; letter-spacing: .04em;
  }
  .intro .side p { margin: 0; font-size: 12.5px; color: var(--muted); line-height: 1.5; }
  .intro .side b { display: block; color: var(--ink); font-weight: 600; font-size: 14px; }
  .intro blockquote { border: 0; padding: 0; font-family: var(--serif); font-size: clamp(24px, 2.6vw, 34px); line-height: 1.3; max-width: 820px; }
  .intro .sig { margin: 18px 0 0; font-size: 12.5px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; color: var(--muted); }
  .index { max-width: 1240px; margin: 0 auto; padding: 40px 48px 110px; }
  .index .eyebrow { margin-bottom: 18px; }
  .rows { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--ink); }
  .rows a {
    display: grid; grid-template-columns: 56px minmax(0, 1.1fr) minmax(0, 1.6fr) 120px; gap: 20px; align-items: center;
    padding: 20px 4px; border-bottom: 1px solid var(--hair); color: var(--ink); text-decoration: none;
    transition: background .25s, padding .25s;
  }
  .rows a:visited { color: var(--ink); }
  .rows a:hover { background: var(--wall); padding-left: 14px; text-decoration: none; }
  .rows .n { font-family: var(--serif); font-size: 20px; color: var(--muted); }
  .rows .t { font-family: var(--serif); font-size: 32px; line-height: 1.1; }
  .rows .d { font-size: 14px; color: var(--muted); }
  .rows .th { justify-self: end; width: 100px; height: 64px; object-fit: cover; border-radius: 0; }
  @media (max-width: 900px) {
    .intro { grid-template-columns: minmax(0, 1fr); padding: 64px 16px 24px; gap: 28px; }
    .index { padding: 32px 16px 72px; }
    .rows a { grid-template-columns: 34px minmax(0, 1fr) 72px; gap: 12px; }
    .rows .d { grid-column: 2 / 3; grid-row: 2; font-size: 13px; margin-top: -10px; }
    .rows .th { grid-row: 1 / span 2; grid-column: 3; width: 72px; height: 56px; }
    .rows .t { font-size: 26px; }
  }
  @media (prefers-reduced-motion: reduce) { .rows a { transition: none; } }
</style>
```

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npm test`
Expected: the 5 tests in `home.test.mjs` PASS, and every earlier test passes. The build log shows one `[exhibit] … draft caption(s)` warning. That's expected until Zoe edits.

- [ ] **Step 6: Commit**

```bash
git add src/components/Exhibit.astro src/pages/index.astro tests/home.test.mjs
git commit -q -F - <<'EOF'
build exhibit homepage with wall labels and keyboard slideshow

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 7: Award exhibit component on all 8 award pages

**Files:**
- Create: `src/components/AwardExhibit.astro`, `tests/awards.test.mjs`
- Modify: these 8 files in `src/pages/photography/awards/`: `peninsula-photo-competition-2025.astro`, `npcfk-competition-color-2025.astro`, `npcfk-competition-home-2025.astro`, `npcfk-competition-life-in-red-2026.astro`, `npcfk-competition-shelter-2026.astro`, `no-frames-2026.astro`, `tpoy-competition-2025.astro`, `global-peace-photo-award-2026.astro`

**Interfaces:**
- Consumes: the `Page.astro` `hero` slot (Task 3) and the global figure style (Task 4).
- Produces: `AwardExhibit` props `{ image: string; alt: string; title: string; year: number|string; result: string; place?: string; contest?: string; division?: string; shown?: string }`, and the DOM `section.award-exhibit > .hung > img` + `aside.label > p.badge + h2 + p.by + dl`.

- [ ] **Step 1: Write the failing award tests**

Create `tests/awards.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist } from './helpers.mjs';

const AWARDS = {
  'peninsula-photo-competition-2025': ['cinderello.jpg', 'Honorable Mention'],
  'npcfk-competition-color-2025': ['npcfk-color-2025.png', 'Notable Entry'],
  'npcfk-competition-home-2025': ['npcfk-home-2025.jpg', 'Winner · Visionary Voyager'],
  'npcfk-competition-life-in-red-2026': ['npcfk-red-2026.jpg', 'Winner · Dream Snapper'],
  'npcfk-competition-shelter-2026': ['npcfk-shelter-2026.jpg', 'Notable Entry'],
  'no-frames-2026': ['no-frames-2026-colony-panorama.jpg', 'Honorable Mention'],
  'tpoy-competition-2025': ['tpoty2025-places-collection.png', 'Runner-Up'],
  'global-peace-photo-award-2026': ['gppa-2026-1.jpg', 'Shortlisted'],
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
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npm test`
Expected: 8 FAILs in `awards.test.mjs`, with `The input did not match /class="award-exhibit"/`.

- [ ] **Step 3: Create `src/components/AwardExhibit.astro`**

```astro
---
interface Props {
  image: string;
  alt: string;
  title: string;
  year: number | string;
  result: string;
  place?: string;
  contest?: string;
  division?: string;
  shown?: string;
}
const { image, alt, title, year, result, place, contest, division, shown } = Astro.props;
const rows = [['Place', place], ['Contest', contest], ['Division', division], ['Shown', shown]].filter(([, v]) => v);
---
<section class="award-exhibit" aria-label={title}>
  <div class="hung"><img src={image} alt={alt} /></div>
  <aside class="label">
    <p class="badge">{result}</p>
    <h2>{title}</h2>
    <p class="by">Zoe Wacker, {year}</p>
    {rows.length > 0 && (
      <dl>
        {rows.map(([k, v]) => (<><dt>{k}</dt><dd>{v}</dd></>))}
      </dl>
    )}
  </aside>
</section>

<style>
  .award-exhibit { width: var(--page-max); max-width: 100%; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 56px; align-items: end; }
  .hung img { display: block; width: 100%; height: auto; background: #fff; padding: 16px; border-radius: 0; box-shadow: var(--mat-shadow); }
  .label { background: var(--white); padding: 24px 24px 22px; border-top: 3px solid var(--orange); box-shadow: 0 10px 24px -16px rgba(90, 40, 30, .35); font-size: 13.5px; line-height: 1.5; }
  .label p { margin: 0; }
  .badge { display: inline-flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--orange-text); }
  .badge::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--orange); flex: none; }
  .label h2 { font-family: var(--serif); font-weight: 400; font-size: 36px; line-height: 1.05; margin: 12px 0 6px; overflow-wrap: anywhere; }
  .by { color: var(--muted); }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--hair); }
  dt { font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); padding-top: 2px; }
  dd { margin: 0; color: var(--ink); }
  @media (max-width: 900px) {
    .award-exhibit { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    .hung img { padding: 8px; }
    .label h2 { font-size: 30px; }
  }
</style>
```

- [ ] **Step 4: Remove each page's duplicate lead figure and insert the component**

Save this one-off script as `/tmp/award_hero.py`. Keep it outside the repo and don't commit it.

```python
import re, sys, pathlib
DIR = pathlib.Path('src/pages/photography/awards')
PAGES = {
  'peninsula-photo-competition-2025.astro': dict(lead='cinderello.jpg', tag='''<AwardExhibit slot="hero"
    image="/images/photography_awards/cinderello.jpg"
    alt="“Cinderello” — a caretaker sweeping patterned carpets inside the Mosque–Madrasa of Sultan Hasan, sunlight cutting across the vast stone interior."
    title="Cinderello" year={2025} result="Honorable Mention"
    place="Mosque–Madrasa of Sultan Ḥasan, Historic Cairo"
    contest="Six Fifty Peninsula Photo Contest 2025"
    division="Youth · “Moments”"
    shown="Palo Alto Art Center, Sept–Dec 2025" />'''),
  'npcfk-competition-color-2025.astro': dict(lead='npcfk-color-2025.png', tag='''<AwardExhibit slot="hero"
    image="/images/photography_awards/npcfk-color-2025.png"
    alt="My notable entry: a brightly painted Nubian village in Egypt"
    title="I Spy Something – Color" year={2025} result="Notable Entry"
    place="Nubian village, Egypt"
    contest="National Photography Competition for Kids, November 2025"
    division="Rising Photographers, ages 12–14" />'''),
  'npcfk-competition-home-2025.astro': dict(lead='npcfk-home-2025.jpg', tag='''<AwardExhibit slot="hero"
    image="/images/photography_awards/npcfk-home-2025.jpg"
    alt="A Nubian woman in a bright tie-dyed headscarf laughing as she plays a frame drum in front of an ochre wall."
    title="Home is Where the Heart Is" year={2025} result="Winner · Visionary Voyager"
    place="Nubian village, Egypt"
    contest="National Photography Competition for Kids, December 2025"
    division="Rising Photographers, ages 12–14" />'''),
  'npcfk-competition-life-in-red-2026.astro': dict(lead='npcfk-red-2026.jpg', tag='''<AwardExhibit slot="hero"
    image="/images/photography_awards/npcfk-red-2026.jpg"
    alt="A woman in a red dress with Day of the Dead calavera face paint, a crown of red roses and gold spikes, holding a red fan at night in the Mission District, San Francisco."
    title="Life in Red" year={2026} result="Winner · Dream Snapper"
    place="Mission District, San Francisco"
    contest="National Photography Competition for Kids, March 2026"
    division="Rising Photographers, ages 12–14" />'''),
  'npcfk-competition-shelter-2026.astro': dict(lead='npcfk-shelter-2026.jpg', tag='''<AwardExhibit slot="hero"
    image="/images/photography_awards/npcfk-shelter-2026.jpg"
    alt="Two king penguins standing side by side on golden grass, one flipper overlapping the other."
    title="The Shelter" year={2026} result="Notable Entry"
    place="Patagonia, Chile"
    contest="National Photography Competition for Kids, June 2026"
    division="Rising Photographers, ages 12–14" />'''),
  'no-frames-2026.astro': dict(lead='no-frames-2026-colony-panorama.jpg', tag='''<AwardExhibit slot="hero"
    image="/images/photography_awards/no-frames-2026-colony-panorama.jpg"
    alt="A colony of king penguins standing in a row among golden grass, with the sea behind them in Patagonia."
    title="ColonyPanorama" year={2026} result="Honorable Mention"
    place="Patagonia, Chile"
    contest="No Frames International Youth Photo Contest 2026"
    division="Nature · under 14" />'''),
  'tpoy-competition-2025.astro': dict(lead='tpoty2025-places-collection.png', tag='''<AwardExhibit slot="hero"
    image="/images/photography_awards/tpoty2025-places-collection.png"
    alt="Collection of 4 images of places."
    title="Places collection" year={2025} result="Runner-Up"
    place="Egypt"
    contest="Travel Photographer of the Year 2025"
    division="Young TPOTY · 14 & under"
    shown="Three international exhibitions, 2026" />'''),
  'global-peace-photo-award-2026.astro': dict(lead='gppa-2026-1.jpg', tag='''<AwardExhibit slot="hero"
    image="/images/photography_awards/gppa-2026-1.jpg"
    alt="A woman in Day of the Dead calavera face paint and a crown of red roses, holding a red fan at night in the Mission District, San Francisco."
    title="La Paz" year={2026} result="Shortlisted"
    place="Mission District, San Francisco"
    contest="Global Peace Photo Award 2026 · series “Faces of Peace”"
    division="Children’s Peace Image of the Year" />'''),
}
IMPORT = "import AwardExhibit from '@components/AwardExhibit.astro';\n"
for name, cfg in PAGES.items():
    p = DIR / name
    s = p.read_text()
    fig = re.compile(r'\n?[ \t]*<figure[^>]*>(?:(?!</figure>).)*?' + re.escape(cfg['lead']) + r'(?:(?!</figure>).)*?</figure>[ \t]*', re.S)
    s, n = fig.subn('', s, count=1)
    assert n == 1, f'{name}: lead figure not found'
    if IMPORT not in s:
        s = s.replace("import { photographyAwards } from '@links/registry';\n", "import { photographyAwards } from '@links/registry';\n" + IMPORT, 1)
    assert IMPORT in s, f'{name}: import not added'
    s, n = re.subn(r'(<LinkList slot="sidebar"[^>]*/>\n)', r'\1\n  ' + cfg['tag'].replace('\\', '\\\\') + '\n', s, count=1)
    assert n == 1, f'{name}: sidebar line not found'
    p.write_text(s)
    print('updated', name)
```

Run it from the repo root:

```bash
python3 /tmp/award_hero.py
```

Expected: 8 lines reading `updated <file>`. If any assertion fails, open that page, find the `<figure>` containing the lead image and the `<LinkList slot="sidebar" … />` line, and make the same two edits by hand.

- [ ] **Step 5: Run the tests and confirm they pass**

Run: `npm test`
Expected: the 8 tests in `awards.test.mjs` PASS, and every earlier test passes.

- [ ] **Step 6: Commit**

```bash
git add src/components/AwardExhibit.astro src/pages/photography/awards tests/awards.test.mjs
git commit -q -F - <<'EOF'
hang award photos with wall labels on all award pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 8: Site-wide verification, docs and branch push

**Files:**
- Create: `tests/sweep.test.mjs`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: everything above.
- Produces: the pushed `soft-blush-redesign` branch, plus screenshots in the session scratchpad for the parent's review.

- [ ] **Step 1: Write the sweep tests**

Create `tests/sweep.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resolveDist, serveDist, launch } from './helpers.mjs';

// Pre-existing broken links found on `main` before this redesign. List them here with a
// comment (rather than fixing them in this branch) and report them to the user.
const KNOWN_BROKEN = new Set([]);

function* htmlFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (p.endsWith('.html')) yield p;
  }
}

test('every internal link and image in dist/ resolves', () => {
  const broken = [];
  for (const file of htmlFiles('dist')) {
    const html = fs.readFileSync(file, 'utf8');
    for (const [, url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
      if (KNOWN_BROKEN.has(url)) continue;
      if (!fs.existsSync(resolveDist(url))) broken.push(`${path.relative('dist', file)} -> ${url}`);
    }
  }
  assert.deepEqual([...new Set(broken)], []);
});

const PAGES = ['/', '/about/', '/photography/awards/', '/photography/awards/peninsula-photo-competition-2025/',
  '/photography/awards/npcfk-competition-color-2025/', '/travel/trips/egypt-2025/', '/music/concerts/laufey-2025/',
  '/music/cello/', '/blog/'];

test('no sideways scroll at 390px on the key pages', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const wide = [];
  for (const route of PAGES) {
    await page.goto(srv.url + route, { waitUntil: 'domcontentloaded' });
    const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    if (sw > iw) wide.push(`${route}: ${sw}px`);
  }
  assert.deepEqual(wide, []);
});
```

- [ ] **Step 2: Run the full suite**

Run: `npm test`
Expected: all tests PASS.
- **Broken links:** if a broken link fails, check whether it also fails on `main` (`git stash; git checkout main; npm run build; …`). Only links that existed before this branch go into `KNOWN_BROKEN`, each with a comment, and they get reported to the user. Links this branch broke must be fixed.
- **Sideways scroll:** if a page scrolls sideways, find the overflowing element with `[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth)` in the test page, then fix its CSS (`max-width:100%`, `min-width:0` or `overflow-wrap:anywhere`).

- [ ] **Step 3: Take review screenshots**

```bash
S=/private/tmp/claude-501/-Users-jgwacker-zoewacker/6af8c54e-8443-4c96-92a7-05b4c5958a8d/scratchpad/redesign-shots; mkdir -p $S
npx astro preview --port 4329 >/dev/null 2>&1 & PREVIEW=$!; sleep 3
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for r in / /about/ /photography/awards/ /photography/awards/peninsula-photo-competition-2025/ /travel/trips/egypt-2025/ /music/concerts/laufey-2025/ /music/cello/ /blog/; do
  n=$(echo "$r" | tr '/' '_'); for w in 1440 390; do
    "$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=6000 --window-size=$w,1600 --screenshot="$S/$w$n.png" "http://localhost:4329$r" >/dev/null 2>&1
  done; done
kill $PREVIEW
ls $S
```

Expected: 16 PNGs. Open several with the Read tool and compare them against `design/themes/previews/3D-1a-index.jpg` and `3D-1a-award.jpg`, checking colors, fonts, the absence of italics, the blush title bands, the hung photos and the wall labels. Fix and re-run anything that clearly diverges.

- [ ] **Step 4: Document the new structure in `CLAUDE.md`**

Replace the `### Layouts` section with:

```markdown
### Layouts

- `Page.astro` - Standard layout: blush title band (section eyebrow + title), optional full-width `hero` slot, then sidebar + content (collapses on mobile)
- `FullBleed.astro` - Full-width layout without sidebar (used for homepage)
- `BlogPost.astro` - Blog post layout with date/metadata

### Theme (Soft Blush)

- Colors and fonts are CSS variables in `src/styles/global.css` (`--wall`, `--ink`, `--rose-text`, `--orange-text`, `--serif` = Fraunces, `--sans` = Manrope). No italics anywhere.
- Every `<figure>` image is automatically shown in a white mat with a wall-label `<figcaption>`. No per-page styling is needed.
- Award pages put `<AwardExhibit slot="hero" … />` (in `src/components/`) at the top.
- Homepage exhibit photos and section blurbs live in `src/data/exhibit.json`. After changing photos there, run `npm run thumbnails`. Entries with `"draft": true` are placeholder captions for Zoe to rewrite, and the build prints a warning until they're gone.
- `npm test` builds the site and runs the checks in `tests/`. They need Google Chrome installed.
```

- [ ] **Step 5: Commit and push the branch (not main)**

```bash
git add tests/sweep.test.mjs CLAUDE.md
git commit -q -F - <<'EOF'
add site-wide link and phone-width checks; document Soft Blush theme

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
git push -u origin soft-blush-redesign
```

- [ ] **Step 6: Hand off for review**

Start the dev server (`npm run dev`, in the background) and open `http://localhost:4321/` in Chrome. Tell the user:
- the branch name
- that the live site is unchanged
- which captions are drafts (from the build warning)
- any `KNOWN_BROKEN` links found

Do not merge to `main` until the parent approves and Zoe has edited `src/data/exhibit.json`.
