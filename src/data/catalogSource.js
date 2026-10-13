/**
 * Build-time source of the product list. NOT imported by the app.
 *
 * Joins the storefront snapshot (catalog.generated.js: 524 records with
 * Shopify CDN image links) with the 2025 catalogue ranges and the local image
 * copies, and keeps only the products printed in the 2025 catalogue.
 * scripts/build-catalog.mjs runs this and writes the finished list to
 * catalog.slim.generated.js, which is what products.js ships. The raw files
 * were 1 MB of JavaScript downloaded and parsed before every page.
 */
import { catalog as storefront, zoneMeta } from './catalog.generated.js';
import { rangeMeta, productRanges, addedProducts } from './productRanges.generated.js';
import { localImageCounts } from './localImages.generated.js';


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
};

const enrich = (p, r = productRanges[p.slug] || {}, key = p.slug) => {
  const localImage = localizer(p, key);
  return {
    ...p,
    imgs: (p.imgs || []).map(localImage),
    variants: p.variants ? p.variants.map((v) => (v.img ? { ...v, img: localImage(v.img) } : v)) : p.variants,
    key,
    slug: SLUG_RENAMES[p.slug] || p.slug,
    range: r.range || null,
    rangeSource: r.source || null,
    collection: r.collection || null,
    catalogueStandards: r.standards || [],
    catalogueSymbols: r.symbols || [],
    ce: Boolean(r.ce),
    inCatalogue: Boolean(r.inCatalogue),
    cataloguePage: r.page ?? null,
  };
};

const catalog = Object.fromEntries(
  Object.entries(storefront).map(([zone, list]) => [
    zone,
    [
      ...list.map((p) => enrich(p)).filter((p) => p.inCatalogue),
      // Their own key namespace: a hidden storefront product may share the
      // slug (the old jasper-iv page showed JASPER XVII), and its reviews and
      // spec data must not attach to the real catalogue product.
      ...addedProducts.filter((a) => a.zone === zone).map((a) => enrich(a.product, a.rec, `catalogue:${a.product.slug}`)),
    ],
  ]),
);

export { zoneMeta, rangeMeta, catalog };
