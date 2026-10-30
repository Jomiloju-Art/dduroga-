/**
 * Corrections to the supplier's product text, applied by
 * scripts/build-catalog.mjs to every product (title, description, tags,
 * catalogue symbols) and every product detail file (key features, design,
 * remarks, tests) before the site is built.
 *
 * The source files (catalog.generated.js, productDetails.js,
 * productRanges.generated.js) are snapshots of Mallcom's own copy and are not
 * hand-edited, so the fixes live here: one place, one record of what changed.
 * Most entries come from the client's website review of 29 Oct 2026
 * ("Spelling error" and "Grammatically incorrect sentences" indexes); the
 * number is the row in that review (S = spelling, G = grammar, X = the
 * extra findings sheet). Items 4 and 17 of the grammar sheet and the
 * British-spelling list follow the review's suggested wording.
 *
 * Order: TAILS (per product, on the raw description), then PHRASES, then
 * WORDS. Each entry is [find, replace]; a string finds itself exactly, a
 * RegExp is used as written.
 */

/**
 * The old storefront stored 35 descriptions cut at 600 characters, often
 * mid-word ("a secure yet comfo"). Each ending is completed where the word is
 * clear, otherwise cut back to the last complete sentence. Keyed by product
 * slug; [the description's last characters, what replaces them].
 */
export const TAILS = {
  agena: ['ensures a secure yet comfo', 'ensures a secure yet comfortable fit.'],
  avior: ['these goggles offer enhanced protect', 'these goggles offer enhanced protection.'],
  cirrus: [' The scratch-resistant properties enhanc', ''],
  'diamond-xii': ['Orange, Re', 'Orange, Red.'], // G30
  'jasper-v': ['known for its lightweight yet ', 'known for being lightweight.'], // G28
  'jasper-xv': ['as a CATEGORY II Colour options available: White,Yel', 'as a CATEGORY II product.'],
  'lk86l3-surgicalmask': [' Ultrasonic sealing ensur', ''],
  vega: ['easy replacement of the temple', 'easy replacement of the temple.'],
  'c-542': ['protection for hands during tas', 'protection for hands during tasks.'],
  c592: [' Binding: Synthetic', ''],
  'c-853': [' The rubber', ''],
  c893: ['equipped with a rubberiz', 'equipped with a rubberised cuff.'],
  d232: [' Their strong grip ensures secure h', ''],
  d692: ['Color : Palm: Yellow, offering high visibility an', 'Colour: Palm: Yellow, offering high visibility.'],
  f294: [' Color : Palm: Yell', ''],
  f437: [' UNMATCHED HEAT RESISTANCE For ENHANC', ''],
  f497: [', while the cuff is lin', '.'],
  f697: ['Liner: The palm is lined with cotton, offe', 'Liner: The palm is lined with cotton.'],
  h294k: [' Li', ''],
  lpky: [' Additionally', ''],
  'mach-22': ['when handling tools or manoeuvri', 'when handling tools or manoeuvring.'], // S17
  mfkb: [' The nitrile coating provides excellent resista', ''],
  nf153g: [' The ergonomic desig', ''],
  p35nba: [' Their sleek d', ''],
  p35nbg: [' The robust desi', ''],
  wt5nbg: ['ensures dexterity and comf', 'ensures dexterity and comfort.'],
  esberg: ['ID card enclosure Pr', 'ID card enclosure.'],
  gotland: ['ID card enclosur', 'ID card enclosure.'], // S18
  'freddie-g22': ['Antiskid, Fuel and ', 'Antiskid, Fuel and Oil Resistant.'], // G21
  'freddie-h22': ['Shock Absorbent Double Densi', 'Shock Absorbent Double Density.'],
  leperm: ['nylon red low ankle steel', 'nylon red low ankle steel toe safety shoe.'],
  'liger-h': ['Outsole: Injected-double ', 'Outsole: Injected double-density.'],
  malkin: ['ensures maximum comfort, ease', 'ensures maximum comfort, ease of use and longevity.'],
  manul5: [', Walk confidently knowing yo', '.'],
  'rufus-k01': ['certification standard', 'certification standards.'],
};

