"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { EASE, VIEWPORT } from "@/lib/motion";

// Server HTML shows the final number, so it reads correctly without JavaScript.
export function CountUp({ to, decimals = 0, duration = 1.2, className }: { to: number; decimals?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const reduced = useReducedMotion();
  const final = to.toFixed(decimals);

  useEffect(() => {
    if (!reduced && !inView && ref.current) ref.current.textContent = (0).toFixed(decimals);
  }, [reduced, inView, decimals]);

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return;
    if (reduced) {
      node.textContent = final;
      return;
    }
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (value) => { node.textContent = value.toFixed(decimals); } });
    return () => controls.stop();
  }, [inView, reduced, to, decimals, duration, final]);

  return <span ref={ref} className={className}>{final}</span>;
}
