export function MechanismSection() {
  return (
    <section className="sec dark">
      <div className="wrap mech-grid">
        <div className="rv">
          <span className="mono-tag">// Anatomy of a wipe</span>
          <h2 className="h-section" style={{ margin: "16px 0 20px" }}>Yes, wet wipes.<br /><span style={{ color: "var(--teal-bright)" }}>Functional ones.</span></h2>
          <p className="lede" style={{ marginBottom: "8px" }}>The category spent forty years running from those two words — hiding them behind "cloths," "towelettes," "freshening tissues." We put our name on them instead, and gave the wipe what it never had: a job.</p>
          <div className="mech-steps">
            <div className="mech-step"><span className="mn">01</span><div><h3>One hero active per SKU</h3><p>Active-Matched Formulation™ — salicylic for back skin, zinc for odor, cranberry + lactic for her. Chosen for the exact skin it serves, dosed to work.</p></div></div>
            <div className="mech-step"><span className="mn">02</span><div><h3>Inside your skin's real pH</h3><p>Adult body skin lives at pH 4.5–5.5. Every batch is formulated and tested inside that window. pH-True™ — your acid mantle, respected.</p></div></div>
            <div className="mech-step"><span className="mn">03</span><div><h3>Sealed one by one</h3><p>Single-Seal Fresh™. The 50th wipe is identical to the 1st — no drying tubs, no half-moist regrets, nothing improvised.</p></div></div>
          </div>
        </div>
        <div className="rv">
          <div className="spec-box spec" style={{ fontSize: "13px" }}>
            <div style={{ marginBottom: "14px" }}><span className="marker">// WIPELO FIRST — SPEC</span></div>
            <div className="spec-row"><span className="k">Active</span><span className="dots"></span><span className="v">Zinc odor complex + aloe</span></div>
            <div className="spec-row"><span className="k">Does</span><span className="dots"></span><span className="v">Neutralizes at source</span></div>
            <div className="spec-row"><span className="k">pH</span><span className="dots"></span><span className="v">4.5–5.5 <span className="marker">[pH-TRUE™]</span></span></div>
            <div className="spec-row"><span className="k">Cloth</span><span className="dots"></span><span className="v">Plant-fiber, biodegradable</span></div>
            <div className="spec-row"><span className="k">Format</span><span className="dots"></span><span className="v">50 × Single-Seal Fresh™</span></div>
            <div className="spec-row"><span className="k">Free from</span><span className="dots"></span><span className="v">Alcohol · parabens · fragrance</span></div>
            <div className="spec-row"><span className="k">Assessed</span><span className="dots"></span><span className="v">Board-certified derms*</span></div>
          </div>
          
          <div className="stats-grid" style={{ gridTemplateColumns: "1fr", marginTop: "18px" }}>
            <div className="stat" style={{ display: "flex", alignItems: "baseline", gap: "22px", padding: "24px 30px" }}>
              <span className="num" style={{ fontSize: "52px" }} data-count="96" data-suffix="%">0%</span>
              <div><div className="lbl" style={{ margin: "0 0 4px" }}>Felt fresher all day*</div><div className="src">*4-week use study, n=104 — dummy figure, see manifest</div></div>
            </div>
            <div className="stat" style={{ display: "flex", alignItems: "baseline", gap: "22px", padding: "24px 30px" }}>
              <span className="num" style={{ fontSize: "52px" }} data-count="91" data-suffix="%">0%</span>
              <div><div className="lbl" style={{ margin: "0 0 4px" }}>Skin felt calm, not stripped*</div><div className="src">*Same cohort — dummy figure, see manifest</div></div>
            </div>
            <div className="stat" style={{ display: "flex", alignItems: "baseline", gap: "22px", padding: "24px 30px" }}>
              <span className="num" style={{ fontSize: "52px" }} data-count="84" data-suffix="%">0%</span>
              <div><div className="lbl" style={{ margin: "0 0 4px" }}>Replaced their previous wipe*</div><div className="src">*Same cohort — dummy figure, see manifest</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
