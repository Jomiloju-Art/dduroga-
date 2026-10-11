import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { findProduct, zoneOf, productsByZone, hazardNames, industryCatalog, typeLabel } from '../data/products.js';
import PageHero from '../components/PageHero.jsx';
import ProductArt from '../components/ProductArt.jsx';
import ProductGallery from '../components/ProductGallery.jsx';
import DesignedForSection from '../components/DesignedForSection.jsx';
import RecommendRow from '../components/RecommendRow.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';
import { IconArrowRight, IconCheck, IconDocument } from '../components/Icons.jsx';
import { brand } from '../data/brand.js';
import { useQuote } from '../quote/QuoteContext.jsx';
import { downloadDatasheet } from '../lib/datasheet.js';
import { usePageMeta } from '../lib/seo.js';
import { addRecent, useRecentlyViewed } from '../lib/recent.js';
import Reveal from '../components/Reveal.jsx';
import PerformanceRatings, { hazardIcon, standardIcon } from '../components/PerformanceRatings.jsx';
import { videoForProduct } from '../lib/productVideo.js';

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const HAZARD_NORMS = new Set(Object.values(hazardNames).map(norm));
const INDUSTRY_KWS = industryCatalog.flatMap((i) => i.kw.map(norm));

function groupTags(product) {
  const zone = zoneOf(product);
  const skip = new Set([norm(zone?.label || ''), norm(zone?.id || ''), norm(product.title || ''), norm(product.type || '')]);
  const hazards = [], industries = [], misc = [];
  for (const t of product.tags || []) {
    const n = norm(t);
    if (skip.has(n) || n.length < 2) continue;
    if (HAZARD_NORMS.has(n)) hazards.push(t);
    else if (INDUSTRY_KWS.some((k) => n.includes(k))) industries.push(t);
    else misc.push(t);
  }
  return { hazards, industries, misc };
}

function findStandards(desc) {
  const found = new Set();
  const re = /\b(EN|IS|ISO|ANSI|NFPA|CE|ASTM|AS\/NZS)\s?\d{2,6}(?::\d{4})?(?:\s?[A-Z0-9-]*)?/g;
  for (const m of desc.matchAll(re)) found.add(m[0].replace(/\s+/g, ' ').trim());
  return [...found].slice(0, 10);
}

function sentenceSplit(desc) {
  const clean = desc.replace(/\s+/g, ' ').trim();
  const parts = clean.split(/(?<=[.])\s+/).map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [clean];
}

function featureBullets(desc) {
  return sentenceSplit(desc).filter((s) => s.length > 24 && s.length < 220).slice(0, 5);
}

/**
 * Classify what a product's variant options actually are. The catalogue's `c`
 * field is overloaded: it holds shoe/glove sizes ("7", "6.5", "13"), letter
 * sizes ("S"–"XXL"), pure colours ("Red", "Blue"), or a combined "size / colour"
 * string ("10 / Black"). This decides the label so the PDP never calls a glove
 * size a "colour".
 */
function variantKind(variants) {
  const vals = (variants || []).map((v) => String(v.c || '').trim()).filter(Boolean);
  if (!vals.length) return 'colour';
  if (vals.some((v) => v.includes('/'))) return 'size-colour';
  if (vals.every((v) => /^\d+(\.\d+)?$/.test(v))) return 'size';
  if (vals.every((v) => /^(XS|S|M|L|XL|XXL|\d*XL)$/i.test(v))) return 'size';
  return 'colour';
}
const KIND_LABEL = { size: 'size', colour: 'colour', 'size-colour': 'size / colour' };

