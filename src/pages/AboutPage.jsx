import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal.jsx';
import { IconArrowRight } from '../components/Icons.jsx';
import { brand } from '../data/brand.js';
import { usePageMeta } from '../lib/seo.js';

/**
 * About page - DDUROGA Safety, a 2019-established wholly owned Nigerian
 * subsidiary of the Mallcom group.
 *
 * Mirrors gymshark.com/pages/about-us: three image-text blocks, a 1188px column
 * of two 554px halves with an 80px gutter, 120px 56px block padding, 80px
 * between blocks, every heading flattened to 20px/500. Block order and media
 * side match theirs:
 *
 *   1. About us      - copy left,  image right  (their "reverse" row)
 *   2. Our values    - image left, copy right
 *   3. Get in touch  - copy left,  map right    (their reverse row; the map is
 *                      DDUROGA's own, since the warehouse is a physical counter)
 *
 * The media in each block animates like theirs: it sits translateY(21rem) and
 * fades in over 1s as it scrolls into view.
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
  usePageMeta({
    title: 'About us',
    description:
      'DDUROGA Safety is a Nigerian PPE supplier and the wholly owned Nigerian subsidiary of Mallcom, supplying certified protection to industry nationwide from our Lagos warehouse.',
  });

  return (
    <>
      {/* Block 1 - about us. Copy left, image right. */}
      <section className="about-block">
        <div className="about-block__grid">
          <div>
            <div className="section-head">
              <h2>About us</h2>
            </div>
            <p>
              DDUROGA Safety exists to put certified protective equipment on Nigerian workers, and to
              keep it on them for the full shift.
            </p>
            <p>
              We were established in {brand.establishedYear} as the wholly owned Nigerian subsidiary
              of Mallcom, an established manufacturer of personal protective equipment. Mallcom
              manufactures; DDUROGA sells — bringing that production to Nigerian industry with local
              stock, local pricing and a Lagos team your procurement and HSE people deal with
              directly.
            </p>
            <p>
              The range is not assembled at arm&rsquo;s length from whoever has stock. Specification,
              testing and batch documentation all start with the maker rather than being reconciled
              after the fact.
            </p>
            <p>Certification and marking:</p>
            <ul className="about-lead-list">
              {marks.map((m) => (
                <li key={m.value}>
                  <strong>{m.value}</strong> - {m.label}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Reveal className="about-media">
              <span className="about-block__media">
                <img src="/about/about-1.jpg" alt="" loading="lazy" />
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Block 2 - our values. Image left, copy right. */}
      <section className="about-block">
        <div className="about-block__grid about-block__grid--reverse">
          <div>
            <div className="section-head">
              <h2>Our values</h2>
            </div>
            <div className="about-list">
              {values.map((v) => (
                <div className="about-list__item" key={v.title}>
                  <h4>{v.title.toUpperCase()}.</h4>
                  <p>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Reveal className="about-media">
              <span className="about-block__media">
                <img src="/about/about-2.jpg" alt="" loading="lazy" />
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Block 3 - get in touch. Copy left, map right. */}
      <section className="about-block">
        <div className="about-block__grid">
          <div>
            <div className="section-head">
              <h2>Get in touch</h2>
            </div>
            <p>
              For sales and quotation enquiries, <Link to="/contact">contact us</Link> or email the
              team at <a href={`mailto:${brand.email}`}>{brand.email}</a>.
            </p>
            <p>Visit our warehouse and trade counter: {brand.address}.</p>
          </div>
          <div>
            <Reveal className="about-media">
              <div className="about-map-wrap">
                <iframe
                  className="about-map"
                  title={`Map showing ${brand.name} at ${brand.address}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(brand.address)}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  className="about-map-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions <IconArrowRight width="14" height="14" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
