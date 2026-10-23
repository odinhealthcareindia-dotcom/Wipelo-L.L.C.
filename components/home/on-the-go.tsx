import Image from "next/image";
import Link from "next/link";

export function OnTheGoSection({ productHref }: { productHref: string }) {
  return (
    <section className="sec dark otg-section" aria-labelledby="on-the-go-title">
      <div className="wrap otg-grid">
        <div className="otg-copy rv">
          <span className="mono-tag">// Wipelo ON THE GO</span>
          <h2 className="h-section" id="on-the-go-title">
            Face refresh,<br /><em>between stops.</em>
          </h2>
          <p className="lede">
            For the moments between plans: open one individually sealed Wipelo ON THE GO wipe, make a gentle pass, and get on with your day.
          </p>
          <Link className="btn btn-teal" href={productHref}>
            Shop ON THE GO <span className="ar">→</span>
          </Link>
          <p className="otg-sealed"><span aria-hidden="true">✦</span> Individually sealed. Ready between stops.</p>
        </div>

        <figure className="otg-figure rv">
          <div className="otg-image-frame">
            <Image
              src="/on-the-go-cleansing-sequence.png"
              width={1536}
              height={1024}
              sizes="(max-width: 920px) 90vw, (max-width: 1240px) 58vw, 680px"
              alt="Three moments in a face-cleansing routine: natural skin, a gentle wipe at the temple, and light residue visible on the used cloth."
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
