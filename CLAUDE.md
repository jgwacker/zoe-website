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

- `Page.astro` - Standard layout: blush title band (section eyebrow + title), optional full-width `hero` slot, then sidebar + content (collapses on mobile)
- `FullBleed.astro` - Full-width layout without sidebar (used for homepage)
- `BlogPost.astro` - Blog post layout with date/metadata

### Theme (Soft Blush)

- Colors and fonts are CSS variables in `src/styles/global.css` (`--wall`, `--ink`, `--rose-text`, `--orange-text`, `--serif` = Fraunces, `--sans` = Manrope). No italics anywhere.
- Every `<figure>` image is automatically shown in a white mat with a wall-label `<figcaption>`. No per-page styling is needed.
- Award pages put `<AwardExhibit slot="hero" … />` (in `src/components/`) at the top.
- Homepage exhibit photos and section blurbs live in `src/data/exhibit.json`. After changing photos there, run `npm run thumbnails`. Entries with `"draft": true` are placeholder captions for Zoe to rewrite, and the build prints a warning until they're gone.
- `npm test` builds the site and runs the checks in `tests/`. They need Google Chrome installed.

### Design Themes

`design/themes/` archives static HTML mockups of seven candidate site redesigns (warm pink/orange directions), with a README summarizing each. They are not part of the Astro build or deployment. Open `design/themes/index.html` to browse them.
