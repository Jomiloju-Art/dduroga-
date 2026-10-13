import { Link } from 'react-router-dom';
import {
  homeIndustries,
} from '../data/homeContent.js';
import { IconArrowRight, IconCheck } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';
import { pageMeta } from '../data/pageMeta.js';
import Reveal from '../components/Reveal.jsx';
import TrustBand from '../components/TrustBand.jsx';
import TrendingShowcase from '../components/TrendingShowcase.jsx';
import RangeStats from '../components/RangeStats.jsx';
import ClientLogos from '../components/ClientLogos.jsx';
import ZoneBento from '../components/ZoneBento.jsx';
import SectorGrid from '../components/SectorGrid.jsx';
import GuidesSection from '../components/GuidesSection.jsx';
import { catalogues } from '../data/catalogues.generated.js';
import { zones, productsByZone } from '../data/products.js';

/** "147 pages · PDF · 24.9 MB", from src/data/catalogues.generated.js. */
const catalogueMeta = (c) => `${c.pages} pages · PDF · ${(c.bytes / 1024 / 1024).toFixed(1)} MB`;

/** What ships with an order — replaces repeating the badge set a second time. */
const documentation = [
  'Declarations of conformity on request',
  'Test reports on request',
  'Specification sheets for tenders',
  'Custom branding and private label',
];

