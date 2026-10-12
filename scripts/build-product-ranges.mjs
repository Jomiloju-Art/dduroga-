/**
 * Builds src/data/productRanges.generated.js: a product range (sub-category)
 * for every product, plus the standards and performance ratings printed in
 * Mallcom's 2025 catalogue.
 *
 * Usage:
 *   pdftotext -layout "Mallcom Full Catalogue - 2025.pdf" catalogue.txt
 *   node scripts/build-product-ranges.mjs catalogue.txt
 *
 * How a range is chosen:
 *   1. If the product appears in the catalogue, its range comes from the
 *      catalogue section heading it is printed under (source: 'catalogue').
 *   2. Otherwise it is inferred from the product's own title, type, tags and
 *      description (source: 'inferred'). Rules are ordered; first match wins.
 *
 * The catalogue text is not committed (it is Mallcom's document); only the
 * derived per-product data is.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cataloguePath = process.argv[2];
if (!cataloguePath) {
  console.error('Usage: node scripts/build-product-ranges.mjs <catalogue.txt>');
  process.exit(1);
}

const loadModule = (rel) => {
  const src = fs.readFileSync(path.join(root, rel), 'utf8').replace(/export const /g, 'exports.');
  const exports = {};
  new Function('exports', src)(exports);
  return exports;
};
const { catalog } = loadModule('src/data/catalog.generated.js');
const { productDetails } = loadModule('src/data/productDetails.js');

/* ------------------------------------------------------------------ ranges */

export const RANGES = [
  // head
  ['head', 'helmets', 'Safety helmets'],
  ['head', 'bump-caps', 'Bump caps'],
  ['head', 'respirators', 'Respiratory masks'],
  ['head', 'surgical-masks', 'Surgical masks'],
  ['head', 'eyewear', 'Safety eyewear'],
  ['head', 'hearing', 'Hearing protection'],
  // hand
  ['hand', 'driver', 'Driver gloves'],
  ['hand', 'canadian', 'Canadian gloves'],
  ['hand', 'mechanical', 'Mechanical gloves'],
  ['hand', 'welder', 'Welder gloves'],
  ['hand', 'welding-wear', 'Welding garments & accessories'],
  ['hand', 'para-aramid', 'Para-aramid gloves'],
  ['hand', 'knitted', 'Knitted gloves'],
  ['hand', 'arm-sleeves', 'Arm sleeves'],
  ['hand', 'nitrile-cns', 'Nitrile cut & sewn gloves'],
  ['hand', 'gauntlets', 'Nitrile gauntlets'],
  ['hand', 'seamless-nitrile', 'Seamless nitrile gloves'],
  ['hand', 'cut-resistant', 'Cut-resistant nitrile gloves'],
  ['hand', 'pu', 'PU-coated gloves'],
  ['hand', 'thermal', 'Thermal gloves'],
  ['hand', 'supplementary', 'PVC, latex & neoprene gloves'],
  ['hand', 'cryo', 'Cryogenic protection'],
  // body
  ['body', 'workwear', 'Workwear'],
  ['body', 'fr', 'Flame-retardant & multinorm'],
  ['body', 'hi-vis', 'Hi-vis'],
  ['body', 'rainwear', 'Rainwear'],
  ['body', 'winter', 'Winter & softshell'],
  ['body', 'occupational', 'Occupational & medical'],
  ['body', 'disposable', 'Disposables'],
  // feet
  ['feet', 'shoes', 'Safety shoes'],
  ['feet', 'boots', 'Safety boots'],
  ['feet', 'high-boots', 'Tactical & high boots'],
  ['feet', 'gumboots', 'PVC gumboots'],
  ['feet', 'occupational-shoes', 'Occupational shoes'],
];

