import { useState } from 'react';
import { sized } from '../lib/imageSizes.js';
import { Link } from 'react-router-dom';
import { zoneOf, rangeLabel } from '../data/products.js';
import { NO_HOVER_IMAGE } from '../data/cardHoverExclusions.js';
import hoverChoices from '../data/cardHoverImages.json';
import { displayType } from '../lib/display.js';
import { useQuote } from '../quote/QuoteContext.jsx';
import ProductArt from './ProductArt.jsx';
import { IconCheck } from './Icons.jsx';
import { firstStandard } from '../lib/productSpecs.js';

/**
 * Product card, restyled to Gymshark's collection-card anatomy (measured from
 * /collections/all-products/):
 *
 *   image    4:5 (padding-top 125%), object-fit cover, radius 0, hover
 *            crossfades to a second shot when the product has one
 *   title    14px/400, two-line clamp, --ddu-black
 *   meta     14px muted — the product type (Gymshark's "fit" line)
 *   hover    a row of option chips slides up over the image: sizes for
 *            gloves/boots, colours for goggles/helmets. The `c` field in a
 *            variant is the option value, whichever kind it is. Picking one
 *            adds that exact size/colour to the quote.
 *   quote    full-width inverse (dark) button, radius 0, for the no-option add
 */
export default function ProductCard({ product }) {
  const zone = zoneOf(product);
  const { add } = useQuote();
  const [failed, setFailed] = useState(false);
  const [altFailed, setAltFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Hover photo. A hand-picked choice wins (cardHoverImages.json, written by
  // scripts/hover-picker.mjs; null = no hover photo). Unreviewed products fall
  // back to the second photo, unless that one is listed in cardHoverExclusions.js.
  const picked = Object.prototype.hasOwnProperty.call(hoverChoices, product.key) ? hoverChoices[product.key] : undefined;
  const fallback = product.imgs && product.imgs.length > 1 && !NO_HOVER_IMAGE.has(product.key) ? product.imgs[1] : null;
  // A photo picked for hover may since have become the main photo
  // (catalogSource.js MAIN_PHOTO); hover then shows the old main photo.
  const hover = picked !== undefined ? picked : fallback;
  const altImg = !failed && !altFailed ? (hover && hover === product.img ? product.imgs?.[0] || null : hover) : null;
  // The catalogue range ("Welder gloves") is consistent across the range; the raw
  // storefront type is "Safety Gloves" / "HAND PROTECTION" / blank for most.
  const type = rangeLabel(product) || displayType(product, zone?.label);
  const options = (product.variants || []).filter((v) => v.c);
  // Key spec from the 2025 catalogue, so buyers can compare without opening each product.
  // An EN standard first; "CE" never goes in front of an Indian (IS) one.
  const spec = firstStandard(product);
  const ceSpec = product.ce && spec && !/^IS\s/.test(spec);

  return (
    <Link to={`/products/${product.slug}`} className="plp-card" aria-label={product.title}>
      <div className={`plp-card__media${loaded || failed ? ' is-loaded' : ''}`}>
        {!failed && product.img ? (
          <>
            <img
              // --swap marks a primary that fades out on hover; without a second
              // photo it must stay put, or the card hovers to an empty grey box.
              className={`plp-card__img${altImg ? ' plp-card__img--swap' : ''}`}
              src={product.img}
              alt={product.title}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
            {altImg && (
              <img
                className="plp-card__img plp-card__img--alt"
                src={sized(altImg, 480)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                onError={(e) => {
                  // No reduced copy yet: fall back to the original before giving up.
                  if (e.currentTarget.src.endsWith('-480.webp')) e.currentTarget.src = altImg;
                  else setAltFailed(true);
                }}
              />
            )}
          </>
        ) : (
          <div className="plp-card__art">
            <ProductArt category={zone?.id} label={product.title} />
          </div>
        )}

        {/* No "In stock" badge: stock labels were removed site-wide at the
            client's request (Oct 2026). */}

        {options.length > 0 && (
          <div className="plp-card__options">
            {options.map((v) => (
              <button
                key={v.c}
                type="button"
                className="plp-card__option"
                aria-label={`${product.title}, ${v.c}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(product, 1, v.c); }}
              >
                {v.c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="plp-card__info">
        <h3 className="plp-card__title">{product.title}</h3>
        {type && <p className="plp-card__meta">{type}</p>}
        {spec && <p className="plp-card__spec">{ceSpec ? 'CE · ' : ''}{spec}</p>}
        <button
          type="button"
          className="plp-card__quote"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            add(product);
          }}
        >
          <IconCheck width="15" height="15" />
          Add to quote
        </button>
      </div>
    </Link>
  );
}
