import Link from "next/link";
import { PortableStack } from "./portable-stack";

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
    <section className="sec portable-section" aria-labelledby="portable-title">
      <div className="wrap">
        <div className="portable-head rv">
          <span className="portable-tag">// Thoughtful care, made portable</span>
          <h2 id="portable-title">A wipe for the moment <em>you need it most.</em></h2>
        </div>

        <div className="portable-grid rv">
          <div className="portable-left">
            <UseItem index={0} />
            <UseItem index={1} />
          </div>

          <PortableStack />

          <div className="portable-right">
            <UseItem index={2} />
            <Link className="portable-btn" href="#products">Find your Wipelo <span aria-hidden="true">→</span></Link>
          </div>
        </div>

        <ul className="portable-facts rv">
          <li>Individually wrapped</li>
          <li>Ready to carry</li>
          <li>One wipe, one clear purpose</li>
        </ul>
      </div>
    </section>
  );
}
