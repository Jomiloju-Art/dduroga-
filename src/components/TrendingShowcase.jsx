import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findProduct, zoneOf, rangeLabel, zones } from '../data/products.js';
import { TRENDING } from '../data/trending.js';
import { glossaryIcon } from '../data/glossaryIcons.js';
import { useQuote } from '../quote/QuoteContext.jsx';
import { IconArrowRight } from './Icons.jsx';
import { productSpecs } from '../lib/productSpecs.js';

/**
 * Homepage "Trending now": a dark product stage, after the spotlit product
 * showcases on Dribbble (Oct 2026 review; it replaced a spotlight card and a
 * two-row card grid).
 *
 *   left    the product's trending rank as a large outline number, its type,
 *           name, protection symbols and key specs, View product / Add to quote
 *   centre  the product on a lit disc, with the previous and next products
 *           dimmed either side and viewfinder corners around the stage
 *   right   position meter (01 / 11) and arrows
 *   below   every trending product as a thumbnail, to jump straight to one
 *
 * Product photos are on white, so they are blended (multiply) into the lit
 * disc: the white disappears and the product reads as standing in the light.
 * Products and order come from trending.js; every detail comes from the
 * product's Mallcom 2025 catalogue row. Arrow keys and swipes move through
 * the products, and the change is announced to screen readers.
 */

const pad = (n) => String(n).padStart(2, '0');
const typeOf = (p) => rangeLabel(p) || zoneOf(p)?.label || '';
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function QuickAdd({ product, className, children }) {
  const { add } = useQuote();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(product); }}
      aria-label={`Add ${product.title} to quote`}
    >
      {children}
    </button>
  );
}

