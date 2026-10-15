import { useEffect, useRef, useState } from 'react';
import { clients } from '../data/clients.js';

/**
 * "Trusted by" strip — an infinite logo marquee (ticker).
 *
 * How the loop works: the list is rendered TWICE inside one track. The track
 * slides by exactly one copy (-50% of its own width) and repeats, so the seam
 * never shows. The second copy is aria-hidden so assistive tech hears the
 * clients once, not twice. Motion is CSS transform only.
 *
 * Logo wall practice applied here:
 *   - Optical sizing. Every mark gets roughly the same AREA, not the same
 *     height: height = BASE x ratio^-0.3. Same-height sizing made the wide
 *     wordmarks (NIPCO, Mantrac) dominate and the square badges (BUA, Tower
 *     Alloys, 7UP) look like specks.
 *   - One treatment. Every mark sits in its own colour on an identical white
 *     tile. Greyscale at rest (the earlier treatment) turned the solid-ground
 *     lockups (Colgate, Mantrac, BUA) into grey blocks and washed the light
 *     marks (Tower Alloys) out almost to nothing; the tile gives every logo,
 *     whatever its published style, the same frame. The marks themselves are
 *     the clients' own files, never redrawn.
 *   - A pause control (WCAG 2.2.2: anything that moves for over five seconds
 *     needs one). Hover and keyboard focus also pause it, and it stops while
 *     scrolled out of view. Under prefers-reduced-motion it never moves and
 *     falls back to a centred, wrapped, static row.
 *
 * Renders nothing while `clients` is empty.
 */
const BASE = 50;
const heightFor = (c) => (c.w && c.h ? Math.round(Math.min(BASE, BASE * (c.w / c.h) ** -0.3)) : 40);

export default function ClientLogos({
  eyebrow = 'Trusted by',
  title = 'Trusted on sites across Nigeria',
  lead = 'From manufacturing plants to construction sites, these teams rely on us for compliant, consistently available PPE.',
}) {
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const ref = useRef(null);

  // No point animating what nobody can see.
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
            ? (
              <img
                src={c.logo}
                alt={isClone ? '' : c.name}
                width={c.w ? Math.round((c.w / c.h) * heightFor(c)) : undefined}
                height={heightFor(c)}
                style={{ '--logo-h': heightFor(c) }}
                loading="lazy"
                decoding="async"
              />
            )
            : <span className="client-logo__name">{c.name}</span>}
          {c.sector && <span className="client-logo__sector">{c.sector}</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <section className="client-strip" aria-labelledby="clients-heading" ref={ref}>
      <div className="zb__inner">
        <div className="zb__head">
          <div>
            <span className="zb__eyebrow">{eyebrow}</span>
            <h2 id="clients-heading" className="zb__title">{title}</h2>
            <p className="sg__sub">{lead}</p>
          </div>
        </div>

        <div className={`client-marquee${paused || !onScreen ? ' is-paused' : ''}`}>
          <div className="client-marquee__track">
            {copy(false)}
            {copy(true)}
          </div>
        </div>

        <button
          type="button"
          className="client-marquee__toggle"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? (
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" /></svg>
          )}
          {paused ? 'Play' : 'Pause'}
          <span className="sr-only"> client logos</span>
        </button>
      </div>
    </section>
  );
}
