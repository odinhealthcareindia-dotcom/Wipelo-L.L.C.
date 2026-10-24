export function RitualSection() {
  return (
    <section className="sec" style={{ paddingTop: "0" }}>
      <div className="wrap">
        <div className="sec-head rv" style={{ marginBottom: "32px" }}>
          <span className="mono-tag">// A simple step, wherever you are</span>
          <h2 className="h-section">Open. Use. Dispose.</h2>
        </div>
        <div className="ritual rv">
          <div className="rit"><span className="rtag">01</span><span className="rn">01</span><h3>Open one wipe</h3><p>Each wipe is individually wrapped for easy carrying and use when you need it.</p>
            <div className="rit-photo"><img src="/tear-at-notch-v2.png" alt="Hands opening an individually wrapped Wipelo wipe at the tear notch" width="1254" height="1254" loading="lazy" /></div>
          </div>
          <div className="rit"><span className="rtag">02</span><span className="rn">02</span><h3>Use for its purpose</h3><p>Choose ON THE GO for body freshness, SPOTLESS for breakout-prone body skin, or HER for external intimate cleansing. Follow each pack’s directions.</p><div className="rit-photo"><img src="/one-pass-one-wipe.png" alt="A person gently using a wipe on their arm" width="1254" height="1254" loading="lazy" /></div></div>
          <div className="rit"><span className="rtag">03</span><span className="rn">03</span><h3>Dispose in the bin</h3><p>Do not flush used wipes. Keep use external and follow the guidance printed on the pack.</p><div className="rit-photo"><img src="/bin-it.png" alt="A hand placing a used wipe in a bin" width="1254" height="1254" loading="lazy" /></div></div>
        </div>
      </div>
    </section>
  );
}
