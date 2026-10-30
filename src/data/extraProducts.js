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

/**
 * Storefront tags that are wrong for the product, dropped at build time. The
 * FELIX pages were copied from MALLARD 18 in Mallcom's store and kept its tags
 * ("mallard", "high ankle shoe", "Heat"); with no catalogue data the product
 * page showed them as a heat rating. "slip" goes too, so S01 and S04 show no
 * rating until their datasheets arrive (30 Oct 2026).
 */
const COPIED_FROM_MALLARD = ['mallard', 'high ankle shoe', 'Heat', 'slip'];
export const WRONG_TAGS = {
  'felix-s01': COPIED_FROM_MALLARD,
  'felix-s03': COPIED_FROM_MALLARD,
  'felix-s04': COPIED_FROM_MALLARD,
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
 * DALFON (30 Oct 2026): J116 and J126 are the black boot (identical photos, so
 * J116's are not repeated); J226 is yellow and J326 white. The client
 * confirmed a steel toe cap and a PU sole on a PVC boot, replacing Mallcom's
 * storefront text and symbols (E-com, Fibreglass Toecap, PU/PU); the impact
 * figures are Mallcom's.
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
    ],
    symbols: ['Steel Toecap', 'PU/PVC'],
    desc: 'PVC gumboots with a steel toe cap and an excellent-fitting, non-slip PU sole, available in black, yellow and white. '
      + 'Black: 200J impact-resistant steel toe cap. '
      + 'Yellow and white: 100J impact-resistant steel toe cap. '
      + 'Vamp and quarter lining in nylon fabric. Available in 12, 14 and 16 inch lengths. '
      + 'Mallcom model codes: J116 and J126 (black), J226 (yellow) and J326 (white).',
    keyFeatures: ['Highly comfortable', 'Impact Resistant', 'Steel Toe Cap', 'Non-Slip Sole'],
  },
];
