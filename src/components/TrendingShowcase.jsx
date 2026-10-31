import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findProduct, zoneOf, rangeLabel } from '../data/products.js';
import { TRENDING } from '../data/trending.js';
import { useQuote } from '../quote/QuoteContext.jsx';
import { IconArrowRight } from './Icons.jsx';
import { firstStandard } from '../lib/productSpecs.js';

/**
 * Homepage "Trending now", as a card slider (clients' request, Oct 2026): the
 * current product in the middle at full size, the previous and next ones
 * smaller and dimmed on either side, so three can be seen at once. It replaced
 * the stories card, which showed one product at a time.
 *
 *   middle  photo, trending rank, type, name, one key rating, View / Add to
 *           quote
 *   sides   photo and name; tap one (or swipe, or use the arrows or arrow
 *           keys) to slide it to the middle
 *
 * Every card sits in the same grid cell and is moved by its offset from the
 * current one, so a change slides all of them at once. Cards two or more
 * away wait just outside, invisible, so the next one slides in rather than
 * appearing. The list loops.
 *
 * It moves on by itself every DURATION (the active dot fills meanwhile), and
 * pauses while the pointer is over it or focus is inside it, while it is off
 * screen, and for people who ask for reduced motion.
 * Products and order come from trending.js.
 */

const DURATION = 4000; // ms per product
const typeOf = (p) => rangeLabel(p) || zoneOf(p)?.label || '';
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** The one rating a buyer scans for: "CE · EN 397" or "EN 388 4133X". Never "CE" before an Indian (IS) standard. */
function keyRating(p) {
  const std = firstStandard(p);
  return [p.ce && std && !/^IS\s/.test(std) && 'CE', std].filter(Boolean).join(' · ');
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
  /** A card's place relative to the current one, the short way round: -1 previous, 0 current, 1 next. */
  const offsetOf = (i) => {
    let d = (((i - at) % n) + n) % n;
    if (d > n / 2) d -= n;
    return d;
  };

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
  const current = list[at].p;

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
          className="tc"
          role="region"
          aria-roledescription="carousel"
          aria-label="Trending products"
          onKeyDown={onKeyDown}
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHold(false); }}
        >
          <div className="tc__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {list.map(({ p, rank }, i) => {
              const o = offsetOf(i);
              const place = o === 0 ? 'is-current' : Math.abs(o) === 1 ? 'is-side' : 'is-away';
              const rating = keyRating(p);
              return (
                <article
                  key={p.slug}
                  className={`tc__card ${place}`}
                  style={{ '--o': Math.max(-2, Math.min(2, o)) }}
                  aria-roledescription="slide"
                  aria-label={`${rank} of ${n}`}
                >
                  {/* Content of the cards that are not current is inert, so
                      their links and buttons cannot be tabbed to; the side
                      cards get one button of their own to bring them in. */}
                  <div className="tc__body" {...(o !== 0 ? { inert: '' } : {})}>
                    <Link to={`/products/${p.slug}`} className="tc__media" tabIndex={-1} aria-hidden="true">
                      <img src={p.img} alt="" decoding="async" loading={Math.abs(o) > 2 ? 'lazy' : undefined} />
                    </Link>
                    <div className="tc__info">
                      <span className="tc__badge">#{rank} trending</span>
                      <span className="tc__type">{typeOf(p)}</span>
                      <h3 className="tc__name"><Link to={`/products/${p.slug}`}>{p.title}</Link></h3>
                      <span className="tc__more">
                        {rating && <span className="tc__rating">{rating}</span>}
                        <span className="tc__cta">
                          <Link to={`/products/${p.slug}`} className="tr-btn tr-btn--white">View <IconArrowRight width="16" height="16" /></Link>
                          <button type="button" className="tr-btn tr-btn--orange" onClick={() => add(p)} aria-label={`Add ${p.title} to quote`}>Add to quote</button>
                        </span>
                      </span>
                    </div>
                  </div>
                  {Math.abs(o) === 1 && (
                    <button
                      type="button"
                      className="tc__pick"
                      onClick={() => go(i)}
                      aria-label={`${o < 0 ? 'Previous' : 'Next'} product: ${p.title}`}
                    />
                  )}
                </article>
              );
            })}
          </div>

          <div className="tc__nav">
            <button type="button" className="st__arrow" onClick={prev} aria-label="Previous product">
              <IconArrowRight width="18" height="18" style={{ transform: 'rotate(180deg)' }} />
            </button>
            <div className="tc__dots" aria-hidden="true">
              {list.map(({ p }, i) => (
                <button key={p.slug} type="button" tabIndex={-1} className={`tc__dot${i === at ? ' is-on' : ''}`} onClick={() => go(i)}>
                  {i === at && (
                    <i
                      key={`${at}`}
                      style={{ animationDuration: `${DURATION}ms`, animationPlayState: playing ? 'running' : 'paused' }}
                      onAnimationEnd={next}
                    />
                  )}
                </button>
              ))}
            </div>
            <button type="button" className="st__arrow" onClick={next} aria-label="Next product">
              <IconArrowRight width="18" height="18" />
            </button>
          </div>
        </div>

        <p className="sr-only" aria-live={playing ? 'off' : 'polite'}>{`${at + 1} of ${n}: ${current.title}, ${typeOf(current)}`}</p>
      </div>
    </section>
  );
}
