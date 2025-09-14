// scripts/upgrade-pages.js
// Usage:
//   node scripts/upgrade-pages.js --dry-run   # show planned edits
//   node scripts/upgrade-pages.js             # apply edits and write .bak backups
//
// What it does:
// 1) For ALL .astro files under src/pages: ensure Layout import uses @layouts/Page.astro,
//    replacing any prior Site.astro/BlogPost.astro/Page.astro relative import.
// 2) For known section index pages, overwrite content with a LinkList template
//    wired to your @links/registry entries.
// 3) Writes a .bak alongside any file it modifies.

import fs from "fs";
import path from "path";

const DRY = process.argv.includes("--dry-run");
const root = process.cwd();

const pagesRoot = path.join(root, "src", "pages");
const posix = (p) => p.split(path.sep).join("/");

// Map of section index pages to their registry arrays and titles.
const INDEX_TEMPLATES = {
  "src/pages/travel/index.astro": {
    title: "Travel",
    registryImport: "{ travelTrips }",
    listVar: "travelTrips",
  },
  "src/pages/travel/trips/index.astro": {
    title: "Trips",
    registryImport: "{ travelTrips }",
    listVar: "travelTrips",
  },
  "src/pages/photography/index.astro": {
    title: "Photography",
    registryImport: "{ photographySections }",
    listVar: "photographySections",
  },
  "src/pages/photography/awards/index.astro": {
    title: "Photography — Awards",
    registryImport: "{ photographyAwards }",
    listVar: "photographyAwards",
  },
  "src/pages/photography/portfolio/index.astro": {
    // Leave as a stub list if you want; comment this block to skip overwrite.
    title: "Photography — Portfolio",
    registryImport: "{ }",
    listVar: null, // no list yet
  },
  "src/pages/music/index.astro": {
    title: "Music",
    registryImport: "{ musicSections }",
    listVar: "musicSections",
  },
  "src/pages/music/concerts/index.astro": {
    title: "Concerts",
    registryImport: "{ musicConcerts }",
    listVar: "musicConcerts",
  },
  "src/pages/music/favorites/index.astro": {
    title: "Favorite Songs",
    registryImport: "{ musicFavorites }",
    listVar: "musicFavorites",
  },
  "src/pages/academics/index.astro": {
    title: "Academics",
    registryImport: "{ academicsSections }",
    listVar: "academicsSections",
  },
  "src/pages/academics/summer-programs/index.astro": {
    title: "Summer Programs",
    registryImport: "{ academicsSummerPrograms }",
    listVar: "academicsSummerPrograms",
  },
  "src/pages/academics/years/index.astro": {
    title: "Academic Years",
    registryImport: "{ academicsYears }",
    listVar: "academicsYears",
  },
  "src/pages/geography/index.astro": {
    title: "Geography",
    registryImport: "{ geographyLinks }",
    listVar: "geographyLinks", // currently [] in your registry
  },
  "src/pages/guardian-arts/index.astro": {
    title: "Guardian Arts",
    registryImport: "{ guardianArtsLinks }",
    listVar: "guardianArtsLinks", // currently [] in your registry
  },
};

// ---------- utilities ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name.endsWith(".astro")) out.push(p);
  }
  return out;
}

function backupWrite(fp, s) {
  const bak = fp + ".bak";
  if (!DRY) {
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, fs.readFileSync(fp));
    fs.writeFileSync(fp, s);
  }
}

// Inject ensures there is a front-matter block and that it contains our Layout import exactly once.
function ensureLayoutImport(src) {
  const importLine = `import Layout from '@layouts/Page.astro';`;
  let s = src;

  // Remove any previous Layout imports pointing to layouts/* (relative or alias)
  s = s.replace(
    /import\s+Layout\s+from\s+['"][^'"]*layouts\/(?:Site|BlogPost|Page)\.astro['"];\s*/g,
    ""
  );
  s = s.replace(
    /import\s+Layout\s+from\s+['"]@layouts\/(?:Site|BlogPost|Page)\.astro['"];\s*/g,
    ""
  );

  // Has front-matter?
  if (!s.startsWith("---")) {
    s = `---\n${importLine}\n---\n${s}`;
    return s;
  }
  const end = s.indexOf("\n---", 3);
  if (end === -1) {
    // malformed front-matter; normalize
    return `---\n${importLine}\n---\n` + s.replace(/^---/, "");
  }
  const head = s.slice(0, end + 4); // include closing '---\n'
  const body = s.slice(end + 4);

  // If the import is already there, keep as-is; otherwise insert after first line.
  if (!head.includes(importLine)) {
    const lines = head.split("\n");
    // insert after opening '---'
    lines.splice(1, 0, importLine);
    s = lines.join("\n") + body;
  }
  return s;
}

function wrapWithLayoutIfMissing(src, title) {
  if (/<Layout[\s>]/.test(src)) return src; // already wrapped
  // insert opening tag after front-matter; append closing tag at end
  const openTag = `<Layout title="${title}">\n`;
  const closeTag = `\n</Layout>\n`;
  if (!src.startsWith("---")) return openTag + src + closeTag;
  const end = src.indexOf("\n---", 3);
  if (end === -1) return openTag + src + closeTag;
  return src.slice(0, end + 4) + openTag + src.slice(end + 4) + closeTag;
}

function titleFromPath(rel) {
  // e.g., src/pages/travel/trips/amsterdam-2025.astro
  const name = rel.endsWith("index.astro")
    ? path.basename(path.dirname(rel))
    : path.basename(rel, ".astro");
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase()); // crude Title Case
}

function renderIndexTemplate({ title, registryImport, listVar }) {
  const imports =
    listVar && registryImport && registryImport.trim() !== "{}"
      ? `import LinkList from '@components/LinkList.astro';\nimport ${registryImport} from '@links/registry';`
      : `/* no list for this section yet; add when ready */`;
  const body =
    listVar && registryImport && registryImport.trim() !== "{}"
      ? `  <LinkList items={${listVar}} />\n`
      : `  <p>This section will be populated soon.</p>\n`;
  return `---
import Layout from '@layouts/Page.astro';
${imports}
---
<Layout title="${title}">
${body}</Layout>
`;
}

// ---------- main ----------
const files = walk(pagesRoot);
let changed = 0;
let templated = 0;

for (const abs of files) {
  const rel = posix(path.relative(root, abs)); // e.g., src/pages/...
  let s = fs.readFileSync(abs, "utf8");
  const original = s;

  // 1) Ensure Layout import is @layouts/Page.astro
  s = ensureLayoutImport(s);

  // 2) For known index pages, overwrite with LinkList template
  if (INDEX_TEMPLATES[rel]) {
    s = renderIndexTemplate(INDEX_TEMPLATES[rel]);
    templated++;
  } else {
    // 3) For other pages, ensure they are wrapped in <Layout>...</Layout>
    const title = titleFromPath(rel);
    s = wrapWithLayoutIfMissing(s, title);
  }

  if (s !== original) {
    changed++;
    if (DRY) {
      console.log(`[DRY] Would update: ${rel}`);
    } else {
      backupWrite(abs, s);
      console.log(`Updated: ${rel}`);
    }
  }
}

console.log(
  `${DRY ? "[DRY] " : ""}Done. ${changed} file(s) ${DRY ? "would be " : ""}updated, ${templated} section index(es) templated.`
);

