import { Link } from 'react-router-dom';
import { byIndustry, byFeatured, industryCatalog, rangeLabel } from '../data/products.js';
import { IconArrowRight } from './Icons.jsx';
import IndustryIcon from './IndustryIcon.jsx';
import Reveal from './Reveal.jsx';

/**
 * "Find your range": the homepage's shop-by-industry grid.
 *
 * Each card shows what the sector actually buys, not just its name: the three
 * product types it stocks most, and a strip of three real product photos.
 * Everything comes from the catalogue data, so a card can never promise a
 * product we do not list.
 *
 * Photos: one product from each of the sector's biggest types, in featured
 * order. Construction, oil & gas and logistics all lead with safety shoes, so
 * types an earlier card already showed are skipped where the sector has
 * others; the six strips then read as six different sectors.
 */
const PHOTOS = 3;

function buildCards(slugs) {
  const used = new Set();
  return slugs.map((slug) => {
    const info = industryCatalog.find((i) => i.slug === slug);
    if (!info) return null;
    const products = byIndustry(slug);
    const groups = new Map();
    for (const p of [...products].sort(byFeatured)) {
      if (!p.img || !p.range) continue;
      if (!groups.has(p.range)) groups.set(p.range, []);
      groups.get(p.range).push(p);
    }
    const ranked = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
    const types = ranked.slice(0, 3).map(([, list]) => rangeLabel(list[0]));
    // Prefer types no earlier card has shown, then fall back to the rest.
    const order = [...ranked.filter(([id]) => !used.has(id)), ...ranked.filter(([id]) => used.has(id))];
    const photos = order.slice(0, PHOTOS).map(([id, list]) => { used.add(id); return list[0]; });
    return { slug, label: info.label, count: products.length, types, photos };
  }).filter(Boolean);
}

export default function SectorGrid({ slugs }) {
  const cards = buildCards(slugs);
  return (
    <section className="sg" aria-labelledby="sg-title">
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

        <Reveal className="sg__grid reveal-stagger">
          {cards.map((c) => (
            <Link to={`/products?industry=${c.slug}`} className="sg-card" key={c.slug}>
              <span className="sg-card__photos" aria-hidden="true">
                {c.photos.map((p) => <img key={p.slug} src={p.img} alt="" loading="lazy" decoding="async" />)}
              </span>
              <span className="sg-card__body">
                <span className="sg-card__top">
                  <span className="sg-card__icon"><IndustryIcon slug={c.slug} /></span>
                  <span className="sg-card__count">{c.count} products</span>
                </span>
                <strong className="sg-card__label">{c.label}</strong>
                <span className="sg-card__types">{c.types.join(' · ')}</span>
                <span className="sg-card__cta">Shop the range <IconArrowRight width="14" height="14" /></span>
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
