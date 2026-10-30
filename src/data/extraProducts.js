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
  // Client's request (30 Oct 2026); FELIX S03 is listed through its datasheet.
  // No datasheet for these two yet, so no rating is shown. (The storefront
  // files for S04 are named FELIXS03-n.jpg, but they do show S04.)
  'felix-s01': true,
  'felix-s04': true,
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

// BAMACO and DUNEDIN were listed here until the client asked for them to be
// removed (30 Oct 2026); vercel.json sends their old pages to the shoe range.
export const NEW_PRODUCTS = [];

/**
 * MERGED: storefront products shown as one product with options, at the
 * client's request. `from` lists the storefront keys; the first is the main
 * photo and the source of the spec data (details), and each `colours` entry
 * takes its photos from one of them. Visitors pick `choices` as well as size
 * and colour, and the picks go into the quote request.
 * The old pages redirect to the merged one (SLUG_RENAMES and vercel.json).
 *
 * DALFON (30 Oct 2026): J116 and J126 are the black boot with a composite and
 * a steel toe cap (identical photos, so J116's are not repeated); J226 is
 * yellow and J326 white. Ratings and materials are as Mallcom's own pages
 * state them; the toe-cap material is still to be confirmed by Mallcom.
 */
export const MERGED = [
  {
    zone: 'feet',
    slug: 'dalfon',
    title: 'DALFON',
    from: ['dalfon-black', 'dalfon-j116', 'dalfon-yellow', 'dalfon-white'],
    colours: [
      { name: 'Black', from: 'dalfon-black' },
      { name: 'Yellow', from: 'dalfon-yellow' },
      { name: 'White', from: 'dalfon-white' },
    ],
    choices: [
      { name: 'Length', values: ['12 in', '14 in', '16 in'] },
      { name: 'Toe cap', values: ['Steel', 'Composite'] },
    ],
    desc: 'PVC gumboots with an impact-resistant toe cap and an excellent-fitting, non-slip sole, available in black, yellow and white. '
      + 'Black: 200J impact-resistant toe cap and a double density rubber outsole. '
      + 'Yellow and white: 100J impact-resistant toe cap and a double density PU outsole. '
      + 'Vamp and quarter lining in nylon fabric. Available with a steel or composite toe cap, in 12, 14 and 16 inch lengths. '
      + 'Mallcom model codes: J116 (black, composite toe cap), J126 (black, steel toe cap), J226 (yellow) and J326 (white).',
    // The storefront's features say "Steel Toe Cap"; the merged boot comes with either.
    keyFeatures: ['Highly comfortable', 'Impact Resistant', 'Steel or Composite Toe Cap', 'Non-Slip Sole'],
  },
];
