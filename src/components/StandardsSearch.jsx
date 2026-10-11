import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchStandards, standardHref, zoneLabels, popularStandards } from '../data/standards.js';
import { hazardNames } from '../data/products.js';
import { IconSearch, IconArrowRight } from './Icons.jsx';

/**
 * Lookup field for PPE standards, sized for the hero band.
 *
 * Deliberately not an ARIA combobox: the suggestion panel is always rendered
 * below the field rather than being an overlay with a controlled active
 * descendant. That keeps it usable with a plain Tab order — type, then Tab
 * through the matches — instead of requiring arrow-key handling to reach them.
 */
export default function StandardsSearch({ limit = 6 }) {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const statusId = `${inputId}-status`;

  const results = useMemo(() => searchStandards(query, limit), [query, limit]);
  const trimmed = query.trim();

  const status = !trimmed
    ? 'Showing suggested standards'
    : results.length === 1
      ? '1 standard matches'
      : results.length
        ? `${results.length} standards match`
        : `No standard matches ${trimmed}`;

  return (
    <div className="std-search">
      <form className="std-search__form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label className="sr-only" htmlFor={inputId}>
          Search safety standards by code, e.g. EN 388 or ANSI Z87.1
        </label>
        <span className="std-search__icon" aria-hidden="true"><IconSearch width="20" height="20" /></span>
        <input
          id={inputId}
          className="std-search__input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
          placeholder="Search a standard code — EN 388, ANSI Z87.1, S3…"
          autoComplete="off"
          spellCheck="false"
          aria-describedby={statusId}
        />
        {trimmed && (
          <button type="button" className="std-search__clear" onClick={() => setQuery('')}>
            Clear
          </button>
        )}
      </form>

      <p className="sr-only" id={statusId} aria-live="polite">{status}</p>

      <div className="std-search__panel">
        {results.length > 0 ? (
          <ul className="std-search__list">
            {results.map((s) => (
              <li key={s.code}>
                <Link className="std-search__row" to={standardHref(s)}>
                  <span className="std-search__code">{s.code}</span>
                  <span className="std-search__body">
                    <strong>{s.title}</strong>
                    <span>{s.scope}</span>
                  </span>
                  <span className="std-search__tags">
                    <em>{zoneLabels[s.zone]}</em>
                    {s.hazard && hazardNames[s.hazard] ? <em>{hazardNames[s.hazard]}</em> : null}
                  </span>
                  <span className="std-search__go" aria-hidden="true"><IconArrowRight width="16" height="16" /></span>
                </Link>
              </li>
            ))}
          </ul>
        ) : trimmed ? (
          <p className="std-search__empty">
            No standard matches “{trimmed}”.{' '}
            <Link to="/products">Browse the full catalogue</Link> or{' '}
            <Link to="/contact">ask our team</Link>.
          </p>
        ) : (
          <>
            <p className="std-search__hint">Common standards buyers ask about:</p>
            <ul className="std-search__chips">
              {popularStandards.map((s) => (
                <li key={s.code}>
                  <button type="button" className="std-search__chip" onClick={() => setQuery(s.code)}>
                    {s.code}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="std-search__note">
          Reference only. Certificates for a specific product are available on request.
        </p>
      </div>
    </div>
  );
}
