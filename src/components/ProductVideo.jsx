/**
 * Product video player - the "Gymshark pattern", adapted for a PPE catalogue.
 *
 * Behaviour, and why each piece is here:
 *
 *   plays when scrolled into view   IntersectionObserver, not hover. Hover-play
 *                                   does not exist on touch, which is most of
 *                                   our traffic; scroll-play works everywhere and
 *                                   reads the same on a desktop pointer.
 *   muted loop playsinline          the mobile-autoplay triad. playsinline is
 *                                   what stops iOS Safari taking the video
 *                                   fullscreen and hijacking the page.
 *   preload="metadata"              enough for the first frame; the full file is
 *                                   not fetched until playback actually starts.
 *   explicit Pause button           WCAG 2.2.2 - anything moving for more than
 *                                   5s needs a way to stop it. Styled like
 *                                   Gymshark's overlay control.
 *   prefers-reduced-motion          if the user asks for less motion we render
 *                                   the poster and a Play button instead. The
 *                                   observer never auto-starts.
 *   mp4 only                        .vercelignore keeps the .webm copies off the
 *                                   host (upload size), so offering them first
 *                                   cost every visitor a 404 before the mp4.
 *                                   Pass `webm` again only if they are deployed.
 *
 * The video is presented as a gallery slide, not an ambient background: on a PPE
 * page the buyer wants "show me the boot", so it belongs where the photos are.
 */
import { useEffect, useRef, useState } from 'react';

export default function ProductVideo({
  mp4,
  webm,
  poster,
  title = 'Product',
  className = '',
  /** Render as the active gallery slide rather than an always-on block. */
  active = true,
  /**
   * `contain` keeps the whole frame visible; `cover` fills the box and crops.
   * The Designed For section uses cover so the clip fills its column edge to
   * edge, matching Gymshark's treatment there.
   */
  fit = 'contain',
}) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  /** Set once the user pauses by hand - the observer must not restart it. */
  const [userPaused, setUserPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;

    // Browsers block unmuted autoplay, so the element is muted by markup and we
    // still catch the promise rejection: a video that cannot start must not
    // throw an unhandled error into the console.
    const play = () => v.play().catch(() => {});
    const pause = () => v.pause();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.5) { pause(); setPlaying(false); return; }
        if (userPaused) return;
        play();
        setPlaying(true);
      },
      { threshold: [0, 0.5, 1] }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced, userPaused]);

  // Stop playback when this slide is not the one being shown.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) { v.pause(); v.currentTime = 0; setPlaying(false); }
  }, [active]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); setUserPaused(false); }
    else { v.pause(); setPlaying(false); setUserPaused(true); }
  };

  return (
    <div className={`pv${fit === 'cover' ? ' pv--fill' : ''}${className ? ` ${className}` : ''}`}>
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${title} product video`}
        style={fit === 'cover' ? { objectFit: 'cover' } : undefined}
      >
        {webm && <source src={webm} type="video/webm" />}
        <source src={mp4} type="video/mp4" />
      </video>

      {/* Only offer the control once there is something to control: with
          reduced-motion the video never autoplays, so Pause would be a lie. */}
      {playing && !reduced && (
        <button
          type="button"
          className="pv__btn"
          onClick={toggle}
          aria-label={`Pause ${title} video`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
        </button>
      )}

      {reduced && (
        <button
          type="button"
          className="pv__btn"
          onClick={toggle}
          aria-label={playing ? `Pause ${title} video` : `Play ${title} video`}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
