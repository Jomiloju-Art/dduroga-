import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import IndustryIcon from '../components/IndustryIcon.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { industryCatalog, byIndustry } from '../data/products.js';
import { guides } from '../data/guides.js';
import { IconArrowRight } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';

const faqs = [
  { q: 'What standards do you test against?', a: 'Our PPE is tested against the relevant EN, ISO, IS and ANSI standards for each product line. Product pages list the applicable standards and certificates are available on request.' },
  { q: 'Can I get custom branding or private-label products?', a: 'Yes. We support custom branding, colourways, packaging and private-label programmes on volume orders. Share your requirements via the quote form and we will scope it.' },
  { q: 'How do I get samples before ordering?', a: 'Request samples via the contact form and our specialists will arrange certified samples for evaluation before you commit to volume.' },
  { q: 'What are your lead times?', a: 'Stock lines typically dispatch within 2 working days. Volume and custom-made lines vary by specification; we confirm lead time with your quotation.' },
  { q: 'Do you supply larger corporate or distributed teams?', a: 'Yes. We support multi-site programmes with consolidated ordering, documentation and repeatable quality across sites.' },
];

export default function LearningPage() {
  usePageMeta({ title: 'Learning centre', description: 'Industry guides, standards explained and FAQs from DDUROGA Safety.' });

  return (
    <>
      {/* Header — Gymshark's title + count, no hero band. */}
      <header className="plp-header">
        <h1>Learning centre</h1>
        <p className="plp-header__count">
          {guides.length} guides · PPE standards and selection, explained in plain language
        </p>
      </header>

      {/* Guides */}
      <section className="plp" style={{ paddingTop: 40 }}>
        <div className="guide-grid">
          {guides.map((g, i) => (
            <Reveal as={Link} to={`/learning/${g.slug}`} className="guide-card" key={g.slug} delay={(i % 3) * 60}>
              <span className="guide-card__media">
                <img src={`/guides/${g.slug}.jpg`} alt="" loading="lazy" />
              </span>
              <span className="guide-card__info">
                <span className="guide-card__tag">{g.tag}</span>
                <strong className="guide-card__title">{g.title}</strong>
                <span className="guide-card__summary">{g.summary}</span>
                <span className="guide-card__read">{g.readMinutes} min read <IconArrowRight width="14" height="14" /></span>
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Industries */}
      <section className="hx-section hx-section--bleed">
        <div className="hx-bleed">
          <div className="hx-section__head hx-section__head--left">
            <h2>Solutions by industry</h2>
            <p>Jump to the certified range for your sector.</p>
          </div>
          <div className="hx-catgrid">
            {industryCatalog
              .filter((i) => byIndustry(i.slug).length > 0)
              .map((i, index) => {
                const count = byIndustry(i.slug).length;
                return (
                  <Reveal
                    as={Link}
                    to={`/products?industry=${i.slug}`}
                    className="hx-cat"
                    key={i.slug}
                    delay={(index % 4) * 60}
                    aria-label={`${i.label}, ${count} products`}
                  >
                    <span className="hx-cat__head">
                      <span className="hx-cat__icon"><IndustryIcon slug={i.slug} /></span>
                      <span className="hx-cat__label">{i.label}</span>
                    </span>
                    <span className="hx-cat__name">{count} products</span>
                    <span className="hx-cat__actions">
                      <span className="hx-cat__go">View range <IconArrowRight width="14" height="14" /></span>
                    </span>
                  </Reveal>
                );
              })}
          </div>
        </div>
      </section>

      {/* Consultation */}
      <CtaBand
        title="Speak with a PPE compliance expert"
        text="Bring us the hazard, the site conditions and your volumes. Our specialists will map the right standard and class to each role, and send the documentation your HSE team needs."
        ctaLabel="Talk to a specialist"
        ctaTo="/contact"
        showPhone={false}
      />

      {/* FAQ */}
      <section className="hx-section" id="faq">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="hx-section__head">
            <h2>Frequently asked questions</h2>
            <p>Quick answers to the questions we hear most.</p>
          </div>
          <div className="detail-accordions">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div className="acc-body"><p>{f.a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
