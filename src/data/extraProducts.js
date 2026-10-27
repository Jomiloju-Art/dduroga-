/**
 * Products listed although the 2025 catalogue does not print them, added at
 * the client's request (Oct 2026) after they turned up on DDUROGA's flash drive
 * of Mallcom product photos.
 *
 * SHOWN: storefront products (catalog.generated.js) to list, keyed by
 * storefront slug. They keep the storefront's description, photos and
 * variants; with no catalogue entry they carry no standards or symbols.
 *
 * NEW_PRODUCTS: products with no storefront page either. Neither the
 * catalogue nor mallcom.in has anything on them, so they have only a name and
 * the drive's photos (public/products/gallery/<slug>/<n>.webp);
 * fill in `desc` and `rec.standards` when Mallcom sends details. Never guess
 * a rating.
 */
export const SHOWN = {
  h33tdl: true,
  'diamond-x': true,
  'diamond-xi': true,
  'jasper-1-yellow': true, // JASPER XIV; renamed to /products/jasper-xiv in SLUG_RENAMES
};

const driveShoe = (slug, title, photos) => ({
  zone: 'feet',
  product: {
    slug,
    title,
    fullTitle: title,
    type: 'Safety Shoe',
    vendor: 'Mallcom',
    tags: [title, 'Feet', 'safety shoes'],
    img: `/products/gallery/${slug}/1.webp`,
    imgs: Array.from({ length: photos }, (_, i) => `/products/gallery/${slug}/${i + 1}.webp`),
    desc: '',
    hasDesc: false,
  },
  rec: { range: 'shoes', source: 'drive', inCatalogue: true },
});

export const NEW_PRODUCTS = [
  driveShoe('bamaco', 'BAMACO', 6),
  driveShoe('dunedin', 'DUNEDIN', 6),
];
