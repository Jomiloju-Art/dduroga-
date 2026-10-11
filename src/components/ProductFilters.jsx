import { zones, industryCatalog, hazardNames, byHazard, byIndustry, productsByZone } from '../data/products.js';

/**
 * Facet groups shown in the catalogue sidebar / mobile offcanvas.
 *
 * Counts come from the live catalogue, and options that would return nothing are
 * disabled rather than clickable. Four hazard ids (Gas & Vapour, UV Radiation,
 * Static Electric, Low Visibility) match no product tags, so they used to be
 * offered as normal links and led straight to an empty grid with no explanation.
 */
const GROUPS = [
  {
    key: 'cat',
    label: 'Protection zone',
    all: 'All zones',
    items: zones.map((z) => ({ value: z.id, label: z.label, count: productsByZone(z.id).length })),
  },
  {
    key: 'industry',
    label: 'Industry',
    all: 'All industries',
    items: industryCatalog.map((i) => ({ value: i.slug, label: i.label, count: byIndustry(i.slug).length })),
  },
  {
    key: 'hazard',
    label: 'Hazard',
    all: 'All hazards',
    items: Object.entries(hazardNames).map(([id, label]) => ({ value: id, label, count: byHazard(id).length })),
  },
];

/** Facet list. `active` maps group key → selected value; `onPick(key, value)` applies it. */
export default function ProductFilters({ active, onPick }) {
  return (
    <>
      {GROUPS.map((g) => (
        <div className="facet-group" key={g.key}>
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
