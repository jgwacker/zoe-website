---
name: Zoe Wacker
description: Matinee, a lineup poster for a daytime show printed on warm cream stock.
colors:
  cream: "#FBF3EA"
  blush: "#F8EBE7"
  paper: "#FFFBF6"
  ink: "#2A1E1E"
  muted: "#6F675F"
  deep-rose: "#87314D"
  orange: "#D2652C"
  rose: "#C25E77"
  gold: "#A87A1C"
  orange-text: "#9C4A1C"
  rose-text: "#A84862"
  gold-text: "#8E6210"
  hair: "rgba(42, 30, 30, 0.14)"
typography:
  display:
    fontFamily: "Sacramento, cursive"
    fontSize: "clamp(52px, 8vw, 112px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(28px, 3.2vw, 40px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontVariation: "\"opsz\" 144, \"SOFT\" 100, \"WONK\" 1"
  title:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "0"
    fontVariation: "\"opsz\" 144, \"SOFT\" 100, \"WONK\" 1"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  ui:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0"
  label:
    fontFamily: "DM Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.16em"
rounded:
  xs: "2px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "56px"
  4xl: "64px"
  section: "104px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.deep-rose}"
    textColor: "{colors.cream}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
    size: "14px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  ticket-stub:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "18px 18px 18px 20px"
  panel:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "64px"
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.ui}"
  nav-link-active:
    textColor: "{colors.ink}"
  sidebar-item:
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    padding: "14px 4px"
  sidebar-item-active:
    textColor: "{colors.deep-rose}"
    padding: "14px 4px 14px 12px"
  eyebrow:
    textColor: "{colors.rose-text}"
    typography: "{typography.label}"
  photo:
    rounded: "{rounded.md}"
  link:
    textColor: "{colors.orange-text}"
---

# Design System: Zoe Wacker

## Overview

**Creative North Star: "The Matinee Poster"**

A lineup poster for a daytime show, printed on warm cream stock. The name is hand-lettered in deep rose across the top. The sections are billed beneath it like acts, in a soft and slightly wonky serif. The recent dates are ticket stubs with a perforated edge, and the awards are a numbered programme. Every other page is a leaf torn from the same programme: a mono kicker naming the section, a cursive title, hairline rules, and photographs hung with a soft coloured light behind them.

The mood is warm, elegant and a little theatrical, playful without being juvenile. Colour is sparing and always warm. Apricot, rose and marigold take turns as the accent on large type, rules, diamonds and halos, while small text stays in ink, muted taupe, or the darker text variants of the three accents. Density is low and reading is comfortable: 18px body copy at a 1.7 line height on a 68-character measure, generous section gaps, and long titles that step down from cursive to serif so they stay legible.

Confirmed rejections: the earlier After Dark theme (dark aubergine pages, Anton condensed caps, neon text glow) was too loud, and the earlier Soft Blush theme was too plain. Italics are banned throughout. Candy pink and anything bubblegum are out.

**Key Characteristics:**
- Cream page with two faint fixed radial washes, rose at the top left and apricot at the top right.
- One cursive face for the name and titles, one soft wonky serif for billing and card titles, one sans for reading, one mono for labels.
- Accents rotate apricot, rose, marigold in sequence rather than committing to one brand colour.
- Photos carry a soft coloured halo that brightens on hover, never a grey drop shadow.
- Hairlines, gold diamonds and perforations do the structural work; borders are rare and never heavy.
- Motion is gentle (lifts of 2 to 4px, 0.9s reveals) and fully off under reduced motion.

## Colors

A warm cream ground with three rotating warm accents and a deep rose for the hand lettering.

### Primary
- **Deep Rose** (`deep-rose`): The colour of the pen. The cursive name, page titles, the header wordmark, the current sidebar item, the hover state of the primary button, and the focus ring. It is the only accent allowed on small text without a darker variant because it already passes AA.