export default function HomePage() {
  usePageMeta(pageMeta['/']);

  return (
    <>
      {/* ================= 1. HERO ================= */}
      <section className="hx-hero hx-hero--under-header hx-hero--blend" aria-label="DDUROGA Safety">
        {/* The photo has a "head-to-toe protection" HUD graphic baked into its top
            edge, right where the transparent header sits. This blurred shade
            hides it and keeps the white menu readable. */}
        <div className="hx-hero__topshade" aria-hidden="true" />
        <div className="hx-hero__inner">
          <div className="hx-hero__lockup">
            <h1 className="hx-hero__tagline">Certified Industrial PPE &amp; Safety Equipment Supplied Across Nigeria</h1>
            <p className="hx-hero__lead">
              Head-to-toe protection for oil &amp; gas, construction, manufacturing and ports, stocked in Lagos, delivered nationwide.
            </p>
            <div className="hx-hero__actions">
              <Link to="/products" className="btn hx-btn hx-hero__primary">
                Browse products <IconArrowRight width="16" height="16" />
              </Link>
              <a href={catalogues.full.file} target="_blank" rel="noopener" className="hx-hero__cta">
                2025 catalogue (PDF) <IconArrowRight width="14" height="14" />
              </a>
            </div>
          </div>
        </div>
        {/* Fades the hero's bottom edge into the white band below, so the dark
            photo and the light section read as one surface rather than two
            stacked blocks with a hard seam. */}
        <div className="hx-hero__blend" aria-hidden="true" />
      </section>

      {/* ================= 2. TRUST BAND ================= */}
      <TrustBand />

      {/* ================= 3. PROTECTION ZONES (bento, from the homepage concept) ================= */}
      <ZoneBento />

      {/* ================= 4. TRENDING (client-picked, see data/trending.js) ================= */}
      <TrendingShowcase />

      {/* ================= 5. FIND YOUR RANGE =================
          Browse by industry (SectorGrid.jsx). The "By hazard" chips that used to follow were
          removed at the client's request (Oct 2026); hazards remain a filter
          on the catalogue page. */}
      <SectorGrid slugs={homeIndustries} />

      {/* ================= 7. COMPLIANCE ================= */}
      <section className="hp-compliance">
        <div className="hx-bleed hp-compliance__inner">
          <div>
            <h2>Are you compliant?</h2>
            <p>
              Ask for the standards documentation your auditors need with your order. Learn what
              each mark means and how to specify it correctly.
            </p>
          </div>
          <div>
            {/* The four certification badges were repeated here from the trust
                band directly under the hero. Rather than print the same four
                marks twice, this lists the documents buyers can ask for. Nothing here promises
                more than "on request" until the client confirms what ships as standard. */}
            <ul className="hp-ships">
              {documentation.map((d) => (
                <li key={d}>
                  <IconCheck width="17" height="17" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <Link to="/learning" className="hx-btn">
              Visit the Learning Centre <IconArrowRight width="14" height="14" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 8. PROMO / WHERE TO BUY ================= */}
      <section className="hx-section hx-section--bleed">
        <div className="hx-bleed">
          <div className="hx-promo">
            <Link to="/products" className="hx-promo__card hx-promo__card--accent">
              <span className="hx-promo__eyebrow">Full range</span>
              <h3>Browse the complete catalogue</h3>
              <span className="hx-promo__link">Browse products <IconArrowRight width="14" height="14" /></span>
            </Link>
            <Link to="/contact" className="hx-promo__card">
              <span className="hx-promo__eyebrow">Where to buy</span>
              <h3>Set up a supply programme for your sites</h3>
              <span className="hx-promo__link">Get in touch <IconArrowRight width="14" height="14" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 9. RANGE STATS =================
          The 524 / 17 / 4 band. Was the second row of the certification band
          under the hero; moved here on client feedback. Sits directly above the
          catalogues so the counts introduce the PDFs below. */}
      <RangeStats />

      {/* ================= 10. CATALOGUE =================
          One download: Mallcom's 2025 catalogue, the source every product page
          on this site is built from. It replaced the mini catalogue and the
          2022 collection (Oct 2026). The PDF is the catalogue as printed, with
          its photos recompressed for the web (97 MB to 24.9 MB); text and
          layout are untouched, so it stays searchable. "View online" opens it
          in the browser's own viewer, which is kinder than a 25 MB download on
          a phone. */}
      <section className="hx-section hx-section--bleed" id="catalogues">
        <div className="hx-bleed">
          <Reveal className="hx-section__head hx-section__head--left">
            <h2>Catalogue</h2>
            <p>The full 2025 range, with the sizes, colours and standards each product is tested to.</p>
          </Reveal>

          <div className="cat-grid cat-grid--single">
            <article className="cat-card cat-card--feature">
              <a className="cat-card__cover" href={catalogues.full.file} target="_blank" rel="noopener" aria-label="View the 2025 catalogue online">
                <img src={catalogues.full.cover} alt="" loading="lazy" decoding="async" />
              </a>
              <div className="cat-card__body">
                <span className="cat-card__eyebrow">Product catalogue · 2025</span>
                <h3 className="cat-card__title">The complete collection</h3>
                <p className="cat-card__desc">
                  Every glove, boot, helmet and garment in the range, with the sizes, colours and
                  standards each is tested to.
                </p>
                <span className="cat-card__meta">{catalogueMeta(catalogues.full)}</span>
                <div className="cat-card__actions">
                  <a className="hx-btn" href={catalogues.full.file} target="_blank" rel="noopener">
                    View online <IconArrowRight width="14" height="14" />
                  </a>
                  <a className="cat-card__cta" href={catalogues.full.file} download="DDUROGA-Catalogue-2025.pdf">
                    Download PDF
                  </a>
                </div>
              </div>
              <ul className="cat-card__zones" aria-label="Inside the catalogue">
                {zones.map((z) => (
                  <li key={z.id}>
                    <Link to={`/products?cat=${z.id}`}>
                      <span>{z.label}</span>
                      <strong>{productsByZone(z.id).length}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ================= 11. CLIENTS =================
          The client logo strip sits near the end, after the catalogues and before
          the guides: proof is read just before a visitor decides to get in touch,
          and the top of the page goes straight from the accreditation marks to
          the products. Self-hides until src/data/clients.js has entries. */}
      <ClientLogos />

      {/* ================= 12. GUIDES & INSIGHTS (GuidesSection.jsx) ================= */}
      <GuidesSection />
    </>
  );
}
