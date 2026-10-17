import { sizingFor } from '../data/sizes.js';

/**
 * Short spec lines for product cards ("Standard · EN 388 4133X", "Sizes ·
 * 6–11"), so buyers can compare products before opening them. Everything comes
 * from the product's Mallcom 2025 catalogue row and the size rules in
 * data/sizes.js, the same data the product page shows.
 */

/** Variant labels are "M", "9", "Blue" or "M / Blue". */
export const SIZE_RE = /^(\d+(\.\d+)?|XS|S|M|L|XL|XXL|XXXL|\dXL)$/i;
export const sizePart = (c) => { const v = String(c || '').split('/')[0].trim(); return SIZE_RE.test(v) ? v.toUpperCase() : null; };
export const colourPart = (c) => {
  const parts = String(c || '').split('/').map((x) => x.trim()).filter(Boolean);
  if (parts.length > 1) return parts.slice(1).join(' / ');
  return parts[0] && !SIZE_RE.test(parts[0]) ? parts[0] : null;
};

/** The headline standard: one with a performance code, else an EN/ISO one, else the first. */
export const firstStandard = (p) => {
  const list = p.catalogueStandards || [];
  const s = list.find((x) => x.rating) || list.find((x) => /^EN/.test(x.code)) || list[0];
  return s ? (s.rating ? `${s.code} ${s.rating}` : s.code) : '';
};

/** Up to `max` rows of { label, value }, most useful first. */
export function productSpecs(p, max = 3) {
  const rows = [];
  const std = firstStandard(p);
  if (std) rows.push({ label: 'Standard', value: std });

  const sizing = sizingFor(p);
  if (sizing) rows.push({ label: 'Sizes', value: sizing.label.replace(/^Sizes /, '') });

  const colours = new Set((p.variants || []).map((v) => colourPart(v.c)).filter(Boolean));
  if (colours.size > 1) rows.push({ label: 'Colours', value: `${colours.size} options` });

  const others = (p.catalogueStandards || []).map((s) => s.code).filter((c) => c && !std.startsWith(c));
  if (others.length) rows.push({ label: 'Also', value: [...new Set(others)].slice(0, 2).join(', ') });

  if (p.ce) rows.push({ label: 'CE', value: 'Marked' });
  return rows.slice(0, max);
}
