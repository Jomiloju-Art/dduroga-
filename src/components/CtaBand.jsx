import { Link } from 'react-router-dom';
import { brand } from '../data/brand.js';
import { IconPhone } from './Icons.jsx';

/**
 * Reusable conversion band placed above footers.
 *
 * The phone number is OFF by default. The number on file is still a placeholder
 * (`+91 00000 00000` on a Lagos address), and this band renders it large and
 * white in the most prominent CTA on the products page. Pass `showPhone` once a
 * real number is configured in `src/data/brand.js`.
 */
export default function CtaBand({
  title = 'Need a tailored safety solution?',
  text = 'Tell us your application and volumes, and our specialists will respond within one business day with certified options and pricing.',
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
