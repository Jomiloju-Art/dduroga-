import { Link } from 'react-router-dom';
import { brand } from '../data/brand.js';
import { IconArrowRight, IconPhone } from './Icons.jsx';
import NigeriaMap from './NigeriaMap.jsx';

/**
 * The homepage close: how ordering works, then the three ways to start.
 *
 * The site has no checkout, which first-time visitors do not expect from an
 * "Add to quote" button, so the steps say what happens instead. Each step
 * describes only what the site already does (the quote list, the quote and
 * contact forms, WhatsApp) and what the site already claims (stocked in Lagos,
 * delivered nationwide). No lead times or minimum orders until the client
 * confirms them.
 */
const steps = [
  {
    title: 'Build your list',
    text: 'Tap “Add to quote” on any product, with the size and quantity you need. Your list stays saved on this device.',
  },
  {
    title: 'Send it to us',
    text: 'Send the whole list in one go from your quote page, or WhatsApp it to our team.',
  },
  {
    title: 'Get pricing, then delivery',
    text: 'We reply with pricing and availability. Confirm the order and we deliver from Lagos to sites across Nigeria.',
  },
];

const whatsapp = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Hi ${brand.name}, I'd like a quote for PPE.`)}`;

export default function OrderSteps() {
  return (
    <section className="os" aria-labelledby="os-title">
      {/* Grid areas: heading, steps and actions on the left with the map
          beside them on desktop; on phones the map sits under the heading. */}
      <div className="zb__inner os__grid">
        <div className="zb__head os__head">
          <div>
            <span className="zb__eyebrow">How ordering works</span>
            <h2 className="zb__title" id="os-title">From shortlist to site</h2>
            <p className="sg__sub">No checkout and no payment online: send us your list and we come back with a quote.</p>
          </div>
        </div>

        <ol className="os__steps">
          {steps.map((s, i) => (
            <li className="os__step" key={s.title}>
              <span className="os__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="os__title">{s.title}</h3>
              <p className="os__text">{s.text}</p>
            </li>
          ))}
        </ol>

        <NigeriaMap className="os__map" />

        <div className="os__cta">
          <div className="os__actions">
            <Link to="/contact" className="btn hx-btn">
              Request a quote <IconArrowRight width="16" height="16" />
            </Link>
            <a className="os__wa" href={whatsapp} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.04c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.41 9.41 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.32 11.32 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2.01.52 3.97 1.52 5.7L.55 23.63l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.33-8.05z" />
              </svg>
              WhatsApp us
            </a>
            <a className="os__call" href={brand.phoneHref}>
              <IconPhone width="18" height="18" /> {brand.phone}
            </a>
          </div>
          <p className="os__hours">{brand.hours}</p>
        </div>
      </div>
    </section>
  );
}
