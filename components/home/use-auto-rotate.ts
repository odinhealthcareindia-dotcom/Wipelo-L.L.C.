"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";

// Cycles through `count` options while the block is on screen, pausing on hover or focus.
// Stops for good once the visitor picks an option, and never runs with reduced motion.
export function useAutoRotate(count: number) {
  const [active, setActive] = useState(0);
  const [userPicked, setUserPicked] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rotating = !userPicked && !reducedMotion;

  return {
    active,
    userPicked,
    rotating,
    running: rotating && inView && !paused,
    pick(index: number) {
      setActive(index);
      setUserPicked(true);
    },
    advance() {
      setActive((current) => (current + 1) % count);
    },
    // Jump to an option without counting as a visitor's pick, so rotation carries on from there.
    resumeFrom(index: number) {
      setActive(index);
    },
    rootProps: {
      ref: rootRef,
      onPointerEnter: () => setPaused(true),
      onPointerLeave: () => setPaused(false),
      onFocus: () => setPaused(true),
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      },
    },
  };
}

// Arrow/Home/End handling for a row of tab-like buttons.
export function nextTabIndex(key: string, index: number, count: number) {
  const last = count - 1;
  if (key === "ArrowRight") return index === last ? 0 : index + 1;
  if (key === "ArrowLeft") return index === 0 ? last : index - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  return null;
}
