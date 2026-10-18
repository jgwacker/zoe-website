# Soft Blush redesign: design spec

**Date:** 2026-10-18
**Status:** Approved in conversation, awaiting written-spec review
**Reference mockup:** `design/themes/3D-1a/` (homepage `index.html`, award page `award.html`)

## Goal

Replace the stock Astro blog theme (gray gradient, blue `#2337ff` links, plain text header) with the **3D-1a "Soft Blush, no italics"** look that Zoe chose. The site should feel warm and personal, right for a 13-year-old but not juvenile, and stay credible to photo-contest judges.

**Success criteria:**
1. Every page on the site has the same consistent style. No page keeps the old blue and gray look.
2. The homepage is the "exhibit" from the mockup.
3. Award pages match the mockup's award page.
4. No page content or URL changes.
5. New pages Zoe adds later get the style automatically, with no extra steps.
6. Text contrast meets WCAG AA (4.5:1 for body text). Layouts work at 390px phone width with no horizontal scroll.

**Non-goals:**
- Rewriting page content, except the homepage exhibit captions (see §5).
- Custom per-section layouts (trips, concerts) beyond the shared styling.
- Changing the link registry or URL structure.
- Redesigning the unused starter blog content.

## 1. Design tokens

All values live as CSS custom properties in `src/styles/global.css`. They replace the existing `--accent`, `--gray*` and `--black` variables, and the old names are kept only as aliases if something still references them.

| Token | Value | Use |
|---|---|---|
| `--white` | `#FFFCFA` | Page background, mats, label cards |
| `--wall` | `#F8EBE7` | Blush wall bands (page title band, exhibit wall) |
| `--wall-deep` | `#F1DDD7` | Floor strip under the wall, hover fills |
| `--ink` | `#2E2423` | Body text and headings |
| `--muted` | `#7A6863` | Secondary text, captions, counters |
| `--hair` | `#E8D5CE` | Hairline rules and borders |
| `--orange` | `#E2733A` | Awards, highlights, active-nav underline, period in the logo |
| `--rose` | `#C25E77` | Accent words, eyebrow lines, links |
| `--serif` | `"Fraunces", Georgia, serif` | Titles, logo, large quotes, numbers |
| `--sans` | `"Manrope", system-ui, sans-serif` | Body, nav, labels |

- **Fonts:** load from Google Fonts in `BaseHead.astro` with Fraunces (roman only, weights 300 and 400, optical size axis) and Manrope (400–700). The Atkinson `@font-face` rules are removed.
- **No italics:** set `em, i { font-style: normal; }` globally. Accent words use `color: var(--rose)` instead.
- **Links:** `--rose`, with no underline at rest and an underline on hover. Visited links keep the same color.
- **Contrast check:** rose `#C25E77` on `#FFFCFA` and on `#F8EBE7`, and muted `#7A6863` on both, must reach at least 4.5:1. Verify during implementation and darken slightly if any pair falls short.

## 2. Shared components

**Header (`src/components/Header.astro`)**
- The logo is "Zoe Wacker" in Fraunces, followed by an orange period: `Zoe Wacker<span>.</span>`.
- The nav keeps the same eight links in Manrope: small uppercase, letter-spaced, `--muted`. The active link is `--ink` with a 2px orange underline.
- Below 860px the nav collapses behind a "Menu" button that opens a dropdown panel. It uses a small inline script with `aria-expanded`, and the links stay keyboard accessible.
- Background is `--white` with a hairline bottom border, replacing the current box-shadow.

**Footer (`src/components/Footer.astro`)**
- A `--wall` band with "© {year} Zoe Wacker · Menlo Park, California" in `--muted`.
- Delete the unused `Footer_bak.astro`.

