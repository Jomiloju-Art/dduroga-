import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { searchProducts, zoneOf, allProducts } from '../data/products.js';
import { IconSearch, IconArrowRight } from './Icons.jsx';

export default function SearchModal({ open, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 20); }
  }, [open]);

  useEffect(() => { if (open) onClose(); /* close on route change */ }, [pathname]);

  // close on escape
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  const results = searchProducts(q, 8);
  const total = q.trim() ? searchProducts(q, allProducts.length + 1).length : 0;

  if (!open) return null;

  return (
    <div className="search-overlay" onMouseDown={onClose}>
      <div className="search-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="search-bar">
          <IconSearch width="18" height="18" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, SKUs, hazards…"
            aria-label="Search products"
          />
          <button type="button" className="search-close" onClick={onClose} aria-label="Close search">×</button>
        </div>
        <div className="search-results">
          {q.trim() === '' ? (
            <p className="search-hint">Start typing to search the catalogue.</p>
          ) : results.length === 0 ? (
            <p className="search-hint">No products found for "{q}".</p>
          ) : (
            results.map((p) => (
              <Link to={`/products/${p.slug}`} className="search-result" key={p.slug} onClick={onClose}>
                <span className="search-result__img">{p.img ? <img src={p.img} alt="" loading="lazy" /> : null}</span>
                <span className="search-result__info">
                  <strong>{p.title}</strong>
                  <em>{zoneOf(p)?.label}</em>
                </span>
                <IconArrowRight width="14" height="14" />
              </Link>
            ))
          )}
          {q.trim() !== '' && total > results.length && (
            <Link to={`/search?q=${encodeURIComponent(q)}`} className="search-all" onClick={onClose}>
              See all {total} results <IconArrowRight width="14" height="14" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
