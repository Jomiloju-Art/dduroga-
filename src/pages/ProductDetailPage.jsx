import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { findProduct, zoneOf, productsByZone, productsByRange, byFeatured, hazardNames, industryCatalog, industryLabel, typeLabel, rangeById } from '../data/products.js';
import CertifiedTo, { standardStrings } from '../components/CertifiedTo.jsx';
import PageHero from '../components/PageHero.jsx';
import ProductArt from '../components/ProductArt.jsx';
import ProductGallery from '../components/ProductGallery.jsx';
import ProductVideo from '../components/ProductVideo.jsx';
import { toSentences, splitFeature } from '../lib/productCopy.js';
import RecommendRow from '../components/RecommendRow.jsx';
import { IconArrowRight, IconCheck, IconDocument } from '../components/Icons.jsx';
import { brand } from '../data/brand.js';
import { useQuote } from '../quote/QuoteContext.jsx';
import { downloadDatasheet } from '../lib/datasheet.js';
import { loadDetails } from '../lib/details.js';
import { productTitle, productDescription } from '../lib/seoText.js';
import QtyInput, { QTY_MAX } from '../components/QtyInput.jsx';
import { usePageMeta } from '../lib/seo.js';
import { addRecent, useRecentlyViewed } from '../lib/recent.js';
import Reveal from '../components/Reveal.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import SizeGuide from '../components/SizeGuide.jsx';
import { sizingFor } from '../data/sizes.js';
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

/* Variant values hold a size, a colour, or "size / colour". Split them so size
   and colour can be picked separately (sizes now come from data/sizes.js). */
const SIZE_RE = /^(\d+(\.\d+)?|XS|S|M|L|XL|XXL|XXXL|\dXL)$/i;
const sizePart = (c) => { const v = String(c || '').split('/')[0].trim(); return SIZE_RE.test(v) ? v.toUpperCase() : null; };
const colourPart = (c) => {
  const parts = String(c || '').split('/').map((x) => x.trim()).filter(Boolean);
  if (parts.length > 1) return parts.slice(1).join(' / ');
  return parts[0] && !SIZE_RE.test(parts[0]) ? parts[0] : null;
};
/* Storefront footwear variants are UK sizes; the size offered is EU. Map EU to
   the usual UK size so a matching variant (and its SKU) can still be found. */
