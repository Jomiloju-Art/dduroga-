/**
 * Mallcom's official product datasheets (one-page PDFs in public/datasheets/,
 * received from Mallcom in October 2026), and what each sheet prints under
 * "Certified for safety" and "Advanced protection features".
 *
 * Keyed by product key (the storefront slug; `catalogue:<slug>` for products
 * added from the catalogue). For these products the datasheet replaces the
 * catalogue's standards, symbols and CE mark entirely: it is the newer source,
 * and where the two disagree the sheet is right (RUFUS K01 is steel-toed, not
 * fibreglass). Symbol names are the catalogue's page-142 glossary names; a
 * feature the glossary has no icon for (FELIX S03's aluminium toecap) is left out.
 *
 * `show: true` lists a product the 2025 catalogue does not print (it has a
 * datasheet, so Mallcom still sells it). `slug` gives it a URL of its own where
 * the storefront's address belongs to another product.
 *
 * Products without an entry here offer no datasheet download.
 * To add a sheet: put the PDF in public/datasheets/ and add an entry.
 */
const EN397 = { standards: [{ code: 'EN 397' }], ce: true, symbols: ['Projectiles', 'Bump', 'Head Impact'] };
const JASPER = { standards: [{ code: 'IS 2925' }], ce: false, symbols: ['Projectiles', 'Bump', 'Head Impact'] };
const EYEWEAR = { ce: true, symbols: ['Anti Fog', 'Light & Comfortable', 'Anti Scratch'] };
const SHOE = { standards: [{ code: 'EN 20345' }, { code: 'IS 15298' }], ce: true };

export const DATASHEETS = {
  larmslv: {
    files: [{ href: '/datasheets/larmslv.pdf' }],
    standards: [{ code: 'EN 388', rating: '2122X' }], ce: true,
    symbols: ['Flame', 'Breathable', 'Light & Comfortable'],
  },
  'catalogue:orbit': {
    files: [{ href: '/datasheets/orbit.pdf' }],
    ...EYEWEAR, standards: [{ code: 'EN 166', rating: '2C 1.21 F' }],
  },
  'catalogue:pluto': {
    files: [{ href: '/datasheets/pluto.pdf' }],
    ...EYEWEAR, standards: [{ code: 'EN 166', rating: '2C-1.21 F' }],
  },
  apollo: {
    files: [{ href: '/datasheets/apollo.pdf' }],
    ...EYEWEAR, standards: [{ code: 'EN 166', rating: '2C 1.21 F' }],
  },
  'diamond-iii': { files: [{ href: '/datasheets/diamond-iii.pdf' }], ...EN397 },
  'diamond-xii': { files: [{ href: '/datasheets/diamond-xii.pdf' }], ...EN397 },
  'jasper-xv': { files: [{ href: '/datasheets/jasper-xv.pdf' }], ...JASPER, show: true },
  // The storefront filed JASPER XVII under /products/jasper-iv, which is JASPER IV's address.
  'jasper-iv': { files: [{ href: '/datasheets/jasper-xvii.pdf' }], ...JASPER, show: true, slug: 'jasper-xvii' },
  'c-853': {
    files: [{ href: '/datasheets/c853.pdf' }],
    standards: [{ code: 'EN 388', rating: '4344X' }], ce: true,
    symbols: ['Light & Comfortable', 'Tear', 'Puncture'],
  },
  f437: {
    files: [{ href: '/datasheets/f437.pdf' }],
    standards: [{ code: 'EN 388', rating: '4133X' }, { code: 'EN 407', rating: '413X4X' }], ce: true,
    symbols: ['Flame', 'Heat', 'Breathable'],
  },
  'f667-1': {
    files: [{ href: '/datasheets/f667.pdf' }],
    // The 2025 catalogue (p41) prints EN 388 4133X / EN 407 413X4X; the client
    // confirmed the sheet is right (Oct 2026). CE: the sheet's box omits it,
    // but the catalogue and the glove's own stamp carry it.
    standards: [{ code: 'EN 388', rating: '4244X' }, { code: 'EN 407', rating: '423X4X' }], ce: true,
    symbols: ['Abrasion', 'Tear'],
  },
  f834: {
    files: [{ href: '/datasheets/f834.pdf' }],
    standards: [{ code: 'EN 388', rating: '4244X' }, { code: 'EN 407', rating: '433X4X' }, { code: 'EN 12477', rating: 'TYPE A' }], ce: true,
    symbols: ['Breathable', 'Flame', 'Heat'],
  },
  nf153g: {
    files: [{ href: '/datasheets/nf153g.pdf' }],
    standards: [
      { code: 'EN ISO 374-1:2016', rating: 'Type A ABJKLMNO' },
      { code: 'EN 388:2016', rating: '4102X' },
      { code: 'EN ISO 374-5:2016', rating: 'VIRUS' },
    ],
    ce: true, // as F667: catalogue p71 and the glove stamp carry CE; the sheet's box omits it

    symbols: ['Abrasion', 'Bio Hazard'],
  },
  'rufus-k01': {
    files: [{ href: '/datasheets/rufus-k01-s1p.pdf', label: 'RUFUS K01 S1P' }],
    ...SHOE, symbols: ['Steel Toecap', 'Energy Absorbent', 'Anti Static', 'Oil Resistant'],
  },
  'doxle-gold-copy': {
    files: [
      { href: '/datasheets/doxle-s1p.pdf', label: 'DOXLE S1P' },
      { href: '/datasheets/doxle-s3.pdf', label: 'DOXLE S3' },
    ],
    ...SHOE, symbols: ['Steel Toecap', 'Energy Absorbent', 'Anti Static', 'Oil Resistant'],
  },
  'felix-s03': {
    files: [{ href: '/datasheets/felix-s03.pdf', label: 'FELIX S03 S1' }],
    ...SHOE, symbols: ['Energy Absorbent', 'Anti Static'], show: true,
  },
};
