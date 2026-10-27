"use client";

import { m, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

// Desktop-only image drift. With `fill`, the image is over-sized by `offset` so moving it never shows the frame's edge.
export function Parallax({ offset = 40, fill = false, className, children }: { offset?: number; fill?: boolean; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const strength = useMotionValue(0);
  const y = useTransform(() => (scrollYProgress.get() * 2 - 1) * offset * strength.get());

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const update = () => strength.set(query.matches ? 1 : 0);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [strength]);

  return <div ref={ref} className={`${fill ? "parallax-fill " : ""}${className ?? ""}`.trim() || undefined}>
    <m.div className="parallax-inner" style={fill ? { y, top: -offset, bottom: -offset } : { y }}>{children}</m.div>
  </div>;
}
