// scripts/sidebarize-linklists.mjs
import fs from 'fs'; import path from 'path';
const ROOT = process.cwd(); const PAGES = path.join(ROOT, 'src', 'pages');
function walk(d, out=[]) { for (const e of fs.readdirSync(d,{withFileTypes:true})) {
  const p = path.join(d,e.name); e.isDirectory()?walk(p,out):e.isFile()&&p.endsWith('.astro')&&out.push(p);} return out; }
for (const f of walk(PAGES)) {
  let s = fs.readFileSync(f,'utf8'); const before = s;
  // ensure Layout import exists (harmless if already there)
  if (!/from ['"]@layouts\/Page\.astro['"]/.test(s)) {
    s = s.replace(/^---\s*\n/, m => `${m}import Layout from '@layouts/Page.astro';\n`);
  }
  // add slot + orientation to LinkList uses that are missing them
  s = s.replace(/<LinkList\s+items=\{/g, '<LinkList slot="sidebar" orientation="vertical" items={');
  if (s !== before) { fs.writeFileSync(f,s); console.log('Updated', path.relative(ROOT,f)); }
}
console.log('Done.');

