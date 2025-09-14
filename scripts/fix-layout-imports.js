// scripts/fix-layout-imports.js
import fs from 'fs';
import path from 'path';

const PAGES_ROOT = path.resolve('src/pages');
const LAYOUT_REL   = 'layouts/Site.astro'; // relative to src/

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (e.isFile() && e.name.endsWith('.astro')) files.push(p);
  }
  return files;
}

// compute the correct ../../ prefix from a file under src/pages to src/
function relPrefix(fileAbs) {
  const from = path.dirname(fileAbs);
  const to   = path.resolve('src'); // the folder that contains layouts/
  let rel = path.relative(from, to); // e.g., ".." or "../.."
  if (rel === '') rel = '.';         // same dir (shouldn't happen here)
  // normalize separators to POSIX for Astro imports
  return rel.split(path.sep).join('/');
}

function fixFile(fileAbs) {
  let s = fs.readFileSync(fileAbs, 'utf8');
  const before = s;

  // 1) Remove any alias import of Site.astro
  s = s.replace(
    /import\s+Layout\s+from\s+['"]@layouts\/Site\.astro['"];?\s*/g,
    ''
  );

  // 2) Replace any existing ../layouts/Site.astro at wrong depth
  s = s.replace(
    /import\s+Layout\s+from\s+['"][.\/]+layouts\/Site\.astro['"];?\s*/g,
    ''
  );

  // 3) Ensure there is exactly one correct import at the top of the front-matter
  // Front-matter starts with --- on the first line
  if (!s.startsWith('---')) {
    // If the file lacks front-matter, add it
    const prefix = relPrefix(fileAbs);
    const importLine = `import Layout from '${prefix}/${LAYOUT_REL}';`;
    s = `---\n${importLine}\n---\n${s}`;
  } else {
    const end = s.indexOf('---', 3);
    if (end === -1) return; // malformed; skip
    const fm = s.slice(0, end + 3);
    const body = s.slice(end + 3);
    const prefix = relPrefix(fileAbs);
    const importLine = `import Layout from '${prefix}/${LAYOUT_REL}';`;

    // put the import right after opening ---
    const fmFixed = fm
      // strip any empty lines immediately after ---
      .replace(/^---\s*\n+/m, '---\n')
      // inject our import after the first ---
      .replace(/^---\n/m, `---\n${importLine}\n`);

    s = fmFixed + body;
  }

  // 4) Ensure the page is wrapped in <Layout>…</Layout> (non-destructive)
  if (!/<Layout[\s>]/.test(s)) {
    s = s.replace(/^---[\s\S]*?---\n?/, (m) => m + `<Layout title="Untitled">\n`);
    s += `\n</Layout>\n`;
  }

  if (s !== before) {
    fs.writeFileSync(fileAbs, s, 'utf8');
    console.log('Updated', path.relative(PAGES_ROOT, fileAbs));
  }
}

for (const f of walk(PAGES_ROOT)) fixFile(f);
console.log('Done.');

