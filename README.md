# Aegis Industrial - Corporate Website (React + Vite)

A structural clone of the **mallcom.in homepage anatomy** (mega-menu header, hero, story,
industry/hazard/protection/region explorers, shop band, news, statements, blog, catalogue,
dealer finder, testimonials, newsletter footer) rebuilt from scratch as a React app.

Faithfulness notes:
- **Layout, section order, typography and palette mirror the original** (Barlow + Roboto,
  off-white/black + gold `#FCB814`, uppercase display headings, outlined-text hero treatment).
- **Everything else is original placeholder material** - brand name ("Aegis Industrial"),
  copy, product names, vector artwork. Mallcom's logo, photography, marketing text and product
  data are **not** copied, so the result is safe to rebrand and use commercially.
- Swap placeholder artwork/copy for your own assets before launch.

## Stack

- React 18 + React Router 6 (client-side routing)
- Vite 5 (dev server, production build)
- Plain CSS with design tokens + Google Fonts (Barlow, Roboto) - no UI framework, no images

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

Requires Node 18+ (tested on Node 24).

## Project structure

```
corporate-site/
├─ index.html                 # entry HTML (title, meta, favicon)
├─ vite.config.js
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.jsx                # React root + BrowserRouter
   ├─ App.jsx                 # route table
   ├─ data/
   │  ├─ brand.js             # ★ brand name, contact details (edit me)
   │  └─ products.js          # ★ catalogue: categories + products (edit me)
   ├─ styles/
   │  └─ index.css            # design tokens + all component styles
   ├─ components/
   │  ├─ Layout.jsx           # nav + routed page + footer frame
   │  ├─ Navbar.jsx           # utility top bar + sticky nav (mobile drawer)
   │  ├─ Footer.jsx
   │  ├─ Logo.jsx             # inline shield logo
   │  ├─ PageHero.jsx         # dark banded inner-page header
   │  ├─ CtaBand.jsx          # reusable conversion band
   │  ├─ ProductCard.jsx
   │  ├─ ProductArt.jsx       # decorative SVG per category (swap for photos)
   │  ├─ Icons.jsx            # small inline icon set
   │  └─ ScrollToTop.jsx
   └─ pages/
      ├─ HomePage.jsx         # hero, compliance strip, categories, features, stats
      ├─ ProductsPage.jsx     # filterable catalogue (?cat= hand/foot/eye/head/…)
      ├─ ProductDetailPage.jsx# per-product route: /products/:slug
      ├─ AboutPage.jsx
      ├─ ContactPage.jsx      # validated form (?product= pre-fills)
      └─ NotFoundPage.jsx
```

## Customising

1. **Brand & contact** - edit `src/data/brand.js`. Name, legal name, phone, email,
   address and hours feed the navbar, footer, contact page and CTA band automatically.
2. **Catalogue** - edit `src/data/products.js`. Categories and products drive the home page,
   product pages, filters and related items. Add/remove entries freely.
3. **Colours** - the mallcom-style palette (off-white/black + gold `#FCB814`, Barlow/Roboto
   fonts) lives in the `:root` tokens at the end of `src/styles/index.css`.
4. **Imagery** - cards currently render geometric SVG placeholders (`ProductArt.jsx`).
   For real photography, replace `.card-art` / `.detail-art` backgrounds or the `<ProductArt>`
   element with `<img>` tags.
5. **Logo / favicon** - `src/components/Logo.jsx` and `public/favicon.svg`.

## Wiring the contact form (required before launch)

`ContactPage.jsx` currently validates and shows a success state, then offers a `mailto:` fallback.
Point `handleSubmit` at your API, CRM or email service (e.g. `fetch('/api/enquiries', { method: 'POST', body: JSON.stringify(form) })`).

## Deploying

Any static host works (Netlify, Vercel, Cloudflare Pages, S3+CDN). Because routing is client-side,
configure SPA fallback so unknown paths serve `index.html` - e.g. for nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Legal note

This is original placeholder code and content, built for your own branding. Do not copy the
design assets, copy or product lines of other companies (including Mallcom) into it for
commercial use - recreate everything in your own words and assets.
