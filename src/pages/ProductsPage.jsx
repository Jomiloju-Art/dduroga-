import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { allProducts, zones, hazardNames, industryCatalog, byHazard, byIndustry, productsByZone, productsByRange, rangeById, rangesForZone, rangeLabel, byFeatured } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { usePageMeta } from '../lib/seo.js';
import { listingFor, listingTitle, listingDescription, listingIntro } from '../lib/seoText.js';
import { lockScroll } from '../lib/scrollLock.js';

const PER_PAGE = 24;

/** Sort options. "Featured": trending picks, then in stock, then 2025 catalogue order (byFeatured). */
const SORTS = [
  { value: '', label: 'Featured' },
  { value: 'az', label: 'Name A–Z' },
  { value: 'za', label: 'Name Z–A' },
  { value: 'type', label: 'Product type' },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  // Unknown values (an old or mistyped link) are ignored, so the visitor sees
  // all products rather than an empty "Industry" page.
  const hazard = hazardNames[params.get('hazard')] ? params.get('hazard') : null;
  const industry = industryCatalog.some((i) => i.slug === params.get('industry')) ? params.get('industry') : null;
  const range = rangeById(params.get('range'));
  // A range implies its zone, so ?range=welder alone still highlights Hand.
  const cat = params.get('cat') || range?.zone || null;
  const sort = params.get('sort') || '';
  const [filtersOpen, setFiltersOpen] = useState(false);
  // /products#facet-industry (mega menu "All 17 industries"): open the filters
  // on small screens and bring that group into view.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash.startsWith('#facet-')) return;
    if (window.matchMedia('(max-width: 1023px)').matches) setFiltersOpen(true);
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ block: 'start' }), 120);
    return () => clearTimeout(t);
  }, [hash]);

  // Back to the top whenever the filter or sort changes. ScrollToTop only
  // fires on a new pathname, and filters change just the query string, so a
  // filter picked halfway down the page left the visitor in the middle of the
  // new results. While the phone filter drawer is open this waits until it
  // closes, so the drawer does not jump under the visitor's finger.
  const filterKey = [params.get('cat'), params.get('range'), hazard, industry, sort].join('|');
  const lastKey = useRef(filterKey);
  const pendingTop = useRef(false);
  useEffect(() => {
    if (lastKey.current === filterKey) return;
    lastKey.current = filterKey;
    pendingTop.current = true;
  }, [filterKey]);
  useEffect(() => {
    if (!pendingTop.current || filtersOpen) return;
    pendingTop.current = false;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  // Facets are mutually exclusive, so picking one replaces the whole query string.
  // `sort` is carried across because changing facet should not reset the order.
  // The one exception is a range, which narrows its zone rather than replacing it.
  const setQuery = (obj) => {
    const next = new URLSearchParams();
    Object.entries({ sort, ...obj }).forEach(([k, v]) => { if (v && v !== 'all') next.set(k, v); });
    setParams(next, { replace: true });
  };
  const pick = (key, value) => (key === 'range' ? setQuery({ cat, range: value }) : setQuery({ [key]: value }));

  const zone = zones.find((z) => z.id === cat);
  const hazardLabel = hazard ? hazardNames[hazard] : null;
  const industryLabel = industry ? industryCatalog.find((i) => i.slug === industry)?.label : null;
  const zoneRanges = zone ? rangesForZone(zone.id) : [];

  let title = 'All products';
  let visible = allProducts;

  if (hazard) {
    visible = byHazard(hazard);
    title = hazardLabel || 'Hazard';
  } else if (industry) {
    visible = byIndustry(industry);
    title = industryLabel || 'Industry';
  } else if (range) {
    visible = productsByRange(range.id);
    title = range.label;
  } else if (zone) {
    visible = productsByZone(zone.id);
    title = zone.label;
  }

  // Sorting happens before pagination so page 1 of "A–Z" is genuinely the first
  // 24 alphabetically, not the first 24 of the curated order re-sorted.
  if (sort === 'az') visible = [...visible].sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'za') visible = [...visible].sort((a, b) => b.title.localeCompare(a.title));
  else if (sort === 'type') visible = [...visible].sort((a, b) => rangeLabel(a).localeCompare(rangeLabel(b)) || a.title.localeCompare(b.title));
  else visible = [...visible].sort(byFeatured);

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
    const unlock = lockScroll();
    document.addEventListener('keydown', onKey);
    return () => {
      unlock();
      document.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen]);

  const hasFilter = Boolean(cat || hazard || industry);
  const zoneShort = (z) => z.id.charAt(0).toUpperCase() + z.id.slice(1);

  // Search title, description and intro come from lib/seoText.js, which the
  // build script also uses for the static HTML crawlers read first.
  const listing = listingFor({ cat, range: range?.id, industry, hazard });
  usePageMeta({
    title: listingTitle(listing),
    description: listingDescription(listing),
    canonical: `/products${range ? `?range=${range.id}` : cat ? `?cat=${cat}` : hazard ? `?hazard=${hazard}` : industry ? `?industry=${industry}` : ''}`,
  });

  return (
    <>
      {/* Collection header — Gymshark's title + count, no hero band. */}
      <header className="plp-header">
        <h1>{title}</h1>
        <p className="plp-header__intro">{listingIntro(listing)}</p>
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

      {/* Product types within the chosen zone, from Mallcom's catalogue ranges. */}
      {zone && !hazard && !industry && zoneRanges.length > 0 && (
        <div className="plp-quick plp-quick--ranges" role="group" aria-label={`${zone.label} product types`}>
          <span className="plp-quick__label">Type:</span>
          <button
            type="button"
            className={`plp-quick__chip ${!range ? 'is-active' : ''}`}
            onClick={() => setQuery({ cat: zone.id })}
          >
            All
          </button>
          {zoneRanges.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`plp-quick__chip ${range?.id === r.id ? 'is-active' : ''}`}
              onClick={() => setQuery({ cat: zone.id, range: r.id })}
            >
              {r.label} <span className="plp-quick__count">{r.count}</span>
            </button>
          ))}
        </div>
      )}

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
              {/* Phones: the drawer needs its own way out. */}
              <button type="button" className="plp-sidebar__close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">×</button>
            </div>
            <ProductFilters
              active={{ cat, range: range?.id, industry, hazard }}
              onPick={pick}
            />
            <button type="button" className="plp-sidebar__apply" onClick={() => setFiltersOpen(false)}>
              {visible.length ? `Show ${visible.length} result${visible.length === 1 ? '' : 's'}` : 'No results'}
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
                  <span className="plp-filter-toggle__label">Filters{hasFilter ? ' •' : ''}</span>
                </button>
              </div>
            </div>

            {visible.length > 0 ? (
              <>
                {/* Keeps the outline h1 > h2 > h3 on phones, where the filter heading is in a closed drawer. */}
                <h2 className="sr-only">Products</h2>
                <div className="plp-grid plp-grid--cascade" ref={gridRef} key={`${filterKey}|${page}`}>
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
