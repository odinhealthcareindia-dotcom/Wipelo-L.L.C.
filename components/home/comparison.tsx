export function ComparisonSection() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head rv">
          <span className="mono-tag">// The honest table</span>
          <h2 className="h-section">Any wipe removes sweat.<br />That was never the question.</h2>
        </div>
        <div className="cmp-wrap rv">
          <table className="cmp-table">
            <thead>
              <tr><th></th><th className="us">Wipelo</th><th>Baby wipes</th><th>"Fresh" body wipes</th><th>Bar of soap</th></tr>
            </thead>
            <tbody>
              <tr><td>Removes surface sweat</td><td className="us cmp-y">✓</td><td className="cmp-y">✓</td><td className="cmp-y">✓</td><td className="cmp-y">✓</td></tr>
              <tr><td>Formulated for adult body skin</td><td className="us cmp-y">✓</td><td className="cmp-n">✗ — infants</td><td className="cmp-n">✗</td><td className="cmp-n">✗</td></tr>
              <tr><td>pH-matched 4.5–5.5</td><td className="us cmp-y">✓ pH-True™</td><td className="cmp-n">✗</td><td className="cmp-n">✗</td><td className="cmp-n">✗ (pH ~10)</td></tr>
              <tr><td>Treatment active, dosed</td><td className="us cmp-y">✓ one per SKU</td><td className="cmp-n">✗</td><td className="cmp-n">✗ perfume</td><td className="cmp-n">✗</td></tr>
              <tr><td>Individually sealed</td><td className="us cmp-y">✓ all 50</td><td className="cmp-n">✗ shared tub</td><td className="cmp-n">✗</td><td className="cmp-n">—</td></tr>
              <tr><td>Odor treated at source</td><td className="us cmp-y">✓ zinc complex</td><td className="cmp-n">✗</td><td className="cmp-n">✗ masked</td><td className="cmp-n">✗ briefly</td></tr>
              <tr><td>Fits in a jacket pocket</td><td className="us cmp-y">✓</td><td className="cmp-n">✗</td><td className="cmp-y">✓</td><td className="cmp-n">✗</td></tr>
              <tr><td>Price per use</td><td className="us"><b>$0.60</b></td><td>$0.04</td><td>$0.35</td><td>$0.02</td></tr>
            </tbody>
          </table>
          <p className="cmp-note">Row one is a tie on purpose. We don't win on price either — we win on engineering. If $0.04 does it for you, we genuinely respect that.</p>
        </div>
      </div>
    </section>
  );
}
