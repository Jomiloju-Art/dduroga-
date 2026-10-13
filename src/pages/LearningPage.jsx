import { Link, useSearchParams } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import CtaBand from '../components/CtaBand.jsx';
import StandardsSearch from '../components/StandardsSearch.jsx';
import { guides } from '../data/guides.js';
import { standards, standardHref, zoneLabels } from '../data/standards.js';
import { IconArrowRight } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';

const faqs = [
  { q: 'What standards do you test against?', a: 'Our PPE is tested against the relevant EN, ISO, IS and ANSI standards for each product line. Product pages list the applicable standards and certificates are available on request.' },
  { q: 'Can I get custom branding or private-label products?', a: 'Yes. We support custom branding, colourways, packaging and private-label programmes on volume orders. Share your requirements via the quote form and we will scope it.' },
  { q: 'How do I get samples before ordering?', a: 'Request samples via the contact form and our specialists will arrange certified samples for evaluation before you commit to volume.' },
  { q: 'What are your lead times?', a: 'Lead time depends on the product line, the quantity and any customisation. We confirm it in writing with your quotation.' },
  { q: 'Do you supply larger corporate or distributed teams?', a: 'Yes. We support multi-site programmes with consolidated ordering, documentation and repeatable quality across sites.' },
];

/** Topics come from the guides themselves, so a new guide with a new tag adds a chip. */
const topics = [...new Set(guides.map((g) => g.tag))];
const topicSlug = (t) => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ZONES = ['head', 'hand', 'body', 'feet'];

function GuideMeta({ g }) {
  return <span className="lc-meta">{g.date} · {g.readMinutes} min read</span>;
}

