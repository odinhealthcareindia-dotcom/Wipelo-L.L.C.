import Image from "next/image";
import Link from "next/link";
import { DrawCircle } from "@/components/motion/draw-circle";
import { Reveal, Stagger } from "@/components/motion/reveal";

const steps = ["Open one wipe", "One gentle pass", "Let skin air-dry"];

export function SpotlessSection({ productHref }: { productHref: string }) {
  return (
    <section className="sec otgx-section spotless-section" aria-labelledby="spotless-title">
      <div className="wrap">
        <div className="otgx-grid otgx-grid-reversed">
          <Reveal variant="slideFromLeft" className="otgx-visual">
            <div className="otgx-orbit">
              <DrawCircle className="otgx-ring" />
              <div className="otgx-photo">
                <Image
                  src="/spotless-body-home.png"
                  width={1536}
                  height={1024}
                  sizes="(max-width: 920px) 90vw, 560px"
                  alt="A body-care routine in three moments: opening a sealed wipe, gently wiping the shoulder, and allowing skin to air-dry."
                />
              </div>
            </div>
          </Reveal>

          <Stagger className="otgx-copy" gap={0.09} delay={0.1}>
            <Reveal as="span" variant="slideFromRight" className="otgx-tag">// Wipelo SPOTLESS</Reveal>
            <Reveal as="h2" variant="slideFromRight" id="spotless-title">
              Body acne care,<br /><em>made more reachable.</em>
            </Reveal>
            <Reveal as="p" variant="slideFromRight" className="otgx-lede">
              Body breakouts can be hard to reach. Wipelo SPOTLESS brings a proposed 0.5% salicylic acid leave-on formula to an individually sealed wipe for acne-prone skin on the back, chest, and shoulders. Niacinamide, glycerin, and panthenol support skin conditioning, with no complicated routine required.
            </Reveal>
            <Reveal variant="slideFromRight" className="otgx-ctas">
              <Link className="otgx-btn" href={productHref}>
                Shop SPOTLESS <span className="ar" aria-hidden="true">→</span>
              </Link>
            </Reveal>
            <Reveal as="p" variant="slideFromRight" className="otgx-meta"><span aria-hidden="true">✦</span> Salicylic acid body wipes. Clear skin, clear mind.</Reveal>
          </Stagger>
        </div>

        <Stagger as="ol" className="otgx-steps" gap={0.1} aria-label="The three moments shown">
          {steps.map((step, index) => (
            <Stagger as="li" key={step} gap={0.12}>
              <Reveal as="span" variant="drawLine" className="otgx-step-line" aria-hidden="true" />
              <Reveal as="span">{String(index + 1).padStart(2, "0")}</Reveal>
              <Reveal><b>{step}</b></Reveal>
            </Stagger>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
