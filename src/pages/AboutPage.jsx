import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { IconArrowRight } from '../components/Icons.jsx';
import { brand } from '../data/brand.js';
import { aboutTitle, aboutLede, aboutHowWeWork, aboutValues, aboutFacts } from '../data/aboutContent.js';
import { usePageMeta } from '../lib/seo.js';
import { pageMeta } from '../data/pageMeta.js';

/**
 * About page - DDUROGA Safety, a 2019-established wholly owned Nigerian
 * subsidiary of the Mallcom group.
 *
 *   1. Story       editorial opening (Dribbble 26411724; the client chose it
 *                  in Oct 2026 over four other layouts): the statement beside
 *                  the story and four facts, then three columns: our story,
 *                  how we work, what you can hold us to. It replaced a dark
 *                  hero with a zone-photo mosaic, a facts band and a separate
 *                  "How we work" section.
 *   2. Values      three numbered cards, the full text behind column three.
 *   3. Visit us    address, contact lines and the map.
 *
 * Copy and facts live in data/aboutContent.js; every fact is from brand.js or
 * counted from the catalogue.
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
              <p className="ax-story__lede">{aboutLede}</p>
              <ul className="ax-story__facts" aria-label="DDUROGA at a glance">
                {aboutFacts.map((f, i) => (
                  <Reveal as="li" key={f.label} delay={i * 70}><strong>{f.value}</strong><span>{f.label}</span></Reveal>
                ))}
              </ul>
            </div>
          </div>
          <div className="ax-story__cols">
            <div>
              <h2>Our story</h2>
              <p>Established in {brand.establishedYear} in Lagos as the wholly owned Nigerian subsidiary of Mallcom. Mallcom manufactures; DDUROGA sells, with local stock and local pricing.</p>
            </div>
            <div>
              <h2>How we work</h2>
              <p>{aboutHowWeWork}</p>
              <Link to="/certifications" className="ax-link">See certifications <IconArrowRight width="14" height="14" /></Link>
            </div>
            <div>
              <h2>What you can hold us to</h2>
              <p>{aboutValues.map((v) => v.title).join(' · ')}.</p>
              <a href="#values" className="ax-link">Our values <IconArrowRight width="14" height="14" /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="ab-section ab-section--soft" id="values">
        <div className="ab-wrap">
          <span className="zb__eyebrow">Our values</span>
          <h2 className="ab-h2">What you can hold us to.</h2>
          <ol className="ab-values">
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

      <section className="ab-section">
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
        title="Kitting out a site?"
        text="Tell us the hazards, the roles and the volumes, and our team will put together certified options with the documentation your HSE team needs."
        ctaLabel="Request a quote"
        ctaTo="/contact"
      />
    </>
  );
}
