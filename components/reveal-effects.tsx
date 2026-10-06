"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function RevealEffects({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealVisible = () => {
      const viewHeight = window.innerHeight || document.documentElement.clientHeight;
      root.querySelectorAll<HTMLElement>(".rv:not(.in)").forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < viewHeight - 30 && rect.bottom > 0) item.classList.add("in");
      });
      root.querySelectorAll<HTMLElement>("[data-count]:not(.counted)").forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top >= viewHeight - 20 || rect.bottom <= 0) return;
        item.classList.add("counted");
        const target = Number(item.dataset.count);
        const suffix = item.dataset.suffix || "";
        if (!Number.isFinite(target)) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          item.textContent = `${target}${suffix}`;
          return;
        }
        let start: number | null = null;
        const animate = (time: number) => {
          start ??= time;
          const progress = Math.min(1, (time - start) / 1100);
          const eased = 1 - Math.pow(1 - progress, 3);
          item.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) window.requestAnimationFrame(animate);
        };
        window.requestAnimationFrame(animate);
      });
    };

    window.addEventListener("scroll", revealVisible, { passive: true });
    window.addEventListener("resize", revealVisible);
    const timeout = window.setTimeout(revealVisible, 40);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("scroll", revealVisible);
      window.removeEventListener("resize", revealVisible);
    };
  }, []);

  return <div className="legacy-page" ref={rootRef}>{children}</div>;
}
