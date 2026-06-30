'use client';

import { useEffect, useState } from 'react';

/**
 * Floating "back to top" control, pinned bottom-right across the public site
 * (rendered once in SiteChrome). It is intentionally bespoke rather than built
 * on the shared <Button>: it is a fixed, circular control wrapping an SVG
 * progress ring, which Button's text-pill API does not model.
 *
 * Behaviour:
 *  - Hidden (and non-interactive) until the visitor scrolls past 25% of the
 *    page, then fades + lifts into view.
 *  - The terracotta ring around the olive disc tracks how far down the page the
 *    visitor has scrolled (0 → full circle).
 *  - Click scrolls smoothly to the top; honours prefers-reduced-motion (the
 *    scroll behaviour is read live so a mid-session OS change is respected).
 *
 * The scroll handler is passive and rAF-throttled so it never blocks scrolling.
 */

// Ring geometry. r=21 inside a 48-viewport circle leaves room for the stroke.
const RING_RADIUS = 21;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Reveal once the page is scrolled past this fraction of its scrollable height.
const REVEAL_THRESHOLD = 0.25;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 of page scrolled

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
      setVisible(ratio > REVEAL_THRESHOLD);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update(); // sync on mount (handles reloads scrolled mid-page)
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Başa dön"
      tabIndex={visible ? 0 : -1}
      className={`group fixed right-5 bottom-5 z-40 grid h-14 w-14 place-items-center rounded-full transition-all duration-300 ease-out md:right-6 md:bottom-6 ${
        visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {/* Progress ring (decorative) drawn behind the disc */}
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="2"
          className="stroke-ivory/25"
        />
        {/* Progress */}
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="stroke-terracotta transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>

      {/* Olive disc + arrow */}
      <span className="bg-olive group-hover:bg-olive-deep relative grid h-11 w-11 place-items-center rounded-full shadow-lg shadow-charcoal/25 transition-[background-color,transform,box-shadow] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-charcoal/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ivory h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </span>
    </button>
  );
}

export default ScrollToTop;
