/**
 * Sorts each colour product's gallery by colour and writes
 * src/data/colourPhotos.generated.json as { productKey: { colour: [paths] } }.
 * scripts/build-catalog.mjs attaches it as product.colourPhotos, and the
 * product page then shows only the chosen colour's photos (client's request,
 * 30 Oct 2026: picking yellow changed the first photo and left the rest blue).
 *
 * The storefront tags one photo per colour (the colour variant's photo); the
 * other angles are untagged. Each untagged photo goes to the colour whose
 * tagged photo it matches:
 *   chromatic   enough saturated pixels: nearest dominant hue, within
 *               HUE_LIMIT degrees and clearly nearer than the next colour
 *   achromatic  white, grey or black: nearest brightness among the colour
 *               photos that are themselves achromatic
 * Only plain product shots are sorted: an even background (four similar
 * corners) and, if coloured, one hue covering much of the product. Scenes of
 * people at work, collages and photos that fit no colour are left out, and
 * the product page shows them with every colour.
 * Merged products (extraProducts.js MERGED) list their colours' photos
 * themselves and are skipped.
 *
 *   node scripts/find-colour-photos.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');

const SAT_MIN = 0.35;        // a pixel counts as coloured above this saturation
const PEAK_SHARE = 0.3;      // a coloured photo: its main hue covers this share of the product
const GREY_SHARE = 0.1;      // a white/grey/black photo: at most this share coloured
const CORNER_SPREAD = 40;    // an even background: corners this close to each other
const HUE_LIMIT = 25;        // degrees from the colour's own photo
const HUE_MARGIN = 8;        // degrees nearer than the next colour

const { catalog } = await import(pathToFileURL(path.join(root, 'src/data/catalogSource.js')).href);
const products = Object.values(catalog).flat().filter((p) => !p.colourPhotos);

/** "10 / Black" or "Black" -> "Black"; a bare size -> ''. Same rule as lib/productSpecs.js colourPart. */
const { colourPart } = await import(pathToFileURL(path.join(root, 'src/lib/productSpecs.js')).href);

async function features(rel) {
  const file = path.join(pub, rel);
  if (!fs.existsSync(file)) return null;
  const px = await sharp(file).flatten({ background: '#ffffff' }).resize(64, 64, { fit: 'contain', background: '#ffffff' }).removeAlpha().raw().toBuffer();
  const at = (i) => [px[i], px[i + 1], px[i + 2]];
  const corners = [0, 63 * 3, 64 * 63 * 3, (64 * 64 - 1) * 3].map(at);
  const bg = corners.reduce((s, c) => s.map((v, k) => v + c[k] / 4), [0, 0, 0]);
  const spread = Math.max(...corners.flatMap((a) => corners.map((b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]))));
  let fg = 0, sat = 0, bright = 0;
  const hues = new Array(36).fill(0);
  for (let i = 0; i < px.length; i += 3) {
    const [r, g, b] = at(i);
    if (Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]) <= 60) continue;
    fg++;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    bright += max / 255;
    const s = max ? (max - min) / max : 0;
    if (s < SAT_MIN || max < 64) continue;
    sat++;
    let h = max === min ? 0 : max === r ? ((g - b) / (max - min)) % 6 : max === g ? (b - r) / (max - min) + 2 : (r - g) / (max - min) + 4;
    h = (h * 60 + 360) % 360;
    hues[Math.floor(h / 10) % 36]++;
  }
  if (!fg || spread > CORNER_SPREAD) return null;
  const peak = hues.indexOf(Math.max(...hues));
  const near = hues[(peak + 35) % 36] + hues[peak] + hues[(peak + 1) % 36];
  const kind = near / fg >= PEAK_SHARE ? 'chromatic' : sat / fg <= GREY_SHARE ? 'grey' : null;
  return kind && { chromatic: kind === 'chromatic', hue: peak * 10 + 5, bright: bright / fg };
}

const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };

/** Photos sorted by eye where the measures cannot decide: { key: { path: colour } }. */
const byEye = (key, colour, ns) => Object.fromEntries(ns.map((n) => [`/products/gallery/${key}/${n}.webp`, colour]));
const BY_EYE = {
  'diamond-iii': {
    '/products/gallery/diamond-iii/2.webp': 'Blue',    // poster of the blue helmet
    '/products/gallery/diamond-iii/10.webp': 'White',  // close crop of the white helmet
  },
  // People at work and posters, by the helmet they show (30 Oct 2026: with
  // White picked, scenes of yellow helmets were still showing).
  'diamond-xiii': { ...byEye('diamond-xiii', 'White', [6, 7, 8, 9]), ...byEye('diamond-xiii', 'Yellow', [14, 15, 17, 18]) },
  'jasper-xv': { ...byEye('jasper-xv', 'Yellow', [4, 6, 8, 9, 10, 11, 12, 13]), ...byEye('jasper-xv', 'White', [17, 18, 19, 20]) },
  'jasper-iii': byEye('jasper-iii', 'Yellow', [2, 5, 6]),
  'jasper-iv': byEye('jasper-iv', 'Yellow', [2, 4, 6]),
  'jasper-1-yellow': byEye('jasper-1-yellow', 'Yellow', [3, 5]),
};

const result = {};
let sorted = 0, unsorted = 0;
for (const p of products) {
  // Each colour's own photo (the first variant of that colour with one).
  const refs = [];
  for (const v of p.variants || []) {
    const name = colourPart(v.c);
    if (!name || !v.img || refs.some((r) => r.name === name)) continue;
    refs.push({ name, img: v.img });
  }
  if (refs.length < 2) continue;
  for (const r of refs) r.f = await features(r.img);
  const usable = refs.filter((r) => r.f);
  const photos = [...new Set([p.img, ...(p.imgs || [])].filter((u) => typeof u === 'string' && u.startsWith('/')))];
  const byColour = Object.fromEntries(refs.map((r) => [r.name, [r.img]]));
  for (const rel of photos) {
    if (refs.some((r) => r.img === rel)) continue;
    const eye = BY_EYE[p.key]?.[rel];
    if (eye && byColour[eye]) { byColour[eye].push(rel); sorted++; continue; }
    const f = await features(rel);
    let pick = null;
    if (f?.chromatic) {
      const ranked = usable.filter((r) => r.f.chromatic).map((r) => ({ r, d: hueGap(r.f.hue, f.hue) })).sort((a, b) => a.d - b.d);
      if (ranked[0] && ranked[0].d <= HUE_LIMIT && (!ranked[1] || ranked[1].d - ranked[0].d >= HUE_MARGIN)) pick = ranked[0].r;
    } else if (f) {
      const ranked = usable.filter((r) => !r.f.chromatic).map((r) => ({ r, d: Math.abs(r.f.bright - f.bright) })).sort((a, b) => a.d - b.d);
      if (ranked[0] && (!ranked[1] || ranked[1].d - ranked[0].d >= 0.1)) pick = ranked[0].r;
    }
    if (pick) { byColour[pick.name].push(rel); sorted++; } else unsorted++;
  }
  result[p.key] = byColour;
}

fs.writeFileSync(path.join(root, 'src/data/colourPhotos.generated.json'), JSON.stringify(result, null, 1) + '\n');
console.log(`find-colour-photos: ${Object.keys(result).length} products; ${sorted} photos sorted by colour, ${unsorted} shown with every colour`);
