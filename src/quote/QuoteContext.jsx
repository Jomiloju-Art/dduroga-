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

const clampQty = (qty) => Math.min(QTY_MAX, Math.max(1, Math.round(Number(qty)) || 1));

/**
 * Saved lines, cleaned. Storage can hold anything (an older format, an
 * extension, a half-written save), and one bad value used to crash every
 * page: a non-array, nulls or a non-numeric quantity. Lines without a slug
 * and title are dropped, quantities are clamped, and duplicate keys merged.
 */
const sanitize = (raw) => {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const p of raw) {
    if (!p || typeof p !== 'object' || typeof p.slug !== 'string' || !p.slug || typeof p.title !== 'string') continue;
    const line = {
      slug: p.slug, title: p.title,
      sku: typeof p.sku === 'string' ? p.sku : '',
      img: typeof p.img === 'string' ? p.img : '',
      qty: clampQty(p.qty),
      option: typeof p.option === 'string' ? p.option : '',
    };
    const same = out.find((x) => quoteKey(x) === quoteKey(line));
    if (same) same.qty = clampQty(same.qty + line.qty);
    else out.push(line);
  }
  return out;
};

const parse = (s) => { try { return sanitize(JSON.parse(s)); } catch { return []; } };
const read = () => { try { return parse(localStorage.getItem(KEY)); } catch { return []; } };

export function QuoteProvider({ children }) {
  const [items, setItems] = useState([]);
  /** Whether the "Your bag" drawer is open. `add` opens it, like Gymshark's
   *  add-to-bag opening the mini-cart. */
  const [open, setOpen] = useState(false);
  /** What the last add did, shown at the top of the bag: { key, text }. */
  const [notice, setNotice] = useState(null);
  const seq = useRef(0);

  // Read after mount (the server render has no storage), and write only once
  // that read has happened: writing on mount stored an empty list first.
  const loaded = useRef(false);
  useEffect(() => {
    setItems(read());
    loaded.current = true;
    // Another tab changed the list: take its version, so the two tabs do not
    // overwrite each other's additions.
    const onStorage = (e) => { if (e.key === KEY) setItems(parse(e.newValue)); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      const next = JSON.stringify(items);
      if (localStorage.getItem(KEY) !== next) localStorage.setItem(KEY, next);
    } catch { /* ignore */ }
  }, [items]);

  const openBag = () => setOpen(true);
  const closeBag = () => { setOpen(false); setNotice(null); };

  /**
   * Adds the product (and, when given, the selected size/colour option) to the
   * quote and opens the bag drawer.
   */
  const add = (product, qty = 1, option = '') => {
    const amount = clampQty(qty);
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
    setItems((prev) => prev.map((p) => (quoteKey(p) === key ? { ...p, qty: clampQty(qty) } : p)));

  const clear = () => setItems([]);

  const value = useMemo(
    () => ({ items, count: items.length, add, remove, setQty, clear, open, openBag, closeBag, notice }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, open, notice]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export const useQuote = () => useContext(QuoteContext);
