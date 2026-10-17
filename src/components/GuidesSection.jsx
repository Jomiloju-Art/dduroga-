import { useState } from 'react';
import { Link } from 'react-router-dom';
import { guides } from '../data/guides.js';
import { IconArrowRight } from './Icons.jsx';

/**
 * The homepage's learning section: "Safety insights" with topic tabs over
 * three guide cards (after Sonas's "Industry insights" on Dribbble; the
 * client chose it in Oct 2026 over a resources centre, a bento, a spotlight
 * and a hub, and it replaced a featured-story layout).
 *
 * Topics come from the guides themselves, so a guide with a new tag adds a
 * tab. "All" shows the newest three; a topic shows up to three of its own.
 */
const topics = [...new Set(guides.map((g) => g.tag))];

export default function GuidesSection() {
  const [topic, setTopic] = useState('');
  const shown = (topic ? guides.filter((g) => g.tag === topic) : guides).slice(0, 3);
  if (!guides.length) return null;
  return (
    <section className="lx lx-tabs" aria-labelledby="gx-title">
      <div className="zb__inner">
        <div className="lx-tabs__head">
          <span className="zb__eyebrow">Learning centre</span>
          <h2 className="zb__title" id="gx-title">Safety <span className="lx-accent">insights</span></h2>
          <p className="sg__sub">Short guides to the marks printed on gloves, boots, helmets and hi-vis.</p>
          <div className="lx-chips" role="group" aria-label="Filter guides by topic">
            {['', ...topics].map((t) => (
              <button key={t || 'all'} type="button" className="lx-chip" aria-pressed={topic === t} onClick={() => setTopic(t)}>
                {t || 'All'}
              </button>
            ))}
          </div>
        </div>
        {/* Keyed by topic so the cards replay their entrance on change. */}
        <div className="lx-tabs__grid" key={topic}>
          {shown.map((g) => (
            <Link to={`/learning/${g.slug}`} className="lx-card" key={g.slug}>
              <span className="lx-card__img"><img src={`/guides/${g.slug}.jpg`} alt="" loading="lazy" decoding="async" /></span>
              <span className="lx-card__tag">{g.tag}</span>
              <strong className="lx-card__title">{g.title}</strong>
              <span className="lx-card__foot">
                {g.date} · {g.readMinutes} min read
                <span className="lx-card__go">Read <IconArrowRight width="14" height="14" /></span>
              </span>
            </Link>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">{topic ? `${shown.length} ${shown.length === 1 ? 'guide' : 'guides'} on ${topic}` : ''}</p>
        <div className="lx-center">
          <Link to="/learning" className="lx-btn">All {guides.length} guides <IconArrowRight width="15" height="15" /></Link>
        </div>
      </div>
    </section>
  );
}
