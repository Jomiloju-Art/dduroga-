import { useState } from 'react';
import { Link } from 'react-router-dom';
import { zoneOf } from '../data/products.js';
import { displayType } from '../lib/display.js';
import { useQuote } from '../quote/QuoteContext.jsx';
import ProductArt from './ProductArt.jsx';
import { IconCheck } from './Icons.jsx';

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

  const altImg = !failed && !altFailed && product.imgs && product.imgs.length > 1 ? product.imgs[1] : null;
  const type = displayType(product, zone?.label);
  const options = (product.variants || []).filter((v) => v.c);

  return (
    <Link to={`/products/${product.slug}`} className="plp-card" aria-label={product.title}>
      <div className="plp-card__media">
        {!failed && product.img ? (
          <>
            <img
              className="plp-card__img"
              src={product.img}
              alt={product.title}
              loading="lazy"
              onError={() => setFailed(true)}
            />
            {altImg && (
              <img className="plp-card__img plp-card__img--alt" src={altImg} alt="" aria-hidden="true" loading="lazy" onError={() => setAltFailed(true)} />
            )}
          </>
        ) : (
          <div className="plp-card__art">
            <ProductArt category={zone?.id} label={product.title} />
          </div>
        )}

        {/* Badge only when it is good news. "Lead time" on 20 of 24 cards is
            noise; the PDP states lead time where it matters. */}
        {(product.variants || []).some((v) => v.a) && (
          <div className="plp-card__badges">
            <span className="plp-badge plp-badge--stock">In stock</span>
          </div>
        )}

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
