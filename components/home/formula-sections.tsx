import Image from "next/image";
import Link from "next/link";

type FormulaSectionsProps = {
  onTheGoHref: string;
  spotlessHref: string;
  herHref: string;
};

function LabImage({ src, alt, note }: { src: string; alt: string; note: string }) {
  return <figure className="science-figure rv">
    <div className="science-image-shell">
      <Image src={src} alt={alt} width={1536} height={1024} sizes="(max-width: 920px) 90vw, (max-width: 1240px) 56vw, 650px" />
      <span className="science-image-note">{note}</span>
    </div>
  </figure>;
}

export function FormulaSections({ onTheGoHref, spotlessHref, herHref }: FormulaSectionsProps) {
  return <>
    <section className="sec science-section science-range" aria-labelledby="science-range-title">
      <div className="wrap science-grid">
        <div className="science-copy rv">
          <span className="mono-tag">// Formulation, with a clear purpose</span>
          <h2 className="h-section" id="science-range-title">Different needs.<br /><em>Different ingredient choices.</em></h2>
          <p className="lede">Wipelo’s three wipes are designed for distinct kinds of personal care. Ingredient choices follow the intended use of each formula—from body cleansing and odor-binding support to breakout-prone body care and external intimate cleansing.</p>
          <div className="science-index">
            <div><span>01 / ON THE GO</span><p>Mild cleansers + zinc ricinoleate</p></div>
            <div><span>02 / SPOTLESS</span><p>Planned salicylic acid + skin conditioners</p></div>
            <div><span>03 / HER</span><p>Planned lactic acid + sodium lactate</p></div>
          </div>
          <Link className="btn btn-teal" href="/shop#products">Explore the range <span className="ar" aria-hidden="true">→</span></Link>
        </div>
        <LabImage
          src="/wipelo-lab-range.png"
          alt="Wipelo ON THE GO, SPOTLESS, and HER sachets arranged with a folded wipe and clear glass labware."
          note="Three products · three purposes"
        />
      </div>
    </section>

    <section className="sec dark science-section" aria-labelledby="science-otg-title">
      <div className="wrap science-grid science-grid-reversed">
        <LabImage
          src="/wipelo-lab-on-the-go.png"
          alt="The deep-teal Wipelo ON THE GO packet beside a folded wipe and clear liquid in glass labware."
          note="Ingredient focus · ON THE GO"
        />
        <div className="science-copy rv">
          <span className="mono-tag">// Body cleansing · odor-binding support</span>
          <h2 className="h-section" id="science-otg-title">A freshen-up with<br /><em>a focused formula.</em></h2>
          <p className="lede">Mild cleansing ingredients help lift surface sweat and everyday residue. Zinc ricinoleate is included for odor-binding support, making ON THE GO a practical body refresh between showers.</p>
          <div className="science-callout"><span>INGREDIENT NOTE</span><strong>Zinc ricinoleate</strong><p>Included for odor-binding support. ON THE GO is not an antiperspirant or a replacement for a shower.</p></div>
          <Link className="btn btn-teal" href={onTheGoHref}>Explore ON THE GO <span className="ar" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>

    <section className="sec science-section science-spotless" aria-labelledby="science-spotless-title">
      <div className="wrap science-grid">
        <div className="science-copy rv">
          <span className="mono-tag">// Body skincare · planned active</span>
          <h2 className="h-section" id="science-spotless-title">Targeted care for<br /><em>breakout-prone body skin.</em></h2>
          <p className="lede">SPOTLESS is planned with a 0.5% salicylic acid leave-on formula designed to help remove dead skin cells and manage buildup on the back, chest, and shoulders. Niacinamide, glycerin, and panthenol are included to support skin conditioning and hydration.</p>
          <div className="science-callout"><span>FORMULA STATUS</span><strong>0.5% salicylic acid · planned</strong><p>Check the finished pack for confirmed ingredients and directions.</p></div>
          <Link className="btn btn-teal" href={spotlessHref}>Explore SPOTLESS <span className="ar" aria-hidden="true">→</span></Link>
        </div>
        <LabImage
          src="/wipelo-lab-spotless.png"
          alt="The white Wipelo SPOTLESS packet beside a folded wipe and clear liquid in a glass petri dish."
          note="Ingredient focus · SPOTLESS"
        />
      </div>
    </section>

    <section className="sec dark science-section science-her" aria-labelledby="science-her-title">
      <div className="wrap science-grid science-grid-reversed">
        <LabImage
          src="/wipelo-lab-her.png"
          alt="The cream Wipelo HER packet with a white wipe, clear glass dishes, and an aloe leaf."
          note="Ingredient focus · HER"
        />
        <div className="science-copy rv">
          <span className="mono-tag">// External intimate care · fragrance-free</span>
          <h2 className="h-section" id="science-her-title">pH-considerate care,<br /><em>for external skin.</em></h2>
          <p className="lede">HER’s planned formula pairs lactic acid and sodium lactate with glycerin, panthenol, and aloe for occasional external intimate cleansing. It is designed with pH-considerate care in mind; it does not change or regulate vaginal pH.</p>
          <div className="science-callout"><span>USE NOTE</span><strong>External use only</strong><p>Do not insert or use internally. Follow the final directions on the product pack.</p></div>
          <Link className="btn btn-teal" href={herHref}>Explore HER <span className="ar" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  </>;
}
