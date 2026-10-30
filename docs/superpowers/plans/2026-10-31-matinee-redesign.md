# Matinee Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the After Dark theme with the 7B-5 "Matinee" theme across Zoe's Astro site.

**Architecture:** All colours, fonts and halos live as tokens in `src/styles/global.css`; shared chrome (header, title band, sidebar, footer, award hero) is restyled per component; the homepage is rebuilt from the mockup but still generated from `src/links/registry.ts`, `src/lib/registry-meta.mjs` and `src/data/exhibit.json`. A tiny inline script in `BaseHead.astro` adds soft reveals that degrade to fully visible without JavaScript.

**Tech Stack:** Astro, plain CSS, Google Fonts (Sacramento, Fraunces with SOFT/WONK axes, DM Sans, DM Mono), `node:test` + playwright-core with local Chrome (`npm test` = build + tests).

**Spec:** `docs/superpowers/specs/2026-10-31-matinee-redesign-design.md`. Reference mockup: `design/themes/7B-5/index.html` and `award.html`.

## Global Constraints

- Tokens (exact): `--cream #FBF3EA`, `--blush #F8EBE7`, `--paper #FFFBF6`, `--ink #2A1E1E`, `--muted #6F675F`, `--deep-rose #87314D`, `--orange #D2652C`, `--rose #C25E77`, `--gold #A87A1C`, `--orange-text #9C4A1C`, `--rose-text #A84862`, `--gold-text #8E6210`, `--hair rgba(42,30,30,.14)`, `--page-max 1240px`.
- `--orange`, `--rose`, `--gold` are only for text ≥24px or decoration; small text uses the `-text` variants.
- Halo RGB triplets: orange `226,115,58`, rose `194,94,119`, gold `201,138,30`.
- Fonts: Sacramento (script, with `-webkit-text-stroke: .011em currentColor; paint-order: stroke fill`), Fraunces `"opsz" 144, "SOFT" 100, "WONK" 1`, DM Sans, DM Mono. No Anton. No italics anywhere (`em, i { font-style: normal }`).
- No page content or URL changes. No photo of Zoe on the homepage (`/images/home/about.jpg`, `650_award_2025`, `zoe_`).
- Every motion effect is off under `prefers-reduced-motion`; everything is visible without JavaScript.
- No horizontal scroll at 360px and 390px. "Zoe Wacker." and homepage section `h2`s stay on one line at every width.
- Print: white background, `#2A1E1E` text.
- Work on branch `matinee-redesign`; commit after each task. Do not push to `main` (each `main` deploy costs 15 Netlify credits).

## Review Focus

1. **Small coloured text failing contrast** (e.g. a leftover `color: var(--orange)` on 15px text): the existing site-wide contrast probe in `tests/review-fixes.test.mjs` must pass on the homepage, an award page and About (Task 7 runs it on all three).
2. **Long or unusual page titles in script** (the Shelter award, CTY): `long-title` must switch to the serif and fit at 360px (Task 2 test).
3. **Stub data gaps** (no concert, an award without a note): `recentStubs` must skip missing entries without printing "undefined" (Task 5 test; Task 6 checks for `undefined`/`null` text).
4. **JavaScript off or blocked**: `.reveal` content must be visible (Task 7 test).
5. **Dark-theme leftovers in rarely visited pages** (portfolio lightbox, masonry awards, series index, blog): the leftovers test bans After Dark tokens in all of `src/` (Task 1) and Task 4 restyles each file.

---

### Task 0: Branch

- [ ] **Step 1:** `git checkout -b matinee-redesign` from an up-to-date `main` (`git pull` first). Leave the untracked `public/images/display/portfolio-77.jpg` alone.

---

### Task 1: Tokens, fonts, reveal script

**Files:**
- Modify: `src/styles/global.css` (full rewrite)
- Modify: `src/components/BaseHead.astro` (font link, reveal script)
- Test: `tests/tokens.test.mjs` (rewrite), `tests/leftovers.test.mjs` (update)

**Interfaces:**
- Produces: CSS custom properties listed in Global Constraints, plus `--script`, `--serif`, `--sans`, `--mono`, `--soft` (Fraunces axis settings), `--halo-orange|rose|gold` and `--halo-orange|rose|gold-hover` (box-shadow values), `--h-orange|rose|gold` (RGB triplets). Global classes: `.eyebrow`, `.script`, `.reveal` (+ `.in`), `.sr-only`. `<html>` gets class `js` when scripts run.

- [ ] **Step 1: Write the failing tests.** Replace `tests/tokens.test.mjs` with:

```js
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
```

In `tests/leftovers.test.mjs`, replace the `BANNED` array and the figure test:

```js
const BANNED = [
  /#2337ff/i, /var\(--accent\b/, /--gray/, /gray-gradient/, /Atkinson/, /var\(--box-shadow\)/,
  /var\(--black\)/, /--theme-text-light/, /--color-text-dim/, /--theme-bg-offset/,
  /Manrope/, /\/Exhibit\.astro/, /Anton/,
  /var\(--(night|night-2|night-3|mist|coral|marigold|line|display|neon|glow-coral|glow-rose|glow-gold)\)/,
  /#1E1424/i, /#FF6F59/i, /#FF4F8B/i, /#FFB13B/i, /rgba\(30,\s*20,\s*36/, /rgba\(251,\s*239,\s*227/,
  /rgba\(255,\s*(111|79|177),/,
];
```

```js
test('global.css gives figures rounded photos with cycling halos and mono captions', () => {
  const css = fs.readFileSync('src/styles/global.css', 'utf8');
  assert.match(css, /figure > img,\s*figure > video\s*{[^}]*border-radius:\s*8px/);
  assert.match(css, /figure:nth-of-type\(3n\+1\) > img[^{]*{[^}]*var\(--halo-orange\)/);
  assert.match(css, /figure:nth-of-type\(3n\+2\) > img[^{]*{[^}]*var\(--halo-rose\)/);
  assert.match(css, /figure:nth-of-type\(3n\) > img[^{]*{[^}]*var\(--halo-gold\)/);
  assert.match(css, /figure:nth-of-type\(3n\+1\):hover > img[^{]*{[^}]*var\(--halo-orange-hover\)/);
  assert.match(css, /figcaption\s*{[^}]*font-family:\s*var\(--mono\)/);
});
```

- [ ] **Step 2: Run them to see them fail.** `npm run build && node --test tests/tokens.test.mjs tests/leftovers.test.mjs`. Expected: FAIL (old token values; leftovers find `var(--night)` etc. across `src/`). The leftovers test will keep failing until Task 4 finishes; that is expected.

- [ ] **Step 3: Rewrite `src/styles/global.css`:**

