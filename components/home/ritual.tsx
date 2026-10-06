export function RitualSection() {
  return (
    <section className="sec" style={{ paddingTop: "0" }}>
      <div className="wrap">
        <div className="sec-head rv" style={{ marginBottom: "32px" }}>
          <span className="mono-tag">// The whole ritual — 20 seconds, anywhere</span>
          <h2 className="h-section">Tear. Wipe. Bin.</h2>
        </div>
        <div className="ritual rv">
          <div className="rit"><span className="rtag">~2 sec</span><span className="rn">01</span><h3>Tear at the notch</h3><p>One sealed single, exactly as wet as the day it was made. No tub, no lid, no gamble.</p>
            <div className="rit-photo"><img src="/tear-at-notch-v2.png" alt="Hands tearing a Wipelo wipe sachet at the notch" width="1254" height="1254" loading="lazy" /></div>
          </div>
          <div className="rit"><span className="rtag">~15 sec</span><span className="rn">02</span><h3>One pass, one wipe</h3><p>8" × 12" of thick cloth — sized for a body, not a face. The active does the work; you just apply it.</p><div className="rit-photo"><img src="/one-pass-one-wipe.png" alt="A person wiping their arm with a single cloth" width="1254" height="1254" loading="lazy" /></div></div>
          <div className="rit"><span className="rtag">~3 sec</span><span className="rn">03</span><h3>Bin it</h3><p>Biodegradable plant fiber, but not flushable — no wipe truly is, whatever the tub says. Honesty is the brand.</p><div className="rit-photo"><img src="/bin-it.png" alt="A hand placing a used wipe in a bin" width="1254" height="1254" loading="lazy" /></div></div>
        </div>
      </div>
    </section>
  );
}
