/**
 * Catalog helpers on top of catalog.slim.generated.js, the finished product
 * list written at build time by scripts/build-catalog.mjs from catalogSource.js.
 * Product records: { slug, title, fullTitle, type, vendor, tags, img, imgs, desc, hasDesc }
 *
 * Each record is enriched here with:
 *   key        the storefront slug. Spec data, reviews, videos and diagrams are
 *              keyed by it, so look those up by `key`, never by `slug`.
 *   slug       the public URL slug. Usually the same as `key`; see SLUG_RENAMES.
 *   range      sub-category id within the zone (rangeMeta), from Mallcom's 2025
 *              catalogue where the product is printed in it, inferred otherwise.
 *   collection Mallcom's catalogue tier ("Luxury footwear"), when printed.
 *   catalogueStandards  [{ code, rating? }] as printed in the catalogue.
 *   catalogueSymbols    glossary icon names printed on the catalogue row.
 *   ce         true when the catalogue row carries the CE mark.
 *
 * Only products printed in Mallcom's 2025 catalogue are listed (client
 * decision, Oct 2026). The storefront snapshot still holds the others; they
 * are filtered out here, not deleted, so the decision is easy to revisit.
 * Catalogue products the storefront never carried come from `addedProducts`
 * (photos and copy taken from the catalogue page itself).
 */
import { catalog, zoneMeta, rangeMeta, SLUG_RENAMES } from './catalog.slim.generated.js';
import { RANGE_INDUSTRIES, SYMBOL_INDUSTRIES, RANGE_EXCLUDE } from './productIndustries.js';
import { TRENDING } from './trending.js';

export { SLUG_RENAMES };

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

/**
 * Canonical industry catalogue (labels shown as chips).
 *
 * `kw` are whole tags, compared after normalising (case, spacing, "&"/"and").
 * They used to be substrings of a title+type+tags haystack, which is how every
 * product containing the letters "it" (kit, white, fitting) landed under
 * Electronics & IT. Tags are one of three inputs to product.industries; the
 * per-range defaults live in productIndustries.js.
 */
export const industryCatalog = [
  { slug: 'construction', label: 'Construction & Civil', kw: ['construction', 'construction & civil'] },
  { slug: 'automotive', label: 'Automobile', kw: ['automobile', 'automobile & auto ancillary', 'auto ancillary'] },
  { slug: 'oil-gas', label: 'Oil & Gas', kw: ['oil and gas', 'oil & gas', 'petrochemical'] },
  { slug: 'mining', label: 'Mining', kw: ['mining', 'mining & metallurgy', 'metallurgy', 'metullargy'] },
  { slug: 'manufacturing', label: 'Manufacturing', kw: ['manufacturing'] },
  { slug: 'food-beverage', label: 'Food & Beverage', kw: ['food & beverage', 'food and beverage', 'food', 'beverage'] },
  { slug: 'pharma', label: 'Pharmaceuticals', kw: ['pharmaceutical', 'pharmaceuticals', 'pharmaceutical industry', 'biotechnology'] },
  { slug: 'agriculture', label: 'Agriculture', kw: ['agriculture', 'horticulture', 'forestry'] },
  { slug: 'logistics', label: 'Logistics', kw: ['logistics', 'logistics & transportation', 'transportation', 'warehousing and assembling'] },
  { slug: 'chemicals', label: 'Chemical & Paint', kw: ['chemical & paint', 'paint', 'petrochemical'] },
  { slug: 'construction-civil', label: 'Iron & Steel', kw: ['iron & steel', 'iron and steel'] },
  // Welder gloves come in through their range; their "welder gloves" tag is a
  // product type, and listing it as a keyword made the PDP show it as an industry.
  { slug: 'welding', label: 'Welding', kw: ['welding'] },
  { slug: 'electronics', label: 'Electronics & IT', kw: ['electronics & it', 'electronics'] },
  { slug: 'heavy-engineering', label: 'Heavy Engineering', kw: ['heavy engineering'] },
  { slug: 'aero', label: 'Aerospace & Aviation', kw: ['aerospace & aviation', 'aerospace', 'aviation'] },
  { slug: 'defence', label: 'Defence & Security', kw: ['defence', 'security', 'defence & security'] },
  { slug: 'material-handling', label: 'Material Handling', kw: ['material handling'] },
];

/**
 * How each hazard is recognised: whole tags (same normalising as industries)
 * plus ranges whose whole purpose is that hazard. Short labels used to be
 * substring-matched, so "Oil" caught every helmet tagged "Oil and Gas", while
 * the long labels needed an exact tag and missed obvious products: all 13 FR
 * coveralls were absent from Fire / Flame, every hi-vis vest from Low Visibility.
 * `symbols` are page-142 glossary icons printed on the product's catalogue row.
 */
