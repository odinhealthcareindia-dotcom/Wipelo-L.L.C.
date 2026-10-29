import { Reveal, Stagger } from "@/components/motion/reveal";

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
        <Stagger className="ritual-head" gap={0.09}>
          <Reveal as="span" className="ritual-tag">// A simple step, wherever you are</Reveal>
          <Reveal as="h2" id="ritual-title">Open. <em>Use.</em> Dispose.</Reveal>
        </Stagger>
        <Stagger as="ol" className="ritual-steps" gap={0.15}>
          {steps.map((step, index) => (
            <Stagger as="li" key={step.title} gap={0.08}>
              <div className="ritual-photo">
                <span className="ritual-photo-clip">
                  <Reveal as="span" variant="settle">
                    <img src={step.image} alt={step.alt} width="1254" height="1254" loading="lazy" />
                  </Reveal>
                </span>
                <Reveal as="span" variant="pop" className="ritual-num" aria-hidden="true">{index + 1}</Reveal>
              </div>
              {index < steps.length - 1 && <Reveal as="span" variant="drawLine" className="ritual-link" aria-hidden="true" />}
              <Reveal as="h3">{step.title}</Reveal>
              <Reveal as="p">{step.body}</Reveal>
            </Stagger>
          ))}
        </Stagger>
        {/* <Reveal as="p" className="ritual-bar">
          <span className="ritual-bar-icon" aria-hidden="true">!</span>
          <span><b>Do not flush used wipes.</b> Always follow the guidance printed on the pack.</span>
        </Reveal> */}
      </div>
    </section>
  );
}