/** Key specs as label / value rows (lib/productSpecs.js). */
function Specs({ product, max }) {
  const rows = productSpecs(product, max);
  if (!rows.length) return null;
  return (
    <span className="tr-specs ts__specs">
      {rows.map((r) => (
        <span className="tr-spec" key={r.label}>
          <span className="tr-spec__k">{r.label}</span>
          <span className="tr-spec__v">
            {r.label === 'CE' && <img src="/accreditations/ce.png" alt="" loading="lazy" />}
            {r.value}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function TrendingShowcase() {
  const all = useMemo(() => TRENDING.map((s, i) => ({ p: findProduct(s), rank: i + 1 })).filter((x) => x.p), []);
  const [zone, setZone] = useState('');
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const list = zone ? all.filter((x) => zoneOf(x.p)?.id === zone) : all;
  const n = list.length;
  const at = Math.min(index, Math.max(0, n - 1));
  const cur = list[at];

  const go = (to, d) => {
    if (n < 2) return;
    const i = ((to % n) + n) % n;
    setDir(d ?? (i > at ? 1 : -1));
    setIndex(i);
  };
  const next = () => go(at + 1, 1);
  const prev = () => go(at - 1, -1);

  // Keep the active thumbnail in view without scrolling the page itself.
  const thumbsRef = useRef(null);
  useEffect(() => {
    const rail = thumbsRef.current;
    const el = rail?.children[at];
    if (!rail || !el) return;
    const left = el.offsetLeft;
    const right = left + el.offsetWidth;
    const behavior = reduceMotion() ? 'auto' : 'smooth';
    if (left < rail.scrollLeft) rail.scrollTo({ left: left - 8, behavior });
    else if (right > rail.scrollLeft + rail.clientWidth) rail.scrollTo({ left: right - rail.clientWidth + 8, behavior });
  }, [at, zone]);

  // Swipe on the stage (phones).
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

  const tabs = [{ id: '', label: 'All' }, ...zones.map((z) => ({ id: z.id, label: z.id.charAt(0).toUpperCase() + z.id.slice(1) }))]
    .map((t) => ({ ...t, count: t.id ? all.filter((x) => zoneOf(x.p)?.id === t.id).length : all.length }))
    .filter((t) => t.count > 0);

  if (!cur) return null;
  const p = cur.p;
  const before = n > 1 ? list[(at - 1 + n) % n] : null;
  const after = n > 2 ? list[(at + 1) % n] : null;
  const symbols = (p.catalogueSymbols || []).filter(glossaryIcon).slice(0, 3);

  return (
    <section className="tr" aria-labelledby="trending-heading">
      <div className="tr__inner">
        <div className="tr__head">
          <div>
            <span className="tr__eyebrow">Trending now</span>
            <h2 id="trending-heading">What sites are ordering</h2>
          </div>
          <div className="tr__tools">
            <div className="tr-tabs" role="tablist" aria-label="Filter trending products by zone">
              {tabs.map((t) => (
                <button
                  key={t.id || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={zone === t.id}
                  className="tr-tab"
                  onClick={() => { setZone(t.id); setIndex(0); setDir(1); }}
                >
                  {t.label}<span>{t.count}</span>
                </button>
              ))}
            </div>
            <Link to="/products" className="tr__all">All products <IconArrowRight width="16" height="16" /></Link>
          </div>
        </div>

        <div
          className="ts"
          role="region"
          aria-roledescription="carousel"
          aria-label="Trending products"
          onKeyDown={onKeyDown}
        >
          {/* Keyed by product so the text replays its entrance on change. */}
          <div className="ts__info" key={`i-${zone}-${p.slug}`} data-dir={dir}>
            <span className="ts__rank" aria-hidden="true">{pad(cur.rank)}</span>
            <span className="ts__badge">#{cur.rank} trending</span>
            <span className="tr-type">{typeOf(p)}</span>
            <h3 className="ts__name"><Link to={`/products/${p.slug}`}>{p.title}</Link></h3>
            {symbols.length > 0 && (
              <span className="tr-symbols ts__symbols">
                {symbols.map((s) => (
                  <span key={s} className="tr-symbol"><img src={glossaryIcon(s)} alt="" loading="lazy" />{s}</span>
                ))}
              </span>
            )}
            <Specs product={p} max={4} />
            <span className="ts__cta">
              <Link to={`/products/${p.slug}`} className="tr-btn tr-btn--white">View product <IconArrowRight width="16" height="16" /></Link>
              <QuickAdd product={p} className="tr-btn tr-btn--orange">Add to quote</QuickAdd>
            </span>
          </div>

          <div className="ts__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <span className="ts__frame" aria-hidden="true"><i /><i /><i /><i /></span>
            {before && (
              <button type="button" className="ts__ghost ts__ghost--prev" onClick={prev} aria-label={`Previous: ${before.p.title}`}>
                <img src={before.p.img} alt="" loading="lazy" decoding="async" />
              </button>
            )}
            {after && (
              <button type="button" className="ts__ghost ts__ghost--next" onClick={next} aria-label={`Next: ${after.p.title}`}>
                <img src={after.p.img} alt="" loading="lazy" decoding="async" />
              </button>
            )}
            <Link to={`/products/${p.slug}`} className="ts__spot" key={`s-${zone}-${p.slug}`} data-dir={dir} tabIndex={-1} aria-hidden="true">
              <img src={p.img} alt="" loading="lazy" decoding="async" />
            </Link>
          </div>

          <div className="ts__meter">
            <span className="ts__count"><b>{pad(at + 1)}</b><span>/ {pad(n)}</span></span>
            <span className="ts__bar" aria-hidden="true"><i style={{ '--p': n ? (at + 1) / n : 1 }} /></span>
            <span className="ts__arrows">
              <button type="button" className="ts__arrow" onClick={prev} disabled={n < 2} aria-label="Previous product">
                <IconArrowRight width="18" height="18" style={{ transform: 'rotate(180deg)' }} />
              </button>
              <button type="button" className="ts__arrow" onClick={next} disabled={n < 2} aria-label="Next product">
                <IconArrowRight width="18" height="18" />
              </button>
            </span>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">{`${at + 1} of ${n}: ${p.title}, ${typeOf(p)}`}</p>

        <div className="ts__thumbs" ref={thumbsRef} aria-label="All trending products">
          {list.map((x, i) => (
            <button
              type="button"
              key={x.p.slug}
              className="ts__thumb"
              aria-current={i === at ? 'true' : undefined}
              aria-label={`#${x.rank} ${x.p.title}`}
              onClick={() => go(i)}
            >
              <span className="ts__thumb-img"><img src={x.p.img} alt="" loading="lazy" decoding="async" /></span>
              <span className="ts__thumb-text">
                <span className="ts__thumb-rank">{pad(x.rank)}</span>
                <span className="ts__thumb-name">{x.p.title}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
