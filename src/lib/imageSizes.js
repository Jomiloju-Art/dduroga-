/**
 * Paths to the reduced copies made by scripts/make-thumbs.mjs.
 *
 * Every .webp under /products/ has a -160 copy (thumbnail rail). Card hover
 * photos also have a -480 copy. Anything else is returned unchanged, so a
 * caller can pass any src safely; pair it with an onError fallback to the
 * original in case a new photo has not been run through the script yet.
 */
export function sized(src, width) {
  if (typeof src !== 'string' || !/^\/products\/.+\.webp$/.test(src) || /-(160|480)\.webp$/.test(src)) return src;
  return src.replace(/\.webp$/, `-${width}.webp`);
}
