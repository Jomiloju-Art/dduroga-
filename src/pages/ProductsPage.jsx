import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allProducts, zones, hazardNames, industryCatalog, byHazard, byIndustry, productsByZone } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { usePageMeta } from '../lib/seo.js';

const PER_PAGE = 24;

/** Sort options. "Featured" keeps the curated catalogue order. */
const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'az', label: 'Name A–Z' },
  { value: 'za', label: 'Name Z–A' },
  { value: 'type', label: 'Product type' },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat');
  const hazard = params.get('hazard');
  const industry = params.get('industry');
  const sort = params.get('sort') || '';
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Facets are mutually exclusive, so picking one replaces the whole query string.
  // `sort` is carried across because changing facet should not reset the order.
  const setQuery = (obj) => {
    const next = new URLSearchParams();
    Object.entries({ sort, ...obj }).forEach(([k, v]) => { if (v && v !== 'all') next.set(k, v); });
    setParams(next, { replace: true });
  };

  const zone = zones.find((z) => z.id === cat);
  const hazardLabel = hazard ? hazardNames[hazard] : null;
  const industryLabel = industry ? industryCatalog.find((i) => i.slug === industry)?.label : null;

  let title = 'All products';
  let visible = allProducts;

  if (hazard) {
    visible = byHazard(hazard);
    title = hazardLabel || 'Hazard';
  } else if (industry) {
    visible = byIndustry(industry);
    title = industryLabel || 'Industry';
  } else if (zone) {
    visible = productsByZone(zone.id);
    title = zone.label;
  }

  // Sorting happens before pagination so page 1 of "A–Z" is genuinely the first
  // 24 alphabetically, not the first 24 of the curated order re-sorted.
  if (sort === 'az') visible = [...visible].sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'za') visible = [...visible].sort((a, b) => b.title.localeCompare(a.title));
  else if (sort === 'type') visible = [...visible].sort((a, b) => (a.type || '').localeCompare(b.type || '') || a.title.localeCompare(b.title));

  const pageParam = parseInt(params.get('page') || '1', 10) || 1;
  const pageCount = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const page = Math.min(Math.max(1, pageParam), pageCount);
  const shown = visible.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const gridRef = useRef(null);
  const goToPage = (n) => {
    const next = new URLSearchParams(params);
    if (n <= 1) next.delete('page'); else next.set('page', String(n));
    setParams(next, { replace: true });
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Keep the page behind the filter offcanvas still, and close it on Escape.
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setFiltersOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen]);

  const hasFilter = Boolean(cat || hazard || industry);
  const zoneShort = (z) => z.id.charAt(0).toUpperCase() + z.id.slice(1);

  usePageMeta({
    title,
    description: `Browse the certified PPE range from DDUROGA Safety: ${title.toLowerCase()}.`,
    canonical: `/products${cat ? `?cat=${cat}` : hazard ? `?hazard=${hazard}` : industry ? `?industry=${industry}` : ''}`,
  });

  return (
    <>
      {/* Collection header — Gymshark's title + count, no hero band. */}
      <header className="plp-header">
        <h1>{title}</h1>
        <p className="plp-header__count" role="status" aria-live="polite">
          {visible.length} Products
        </p>
      </header>

      {/* Quick zone filter — mirrors Gymshark's "Filter by gender" bar. */}
      <div className="plp-quick" role="group" aria-label="Filter by protection zone">
        <span className="plp-quick__label">Filter by zone:</span>
        {zones.map((z) => (
          <button
            key={z.id}
            type="button"
            className={`plp-quick__chip ${cat === z.id ? 'is-active' : ''}`}
            onClick={() => setQuery({ cat: z.id })}
          >
            {zoneShort(z)}
          </button>
        ))}
        {hasFilter && (
          <button type="button" className="plp-quick__chip plp-quick__chip--clear" onClick={() => setQuery({})}>
            Clear
          </button>
        )}
      </div>

      <section className="plp">
        <div className="plp-layout">
          <aside id="filters" className={`plp-sidebar ${filtersOpen ? 'open' : ''}`} aria-label="Filters">
            <div className="plp-sidebar__head">
              <h2>filter &amp; sort</h2>
              {hasFilter && (
                <button type="button" className="plp-sidebar__clear" onClick={() => setQuery({})}>
                  Clear All
                </button>
              )}
            </div>
            <ProductFilters
              active={{ cat, industry, hazard }}
              onPick={(key, value) => setQuery({ [key]: value })}
            />
            <button type="button" className="plp-sidebar__apply" onClick={() => setFiltersOpen(false)}>
              Show results
            </button>
          </aside>

          <div className="plp-main">
            <div className="plp-toolbar">
              <p className="plp-toolbar__count" role="status" aria-live="polite">
                {visible.length === 0
                  ? 'No products'
                  : `Showing ${(page - 1) * PER_PAGE + 1}–${(page - 1) * PER_PAGE + shown.length} of ${visible.length} products`}
              </p>
              <div className="plp-toolbar__tools">
                <label className="plp-sort">
                  <span className="plp-sort__label">Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => {
                      const next = new URLSearchParams(params);
                      if (e.target.value) next.set('sort', e.target.value); else next.delete('sort');
                      next.delete('page');
                      setParams(next, { replace: true });
                    }}
                  >
                    {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </label>
                <button
                  type="button"
                  className="plp-filter-toggle"
                  aria-controls="filters"
                  aria-expanded={filtersOpen}
                  aria-label="Show filters"
                  onClick={() => setFiltersOpen(true)}
                >
                  <i className="fas fa-sliders-h" aria-hidden="true" />
                </button>
              </div>
            </div>

            {visible.length > 0 ? (
              <>
                <div className="plp-grid" ref={gridRef}>
                  {shown.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
                <Pagination page={page} pageCount={pageCount} onChange={goToPage} />
              </>
            ) : (
              <p className="muted">No products match this filter yet. Ask our team for the full list.</p>
            )}
          </div>
        </div>
      </section>

      <div className={`facet-scrim ${filtersOpen ? 'show' : ''}`} onClick={() => setFiltersOpen(false)} aria-hidden="true" />

      <CtaBand
        title="Need help choosing?"
        text="Tell us the application and the hazards involved, and our specialists will shortlist certified products and send documentation."
      />
    </>
  );
}
