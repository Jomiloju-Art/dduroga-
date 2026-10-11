import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { promoSlides } from '../data/promoSlides.js';
import { IconArrowRight, IconChevronLeft, IconChevronRight } from './Icons.jsx';

/**
 * Promo carousel: image slides with overlaid text, arrows and dot navigation.
 *
 * Built on a native scroll-snap container rather than a transform track. That
 * buys real touch, trackpad and keyboard scrolling instead of a click-only
 * control, and it is what lets the next slide sit partly in view — the peek is
 * a property of the layout (a slide is narrower than the viewport), not a
 * hand-rolled drag handler that has to re-implement momentum and inertia.
 */
export default function PromoCarousel() {
  const viewportRef = useRef(null);
  const [i, setI] = useState(0);
  const total = promoSlides.length;

  /** Distance from one slide's start to the next, read off the live layout. */
  const stepSize = useCallback(() => {
    const el = viewportRef.current;
    const slide = el?.querySelector('.promo-slide');
    if (!el || !slide) return el?.clientWidth || 0;
    const gap = parseFloat(getComputedStyle(el.querySelector('.promo-carousel__track'))?.columnGap || '0') || 0;
    return slide.getBoundingClientRect().width + gap;
  }, []);

  const scrollToIndex = useCallback((k, smooth = true) => {
    const el = viewportRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: k * stepSize(), behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }, [stepSize]);

  /* Wraps in both directions so neither arrow ever dead-ends. */
  const go = (dir) => {
    const next = (i + dir + total) % total;
    setI(next);
    scrollToIndex(next);
  };

  /* Keep the dots in step with the reader, including swipes and keyboard
     scrolling that never touch the buttons. */
  const onScroll = () => {
    const el = viewportRef.current;
    if (!el) return;
    const step = stepSize();
    if (!step) return;
    const k = Math.max(0, Math.min(total - 1, Math.round(el.scrollLeft / step)));
    setI((prev) => (prev === k ? prev : k));
  };

  /* Re-align on resize: the step size is a percentage, so a width change leaves
     the old scrollLeft pointing between two slides. */
  useEffect(() => {
    const onResize = () => scrollToIndex(i, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [i, scrollToIndex]);

  return (
    <div className="promo-carousel">
      <div
        className="promo-carousel__viewport"
        ref={viewportRef}
        onScroll={onScroll}
        tabIndex={0}
        /* group, not region: the wrapping <section> is already a landmark named
           "Featured promotions", and a second landmark with the same name trips
           axe's landmark-unique rule. tabIndex keeps it keyboard-scrollable. */
        role="group"
        aria-label="Promotion slides"
      >
        <div className="promo-carousel__track">
          {promoSlides.map((s, k) => (
            <div className="promo-slide" key={s.id} aria-roledescription="slide" aria-label={`${k + 1} of ${total}`}>
              <picture>
                <source media="(max-width: 900px)" srcSet={s.imgMobile} />
                <img className="promo-slide__img" src={s.img} alt="" loading="lazy" />
              </picture>
              <div className="promo-slide__text">
                <h2>{s.title}</h2>
                <p>{s.text}</p>
                <Link className="promo-slide__cta" to={s.href}>
                  {s.cta} <IconArrowRight width="14" height="14" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="promo-nav promo-nav--prev"
        onClick={() => go(-1)}
        aria-label="Previous slide"
      >
        <IconChevronLeft width="28" height="28" />
      </button>
      <button
        type="button"
        className="promo-nav promo-nav--next"
        onClick={() => go(1)}
        aria-label="Next slide"
      >
        <IconChevronRight width="28" height="28" />
      </button>

      <ul className="promo-carousel__dots">
        {promoSlides.map((s, k) => (
          <li key={s.id}>
            <button
              type="button"
              className={k === i ? 'is-active' : undefined}
              aria-label={`Show slide ${k + 1} of ${total}`}
              aria-current={k === i}
              onClick={() => { setI(k); scrollToIndex(k); }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
