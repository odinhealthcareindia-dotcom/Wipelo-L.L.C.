"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAutoRotate } from "./use-auto-rotate";

const SHUFFLE_MS = 2000;

const packs = [
  { id: "otg", href: "/products/on-the-go", category: "Body cleansing wipes", sku: "ON THE GO", spec: ["Use · Body refresh", "Support · Zinc ricinoleate"], value: "Zinc ricinoleate", tag: "odor-binding" },
  { id: "spotless", href: "/products/spotless", category: "Body skincare wipes", sku: "SPOTLESS", spec: ["Use · Breakout-prone body skin", "Proposed · 0.5% salicylic acid"], value: "0.5% salicylic acid", tag: "planned" },
  { id: "her", href: "/products/her", category: "Intimate cleansing wipes", sku: "HER", spec: ["Use · External intimate care", "Fragrance-free · External only"], value: "Fragrance-free", tag: "external use" },
];

const slotNames = ["front", "middle", "back"];

type Shuffle = { front: number; active: number; preview: (index: number | null) => void };
const ShuffleContext = createContext<Shuffle>({ front: 0, active: 0, preview: () => {} });

// Shares one shuffle between the pack stack and the spec sheet, so the front pack and its row stay in step.
export function PortableShuffle({ className, children }: { className?: string; children: ReactNode }) {
  const rotation = useAutoRotate(packs.length);
  const { active, running, advance } = rotation;
  const [previewed, setPreviewed] = useState<number | null>(null);
  // The rotation step that was set by leaving a preview; that step shouldn't replay the shuffle animation.
  const [settled, setSettled] = useState(-1);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(advance, SHUFFLE_MS);
    return () => window.clearInterval(timer);
  }, [running, advance]);

  // Each shuffle moves the back card to the front: ON THE GO → HER → SPOTLESS → …
  const shuffled = (packs.length - (active % packs.length)) % packs.length;

  function preview(index: number | null) {
    if (index === null && previewed !== null) {
      // Carry on shuffling from the pack the visitor was just looking at.
      const step = (packs.length - previewed) % packs.length;
      rotation.resumeFrom(step);
      setSettled(step);
    }
    setPreviewed(index);
  }

  const animating = previewed === null && active !== settled;
  return <ShuffleContext.Provider value={{ front: previewed ?? shuffled, active: animating ? active : 0, preview }}>
    <div className={className} {...rotation.rootProps}>{children}</div>
  </ShuffleContext.Provider>;
}

export function PortableStack() {
  const { front, active } = useContext(ShuffleContext);
  return <div className="portable-stack" aria-hidden="true">
    {packs.map((pack, index) => {
      const slot = (index - front + packs.length) % packs.length;
      const shuffling = slot === 0 && active > 0 ? ` is-shuffling-${active % 2 ? "a" : "b"}` : "";
      return <div key={pack.id} className={`portable-card portable-card-${pack.id} is-${slotNames[slot]}${shuffling}`}>
        <span className="portable-cat">{pack.category}</span>
        <span className="portable-seal" />
        <b>Wipelo</b>
        <span className="portable-sku">{pack.sku}</span>
        <span className="portable-spec">{pack.spec[0]}<br />{pack.spec[1]}</span>
      </div>;
    })}
  </div>;
}

// The spec sheet: the row for the pack in front lights up, and hovering a row brings its pack forward.
export function PortableSpecSheet() {
  const { front, preview } = useContext(ShuffleContext);
  return <div className="portable-sheet spec">
    <span className="portable-sheet-title"><span className="marker">//</span> Spec sheet</span>
    {packs.map((pack, index) => <Link
      key={pack.id}
      href={pack.href}
      className={`spec-row portable-sheet-row${index === front ? " is-front" : ""}`}
      onPointerEnter={() => preview(index)}
      onPointerLeave={() => preview(null)}
      onFocus={() => preview(index)}
      onBlur={() => preview(null)}
    >
      <span className="k">{pack.sku}</span>
      <span className="dots" aria-hidden="true" />
      <span className="v">{pack.value} <span className="marker">[{pack.tag}]</span></span>
    </Link>)}
  </div>;
}
