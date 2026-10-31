"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAutoRotate } from "./use-auto-rotate";

const SHUFFLE_MS = 2000;

const packs = [
  { id: "otg", href: "/products/on-the-go", image: "/images/portable-packs/on-the-go.webp", sku: "ON THE GO", value: "Zinc ricinoleate", tag: "odor-binding" },
  { id: "spotless", href: "/products/spotless", image: "/images/portable-packs/spotless.webp", sku: "SPOTLESS", value: "0.5% salicylic acid", tag: "planned" },
  { id: "her", href: "/products/her", image: "/images/portable-packs/her.webp", sku: "HER", value: "Fragrance-free", tag: "external use" },
];

const slotNames = ["front", "middle", "back"];

type Shuffle = { front: number; shuffling: boolean; preview: (index: number | null) => void };
const ShuffleContext = createContext<Shuffle>({ front: 0, shuffling: false, preview: () => {} });

// Shares one shuffle between the pack stack and the spec sheet, so the front pack and its row stay in step.
export function PortableShuffle({ className, children }: { className?: string; children: ReactNode }) {
  const rotation = useAutoRotate(packs.length);
  const { active, running, advance } = rotation;
  const [previewed, setPreviewed] = useState<number | null>(null);
  // The rotation step that was set without shuffling (first paint, or leaving a preview); it shouldn't play the animation.
  const [settled, setSettled] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSettled(-1);
      advance();
    }, SHUFFLE_MS);
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

  return <ShuffleContext.Provider value={{ front: previewed ?? shuffled, shuffling: previewed === null && active !== settled, preview }}>
    <div className={className} {...rotation.rootProps}>{children}</div>
  </ShuffleContext.Provider>;
}

export function PortableStack() {
  const { front, shuffling } = useContext(ShuffleContext);
  return <div className="portable-stack" aria-hidden="true">
    {packs.map((pack, index) => {
      const slot = (index - front + packs.length) % packs.length;
      return <div key={pack.id} className={`portable-card is-${slotNames[slot]}${slot === 0 && shuffling ? " is-shuffling" : ""}`}>
        <Image src={pack.image} width={720} height={1162} sizes="(max-width: 560px) 56vw, (max-width: 920px) 34vw, 320px" alt="" loading="eager" fetchPriority={index === 0 ? "high" : "low"} draggable={false} />
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