### Secondary
- **Apricot** (`orange`): Lineup row one, the period after the name, the period in the wordmark, the active-nav underline, the 3px top rule on award label cards, and the first halo in the rotation. Large text only.
- **Rose** (`rose`): Lineup row two on hover, blockquote left rule, the second halo, the hover halo on ticket stubs and tour thumbnails. Large text only.
- **Marigold** (`gold`): Diamonds and dots, the poster's thin rule, the cello card's left edge, the third halo. Large text only.

### Tertiary
- **Apricot Text** (`orange-text`): Every link, emphasised words inside headings, the featured programme entry.
- **Rose Text** (`rose-text`): Kickers, the "presents" line, sidebar numbers, emphasised words in quotes, programme arrows.
- **Marigold Text** (`gold-text`): Years, programme numerals, award result badges, "On stage" labels.

### Neutral
- **Cream** (`cream`): The page. Also the colour of the punched circles that fake a ticket's perforation.
- **Blush** (`blush`): Panels (the music section), inline code, and the placeholder behind photos while they load.
- **Paper** (`paper`): Cards, ticket stubs, chips, the award label, code blocks, and the open mobile menu.
- **Ink** (`ink`): Body copy, in-content headings, lineup row two, card titles, and the primary button fill.
- **Muted** (`muted`): Captions, notes, secondary nav, stops on a tour row, chip text.
- **Hairline** (`hair`): Rules between list items, card borders, table cell borders, the header's bottom edge.

### Named Rules
**The Big Type Rule.** Apricot, Rose and Marigold appear as text only at 24px and larger. Below that, use their Text variants, which pass 4.5:1 on cream, blush and paper.

**The Rotation Rule.** The three accents cycle in order, apricot then rose then marigold, across sibling photos, stubs and strip items. Do not assign one colour to one section.

**The Ink Rule.** Body copy is ink and secondary copy is muted. Colour never carries a paragraph.

## Typography

**Display Font:** Sacramento (with cursive fallback)
**Headline Font:** Fraunces, soft and wonky (with Georgia, serif)
**Body Font:** DM Sans (with system-ui, sans-serif)
**Label/Mono Font:** DM Mono (with ui-monospace, monospace)

**Character:** Hand lettering over a rounded, slightly irregular serif, on a plain sans. The cursive is thin by design, so script text gets a hairline stroke (`-webkit-text-stroke: .011em currentColor; paint-order: stroke fill`) to read as a regular pen line. Fraunces always runs with `"opsz" 144, "SOFT" 100, "WONK" 1` so its letterforms stay soft and quirky at every size.

### Hierarchy
- **Display** (Sacramento 400, `clamp(52px, 8vw, 112px)`, 1.05): Page titles in the title band, always deep rose, with `text-wrap: balance`. The homepage name runs larger at `clamp(44px, 15.5vw, 236px)` and homepage section headings at `clamp(44px, 5.2vw, 80px)`, both on one line.
- **Headline** (Fraunces 500, `clamp(28px, 3.2vw, 40px)`, 1.1, -0.01em): In-content `h2`, in ink. `h3` is 26px and `h4` is 21px at the same weight. Long page titles (over 40 characters) also use this face at `clamp(32px, 4.4vw, 56px)` in deep rose.
- **Title** (Fraunces 600, 21px, 1.15): Card and list titles: stub names, programme entries (20px), gig names, the award card label (28px), tour places (34px at 600).
- **Body** (DM Sans 400, 18px, 1.7): Paragraphs and list items, capped at 68ch. Drops to 17px under 560px. The About voice paragraph runs 20px at 1.6.
- **UI** (DM Sans 500, 15px, 1.35): Nav links, sidebar labels (600), buttons, notes and descriptions on cards. Secondary text in this role is muted.
- **Label** (DM Mono 500, 12px, 0.16em, uppercase): Kickers, captions (0.12em), the "presents" line, badges, ticket kinds (11px), dates and years (13 to 14px, 0.14em), the footer line.

### Named Rules
**The Forty-Character Rule.** A page title over 40 characters switches from Sacramento to Fraunces. Cursive does not survive long titles.

**The No Italics Rule.** `em` and `i` render upright everywhere. Emphasis is colour: apricot text inside headings, rose text inside quotes.

