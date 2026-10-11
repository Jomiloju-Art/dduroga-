/**
 * Display-layer formatting for catalogue strings.
 *
 * The supplier data is inconsistent: 39 distinct `type` values including
 * "HAND PROTECTION", "Hand gloves", "Safety Gloves", "Mechanical Gloves",
 * "COTTON KNITTED GLOVES" and 42 products with no type at all. This normalises
 * case for display only — the source data is left untouched, so nothing that
 * depends on the raw value changes.
 */

/** Words kept lowercase inside a title (unless first). */
const MINOR = new Set(['and', 'or', 'the', 'of', 'for', 'with', 'in', 'on', 'to', 'per']);

/** Corrections for strings that are simply wrong in the source. */
const SPELLING = [
  [/\bgoogles\b/gi, 'goggles'],
  [/\bfacemask\b/gi, 'face mask'],
  [/\bbumpcap\b/gi, 'bump cap'],
];

const titleCase = (s) =>
  s
    .split(' ')
    .map((word, i) => {
      if (!word) return word;
      // Keep short all-caps tokens (FR, UV, PVC) and anything containing a
      // digit (S1P, P3, 200J) exactly as written — title-casing mangles them.
      if (/[0-9]/.test(word)) return word.toUpperCase();
      if (word.length <= 3 && word === word.toUpperCase() && /^[A-Z]+$/.test(word)) return word;
      const lower = word.toLowerCase();
      if (i > 0 && MINOR.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');

/** Strip to comparable letters/digits. */
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * A presentable product type, or an empty string when there is nothing useful
 * to say.
 *
 * Returns '' in two cases, both of which previously produced a duplicate line on
 * every product card:
 *   - the record has no type, so it was falling back to the zone label and
 *     printing "HEAD PROTECTION" directly beneath the "HEAD PROTECTION" chip;
 *   - the type merely restates the zone ("Head" under "Head Protection").
 * Cards got two labels meaning the same thing, in the space where a real spec
 * should go. Showing nothing is better than showing it twice.
 */
export function displayType(product, zoneLabel) {
  let raw = (product?.type || '').trim().replace(/\s+/g, ' ');
  for (const [pattern, replacement] of SPELLING) raw = raw.replace(pattern, replacement);
  if (!raw) return '';

  const out = titleCase(raw);
  if (zoneLabel) {
    const a = norm(out);
    const b = norm(zoneLabel);
    if (a && b && (a === b || a.startsWith(b) || b.startsWith(a))) return '';
  }
  return out;
}
