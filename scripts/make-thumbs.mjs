/**
 * Small copies of product photos for the places that show them small.
 *
 *   <name>-160.webp  every photo under public/products: the gallery's
 *                    thumbnail rail draws them at 50-76px, and was loading the
 *                    1000px originals.
 *   <name>-480.webp  each product card's hover photo (hand-picked in
 *                    cardHoverImages.json, else the second photo): cards are
 *                    177-243px wide, so 480 covers a 2x screen.
 *
 * Skips files that already exist, so it is cheap to re-run after adding
 * products or photos:  node scripts/make-thumbs.mjs
 * src/lib/imageSizes.js maps a photo path to these copies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const { allProducts } = await import(pathToFileURL(path.join(root, 'src/data/products.js')).href);
const { NO_HOVER_IMAGE } = await import(pathToFileURL(path.join(root, 'src/data/cardHoverExclusions.js')).href);
const hover = JSON.parse(fs.readFileSync(path.join(root, 'src/data/cardHoverImages.json'), 'utf8'));

const isOriginal = (f) => f.endsWith('.webp') && !/-(160|480)\.webp$/.test(f);
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : isOriginal(d.name) ? [p] : [];
});

async function make(file, width) {
  const out = file.replace(/\.webp$/, `-${width}.webp`);
  if (fs.existsSync(out)) return 0;
  await sharp(file).resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(out);
  return 1;
}

let made = 0;
const photos = walk(path.join(pub, 'products'));
for (const f of photos) made += await make(f, 160);

const hoverPaths = new Set();
for (const p of allProducts) {
  const picked = Object.prototype.hasOwnProperty.call(hover, p.key) ? hover[p.key] : undefined;
  const fallback = p.imgs && p.imgs.length > 1 && !NO_HOVER_IMAGE.has(p.key) ? p.imgs[1] : null;
  const alt = picked !== undefined ? picked : fallback;
  if (alt && alt.startsWith('/products/') && alt.endsWith('.webp')) hoverPaths.add(alt);
}
for (const rel of hoverPaths) {
  const file = path.join(pub, rel);
  if (fs.existsSync(file)) made += await make(file, 480);
}
console.log(`make-thumbs: ${photos.length} photos, ${hoverPaths.size} hover photos, ${made} new files`);
