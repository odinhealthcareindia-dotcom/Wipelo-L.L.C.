import Image from "next/image";
import Link from "next/link";

type WellnessSectionProps = {
  onTheGoHref: string;
  spotlessHref: string;
  herHref: string;
  onTheGoPrice?: string;
  spotlessPrice?: string;
  spotlessImage?: string;
  onTheGoImage?: string;
  herImage?: string;
};

const herFeatures = [
  { label: "Formula", title: "Lactic acid + sodium lactate", body: "Planned formula, designed with pH-considerate care in mind." },
  { label: "Comfort", title: "Glycerin, panthenol, aloe", body: "Included to support skin comfort." },
  { label: "Gentle", title: "Fragrance-free", body: "Nothing added to mask — just a gentle cleanse." },
  { label: "Discreet", title: "Individually wrapped", body: "Handy during travel, after a workout, during your period, or whenever water is not close by." },
];

function HerFeature({ index, label, title, body }: { index: number; label: string; title: string; body: string }) {
  return <div className="her-care-card">
    <span>{String(index + 1).padStart(2, "0")} · {label}</span>
    <h3>{title}</h3>
    <p>{body}</p>
  </div>;
}

const bodyAreas = [{ name: "Back" }, { name: "Chest" }, { name: "Shoulders" }] as const;

function BodyAreaIcon({ area }: { area: (typeof bodyAreas)[number]["name"] }) {
  return <svg className="body-care-icon" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <path d="M16 4h8v4l7 3v25H9V11l7-3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    {area === "Back" && <rect x="12" y="12" width="16" height="16" rx="3" fill="currentColor" opacity=".55" />}
    {area === "Chest" && <ellipse cx="20" cy="15" rx="7" ry="3.6" fill="currentColor" opacity=".55" />}
    {area === "Shoulders" && <><circle cx="10" cy="12" r="3" fill="currentColor" opacity=".55" /><circle cx="30" cy="12" r="3" fill="currentColor" opacity=".55" /></>}
  </svg>;
}

