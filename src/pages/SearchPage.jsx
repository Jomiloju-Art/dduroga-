import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { searchProducts } from '../data/products.js';
import { IconSearch } from '../components/Icons.jsx';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [val, setVal] = useState(q);
  const results = searchProducts(q);

  const submit = (e) => {
    e.preventDefault();
    setParams({ q: val }, { replace: true });
  };

  return (
    <>
      <PageHero eyebrow="Search" title={q ? `Results for “${q}”` : 'Search the catalogue'} lead="Find products by name, SKU, hazard or category." crumb="Search" />

      <section className="section" style={{ paddingBlock: '56px 84px' }}>
        <div className="container">
          <form className="search-bar" style={{ marginBottom: 26, maxWidth: 620 }} onSubmit={submit}>
            <IconSearch width="18" height="18" />
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Search products, SKUs, hazards…"
              aria-label="Search products"
            />
            <button type="submit" className="btn hx-btn" style={{ padding: '10px 18px' }}>Search</button>
          </form>

          {q && <p className="muted" style={{ marginBottom: 18 }}>{results.length} result{results.length === 1 ? '' : 's'}</p>}

          {q && results.length > 0 ? (
            <div className="grid grid--4" style={{ gap: '24px 4px' }}>
              {results.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          ) : q ? (
            <p className="muted">No products match your search. Try a different term.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