const EU_TO_UK = { 38: '5', 39: '6', 40: '6.5', 41: '7', 42: '8', 43: '9', 44: '9.5', 45: '10.5', 46: '11', 47: '12', 48: '13' };
const sameLetterSize = (a, b) => {
  const n = (x) => String(x).toUpperCase().replace(/^XXXL$/, '3XL').replace(/^XXL$/, '2XL');
  return n(a) === n(b);
};

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
  /** Chosen size. No default: a quote for the wrong size is worse than a prompt. */
  const [size, setSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const sizeGroupRef = useRef(null);
  const [copied, setCopied] = useState(false);
  /** Quantity for the single quote action. */
  const [qty, setQty] = useState(1);
  /** Sticky product bar, shown once the top of the page scrolls away. */
  const [showSticky, setShowSticky] = useState(false);
  /** Whether the main "Add to quote" button is on screen; the phone action bar
   *  only appears once it is not, so the two never show at the same time. */
  const [buyVisible, setBuyVisible] = useState(true);
  const buyRef = useRef(null);
  const topRef = useRef(null);

  // A new product starts with nothing picked.
  useEffect(() => { setColorIdx(0); setSize(null); setSizeError(false); }, [slug]);

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

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setBuyVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [product?.slug]);

  const zone = zoneOf(product);
  const range = rangeById(product?.range);
  // Spec data, diagrams, banners, reviews and videos are keyed by the original
  // storefront slug, which differs from the URL for renamed products.
  const dataKey = product?.key || slug;
  const tags = useMemo(() => (product ? groupTags(product) : null), [product]);
  // Catalogue standards carry their rating ("EN 388 3132X"); the description scan
  // adds anything else the copy mentions.
  const standards = useMemo(() => {
    if (!product) return [];
    const fromCatalogue = standardStrings(product.catalogueStandards);
    const seen = new Set(product.catalogueStandards.map((s) => s.code));
    return [...fromCatalogue, ...findStandards(product.desc || '').filter((s) => !seen.has(s))];
  }, [product]);

  // Rating tiles - real data only: protection areas (product tags) + standards.
  const ratingItems = useMemo(() => {
    if (!tags) return [];
    const areaTiles = tags.hazards.map((h) => ({
      name: h,
      title: h.toUpperCase(),
      value: '',
      icon: hazardIcon(h),
    }));
    // Catalogue standards render in <CertifiedTo>; tiles only cover the rest.
    const standardTiles = standards.slice(product?.catalogueStandards?.length || 0).map((s) => {
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
    // One small JSON per product (src/lib/details.js) instead of three
    // whole-catalogue modules (1.3 MB) for a few KB.
    loadDetails(dataKey)
      .then((d) => {
        if (!alive) return;
        setRich(d && (d.keyFeatures || d.design || d.remarks || d.tests) ? d : null);
        setDiagramImg(d?.diagram || null);
        setBannerImg(d?.banner || null);
        setDetailsLoaded(true);
      })
      .catch(() => {
        if (alive) { setRich(null); setDiagramImg(null); setBannerImg(null); setDetailsLoaded(true); }
      });
    return () => { alive = false; };
  }, [dataKey]);

  useEffect(() => { if (product) addRecent(product.slug); }, [product?.slug]);
  const recent = useRecentlyViewed().filter((p) => p.slug !== product?.slug);

  usePageMeta({
    title: product ? productTitle(product) : 'Product not found',
    noindex: !product,
    description: product ? productDescription(product) : undefined,
    canonical: `/products/${product?.slug || slug}`,
    image: product?.img,
    product: product
      ? { title: product.title, sku: product.variants?.[0]?.s || '', desc: product.desc, img: product.img }
      : null,
    crumbs: product
      ? [
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
          ...(zone ? [{ name: zone.label, path: `/products?cat=${zone.id}` }] : []),
          ...(range ? [{ name: range.label, path: `/products?range=${range.id}` }] : []),
          { name: product.title, path: `/products/${product.slug}` },
        ]
      : null,
  });

  // Unknown product: say so and suggest close matches (was a silent redirect).
  if (!product) return <NotFoundPage slug={slug} />;
  // Old storefront slug (see SLUG_RENAMES): send it to the product's real URL.
  if (product.slug !== slug) return <Navigate to={`/products/${product.slug}`} replace />;

  const variants = product.variants || [];
  const sizing = sizingFor(product);
  // Colours: from colour or "size / colour" variants, each with its first photo.
  const colourOptions = [];
  for (const v of variants) {
    const name = colourPart(v.c);
    if (!name) continue;
    const found = colourOptions.find((o) => o.name === name);
    if (!found) colourOptions.push({ name, img: v.img || null });
    else if (!found.img && v.img) found.img = v.img;
  }
  const colour = colourOptions[Math.min(colorIdx, Math.max(colourOptions.length - 1, 0))]?.name || null;
  // Unsized products keep the old one-row picker over the raw variants.
  const legacyPicker = !sizing && variants.length > 0 && !colourOptions.length;
  const variantType = variantKind(variants);
  const kindLabel = KIND_LABEL[variantType];
  const sizeMatches = (v) => {
    const vs = sizePart(v.c);
    if (!size || !vs) return !size;
    if (sizing?.kind === 'footwear') return vs === size || vs === EU_TO_UK[size];
    return sizing?.kind === 'garment' ? sameLetterSize(vs, size) : vs === size;
  };
  // The variant behind the current choice, for its SKU, stock and photo.
  const selected = legacyPicker
    ? variants[Math.min(colorIdx, variants.length - 1)]
    : variants.find((v) => (!colour || colourPart(v.c) === colour) && sizeMatches(v) && (size || colourPart(v.c)))
      || (colour ? variants.find((v) => colourPart(v.c) === colour) : null)
      || null;
  const selectedImg = selected?.img || colourOptions.find((o) => o.name === colour)?.img || null;
  const sizeText = size ? (sizing?.kind === 'footwear' ? `EU ${size}` : size) : '';

  const gallery = [];
  const pushImg = (u) => { if (u && !gallery.includes(u)) gallery.push(u); };
  if (selectedImg) pushImg(selectedImg);
  pushImg(product.img);
  (product.imgs || []).forEach(pushImg);

  const [activeImg, setActiveImg] = useState(0);

  const current = gallery[Math.min(activeImg, Math.max(gallery.length - 1, 0))];

  /* Product video, if we hold one. It renders in the buy column, under the
     datasheet button - not in the gallery, which stays photos only. Products
     with no clip get null and nothing is rendered. */
  const video = videoForProduct(product.key);

  const features = product.hasDesc ? featureBullets(product.desc) : [];
  const featList = rich?.keyFeatures?.length ? rich.keyFeatures : features;
  const featureRows = featList.map(splitFeature).filter(Boolean);
  // Overview copy, two sentences to a paragraph.
  //  - Storefront descriptions were stored cut at 600 characters, often
  //    mid-word ("a secure yet comfo"): drop that trailing fragment.
  //  - Sentences end in full stops in some descriptions and run together with
  //    only a capital in others (toSentences); split on both.
  //  - A sentence the key features already state word for word is left out,
  //    otherwise products whose description IS the feature list say it twice.
  const overview = (() => {
    if (!product.hasDesc) return [];
    let text = String(product.desc).replace(/\s+/g, ' ').trim();
    if (text.length >= 600 && !/[.!?)]$/.test(text) && text.lastIndexOf('. ') > 0) text = text.slice(0, text.lastIndexOf('. ') + 1);
    const norm = (x) => x.toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim();
    // Only once the spec data has loaded: before that, featList is a stand-in
    // built from the description itself and is not shown.
    const featText = detailsLoaded ? norm(featList.join(' ')) : '';
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/).flatMap(toSentences)
      .filter((x) => !(featText && featText.includes(norm(x))));
    const out = [];
    for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).map((x) => (/[.!?]$/.test(x) ? x : x.replace(/[;,]?$/, '.'))).join(' '));
    return out;
  })();

  // Similar products: the same product type first, then products in the same
  // zone used in the same industries, each in featured order. (This used to be
  // the first six products of the zone, whatever they were.)
  const others = (list) => list.filter((p) => p.slug !== product.slug && p.img);
  const sameRange = product.range ? others(productsByRange(product.range)).sort(byFeatured) : [];
  const myIndustries = new Set(product.industries || []);
  const sameUse = others(productsByZone(zone?.id))
    .filter((p) => !sameRange.includes(p) && (p.industries || []).some((i) => myIndustries.has(i)))
    .sort(byFeatured);
  const related = [...sameRange, ...sameUse].slice(0, 8);

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

  const { add } = useQuote();
  const quoteItem = {
    slug: product.slug, title: product.title, img: product.img,
    sku: (sizing ? size && selected?.s : selected?.s) || '',
    option: legacyPicker ? selected?.c || '' : [sizeText, colour].filter(Boolean).join(' / '),
  };
  /** Every "add" path goes through here: a sized product needs a size first. */
  const addToQuote = (n = qty) => {
    if (sizing && !size) {
      setSizeError(true);
      sizeGroupRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      sizeGroupRef.current?.querySelector('[aria-labelledby="size-label"] button')?.focus({ preventScroll: true });
      return false;
    }
    add(quoteItem, n);
    setQty(1);
    return true;
  };
  const specs = {
    zone: zone?.label || 'Not specified',
    range: range?.label || '',
    colours: colourOptions.map((o) => o.name).join(', ') || product.colours?.join(', ') || 'Not specified',
    sizes: sizing ? sizing.label : product.sizes || '',
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
            {range && (
              <>
                <Link to={`/products?range=${range.id}`}>{range.label}</Link>
                <span>/</span>
              </>
            )}
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
              <span className="eyebrow">{range ? range.label : zone?.label}</span>
              <h1 className="pdp-title">{product.title}</h1>

              {/* One grey meta line under the title (BBC pattern): SKU, then
                  stock as a dot pill. The buy column had no at-a-glance status
                  line at all before this. */}
              <div className="pdp-metaline">
                {quoteItem.sku && (
                  <>
                    <span>SKU {quoteItem.sku}</span>
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
                  "Overview" panel below, so the same two paragraphs
                  appeared twice on one screen. The panel keeps the full text
                  plus the tag chips; this column stays a buy column. */}
              {/* Catalogue rows (symbols + CE + coded standards) replace the
                  tag-derived tiles wherever the catalogue covers the product. */}
              {product.catalogueSymbols.length || product.catalogueStandards.length ? (
                <CertifiedTo symbols={product.catalogueSymbols} standards={product.catalogueStandards} ce={product.ce} />
              ) : (
                <PerformanceRatings items={ratingItems} />
              )}
              {/* product.industries (see productIndustries.js), not the raw storefront
                  tags: those listed one sector under up to four spellings and were
                  missing on half the range. Each chip opens that industry's listing,
                  which is built from the same data, so the two always agree. */}
              {product.industries.length > 0 && (
                <div className="detail-taggroup">
                  <h2>Useful in these industries</h2>
                  <div className="chip-row">
                    {product.industries.map((slug) => (
                      <Link key={slug} to={`/products?industry=${slug}`} className="chip">{industryLabel(slug)}</Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Colour, then size: two separate choices. Sizes are the ranges
                  in data/sizes.js (gloves 6-11, footwear EU 38-48, garments
                  S-XXXL). Size has no default, so "Add to quote" asks for one. */}
              {legacyPicker && (
                <div className="detail-taggroup">
                  <div className="detail-taggroup__head">
                    <h2>Select {kindLabel} <span className="detail-pick">{selected?.c || ''}</span></h2>
                  </div>
                  <div className={`color-row${variantType !== 'colour' ? ' color-row--text' : ''}`}>
                    {variants.map((v, i) => (
                      <button key={v.c + i} type="button" className={`color-swatch color-swatch--text${i === colorIdx ? ' active' : ''}`} onClick={() => setColorIdx(i)} aria-pressed={i === colorIdx}>
                        {String(v.c)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colourOptions.length > 0 && (
                <div className="detail-taggroup">
                  <div className="detail-taggroup__head">
                    <h2>Select colour <span className="detail-pick">{colour || ''}</span></h2>
                  </div>
                  <div className={`color-row${colourOptions.some((o) => o.img) ? '' : ' color-row--text'}`}>
                    {colourOptions.map((o, i) => (
                      <button
                        key={o.name}
                        type="button"
                        className={`color-swatch${o.img ? '' : ' color-swatch--text'}${o.name === colour ? ' active' : ''}`}
                        onClick={() => { setColorIdx(i); setActiveImg(0); }}
                        aria-label={`Colour ${o.name}`}
                        aria-pressed={o.name === colour}
                        title={o.name}
                      >
                        {o.img ? <img src={o.img} alt="" loading="lazy" /> : o.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizing && (
                <div className={`detail-taggroup${sizeError ? ' has-error' : ''}`} ref={sizeGroupRef}>
                  <div className="detail-taggroup__head">
                    <h2 id="size-label">Select size <span className="detail-pick">{sizeText || (sizing.kind === 'footwear' ? '(EU)' : '')}</span></h2>
                    <SizeGuide kind={sizing.kind} />
                  </div>
                  <div className="color-row color-row--text" role="group" aria-labelledby="size-label" aria-describedby={sizeError ? 'size-error' : undefined}>
                    {sizing.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        className={`color-swatch color-swatch--text${sz === size ? ' active' : ''}`}
                        onClick={() => { setSize(sz); setSizeError(false); }}
                        aria-pressed={sz === size}
                        aria-label={`Size ${sizing.kind === 'footwear' ? 'EU ' : ''}${sz}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                  {sizeError && <p className="detail-size-error" id="size-error" role="alert">Choose a size to add this to your quote.</p>}
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
                    Ask our specialist about this product <IconArrowRight width="14" height="14" />
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
                      <QtyInput value={qty} onChange={setQty} />
                      <button type="button" onClick={() => setQty((q) => Math.min(QTY_MAX, q + 1))} aria-label="Increase quantity">
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    ref={buyRef}
                    className="pdp-add"
                    onClick={() => addToQuote()}
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
                  {/* Only claims the site already makes elsewhere; add lead times and
                      minimum order here once the client confirms them. */}
                  <ul className="pdp-assure">
                    <li>Stocked in Lagos, delivered nationwide</li>
                    <li>No payment to request a quote</li>
                    <li>Test certificates and declarations of conformity on request</li>
                  </ul>
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

        {/* ---------- Product information ----------
            One section. It replaced the "Designed For / Description" tab block
            AND the accordions under it (Oct 2026), which showed the same
            catalogue copy twice: the tab's statement was the description cut at
            150 characters, its feature rows were the "Key features" list, and
            its Description tab repeated the Design and Remarks under "Product
            details". Its right column also repeated the main product photo.

            Stacked sections rather than tabs: shoppers overlook content behind
            horizontal tabs on product pages, while sections are scanned. The
            Overview opens by default. The product video, where we hold one,
            sits beside the text and stays in view; without one, the text keeps
            a readable measure instead of a repeated photo. */}
        <section className="container pinfo" aria-labelledby="pinfo-title">
          <h2 id="pinfo-title" className="pinfo__title">Product information</h2>
          <div className={`pinfo__grid${video ? ' has-media' : ''}`}>
            <div className="detail-accordions pinfo__main">
              <details open>
                <summary>Overview</summary>
                <div className="acc-body">
                  {overview.length
                    ? overview.map((p, i) => <p key={i} className="pinfo__lead">{p}</p>)
                    : !featureRows.length && <p className="pinfo__lead">Certified product within the {zone?.label.toLowerCase()} range.</p>}
                  {!detailsLoaded ? (
                    /* Skeleton while the spec data loads, rather than a line
                       that is briefly untrue. */
                    <div aria-hidden="true" style={{ marginTop: 18 }}>
                      <span className="skeleton skeleton--text" style={{ width: '92%' }} />
                      <span className="skeleton skeleton--text" style={{ width: '84%' }} />
                      <span className="skeleton skeleton--text" style={{ width: '70%' }} />
                    </div>
                  ) : featureRows.length > 0 && (
                    <>
                      <h3 className="acc-sub">Key features</h3>
                      <ul className="pinfo__features">
                        {featureRows.map((f, i) => (
                          <li key={i}>
                            <IconCheck width="18" height="18" aria-hidden="true" />
                            <span>{f.title && <strong>{f.title}</strong>}{f.title ? ' ' : ''}{f.text}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {tags.misc.length > 0 && (
                    <div className="chip-row" style={{ marginTop: 16 }}>{tags.misc.slice(0, 12).map((t) => <span key={t} className="chip">{t}</span>)}</div>
                  )}
                </div>
              </details>

              <details>
                <summary>Specifications</summary>
                <div className="acc-body">
                  <dl className="acc-dl">
                    <dt>Zone</dt><dd>{zone?.label}</dd>
                    <dt>Product line</dt><dd>{range?.label || typeLabel(product) || 'Not specified'}</dd>
                    {product.collection && (<><dt>Mallcom collection</dt><dd>{product.collection}</dd></>)}
                    {/* Catalogue-only products carry sizes/colours as printed, not as variants. */}
                    {sizing
                      ? <><dt>Sizes</dt><dd>{sizing.kind === 'footwear' ? 'EU ' : ''}{sizing.sizes.join(', ')}</dd></>
                      : product.sizes && <><dt>Sizes</dt><dd>{product.sizes}</dd></>}
                    {colourOptions.length > 0
                      ? <><dt>Colours</dt><dd>{colourOptions.map((o) => o.name).join(', ')}</dd></>
                      : product.colours?.length > 0 && <><dt>Colours</dt><dd>{product.colours.join(', ')}</dd></>}
                    {variants.length > 0 && (
                      <>
                        <dt>SKUs</dt><dd>{variants.map((v) => v.s).filter(Boolean).join(', ') || 'Not specified'}</dd>
                        <dt>Weight</dt><dd>{specs.weight}</dd>
                      </>
                    )}
                    <dt>Order model</dt><dd>Enquiry / quotation, volume &amp; custom branding supported</dd>
                  </dl>
                  {rich?.design?.length > 0 && (
                    <>
                      <h3 className="acc-sub">Design</h3>
                      <ul className="spec-list">
                        {rich.design.map((d, i) => <li key={i}><IconCheck width="17" height="17" /> {d}</li>)}
                      </ul>
                    </>
                  )}
                  {rich?.remarks?.length > 0 && (
                    <>
                      <h3 className="acc-sub">Remarks</h3>
                      <ul className="spec-list">
                        {rich.remarks.map((r, i) => <li key={i}><IconCheck width="17" height="17" /> {r}</li>)}
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
                      <h3 className="acc-sub">Tests conducted</h3>
                      <ul className="spec-list">
                        {rich.tests.map((t, i) => <li key={i}><IconCheck width="17" height="17" /> {t}</li>)}
                      </ul>
                    </>
                  )}
                  <p style={{ marginTop: 10 }}>Full test certificates, batch records and conformity documentation available on request from our quality team.</p>
                </div>
              </details>

              {/* The Reviews tab was removed: we hold no review data. Put it
                  back when there are real, verifiable reviews to display. */}
            </div>

            {video && (
              <aside className="pinfo__media" aria-label={`${product.title} video`}>
                <ProductVideo mp4={video.mp4} poster={video.poster} title={product.title} fit="contain" />
              </aside>
            )}
          </div>
        </section>
      </section>

      {/* ---------- Similar products ----------
          The Gymshark carousel: a 4-up strip of frameless cards, one text size,
          no chip, no button. Trialled on DIAMOND III, now on every product. */}
      {related.length > 1 && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: 40 }}>
          <div className="container">
            <RecommendRow products={related} title={sameRange.length >= 4 && range ? `More ${range.label.toLowerCase()}` : 'Similar products'} />
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
            <span>{quoteItem.sku ? `SKU ${quoteItem.sku}` : typeLabel(product) || zone?.label}</span>
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
            onClick={() => addToQuote()}
          >
            Request quote
          </button>
        </div>
      </div>

      {/* ---------- Mobile sticky action bar ---------- */}
      {/* Phone action bar: two actions only. "Request quote" was a third button
          that did nearly the same as "Add to quote"; the quote list sends it. */}
      <div className={`pdp-sticky${buyVisible ? '' : ' is-visible'}`} aria-hidden={buyVisible}>
        <button type="button" className="btn hx-btn" tabIndex={buyVisible ? -1 : 0} onClick={() => addToQuote()}>Add to quote</button>
        <button type="button" className="btn btn--outline-dark" tabIndex={buyVisible ? -1 : 0} onClick={() => downloadDatasheet(product, specs)}>Datasheet</button>
      </div>
    </>
  );
}