const HAZARD_MATCH = {
  cut: { kw: ['cut', 'cut resistant', 'cut resistant gloves', 'cut resistant nitrile gloves'], ranges: ['cut-resistant'], symbols: ['Cut Proof', 'High Cut'] },
  abrasion: { kw: ['abrasion'], symbols: ['Abrasion'] },
  puncture: { kw: ['puncture'], symbols: ['Puncture', 'Puncture Resistant'] },
  impact: { kw: ['impact', 'impact resistant gloves', 'impact resistant safety shoes'], symbols: ['Hand Impact', 'Impact Resistant', 'Head Impact', 'Projectiles'] },
  heat: { kw: ['heat', 'heat resistant welder gloves'], ranges: ['welder', 'welding-wear'], symbols: ['Heat', 'Infrared'] },
  cold: { kw: ['cold', 'cold and chill', 'winter gloves', 'leather winter gloves', 'thermal gloves'], ranges: ['cryo', 'thermal'], symbols: ['Cryogenic', 'Cold Insulation', 'Thermal Insulation'] },
  chemical: { kw: ['chemical splash', 'chemical'], ranges: ['gauntlets', 'supplementary'], symbols: ['Chemical Protection'] },
  oil: { kw: ['oil'], symbols: ['Oil Resistant', 'Hydrocarbon Resistant'] },
  grip: { kw: ['grip'] },
  dexterity: { kw: ['dexterity'], symbols: ['Dexterity'] },
  dirt: { kw: ['dirt'] },
  dust: { kw: ['dust', 'anti-dust goggles', 'air contamination'], ranges: ['respirators'], symbols: ['Dust', 'Particle resistant'] },
  vapour: { kw: ['gas & vapour', 'gas and vapour', 'vapour'] },
  splash: { kw: ['splash', 'anti-splash goggles'], symbols: ['Splash'] },
  fog: { kw: ['fog', 'anti-fog goggles'], symbols: ['Anti Fog'] },
  uv: { kw: ['uv radiation', 'uv', 'uv protection goggles'], symbols: ['UV'] },
  flame: { kw: ['fire / flame', 'fire', 'flame', 'flame retardant', 'flame resistant', 'flame retardent', 'fr workwear', 'fr garment', 'fr trousers', 'fr bodywear', 'flame retardant trousers', 'multinorm', 'multinorm workwear', 'multinorm trousers'], ranges: ['fr'], symbols: ['Flame'] },
  electric: { kw: ['electric shock'], symbols: ['Electrical Hazard'] },
  staticElectric: { kw: ['static electric', 'static electric shock', 'anti static', 'antistatic'], symbols: ['Antistatic', 'Anti Static'] },
  slip: { kw: ['slip'], symbols: ['Slip Resistant'] },
  water: { kw: ['water', 'waterproof'], symbols: ['Water Repellent'] },
  rain: { kw: ['rain', 'rain coat', 'raincoat', 'rainwear'], ranges: ['rainwear'], symbols: ['Rain'] },
  lowVisibility: { kw: ['low visibility', 'hi vis', 'hi viz', 'high visibility', 'high visibilty vest', 'reflective vests'], ranges: ['hi-vis'], symbols: ['High visibility'] },
  biohazard: { kw: ['bio hazard', 'biohazard'], symbols: ['Bio Hazard', 'Microbe', 'Micro organism'] },
  spark: { kw: ['spark'], symbols: ['Sparks'] },
  fallingObject: { kw: ['falling object'], ranges: ['helmets'], symbols: ['Head Impact'] },
};

export const allProducts = Object.values(catalog).flat();

/**
 * "Featured" order for listings: the client's trending picks first, then
 * products in stock, then the order Mallcom presents them in the 2025
 * catalogue (page number). The storefront's own order was alphabetical, so the
 * hand range used to open on an arm sleeve.
 */
const featuredIndex = new Map(allProducts.map((p, i) => [p.slug, i]));
const inStock = (p) => (p.variants || []).some((v) => v.a);
export const byFeatured = (a, b) => {
  const ta = TRENDING.indexOf(a.slug); const tb = TRENDING.indexOf(b.slug);
  if ((ta >= 0) !== (tb >= 0)) return ta >= 0 ? -1 : 1;
  if (ta >= 0) return ta - tb;
  if (inStock(a) !== inStock(b)) return inStock(a) ? -1 : 1;
  return (a.cataloguePage ?? 999) - (b.cataloguePage ?? 999) || featuredIndex.get(a.slug) - featuredIndex.get(b.slug);
};
export const products = allProducts; // alias used by some consumers

export const productsByZone = (id) => catalog[id] || [];
export const zoneById = (id) => zoneMeta.find((z) => z.id === id);
export const categoryById = (id) => categories.find((c) => c.id === id);
export const zoneOf = (product) => {
  // The PDP calls this before its "unknown slug" redirect, so a bad URL used to
  // throw here and show the error page instead of redirecting to /products.
  if (!product) return null;
  for (const z of zoneMeta) {
    if (catalog[z.id].some((p) => p.slug === product.slug)) return z;
  }
  return null;
};

