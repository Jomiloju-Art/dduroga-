/**
 * Search wording: page titles, meta descriptions and the short intro shown on
 * product listings. Shared by the pages (usePageMeta, in the browser) and by
 * scripts/postbuild.mjs (static HTML for crawlers), so both say the same thing.
 *
 * Built only from catalogue data and claims the site already makes (stocked
 * in Lagos, supplied across Nigeria, quotes on request). The words are the
 * ones Nigerian buyers search with: the product type plus "Nigeria" or
 * "Lagos".
 */
import { rangeLabel, rangeById, zones, hazardNames, industryCatalog, productsByRange, productsByZone, byIndustry, byHazard, allProducts } from '../data/products.js';

export const SITE = 'DDUROGA Safety';
export const HOME_TITLE = 'DDUROGA Safety | PPE Supplier in Lagos, Nigeria';
export const HOME_DESCRIPTION =
  'Certified PPE supplier in Lagos, Nigeria: safety boots, gloves, helmets, hi-vis and workwear for oil & gas, construction and manufacturing. Request a quote online.';

const clip = (s, n = 158) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
};
/** Sentence case for labels: "Feet Protection" -> "feet protection", but "PVC" and "FR" stay. */
const lower = (s) => s.split(" ").map((w) => (/^[A-Z][a-z]/.test(w) ? w.toLowerCase() : w)).join(" ");

/** The most common printed standards in a set of products, e.g. "EN 388, EN 407". */
function topStandards(list, n = 3) {
  const count = new Map();
  for (const p of list) for (const s of p.catalogueStandards || []) {
    const code = (s.code || '').trim();
    if (code) count.set(code, (count.get(code) || 0) + 1);
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([c]) => c);
}

/** The most common product types in a set, e.g. ["Safety shoes", "Welder gloves"]. */
function topRanges(list, n = 3) {
  const count = new Map();
  for (const p of list) { const l = rangeLabel(p); if (l) count.set(l, (count.get(l) || 0) + 1); }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([l]) => l);
}
const joinList = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);

/* ---------- product pages ---------- */

export function productTitle(p) {
  const name = p.fullTitle || p.title;
  const type = rangeLabel(p);
  const typeInName = type && name.toLowerCase().includes(type.toLowerCase());
  return type && !typeInName ? `${name} ${type} in Nigeria` : `${name} in Nigeria`;
}

export function productDescription(p) {
  const type = rangeLabel(p);
  const stds = (p.catalogueStandards || []).map((s) => s.code).filter(Boolean).slice(0, 2);
  const lead = `${p.title}${type ? ` ${lower(type)}` : ''}${stds.length ? ` (${stds.join(', ')})` : ''} from DDUROGA Safety, Lagos, supplied across Nigeria.`;
  return clip(`${lead} ${p.desc || ''}`);
}

/* ---------- product listings ---------- */

/** What a /products URL is showing, resolved the same way ProductsPage does. */
export function listingFor({ cat, range, industry, hazard }) {
  if (hazard && hazardNames[hazard]) return { kind: 'hazard', label: hazardNames[hazard], list: byHazard(hazard) };
  if (industry) {
    const i = industryCatalog.find((x) => x.slug === industry);
    if (i) return { kind: 'industry', label: i.label, list: byIndustry(industry) };
  }
  const r = range && rangeById(range);
  if (r) return { kind: 'range', label: r.label, list: productsByRange(r.id) };
  const z = zones.find((x) => x.id === cat);
  if (z) return { kind: 'zone', label: z.label, list: productsByZone(z.id) };
  return { kind: 'all', label: 'All products', list: allProducts };
}

export function listingTitle({ kind, label }) {
  if (kind === 'industry') return `PPE for ${label} in Nigeria`;
  if (kind === 'hazard') return `${label} Protection PPE in Nigeria`;
  if (kind === 'all') return 'PPE & Safety Equipment in Nigeria';
  return `${label} in Nigeria`;
}

export function listingDescription({ kind, label, list }) {
  const n = list.length;
  const what = kind === 'industry' ? `PPE for ${lower(label)} sites`
    : kind === 'hazard' ? `PPE rated for ${lower(label)} protection`
      : kind === 'all' ? 'safety boots, gloves, helmets, hi-vis and workwear'
        : lower(label);
  return clip(`${n} certified products: ${what} from DDUROGA Safety, stocked in Lagos and supplied across Nigeria. Request a quote online.`);
}

/** The sentence or two shown under a listing's heading. */
export function listingIntro({ kind, label, list }) {
  const n = list.length;
  const stds = topStandards(list);
  const types = topRanges(list).map(lower);
  const tested = stds.length ? ` Tested to ${joinList(stds)}.` : '';
  const where = 'Stocked in Lagos and supplied to sites across Nigeria.';
  switch (kind) {
    case 'range':
      return `${label} from the Mallcom 2025 catalogue: ${n} models.${tested} ${where}`;
    case 'zone':
      return `${n} ${lower(label)} products, including ${joinList(types)}.${tested} ${where}`;
    case 'industry':
      return `PPE for ${lower(label)} in Nigeria: ${n} certified products, led by ${joinList(types)}. ${where}`;
    case 'hazard':
      return `${n} products rated for ${lower(label)} protection, including ${joinList(types)}.${tested} ${where}`;
    default:
      return `The full DDUROGA Safety range: ${n} certified products for head, hand, body and feet protection. ${where}`;
  }
}

/** Every listing URL worth indexing, for the sitemap and static pages. */
export function listingRoutes() {
  const out = [];
  for (const z of zones) out.push({ query: `cat=${z.id}`, params: { cat: z.id } });
  for (const r of rangeIds()) out.push({ query: `range=${r}`, params: { range: r } });
  for (const i of industryCatalog) if (byIndustry(i.slug).length) out.push({ query: `industry=${i.slug}`, params: { industry: i.slug } });
  return out;
}
const rangeIds = () => [...new Set(allProducts.map((p) => p.range).filter(Boolean))];
