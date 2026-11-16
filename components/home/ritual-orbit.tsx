"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export type RitualStep = { title: string; body: string };

// Timing of /images/ritual/ritual.gif: one 8.39 s loop with three captioned scenes.
// The orbit follows the scene on screen, so these must change if the GIF is re-cut.
const LOOP_MS = 8390;
const SCENE_STARTS_MS = [0, 2900, 5600];
// Where each step sits on the ring, in degrees clockwise from 12 o'clock.
const ANGLES = [300, 60, 180];

function sceneAt(ms: number) {
  const t = ms % LOOP_MS;
  return t >= SCENE_STARTS_MS[2] ? 2 : t >= SCENE_STARTS_MS[1] ? 1 : 0;
}

function pointOnRing(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { left: `${50 + 50 * Math.sin(rad)}%`, top: `${50 - 50 * Math.cos(rad)}%` };
}

export function RitualOrbit({ steps, alt }: { steps: RitualStep[]; alt: string }) {
  const reduced = useReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  // Rotation keeps accumulating so the halo always travels clockwise, never back.
  const [turn, setTurn] = useState(ANGLES[0]);

  // The GIF starts playing when it loads; that moment anchors the scene clock.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) setStartedAt(performance.now());
  }, []);

  useEffect(() => {
    if (reduced || startedAt === null) return;
    let current = 0;
    const tick = () => {
      const scene = sceneAt(performance.now() - startedAt);
      if (scene === current) return;
      current = scene;
      setActive(scene);
      setTurn((prev) => prev + ((((ANGLES[scene] - prev) % 360) + 360) % 360));
    };
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [reduced, startedAt]);

  const still = Boolean(reduced);

  return <div className={`ritual-orbit${still ? " is-still" : ""}`}>
    <div className="ritual-orbit-stage">
      <span className="ritual-orbit-ring" aria-hidden="true" />
      <div className="ritual-orbit-disc">
        <picture>
          <source srcSet="/images/ritual/ritual-still.jpg" media="(prefers-reduced-motion: reduce)" />
          <img ref={imgRef} src="/images/ritual/ritual.gif" alt={alt} width="800" height="800" loading="lazy" onLoad={() => setStartedAt((at) => at ?? performance.now())} />
        </picture>
      </div>
      {!still && <m.span className="ritual-orbit-sat" aria-hidden="true" initial={false} animate={{ rotate: turn }} transition={{ duration: 0.95, ease: [0.65, 0, 0.35, 1] }}>
        <span className="ritual-orbit-halo" />
      </m.span>}
      {steps.map((step, index) => <span key={step.title} className={`ritual-orbit-node${!still && index === active ? " is-active" : ""}`} style={pointOnRing(ANGLES[index])} aria-hidden="true">{index + 1}</span>)}
    </div>
    <ol className="ritual-orbit-steps">
      {steps.map((step, index) => <li key={step.title} className={`ritual-orbit-step ritual-orbit-step-${index + 1}${still || index === active ? " is-active" : ""}`}>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
      </li>)}
    </ol>
  </div>;
}
