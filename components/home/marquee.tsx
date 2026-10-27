import { Marquee } from "@/components/motion/marquee";

const lines = ["Formulated, not fragranced", "Dosed to work, not to mask", "One active. One job. Done properly.", "Back skin is skin"];

export function MarqueeSection() {
  return (
    <div className="band" aria-hidden="true">
      <Marquee seconds={36} className="band-marquee">
        {lines.map((line) => <span className="band-item" key={line}><span>{line}</span><span className="sp">✦</span></span>)}
      </Marquee>
    </div>
  );
}
