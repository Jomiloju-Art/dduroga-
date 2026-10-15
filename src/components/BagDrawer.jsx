import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuote, quoteKey } from '../quote/QuoteContext.jsx';
import { IconArrowRight, IconClose, IconCheck } from './Icons.jsx';
import { lockScroll } from '../lib/scrollLock.js';
import QtyInput from './QtyInput.jsx';

/**
 * "Your bag" drawer — the quote list presented the way Gymshark presents their
 * mini-cart: a 500px full-height panel that slides in from the right over a
 * dim backdrop, with a sticky "Your bag" header, item rows, and a pinned
 * request-quote CTA.
 */
export default function BagDrawer() {
  const { items, count, open, closeBag, remove, setQty, notice } = useQuote();

  // Close on Escape and lock the page behind the drawer while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') closeBag(); };
    const unlock = lockScroll();
    document.addEventListener('keydown', onKey);
    return () => {
      unlock();
      document.removeEventListener('keydown', onKey);
    };
  }, [open, closeBag]);

  return (
    <>
      <div className={`bag-backdrop ${open ? 'is-visible' : ''}`} onClick={closeBag} aria-hidden="true" />

      <aside
        className={`bag-drawer ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
      >
        <header className="bag-drawer__header">
          <h2>Your bag</h2>
          <button type="button" className="bag-drawer__close" onClick={closeBag} aria-label="Close bag">
            <IconClose width="20" height="20" />
          </button>
        </header>

        {notice && items.length > 0 && (
          <p className="bag-drawer__notice" role="status">
            <IconCheck width="16" height="16" /> {notice.text}
          </p>
        )}

        {items.length === 0 ? (
          <div className="bag-drawer__empty">
            <h3>Your bag is empty</h3>
            <p>Add products to start building your quote.</p>
            <Link to="/products" className="bag-drawer__browse" onClick={closeBag}>
              Browse products <IconArrowRight width="14" height="14" />
            </Link>
          </div>
        ) : (
          <div className="bag-drawer__items">
            {items.map((p) => (
              <div className={`bag-item${notice?.key === quoteKey(p) ? ' is-new' : ''}`} key={quoteKey(p)}>
                <span className="bag-item__img">
                  {p.img ? <img src={p.img} alt="" loading="lazy" /> : null}
                </span>
                <span className="bag-item__info">
                  <strong className="bag-item__title">{p.title}</strong>
                  {p.option && <em className="bag-item__option">Size / colour: {p.option}</em>}
                  <span className="bag-item__qty">
                    <button type="button" onClick={() => setQty(quoteKey(p), (p.qty || 1) - 1)} aria-label="Decrease quantity">−</button>
                    <QtyInput value={p.qty || 1} onChange={(n) => setQty(quoteKey(p), n)} label={`Quantity of ${p.title}`} />
                    <button type="button" onClick={() => setQty(quoteKey(p), (p.qty || 1) + 1)} aria-label="Increase quantity">+</button>
                  </span>
                </span>
                <button type="button" className="bag-item__remove" onClick={() => remove(quoteKey(p))} aria-label={`Remove ${p.title}`}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <footer className="bag-drawer__footer">
            <Link className="bag-drawer__cta" to="/quote" onClick={closeBag}>
              Request a quote · {count} {count === 1 ? 'item' : 'items'}
              <IconArrowRight width="14" height="14" />
            </Link>
            <p className="bag-drawer__assure">No payment now. Stocked in Lagos, delivered nationwide.</p>
          </footer>
        )}
      </aside>
    </>
  );
}
