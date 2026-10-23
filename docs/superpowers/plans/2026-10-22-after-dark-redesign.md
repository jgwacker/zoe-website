# After Dark Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Soft Blush theme with the dark 5B "After Dark" lineup-poster theme across the whole site. The homepage becomes a poster generated from the link registry.

**Architecture:**
- Restyle the shared layer: design tokens in `global.css`, plus `Header`, `Footer`, `Page`, `LinkList` and `AwardExhibit`. Every page picks it up with no per-page edits.
- Rebuild `src/pages/index.astro` as the 5B poster. Its lists come from `src/links/registry.ts` (with new optional `note`/`image`/`featured` fields), via pure helpers in `src/lib/registry-meta.mjs`.

**Tech Stack:** Astro 5 (static), plain CSS custom properties, Google Fonts (Anton, DM Sans, DM Mono), sharp (resized images), `node:test` + `playwright-core` driving local Chrome. Node 22.19, which imports `.ts` files directly through built-in type stripping.

**Spec:** `docs/superpowers/specs/2026-10-22-after-dark-redesign-design.md`. The mockup is `design/themes/5B/index.html` and `award.html`.

## Global Constraints

- **Tokens:**
  - `--night #1E1424`, `--night-2 #2A1C33`, `--night-3 #362541`
  - `--cream #FBEFE3`, `--mist #C9B6C9`
  - `--coral #FF6F59`, `--rose #FF4F8B`, `--marigold #FFB13B`
  - `--line rgba(251,239,227,.14)`
  - `--display "Anton", Impact, sans-serif`
  - `--sans "DM Sans", system-ui, sans-serif`
  - `--mono "DM Mono", ui-monospace, monospace`
  - `--page-max 1240px`
