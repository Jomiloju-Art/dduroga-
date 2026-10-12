import { useState } from 'react';
import { glossaryIcon } from '../data/glossaryIcons.js';

/**
 * Performance ratings, laid out like the product row in Mallcom's 2025
 * catalogue: the row's symbols (named as in the catalogue's page-142 "Glossary
 * of icons"), then the CE mark over the standards and performance codes
 * ("EN 388 - 3243X").
 *
 * Every value comes from the catalogue row for this product. A product the
 * catalogue does not cover renders nothing; the page falls back to its tiles.
 *
 * Codes with a defined digit layout (EN 388, EN 407, EN 511) get an "i" button
 * that breaks the code down position by position.
 */

const TITLES = {
  'EN 388': 'Mechanical risks (gloves)',
  'EN 407': 'Thermal risks (gloves)',
  'EN 511': 'Cold (gloves)',
  'EN 12477': 'Welders’ gloves',
  'EN 374': 'Chemicals & micro-organisms',
  'EN 374-1': 'Chemicals (gloves)',
  'EN 374-2': 'Micro-organisms (gloves)',
  'EN 374-4': 'Chemical degradation (gloves)',
  'EN 397': 'Industrial safety helmets',
  'EN 812': 'Industrial bump caps',
  'EN 166': 'Eye protection',
  'EN 169': 'Welding filters',
  'EN 149': 'Particle-filtering half masks',
  'EN 14683': 'Medical face masks',
  'EN 352-1': 'Hearing protectors: earmuffs',
  'EN 352-2': 'Hearing protectors: earplugs',
  'EN 20345': 'Safety footwear',
  'EN 20347': 'Occupational footwear',
  'EN 13688': 'Protective clothing: general',
  'EN 20471': 'High-visibility clothing',
  'EN 343': 'Protection against rain',
  'EN 11611': 'Welding & allied processes',
  'EN 11612': 'Heat & flame',
  'EN 61482': 'Electric arc',
  'EN 14605': 'Liquid chemicals (type 3/4)',
  'EN 13982-1': 'Solid particulates (type 5)',
  'IS 2925': 'Industrial safety helmets (India)',
  'IS 9473': 'Respiratory protective devices (India)',
  'IS 15298': 'Safety footwear (India)',
  'IS 16289': 'Medical textiles: masks (India)',
  'AS/NZS 1801': 'Occupational helmets (AU/NZ)',
};

/** Position labels for codes with a fixed layout. */
const LAYOUTS = {
  'EN 388': {
    labels: ['Abrasion', 'Blade cut', 'Tear', 'Puncture', 'ISO cut', 'Impact'],
    explain: 'Abrasion 0–4, blade (coupe) cut 0–5, tear 0–4, puncture 0–4, ISO 13997 cut A–F, and P where impact protection is tested. X means not tested or not applicable.',
  },
  'EN 407': {
    labels: ['Burning', 'Contact heat', 'Convective', 'Radiant', 'Small splash', 'Large splash'],
    explain: 'Burning behaviour, contact heat, convective heat, radiant heat, small splashes and large splashes of molten metal, each 0–4. X means not tested.',
  },
  'EN 511': {
    labels: ['Convective cold', 'Contact cold', 'Water'],
    explain: 'Convective cold 0–4, contact cold 0–4, water penetration 0 or 1. X means not tested.',
  },
};

/** "3542DP" -> ['3','5','4','2','D','P']; trailing ISO letter and P are optional. */
const splitCode = (rating) => rating.match(/[0-9X]|[A-F](?=P?$)|P$/g) || [];

function Standard({ code, rating }) {
  const [open, setOpen] = useState(false);
  const base = code.replace(/^EN ISO /, 'EN ');
  const layout = LAYOUTS[base] && rating ? LAYOUTS[base] : null;
  const id = `std-${code.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <li className="pr-std">
      <span className="pr-std__code" title={TITLES[base] || ''}>
        {code}{rating ? ` - ${rating}` : ''}
      </span>
      {layout && (
        <button
          type="button"
          className="pr-std__info"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`What ${code} ${rating} means`}
          onClick={() => setOpen((o) => !o)}
        >
          i
        </button>
      )}
      {layout && (
        <div className="pr-std__explain" id={id} hidden={!open}>
          <div className="pr-levels">
            {splitCode(rating).map((v, i) => (
              <span className="pr-level" key={i}>{v}<small>{layout.labels[i] || ''}</small></span>
            ))}
          </div>
          <p>{layout.explain}</p>
        </div>
      )}
    </li>
  );
}

export default function CertifiedTo({ symbols = [], standards = [], ce = false }) {
  const shown = symbols.filter((s) => glossaryIcon(s));
  if (!shown.length && !standards.length) return null;
  return (
    <div className="detail-taggroup pr">
      <h2>Performance ratings</h2>
      {shown.length > 0 && (
        <ul className="pr-symbols">
          {shown.map((s) => (
            <li key={s} className="pr-symbol">
              <img src={glossaryIcon(s)} alt="" loading="lazy" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
      {standards.length > 0 && (
        <div className="pr-certs">
          {ce && <img className="pr-ce" src="/accreditations/ce.png" alt="CE marked" />}
          <ul className="pr-stds">
            {standards.map((s) => <Standard key={s.code} {...s} />)}
          </ul>
        </div>
      )}
      <p className="pr-source">As printed in the Mallcom 2025 catalogue. Test certificates and declarations of conformity on request.</p>
    </div>
  );
}

/** "EN 388 3132X" style strings, for the datasheet and the standards chips. */
export const standardStrings = (standards = []) => standards.map((s) => (s.rating ? `${s.code} ${s.rating}` : s.code));