```css
/* Matinee theme. See docs/superpowers/specs/2026-10-31-matinee-redesign-design.md */
:root {
	--cream: #FBF3EA;
	--blush: #F8EBE7;
	--paper: #FFFBF6;
	--ink: #2A1E1E;
	--muted: #6F675F;
	--deep-rose: #87314D;
	--orange: #D2652C;
	--rose: #C25E77;
	--gold: #A87A1C;
	--orange-text: #9C4A1C;
	--rose-text: #A84862;
	--gold-text: #8E6210;
	--hair: rgba(42, 30, 30, .14);
	--script: "Sacramento", cursive;
	--serif: "Fraunces", Georgia, serif;
	--soft: "opsz" 144, "SOFT" 100, "WONK" 1;
	--sans: "DM Sans", system-ui, sans-serif;
	--mono: "DM Mono", ui-monospace, monospace;
	--page-max: 1240px;
	--h-orange: 226, 115, 58;
	--h-rose: 194, 94, 119;
	--h-gold: 201, 138, 30;
	--halo-orange: 0 0 0 1px rgba(226, 115, 58, .16), 0 18px 46px -16px rgba(226, 115, 58, .40), 0 0 80px -24px rgba(226, 115, 58, .34);
	--halo-rose: 0 0 0 1px rgba(194, 94, 119, .16), 0 18px 46px -16px rgba(194, 94, 119, .40), 0 0 80px -24px rgba(194, 94, 119, .34);
	--halo-gold: 0 0 0 1px rgba(201, 138, 30, .16), 0 18px 46px -16px rgba(201, 138, 30, .40), 0 0 80px -24px rgba(201, 138, 30, .34);
	--halo-orange-hover: 0 0 0 1px rgba(226, 115, 58, .30), 0 24px 60px -12px rgba(226, 115, 58, .58), 0 0 120px -18px rgba(226, 115, 58, .48);
	--halo-rose-hover: 0 0 0 1px rgba(194, 94, 119, .30), 0 24px 60px -12px rgba(194, 94, 119, .58), 0 0 120px -18px rgba(194, 94, 119, .48);
	--halo-gold-hover: 0 0 0 1px rgba(201, 138, 30, .30), 0 24px 60px -12px rgba(201, 138, 30, .58), 0 0 120px -18px rgba(201, 138, 30, .48);
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; background: #FBF3EA; }
body {
	margin: 0;
	padding: 0;
	background-color: var(--cream);
	background-image:
		radial-gradient(1000px 520px at 12% -8%, rgba(194, 94, 119, .10), transparent 62%),
		radial-gradient(900px 520px at 92% 4%, rgba(226, 115, 58, .10), transparent 62%);
	background-attachment: fixed;
	color: var(--ink);
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
	font-family: var(--serif);
	font-variation-settings: var(--soft);
	font-weight: 500;
	letter-spacing: -.01em;
	color: var(--ink);
	line-height: 1.1;
}
h1 { font-size: clamp(40px, 6vw, 72px); }
h2 { font-size: clamp(28px, 3.2vw, 40px); }
h3 { font-size: 26px; }
h4 { font-size: 21px; }
h5 { font-size: 18px; }
h2, h3, h4 { margin-top: 1.6em; }
.script {
	font-family: var(--script);
	font-variation-settings: normal;
	font-weight: 400;
	letter-spacing: 0;
	color: var(--deep-rose);
	-webkit-text-stroke: .011em currentColor;
	paint-order: stroke fill;
}
strong, b { font-weight: 700; }
em, i { font-style: normal; }
h1 em, h2 em, h3 em { color: var(--orange-text); }
blockquote em { color: var(--rose-text); }
a { color: var(--orange-text); text-decoration: none; }
a:hover { color: var(--orange-text); text-decoration: underline; text-underline-offset: 3px; }
a:visited { color: var(--orange-text); }
:focus-visible { outline: 2px solid var(--deep-rose); outline-offset: 3px; border-radius: 2px; }
[id] { scroll-margin-top: 80px; }
p { margin: 0 0 1em; }
.content p, .content li, .content blockquote { max-width: 68ch; }
.prose p { margin-bottom: 1.5em; }
textarea { width: 100%; font-size: 16px; }
input { font-size: 16px; }
table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--hair); padding: 8px 6px; text-align: left; }
img { max-width: 100%; height: auto; border-radius: 2px; }
code { padding: 2px 5px; background-color: var(--blush); border-radius: 3px; }
pre { padding: 1.5em; border-radius: 8px; background: var(--paper); border: 1px solid var(--hair); }
pre > code { all: unset; }
blockquote {
	border-left: 3px solid var(--rose);
	padding: 0 0 0 20px;
	margin: 0;
	font-family: var(--serif);
	font-variation-settings: var(--soft);
	font-size: 1.25em;
	line-height: 1.45;
}
hr { border: none; border-top: 1px solid var(--hair); }
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
	color: var(--rose-text);
}
.eyebrow::before {
	content: "";
	flex: none;
	width: 7px;
	height: 7px;
	transform: rotate(45deg);
	background: var(--gold);
}
@media (max-width: 560px) {
	body { font-size: 17px; }
	main { padding: 32px 0 24px; }
}

/* Every photo gets a soft halo, cycling orange, rose and gold, that brightens on hover. */
figure { margin: 2.5rem 0; }
figure > img,
figure > video {
	display: block;
	margin: 0 auto;
	max-width: 100%;
	height: auto;
	border-radius: 8px;
	transition: box-shadow .5s ease, transform .3s ease;
}
figure:nth-of-type(3n+1) > img, figure:nth-of-type(3n+1) > video { box-shadow: var(--halo-orange); }
figure:nth-of-type(3n+2) > img, figure:nth-of-type(3n+2) > video { box-shadow: var(--halo-rose); }
figure:nth-of-type(3n) > img, figure:nth-of-type(3n) > video { box-shadow: var(--halo-gold); }
figure:nth-of-type(3n+1):hover > img, figure:nth-of-type(3n+1):hover > video { box-shadow: var(--halo-orange-hover); }
figure:nth-of-type(3n+2):hover > img, figure:nth-of-type(3n+2):hover > video { box-shadow: var(--halo-rose-hover); }
figure:nth-of-type(3n):hover > img, figure:nth-of-type(3n):hover > video { box-shadow: var(--halo-gold-hover); }
figcaption {
	max-width: 40rem;
	margin: 14px auto 0;
	font-family: var(--mono);
	font-size: 12px;
	letter-spacing: .12em;
	text-transform: uppercase;
	line-height: 1.6;
	color: var(--muted);
	text-align: left;
	font-style: normal;
}

/* Soft reveal: hidden only after BaseHead's script adds .js to <html>. */
.js .reveal { opacity: 0; transform: translateY(12px); transition: opacity .9s ease, transform .9s ease; }
.js .reveal.in { opacity: 1; transform: none; }

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
	*, *::before, *::after { transition: none !important; animation: none !important; }
	.js .reveal { opacity: 1; transform: none; }
}

@media print {
	html, body { background: #fff !important; background-image: none !important; color: #2A1E1E !important; }
	*, *::before, *::after {
		color: #2A1E1E !important;
		background-color: transparent !important;
		box-shadow: none !important;
		text-shadow: none !important;
		-webkit-text-stroke: 0 !important;
	}
	.js .reveal { opacity: 1 !important; transform: none !important; }
	a, a:visited, a * { color: #87314D !important; }
	.site-header, .site-footer { display: none !important; }
}
```


- [ ] **Step 4: Update `src/components/BaseHead.astro`.** Replace the font comment and `<link rel="stylesheet" …>` with:

