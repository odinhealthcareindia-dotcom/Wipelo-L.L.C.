import { Reveal, Stagger } from "@/components/motion/reveal";

export function BrandBeatSection() {
  return (
    <section className="sec dark beat" id="beat">
      <Stagger className="wrap" gap={0.1}>
        <Reveal as="span" className="mono-tag">// Personal care for real life</Reveal>
        <Reveal as="h2">Different moments call for different care. <em>Choose the wipe made for yours.</em></Reveal>
        <Reveal as="p">From an after-workout refresh to body breakout care and occasional external intimate cleansing, Wipelo keeps personal care practical, considered, and easy to carry. Each wipe is individually wrapped and clearly made for its own purpose.</Reveal>
      </Stagger>
    </section>
  );
}