/** Catalogue section heading -> range id (head/hand/body). Feet headings are collections. */
const HEADING_RANGE = {
  'HELMET': 'helmets',
  'BUMP CAP': 'bump-caps',
  'HALF MASK': 'respirators',
  'SURGICAL MASK': 'surgical-masks',
  'EYEWEAR': 'eyewear',
  'EARPLUGS & EARMUFFS': 'hearing',
  'DRIVER GLOVES': 'driver',
  'CANADIAN GLOVES': 'canadian',
  'MECHANICAL GLOVES': 'mechanical',
  'WELDER GLOVES': 'welder',
  'WELDING GARMENT & ACCESSORIES': 'welding-wear',
  'PARA ARAMID GLOVES': 'para-aramid',
  'KNITTED GLOVES': 'knitted',
  'ARM SLEEVES GLOVES': 'arm-sleeves',
  'NITRILE CUT-n-STITCH GLOVES': 'nitrile-cns',
  'NITRILE CnS': 'nitrile-cns',
  'NBR GAUNTLET GLOVES': 'gauntlets',
  'NBR SEAMLESS GLOVES': 'seamless-nitrile',
  'SEAMLESS GLOVES': 'seamless-nitrile',
  'CUT RESISTANT NBR GLOVES': 'cut-resistant',
  'PU GLOVES': 'pu',
  'SUPPLEMENTARY GLOVES': 'supplementary',
  'CRYO ARTICLES': 'cryo',
  'ECONOMY WORKWEAR': 'workwear',
  'ECONOMY': 'workwear',
  'PREMIUM WORKWEAR': 'workwear',
  'FLAME RETARDANT WORKWEAR': 'fr',
  'RAINWEAR': 'rainwear',
  'HI-VIS': 'hi-vis',
  'DISPOSABLE': 'disposable',
  'OCCUPATIONAL': 'occupational',
};

/** Catalogue headings that are a Mallcom collection/tier rather than a product type. */
const COLLECTION = {
  'ECONOMY WORKWEAR': 'Economy workwear',
  'ECONOMY': 'Economy workwear',
  'PREMIUM WORKWEAR': 'Premium workwear',
  'EXECUTIVE FOOTWEAR': 'Executive footwear',
  'SAFETY SHOES': 'Safety shoes',
  'PREMIUM FOOTWEAR': 'Premium footwear',
  'LUXURY FOOTWEAR': 'Luxury footwear',
  'COMFORT SPLIT FOOTWEAR': 'Comfort split footwear',
  'SPORTS SAFETY FOOTWEAR': 'Sports safety footwear',
  'OCCUPATIONAL FOOTWEAR': 'Occupational footwear',
  'ECONOMY FOOTWEAR': 'Economy footwear',
  'HALF KNEE BOOT': 'Half-knee boots',
};

/* --------------------------------------------------------- inference rules */
// Mallcom's own range tags, where a product carries one. Checked first: they
// are the supplier's classification, not a guess from the description.
// In priority order: a product tagged both "Canadian Gloves" and "Mechanical Gloves" is Canadian.
const TAG_RULES = {
  'canadian gloves': 'canadian',
  'driver gloves': 'driver',
  'welder gloves': 'welder',
  'cut and sewn nitrile gloves': 'nitrile-cns',
  'cut resistant gloves': 'cut-resistant',
  'mechanical gloves': 'mechanical',
  'winter workwear': 'winter',
};

