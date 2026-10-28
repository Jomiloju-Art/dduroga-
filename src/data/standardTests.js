/**
 * Which standard each "Tests conducted" line on a product belongs to.
 *
 * Mallcom's product pages repeat the same long test write-up on every product
 * under a standard (all 140 safety shoes carry identical text). At the
 * client's request (Oct 2026) the write-ups live once in the Learning centre,
 * under each guide's `tests` (guides.js), and a product page keeps only the
 * standard chips, linked to that write-up, plus the product's own levels
 * from its catalogue rating (ratingScores).
 *
 * Test names here must match the `name`s in guides.js. Lines that match no
 * test (short compliance notes such as "Compliance with EN13688 std.") stay
 * on the product page as they are.
 *
 * The helmet test methods (3 kg wooden striker from 1.5 m, 500 g plumb bob
 * from 3 m, 2000 V) are the IS 2925 methods, not EN 397's, so they sit under
 * IS 2925; an EN 397 chip links to the same helmet guide.
 */

const family = (id, label, guide, chip, tests) => ({ id, label, guide, chip, tests });
const test = (name, match) => ({ name, match });

export const TEST_FAMILIES = [
  family('en-iso-20345', 'EN ISO 20345', 'safety-footwear-s1p-vs-s3', /20345|IS\s?15298/i, [
    test('Impact resistance', /^impact resistance:/i),
    test('Nail penetration resistance', /^nail penetration/i),
    test('Sole abrasion', /^sole abrasion/i),
    test('Flexing', /^flexing/i),
    test('Upper/outsole and sole interlayer bond strength', /^upper\/outsole/i),
    test('Hydrolysis', /^hydrolysis/i),
    test('Electrical insulation', /^electrical (insulation|properties)/i),
    test('Anti-static', /^anti-static/i),
  ]),
  family('is-2925', 'IS 2925', 'safety-helmets-en397-is2925', /IS\s?2925|EN\s?397/i, [
    test('Shock absorption', /^shock absorption/i),
    test('Penetration resistance', /^method of testing penetration/i),
    test('Flammability resistance', /^method of testing flammability/i),
    test('Electrical resistance', /^method of testing electrical/i),
    test('Water absorption', /^method of testing water/i),
    test('Heat resistance', /^method of testing heat/i),
  ]),
  family('en-388', 'EN 388', 'cut-resistance-en388-ansi', /EN\s?388/i, [
    test('Abrasion', /^(abrasion|resistance to abrasion|en 388:2016.*abrasion)/i),
    test('Blade cut', /^(cut as per|blade cut|the blade cut)/i),
    test('Tear', /^tear/i),
    test('Puncture', /^puncture/i),
    test('TDM blade cut', /^(test e )?tdm/i),
    test('Impact', /^impact test level/i),
  ]),
  family('en-407', 'EN 407', 'heat-cold-gloves-en407-en511', /EN\s?407/i, [
    test('Flammability', /^resistance to flammability/i),
    test('Contact heat', /^resistance to contact heat/i),
    test('Convective heat', /^resistance to convective heat/i),
    test('Radiant heat', /^resistance to radiant heat/i),
    test('Small splashes of molten metal', /^resistance to small splashes/i),
    test('Large splashes of molten metal', /^resistance to large splashes/i),
  ]),
  family('en-511', 'EN 511', 'heat-cold-gloves-en407-en511', /EN\s?511/i, [
    test('Convective cold', /^(resistance to convective cold|en 511:2006 \w convective)/i),
    test('Contact cold', /^resistance to contact cold/i),
    test('Water permeability', /^waterproof/i),
  ]),
  family('en-374', 'EN 374', 'chemical-gloves-en374', /EN\s?374/i, [
    test('Micro-organisms (EN 374-2)', /^en 374-2/i),
    test('Chemicals (EN 374-3)', /^en 374-3/i),
  ]),
  family('en-166', 'EN 166', 'eye-protection-en166', /EN\s?16[678]/i, [
    test('Optical tests (EN 167)', /^the optical tests/i),
    test('Non-optical tests (EN 168)', /^non-optical/i),
    test('Physical properties', /^physical property/i),
    test('Robustness', /^as an absolute minimum/i),
    test('Ignition resistance', /^safety eyewear is tested for resistance to ignition/i),
    test('Corrosion resistance', /^corrosion resistance/i),
    test('Light transmittance', /^(a |the )?transmittance/i),
  ]),
];

/** Learning-centre link for a family's write-up. */
export const testsHref = (fam) => `/learning/${fam.guide}#tests-${fam.id}`;

/** Learning-centre link for a standard chip ("EN 388 4121X"), or null. */
export function standardTestsHref(chip) {
  const fam = TEST_FAMILIES.find((f) => f.chip.test(chip));
  return fam ? testsHref(fam) : null;
}

/**
 * A product's own levels, read from its official catalogue rating (the
 * digits printed under the pictogram): "EN 388 3123X" gives Abrasion 3,
 * Cut 1, Tear 2, Puncture 3, TDM cut X. The levels written into Mallcom's
 * web test text often disagree with the catalogue (34 of 55 gloves checked
 * in Oct 2026), so they are never used. X means not tested.
 */
const RATING_PARTS = {
  'en-388': ['Abrasion', 'Cut', 'Tear', 'Puncture', 'TDM cut', 'Impact'],
  'en-407': ['Flammability', 'Contact heat', 'Convective heat', 'Radiant heat', 'Small molten splash', 'Large molten splash'],
  'en-511': ['Convective cold', 'Contact cold', 'Water'],
};
export function ratingScores(code, rating) {
  const fam = TEST_FAMILIES.find((f) => f.chip.test(code || ''));
  const parts = fam && RATING_PARTS[fam.id];
  const digits = (rating || '').replace(/\s/g, '').toUpperCase();
  if (!parts || !/^[0-9A-FPX]+$/.test(digits) || digits.length < 3 || digits.length > parts.length) return null;
  return { fam, scores: [...digits].map((level, i) => ({ name: parts[i], level })) };
}

/**
 * Sort a product's test lines into the standards they describe and the
 * short lines that match none.
 */
export function sortTests(lines) {
  const found = new Map();
  const other = [];
  for (const raw of lines || []) {
    const line = raw.replace(/\s+/g, ' ').trim();
    if (!line) continue;
    const fam = TEST_FAMILIES.find((f) => f.tests.some((t) => t.match.test(line)));
    if (fam) found.set(fam.id, fam);
    else if (!other.includes(line)) other.push(line);
  }
  return { families: [...found.values()], other };
}