```astro
<!-- Fonts: Sacramento (name, titles), Fraunces soft & wonky (lineup, subheads), DM Sans (body), DM Mono (labels). No italics. -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	rel="stylesheet"
	href="https://fonts.googleapis.com/css2?family=Sacramento&family=Fraunces:opsz,wght,SOFT,WONK@9..144,400..600,0..100,0..1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=DM+Mono:wght@400;500&display=swap"
/>
<!-- Soft reveals: .reveal elements fade up when scrolled into view. Without JS nothing is hidden. -->
<script is:inline>
	document.documentElement.classList.add('js');
	document.addEventListener('DOMContentLoaded', () => {
		const els = document.querySelectorAll('.reveal');
		if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			els.forEach((el) => el.classList.add('in'));
			return;
		}
		const io = new IntersectionObserver((entries) => {
			for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
		}, { rootMargin: '0px 0px -8% 0px' });
		els.forEach((el) => io.observe(el));
	});
</script>
```

- [ ] **Step 5: Run.** `npm run build && node --test tests/tokens.test.mjs`. Expected: PASS. (Leftovers still fails until Task 4.)

- [ ] **Step 6: Commit.** `git add src/styles/global.css src/components/BaseHead.astro tests/tokens.test.mjs tests/leftovers.test.mjs && git commit -m "matinee: tokens, fonts, halos and soft reveal"`

---

### Task 2: Header, title band, sidebar, footer

**Files:**
- Modify: `src/components/Header.astro` (logo markup + styles), `src/layouts/Page.astro` (h1 class + styles), `src/components/LinkList.astro` (styles), `src/components/Footer.astro` (text + styles)
- Test: `tests/header.test.mjs`, `tests/layout.test.mjs`

**Interfaces:**
- Consumes: Task 1 tokens, `.script`, `.eyebrow`.
- Produces: header logo `Zoe Wacker<span aria-hidden="true">.</span>` in `.mark`; page `h1` has classes `post-title script` (short) or `post-title long-title` (over 40 characters, serif); footer `.big` is `script` and reads `Zoe Wacker`.

- [ ] **Step 1: Update the tests.** In `tests/header.test.mjs` replace the logo assertion and test name:

```js
test('header markup: Zoe Wacker logo with orange period, 8 links, current section marked', () => {
  const html = readDist(AWARD);
  assert.match(html, /<a[^>]*class="mark"[^>]*aria-label="Zoe Wacker, home"[^>]*>Zoe Wacker<span[^>]*aria-hidden="true"[^>]*>\.<\/span><\/a>/);
```

(keep the rest of that test). In `tests/layout.test.mjs`:
- footer test: `assert.match(html, /<div[^>]*class="big script"[^>]*aria-hidden="true"[^>]*>Zoe Wacker<\/div>/);`
- titles test:

```js
test('short titles are script; titles over 40 characters switch to the serif long-title', () => {
  assert.match(readDist(SHELTER), /<h1[^>]*class="post-title long-title"/);
  assert.match(readDist('/about/'), /<h1[^>]*class="post-title script"/);
});
```

- rename `long neon title fits its box at 390px` to `long title fits its box at 360px and 390px` and loop widths `[360, 390]` creating a page per width with the same `sw <= cw` assertion.
- print test: expected text colour `'rgb(42, 30, 30)'`.

- [ ] **Step 2: Run to see failures.** `npm run build && node --test tests/header.test.mjs tests/layout.test.mjs`. Expected: FAIL on logo, footer, title classes, print colour.

- [ ] **Step 3: Header.** In `Header.astro` change the logo line to:

```astro
<a class="mark" href="/" aria-label="Zoe Wacker, home">Zoe Wacker<span aria-hidden="true">.</span></a>
```

and replace the `<style>` block with:

```css
	.site-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgba(251, 243, 234, .88);
		-webkit-backdrop-filter: blur(10px);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--hair);
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
	.mark { font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 600; font-size: 22px; letter-spacing: -.01em; line-height: 1; color: var(--deep-rose); text-decoration: none; }
	.mark:visited, .mark:hover { color: var(--deep-rose); text-decoration: none; }
	.mark span { color: var(--orange); }
	nav ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 22px; }
	nav a { font-size: 15px; font-weight: 500; color: var(--muted); text-decoration: none; padding-bottom: 4px; transition: color .2s; }
	nav a:visited { color: var(--muted); }
	nav a:hover { color: var(--ink); text-decoration: none; }
	nav a[aria-current='page'] { color: var(--ink); box-shadow: inset 0 -2px 0 var(--orange); }
	.menu-toggle {
		display: none;
		font: 500 12px/1 var(--mono);
		letter-spacing: .16em;
		text-transform: uppercase;
		color: var(--ink);
		background: transparent;
		border: 1px solid var(--hair);
		border-radius: 999px;
		padding: 10px 16px;
		cursor: pointer;
	}
	@media (max-width: 900px) {
		.bar { padding: 10px 0; }
		nav { flex-basis: 100%; }
		nav ul { flex-direction: column; gap: 0; }
		nav li a { display: block; padding: 8px 0; border-bottom: 1px solid var(--hair); font-family: var(--serif); font-variation-settings: var(--soft); font-size: 24px; font-weight: 500; color: var(--ink); }
		nav li a[aria-current='page'] { color: var(--deep-rose); box-shadow: none; }
		.site-header:not(.js) { position: static; }
		.site-header.js .menu-toggle { display: inline-flex; }
		.site-header.js nav { display: none; }
		.site-header.js.open nav { display: block; padding-bottom: 16px; max-height: calc(100dvh - 80px); overflow-y: auto; background: var(--paper); }
	}
```

- [ ] **Step 4: Title band.** In `Page.astro` change the h1 to:

```astro
<h1 class:list={['post-title', longTitle ? 'long-title' : 'script']}>{title}</h1>
```

and replace the `.title-band`, `.post-title` rules with:

```css
  .title-band { padding: 56px 16px 32px; border-bottom: 1px solid var(--hair); }
  .band-inner { width: var(--page-max); max-width: 100%; margin: 0 auto; }
  .post-title {
    font-size: clamp(52px, 8vw, 112px);
    line-height: 1.05;
    margin: 14px 0 0;
    padding-bottom: .08em;
    text-wrap: balance;
    overflow-wrap: anywhere;
  }
  .post-title.long-title { font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 500; color: var(--deep-rose); font-size: clamp(32px, 4.4vw, 56px); line-height: 1.1; }
```

Keep `.hero-band`, `.layout`, `.sidebar`, `.content` and the 900px media query; change its `.title-band` padding to `36px 16px 24px`.

- [ ] **Step 5: Sidebar.** In `LinkList.astro` replace the `.vlist` and `.grid` styles with:

```css
  .vlist { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--hair); }
  .vlist a {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 12px;
    align-items: baseline;
    padding: 14px 4px;
    border-bottom: 1px solid var(--hair);
    color: var(--ink);
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
    text-decoration: none;
    transition: background .25s, padding .25s;
  }
  .vlist a:visited { color: var(--ink); }
  .vlist a:hover { background: linear-gradient(90deg, rgba(194, 94, 119, .10), transparent); padding-left: 10px; text-decoration: none; color: var(--ink); }
  .vlist .n { font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 500; font-size: 20px; line-height: 1; color: var(--rose-text); }
  .vlist a[aria-current='page'] { box-shadow: inset 3px 0 0 var(--orange); padding-left: 12px; }
  .vlist a[aria-current='page'] .t { color: var(--deep-rose); }
  .grid {
    list-style: none;
    margin: .5rem 0 1.5rem;
    padding: 0;
    display: grid;
    gap: .75rem 1.25rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .grid a { color: var(--orange-text); text-decoration: none; font-weight: 700; }
  .grid a:hover { text-decoration: underline; text-underline-offset: 3px; }
  .desc { margin: .2rem 0 0; color: var(--muted); font-size: .95rem; }
```

