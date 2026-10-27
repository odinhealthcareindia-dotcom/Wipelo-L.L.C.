import type { ReactNode } from "react";

// A constant, linear CSS loop: the content is repeated once so the -50% shift is seamless.
// It pauses on hover and stands still with "reduce motion" switched on (see .marquee in globals.css).
export function Marquee({ seconds = 36, className, children }: { seconds?: number; className?: string; children: ReactNode }) {
  return <div className={`marquee${className ? ` ${className}` : ""}`}>
    <div className="marquee-track" style={{ animationDuration: `${seconds}s` }}>
      <div className="marquee-group">{children}</div>
      <div className="marquee-group" aria-hidden="true">{children}</div>
    </div>
  </div>;
}
