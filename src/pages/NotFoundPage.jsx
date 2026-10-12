import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories, searchProducts } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import { IconSearch } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';

/**
 * Not found, for unknown routes and for product links that no longer resolve
 * (`slug` set). Product links used to redirect silently to the catalogue,
 * which left the visitor guessing and reads to search engines as a soft 404.
 * Here we say what happened and offer the likeliest products, guessed from the
 * words in the broken link.
 */
export default function NotFoundPage({ slug = '' }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  usePageMeta({ title: slug ? 'Product not found' : 'Page not found', noindex: true });

  const guess = slug.replace(/[-_]+/g, ' ').replace(/\bcopy\b/g, '').trim();
  const suggestions = guess ? searchProducts(guess, 4) : [];

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <section className="notfound">
      <div className="container">
        <div className="notfound-code" aria-hidden="true">404</div>
        <h1 className="section-title">{slug ? 'We can’t find that product' : 'This page walked off the job'}</h1>
        <p className="muted notfound-lead">
          {slug
            ? 'It may have been renamed or retired from the 2025 range. Search the catalogue, or start from a protection zone.'
            : 'The page you are looking for does not exist or has moved.'}
        </p>

        <form className="search-bar notfound-search" role="search" onSubmit={submit}>
          <IconSearch width="18" height="18" />
          <input type="search" enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, SKUs, standards…" aria-label="Search products" />
          <button type="submit" className="btn hx-btn">Search</button>
        </form>

        <nav className="notfound-zones" aria-label="Protection zones">
          {categories.map((c) => <Link key={c.id} to={`/products?cat=${c.id}`}>{c.label}</Link>)}
          <Link to="/">Home</Link>
        </nav>

        {suggestions.length > 0 && (
          <div className="notfound-suggest">
            <h2 className="notfound-suggest__title">Were you looking for one of these?</h2>
            <div className="grid grid--4" style={{ gap: '24px 4px' }}>
              {suggestions.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
