/**
 * RecommendRow - the Gymshark "We Recommend" carousel.
 *
 * Measured off their PDP, everything read from computed styles:
 *
 *   section        flex, justify space-between, full content width
 *   cards          369 x 461 (ratio 0.80), 10 in the strip, 4 visible
 *   card gap       4px
 *   card frame     NONE - transparent, no border, no radius, no shadow
 *   image          fills the card
 *   type           ONE size, ONE weight for the whole card:
 *                    title   14px / 19.6px  weight 400  rgb(13,16,18)
 *                    meta    14px / 19.6px  weight 400  rgb(118,122,127)
 *   badge          12px / 400, on the image, bottom-left, 16px inset
 *   arrows         44x44, no border, no radius, top-right of the heading row
 *   heading        20px / 18.8px  weight 500
 *
 * The calm comes from having no hierarchy at all inside the card: same size,
 * same weight, and colour is the only signal. No chip, no button, no frame.
 *
 * Two deliberate departures, because our material differs from theirs:
 *   1. Square tiles with `contain`, not their 4:5 with `cover`. Our catalogue is
 *      700x700 cut-outs on white; a 4:5 cover crop amputates them.
 *   2. Prices are not shown. Our catalogue is quote-only - there are no prices to
 *      print, and a fabricated one would be worse than none.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { zoneOf } from '../data/products.js';
import { displayType } from '../lib/display.js';

export default function RecommendRow({ products = [], title = 'We recommend' }) {
  const railRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const items = useMemo(() => products.filter((p) => p && p.slug).slice(0, 10), [products]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => {
      setAtStart(rail.scrollLeft <= 2);
      setAtEnd(rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2);
    };
    onScroll();
    rail.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      rail.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items.length]);

  /** Step by one card + gap, so a click lands cleanly on a card edge. */
  const step = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector('[data-card]');
    const w = card ? card.getBoundingClientRect().width + 4 : rail.clientWidth / 4;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (items.length < 2) return null;

  return (
    <section className="rec-section" aria-labelledby="rec-heading">
      <div className="rec-head">
        <h2 className="rec-heading" id="rec-heading">{title}</h2>
        <div className="rec-arrows">
          <button
            type="button"
            className="rec-arrow"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Show previous products"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="rec-arrow"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Show next products"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="rec-rail" ref={railRef}>
        {items.map((p) => {
          /* The subtitle uses the site's existing displayType(), the same helper
             the product cards use. It returns '' when the raw type merely
             restates the zone - agena and amber are both typed "Head" inside the
             Head Protection zone, so they would otherwise print "Head" directly
             under the card's own zone. Nothing new is written here; this is the
             shared rule, so the row and the cards cannot drift apart. */
          const zoneLabel = zoneOf(p)?.label || '';
          const type = displayType(p, zoneLabel);
          return (
            <Link className="rec-card" to={`/products/${p.slug}`} key={p.slug} data-card>
              <span className="rec-card__media">
                <img src={p.img} alt={p.title} loading="lazy" decoding="async" />
              </span>
              <span className="rec-card__text">
                <span className="rec-card__title">{p.title}</span>
                {type && <span className="rec-card__meta">{type}</span>}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