**The One Line Rule.** "Zoe Wacker" and the homepage section headings never wrap. Their clamps are tuned so `white-space: nowrap` fits at 360px.

## Layout

A single centered column of 1240px (`--page-max`) with a 16px gutter each side, 48px above the content and 32px below (32px and 24px under 560px). Standard pages open with a title band (56px top, 32px bottom, 36px and 24px under 900px) that holds the kicker and the title, closed by a hairline. An optional hero band follows (48px top, 24px bottom), used by award pages. Below that, a two-column grid: a sticky sidebar at `minmax(200px, 260px)` pinned 88px from the top, a 56px gap, and the content at `minmax(0, 1fr)`. Under 900px the sidebar goes static and stacks above the content with a 32px gap. Pages without a sidebar collapse to one column.

The homepage runs on the full-bleed layout with its own 32px gutters (16px under 560px). Sections are separated by 104px (72px under 560px). The poster is centered: name, tagline, then the key photo (960px max, a 2.75:1 letterbox on desktop, 2:1 under 1060px, 3:2 under 560px), then the two-row bill. The ticket stubs are a four-column grid with 18px gaps, two columns under 1060px, one under 560px. The photo strip is `1.3fr .8fr 1fr` with 30px gaps and staggered tops (70px and 24px), becoming two columns under 900px with the first photo spanning both. Two-column blocks (awards, music, about) use `5fr 7fr`, `1fr 1fr` and `240px 1fr` respectively with 64px gaps, all stacking under 900px.

Breakpoints, from the code: 1060px (stubs), 900px (sidebar, header menu, two-column blocks), 700px (homepage heading size), 560px (gutters, body size, single-column stubs).

Vertical rhythm inside content: headings carry 1.6em above and 0.5rem below, paragraphs 1em below (1.5em in blog prose), figures 2.5rem above and below. The footer sits 110px below the last content.

## Elevation & Depth

Depth is coloured light, not shadow. Photographs sit on the page with a soft halo in one of the three accents: a 1px tinted ring, a lifted glow beneath, and a wide ambient glow around. On hover the same halo brightens and spreads over half a second. Cards and stubs are a lighter paper on the cream ground, bounded by a hairline, and the only grey-ish shadow in the system is the faint one under a ticket stub at rest, which turns into a rose halo on hover. The header floats on a blurred, translucent cream. Nothing uses a hard, neutral drop shadow.

### Shadow Vocabulary
- **Halo, apricot** (`box-shadow: 0 0 0 1px rgba(226, 115, 58, .16), 0 18px 46px -16px rgba(226, 115, 58, .40), 0 0 80px -24px rgba(226, 115, 58, .34)`): First in the rotation. Also the featured award card.
- **Halo, rose** (`box-shadow: 0 0 0 1px rgba(194, 94, 119, .16), 0 18px 46px -16px rgba(194, 94, 119, .40), 0 0 80px -24px rgba(194, 94, 119, .34)`): Second in the rotation. Also the award hero photo, tour thumbnails and blog hero images.
- **Halo, marigold** (`box-shadow: 0 0 0 1px rgba(201, 138, 30, .16), 0 18px 46px -16px rgba(201, 138, 30, .40), 0 0 80px -24px rgba(201, 138, 30, .34)`): Third in the rotation. Also the ZW monogram.
- **Halo, hover** (each colour: `0 0 0 1px rgba(h, .30), 0 24px 60px -12px rgba(h, .58), 0 0 120px -18px rgba(h, .48)`): The brightened state, transitioned over `.5s ease`.
- **Stub, rest** (`box-shadow: 0 1px 0 rgba(42, 30, 30, .05), 0 14px 30px -18px rgba(122, 60, 40, .35)`): The one warm-grey shadow, under ticket stubs only.
- **Header** (`background: rgba(251, 243, 234, .88); backdrop-filter: blur(10px)`): The sticky header's translucency, closed by a hairline.

### Named Rules
**The Coloured Light Rule.** A shadow is always tinted with the element's accent. Grey shadows do not exist here, and the halo RGB triplets (`226,115,58`, `194,94,119`, `201,138,30`) are brighter than the text colours on purpose, because they are light rather than ink.

