import Image from "next/image";
import Link from "next/link";

type WellnessSectionProps = {
  onTheGoHref: string;
  spotlessHref: string;
  herHref: string;
};

export function WellnessSections({ onTheGoHref, spotlessHref, herHref }: WellnessSectionProps) {
  return <>
    <section className="sec wellness-section" aria-labelledby="wellness-cleansing-title">
      <div className="wrap otg-grid wellness-grid">
        <div className="otg-copy wellness-copy rv">
          <span className="mono-tag">// Functional cleansing wipes</span>
          <h2 className="h-section" id="wellness-cleansing-title">A refresh for the<br /><em>in-between moments.</em></h2>
          <p className="lede">After a workout, during a commute, or while travelling, Wipelo ON THE GO offers a practical way to cleanse when a shower has to wait. Mild cleansing ingredients help lift surface sweat and everyday residue from underarms, feet, and body.</p>
          <ul className="wellness-tags" aria-label="Useful moments for ON THE GO">
            <li>After workouts</li><li>On the move</li><li>Between showers</li>
          </ul>
          <Link className="btn btn-teal" href={onTheGoHref}>Explore ON THE GO <span className="ar" aria-hidden="true">→</span></Link>
        </div>
        <figure className="otg-figure wellness-figure rv">
          <div className="otg-image-frame">
            <Image src="/wipelo-between-shower-refresh.png" width={1536} height={1024} sizes="(max-width: 920px) 90vw, (max-width: 1240px) 58vw, 680px" alt="A woman packs an individually wrapped wipe into her gym bag after a workout." />
          </div>
        </figure>
      </div>
    </section>

    <section className="sec dark wellness-section" aria-labelledby="wellness-body-title">
      <div className="wrap otg-grid otg-grid-reversed wellness-grid">
        <figure className="otg-figure wellness-figure rv">
          <div className="otg-image-frame">
            <Image src="/wipelo-body-skincare-routine.png" width={1536} height={1024} sizes="(max-width: 920px) 90vw, (max-width: 1240px) 58vw, 680px" alt="A woman gently uses a cleansing wipe on her upper arm as part of a body-care routine." />
          </div>
        </figure>
        <div className="otg-copy wellness-copy rv">
          <span className="mono-tag">// Body skincare</span>
          <h2 className="h-section" id="wellness-body-title">Body skin deserves<br /><em>thoughtful care too.</em></h2>
          <p className="lede">Breakouts can show up on the back, chest, and shoulders—areas that are not always easy to reach. Wipelo SPOTLESS brings targeted body care into a simple wipe format, with a planned salicylic acid formula and skin-conditioning ingredients. Check the finished pack for confirmed formula details and directions.</p>
          <ul className="wellness-tags" aria-label="Areas SPOTLESS is designed for">
            <li>Back</li><li>Chest</li><li>Shoulders</li>
          </ul>
          <Link className="btn btn-teal" href={spotlessHref}>Explore SPOTLESS <span className="ar" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>

    <section className="sec wellness-section" aria-labelledby="wellness-her-title">
      <div className="wrap otg-grid wellness-grid">
        <div className="otg-copy wellness-copy rv">
          <span className="mono-tag">// Feminine intimate hygiene</span>
          <h2 className="h-section" id="wellness-her-title">A gentle refresh,<br /><em>with clear boundaries.</em></h2>
          <p className="lede">Wipelo HER is a fragrance-free wipe for occasional cleansing of external intimate skin. Individually wrapped for discretion, it can be handy during travel, after a workout, during your period, or whenever water is not close by. For external use only.</p>
          <ul className="wellness-tags" aria-label="HER product details">
            <li>Fragrance-free</li><li>External use only</li><li>Individually wrapped</li>
          </ul>
          <Link className="btn btn-teal" href={herHref}>Explore HER <span className="ar" aria-hidden="true">→</span></Link>
        </div>
        <figure className="otg-figure wellness-figure rv">
          <div className="otg-image-frame">
            <Image src="/wipelo-her-travel-care.png" width={1536} height={1024} sizes="(max-width: 920px) 90vw, (max-width: 1240px) 58vw, 680px" alt="A woman places an individually wrapped wipe in a travel pouch on a bathroom counter." />
          </div>
        </figure>
      </div>
    </section>

    <section className="sec dark wellness-section" aria-labelledby="wellness-purpose-title">
      <div className="wrap otg-grid otg-grid-reversed wellness-grid">
        <figure className="otg-figure wellness-figure rv">
          <div className="otg-image-frame">
            <Image src="/wipelo-purposeful-care.png" width={1536} height={1024} sizes="(max-width: 920px) 90vw, (max-width: 1240px) 58vw, 680px" alt="Three individually wrapped wipes arranged beside a folded cloth on a pale stone surface." />
          </div>
        </figure>
        <div className="otg-copy wellness-copy rv">
          <span className="mono-tag">// Functional personal care &amp; body wellness</span>
          <h2 className="h-section" id="wellness-purpose-title">Three needs.<br /><em>Each with its own purpose.</em></h2>
          <p className="lede">Wipelo brings together functional cleansing wipes, body skincare, and feminine intimate hygiene. Each product is made for a specific area and moment, so you can choose care that fits your routine instead of asking one wipe to do everything.</p>
          <ul className="wellness-tags" aria-label="Wipelo's three care categories">
            <li>Body freshness</li><li>Body breakouts</li><li>External intimate care</li>
          </ul>
          <Link className="btn btn-teal" href="/shop#products">Find your Wipelo <span className="ar" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  </>;
}