// [range, pattern]; evaluated in order against the product's own text.
const RULES = {
  head: [
    ['bump-caps', /bump ?cap|baseball/],
    ['helmets', /helmet/],
    ['surgical-masks', /surgical/],
    ['respirators', /\bffp\d|respirat|face ?mask|\bmasks?\b/],
    ['hearing', /ear ?plug|ear ?muff|ear defender|\bsnr\b/],
    ['eyewear', /goggle|spectacle|eyewear|glasses|\blens/],
  ],
  hand: [
    ['cryo', /cryogenic/],
    ['arm-sleeves', /arm ?sleeve/],
    ['welder', /weld|hot-?mill|mitten/],
    ['driver', /driver/],
    ['canadian', /canadian/],
    // "mechanical" alone also appears in "protection against mechanical risks"
    ['mechanical', /mechanical (?:gloves?|style)|\bmach\b|leather[^.]{0,80}velcro|velcro[^.]{0,80}leather/],
    // "latex foam padding" / "neoprene palm coating" are features of coated gloves, not these
    ['supplementary', /\blatex (?:rubber|gloves?|gauntlets?)|unsupported|neoprene (?:gloves?|gauntlets?)|\bpvc (?:gloves?|gauntlets?)/],
    ['gauntlets', /gauntlet|\b[34]0 ?cm\b/],
    ['nitrile-cns', /cut (?:and|&) sewn|cut (?:and|&) stitch|interlock|jersey|safety cuff/],
    ['thermal', /thermal|acrylic lining|ragwool|insulat/],
    ['cut-resistant', /(?:cut[- ]?resist|hppe|uhwmpe|steel filament|glass ?fib|dyneema|tungsten|ansi a\d).*(?:nitrile|nbr)|(?:nitrile|nbr).*(?:cut[- ]?resist|hppe|uhwmpe|steel filament|glass ?fib|dyneema|tungsten|ansi a\d)/],
    ['pu', /\bpu\b[^.]*coat|polyurethane/],
    ['seamless-nitrile', /nitrile|\bnbr\b/],
    ['para-aramid', /para[- ]?aramid/],
    ['knitted', /knit|gauge|\b1[035]g\b/],
  ],
  body: [
    ['disposable', /disposable|non ?woven|shoe cover|ssmms/],
    ['fr', /flame|\bfr\b|multinorm|modacrylic|nomex|\barc\b|welding and allied|thermal exposure|inherent/],
    // winter before hi-vis: parkas and body warmers often carry a reflective stripe
    ['winter', /winter|parka|body ?warmer|quilt|windcheater/],
    ['hi-vis', /hi[- ]?vi[sz]|high visibility|reflective/],
    ['rainwear', /\brain|poncho|pu coated/],
    ['occupational', /medical|chef|tunic|scrub|apron|healthcare|hospital/],
    ['workwear', /./],
  ],
  feet: [
    ['gumboots', /\bpvc\b|gumboot|rain boot/],
    ['high-boots', /thigh|half[- ]knee|knee boot|tactical|desert|combat/],
    ['occupational-shoes', /en ?(?:iso ?)?20347|occupational|clog|clean ?room|janitorial|healthcare/],
    ['shoes', /low[- ]ankle/],
    ['boots', /mid[- ]ankle|high[- ]ankle|ankle boot|\bboots?\b/],
    ['shoes', /shoe|sandal|slip[- ]?on|sneaker/],
  ],
};

/* ------------------------------------------------- catalogue text parsing */

const pages = fs.readFileSync(cataloguePath, 'utf8').split('\f');
const sectionOf = (n) => (n >= 8 && n <= 29 ? 'head' : n >= 30 && n <= 73 ? 'hand' : n >= 74 && n <= 95 ? 'body' : n >= 96 && n <= 119 ? 'feet' : null);
const HEADING_LINE = /^(SAFETY|HELMET|BUMP CAP|HALF MASK|SURGICAL MASK|EYEWEAR|EARPLUGS|& EARMUFFS|DRIVER|CANADIAN|MECHANICAL|WELDER|WELDING|GARMENT &|ACCESSORIES|PARA|ARAMID|GLOVES|KNITTED|ARM|SLEEVES|NITRILE|CUT-n-STITCH|NITRILE CnS|NBR|GAUNTLET|SEAMLESS|SEAMLESS GLOVES|CUT|RESISTANT|NBR GLOVES|PU|SUPPLEMENTARY GLOVES|CRYO|ARTICLES|ECONOMY|WORKWEAR|PREMIUM|FLAME|RETARDANT|RAINWEAR|HI-VIS|DISPOSABLE|OCCUPATIONAL|EXECUTIVE|FOOTWEAR|SAFETY SHOES|LUXURY|COMFORT|SPLIT|SPORTS|HALF|KNEE BOOT|SAFETY HELMET|SAFETY EYEWEAR|SAFETY HALF MASK|WELDER GLOVES)$/;
const key = (s) => String(s || '').toUpperCase().replace(/\(.*?\)/g, '').replace(/[^A-Z0-9]/g, '');

