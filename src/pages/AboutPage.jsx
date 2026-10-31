import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { IconArrowRight } from '../components/Icons.jsx';
import { brand } from '../data/brand.js';
import { aboutTitle, aboutLede, aboutColumns, aboutStrengths, aboutValues } from '../data/aboutContent.js';
import { usePageMeta } from '../lib/seo.js';
import { pageMeta } from '../data/pageMeta.js';

/**
 * About page - DDUROGA Safety, Mallcom India's sole authorized distributor in
 * West Africa and the owner of the Bragoxd brand.
 *
 *   1. Story       editorial opening (Dribbble 26411724; the client chose it
 *                  in Oct 2026 over four other layouts): the statement beside
 *                  the story and four facts, then three columns: Mallcom,
 *                  Bragoxd, our mission. It replaced a dark hero with a
 *                  zone-photo mosaic, a facts band and a separate "How we
 *                  work" section.
 *   2. Apart       what sets us apart, five numbered cards.
 *   3. Values      four numbered cards.
 *   4. Visit us    address, contact lines and the map.
 *   5. Work with us   the closing quote band.
 *
 * Copy and facts live in data/aboutContent.js (the client's own write-up).
 */
export default function AboutPage() {
  usePageMeta(pageMeta['/about']);

  return (
    <>
      <section className="ax ax-story">
        <div className="ax-wrap">
          <div className="ax-story__top">
            <div>
              <span className="zb__eyebrow">About us</span>
              <h1 className="ax-story__title">{aboutTitle}</h1>
              <div className="ax-actions">
                <Link to="/products" className="btn hx-btn">Browse the range <IconArrowRight width="16" height="16" /></Link>
                <Link to="/contact" className="ax-link">Talk to our team <IconArrowRight width="14" height="14" /></Link>
              </div>
            </div>
            <div className="ax-story__body">
              {aboutLede.map((p) => <p className="ax-story__lede" key={p.slice(0, 24)}>{p}</p>)}
            </div>
          </div>
          {/* The page's main picture (client's photo, Oct 2026). No caption: it
              shows PPE on display in general, not a particular showroom. */}
          <img className="ax-photo" src="/about/team.jpg" alt="Two staff in hi-vis vests in front of helmets, gloves, coveralls and safety boots" decoding="async" width="1600" height="800" />
          <div className="ax-story__cols">
            {aboutColumns.map((c) => (
              <div key={c.title}>
                <h2>{c.title}</h2>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-section ab-section--soft">
        <div className="ab-wrap">
          <span className="zb__eyebrow">Why DDUROGA</span>
          <h2 className="ab-h2">What sets us apart.</h2>
          <ol className="ab-values">
            {aboutStrengths.map((v, i) => (
              <Reveal as="li" className="ab-value" key={v.title} delay={i * 80}>
                <span className="ab-value__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="ab-value__title">{v.title}</h3>
                <p>{v.text}</p>
              </Reveal>
            ))}
          </ol>
          <Link to="/certifications" className="ab-link">See certifications <IconArrowRight width="14" height="14" /></Link>
        </div>
      </section>

      <section className="ab-section" id="values">
        <div className="ab-wrap">
          <span className="zb__eyebrow">Our values</span>
          <h2 className="ab-h2">What you can hold us to.</h2>
          <ol className="ab-values ab-values--four">
            {aboutValues.map((v, i) => (
              <Reveal as="li" className="ab-value" key={v.title} delay={i * 80}>
                <span className="ab-value__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="ab-value__title">{v.title}</h3>
                <p>{v.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="ab-section ab-section--soft">
        <div className="ab-wrap ab-visit">
          <div className="ab-visit__copy">
            <span className="zb__eyebrow">Visit us</span>
            <h2 className="ab-h2">Warehouse and trade counter, Lagos.</h2>
            <dl className="ab-visit__list">
              <dt>Address</dt><dd>{brand.address}</dd>
              <dt>Phone</dt><dd><a href={brand.phoneHref}>{brand.phone}</a></dd>
              <dt>Email</dt><dd><a href={brand.emailHref}>{brand.email}</a></dd>
              <dt>Hours</dt><dd>{brand.hours}</dd>
            </dl>
            <a
              className="ab-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`}
              target="_blank"
              rel="noreferrer"
            >
              Get directions <IconArrowRight width="14" height="14" />
            </a>
          </div>
          <Reveal className="ab-visit__map">
            <iframe
              className="about-map"
              title={`Map showing ${brand.name} at ${brand.address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(brand.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Work with us"
        text="Whether you are equipping a single site or running a multi-year supply contract, our team is ready to help. Request a quote or speak to our team today."
        ctaLabel="Request a quote"
        ctaTo="/contact"
      />
    </>
  );
}