- [ ] **Step 6: Footer.** In `Footer.astro` change the big line to `<div class="big script" aria-hidden="true">Zoe Wacker</div>` and replace the styles with:

```css
	.site-footer { margin-top: 110px; border-top: 1px solid var(--hair); padding: 40px 16px 60px; }
	.foot { width: var(--page-max); max-width: 100%; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
	.big { font-size: clamp(44px, 7vw, 96px); line-height: 1; color: rgba(42, 30, 30, .12); -webkit-text-stroke: 0; white-space: nowrap; }
	.line { margin: 0; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
```

- [ ] **Step 7: Run.** `npm run build && node --test tests/header.test.mjs tests/layout.test.mjs tests/nav.test.mjs`. Expected: PASS.

- [ ] **Step 8: Commit.** `git commit -am "matinee: header, title band, sidebar and footer"`

---

### Task 3: Award hero

**Files:** Modify `src/components/AwardExhibit.astro` (styles only). Test: `tests/awards.test.mjs`.

- [ ] **Step 1: Update the test.** Rename `award label card is dark with a marigold result` to `award label card is paper with a gold result`, and expect `s.card === 'rgb(255, 251, 246)'` and `s.badge === 'rgb(142, 98, 16)'`.

- [ ] **Step 2: Run.** `npm run build && node --test tests/awards.test.mjs`. Expected: FAIL on colours.

- [ ] **Step 3: Replace the `<style>` block:**

```css
  .award-exhibit { width: var(--page-max); max-width: 100%; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 56px; align-items: center; }
  .hung img { display: block; width: 100%; height: auto; border-radius: 8px; box-shadow: var(--halo-rose); transition: box-shadow .5s ease; }
  .hung:hover img { box-shadow: var(--halo-rose-hover); }
  .label { background: var(--paper); border: 1px solid var(--hair); border-top: 3px solid var(--orange); border-radius: 10px; padding: 24px; font-size: 15px; line-height: 1.5; }
  .label p { margin: 0; }
  .badge { display: inline-flex; align-items: center; gap: 10px; font-family: var(--mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-text); }
  .badge::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: var(--gold); flex: none; }
  .label h2 { font-size: 30px; line-height: 1.1; margin: 14px 0 6px; overflow-wrap: anywhere; color: var(--ink); }
  .by { color: var(--muted); }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--hair); }
  dt { font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); padding-top: 3px; }
  dd { margin: 0; color: var(--ink); }
  @media (max-width: 900px) {
    .award-exhibit { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    .label h2 { font-size: 26px; }
  }
```

- [ ] **Step 4: Run.** Same command. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -am "matinee: award hero"`

---

### Task 4: Remaining pages

**Files (styles only):** `src/layouts/BlogPost.astro`, `src/pages/blog/index.astro`, `src/pages/photography/portfolio/index.astro`, `src/pages/photography/series/index.astro`, `src/pages/photography/masonry.astro`, `src/pages/photography/awards/peninsula-photo-competition-2025.astro`. Test: `tests/leftovers.test.mjs`, `tests/review-fixes.test.mjs`.

Token mapping to apply in each file:

| Old | New |
|---|---|
| `var(--night)`, `var(--night-2)` (backgrounds) | `var(--paper)` |
| `var(--night-3)` | `var(--blush)` |
| `var(--cream)` (text) | `var(--ink)` |
| `var(--mist)` | `var(--muted)` |
| `var(--coral)` (text) | `var(--orange-text)` |
| `var(--marigold)` (text) | `var(--gold-text)` |
| `var(--rose)` (text under 24px) | `var(--rose-text)` |
| `var(--line)` | `var(--hair)` |
| `font-family: var(--display)` | `font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 500;` (drop any `text-transform: uppercase` next to it) |
| `var(--glow-coral)` / `--glow-rose` / `--glow-gold` | `var(--halo-orange)` / `--halo-rose` / `--halo-gold` |

- [ ] **Step 1: Update the portfolio test** in `tests/review-fixes.test.mjs`: rename to `portfolio slideshow photo has a halo with rounded corners like every other photo` and expect `s.radius === '8px'`.
- [ ] **Step 2: Run** `npm run build && node --test tests/leftovers.test.mjs tests/review-fixes.test.mjs`. Expected: FAIL (leftovers in these files and `index.astro`; radius).
- [ ] **Step 3: Apply the mapping** to the six files (`grep -nE "var\(--(night|night-2|night-3|cream|mist|coral|marigold|rose|line|display|glow-[a-z]+)\)"` each file first). In `portfolio/index.astro` also set `.slide-img` `border-radius: 8px`. In `masonry.astro` check any lightbox overlay: a dark overlay `rgba(0,0,0,.x)` behind a full-screen photo is fine to keep.
- [ ] **Step 4: Run** `npm run build && node --test tests/review-fixes.test.mjs tests/series.test.mjs tests/gallery-awards.test.mjs`. Expected: PASS. (Leftovers passes after Task 6 rewrites `index.astro`.)
- [ ] **Step 5: Commit.** `git commit -am "matinee: blog, portfolio, series, masonry and award page styles"`

---

### Task 5: Registry helpers for stubs and programme numbers

**Files:** Modify `src/lib/registry-meta.mjs`. Test: `tests/registry-meta.test.mjs`.

**Interfaces:**
- Produces:
  - `recentStubs({ awards, trips, concerts }) -> Array<{ kind: 'Award'|'Trip'|'Concert', name: string, year: number|null, note: string, href: string, tone: 'orange'|'rose'|'gold' }>`: `awards[0]` (orange), `awards[1]` (rose), `trips[0]` (gold), `concerts[0]` (orange), skipping any that are missing; `note` is `''` when absent.
  - `roman(n: number) -> string` for 1–39 (`1 -> 'I'`, `4 -> 'IV'`, `9 -> 'IX'`, `14 -> 'XIV'`).

- [ ] **Step 1: Add the failing tests** to `tests/registry-meta.test.mjs` (extend the import with `recentStubs, roman`):

```js
test('recentStubs: two newest awards, newest trip, newest concert, with tones', () => {
  const s = recentStubs({
    awards: [{ href: '/a1', label: 'Alpha Prize 2026', note: 'Winner' }, { href: '/a2', label: 'Beta Salon 2025' }],
    trips: [{ href: '/t1', label: 'Egypt 2025', note: 'Cairo · Giza' }],
    concerts: [{ href: '/c1', label: 'Outside Lands 2026' }],
  });
  assert.deepEqual(s.map((x) => [x.kind, x.name, x.year, x.tone, x.href]), [
    ['Award', 'Alpha Prize', 2026, 'orange', '/a1'],
    ['Award', 'Beta Salon', 2025, 'rose', '/a2'],
    ['Trip', 'Egypt', 2025, 'gold', '/t1'],
    ['Concert', 'Outside Lands', 2026, 'orange', '/c1'],
  ]);
  assert.equal(s[1].note, '');
});

test('recentStubs skips missing entries', () => {
  const s = recentStubs({ awards: [{ href: '/a1', label: 'Alpha 2026' }], trips: [], concerts: [] });
  assert.deepEqual(s.map((x) => x.kind), ['Award']);
});

