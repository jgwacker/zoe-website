# Shared brief: Zoe's site redesign mockups

You are building ONE design direction as a throwaway visual mockup for Zoe Wacker's personal website. Zoe is a 13-year-old photographer/cellist from Menlo Park, CA. The parent's feedback: the current site (stock Astro blog theme: gray gradient, blue links, plain text header) feels "too cold." Goal: warm, personal, has her personality — but NOT juvenile, NOT bubblegum, NOT cutesy. Her favorite colors are pink and orange (lean coral, terracotta, rose, apricot, marigold — never candy pink). It should still look credible to photo-contest judges and, later, schools.

## Deliverables (exactly two files, in your direction's folder)
1. `index.html` — the homepage / landing page.
2. `award.html` — the Peninsula Photo Contest 2025 award page (content below).

Each file must be fully self-contained static HTML + inline CSS (+ small inline JS only if the direction needs interaction). Fonts: Google Fonts `<link>` is fine. No other external CSS/JS. Must look good at desktop (1440px) AND at phone width (390px) with no horizontal scroll. Link index.html ↔ award.html (e.g. the awards nav item / an award card goes to award.html; award.html has nav back to index.html). Other nav links can be `#`.

Include the real site nav: Home, About, Travel, Photography, Music, Geography, Guardian Arts, Academics. (You may restyle/group it, but all sections must be reachable.)

## Images — use these absolute file URLs (they exist locally)
Base: `file:///Users/jgwacker/zoewacker/public/images/`
- `portfolio/portfolio-64.jpg` — Nubian woman laughing, playing frame drum, ochre wall (Aswan, Egypt) — warm, landscape
- `portfolio/portfolio-53.jpg` — bright red Nubian house with blue arched door (Aswan) — portrait
- `portfolio/portfolio-32.jpg` — Sphinx with pyramid behind (Giza, Egypt) — portrait-ish
- `portfolio/portfolio-72.jpg` — Day of the Dead portrait, red dress, calavera face paint (Mission District, San Francisco) — portrait
- `portfolio/portfolio-21.jpg` — two king penguins on grass (Tierra del Fuego, Chile) — landscape
- `portfolio/portfolio-9.jpg` — Torres del Paine mountains and lake (Chile) — landscape
- `portfolio/portfolio-56.jpg` — man on decorated camel (Aswan) — portrait
- `portfolio/portfolio-45.jpg` — black cat walking across mosque carpet (Cairo) — landscape
- `portfolio/portfolio-59.jpg` — elder in galabeya with cat on a temple pillar (Aswan) — portrait
- `portfolio/portfolio-55.jpg` — smiling craftsman, thumbs up, woven baskets (Aswan) — landscape
- `portfolio/portfolio-47.jpg` — golden chandelier in mosque (Cairo) — landscape
- `portfolio/portfolio-50.jpg` — colorful Nubian market stall (Aswan) — landscape
- `portfolio/portfolio-24.jpg` — colorful street mural (Valparaíso, Chile) — landscape
- `portfolio/portfolio-69.jpg` — sunset silhouette (Kom Ombo, Egypt) — landscape
- `photography_awards/cinderello.jpg` — "Cinderello": caretaker sweeping carpets in the vast Mosque–Madrasa of Sultan Hasan, Cairo, light cutting through — landscape 1600x1067
- `photography_awards/650_award_2025.jpg` — Zoe accepting the Peninsula award
- `home/about.jpg` (1024 square), `home/music.jpg`, `home/travel.jpg`, `home/photography.jpg`, `home/geography.jpg`, `home/academics.jpg` — current section tile images (1536x1024 except about/travel square)
- `trips/chile_2025/tierra_del_fuego_chile_2025.jpg`, `trips/egypt_2025/nile_cruise_egypt_2025.jpg`, `trips/london_2024/london_eye_london_2024.jpg`, `trips/rome_2024/colluseum_rome_2024.jpeg`, `trips/paris_2023/champs_paris_2023.jpg`

Look at a few with your Read tool before designing so the palette harmonizes with them.

## Real content (use it; don't invent achievements)
Zoe's own voice (from her About page): "Hi! I'm Zoe, a middle schooler who's always juggling a bunch of different interests. I started this site to keep track of the things I'm working on, the ideas I'm excited about, and the projects that don't always fit neatly into a school folder. Right now, I'm into geography and travel, playing cello and music, and parkour with mixed-martial arts. I also love discovering new places, digging into history, and snapping photos that tell little stories. Basically, it's my highlight reel of experiments, adventures, and 'aha!' moments."

Music voice: "Music makes everything in my day feel more colorful." / "Concerts are my favorite because you don't just hear the music—you feel it in your chest."

Photo awards (2025–2026):
- Travel Photographer of the Year 2025 — Young TPOTY (14 & under) Runner-Up; Places collection exhibited internationally in 2026
- Six Fifty Peninsula Photo Contest 2025 — Honorable Mention, Youth "Moments" — "Cinderello"
- National Photography Competition for Kids — Winner "Home is Where the Heart Is" (Dec 2025, Visionary Voyager award); Winner "Life in Red" (Mar 2026, Dream Snapper award); Notable Entries Nov 2025 & Jun 2026
- No Frames International Youth Photo Contest 2026 — Honorable Mention (under-14, Nature), 13 photos accepted
- Global Peace Photo Award 2026 — Shortlisted, Children's Peace Image of the Year ("Faces of Peace")

Places: Egypt (Cairo, Giza, Aswan, Kom Ombo, Nubia) 2025; Chile/Patagonia (Santiago, Valparaíso, Torres del Paine, Tierra del Fuego) 2025; London & Rome 2024; Paris 2023.
Concerts: Outside Lands 2026, Ariana Grande 2026 (Oakland), Molly Tuttle 2025, Billie Eilish 2025, Laufey 2025 & 2024, Sabrina Carpenter 2024. Cello: school orchestra, performed on Main Street at Disneyland, May 2026.

## award.html content (Peninsula Photo Contest 2025)
Title: Peninsula Photo Contest 2025 · Honorable Mention, Youth Division — "Moments"
Body (Zoe's words, keep them):
"The Six Fifty Peninsula Photo Contest is presented by the Palo Alto Weekly and the Palo Alto Art Center and is open to photographers who live, work, or attend school in the 650 area code. There were over 1,200 entries across six categories."
"My winning photo, Cinderello, was taken at the Mosque–Madrasa of Sultan Ḥasan in Historic Cairo. A man was sweeping the carpets, and the light caught the dust just right—he looked like he needed a fairy godmother, which made me think of Cinderella. I tried to frame the scale of the space against a single everyday gesture, so the scene feels both grand and human."
"The photograph was exhibited at the Palo Alto Art Center from September–December 2025. I was the youngest winner; the other Youth Division awardees were mostly juniors and seniors. It was exciting (and a little intimidating!) to be shown alongside older students whose work I admire."
Images: cinderello.jpg (hero), 650_award_2025.jpg (caption: "Accepting the award"). Show a way to navigate to other awards (list of the award names above).

## Rules
- Privacy: first name + last name ok (already public); NO school name, NO email/contact form, NO exact address. City "Menlo Park" ok.
- No lorem ipsum. No fake stats/achievements. No emoji. No stickers.
- Put a small label in a corner of each page: the direction's code and name (e.g. "Mockup 3A · Terracotta Gallery") so the family can compare.
- Make it genuinely beautiful and distinct — this is a design pitch. Typography, spacing, and photo treatment matter most.
- When done, take no further actions beyond writing the two files. Report: the folder path, the fonts and hex colors used, and 2–3 sentences on the design idea.
