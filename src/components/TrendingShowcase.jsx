import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findProduct, zoneOf, rangeLabel } from '../data/products.js';
import { TRENDING } from '../data/trending.js';
import { useQuote } from '../quote/QuoteContext.jsx';
import { IconArrowRight } from './Icons.jsx';

/**
 * Homepage "Trending now", as stories (Instagram-style). The client liked the
 * earlier product stage but asked for something quicker to take in for people
 * who scroll fast (Oct 2026), so it is now one short card that plays itself:
 *
 *   top     one progress segment per product; the active one fills over
 *           DURATION, then the next product shows
 *   card    the product photo, its trending rank, type, name, one key rating
 *           and View product / Add to quote. Nothing else: the spec table, the
 *           big outline rank, the zone tabs and the thumbnail rail are gone.
 *
 * Tap the left or right third of the photo (or swipe) to go back or skip, as
 * in stories; arrows and the arrow keys do the same. Playback pauses while the
 * pointer is over the card or focus is inside it, while the section is off
 * screen, and never starts for people who ask for reduced motion.
 * Products and order come from trending.js.
 */

const DURATION = 3500; // ms per product
const typeOf = (p) => rangeLabel(p) || zoneOf(p)?.label || '';
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** The one rating a buyer scans for: "CE · EN 397" or "EN 388 4133X". */
function keyRating(p) {
  const s = (p.catalogueStandards || [])[0];
  const std = s ? [s.code, s.rating].filter(Boolean).join(' ') : '';
  return [p.ce && 'CE', std].filter(Boolean).join(' · ');
}

export default function TrendingShowcase() {
  const list = useMemo(() => TRENDING.map((s, i) => ({ p: findProduct(s), rank: i + 1 })).filter((x) => x.p), []);
  const n = list.length;
  const [at, setAt] = useState(0);
  const [hold, setHold] = useState(false); // hover or focus
  const [visible, setVisible] = useState(false);
  const [still] = useState(reduceMotion);
  const { add } = useQuote();

  const go = (i) => setAt(((i % n) + n) % n);
  const next = () => go(at + 1);
  const prev = () => go(at - 1);

  // Only play while the section is on screen.
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = visible && !hold && !still && n > 1;

  // Swipe (phones).
  const touch = useRef(null);
  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(t.clientY - s.y)) (dx < 0 ? next : prev)();
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };

  if (!n) return null;
  const { p, rank } = list[at];
  const rating = keyRating(p);

  return (
    <section className="tr" aria-labelledby="trending-heading" ref={ref}>
      <div className="tr__inner">
        <div className="tr__head">
          <div>
            <span className="tr__eyebrow">Trending now</span>
            <h2 id="trending-heading">What sites are ordering</h2>
          </div>
          <Link to="/products" className="tr__all">All products <IconArrowRight width="16" height="16" /></Link>
        </div>

        <div
          className="st"
          role="region"
          aria-roledescription="carousel"
          aria-label="Trending products"
          onKeyDown={onKeyDown}
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHold(false); }}
        >
          <div className="st__bars" aria-hidden="true">
            {list.map((x, i) => (
              <span key={x.p.slug} className={`st__bar${i < at ? ' is-done' : ''}`}>
                {i === at && (
                  <i
                    key={`${at}`}
                    style={{ animationDuration: `${DURATION}ms`, animationPlayState: playing ? 'running' : 'paused' }}
                    onAnimationEnd={next}
                  />
                )}
              </span>
            ))}
          </div>

          <div className="st__card" key={p.slug}>
            <div className="st__media" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <Link to={`/products/${p.slug}`} tabIndex={-1} aria-hidden="true">
                <img src={p.img} alt="" decoding="async" />
              </Link>
              <button type="button" className="st__tap st__tap--prev" onClick={prev} aria-label="Previous product" />
              <button type="button" className="st__tap st__tap--next" onClick={next} aria-label="Next product" />
            </div>

            <div className="st__info">
              <span className="st__badge">#{rank} trending</span>
              <span className="st__type">{typeOf(p)}</span>
              <h3 className="st__name"><Link to={`/products/${p.slug}`}>{p.title}</Link></h3>
              {rating && <span className="st__rating">{rating}</span>}
              <span className="st__cta">
                <Link to={`/products/${p.slug}`} className="tr-btn tr-btn--white">View <IconArrowRight width="16" height="16" /></Link>
                <button type="button" className="tr-btn tr-btn--orange" onClick={() => add(p)} aria-label={`Add ${p.title} to quote`}>Add to quote</button>
              </span>
              <span className="st__nav">
                <button type="button" className="st__arrow" onClick={prev} aria-label="Previous product">
                  <IconArrowRight width="18" height="18" style={{ transform: 'rotate(180deg)' }} />
                </button>
                <span className="st__count">{at + 1} / {n}</span>
                <button type="button" className="st__arrow" onClick={next} aria-label="Next product">
                  <IconArrowRight width="18" height="18" />
                </button>
              </span>
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live={playing ? 'off' : 'polite'}>{`${at + 1} of ${n}: ${p.title}, ${typeOf(p)}`}</p>
      </div>
    </section>
  );
}
