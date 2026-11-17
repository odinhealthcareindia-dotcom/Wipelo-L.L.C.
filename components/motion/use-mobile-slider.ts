"use client";

import { animate, useInView, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SPRING = { type: "spring", stiffness: 260, damping: 32 } as const;

/**
 * Shared behaviour for lists that stay a plain list on desktop but become a one-item slider
 * on phones: auto-advance (looping), swipe left/right, pause/resume, and jump-to-slide.
 * It pauses while dragging, while scrolled out of view, and never auto-plays for visitors
 * who prefer reduced motion. Spread `trackProps` onto the `m.*` element that holds the slides.
 */
export function useMobileSlider({ count, intervalMs, gap = 0, query = "(max-width: 720px)" }: { count: number; intervalMs: number; gap?: number; query?: string }) {
  const reduced = Boolean(useReducedMotion());
  const viewportRef = useRef<HTMLDivElement>(null);
  const inView = useInView(viewportRef, { amount: 0.5 });
  const x = useMotionValue(0);
  const [mobile, setMobile] = useState(false);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Distance between slide starts: one viewport width plus the CSS gap between slides.
  const step = width + gap;

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  // Track the slide width so drag limits and positions stay right after rotation/resizes.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !mobile) return;
    const observer = new ResizeObserver(() => setWidth(el.offsetWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile]);

  useEffect(() => {
    if (!mobile) {
      x.set(0);
      return;
    }
    const controls = animate(x, -index * step, reduced ? { duration: 0 } : SPRING);
    return () => controls.stop();
  }, [index, step, mobile, reduced, x]);

  const playing = mobile && !paused && !dragging && inView && !reduced && count > 1;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => window.clearTimeout(timer);
  }, [playing, index, count, intervalMs]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    const swipe = info.offset.x + info.velocity.x * 0.2;
    const threshold = width * 0.18;
    const next = swipe < -threshold ? Math.min(index + 1, count - 1) : swipe > threshold ? Math.max(index - 1, 0) : index;
    if (next === index) animate(x, -index * step, SPRING);
    else setIndex(next);
  };

  const trackProps = {
    style: { x },
    drag: mobile ? ("x" as const) : false,
    dragConstraints: { left: -(count - 1) * step, right: 0 },
    dragElastic: 0.12,
    dragMomentum: false,
    onDragStart: () => setDragging(true),
    onDragEnd,
    onTap: mobile ? () => setPaused((p) => !p) : undefined,
    "aria-live": mobile && paused ? ("polite" as const) : ("off" as const),
  };

  return {
    mobile,
    reduced,
    viewportRef,
    index,
    paused,
    playing,
    trackProps,
    togglePaused: () => setPaused((p) => !p),
    goTo: (i: number) => { setIndex(i); setPaused(true); },
    // Step forward/back with wrap-around (for layouts that render their own slides, e.g. a card deck).
    advance: (delta: number) => setIndex((i) => (i + delta + count) % count),
    viewportWidth: width,
  };
}
