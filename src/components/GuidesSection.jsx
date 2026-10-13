import { Link } from 'react-router-dom';
import { homeResources } from '../data/homeContent.js';
import { IconArrowRight } from './Icons.jsx';
import Reveal from './Reveal.jsx';

/**
 * "Guides & insights": the homepage's editorial block.
 *
 * Magazine layout: the newest guide as a full-bleed featured story (photo,
 * gradient, tag, title, summary, read time), then the next three as compact
 * rows beside it. The guides carry a summary and a reading time, which the old
 * three plain cards never showed. Heading matches the other homepage sections
 * (eyebrow, display title, "all" link on the right).
 */
export default function GuidesSection() {
  const [feature, ...rest] = homeResources;
  if (!feature) return null;
  return (
    <section className="gx" aria-labelledby="gx-title">
      <div className="gx__inner">
        <div className="zb__head">
          <div>
            <span className="zb__eyebrow">Learning centre</span>
            <h2 className="zb__title" id="gx-title">Guides &amp; insights</h2>
            <p className="sg__sub">Choosing the right protection, explained in plain language.</p>
          </div>
          <Link to="/learning" className="zb__all">All guides <IconArrowRight width="14" height="14" /></Link>
        </div>

        <Reveal className="gx__grid reveal-stagger">
          <Link to={`/learning/${feature.slug}`} className="gx-feature">
            <img className="gx-feature__img" src={feature.image} alt="" loading="lazy" decoding="async" />
            <span className="gx-feature__shade" aria-hidden="true" />
            <span className="gx-feature__body">
              <span className="gx-tag gx-tag--light">{feature.type}</span>
              <h3 className="gx-feature__title">{feature.title}</h3>
              {feature.summary && <p className="gx-feature__summary">{feature.summary}</p>}
              <span className="gx-feature__foot">
                <span className="gx-btn">Read the guide <IconArrowRight width="14" height="14" /></span>
                <span className="gx-meta gx-meta--light">{feature.date}{feature.readMinutes ? ` · ${feature.readMinutes} min read` : ''}</span>
              </span>
            </span>
          </Link>

          <ul className="gx-list">
            {rest.map((r) => (
              <li key={r.slug}>
                <Link to={`/learning/${r.slug}`} className="gx-row">
                  <span className="gx-row__media"><img src={r.image} alt="" loading="lazy" decoding="async" /></span>
                  <span className="gx-row__body">
                    <span className="gx-tag">{r.type}</span>
                    <h3 className="gx-row__title">{r.title}</h3>
                    <span className="gx-meta">{r.date}{r.readMinutes ? ` · ${r.readMinutes} min read` : ''}</span>
                  </span>
                  <span className="gx-row__arrow" aria-hidden="true"><IconArrowRight width="18" height="18" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