**Page layout (`src/layouts/Page.astro`)**
- **Title band:** a full-width `--wall` band containing a small uppercase `--rose` eyebrow (the section name, derived from the URL's first path segment, e.g. "Photography") and an `h1` title in Fraunces 400 at `clamp(36px, 5vw, 60px)`.
- **Body:** the content area below sits on `--white`. Keep the existing two-column sidebar grid and its mobile collapse.
- **Sidebar:** the `.vlist` link lists become numbered lists like the mockup's section list. Each item has a small Fraunces number (`01`, `02` …) in `--muted` and the label in `--ink`, separated by hairline rules. The current page's item is marked with `--orange`.
- **Remove** the `a:visited { color: var(--accent) }` override.

**Global photo treatment (`global.css`, applies site-wide)**
- `figure > img` and `figure > video`: white mat (`--white` background, ~12px padding) with the mockup's soft warm shadow, centered, `max-width: 100%`.
- `figcaption`: a small wall-label style, in Manrope 13px `--muted`, with a short `--hair` rule above it. Left-aligned under the image, never italic.
- This is CSS-only, so every existing `<figure>` on every page picks it up without edits.

**Other layouts**
- **`FullBleed.astro` and `BlogPost.astro`:** use the same header, footer, tokens and fonts. Remove any hard-coded gray or blue.
- **`LinkList.astro` grid variant:** uses the tokens instead of `--accent` and `#6b7280`.

## 3. Homepage (`src/pages/index.astro`)

The structure follows the 3D-1a mockup:

1. **Exhibit room:** a `--wall` band.
   - Eyebrow "Gallery One · Now showing", then the headline "Little stories, found on the road", with "found" in `--rose`, upright.
   - A counter `01 / 06`.
2. **Exhibit:** one photo at a time.
   - The featured photo sits in a white mat with a deep soft shadow.
   - Beside it (below it on phones) is a wall-label card with a `--rose` top border, or `--orange` for award photos. It shows the number, title, place and year, the one-line note, and an award line in `--orange` if the photo won something.
   - Previous and next round buttons, plus Left and Right arrow keys. Dot indicators for the six photos. The photo crossfades on change and respects `prefers-reduced-motion`.
   - Without JavaScript, the first photo and label still show, and all six titles are in the HTML.
3. **Intro:** a "ZW" monogram (a Fraunces circle badge in `--wall` and `--rose`) beside Zoe's intro quote from her About page, set large in Fraunces with "tell little stories" in `--rose`. A small uppercase line below reads "Welcome to my highlight reel".
4. **Sections:** a numbered list of the seven sections (About, Travel, Photography, Music, Geography, Guardian Arts, Academics). Each row has a number, the title in Fraunces, a one-line description and a small thumbnail. The rows link to the sections.

**Exhibit data** lives in `src/data/exhibit.json`, an array of six items:

```json
{ "src": "/images/display/portfolio-64.jpg", "alt": "…", "title": "…", "place": "Aswan, Egypt", "year": 2025, "note": "…", "award": null }
```

- **Starting six:** Cinderello (award), the drum player (portfolio-64), the Day of the Dead portrait (portfolio-72), the cat on the mosque carpet (portfolio-45), the red Nubian door (portfolio-53) and the penguin pair (portfolio-21). Zoe can swap any of them.
- **Titles and notes:** drafted by Claude, plain and descriptive. Each draft note gets a `"draft": true` flag, and the homepage build prints a warning listing any remaining drafts.
- **Edit before launch:** Zoe edits titles and notes before the redesign goes live.
- **Section descriptions:** also live in this file, and Zoe edits them the same way.

## 4. Award pages (`src/pages/photography/awards/*`)

A new component, `src/components/AwardExhibit.astro`, renders the top of each award page as it appears in the mockup:

- **The hung photo:** the award photo hung large in a white mat on a `--wall` band.
- **The wall label beside it (below on phones):**
  - An `--orange` dot with the result (e.g. "Honorable Mention")
  - Title, "Zoe Wacker, {year}"
  - Then a definition list: Place, Contest, Division, Shown (each optional)
- **Props:** `image`, `alt`, `title`, `year`, `result`, `place?`, `contest?`, `division?`, `shown?`.

Each of the 8 award pages adds `<AwardExhibit …/>` at the top, using a lead image and filling the props from facts already on that page:

| Page | Lead image |
|---|---|
| Peninsula 2025 | `cinderello.jpg` |
| NPCFK Color 2025 | `npcfk-color-2025.png` |
| NPCFK Home 2025 | `npcfk-home-2025.jpg` |
| NPCFK Life in Red 2026 | `npcfk-red-2026.jpg` |
| NPCFK Shelter 2026 | `npcfk-shelter-2026.jpg` |
| No Frames 2026 | `no-frames-2026-colony-panorama.jpg` |
| TPOTY 2025 (collection award) | `tpoty2025-places-collection.png` |
| Global Peace 2026 (collection award) | `gppa-2026-1.jpg` ("La Paz") |

If the lead image already appears as a `<figure>` lower on the page, that `<figure>` is removed so it doesn't show twice. The rest of each page (her text, other figures, logos and shortlist images) is unchanged and picks up the global figure style.

The awards index page gets no component, only the shared styling.

## 5. Images

- Extend `scripts/generate-thumbnails.mjs`, or add a sibling script, to also write 1600px-wide versions of the exhibit photos to `public/images/display/`, keeping the existing 600px thumbs.
- `npm run thumbnails` regenerates both sizes.
- The homepage uses only `display/` images and thumbs, and never the originals of up to 9,504px.

## 6. Privacy

- The site shows no school name, contact form or email.
- No photo of Zoe appears in the redesign's new elements; the "ZW" monogram stands in for a portrait.
- Existing page content is not changed by this work. Any existing photos of her on other pages stay as they are.

## 7. Rollout

- All work happens on a branch `soft-blush-redesign`, not `main`. This is an exception to the usual commit-and-push-to-main habit, because the redesign is a large visual change.
- **Review loop:** run `npm run dev`, open it in Chrome, and spot-check the pages listed in the testing plan below on desktop and at phone width. Then the parent reviews.
- **Merge:** once the parent approves and Zoe has edited the exhibit captions, merge the branch to `main` and push.
- **Mockups:** `design/themes/` stays as the reference archive.

## 8. Testing and verification

- `npm run build` succeeds with no new warnings, apart from the intended draft-caption warning before Zoe's edits.
- Headless-Chrome screenshots at 1440px and 390px of these pages, compared against the 3D-1a mockup:
  - the homepage
  - About
  - the awards index
  - the Peninsula award page
  - one trip (Egypt 2025)
  - one concert (Laufey 2025)
  - the Cello page
  - the blog index
- Search for leftovers. `grep` for `#2337ff`, `--accent`, `gray-gradient` and `Atkinson` across `src/`; none should remain except deliberate aliases.
- A contrast check script confirms all token text and background pairs reach at least 4.5:1.
- Keyboard check: Tab through the header (including the mobile Menu) and use the exhibit's arrow keys.
- Content check: links in the registry still work, with no 404s in `dist/`.
