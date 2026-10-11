/**
 * Standards reference index.
 *
 * This is a lookup table of what common PPE standards cover — not a claim that
 * every catalogue line carries every mark. Certificates for a specific product
 * are available on request; the Learning Centre FAQ says the same thing.
 *
 * Fields:
 *   code   - the mark as it is printed on the product
 *   body   - EN / ISO / ANSI / IS, shown as the group chip
 *   title  - what the standard governs
 *   scope  - one line, plain language
 *   zone   - protection zone id used by the catalogue (head | hand | body | feet)
 *   hazard - canonical hazard id from `hazardNames`, when a clean filter exists
 *   marks  - extra grade/class vocabulary a buyer might type instead
 */
import { byHazard } from './products.js';

export const standards = [
  // --- Hand ---------------------------------------------------------------
  {
    code: 'EN 388',
    body: 'EN',
    title: 'Gloves — mechanical risks',
    scope: 'Abrasion, cut, tear and puncture resistance for protective gloves. The 2016 revision reports cut as level A–F using the ISO 13997 TDM test.',
    zone: 'hand',
    hazard: 'cut',
    marks: ['mechanical', 'cut', 'abrasion', 'tear', 'puncture', 'coupe', 'tdm'],
  },
  {
    code: 'EN 407',
    body: 'EN',
    title: 'Gloves — thermal risks',
    scope: 'Resistance to burning, contact heat, convective heat, radiant heat, small and large splashes of molten metal.',
    zone: 'hand',
    hazard: 'heat',
    marks: ['thermal', 'heat', 'flame', 'burn', 'molten', 'welding'],
  },
  {
    code: 'EN 511',
    body: 'EN',
    title: 'Gloves — cold',
    scope: 'Convective cold and contact cold, plus water permeability, for gloves used in cold stores and outdoor work.',
    zone: 'hand',
    hazard: 'cold',
    marks: ['cold', 'winter', 'freezer', 'cryogenic'],
  },
  {
    code: 'EN ISO 374',
    body: 'ISO',
    title: 'Gloves — chemicals and micro-organisms',
    scope: 'Breakthrough time and permeation performance against named chemicals, plus resistance to bacteria and fungi.',
    zone: 'hand',
    hazard: 'chemical',
    marks: ['chemical', 'permeation', 'breakthrough', 'micro-organism', 'nitrile'],
  },
  {
    code: 'EN 420',
    body: 'EN',
    title: 'Gloves — general requirements',
    scope: 'Sizing, dexterity, pH and water-vapour transmission. The base standard every glove claim sits on.',
    zone: 'hand',
    marks: ['sizing', 'dexterity', 'general', 'glove'],
  },
  {
    code: 'IS 4770',
    body: 'IS',
    title: 'Rubber insulating gloves',
    scope: 'Electrical insulating gloves for live working, classified by proof voltage and maximum working voltage.',
    zone: 'hand',
    hazard: 'electric',
    marks: ['electrical', 'insulating', 'voltage', 'live working', 'electrician'],
  },

  // --- Head ---------------------------------------------------------------
  {
    code: 'EN 166',
    body: 'EN',
    title: 'Eye and face protection',
    scope: 'General requirements for spectacles, goggles and face shields, with optional fields of use for impact, molten metal, dust and gas.',
    zone: 'head',
    hazard: 'impact',
    marks: ['eye', 'spectacles', 'goggles', 'face shield', 'impact', 'optical'],
  },
  {
    code: 'EN 170',
    body: 'EN',
    title: 'Eye protection — UV filters',
    scope: 'Ultraviolet filters, with scale numbers setting the level of UV attenuation.',
    zone: 'head',
    hazard: 'uv',
    marks: ['ultraviolet', 'uv', 'filter', 'sun'],
  },
  {
    code: 'EN 397',
    body: 'EN',
    title: 'Industrial safety helmets',
    scope: 'General industrial head protection: impact, penetration and optional extras such as lateral deformation, molten metal and electrical insulation.',
    zone: 'head',
    hazard: 'fallingObject',
    marks: ['helmet', 'hard hat', 'falling object', 'penetration', 'lateral deformation'],
  },
  {
    code: 'EN 149',
    body: 'EN',
    title: 'Filtering half masks (FFP)',
    scope: 'Particle filtering half masks in three classes — FFP1, FFP2 and FFP3 — with optional dolomite dust clogging and rebreathing tests.',
    zone: 'head',
    hazard: 'dust',
    marks: ['respirator', 'mask', 'ffp1', 'ffp2', 'ffp3', 'dust', 'particulate', 'n95'],
  },
  {
    code: 'EN 352',
    body: 'EN',
    title: 'Hearing protectors',
    scope: 'Ear muffs and ear plugs, rated by sound attenuation measured in decibels across test frequencies.',
    zone: 'head',
    marks: ['hearing', 'ear muffs', 'ear plugs', 'noise', 'decibel', 'snr'],
  },
  {
    code: 'IS 2925',
    body: 'IS',
    title: 'Industrial safety helmets',
    scope: 'Indian Standard specification for industrial safety helmets, covering impact and penetration performance.',
    zone: 'head',
    hazard: 'fallingObject',
    marks: ['helmet', 'hard hat', 'indian standard', 'head'],
  },

  // --- Body ---------------------------------------------------------------
  {
    code: 'EN ISO 20471',
    body: 'ISO',
    title: 'High-visibility clothing',
    scope: 'Retro-reflective and fluorescent material in three classes, set by the minimum visible area for the garment.',
    zone: 'body',
    hazard: 'lowVisibility',
    marks: ['hi-vis', 'high visibility', 'reflective', 'vest', 'class 2', 'class 3'],
  },
  {
    code: 'EN ISO 11612',
    body: 'ISO',
    title: 'Clothing — heat and flame',
    scope: 'Garments for work exposed to heat, with separate test codes for flame spread, contact, convective, radiant and molten metal splash.',
    zone: 'body',
    hazard: 'flame',
    marks: ['flame retardant', 'fire', 'heat', 'foundry', 'molten', 'welding'],
  },
  {
    code: 'EN 1149-5',
    body: 'EN',
    title: 'Clothing — electrostatic properties',
    scope: 'Dissipative protective clothing for use in explosive atmospheres, worn as part of a full earthed system.',
    zone: 'body',
    hazard: 'staticElectric',
    marks: ['antistatic', 'esd', 'static', 'atex', 'explosive atmosphere'],
  },
  {
    code: 'EN 343',
    body: 'EN',
    title: 'Clothing — rain',
    scope: 'Protection against rain, scored separately for water penetration and water-vapour resistance.',
    zone: 'body',
    hazard: 'rain',
    marks: ['rain', 'waterproof', 'wet weather', 'water penetration'],
  },
  {
    code: 'EN 13034',
    body: 'EN',
    title: 'Clothing — limited chemical splash (Type 6)',
    scope: 'Limited protective performance against liquid chemicals: light spray, splash and mist, not sustained contact.',
    zone: 'body',
    hazard: 'splash',
    marks: ['type 6', 'splash', 'chemical', 'coverall', 'limited'],
  },
  {
    code: 'EN ISO 13982-1',
    body: 'ISO',
    title: 'Clothing — airborne solid particles (Type 5)',
    scope: 'Protection of the whole body against airborne solid particulates such as asbestos and other hazardous dusts.',
    zone: 'body',
    hazard: 'dust',
    marks: ['type 5', 'dust', 'particle', 'asbestos', 'coverall'],
  },
  {
    code: 'EN 361',
    body: 'EN',
    title: 'Full body harnesses',
    scope: 'Fall-arrest harnesses: straps, buckles and attachment points, tested for static strength and dynamic performance.',
    zone: 'body',
    hazard: 'fallingObject',
    marks: ['harness', 'fall arrest', 'height', 'lanyard', 'working at height'],
  },

  // --- Feet ---------------------------------------------------------------
  {
    code: 'EN ISO 20345',
    body: 'ISO',
    title: 'Safety footwear',
    scope: 'Footwear with a 200 J toe cap. Base is SB; S1 adds antistatic, heel energy absorption and an oil-resistant outsole, S2 adds water penetration, S3 adds penetration resistance and a cleated outsole.',
    zone: 'feet',
    hazard: 'slip',
    marks: ['safety shoe', 's1p', 's2', 's3', 's4', 's5', '200 joule', 'toe cap', 'steel toe'],
  },
  {
    code: 'EN ISO 20347',
    body: 'ISO',
    title: 'Occupational footwear',
    scope: 'Footwear with no toe cap — slip resistance, antistatic and outsole performance for roles that do not need impact protection.',
    zone: 'feet',
    marks: ['occupational', 'no toe cap', 'ob', 'hospitality', 'slip'],
  },
  {
    code: 'IS 15298',
    body: 'IS',
    title: 'PPE footwear',
    scope: 'Indian Standard for personal protective equipment — footwear, covering safety and protective footwear with toe caps.',
    zone: 'feet',
    marks: ['footwear', 'safety shoe', 'indian standard', 'toe cap'],
  },

  // --- Cross-cutting (ANSI) ----------------------------------------------
  {
    code: 'ANSI/ISEA 105',
    body: 'ANSI',
    title: 'Hand protection',
    scope: 'US hand protection standard. Cut resistance is graded A1 through A9 by the load in grams needed to cut through the material.',
    zone: 'hand',
    hazard: 'cut',
    marks: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'cut level', 'grams'],
  },
  {
    code: 'ANSI Z87.1',
    body: 'ANSI',
    title: 'Eye and face protection',
    scope: 'US performance standard for eye and face protectors, marking impact-rated product with a plus symbol.',
    zone: 'head',
    hazard: 'impact',
    marks: ['z87', 'impact', 'spectacles', 'goggles', 'face shield'],
  },
  {
    code: 'ANSI Z89.1',
    body: 'ANSI',
    title: 'Industrial head protection',
    scope: 'US head protection standard. Type I protects the top of the head, Type II adds lateral impact; Classes G, E and C set electrical rating.',
    zone: 'head',
    hazard: 'fallingObject',
    marks: ['z89', 'helmet', 'hard hat', 'type 1', 'type 2', 'class e'],
  },
  {
    code: 'ANSI/ISEA 107',
    body: 'ANSI',
    title: 'High-visibility apparel',
    scope: 'US high-visibility standard. Types O, R and P set the work environment; Classes 1, 2 and 3 set the amount of visible material.',
    zone: 'body',
    hazard: 'lowVisibility',
    marks: ['hi-vis', 'reflective', 'vest', 'class 2', 'class 3', 'type r'],
  },
];

