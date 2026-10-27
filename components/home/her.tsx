import Image from "next/image";
import Link from "next/link";

export function HerSection({ productHref }: { productHref: string }) {
  return (
    <section className="sec otgx-section her-section" aria-labelledby="her-title">
      <div className="wrap">
        <div className="otgx-grid">
          <div className="otgx-copy rv">
            <span className="otgx-tag">// Wipelo HER</span>
            <h2 id="her-title">
              Your pH,<br /><em>respected.</em>
            </h2>
            <p className="otgx-lede">
              An individually wrapped, fragrance-free wipe for occasional external intimate cleansing. Its proposed lactic acid and sodium lactate formula is designed for pH-considerate care, with glycerin, panthenol, and aloe to support skin comfort. Keep one close for travel, after a workout, during your period, or whenever water is limited.
            </p>
            <div className="otgx-ctas">
              <Link className="otgx-btn" href={productHref}>
                Shop HER <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="otgx-meta"><span aria-hidden="true">✦</span> Fragrance free. External use only.</p>
          </div>

          <div className="otgx-visual rv">
            <div className="otgx-orbit">
              <div className="otgx-photo">
                <Image
                  src="/her-handbag-essential.png"
                  width={1536}
                  height={1024}
                  sizes="(max-width: 920px) 90vw, 560px"
                  alt="A woman slips a cream Wipelo HER individually wrapped wipe into a deep-green woven handbag."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
