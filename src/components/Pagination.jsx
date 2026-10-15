import { IconChevronLeft, IconChevronRight } from './Icons.jsx';

/**
 * Products pagination - pill-style items, black pill for the current page,
 * Prev/Next with chevron icons (matches the reference pattern).
 */
function pageItems(page, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 4, '…', count];
  if (page >= count - 2) return [1, '…', count - 3, count - 2, count - 1, count];
  return [1, '…', page - 1, page, page + 1, '…', count];
}

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  const items = pageItems(page, pageCount);

  return (
    <nav aria-label="Pagination">
      <ul className="ha-pagination">
        <li className="ha-pagination-item">
          {page > 1 ? (
            <button type="button" className="ha-pagination-link ha-pagination-link--nav" onClick={() => onChange(page - 1)} aria-label="Previous page">
              <IconChevronLeft className="ha-pagination-icon--prev" width="16" height="16" /> Prev
            </button>
          ) : (
            <span className="ha-pagination-link ha-pagination-link--nav ha-pagination-link--disabled">
              <IconChevronLeft className="ha-pagination-icon--prev" width="16" height="16" /> Prev
            </span>
          )}
        </li>

        {items.map((it, k) => (
          <li className="ha-pagination-item" key={`${it}-${k}`} aria-hidden={it === '…' ? 'true' : undefined}>
            {it === '…' ? (
              <span className="ha-pagination-label">…</span>
            ) : (
              <button
                type="button"
                className={`ha-pagination-link ha-pagination-link--pageNo ${it === page ? 'ha-pagination-link--active' : ''}`}
                aria-label={`Page ${it}`}
                aria-current={it === page ? 'page' : undefined}
                onClick={() => onChange(it)}
              >
                {it}
              </button>
            )}
          </li>
        ))}

        <li className="ha-pagination-item">
          {page < pageCount ? (
            <button type="button" className="ha-pagination-link ha-pagination-link--nav" onClick={() => onChange(page + 1)} aria-label="Next page">
              Next <IconChevronRight className="ha-pagination-icon--next" width="16" height="16" />
            </button>
          ) : (
            <span className="ha-pagination-link ha-pagination-link--nav ha-pagination-link--disabled">
              Next <IconChevronRight className="ha-pagination-icon--next" width="16" height="16" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
