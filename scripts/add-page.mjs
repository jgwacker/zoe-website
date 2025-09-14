// scripts/add-page.mjs
// Usage:
//   node scripts/add-page.mjs /travel/trips/amsterdam-2025 "Amsterdam 2025" travelTrips
// Optional flags:
//   --desc "Short description"
//   --force   (overwrite page file if it already exists)
// Notes:
// - Requires aliases @layouts, @components, @links.
// - Expects registry at src/links/registry.ts with: export const <listVar> = [ ... ];

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node scripts/add-page.mjs <routePath> <Title> <listVar> [--desc "…"] [--force]');
  process.exit(1);
}

// -------- parse CLI --------
const flags = new Set(args.filter((a) => a.startsWith('--')));
const pos = args.filter((a) => !a.startsWith('--'));
const routePathInput = pos[0];               // e.g., /travel/trips/amsterdam-2025 or with .astro
const titleInput = pos[1];                   // e.g., "Amsterdam 2025"
const listVar = pos[2];                      // e.g., travelTrips
const force = flags.has('--force');

function getFlagValue(name) {
  const i = args.indexOf(name);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  const match = args.find((a) => a.startsWith(name + '='));
  return match ? match.split('=').slice(1).join('=') : '';
}
const descInput = getFlagValue('--desc') || '';

function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/'/g, '\\\''); }

// -------- derive paths --------
const routeNoExt = routePathInput.replace(/\.astro$/i, '');
const routePath = routeNoExt.startsWith('/') ? routeNoExt : '/' + routeNoExt;

const pageRel = path.join('src', 'pages', routePath.replace(/^\//, '') + '.astro');
const pageAbs = path.resolve(pageRel);

// for registry
const registryAbs = path.resolve('src/links/registry.ts');

// -------- checks --------
if (!fs.existsSync('src/layouts/Page.astro')) {
  console.error('Missing src/layouts/Page.astro. Create it before running this script.');
  process.exit(1);
}
if (!fs.existsSync('src/components/LinkList.astro')) {
  console.error('Missing src/components/LinkList.astro. Create it before running this script.');
  process.exit(1);
}
if (!fs.existsSync(registryAbs)) {
  console.error('Missing src/links/registry.ts. Create it before running this script.');
  process.exit(1);
}

// -------- create page file --------
fs.mkdirSync(path.dirname(pageAbs), { recursive: true });

if (fs.existsSync(pageAbs) && !force) {
  console.error(`Page already exists: ${pageRel} (use --force to overwrite)`);
} else {
  const pageStub = `---
import Layout   from '@layouts/Page.astro';
import LinkList from '@components/LinkList.astro';
import { ${listVar} } from '@links/registry';
---
<Layout title='${esc(titleInput)}' description='${esc(descInput)}'>
  <LinkList slot="sidebar" items={${listVar}} orientation="vertical" />
  <p>Stub page for ${esc(titleInput)}. Replace with real content.</p>
</Layout>
`;
  fs.writeFileSync(pageAbs, pageStub, 'utf8');
  console.log(`Created: ${pageRel}`);
}

// -------- update registry --------
let reg = fs.readFileSync(registryAbs, 'utf8');

const re = new RegExp(`export\\s+const\\s+${listVar}\\s*=\\s*\\[([\\s\\S]*?)\\];`, 'm');
const m = reg.match(re);
if (!m) {
  console.error(`Could not find array "export const ${listVar} = [ ... ];" in src/links/registry.ts`);
  process.exit(1);
}

// avoid duplicate
if (m[1].includes(`href: '${routePath}'`)) {
  console.log(`Registry already contains href '${routePath}' in ${listVar}; skipping append.`);
} else {
  const item = `  { href: '${routePath}', label: '${esc(titleInput)}' },`;
  // Append before closing bracket, preserving existing inner content & indentation
  const inner = m[1];
  const newInner = inner.trim().length ? inner.replace(/\s*$/,'') + '\n' + item + '\n' : '\n' + item + '\n';
  reg = reg.replace(re, `export const ${listVar} = [${newInner}];`);
  fs.writeFileSync(registryAbs, reg, 'utf8');
  console.log(`Updated registry: ${listVar} += { href: '${routePath}', label: '${titleInput}' }`);
}

console.log('Done.');
