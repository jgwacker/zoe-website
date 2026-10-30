# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Zoe Wacker built with Astro. Showcases travel, photography, music, academics, and other interests.

## Commands

- `npm run dev` - Start dev server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Preview production build
- `npm run thumbnails` - Regenerate portfolio thumbnails (run after adding new portfolio images)

### Deploys

Netlify deploys `main` on every push, and each production deploy costs 15 credits (Personal plan: 1,000/month). `netlify.toml` skips the build when a push changes nothing under `src`, `public`, `data` or the build config, so commits touching only tests, docs, design or scripts are free. Batch site changes into fewer pushes.

## Architecture

### Path Aliases

Use these import aliases (defined in astro.config.mjs):
- `@layouts` → `src/layouts/`
- `@components` → `src/components/`
- `@links` → `src/links/`

### Page Structure

Most pages use the `Page.astro` layout with an optional sidebar:

```astro
---
import Layout from '@layouts/Page.astro';
import LinkList from '@components/LinkList.astro';
import { someLinks } from '@links/registry';
---

<Layout title="Page Title">
  <LinkList slot="sidebar" items={someLinks} orientation="vertical" />

  <!-- Page content here -->
</Layout>
```

### Link Registry

`src/links/registry.ts` is the central navigation registry. When adding new pages, add corresponding entries here. Exports include:
- `sections` - Top-level nav sections
- `travelTrips`, `photographyAwards`, `musicConcerts`, etc. - Section-specific link arrays

### Image Organization

Static images go in `public/images/` organized by section:
- `concerts/` - Concert photos
- `photography_awards/` - Award badges and competition images
- `portfolio/` - Photography portfolio
- `trips/` - Travel photos
- `home/` - Homepage tiles

Reference images in pages as `/images/section/filename.jpg`.

### Layouts

- `Page.astro` - Standard layout: dark poster title band (section kicker + neon title), optional full-width `hero` slot, then sidebar set list + content (collapses on mobile)
- `FullBleed.astro` - Full-width layout without sidebar (used for homepage)
- `BlogPost.astro` - Blog post layout with date/metadata

### Theme (Matinee)

- Light cream "matinee poster" look from mockup `design/themes/7B-5`. Colors and fonts are CSS variables in `src/styles/global.css`: `--cream`, `--blush`, `--paper` backgrounds; `--ink` text; `--deep-rose` for the cursive name and titles; `--orange`, `--rose`, `--gold` only for text 24px and up or decoration, with `--orange-text`, `--rose-text`, `--gold-text` for small text (all pass WCAG AA). Fonts: Sacramento (`.script` class), Fraunces soft & wonky (`--serif` with `font-variation-settings: var(--soft)`), DM Sans, DM Mono. No italics anywhere. Printing switches to dark text on white.
- Page titles are cursive; titles over 40 characters switch to the serif. In-page headings are serif.
- Every `<figure>` image automatically gets rounded corners and a soft halo cycling orange/rose/gold that brightens on hover, with a mono `<figcaption>`. No per-page styling is needed.
- Add `class="reveal"` to fade an element in on scroll. It's visible without JavaScript and under reduced motion.
- Award pages put `<AwardExhibit slot="hero" … />` (in `src/components/`) at the top.
- The homepage is generated from `src/links/registry.ts`: the ticket stubs (two newest awards, newest trip, newest concert), awards (with `note`, and one `featured: true` with an `image`), the five newest trips (`note` = stops, `image` = thumbnail), the six newest concerts and the newest cello performance. Add new entries at the top of each list. After adding an `image`, run `npm run thumbnails`.
- The three strip photos are the first three items in `src/data/exhibit.json`. Entries with `"draft": true` are placeholder captions for Zoe to rewrite, and the build prints a warning until they're gone.
- `npm test` builds the site and runs the checks in `tests/`. They need Google Chrome installed.

### Design Themes

`design/themes/` archives static HTML mockups of candidate site redesigns (warm pink/orange directions), with a README summarizing each. They are not part of the Astro build or deployment. Open `design/themes/index.html` to browse them. 7B-5 (Matinee) is the live theme; 5B (After Dark) and 3D-1a (Soft Blush) were live before it.
