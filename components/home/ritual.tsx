import { Reveal, Stagger } from "@/components/motion/reveal";
import { RitualOrbit, type RitualStep } from "./ritual-orbit";

const steps: RitualStep[] = [
  {
    title: "Open one wipe",
    body: "Each wipe is individually wrapped for easy carrying and use when you need it.",
  },
  {
    title: "Use for its purpose",
    body: "Choose ON THE GO for body freshness, SPOTLESS for breakout-prone body skin, or HER for external intimate cleansing. Follow each pack’s directions.",
  },
  {
    title: "Dispose in the bin",
    body: "Keep use external and follow the guidance printed on the pack.",
  },
];

const ritualAlt = "A looping clip of the three steps: hands tear open a Wipelo sachet, a wipe is used on the forearm, and the used wipe drops into a bin.";

export function RitualSection() {
  return (
    <section className="sec ritual-section" aria-labelledby="ritual-title">
      <div className="wrap">
        <Stagger className="ritual-head" gap={0.09}>
          <Reveal as="span" className="ritual-tag">// A simple step, wherever you are</Reveal>
          <Reveal as="h2" id="ritual-title">Open. <em>Use.</em> Dispose.</Reveal>
        </Stagger>
        <Reveal variant="fadeIn">
          <RitualOrbit steps={steps} alt={ritualAlt} />
        </Reveal>
        {/* <Reveal as="p" className="ritual-bar">
          <span className="ritual-bar-icon" aria-hidden="true">!</span>
          <span><b>Do not flush used wipes.</b> Always follow the guidance printed on the pack.</span>
        </Reveal> */}
      </div>
    </section>
  );
}
