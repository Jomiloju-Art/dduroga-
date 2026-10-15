import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findProduct, zoneOf, rangeLabel, zones } from '../data/products.js';
import { TRENDING } from '../data/trending.js';
import { glossaryIcon } from '../data/glossaryIcons.js';
import { useQuote } from '../quote/QuoteContext.jsx';
import { IconArrowRight } from './Icons.jsx';

/**
 * Homepage "Trending now": a dark band with zone tabs, one spotlight product
 * and a swipeable rail of the rest. Products and order come from trending.js.
 *
 * Every detail on a card (symbols, standard, CE) comes from the product's
 * Mallcom 2025 catalogue row, the same data the product page shows.
 */

/** The headline standard: one with a performance code, else an EN/ISO one, else the first. */
const firstStandard = (p) => {
  const list = p.catalogueStandards || [];
  const s = list.find((x) => x.rating) || list.find((x) => /^EN/.test(x.code)) || list[0];
  return s ? (s.rating ? `${s.code} ${s.rating}` : s.code) : '';
};

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

function Spotlight({ product, rank }) {
  const symbols = product.catalogueSymbols.filter(glossaryIcon).slice(0, 4);
  const std = firstStandard(product);
  return (
    <Link to={`/products/${product.slug}`} className="tr-spot" key={product.slug}>
      <span className="tr-spot__media">
        <span className="tr-badge">#{rank} Trending</span>
        <img src={product.img} alt={product.title} loading="lazy" decoding="async" />
      </span>
      <span className="tr-spot__body">
        <span className="tr-type">{rangeLabel(product) || zoneOf(product)?.label}</span>
        <span className="tr-spot__name">{product.title}</span>
        {symbols.length > 0 && (
          <span className="tr-symbols">
            {symbols.map((s) => (
              <span key={s} className="tr-symbol"><img src={glossaryIcon(s)} alt="" loading="lazy" />{s}</span>
            ))}
          </span>
        )}
        {(std || product.ce) && (
          <span className="tr-std">
            {product.ce && <img src="/accreditations/ce.png" alt="CE marked" loading="lazy" />}
            {std && <span>{std}</span>}
          </span>
        )}
        <span className="tr-spot__cta">
          <span className="tr-btn tr-btn--light">View product <IconArrowRight width="16" height="16" /></span>
          <QuickAdd product={product} className="tr-btn tr-btn--orange">Add to quote</QuickAdd>
        </span>
      </span>
    </Link>
  );
}

function RailCard({ product }) {
  const std = firstStandard(product);
  return (
    <Link to={`/products/${product.slug}`} className="tr-card">
      <span className="tr-card__media">
        <img src={product.img} alt={product.title} loading="lazy" />
        <QuickAdd product={product} className="tr-card__add">+</QuickAdd>
      </span>
      <span className="tr-card__body">
        <span className="tr-type">{rangeLabel(product) || zoneOf(product)?.label}</span>
        <span className="tr-card__name">{product.title}</span>
        {std && <span className="tr-card__std">{product.ce && <b>CE</b>}{std}</span>}
      </span>
    </Link>
  );
}

export default function TrendingShowcase() {
  const all = useMemo(() => TRENDING.map((s, i) => ({ p: findProduct(s), rank: i + 1 })).filter((x) => x.p), []);
  const [zone, setZone] = useState('');
  const list = zone ? all.filter((x) => zoneOf(x.p)?.id === zone) : all;
  const [spot, ...rest] = list;

  const railRef = useRef(null);
  const [progress, setProgress] = useState({ start: 0, size: 1, atStart: true, atEnd: false });
  const measure = () => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress({
      start: max > 0 ? el.scrollLeft / el.scrollWidth : 0,
      size: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1,
      atStart: el.scrollLeft <= 2,
      atEnd: el.scrollLeft >= max - 2,
    });
  };
  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    el.scrollLeft = 0;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => { el.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [zone]);
  const scrollBy = (dir) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const tabs = [{ id: '', label: 'All' }, ...zones.map((z) => ({ id: z.id, label: z.id.charAt(0).toUpperCase() + z.id.slice(1) }))]
    .map((t) => ({ ...t, count: t.id ? all.filter((x) => zoneOf(x.p)?.id === t.id).length : all.length }))
    .filter((t) => t.count > 0);

  if (!spot) return null;

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
                  onClick={() => setZone(t.id)}
                >
                  {t.label}<span>{t.count}</span>
                </button>
              ))}
            </div>
            <Link to="/products" className="tr__all">All products <IconArrowRight width="16" height="16" /></Link>
          </div>
        </div>

        {/* key on zone so the cards replay their entrance when the filter changes */}
        <div className="tr__stage" key={zone || 'all'}>
          <Spotlight product={spot.p} rank={spot.rank} />
          {rest.length > 0 && (
            <div className="tr__railwrap">
              <div className="tr__rail" ref={railRef}>
                {rest.map((x) => <RailCard key={x.p.slug} product={x.p} />)}
              </div>
              <div className="tr__nav">
                <span className="tr__bar" aria-hidden="true">
                  <i style={{ left: `${progress.start * 100}%`, width: `${Math.min(1, progress.size) * 100}%` }} />
                </span>
                <button type="button" className="tr__arrow" onClick={() => scrollBy(-1)} disabled={progress.atStart} aria-label="Previous products">
                  <IconArrowRight width="18" height="18" style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button type="button" className="tr__arrow" onClick={() => scrollBy(1)} disabled={progress.atEnd} aria-label="Next products">
                  <IconArrowRight width="18" height="18" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
