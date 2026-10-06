const quotes = [
  { text: "The wipe that finally respects your skin.", source: "GQ" },
  { text: "Skincare logic, below the jaw.", source: "Allure" },
  { text: "The gym bag upgrade we didn't know we needed.", source: "Men's Health" },
  { text: "Honest, engineered, beautiful.", source: "Well+Good" },
];

export function PressSection() {
  return <>
    <div className="press">
      <div className="wrap press-in">
        <span className="press-label">As seen in*</span>
        <div className="press-quote">
          <div className="press-track">
            {[...quotes, ...quotes].map((quote, index) => <span key={`${quote.source}-${index}`}>
              “{quote.text}” <b>{quote.source}</b>
            </span>)}
          </div>
        </div>
      </div>
    </div>
    <div style={{ background: "var(--cream)", padding: "20px 0 30px" }}>
      <div className="wrap logo-wall">
        <span className="lg-gq">GQ</span>
        <span className="lg-mh">MEN&apos;S HEALTH</span>
        <span className="lg-allure">Allure</span>
        <span className="lg-wg">WELL+GOOD</span>
        <span className="lg-cosmo">Cosmopolitan</span>
      </div>
    </div>
  </>;
}