// Every product title on the site is a candidate entry name, alongside codes
// the catalogue prints that the site does not carry.
const siteProducts = Object.entries(catalog).flatMap(([zone, list]) => list.map((p) => ({ zone, ...p })));
const titleKeys = new Set(siteProducts.flatMap((p) => [key(p.title), key(p.fullTitle)]).filter((k) => k.length >= 3));
const looksLikeName = (s) => s.length >= 2 && s.length <= 28 && /^[A-Z0-9]/.test(s) && (!/[a-z]/.test(s) || /^[A-Z][a-z]+ [IVX0-9]+$/.test(s)) && !/^(EN|IS|AS|ANSI|ASTM)\b/.test(s) && !/^\d/.test(s);

const entries = []; // { name, key, page, section, heading, lines[] }
let heading = '';
let lastSection = '';
pages.forEach((page, i) => {
  const n = i + 1;
  const section = sectionOf(n);
  if (!section) return;
  if (section !== lastSection) { heading = ''; lastSection = section; }
  const lines = page.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const head = [];
  for (const s of lines.slice(0, 5)) { if (HEADING_LINE.test(s.split(/\s{3,}/)[0])) head.push(s.split(/\s{3,}/)[0]); else break; }
  if (head.length) heading = head.join(' ').replace(/^SAFETY (?=HELMET|EYEWEAR|HALF MASK|BUMP CAP|EARPLUGS)/, '').replace(/\s+/g, ' ');

  let current = null;
  for (const raw of lines) {
    const first = raw.split(/\s{3,}/)[0].trim();
    const k = key(first);
    const isEntry = !HEADING_LINE.test(first) && looksLikeName(first) && (titleKeys.has(k) || /^[A-Z]{1,6}[0-9]/.test(first) || /^[A-Z]+( [A-Z0-9]+)*$/.test(first) && first.length >= 4);
    if (isEntry && !/[^\x20-\x7e]/.test(first) && k.length >= 3) {
      current = { name: first, key: k, page: n, section, heading, lines: [] };
      entries.push(current);
      continue;
    }
    if (current) current.lines.push(raw);
  }
});

// Standards with ratings, e.g. "EN 388 - 3132X", "EN 407 - 413X4X", "EN 12477 TYPE A".
const STD = /\b(EN ?ISO ?\d{3,5}(?:-\d)?|EN ?\d{3,5}(?:-\d)?|IS ?\d{3,5}|AS\/NZS ?\d{3,4})(?:\s*-\s*([0-9X]{3,6}[A-F]?P?)\b|\s+(TYPE [AB]|Class \d(?: [A-Z]\d)?))?/g;
const standardsOf = (entry) => {
  const out = [];
  const seen = new Set();
  // Only lines up to the next entry belong to this one; stop at 12 to avoid bleeding.
  for (const line of entry.lines.slice(0, 12)) {
    for (const m of line.matchAll(STD)) {
      const code = m[1].replace(/^EN ?/, 'EN ').replace(/^IS ?/, 'IS ').replace(/^AS\/NZS ?/, 'AS/NZS ').replace(/EN ISO ?/, 'EN ISO ');
      if (seen.has(code)) continue;
      seen.add(code);
      out.push(m[2] || m[3] ? { code, rating: (m[2] || m[3]).replace(/^Class/, 'Class') } : { code });
    }
  }
  return out;
};

// Only keep entries that look like real products (have a description line).
const catalogueEntries = entries.filter((e) => e.lines.length >= 2 && /[a-z]{3,}/.test(e.lines[0] + e.lines[1]));
/**
 * Looser key for matching site titles to catalogue names: roman numerals as
 * numbers, no leading zeros ("PANTHER 07" = "PANTHER 7"), Mallcom's "NIF"
 * prefix dropped, and "0B" read as "OB".
 */
const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15, XVI: 16, XVII: 17 };
const looseKey = (s) => String(s || '').toUpperCase()
  .replace(/\(.*?\)/g, '')
  .replace(/\bNIF\b/g, '')
  .replace(/\b0B\b/g, 'OB')
  .replace(/\b[IVX]+\b/g, (m) => (ROMAN[m] ? String(ROMAN[m]) : m))
  .replace(/\b0+(\d)/g, '$1')
  .replace(/[^A-Z0-9]/g, '');

/**
 * Site titles that are the catalogue product under a different spelling,
 * checked by hand against the catalogue description. Value = catalogue name.
 */