- Dark on every page. Every text/background pair is ≥ 4.5:1 (WCAG AA).
- No italics anywhere: `em, i { font-style: normal; }`.
- No page content or URL changes. Existing pages are edited only to swap removed tokens.
- No school name, contact form or email in new elements. No photo of Zoe on the homepage; the ZW monogram replaces the mockup's portrait.
- Layouts work at 390px width with no horizontal page scroll.
- Printing gives dark text on white.
- Work on branch `after-dark-redesign`. Commit and push after each task (`git push`).
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  ```

## Review Focus

1. **Registry entries without `note` or `image`.** Amsterdam has no image, and concerts have no notes. These must render with no empty or broken `<img>` and no literal `undefined`/`null`. This is pinned in Task 4, `home.test.mjs` "no undefined/null and no empty img".
2. **Keyboard focus on a dark page.** The default focus rings disappear on aubergine, so a visible marigold `:focus-visible` outline is needed. Pinned in Task 1, `tokens.test.mjs` "focus ring and anchor offset".
3. **The sticky header hiding in-page anchor targets.** `[id]` needs a `scroll-margin-top`. Pinned in Task 1, in the same test.
4. **Long award labels in the homepage set list at 390px.** These must not cause sideways scroll. Pinned in Task 4 (the `/` 390px test) and Task 6 (the sweep).
5. **The phone menu staying usable over the sticky, blurred header.** It must open, close on Escape, and work without JS. Pinned in Task 2, `header.test.mjs` (kept, with updated logo markup).

---

### Task 1: Tokens, fonts and global styles

**Files:**
- Modify: `src/styles/global.css` (full rewrite)
- Modify: `src/components/BaseHead.astro:33-39` (font link)
- Test: `tests/tokens.test.mjs` (rewrite), `tests/leftovers.test.mjs` (figure test only)

**Interfaces:**
- Produces:
  - CSS variables from Global Constraints, plus:
    - `--glow-coral`, `--glow-rose`, `--glow-gold` (box-shadows)
    - `--neon` (text-shadow)
  - Global class `.eyebrow`, the mono kicker with a coral line. Kept by name because `Page.astro` and tests use it.
- Removed: `--white --wall --wall-deep --ink --muted --hair --orange --orange-text --rose-text --serif --mat-shadow`. Later tasks replace their uses.

- [ ] **Step 1: Write the failing tests.** Replace `tests/tokens.test.mjs` with:

```js
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
```

In `tests/leftovers.test.mjs`, replace the last test (`'global.css gives figures a white mat…'`) with:

```js
test('global.css gives figures rounded glowing photos and mono captions', () => {
  const css = fs.readFileSync('src/styles/global.css', 'utf8');
  assert.match(css, /figure > img,\s*figure > video\s*{[^}]*border-radius:\s*6px/);
  assert.match(css, /figure:nth-of-type\(3n\+1\) > img[^{]*{[^}]*var\(--glow-coral\)/);
  assert.match(css, /figure:nth-of-type\(3n\+2\) > img[^{]*{[^}]*var\(--glow-rose\)/);
  assert.match(css, /figure:nth-of-type\(3n\) > img[^{]*{[^}]*var\(--glow-gold\)/);
  assert.match(css, /figcaption\s*{[^}]*font-family:\s*var\(--mono\)/);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx astro build >/dev/null && node --test tests/tokens.test.mjs tests/leftovers.test.mjs`
Expected: FAIL. The token values are undefined and the font link still names Fraunces.

- [ ] **Step 3: Write `src/styles/global.css`**

```css
/* After Dark theme. See docs/superpowers/specs/2026-10-22-after-dark-redesign-design.md */
:root {
	--night: #1E1424;
	--night-2: #2A1C33;
	--night-3: #362541;
	--cream: #FBEFE3;
	--mist: #C9B6C9;
	--coral: #FF6F59;
	--rose: #FF4F8B;
	--marigold: #FFB13B;
	--line: rgba(251, 239, 227, .14);
	--display: "Anton", Impact, sans-serif;
	--sans: "DM Sans", system-ui, sans-serif;
	--mono: "DM Mono", ui-monospace, monospace;
	--page-max: 1240px;
	--glow-coral: 0 0 0 1px rgba(255, 111, 89, .35), 0 20px 60px -10px rgba(255, 111, 89, .55), 0 0 120px -20px rgba(255, 111, 89, .45);
	--glow-rose: 0 0 0 1px rgba(255, 79, 139, .35), 0 20px 60px -10px rgba(255, 79, 139, .55), 0 0 120px -20px rgba(255, 79, 139, .45);
	--glow-gold: 0 0 0 1px rgba(255, 177, 59, .35), 0 20px 60px -10px rgba(255, 177, 59, .5), 0 0 120px -20px rgba(255, 177, 59, .4);
	--neon: 0 0 28px rgba(255, 111, 89, .55), 0 0 80px rgba(255, 79, 139, .35);
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; background: #1E1424; }
body {
	margin: 0;
	padding: 0;
	background-color: var(--night);
	background-image:
		radial-gradient(900px 500px at 15% -5%, rgba(255, 79, 139, .20), transparent 60%),
		radial-gradient(800px 500px at 95% 10%, rgba(255, 111, 89, .16), transparent 60%),
		radial-gradient(900px 600px at 50% 110%, rgba(255, 177, 59, .10), transparent 60%);
	background-attachment: fixed;
	color: var(--cream);
	font-family: var(--sans);
	font-size: 18px;
	line-height: 1.7;
	text-align: left;
	-webkit-font-smoothing: antialiased;
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
	font-family: var(--display);
	font-weight: 400;
	text-transform: uppercase;
	letter-spacing: .01em;
	color: var(--cream);
	line-height: 1;
}
h1 { font-size: clamp(44px, 7vw, 104px); }
h2 { font-size: clamp(30px, 3.6vw, 44px); }
h3 { font-size: 26px; }
h4 { font-size: 20px; }
h5 { font-size: 18px; }
h2, h3, h4 { margin-top: 1.6em; }
strong, b { font-weight: 700; }
em, i { font-style: normal; }
h1 em, h2 em, h3 em { color: var(--marigold); }
blockquote em { color: var(--rose); }
a { color: var(--coral); text-decoration: none; }
a:hover { color: var(--coral); text-decoration: underline; text-underline-offset: 3px; }
a:visited { color: var(--coral); }
:focus-visible { outline: 2px solid var(--marigold); outline-offset: 3px; border-radius: 2px; }
[id] { scroll-margin-top: 80px; }
p { margin: 0 0 1em; }
.content p, .content li, .content blockquote { max-width: 68ch; }
.prose p { margin-bottom: 1.5em; }
textarea { width: 100%; font-size: 16px; }
input { font-size: 16px; }
table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--line); padding: 8px 6px; text-align: left; }
img { max-width: 100%; height: auto; border-radius: 2px; }
code { padding: 2px 5px; background-color: var(--night-3); border-radius: 3px; }
pre { padding: 1.5em; border-radius: 6px; background: var(--night-2); }
pre > code { all: unset; }
blockquote {
	border-left: 3px solid var(--rose);
	padding: 0 0 0 20px;
	margin: 0;
	font-size: 1.2em;
	line-height: 1.5;
}
hr { border: none; border-top: 1px solid var(--line); }
.eyebrow {
	margin: 0;
	display: flex;
	align-items: center;
	gap: 12px;
	font-family: var(--mono);
	font-size: 12px;
	font-weight: 500;
	letter-spacing: .16em;
	text-transform: uppercase;
	color: var(--coral);
}
.eyebrow::before {
	content: "";
	flex: none;
	width: 28px;
	height: 2px;
	background: var(--coral);
	box-shadow: 0 0 10px var(--coral);
}
@media (max-width: 560px) {
	body { font-size: 17px; }
	main { padding: 32px 0 24px; }
}

/* Every photo on the site glows, cycling coral, rose and marigold; captions are a mono line. */
figure { margin: 2.5rem 0; }
figure > img,
figure > video {
	display: block;
	margin: 0 auto;
	max-width: 100%;
	height: auto;
	border-radius: 6px;
}
figure:nth-of-type(3n+1) > img, figure:nth-of-type(3n+1) > video { box-shadow: var(--glow-coral); }
figure:nth-of-type(3n+2) > img, figure:nth-of-type(3n+2) > video { box-shadow: var(--glow-rose); }
figure:nth-of-type(3n) > img, figure:nth-of-type(3n) > video { box-shadow: var(--glow-gold); }
figcaption {
	max-width: 40rem;
	margin: 14px auto 0;
	font-family: var(--mono);
	font-size: 12px;
	letter-spacing: .12em;
	text-transform: uppercase;
	line-height: 1.6;
	color: var(--mist);
	text-align: left;
	font-style: normal;
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

@media (prefers-reduced-motion: reduce) {
	*, *::before, *::after { transition: none !important; }
}

@media print {
	html, body { background: #fff !important; background-image: none !important; color: #1E1424 !important; }
	*, *::before, *::after { box-shadow: none !important; text-shadow: none !important; }
	h1, h2, h3, h4, h5, h6, p, li, dd, dt, figcaption, blockquote, .eyebrow { color: #1E1424 !important; }
	a, a:visited { color: #3A1F3D !important; }
	header, footer, nav { display: none !important; }
}
```

- [ ] **Step 4: Swap the font link in `src/components/BaseHead.astro`**

Replace the comment and `<link rel="stylesheet" …Fraunces…>` block (lines 33–39) with:

```astro
<!-- Fonts: Anton (titles), DM Sans (body), DM Mono (labels). No italics. -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=DM+Mono:wght@400;500&display=swap"
/>
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx astro build >/dev/null && node --test tests/tokens.test.mjs tests/leftovers.test.mjs`
Expected: PASS, 9 tests (tokens 6, leftovers 3). The leftovers "no legacy theme colors" test still passes, because its banned list is only extended in Task 6.

- [ ] **Step 6: Run the full suite**

Run: `npm test > .superpowers/t1.log 2>&1; tail -15 .superpowers/t1.log`
Expected: all pass. Components still reference removed tokens such as `var(--wall)`. Those resolve to nothing, which is a visual gap only; Tasks 2–5 fix them.

- [ ] **Step 7: Commit and push**

```bash
git add src/styles/global.css src/components/BaseHead.astro tests/tokens.test.mjs tests/leftovers.test.mjs
git commit -m "After Dark tokens, fonts, glowing figures and print styles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 2: Header, footer, title band and sidebar set list

**Files:**
- Modify: `src/components/Header.astro` (markup line 8 and the `<style>` block)
- Modify: `src/components/Footer.astro` (full rewrite)
- Modify: `src/layouts/Page.astro` (title class and `<style>` block)
- Modify: `src/components/LinkList.astro` (`<style>` block)
- Test: `tests/header.test.mjs`, `tests/layout.test.mjs`

**Interfaces:**
- Consumes the tokens from Task 1 and the `.eyebrow` class.
- Produces:
  - `h1.post-title`, with the extra class `long-title` when `title.length > 40`
  - `.title-band`, `.hero-band`, `aside.sidebar`, `.layout.no-sidebar` (unchanged names)
  - Header `a.mark[aria-label="Zoe Wacker, home"]`

- [ ] **Step 1: Update the tests so they fail.** In `tests/header.test.mjs`, change the first assertion of the first test to:

```js
  assert.match(html, /<a[^>]*class="mark"[^>]*aria-label="Zoe Wacker, home"[^>]*>ZOE<span[^>]*aria-hidden="true"[^>]*>\.<\/span>W<\/a>/);
```

Rename the test to `'header markup: ZOE.W logo with coral period, 8 links, current section marked'`.

In `tests/layout.test.mjs`, replace the footer test and add three tests at the end:

```js
test('footer reads "Menlo Park, California · © <year>" under a decorative outlined name', () => {
  const html = readDist('/about/');
  assert.match(html, /<div[^>]*class="big"[^>]*aria-hidden="true"[^>]*>ZOE WACKER<\/div>/);
  assert.match(html, /Menlo Park, California · © \d{4}/);
});

const SHELTER = '/photography/awards/npcfk-competition-shelter-2026/';

test('titles over 40 characters get the long-title size', () => {
  assert.match(readDist(SHELTER), /<h1[^>]*class="post-title long-title"/);
  assert.match(readDist('/about/'), /<h1[^>]*class="post-title"(?! long-title)/);
});

test('long neon title fits its box at 390px', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + SHELTER, { waitUntil: 'domcontentloaded' });
  const { sw, cw } = await page.evaluate(() => {
    const h = document.querySelector('.post-title');
    return { sw: h.scrollWidth, cw: h.clientWidth };
  });
  assert.ok(sw <= cw, `title scrollWidth ${sw} > clientWidth ${cw}`);
});

test('printing a page gives a white background and dark text', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/travel/trips/egypt-2025/', { waitUntil: 'domcontentloaded' });
  await page.emulateMedia({ media: 'print' });
  const s = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    return { bg: b.backgroundColor, fg: getComputedStyle(document.querySelector('.content p')).color };
  });
  assert.equal(s.bg, 'rgb(255, 255, 255)');
  assert.equal(s.fg, 'rgb(30, 20, 36)');
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx astro build >/dev/null && node --test tests/header.test.mjs tests/layout.test.mjs`
Expected: FAIL on the logo regex, the footer `class="big"`, and `long-title`. The print test may already pass, since Task 1 added the print CSS; that's fine.

- [ ] **Step 3: Header.** In `src/components/Header.astro`, replace the logo line with:

```astro
		<a class="mark" href="/" aria-label="Zoe Wacker, home">ZOE<span aria-hidden="true">.</span>W</a>
```

Replace the whole `<style>` block with:

```astro
<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgba(30, 20, 36, .82);
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--line);
	}
	.bar {
		width: var(--page-max);
		max-width: calc(100% - 32px);
		margin: 0 auto;
		min-height: 64px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px 24px;
	}
	.mark { font-family: var(--display); font-size: 22px; letter-spacing: .04em; line-height: 1; color: var(--cream); text-decoration: none; }
	.mark:visited, .mark:hover { color: var(--cream); text-decoration: none; }
	.mark span { color: var(--coral); }
	nav ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 22px; }
	nav a { font-size: 14px; font-weight: 500; color: var(--mist); text-decoration: none; padding-bottom: 4px; transition: color .2s; }
	nav a:visited { color: var(--mist); }
	nav a:hover { color: var(--cream); text-decoration: none; }
	nav a[aria-current='page'] { color: var(--cream); box-shadow: inset 0 -2px 0 var(--coral); }
	.menu-toggle {
		display: none;
		font: 700 13px/1 var(--sans);
		letter-spacing: .12em;
		text-transform: uppercase;
		color: var(--cream);
		background: transparent;
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 10px 16px;
		cursor: pointer;
	}
	@media (max-width: 900px) {
		.bar { padding: 10px 0; }
		nav { flex-basis: 100%; }
		nav ul { flex-direction: column; gap: 0; }
		nav li a { display: block; padding: 8px 0; border-bottom: 1px solid var(--line); font-family: var(--display); font-size: 28px; font-weight: 400; text-transform: uppercase; color: var(--cream); }
		nav li a[aria-current='page'] { color: var(--coral); box-shadow: none; }
		.site-header.js .menu-toggle { display: inline-flex; }
		.site-header.js nav { display: none; }
		.site-header.js.open nav { display: block; padding-bottom: 16px; }
	}
</style>
```

- [ ] **Step 4: Footer.** Replace `src/components/Footer.astro` with:

```astro
---
const year = new Date().getFullYear();
---
<footer class="site-footer">
	<div class="foot">
		<div class="big" aria-hidden="true">ZOE WACKER</div>
		<p class="line">Menlo Park, California · © {year}</p>
	</div>
</footer>

<style>
	.site-footer { margin-top: 110px; border-top: 1px solid var(--line); padding: 40px 16px 60px; }
	.foot {
		width: var(--page-max);
		max-width: 100%;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 24px;
		flex-wrap: wrap;
	}
	.big {
		font-family: var(--display);
		font-size: clamp(44px, 7vw, 96px);
		line-height: .9;
		color: transparent;
		-webkit-text-stroke: 1px rgba(251, 239, 227, .35);
	}
	.line { margin: 0; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--mist); }
</style>
```

- [ ] **Step 5: Page title band.** In `src/layouts/Page.astro`:
  - Add `const longTitle = String(title).length > 40;` after the `hasSidebar` line.
  - Change the h1 to `<h1 class:list={['post-title', { 'long-title': longTitle }]}>{title}</h1>`.
  - Replace the `<style>` block with:

```astro
<style>
  .title-band { padding: 64px 16px 40px; border-bottom: 1px solid var(--line); }
  .band-inner { width: var(--page-max); max-width: 100%; margin: 0 auto; }
  .post-title {
    font-size: clamp(44px, 7vw, 104px);
    line-height: .92;
    margin: 16px 0 0;
    text-shadow: var(--neon);
    text-wrap: balance;
    overflow-wrap: anywhere;
  }
  .post-title.long-title { font-size: clamp(34px, 4.6vw, 64px); line-height: 1; }
  .hero-band { padding: 48px 16px 24px; }
  .layout { display: grid; grid-template-columns: minmax(200px, 260px) minmax(0, 1fr); gap: 56px; }
  .layout.no-sidebar { grid-template-columns: minmax(0, 1fr); }
  .sidebar { position: sticky; top: 88px; align-self: start; }
  .content { min-width: 0; }
  @media (max-width: 900px) {
    .title-band { padding: 40px 16px 28px; }
    .hero-band { padding: 32px 16px 8px; }
    .layout { grid-template-columns: minmax(0, 1fr); gap: 32px; }
    .sidebar { position: static; }
  }
</style>
```

Astro renders `class:list` as `class="post-title long-title"` in that order, which the test relies on.

- [ ] **Step 6: Sidebar set list.** In `src/components/LinkList.astro`, replace the `<style>` block with:

```astro
<style>
  .vlist { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
  .vlist a {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 12px;
    align-items: baseline;
    padding: 14px 4px;
    border-bottom: 1px solid var(--line);
    color: var(--cream);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
    text-decoration: none;
    transition: background .2s, padding .2s;
  }
  .vlist a:visited { color: var(--cream); }
  .vlist a:hover { background: linear-gradient(90deg, rgba(255, 79, 139, .10), transparent); padding-left: 10px; text-decoration: none; color: var(--cream); }
  .vlist .n { font-family: var(--display); font-weight: 400; font-size: 22px; line-height: 1; color: var(--rose); }
  .vlist a[aria-current='page'] { box-shadow: inset 3px 0 0 var(--coral); padding-left: 12px; }
  .vlist a[aria-current='page'] .t { color: var(--coral); }
  .grid {
    list-style: none;
    margin: .5rem 0 1.5rem;
    padding: 0;
    display: grid;
    gap: .75rem 1.25rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .grid a { color: var(--coral); text-decoration: none; font-weight: 700; }
  .grid a:hover { text-decoration: underline; text-underline-offset: 3px; }
  .desc { margin: .2rem 0 0; color: var(--mist); font-size: .95rem; }
</style>
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx astro build >/dev/null && node --test tests/header.test.mjs tests/layout.test.mjs tests/review-fixes.test.mjs`
Expected: PASS. This includes `review-fixes` "pages without a sidebar … align content with the title".

- [ ] **Step 8: Run the full suite, then commit and push**

Run: `npm test > .superpowers/t2.log 2>&1; tail -15 .superpowers/t2.log`
Expected: all pass.

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/Page.astro src/components/LinkList.astro tests/header.test.mjs tests/layout.test.mjs
git commit -m "After Dark header, outlined footer, neon title band and set-list sidebar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 3: Registry metadata and helpers

**Files:**
- Create: `src/lib/registry-meta.mjs`
- Modify: `src/links/registry.ts` (type plus `note`/`image`/`featured` on awards, the five newest trips, and cello)
- Test: `tests/registry-meta.test.mjs` (new)

**Interfaces:**
- Produces (`src/lib/registry-meta.mjs`):
  - `splitYear(label: string) → { name: string, year: number | null }`
  - `latest(items: LinkItem[], n: number) → LinkItem[]`
  - `featuredAward(items: LinkItem[]) → LinkItem | undefined`
  - `seasonLabel(date: Date) → string`, e.g. `"2026–27"`
- Produces (`src/links/registry.ts`):
  - `export type LinkItem = { href: string; label: string; note?: string; image?: string; featured?: boolean; desc?: string }`
  - The existing exports keep their names and order.

- [ ] **Step 1: Write the failing test.** Create `tests/registry-meta.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { splitYear, latest, featuredAward, seasonLabel } from '../src/lib/registry-meta.mjs';
import { photographyAwards, travelTrips, celloPerformances } from '../src/links/registry.ts';

test('splitYear takes the last 4-digit year out of a label', () => {
  assert.deepEqual(splitYear('Egypt 2025'), { name: 'Egypt', year: 2025 });
  assert.deepEqual(splitYear('Re:Set 2023'), { name: 'Re:Set', year: 2023 });
  assert.deepEqual(splitYear('The Shelter: National Photography Competition for Kids June 2026'),
    { name: 'The Shelter: National Photography Competition for Kids June', year: 2026 });
  assert.deepEqual(splitYear('Favorites'), { name: 'Favorites', year: null });
});

test('latest returns the first n entries (the registry is newest-first)', () => {
  assert.deepEqual(latest([{ label: 'a' }, { label: 'b' }, { label: 'c' }], 2).map((x) => x.label), ['a', 'b']);
  assert.equal(latest([{ label: 'a' }], 5).length, 1);
});

test('a new entry at the top of a list becomes the newest shown', () => {
  const fake = { href: '/travel/trips/tahoe-2027', label: 'Tahoe 2027' };
  assert.equal(latest([fake, ...travelTrips], 5)[0], fake);
});

test('featuredAward prefers the flagged entry, else the first', () => {
  assert.equal(featuredAward([{ label: 'a' }, { label: 'b', featured: true }]).label, 'b');
  assert.equal(featuredAward([{ label: 'a' }, { label: 'b' }]).label, 'a');
  assert.equal(featuredAward([]), undefined);
});

test('seasonLabel switches on August 1', () => {
  assert.equal(seasonLabel(new Date(2026, 6, 31)), '2025–26');
  assert.equal(seasonLabel(new Date(2026, 7, 1)), '2026–27');
});

test('registry: every award has a note, Peninsula is featured with an image, newest trips have stops', () => {
  for (const a of photographyAwards) assert.ok(a.note, `${a.label} has no note`);
  const f = featuredAward(photographyAwards);
  assert.equal(f.href, '/photography/awards/peninsula-photo-competition-2025');
  assert.ok(f.image);
  for (const t of latest(travelTrips, 5)) assert.ok(t.note, `${t.label} has no stops`);
  assert.ok(celloPerformances[0].note);
  for (const x of [...photographyAwards, ...travelTrips]) {
    if (x.image) assert.ok(fs.existsSync(path.join('public', x.image)), `missing ${x.image}`);
  }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/registry-meta.test.mjs`
Expected: FAIL with `Cannot find module '…/src/lib/registry-meta.mjs'`.

- [ ] **Step 3: Write `src/lib/registry-meta.mjs`**

```js
/** Helpers that read the link registry for the homepage poster. The registry lists are newest-first. */

/** "Egypt 2025" -> { name: "Egypt", year: 2025 }; uses the last 4-digit year; year is null when absent. */
export function splitYear(label) {
  const m = [...label.matchAll(/\b(?:19|20)\d{2}\b/g)].pop();
  if (!m) return { name: label.trim(), year: null };
  const name = (label.slice(0, m.index) + label.slice(m.index + 4)).replace(/\s{2,}/g, ' ').trim();
  return { name, year: Number(m[0]) };
}

/** The first `n` entries of a newest-first list. */
export const latest = (items, n) => items.slice(0, n);

/** The award flagged `featured: true`, or else the first award. */
export const featuredAward = (items) => items.find((i) => i.featured) ?? items[0];

/** School-year season for a date: "2026–27" from August 2026 through July 2027. */
export function seasonLabel(date) {
  const start = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}–${String(start + 1).slice(2)}`;
}
```

- [ ] **Step 4: Add metadata to `src/links/registry.ts`.** At the top of the file add:

```ts
export type LinkItem = { href: string; label: string; note?: string; image?: string; featured?: boolean; desc?: string };
```

Annotate `travelTrips`, `photographyAwards`, `celloPerformances` and `musicConcerts` as `: LinkItem[]`. Then replace the `travelTrips`, `photographyAwards` and `celloPerformances` arrays with the versions below. Labels, hrefs and order are unchanged.

```ts
export const travelTrips: LinkItem[] = [
  { href: '/travel/trips/amsterdam-2025',  label: 'Amsterdam 2025', note: 'Haarlem · Amsterdam · Anne Frank House' },
  { href: '/travel/trips/egypt-2025',      label: 'Egypt 2025', note: 'Cairo · Giza · Aswan · Kom Ombo · Nubia', image: '/images/trips/egypt_2025/nile_cruise_egypt_2025.jpg' },
  { href: '/travel/trips/chile-2025',      label: 'Chile 2025', note: 'Santiago · Torres del Paine · Tierra del Fuego · Valparaíso', image: '/images/trips/chile_2025/tierra_del_fuego_chile_2025.jpg' },
  { href: '/travel/trips/rome-2024',       label: 'Rome 2024', note: 'The Vatican · ancient Rome · Vesuvius', image: '/images/trips/rome_2024/colluseum_rome_2024.jpeg' },
  { href: '/travel/trips/london-2024',     label: 'London 2024', note: 'Tower of London · the Thames · London Eye', image: '/images/trips/london_2024/london_eye_london_2024.jpg' },
  { href: '/travel/trips/paris-2023',      label: 'Paris 2023', image: '/images/trips/paris_2023/champs_paris_2023.jpg' },
  { href: '/travel/trips/israel-2023',     label: 'Israel 2023' },
  { href: '/travel/trips/greece-2022',     label: 'Greece 2022' },
  { href: '/travel/trips/norway-2019',     label: 'Norway 2019' },
];
```

```ts
export const photographyAwards: LinkItem[] = [
  { href: '/photography/awards/global-peace-photo-award-2026', label: 'Global Peace Photo Award 2026', note: 'Shortlisted, Children’s Peace Image of the Year · “Faces of Peace”' },
  { href: '/photography/awards/npcfk-competition-shelter-2026', label: 'The Shelter: National Photography Competition for Kids June 2026', note: 'Notable Entry, Rising Photographers (ages 12–14)' },
  { href: '/photography/awards/no-frames-2026', label: 'No Frames International Youth Photo Contest 2026', note: 'Honorable Mention, Nature (under 14)' },
  { href: '/photography/awards/npcfk-competition-life-in-red-2026', label: 'Life in Red: National Photography Competition for Kids March 2026', note: 'Winner, Dream Snapper · Rising Photographers (ages 12–14)' },
  { href: '/photography/awards/npcfk-competition-home-2025', label: 'Home is Where the Heart Is: National Photography Competition for Kids December 2025', note: 'Winner, Visionary Voyager · Rising Photographers (ages 12–14)' },
  { href: '/photography/awards/tpoy-competition-2025', label: 'Travel Photographer of the Year Competition 2025', note: 'Runner-Up, Young TPOTY (14 & under) · Places collection' },
  { href: '/photography/awards/npcfk-competition-color-2025', label: 'I Spy Something-“Color” : National Photography Competition for Kids November 2025', note: 'Notable Entry, Rising Photographers (ages 12–14)' },
  { href: '/photography/awards/peninsula-photo-competition-2025', label: 'Peninsula Photo Competition 2025', note: 'Honorable Mention, Youth “Moments” · “Cinderello”', image: '/images/photography_awards/cinderello.jpg', featured: true },
];
```

```ts
export const celloPerformances: LinkItem[] = [
  { href: '/music/cello/disneyland-2026', label: 'Disneyland 2026', note: 'Played with my orchestra on Main Street, U.S.A., and recorded in a studio session. May 2026.' },
];
```

**Check the trip notes against the page text.** Read the first paragraphs of `src/pages/travel/trips/{amsterdam-2025,egypt-2025,chile-2025,rome-2024,london-2024}.astro`. If a place in a note isn't mentioned on its page, replace the note with places that are. Ledger any change as a Ruling.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/registry-meta.test.mjs`
Expected: PASS, 6 of 6. A Node `ExperimentalWarning` about type stripping is acceptable.

- [ ] **Step 6: Run the full suite, then commit and push**

Run: `npm test > .superpowers/t3.log 2>&1; tail -15 .superpowers/t3.log`
Expected: all pass. The sidebars ignore the new fields.

```bash
git add src/lib/registry-meta.mjs src/links/registry.ts tests/registry-meta.test.mjs
git commit -m "registry notes, images and featured award, with poster helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 4: Poster homepage

**Files:**
- Modify: `src/pages/index.astro` (full rewrite)
- Modify: `src/lib/exhibit.mjs` (full rewrite)
- Modify: `scripts/generate-display.mjs` (full rewrite)
- Modify: `src/data/exhibit.json` (delete the `"sections"` array and the comma before it)
- Delete: `src/components/Exhibit.astro`, and `public/images/display/row-*.jpg` (regenerated)
- Test: `tests/home.test.mjs` (rewrite), `tests/exhibit-data.test.mjs` (rewrite), `tests/review-fixes.test.mjs` (delete the first test)

**Interfaces:**
- Consumes:
  - `splitYear`, `latest`, `featuredAward` and `seasonLabel` from Task 3
  - `photographyAwards`, `travelTrips`, `musicConcerts` and `celloPerformances` from `@links/registry`
  - the tokens and `.eyebrow` from Task 1
- Produces (`src/lib/exhibit.mjs`):
  - `displayPath(image, kind='full'|'row') → string`, unchanged
  - `listDrafts(items, count=3) → string[]`
  - `missingDisplayFiles(paths: string[], publicDir) → string[]`
  - `homepageImages({ items, award, trips }) → Array<[src, 'full'|'row']>`

- [ ] **Step 1: Write the failing tests.** Replace `tests/home.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, serveDist, launch } from './helpers.mjs';
import { photographyAwards, travelTrips, musicConcerts, celloPerformances } from '../src/links/registry.ts';

const html = readDist('/');
const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const section = (cls) => html.match(new RegExp(`<(?:ol|div|ul)[^>]*class="${cls}"[^>]*>([\\s\\S]*?)</(?:ol|div|ul)>`))?.[1] ?? '';
const hrefs = (s) => [...s.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

test('poster: headliner, season line, tagline and billed sections', () => {
  assert.match(html, /<h1[^>]*class="headliner"[^>]*>ZOE WACKER<\/h1>/);
  assert.match(html, /presents<\/b> the \d{4}–\d{2} season/); // <b> carries Astro's scope attribute
  assert.ok(html.includes('“aha!” moments.'));
  for (const h of ['/photography', '/travel', '/music', '/geography', '/guardian-arts', '/academics', '/about', '/photography/awards', '/music/concerts']) {
    assert.match(html, new RegExp(`<a[^>]*href="${h}"`), `bill links ${h}`);
  }
});

test('glow strip shows the first three exhibit photos, resized', () => {
  for (const it of data.items.slice(0, 3)) assert.ok(html.includes(it.title), `missing ${it.title}`);
  assert.ok(!html.includes(data.items[3].title), 'only three photos');
});

test('set list links every registry award, with the featured card', () => {
  assert.deepEqual(hrefs(section('setlist')), photographyAwards.map((a) => a.href));
  assert.match(html, /<a[^>]*class="awardcard"[^>]*href="\/photography\/awards\/peninsula-photo-competition-2025"/);
  assert.ok(html.includes('Read the story →'));
});

test('tour dates show the five newest trips in order; concerts the six newest; the newest cello performance', () => {
  assert.deepEqual(hrefs(section('tour')), travelTrips.slice(0, 5).map((t) => t.href));
  assert.deepEqual(hrefs(section('gigs')), musicConcerts.slice(0, 6).map((c) => c.href));
  assert.match(html, new RegExp(`<a[^>]*class="cello"[^>]*href="${celloPerformances[0].href}"`));
});

test('meet the headliner: ZW monogram and no photo of Zoe', () => {
  assert.match(html, /class="monogram"[^>]*>ZW</);
  assert.ok(html.includes('Hi! I’m Zoe.'));
  for (const p of ['/images/home/about.jpg', '650_award_2025', 'zoe_']) assert.ok(!html.includes(p), `photo of Zoe: ${p}`);
});

test('homepage uses resized images only, with no undefined/null and no empty img', () => {
  const srcs = [...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(srcs.length >= 8);
  for (const s of srcs) assert.match(s, /^\/images\/display\//);
  assert.doesNotMatch(html, />\s*(undefined|null)\s*</);
});

test('homepage has no sideways scroll at 390px', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(srv.url + '/', { waitUntil: 'load' });
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  assert.ok(sw <= iw, `scrollWidth ${sw} > innerWidth ${iw}`);
});
```

Replace `tests/exhibit-data.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { displayPath, listDrafts, missingDisplayFiles, homepageImages } from '../src/lib/exhibit.mjs';
import { featuredAward, latest } from '../src/lib/registry-meta.mjs';
import { photographyAwards, travelTrips } from '../src/links/registry.ts';

const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));

test('at least three exhibit items, each complete; no section blurbs', () => {
  assert.ok(data.items.length >= 3);
  for (const it of data.items) {
    for (const k of ['image', 'alt', 'title', 'place']) assert.ok(it[k], `${it.title || it.image} missing ${k}`);
    assert.ok(fs.existsSync(path.join('public', it.image)), `original missing: ${it.image}`);
  }
  assert.equal(data.sections, undefined);
});

test('displayPath maps originals to resized jpgs', () => {
  assert.equal(displayPath('/images/portfolio/portfolio-64.jpg'), '/images/display/portfolio-64.jpg');
  assert.equal(displayPath('/images/photography_awards/x.png'), '/images/display/x.jpg');
  assert.equal(displayPath('/images/trips/rome_2024/colluseum_rome_2024.jpeg', 'row'), '/images/display/row-colluseum_rome_2024.jpg');
});

test('listDrafts names drafts among the first three photos only', () => {
  const items = [{ title: 'A', draft: true }, { title: 'B' }, { title: 'C', draft: true }, { title: 'D', draft: true }];
  assert.deepEqual(listDrafts(items), ['photo: A', 'photo: C']);
});

test('homepageImages: three strip photos and the featured award full-size, trip thumbnails row-size, skipping entries without images', () => {
  const imgs = homepageImages({
    items: [{ image: '/a.jpg' }, { image: '/b.jpg' }, { image: '/c.jpg' }, { image: '/d.jpg' }],
    award: { image: '/award.jpg' },
    trips: [{ image: '/t1.jpg' }, {}, { image: '/t2.jpg' }],
  });
  assert.deepEqual(imgs, [['/a.jpg', 'full'], ['/b.jpg', 'full'], ['/c.jpg', 'full'], ['/award.jpg', 'full'], ['/t1.jpg', 'row'], ['/t2.jpg', 'row']]);
});

test('missingDisplayFiles reports display paths that do not exist', () => {
  assert.deepEqual(missingDisplayFiles(['/images/display/missing-photo.jpg'], 'public'), ['/images/display/missing-photo.jpg']);
});

test('every homepage display image exists and is at most 1600px wide', async () => {
  const paths = homepageImages({ items: data.items, award: featuredAward(photographyAwards), trips: latest(travelTrips, 5) })
    .map(([src, kind]) => displayPath(src, kind));
  assert.deepEqual(missingDisplayFiles(paths, 'public'), []);
  for (const p of paths) {
    const { width } = await sharp(path.join('public', p)).metadata();
    assert.ok(width <= 1600, `${p} is ${width}px`);
  }
});
```

In `tests/review-fixes.test.mjs`, delete the whole first test, `'phone: exhibit Next button stays put while stepping through photos'`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx astro build >/dev/null && node --test tests/home.test.mjs tests/exhibit-data.test.mjs`
Expected: FAIL. There is no `class="headliner"`, `homepageImages` is not exported, and `data.sections` is still defined.

- [ ] **Step 3: Rewrite `src/lib/exhibit.mjs`**

```js
import fs from 'node:fs';
import path from 'node:path';

/** Resized copy of an original image, written by scripts/generate-display.mjs. */
export function displayPath(image, kind = 'full') {
  const name = path.posix.basename(image).replace(/\.[^.]+$/, '');
  return `/images/display/${kind === 'row' ? 'row-' : ''}${name}.jpg`;
}

/** Captions still marked "draft": true among the first `count` photos (the ones the homepage shows). */
export function listDrafts(items, count = 3) {
  return items.slice(0, count).filter((i) => i.draft).map((i) => `photo: ${i.title}`);
}

/** Display paths that are missing from publicDir. */
export function missingDisplayFiles(paths, publicDir) {
  return paths.filter((p) => !fs.existsSync(path.join(publicDir, p)));
}

/** Originals the homepage shows, with their display size: strip photos and the award card full-size, trip thumbnails row-size. */
export function homepageImages({ items, award, trips }) {
  return [
    ...items.slice(0, 3).map((i) => [i.image, 'full']),
    ...(award?.image ? [[award.image, 'full']] : []),
    ...trips.filter((t) => t.image).map((t) => [t.image, 'row']),
  ];
}
```

- [ ] **Step 4: Rewrite `scripts/generate-display.mjs`**

```js
#!/usr/bin/env node
// Writes resized copies of homepage images to public/images/display/: exhibit photos and the featured award (1600px),
// trip thumbnails (320px). Re-run via `npm run thumbnails` after editing src/data/exhibit.json or the registry.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { displayPath, homepageImages } from '../src/lib/exhibit.mjs';
import { featuredAward } from '../src/lib/registry-meta.mjs';
import { photographyAwards, travelTrips } from '../src/links/registry.ts';

const WIDTH = { full: 1600, row: 320 };
const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const jobs = [
  ...data.items.map((i) => [i.image, 'full']),
  ...homepageImages({ items: [], award: featuredAward(photographyAwards), trips: travelTrips }),
];
fs.mkdirSync('public/images/display', { recursive: true });

for (const [src, kind] of new Map(jobs.map((j) => [j.join('|'), j])).values()) {
  const input = path.join('public', src);
  const output = path.join('public', displayPath(src, kind));
  if (fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs) {
    console.log('skip ', output);
    continue;
  }
  await sharp(input).rotate().resize({ width: WIDTH[kind], withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(output);
  console.log('wrote', output);
}
```

- [ ] **Step 5: Remove the old exhibit data and component, then regenerate the images**

```bash
git rm -q src/components/Exhibit.astro
git rm -q public/images/display/row-*.jpg
node -e "const f='src/data/exhibit.json',fs=require('fs');const d=JSON.parse(fs.readFileSync(f));delete d.sections;fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n')"
node scripts/generate-display.mjs
```

Expected: the script prints `wrote public/images/display/row-nile_cruise_egypt_2025.jpg` and similar lines for the 5 trips with images, and `skip` for the existing full-size files.

- [ ] **Step 6: Rewrite `src/pages/index.astro`**

```astro
---
import FullBleed from '@layouts/FullBleed.astro';
import exhibit from '../data/exhibit.json';
import { photographyAwards, travelTrips, musicConcerts, celloPerformances } from '@links/registry';
import { displayPath, listDrafts, missingDisplayFiles, homepageImages } from '../lib/exhibit.mjs';
import { splitYear, latest, featuredAward, seasonLabel } from '../lib/registry-meta.mjs';

const photos = exhibit.items.slice(0, 3);
const award = featuredAward(photographyAwards);
const trips = latest(travelTrips, 5).map((t) => ({ ...t, ...splitYear(t.label) }));
const gigs = latest(musicConcerts, 6).map((c) => ({ ...c, ...splitYear(c.label) }));
const cello = celloPerformances[0];

const missing = missingDisplayFiles(
  homepageImages({ items: exhibit.items, award, trips }).map(([src, kind]) => displayPath(src, kind)), 'public');
if (missing.length) {
  throw new Error(`Missing homepage display images. Run \`npm run thumbnails\`. Missing: ${missing.join(', ')}`);
}
const drafts = listDrafts(exhibit.items);
if (drafts.length) {
  console.warn(`[exhibit] ${drafts.length} draft caption(s) for Zoe to edit in src/data/exhibit.json: ${drafts.join('; ')}`);
}

const num = (i) => String(i + 1).padStart(2, '0');
const BILL = [
  [['/photography', 'Photography'], ['/travel', 'Travel'], ['/music', 'Music']],
  [['/geography', 'Geography'], ['/guardian-arts', 'Guardian Arts'], ['/academics', 'Academics']],
  [['/about', 'About'], ['/photography/awards', 'Awards'], ['/music/concerts', 'Concerts']],
];
const GLOW = ['g-coral', 'g-rose', 'g-gold'];
const INTERESTS = ['Geography', 'Travel', 'Cello', 'Parkour', 'Mixed martial arts', 'History', 'Photos that tell little stories'];
---

<FullBleed title="Zoe Wacker">
  <div class="home">
    <section class="poster">
      <p class="presents">Menlo Park, CA <b>presents</b> the {seasonLabel(new Date())} season</p>
      <h1 class="headliner">ZOE WACKER</h1>
      <p class="tagline">A highlight reel of experiments, adventures and <em>“aha!” moments.</em></p>
      <nav class="bill" aria-label="Sections">
        {BILL.map((row, r) => (
          <div class={`row r${r + 1}`}>
            {row.map(([href, label], i) => (
              <>{i > 0 && <i class="dot" aria-hidden="true"></i>}<a href={href}>{label}</a></>
            ))}
          </div>
        ))}
        <p class="support">On location in {trips.map((t, i) => (<>{i > 0 && ' · '}<b>{t.name}</b></>))}</p>
      </nav>
    </section>

    <section class="glowstrip" aria-label="Featured photos">
      {photos.map((p, i) => (
        <figure class={`p${i + 1}`}>
          {p.href
            ? <a class={`glow ${GLOW[i]}`} href={p.href}><img src={displayPath(p.image)} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} /></a>
            : <div class={`glow ${GLOW[i]}`}><img src={displayPath(p.image)} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} /></div>}
          <figcaption><span>{p.title}</span><span>{p.place}</span></figcaption>
        </figure>
      ))}
    </section>

    <section class="block" id="awards">
      <div class="two">
        <div>
          <p class="eyebrow">The set list</p>
          <h2>Photo <em>awards</em></h2>
          {award && (
            <a class="awardcard" href={award.href}>
              {award.image && <span class="glow g-rose"><img src={displayPath(award.image)} alt="" loading="lazy" /></span>}
              <span class="cap">
                <b>{award.label}</b>
                {award.note && <span class="note">{award.note}</span>}
                <span class="btn">Read the story →</span>
              </span>
            </a>
          )}
        </div>
        <ol class="setlist" role="list">
          {photographyAwards.map((a, i) => (
            <li class:list={{ feat: a === award }}>
              <a href={a.href}>
                <span class="n">{num(i)}</span>
                <span class="t">{a.label}{a.note && <span class="d">{a.note}</span>}</span>
                <span class="y">{splitYear(a.label).year ?? ''}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section class="block" id="travel">
      <p class="eyebrow">World tour</p>
      <h2>Travel <em>dates</em></h2>
      <div class="tour">
        {trips.map((t) => (
          <a class="date" href={t.href}>
            <span class="yr">{t.year ?? ''}</span>
            <span class="place">{t.name}</span>
            <span class="stops">{t.note ?? ''}</span>
            <span class="thumb">{t.image && <img src={displayPath(t.image, 'row')} alt="" loading="lazy" />}</span>
          </a>
        ))}
      </div>
      <a class="more" href="/travel">All trips →</a>
    </section>

    <section class="block music" id="music">
      <div>
        <p class="eyebrow">Music</p>
        <blockquote class="pull">“Concerts are my favorite because you don’t just hear the music—<em>you feel it in your chest.</em>”</blockquote>
        <a class="more" href="/music">More about music →</a>
      </div>
      <div>
        <p class="label">From the crowd</p>
        <ul class="gigs" role="list">
          {gigs.map((g) => (<li><a href={g.href}><b>{g.name}</b><span>{g.year ?? ''}</span></a></li>))}
        </ul>
        {cello && (
          <a class="cello" href={cello.href}>
            <span class="label">On stage · Cello</span>
            <span class="c-t">{cello.label}</span>
            {cello.note && <span class="c-n">{cello.note}</span>}
          </a>
        )}
      </div>
    </section>

    <section class="block about" id="meet">
      <span class="monogram" aria-hidden="true">ZW</span>
      <div>
        <p class="eyebrow">Meet the headliner</p>
        <h2>Hi! I’m Zoe.</h2>
        <p class="voice">A middle schooler who’s always juggling a bunch of different interests. I started this site to keep track of the things I’m working on, the ideas I’m excited about, and the projects that don’t always fit neatly into a school folder.</p>
        <ul class="interests" role="list">{INTERESTS.map((s) => <li>{s}</li>)}</ul>
        <a class="more" href="/about">More about me →</a>
      </div>
    </section>
  </div>
</FullBleed>

<style>
  .home { width: var(--page-max); max-width: 100%; margin: 0 auto; padding: 0 32px 20px; }
  .poster { padding: 72px 0 40px; text-align: center; }
  .presents { margin: 0; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--marigold); }
  .presents b { color: var(--cream); font-weight: 500; }
  .headliner { font-size: clamp(64px, 15.5vw, 224px); line-height: .86; margin: 18px 0 8px; text-shadow: var(--neon); }
  .tagline { font-size: clamp(16px, 2vw, 20px); color: var(--mist); max-width: 640px; margin: 0 auto; }
  .tagline em { color: var(--coral); }
  .bill { margin: 52px auto 0; max-width: 1100px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 30px 0 34px; }
  .row { display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; column-gap: 22px; row-gap: 4px; font-family: var(--display); text-transform: uppercase; line-height: 1.05; }
  .row a { color: inherit; text-decoration: none; transition: color .2s, text-shadow .2s; }
  .row a:hover { color: var(--marigold); text-shadow: 0 0 22px rgba(255, 177, 59, .6); text-decoration: none; }
  .dot { width: 9px; height: 9px; transform: rotate(45deg); background: var(--rose); display: inline-block; align-self: center; box-shadow: 0 0 12px var(--rose); }
  .r1 { font-size: clamp(36px, 6.2vw, 84px); color: var(--coral); }
  .r2 { font-size: clamp(26px, 3.8vw, 50px); color: var(--cream); margin-top: 10px; }
  .r2 .dot { width: 7px; height: 7px; background: var(--marigold); box-shadow: 0 0 10px var(--marigold); }
  .r3 { font-size: clamp(20px, 2.3vw, 28px); color: var(--rose); margin-top: 14px; }
  .r3 .dot { width: 5px; height: 5px; }
  .support { margin: 20px 0 0; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--mist); }
  .support b { color: var(--cream); font-weight: 500; }

  .glowstrip { display: grid; grid-template-columns: 1.25fr .8fr 1fr; gap: 28px; align-items: end; padding: 70px 0 20px; }
  .glowstrip figure { margin: 0; }
  .glow { display: block; border-radius: 6px; overflow: hidden; }
  .glow img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
  .g-coral { box-shadow: var(--glow-coral); }
  .g-rose { box-shadow: var(--glow-rose); }
  .g-gold { box-shadow: var(--glow-gold); }
  .p1 .glow { aspect-ratio: 3 / 2; }
  .p2 .glow { aspect-ratio: 3 / 5; }
  .p3 .glow { aspect-ratio: 4 / 5; }
  .glowstrip figcaption { max-width: none; margin: 14px 0 0; display: flex; justify-content: space-between; gap: 12px; }
  .glowstrip figcaption span:first-child { color: var(--cream); }

  .block { padding-top: 96px; }
  .block h2 { margin-top: 0; font-size: clamp(40px, 5.4vw, 72px); line-height: .95; }
  .block .eyebrow { margin-bottom: 14px; }
  .two { display: grid; grid-template-columns: 5fr 7fr; gap: 64px; align-items: start; }
  .awardcard { display: block; margin-top: 36px; color: var(--cream); text-decoration: none; }
  .awardcard:hover, .awardcard:visited { color: var(--cream); text-decoration: none; }
  .awardcard .glow { aspect-ratio: 3 / 2; }
  .awardcard .cap { display: block; margin-top: 18px; }
  .awardcard b { display: block; font-family: var(--display); font-weight: 400; font-size: 30px; line-height: 1.05; text-transform: uppercase; }
  .awardcard .note { display: block; color: var(--mist); font-size: 15px; margin-top: 6px; }
  .btn { display: inline-flex; margin-top: 18px; padding: 12px 20px; border-radius: 999px; background: var(--coral); color: var(--night); font-weight: 700; font-size: 15px; box-shadow: 0 0 30px rgba(255, 111, 89, .45); transition: transform .2s, box-shadow .2s; }
  .awardcard:hover .btn { transform: translateY(-2px); box-shadow: 0 0 44px rgba(255, 111, 89, .7); }
  .setlist { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
  .setlist li { border-bottom: 1px solid var(--line); }
  .setlist a { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; gap: 16px; align-items: baseline; padding: 20px 4px; color: var(--cream); text-decoration: none; transition: background .2s; }
  .setlist a:visited { color: var(--cream); }
  .setlist a:hover { background: linear-gradient(90deg, rgba(255, 79, 139, .10), transparent); color: var(--cream); text-decoration: none; }
  .setlist .n { font-family: var(--display); font-size: 26px; line-height: 1; color: var(--rose); }
  .setlist .t { font-weight: 700; font-size: 18px; line-height: 1.3; }
  .setlist .d { display: block; font-weight: 400; font-size: 15px; color: var(--mist); margin-top: 3px; }
  .setlist .y { font-family: var(--mono); font-size: 13px; color: var(--marigold); }
  .setlist .feat .t { color: var(--coral); }

  .tour { margin-top: 36px; border-top: 2px solid var(--cream); }
  .date { display: grid; grid-template-columns: 110px minmax(0, 1.1fr) minmax(0, 2fr) 120px; gap: 24px; align-items: center; padding: 22px 0; border-bottom: 1px solid var(--line); color: var(--cream); text-decoration: none; }
  .date:hover, .date:visited { color: var(--cream); text-decoration: none; }
  .date .yr { font-family: var(--display); font-size: 30px; color: var(--marigold); }
  .date .place { font-family: var(--display); font-size: 34px; text-transform: uppercase; line-height: 1; }
  .date:hover .place { color: var(--coral); }
  .date .stops { color: var(--mist); }
  .date .thumb { width: 120px; height: 72px; border-radius: 4px; overflow: hidden; }
  .date .thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
  .more { display: inline-block; margin-top: 22px; font-weight: 700; }

  .music { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .pull { border: 0; padding: 0; font-family: var(--display); text-transform: uppercase; font-size: clamp(34px, 4.2vw, 58px); line-height: 1.02; max-width: none; }
  .pull em { color: var(--rose); text-shadow: 0 0 30px rgba(255, 79, 139, .6); }
  .label { display: block; margin: 0; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--mist); }
  .gigs { list-style: none; margin: 8px 0 0; padding: 0; columns: 2; column-gap: 32px; }
  .gigs li { break-inside: avoid; border-bottom: 1px solid var(--line); }
  .gigs a { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; color: var(--cream); text-decoration: none; }
  .gigs a:hover b { color: var(--coral); }
  .gigs span { color: var(--marigold); font-family: var(--mono); font-size: 13px; }
  .cello { display: block; margin-top: 28px; padding: 22px 24px; border: 1px solid rgba(255, 177, 59, .4); border-radius: 6px; background: rgba(255, 177, 59, .06); color: var(--cream); text-decoration: none; }
  .cello:hover, .cello:visited { color: var(--cream); text-decoration: none; }
  .cello .label { color: var(--marigold); }
  .cello .c-t { display: block; margin-top: 6px; font-weight: 700; }
  .cello .c-n { display: block; color: var(--mist); font-size: 15px; }

  .about { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 64px; align-items: center; }
  .monogram { width: 240px; height: 240px; border-radius: 50%; display: grid; place-items: center; background: var(--night-2); box-shadow: var(--glow-coral); font-family: var(--display); font-size: 96px; letter-spacing: .04em; color: var(--cream); }
  .voice { font-size: 21px; line-height: 1.55; margin: 22px 0 0; max-width: 640px; }
  .interests { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
  .interests li { padding: 7px 14px; border: 1px solid var(--line); border-radius: 999px; font-size: 14px; color: var(--mist); }

  @media (max-width: 900px) {
    .glowstrip { grid-template-columns: 1fr 1fr; gap: 18px; }
    .glowstrip .p1 { grid-column: 1 / -1; }
    .two, .music, .about { grid-template-columns: minmax(0, 1fr); gap: 40px; }
    .monogram { width: 160px; height: 160px; font-size: 64px; }
    .date { grid-template-columns: 70px minmax(0, 1fr); gap: 6px 16px; }
    .date .stops { grid-column: 2; }
    .date .thumb { display: none; }
  }
  @media (max-width: 560px) {
    .home { padding: 0 16px 20px; }
    .poster { padding-top: 48px; }
    .bill { margin-top: 36px; }
    .row { column-gap: 14px; }
    .glowstrip figcaption { flex-direction: column; gap: 2px; }
    .gigs { columns: 1; }
    .date .yr { font-size: 24px; }
    .date .place { font-size: 28px; }
    .setlist a { grid-template-columns: 34px minmax(0, 1fr); }
    .setlist .y { grid-column: 2; }
    .block { padding-top: 72px; }
  }
</style>
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx astro build > .superpowers/t4-build.log 2>&1; grep -i 'draft caption' .superpowers/t4-build.log; node --test tests/home.test.mjs tests/exhibit-data.test.mjs tests/review-fixes.test.mjs`
Expected: the build warns about draft captions for "Frame Drum" and "Día de los Muertos" (items 2–3; Cinderello is not a draft). Tests PASS.

- [ ] **Step 8: Run the full suite, then commit and push**

Run: `npm test > .superpowers/t4.log 2>&1; tail -15 .superpowers/t4.log`
Expected: all pass. This includes the sweep, so every homepage link and display image resolves.

```bash
git add -A src/pages/index.astro src/lib/exhibit.mjs scripts/generate-display.mjs src/data/exhibit.json src/components/Exhibit.astro public/images/display tests/home.test.mjs tests/exhibit-data.test.mjs tests/review-fixes.test.mjs
git commit -m "poster homepage generated from the registry; retire the slideshow

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 5: Award exhibit and remaining layouts

**Files:**
- Modify: `src/components/AwardExhibit.astro` (`<style>` block only)
- Modify: `src/layouts/BlogPost.astro:30,37,50` and `src/pages/blog/index.astro:60,65,69,72` (token swaps)
- Modify: `src/pages/photography/portfolio/index.astro:102-110` (slide image and nav colors)
- Modify: `src/pages/photography/awards/peninsula-photo-competition-2025.astro:60` (`var(--muted)` → `var(--mist)`)
- Test: `tests/review-fixes.test.mjs` (portfolio test), `tests/awards.test.mjs` (add one style test)

**Interfaces:**
- Consumes the tokens and glows from Task 1, and `.hero-band` from Task 2.
- Produces: the `AwardExhibit` props are unchanged. Markup classes are unchanged (`award-exhibit`, `hung`, `label`, `badge`, `by`).

- [ ] **Step 1: Update the tests so they fail.** In `tests/review-fixes.test.mjs`, rename the portfolio test to `'portfolio slideshow photo glows with rounded corners like every other photo'`. Replace its evaluate/asserts with:

```js
  const s = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.slide-img'));
    return { radius: cs.borderTopLeftRadius, shadow: cs.boxShadow, bg: cs.backgroundColor };
  });
  assert.equal(s.radius, '6px');
  assert.notEqual(s.shadow, 'none');
  assert.notEqual(s.bg, 'rgb(255, 255, 255)');
```

Append this to `tests/awards.test.mjs`:

```js
import { serveDist, launch } from './helpers.mjs';

test('award label card is dark with a marigold result', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(srv.url + '/photography/awards/peninsula-photo-competition-2025/', { waitUntil: 'domcontentloaded' });
  const s = await page.evaluate(() => ({
    card: getComputedStyle(document.querySelector('.award-exhibit .label')).backgroundColor,
    badge: getComputedStyle(document.querySelector('.award-exhibit .badge')).color,
  }));
  assert.equal(s.card, 'rgb(42, 28, 51)');
  assert.equal(s.badge, 'rgb(255, 177, 59)');
});
```

Merge the import into the existing `import { readDist } from './helpers.mjs';` line, so it reads `import { readDist, serveDist, launch } from './helpers.mjs';`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx astro build >/dev/null && node --test tests/awards.test.mjs tests/review-fixes.test.mjs`
Expected: FAIL. The portfolio radius is `0px`, and the card background is not `rgb(42, 28, 51)`.

- [ ] **Step 3: AwardExhibit styles.** Replace the `<style>` block in `src/components/AwardExhibit.astro` with:

```astro
<style>
  .award-exhibit { width: var(--page-max); max-width: 100%; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 56px; align-items: center; }
  .hung img { display: block; width: 100%; height: auto; border-radius: 6px; box-shadow: var(--glow-rose); }
  .label { background: var(--night-2); border: 1px solid var(--line); border-radius: 8px; padding: 24px; font-size: 15px; line-height: 1.5; }
  .label p { margin: 0; }
  .badge { display: inline-flex; align-items: center; gap: 10px; font-family: var(--mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--marigold); }
  .badge::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: var(--marigold); box-shadow: 0 0 12px var(--marigold); flex: none; }
  .label h2 { font-size: 36px; line-height: 1; margin: 14px 0 6px; overflow-wrap: anywhere; }
  .by { color: var(--mist); }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--line); }
  dt { font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--mist); padding-top: 3px; }
  dd { margin: 0; color: var(--cream); }
  @media (max-width: 900px) {
    .award-exhibit { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    .label h2 { font-size: 30px; }
  }
</style>
```

- [ ] **Step 4: Token swaps in the other files**
  - `src/layouts/BlogPost.astro`: `var(--mat-shadow)` → `var(--glow-rose)`, `var(--ink)` → `var(--cream)`, `var(--muted)` → `var(--mist)`.
  - `src/pages/blog/index.astro`: `var(--ink)` → `var(--cream)`, `var(--muted)` → `var(--mist)`, `var(--rose-text)` → `var(--coral)`, `var(--mat-shadow)` → `var(--glow-rose)`.
  - `src/pages/photography/awards/peninsula-photo-competition-2025.astro:60`: `var(--muted)` → `var(--mist)`.
  - `src/pages/photography/portfolio/index.astro`: replace the `.slide img, .slide .placeholder { … }`, `.placeholder { … }` and `.nav { … }` rules (lines ~102–110) with:

```css
    .slide img, .slide .placeholder {
      width: 100%; max-height: 480px; object-fit: cover; border-radius: 6px;
      background: var(--night-2); box-shadow: var(--glow-coral); cursor: zoom-in;
    }
    .placeholder { display: grid; place-items: center; color: var(--mist); font-size: 0.9rem; }
    .nav {
      background: none; border: none; font-size: 2rem; cursor: pointer; color: var(--cream);
      padding: 0 0.5rem; line-height: 1; user-select: none;
    }
```

Run these with `sed -i ''` per file, or edit by hand. Afterwards, `grep -rnE 'var\(--(white|wall|wall-deep|ink|muted|hair|orange|orange-text|rose-text|serif|mat-shadow)\)' src` must print nothing.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx astro build >/dev/null && node --test tests/awards.test.mjs tests/review-fixes.test.mjs`
Expected: PASS, 8 award-page tests plus the style test plus 2 review-fixes tests.

- [ ] **Step 6: Run the full suite, then commit and push**

Run: `npm test > .superpowers/t5.log 2>&1; tail -15 .superpowers/t5.log`
Expected: all pass.

```bash
git add src/components/AwardExhibit.astro src/layouts/BlogPost.astro src/pages/blog/index.astro src/pages/photography/portfolio/index.astro src/pages/photography/awards/peninsula-photo-competition-2025.astro tests/awards.test.mjs tests/review-fixes.test.mjs
git commit -m "dark award label card, glowing portfolio and blog images

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

---

### Task 6: Leftover sweep, phone-width sweep and docs

**Files:**
- Modify: `tests/leftovers.test.mjs` (`BANNED` list plus one test)
- Modify: `tests/sweep.test.mjs` (`PAGES`)
- Modify: `CLAUDE.md` (the "Theme (Soft Blush)" section and the `Page.astro` layout line)
- Modify: `design/themes/README.md` (one note)

**Interfaces:**
- Consumes everything above. Produces no code interfaces.

- [ ] **Step 1: Extend the tests so they fail if anything is left.** In `tests/leftovers.test.mjs`, append these to `BANNED`:

```js
  /Fraunces/, /Manrope/, /#F8EBE7/i, /\/Exhibit\.astro/,
  /var\(--(white|wall|wall-deep|ink|muted|hair|orange|orange-text|rose-text|serif|mat-shadow)\)/,
```

Add this test:

```js
test('the Soft Blush slideshow component is gone', () => {
  assert.equal(fs.existsSync('src/components/Exhibit.astro'), false);
});
```

In `tests/sweep.test.mjs`, add these to `PAGES`: `'/photography/awards/npcfk-competition-shelter-2026/'`, `'/academics/summer-programs/johns-hopkins-cty-2026/'`, `'/photography/portfolio/'`.

- [ ] **Step 2: Run them**

Run: `npx astro build >/dev/null && node --test tests/leftovers.test.mjs tests/sweep.test.mjs`
Expected: PASS if Tasks 1–5 are complete. If a hit is reported, fix that file's token (mapping: `ink→cream`, `muted→mist`, `rose-text→coral`, `orange*→marigold`, `wall*→night-2`, `hair→line`, `serif→display`, `mat-shadow→glow-rose`) and re-run. If the sweep reports a page wider than 390px, fix the overflowing element (`min-width: 0` or `overflow-wrap: anywhere`) and re-run.

- [ ] **Step 3: Docs.** In `CLAUDE.md`, replace the `Page.astro` layout bullet with:

```
- `Page.astro` - Standard layout: dark poster title band (section kicker + neon title), optional full-width `hero` slot, then sidebar set list + content (collapses on mobile)
```

Then replace the whole `### Theme (Soft Blush)` section with:

```
### Theme (After Dark)

- Dark "lineup poster" look from mockup `design/themes/5B`. Colors and fonts are CSS variables in `src/styles/global.css` (`--night`, `--cream`, `--mist`, `--coral`, `--rose`, `--marigold`, `--display` = Anton, `--sans` = DM Sans, `--mono` = DM Mono). No italics anywhere. Printing switches to dark text on white.
- Every `<figure>` image automatically gets rounded corners and a coral/rose/marigold glow, with a mono `<figcaption>`. No per-page styling is needed.
- Award pages put `<AwardExhibit slot="hero" … />` (in `src/components/`) at the top.
- The homepage poster is generated from `src/links/registry.ts`: awards (with `note`, and one `featured: true` with an `image`), the five newest trips (`note` = stops, `image` = thumbnail), the six newest concerts and the newest cello performance. Add new entries at the top of each list. After adding an `image`, run `npm run thumbnails`.
- The three glow-strip photos are the first three items in `src/data/exhibit.json`. Entries with `"draft": true` are placeholder captions for Zoe to rewrite, and the build prints a warning until they're gone.
- `npm test` builds the site and runs the checks in `tests/`. They need Google Chrome installed.
```

In the `### Design Themes` section, change "seven candidate site redesigns" to "candidate site redesigns". Append: "5B (After Dark) is the live theme; 3D-1a (Soft Blush) was live before it."

In `design/themes/README.md`, add this line directly under the first paragraph:

```
**Live theme:** 5B · After Dark (since October 22, 2026). Soft Blush (3D-1a) was live October 18–22, 2026.
```

- [ ] **Step 4: Run the full suite**

Run: `npm test > .superpowers/t6.log 2>&1; tail -15 .superpowers/t6.log`
Expected: all pass, 0 failures.

- [ ] **Step 5: Commit and push**

```bash
git add tests/leftovers.test.mjs tests/sweep.test.mjs CLAUDE.md design/themes/README.md
git commit -m "ban Soft Blush leftovers, widen phone sweep, document After Dark

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push
```

- [ ] **Step 6: Visual review for the parent**

Restart the dev server if it's running, then open these pages in Safari for the parent to review on desktop and at phone width:
- the homepage
- the Peninsula award page
- Egypt 2025
- CTY 2026

```bash
open -a Safari http://localhost:4321/
```
