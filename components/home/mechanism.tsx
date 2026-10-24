export function MechanismSection() {
  return (
    <section className="sec dark" id="how-wipelo-works">
      <div className="wrap mech-grid">
        <div className="rv">
          <span className="mono-tag">// Made with a purpose</span>
          <h2 className="h-section" style={{ margin: "16px 0 20px" }}>One range.<br /><span style={{ color: "var(--teal-bright)" }}>Three clear jobs.</span></h2>
          <p className="lede" style={{ marginBottom: "8px" }}>Wipelo makes individually wrapped wipes for specific personal-care moments. Each product has its own use, ingredients, and directions.</p>
          <div className="mech-steps">
            <div className="mech-step"><span className="mn">01</span><div><h3>ON THE GO · Between showers</h3><p>Mild cleansing ingredients help lift surface sweat and everyday residue. Zinc ricinoleate is included for odor-binding support. It is a refresh, not an antiperspirant or a replacement for a shower.</p></div></div>
            <div className="mech-step"><span className="mn">02</span><div><h3>SPOTLESS · Body breakout care</h3><p>The planned 0.5% salicylic acid leave-on formula is designed for breakout-prone body skin. Niacinamide, glycerin, and panthenol support skin conditioning. Follow the confirmed formula and directions on the product pack.</p></div></div>
            <div className="mech-step"><span className="mn">03</span><div><h3>HER · External intimate care</h3><p>A fragrance-free wipe for occasional external cleansing. The planned lactic acid and sodium lactate formula is pH-considerate; its lotion pH target does not mean the wipe changes vaginal pH.</p></div></div>
          </div>
        </div>
        <div className="rv">
          <div className="spec-box spec" style={{ fontSize: "13px" }}>
            <div style={{ marginBottom: "14px" }}><span className="marker">// Choose the right wipe</span></div>
            <div className="spec-row"><span className="k">Need a refresh</span><span className="dots"></span><span className="v">ON THE GO</span></div>
            <div className="spec-row"><span className="k">Body breakouts</span><span className="dots"></span><span className="v">SPOTLESS</span></div>
            <div className="spec-row"><span className="k">External intimate care</span><span className="dots"></span><span className="v">HER</span></div>
            <div className="spec-row"><span className="k">Format</span><span className="dots"></span><span className="v">Individually wrapped</span></div>
            <div className="spec-row"><span className="k">Use</span><span className="dots"></span><span className="v">External skin only</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
