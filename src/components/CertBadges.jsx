import { complianceMarks } from '../data/brand.js';
import { IconShieldCheck } from './Icons.jsx';

/**
 * What each mark actually denotes. Kept to the plain meaning of the marking
 * itself — these describe the credential, they do not add new claims about it.
 */
const MEANING = {
  'ISO 9001': 'Quality management',
  'CE Certified': 'European conformity',
  'EN / IS standards': 'Product test standards',
};

/**
 * Certification badges for the trust bar.
 *
 * These are deliberately DDUROGA's own badge artwork, not reproductions of the
 * official marks. The CE mark in particular has legally defined proportions and
 * rules governing who may apply it and to what, so a lookalike drawn here would
 * be a counterfeit conformity mark on a commercial site. The ISO marks are
 * likewise protected and are issued with artwork by the certifying body.
 *
 * An 'ISI Marked' badge sat in this row and was removed: BIS/ISI is an Indian
 * domestic market certification and does not apply to a Nigerian supplier.
 *
 * When the real certificate artwork is on hand, replace the glyph span below
 * with the supplied image per each scheme's usage rules — the layout already
 * reserves a square slot for it.
 */
export default function CertBadges({ tone = 'light', marks = complianceMarks }) {
  return (
    <ul className={`cert-badges cert-badges--${tone}`}>
      {marks.map((m) => (
        <li className="cert-badge" key={m}>
          <span className="cert-badge__glyph" aria-hidden="true">
            <IconShieldCheck width="22" height="22" />
          </span>
          <span className="cert-badge__text">
            <strong>{m}</strong>
            {MEANING[m] && <span>{MEANING[m]}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