const ALIASES = {
  'C1045DD': 'C1045D',           // same glove; the storefront doubled the D
  'BELLARUS': 'BELARUS',
  'C834': 'C834 JNS',            // the site's C834 is the jeans-back glove
  'SELKIRK REX': 'SELKRIK REX',  // catalogue misspells the breed name
  'CYMRIC J03 OB': 'CYMRIC J03 O2',
  'CYMRIC K03 OB': 'CYMRIC K03 O2',
  'KOLDING & NORD': 'KOLDING',
  // DALFON is printed once; the site lists its colour variants separately.
  'DALFON J116': 'DALFON', 'DALFON J126': 'DALFON', 'DALFON J226': 'DALFON', 'DALFON J326': 'DALFON',
};

const byKey = new Map();
for (const e of catalogueEntries) if (!byKey.has(looseKey(e.name))) byKey.set(looseKey(e.name), e);

// Glossary symbols and CE per catalogue row (scripts/data/catalogue-symbols-2025.json,
// extracted from the page renders and mapped by hand to page 142 "Glossary of icons").
const symbolRows = JSON.parse(fs.readFileSync(path.join(root, 'scripts/data/catalogue-symbols-2025.json'), 'utf8'));
const symbolsByKey = new Map();
for (const r of symbolRows) if (r.title && !symbolsByKey.has(looseKey(r.title))) symbolsByKey.set(looseKey(r.title), r);
// Ratings read by eye where the extraction missed or misassigned a row (e.g. a
// hero product whose page-wide row was filed under its small variant inset).
// These win over the extracted values. scripts/data/catalogue-spec-corrections-2025.json
const corrections = JSON.parse(fs.readFileSync(path.join(root, 'scripts/data/catalogue-spec-corrections-2025.json'), 'utf8'));
const correctionByKey = new Map(Object.entries(corrections).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [looseKey(k), v]));
const applyCorrection = (rec, keys) => {
  const c = keys.map((k) => correctionByKey.get(k)).find(Boolean);
  if (!c) return;
  if (c.symbols) rec.symbols = c.symbols;
  if (c.standards) rec.standards = c.standards;
  if (c.ce) rec.ce = true;
  stats.corrected = (stats.corrected || 0) + 1;
};
// Section heading in force on a page, for products only found via the symbol rows.
const headingOnPage = (page) => {
  let h = '';
  for (const e of catalogueEntries) if (e.page <= page && e.heading) h = e.heading;
  return h;
};

/* ------------------------------------------------------------- assignment */

const textOf = (p) => [p.title, p.fullTitle, p.type, (p.tags || []).join(' '), p.desc || ''].join(' ').toLowerCase();
const detailsOf = (slug) => JSON.stringify(productDetails[slug] || {}).toLowerCase();
const infer = (zone, p) => {
  const tags = new Set((p.tags || []).map((t) => t.trim().toLowerCase()));
  for (const [tag, r] of Object.entries(TAG_RULES)) {
    if (tags.has(tag) && RANGES.some(([z, id]) => z === zone && id === r)) return r;
  }
  for (const source of [textOf(p), detailsOf(p.slug)]) {
    for (const [range, re] of RULES[zone]) if (re.test(source)) return range;
  }
  return null;
};

const result = {};
const stats = { catalogue: 0, inferred: 0, none: [] };
for (const p of siteProducts) {
  const alias = ALIASES[String(p.title).trim().toUpperCase()];
  const keys = [alias, p.title, p.fullTitle].filter(Boolean).map(looseKey);
  const hitEntry = keys.map((k) => byKey.get(k)).find((e) => e && e.section === p.zone);
  const sym = keys.map((k) => symbolsByKey.get(k)).find(Boolean);
  const page = hitEntry?.page ?? sym?.page;
  const rec = {};
  if (hitEntry || (sym && sectionOf(sym.page) === p.zone)) {
    const heading = hitEntry?.heading || headingOnPage(page);
    rec.range = HEADING_RANGE[heading] || infer(p.zone, p); // feet: heading is a collection, range comes from form
    rec.source = 'catalogue';
    rec.inCatalogue = true;
    rec.page = page;
    if (COLLECTION[heading]) rec.collection = COLLECTION[heading];
    const std = hitEntry ? standardsOf(hitEntry) : [];
    if (std.length) rec.standards = std;
    if (sym?.symbols?.length) rec.symbols = sym.symbols;
    if (sym?.ce) rec.ce = true;
    applyCorrection(rec, keys);
    stats.catalogue += 1;
  } else {
    rec.range = infer(p.zone, p);
    rec.source = 'inferred';
    stats.inferred += 1;
  }
  if (!rec.range) stats.none.push(`${p.zone}/${p.slug}`);
  result[p.slug] = rec;
}

