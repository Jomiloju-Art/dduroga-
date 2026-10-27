import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { facilityAccreditations, productAccreditations } from '../data/accreditations.js';
import { brandPartners } from '../data/brand.js';
import AccreditationDrawer from './AccreditationDrawer.jsx';

/**
 * Certification strip sitting directly under the hero.
 *
 * One slim strip of every mark (facility then product), as in the approved
 * homepage concept (Oct 2026). Each logo opens a drawer with what the mark means and
 * the certificate details. It replaced three generic shield badges
 * ("ISO 9001 · CE Certified · EN / IS standards") at the client's request to
 * show the marks as they appear in the catalogue.
 *
 * The brand line beside the heading names Mallcom (distributed) and Bragoxd
 * (DDUROGA's own) from brandPartners in brand.js; it replaced the earlier
 * "Made by Mallcom", then "Exclusive distributor in Nigeria for".
 *
 * There are deliberately no order counts or "X clients served" numbers — we do
 * not hold those, and inventing them on the page whose whole job is credibility
 * would be self-defeating.
 */
/**
 * `variant="hero"` sits the band inside the homepage hero, frosted over the
 * bottom of the photo on desktop (brands along the hero's foot, as on
 * equipment-supplier sites); on phones it stays a plain white band.
 */
export default function TrustBand({ variant }) {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);
  const marks = [...facilityAccreditations, ...productAccreditations];

  return (
    <section className={`hp-marks${variant === 'hero' ? ' hp-marks--hero' : ''}`} aria-labelledby="trust-heading">
      <div className="hp-marks__inner">
        <div className="hp-marks__row">
          <h2 className="hp-marks__label" id="trust-heading">Certified &amp; accredited</h2>
          {/* One slim row, as in the approved homepage concept: greyscale at
              rest, full colour on hover. Each mark still opens its drawer. */}
          <ul className="hp-marks__logos">
            {marks.map((a) => (
              <li key={a.id}>
                <button type="button" className="hp-mark" onClick={() => setActive(a)} aria-label={`${a.name}: view certificate details`} title={a.short}>
                  <img src={a.logo} alt="" loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
          </ul>
          <Link to="/certifications" className="hp-marks__all">All certifications <span aria-hidden="true">→</span></Link>
        </div>
        {/* Mallcom (distributed) and Bragoxd (DDUROGA's own). Deliberately small
            and muted: DDUROGA is the umbrella brand and this line must not
            compete with it. */}
        <p className="brand-line hp-marks__brands">
          <span className="brand-line__logos">
            {brandPartners.map((b) => (
              <span key={b.name} className="brand-line__item">
                {b.mark ? (
                  <>
                    <img className="brand-line__mark" src={b.logo} alt="" width="185" height="212" loading="lazy" decoding="async" />
                    <span className="brand-line__word">{b.name}</span>
                  </>
                ) : <img className="brand-line__logo" src={b.logo} alt={b.name} loading="lazy" decoding="async" />}
                <span className="brand-line__role">({b.role})</span>
              </span>
            ))}
          </span>
        </p>
      </div>
      <AccreditationDrawer item={active} onClose={close} />
    </section>
  );
}
