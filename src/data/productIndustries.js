/**
 * Which industries a product is "useful in".
 *
 * The 2025 catalogue carries no industry data, and the storefront tags were
 * inconsistent (the same industry under four spellings), patchy (157 of 301
 * products had none) and sometimes wrong (cleanroom clogs under Oil & Gas).
 * Each product's list is now built from, in order:
 *
 *   1. RANGE_INDUSTRIES - typical sectors for the product's catalogue range.
 *   2. SYMBOL_INDUSTRIES - catalogue glossary symbols that imply a sector
 *      ("Welding", "Food Grade" ...).
 *   3. The storefront's own industry tags, mapped onto the same 17 industries.
 *
 * then RANGE_EXCLUDE removes sectors that do not fit the range whatever the tags
 * say. Values are industry slugs from industryCatalog in products.js. The
 * defaults are a reviewed first draft: adjust them here, they drive both the
 * product-page chips and the catalogue's Industry filter.
 */

/** Slugs (see industryCatalog): construction, automotive, oil-gas, mining,
 *  manufacturing, food-beverage, pharma, agriculture, logistics, chemicals,
 *  construction-civil (Iron & Steel), welding, electronics, heavy-engineering,
 *  aero, defence, material-handling. */
export const RANGE_INDUSTRIES = {
  // head
  helmets: ['construction', 'oil-gas', 'mining', 'manufacturing', 'heavy-engineering', 'construction-civil'],
  'bump-caps': ['manufacturing', 'automotive', 'logistics', 'food-beverage', 'material-handling'],
  respirators: ['construction', 'mining', 'manufacturing', 'chemicals', 'pharma', 'agriculture'],
  'surgical-masks': ['pharma', 'food-beverage'],
  eyewear: ['construction', 'manufacturing', 'automotive', 'chemicals', 'oil-gas'],
  hearing: ['manufacturing', 'construction', 'mining', 'heavy-engineering', 'oil-gas', 'aero'],
  // hand
  driver: ['logistics', 'automotive', 'construction', 'material-handling', 'agriculture'],
  canadian: ['construction', 'material-handling', 'agriculture', 'logistics', 'mining'],
  mechanical: ['automotive', 'manufacturing', 'heavy-engineering', 'construction', 'material-handling'],
  welder: ['welding', 'construction-civil', 'construction', 'heavy-engineering', 'automotive', 'manufacturing'],
  'welding-wear': ['welding', 'construction-civil', 'heavy-engineering', 'construction'],
  'para-aramid': ['construction-civil', 'automotive', 'manufacturing', 'welding', 'heavy-engineering'],
  knitted: ['logistics', 'material-handling', 'manufacturing', 'automotive', 'electronics'],
  'arm-sleeves': ['manufacturing', 'automotive', 'construction-civil', 'material-handling'],
  'nitrile-cns': ['oil-gas', 'chemicals', 'material-handling', 'construction', 'mining'],
  gauntlets: ['chemicals', 'oil-gas', 'agriculture', 'manufacturing'],
  'seamless-nitrile': ['automotive', 'logistics', 'manufacturing', 'material-handling', 'construction', 'oil-gas'],
  'cut-resistant': ['automotive', 'manufacturing', 'construction', 'construction-civil', 'material-handling', 'heavy-engineering'],
  pu: ['electronics', 'automotive', 'manufacturing', 'logistics', 'material-handling'],
  thermal: ['logistics', 'food-beverage', 'construction'],
  supplementary: ['chemicals', 'food-beverage', 'agriculture', 'pharma', 'oil-gas'],
  cryo: ['pharma', 'chemicals', 'oil-gas'],
  // body
  workwear: ['manufacturing', 'construction', 'automotive', 'logistics', 'heavy-engineering'],
  fr: ['oil-gas', 'welding', 'construction-civil', 'chemicals', 'mining'],
  'hi-vis': ['construction', 'logistics', 'oil-gas', 'mining', 'aero'],
  rainwear: ['construction', 'agriculture', 'logistics', 'mining', 'oil-gas'],
  winter: ['construction', 'logistics', 'oil-gas'],
  occupational: ['pharma', 'food-beverage'],
  disposable: ['pharma', 'food-beverage', 'chemicals', 'electronics'],
  // feet
  shoes: ['construction', 'manufacturing', 'logistics', 'automotive', 'heavy-engineering'],
  boots: ['construction', 'oil-gas', 'mining', 'heavy-engineering', 'construction-civil'],
  'high-boots': ['oil-gas', 'mining', 'construction', 'defence'],
  gumboots: ['agriculture', 'food-beverage', 'chemicals', 'construction', 'mining'],
  'occupational-shoes': ['pharma', 'food-beverage', 'electronics'],
};

/** Glossary symbols (catalogue page 142) that imply a sector. */
export const SYMBOL_INDUSTRIES = {
  Welding: ['welding'],
  Sparks: ['welding'],
  'Food Grade': ['food-beverage'],
  'Chemical Protection': ['chemicals'],
  Hygienic: ['pharma'],
  Microbe: ['pharma'],
  'Micro organism': ['pharma'],
  'Bio Hazard': ['pharma'],
  Cryogenic: ['pharma', 'chemicals'],
  'Hydrocarbon Resistant': ['oil-gas'],
};

/** Sectors that do not fit a range, removed even if a storefront tag adds them. */
export const RANGE_EXCLUDE = {
  'occupational-shoes': ['oil-gas', 'mining', 'construction', 'construction-civil', 'heavy-engineering', 'welding', 'defence'],
  'surgical-masks': ['agriculture', 'mining', 'construction', 'oil-gas'],
  occupational: ['oil-gas', 'mining', 'construction', 'construction-civil', 'heavy-engineering'],
  disposable: ['mining', 'construction-civil', 'heavy-engineering'],
  cryo: ['agriculture', 'construction'],
};
