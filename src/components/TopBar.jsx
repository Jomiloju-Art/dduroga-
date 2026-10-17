import { brand } from '../data/brand.js';
import { IconClock, IconMail, IconPhone, IconTruck } from './Icons.jsx';

/**
 * Slim contact strip above the header, as on most B2B supply sites: delivery
 * reach and opening hours on the left, phone, WhatsApp and email on the right.
 * Desktop only; phones already have the floating WhatsApp button and the quote
 * buttons in the hero and menu. It scrolls away with the page, so the sticky
 * header keeps its usual height once the visitor moves down.
 */
const whatsapp = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Hi ${brand.name}, I'd like to ask about your PPE range.`)}`;

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar__inner">
        <p className="topbar__item"><IconTruck width="15" height="15" /> Stocked in Lagos, delivered nationwide</p>
        <p className="topbar__item"><IconClock width="15" height="15" /> {brand.hours}</p>
        <nav className="topbar__links" aria-label="Contact">
          <a href={brand.phoneHref}><IconPhone width="14" height="14" /> {brand.phone}</a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.2L2 22l5-1.4A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4 14.9l-.3-.2-2.5.7.7-2.5-.2-.3A8 8 0 0 1 12 4zm-3 4c-.3 0-.6.1-.9.4-.3.3-.5.7-.5 1.1 0 1 .5 2.4 1.8 3.7 1.4 1.3 2.9 1.9 3.9 2 .4 0 .8-.1 1.1-.4.3-.3.4-.6.4-1 0-.3-.2-.5-.4-.7l-1-.5-.9.4a6.6 6.6 0 0 1-1.9-1.9l.4-.9-.5-1c-.2-.3-.4-.5-.7-.5H9z" /></svg>
            WhatsApp
          </a>
          <a href={brand.emailHref}><IconMail width="14" height="14" /> {brand.email}</a>
        </nav>
      </div>
    </div>
  );
}
