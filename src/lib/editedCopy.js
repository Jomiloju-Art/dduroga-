import { useEffect, useState } from 'react';

/**
 * The client's current text for a product, from their Google Sheet via
 * api/copy.js, or null. The page is built with the sheet's text as it was at
 * the last deploy; this picks up edits made since. Fetched once per visit and
 * shared by every product page.
 */
let pending = null;
const load = () => {
  pending ||= fetch('/api/copy')
    .then((r) => (r.ok ? r.json() : {}))
    .then((d) => (d && typeof d.copy === 'object' ? d.copy : {}))
    .catch(() => ({}));
  return pending;
};

export function useEditedDesc(key) {
  const [desc, setDesc] = useState(null);
  useEffect(() => {
    setDesc(null);
    if (!key) return undefined;
    let live = true;
    load().then((copy) => { if (live) setDesc(typeof copy[key] === 'string' ? copy[key] : null); });
    return () => { live = false; };
  }, [key]);
  return desc;
}