/** Whole phrases: grammar, run-together text and wording the review rewrote. */
export const PHRASES = [
  // Spelling sheet
  ['a n on-ventilated', 'a non-ventilated'], // S23
  ['double double-density', 'double-density'], // S28
  ['pathogens.Disposable', 'pathogens. Disposable'], // S32
  ['cuffs,waists,ankles', 'cuffs, waists, ankles'], // S33
  ['50% Modacyrlic,38% Cotton,10 % m-Aramide', '50% Modacrylic, 38% Cotton, 10% m-Aramide'], // S11
  ['2%Antistati with', '2% Antistatic with'], // S19
  ['c owhide', 'cowhide'], // S37
  ['Good chemcial resistant', 'Good chemical resistance'], // S21
  [/(?<!and )Rachet adjustment are available/g, 'Ratchet adjustment is available'], // S7
  // Grammar sheet
  [/mechanical resistant and comfort/gi, 'mechanical resistance and comfort'], // G1
  ['available on both side of shoulder', 'available on both sides of the shoulder'], // G3
  ['Compatible for various applications', 'Compatible with various applications'], // G4
  ['Perfect for the food handling', 'Perfect for food handling'], // G5
  ['High durable gauntlet style PVC gloves', 'Highly durable gauntlet-style PVC gloves'], // G6
  ['One chest pockets', 'One chest pocket'], // G7
  ["sensitive equipment's", 'sensitive equipment'], // G8
  ['Snuggly Fitting', 'Snug Fitting'], // G9
  [/\b(offers|for) snuggly fitting\b/gi, '$1 a snug fit'], // G9
  [/\bsnuggly fitting\b/gi, 'snug fitting'], // G9
  ['all mere kind of harmful chemicals', 'all kinds of harmful chemicals'], // G10
  ['wing thumb pattern, No Lining Inside,', 'wing thumb pattern, no inside lining,'], // G11
  ['PVC dots are available on the palm sight', 'PVC dots are available on the palm side'], // G12
  ['PVC dots are available on palm sight', 'PVC dots are available on the palm side'], // G12
  ['Designated for high dexterity', 'Designed for high dexterity'], // G13
  ['One side pocket on each side CFC zipper', 'One pocket on each side. CFC zipper.'], // G14
  ['Used in industries more as a work uniform and very mild risk', 'Used in industries mainly as a work uniform for very mild-risk work'], // G15
  // G17: the toe cap was stated twice. One figure per product: 100J where
  // both agree; the black pair said 100J then 200J, and the review's wording
  // uses 200J (to confirm with the client).
  ['Black PVC rain boots with 100J impact resistant with steel toe cap and excellent fitting non slippery sole 200J impact-resistant steel toe cap', 'Black PVC rain boots with a 200J impact-resistant steel toe cap and an excellent-fitting, non-slip sole.'],
  [/(Yellow|White) PVC rain boots with 100J impact resistant with steel toe cap and excellent fitting non slippery sole 100J impact-resistant steel toe cap/g, '$1 PVC rain boots with a 100J impact-resistant steel toe cap and an excellent-fitting, non-slip sole.'],
  ['making the garment water proof', 'making the garment waterproof'], // G18 note
  ['It provides 100% Protection from Biological contaminants pathogens.', 'It provides 100% protection from biological contaminants and pathogens.'], // G19
  ['Protection from Biological contaminants pathogens.', 'Protection from biological contaminants and pathogens.'], // G19 (detail list)
  ['Iriomote is a High ankle double density safety shoe', 'Iriomote is a high-ankle, double-density safety shoe.'], // G20
  ['Abrasion Resistant ,', 'Abrasion Resistant,'], // G21
  ['PP dump proof layer that Prevent fog', 'PP damp-proof layer that prevents fog'], // G29
  ['PP dump proof layer-Prevent fog', 'PP damp-proof layer: prevents fog'], // G29 (detail list)
  [/(Anti-?static) properties helps negate/gi, '$1 properties help negate'], // G31
  ['Hi-vis tale stitched', 'Hi-vis tape stitched'], // G32
  ['Heavy weight supported nitrile dipped gloves with Polyester knitted lining', 'Heavyweight supported nitrile-dipped gloves with polyester knitted lining'], // G36
  ['Heavy weight supported nitrile dipped gloves', 'Heavyweight supported nitrile-dipped gloves'], // G36
  // Learning-guide test text, repeated in the product detail files (G22–G26)
  ['how protective the gloves is when it put into direct contact', 'how protective the glove is when it is put into direct contact'], // G22
  ['gas flame is distinguished', 'gas flame is extinguished'], // G23
  ['likely to be encountered actual working conditions', 'likely to be encountered in actual working conditions'], // G24
  ['This test is incorporating a steel striker', 'This test incorporates a steel striker'], // G25
  ['and/or microorganism when the gloves resist penetration,', 'and/or micro-organisms. When the gloves resist penetration,'], // G26
  // Extra findings sheet
  ['cotton platting', 'cotton plating'], // X3
  ['Colored propylene overlock', 'Coloured polypropylene overlock'], // X4 (review: check context)
  ['shell rexin cuff', 'shell rexine cuff'], // X2
];

/**
 * Single words, matched whole and case-insensitively; the replacement takes
 * the case of what it replaces (maintenence, Maintenence, MAINTENENCE).
 */
