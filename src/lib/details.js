/**
 * One product's rich details (key features, design, remarks, tests, diagram
 * and design-banner image), written per product by scripts/build-catalog.mjs
 * to public/data/details/<key>.json. Resolves to null when a product has none.
 */
const cache = new Map();

export const detailFile = (key) => `/data/details/${String(key).replace(/[^a-z0-9_-]/gi, '_')}.json`;

export function loadDetails(key) {
  if (!key) return Promise.resolve(null);
  if (!cache.has(key)) {
    cache.set(key, fetch(detailFile(key))
      .then((r) => (r.ok && /json/.test(r.headers.get('content-type') || '') ? r.json() : null))
      .catch(() => null));
  }
  return cache.get(key);
}
