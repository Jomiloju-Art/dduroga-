import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { searchProducts, zoneOf, allProducts, rangeLabel, popularSearches } from '../data/products.js';
import { standardStrings } from './CertifiedTo.jsx';
import { IconSearch, IconArrowRight } from './Icons.jsx';
import { useScrollLock } from '../lib/scrollLock.js';

/** Wrap the parts of `text` that match a query word in <mark>. */
export function Highlight({ text, query }) {
  const words = (query || '').trim().split(/\s+/).filter((w) => w.length > 1).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length || !text) return text || null;
  const parts = String(text).split(new RegExp(`(${words.join('|')})`, 'gi'));
  return parts.map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

export default function SearchModal({ open, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // preventScroll: the page is locked behind the panel, so focusing must not scroll it.
    if (open) { setQ(''); setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 20); }
  }, [open]);

  useEffect(() => { if (open) onClose(); /* close on route change */ }, [pathname]);

  // close on escape
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  // The page behind the search panel stays put.
  useScrollLock(open);

  const results = searchProducts(q, 8);
  const total = q.trim() ? searchProducts(q, allProducts.length + 1).length : 0;

  // Enter opens the full results page, as on any store search.
  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="search-overlay" onMouseDown={onClose}>
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.stopPropagation()}>
        <form className="search-bar" role="search" onSubmit={submit}>
          <IconSearch width="18" height="18" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, SKUs, standards…"
            aria-label="Search products"
          />
          <button type="button" className="search-close" onClick={onClose} aria-label="Close search">×</button>
        </form>
        <div className="search-results">
          {q.trim() === '' ? (
            <div className="search-popular">
              <p className="search-hint">Popular searches</p>
              <div className="search-popular__chips">
                {popularSearches.map((s) => (
                  <button type="button" key={s} onClick={() => setQ(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="search-hint">No products found for &ldquo;{q}&rdquo;. Try a product type such as &ldquo;gloves&rdquo; or a standard such as &ldquo;EN 388&rdquo;.</p>
          ) : (
            results.map((p) => {
              const std = standardStrings(p.catalogueStandards)[0];
              return (
                <Link to={`/products/${p.slug}`} className="search-result" key={p.slug} onClick={onClose}>
                  <span className="search-result__img">{p.img ? <img src={p.img} alt="" loading="lazy" /> : null}</span>
                  <span className="search-result__info">
                    <strong><Highlight text={p.title} query={q} /></strong>
                    <em>
                      <Highlight text={rangeLabel(p) || zoneOf(p)?.label} query={q} />
                      {std ? <span className="search-result__std"> · {std}</span> : null}
                    </em>
                  </span>
                  <IconArrowRight width="14" height="14" />
                </Link>
              );
            })
          )}
          {q.trim() !== '' && total > 0 && (
            <Link to={`/search?q=${encodeURIComponent(q.trim())}`} className="search-all" onClick={onClose}>
              {total > results.length ? `See all ${total} results` : 'Open results page'} <IconArrowRight width="14" height="14" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
