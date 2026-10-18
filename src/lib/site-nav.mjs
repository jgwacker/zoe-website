/** Primary site navigation, shared by the header and the page title band. */
export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/travel', label: 'Travel' },
  { href: '/photography', label: 'Photography' },
  { href: '/music', label: 'Music' },
  { href: '/geography', label: 'Geography' },
  { href: '/guardian-arts', label: 'Guardian Arts' },
  { href: '/academics', label: 'Academics' },
];

/** True when `path` is the nav item's page or one of its sub-pages. */
export function isActive(href, path) {
  const p = path.replace(/\/+$/, '') || '/';
  if (href === '/') return p === '/';
  return p === href || p.startsWith(href + '/');
}

/** The section label for a URL path ("/photography/awards/x/" -> "Photography"), or ''. */
export function sectionLabel(path) {
  const first = path.split('/').filter(Boolean)[0];
  if (!first) return '';
  return NAV.find((n) => n.href === '/' + first)?.label ?? '';
}
