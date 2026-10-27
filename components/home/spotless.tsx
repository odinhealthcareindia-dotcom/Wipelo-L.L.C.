import Image from "next/image";
import Link from "next/link";

const steps = ["Open one wipe", "One gentle pass", "Let skin air-dry"];

export function SpotlessSection({ productHref }: { productHref: string }) {
  return (
    <section className="sec otgx-section spotless-section" aria-labelledby="spotless-title">
      <div className="wrap">
        <div className="otgx-grid otgx-grid-reversed">
          <div className="otgx-visual rv">
            <div className="otgx-orbit">
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
          </div>

          <div className="otgx-copy rv">
            <span className="otgx-tag">// Wipelo SPOTLESS</span>
            <h2 id="spotless-title">
              Body acne care,<br /><em>made more reachable.</em>
            </h2>
            <p className="otgx-lede">
              Body breakouts can be hard to reach. Wipelo SPOTLESS brings a proposed 0.5% salicylic acid leave-on formula to an individually sealed wipe for acne-prone skin on the back, chest, and shoulders. Niacinamide, glycerin, and panthenol support skin conditioning, with no complicated routine required.
            </p>
            <div className="otgx-ctas">
              <Link className="otgx-btn" href={productHref}>
                Shop SPOTLESS <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="otgx-meta"><span aria-hidden="true">✦</span> Salicylic acid body wipes. Clear skin, clear mind.</p>
          </div>
        </div>

        <ol className="otgx-steps rv" aria-label="The three moments shown">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><b>{step}</b></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
