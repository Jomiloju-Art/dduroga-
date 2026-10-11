import { Link } from 'react-router-dom';
import { IconChevronRight } from './Icons.jsx';

/**
 * Dark banded header for inner pages.
 * `cta`      = { to, label }            - primary action in the hero
 * `marks`    = [{ value, label }]       - full-width credential strip
 * `image`    = url                      - real photography behind a dark scrim
 * `showcase` = [{ slug, img, title }]   - real product imagery filling the right half
 * `below`    = node                     - rendered directly under the subheadline
 */
export default function PageHero({ eyebrow, title, lead, crumb, cta, marks, image, showcase, below }) {
  const body = (
    <div>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <IconChevronRight width="14" height="14" />
        <span style={{ color: '#fff' }}>{crumb ?? title}</span>
      </nav>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {lead && <p>{lead}</p>}
      {below}
      {cta && (
        <Link to={cta.to} className="btn btn--gold page-hero__cta">
          {cta.label}
        </Link>
      )}
    </div>
  );

  return (
    <section
      className={`page-hero${image ? ' page-hero--image' : ''}`}
      style={image ? { '--page-hero-image': `url(${image})` } : undefined}
    >
      <div className="container">
        {showcase && showcase.length ? (
          <div className="page-hero__top">
            <div>{body}</div>
            <div className="page-hero__showcase">
              {showcase.map((p) => (
                <Link to={`/products/${p.slug}`} key={p.slug} aria-label={p.title}>
                  <img src={p.img} alt="" loading="lazy" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          body
        )}
        {marks && marks.length ? (
          <div className="page-hero__marks">
            {marks.map((m) => (
              <div className="page-hero__mark" key={m.label}>
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