export function WellnessSections({ onTheGoHref, spotlessHref, herHref, onTheGoPrice, spotlessPrice, spotlessImage, onTheGoImage, herImage }: WellnessSectionProps) {
  return <>
    <section className="sec wellness-section refresh-section" aria-labelledby="wellness-cleansing-title">
      <div className="wrap">
        <div className="refresh-card rv">
          <div className="refresh-media">
            <Image src="/wipelo-between-shower-refresh.png" width={1536} height={1024} sizes="(max-width: 720px) 100vw, 1240px" alt="A woman packs an individually wrapped wipe into her gym bag after a workout." />
            <div className="refresh-badge">
              <span>Lifts</span>
              <b>Surface sweat · everyday residue</b>
              <small>Underarms, feet and body</small>
            </div>
          </div>
          <div className="refresh-panel">
            <span className="refresh-tag">// Functional cleansing wipes</span>
            <h2 id="wellness-cleansing-title">A refresh for the <em>in-between moments.</em></h2>
            <p>After a workout, during a commute, or while travelling, Wipelo ON THE GO offers a practical way to cleanse when a shower has to wait.</p>
            <ul className="refresh-tags" aria-label="Useful moments for ON THE GO">
              <li>After workouts</li><li>On the move</li><li>Between showers</li>
            </ul>
            <div className="refresh-ctas">
              <Link className="refresh-btn" href={onTheGoHref}>Explore ON THE GO <span aria-hidden="true">→</span></Link>
              {onTheGoPrice && <span className="refresh-price">From {onTheGoPrice}</span>}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="sec dark wellness-section body-care-section" aria-labelledby="wellness-body-title">
      <div className="wrap body-care-grid">
        <div className="body-care-media rv">
          <Image src="/wipelo-body-skincare-routine.png" width={1536} height={1024} sizes="(max-width: 920px) 92vw, 560px" alt="A woman gently uses a cleansing wipe on her upper arm as part of a body-care routine." />
          <span className="body-care-chip">Leave-on · no rinse</span>
          <Link className="body-care-product" href={spotlessHref}>
            {spotlessImage && <span className="body-care-pack"><img src={spotlessImage} alt="" /></span>}
            <span className="body-care-name"><b>Wipelo SPOTLESS</b><small>Clear skin. Clear mind.</small></span>
            {spotlessPrice && <span className="body-care-price">{spotlessPrice}</span>}
          </Link>
        </div>
        <div className="body-care-copy rv">
          <span className="body-care-tag">// Body skincare</span>
          <h2 id="wellness-body-title">Body skin deserves<br /><em>thoughtful care too.</em></h2>
          <p className="body-care-lede">Breakouts can show up on the back, chest, and shoulders—areas that are not always easy to reach. Wipelo SPOTLESS brings targeted body care into a simple wipe format, with a planned salicylic acid formula and skin-conditioning ingredients.</p>
          <span className="body-care-label" id="spotless-areas-label">Made for hard-to-reach areas</span>
          <ul className="body-care-areas" aria-labelledby="spotless-areas-label">
            {bodyAreas.map((area) => <li key={area.name}><BodyAreaIcon area={area.name} />{area.name}</li>)}
          </ul>
          <div className="body-care-note">
            <span>Planned</span>
            <p>0.5% salicylic acid formula. Check the finished pack for confirmed formula details and directions.</p>
          </div>
          <Link className="body-care-btn" href={spotlessHref}>Explore SPOTLESS <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>

    <section className="sec wellness-section her-care-section" aria-labelledby="wellness-her-title">
      <div className="wrap">
        <div className="her-care-head rv">
          <span className="her-care-tag">// Feminine intimate hygiene</span>
          <h2 id="wellness-her-title">A gentle refresh, <em>with clear boundaries.</em></h2>
          <p>Wipelo HER is a fragrance-free wipe for occasional cleansing of external intimate skin — individually wrapped for discretion.</p>
        </div>
        <div className="her-care-grid rv">
          <div className="her-care-col">
            {herFeatures.slice(0, 2).map((feature, index) => <HerFeature key={feature.label} index={index} {...feature} />)}
          </div>
          <div className="her-care-media">
            <Image src="/wipelo-her-travel-care.png" width={1536} height={1024} sizes="(max-width: 720px) 92vw, 420px" alt="A woman places an individually wrapped wipe in a travel pouch on a bathroom counter." />
          </div>
          <div className="her-care-col">
            {herFeatures.slice(2).map((feature, index) => <HerFeature key={feature.label} index={index + 2} {...feature} />)}
          </div>
        </div>
        <div className="her-care-bar rv">
          <p>
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="10" cy="6.3" r="1" fill="currentColor" /></svg>
            <span><b>For external use only.</b> Do not insert or use internally. It does not change or regulate vaginal pH.</span>
          </p>
          <Link className="her-care-btn" href={herHref}>Explore HER <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>

    <section className="sec dark wellness-section needs-section" aria-labelledby="wellness-purpose-title">
      <div className="wrap needs-grid">
        <div className="needs-copy rv">
          <span className="needs-tag">// Functional personal care &amp; body wellness</span>
          <h2 id="wellness-purpose-title">Three needs.<br /><em>Each with its own purpose.</em></h2>
          <p>Wipelo brings together functional cleansing wipes, body skincare, and feminine intimate hygiene. Each product is made for a specific area and moment, so you can choose care that fits your routine instead of asking one wipe to do everything.</p>
          <div className="needs-media">
            <Image src="/wipelo-purposeful-care.png" width={1536} height={1024} sizes="(max-width: 920px) 92vw, 560px" alt="Three individually wrapped wipes arranged beside a folded cloth on a pale stone surface." />
          </div>
        </div>
        <div className="needs-list-wrap rv">
          <ul className="needs-list" aria-label="Wipelo's three care categories">
            {[
              { title: "Body freshness", detail: "ON THE GO · between showers", href: onTheGoHref, image: onTheGoImage },
              { title: "Body breakouts", detail: "SPOTLESS · back, chest, shoulders", href: spotlessHref, image: spotlessImage },
              { title: "External intimate care", detail: "HER · fragrance-free", href: herHref, image: herImage },
            ].map((need, index) => (
              <li key={need.title}>
                <Link className="needs-row" href={need.href}>
                  <span className="needs-n">{String(index + 1).padStart(2, "0")}</span>
                  <span className="needs-text"><b>{need.title}</b><small>{need.detail}</small></span>
                  {need.image && <span className="needs-pack" aria-hidden="true"><img src={need.image} alt="" /></span>}
                  <span className="needs-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link className="needs-btn" href="/shop#products">Find your Wipelo <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  </>;
}
