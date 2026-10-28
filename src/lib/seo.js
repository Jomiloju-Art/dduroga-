import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HOME_TITLE } from './seoText.js';

/**
 * Per-page SEO meta.
 *
 * IMPORTANT: everything here runs in the browser, so it only helps consumers
 * that execute JavaScript. Crawlers (WhatsApp, Facebook, LinkedIn, Google's
 * first fetch) do NOT run our app — the tags they read live statically in
 * index.html. Keep the two in sync.
 *
 * SITE_URL is the single place to change when the production domain changes
 * (index.html and public/sitemap.xml need the same change).
 */
const SITE = 'DDUROGA Safety';
export const DEFAULT_DESCRIPTION =
  'DDUROGA Safety supplies certified PPE for head, hand, body and feet protection, trusted by industry across the country.';
export const SITE_URL = 'https://dduroga.com';

const SCHEMA_IDS = ['schema-product', 'schema-breadcrumb'];

function setMeta(attr, key, content) {
  let m = document.querySelector(`meta[${attr}="${key}"]`);
  if (!m) {
    m = document.createElement('meta');
    m.setAttribute(attr, key);
    document.head.appendChild(m);
  }
  m.setAttribute('content', content);
}

function setLink(rel, href) {
  let l = document.querySelector(`link[rel="${rel}"]`);
  if (!l) {
    l = document.createElement('link');
    l.setAttribute('rel', rel);
    document.head.appendChild(l);
  }
  l.setAttribute('href', href);
}

function setSchema(id, data) {
  document.getElementById(id)?.remove();
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id = id;
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

const abs = (u) => (u && u.startsWith('http') ? u : SITE_URL + (u || ''));

/** First real SKU we hold for the product, if any. */
function firstSku(product) {
  const v = (product.variants || []).find((x) => x.s);
  return v?.s || product.sku || undefined;
}

/**
 * Product schema. Deliberately omits `offers`: Google requires a price inside an
 * Offer, and we quote rather than publish prices, so a price-less Offer would be
 * invalid markup rather than useful markup.
 */
function productSchema(product, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: firstSku(product),
    description: (product.desc || '').slice(0, 300) || undefined,
    image: product.img ? [abs(product.img)] : undefined,
    category: product.type || undefined,
    brand: { '@type': 'Brand', name: SITE },
    manufacturer: { '@type': 'Organization', name: 'Mallcom' },
    url,
  };
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/**
 * Set per-page SEO meta.
 * @param product  pass a product to emit Product schema
 * @param crumbs   [{ name, path }] to emit BreadcrumbList schema
 */
export function usePageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  /** Defaults to the current path, so a page that forgets it never claims to be the homepage. */
  canonical,
  image = '/og-image.jpg',
  product = null,
  crumbs = null,
  /** Keep utility pages (search, quote list, not found) out of search engines. */
  noindex = false,
}) {
  const crumbsKey = crumbs ? JSON.stringify(crumbs) : '';
  const productKey = product ? JSON.stringify({ s: product.slug, t: product.title }) : '';

  const { pathname } = useLocation();
  const canonicalPath = canonical || pathname;

  useEffect(() => {
    const url = abs(canonicalPath);
    const img = abs(image);
    const fullTitle = title ? `${title} | ${SITE}` : HOME_TITLE;

    document.title = fullTitle;

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    setMeta('property', 'og:title', fullTitle);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('property', 'og:type', product ? 'product' : 'website');
    setMeta('property', 'og:site_name', SITE);
    setMeta('property', 'og:locale', 'en_NG');
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:image', img);
    setLink('canonical', url);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    if (product) setSchema('schema-product', productSchema(product, url));
    if (crumbs && crumbs.length) setSchema('schema-breadcrumb', breadcrumbSchema(crumbs));

    return () => SCHEMA_IDS.forEach((id) => document.getElementById(id)?.remove());
  }, [title, description, canonicalPath, image, crumbsKey, productKey, noindex]);
}
