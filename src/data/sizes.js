/**
 * Sizes offered, by product type (client instruction, Oct 2026):
 *   gloves     every glove size, 6 to 11 (the EN ISO 21420 hand-size range the
 *              size guide shows)
 *   footwear   EU 38 to 48
 *   garments   S to XXXL
 *
 * These replace the sizes the storefront variants and the catalogue happened to
 * list, which differed product to product (some boots "UK 2.5-13", some gloves
 * only 9 and 10). Types not listed here (helmets, eyewear, masks, hearing,
 * arm sleeves, welding accessories) are not sized.
 */
const GLOVE_RANGES = new Set([
  'canadian', 'cryo', 'cut-resistant', 'driver', 'gauntlets', 'knitted', 'mechanical',
  'nitrile-cns', 'para-aramid', 'pu', 'seamless-nitrile', 'supplementary', 'thermal', 'welder',
]);
const FOOTWEAR_RANGES = new Set(['shoes', 'boots', 'high-boots', 'gumboots', 'occupational-shoes']);
const GARMENT_RANGES = new Set(['workwear', 'fr', 'hi-vis', 'rainwear', 'winter', 'occupational', 'disposable']);

export const GLOVE_SIZES = ['6', '7', '8', '9', '10', '11'];
export const FOOTWEAR_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
export const GARMENT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

/** { kind: 'glove' | 'footwear' | 'garment', sizes, label } or null if unsized. */
export function sizingFor(product) {
  const r = product?.range;
  if (GLOVE_RANGES.has(r)) return { kind: 'glove', sizes: GLOVE_SIZES, label: 'Sizes 6–11' };
  if (FOOTWEAR_RANGES.has(r)) return { kind: 'footwear', sizes: FOOTWEAR_SIZES, label: 'EU 38–48' };
  if (GARMENT_RANGES.has(r)) return { kind: 'garment', sizes: GARMENT_SIZES, label: 'S–XXXL' };
  return null;
}
