import { brand } from '../data/brand.js';

/**
 * Site logo.
 *
 * Three variants, chosen by CSS rather than by JS:
 *
 *   brand-logo.png              the normal navy + orange mark
 *   brand-logo-white-accent.png white wordmark, orange kept where it was orange
 *   logo-mark-white.png         the compact mark, all white
 *
 * The white pair exists because the header goes transparent over the homepage
 * hero, where the navy wordmark would disappear. Gymshark solves this with
 * `filter: brightness(0) invert(1)` on a single-colour logo; that cannot work on
 * a two-colour mark - it flattens the orange to white as well. So these are real
 * second assets, not a filter.
 *
 * All three are in the DOM and the stylesheet shows the right one, so there is
 * no loading flicker when the header changes state.
 *
 * The header loads 640px copies (*-640.png): the 1444px originals are shown
 * at 286px at most, so they cost four times the pixels for nothing. Keep the
 * originals for print, share images and the schema logo.
 *
 * `compactOnMobile` swaps the wide wordmark for the square brand mark below
 * 700px. The wordmark is 1444x212 (6.8:1) and cannot share a phone header row
 * with the search button, the quote CTA and the menu toggle — it was being
 * flex-shrunk to 37x42, a 7.7x squash that rendered it illegible. The mark is
 * 185x212, so it stays readable at header height and everything else fits.
 */
export default function Logo({ href, light = false, compactOnMobile = false }) {
  const cls = light ? 'brand-logo-img brand-logo-img--light' : 'brand-logo-img';

  /* All variants are rendered and CSS picks one. A <picture> element cannot do
     this: it chooses a source by media query alone and knows nothing about the
     header's state, so it could not swap to white when the header goes
     transparent. Two elements, shown and hidden by the stylesheet, also means
     the white asset is already decoded when the state changes - no flicker. */
  const img = compactOnMobile ? (
    <>
      {/* Wide wordmark, normal and white */}
      <img src="/brand-logo-640.png" width="640" height="94" alt={brand.name} className={`${cls} logo-normal`} />
      <img src="/brand-logo-white-accent-640.png" width="640" height="94" alt="" aria-hidden="true" className={`${cls} logo-white`} />
      {/* Compact mark for phones, normal and white */}
      <img src="/logo-mark.png" alt="" aria-hidden="true" className={`${cls} logo-mark logo-mark-normal`} />
      <img src="/logo-mark-white.png" alt="" aria-hidden="true" className={`${cls} logo-mark logo-mark-white`} />
    </>
  ) : (
    <>
      <img src="/brand-logo-640.png" width="640" height="94" alt={brand.name} className={`${cls} logo-normal`} />
      <img src="/brand-logo-white-accent-640.png" width="640" height="94" alt="" aria-hidden="true" className={`${cls} logo-white`} />
    </>
  );

  if (href) {
    return (
      <a className="brand" href={href} aria-label={`${brand.name} home`}>
        {img}
      </a>
    );
  }
  return <div className="brand">{img}</div>;
}
