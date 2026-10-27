"use client";

import { m, useReducedMotion } from "framer-motion";
import { VIEWPORT } from "@/lib/motion";

// A thin outline that draws itself once when it scrolls into view.
export function DrawCircle({ className, duration = 1.2 }: { className?: string; duration?: number }) {
  const reduced = useReducedMotion();
  return <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
    <m.circle
      cx="50" cy="50" r="49.5"
      fill="none" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke"
      initial={{ pathLength: 0, rotate: -90 }}
      whileInView={{ pathLength: 1, rotate: -90 }}
      viewport={VIEWPORT}
      transition={{ duration: reduced ? 0.3 : duration, ease: [0.22, 1, 0.36, 1] }}
      style={{ originX: "50%", originY: "50%" }}
    />
  </svg>;
}