test('roman numerals for the awards programme', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 9, 10, 14, 39].map(roman), ['I', 'II', 'III', 'IV', 'V', 'IX', 'X', 'XIV', 'XXXIX']);
});
```

- [ ] **Step 2: Run** `node --test tests/registry-meta.test.mjs`. Expected: FAIL (`recentStubs` is not exported).
- [ ] **Step 3: Append to `src/lib/registry-meta.mjs`:**

```js
/** Homepage ticket stubs: the two newest awards, the newest trip and the newest concert. */
export function recentStubs({ awards = [], trips = [], concerts = [] }) {
  const pick = [
    [awards[0], 'Award', 'orange'],
    [awards[1], 'Award', 'rose'],
    [trips[0], 'Trip', 'gold'],
    [concerts[0], 'Concert', 'orange'],
  ];
  return pick.filter(([item]) => item).map(([item, kind, tone]) => ({
    kind, tone, href: item.href, note: item.note ?? '', ...splitYear(item.label),
  }));
}

/** 1 -> "I", 14 -> "XIV" (numbers up to 39, plenty for the awards list). */
export function roman(n) {
  const parts = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of parts) while (n >= v) { out += s; n -= v; }
  return out;
}
```

- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Commit.** `git commit -am "matinee: recentStubs and roman helpers"`

---

### Task 6: Homepage

**Files:** Rewrite `src/pages/index.astro`. Test: rewrite `tests/home.test.mjs`.

**Interfaces:**
- Consumes: `splitYear, latest, featuredAward, seasonLabel, recentStubs, roman` from `registry-meta.mjs`; `photographyAwards, travelTrips, musicConcerts, celloPerformances` from the registry; `exhibit.json` and `displayPath, listDrafts, missingDisplayFiles, homepageImages` from `src/lib/exhibit.mjs` (unchanged); halo tokens and `.script`, `.reveal`, `.eyebrow` from Task 1.

- [ ] **Step 1: Rewrite `tests/home.test.mjs`:**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readDist, serveDist, launch } from './helpers.mjs';
import { photographyAwards, travelTrips, musicConcerts, celloPerformances } from '../src/links/registry.ts';
import { recentStubs } from '../src/lib/registry-meta.mjs';

const html = readDist('/');
const data = JSON.parse(fs.readFileSync('src/data/exhibit.json', 'utf8'));
const section = (cls) => html.match(new RegExp(`<(?:ol|div|ul)[^>]*class="${cls}"[^>]*>([\\s\\S]*?)</(?:ol|div|ul)>`))?.[1] ?? '';
const hrefs = (s) => [...s.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

test('poster: script headliner with an orange period, season line, tagline and billed sections', () => {
  assert.match(html, /<h1[^>]*class="headliner script"[^>]*>Zoe Wacker<span[^>]*>\.<\/span><\/h1>/);
  assert.match(html, /presents<\/b> the \d{4}–\d{2} season/);
  assert.ok(html.includes('“aha!” moments.'));
  for (const h of ['/photography', '/travel', '/music', '/geography', '/guardian-arts', '/academics', '/about', '/photography/awards', '/music/concerts']) {
    assert.match(html, new RegExp(`<a[^>]*href="${h}"`), `bill links ${h}`);
  }
  assert.match(html, />About Zoe</);
});

test('ticket stubs: two newest awards, newest trip, newest concert, in order', () => {
  const want = recentStubs({ awards: photographyAwards, trips: travelTrips, concerts: musicConcerts }).map((s) => s.href);
  assert.deepEqual(hrefs(section('stubs')), want);
  assert.equal(want.length, 4);
});

test('photo strip shows the first three exhibit photos', () => {
  for (const it of data.items.slice(0, 3)) assert.ok(html.includes(it.title), `missing ${it.title}`);
  assert.ok(!html.includes(data.items[3].title), 'only three photos');
});

test('programme links every registry award with Roman numerals, plus the featured card', () => {
  assert.deepEqual(hrefs(section('programme')), photographyAwards.map((a) => a.href));
  assert.match(section('programme'), /<span[^>]*class="n"[^>]*>I<\/span>/);
  assert.match(html, /<a[^>]*class="awardcard"[^>]*href="\/photography\/awards\/peninsula-photo-competition-2025"/);
  assert.ok(html.includes('Read the story →'));
});

test('travel dates show the five newest trips; concerts the six newest; the newest cello performance', () => {
  assert.deepEqual(hrefs(section('tour')), travelTrips.slice(0, 5).map((t) => t.href));
  assert.deepEqual(hrefs(section('gigs')), musicConcerts.slice(0, 6).map((c) => c.href));
  assert.match(html, new RegExp(`<a[^>]*class="cello"[^>]*href="${celloPerformances[0].href}"`));
});

test('about: script ZW monogram and no photo of Zoe', () => {
  assert.match(html, /class="monogram script"[^>]*>ZW</);
  assert.ok(html.includes('Hi! I’m Zoe.'));
  for (const p of ['/images/home/about.jpg', '650_award_2025', 'zoe_']) assert.ok(!html.includes(p), `photo of Zoe: ${p}`);
});

test('homepage uses resized images only, with no undefined/null text', () => {
  const srcs = [...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1]);
  const tripThumbs = travelTrips.slice(0, 5).filter((t) => t.image).length;
  assert.equal(srcs.length, 3 + 1 + tripThumbs);
  for (const s of srcs) assert.match(s, /^\/images\/display\//);
  assert.doesNotMatch(html, />\s*(undefined|null)\s*</);
});

test('homepage: no sideways scroll, and the name and section headings stay on one line', async (t) => {
  const srv = await serveDist();
  const browser = await launch();
  t.after(async () => { await browser.close(); await srv.close(); });
  for (const width of [360, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(srv.url + '/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const lines = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return new Set([...rg.getClientRects()].map((x) => Math.round(x.top))).size; };
      return {
        sw: document.documentElement.scrollWidth, iw: window.innerWidth,
        h1: lines(document.querySelector('.headliner')),
        h2: [...document.querySelectorAll('.home h2')].map((h) => [h.textContent.trim(), lines(h)]),
      };
    });
    assert.ok(r.sw <= r.iw, `${width}px: scrollWidth ${r.sw} > ${r.iw}`);
    assert.equal(r.h1, 1, `${width}px: name wraps`);
    for (const [txt, n] of r.h2) assert.equal(n, 1, `${width}px: "${txt}" wraps`);
    await page.close();
  }
});
```

- [ ] **Step 2: Run** `npm run build && node --test tests/home.test.mjs`. Expected: FAIL.

- [ ] **Step 3: Rewrite `src/pages/index.astro`.** Frontmatter:

