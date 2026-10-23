# After Dark redesign: design spec

**Date:** 2026-10-22
**Status:** Design approved in conversation; awaiting written-spec review
**Reference mockup:** `design/themes/5B/` (homepage `index.html`, award page `award.html`)
**Replaces:** the Soft Blush theme (`docs/superpowers/specs/2026-10-18-soft-blush-redesign-design.md`). Soft Blush stays archived in `design/themes/3D-1a/`.

## Goal

Replace the Soft Blush theme with the **5B "After Dark"** look: a concert lineup poster on aubergine, with neon coral, rose and marigold. It applies site-wide and consistently, and is dark on every page. The parent made this call.

The site's readers are Zoe's college counselor now, who needs to get to know her, and admissions officers later. So the dark theme must stay comfortable for long reading and must print cleanly.

**Success criteria:**
1. Every page uses the After Dark style, and no Soft Blush colors or fonts remain.
2. The homepage is the 5B poster. Its awards, trips, concerts and cello sections are generated from the link registry, so new pages appear without editing the homepage.
3. Award pages keep their `AwardExhibit` hero, restyled.
4. No page content or URL changes. Existing pages need no edits apart from the registry metadata in §3.
5. Every text/background pair meets WCAG AA contrast (4.5:1). Layouts work at 390px phone width with no horizontal page scroll.
6. Printing any page gives dark text on white.

**Non-goals:**
- Bespoke index pages for Awards, Travel or Concerts (left for a possible phase 2).
- Rewriting page content.
- Changing URLs.
- Redesigning the unused starter blog content beyond shared styling.

## 1. Design tokens (`src/styles/global.css`)

These replace the Soft Blush tokens. Old token names are not kept.

| Token | Value | Use |
|---|---|---|
| `--night` | `#1E1424` | Page background |
| `--night-2` | `#2A1C33` | Cards, menu panel |
| `--night-3` | `#362541` | Hover fills, chips |
| `--cream` | `#FBEFE3` | Body text, headings |
| `--mist` | `#C9B6C9` | Secondary text, captions, nav links |
| `--coral` | `#FF6F59` | Links, active nav underline, logo period, kicker lines, buttons |
| `--rose` | `#FF4F8B` | Set-list numbers, accent words |
| `--marigold` | `#FFB13B` | Years, award results, highlights |
| `--line` | `rgba(251,239,227,.14)` | Hairline rules |
| `--display` | `"Anton", Impact, sans-serif` | Titles, headings, numbers (uppercase) |
| `--sans` | `"DM Sans", system-ui, sans-serif` | Body |
| `--mono` | `"DM Mono", ui-monospace, monospace` | Small uppercase labels (kickers, years, places, captions) |
| `--page-max` | `1240px` | Content width |

- **Background:** `body` is `--night`, with three fixed radial glows taken from the mockup: rose at top-left, coral at top-right and marigold at the bottom.
- **Fonts:** load from Google Fonts in `BaseHead.astro`:
  - Anton 400
  - DM Sans (optical size 9–40, weights 400/500/700)
  - DM Mono 400/500
  
  Remove Fraunces and Manrope.
- **No italics:** keep `em, i { font-style: normal; }`. Accent words use color instead.
- **Reading comfort:**
  - Body text is cream at 18px with line-height 1.7 (17px under 560px).
  - `.content p`, `li` and `blockquote` are capped at `68ch`.
  - Headings `h2`–`h4` inside content are uppercase Anton in cream.
- **Links:**
  - Coral, no underline at rest, underline on hover.
  - Visited links stay the same color.
  - Focus is shown with a 2px marigold outline.
- **Print:** `@media print` sets:
  - white background and `#1E1424` text
  - no glows, shadows or text-shadows
  - links in dark plum
  - header nav and footer hidden
  - images kept

## 2. Shared components

**Header (`Header.astro`)**
- Sticky, with background `rgba(30,20,36,.82)` and `backdrop-filter: blur(10px)` over a `--line` bottom border, at 64px tall.
- **Logo:** `ZOE<span>.</span>W` in Anton 22px, with the period in coral.
- **Nav:** the same eight links, in DM Sans 14px/500 and `--mist`. The current link is cream with a 2px coral inset underline.
- **Under 900px:** the existing Menu toggle stays (`data-header`, `data-menu-toggle`, `#site-nav`, `aria-expanded`). Its dropdown panel is `--night-2`, with links in Anton 28px uppercase.

