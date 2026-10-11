/**
 * Products pagination - pill-style items, black pill for the current page,
 * Prev/Next with Font Awesome angle icons (matches the reference pattern).
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
              <i className="fas fa-angle-left ha-pagination-icon--prev" aria-hidden="true" /> Prev
            </button>
          ) : (
            <span className="ha-pagination-link ha-pagination-link--nav ha-pagination-link--disabled">
              <i className="fas fa-angle-left ha-pagination-icon--prev" aria-hidden="true" /> Prev
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
              Next <i className="fas fa-angle-right ha-pagination-icon--next" aria-hidden="true" />
            </button>
          ) : (
            <span className="ha-pagination-link ha-pagination-link--nav ha-pagination-link--disabled">
              Next <i className="fas fa-angle-right ha-pagination-icon--next" aria-hidden="true" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
