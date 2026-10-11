import { Link } from 'react-router-dom';
import { IconArrowRight } from './Icons.jsx';

/**
 * Protection-zone card: head / hand / body / feet on the home page.
 *
 * Overlay treatment, not a captioned thumbnail. The zone photo fills the tile
 * edge to edge, a dark scrim rises from the bottom so white type stays legible
 * over any photo, and the label sits ON the image — the pattern Apple, IKEA and
 * Mallcom all use. A circular arrow (the affordance Mallcom and IKEA share)
 * carries the call to action.
 *
 * Deliberately NOT the earlier magnetic/sheen build: no modern reference hides
 * information behind hover, and hover does not exist on touch, where much of
 * this site's traffic lands. Everything here reads at rest.
 *
 * Static markup, one link, no state. The count is in the aria-label as well as
 * on screen, so nothing is lost to assistive tech.
 */
export default function ZoneCard({ id, label, count }) {
  return (
    <Link
      to={`/products?cat=${id}`}
      className="zc"
      aria-label={`${label}, ${count} products`}
    >
      <img
        className="zc__img"
        src={`/zones/${id}.jpg`}
        alt=""
        width="600"
        height="600"
        loading="lazy"
        decoding="async"
      />
      <span className="zc__scrim" aria-hidden="true" />
      <span className="zc__body">
        <span className="zc__text">
          <span className="zc__count">{count} products</span>
          <span className="zc__name">{label}</span>
        </span>
        <span className="zc__go" aria-hidden="true"><IconArrowRight /></span>
      </span>
    </Link>
  );
}
