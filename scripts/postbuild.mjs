/**
 * Runs after `vite build` (see package.json). Writes what a single-page app
 * cannot produce on its own:
 *
 *   dist/_p/**.html   one HTML shell per real route, with that page's title,
 *                     description, canonical and share image already in the
 *                     markup. WhatsApp, LinkedIn and Facebook never run our
 *                     JavaScript, so without these every shared link
 *                     previewed as the homepage. vercel.json rewrites each
 *                     route to its file.
 *   dist/404.html     the app shell marked noindex. A path with no rewrite and
 *                     no file (a typo, a retired product) now gets a real 404
 *                     status instead of a 200 homepage.
 *   dist/sitemap.xml  every indexable URL, so crawlers find all products.
 *   dist/robots.txt   points to the sitemap; keeps search/quote out.
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
const { SITE_URL } = await load('src/lib/seo.js').catch(() => ({ SITE_URL: 'https://dduroga.vercel.app' }));

const SITE = 'DDUROGA Safety';
const HOME_TITLE = 'DDUROGA Safety: Personal Protective Equipment';
const DEFAULT_IMAGE = '/og-image.png';
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

/** The shell with one page's head values swapped in. */
function render({ title, description, canonical, image = DEFAULT_IMAGE, type = 'website', noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE}` : HOME_TITLE;
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`);
  html = setTag(html, 'name', 'description', description);
  html = setTag(html, 'property', 'og:type', type);
  html = setTag(html, 'property', 'og:title', fullTitle);
  html = setTag(html, 'property', 'og:description', description);
  html = setTag(html, 'name', 'twitter:title', fullTitle);
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
  return html;
}

function write(rel, html) {
  const file = path.join(dist, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const DEFAULT_DESCRIPTION = 'DDUROGA Safety supplies certified PPE for head, hand, body and feet protection, trusted by industry across the country.';
const indexable = ['/'];
let count = 0;

// Fixed pages. The homepage is index.html itself.
for (const [route, meta] of Object.entries(pageMeta)) {
  if (route === '/') {
    write('index.html', render({ ...meta, canonical: '/' }));
    continue;
  }
  write(`_p${route}.html`, render({ ...meta, description: meta.description || DEFAULT_DESCRIPTION, canonical: route }));
  if (!meta.noindex) indexable.push(route);
  count++;
}

for (const p of allProducts) {
  const route = `/products/${p.slug}`;
  write(`_p${route}.html`, render({
    title: p.fullTitle || p.title,
    description: clip(p.desc) || DEFAULT_DESCRIPTION,
    canonical: route,
    image: p.img || DEFAULT_IMAGE,
    type: 'product',
  }));
  indexable.push(route);
  count++;
}

for (const g of guides) {
  const route = `/learning/${g.slug}`;
  write(`_p${route}.html`, render({
    title: `${g.title} · Learning`,
    description: clip(g.summary),
    canonical: route,
    image: `/guides/${g.slug}.jpg`,
    type: 'article',
  }));
  indexable.push(route);
  count++;
}

write('404.html', render({ title: 'Page not found', description: DEFAULT_DESCRIPTION, noindex: true }));

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

console.log(`postbuild: ${count} route pages, 404.html, sitemap.xml (${indexable.length} URLs), robots.txt`);