export const WORDS = [
  ['maintanence', 'maintenance'], // S1
  ['maintenence', 'maintenance'], // S2
  ['uhwmpe', 'uhmwpe'], // S3
  ['equipments', 'equipment'], // S4
  ['upto', 'up to'], // S5
  ['removeable', 'removable'], // S6
  ['rachet', 'ratchet'], // S7
  ['absorbant', 'absorbent'], // S8
  ['polycarbocate', 'polycarbonate'], // S9
  ['longitivity', 'longevity'], // S10
  ['modacyrlic', 'modacrylic'], // S11
  ['deatachable', 'detachable'], // S12
  ['silcone', 'silicone'], // S13
  ['underam', 'underarm'], // S14
  ['unflocklined', 'unflock-lined'], // S15 (review: check the intended wording)
  ['reuseable', 'reusable'], // S16
  ['enclosur', 'enclosure'], // S18
  ['antistati', 'antistatic'], // S19
  ['cambrella', 'cambrelle'], // S20
  ['chemcial', 'chemical'], // S21
  ['reinforecment', 'reinforcement'], // S22
  ['penetartion', 'penetration'], // S24
  ['resiatant', 'resistant'], // S25
  ['vicking', 'wicking'], // S26
  ['weilding', 'welding'], // S27
  ['refelctive', 'reflective'], // S29
  ['visibilty', 'visibility'], // S30
  ['bue', 'blue'], // X1
  // S36: the site's spelling is British (colour, fibre, customisation); the
  // US forms the review and the British dictionary flagged become British.
  ['customizable', 'customisable'], ['customized', 'customised'],
  ['rubberized', 'rubberised'], ['rubberize', 'rubberise'],
  ['aluminized', 'aluminised'], ['aluminum', 'aluminium'],
  ['elasticized', 'elasticised'],
  ['color', 'colour'], ['colors', 'colours'], ['colored', 'coloured'],
  ['fiber', 'fibre'], ['fibers', 'fibres'], ['fiberglass', 'fibreglass'], ['microfiber', 'microfibre'],
  ['odor', 'odour'], ['odors', 'odours'],
  ['center', 'centre'], ['calipers', 'callipers'], ['traveled', 'travelled'],
  ['repellant', 'repellent'],
];

/** Tags that are typos of a tag the product already has: dropped (S31). */
const DROP_TAGS = new Set(['sliip']);

const matchCase = (found, repl) => {
  if (found === found.toUpperCase() && /[A-Z]/.test(found)) return repl.toUpperCase();
  if (found[0] === found[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1);
  return repl;
};
const WORD_RES = WORDS.map(([w, r]) => [new RegExp(`\\b${w}\\b`, 'gi'), r]);

/** One string, with PHRASES and WORDS applied. */
export function fixText(s) {
  if (typeof s !== 'string' || !s) return s;
  let t = s;
  for (const [find, repl] of PHRASES) t = typeof find === 'string' ? t.split(find).join(repl) : t.replace(find, repl);
  for (const [re, repl] of WORD_RES) t = t.replace(re, (m) => matchCase(m, repl));
  return t;
}

const deep = (v) => (typeof v === 'string' ? fixText(v) : Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)])) : v);

/** A product from catalogSource.js: its reader-facing text fields only. */
export function fixProduct(p) {
  const out = { ...p };
  const tail = TAILS[out.slug];
  if (typeof out.desc === 'string' && tail) {
    const d = out.desc.trimEnd();
    const end = tail[0].trimEnd();
    if (d.endsWith(end)) out.desc = d.slice(0, d.length - end.length) + tail[1];
  }
  for (const k of ['title', 'fullTitle', 'type', 'desc']) if (typeof out[k] === 'string') out[k] = fixText(out[k]);
  // Every product name in capitals, as most already are (client, 30 Oct 2026).
  for (const k of ['title', 'fullTitle']) if (typeof out[k] === 'string') out[k] = out[k].toUpperCase().replace(/\s+/g, ' ').trim();
  if (Array.isArray(out.tags)) out.tags = [...new Set(out.tags.filter((t) => !DROP_TAGS.has(String(t).toLowerCase())).map(fixText))];
  if (Array.isArray(out.catalogueSymbols)) out.catalogueSymbols = out.catalogueSymbols.map(fixText);
  return out;
}

/**
 * A product detail record: the four text lists only. `diagram` and `banner`
 * are image paths, which a spelling fix must never touch.
 */
export const fixDetails = (rec) => {
  const out = { ...rec };
  for (const k of ['keyFeatures', 'design', 'remarks', 'tests']) if (Array.isArray(out[k])) out[k] = deep(out[k]);
  return out;
};
