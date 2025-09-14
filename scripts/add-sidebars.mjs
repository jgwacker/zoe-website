// scripts/add-sidebars.mjs
// Usage:
//   node scripts/add-sidebars.mjs --dry    # preview changes
//   node scripts/add-sidebars.mjs          # apply changes (.bak created)
//
// What it does:
// 1) Ensures every .astro under src/pages imports @layouts/Page.astro and wraps content in <Layout ...>...</Layout>.
// 2) Adds a left sidebar (LinkList with orientation="vertical") to all section index pages and
//    to detail pages in known groups (e.g., travel/trips/* uses travelTrips).
//
// Requirements: Node 18+, project root cwd, Page.astro with sidebar slot, LinkList.astro, registry.ts.

import fs from 'fs';
import path from 'path';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();
const PAGES = path.join(ROOT, 'src', 'pages');

const POSIX = (p) => p.split(path.sep).join('/');

const INDEX_SIDEbars = {
  'src/pages/travel/index.astro':                 { importSpec: '{ travelTrips }',           listVar: 'travelTrips',           title: 'Travel' },
  'src/pages/travel/trips/index.astro':           { importSpec: '{ travelTrips }',           listVar: 'travelTrips',           title: 'Trips' },

  'src/pages/photography/index.astro':            { importSpec: '{ photographySections }',   listVar: 'photographySections',   title: 'Photography' },
  'src/pages/photography/awards/index.astro':     { importSpec: '{ photographyAwards }',     listVar: 'photographyAwards',     title: 'Photography — Awards' },
  // portfolio index: no list for now; skip

  'src/pages/music/index.astro':                  { importSpec: '{ musicSections }',         listVar: 'musicSections',         title: 'Music' },
  'src/pages/music/concerts/index.astro':         { importSpec: '{ musicConcerts }',         listVar: 'musicConcerts',         title: 'Concerts' },
  'src/pages/music/favorites/index.astro':        { importSpec: '{ musicFavorites }',        listVar: 'musicFavorites',        title: 'Favorite Songs' },

  'src/pages/academics/index.astro':              { importSpec: '{ academicsSections }',     listVar: 'academicsSections',     title: 'Academics' },
  'src/pages/academics/summer-programs/index.astro': { importSpec: '{ academicsSummerPrograms }', listVar: 'academicsSummerPrograms', title: 'Summer Programs' },
  'src/pages/academics/years/index.astro':        { importSpec: '{ academicsYears }',        listVar: 'academicsYears',        title: 'Academic Years' },

  'src/pages/geography/index.astro':              { importSpec: '{ geographyLinks }',        listVar: 'geographyLinks',        title: 'Geography' },
  'src/pages/guardian-arts/index.astro':          { importSpec: '{ guardianArtsLinks }',     listVar: 'guardianArtsLinks',     title: 'Guardian Arts' },
};

