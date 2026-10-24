export type LinkItem = { href: string; label: string; note?: string; image?: string; featured?: boolean; desc?: string };

// Top-level sections (optional, if you want to reuse elsewhere)
export const sections = [
  { href: '/travel', label: 'Travel' },
  { href: '/photography', label: 'Photography' },
  { href: '/music', label: 'Music' },
  { href: '/geography', label: 'Geography' },
  { href: '/guardian-arts', label: 'Guardian Arts' },
  { href: '/academics', label: 'Academics' },
  { href: '/photography/gallery', label: 'Gallery' }
];

// Travel
export const travelTrips: LinkItem[] = [
  { href: '/travel/trips/san-francisco-2026', label: 'San Francisco 2026', note: 'Haight-Ashbury · Valencia Street · North Beach' },
  { href: '/travel/trips/amsterdam-2025',  label: 'Amsterdam 2025', note: 'Haarlem · Amsterdam · Anne Frank House' },
  { href: '/travel/trips/egypt-2025',      label: 'Egypt 2025', note: 'Cairo · Giza · Aswan · Kom Ombo · Nubia', image: '/images/trips/egypt_2025/nile_cruise_egypt_2025.jpg' },
  { href: '/travel/trips/chile-2025',      label: 'Chile 2025', note: 'Santiago · Torres del Paine · Tierra del Fuego · Valparaíso', image: '/images/trips/chile_2025/tierra_del_fuego_chile_2025.jpg' },
  { href: '/travel/trips/rome-2024',       label: 'Rome 2024', note: 'The Vatican · ancient Rome · Vesuvius', image: '/images/trips/rome_2024/colluseum_rome_2024.jpeg' },
  { href: '/travel/trips/london-2024',     label: 'London 2024', note: 'Tower of London · the Thames · London Eye', image: '/images/trips/london_2024/london_eye_london_2024.jpg' },
  { href: '/travel/trips/paris-2023',      label: 'Paris 2023', image: '/images/trips/paris_2023/champs_paris_2023.jpg' },
  { href: '/travel/trips/israel-2023',     label: 'Israel 2023' },
  { href: '/travel/trips/greece-2022',     label: 'Greece 2022' },
  { href: '/travel/trips/norway-2019',     label: 'Norway 2019' },
];

// Photography
export const photographySections = [
  { href: '/photography/masonry', label: 'Overview Gallery' },
  { href: '/photography/awards',    label: 'Awards' },
  { href: '/photography/portfolio', label: 'Portfolio' },
];
export const photographyAwards: LinkItem[] = [
  { href: '/photography/awards/global-peace-photo-award-2026', label: 'Global Peace Photo Award 2026', note: 'Shortlisted, Children’s Peace Image of the Year · “Faces of Peace”' },
  { href: '/photography/awards/npcfk-competition-shelter-2026', label: 'The Shelter: National Photography Competition for Kids June 2026', note: 'Notable Entry, Rising Photographers (ages 12–14)' },
  { href: '/photography/awards/no-frames-2026', label: 'No Frames International Youth Photo Contest 2026', note: 'Honorable Mention, Nature (under 14)' },
  { href: '/photography/awards/npcfk-competition-life-in-red-2026', label: 'Life in Red: National Photography Competition for Kids March 2026', note: 'Winner, Dream Snapper · Rising Photographers (ages 12–14)' },
  { href: '/photography/awards/npcfk-competition-home-2025', label: 'Home is Where the Heart Is: National Photography Competition for Kids December 2025', note: 'Winner, Visionary Voyager · Rising Photographers (ages 12–14)' },
  { href: '/photography/awards/tpoy-competition-2025', label: 'Travel Photographer of the Year Competition 2025', note: 'Runner-Up, Young TPOTY (14 & under) · Places collection' },
  { href: '/photography/awards/npcfk-competition-color-2025', label: 'I Spy Something-“Color” : National Photography Competition for Kids November 2025', note: 'Notable Entry, Rising Photographers (ages 12–14)' },
  { href: '/photography/awards/peninsula-photo-competition-2025', label: 'Peninsula Photo Competition 2025', note: 'Honorable Mention, Youth “Moments” · “Cinderello”', image: '/images/photography_awards/cinderello.jpg', featured: true },
];

// Music
export const musicSections = [
  { href: '/music/cello',     label: 'Cello' },
  { href: '/music/concerts',  label: 'Concerts' },
  { href: '/music/favorites', label: 'Favorites' },
];
export const celloPerformances: LinkItem[] = [
  { href: '/music/cello/disneyland-2026', label: 'Disneyland 2026', note: 'Played with my orchestra on Main Street, U.S.A., and recorded in a studio session. May 2026.' },
];
export const musicConcerts: LinkItem[] = [
  { href: '/music/concerts/outside-lands-2026',       label: 'Outside Lands 2026' },
  { href: '/music/concerts/ariana-grande-2026',       label: 'Ariana Grande 2026' },
  { href: '/music/concerts/molly-tuttle-2025',        label: 'Molly Tuttle 2025' },
  { href: '/music/concerts/billie-eilish-2025',       label: 'Billie Eilish 2025' },
  { href: '/music/concerts/laufey-2025',              label: 'Laufey 2025' },
  { href: '/music/concerts/sabrina-carpenter-2024',   label: 'Sabrina Carpenter 2024' },
  { href: '/music/concerts/laufey-2024',              label: 'Laufey 2024' },
  { href: '/music/concerts/reset-2023',               label: 'Re:Set 2023' },
];
export const musicFavorites = [
  { href: '/music/favorites/sienna-spiro-visitor',                     label: 'Sienna Spiro — Visitor' },
  { href: '/music/favorites/faouzia-film-noir-fin',                    label: 'Faouzia — FILM NOIR (fin)' },
  { href: '/music/favorites/laufey-matter-of-time',                    label: 'Laufey — Matter of Time' },
  { href: '/music/favorites/molly-tuttle-so-long-little-miss-sunshine', label: 'Molly Tuttle — So Long Little Miss Sunshine' },
  { href: '/music/favorites/billie-eilish-hit-me-hard-and-soft',       label: 'Billie Eilish — Hit Me Hard and Soft' },
];

// Academics
export const academicsSections = [
  { href: '/academics/summer-programs', label: 'Summer Programs' },
  { href: '/academics/years',           label: 'Years' },
];
export const academicsSummerPrograms = [
  { href: '/academics/summer-programs/johns-hopkins-cty-2026',
    label: 'Johns Hopkins Center for Talented Youth 2026' },
  { href: '/academics/summer-programs/johns-hopkins-cty-2025',
    label: 'Johns Hopkins Center for Talented Youth 2025' },
  { href: '/academics/summer-programs/mountain-camp-2021-2024',
    label: 'Mountain Camp 2021–2024' },
];
export const academicsYears = [
  { href: '/academics/years/8th-grade', label: '8th Grade' },
  { href: '/academics/years/7th-grade', label: '7th Grade' },
  { href: '/academics/years/6th-grade', label: '6th Grade' },
];

// Geography / Guardian Arts (placeholders for now)
export const geographyLinks = [];
export const guardianArtsLinks = [];
