import { Link, useParams, Navigate } from 'react-router-dom';
import { guideBySlug, guides } from '../data/guides.js';
import { IconArrowRight } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';

/**
 * A single learning guide. Editorial layout, Gymshark's grammar: uppercase
 * display title, 20px/500 section headings, 14px/400 body, a key-facts rail.
 */
export default function GuideDetailPage() {
  const { slug } = useParams();
  const guide = guideBySlug(slug);

  usePageMeta({
    title: guide ? `${guide.title} · Learning` : 'Guide',
    description: guide ? guide.summary : undefined,
    image: guide ? `/guides/${guide.slug}.jpg` : undefined,
  });

  if (!guide) return <Navigate to="/learning" replace />;

  const hero = `/guides/${guide.slug}.jpg`;
  const related = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <article className="guide">
      {/* Reading progress, driven by scroll in CSS (no JS). */}
      <span className="guide-progress" aria-hidden="true" />
      <header className="guide-header">
        <Link to="/learning" className="guide-back">
          <IconArrowRight width="14" height="14" style={{ transform: 'rotate(180deg)' }} />
          Learning centre
        </Link>
        <span className="guide-tag">{guide.tag}</span>
        <h1>{guide.title}</h1>
        <p className="guide-meta">{guide.date} · {guide.readMinutes} min read</p>
        <span className="guide-hero">
          <img src={hero} alt="" loading="lazy" />
        </span>
      </header>

      <div className="guide-layout">
        <div className="guide-copy">
          {guide.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}
          {/* Test methods, one block per standard; product pages link here
              as #tests-<id> (standardTests.js). */}
          {(guide.tests || []).map((t) => (
            <section key={t.id} id={`tests-${t.id}`} className="guide-tests">
              <h2>{t.title}</h2>
              <p className="guide-tests__intro">How Mallcom tests its products to this standard.</p>
              <ul>
                {t.items.map((it) => (
                  <li key={it.name}>
                    <h3>{it.name}</h3>
                    <p>{it.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="guide-facts">
          <h2>Key facts</h2>
          <ul>
            {guide.keyFacts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="guide-related">
        <h2>More guides</h2>
        <div className="guide-related__grid">
          {related.map((g) => (
            <Link to={`/learning/${g.slug}`} className="guide-related__card" key={g.slug}>
              <span className="guide-related__tag">{g.tag}</span>
              <strong>{g.title}</strong>
              <span className="guide-related__read">Read guide <IconArrowRight width="14" height="14" /></span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
