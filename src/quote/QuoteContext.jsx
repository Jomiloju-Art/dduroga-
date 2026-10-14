import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { QTY_MAX } from '../components/QtyInput.jsx';

const QuoteContext = createContext(null);
const KEY = 'dduroga-quote';

/**
 * Stable identity for a quote line. A product may appear once per selected
 * option (size/colour), so the key is slug + option rather than slug alone.
 * Older persisted items have no `option`, which is why the fallback is ''.
 */
export const quoteKey = (p) => p.slug + (p.option ? '|' + p.option : '');

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export function QuoteProvider({ children }) {
  const [items, setItems] = useState([]);
  /** Whether the "Your bag" drawer is open. `add` opens it, like Gymshark's
   *  add-to-bag opening the mini-cart. */
  const [open, setOpen] = useState(false);
  /** What the last add did, shown at the top of the bag: { key, text }. */
  const [notice, setNotice] = useState(null);
  const seq = useRef(0);

  useEffect(() => {
    setItems(read());
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const openBag = () => setOpen(true);
  const closeBag = () => { setOpen(false); setNotice(null); };

  /**
   * Adds the product (and, when given, the selected size/colour option) to the
   * quote and opens the bag drawer.
   */
  const add = (product, qty = 1, option = '') => {
    const amount = Math.min(QTY_MAX, Math.max(1, Math.round(Number(qty)) || 1));
    const opt = option || (product && product.option) || '';
    const key = product.slug + (opt ? '|' + opt : '');
    // Adding a product that is already listed raises its quantity and says so;
    // it used to do nothing, which read as a broken button.
    const existing = items.find((p) => quoteKey(p) === key);
    if (existing) {
      const total = Math.min(QTY_MAX, (existing.qty || 1) + amount);
      setItems((prev) => prev.map((p) => (quoteKey(p) === key ? { ...p, qty: total } : p)));
      setNotice({ key, text: `Already in your quote. Quantity is now ${total}.` });
    } else {
      setItems((prev) => [...prev, { slug: product.slug, title: product.title, sku: product.sku || '', img: product.img || '', qty: amount, option: opt }]);
      setNotice({ key, text: 'Added to your quote.' });
    }
    setOpen(true);
  };

  const remove = (key) => {
    setItems((prev) => prev.filter((p) => quoteKey(p) !== key));
  };

  const setQty = (key, qty) =>
    setItems((prev) => prev.map((p) => (quoteKey(p) === key ? { ...p, qty: Math.min(QTY_MAX, Math.max(1, Math.round(Number(qty)) || 1)) } : p)));

  const clear = () => setItems([]);

  const value = useMemo(
    () => ({ items, count: items.length, add, remove, setQty, clear, open, openBag, closeBag, notice }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, open, notice]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export const useQuote = () => useContext(QuoteContext);
