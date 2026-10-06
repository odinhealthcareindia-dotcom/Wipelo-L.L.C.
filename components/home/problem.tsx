export function ProblemSection() {
  return (
    <section className="sec dark" id="science">
      <div className="wrap gap-grid">
        <div className="rv">
          <span className="mono-tag">// The named problem</span>
          <h2 className="h-section" style={{ margin: "16px 0 20px" }}>Below the jaw,<br />you're on your own.</h2>
          <p className="lede">Face skincare became a science. Actives, pH, barrier care — a generation learned to read labels. And then it reached for a baby wipe to handle everything else. The needs between morning and evening were served by products designed for infants, hospitals, or no one.</p>
        </div>
        <div className="rv">
          <div className="vs">
            <div className="vs-col">
              <span className="mono">Your face</span>
              <ul>
                <li>✦ Vitamin C, 8 a.m.</li>
                <li>✦ Niacinamide, dosed</li>
                <li>✦ SPF 50, reapplied</li>
                <li>✦ Retinol, alternating nights</li>
              </ul>
            </div>
            <div className="vs-col win">
              <span className="mono">Everything else</span>
              <ul>
                <li>— A bar of soap from 1952</li>
                <li>— A wipe designed for infants</li>
                <li>— Perfume over the problem</li>
                <li>— Or nothing at all</li>
              </ul>
            </div>
          </div>
          <div className="gap-list" style={{ marginTop: "28px" }}>
            <div className="gap-item"><span className="n">01</span><h3>Back acne is skin care</h3><p>Pores, congestion, sweat — treated like a disease or ignored.</p></div>
            <div className="gap-item"><span className="n">02</span><h3>Between gym and meeting</h3><p>The moments your bathroom routine doesn't reach.</p></div>
            <div className="gap-item"><span className="n">03</span><h3>Before. And after.</h3><p>You know what it's for. We designed it knowing.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