/** Strip everything that varies between how buyers and labels write a code. */
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const words = (s) => (s || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/** Words too generic to be evidence of intent on their own. */
const STOP = new Set(['the', 'and', 'for', 'with', 'standard', 'standards', 'safety', 'spec', 'level', 'class', 'type', 'ppe']);

const indexed = standards.map((s) => {
  const marks = s.marks || [];
  return {
    s,
    code: norm(s.code),
    /** Title + keywords, tokenised. Deliberately excludes the code so that "en"
     *  cannot match every EN-numbered entry just because the code starts "en". */
    marks: new Set([...words(s.title), ...marks.flatMap((m) => [...words(m), norm(m)])]),
    /** Wider haystack for a hit that is not a headline term. */
    all: new Set([...words(s.title), ...marks.flatMap((m) => [...words(m), norm(m)]), ...words(s.scope)]),
  };
});

const has = (set, token) => {
  if (set.has(token)) return true;
  // Partial typing: "glove" should still find "gloves", "helmet" -> "helmets".
  if (token.length < 4) return false;
  for (const w of set) if (w.startsWith(token)) return true;
  return false;
};

/**
 * Rank standards against a typed query.
 *
 * Two passes, never mixed: a query containing a digit is treated as a code
 * lookup (so "388" finds EN 388 and nothing else), otherwise it is a word
 * lookup over titles, scopes and grade vocabulary. Matching is on token
 * boundaries rather than raw substrings — substring matching is what made
 * "hi vis" return EN 388, via the "vis" inside "revision".
 */
export function searchStandards(query, limit = 6) {
  const raw = (query || '').trim();
  if (!raw) return [];
  const q = norm(raw);

  if (/\d/.test(raw)) {
    const hits = [];
    for (const { s, code } of indexed) {
      let score = 0;
      if (code === q) score = 100;
      else if (q.length >= 3 && code.startsWith(q)) score = 85;
      else if (q.length >= 3 && code.includes(q)) score = 70;
      else if (q.length >= 4 && q.includes(code)) score = 60;
      if (score) hits.push({ s, score });
    }
    if (hits.length) {
      return hits.sort((a, b) => b.score - a.score || a.s.code.localeCompare(b.s.code)).slice(0, limit).map((h) => h.s);
    }
    // "s3", "a4", "ffp2" and friends are grade marks, not codes — fall through.
  }

  const tokens = words(raw).filter((w) => w.length >= 3 && !STOP.has(w));
  const hits = [];
  for (const { s, marks, all } of indexed) {
    let score = 0;
    // A two-character mark such as "s3" or "a4" can only be trusted whole.
    if (q.length >= 2 && !STOP.has(q) && marks.has(q)) score += 25;
    for (const t of tokens) {
      if (has(marks, t)) score += 8;
      else if (has(all, t)) score += 4;
    }
    if (score) hits.push({ s, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.s.code.localeCompare(b.s.code)).slice(0, limit).map((h) => h.s);
}

/** Short, human label for a protection zone id. */
export const zoneLabels = { head: 'Head', hand: 'Hand', body: 'Body', feet: 'Feet' };

/** Below this many matching products, a hazard filter is not worth landing on. */
const THIN = 5;

/**
 * Catalogue link for a standard entry.
 *
 * Only one filter is ever emitted: ProductsPage resolves hazard before zone,
 * so passing both would silently drop the zone and light up the wrong filter
 * chip. The hazard filter is used only when it returns a useful number of
 * products, counted live off the catalogue so this cannot drift.
 */
export function standardHref(s) {
  if (s.hazard && byHazard(s.hazard).length >= THIN) return `/products?hazard=${s.hazard}`;
  return `/products?cat=${s.zone}`;
}

/** Codes shown as one-tap suggestions when the field is empty. */
const POPULAR = ['EN 388', 'EN ISO 20345', 'EN 166', 'EN 397', 'ANSI Z87.1', 'EN ISO 20471'];
export const popularStandards = standards.filter((s) => POPULAR.includes(s.code));
