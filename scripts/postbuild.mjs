/**
 * Runs after `vite build` and the server build (see package.json). Writes what
 * a single-page app cannot produce on its own:
 *
 *   dist/_p/**.html   one HTML file per real route, with that page's title,
 *                     description, canonical and share image in the head, and
 *                     the page's own text in the body (server-rendered from
 *                     dist-ssr/entry-server.js). WhatsApp, LinkedIn and
 *                     Facebook never run JavaScript, and Google reads the HTML
 *                     before it renders, so without these every page looked
 *                     like an empty homepage. vercel.json rewrites each route
 *                     to its file, including the category, product-type and
 *                     industry listings (/products?range=…).
 *   dist/404.html     the app shell marked noindex, so unknown paths get a real
 *                     404 status.
 *   dist/sitemap.xml  every indexable URL.
 *   dist/robots.txt   points to the sitemap; keeps search and the quote list out.
 *
 * Titles and descriptions come from src/data/pageMeta.js and src/lib/seoText.js,
 * the same modules the pages use in the browser.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const load = (p) => import(pathToFileURL(path.join(root, p)).href);

const { allProducts } = await load('src/data/products.js');
const { guides } = await load('src/data/guides.js');
const { pageMeta } = await load('src/data/pageMeta.js');
const seoText = await load('src/lib/seoText.js');
const SITE_URL = 'https://dduroga.vercel.app';
const { SITE, HOME_TITLE } = seoText;

// The server renderer is optional: without it the pages still get the right
// head, just an empty body, as before.
const ssrFile = path.join(root, 'dist-ssr/entry-server.js');
const ssr = fs.existsSync(ssrFile) ? await import(pathToFileURL(ssrFile).href) : null;
let rendered = 0, renderFailed = [];

const DEFAULT_IMAGE = '/og-image.png';
const DEFAULT_DESCRIPTION = 'DDUROGA Safety supplies certified PPE for head, hand, body and feet protection, trusted by industry across the country.';
const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const abs = (u) => (u.startsWith('http') ? u : SITE_URL + u);
const clip = (s, n = 160) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
};

function setTag(html, attr, key, value) {
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[:]/g, '\\$&')}"\\s+content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

async function body(url) {
  if (!ssr) return '';
  try { rendered++; return await ssr.render(url); } catch (e) { rendered--; renderFailed.push(`${url}: ${String(e.message || e).slice(0, 120)}`); return ''; }
}

/** The shell with one page's head values and body swapped in. */
async function render({ url, title, fullTitle, description, canonical, image = DEFAULT_IMAGE, type = 'website', noindex = false }) {
  const t = fullTitle || (title ? `${title} | ${SITE}` : HOME_TITLE);
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(t)}</title>`);
  html = setTag(html, 'name', 'description', description);
  html = setTag(html, 'property', 'og:type', type);
  html = setTag(html, 'property', 'og:title', t);
  html = setTag(html, 'property', 'og:description', description);
  html = setTag(html, 'name', 'twitter:title', t);
  html = setTag(html, 'name', 'twitter:description', description);
  html = setTag(html, 'property', 'og:image', abs(image));
  html = setTag(html, 'name', 'twitter:image', abs(image));
  if (image !== DEFAULT_IMAGE) {
    // The fixed 1200x630 size belongs to og-image.png only.
    html = html.replace(/\s*<meta\s+property="og:image:(width|height)"\s+content="[^"]*"\s*\/?>/g, '');
  }
  if (canonical) {
    html = setTag(html, 'property', 'og:url', abs(canonical));
    html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${esc(abs(canonical))}" />`);
  } else {
    html = html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '');
  }
  if (noindex) html = setTag(html, 'name', 'robots', 'noindex, follow');
  const content = await body(url);
  if (content) html = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
  return html;
}

function write(rel, html) {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const indexable = ['/'];
let count = 0;

// Fixed pages. The homepage is index.html itself; /products is a listing below.
for (const [route, meta] of Object.entries(pageMeta)) {
  if (route === '/products') continue;
  if (route === '/') {
    write('index.html', await render({ url: '/', ...meta, description: meta.description, canonical: '/' }));
    continue;
  }
  write(`_p${route}.html`, await render({ url: route, ...meta, description: meta.description || DEFAULT_DESCRIPTION, canonical: route }));
  if (!meta.noindex) indexable.push(route);
  count++;
}

// Product listings: all products, and each zone, product type and industry.
const listings = [{ query: '', params: {} }, ...seoText.listingRoutes()];
for (const { query, params } of listings) {
  const l = seoText.listingFor(params);
  const route = `/products${query ? `?${query}` : ''}`;
  const file = query ? `_p/products-${Object.keys(params)[0]}/${Object.values(params)[0]}.html` : '_p/products.html';
  write(file, await render({ url: route, title: seoText.listingTitle(l), description: seoText.listingDescription(l), canonical: route }));
  indexable.push(route);
  count++;
}

for (const p of allProducts) {
  const route = `/products/${p.slug}`;
  write(`_p${route}.html`, await render({
    url: route,
    title: seoText.productTitle(p),
    description: seoText.productDescription(p) || DEFAULT_DESCRIPTION,
    canonical: route,
    image: p.img || DEFAULT_IMAGE,
    type: 'product',
  }));
  indexable.push(route);
  count++;
}

for (const g of guides) {
  const route = `/learning/${g.slug}`;
  write(`_p${route}.html`, await render({
    url: route,
    title: `${g.title} · Learning`,
    description: clip(g.summary),
    canonical: route,
    image: `/guides/${g.slug}.jpg`,
    type: 'article',
  }));
  indexable.push(route);
  count++;
}

write('404.html', await render({ url: '/page-not-found', title: 'Page not found', description: DEFAULT_DESCRIPTION, noindex: true }));

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((u) => `  <url><loc>${esc(SITE_URL + u)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);

write('robots.txt', `User-agent: *
Allow: /
Disallow: /quote
Disallow: /search

Sitemap: ${SITE_URL}/sitemap.xml
`);

console.log(`postbuild: ${count} route pages (${rendered} with server-rendered content), 404.html, sitemap.xml (${indexable.length} URLs), robots.txt`);
if (renderFailed.length) console.log('postbuild: server render failed for\n  ' + renderFailed.join('\n  '));