**The Rest Lift Rule.** Surfaces are flat at rest. Hover lifts a card 2px, a stub or tour thumbnail 3 to 4px (the thumbnail also tilts 1.5 degrees), and brightens its halo. Nothing lifts without being a link.

## Shapes

Softly rounded print pieces. Photos and the award hero have 8px corners; cards, stubs and the award label card 10px; the music panel 18px; blog hero images 12px; small thumbnails 6px; bare `img` elements 2px. Buttons, chips and the menu toggle are full pills (999px). The ZW monogram and the gold result dot are circles.

Rules are 1px. Most are hairlines (`rgba(42, 30, 30, .14)`), but a list that opens a section (the programme, the tour, the bill) starts with a 1px rule in solid ink, and the bill is double-ruled with a hairline 4px inside each ink line. Accent edges are thicker: a 3px apricot top rule on the award label card, a 4px coloured left edge on ticket stubs and the cello card, a 3px inset apricot bar on the current sidebar item, a 3px rose left rule on blockquotes.

Recurring marks: a 7px square rotated 45 degrees in marigold is the diamond that precedes every kicker and separates the acts on the bill (6px in rose on row two, 5px on row three). A ticket's tear-off edge is a 2px dashed hairline with two 16px cream circles punched at top and bottom. Programme entries are numbered with Roman numerals, sidebar entries with zero-padded Arabic numerals.

## Components

Printed and tactile: pieces of a programme on paper stock, with hairlines, perforations and an ink pill button, that answer touch with a small lift.

### Buttons
- **Shape:** Full pill (999px).
- **Primary:** Ink fill, cream text, DM Sans 500 at 15px, 12px by 22px padding. Used for "Read the story →" on the featured award card.
- **Hover / Focus:** Fill shifts to deep rose and the button lifts 2px over `.25s`. Focus is the global ring: 2px deep rose outline, 3px offset, 2px radius.
- **Ghost:** The mobile menu toggle. Transparent fill, hairline border, DM Mono 12px uppercase at 0.16em, 44px tall with 16px side padding, ink text. Only shown under 900px once JavaScript has run.
- **Text links:** Apricot text, no underline at rest, underline with a 3px offset on hover, visited identical. "More" links are bold.

### Chips
- **Style:** Paper fill, hairline border, pill, 7px by 14px padding, DM Sans 14px in muted. Used for the interest list on the homepage.
- **State:** Static, not interactive. No selected variant exists.

### Cards / Containers
- **Corner Style:** 10px (cards, stubs), 18px (panel).
- **Background:** Paper for cards and stubs on the cream page; blush for the music panel.
- **Shadow Strategy:** None at rest except the ticket stub's faint warm shadow. Hover brings a rose halo and a lift. See Elevation & Depth.
- **Border:** A hairline on the award label card and chips. Stubs have no border; their edge is a 4px accent bar on the left. The cello card has a 4px marigold left edge.
- **Internal Padding:** 24px (award label), 18px to 20px (stub), 20px by 22px (cello card), 64px (music panel, 40px by 28px under 900px).

### Inputs / Fields
- **Style:** No styled form fields exist. `input` and `textarea` are set to 16px only, to stop mobile zoom. If a field is ever needed, use paper fill, a hairline border, 8px corners, and the global focus ring.

### Navigation
- **Header:** Sticky, 64px, translucent cream with blur and a hairline bottom edge. The wordmark is Fraunces 600 at 22px in deep rose with an apricot period. Links are DM Sans 500 at 15px in muted, turning ink on hover (`.2s`), and the current page is ink with a 2px apricot inset underline.
- **Mobile (under 900px):** A "Menu" ghost pill toggles a paper panel. Links become Fraunces 500 at 24px in ink, one per line, separated by hairlines, the current page in deep rose. Escape closes it. Without JavaScript the nav is simply visible and the header is not sticky.
- **Sidebar set list:** A hairline-ruled list. Each item is a zero-padded number in Fraunces 500 at 20px in rose text, then the label in DM Sans 600 at 15px in ink, 14px by 4px padding. Hover slides the item 6px right on a rose-to-transparent gradient over `.25s`. The current page carries a 3px apricot inset bar on the left and its label turns deep rose.

