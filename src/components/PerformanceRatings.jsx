import { useState } from 'react';

/**
 * Performance rating tiles - mirrors the reference layout: a 2-up grid of
 * icon + stacked title/value pairs, with extras behind a "show more" toggle.
 *
 * Tiles are driven by the real data the catalogue holds - the protection areas
 * (product tags) and the standards found in the product copy. The `value` line
 * renders only when a real figure is supplied, so nothing is implied that the
 * product data doesn't support.
 */
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const ICON_DIR = '/icons/performance/';

/** Protection area → icon file. */
const HAZARD_ICONS = {
  cut: 'cut.png',
  abrasion: 'abrasion.png',
  puncture: 'puncture.png',
  impact: 'impact.png',
  heat: 'contact_heat_resistant.png',
  flame: 'en_407_claim.png',
  fireflame: 'en_407_claim.png',
  cold: 'en_511.png',
  chemicalsplash: 'splash_resistant.png',
  splash: 'splash_resistant.png',
  water: 'splash_resistant.png',
  rain: 'splash_resistant.png',
  uv: 'uv.png',
  uvradiation: 'uv.png',
  lowvisibility: 'uv.png',
  dust: 'dust_resistant.png',
  fog: 'dust_resistant.png',
  electric: 'arc_flash.png',
  electricshock: 'arc_flash.png',
  staticelectric: 'arc_flash.png',
  spark: 'arc_flash.png',
  biohazard: 'reach_compliance.jpg',
};

const HAZARD_FALLBACK_GLYPH = 'fa-shield-halved';

/** Standard string → icon file. */
const STANDARD_ICONS = [
  [/EN\s?388/i, 'en_388.png'],
  [/EN\s?407/i, 'en_407_claim.png'],
  [/EN\s?511/i, 'en_511.png'],
  [/EN\s?166|Z87|Z94/i, 'impact.png'],
  [/EN\s?397|EN\s?12492|Z89|helmet/i, 'helmet_type_2.png'],
  [/EN\s?352|NRR/i, 'nrr_csa.png'],
  [/EN\s?374|chemical/i, 'splash_resistant.png'],
  [/REACH/i, 'reach_compliance.jpg'],
  [/EN\s?ISO\s?20345|EN\s?ISO\s?20347/i, 'abrasion.png'],
];

export const hazardIcon = (label) => {
  const file = HAZARD_ICONS[norm(label)];
  return file ? ICON_DIR + file : HAZARD_FALLBACK_GLYPH;
};

export const standardIcon = (standard) => {
  const hit = STANDARD_ICONS.find(([re]) => re.test(standard));
  return hit ? ICON_DIR + hit[1] : HAZARD_FALLBACK_GLYPH;
};

/** Renders an image icon when given a path, otherwise a Font Awesome glyph. */
export function RatingIcon({ icon }) {
  if (icon && icon.startsWith('/')) {
    return <img className="performance-icon" src={icon} alt="" loading="lazy" />;
  }
  return <i className={`fas ${icon} performance-icon`} aria-hidden="true" />;
}

const VISIBLE = 6;

export default function PerformanceRatings({ items, title = 'Performance ratings' }) {
  const [expanded, setExpanded] = useState(false);
  if (!items || items.length === 0) return null;

  const hidden = Math.max(0, items.length - VISIBLE);

  return (
    <div className="detail-taggroup">
      <h2>{title}</h2>
      <div className="updated-performance-ratings">
        {items.map((it, i) => (
          <div
            className={`rating-container${!expanded && i >= VISIBLE ? ' hidden' : ''}`}
            key={`${it.title}-${it.value}-${i}`}
            data-rating-name={it.name}
          >
            <div className="rating-icon">
              <RatingIcon icon={it.icon} />
            </div>
            <div className="rating-text">
              <span className="score-title">{it.title}</span>
              {it.value ? <span className="score-value">{it.value}</span> : null}
            </div>
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <button type="button" className="ratings-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          {expanded ? 'Show less' : `Show ${hidden} more`}
        </button>
      )}
    </div>
  );
}
