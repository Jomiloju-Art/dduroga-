import { useEffect } from 'react';

/**
 * One page-scroll lock shared by every overlay (phone menu, bag, filters,
 * search, size guide, accreditation drawer).
 *
 * Each overlay used to set `body.style.overflow = 'hidden'` on its own. That
 * had three faults: the document scroller is <html>, so touch scrolling on
 * phones still moved the page behind the menu; the search box and size guide
 * never locked at all; and two overlays open at once restored each other's
 * saved value in the wrong order. Locking <html> as well as <body>, with a
 * counter, fixes all three. The scrollbar's width is held by
 * `scrollbar-gutter: stable` in the stylesheet, so locking no longer shifts
 * the page sideways on desktop.
 *
 * Mobile browsers still let a finger drag the page under `overflow: hidden`,
 * so while locked a one-finger drag that starts outside an overlay panel is
 * cancelled. Drags inside a panel scroll it normally, and two-finger pinch
 * zoom is never blocked.
 */
const PANELS = '.nav-menu, .bag-drawer, .plp-sidebar, .search-panel, dialog[open], .accr-drawer';

let count = 0;
let saved = null;

function onTouchMove(e) {
  if (e.touches.length > 1) return;
  if (e.target instanceof Element && e.target.closest(PANELS)) return;
  if (e.cancelable) e.preventDefault();
}

export function lockScroll() {
  const html = document.documentElement;
  if (count++ === 0) {
    saved = { html: html.style.overflow, body: document.body.style.overflow };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', onTouchMove, { passive: false });
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--count === 0 && saved) {
      html.style.overflow = saved.html;
      document.body.style.overflow = saved.body;
      document.removeEventListener('touchmove', onTouchMove);
      saved = null;
    }
  };
}

/** Lock page scrolling while `active` is true. */
export function useScrollLock(active) {
  useEffect(() => (active ? lockScroll() : undefined), [active]);
}
