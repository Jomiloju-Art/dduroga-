import { Link } from 'react-router-dom';
import { categories, productsByZone, rangesForZone } from '../data/products.js';
import { IconArrowRight } from './Icons.jsx';

/**
 * "Shop by protection zone", from the approved homepage concept (Oct 2026).
 *
 * A bento grid: Hand (the largest range) is the tall tile, Head and Body sit
 * beside it and Feet spans the bottom. Each tile names its biggest product
 * types, and a scrolling strip underneath links straight to the most-stocked
 * types. Counts and types come from the catalogue data, so they stay correct
 * as products are added or removed.
 */

// Tile order and shape, as in the concept.
const LAYOUT = [
  { id: 'hand', mod: 'zb-tile--tall', chips: 5 },
  { id: 'head', mod: '', chips: 3 },
  { id: 'body', mod: '', chips: 3 },
  { id: 'feet', mod: 'zb-tile--wide', chips: 4 },
];

// Short chip names; the full range label is used everywhere else.
const SHORT = {
  helmets: 'Helmets', 'bump-caps': 'Bump caps', respirators: 'Respirators', 'surgical-masks': 'Surgical masks',
  eyewear: 'Eyewear', hearing: 'Hearing', driver: 'Driver', canadian: 'Canadian', mechanical: 'Mechanical',
  welder: 'Welder', 'welding-wear': 'Welding wear', 'para-aramid': 'Para-aramid', knitted: 'Knitted',
  'arm-sleeves': 'Arm sleeves', 'nitrile-cns': 'Nitrile cut & sewn', gauntlets: 'Gauntlets',
  'seamless-nitrile': 'Seamless nitrile', 'cut-resistant': 'Cut-resistant', pu: 'PU-coated', thermal: 'Thermal',
  supplementary: 'PVC & latex', cryo: 'Cryogenic', workwear: 'Workwear', fr: 'FR & multinorm', 'hi-vis': 'Hi-vis',
  rainwear: 'Rainwear', winter: 'Winter', occupational: 'Occupational', disposable: 'Disposables',
  shoes: 'Safety shoes', boots: 'Safety boots', 'high-boots': 'High boots', gumboots: 'Gumboots',
  'occupational-shoes': 'Occupational',
};

const byCount = (a, b) => b.count - a.count;

export default function ZoneBento() {
  const tiles = LAYOUT.map((t) => {
    const cat = categories.find((c) => c.id === t.id);
    return cat && {
      ...t,
      label: cat.label,
      count: productsByZone(t.id).length,
      types: rangesForZone(t.id).sort(byCount).slice(0, t.chips),
    };
  }).filter(Boolean);

  const topTypes = categories.flatMap((c) => rangesForZone(c.id)).sort(byCount).slice(0, 12);

  return (
    <section className="zb" id="zones">
      <div className="zb__inner">
        <div className="zb__head">
          <div>
            <span className="zb__eyebrow">Shop by protection zone</span>
            <h2 className="zb__title">Everything a site needs,<br />head to toe.</h2>
          </div>
          <Link to="/products" className="zb__all">View all products <IconArrowRight width="14" height="14" /></Link>
        </div>

        <div className="zb-grid">
          {tiles.map((t) => (
            <Link key={t.id} to={`/products?cat=${t.id}`} className={`zb-tile ${t.mod}`.trim()}>
              <img className="zb-tile__img" src={`/zones/${t.id}.jpg`} alt="" loading="lazy" decoding="async" />
              <span className="zb-tile__go" aria-hidden="true"><IconArrowRight width="16" height="16" /></span>
              <small className="zb-tile__count">{t.count} products</small>
              <h3 className="zb-tile__name">{t.label}</h3>
              {t.types.length > 0 && (
                <span className="zb-tile__types">
                  {t.types.map((r) => <span key={r.id}>{SHORT[r.id] || r.label}</span>)}
                </span>
              )}
            </Link>
          ))}
        </div>

        <nav className="zb-strip" aria-label="Popular product types">
          {topTypes.map((r) => (
            <Link key={r.id} to={`/products?range=${r.id}`}>{r.label}<span>{r.count}</span></Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
