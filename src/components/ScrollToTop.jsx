import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scroll handling on route change (BrowserRouter has none of its own).
 *
 *  - A new page starts at the top.
 *  - Back / Forward (a POP) is left to the browser, which restores the
 *    position the visitor left; forcing the top here threw that away.
 *  - A link with a #hash lands on that section. Pages are lazy-loaded, so the
 *    target may not exist on the first frame: it is retried for a short while.
 *    `#facet-*` hashes belong to ProductsPage, which opens the filters first.
 */
export default function ScrollToTop({ children }) {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  // Only a new path or hash counts. The navigation type alone also changes when
  // a page rewrites its query string (filters, pagination), which must not
  // throw the visitor back to the top.
  const last = useRef(null);

  useEffect(() => {
    const key = pathname + hash;
    if (last.current === key) return undefined;
    last.current = key;
    if (navType === 'POP' && !hash) return undefined;

    if (!hash || hash.startsWith('#facet-')) {
      if (navType !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return undefined;
    }

    let tries = 0;
    let timer;
    const find = () => {
      let el = null;
      try { el = document.querySelector(decodeURIComponent(hash)); } catch { /* not a valid selector */ }
      if (el) {
        el.scrollIntoView({ block: 'start', behavior: 'instant' });
        // Content above may still be settling (images, entrance animations): align again once.
        timer = setTimeout(() => el.scrollIntoView({ block: 'start', behavior: 'instant' }), 450);
        return;
      }
      if (++tries < 40) timer = setTimeout(find, 50);
      else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    find();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);

  return children;
}
