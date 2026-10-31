import type { Variants } from "framer-motion";

// One motion vocabulary for the whole site. Sections pick from these; they never hard-code timings.

export const EASE = [0.22, 1, 0.36, 1] as const; // soft "glide" ease-out
export const SHUTTLE_EASE = [0.45, 0.05, 0.15, 1] as const; // gentle start and long settle, for long travel
export const DUR = { fast: 0.45, base: 0.7, slow: 0.9, shuttle: 1.2 };
export const VIEWPORT = { once: true, amount: 0.25, margin: "0px 0px -10% 0px" } as const;

// Full distance on a 1440px screen, roughly half on a phone, without needing JS to measure the screen.
export function travel(px: number) {
  const fixed = +(px * 0.314).toFixed(2);
  const fluid = +(px / 21).toFixed(3);
  return `calc(${fixed}px + ${fluid}vw)`;
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: travel(28) },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
};
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE } },
};
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: travel(-40) },
  show: { opacity: 1, x: 0, transition: { duration: DUR.slow, ease: EASE } },
};
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: travel(40) },
  show: { opacity: 1, x: 0, transition: { duration: DUR.slow, ease: EASE } },
};
// A full panel gliding in from off-screen. The panel starts outside the viewport, so a parent has to trigger it.
export const shuttleFromLeft: Variants = {
  hidden: { x: "-100%" },
  show: { x: 0, transition: { duration: DUR.shuttle, ease: SHUTTLE_EASE } },
};
export const shuttleFromRight: Variants = {
  hidden: { x: "100%" },
  show: { x: 0, transition: { duration: DUR.shuttle, ease: SHUTTLE_EASE } },
};
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.slow, ease: EASE } },
};
export const softScale: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.slow, ease: EASE } },
};
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.fast, ease: EASE } },
};
export const nudgeIn: Variants = {
  hidden: { opacity: 0, x: travel(12) },
  show: { opacity: 1, x: 0, transition: { duration: DUR.base, ease: EASE } },
};
// A photo settling into its frame (put it inside an overflow: hidden wrapper).
export const settle: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.slow, ease: EASE } },
};
// A rule that draws itself from the left; give the element transform-origin: left.
export const drawLine: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: DUR.slow, ease: EASE } },
};
// Cards being dealt onto a table.
export const deal: Variants = {
  hidden: { opacity: 0, y: travel(40), rotate: -3 },
  show: { opacity: 1, y: 0, rotate: 0, transition: { duration: DUR.slow, ease: EASE } },
};

// What everyone gets with "reduce motion" switched on: a short fade, no movement.
export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: "linear" } },
};

export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

export const VARIANTS = { fadeUp, fadeIn, slideFromLeft, slideFromRight, shuttleFromLeft, shuttleFromRight, scaleIn, softScale, pop, nudgeIn, settle, drawLine, deal } as const;
export type VariantName = keyof typeof VARIANTS;

// Hover/tap feedback for buttons and cards (applied with CSS where the element is server-rendered).
export const buttonHover = { y: -2 };
export const buttonTap = { scale: 0.98 };
export const cardHover = { y: -4, transition: { duration: 0.3, ease: EASE } };
