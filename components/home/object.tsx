import { Sachet } from "./sachet";

export function ObjectSection() {
  return (
    <section className="sec" style={{ paddingTop: "0" }}>
      <div className="wrap">
        <div className="sec-head rv" style={{ marginBottom: "32px" }}>
          <span className="mono-tag">// Beautifully carried</span>
          <h2 className="h-section">The product you're not embarrassed<br />to leave on the counter.</h2>
          <p className="lede">Marble counter. Gym bag. Bedside table. It photographs in all three — because design is positioning, not decoration.</p>
        </div>
        <div className="object-stage rv">
          <div className="anno a-chip" style={{ top: "26px", left: "26px" }}>// The object</div>
          <div className="anno" style={{ top: "30px", right: "26px" }}>Anodized tin · refillable<span className="a-line"></span><span className="a-dot"></span></div>
          <div className="pack" style={{ transform: "rotate(-4deg)" }}>
            <span className="p-seal">✦</span>
            <span className="p-cat">Functional Wet Wipes™</span>
            <span className="p-name">Wipelo</span><span className="p-sku">Bare</span>
            <div className="p-spec">FUNCTION · PORE CLEARANCE<br />ACTIVE ··· SALICYLIC ACID 2%<br />pH ······· 4.5–5.5 [pH-TRUE™]</div>
            <div className="p-batch">Batch 0426 · pH 4.9 ✓</div>
          </div>
          <div className="pack" style={{ transform: "rotate(2deg)", zIndex: "2" }}>
            <span className="p-seal">✦</span>
            <span className="p-cat">Functional Wet Wipes™</span>
            <span className="p-name">Wipelo</span><span className="p-sku">First</span>
            <div className="p-spec">FUNCTION · ODOR CONTROL<br />ACTIVE ··· ZINC COMPLEX + ALOE<br />pH ······· 4.5–5.5 [pH-TRUE™]</div>
            <div className="p-batch">Batch 0426 · pH 4.9 ✓</div>
          </div>
          <div className="tin"><span className="t-w">W</span><span className="t-l">Travel Tin · holds 10</span></div>
          <Sachet />
        </div>
      </div>
    </section>
  );
}
