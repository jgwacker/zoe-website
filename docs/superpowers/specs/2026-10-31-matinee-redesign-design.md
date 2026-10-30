# Matinee redesign: design spec

**Date:** 2026-10-31
**Status:** Design approved in conversation (mockup iterations); awaiting written-spec review
**Reference mockup:** `design/themes/7B-5/` (homepage `index.html`, award page `award.html`)
**Replaces:** the After Dark theme (`docs/superpowers/specs/2026-10-22-after-dark-redesign-design.md`). After Dark stays archived in `design/themes/5B/`.

## Goal

Replace After Dark with **7B-5 "Matinee"**: After Dark's poster layout as a daytime matinee on warm cream, with Soft Blush's colours, a cursive (Sacramento) name and headings, a soft serif (Fraunces, soft and wonky) for the lineup and subheads, and After Dark's photo halos at about half strength.

Zoe found After Dark too loud (neon text glow, huge condensed caps) and preferred Soft Blush; the parent found Soft Blush too plain. Matinee is light and elegant but keeps some motion: halos that brighten on hover, lifts, and soft reveals.

Readers are Zoe's college counselor now and admissions officers later, so long reading must stay comfortable and pages must print cleanly.

**Success criteria:**
1. Every page uses the Matinee style. No After Dark colours, Anton, neon text-shadows or dark backgrounds remain.
2. The homepage follows the 7B-5 layout and is still generated from the link registry (new pages appear without editing the homepage).
3. Award pages keep their `AwardExhibit` hero, restyled.
4. No page content or URL changes.
5. Every text/background pair meets WCAG AA (4.5:1 for body text, 3:1 for text 24px and up). Layouts work at 360–390px with no horizontal scroll. "Zoe Wacker" and the homepage section headings stay on one line at every width.
6. Printing gives dark text on white.
7. All motion switches off under `prefers-reduced-motion`, and the page is fully visible without JavaScript.

**Non-goals:** new index pages, content rewrites, URL changes, restyling the unused starter blog beyond shared styles.

## 1. Design tokens (`src/styles/global.css`)

These replace the After Dark tokens; old names are not kept.

| Token | Value | Use |
|---|---|---|
| `--cream` | `#FBF3EA` | Page background |
| `--blush` | `#F8EBE7` | Panels, title band tint |
| `--paper` | `#FFFBF6` | Cards, stubs, menu panel |
| `--ink` | `#2A1E1E` | Body text, lineup row 2 |
| `--muted` | `#6F675F` | Secondary text, captions (5.0:1 on cream) |
| `--deep-rose` | `#87314D` | Cursive name and headings, logo (7.4:1) |
| `--orange` | `#D2652C` | Large display text only, ≥24px (3.4:1); halos, rules, dots |
| `--rose` | `#C25E77` | Large display text only, ≥24px (3.7:1); halos |
| `--gold` | `#A87A1C` | Large display text only, ≥24px (3.5:1); diamonds, halos |
| `--orange-text` | `#9C4A1C` | Links and small orange text (5.6:1 cream, 5.3:1 blush) |
| `--rose-text` | `#A84862` | Small rose text, kickers (5.1:1 cream, 4.8:1 blush) |
| `--gold-text` | `#8E6210` | Small gold text, years (4.9:1 cream, 4.6:1 blush) |
| `--hair` | `rgba(42,30,30,.14)` | Hairline rules |
| `--script` | `"Sacramento", cursive` | The name, page titles, homepage section headings |
| `--serif` | `"Fraunces", Georgia, serif` with `font-variation-settings: "opsz" 144, "SOFT" 100, "WONK" 1` | Lineup, subheads, card titles |
| `--sans` | `"DM Sans", system-ui, sans-serif` | Body |
| `--mono` | `"DM Mono", ui-monospace, monospace` | Small uppercase labels |
| `--page-max` | `1240px` | Content width |

