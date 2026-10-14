import { useEffect, useState } from 'react';
import { findProduct } from '../data/products.js';

const KEY = 'dduroga-recent';

/** Saved slugs. Anything malformed in storage (a string, an object, nulls) reads as nothing. */
const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v.filter((s) => typeof s === 'string' && s) : [];
  } catch { return []; }
};

export function addRecent(slug) {
  if (!slug) return;
  const list = read().filter((s) => s !== slug);
  list.unshift(slug);
  const next = list.slice(0, 8);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
}

/** Recently viewed products (persisted). */
export function useRecentlyViewed() {
  const [slugs, setSlugs] = useState([]);
  useEffect(() => { setSlugs(read()); }, []);
  return slugs.map((s) => findProduct(s)).filter(Boolean);
}