export default function LearningPage() {
  usePageMeta({ title: 'Learning centre', description: 'Industry guides, standards explained and FAQs from DDUROGA Safety.' });

  const [params, setParams] = useSearchParams();
  const active = topics.find((t) => topicSlug(t) === params.get('topic')) || null;
  const pickTopic = (t) => {
    const next = new URLSearchParams(params);
    if (t) next.set('topic', topicSlug(t)); else next.delete('topic');
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const shown = active ? guides.filter((g) => g.tag === active) : guides;
  const [lead, ...rest] = shown;

  return (
    <>
      {/* Hero: what this page is for, plus the standards lookup as the first action. */}
      <section className="lc-hero">
        <div className="lc-hero__inner">
          <div className="lc-hero__copy">
            <span className="zb__eyebrow">Learning centre</span>
            <h1 className="lc-hero__title">PPE standards, explained in plain language.</h1>
            <p className="lc-hero__lede">
              Short guides to the marks printed on gloves, boots, helmets and hi‑vis: what each level
              measures, and how to pick the right one for your site.
            </p>
            <ul className="lc-hero__stats" aria-label="In the learning centre">
              <li><strong>{guides.length}</strong> guides</li>
              <li><strong>{standards.length}</strong> standards indexed</li>
              <li><strong>{faqs.length}</strong> buyer FAQs</li>
            </ul>
          </div>
          <div className="lc-hero__search">
            <h2 className="lc-hero__search-title">Look up a standard</h2>
            <StandardsSearch limit={4} />
          </div>
        </div>
      </section>

      {/* Guides, filterable by topic. */}
      <section className="lc-guides" aria-labelledby="lc-guides-title">
        <div className="lc-wrap">
          <div className="lc-head">
            <h2 id="lc-guides-title" className="lc-head__title">Guides</h2>
            <div className="lc-topics" role="group" aria-label="Filter guides by topic">
              <button type="button" className={`lc-topic ${!active ? 'is-active' : ''}`} aria-pressed={!active} onClick={() => pickTopic(null)}>
                All <span className="lc-topic__n">{guides.length}</span>
              </button>
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`lc-topic ${active === t ? 'is-active' : ''}`}
                  aria-pressed={active === t}
                  onClick={() => pickTopic(active === t ? null : t)}
                >
                  {t} <span className="lc-topic__n">{guides.filter((g) => g.tag === t).length}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {active ? `${shown.length} ${shown.length === 1 ? 'guide' : 'guides'} on ${active}` : `All ${guides.length} guides`}
          </p>

          {lead && (
            <Link to={`/learning/${lead.slug}`} className="lc-lead" key={lead.slug}>
              <span className="lc-lead__media">
                <img src={`/guides/${lead.slug}.jpg`} alt="" />
              </span>
              <span className="lc-lead__body">
                <span className="lc-tag">{lead.tag}</span>
                <strong className="lc-lead__title">{lead.title}</strong>
                <span className="lc-lead__summary">{lead.summary}</span>
                {lead.keyFacts?.length > 0 && (
                  <span className="lc-lead__facts">
                    {lead.keyFacts.slice(0, 3).map((f) => <span key={f}>{f}</span>)}
                  </span>
                )}
                <span className="lc-lead__foot">
                  <span className="lc-btn">Read the guide <IconArrowRight width="16" height="16" /></span>
                  <GuideMeta g={lead} />
                </span>
              </span>
            </Link>
          )}

          {rest.length > 0 && (
            <div className="lc-grid">
              {rest.map((g, i) => (
                <Reveal as={Link} to={`/learning/${g.slug}`} className="lc-card" key={g.slug} delay={(i % 3) * 60}>
                  <span className="lc-card__media">
                    <img src={`/guides/${g.slug}.jpg`} alt="" loading="lazy" />
                  </span>
                  <span className="lc-card__body">
                    <span className="lc-tag">{g.tag}</span>
                    <strong className="lc-card__title">{g.title}</strong>
                    <span className="lc-card__summary">{g.summary}</span>
                    <span className="lc-card__foot">
                      <GuideMeta g={g} />
                      <span className="lc-card__arrow" aria-hidden="true"><IconArrowRight width="16" height="16" /></span>
                    </span>
                  </span>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Every indexed standard, grouped by the body part it protects. */}
      <section className="lc-std" aria-labelledby="lc-std-title">
        <div className="lc-wrap">
          <div className="lc-head lc-head--stack">
            <span className="zb__eyebrow">Reference</span>
            <h2 id="lc-std-title" className="lc-head__title">Standards at a glance</h2>
            <p className="lc-head__sub">
              What each mark on the label covers. Pick one to see the products in that range.
              Certificates for a specific product are available on request.
            </p>
          </div>
          <div className="lc-std__cols">
            {ZONES.map((z) => {
              const list = standards.filter((s) => s.zone === z);
              if (!list.length) return null;
              return (
                <div className="lc-std__col" key={z}>
                  <h3 className="lc-std__zone">{zoneLabels[z]} <span>{list.length}</span></h3>
                  <ul>
                    {list.map((s) => (
                      <li key={s.code}>
                        <Link to={standardHref(s)} className="lc-std__row">
                          <span className="lc-std__code">{s.code}</span>
                          <span className="lc-std__title">{s.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ: heading and a way out on the left, answers on the right. */}
      <section className="lc-faq" id="faq" aria-labelledby="lc-faq-title">
        <div className="lc-wrap lc-faq__grid">
          <div className="lc-faq__intro">
            <span className="zb__eyebrow">FAQ</span>
            <h2 id="lc-faq-title" className="lc-head__title">Questions buyers ask us</h2>
            <p className="lc-head__sub">Can&rsquo;t find your answer? Our team replies with the documents your HSE team needs.</p>
            <Link to="/contact" className="zb__all">Ask a specialist <IconArrowRight width="14" height="14" /></Link>
          </div>
          <div className="detail-accordions lc-faq__list">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div className="acc-body"><p>{f.a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Speak with a PPE compliance expert"
        text="Bring us the hazard, the site conditions and your volumes. Our specialists will map the right standard and class to each role, and send the documentation your HSE team needs."
        ctaLabel="Talk to a specialist"
        ctaTo="/contact"
        showPhone={false}
      />
    </>
  );
}