```astro
---
import FullBleed from '@layouts/FullBleed.astro';
import exhibit from '../data/exhibit.json';
import { photographyAwards, travelTrips, musicConcerts, celloPerformances } from '@links/registry';
import { displayPath, listDrafts, missingDisplayFiles, homepageImages } from '../lib/exhibit.mjs';
import { splitYear, latest, featuredAward, seasonLabel, recentStubs, roman } from '../lib/registry-meta.mjs';

const photos = exhibit.items.slice(0, 3);
const award = featuredAward(photographyAwards);
const trips = latest(travelTrips, 5).map((t) => ({ ...t, ...splitYear(t.label) }));
const gigs = latest(musicConcerts, 6).map((c) => ({ ...c, ...splitYear(c.label) }));
const cello = celloPerformances[0];
const stubs = recentStubs({ awards: photographyAwards, trips: travelTrips, concerts: musicConcerts });
const season = seasonLabel(new Date());

const missing = missingDisplayFiles(
  homepageImages({ items: exhibit.items, award, trips }).map(([src, kind]) => displayPath(src, kind)), 'public');
if (missing.length) {
  throw new Error(`Missing homepage display images. Run \`npm run thumbnails\`. Missing: ${missing.join(', ')}`);
}
const drafts = listDrafts(exhibit.items);
if (drafts.length) {
  console.warn(`[exhibit] ${drafts.length} draft caption(s) for Zoe to edit in src/data/exhibit.json: ${drafts.join('; ')}`);
}

