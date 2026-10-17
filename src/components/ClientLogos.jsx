import { Link } from 'react-router-dom';
import { clients } from '../data/clients.js';
import { IconArrowRight } from './Icons.jsx';
import Reveal from './Reveal.jsx';

/**
 * "Trusted by": a still logo wall (after Enorm's client section on Dribbble;
 * the client chose it in Oct 2026 over a honeycomb and orbit rings, and it
 * replaced a scrolling logo marquee). An orange block carries the heading,
 * then every client's logo sits in a grid with hairline dividers, and the
 * last cell asks for a quote. All 13 logos are visible at once, without
 * waiting for a ticker.
 *
 * Only what clients.js holds is shown: each client's own logo and name (the
 * name appears on hover). No quotes, figures or sectors, because none have
 * been supplied.
 *
 * The grid is sized for 13 logos: with the heading block and the quote cell
 * it fills whole rows at 6, 4 and 3 across. Another count leaves gaps in the
 * last row, which then needs the spans in .cs-wall adjusting.
 *
 * Phones get the scrolling logo row instead (the client asked for the
 * marquee back on mobile, without a play/pause button): the heading block,
 * then every logo on a tile in an endless loop, then the quote link. The list
 * is rendered twice in one track that slides by exactly one copy, so the seam
 * never shows; the second copy is hidden from screen readers. Touching or
 * hovering the row pauses it, and under reduced motion it stands still as a
 * wrapped grid. Only one of the two layouts is ever displayed.
 *
 * Renders nothing while `clients` is empty.
 */

/* Optical sizing: every mark gets roughly the same area, not the same height,
   so wide wordmarks (NIPCO, Mantrac) don't dominate square badges (BUA, 7UP). */
const heightFor = (c) => (c.w && c.h ? Math.min(46, 46 * (c.w / c.h) ** -0.3) : 36);

function Mark({ c, label }) {
  return c.logo
    ? <img src={c.logo} alt={label ? c.name : ''} title={c.name} loading="lazy" decoding="async" style={{ '--lh': `${heightFor(c).toFixed(1)}%` }} />
    : <strong className="cs-wall__text">{c.name}</strong>;
}

export default function ClientLogos({
  eyebrow = 'Trusted by',
  title = 'Trusted on sites across Nigeria',
  lead = 'From manufacturing plants to construction sites, these teams rely on us for compliant, consistently available PPE.',
}) {
  if (!clients.length) return null;
  return (
    <section className="cs cs-wall" aria-labelledby="clients-heading">
      <div className="zb__inner">
        <Reveal as="ul" className="cs-wall__grid reveal-stagger">
          <li className="cs-wall__intro">
            <span className="cs-wall__eyebrow">{eyebrow}</span>
            <h2 id="clients-heading">{title}</h2>
            <p>{lead}</p>
          </li>
          {clients.map((c) => (
            <li className="cs-wall__cell" key={c.name}>
              <Mark c={c} label />
              <span className="cs-wall__name" aria-hidden="true">{c.name}</span>
            </li>
          ))}
          <li className="cs-wall__cell cs-wall__cell--cta">
            <Link to="/contact">
              <span>Supplying your site next?</span>
              <strong>Request a quote <IconArrowRight width="15" height="15" /></strong>
            </Link>
          </li>
        </Reveal>

        {/* Phones: heading, endless logo row, quote link. */}
        <div className="cs-mob">
          <div className="cs-wall__intro">
            <span className="cs-wall__eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{lead}</p>
          </div>
          <div className="cs-marquee">
            <div className="cs-marquee__track">
              {[false, true].map((clone) => (
                <ul className="cs-marquee__group" key={clone ? 'clone' : 'main'} aria-hidden={clone || undefined}>
                  {clients.map((c) => <li className="cs-marquee__tile" key={c.name}><Mark c={c} label={!clone} /></li>)}
                </ul>
              ))}
            </div>
          </div>
          <Link to="/contact" className="cs-mob__cta">
            <span>Supplying your site next?</span>
            <strong>Request a quote <IconArrowRight width="15" height="15" /></strong>
          </Link>
        </div>
      </div>
    </section>
  );
}