**Page layout (`Page.astro`)**
- **Title band:**
  - A DM Mono kicker in coral, preceded by a 28px coral line with a glow, showing the section name. It comes from `sectionLabel()` as today.
  - Below it, an `h1` in uppercase Anton, cream, with a neon text-shadow (`0 0 28px rgba(255,111,89,.55), 0 0 80px rgba(255,79,139,.35)`).
  - **Size:** `clamp(44px, 7vw, 104px)`, line-height .92 and `text-wrap: balance`. Titles longer than 40 characters get a `long-title` class, which sets `clamp(34px, 4.6vw, 64px)`.
  - The band has a `--line` bottom border.
- **Slots and grid:** the `hero` slot, the sidebar slot and the `no-sidebar` behavior stay as they are. The two-column grid collapses under 900px, as now.

**Sidebar set list (`LinkList.astro`, vertical)**
- Items are numbered `01`, `02` … in Anton 22px rose, followed by the label in DM Sans 600 cream.
- `--line` rules separate items, and hover fills with `linear-gradient(90deg, rgba(255,79,139,.10), transparent)`.
- The current page (`aria-current="page"`) shows its label in coral.
- The grid variant uses the tokens.

**Photos (global CSS, CSS-only)**
- `figure > img` and `figure > video` get:
  - border-radius 6px
  - `display:block; max-width:100%; margin:0 auto`
  - a glow box-shadow that cycles coral, rose and marigold by `figure:nth-of-type(3n+1/2/3)`, using the mockup's `.g-coral/.g-rose/.g-gold` shadows
- `figcaption` uses `--mono` at 12px, uppercase, letter-spacing .12em, in `--mist`, with a 14px top margin.
- The portfolio slideshow image uses the same radius and glow, not a white mat.

**Footer (`Footer.astro`)**
- A `--line` top border.
- A large outlined "ZOE WACKER": Anton `clamp(44px,7vw,96px)` with transparent fill and `-webkit-text-stroke: 1px rgba(251,239,227,.35)`.
- A mono line in `--mist`: "Menlo Park, California · © {year}".
- The text is `aria-hidden` decoration, plus a visually readable mono line.

**Other layouts:** `FullBleed.astro`, `BlogPost.astro`, the blog index and the portfolio page use the same tokens. Hard-coded Soft Blush colors are removed.

## 3. Registry metadata (`src/links/registry.ts`)

Link entries gain optional fields:

```ts
type LinkItem = { href: string; label: string; note?: string; image?: string; featured?: boolean };
```

- **`note`:**
  - For awards, the one-line result, e.g. "Honorable Mention, Youth "Moments" — "Cinderello"".
  - For trips, the stops, e.g. "Cairo · Giza · Aswan · Kom Ombo · Nubia".
  - For cello, the one-line description.
- **`image`:** the thumbnail path, for trips and the featured award.
- **`featured`:** marks the one award shown as the homepage card. If none is marked, the first award is used.

Existing entries are filled in using facts already on each page. Entries without a `note` show only their label. The sidebar `LinkList` ignores the new fields.

Year and place come from the label in `src/lib/registry-meta.mjs`, with pure functions so they can be tested:
- `splitYear(label)` returns `{ name, year }`, using the last 4-digit year in the label. `year` is `null` if there isn't one.
- `latest(items, n)` returns the first `n` entries. The registry is already newest-first.
- `featuredAward(items)` returns the entry with `featured`, or else the first entry.
- `seasonLabel(date)` returns `"2026–27"` for dates from August onward and `"2025–26"` for dates before August.

## 4. Homepage (`src/pages/index.astro`, on `FullBleed`)

The sections, in order:

1. **Poster:**
   - A mono marigold line: "Menlo Park, CA **presents** the {seasonLabel(build date)} season".
   - `h1` "ZOE WACKER" in Anton `clamp(76px, 15.5vw, 224px)` with the neon glow.
   - The tagline: "A highlight reel of experiments, adventures and **"aha!" moments.**", with the accent in coral. These are Zoe's About-page words.
   - **The bill,** in three rows of section links, with glowing diamond separators:
     - Row 1, coral: Photography · Travel · Music
     - Row 2, cream: Geography · Guardian Arts · Academics
     - Row 3, rose: About · Awards (`/photography/awards`) · Concerts (`/music/concerts`)
   - A mono line: "On location in {names of the 5 latest trips}".
2. **Glow strip:**
   - The first three `exhibit.json` items, each as a figure with a glow, image, title and place. Clicking one goes to its `href` if it has one.
   - The layout is 1.25fr/.8fr/1fr. Under 900px it is two columns with the first spanning both.
3. **Awards:**
   - Kicker "The set list", then `h2` "Photo awards".
   - A featured card from `featuredAward(photographyAwards)`: its image with a glow, its label, its note and a coral "Read the story →" pill.
   - A numbered set list of every award, showing the name, the note and the year in marigold.