// For detail pages, map path prefixes to the registry list they should show as a sidebar.
const DETAIL_PREFIX_MAP = [
  { prefix: 'src/pages/travel/trips/',                importSpec: '{ travelTrips }',             listVar: 'travelTrips' },
  { prefix: 'src/pages/photography/awards/',         importSpec: '{ photographyAwards }',       listVar: 'photographyAwards' },
  { prefix: 'src/pages/music/concerts/',             importSpec: '{ musicConcerts }',           listVar: 'musicConcerts' },
  { prefix: 'src/pages/music/favorites/',            importSpec: '{ musicFavorites }',          listVar: 'musicFavorites' },
  { prefix: 'src/pages/academics/summer-programs/',  importSpec: '{ academicsSummerPrograms }', listVar: 'academicsSummerPrograms' },
  { prefix: 'src/pages/academics/years/',            importSpec: '{ academicsYears }',          listVar: 'academicsYears' },
  // add more groups as you create them
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

function backupWrite(fp, s) {
  if (DRY) return;
  const bak = fp + '.bak';
  if (!fs.existsSync(bak)) fs.writeFileSync(bak, fs.readFileSync(fp));
  fs.writeFileSync(fp, s);
}

function titleFromPath(rel) {
  const name = rel.endsWith('index.astro')
    ? path.basename(path.dirname(rel))
    : path.basename(rel, '.astro');
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function ensureFrontMatterAndImports(src, extraImports = []) {
  const layoutImport = `import Layout from '@layouts/Page.astro';`;
  // remove any old Layout imports
  let s = src
    .replace(/import\s+Layout\s+from\s+['"][^'"]*layouts\/(?:Site|BlogPost|Page)\.astro['"];\s*/g, '')
    .replace(/import\s+Layout\s+from\s+['"]@layouts\/(?:Site|BlogPost|Page)\.astro['"];\s*/g, '');

  // ensure front-matter exists
  if (!s.startsWith('---')) {
    s = `---\n${layoutImport}\n${extraImports.join('\n')}\n---\n` + s;
    return s;
  }

  // find closing ---
  const end = s.indexOf('\n---', 3);
  const fmEnd = end === -1 ? s.length : end + 4;
  const head = s.slice(0, fmEnd);
  const body = s.slice(fmEnd);

  // if imports already present, avoid duplicates
  const toInsert = [layoutImport, ...extraImports].filter((imp) => !head.includes(imp)).join('\n');
  const headFixed = head.replace(/^---\s*\n/, (m) => m + (toInsert ? toInsert + '\n' : ''));
  return headFixed + body;
}

function ensureWrappedInLayout(src, title) {
  if (/<Layout[\s>]/.test(src)) return src;
  if (!src.startsWith('---')) return `<Layout title="${title}">\n${src}\n</Layout>\n`;
  const end = src.indexOf('\n---', 3);
  const fmEnd = end === -1 ? src.length : end + 4;
  const head = src.slice(0, fmEnd);
  const body = src.slice(fmEnd);
  return head + `<Layout title="${title}">\n` + body + `\n</Layout>\n`;
}

function injectSidebar(src, listVar) {
  if (!listVar) return src;
  if (/slot\s*=\s*["']sidebar["']/.test(src)) return src; // already has a sidebar
  // Insert immediately after first <Layout ...>
  return src.replace(
    /<Layout([^>]*)>/,
    (m, attrs) =>
      `<Layout${attrs}>\n  <LinkList slot="sidebar" items={${listVar}} orientation="vertical" />`
  );
}

function renderIndexTemplate(title, importSpec, listVar) {
  const extra = [
    `import LinkList from '@components/LinkList.astro';`,
    `import ${importSpec} from '@links/registry';`,
  ];
  let s = `---\nimport Layout from '@layouts/Page.astro';\n${extra.join('\n')}\n---\n`;
  s += `<Layout title="${title}">\n`;
  s += `  <LinkList slot="sidebar" items={${listVar}} orientation="vertical" />\n`;
  s += `  <p class="intro">Choose a subsection.</p>\n`;
  s += `</Layout>\n`;
  return s;
}

function maybeSidebarGroupFor(rel) {
  const hit = DETAIL_PREFIX_MAP.find((g) => rel.startsWith(g.prefix));
  return hit || null;
}

// -------- main --------
const files = walk(PAGES);
let updated = 0;
let templated = 0;

for (const abs of files) {
  const rel = POSIX(path.relative(ROOT, abs));
  let src = fs.readFileSync(abs, 'utf8');
  const original = src;

  // Case A: known section index -> overwrite with sidebar template
  if (INDEX_SIDEbars[rel]) {
    const { title, importSpec, listVar } = INDEX_SIDEbars[rel];
    src = renderIndexTemplate(title, importSpec, listVar);
    templated++;
  } else {
    // Case B: any other page -> ensure Layout + add sidebar if belongs to a group
    const group = maybeSidebarGroupFor(rel);
    const extraImports = group
      ? [
          `import LinkList from '@components/LinkList.astro';`,
          `import ${group.importSpec} from '@links/registry';`,
        ]
      : [];

    src = ensureFrontMatterAndImports(src, extraImports);
    src = ensureWrappedInLayout(src, titleFromPath(rel));
    if (group) src = injectSidebar(src, group.listVar);
  }

  if (src !== original) {
    updated++;
    if (DRY) {
      console.log(`[DRY] Would update: ${rel}`);
    } else {
      // backup original and write
      const bak = abs + '.bak';
      if (!fs.existsSync(bak)) fs.writeFileSync(bak, original);
      fs.writeFileSync(abs, src);
      console.log(`Updated: ${rel}`);
    }
  }
}

console.log(`${DRY ? '[DRY] ' : ''}Done. ${updated} file(s) ${DRY ? 'would be ' : ''}updated, ${templated} index page(s) templated.`);

