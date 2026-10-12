/**
 * Products whose second storefront image must NOT be used as the product-card
 * hover photo. Every product's second image was reviewed side by side with its
 * main photo (Oct 2026); these are the ones that are not a clean shot of the
 * product itself. Keyed by product.key (the storefront slug).
 *
 * Products not listed keep the hover crossfade. Products from the catalogue
 * import have a single photo and no hover image at all.
 */
export const NO_HOVER_IMAGE = new Set([
  // Marketing posters, packaging and lifestyle collages
  'diamond-iii', // "Stay safe, build better" poster with Mallcom (India) and ISI badge
  'jasper-iii', // promotional poster
  'ck86p3-surgicalmask', // retail box
  'm2102p-facemask', // retail box
  'korat', // shoe box
  'devon', // lifestyle collage
  'mfkb', // "material handling" scene
  // Footwear infographics ringed with feature badges, which the 4:5 crop cuts off
  'civet', 'cymric-j03', 'freddie-g22', 'guina', 'leo', 'leperm', 'manx-suede',
  'margay-1', 'ocelot', 'ontilla', 'pedrofeles', 'rufus-k01', 'rufus-m01', 'scar-b',
  // Extreme close-ups that read as a different product at card size
  'kd4377a', 'techo-fl-30', 'leuven', 'bruges', 'panther-08',
]);
