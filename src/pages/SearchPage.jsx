import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { searchProducts, popularSearches, rangesForZone, categories } from '../data/products.js';
import { IconSearch } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [val, setVal] = useState(q);
  useEffect(() => setVal(q), [q]);
  const results = searchProducts(q);

  // 24 a page, like the product listing: a broad word such as "glove" matched
  // 200+ products and loaded every photo at once (8.5 MB on a phone).
  const PER_PAGE = 24;
  const pageCount = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(params.get('page') || '1', 10) || 1), pageCount);
  const shown = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const gridRef = useRef(null);
  const goToPage = (n) => {
    const next = new URLSearchParams(params);
    if (n <= 1) next.delete('page'); else next.set('page', String(n));
    setParams(next, { replace: true });
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  usePageMeta({
    title: q ? `Search: ${q}` : 'Search',
    description: 'Search the DDUROGA Safety PPE catalogue by product name, SKU, type or standard.',
    canonical: '/search',
    noindex: true,
  });

  // Product types whose name matches the query, offered as a shortcut to the full range.
  const query = q.trim().toLowerCase();
  const typeHits = query
    ? categories.flatMap((c) => rangesForZone(c.id)).filter((r) => query.split(/\s+/).every((w) => r.label.toLowerCase().includes(w))).slice(0, 4)
    : [];

  const submit = (e) => {
    e.preventDefault();
    setParams({ q: val.trim() }, { replace: true });
  };

  const suggestions = (
    <div className="search-page__suggest">
      <span className="muted">Try:</span>
      {popularSearches.map((s) => (
        <Link key={s} to={`/search?q=${encodeURIComponent(s)}`}>{s}</Link>
      ))}
    </div>
  );

  return (
    <>
      <PageHero eyebrow="Search" title={q ? `Results for “${q}”` : 'Search the catalogue'} lead="Find products by name, SKU, product type or standard." crumb="Search" />

      <section className="section search-page" style={{ paddingBlock: '56px 84px' }}>
        <div className="container">
          <form className="search-bar" role="search" style={{ marginBottom: 20, maxWidth: 620 }} onSubmit={submit}>
            <IconSearch width="18" height="18" />
            <input
              type="search"
              enterKeyHint="search"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Search products, SKUs, standards…"
              aria-label="Search products"
            />
            <button type="submit" className="btn hx-btn" style={{ padding: '10px 18px' }}>Search</button>
          </form>

          {!q && suggestions}

          {typeHits.length > 0 && (
            <div className="search-page__types">
              <span className="muted">Product types:</span>
              {typeHits.map((r) => (
                <Link key={r.id} to={`/products?range=${r.id}`}>{r.label} <span>{r.count}</span></Link>
              ))}
            </div>
          )}

          {q && <p className="muted" style={{ margin: '18px 0' }} role="status">{results.length} result{results.length === 1 ? '' : 's'}{pageCount > 1 ? ` · page ${page} of ${pageCount}` : ''}</p>}

          {q && results.length > 0 ? (
            <>
              <h2 className="sr-only">Matching products</h2>
              <div className="grid grid--4" style={{ gap: '24px 4px', scrollMarginTop: 96 }} ref={gridRef}>
                {shown.map((p) => <ProductCard key={p.slug} product={p} />)}
              </div>
              <Pagination page={page} pageCount={pageCount} onChange={goToPage} />
            </>
          ) : q ? (
            <div>
              <p className="muted" style={{ marginBottom: 14 }}>No products match &ldquo;{q}&rdquo;. Check the spelling, or search by product type or standard.</p>
              {suggestions}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