4. **Travel:**
   - Kicker "World tour", then `h2` "Travel dates".
   - Rows from `latest(travelTrips, 5)`, each with the year (Anton marigold), the place (Anton uppercase), stops from the note in mist, and a thumbnail from the image.
   - An "All trips →" link to `/travel`. Thumbnails are hidden under 900px.
5. **Music:**
   - Kicker "Music", then a blockquote of Zoe's line from the Music page: "Concerts are my favorite because you don't just hear the music — **you feel it in your chest.**", with the accent in rose.
   - **"From the crowd":** the list from `latest(musicConcerts, 6)`, with name and year. It shows two columns, or one under 560px.
   - **An "On stage · Cello" box** in marigold for `celloPerformances[0]`, showing its label and note and linking to it.
6. **Meet the headliner:**
   - A ZW monogram: a 240px Anton circle badge in `--night-2` with a coral glow, and no photo of Zoe.
   - Kicker "Meet the headliner", then `h2` "Hi! I'm Zoe."
   - The first paragraph of her About page.
   - Interest chips: Geography, Travel, Cello, Parkour, Mixed martial arts, History, Photos that tell little stories.

**Data changes:**
- Remove `Exhibit.astro` and the `sections` array in `exhibit.json`.
- Keep `items` and their `draft` flags. The build still warns about remaining draft captions on the three photos shown.
- `exhibit.mjs` helpers that are no longer needed are removed. The `displayPath`/`npm run thumbnails` flow stays for the glow strip images.

## 5. Award pages (`AwardExhibit.astro`)

- The props don't change: `image, alt, title, year, result, place?, contest?, division?, shown?`.
- **Layout:**
  - On the left, the photo, large, with the rose glow.
  - On the right, a `--night-2` card with a `--line` border:
    - a marigold glowing dot, then the result in mono marigold
    - the title in Anton uppercase
    - "Zoe Wacker, {year}" in mist
    - a `<dl>` of Place, Contest, Division and Shown, with mono `dt`s in mist and DM Sans `dd`s in cream
  - Under 900px the card stacks below the photo.
- **No changes needed** to the eight award pages.

## 6. Privacy

- **Unchanged from Soft Blush:** no school name, contact form or email in any new element.
- The mockup's photo of Zoe in "Meet the headliner" is replaced by the ZW monogram.

## 7. Testing (`npm test`: build plus `node:test` and Playwright with local Chrome)

**Updated tests:**
- **`tokens.test.mjs`:** checks the new token values, and that Anton, DM Sans and DM Mono load and Fraunces and Manrope don't. Contrast is at least 4.5:1 for:
  - cream, mist, coral, rose and marigold on `--night` and `--night-2`
  - `--night` on coral, for the button
- **`leftovers.test.mjs`:** `src/` has no `Fraunces`, `Manrope`, `#F8EBE7`, `--wall`, `--rose-text`, `--orange-text` or `Exhibit.astro` import.
- **`home.test.mjs`** checks:
  - the poster h1
  - all 8 award links
  - the 5 newest trip links in order
  - 6 concert links
  - the cello link
  - the ZW monogram
  - no `<img>` whose src is in a list of photos of Zoe (`home/about.jpg` and `photography_awards/650_award_2025.jpg`)
  - the season label format
- **`registry-meta.test.mjs`** (new), with unit tests:
  - `splitYear` on "Egypt 2025", "Re:Set 2023", "The Shelter: … June 2026" and "Favorites" (null year)
  - `latest`
  - `featuredAward` with and without a flag
  - `seasonLabel` on 2026-07-31 → "2025–26" and 2026-08-01 → "2026–27"
- **Registry propagation:** the homepage renders whatever the registry gives it. This is checked by a unit-level render of the list helpers with an extra fake entry, not by editing the real registry.

**Kept as they are, with expected values updated:** `header`, `nav`, `layout` (sidebar and no-sidebar alignment), `awards`, `sweep` (no broken links; known-broken list unchanged) and `review-fixes`. The exhibit-specific tests are removed.

**New checks:**
- 390px width with no horizontal scroll on the homepage, About, the Shelter award page (the longest title), Egypt 2025 and CTY 2026.
- The long-title h1 doesn't overflow its box.
- `page.emulateMedia({ media: 'print' })` gives a white body background and dark body text.

## 8. Rollout

- **Branch:** `after-dark-redesign`, pushed as work lands.
- **Review:** open in Safari, on desktop and at phone width, for the parent.
- **Merge:** open a PR and the parent merges it.
- **Docs:** update the `CLAUDE.md` "Theme" section, and add a 5B note to `design/themes/README.md` saying it is now live.
