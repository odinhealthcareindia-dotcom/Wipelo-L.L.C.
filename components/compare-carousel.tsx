"use client";

import Image from "next/image";
import { m, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useReducer, useRef, useState } from "react";

export type CompareCarouselImage = { src: string; alt: string };

// How long each image rests before the track glides to the next one.
const DWELL_MS = 2800;
const SLIDE = { duration: 1.1, ease: [0.22, 1, 0.36, 1] } as const;

type Shuttle = { index: number; dir: 1 | -1 };

// Ping-pong through the images: 0 → 1 → … → last → … → 1 → 0 → 1 …
function step(state: Shuttle, count: number): Shuttle {
  if (count < 2) return state;
  const dir = state.index + state.dir < 0 || state.index + state.dir >= count ? (-state.dir as 1 | -1) : state.dir;
  return { index: state.index + dir, dir };
}

/**
 * Auto-advancing image track for the comparison cards. Each instance runs on its own
 * timer, pauses while pointed at, focused, or scrolled out of view, and stays on the
 * first image when the visitor prefers reduced motion.
 */
export function CompareCarousel({ images }: { images: CompareCarouselImage[] }) {
  const count = images.length;
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [{ index }, advance] = useReducer((state: Shuttle) => step(state, count), { index: 0, dir: 1 });

  const paused = hovering || focused || !inView || !!reduced || count < 2;

  // A fresh timer each time the image changes or playback resumes, so resuming always
  // gives the current image a full rest before moving on in the same direction.
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(advance, DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [paused, index]);

  // Pointer and focus land on the enclosing card link, so listen there.
  useEffect(() => {
    const card = ref.current?.parentElement;
    if (!card) return;
    const enter = () => setHovering(true);
    const leave = () => setHovering(false);
    const focusIn = () => setFocused(true);
    const focusOut = () => setFocused(false);
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("focusin", focusIn);
    card.addEventListener("focusout", focusOut);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("focusin", focusIn);
      card.removeEventListener("focusout", focusOut);
    };
  }, []);

  return <div ref={ref} className="cmpx-carousel">
    <m.div
      className="cmpx-carousel-track"
      initial={false}
      animate={{ x: `${-index * 100}%` }}
      transition={reduced ? { duration: 0 } : SLIDE}
    >
      {images.map((image, i) => <div className="cmpx-carousel-slide" key={image.src} aria-hidden={i !== index}>
        <Image src={encodeURI(image.src)} alt={i === index ? image.alt : ""} fill sizes="(max-width: 640px) 90vw, (max-width: 1100px) 30vw, 360px" />
      </div>)}
    </m.div>
  </div>;
}
