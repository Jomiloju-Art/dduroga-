import { Link } from 'react-router-dom';
import { industryCatalog } from '../data/products.js';
import { IconArrowRight } from './Icons.jsx';
import Reveal from './Reveal.jsx';

/**
 * "Find your range": the homepage's shop-by-industry section, as a mosaic of
 * sector photos (after Primequip's "Powering projects across key industries"
 * on Dribbble; the client chose it in Oct 2026 over expanding cards and
 * numbered cards, and it replaced the product-photo cards of SectorGrid).
 *
 * Photos: public/industries/<slug>.webp (AI-generated, client-approved). The
 * grid is laid out for the six homepage sectors: the two tall photos (oil &
 * gas, logistics) take the tall tiles. A slug with no tile area in the CSS
 * would need one added there.
 */

/** One line per sector: where the work happens, not a claim about us. */
const BLURB = {
  construction: 'High-rise frames, roads and civil works.',
  'oil-gas': 'Flow stations, pipelines and refineries.',
  manufacturing: 'Machine shops and production lines.',
  mining: 'Quarries, open pits and processing.',
  logistics: 'Warehouses, yards and fleets.',
  chemicals: 'Mixing plants, paint lines and labs.',
};

/** Where the worker stands in each photo, so tighter crops keep them in frame. */
const FOCUS = {
  construction: '28% 40%',
  'oil-gas': '35% 40%',
  manufacturing: '62% 40%',
  mining: '24% 50%',
  logistics: '40% 50%',
  chemicals: '42% 40%',
};

export default function SectorMosaic({ slugs }) {
  const tiles = slugs.map((slug) => industryCatalog.find((i) => i.slug === slug)).filter(Boolean);
  return (
    <section className="sg sx-mosaic" aria-labelledby="sg-title">
      <div className="sg__inner">
        <div className="zb__head">
          <div>
            <span className="zb__eyebrow">Shop by industry</span>
            <h2 className="zb__title" id="sg-title">Find your range</h2>
            <p className="sg__sub">Pick the sector you work in.</p>
          </div>
          <Link to="/products#facet-industry" className="zb__all">
            All {industryCatalog.length} industries <IconArrowRight width="14" height="14" />
          </Link>
        </div>

        <Reveal className="sx-mosaic__grid reveal-stagger">
          {tiles.map((t) => (
            <Link to={`/products?industry=${t.slug}`} className={`sx-tile sx-tile--${t.slug}`} key={t.slug}>
              <img src={`/industries/${t.slug}.webp`} alt="" loading="lazy" decoding="async" style={{ objectPosition: FOCUS[t.slug] || 'center' }} />
              <span className="sx-tile__text">
                <strong>{t.label}</strong>
                {BLURB[t.slug] && <span>{BLURB[t.slug]}</span>}
              </span>
              <span className="sx-tile__go" aria-hidden="true"><IconArrowRight width="18" height="18" /></span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
