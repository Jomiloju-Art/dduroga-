import { Link } from 'react-router-dom';
import { allProducts, industryCatalog, zones } from '../data/products.js';
import CountUp from './CountUp.jsx';
import { IconArrowRight } from './Icons.jsx';

/**
 * The 524 / 17 / 4 range band.
 *
 * Lived as the second row of the certification band directly under the hero
 * until client feedback asked for it further down the page. It now sits above
 * the catalogues, so it introduces the range those PDFs actually contain.
 *
 * Every figure is counted off the live catalogue rather than asserted, so none
 * of it can drift or overstate. There are deliberately no order counts or
 * "X clients served" numbers — we do not hold those, and inventing them on a
 * band whose whole job is credibility would be self-defeating.
 */
const metrics = [
  { value: allProducts.length, label: 'Product lines in range' },
  { value: industryCatalog.length, label: 'Sectors supplied' },
  { value: zones.length, label: 'Protection zones' },
];

export default function RangeStats() {
  return (
    <section className="hp-stats" aria-labelledby="range-stats-heading">
      <div className="container">
        <h2 className="sr-only" id="range-stats-heading">Range at a glance</h2>

        <div className="hp-stats__inner">
          <dl className="hp-stats__metrics">
            {metrics.map((m) => (
              <div className="hp-stats__metric" key={m.label}>
                <dt>{m.label}</dt>
                <dd><CountUp to={m.value} /></dd>
              </div>
            ))}
          </dl>

          <Link className="hp-stats__link" to="/learning">
            What each mark means <IconArrowRight width="14" height="14" />
          </Link>
        </div>
      </div>
    </section>
  );
}
