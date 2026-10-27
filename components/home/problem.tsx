const rows = [
  { face: "A cleanser, morning and night", rest: "Fragrance sprayed over the sweat" },
  { face: "Salicylic acid for breakouts", rest: "Back and chest left to chance" },
  { face: "Niacinamide, dosed", rest: "A baby wipe for intimate skin" },
  { face: "SPF 50, reapplied", rest: "Or nothing until the next shower" },
];

const gaps = [
  { product: "ON THE GO", title: "Between gym and meeting", body: "Don't just cover up body odor. Cleanse away the sweat and residue behind it." },
  { product: "SPOTLESS", title: "Back acne is skin care", body: "Body acne doesn't stop at your face. Neither should your skincare." },
  { product: "HER", title: "Your pH, respected", body: "A fragrance-free refresh for external intimate skin when water isn't close by." },
];

export function ProblemSection() {
  return (
    <section className="sec named-section" id="science" aria-labelledby="named-title">
      <div className="wrap">
        <div className="named-head rv">
          <div>
            <span className="named-tag">// The named problem</span>
            <h2 id="named-title">Below the jaw,<br /><em>you're on your own.</em></h2>
          </div>
          <p className="named-lede">Face skincare became a science. Actives, pH, barrier care — a generation learned to read labels. Then sweat, body breakouts and intimate care were left to a spray of fragrance or a baby wipe.</p>
        </div>

        <table className="named-table rv">
          <thead>
            <tr><th scope="col">#</th><th scope="col">Your face gets</th><th scope="col">Everything else gets</th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.face}>
                <td className="named-n">{String(index + 1).padStart(2, "0")}</td>
                <td className="named-face" data-label="Your face gets">
                  <span className="named-ico named-ico-yes" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="11" height="11"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  {row.face}
                </td>
                <td className="named-rest" data-label="Everything else gets">
                  <span className="named-ico named-ico-no" aria-hidden="true">–</span>
                  {row.rest}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="named-bridge rv">The needs between morning and evening were served by products designed for infants, or by no one. Three of them, named:</p>

        <div className="named-cards rv">
          {gaps.map((gap, index) => (
            <div className="named-card" key={gap.title}>
              <span className="named-pill">{String(index + 1).padStart(2, "0")} · {gap.product}</span>
              <h3>{gap.title}</h3>
              <p>{gap.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