/** "About the design" section - only rendered when the product has a baked banner (matches Mallcom's own pages). */
function FeatureDiagram({ img, title, features, banner }) {
  if (!banner) return null;
  return (
    <div className="container" style={{ marginTop: 34 }}>
      <div className="feature-diagram">
        <h3 className="fd-heading">About the design</h3>
        <img className="fd-banner" src={banner} alt={title} loading="lazy" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = findProduct(slug);
  const [failedMain, setFailedMain] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  /** Quantity for the single quote action. */
  const [qty, setQty] = useState(1);
  /** Sticky product bar, shown once the top of the page scrolls away. */
  const [showSticky, setShowSticky] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [product?.slug]);

  const zone = zoneOf(product);
  const tags = useMemo(() => (product ? groupTags(product) : null), [product]);
  const standards = useMemo(() => (product ? findStandards(product.desc || '') : []), [product]);

  // Rating tiles - real data only: protection areas (product tags) + standards.
  const ratingItems = useMemo(() => {
    if (!tags) return [];
    const areaTiles = tags.hazards.map((h) => ({
      name: h,
      title: h.toUpperCase(),
      value: '',
      icon: hazardIcon(h),
    }));
    const standardTiles = standards.map((s) => {
      const m = s.match(/^((?:EN|IS|ISO|ANSI|NFPA|ASTM|AS\/NZS)\s?\d{2,6})(?::(\d{4}))?/i);
      return m
        ? { name: s, title: m[1].toUpperCase(), value: m[2] || '', icon: standardIcon(s) }
        : { name: s, title: s.toUpperCase(), value: '', icon: standardIcon(s) };
    });
    return [...areaTiles, ...standardTiles];
  }, [tags, standards]);

  // Rich per-product info (Key Features / Design / Remarks / Tests / reviews) + diagram image + callout banner.
  const [rich, setRich] = useState(null);
  const [detailsLoaded, setDetailsLoaded] = useState(false);
  const [diagramImg, setDiagramImg] = useState(null);
  const [bannerImg, setBannerImg] = useState(null);
  useEffect(() => {
    let alive = true;
    setDetailsLoaded(false);
    Promise.all([import('../data/productDetails.js'), import('../data/diagramImages.js'), import('../data/calloutBanners.js')])
      .then(([d, di, cb]) => {
        if (!alive) return;
        setRich(d.productDetails?.[slug] || null);
        setDiagramImg(di.diagramImages?.[slug] || null);
        setBannerImg(cb.calloutBanners?.[slug] || null);
        setDetailsLoaded(true);
      })
      .catch(() => {
        if (alive) { setRich(null); setDiagramImg(null); setBannerImg(null); setDetailsLoaded(true); }
      });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => { addRecent(slug); }, [slug]);
  const recent = useRecentlyViewed().filter((p) => p.slug !== slug);

  usePageMeta({
    title: product?.fullTitle || product?.title || 'Product',
    description: (product?.desc || '').slice(0, 160),
    canonical: `/products/${slug}`,
    image: product?.img,
    product: product
      ? { title: product.title, sku: product.variants?.[0]?.s || '', desc: product.desc, img: product.img }
      : null,
    crumbs: product
      ? [
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
          ...(zone ? [{ name: zone.label, path: `/products?cat=${zone.id}` }] : []),
          { name: product.title, path: `/products/${slug}` },
        ]
      : null,
  });

  if (!product) return <Navigate to="/products" replace />;

  const variants = product.variants || [];
  const selected = variants[Math.min(colorIdx, Math.max(variants.length - 1, 0))] || null;
  const variantType = variantKind(variants);
  const kindLabel = KIND_LABEL[variantType];
  // Sizes render as TEXT chips. An image swatch per size just repeated the same
  // product photo, so "select size" showed nine identical shoes. Colour keeps
  // image swatches; size and size/colour use the label.
  const isTextOptions = variantType !== 'colour';

  const gallery = [];
  const pushImg = (u) => { if (u && !gallery.includes(u)) gallery.push(u); };
  if (selected?.img) pushImg(selected.img);
  pushImg(product.img);
  (product.imgs || []).forEach(pushImg);

  const [activeImg, setActiveImg] = useState(0);

  const current = gallery[Math.min(activeImg, Math.max(gallery.length - 1, 0))];

  /* Product video, if we hold one. It renders in the buy column, under the
     datasheet button - not in the gallery, which stays photos only. Products
     with no clip get null and nothing is rendered. */
  const video = videoForProduct(product.slug);

  const paragraphs = product.hasDesc ? sentenceSplit(product.desc) : [];
  const features = product.hasDesc ? featureBullets(product.desc) : [];
  const featList = rich?.keyFeatures?.length ? rich.keyFeatures : features;

  const zoneProducts = productsByZone(zone?.id).filter((p) => p.slug !== product.slug && p.img);
  const lookFor = zoneProducts.slice(0, 3);
  const alsoBought = zoneProducts.slice(3, 6);

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const onShare = async () => {
    try { if (navigator.share) await navigator.share({ title: product.title, url: productUrl }); else await copyLink(); }
    catch { /* user cancelled */ }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  };

  const enquiryHref = `/contact?product=${encodeURIComponent(product.fullTitle || product.title)}${selected && selected.c ? `&variant=${encodeURIComponent(selected.c)}` : ''}`;
  const { add } = useQuote();
  const quoteItem = { slug: product.slug, title: product.title, sku: selected?.s || '', img: product.img, option: selected?.c || '' };
  const specs = {
    zone: zone?.label || 'Not specified',
    colours: variants.map((v) => v.c).filter(Boolean).join(', ') || 'Not specified',
    skus: variants.map((v) => v.s).filter(Boolean).join(', ') || 'Not specified',
    weight: [...new Set(variants.map((v) => v.wgt).filter(Boolean))].map((g) => `${g} g`).join(', ') || 'Not specified',
    standards,
  };

  return (
    <>
      {/* The dark PageHero band was removed. It repeated the product title that
          already sits in the detail column, pushing the gallery and specs below
          the fold. The breadcrumb stays, restyled for a light background. */}
      <section className="section" style={{ paddingBlock: '26px 40px' }}>
        <div className="container">
          <nav className="breadcrumbs breadcrumbs--on-light" aria-label="Breadcrumb" style={{ marginBottom: 18 }}>
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <Link to={`/products?cat=${zone?.id}`}>{zone?.label}</Link>
            <span>/</span>
            <span aria-current="page">{product.title}</span>
          </nav>

          {/* Sentinel: once this scrolls out of view the sticky bar appears. */}
          <div ref={topRef} aria-hidden="true" />

          <div className="detail-grid">
            {/* ---------- Gallery ----------
                All of the media behaviour lives in ProductGallery: the sticky
                scroll column, the scroll-snap carousel on mobile, click-to-
                magnify, and the drawn +/- cursor. See that component for the
                state model. */}
            <ProductGallery
              images={gallery}
              title={product.title}
              zone={zone?.id}
            />

            {/* ---------- Info column ---------- */}
            <div className="detail-info">
              <span className="eyebrow">{zone?.label}</span>
              <h1 className="pdp-title">{product.title}</h1>

              {/* One grey meta line under the title (BBC pattern): SKU, then
                  stock as a dot pill. The buy column had no at-a-glance status
                  line at all before this. */}
              <div className="pdp-metaline">
                {selected?.s && (
                  <>
                    <span>SKU {selected.s}</span>
                    <span className="pdp-metaline__sep" aria-hidden="true">·</span>
                  </>
                )}
                {selected?.a
                  ? <span className="pdp-stock pdp-stock--in"><span className="pdp-stock__dot" aria-hidden="true" />In stock</span>
                  : <span className="pdp-stock pdp-stock--lead"><span className="pdp-stock__dot" aria-hidden="true" />Lead time on request</span>}
              </div>

              {/* Share row. The star rating and "Customer reviews (0)" /
                  "Write a review" links were removed: with no review data they
                  only drew attention to the absence of social proof, and the
                  anchor pointed at a tab that has been deleted. */}
              <div className="prod-meta">
                <button type="button" className="prod-meta-link" onClick={onShare}>Share</button>
                <span aria-hidden="true">·</span>
                <button type="button" className="prod-meta-link" onClick={copyLink}>{copied ? 'Link copied!' : 'Copy link'}</button>
              </div>

              {/* The description used to be printed here AND again in the open
                  "About the design" panel below, so the same two paragraphs
                  appeared twice on one screen. The panel keeps the full text
                  plus the tag chips; this column stays a buy column. */}
              <PerformanceRatings items={ratingItems} />
              {tags.industries.length > 0 && (
                <div className="detail-taggroup">
                  <h2>Useful in these industries</h2>
                  <div className="chip-row">{tags.industries.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                </div>
              )}

              {variants.length > 0 && (
                <div className="detail-taggroup">
                  <h2>Select {kindLabel} <span style={{ color: '#6d6d6d', fontWeight: 500, textTransform: 'none' }}>{selected?.c || ''}</span></h2>
                  <div className={`color-row${isTextOptions ? ' color-row--text' : ''}`}>
                    {variants.map((v, i) => (
                      <button
                        key={v.c + i}
                        type="button"
                        className={`color-swatch${isTextOptions ? ' color-swatch--text' : ''}${i === colorIdx ? ' active' : ''}`}
                        onClick={() => { setColorIdx(i); setActiveImg(0); }}
                        aria-label={`${kindLabel} ${v.c}`}
                        title={v.c}
                      >
                        {isTextOptions
                          ? String(v.c).split('/')[0].trim()
                          : (v.img ? <img src={v.img} alt={v.c} loading="lazy" /> : <span>{String(v.c).slice(0, 1)}</span>)}
                      </button>
                    ))}
                  </div>
                  <p className="detail-sku muted" style={{ fontSize: '0.82rem', marginTop: 6 }}>
                    {selected?.s ? <>SKU: <strong>{selected.s}</strong> · </> : null}
                    {selected?.a ? 'In stock' : 'Lead time on request'}
                  </p>
                </div>
              )}

              <div className="detail-aside" style={{ marginTop: 22 }}>
                <div className="panel">
                  <h2>Request this product</h2>
                  <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 12 }}>Volume pricing, samples and full test documentation on request.</p>
                  {/* The placeholder phone number and .example address used to be
                      printed here as prominent contact rows. They were the most
                      visually dominant element in the buy box and both were
                      dead, so the box now points at the contact page instead. */}
                  <Link
                    to="/contact"
                    className="detail-ask muted"
                    style={{ fontSize: '0.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}
                  >
                    Ask a specialist about this product <IconArrowRight width="14" height="14" />
                  </Link>
                  {/* One action, not two. The separate "Request a quote" link
                      led to a blank contact form; the quote list IS the RFQ. */}
                  <div className="qty-row">
                    <span className="qty-label" id="qty-label">Quantity</span>
                    <div className="qty-stepper" role="group" aria-labelledby="qty-label">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        aria-label="Quantity"
                      />
                      <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pdp-add"
                    onClick={() => { add(quoteItem, qty); setQty(1); }}
                  >
                    {qty > 1 ? `Add ${qty} to quote` : 'Add to quote'}
                  </button>
                  <button
                    type="button"
                    className="pdp-datasheet"
                    onClick={() => downloadDatasheet(product, specs)}
                  >
                    Download datasheet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Annotated feature diagram */}
        <FeatureDiagram
          img={diagramImg || product.img}
          title={product.title}
          features={rich?.keyFeatures?.length ? rich.keyFeatures : features}
          banner={bannerImg}
        />

        {/* ---------- Designed For ----------
            The Gymshark block: a two-tab strip whose "Designed For" panel is a
            50/50 split - statement + feature rows on the left, the product video
            filling the right column edge to edge. Sits below the buy area, which
            is where they put it, not in the buy column. Products without a clip
            fall back to their first image so the column is never empty. */}
        <DesignedForSection product={product} video={video} rich={rich} />

        {/* ---------- Reviews ----------
            Gymshark's review layout, Mallcom's review data. The component
            returns null for a product with no reviews, so nothing renders for
            those - which is most of the catalogue: 200 of 522 have any. Each
            review keeps its own author and date, and the block states the
            reviews were collected by Mallcom rather than implying they are ours. */}
        <div className="container">
          <ReviewsSection slug={product.slug} />
        </div>

        {/* ---------- Accordion tabs ---------- */}
        <div className="container detail-accordions" style={{ marginTop: 26 }}>
          <details open>
            <summary>About the design</summary>
            <div className="acc-body">
              {paragraphs.length ? paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>) : <p>Certified product within the {zone?.label.toLowerCase()} range.</p>}
              {tags.misc.length > 0 && (
                <div className="chip-row" style={{ marginTop: 8 }}>{tags.misc.slice(0, 12).map((t) => <span key={t} className="chip">{t}</span>)}</div>
              )}
            </div>
          </details>

          <details>
            <summary>Key features</summary>
            <div className="acc-body">
              {!detailsLoaded ? (
                /* Skeleton while the spec data loads. This slot previously
                   showed the "available on request" line for an instant before
                   swapping to real content, which was briefly untrue. */
                <div aria-hidden="true">
                  <span className="skeleton skeleton--text" style={{ width: '92%' }} />
                  <span className="skeleton skeleton--text" style={{ width: '84%' }} />
                  <span className="skeleton skeleton--text" style={{ width: '70%' }} />
                </div>
              ) : featList.length ? (
                <ul className="spec-list">
                  {featList.map((f) => <li key={f.slice(0, 40)}><IconCheck width="17" height="17" /> {f}</li>)}
                </ul>
              ) : (
                <p>Key feature details are loaded from the product spec sheet, available on request.</p>
              )}
            </div>
          </details>

          <details>
            <summary>Product details</summary>
            <div className="acc-body">
              <dl className="acc-dl">
                <dt>Zone</dt><dd>{zone?.label}</dd>
                <dt>Product line</dt><dd>{typeLabel(product) || 'Not specified'}</dd>
                {variants.length > 0 && (
                  <>
                    <dt>Colours</dt><dd>{variants.map((v) => v.c).join(', ')}</dd>
                    <dt>SKUs</dt><dd>{variants.map((v) => v.s).filter(Boolean).join(', ') || 'Not specified'}</dd>
                    <dt>Weight</dt><dd>{specs.weight}</dd>
                  </>
                )}
                <dt>Order model</dt><dd>Enquiry / quotation, volume &amp; custom branding supported</dd>
              </dl>
              {rich?.design?.length > 0 && (
                <>
                  <h4 className="acc-sub">Design</h4>
                  <ul className="spec-list">
                    {rich.design.map((d) => <li key={d.slice(0, 40)}><IconCheck width="17" height="17" /> {d}</li>)}
                  </ul>
                </>
              )}
              {rich?.remarks?.length > 0 && (
                <>
                  <h4 className="acc-sub">Remarks</h4>
                  <ul className="spec-list">
                    {rich.remarks.map((r) => <li key={r.slice(0, 40)}><IconCheck width="17" height="17" /> {r}</li>)}
                  </ul>
                </>
              )}
            </div>
          </details>

          <details>
            <summary>Standards &amp; tests</summary>
            <div className="acc-body">
              {standards.length ? (
                <div className="chip-row">{standards.map((s) => <span key={s} className="chip chip--gold">{s}</span>)}</div>
              ) : null}
              {rich?.tests?.length > 0 && (
                <>
                  <h4 className="acc-sub">Tests conducted</h4>
                  <ul className="spec-list">
                    {rich.tests.map((t) => <li key={t.slice(0, 40)}><IconCheck width="17" height="17" /> {t}</li>)}
                  </ul>
                </>
              )}
              <p style={{ marginTop: 10 }}>Full test certificates, batch records and conformity documentation available on request from our quality team.</p>
            </div>
          </details>

          {/* The Reviews tab was removed: we hold no review data, so it only
              advertised "Customer reviews (0)" and told the visitor to "connect
              your review app" — an internal build note shown to customers. Put
              it back when there are real, verifiable reviews to display. */}
        </div>
      </section>

      {/* ---------- We recommend ----------
          The Gymshark carousel: a 4-up strip of frameless cards, one text size,
          no chip, no button.

          SCOPED TO ONE PRODUCT ON PURPOSE. This renders on diamond-iii only
          while the treatment is being judged; every other PDP keeps the existing
          card grid untouched. Widen the check once it is signed off. */}
      {product.slug === 'diamond-iii' && ([...lookFor, ...alsoBought].length > 1) && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 40 }}>
          <div className="container">
            <RecommendRow products={[...lookFor, ...alsoBought]} title="We recommend" />
          </div>
        </section>
      )}

      {/* ---------- Recently viewed ---------- */}
      {recent.length > 0 && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 40 }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Pick up where you left off</span>
              <h2 className="section-title">Recently viewed</h2>
            </div>
            <div className="grid grid--4" style={{ gap: 20 }}>
              {recent.slice(0, 4).map((p) => (
                <Link to={`/products/${p.slug}`} className="rel-card" key={p.slug} aria-label={p.title}>
                  <div className="rel-img"><img src={p.img} alt={p.title} loading="lazy" /></div>
                  <div className="rel-body">
                    <span className="rel-title">{p.title}</span>
                    <span className="rel-link">View product <IconArrowRight width="14" height="14" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Sticky product bar ----------
          Appears once the top of the page scrolls away. Hidden with
          `visibility` rather than unmounted so it animates, and so it drops out
          of the tab order while hidden. */}
      <div className={`pdp-bar${showSticky ? ' is-visible' : ''}`}>
        <div className="container pdp-bar__inner">
          <span className="pdp-bar__thumb">
            {current && !failedMain ? (
              <img src={current} alt="" />
            ) : (
              <ProductArt category={zone?.id} size="34" />
            )}
          </span>
          <span className="pdp-bar__meta">
            <strong>{product.title}</strong>
            <span>{selected?.s ? `SKU ${selected.s}` : typeLabel(product) || zone?.label}</span>
          </span>
          <button
            type="button"
            className="pdp-bar__datasheet"
            onClick={() => downloadDatasheet(product, specs)}
          >
            <IconDocument width="16" height="16" />
            <span>Datasheet</span>
          </button>
          <button
            type="button"
            className="btn hx-btn pdp-bar__cta"
            onClick={() => { add(quoteItem, qty); setQty(1); }}
          >
            Request quote
          </button>
        </div>
      </div>

      {/* ---------- Mobile sticky action bar ---------- */}
      <div className="pdp-sticky">
        <button type="button" className="btn hx-btn" onClick={() => { add(quoteItem, qty); }}>Add to quote</button>
        <button type="button" className="btn btn--outline-dark" onClick={() => downloadDatasheet(product, specs)}>Datasheet</button>
        <Link to={enquiryHref} className="btn btn--dark">Request quote</Link>
      </div>
    </>
  );
}
