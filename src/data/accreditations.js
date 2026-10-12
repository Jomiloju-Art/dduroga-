/**
 * Accreditations shown in the homepage trust strip and on /certifications.
 *
 * The list and the logo artwork come from the last page of the client-supplied
 * "Mallcom Nigeria - Business Profile & Mini Catalogue" (Facility / Product
 * Accreditations). The logos in public/accreditations/ were extracted from that
 * PDF; swap in the official vector files from each scheme when they arrive.
 *
 * Facility accreditations belong to Mallcom India Limited, the parent company,
 * for its manufacturing sites. Say so wherever they appear.
 *
 * `facts` values of TODO render as a "To be supplied" tag. Do not fill them
 * with anything that is not on the actual certificate.
 *
 * The ISI mark is printed in the catalogue but deliberately left out here: the
 * client asked for it to be removed from the old certification row, as BIS/ISI
 * is an Indian domestic certification that does not apply to a Nigerian supplier.
 */
export const TODO = null;

export const accreditations = [
  // ---- facility ----
  {
    id: 'iso-9001',
    kind: 'facility',
    name: 'ISO 9001:2015',
    short: 'ISO 9001',
    logo: '/accreditations/iso-9001-2015.png',
    what: 'Quality management system. Independently audited processes for consistent manufacturing, inspection and traceability.',
    facts: { 'Issued to': 'Mallcom India Limited', 'Certifying body': TODO, Scope: TODO, 'Certificate no.': TODO, 'Valid until': TODO },
    verify: 'IAF CertSearch',
  },
  {
    id: 'iso-14001',
    kind: 'facility',
    name: 'ISO 14001:2015',
    short: 'ISO 14001',
    logo: '/accreditations/iso-14001-2015.png',
    what: 'Environmental management system. Audited controls over waste, emissions and resource use in manufacturing.',
    facts: { 'Issued to': 'Mallcom India Limited', 'Certifying body': TODO, Scope: TODO, 'Certificate no.': TODO, 'Valid until': TODO },
    verify: 'IAF CertSearch',
  },
  {
    id: 'sa8000',
    kind: 'facility',
    name: 'SA8000',
    short: 'SA8000',
    logo: '/accreditations/saas-sa8000.png',
    what: 'Social accountability standard covering fair labour, working hours, wages and workplace health & safety. Certification bodies are accredited by SAAS.',
    facts: { 'Issued to': 'Mallcom India Limited', 'Certifying body': TODO, Site: TODO, 'Certificate no.': TODO, 'Valid until': TODO },
    verify: 'the SAAS certified-facilities list',
  },
  {
    id: 'sedex',
    kind: 'facility',
    name: 'Sedex',
    short: 'Sedex',
    logo: '/accreditations/sedex.png',
    what: 'Ethical supply-chain membership. Labour, health & safety, environment and business-ethics data shared with customers, typically backed by SMETA audits.',
    facts: { Member: 'Mallcom India Limited', 'Sedex ID': TODO, 'Latest audit': TODO },
    verify: 'Sedex',
  },
  {
    id: 'fair-wear',
    kind: 'facility',
    name: 'Fair Wear',
    short: 'Fair Wear',
    logo: '/accreditations/fair-wear.png',
    what: 'Fair Wear works to improve conditions for workers in garment factories. Relevant to the body-protection and workwear ranges.',
    facts: { Relationship: TODO, Since: TODO },
    verify: 'Fair Wear',
  },
  // ---- product ----
  {
    id: 'ce',
    kind: 'product',
    name: 'CE marking',
    short: 'CE',
    logo: '/accreditations/ce.png',
    what: 'Conformity with the EU PPE Regulation (EU) 2016/425. Category II and III products are type-examined by a notified body.',
    facts: { Regulation: '(EU) 2016/425', 'Notified body': TODO, 'Product lines': TODO },
    verify: 'the EU NANDO database',
  },
  {
    id: 'ukca',
    kind: 'product',
    name: 'UKCA',
    short: 'UKCA',
    logo: '/accreditations/ukca.png',
    what: 'UK Conformity Assessed. The Great Britain equivalent of CE marking for PPE.',
    facts: { Regulation: 'PPE Regulation 2016/425 (as it applies in GB)', 'Approved body': TODO, 'Product lines': TODO },
    verify: 'the UK approved-bodies register',
  },
  {
    id: 'ansi',
    kind: 'product',
    name: 'ANSI / ISEA',
    short: 'ANSI',
    logo: '/accreditations/ansi.png',
    what: 'Tested to American National Standards, e.g. ANSI/ISEA Z89.1 (head), Z87.1 (eye) and ANSI/ISEA 105 (hand).',
    facts: { Standards: TODO, 'Product lines': TODO },
  },
  {
    id: 'astm',
    kind: 'product',
    name: 'ASTM International',
    short: 'ASTM',
    logo: '/accreditations/astm.png',
    what: 'Tested to ASTM standards, e.g. F2413 (safety footwear) and F1506 (flame-resistant clothing).',
    facts: { Standards: TODO, 'Product lines': TODO },
  },
  {
    id: 'nfpa',
    kind: 'product',
    name: 'NFPA',
    short: 'NFPA',
    logo: '/accreditations/nfpa.png',
    what: 'Meets US National Fire Protection Association standards, e.g. NFPA 2112 flame-resistant garments.',
    facts: { Standards: TODO, 'Product lines': TODO },
  },
  {
    id: 'as-nzs',
    kind: 'product',
    name: 'Australian Standard',
    short: 'AS/NZS',
    logo: '/accreditations/australian-standard.png',
    what: 'Certified Product mark for Australian / New Zealand standards, e.g. AS/NZS 1801 occupational helmets.',
    facts: { Standards: TODO, 'Licence no.': TODO, 'Product lines': TODO },
    verify: 'the issuer register',
  },
];

export const facilityAccreditations = accreditations.filter((a) => a.kind === 'facility');
export const productAccreditations = accreditations.filter((a) => a.kind === 'product');
export const accreditationById = (id) => accreditations.find((a) => a.id === id) || null;
