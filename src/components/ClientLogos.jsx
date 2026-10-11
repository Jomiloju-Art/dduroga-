import { clients } from '../data/clients.js';

/**
 * "Trusted by" strip — an infinite logo marquee (ticker).
 *
 * The entries are client LOGOS, so a continuous ticker reads as motion and
 * proof. The earlier static wrapped row was a deliberate choice made when the
 * entries were company NAMES — a name you can only half-read is decoration, not
 * evidence. Logos don't have that problem: they stay recognisable in motion, so
 * this slides.
 *
 * How the loop works: the list is rendered TWICE inside one track. The track
 * slides by exactly one copy (-50% of its own width) and repeats, so the seam
 * never shows. The second copy is aria-hidden so assistive tech hears the
 * clients once, not twice. All motion is CSS (transform only, main-thread
 * friendly) and stops entirely under prefers-reduced-motion, where it falls
 * back to a centred static row.
 *
 * Renders nothing while `clients` is empty.
 */
export default function ClientLogos({
  title = 'From manufacturing plants to construction sites, these teams rely on us for compliant, consistently available PPE',
}) {
  if (!clients.length) return null;

  const copy = (isClone) => (
    <ul
      className="client-marquee__group"
      key={isClone ? 'clone' : 'main'}
      aria-hidden={isClone || undefined}
    >
      {clients.map((c) => (
        <li className="client-logo" key={c.name}>
          {c.logo
            ? <img src={c.logo} alt={c.name} loading="lazy" />
            : <span className="client-logo__name">{c.name}</span>}
          {c.sector && <span className="client-logo__sector">{c.sector}</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <section className="section section--soft client-strip" aria-labelledby="clients-heading">
      <div className="container">
        <h2 id="clients-heading" className="client-strip__heading">{title}</h2>

        <div className="client-marquee">
          <div className="client-marquee__track">
            {copy(false)}
            {copy(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
