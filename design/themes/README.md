# Site theme mockups (archived)

Seven design directions (plus eight variations of 3D) for warming up Zoe's site, explored October 2026. Each one has a homepage (`index.html`) and the Peninsula Photo Contest award page (`award.html`), built with her real photos and words. They're static mockups, not part of the Astro build, and nothing in `design/` is deployed.

**To view:** open `design/themes/index.html` in a browser (e.g. `open -a "Google Chrome" design/themes/index.html`). It links to every theme. Screenshots of each page are in `previews/`.

Images load from `../../../public/images/` relative to each page, so the mockups only work from inside this repo.

**Background:** the family wanted the site warmer and more personal, right for a 13-year-old but not juvenile. Zoe's favorite colors are pink and orange, so every theme leans coral, terracotta, rose, apricot and marigold rather than candy pink. `BRIEF.md` is the shared brief every mockup was built from.

**Caveat:** photo titles like "Frame Drum" and "Blue Door", captions, section blurbs and some headlines were written as placeholders, not by Zoe. Her own words appear in the intros and the award story. Replace the placeholders before using any of it for real.

| Theme | Idea | Fonts | Key colors |
|---|---|---|---|
| **3A · Terracotta Gallery** | A quiet, warm gallery. A masonry photo grid with captions, and Cinderello hung like a framed print. | Cormorant Garamond, Work Sans | `#FAF7F2` off-white, `#D9653B` burnt orange, `#F3D9D2` dusty pink, `#2B2522` charcoal |
| **3D · Exhibition Card** | One photo at a time with a museum wall label; arrows step through a six-photo show. Orange marks awards. | Instrument Serif, Manrope | `#FFFDFB` white, `#F6E9E4` blush wall, `#E06A2C` award orange, `#B9506A` rose |
| **5A · Golden Hour Festival** | Daytime festival energy. A sunset-gradient hero, section cards as fabric wristbands, and ticket-stub "recent" strip. | Big Shoulders Display, DM Sans, DM Mono | `#FBF3E6` cream, gradient `#F2A33A` to `#EE6A4D` to `#D9536F`, `#4A2330` plum |
| **5B · After Dark** | A lineup poster on aubergine with ZOE WACKER headlining and sections billed like acts. Long-text pages switch to warm cream. | Anton, DM Sans, DM Mono | `#1E1424` aubergine, `#FF6F59` coral, `#FF4F8B` rose, `#FFB13B` marigold |
| **5E · Stage Lights** | Light cream pages with soft swaying orange and pink spotlight beams behind a huge gradient name. | Big Shoulders Display, DM Sans | `#FBF3E8` cream, `#F27A2F` orange, `#DE4A6E` rose, `#2B1B18` ink |
| **6A · Sunset Map** | A hand-drawn warm world map with rose routes from Menlo Park to each trip, and clickable pins with photo cards. The award page has an inset map of Egypt. | Cormorant Garamond, Cormorant SC, DM Sans | `#F7EFE3` parchment, `#D98C5F` terracotta land, `#D45D79` rose routes, `#3A2820` ink brown |
| **6C · Passport** | A rose passport cover and a "data page", with trips, concerts and awards as clickable ink stamps. The award page is a visa page. | Fraunces, Instrument Sans, IBM Plex Mono, Oswald | `#5A1830` cover, `#E8AE8A` emboss, `#F8F1E6` paper, `#B0304F` rose, `#E0662C` orange |

**Notes:**
- **6C photo:** 6C's data page crops a close-up of Zoe from `photography_awards/650_award_2025.jpg`. Choose a deliberate public photo before using it.
- **Image sizes:** the mockups load full-size originals (some up to 9,504px wide). A real build should use resized versions.
- **Rejected directions:** Field Journal, Golden Hour (soft gradients), Sticker Book, Collage/Zine, Magazine Spread, Darkroom, Marigold, Postcards, Light Table, Soundcheck and Compass.

## 3D variations (Zoe's pick, October 2026)

Zoe liked **3D · Exhibition Card** best. These four keep its layout exactly and change only the colors and fonts, from subtle to dramatic:

| Variant | Change level | Fonts | Wall / accent colors |
|---|---|---|---|
| **3D-1 · Soft Blush** | Subtle | Fraunces, Manrope | `#F8EBE7` wall, `#E2733A` orange, `#C25E77` rose |
| **3D-2 · Apricot Room** | Subtle–medium | DM Serif Display, DM Sans | `#F9E6D6` apricot wall, `#D9582B` orange, `#C1466A` rose |
| **3D-3 · Coral Gallery** | Medium–dramatic | Playfair Display, Work Sans | `#F4D3CB` coral-pink wall, `#E2551F` orange, `#A93A5E` berry |
| **3D-4 · Sunset Wall** | Dramatic | Gloock, Outfit | `#E9876F` coral wall, `#C2410C` burnt orange, `#8E2446` plum-rose; on-wall text darkened to `#4A0F24` for contrast |

All the colors and fonts are CSS variables in the `:root` block at the top of each page, so a mix-and-match (for example 3D-2 fonts with 3D-3 colors) means editing only those lines.

**More color variety (purple, blue, pink):**

| Variant | Direction | Fonts | Wall / accent colors |
|---|---|---|---|
| **3D-5 · Lavender Room** | Purple, subtle | Instrument Serif, Manrope (original) | `#ECE4F3` lavender wall, `#7B3FA0` violet, `#E0662C` orange awards |
| **3D-6 · Rose Quartz** | More pink | Fraunces, Manrope | `#F7DCE4` rose wall, `#B02A5E` raspberry, `#E2652F` orange |
| **3D-7 · Periwinkle & Coral** | Blue | Playfair Display, Work Sans | `#DFE6F3` periwinkle wall, `#B8325F` pink, `#E5602E` coral |
| **3D-8 · Plum Night** | Purple, dramatic | DM Serif Display, DM Sans | `#4B2350` plum wall, with on-wall text in `#FFF3EC` cream, `#F59AB8` pink and `#F7B58C` peach |

All on-wall text was checked against WCAG AA contrast (4.5:1 or better).
