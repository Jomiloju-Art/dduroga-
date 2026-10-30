/**
 * Build-time source of the product list. NOT imported by the app.
 *
 * Joins the storefront snapshot (catalog.generated.js: 524 records with
 * Shopify CDN image links) with the 2025 catalogue ranges and the local image
 * copies, and keeps only the products printed in the 2025 catalogue (plus the
 * few with an official datasheet, see datasheets.js, and the few added by hand,
 * see extraProducts.js).
 * scripts/build-catalog.mjs runs this and writes the finished list to
 * catalog.slim.generated.js, which is what products.js ships. The raw files
 * were 1 MB of JavaScript downloaded and parsed before every page.
 */
import { catalog as storefront, zoneMeta } from './catalog.generated.js';
import { rangeMeta, productRanges, addedProducts } from './productRanges.generated.js';
import { localImageCounts } from './localImages.generated.js';
import { DATASHEETS } from './datasheets.js';
import { SHOWN, NEW_PRODUCTS, MERGED, WRONG_TAGS } from './extraProducts.js';


/**
 * Gallery and swatch photos were hotlinked from Mallcom's Shopify CDN. They are
 * now copied into public/products/gallery/<key>/<n>.webp by
 * scripts/localize-images.mjs, where n follows the order of the product's
 * distinct URLs (imgs, then variant images). This rebuilds that order and
 * swaps each CDN URL for its copy; products without copies keep their URLs.
 */
