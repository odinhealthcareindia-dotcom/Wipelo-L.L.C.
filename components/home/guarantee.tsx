export function GuaranteeSection() {
  return (
    <section className="sec" style={{ paddingTop: "0" }}>
      <div className="wrap">
        <div className="guar rv">
          <div>
            <span className="mono-tag" style={{ color: "rgba(255,255,255,.8)" }}>// Risk, reversed</span>
            <h2>The Skin-Is-Skin Guarantee.</h2>
            <p>Use it for 30 days — really use it. If your body isn't convinced, tell us and we refund every dollar. No return label, no interrogation, no fine print doing push-ups.</p>
            <p className="fine">Fewer than 1% ever ask.* — *dummy figure, see manifest</p>
          </div>
          <div className="guar-seal">
            <div className="seal">
              <svg viewBox="0 0 170 170" aria-hidden="true">
                <defs><path id="circ" d="M85,85 m-64,0 a64,64 0 1,1 128,0 a64,64 0 1,1 -128,0"/></defs>
                <text style={{ fontFamily: "'Space Mono',monospace", fontSize: "11.5px", letterSpacing: ".28em", fill: "#fff", textTransform: "uppercase" }}>
                  <textPath href="#circ">Functional Wet Wipes · Est. 2025 · Wipelo ·&#160;</textPath>
                </text>
              </svg>
              <span className="w">W</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
