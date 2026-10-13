import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import CtaBand from '../components/CtaBand.jsx';
import { IconArrowRight } from '../components/Icons.jsx';
import { brand } from '../data/brand.js';
import { allProducts, zones } from '../data/products.js';
import { usePageMeta } from '../lib/seo.js';
import { pageMeta } from '../data/pageMeta.js';

/**
 * About page - DDUROGA Safety, a 2019-established wholly owned Nigerian
 * subsidiary of the Mallcom group.
 *
 *   1. Hero        dark band: the statement, the story, and a 2x2 mosaic of
 *                  the four protection zones (Mallcom's own product photos;
 *                  the stock photos of American crews that were here before
 *                  showed nothing we sell).
 *   2. Facts       four facts, all from brand.js or counted from the catalogue.
 *   3. How we work the maker-first paragraph and the marks the range carries.
 *   4. Values      three numbered cards.
 *   5. Visit us    address, contact lines and the map.
 */
const values = [
  {
    title: 'Fit for the hazard',
    text: 'We start from the risk on your site (cut, impact, chemical, heat, electric) and work back to the product, rather than supplying whatever is easiest to move.',
  },
  {
    title: 'Straight about standards',
    text: 'If a product is rated to a given level, that is what its documentation says. We do not put a stronger claim on a box than the test report supports.',
  },
  {
    title: 'Reachable when it matters',
    text: 'A phone line that answers, a WhatsApp number for quick replacements, and a warehouse you can visit in Lagos.',
  },
];

/** The marks that carry across the Mallcom-manufactured range. */
const marks = [
  { value: 'ISO 9001', label: 'Group manufacturing' },
  { value: 'CE', label: 'Product marking' },
  { value: 'EN / IS', label: 'Test standards' },
];

export default function AboutPage() {
  usePageMeta(pageMeta['/about']);

  const facts = [
    { value: brand.establishedYear, label: 'Established in Lagos' },
    { value: 'Mallcom', label: 'Wholly owned subsidiary' },
    { value: allProducts.length, label: 'Products in the range' },
    { value: zones.length, label: 'Protection zones, head to toe' },
  ];

  return (
    <>
      <section className="ab-hero">
        <div className="ab-hero__inner">
          <div className="ab-hero__copy">
            <span className="zb__eyebrow">About us</span>
            <h1 className="ab-hero__title">Certified protection for Nigerian workers, for the full shift.</h1>
            <p className="ab-hero__lede">
              We were established in {brand.establishedYear} as the wholly owned Nigerian subsidiary
              of Mallcom, an established manufacturer of personal protective equipment. Mallcom
              manufactures; DDUROGA sells — bringing that production to Nigerian industry with local
              stock, local pricing and a Lagos team your procurement and HSE people deal with
              directly.
            </p>
            <div className="ab-hero__actions">
              <Link to="/products" className="btn hx-btn">Browse the range <IconArrowRight width="16" height="16" /></Link>
              <Link to="/contact" className="ab-link">Talk to our team <IconArrowRight width="14" height="14" /></Link>
            </div>
          </div>
          <div className="ab-mosaic" aria-hidden="true">
            {zones.map((z, i) => (
              <span className={`ab-mosaic__tile ab-mosaic__tile--${i + 1}`} key={z.id}>
                <img src={`/zones/${z.id}.jpg`} alt="" loading={i < 2 ? 'eager' : 'lazy'} />
                <em>{z.label}</em>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-facts" aria-label="DDUROGA at a glance">
        <ul className="ab-facts__list">
          {facts.map((f, i) => (
            <Reveal as="li" key={f.label} delay={i * 70}>
              <strong>{f.value}</strong>
              <span>{f.label}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="ab-section">
        <div className="ab-wrap ab-split">
          <div>
            <span className="zb__eyebrow">How we work</span>
            <h2 className="ab-h2">Maker first, not arm&rsquo;s length.</h2>
          </div>
          <div className="ab-split__body">
            <p>
              The range is not assembled at arm&rsquo;s length from whoever has stock. Specification,
              testing and batch documentation all start with the maker rather than being reconciled
              after the fact.
            </p>
            <ul className="ab-marks" aria-label="Certification and marking">
              {marks.map((m) => (
                <li key={m.value}><strong>{m.value}</strong><span>{m.label}</span></li>
              ))}
            </ul>
            <Link to="/certifications" className="ab-link">See certifications <IconArrowRight width="14" height="14" /></Link>
          </div>
        </div>
      </section>

      <section className="ab-section ab-section--soft">
        <div className="ab-wrap">
          <span className="zb__eyebrow">Our values</span>
          <h2 className="ab-h2">What you can hold us to.</h2>
          <ol className="ab-values">
            {values.map((v, i) => (
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
