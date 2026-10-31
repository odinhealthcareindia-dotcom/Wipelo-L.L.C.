import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { getProducts } from "@/lib/shopify";

const jobs = [
  {
    numeral: "I",
    product: "// ON THE GO",
    match: /on[\s-]?the[\s-]?go/i,
    tone: "mint",
    title: "Between showers",
    body: "Mild cleansing ingredients help lift surface sweat and everyday residue. Zinc ricinoleate is included for odor-binding support.",
    active: "0.4–0.8% zinc ricinoleate",
    use: "Underarms · feet · body",
    image: "/images/mechanism/on-the-go-use.webp",
    alt: "Person holding a Wipelo wipe against their raised underarm after a workout",
    pack: "/images/mechanism/on-the-go-sachet.webp",
  },
  {
    numeral: "II",
    product: "// SPOTLESS",
    match: /spotless/i,
    tone: "stone",
    title: "Body breakout care",
    body: "The planned 0.5% salicylic acid leave-on formula is designed for breakout-prone body skin. Niacinamide, glycerin and panthenol support skin conditioning.",
    active: "0.5% salicylic acid",
    use: "Back · chest · shoulders",
    image: "/images/mechanism/spotless-use.webp",
    alt: "Person pressing a Wipelo wipe onto their shoulder, with small breakouts visible across their back",
    pack: "/images/mechanism/spotless-sachet.webp",
  },
  {
    numeral: "III",
    product: "// HER",
    match: /\bher\b/i,
    tone: "sand",
    title: "External intimate care",
    body: "A fragrance-free wipe for occasional external cleansing. The planned lactic acid and sodium lactate formula is pH-considerate.",
    active: "0% fragrance",
    use: "External skin only",
    image: "/images/mechanism/her-use.webp",
    alt: "Hand holding a Wipelo wipe against the upper thigh, below linen shorts",
    pack: "/images/mechanism/her-sachet.webp",
  },
];

export async function MechanismSection() {
  const products = await getProducts();

  return (
    <section className="jobs-section" id="how-wipelo-works" aria-labelledby="jobs-title">
      <Stagger className="wrap jobs-head" gap={0.09}>
        <div>
          <Reveal as="span" className="jobs-tag">Made with a purpose · The collection</Reveal>
          <Reveal as="h2" id="jobs-title">One range. <em>Three clear jobs.</em></Reveal>
        </div>
        <Reveal as="p" className="jobs-intro">Wipelo makes individually wrapped wipes for specific personal-care moments. Each product has its own use, ingredients and directions.</Reveal>
      </Stagger>
      <ol className="jobs-rows">
        {jobs.map((job, index) => {
          const match = products.find((product) => job.match.test(`${product.title} ${product.handle}`));
          return (
            <Stagger as="li" className={`job-row job-tone-${job.tone}${index % 2 ? " job-row--flip" : ""}`} key={job.product} gap={0.25}>
              <Reveal className="job-media" variant={index % 2 ? "shuttleFromRight" : "shuttleFromLeft"}>
                {/* Clipped off-screen until it slides in, so lazy loading would only start once the panel has arrived. */}
                <Image className="job-cutout" src={job.image} fill sizes="(max-width: 900px) 100vw, 52vw" alt={job.alt} loading="eager" fetchPriority="low" />
                {/* <span className="job-pack"><Image src={job.pack} width={360} height={450} sizes="130px" alt={`Wipelo ${job.product} sachet`} /></span> */}
              </Reveal>
              <Stagger className="job-copy" gap={0.07}>
                <Reveal as="p" className="job-mark">
                  {/* <span className="job-num" aria-hidden="true">{job.numeral}</span> */}
                  <span className="job-product">{job.product}</span></Reveal>
                <Reveal as="h3">{job.title}</Reveal>
                <Reveal as="p" className="job-body">{job.body}</Reveal>
                <Reveal className="job-spec"><span>{job.active}</span><span>{job.use}</span></Reveal>
                <Reveal><Link className="job-link" href={match ? `/products/${encodeURIComponent(match.handle)}` : "/shop#products"}>Discover {job.product} <span aria-hidden="true">→</span></Link></Reveal>
              </Stagger>
            </Stagger>
          );
        })}
      </ol>
      <p className="jobs-foot"><span>Format — Individually wrapped</span><i aria-hidden="true">◆</i><span>Use — External skin only</span></p>
    </section>
  );
}
