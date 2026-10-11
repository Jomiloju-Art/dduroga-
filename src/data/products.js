/**
 * Catalog helpers on top of catalog.generated.js (storefront snapshot).
 * Product records: { slug, title, fullTitle, type, vendor, tags, img, imgs, desc, hasDesc }
 */
import { catalog, zoneMeta } from './catalog.generated.js';

export const zones = zoneMeta; // { id: head|hand|body|feet, label, blurb }

export const categories = zoneMeta.map((z) => ({
  id: z.id,
  label: z.label,
  short: z.id.charAt(0).toUpperCase() + z.id.slice(1),
  blurb: z.blurb,
}));

export const protectionZones = zoneMeta.map((z) => ({ id: z.id, label: z.id === 'body' ? 'Body' : z.id === 'hand' ? 'Hand' : z.id === 'head' ? 'Head' : 'Feet' }));

/** Canonical hazard vocabulary (labels shown as chips; counts come from product tags). */
export const hazardNames = {
  cut: 'Cut', abrasion: 'Abrasion', puncture: 'Puncture', impact: 'Impact',
  heat: 'Heat', cold: 'Cold', chemical: 'Chemical Splash', oil: 'Oil',
  grip: 'Grip', dexterity: 'Dexterity', dirt: 'Dirt', dust: 'Dust',
  vapour: 'Gas & Vapour', splash: 'Splash', fog: 'Fog', uv: 'UV Radiation',
  flame: 'Fire / Flame', electric: 'Electric Shock', staticElectric: 'Static Electric',
  slip: 'Slip', water: 'Water', rain: 'Rain', lowVisibility: 'Low Visibility',
  biohazard: 'Bio Hazard', spark: 'Spark', fallingObject: 'Falling Object',
};

/** Canonical industry catalogue (labels shown as chips; counts come from product tags). */
export const industryCatalog = [
  { slug: 'construction', label: 'Construction & Civil', kw: ['construction'] },
  { slug: 'automotive', label: 'Automobile', kw: ['automobile', 'auto ancillary'] },
  { slug: 'oil-gas', label: 'Oil & Gas', kw: ['oil & gas', 'oil and gas'] },
  { slug: 'mining', label: 'Mining', kw: ['mining', 'metallurgy'] },
  { slug: 'manufacturing', label: 'Manufacturing', kw: ['manufacturing'] },
  { slug: 'food-beverage', label: 'Food & Beverage', kw: ['food', 'beverage'] },
  { slug: 'pharma', label: 'Pharmaceuticals', kw: ['pharma', 'biotechnology'] },
  { slug: 'agriculture', label: 'Agriculture', kw: ['agriculture', 'horticulture', 'forestry'] },
  { slug: 'logistics', label: 'Logistics', kw: ['logistics', 'transportation', 'warehousing'] },
  { slug: 'chemicals', label: 'Chemical & Paint', kw: ['chemical', 'paint'] },
  { slug: 'construction-civil', label: 'Iron & Steel', kw: ['iron', 'steel'] },
  { slug: 'welding', label: 'Welding', kw: ['welding'] },
  { slug: 'electronics', label: 'Electronics & IT', kw: ['electronics', 'it'] },
  { slug: 'heavy-engineering', label: 'Heavy Engineering', kw: ['heavy engineering'] },
  { slug: 'aero', label: 'Aerospace & Aviation', kw: ['aerospace', 'aviation'] },
  { slug: 'defence', label: 'Defence & Security', kw: ['defence', 'security'] },
  { slug: 'material-handling', label: 'Material Handling', kw: ['material handling'] },
];

export const allProducts = Object.values(catalog).flat();
export const products = allProducts; // alias used by some consumers

export const productsByZone = (id) => catalog[id] || [];
export const zoneById = (id) => zoneMeta.find((z) => z.id === id);
export const categoryById = (id) => categories.find((c) => c.id === id);
export const zoneOf = (product) => {
  for (const z of zoneMeta) {
    if (catalog[z.id].some((p) => p.slug === product.slug)) return z;
  }
  return null;
};

export const findProduct = (slug) => allProducts.find((p) => p.slug === slug);

const haystack = (p) => `${p.title} ${p.type} ${(p.tags || []).join(' ')}`.toLowerCase();
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

export const byHazard = (id) => {
  const label = hazardNames[id];
  if (!label) return [];
  const n = norm(label);
  return allProducts.filter((p) => {
    const exact = (p.tags || []).some((t) => norm(t) === n);
    if (exact) return true;
    if (n.length <= 6) return haystack(p).includes(label.toLowerCase());
    return false;
  });
};

export const byIndustry = (slug) => {
  const entry = industryCatalog.find((i) => i.slug === slug);
  if (!entry) return [];
  return allProducts.filter((p) => entry.kw.some((k) => haystack(p).includes(k)));
};

export const withImage = (list) => list.filter((p) => p.img);

/**
 * Mallcom's feed reuses the zone name as a product `type` on 54 records
 * ("Head", "HAND PROTECTION"), which reads as a bug wherever it is printed —
 * a heading called "Head" under a product filed under Head Protection.
 *
 * `p.type` is deliberately left intact: ProductDetailPage builds its
 * tag-suppression set from the raw value, so blanking it would let the
 * "Head" tag chip reappear. Callers that *display* the type use this.
 */
const ZONE_TYPE = /^(head|hand|body|feet)(\s+protection)?$/i;

/** Display label for a product's `type`; '' when it only restates the zone. */
export const typeLabel = (p) => {
  const t = String(p?.type || '').trim();
  if (ZONE_TYPE.test(t)) return '';
  // A handful arrive fully shouted ("HI VISIBILITY WORKWEAR", "WELDER GLOVES").
  // Title-case those, but leave short acronyms (FR, PPE, UV) untouched.
  if (t.length > 12 && t === t.toUpperCase() && t.includes(' ')) {
    return t.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  }
  return t;
};

/** Case-insensitive search over title, type, SKUs and tags. */
export const searchProducts = (q, limit) => {
  const query = (q || '').trim().toLowerCase();
  if (!query) return [];
  const qs = query.split(/\s+/);
  const scored = allProducts
    .map((p) => {
      const skus = (p.variants || []).map((v) => v.s).join(' ');
      const hay = `${p.title} ${p.fullTitle} ${p.type} ${p.slug} ${skus} ${(p.tags || []).join(' ')}`.toLowerCase();
      const hits = qs.filter((t) => hay.includes(t)).length;
      return { p, hits };
    })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .map((x) => x.p);
  return limit ? scored.slice(0, limit) : scored;
};
