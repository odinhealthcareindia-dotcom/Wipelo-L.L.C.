const steps = [
  {
    title: "Open one wipe",
    body: "Each wipe is individually wrapped for easy carrying and use when you need it.",
    image: "/tear-at-notch-v2.png",
    alt: "Hands opening an individually wrapped Wipelo wipe at the tear notch",
  },
  {
    title: "Use for its purpose",
    body: "Choose ON THE GO for body freshness, SPOTLESS for breakout-prone body skin, or HER for external intimate cleansing. Follow each pack’s directions.",
    image: "/one-pass-one-wipe.png",
    alt: "A person gently using a wipe on their arm",
  },
  {
    title: "Dispose in the bin",
    body: "Keep use external and follow the guidance printed on the pack.",
    image: "/bin-it.png",
    alt: "A hand placing a used wipe in a bin",
  },
];

export function RitualSection() {
  return (
    <section className="sec ritual-section" aria-labelledby="ritual-title">
      <div className="wrap">
        <div className="ritual-head rv">
          <span className="ritual-tag">// A simple step, wherever you are</span>
          <h2 id="ritual-title">Open. <em>Use.</em> Dispose.</h2>
        </div>
        <ol className="ritual-steps rv">
          {steps.map((step, index) => (
            <li key={step.title}>
              <div className="ritual-photo">
                <img src={step.image} alt={step.alt} width="1254" height="1254" loading="lazy" />
                <span className="ritual-num" aria-hidden="true">{index + 1}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="ritual-bar rv">
          <span className="ritual-bar-icon" aria-hidden="true">!</span>
          <span><b>Do not flush used wipes.</b> Always follow the guidance printed on the pack.</span>
        </p>
      </div>
    </section>
  );
}
