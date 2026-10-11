import { Link } from 'react-router-dom';
import {
  categories,
  productsByZone,
  zoneOf,
  industryCatalog,
  hazardNames,
  byIndustry,
  byHazard,
  typeLabel,
} from '../data/products.js';
import {
  homeIndustries,
  homeHazards,
  homeResources,
} from '../data/homeContent.js';
import { IconArrowRight, IconCheck } from '../components/Icons.jsx';
import { usePageMeta } from '../lib/seo.js';
import Reveal from '../components/Reveal.jsx';
import TrustBand from '../components/TrustBand.jsx';
import RangeStats from '../components/RangeStats.jsx';
import ClientLogos from '../components/ClientLogos.jsx';
import ZoneCard from '../components/ZoneCard.jsx';
import IndustryIcon from '../components/IndustryIcon.jsx';
import { useQuote } from '../quote/QuoteContext.jsx';
import { catalogues } from '../data/catalogues.generated.js';

/** "9 pages · PDF · 0.8 MB" — read from what tools/build-catalogues.mjs produced. */
const catalogueMeta = (c) => `${c.pages} pages · PDF · ${(c.bytes / 1024 / 1024).toFixed(1)} MB`;

/** What ships with an order — replaces repeating the badge set a second time. */
const documentation = [
  'Declaration of conformity per product',
  'Batch-level test certificates',
  'Specification sheets for tenders',
  'Custom branding and private label',
];

const trending = (() => {
  const out = [];
  for (const z of ['head', 'hand', 'body', 'feet']) {
    const list = productsByZone(z).filter((p) => p.img).sort((a, b) => (b.imgs?.length || 0) - (a.imgs?.length || 0));
    if (list[0]) out.push(list[0]);
    if (list[1]) out.push(list[1]);
  }
  return out.slice(0, 8);
})();

/** One-line technical spec for a card: up to two short tags, else the type. */
const specLine = (p) => (p.tags || []).filter((t) => t.length <= 18).slice(0, 2).join(' · ') || typeLabel(p) || '';

function TrendingCard({ product }) {
  const { add } = useQuote();
  const zone = zoneOf(product);
  return (
    <Link to={`/products/${product.slug}`} className="hx-trend__card">
      <span className="hx-trend__img"><img src={product.img} alt={product.title} loading="lazy" /></span>
      {zone && <span className="hx-trend__zone">{zone.label}</span>}
      <span className="hx-trend__name">{product.title}</span>
      <span className="hx-trend__spec">{specLine(product)}</span>
      <span className="hx-trend__actions">
        <button
          type="button"
          className="hx-trend__add"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            add(product);
          }}
        >
          Add to quote
        </button>
      </span>
    </Link>
  );
}

