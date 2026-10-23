import Image from "next/image";
import Link from "next/link";

export function SpotlessSection({ productHref }: { productHref: string }) {
  return (
    <section className="sec dark otg-section spotless-section" aria-labelledby="spotless-title">
      <div className="wrap otg-grid otg-grid-reversed">
        <figure className="otg-figure rv">
          <div className="otg-image-frame">
            <Image
              src="/spotless-body-routine.png"
              width={1536}
              height={1024}
              sizes="(max-width: 920px) 90vw, (max-width: 1240px) 58vw, 680px"
              alt="A body-care routine in three moments: opening a sealed wipe, gently wiping the shoulder, and allowing skin to air-dry."
            />
          </div>
          <figcaption>
            <ol className="otg-moments" aria-label="The three moments shown">
              <li><span>01</span><b>Open one wipe</b></li>
              <li><span>02</span><b>One gentle pass</b></li>
              <li><span>03</span><b>Let skin air-dry</b></li>
            </ol>
          </figcaption>
        </figure>

        <div className="otg-copy rv">
          <span className="mono-tag">// Wipelo SPOTLESS</span>
          <h2 className="h-section" id="spotless-title">
            Body care,<br /><em>beyond your face.</em>
          </h2>
          <p className="lede">
            Give your shoulders, chest, and back a moment of their own. Wipelo SPOTLESS brings a leave-on body-care step to one individually sealed wipe. Open, gently pass, and let skin air-dry.
          </p>
          <Link className="btn btn-teal" href={productHref}>
            Shop SPOTLESS <span className="ar" aria-hidden="true">→</span>
          </Link>
          <p className="otg-sealed"><span aria-hidden="true">✦</span> Individually sealed. Made for body skin.</p>
        </div>
      </div>
    </section>
  );
}
