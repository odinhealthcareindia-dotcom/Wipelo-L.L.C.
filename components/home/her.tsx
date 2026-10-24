import Image from "next/image";
import Link from "next/link";

export function HerSection({ productHref }: { productHref: string }) {
  return (
    <section className="sec dark otg-section her-section" aria-labelledby="her-title">
      <div className="wrap otg-grid">
        <div className="otg-copy rv">
          <span className="mono-tag">// Wipelo HER</span>
          <h2 className="h-section" id="her-title">
            Your pH,<br /><em>respected.</em>
          </h2>
          <p className="lede">
            An individually wrapped, fragrance-free wipe for occasional external intimate cleansing. Its proposed lactic acid and sodium lactate formula is designed for pH-considerate care, with glycerin, panthenol, and aloe to support skin comfort. Keep one close for travel, after a workout, during your period, or whenever water is limited.
          </p>
          <Link className="btn btn-teal" href={productHref}>
            Shop HER <span className="ar" aria-hidden="true">→</span>
          </Link>
          <p className="otg-sealed"><span aria-hidden="true">✦</span> Fragrance free. External use only.</p>
        </div>

        <div className="otg-figure rv">
          <div className="otg-image-frame">
            <Image
              src="/her-handbag-essential.png"
              width={1536}
              height={1024}
              sizes="(max-width: 920px) 90vw, (max-width: 1240px) 58vw, 680px"
              alt="A woman slips a cream Wipelo HER individually wrapped wipe into a deep-green woven handbag."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
