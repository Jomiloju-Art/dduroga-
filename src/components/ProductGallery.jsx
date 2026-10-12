/**
 * ProductGallery - one large stage with a thumbnail rail (the Amazon pattern).
 *
 *   desktop (>900px)              phone / tablet (<=900px)
 *   ┌────┬─────────────────┐      ┌─────────────────────┐
 *   │ ▣  │                 │      │   swipeable stage   │
 *   │ ▢  │      stage      │      └─────────────────────┘
 *   │ ▢  │                 │      ▣ ▢ ▢ ▢ ▢  (strip, scrolls sideways)
 *   └────┴─────────────────┘
 *
 * The rail only appears when a product has more than one photo; a single photo
 * gets the stage alone. The stage is one horizontal scroll-snap track for every
 * screen size, so phones swipe natively and the rail simply drives scrollLeft.
 *
 * Behaviour:
 *   - hover a thumbnail (mouse only) or click / tap it to show that photo
 *   - arrow keys move between thumbnails (roving focus), Home / End jump
 *   - prev / next buttons on the stage, a "3 / 8" counter for orientation
 *   - click the stage to magnify the point clicked; the drawn +/- cursor shows
 *     which click will happen. Changing photo resets the zoom.
 *   - the rail is as tall as the stage and scrolls; the active thumbnail is
 *     kept in view without moving the page.
 *   - a colour pick that changes the first photo returns the stage to it.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import ProductArt from './ProductArt.jsx';

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export default function ProductGallery({ images = [], title = 'Product', zone }) {
  const trackRef = useRef(null);
  const railRef = useRef(null);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [cursorOn, setCursorOn] = useState(false);
  const count = images.length;
  const multi = count > 1;

  /* Show photo i. Desktop swaps instantly (a stage, not a slideshow); a tap on
     the phone strip glides so the swipe direction stays legible. */
  const show = useCallback((i, smooth = false) => {
    const track = trackRef.current;
    const next = clamp(i, 0, count - 1);
    setActive(next);
    setZoomed(false);
    if (track) track.scrollTo({ left: next * track.clientWidth, behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' });
  }, [count]);

  // A colour pick puts its photo first: go back to it.
  useEffect(() => { show(0); }, [images[0], show]); // eslint-disable-line react-hooks/exhaustive-deps

  // Swiping (or the browser restoring scroll) updates the active photo.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = clamp(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)), 0, count - 1);
        if (i !== active) { setActive(i); setZoomed(false); }
      });
    };
    // Keep the current photo aligned when the stage is resized.
    const onResize = () => { track.scrollLeft = active * track.clientWidth; };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [count, active]);

  // Keep the active thumbnail visible inside the rail, without scrolling the page.
  useEffect(() => {
    const rail = railRef.current;
    const thumb = rail?.children[active];
    if (!thumb) return;
    const vertical = rail.scrollHeight > rail.clientHeight + 1;
    if (vertical) {
      const top = thumb.offsetTop - rail.offsetTop;
      if (top < rail.scrollTop) rail.scrollTop = top - 4;
      else if (top + thumb.offsetHeight > rail.scrollTop + rail.clientHeight) rail.scrollTop = top + thumb.offsetHeight - rail.clientHeight + 4;
    } else {
      const left = thumb.offsetLeft - rail.offsetLeft;
      if (left < rail.scrollLeft) rail.scrollLeft = left - 4;
      else if (left + thumb.offsetWidth > rail.scrollLeft + rail.clientWidth) rail.scrollLeft = left + thumb.offsetWidth - rail.clientWidth + 4;
    }
  }, [active]);

  /* Rail keyboard: one tab stop, arrows move (and show) like a listbox. */
  const onRailKey = (e) => {
    const map = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next = null;
    if (e.key in map) next = clamp(active + map[e.key], 0, count - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    if (next === null) return;
    e.preventDefault();
    show(next);
    railRef.current?.children[next]?.focus();
  };

  /* Hover preview, mouse only. Driven by real pointer movement rather than
     mouseenter: when the rail scrolls itself (keyboard, End) a thumbnail slides
     under a resting pointer, and mouseenter would steal the selection. */
  const lastPointer = useRef({ x: -1, y: -1 });
  const onRailHover = (e) => {
    if (e.pointerType !== 'mouse' || !finePointer()) return;
    if (e.clientX === lastPointer.current.x && e.clientY === lastPointer.current.y) return;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    const thumb = e.target.closest('.gallery-thumb');
    const i = thumb ? [...railRef.current.children].indexOf(thumb) : -1;
    if (i >= 0 && i !== active) show(i);
  };

  /* ---------- zoom: click a point, magnify that point ---------- */
  const pointAt = (el, e) => {
    const r = el.getBoundingClientRect();
    return { x: clamp(((e.clientX - r.left) / r.width) * 100, 0, 100), y: clamp(((e.clientY - r.top) / r.height) * 100, 0, 100) };
  };
  const onSlideClick = (e) => {
    // A keyboard press has no pointer position: zoom on the centre.
    if (zoomed) { setZoomed(false); return; }
    setOrigin(e.detail === 0 ? { x: 50, y: 50 } : pointAt(e.currentTarget, e));
    setZoomed(true);
  };
  const onStageMove = (e) => {
    setCursor({ x: e.clientX, y: e.clientY });
    if (zoomed) {
      const slide = trackRef.current?.children[active];
      if (slide) setOrigin(pointAt(slide, e));
    }
  };

  if (!count) {
    return (
      <div className="gallery-col">
        <div className="detail-art detail-art--bare" style={{ display: 'grid', placeItems: 'center', minHeight: 420 }}>
          <ProductArt category={zone} />
        </div>
      </div>
    );
  }

  return (
    <div className={`gallery-col${multi ? ' has-rail' : ''}`}>
      {multi && (
        <div
          className="gallery-rail"
          ref={railRef}
          role="group"
          aria-label={`${title} photos`}
          onKeyDown={onRailKey}
          onPointerMove={onRailHover}
        >
          {images.map((src, i) => (
            <button
              type="button"
              key={src}
              className={`gallery-thumb${i === active ? ' is-active' : ''}`}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === active ? 'true' : undefined}
              tabIndex={i === active ? 0 : -1}
              onClick={() => show(i, true)}
            >
              <img src={src} alt="" loading={i < 8 ? 'eager' : 'lazy'} decoding="async" />
            </button>
          ))}
        </div>
      )}

      <div
        className="gallery-stage"
        onMouseMove={onStageMove}
        onMouseEnter={(e) => { setCursor({ x: e.clientX, y: e.clientY }); setCursorOn(true); }}
        onMouseLeave={() => { setCursorOn(false); setZoomed(false); }}
      >
        <div className="gallery-track" ref={trackRef}>
          {images.map((src, i) => {
            const isZoomed = zoomed && i === active;
            return (
              <button
                type="button"
                key={src}
                className={`gallery-slide${isZoomed ? ' is-zoomed' : ''}`}
                aria-label={isZoomed ? `Zoom out of photo ${i + 1}` : `Zoom in on photo ${i + 1} of ${count}`}
                aria-hidden={i === active ? undefined : 'true'}
                tabIndex={i === active ? 0 : -1}
                onClick={onSlideClick}
                style={isZoomed ? {
                  backgroundImage: `url(${src})`,
                  backgroundPosition: `${origin.x}% ${origin.y}%`,
                } : undefined}
              >
                <img
                  src={src}
                  alt={`${title}, photo ${i + 1}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchpriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                />
              </button>
            );
          })}
        </div>

        {multi && (
          <>
            <button type="button" className="gallery-nav gallery-nav--prev" onClick={() => show(active - 1, true)} disabled={active === 0} aria-label="Previous photo">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className="gallery-nav gallery-nav--next" onClick={() => show(active + 1, true)} disabled={active === count - 1} aria-label="Next photo">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <p className="gallery-count" aria-live="polite">
              <span className="sr-only">Photo </span>{active + 1}<span className="gallery-count__sep">/</span>{count}
            </p>
          </>
        )}
      </div>

      <span
        className={`gallery-cursor${cursorOn ? ' is-on' : ''}${zoomed ? ' is-out' : ' is-in'}`}
        style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
        aria-hidden="true"
      />
    </div>
  );
}
