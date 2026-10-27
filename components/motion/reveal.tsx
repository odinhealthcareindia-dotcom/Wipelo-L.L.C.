"use client";

import { m, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { VARIANTS, VIEWPORT, reducedFade, stagger, type VariantName } from "@/lib/motion";

type Tag = "div" | "section" | "header" | "ul" | "ol" | "li" | "p" | "span" | "h2" | "h3" | "figure" | "blockquote" | "dl" | "table" | "tbody" | "tr" | "td" | "th" | "button" | "nav";

type MotionElementProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "animate" | "whileInView" | "viewport" | "children"> & {
  as?: Tag;
  type?: "button" | "submit" | "reset";
  children?: ReactNode;
};

// Inside <Stagger>, children follow the parent's timing instead of watching the viewport themselves.
const StaggerContext = createContext(false);

// The hidden state is identical for everyone so server and client HTML match. With "reduce motion",
// MotionConfig snaps transforms into place and only this shortened fade remains.
function resolveVariants(variants: Variants, delay: number, reduced: boolean): Variants {
  if (!delay && !reduced) return variants;
  const show = variants.show as { transition?: object };
  const transition = reduced ? { ...(reducedFade.show as { transition: object }).transition, delay: Math.min(delay, 0.1) } : { ...show.transition, delay };
  return { ...variants, show: { ...show, transition } } as Variants;
}

export function Reveal({ variant = "fadeUp", delay = 0, as = "div", children, ...rest }: MotionElementProps & { variant?: VariantName; delay?: number }) {
  const reduced = useReducedMotion();
  const staggered = useContext(StaggerContext);
  const variants = useMemo(() => resolveVariants(VARIANTS[variant], delay, !!reduced), [reduced, variant, delay]);
  const Element = m[as] as typeof m.div;
  const trigger = staggered ? {} : { initial: "hidden", whileInView: "show", viewport: VIEWPORT };
  return <Element data-motion="" variants={variants} {...trigger} {...rest}>{children}</Element>;
}

export function Stagger({ gap = 0.08, delay = 0, as = "div", children, ...rest }: MotionElementProps & { gap?: number; delay?: number }) {
  const staggered = useContext(StaggerContext);
  const variants = useMemo(() => stagger(gap, delay), [gap, delay]);
  const Element = m[as] as typeof m.div;
  const trigger = staggered ? {} : { initial: "hidden", whileInView: "show", viewport: VIEWPORT };
  return <StaggerContext.Provider value>
    <Element variants={variants} {...trigger} {...rest}>{children}</Element>
  </StaggerContext.Provider>;
}