/* ------------------------------------------- catalogue products not in the storefront */
// scripts/data/catalogue-added-products-2025.json: name, page, description lines,
// sizes, colours and photo, taken from the catalogue page (photos in
// public/products/catalogue/). Standards, symbols, CE and range are filled in
// here exactly as for storefront products.
const addedSource = JSON.parse(fs.readFileSync(path.join(root, 'scripts/data/catalogue-added-products-2025.json'), 'utf8'));
// On page 44 the welder jacket's spec row is printed beside a photo label
// "SLTE01", so the text parser files its standards under that name.
const SPEC_ROW_OF = { SLJB01: 'SLTE01' };
const added = [];
for (const a of addedSource) {
  const k = looseKey(a.name);
  const entry = byKey.get(k);
  // (that row has no description line, so look in all parsed entries, not just catalogueEntries)
  const specEntry = SPEC_ROW_OF[a.name] ? entries.find((e) => looseKey(e.name) === looseKey(SPEC_ROW_OF[a.name])) : entry;
  const sym = symbolsByKey.get(k);
  const heading = entry?.heading || headingOnPage(a.page);
  const desc = a.desc.map((l) => l.replace(/\.$/, '')).join('. ') + '.';
  const product = {
    slug: a.slug,
    title: a.name,
    fullTitle: a.name,
    type: '',
    vendor: 'Mallcom catalogue 2025',
    tags: [],
    img: a.img,
    imgs: a.img ? [a.img] : [],
    desc,
    hasDesc: true,
    sizes: a.sizes || null,
    colours: a.colours || [],
  };
  const rec = {
    range: HEADING_RANGE[heading] || infer(a.section, product),
    source: 'catalogue',
    inCatalogue: true,
    page: a.page,
  };
  if (COLLECTION[heading]) rec.collection = COLLECTION[heading];
  const std = specEntry ? standardsOf(specEntry) : [];
  if (std.length) rec.standards = std;
  if (sym?.symbols?.length) rec.symbols = sym.symbols;
  if (sym?.ce || (SPEC_ROW_OF[a.name] && std.length)) rec.ce = true;
  applyCorrection(rec, [k]);
  if (!rec.range) stats.none.push(`${a.section}/${a.slug} (added)`);
  added.push({ zone: a.section, product, rec });
}

/* ------------------------------------------------------------------ write */

const rangeMeta = RANGES.map(([zone, id, label]) => ({ zone, id, label }));
const out = `// AUTO-GENERATED by scripts/build-product-ranges.mjs from Mallcom's 2025 catalogue.
// Regenerate rather than editing by hand. See the script header for how ranges are chosen.
export const rangeMeta = ${JSON.stringify(rangeMeta, null, 1)};
export const productRanges = ${JSON.stringify(result, null, 1)};
/** Catalogue products the storefront snapshot does not carry: { zone, product, rec }. */
export const addedProducts = ${JSON.stringify(added, null, 1)};
`;
fs.writeFileSync(path.join(root, 'src/data/productRanges.generated.js'), out);

const counts = {};
for (const [slug, r] of Object.entries(result)) {
  const z = siteProducts.find((p) => p.slug === slug).zone;
  const k = `${z}/${r.range}`;
  counts[k] = (counts[k] || 0) + 1;
}
console.log(`catalogue: ${stats.catalogue}, inferred: ${stats.inferred}, unassigned: ${stats.none.length}, hand-corrected ratings: ${stats.corrected || 0}`);
if (stats.none.length) console.log('unassigned:', stats.none.join(', '));
console.log(Object.entries(counts).sort().map(([k, v]) => `${String(v).padStart(4)} ${k}`).join('\n'));