const baseUrl = (u) => u.replace(/[?&]width=\d+/, '').replace(/\?$/, '');
const localizer = (p, key) => {
  if (!localImageCounts[key]) return (u) => u;
  const order = [...new Set(
    [...(p.imgs || []), ...(p.variants || []).map((v) => v.img).filter(Boolean)]
      .filter((u) => /^https?:\/\//.test(u))
      .map(baseUrl),
  )];
  return (u) => {
    if (!u || !/^https?:\/\//.test(u)) return u;
    const n = order.indexOf(baseUrl(u)) + 1;
    return n > 0 && n <= localImageCounts[key] ? `/products/gallery/${key}/${n}.webp` : u;
  };
};

/**
 * Storefront slugs that name a different product from the one they show.
 * Mallcom duplicated pages and renamed them without changing the URL, so
 * /products/jasper-iv showed JASPER XVII. The new slug follows the title; the
 * old one keeps working (findProduct resolves it, the PDP redirects, and
 * vercel.json 301s it) so existing links and quote lists do not break.
 */
export const SLUG_RENAMES = {
  'g65tdl': 'g63tdl',
  'nif-techo-fl-30-copy': 'vp49tl',
  'proclo-n382-copy': 'proclo-m382',
  'proclo-21': 'proclo-m592',
  'proclo-11': 'proclo-n382',
  'selkrik-rex': 'selkirk-rex',
  'doxle-gold-copy': 'doxle',
  'jasper-1-yellow': 'jasper-xiv',
  // Merged into one product (extraProducts.js MERGED).
  ...Object.fromEntries(MERGED.flatMap((m) => m.from.map((k) => [k, m.slug]))),
};

/**
 * Product type set by the client where it differs from the one inferred from
 * the catalogue text (scripts/build-product-ranges.mjs). Every MANUL is a
 * tactical boot (30 Oct 2026); the catalogue text had them as shoes or boots.
 */
const RANGE_OVERRIDES = {
  'manul-1': 'high-boots',
  'manul-3': 'high-boots',
  manul5: 'high-boots',
  'manul-7': 'high-boots',
};

/**
 * A standard every product of a type carries, as the client confirmed (30 Oct
 * 2026: "CE EN 397 is the correct rating" for all helmets; some showed only
 * the Indian IS 2925, and four showed nothing). Added first and CE-marked;
 * any Indian standard the catalogue gives stays, shown apart (CertifiedTo.jsx).
 */
const RANGE_STANDARD = {
  helmets: 'EN 397',
};
const withRangeStandard = (standards, range) => {
  const code = RANGE_STANDARD[range];
  return code && !standards.some((s) => s.code === code) ? [{ code }, ...standards] : standards;
};

const enrich = (p, r = productRanges[p.slug] || {}, key = p.slug) => {
  const localImage = localizer(p, key);
  // An official datasheet replaces the catalogue's ratings (datasheets.js).
  const sheet = DATASHEETS[key];
  const range = RANGE_OVERRIDES[key] || r.range || null;
  return {
    ...p,
    tags: WRONG_TAGS[key] ? (p.tags || []).filter((t) => !WRONG_TAGS[key].includes(t)) : p.tags,
    imgs: (p.imgs || []).map(localImage),
    variants: p.variants ? p.variants.map((v) => (v.img ? { ...v, img: localImage(v.img) } : v)) : p.variants,
    key,
    slug: sheet?.slug || SLUG_RENAMES[p.slug] || p.slug,
    range,
    rangeSource: r.source || null,
    collection: r.collection || null,
    catalogueStandards: withRangeStandard((sheet || r).standards || [], range),
    catalogueSymbols: (sheet || r).symbols || [],
    ce: Boolean((sheet || r).ce || RANGE_STANDARD[range]),
    datasheets: sheet?.files || [],
    inCatalogue: Boolean(r.inCatalogue || sheet?.show || SHOWN[key]),
    cataloguePage: r.page ?? null,
  };
};

/**
 * Main photo replaced by one from the product's own gallery, so every shoe in
 * the listing is shown from the same angle: Mallcom's pair shot, one shoe
 * upright and the other tipped to show the sole (client's request, 30 Oct
 * 2026). The old main photo becomes the first gallery photo. Shoes with no
 * such shot in their gallery need new photos from Mallcom.
 */
const MAIN_PHOTO = {
  jaguar: '/products/gallery/jaguar/6.webp',
  korat: '/products/gallery/korat/3.webp',
  malkin: '/products/gallery/malkin/7.webp',
  'vik-classic': '/products/gallery/vik-classic/6.webp',
};
const withMainPhoto = (p) => {
  const main = MAIN_PHOTO[p.key];
  if (!main) return p;
  return { ...p, img: main, imgs: [p.img, ...(p.imgs || []).filter((u) => u !== main && u !== p.img)] };
};

/**
 * One product built from several storefront ones (extraProducts.js MERGED):
 * the first source's catalogue data, each colour's photos in turn, and
 * "size / colour" variants so the product page offers the colours as swatches.
 */
const mergedFrom = new Set(MERGED.flatMap((m) => m.from));
const buildMerged = (m) => {
  const byKey = new Map(Object.values(storefront).flat().map((p) => [p.slug, p]));
  const src = Object.fromEntries(m.from.map((k) => [k, enrich(byKey.get(k))]));
  const base = src[m.from[0]];
  const imgs = [...new Set(m.colours.flatMap((c) => [src[c.from].img, ...src[c.from].imgs]))];
  const sizes = [...new Set((base.variants || []).map((v) => String(v.c).split('/')[0].trim()))];
  return {
    ...base,
    slug: m.slug,
    key: m.slug,
    title: m.title,
    fullTitle: m.title,
    tags: [m.title, ...base.tags.filter((t) => !/^dalfon/i.test(t))],
    img: imgs[0],
    imgs: imgs.slice(1),
    variants: m.colours.flatMap((c) => sizes.map((s) => ({ c: `${s} / ${c.name}`, img: src[c.from].img }))),
    // The product page shows only the chosen colour's photos.
    colourPhotos: Object.fromEntries(m.colours.map((c) => [c.name, [src[c.from].img, ...src[c.from].imgs]])),
    desc: m.desc,
    hasDesc: true,
    catalogueSymbols: m.symbols || base.catalogueSymbols,
    choices: m.choices,
    detailsFrom: m.from[0],
    keyFeatures: m.keyFeatures,
  };
};

const catalog = Object.fromEntries(
  Object.entries(storefront).map(([zone, list]) => [
    zone,
    [
      ...list.filter((p) => !mergedFrom.has(p.slug)).map((p) => withMainPhoto(enrich(p))).filter((p) => p.inCatalogue),
      ...MERGED.filter((m) => m.zone === zone).map(buildMerged),
      // Their own key namespace: a hidden storefront product may share the
      // slug (the old jasper-iv page showed JASPER XVII), and its reviews and
      // spec data must not attach to the real catalogue product.
      ...addedProducts.filter((a) => a.zone === zone).map((a) => enrich(a.product, a.rec, `catalogue:${a.product.slug}`)),
      ...NEW_PRODUCTS.filter((a) => a.zone === zone).map((a) => enrich(a.product, a.rec)),
    ],
  ]),
);

export { zoneMeta, rangeMeta, catalog };
