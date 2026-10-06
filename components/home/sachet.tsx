"use client";

import { useState } from "react";

export function Sachet() {
  const [torn, setTorn] = useState(false);
  return <button
    className={`sachet sachet-sm${torn ? " torn" : ""}`}
    style={{ position: "absolute", bottom: 44, right: "12%", transform: "rotate(6deg)", zIndex: 3 }}
    type="button"
    aria-label="Tear the seal"
    aria-pressed={torn}
    onClick={() => setTorn((value) => !value)}
  >
    <span className="s-notch" />
    <span className="s-brand">Wipelo</span>
    <span className="s-func">Single-Seal Fresh™</span>
    <span className="s-line">1 of 50 · tear here →</span>
  </button>;
}