export default function HomePage() {
  usePageMeta({
    title: 'Home',
    description:
      'DDUROGA Safety: certified head-to-toe PPE for industry. Gloves, footwear, head, eye and body protection, supplied in bulk across Nigeria.',
  });

  const showTrending = trending.filter(Boolean);
  const industries = homeIndustries.map((s) => industryCatalog.find((i) => i.slug === s)).filter(Boolean);
  const hazards = homeHazards.map((id) => ({ id, label: hazardNames[id] })).filter((h) => h.label);

  return (
    <>
      {/* ================= 1. HERO ================= */}
      <section className="hx-hero hx-hero--under-header hx-hero--blend" aria-label="DDUROGA Safety">
        <div className="hx-hero__inner">
          <div className="hx-hero__lockup">
            <h1 className="hx-hero__tagline">Certified Industrial PPE &amp; Safety Equipment Supplied Across Nigeria</h1>
            <p className="hx-hero__lead">
              Head-to-toe protection for oil &amp; gas, construction, manufacturing and ports, stocked in Lagos, delivered nationwide.
            </p>
            <Link to="/products" className="hx-hero__cta">
              View Product Catalogue <IconArrowRight width="14" height="14" />
            </Link>
          </div>
        </div>
        {/* Fades the hero's bottom edge into the white band below, so the dark
            photo and the light section read as one surface rather than two
            stacked blocks with a hard seam. */}
        <div className="hx-hero__blend" aria-hidden="true" />
      </section>

      {/* ================= 2. TRUST BAND ================= */}
      <TrustBand />
      {/* Client logo strip. Self-hides until src/data/clients.js has
          permissioned entries — see that file for what to request from the
          client. The client's own line is its default heading. */}
      <ClientLogos />

      {/* ================= 3. PROTECTION ZONES ================= */}
      <section className="hx-section hx-section--bleed" id="zones">
        <div className="hx-bleed">
          <Reveal className="hx-section__head hx-section__head--left">
            <h2>Browse by protection zone</h2>
            <p>Head-to-toe coverage. Start with the zone you need to kit out.</p>
          </Reveal>
          <Reveal className="zc-grid reveal-stagger">
            {categories.map((cat) => (
              <ZoneCard
                key={cat.id}
                id={cat.id}
                label={cat.label}
                count={productsByZone(cat.id).length}
              />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ================= 4. TRENDING PRODUCTS ================= */}
      <section className="hx-section hx-section--soft hx-section--bleed">
        <div className="hx-bleed">
          <Reveal className="hx-section__head hx-section__head--left hx-section__head--split">
            <h2>Trending products</h2>
            <p>What safety teams are standardising on right now.</p>
            <Link to="/products" className="hx-trend__all">
              View all products
              <IconArrowRight />
            </Link>
          </Reveal>
          <Reveal className="hx-trend reveal-stagger">
            {showTrending.map((p) => <TrendingCard product={p} key={p.slug} />)}</Reveal>
        </div>
      </section>

      {/* ================= 5. FIND YOUR RANGE =================
          Industry and hazard used to be two consecutive sections of identical
          plain text tiles, which read as the same block twice. They are one
          section now, and the two groups are deliberately styled differently:
          sectors get icons and become browsable at a glance, hazards stay
          compact chips because there are 22 of them. */}
      <section className="hx-section hx-section--bleed">
        <div className="hx-bleed">
          <Reveal className="hx-section__head hx-section__head--left">
            <h2>Find your range</h2>
            <p>Pick the sector you work in, or the hazard you&rsquo;re protecting against.</p>
          </Reveal>

          <h3 className="hp-group__title">By industry</h3>
          <Reveal className="hp-sectors reveal-stagger">
            {industries.map((i) => (
              <Link to={`/products?industry=${i.slug}`} className="hp-sector" key={i.slug}>
                <span className="hp-sector__icon"><IndustryIcon slug={i.slug} /></span>
                <span className="hp-sector__label">{i.label}</span>
                <span className="hp-sector__count">{byIndustry(i.slug).length} products</span>
              </Link>
            ))}
          </Reveal>

          <h3 className="hp-group__title hp-group__title--spaced">By hazard</h3>
          <Reveal className="hp-hazards reveal-stagger">
            {hazards.map((h) => (
              <Link to={`/products?hazard=${h.id}`} className="hp-hazard" key={h.id}>
                {h.label}
                <span className="hp-hazard__count">{byHazard(h.id).length}</span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ================= 7. COMPLIANCE ================= */}
      <section className="hp-compliance">
        <div className="hx-bleed hp-compliance__inner">
          <div>
            <h2>Are you compliant?</h2>
            <p>
              Every DDUROGA product ships with the standards documentation your auditors ask for.
              Learn what each mark means and how to specify it correctly.
            </p>
          </div>
          <div>
            {/* The four certification badges were repeated here from the trust
                band directly under the hero. Rather than print the same four
                marks twice, this lists what actually arrives with an order. */}
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

      {/* ================= 8b. WHY ORDER FROM US =================
          Four reasons, corner-icon cards — the Netflix "More reasons to join"
          anatomy: navy card, copy top-left, one orange icon parked bottom-right
          with no container. */}
      <section className="hx-section hx-section--bleed" id="why-us">
        <div className="hx-bleed">
          <Reveal className="hx-section__head hx-section__head--left">
            <h2>Why order from us</h2>
            <p>What you get on every line, not just the big ones.</p>
          </Reveal>
          <Reveal className="why-grid reveal-stagger">
            {[
              { t: 'Bulk pricing', b: 'Volume rates on request, with samples and full test documentation per line.' },
              { t: 'EN-certified stock', b: 'Every product ships with its declaration of conformity and batch test certificates.' },
              { t: 'Stocked in Lagos', b: 'Warehouse stock dispatched nationwide, lead times confirmed against your list.' },
              { t: 'One quote, every zone', b: 'Head-to-toe PPE shortlisted from a single supplier instead of four.' },
            ].map((r) => (
              <div className="why-card" key={r.t}>
                <h3 className="why-card__title">{r.t}</h3>
                <p className="why-card__body">{r.b}</p>
                <span className="why-card__icon" aria-hidden="true"><IconCheck width="20" height="20" /></span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ================= 8. PROMO / WHERE TO BUY ================= */}
      <section className="hx-section hx-section--bleed">
        <div className="hx-bleed">
          <div className="hx-promo">
            <Link to="/products" className="hx-promo__card hx-promo__card--accent">
              <span className="hx-promo__eyebrow">Full range</span>
              <h3>Browse the complete catalogue</h3>
              <span className="hx-promo__link">View Product Catalogue <IconArrowRight width="14" height="14" /></span>
            </Link>
            <Link to="/contact" className="hx-promo__card">
              <span className="hx-promo__eyebrow">Where to buy</span>
              <h3>Find a stockist or request a program</h3>
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

      {/* ================= 10. CATALOGUES =================
          Two downloads. The mini is generated by tools/build-catalogues.mjs
          from Mallcom's catalogue pages plus the live product data, and is real
          text — searchable, selectable, 0.8 MB. The full one is Mallcom's own
          Private Label Brochure, supplied as-is: it has no text layer at all, so
          it is the authoritative document rather than the findable one. Keep
          both; they do different jobs. */}
      <section className="hx-section hx-section--bleed" id="catalogues">
        <div className="hx-bleed">
          <Reveal className="hx-section__head hx-section__head--left">
            <h2>Catalogues</h2>
            <p>Take the range away with you — a quick overview, or the full specification.</p>
          </Reveal>

          <div className="cat-grid">
            <a className="cat-card" href={catalogues.mini.file} download>
              <span className="cat-card__cover">
                <img src={catalogues.mini.cover} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="cat-card__body">
                <span className="cat-card__eyebrow">Mini catalogue</span>
                <strong className="cat-card__title">The range at a glance</strong>
                <span className="cat-card__desc">
                  Company profile, manufacturing credentials and a product overview across all four
                  protection zones.
                </span>
                <span className="cat-card__meta">{catalogueMeta(catalogues.mini)}</span>
                <span className="cat-card__cta">
                  Download <IconArrowRight width="14" height="14" />
                </span>
              </span>
            </a>

            <a className="cat-card" href={catalogues.full.file} download>
              <span className="cat-card__cover">
                <img src={catalogues.full.cover} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="cat-card__body">
                <span className="cat-card__eyebrow">Full catalogue</span>
                <strong className="cat-card__title">The complete collection</strong>
                <span className="cat-card__desc">
                  Mallcom's own product book — every glove, boot, helmet and garment in the range,
                  with the sizes, colours and standards each is tested to.
                </span>
                <span className="cat-card__meta">{catalogueMeta(catalogues.full)}</span>
                <span className="cat-card__cta">
                  Download <IconArrowRight width="14" height="14" />
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ================= 11. GUIDES & INSIGHTS ================= */}
      <section className="hx-section hx-section--soft hx-section--bleed">
        <div className="hx-bleed">
          <Reveal className="hx-section__head hx-section__head--left">
            <h2>Guides &amp; insights</h2>
            <p>Choosing the right protection, explained in plain language.</p>
          </Reveal>
          <div className="hx-blogs">
            {homeResources.map((r) => (
              <Link to={`/learning/${r.slug}`} className="hx-blog" key={r.title}>
                <span className="hx-blog__media">
                  {r.image
                    ? <img src={r.image} alt="" loading="lazy" />
                    : <span className="hx-blog__ph">Article</span>}
                </span>
                <span className="hx-blog__meta">
                  <span className="hx-blog__type">{r.type}</span>
                  <span>{r.date}</span>
                </span>
                <h3>{r.title}</h3>
                <span className="hx-blog__read">Read more <IconArrowRight width="14" height="14" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