const BILL = [
  [['/photography', 'Photography'], ['/travel', 'Travel'], ['/music', 'Music']],
  [['/geography', 'Geography'], ['/guardian-arts', 'Guardian Arts'], ['/academics', 'Academics']],
  [['/about', 'About Zoe'], ['/photography/awards', 'Awards'], ['/music/concerts', 'Concerts']],
];
const HALO = ['h-orange', 'h-rose', 'h-gold'];
const INTERESTS = ['Geography', 'Travel', 'Cello', 'Parkour', 'Mixed martial arts', 'History', 'Photos that tell little stories'];
const num = (i) => String(i + 1).padStart(2, '0');
---
```

Markup (inside `<FullBleed title="Zoe Wacker">`):

```astro
  <div class="home">
    <section class="poster">
      <p class="presents">Menlo Park, CA <b>presents</b> the {season} season</p>
      <div class="rule" aria-hidden="true"><i></i></div>
      <h1 class="headliner script">Zoe Wacker<span>.</span></h1>
      <p class="tagline">Photographer, cellist, map nerd. A highlight reel of <em>experiments, adventures and “aha!” moments.</em></p>
      <nav class="bill" aria-label="Sections">
        {BILL.map((row, r) => (
          <div class={`row r${r + 1}`}>
            {row.map(([href, label], i) => (<>{i > 0 && <i class="dot" aria-hidden="true"></i>}<a href={href}>{label}</a></>))}
          </div>
        ))}
        <p class="support">On location in {trips.map((t, i) => (<>{i > 0 && ' · '}<b>{t.name}</b></>))}</p>
      </nav>
    </section>

    {stubs.length > 0 && (
      <section class="recent" aria-label="Recent dates">
        <div class="stubs-head"><p><b>Now showing</b> · recent dates</p><p aria-hidden="true">Admit one</p></div>
        <div class="stubs">
          {stubs.map((s, i) => (
            <a class={`stub ${s.tone} reveal`} href={s.href}>
              <span class="main">
                <span class="kind">{s.kind}{s.year ? ` · ${s.year}` : ''}</span>
                <span class="name">{s.name}</span>
                {s.note && <span class="det">{s.note}</span>}
              </span>
              <span class="tear" aria-hidden="true"><span>No. {num(i)}</span></span>
            </a>
          ))}
        </div>
      </section>
    )}

    <section class="strip" aria-label="Featured photos">
      {photos.map((p, i) => (
        <figure class={`p${i + 1} reveal`}>
          {p.href
            ? <a class={`shot ${HALO[i]}`} href={p.href}><img src={displayPath(p.image)} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} /></a>
            : <div class={`shot ${HALO[i]}`}><img src={displayPath(p.image)} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} /></div>}
          <figcaption><span>{p.title}</span><span>{p.place}</span></figcaption>
        </figure>
      ))}
    </section>

    <section class="block" id="awards">
      <div class="two">
        <div class="reveal">
          <p class="eyebrow">The programme</p>
          <h2 class="script">Photo awards <em>{season}</em></h2>
          {award && (
            <a class="awardcard" href={award.href}>
              {award.image && <span class="shot h-orange"><img src={displayPath(award.image)} alt="" loading="lazy" /></span>}
              <span class="cap">
                <b>{award.label}</b>
                {award.note && <span class="note">{award.note}</span>}
                <span class="btn">Read the story →</span>
              </span>
            </a>
          )}
        </div>
        <ol class="programme reveal" role="list">
          {photographyAwards.map((a, i) => (
            <li class:list={{ feat: a === award }}>
              <a href={a.href}>
                <span class="n">{roman(i + 1)}</span>
                <span class="t">{a.label}{a.note && <span class="d">{a.note}</span>}</span>
                <span class="arrow" aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section class="block" id="travel">
      <p class="eyebrow">On location</p>
      <h2 class="script">Travel <em>dates</em></h2>
      <div class="tour">
        {trips.map((t) => (
          <a class="date reveal" href={t.href}>
            <span class="yr">{t.year ?? ''}</span>
            <span class="place">{t.name}</span>
            <span class="stops">{t.note ?? ''}</span>
            {t.image && <span class="thumb"><img src={displayPath(t.image, 'row')} alt="" loading="lazy" /></span>}
          </a>
        ))}
      </div>
      <a class="more" href="/travel">All trips →</a>
    </section>

    <section class="block" id="music">
      <div class="music reveal">
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
      </div>
    </section>

    <section class="block about reveal" id="meet">
      <span class="monogram script" aria-hidden="true">ZW</span>
      <div>
        <p class="eyebrow">Meet the headliner</p>
        <h2 class="script">Hi! I’m Zoe.</h2>
        <p class="voice">A middle schooler who’s always juggling a bunch of different interests. I started this site to keep track of the things I’m working on, the ideas I’m excited about, and the projects that don’t always fit neatly into a school folder.</p>
        <ul class="interests" role="list">{INTERESTS.map((s) => <li>{s}</li>)}</ul>
        <a class="more" href="/about">More about me →</a>
      </div>
    </section>
  </div>
```

Styles (scoped `<style>`):

```css
  .home { width: var(--page-max); max-width: 100%; margin: 0 auto; padding: 0 32px 20px; }
  .poster { padding: 64px 0 24px; text-align: center; }
  .presents { margin: 0; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--rose-text); }
  .presents b { color: var(--ink); font-weight: 500; }
  .rule { display: flex; align-items: center; gap: 14px; max-width: 520px; margin: 18px auto 0; }
  .rule::before, .rule::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--gold)); }
  .rule::after { transform: scaleX(-1); }
  .rule i { width: 7px; height: 7px; background: var(--gold); transform: rotate(45deg); }
  .headliner { font-size: clamp(44px, 15.5vw, 236px); line-height: 1.05; white-space: nowrap; margin: 6px 0 0; padding: .08em 0 .12em; }
  .headliner span { color: var(--orange); }
  .tagline { font-size: clamp(16px, 1.9vw, 20px); color: var(--muted); max-width: 620px; margin: 8px auto 0; }
  .tagline em { color: var(--rose-text); font-weight: 500; }
  .bill { margin: 44px auto 0; max-width: 1080px; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); padding: 30px 0; position: relative; }
  .bill::before, .bill::after { content: ""; position: absolute; left: 0; right: 0; height: 1px; background: var(--hair); }
  .bill::before { top: 4px; } .bill::after { bottom: 4px; }
  .row { display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; column-gap: 24px; row-gap: 2px; font-family: var(--serif); font-variation-settings: var(--soft); line-height: 1.12; }
  .row a { position: relative; isolation: isolate; color: inherit; text-decoration: none; transition: color .3s; }
  .row a::after { content: ""; position: absolute; inset: -.18em -.45em; border-radius: 999px; z-index: -1; opacity: 0; transform: scale(.85);
    background: radial-gradient(closest-side, rgba(var(--rh), .20), rgba(var(--rh), 0)); transition: opacity .4s ease, transform .4s ease; }
  .row a:hover, .row a:focus-visible { text-decoration: none; }
  .row a:hover::after, .row a:focus-visible::after { opacity: 1; transform: scale(1); }
  .dot { width: 7px; height: 7px; transform: rotate(45deg); background: var(--gold); display: inline-block; align-self: center; }
  .r1 { --rh: var(--h-orange); font-size: clamp(32px, 5.6vw, 76px); font-weight: 500; color: var(--orange); }
  .r1 a:hover { color: var(--orange); }
  .r2 { --rh: var(--h-rose); font-size: clamp(24px, 3.3vw, 44px); font-weight: 400; color: var(--ink); margin-top: 8px; }
  .r2 a:hover { color: var(--rose); }
  .r2 .dot { width: 6px; height: 6px; background: var(--rose); }
  .r3 { --rh: var(--h-rose); font-size: clamp(19px, 2.1vw, 26px); font-weight: 500; font-variant-caps: all-small-caps; letter-spacing: .08em; color: var(--rose-text); margin-top: 12px; }
  .r3 .dot { width: 5px; height: 5px; }
  .support { margin: 22px 0 0; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
  .support b { color: var(--ink); font-weight: 500; }

  .stubs-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin: 56px 0 18px; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
  .stubs-head p { margin: 0; }
  .stubs-head b { color: var(--orange-text); font-weight: 500; }
  .stubs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
  .stub { --c: var(--orange); --ct: var(--orange-text); --hh: var(--h-orange); position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 46px; background: var(--paper); border-radius: 10px; color: var(--ink); text-decoration: none;
    box-shadow: 0 1px 0 rgba(42, 30, 30, .05), 0 14px 30px -18px rgba(122, 60, 40, .35); transition: transform .3s ease, box-shadow .4s ease; }
  .stub:visited, .stub:hover { color: var(--ink); text-decoration: none; }
  .stub:hover { transform: translateY(-4px); box-shadow: 0 0 0 1px rgba(var(--h-rose), .22), 0 22px 48px -16px rgba(var(--h-rose), .5), 0 0 90px -24px rgba(var(--h-rose), .4); }
  .stub.rose { --c: var(--rose); --ct: var(--rose-text); }
  .stub.gold { --c: var(--gold); --ct: var(--gold-text); }
  .stub .main { padding: 18px 18px 18px 20px; border-left: 4px solid var(--c); border-radius: 10px 0 0 10px; min-width: 0; }
  .stub .kind { font-family: var(--mono); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--ct); }
  .stub .name { display: block; font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 600; font-size: 21px; line-height: 1.15; margin: 8px 0 6px; }
  .stub .det { display: block; font-size: 14px; color: var(--muted); line-height: 1.45; }
  .stub .tear { position: relative; border-left: 2px dashed var(--hair); display: flex; align-items: center; justify-content: center; }
  .stub .tear span { writing-mode: vertical-rl; transform: rotate(180deg); font-family: var(--mono); font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: var(--ct); }
  .stub .tear::before, .stub .tear::after { content: ""; position: absolute; left: -9px; width: 16px; height: 16px; border-radius: 50%; background: var(--cream); }
  .stub .tear::before { top: -8px; } .stub .tear::after { bottom: -8px; }

  .strip { display: grid; grid-template-columns: 1.3fr .8fr 1fr; gap: 30px; align-items: start; padding: 84px 0 10px; }
  .strip figure { margin: 0; }
  .shot { display: block; border-radius: 8px; overflow: hidden; background: var(--blush); transition: box-shadow .5s ease; }
  .shot img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 0; transition: transform .8s ease; }
  .h-orange { box-shadow: var(--halo-orange); } .h-rose { box-shadow: var(--halo-rose); } .h-gold { box-shadow: var(--halo-gold); }
  figure:hover .h-orange, .awardcard:hover .h-orange { box-shadow: var(--halo-orange-hover); }
  figure:hover .h-rose { box-shadow: var(--halo-rose-hover); }
  figure:hover .h-gold { box-shadow: var(--halo-gold-hover); }
  figure:hover .shot img, .awardcard:hover .shot img { transform: scale(1.025); }
  .strip figcaption { max-width: none; margin: 14px 0 0; display: flex; justify-content: space-between; gap: 12px; }
  .strip figcaption span:first-child { color: var(--ink); }
  .p1 .shot { aspect-ratio: 3 / 2; }
  .p2 { margin-top: 70px; } .p2 .shot { aspect-ratio: 3 / 4.6; }
  .p3 { margin-top: 24px; } .p3 .shot { aspect-ratio: 4 / 5; }

  .block { padding-top: 104px; }
  .home h2 { margin: 0; font-size: clamp(44px, 5.2vw, 80px); line-height: 1.05; white-space: nowrap; padding-bottom: .06em; }
  .home h2 em { color: var(--orange); }
  .block .eyebrow { margin-bottom: 10px; }
  .two { display: grid; grid-template-columns: 5fr 7fr; gap: 64px; align-items: start; }
  .awardcard { display: block; margin-top: 30px; color: var(--ink); text-decoration: none; }
  .awardcard:hover, .awardcard:visited { color: var(--ink); text-decoration: none; }
  .awardcard .shot { aspect-ratio: 3 / 2; }
  .awardcard .cap { display: block; margin-top: 20px; }
  .awardcard b { display: block; font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 600; font-size: 28px; line-height: 1.15; }
  .awardcard .note { display: block; color: var(--muted); font-size: 15px; margin-top: 4px; }
  .btn { display: inline-flex; margin-top: 18px; padding: 12px 22px; border-radius: 999px; background: var(--ink); color: var(--cream); font-weight: 500; font-size: 15px; transition: transform .25s, background .25s; }
  .awardcard:hover .btn { transform: translateY(-2px); background: var(--deep-rose); }
  .programme { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--ink); }
  .programme li { border-bottom: 1px solid var(--hair); }
  .programme a { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; gap: 16px; align-items: baseline; padding: 22px 6px; color: var(--ink); text-decoration: none; transition: background .25s, padding .25s; }
  .programme a:visited { color: var(--ink); }
  .programme a:hover { background: linear-gradient(90deg, rgba(226, 115, 58, .08), transparent); padding-left: 12px; text-decoration: none; color: var(--ink); }
  .programme .n { font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 500; font-size: 28px; line-height: 1; color: var(--gold-text); }
  .programme .t { font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 600; font-size: 20px; line-height: 1.25; }
  .programme .d { display: block; font-family: var(--sans); font-weight: 400; font-size: 15px; color: var(--muted); margin-top: 4px; }
  .programme .feat .t { color: var(--orange-text); }
  .programme .arrow { color: var(--rose-text); transition: transform .25s; }
  .programme a:hover .arrow { transform: translateX(4px); }

  .tour { margin-top: 36px; border-top: 1px solid var(--ink); }
  .date { display: grid; grid-template-columns: 100px minmax(0, 1fr) minmax(0, 2fr) 132px; gap: 24px; align-items: center; padding: 20px 0; border-bottom: 1px solid var(--hair); color: var(--ink); text-decoration: none; }
  .date:hover, .date:visited { color: var(--ink); text-decoration: none; }
  .date .yr { font-family: var(--mono); font-size: 14px; letter-spacing: .14em; color: var(--gold-text); }
  .date .place { font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 600; font-size: 34px; line-height: 1; transition: color .25s; }
  .date:hover .place { color: var(--orange); }
  .date .stops { color: var(--muted); }
  .date .thumb { width: 132px; height: 84px; border-radius: 6px; overflow: hidden; box-shadow: var(--halo-rose); transition: transform .3s, box-shadow .5s; }
  .date:hover .thumb { transform: translateY(-3px) rotate(-1.5deg); box-shadow: var(--halo-rose-hover); }
  .date .thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 0; }
  .more { display: inline-block; margin-top: 22px; font-weight: 700; }

  .music { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; background: var(--blush); border-radius: 18px; padding: 64px; }
  .pull { border: 0; padding: 0; font-size: clamp(30px, 3.6vw, 48px); line-height: 1.1; max-width: none; }
  .pull em { color: var(--rose-text); }
  .label { display: block; margin: 0; font-family: var(--mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
  .gigs { list-style: none; margin: 8px 0 0; padding: 0; columns: 2; column-gap: 32px; }
  .gigs li { break-inside: avoid; border-bottom: 1px solid var(--hair); }
  .gigs a { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; color: var(--ink); text-decoration: none; }
  .gigs a:hover, .gigs a:visited { color: var(--ink); text-decoration: none; }
  .gigs a:hover b { color: var(--orange-text); }
  .gigs b { font-family: var(--serif); font-variation-settings: var(--soft); font-weight: 600; }
  .gigs span { color: var(--gold-text); font-family: var(--mono); font-size: 13px; }
  .cello { display: block; margin-top: 28px; padding: 20px 22px; background: var(--paper); border-radius: 10px; border-left: 4px solid var(--gold); color: var(--ink); text-decoration: none; transition: transform .25s; }
  .cello:hover, .cello:visited { color: var(--ink); text-decoration: none; }
  .cello:hover { transform: translateY(-2px); }
  .cello .label { color: var(--gold-text); }
  .cello .c-t { display: block; margin-top: 6px; font-weight: 700; }
  .cello .c-n { display: block; color: var(--muted); font-size: 15px; }

  .about { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 64px; align-items: center; }
  .monogram { width: 240px; height: 240px; border-radius: 50%; display: grid; place-items: center; background: var(--paper); box-shadow: var(--halo-gold); font-size: 104px; line-height: 1; transition: box-shadow .5s; }
  .monogram:hover { box-shadow: var(--halo-gold-hover); }
  .voice { font-size: 20px; line-height: 1.6; margin: 22px 0 0; max-width: 640px; }
  .interests { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
  .interests li { padding: 7px 14px; background: var(--paper); border: 1px solid var(--hair); border-radius: 999px; font-size: 14px; color: var(--muted); }

  @media (max-width: 1060px) { .stubs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 900px) {
    .strip { grid-template-columns: 1fr 1fr; gap: 18px; }
    .strip .p1 { grid-column: 1 / -1; }
    .p2, .p3 { margin-top: 0; }
    .two, .music, .about { grid-template-columns: minmax(0, 1fr); gap: 40px; }
    .music { padding: 40px 28px; }
    .monogram { width: 160px; height: 160px; font-size: 68px; }
    .date { grid-template-columns: 70px minmax(0, 1fr); gap: 4px 16px; }
    .date .stops { grid-column: 2; }
    .date .thumb { display: none; }
  }
  @media (max-width: 699px) { .home h2 { font-size: clamp(28px, 8.4vw, 58px); } }
  @media (max-width: 560px) {
    .home { padding: 0 16px 20px; }
    .poster { padding-top: 44px; }
    .bill { margin-top: 32px; }
    .row { column-gap: 14px; }
    .stubs { grid-template-columns: minmax(0, 1fr); }
    .strip figcaption { flex-direction: column; gap: 2px; }
    .gigs { columns: 1; }
    .date .place { font-size: 28px; }
    .programme a { grid-template-columns: 40px minmax(0, 1fr); }
    .programme .arrow { display: none; }
    .block { padding-top: 72px; }
  }
```

- [ ] **Step 4: Run** `npm run build && node --test tests/home.test.mjs tests/leftovers.test.mjs tests/exhibit-data.test.mjs`. Expected: PASS. If an `h2` wraps at 360px, lower the 699px clamp's middle value (8.4vw) until it fits; if the name wraps, lower `15.5vw`.
- [ ] **Step 5: Commit.** `git commit -am "matinee: homepage"`

---

### Task 7: Site-wide browser checks

**Files:** Create `tests/matinee.test.mjs`.

- [ ] **Step 1: Write the tests:**

```js
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
```

Also, in `tests/review-fixes.test.mjs`, make sure the existing text-contrast probe runs on `/`, `/about/` and `/photography/awards/peninsula-photo-competition-2025/` (add the missing routes to its page list if it only checks one).

- [ ] **Step 2: Run** `npm run build && node --test tests/matinee.test.mjs tests/review-fixes.test.mjs`. Expected: PASS. Fix any contrast failure by switching that element to the `-text` token.
- [ ] **Step 3: Commit.** `git add tests/matinee.test.mjs tests/review-fixes.test.mjs && git commit -m "matinee: site-wide browser checks"`

---

### Task 8: Docs, full suite, PR

**Files:** `CLAUDE.md` (Theme section), `design/themes/README.md`.

- [ ] **Step 1:** In `CLAUDE.md`, replace the "Theme (After Dark)" section with a "Theme (Matinee)" section: light cream "matinee poster" from mockup `design/themes/7B-5`; tokens in `src/styles/global.css` (`--cream`, `--ink`, `--deep-rose`, `--orange`/`--rose`/`--gold` for large text only, `-text` variants for small text); fonts Sacramento (`.script`), Fraunces soft & wonky (`--serif` + `--soft`), DM Sans, DM Mono; no italics; every `<figure>` photo gets a halo cycling orange/rose/gold that brightens on hover; add `class="reveal"` for a soft fade-in; printing switches to dark on white. Keep the AwardExhibit, homepage registry, exhibit.json and `npm test` notes, updating "glow" to "halo".
- [ ] **Step 2:** In `design/themes/README.md`, change the "Live theme" line to "7B-5 · Matinee (since <merge date>). After Dark (5B) was live October 22 – <merge date>, 2026."
- [ ] **Step 3: Full suite.** `npm test`. Expected: all pass. Read the output; report any failure by name.
- [ ] **Step 4: Commit and push the branch.** `git commit -am "matinee: docs" && git push -u origin matinee-redesign`
- [ ] **Step 5: Open the PR** with `gh pr create --base main --title "Matinee redesign (7B-5)" --body "<summary of tasks, test results, screenshots note>"` ending with the attribution line from the session. Open the built site for review: `npm run preview` and `open -a Safari http://localhost:4321/`. The parent merges the PR (one production deploy).
