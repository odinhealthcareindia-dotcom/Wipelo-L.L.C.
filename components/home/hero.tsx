import Link from "next/link";
import { HeroVisual } from "./hero-visual";

export function HeroSection() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="mono-tag">✦ Thoughtful care for life on the move</span>
          <h1 className="h-display">Care that goes<br /><em>where life does.</em></h1>
          <p className="lede">Three kinds of individually wrapped care, each made for a different moment: a freshen-up between showers, targeted care for breakout-prone body skin, or fragrance-free external intimate cleansing.</p>
          <div className="hero-ctas">
            <Link href="#products" className="btn btn-abyss btn-lg">Find your wipe <span className="ar">→</span></Link>
            <Link href="#choose-your-wipe" className="link-arrow">Help me choose ↓</Link>
          </div>
          <div className="trust-chips">
            <span className="tchip"><b>01</b> Between-shower freshness</span>
            <span className="tchip"><b>02</b> Body breakout care</span>
            <span className="tchip"><b>03</b> External intimate care</span>
          </div>
           <div className="hero-spec spec" style={{ marginTop: "28px" }}>
            <div className="spec-row"><span className="k marker">//</span><span className="k">ON THE GO</span><span className="dots"></span><span className="v">Zinc ricinoleate <span className="marker">[odor-binding]</span></span></div>
            <div className="spec-row"><span className="k">SPOTLESS</span><span className="dots"></span><span className="v">0.5% salicylic acid <span className="marker">[planned]</span></span></div>
            <div className="spec-row"><span className="k">HER</span><span className="dots"></span><span className="v">Fragrance-free <span className="marker">[external use]</span></span></div>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
