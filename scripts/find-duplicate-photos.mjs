/**
 * Finds repeated photos within each product and writes them to
 * src/data/duplicatePhotos.generated.json as { productKey: { dupPath: keepPath } }.
 * scripts/build-catalog.mjs applies it: the repeat leaves the gallery, and any
 * colour variant that pointed at it points at the kept copy instead.
 *
 * Two kinds of repeat, found two ways (calibrated by eye, Oct 2026):
 *
 *  1. The main photo (/products/<slug>.webp) and gallery photo 1. The main
 *     photo was made from the storefront's featured image, which is also the
 *     first gallery photo, so every product showed the same shot twice. The
 *     WebP conversion shifted its colour (up to ~22 on the colour measure
 *     below) and sometimes its framing, so these are matched on shape only,
 *     with a loose limit. All 235 such pairs were checked to be the same shot.
 *
 *  2. Any other pair: only near-exact copies (the same file uploaded twice).
 *     The limits are tight on purpose. The same garment photographed in
 *     another colour (arcus, cumulus, nimbus, stratus) differs by only
 *     ~2.6-3.6 on colour and 0-3 on shape, and those must stay.
 *
 * Measures, on white-flattened copies:
 *   colour  mean RGB difference over the product (not the background), 32x32
 *   shape   16x16 difference hash, Hamming distance (0-256)
 *
 *   node scripts/find-duplicate-photos.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

const MAIN_SHAPE_LIMIT = 32;     // rule 1
const COPY_COLOUR_LIMIT = 2.4;   // rule 2
const COPY_SHAPE_LIMIT = 2;      // rule 2

const { catalog } = await import(pathToFileURL(path.join(root, 'src/data/catalogSource.js')).href);
const products = Object.values(catalog).flat();

async function fingerprint(rel) {
  const file = path.join(pub, rel);
  if (!fs.existsSync(file)) return null;
  const img = sharp(file).flatten({ background: '#ffffff' });
  const col = await img.clone().resize(32, 32, { fit: 'contain', background: '#ffffff' }).removeAlpha().raw().toBuffer();
  const g = await img.clone().resize(17, 16, { fit: 'contain', background: '#ffffff' }).greyscale().raw().toBuffer();
  const bits = [];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits.push(g[y * 17 + x] > g[y * 17 + x + 1] ? 1 : 0);
  const at = (i) => [col[i], col[i + 1], col[i + 2]];
  const corners = [0, 31 * 3, 32 * 31 * 3, (32 * 32 - 1) * 3].map(at);
  const bg = [0, 1, 2].map((k) => corners.reduce((s, v) => s + v[k], 0) / 4);
  return { col, bits, bg };
}

function compare(a, b) {
  let s = 0, n = 0;
  const fg = (p, i) => Math.abs(p.col[i] - p.bg[0]) + Math.abs(p.col[i + 1] - p.bg[1]) + Math.abs(p.col[i + 2] - p.bg[2]) > 45;
  for (let i = 0; i < a.col.length; i += 3) {
    if (!fg(a, i) && !fg(b, i)) continue;
    n++;
    s += (Math.abs(a.col[i] - b.col[i]) + Math.abs(a.col[i + 1] - b.col[i + 1]) + Math.abs(a.col[i + 2] - b.col[i + 2])) / 3;
  }
  let shape = 0;
  for (let i = 0; i < a.bits.length; i++) shape += a.bits[i] !== b.bits[i];
  return { colour: n ? s / n : 0, shape };
}

const result = {};
let photos = 0, mainRepeats = 0, copies = 0;
for (const p of products) {
  const paths = [...new Set([p.img, ...(p.imgs || []), ...(p.variants || []).map((v) => v.img)]
    .filter((u) => typeof u === 'string' && u.startsWith('/')))];
  const fps = [];
  for (const rel of paths) { const f = await fingerprint(rel); if (f) fps.push({ rel, ...f }); }
  photos += fps.length;

  const keepOf = {};
  const main = fps.find((f) => f.rel === p.img);
  const first = fps.find((f) => f.rel === (p.imgs || [])[0]);
  if (main && first && main !== first && compare(main, first).shape <= MAIN_SHAPE_LIMIT) {
    keepOf[first.rel] = main.rel;
    mainRepeats++;
  }
  // A product can show several products' photos (a merged product, or one
  // whose main photo was swapped, see catalogSource.js): pair each original
  // main photo /products/<x>.webp with its own gallery photo 1 too.
  for (const m of fps) {
    const x = m.rel.match(/^\/products\/([^/]+)\.webp$/)?.[1];
    const g1 = x && fps.find((f) => f.rel === `/products/gallery/${x}/1.webp`);
    if (g1 && g1.rel !== p.img && !keepOf[g1.rel] && compare(m, g1).shape <= MAIN_SHAPE_LIMIT) {
      keepOf[g1.rel] = m.rel;
      mainRepeats++;
    }
  }
  for (let i = 0; i < fps.length; i++) {
    if (keepOf[fps[i].rel]) continue;
    for (let j = i + 1; j < fps.length; j++) {
      if (keepOf[fps[j].rel]) continue;
      const r = compare(fps[i], fps[j]);
      if (r.colour < COPY_COLOUR_LIMIT && r.shape <= COPY_SHAPE_LIMIT) { keepOf[fps[j].rel] = fps[i].rel; copies++; }
    }
  }
  if (Object.keys(keepOf).length) result[p.key] = keepOf;
}

fs.writeFileSync(path.join(root, 'src/data/duplicatePhotos.generated.json'), JSON.stringify(result, null, 1) + '\n');
console.log(`find-duplicate-photos: ${products.length} products, ${photos} photos; removed ${mainRepeats} main-photo repeats and ${copies} other copies across ${Object.keys(result).length} products`);
