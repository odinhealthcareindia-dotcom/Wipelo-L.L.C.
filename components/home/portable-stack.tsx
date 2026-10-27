"use client";

import { useEffect } from "react";
import { useAutoRotate } from "./use-auto-rotate";

const SHUFFLE_MS = 2000;

const packs = [
  { id: "otg", category: "Body cleansing wipes", sku: "ON THE GO", spec: ["Use · Body refresh", "Support · Zinc ricinoleate"] },
  { id: "spotless", category: "Body skincare wipes", sku: "SPOTLESS", spec: ["Use · Breakout-prone body skin", "Proposed · 0.5% salicylic acid"] },
  { id: "her", category: "Intimate cleansing wipes", sku: "HER", spec: ["Use · External intimate care", "Fragrance-free · External only"] },
];

const slotNames = ["front", "middle", "back"];

export function PortableStack() {
  const rotation = useAutoRotate(packs.length);
  const { active, running, advance } = rotation;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(advance, SHUFFLE_MS);
    return () => window.clearInterval(timer);
  }, [running, advance]);

  // Each shuffle moves the back card to the front: ON THE GO → HER → SPOTLESS → …
  const front = (packs.length - (active % packs.length)) % packs.length;

  return <div className="portable-stack" aria-hidden="true" {...rotation.rootProps}>
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
