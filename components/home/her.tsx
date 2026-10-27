import Image from "next/image";
import Link from "next/link";
import { DrawCircle } from "@/components/motion/draw-circle";
import { Reveal, Stagger } from "@/components/motion/reveal";

export function HerSection({ productHref }: { productHref: string }) {
  return (
    <section className="sec otgx-section her-section" aria-labelledby="her-title">
      <div className="wrap">
        <div className="otgx-grid">
          <Stagger className="otgx-copy" gap={0.09}>
            <Reveal as="span" className="otgx-tag">// Wipelo HER</Reveal>
            <Reveal as="h2" id="her-title">
              Your pH,<br /><em>respected.</em>
            </Reveal>
            <Reveal as="p" className="otgx-lede">
              An individually wrapped, fragrance-free wipe for occasional external intimate cleansing. Its proposed lactic acid and sodium lactate formula is designed for pH-considerate care, with glycerin, panthenol, and aloe to support skin comfort. Keep one close for travel, after a workout, during your period, or whenever water is limited.
            </Reveal>
            <Reveal className="otgx-ctas">
              <Link className="otgx-btn" href={productHref}>
                Shop HER <span className="ar" aria-hidden="true">→</span>
              </Link>
            </Reveal>
            <Reveal as="p" className="otgx-meta"><span aria-hidden="true">✦</span> Fragrance free. External use only.</Reveal>
          </Stagger>

          <Reveal variant="softScale" className="otgx-visual">
            <div className="otgx-orbit">
              <DrawCircle className="otgx-ring" />
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}
