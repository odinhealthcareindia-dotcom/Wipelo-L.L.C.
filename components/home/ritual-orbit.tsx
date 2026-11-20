"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type RitualStep = { title: string; body: string; image: string; alt: string };

// Long enough to take in the photo and read the step beside it before the next one.
const STEP_MS = 3800;
// Where each step sits on the ring, in degrees clockwise from 12 o'clock.
const ANGLES = [300, 60, 180];

function pointOnRing(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { left: `${50 + 50 * Math.sin(rad)}%`, top: `${50 - 50 * Math.cos(rad)}%` };
}

// Smallest clockwise rotation from `from` to land on `angle`, so the halo never travels backwards.
function clockwiseTo(from: number, angle: number) {
  return from + ((((angle - from) % 360) + 360) % 360);
}

export function RitualOrbit({ steps }: { steps: RitualStep[] }) {
  const [active, setActive] = useState(0);
  // Only offscreen time is skipped (so it doesn't jump ahead unseen); hover, focus and taps never stop the loop.
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const advance = () => setActive((current) => (current + 1) % steps.length);
  // Rotation keeps accumulating so the halo always travels clockwise, never back.
  const [turn, setTurn] = useState(ANGLES[0]);
  const [shownStep, setShownStep] = useState(0);

  // Move the halo during render when the step changes (from the timer or a pick).
  if (shownStep !== active) {
    setShownStep(active);
    setTurn((prev) => clockwiseTo(prev, ANGLES[active]));
  }

  return <div className="ritual-orbit" ref={rootRef}>
    <div className="ritual-orbit-stage">
      <span className="ritual-orbit-ring" aria-hidden="true" />
      <div className="ritual-orbit-disc">
        {steps.map((step, index) => <Image
          key={step.image}
          src={step.image}
          alt={index === active ? step.alt : ""}
          aria-hidden={index !== active}
          className={index === active ? "is-active" : undefined}
          width={800}
          height={800}
          sizes="(max-width: 960px) 60vw, 360px"
        />)}
      </div>
      <m.span className="ritual-orbit-sat" aria-hidden="true" initial={false} animate={{ rotate: turn }} transition={{ duration: 0.95, ease: [0.65, 0, 0.35, 1] }}>
        <span className="ritual-orbit-halo is-timing">
          <m.svg className="ritual-orbit-progress" viewBox="0 0 100 100" initial={false} animate={{ rotate: -turn }} transition={{ duration: 0.95, ease: [0.65, 0, 0.35, 1] }}>
            <circle
              key={active}
              cx="50"
              cy="50"
              r="48"
              pathLength={1}
              style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: inView ? "running" : "paused" }}
              onAnimationEnd={advance}
            />
          </m.svg>
        </span>
      </m.span>
      {steps.map((step, index) => <button
        key={step.title}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className={`ritual-orbit-node${index === active ? " is-active" : ""}`}
        style={pointOnRing(ANGLES[index])}
        onClick={() => setActive(index)}
      >{index + 1}</button>)}
    </div>
    <ol className="ritual-orbit-steps">
      {steps.map((step, index) => <li key={step.title} className={`ritual-orbit-step ritual-orbit-step-${index + 1}${index === active ? " is-active" : ""}`}>
        <h3>
          <button type="button" aria-pressed={index === active} onClick={() => setActive(index)}>{step.title}</button>
        </h3>
        <p>{step.body}</p>
      </li>)}
    </ol>
  </div>;
}
