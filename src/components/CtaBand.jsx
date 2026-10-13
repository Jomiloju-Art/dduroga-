import { Link } from 'react-router-dom';
import { brand } from '../data/brand.js';
import { IconPhone } from './Icons.jsx';

/**
 * Reusable conversion band placed above footers.
 *
 * The phone number is OFF by default; pass `showPhone` to show the number from
 * src/data/brand.js in the band.
 */
export default function CtaBand({
  title = 'Need a tailored safety solution?',
  text = 'Tell us your application and volumes, and our specialists will come back to you with certified options and pricing.',
  ctaLabel = 'Request a quote',
  ctaTo = '/contact',
  secondary,
  showPhone = false,
}) {
  const action = secondary ? (
    <Link to={secondary.to} className="cta-phone">{secondary.label}</Link>
  ) : showPhone ? (
    <a className="cta-phone" href={brand.phoneHref}>
      <IconPhone width="22" height="22" /> {brand.phone}
    </a>
  ) : null;

  return (
    <section className="section" aria-label="Contact call to action">
      <div className="container">
        <div className="cta">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
            <Link to={ctaTo} className="btn">{ctaLabel}</Link>
            {action}
          </div>
        </div>
      </div>
    </section>
  );
}