/**
 * Finds by public slug, or by an old storefront slug (see SLUG_RENAMES). A
 * typed or shared URL in other letter case (/products/APOLLO) also matches;
 * the product page then redirects to the real slug.
 */
export const findProduct = (slug) => {
  if (typeof slug !== 'string') return undefined;
  const find = (x) => { const s = SLUG_RENAMES[x] || x; return allProducts.find((p) => p.slug === s); };
  return find(slug) || find(slug.toLowerCase());
};

const norm = (s) => s.toLowerCase().replace(/\band\b/g, '&').replace(/[^a-z0-9&]+/g, '');
const tagSet = (p) => new Set((p.tags || []).map(norm));
const matches = (p, { kw = [], ranges = [], symbols = [] }) => {
  if (ranges.includes(p.range)) return true;
  if (symbols.some((sym) => p.catalogueSymbols.includes(sym))) return true;
  const tags = tagSet(p);
  return kw.some((k) => tags.has(norm(k)));
};

export const byHazard = (id) => {
  const rule = HAZARD_MATCH[id];
  return rule ? allProducts.filter((p) => matches(p, rule)) : [];
};

/**
 * product.industries: industry slugs, in industryCatalog order. Built from the
 * product's range, its catalogue symbols and its storefront tags (mapped onto
 * the 17 industries), minus sectors excluded for the range. See
 * productIndustries.js. The PDP chips and the Industry filter both read this.
 */
const industriesFor = (p) => {
  const set = new Set(RANGE_INDUSTRIES[p.range] || []);
  for (const s of p.catalogueSymbols) (SYMBOL_INDUSTRIES[s] || []).forEach((i) => set.add(i));
  for (const entry of industryCatalog) if (matches(p, { kw: entry.kw })) set.add(entry.slug);
  for (const x of RANGE_EXCLUDE[p.range] || []) set.delete(x);
  return industryCatalog.map((i) => i.slug).filter((s) => set.has(s));
};
for (const p of allProducts) p.industries = industriesFor(p);

export const industryLabel = (slug) => industryCatalog.find((i) => i.slug === slug)?.label || slug;

export const byIndustry = (slug) => allProducts.filter((p) => p.industries.includes(slug));

/* ---------------------------------------------------------------- ranges */

/** Sub-categories within each zone, in catalogue order: { zone, id, label }. */
export const ranges = rangeMeta;
export const rangeById = (id) => ranges.find((r) => r.id === id) || null;
export const rangesForZone = (zone) =>
  ranges
    .filter((r) => r.zone === zone)
    .map((r) => ({ ...r, count: catalog[zone].filter((p) => p.range === r.id).length }))
    .filter((r) => r.count > 0);
export const productsByRange = (id) => allProducts.filter((p) => p.range === id);
/** Display label for a product's range ("Welder gloves"), or ''. */
export const rangeLabel = (p) => rangeById(p?.range)?.label || '';

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
/**
 * Ranked catalogue search. Each query word is scored by where it matches: the
 * product name counts most, then SKU codes, the product type, then tags and
 * standards. When some products match every word, only those are returned, so
 * "nitrile glov" lists nitrile gloves rather than every glove in the range.
 * Ties keep catalogue order.
 */
export const searchProducts = (q, limit) => {
  const query = (q || '').trim().toLowerCase();
  if (!query) return [];
  const qs = query.split(/\s+/).filter(Boolean);
  const scored = allProducts
    .map((p, i) => {
      const title = `${p.title} ${p.fullTitle || ''}`.toLowerCase();
      const skus = (p.variants || []).map((v) => v.s).join(' ').toLowerCase();
      const type = `${rangeLabel(p)} ${p.type || ''}`.toLowerCase();
      const rest = `${p.slug} ${(p.tags || []).join(' ')} ${(p.catalogueStandards || []).map((s) => s.code).join(' ')}`.toLowerCase();
      let score = 0; let matched = 0;
      for (const t of qs) {
        const s = title.startsWith(t) ? 8 : title.includes(t) ? 5 : skus.includes(t) ? 4 : type.includes(t) ? 3 : rest.includes(t) ? 1 : 0;
        if (s) matched += 1;
        score += s;
      }
      return { p, i, score, all: matched === qs.length };
    })
    .filter((x) => x.score > 0);
  const pool = scored.some((x) => x.all) ? scored.filter((x) => x.all) : scored;
  const ranked = pool.sort((a, b) => b.score - a.score || a.i - b.i).map((x) => x.p);
  return limit ? ranked.slice(0, limit) : ranked;
};

/** Suggested searches shown before the visitor types: the most-stocked product types. */
export const popularSearches = ['Welder gloves', 'Safety shoes', 'Safety helmets', 'Nitrile', 'Hi-vis', 'Cut-resistant'];
