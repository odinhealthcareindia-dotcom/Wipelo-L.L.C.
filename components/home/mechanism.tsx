import Link from "next/link";
import { Reveal, Stagger } from "@/components/motion/reveal";

const jobs = [
  {
    product: "ON THE GO",
    title: "Between showers",
    body: "Mild cleansing ingredients help lift surface sweat and everyday residue. Zinc ricinoleate is included for odor-binding support.",
    note: "it is a refresh, not an antiperspirant or a replacement for a shower.",
  },
  {
    product: "SPOTLESS",
    title: "Body breakout care",
    body: "The planned 0.5% salicylic acid leave-on formula is designed for breakout-prone body skin. Niacinamide, glycerin, and panthenol support skin conditioning.",
    note: "follow the confirmed formula and directions on the product pack.",
  },
  {
    product: "HER",
    title: "External intimate care",
    body: "A fragrance-free wipe for occasional external cleansing. The planned lactic acid and sodium lactate formula is pH-considerate.",
    note: "its lotion pH target does not mean the wipe changes vaginal pH.",
  },
];

export function MechanismSection() {
  return (
    <section className="sec jobs-section" id="how-wipelo-works" aria-labelledby="jobs-title">
      <div className="wrap">
        <Stagger className="jobs-head" gap={0.09}>
          <div>
            <Reveal as="span" className="jobs-tag">// Made with a purpose</Reveal>
            <Reveal as="h2" id="jobs-title">One range.<br /><em>Three clear jobs.</em></Reveal>
          </div>
          <Reveal className="jobs-intro">
            <p>Wipelo makes individually wrapped wipes for specific personal-care moments. Each product has its own use, ingredients, and directions.</p>
            <Link href="#products">Find your Wipelo →</Link>
          </Reveal>
        </Stagger>
        <Stagger as="ol" className="jobs-list" gap={0.12}>
          {jobs.map((job, index) => (
            <Stagger as="li" key={job.product} gap={0.07}>
              <Reveal as="span" className="jobs-num" aria-hidden="true">{index + 1}</Reveal>
              <Reveal as="span" className="jobs-product">{job.product}</Reveal>
              <Reveal as="h3">{job.title}</Reveal>
              <Reveal as="p">{job.body}</Reveal>
              {/* <Reveal as="p" className="jobs-note"><b>Note —</b> {job.note}</Reveal> */}
            </Stagger>
          ))}
        </Stagger>
        <Reveal as="p" className="jobs-foot"><span>Format — Individually wrapped</span><span>Use — External skin only</span></Reveal>
      </div>
    </section>
  );
}
