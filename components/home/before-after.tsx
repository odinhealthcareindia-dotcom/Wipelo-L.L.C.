"use client";

import { useState, type CSSProperties } from "react";

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const style = { "--cut": `${position}%` } as CSSProperties;

  return <div className="ba" style={style}>
    <img src="/after-before/Natural_Skin_Texture_Portrait.png" />
    <img className="ba-after" src="/after-before/Clear_Skin_Progress_Portrait.png" alt="After — illustrative" />
    <span className="ba-line" />
    <span className="ba-tag l">Week 0*</span><span className="ba-tag r">Week 4* · pH-True™</span>
    <input type="range" min={0} max={100} value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label="Compare before and after" />
  </div>;
}
