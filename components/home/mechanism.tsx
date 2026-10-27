import Link from "next/link";

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
        <div className="jobs-head rv">
          <div>
            <span className="jobs-tag">// Made with a purpose</span>
            <h2 id="jobs-title">One range.<br /><em>Three clear jobs.</em></h2>
          </div>
          <div className="jobs-intro">
            <p>Wipelo makes individually wrapped wipes for specific personal-care moments. Each product has its own use, ingredients, and directions.</p>
            <Link href="#products">Find your Wipelo →</Link>
          </div>
        </div>
        <ol className="jobs-list rv">
          {jobs.map((job, index) => (
            <li key={job.product}>
              <span className="jobs-num" aria-hidden="true">{index + 1}</span>
              <span className="jobs-product">{job.product}</span>
              <h3>{job.title}</h3>
              <p>{job.body}</p>
              <p className="jobs-note"><b>Note —</b> {job.note}</p>
            </li>
          ))}
        </ol>
        <p className="jobs-foot rv"><span>Format — Individually wrapped</span><span>Use — External skin only</span></p>
      </div>
    </section>
  );
}
