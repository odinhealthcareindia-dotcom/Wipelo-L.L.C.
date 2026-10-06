"use client";

import { useState, type CSSProperties } from "react";

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const style = { "--cut": `${position}%` } as CSSProperties;

  return <div className="ba" style={style}>
    <img src="https://images.unsplash.com/photo-1551184451-76b762941ad6?w=1200&q=75&auto=format&fit=crop" alt="Before — illustrative" />
    <img className="ba-after" src="https://images.unsplash.com/photo-1519455953755-af066f52f1a6?w=1200&q=75&auto=format&fit=crop" alt="After — illustrative" />
    <span className="ba-line" />
    <span className="ba-tag l">Week 0*</span><span className="ba-tag r">Week 4* · pH-True™</span>
    <input type="range" min={0} max={100} value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label="Compare before and after" />
  </div>;
}
