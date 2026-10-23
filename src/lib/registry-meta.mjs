/** Helpers that read the link registry for the homepage poster. The registry lists are newest-first. */

/** "Egypt 2025" -> { name: "Egypt", year: 2025 }; uses the last 4-digit year; year is null when absent. */
export function splitYear(label) {
  const m = [...label.matchAll(/\b(?:19|20)\d{2}\b/g)].pop();
  if (!m) return { name: label.trim(), year: null };
  const name = (label.slice(0, m.index) + label.slice(m.index + 4)).replace(/\s{2,}/g, ' ').trim();
  return { name, year: Number(m[0]) };
}

/** The first `n` entries of a newest-first list. */
export const latest = (items, n) => items.slice(0, n);

/** The award flagged `featured: true`, or else the first award. */
export const featuredAward = (items) => items.find((i) => i.featured) ?? items[0];

/** School-year season for a date: "2026–27" from August 2026 through July 2027. */
export function seasonLabel(date) {
  const start = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}–${String(start + 1).slice(2)}`;
}
