import { Link } from 'react-router-dom';
import {
  homeIndustries,
} from '../data/homeContent.js';
import { IconArrowRight, IconCheck } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';
import { pageMeta } from '../data/pageMeta.js';
import TrustBand from '../components/TrustBand.jsx';
import TrendingShowcase from '../components/TrendingShowcase.jsx';
import ClientLogos from '../components/ClientLogos.jsx';
import ZoneBento from '../components/ZoneBento.jsx';
import SectorGrid from '../components/SectorGrid.jsx';
import GuidesSection from '../components/GuidesSection.jsx';
import OrderSteps from '../components/OrderSteps.jsx';
import { catalogues } from '../data/catalogues.generated.js';
import { zones, productsByZone, allProducts, industryCatalog } from '../data/products.js';

/** "147 pages · PDF · 24.9 MB", from src/data/catalogues.generated.js. */
const catalogueMeta = (c) => `${c.pages} pages · PDF · ${(c.bytes / 1024 / 1024).toFixed(1)} MB`;

/** What ships with an order — replaces repeating the badge set a second time. */
const documentation = [
  'Declarations of conformity on request',
  'Test reports on request',
  'Specification sheets for tenders',
  'Custom branding and private label',
];

/*
 * Section order (Oct 2026 review): products first, then proof, then the range
 * in depth, then a close. The two promo cards ("Browse the complete catalogue"
 * and "Set up a supply programme") and the 301 / 17 / 4 numbers band were
 * removed: the first repeated the hero and the catalogue section, the second
 * is now the closing band (OrderSteps), and the numbers now introduce the
 * catalogue. Every main section uses the same head: eyebrow, 44px title, one
 * line under it (.zb__head).
 */
export default function HomePage() {
  usePageMeta(pageMeta['/']);

  return (
    <>
      {/* ================= 1. HERO ================= */}
      {/* Starts below the white header (see HERO_UNDER_HEADER in Navbar.jsx). */}
      <section className="hx-hero hx-hero--blend" aria-label="DDUROGA Safety">
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
              {/* Was the 25 MB catalogue PDF, which left phones (where the header
                  shows only icons) with no quote button near the top. The PDF
                  has its own section further down. */}
              <Link to="/contact" className="hx-hero__cta">
                Request a quote <IconArrowRight width="14" height="14" />
              </Link>
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

      {/* ================= 3. PROTECTION ZONES ================= */}
      <ZoneBento />

      {/* ================= 4. CLIENTS =================
          Moved up from near the end: these names are the strongest proof on the
          page, and B2B buyers look for them early. */}
      <ClientLogos />

      {/* ================= 5. TRENDING (client-picked, see data/trending.js) ================= */}
      <TrendingShowcase />

      {/* ================= 6. FIND YOUR RANGE =================
          Browse by industry (SectorGrid.jsx). The "By hazard" chips that used to follow were
          removed at the client's request (Oct 2026); hazards remain a filter
          on the catalogue page. */}
      <SectorGrid slugs={homeIndustries} />

      {/* ================= 7. COMPLIANCE ================= */}
      <section className="hp-compliance" aria-labelledby="compliance-title">
        <div className="hx-bleed hp-compliance__inner">
          <div>
            <span className="zb__eyebrow">Compliance</span>
            <h2 className="zb__title" id="compliance-title">Are you compliant?</h2>
            <p>
              Ask for the standards documentation your auditors need with your order. Learn what
              each mark means and how to specify it correctly.
            </p>
          </div>
          <div>
            {/* Lists the documents buyers can ask for. Nothing here promises
                more than "on request" until the client confirms what ships as standard. */}
            <ul className="hp-ships">
              {documentation.map((d) => (
                <li key={d}>
                  <IconCheck width="17" height="17" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <Link to="/learning" className="btn hx-btn">
              Visit the Learning Centre <IconArrowRight width="14" height="14" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 8. CATALOGUE =================
          One download: Mallcom's 2025 catalogue, the source every product page
          on this site is built from. The PDF is the catalogue as printed, with
          its photos recompressed for the web (97 MB to 24.9 MB); text and
          layout are untouched, so it stays searchable. "View online" opens it
          in the browser's own viewer, which is kinder than a 25 MB download on
          a phone. The product and sector counts are counted off the live
          catalogue (they used to be a separate numbers band). */}
      <section className="hp-catalogue" id="catalogues" aria-labelledby="catalogue-title">
        <div className="zb__inner">
          <div className="zb__head">
            <div>
              <span className="zb__eyebrow">Catalogue</span>
              <h2 className="zb__title" id="catalogue-title">The full 2025 range in one PDF</h2>
              <p className="sg__sub">
                {allProducts.length} products for {industryCatalog.length} sectors, with the sizes, colours and standards each is tested to.
              </p>
            </div>
          </div>

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

      {/* ================= 9. GUIDES & INSIGHTS (GuidesSection.jsx) ================= */}
      <GuidesSection />

      {/* ================= 10. HOW ORDERING WORKS + CLOSE (OrderSteps.jsx) ================= */}
      <OrderSteps />
    </>
  );
}