### Ticket Stub
The homepage's "Now showing" cards. A paper rectangle with 10px corners split into a main panel and a 46px tear-off. The main panel has a 4px left edge in the stub's accent, a mono kind-and-year line in that accent's text colour, the name in Fraunces 600 at 21px, and a muted 14px detail. The tear-off is a 2px dashed hairline with cream circles punched top and bottom and a vertical mono "No. 01" in the accent text colour. Rest shadow is the faint warm one; hover lifts 4px and brings the rose halo over `.3s` and `.4s`.

### Photo with Halo
Every `figure > img`, `figure > video` and `figure > a > img` gets 8px corners and a halo in rotation by `nth-of-type(3n+1)`, `3n+2`, `3n`. Hover brightens the halo over `.5s`, and linked photos also scale to 1.02 over `.3s`. The caption is DM Mono 12px uppercase at 0.12em in muted, left-aligned, 14px below, capped at 40rem. On the homepage strip, the caption is split into title (ink) and place (muted) at the two ends of the line. No per-page styling is needed; the global stylesheet does it.

### Kicker
A mono label, DM Mono 500 at 12px uppercase with 0.16em tracking in rose text, preceded by a 7px marigold diamond with a 12px gap. It opens the title band of every page and every homepage section.

### Programme and Tour Rows
Numbered lists that open with a solid ink rule and separate items with hairlines. Programme rows: a Roman numeral in Fraunces 500 at 28px in marigold text, the title in Fraunces 600 at 20px in ink with a muted sans note beneath, and a rose arrow on the right that slides 4px on hover while the row slides 6px on an apricot gradient. Tour rows: a mono year in marigold text, the place in Fraunces 600 at 34px turning apricot on hover, muted stops, and a 132px by 84px thumbnail with a rose halo that lifts and tilts. Under 560px the arrow hides; under 900px the thumbnail hides.

### Award Exhibit
The hero on award pages. The photo at full width with a rose halo beside a 320px paper label card with a hairline border and a 3px apricot top rule. Inside: a mono badge in marigold text with a marigold dot, the title in Fraunces at 30px in ink, "Zoe Wacker, year" in muted, and a hairline-topped definition list with mono terms in muted and sans values in ink. Stacks under 900px.

## Do's and Don'ts

### Do:
- **Do** set every page title in Sacramento and deep rose, and let titles over 40 characters fall back to Fraunces at `clamp(32px, 4.4vw, 56px)`.
- **Do** keep Fraunces on its soft and wonky axes (`"opsz" 144, "SOFT" 100, "WONK" 1`) at weights 400 to 600.
- **Do** put photos in a `<figure>` and let the global halo rotation style them.
- **Do** use Apricot Text, Rose Text and Marigold Text for any coloured text under 24px.
- **Do** open a section list with a solid 1px ink rule and separate items with hairlines.
- **Do** use the ZW monogram on marigold-haloed paper where a portrait would otherwise go.
- **Do** add `class="reveal"` for a scroll fade-in; it stays visible without JavaScript and under reduced motion.
- **Do** keep body copy at 18px, line height 1.7, and a 68ch measure.

### Don't:
- **Don't** use italics anywhere; `em` and `i` render upright and carry colour instead.
- **Don't** set Apricot, Rose or Marigold on text smaller than 24px.
- **Don't** use grey or neutral drop shadows; depth is a tinted halo or a paper-on-cream layer.
- **Don't** bring back dark page backgrounds, condensed caps (Anton) or neon text glow.
- **Don't** give one section one colour; accents rotate apricot, rose, marigold across siblings.
- **Don't** let "Zoe Wacker" or a homepage section heading wrap.
- **Don't** add candy pink, bubblegum, or anything that reads as juvenile.
- **Don't** add motion that persists under `prefers-reduced-motion`, or content that only appears once JavaScript runs.
