"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";

const DWELL_SECONDS = 5;
const EASE = [0.19, 1, 0.22, 1] as const;

const announcements: { id: string; text: ReactNode; href?: string }[] = [
  { id: "types", text: <><span className="tk"> Free shipping</span> on orders over $30</> },
  { id: "wrapped", text: <>We ship <span className="tk">worldwide</span> </> },
  { id: "lineup", text: <>Meet <span className="tk">On The Go</span>, <span className="tk">Spotless</span> &amp; <span className="tk">Her</span></>, href: "/shop" },
];

// direction: 1 rolls the next message up from below, -1 drops the previous one down from above
const roll = {
  enter: (direction: number) => ({ y: `${direction * 100}%`, opacity: 0 }),
  center: { y: "0%", opacity: 1 },
  exit: (direction: number) => ({ y: `${direction * -100}%`, opacity: 0 }),
};
const fade = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

export function AnnouncementBar() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const progress = useRef<AnimationPlaybackControls | null>(null);

  const paused = hovered || focused || hidden;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const go = (step: number) => setSlide(([current]) => [(current + step + announcements.length) % announcements.length, step]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // The active segment's fill doubles as the rotation timer.
  useEffect(() => {
    if (reduceMotion) return;
    const fill = scope.current?.querySelector<HTMLElement>(`[data-seg="${index}"] i`);
    if (!fill) return;
    let cancelled = false;
    const controls = animate(fill, { scaleX: [0, 1] }, { duration: DWELL_SECONDS, ease: "linear" });
    progress.current = controls;
    if (pausedRef.current) controls.pause();
    controls.then(() => { if (!cancelled) go(1); });
    return () => { cancelled = true; controls.stop(); };
  }, [index, reduceMotion, animate, scope]);

  useEffect(() => {
    if (paused) progress.current?.pause();
    else progress.current?.play();
  }, [paused]);

  const current = announcements[index];

  return <section
    className="ticker"
    aria-roledescription="carousel"
    aria-label="Announcements"
    onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
    onPointerLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)}
    onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
  >
    <div className="ticker-inner ticker-controls" ref={scope}>
      <button type="button" className="ticker-arrow" aria-label="Previous announcement" onClick={() => go(-1)}><Chevron flip /></button>
      <div className="ticker-stage" aria-live={paused || reduceMotion ? "polite" : "off"} aria-atomic="true">
        <AnimatePresence initial={false} custom={direction}>
          <motion.p
            key={current.id}
            className="ticker-msg"
            custom={direction}
            variants={reduceMotion ? fade : roll}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: EASE }}
            aria-label={`${index + 1} of ${announcements.length}`}
            aria-roledescription="slide"
          >
            {current.href
              ? <Link href={current.href} className="ticker-link"><span>{current.text}</span><span className="ticker-go" aria-hidden="true">→</span></Link>
              : <span>{current.text}</span>}
          </motion.p>
        </AnimatePresence>
      </div>
      <button type="button" className="ticker-arrow" aria-label="Next announcement" onClick={() => go(1)}><Chevron /></button>
      <div className="ticker-track" aria-hidden="true">
        {announcements.map((item, i) => <span key={item.id} data-seg={i} data-state={i < index ? "past" : i === index ? "now" : "next"}><i /></span>)}
      </div>
    </div>
  </section>;
}

function Chevron({ flip }: { flip?: boolean }) {
  return <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden="true">
    <path d={flip ? "M5.5 1.5 1.5 5.5l4 4" : "M1.5 1.5 5.5 5.5l-4 4"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
