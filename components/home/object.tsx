import Link from "next/link";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { PortableStack } from "./portable-stack";

const uses = [
  { product: "ON THE GO", title: "Body odor refresh", body: "Mild cleansers + zinc ricinoleate." },
  { product: "SPOTLESS", title: "Breakout-prone body skin", body: "Proposed 0.5% salicylic acid." },
  { product: "HER", title: "Gentle external intimate cleansing", body: "Fragrance-free. External use only." },
];

function UseItem({ index }: { index: number }) {
  const use = uses[index];
  return <Reveal className="portable-use">
    <span>{String(index + 1).padStart(2, "0")} · {use.product}</span>
    <h3>{use.title}</h3>
    <p>{use.body}</p>
  </Reveal>;
}

export function ObjectSection() {
  return (
    <section className="sec portable-section" aria-labelledby="portable-title">
      <div className="wrap">
        <Stagger className="portable-head" gap={0.09}>
          <Reveal as="span" className="portable-tag">// Thoughtful care, made portable</Reveal>
          <Reveal as="h2" id="portable-title">A wipe for the moment <em>you need it most.</em></Reveal>
        </Stagger>

        <div className="portable-grid">
          <Stagger className="portable-left" gap={0.12} delay={0.2}>
            <UseItem index={0} />
            <UseItem index={1} />
          </Stagger>

          <Reveal variant="deal" className="portable-stack-wrap">
            <Parallax offset={20}><PortableStack /></Parallax>
          </Reveal>

          <Stagger className="portable-right" gap={0.12} delay={0.44}>
            <UseItem index={2} />
            <Reveal><Link className="portable-btn" href="#products">Find your Wipelo <span aria-hidden="true">→</span></Link></Reveal>
          </Stagger>
        </div>

        <Stagger as="ul" className="portable-facts" gap={0.08}>
          <Reveal as="li" variant="fadeIn">Individually wrapped</Reveal>
          <Reveal as="li" variant="fadeIn">Ready to carry</Reveal>
          <Reveal as="li" variant="fadeIn">One wipe, one clear purpose</Reveal>
        </Stagger>
      </div>
    </section>
  );
}
