import Image from "next/image";
import Link from "next/link";
import { DrawCircle } from "@/components/motion/draw-circle";
import { Reveal, Stagger } from "@/components/motion/reveal";

const steps = [
  { title: "Tear open", body: "One sealed sachet, fits a pocket or gym bag." },
  { title: "One gentle pass", body: "Underarms, feet, neck — wherever the day built up." },
  { title: "Feel reset", body: "No rinse needed. Carry on until your next shower." },
];

export function OnTheGoSection({ productHref, price }: { productHref: string; price?: string }) {
  return (
    <section className="sec otgx-section" aria-labelledby="on-the-go-title">
      <div className="wrap">
        <div className="otgx-grid">
          <Stagger className="otgx-copy" gap={0.09}>
            <Reveal as="span" className="otgx-tag">// Wipelo ON THE GO</Reveal>
            <Reveal as="h2" id="on-the-go-title">
              Freshness reset,<br /><em>between showers.</em>
            </Reveal>
            <Reveal as="p" className="otgx-lede">
              One individually sealed wipe lifts surface sweat and odor-causing residue from underarms, feet and body — so the shower can wait.
            </Reveal>
            <Reveal className="otgx-ctas">
              <Link className="otgx-btn" href={productHref}>
                Shop ON THE GO <span className="ar" aria-hidden="true">→</span>
              </Link>
              <Link className="otgx-link" href="#ingredients">See how it works</Link>
            </Reveal>
            <Reveal as="p" className="otgx-meta">{price ? `${price} · ` : ""}Individually sealed wipes · Mild cleansers + zinc ricinoleate</Reveal>
          </Stagger>

          <Reveal variant="slideFromRight" className="otgx-visual">
            <div className="otgx-orbit">
              <DrawCircle className="otgx-ring" />
              <div className="otgx-photo">
                <Image
                  src="/on-the-go-home.png"
                  width={1536}
                  height={1024}
                  sizes="(max-width: 920px) 90vw, 560px"
                  alt="Three moments in a cleansing routine: tearing open a sealed wipe, one gentle pass over the shoulder, and fresh skin after."
                />
              </div>
              <Reveal as="span" variant="pop" delay={0.3} className="otgx-chip otgx-chip-light" aria-hidden="true">Individually sealed</Reveal>
              <Reveal as="span" variant="pop" delay={0.4} className="otgx-chip otgx-chip-teal" aria-hidden="true">With zinc ricinoleate</Reveal>
            </div>
          </Reveal>
        </div>

        <Stagger as="ol" className="otgx-steps" gap={0.1}>
          {steps.map((step, index) => (
            <Stagger as="li" key={step.title} gap={0.12}>
              <Reveal as="span" variant="drawLine" className="otgx-step-line" aria-hidden="true" />
              <Reveal as="span">{String(index + 1).padStart(2, "0")}</Reveal>
              <Reveal>
                <b>{step.title}</b>
                <p>{step.body}</p>
              </Reveal>
            </Stagger>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
