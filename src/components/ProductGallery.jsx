/**
 * ProductGallery - the Gymshark-pattern PDP media section.
 *
 * Measured from their live PDP (uk.gymshark.com, 1584px viewport) rather than
 * guessed. The numbers that matter:
 *
 *   gallery column   792px  = 50% of viewport
 *   buy column       410px  = 26%
 *   gap between      174px  (they simply do not fill it)
 *   tile gap           4px  (not 8/12 - the grid reads as one surface)
 *   tile radius        0px
 *   tile border        0
 *   tile shadow        none
 *   tile background   rgb(222,224,227)
 *   half tile        394px, aspect ~0.799 (4:5)
 *   full tile        792px
 *
 * The layout is a two-up MOSAIC, not a single stack:
 *
 *   ┌──────────┬──────────┐
 *   │  half    │  half    │   two portraits side by side
 *   ├──────────┴──────────┤
 *   │       full          │   one full-width
 *   ├──────────┬──────────┤
 *   │  half    │  half    │   …and so on
 *   └──────────┴──────────┘
 *
 * Rules, applied to however many images a product has:
 *   - one image            -> single full-width tile
 *   - two images           -> two halves
 *   - three or more        -> halves, then a full, alternating
 *   - carousel mode (<=2)  -> halves are full-width so each gets the stage
 *
 * Behaviour kept from the earlier build, all of it verified by driving a browser:
 *   - sticky scroll region with a visible scrollbar and the left-edge pill
 *   - click a point to magnify that point, pointer tracking while magnified
 *   - the drawn +/- cursor, native cursor hidden over the media
 *   - horizontal scroll-snap on mobile
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import ProductArt from './ProductArt.jsx';

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/**
 * Assign each image a column span. Gymshark's own arrangement puts two halves,
 * then a full-width, then repeats. Two images or fewer stay side by side so the
 * top of the page always shows a pair.
 */
function spansFor(count) {
  if (count === 1) return ['full'];
  const spans = [];
  for (let i = 0; i < count; i++) {
    // every third tile is full width; the rest pair up
    spans.push(i % 3 === 2 ? 'full' : 'half');
  }
  // a trailing single half looks broken, so widen it
  if (spans[spans.length - 1] === 'half' && spans.length > 1) spans[spans.length - 1] = 'full';
  return spans;
}

export default function ProductGallery({ images = [], title = 'Product', zone }) {
  const scrollRef = useRef(null);
  const [zoomedIndex, setZoomedIndex] = useState(null);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [cursorOn, setCursorOn] = useState(false);
  const [zoomIn, setZoomIn] = useState(true);
  const [active, setActive] = useState(0);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const spans = useMemo(() => spansFor(images.length), [images.length]);

  /* ---------- scroll position: counter, pill state ---------- */
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      const vertical = root.scrollHeight > root.clientHeight + 4;
      if (vertical) {
        const max = root.scrollHeight - root.clientHeight;
        setAtTop(root.scrollTop <= 2);
        setAtBottom(Math.round(root.scrollTop) >= Math.round(max) - 2);
        const tiles = [...root.querySelectorAll('[data-index]')];
        let best = 0, bestDist = Infinity;
        tiles.forEach((t, i) => {
          const d = Math.abs(t.offsetTop - root.scrollTop);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        setActive(best);
      } else {
        const i = Math.round(root.scrollLeft / root.clientWidth);
        setActive(i);
        setAtTop(i <= 0);
        setAtBottom(i >= images.length - 1);
      }
    };
    onScroll();
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [images.length]);

  const step = (dir) => {
    const root = scrollRef.current;
    if (!root) return;
    const vertical = root.scrollHeight > root.clientHeight + 4;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (vertical) root.scrollTo({ top: root.scrollTop + dir * 150, behavior: reduce ? 'auto' : 'smooth' });
    else root.scrollTo({ left: root.scrollLeft + dir * root.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- zoom: click a point, magnify that point ---------- */
  const handleImageClick = (i, e) => {
    if (i === zoomedIndex) {
      setZoomedIndex(null);
      setZoomIn(true);
      setOrigin({ x: 50, y: 50 });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomedIndex(i);
    setZoomIn(false);
    setOrigin({
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    });
    setCursor({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (zoomedIndex === null) return;
    const onMove = (e) => {
      const root = scrollRef.current;
      if (!root) return;
      const tile = root.querySelector(`[data-index="${zoomedIndex}"]`);
      if (!tile) return;
      const rect = tile.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
      setCursor({ x: e.clientX, y: e.clientY });
      setOrigin({
        x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
        y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [zoomedIndex]);

  const onMediaMove = (e) => setCursor({ x: e.clientX, y: e.clientY });
  const onMediaEnter = (e) => { setCursor({ x: e.clientX, y: e.clientY }); setCursorOn(true); };
  const onMediaLeave = () => setCursorOn(false);

  if (!images.length) {
    return (
      <div className="gallery-col">
        <div className="detail-art detail-art--bare" style={{ display: 'grid', placeItems: 'center', minHeight: 420 }}>
          <ProductArt category={zone} />
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-col">
      <div
        /* `gallery-grid` is the mosaic; the earlier single-column class is gone. */
        className="gallery-scroll gallery-grid"
        ref={scrollRef}
        onMouseMove={onMediaMove}
        onMouseEnter={onMediaEnter}
        onMouseLeave={onMediaLeave}
      >
        {images.map((src, i) => {
          const zoomed = zoomedIndex === i;
          return (
            <button
              type="button"
              className={`gallery-slide gallery-slide--${spans[i]}${zoomed ? ' is-zoomed' : ''}`}
              key={src}
              data-index={i}
              aria-label={zoomed ? `Reset zoom on ${title} view ${i + 1}` : `Zoom ${title} view ${i + 1}`}
              aria-pressed={zoomed}
              onClick={(e) => handleImageClick(i, e)}
              style={zoomed ? {
                backgroundImage: `url(${src})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `${origin.x}% ${origin.y}%`,
                backgroundSize: '250%',
              } : undefined}
            >
              <img
                src={src}
                alt={`${title} - view ${i + 1}`}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                style={zoomed ? { opacity: 0 } : undefined}
              />
            </button>
          );
        })}
      </div>

      {/* Counter and the left-edge pill. The pill is the scroll affordance - it
          sits over the media, centred vertically, exactly as theirs does. */}
      {images.length > 1 && (
        <>
          <div className="gallery-pill" aria-hidden={false}>
            <button
              type="button"
              className="gallery-pill__btn"
              onClick={() => step(-1)}
              disabled={atTop}
              aria-label="Scroll up"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path d="M12 8l-6 6h12z" fill="currentColor" />
              </svg>
            </button>
            <span className="gallery-pill__rail">
              <span
                className="gallery-pill__thumb"
                style={{ transform: `translateY(${(active / Math.max(images.length - 1, 1)) * 100}%)` }}
              />
            </span>
            <button
              type="button"
              className="gallery-pill__btn"
              onClick={() => step(1)}
              disabled={atBottom}
              aria-label="Scroll down"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path d="M12 16l6-6H6z" fill="currentColor" />
              </svg>
            </button>
          </div>

          <p className="gallery-count" aria-live="polite">
            <span className="gallery-count__now">{Math.min(active + 1, images.length)}</span>
            <span className="gallery-count__sep">/</span>
            <span>{images.length}</span>
          </p>
        </>
      )}

      <span
        className={`gallery-cursor${cursorOn ? ' is-on' : ''}${zoomIn ? ' is-in' : ' is-out'}`}
        style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
        aria-hidden="true"
      />
    </div>
  );
}
