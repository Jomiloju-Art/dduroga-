import { useEffect, useRef, useState } from 'react';

/**
 * Counts up to `to` when the element scrolls into view.
 *
 * Written here rather than pulling in countup.js: it is ~30 lines, and this way
 * it respects prefers-reduced-motion (jumping straight to the final value) and
 * integrates with the existing IntersectionObserver pattern. Say the word if you
 * specifically want the npm package instead.
 */
export default function CountUp({ to, duration = 1400, className = '', suffix = '' }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target = Number(to) || 0;

    // Respect the user's motion preference: show the number, skip the animation.
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          setValue(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <strong ref={ref} className={className}>
      {value.toLocaleString('en-NG')}
      {suffix}
    </strong>
  );
}
