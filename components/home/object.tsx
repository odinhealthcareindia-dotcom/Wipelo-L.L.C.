import Link from "next/link";
import { Parallax } from "@/components/motion/parallax";
import { PortableShuffle, PortableSpecSheet, PortableStack } from "./portable-stack";

const uses = [
  { product: "ON THE GO", title: "Body odor refresh", body: "Mild cleansers + zinc ricinoleate." },
  { product: "SPOTLESS", title: "Breakout-prone body skin", body: "Proposed 0.5% salicylic acid." },
  { product: "HER", title: "Gentle external intimate cleansing", body: "Fragrance-free. External use only." },
];

function UseItem({ index }: { index: number }) {
  const use = uses[index];
  return <div className="portable-use">
    <span>{String(index + 1).padStart(2, "0")} · {use.product}</span>
    <h3>{use.title}</h3>
    <p>{use.body}</p>
  </div>;
}

export function ObjectSection() {
  return (
    <section className="hero portable-section" aria-labelledby="portable-title">
      <picture className="portable-backdrop" aria-hidden="true">
        <source
          media="(max-width: 920px)"
          srcSet="/images/portable/wipe-mobile-small.webp 480w, /images/portable/wipe-mobile.webp 941w"
          sizes="100vw"
        />
        <img
          src="/images/portable/wipe-desktop.webp"
          srcSet="/images/portable/wipe-desktop-small.webp 1200w, /images/portable/wipe-desktop.webp 1672w"
          sizes="100vw"
          width="1672"
          height="941"
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="wrap">
        <div className="portable-head">
          <span className="portable-tag">// Thoughtful care, made portable</span>
          <h2 id="portable-title">A wipe for the moment <em>you need it most.</em></h2>
        </div>

        <PortableShuffle className="portable-grid">
          <div className="portable-left">
            <UseItem index={0} />
            <UseItem index={1} />
          </div>

          <div className="portable-stack-wrap">
            <Parallax offset={20}><PortableStack /></Parallax>
          </div>

          <div className="portable-right">
            <UseItem index={2} />
            <div className="portable-sheet-wrap"><PortableSpecSheet /></div>
            <div className="portable-cta"><Link className="portable-btn" href="#products">Find your Wipelo <span aria-hidden="true">→</span></Link></div>
          </div>
        </PortableShuffle>

        <ul className="portable-facts">
          <li>Individually wrapped</li>
          <li>Ready to carry</li>
          <li>One wipe, one clear purpose</li>
        </ul>
      </div>
    </section>
  );
}
