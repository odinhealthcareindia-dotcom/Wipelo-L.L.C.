import Image from "next/image";
import Link from "next/link";

export function OnTheGoSection({ productHref }: { productHref: string }) {
  return (
    <section className="sec dark otg-section" aria-labelledby="on-the-go-title">
      <div className="wrap otg-grid">
        <div className="otg-copy rv">
          <span className="mono-tag">// Wipelo ON THE GO</span>
          <h2 className="h-section" id="on-the-go-title">
            Freshness reset,<br /><em>between showers.</em>
          </h2>
          <p className="lede">
            When a shower has to wait, one individually sealed Wipelo ON THE GO wipe helps cleanse surface sweat, odor-causing residue, and everyday buildup from your underarms, feet, and body. Mild cleansers and zinc ricinoleate make it a practical refresh between showers.
          </p>
          <Link className="btn btn-teal" href={productHref}>
            Shop ON THE GO <span className="ar">→</span>
          </Link>
          <p className="otg-sealed"><span aria-hidden="true">✦</span> Body odor cleansing. Ready between showers.</p>
        </div>

        <figure className="otg-figure rv">
          <div className="otg-image-frame">
            <Image
              src="/on-the-go-home.png"
              width={1536}
              height={1024}
              sizes="(max-width: 920px) 90vw, (max-width: 1240px) 58vw, 680px"
              alt="Three moments in a cleansing routine: fresh skin, a gentle wipe, and the used cloth after a single pass."
            />
          </div>
          <figcaption>
            <ol className="otg-moments" aria-label="The three moments shown">
              <li><span>01</span><b>Before</b></li>
              <li><span>02</span><b>One gentle pass</b></li>
              <li><span>03</span><b>What came away</b></li>
            </ol>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
