# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: Zoe's high-school college counselor.** They will read the site over the next one to two years to get to know Zoe before writing her school recommendation. They need personality, anecdotes, growth over time and what she cares about, not only a list of achievements. Personal and fun pages (concerts, travel, favorite albums) matter to this reader as much as awards. When audiences conflict, this reader wins. (Confirmed 2026-11-06.)

**Long-term: college admissions readers, around 2029–2030.** They skim for dated, specific, verifiable records: awards with official links, roles, hours, outcomes. Content is being built up now so it exists by then.

**Author: Zoe Wacker**, a middle schooler in Menlo Park, CA (8th grade in 2026). She writes in her own voice. Her parent maintains the codebase and deploys.

## Product Purpose

A personal portfolio and journal that records what Zoe is working on, has made, and has tried: travel, photography, music (cello, concerts, favorite albums), academics, geography, and Guardian Arts (martial arts). Her own description: "my highlight reel of experiments, adventures, and 'aha!' moments."

Success means a reader who did not know Zoe comes away with a clear sense of who she is, what she cares about, and how she has grown, and can verify the factual claims through the linked sources.

## Positioning

A dated, first-person, verifiable record of a specific person over several years. Each page carries a date, Zoe's own words, and where applicable a link to the official source (contest results, program pages). A résumé or a social feed cannot truthfully offer that combination of continuity, voice and provenance.

## Operating Context

- Static Astro 5 site deployed by Netlify from `main` on every push. Each production deploy costs 15 credits of a 1,000-credit monthly plan, so site changes are batched into fewer pushes and `netlify.toml` skips builds that touch nothing under `src`, `public`, `data` or the build config.
- Content is Astro pages under `src/pages/`, organized by section. Navigation and the generated homepage are driven by `src/links/registry.ts`; new entries go at the top of each list. Homepage strip photos come from `src/data/exhibit.json`.
- Portfolio thumbnails are regenerated with `npm run thumbnails` after adding images.
- `npm test` builds the site and runs browser checks in `tests/` (needs Google Chrome). Checks cover phone widths, no-JS rendering, reduced motion, and screen contrast.
- Readers arrive by direct link, most likely on a laptop or phone.

## Capabilities and Constraints

- **Sections live today:** Travel (10 trips, 2019–2026), Photography (awards, portfolio, series, overview gallery), Music (cello, concerts, favorites), Academics (summer programs, school years), About, Blog, RSS. Geography and Guardian Arts have index pages but their link lists in the registry are still empty placeholders.
- **Dated records.** Every trip, concert, award and program page is tied to a year. Pages should capture date, role, time commitment and outcomes, and link to official sources.
- **Own voice.** Pages are written in Zoe's voice. Any caption or blurb drafted for her is marked `"draft": true` in `src/data/exhibit.json` and the build warns until she rewrites it. Factual copy must not be replaced or claims added without asking.
- **Local place names.** Use the local name over the English translation (for example "Gozor Awad", not "Awad Island").
- **Privacy rules (confirmed 2026-11-06).** Every page must respect:
  - No school name, teacher names or classmate names.
  - No home address or precise locations. City level ("Menlo Park, CA") is the limit.
  - No birthdate or exact age. Grade level and year are fine.
- **No italics anywhere** on the site. This is a standing decision by Zoe, not a visual preference open for revision.
- **Printing** switches to dark text on white.
- **Undecided:** what the Geography and Guardian Arts sections will contain beyond their current intro pages.

## Brand Commitments

- Name: "Zoe Wacker", set as a cursive wordmark on the homepage and in page titles.
- Voice: first person, casual, curious, specific. Tagline: "Photographer, cellist, map nerd."
- The site should not feel juvenile or bubblegum. Zoe likes pink and orange, and the parent found the stock Astro theme "too cold."
- The live theme is "Matinee" (mockup `design/themes/7B-5`), documented in `CLAUDE.md` and `src/styles/global.css`. Earlier themes 5B After Dark and 3D-1a Soft Blush were live before it; rejected directions are listed in `design/themes/README.md` and should not be regenerated.
- Domain: zoewacker.com (confirmed 2026-11-06). `astro.config.mjs` still lists `https://example.com` as the site URL and needs updating for the sitemap and RSS.

## Evidence on Hand

- Photography awards, 2025–2026, nine entries in `src/links/registry.ts` with per-award pages under `src/pages/photography/awards/`, each with the contest's official placement (for example Runner-Up, Young TPOTY 14 & under, 2025; Winner, National Photography Competition for Kids, December 2025 and March 2026; Honorable Mention, Peninsula Photo Competition 2025). Award badges and competition images in `public/images/photography_awards/`.
- Photography portfolio in `public/images/portfolio/` with captions and metadata in `src/data/exhibit.json`.
- Trip photos in `public/images/trips/`, concert photos in `public/images/concerts/`.
- Summer programs: Johns Hopkins Center for Talented Youth 2025 and 2026, Mountain Camp 2021–2024.
- Cello: orchestra performance at Disneyland, May 2026, with a studio recording session.
- Guardian Arts: training since late 2017, with two videos of a visiting Brazilian jiu-jitsu fighter on the page.
- Absences future work must not fabricate: no testimonials, no press, no metrics, no quotes from teachers or coaches. The About page hero still uses the Astro starter placeholder image.

## Product Principles

1. **Record, don't market.** Dates, roles, outcomes and links to official sources beat polish. A page without a date or a source is incomplete.
2. **Zoe's voice or nothing.** Drafts written for her are flagged and never silently shipped as hers.
3. **The counselor is the reader.** Personality, anecdotes and growth over time are first-class content, not filler around the awards.
4. **Privacy by default.** City-level location, grade level not age, no school or teacher names.
5. **Cheap to maintain.** Adding a trip, award or concert is a registry entry plus a page; the homepage regenerates itself. Deploys are batched.

## Accessibility & Inclusion

Small text must pass WCAG AA contrast on the cream and dark backgrounds; the theme defines `--orange-text`, `--rose-text` and `--gold-text` for that purpose, and `tests/` checks contrast in the browser. Pages must render and read correctly without JavaScript and under reduced motion.
