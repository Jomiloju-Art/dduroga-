import { zones, industryCatalog, byIndustry, productsByZone } from '../data/products.js';

/**
 * Facet groups shown in the catalogue sidebar / mobile offcanvas.
 *
 * Counts come from the live catalogue, and options that would return nothing are
 * disabled rather than clickable. There is no hazard group: the client asked
 * for hazard filtering to be removed from the site (Oct 2026).
 *
 * Product types are not repeated here: they are the chip row above the grid
 * (ProductsPage), which appears once a zone is chosen.
 */
const STATIC_GROUPS = [
  {
    key: 'industry',
    label: 'Industry',
    all: 'All industries',
    items: industryCatalog.map((i) => ({ value: i.slug, label: i.label, count: byIndustry(i.slug).length })),
  },
];

const ZONE_GROUP = {
  key: 'cat',
  label: 'Protection zone',
  all: 'All zones',
  items: zones.map((z) => ({ value: z.id, label: z.label, count: productsByZone(z.id).length })),
};

/** Facet list. `active` maps group key → selected value; `onPick(key, value)` applies it. */
export default function ProductFilters({ active, onPick }) {
  const groups = [ZONE_GROUP, ...STATIC_GROUPS];

  return (
    <>
      {groups.map((g) => (
        <div className="facet-group" key={g.key} id={`facet-${g.key}`}>
          {/* h2: these sit directly under the page h1, so h3 skipped a level */}
          <h2 className="facet-heading">{g.label}</h2>
          <ul className="facet-list">
            <li>
              <button
                type="button"
                className={`facet-item ${!active[g.key] ? 'is-active' : ''}`}
                onClick={() => onPick(g.key, '')}
              >
                <span className="facet-item__label">{g.all}</span>
              </button>
            </li>
            {g.items.map((it) => (
              <li key={it.value}>
                <button
                  type="button"
                  className={`facet-item ${active[g.key] === it.value ? 'is-active' : ''}`}
                  onClick={() => onPick(g.key, it.value)}
                  disabled={it.count === 0}
                  title={it.count === 0 ? `No products tagged ${it.label} yet` : undefined}
                >
                  <span className="facet-item__label">{it.label}</span>
                  <span className="facet-item__count">{it.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
