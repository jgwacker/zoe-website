# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Zoe Wacker built with Astro. Showcases travel, photography, music, academics, and other interests.

## Commands

- `npm run dev` - Start dev server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Preview production build
- `npm run thumbnails` - Regenerate portfolio thumbnails (run after adding new portfolio images)

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

### Theme (After Dark)

- Dark "lineup poster" look from mockup `design/themes/5B`. Colors and fonts are CSS variables in `src/styles/global.css` (`--night`, `--cream`, `--mist`, `--coral`, `--rose`, `--marigold`, `--display` = Anton, `--sans` = DM Sans, `--mono` = DM Mono). No italics anywhere. Printing switches to dark text on white.
- Every `<figure>` image automatically gets rounded corners and a coral/rose/marigold glow, with a mono `<figcaption>`. No per-page styling is needed.
- Award pages put `<AwardExhibit slot="hero" … />` (in `src/components/`) at the top.
- The homepage poster is generated from `src/links/registry.ts`: awards (with `note`, and one `featured: true` with an `image`), the five newest trips (`note` = stops, `image` = thumbnail), the six newest concerts and the newest cello performance. Add new entries at the top of each list. After adding an `image`, run `npm run thumbnails`.
- The three glow-strip photos are the first three items in `src/data/exhibit.json`. Entries with `"draft": true` are placeholder captions for Zoe to rewrite, and the build prints a warning until they're gone.
- `npm test` builds the site and runs the checks in `tests/`. They need Google Chrome installed.

### Design Themes

`design/themes/` archives static HTML mockups of candidate site redesigns (warm pink/orange directions), with a README summarizing each. They are not part of the Astro build or deployment. Open `design/themes/index.html` to browse them. 5B (After Dark) is the live theme; 3D-1a (Soft Blush) was live before it.
