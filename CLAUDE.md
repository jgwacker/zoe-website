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

- `Page.astro` - Standard two-column layout with sidebar (collapses on mobile)
- `FullBleed.astro` - Full-width layout without sidebar (used for homepage)
- `BlogPost.astro` - Blog post layout with date/metadata