The halo colours are RGB triplets for `rgba()`: `--h-orange: 226,115,58`, `--h-rose: 194,94,119`, `--h-gold: 201,138,30` (the mockup's original, brighter hues, which are decoration, not text).

- **Background:** `body` is `--cream` with two faint fixed radial washes (apricot top-right, blush bottom-left) as in the mockup.
- **Fonts (`BaseHead.astro`):** Sacramento 400; Fraunces with axes `opsz,wght,SOFT,WONK` (weights 400–600); DM Sans 400/500/700; DM Mono 400/500. Remove Anton.
- **Sacramento weight:** it ships one thin weight. Script text gets `-webkit-text-stroke: .011em currentColor; paint-order: stroke fill` to read as a regular pen line.
- **No italics:** keep `em, i { font-style: normal; }`; accent words use colour.
- **Reading comfort:** body text ink, 18px, line-height 1.7 (17px under 560px); `.content p, li, blockquote` capped at 68ch. In-content `h2`–`h4` are Fraunces (soft) 500 in ink, not script, so long content stays readable.
- **Links:** `--orange-text`, no underline at rest, underline on hover; visited the same; focus is a 2px `--deep-rose` outline.
- **Print:** white background, `#2A1E1E` text, no halos or shadows, no text stroke, links dark rose, header nav and footer hidden, images kept.

## 2. Shared components

**Header (`Header.astro`):** sticky, `rgba(251,243,234,.88)` with `backdrop-filter: blur(10px)` and a `--hair` bottom border, 64px tall. Logo "Zoe Wacker" in Fraunces (soft) 600, 22px, `--deep-rose`, with the period in `--orange`. Nav: the same eight links, DM Sans 15px, `--muted`; the current link is ink with a 2px `--orange` inset underline. Under 900px the existing Menu toggle stays (`data-header`, `data-menu-toggle`, `#site-nav`, `aria-expanded`); its panel is `--paper` with links in Fraunces 24px.

**Page layout (`Page.astro`) title band:**
- A mono kicker in `--rose-text` with a small gold diamond, showing the section name (`sectionLabel()` as today).
- The `h1` in `--script`, `--deep-rose`, `clamp(52px, 8vw, 112px)`, line-height 1.05, `text-wrap: balance`.
- Titles longer than 40 characters get `long-title`: set in `--serif` 500 at `clamp(32px, 4.4vw, 56px)` in `--deep-rose`, because long script titles are hard to read.
- A `--hair` bottom border. Slots (`hero`, sidebar, `no-sidebar`) and the grid collapse under 900px stay as they are.

**Sidebar (`LinkList.astro`, vertical):** numbered `01`, `02`… in Fraunces 20px `--rose-text`, then the label in DM Sans 600 ink; `--hair` rules between items; hover fills with a blush gradient and lifts the label 2px; the current page (`aria-current="page"`) is `--deep-rose`. The grid variant uses the tokens.

**Photos (global CSS):**
- `figure > img`, `figure > video`: radius 8px, `display:block; max-width:100%; margin:0 auto`.
- **Halos:** an all-round soft glow cycling orange, rose and gold by `figure:nth-of-type(3n+1/2/3)`:
  `0 0 0 1px rgba(h,.16), 0 18px 46px -16px rgba(h,.40), 0 0 80px -24px rgba(h,.34)`.
  On hover it brightens to `rgba(h,.30) / .58 / .48` with `-12px / 120px` spreads, over 0.5s. Linked figures also scale the image to 1.02.
- `figcaption`: `--mono` 12px uppercase, letter-spacing .12em, `--muted`.

**Footer (`Footer.astro`):** `--hair` top border; a large faint "Zoe Wacker" in `--script` at `clamp(44px,7vw,96px)` and `rgba(42,30,30,.12)`, `aria-hidden`; a mono line in `--muted`: "Menlo Park, California · © {year}".

**Motion (site-wide):** hover lifts of 2–4px on cards and stubs; halo brightening; soft reveal (fade and 12px rise) of `.reveal` elements via a small inline IntersectionObserver in `BaseHead.astro` that adds `.in`. Reveal only applies when the script has added `js` to `<html>`, so content is visible without JavaScript. All of it is off under `prefers-reduced-motion`.

**Other layouts:** `FullBleed.astro`, `BlogPost.astro`, the blog index and the portfolio and series pages use the tokens. No hard-coded After Dark colours remain.

## 3. Homepage (`src/pages/index.astro`, on `FullBleed`)

Same data sources as today (`registry.ts`, `registry-meta.mjs`, `exhibit.json`), in the 7B-5 order:

1. **Poster:** mono line "Menlo Park, CA **presents** the {seasonLabel} season" (`--rose-text`, "presents" in ink) over a thin gold rule with a diamond; `h1` "Zoe Wacker." in `--script` `--deep-rose`, `clamp(44px, 15.5vw, 236px)`, `white-space: nowrap`, the period in `--orange`; the tagline in `--muted` with the accent in `--rose-text`; **the bill** between double hairlines:
   - row 1, `--orange`, Fraunces 500: Photography · Travel · Music
   - row 2, ink, Fraunces 400: Geography · Guardian Arts · Academics
   - row 3, `--rose`, Fraunces small caps: About Zoe · Awards · Concerts
   - gold diamond separators; on hover a radial halo blooms behind the word **in the word's own colour** (row 2 turns `--rose` with a rose halo); no text glow
   - mono line "On location in {5 latest trips}".
2. **Ticket stubs (new):** "Now showing · recent dates": four `--paper` stubs with a coloured left edge and a perforated tear-off showing "No. 01–04": the two newest awards, the newest trip and the newest concert, from the registry (kind, year, name, note). Hover lifts and adds a rose halo.
3. **Photo strip:** the first three `exhibit.json` items with halos (orange, rose, gold) and mono captions (title, place); linked when they have an `href`. Layout as today (1.25fr/.8fr/1fr; two columns under 900px).
4. **Awards:** kicker, `h2` "Photo awards {season}" in `--script`; the featured award card (image with orange halo, label, note, "Read the story →"); the programme: every award numbered I, II, III… in Fraunces `--gold-text` (as in the mockup), with name, note and year.
5. **Travel dates:** kicker, `h2` "Travel dates"; rows from `latest(travelTrips, 5)` with year (Fraunces `--gold-text`), place (Fraunces ink), stops (`--muted`), thumbnail with rose halo; "All trips →".
6. **Music:** a blush panel with Zoe's concert quote in Fraunces (accent `--rose-text`), "From the crowd" list from `latest(musicConcerts, 6)`, and the "On stage · Cello" card for `celloPerformances[0]`.
7. **About:** `h2` "Hi! I'm Zoe." in script; the first About paragraph; interest chips. The round image is a **"ZW" monogram in `--script`** on `--paper` with a gold halo, not a photo of Zoe (privacy, as in After Dark).

Section `h2`s on the homepage are script, `clamp(28px, 8.4vw, 58px)` under 700px and `clamp(44px, 5.2vw, 80px)` above, `white-space: nowrap`.

The `npm run thumbnails` / `displayPath` flow and the draft-caption warning stay. A new pure helper in `registry-meta.mjs`, `recentStubs({ awards, trips, concerts })`, returns the four stub entries (kind, year, name, note, href, colour) for testing.

## 4. Award pages (`AwardExhibit.astro`)

Props unchanged. The photo, large, with a rose halo that brightens on hover; beside it a `--paper` card with a `--hair` border and a 3px `--orange` top rule: a gold dot and the result in mono `--gold-text`; the title in Fraunces 500 ink; "Zoe Wacker, {year}" in `--muted`; a `<dl>` with mono `dt`s in `--muted` and DM Sans `dd`s in ink. Stacks under 900px. No changes to the award pages themselves.

## 5. Privacy

Unchanged: no school name, contact form, email or photo of Zoe in any new element. The mockup's `home/about.jpg` is replaced by the ZW monogram.

## 6. Testing (`npm test`)

**Updated:**
- `tokens.test.mjs`: the new token values; Sacramento, Fraunces (with SOFT and WONK axes), DM Sans and DM Mono load, Anton doesn't. Contrast: ink, `--muted`, `--deep-rose`, `--orange-text`, `--rose-text`, `--gold-text` ≥ 4.5:1 on `--cream`, `--blush` and `--paper`; `--orange`, `--rose`, `--gold` ≥ 3:1 on `--cream` and `--blush`.
- `leftovers.test.mjs`: `src/` has no `Anton`, `--night`, `--neon`, `--glow-coral`, `#1E1424` or `#FF6F59`.
- `home.test.mjs`: the script h1, the bill links, the four stubs in order (award, award, trip, concert), all award links, 5 trip links, 6 concert links, the cello link, the ZW monogram, no photo of Zoe, the season label.
- `registry-meta.test.mjs`: `recentStubs` picks the right four entries and handles a missing concert.

**Kept with values updated:** `header`, `nav`, `layout`, `awards`, `sweep`, `review-fixes`, `series`, `gallery-awards`.

**New browser checks:** no horizontal scroll at 360px and 390px on the homepage, About, the Shelter award page, Egypt 2025 and CTY 2026; the homepage h1 and section h2s are one line at 360, 390, 768 and 1440px; long titles use the serif and don't overflow; print gives a white background and dark text; with JavaScript disabled, every `.reveal` element is visible; under reduced motion, no transitions run.

## 7. Rollout

- **Branch:** `matinee-redesign`, pushed as work lands.
- **Review:** in Safari on desktop and at phone width, for the parent and Zoe.
- **Merge:** a PR the parent merges (one production deploy, 15 credits).
- **Docs:** update the `CLAUDE.md` Theme section; mark 7B-5 live in `design/themes/README.md`.
