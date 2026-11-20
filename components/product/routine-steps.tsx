"use client";

import { m } from "framer-motion";
import { useMobileSlider } from "@/components/motion/use-mobile-slider";

type Step = { title: string; body: string };

/**
 * The PDP routine list. Desktop renders the plain numbered list. On phones the same list
 * becomes a one-step-at-a-time slider: it auto-advances, swipes left/right, and a tap on the
 * slide (or the pause button) pauses it.
 */
export function RoutineSteps({ steps }: { steps: Step[] }) {
  const count = steps.length;
  const { mobile, reduced, viewportRef, index, paused, trackProps, togglePaused, goTo } = useMobileSlider({ count, intervalMs: 4500 });

  return <div className="pdp6-routine" role={mobile ? "region" : undefined} aria-roledescription={mobile ? "carousel" : undefined} aria-label={mobile ? "Routine steps" : undefined}>
    <div className="pdp6-routine-viewport" ref={viewportRef}>
      <m.ol {...trackProps}>
        {steps.map((step, i) => <li key={step.title} aria-hidden={mobile && i !== index ? true : undefined} aria-roledescription={mobile ? "slide" : undefined} aria-label={mobile ? `${i + 1} of ${count}` : undefined}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <div><b>{step.title}</b><p>{step.body}</p></div>
        </li>)}
      </m.ol>
    </div>
    <div className="pdp6-routine-controls">
      <div className="pdp6-routine-dots">
        {steps.map((step, i) => <button key={step.title} type="button" className={i === index ? "is-active" : undefined} aria-label={`Show step ${i + 1}: ${step.title}`} aria-current={i === index ? "step" : undefined} onClick={() => goTo(i)}><span /></button>)}
      </div>
      {!reduced && <button type="button" className="pdp6-routine-toggle" onClick={togglePaused} aria-label={paused ? "Play routine slides" : "Pause routine slides"}>
        {paused
          ? <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
          : <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z" fill="currentColor" /></svg>}
      </button>}
    </div>
  </div>;
}
