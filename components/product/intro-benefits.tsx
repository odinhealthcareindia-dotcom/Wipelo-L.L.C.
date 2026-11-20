"use client";

import { m } from "framer-motion";
import { Children, type ReactNode } from "react";
import { useMobileSlider } from "@/components/motion/use-mobile-slider";
import styles from "./product-intro.module.css";

// Requested pace for the mobile benefits slider.
const ADVANCE_MS = 1000;

/**
 * Product-intro benefits. Desktop keeps the two-column grid; on phones each benefit becomes
 * a full-width slide that auto-advances, swipes left/right, and pauses on tap.
 */
export function IntroBenefits({ titles, children }: { titles: string[]; children: ReactNode }) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const { mobile, reduced, viewportRef, index, paused, playing, trackProps, togglePaused, goTo } = useMobileSlider({ count, intervalMs: ADVANCE_MS });

  return <div className={styles.slider} role={mobile ? "region" : undefined} aria-roledescription={mobile ? "carousel" : undefined} aria-label={mobile ? "Benefits" : undefined}>
    <div className={styles.viewport} ref={viewportRef}>
      <m.div className={styles.benefits} {...trackProps}>
        {slides.map((slide, i) => <div key={titles[i] ?? i} className={styles.slide} aria-hidden={mobile && i !== index ? true : undefined} aria-roledescription={mobile ? "slide" : undefined} aria-label={mobile ? `${i + 1} of ${count}` : undefined}>{slide}</div>)}
      </m.div>
    </div>
    <div className={styles.controls}>
      <div className={styles.dots}>
        {titles.map((title, i) => <button key={title} type="button" className={i === index ? styles.dotActive : undefined} aria-label={`Show ${title}`} aria-current={i === index ? "true" : undefined} onClick={() => goTo(i)}>
          {/* The active pill fills over each interval; keyed on index so it restarts per slide. */}
          <span>{i === index && <i key={index} className={styles.fill} style={{ animationDuration: `${ADVANCE_MS}ms`, animationPlayState: playing ? "running" : "paused" }} />}</span>
        </button>)}
      </div>
      {!reduced && <button type="button" className={styles.toggle} onClick={togglePaused} aria-label={paused ? "Play benefit slides" : "Pause benefit slides"}>
        {paused
          ? <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          : <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z" fill="currentColor" /></svg>}
      </button>}
    </div>
  </div>;
}
