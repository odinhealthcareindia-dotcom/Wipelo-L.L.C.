import Image from "next/image";
import Link from "next/link";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { cardHover } from "@/lib/motion";
import { NeedsScience } from "./needs-science";

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
  return <Reveal className="her-care-card" whileHover={cardHover}>
    <span>{String(index + 1).padStart(2, "0")} · {label}</span>
    <h3>{title}</h3>
    <p>{body}</p>
  </Reveal>;
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
    {/* <section className="sec wellness-section refresh-section" aria-labelledby="wellness-cleansing-title">
      <div className="wrap">
        <div className="refresh-card">
          <Reveal variant="scaleIn" className="refresh-media">
            <Parallax fill offset={30}>
              <Image src="/wipelo-between-shower-refresh.png" width={1536} height={1024} sizes="(max-width: 720px) 100vw, 1240px" alt="A woman packs an individually wrapped wipe into her gym bag after a workout." />
            </Parallax>
            <Reveal variant="pop" delay={0.3} className="refresh-badge">
              <span>Lifts</span>
              <b>Surface sweat · everyday residue</b>
              <small>Underarms, feet and body</small>
            </Reveal>
          </Reveal>
          <Stagger className="refresh-panel" gap={0.09} delay={0.15}>
            <Reveal as="span" className="refresh-tag">// Functional cleansing wipes</Reveal>
            <Reveal as="h2" id="wellness-cleansing-title">A refresh for the <em>in-between moments.</em></Reveal>
            <Reveal as="p">After a workout, during a commute, or while travelling, Wipelo ON THE GO offers a practical way to cleanse when a shower has to wait.</Reveal>
            <Stagger as="ul" className="refresh-tags" gap={0.05} aria-label="Useful moments for ON THE GO">
              <Reveal as="li" variant="pop">After workouts</Reveal><Reveal as="li" variant="pop">On the move</Reveal><Reveal as="li" variant="pop">Between showers</Reveal>
            </Stagger>
            <Reveal className="refresh-ctas">
              <Link className="refresh-btn" href={onTheGoHref}>Explore ON THE GO <span aria-hidden="true">→</span></Link>
              {onTheGoPrice && <span className="refresh-price">From {onTheGoPrice}</span>}
            </Reveal>
          </Stagger>
        </div>
      </div>
    </section> */}

    {/* <section className="sec dark wellness-section body-care-section" aria-labelledby="wellness-body-title">
      <div className="wrap body-care-grid">
        <Reveal variant="slideFromLeft" className="body-care-media">
          <Parallax fill offset={30}>
            <Image src="/wipelo-body-skincare-routine.png" width={1536} height={1024} sizes="(max-width: 920px) 92vw, 560px" alt="A woman gently uses a cleansing wipe on her upper arm as part of a body-care routine." />
          </Parallax>
          <span className="body-care-chip">Leave-on · no rinse</span>
          <Link className="body-care-product" href={spotlessHref}>
            {spotlessImage && <span className="body-care-pack"><img src={spotlessImage} alt="" /></span>}
            <span className="body-care-name"><b>Wipelo SPOTLESS</b><small>Clear skin. Clear mind.</small></span>
            {spotlessPrice && <span className="body-care-price">{spotlessPrice}</span>}
          </Link>
        </Reveal>
        <Stagger className="body-care-copy" gap={0.08} delay={0.1}>
          <Reveal as="span" variant="slideFromRight" className="body-care-tag">// Body skincare</Reveal>
          <Reveal as="h2" variant="slideFromRight" id="wellness-body-title">Body skin deserves<br /><em>thoughtful care too.</em></Reveal>
          <Reveal as="p" variant="slideFromRight" className="body-care-lede">Breakouts can show up on the back, chest, and shoulders—areas that are not always easy to reach. Wipelo SPOTLESS brings targeted body care into a simple wipe format, with a planned salicylic acid formula and skin-conditioning ingredients.</Reveal>
          <Reveal as="span" variant="slideFromRight" className="body-care-label" id="spotless-areas-label">Made for hard-to-reach areas</Reveal>
          <Stagger as="ul" className="body-care-areas" gap={0.08} aria-labelledby="spotless-areas-label">
            {bodyAreas.map((area) => <Reveal as="li" variant="pop" key={area.name}><BodyAreaIcon area={area.name} />{area.name}</Reveal>)}
          </Stagger>
          <Reveal variant="slideFromRight" className="body-care-note">
            <span>Planned</span>
            <p>0.5% salicylic acid formula. Check the finished pack for confirmed formula details and directions.</p>
          </Reveal>
          <Reveal variant="slideFromRight"><Link className="body-care-btn" href={spotlessHref}>Explore SPOTLESS <span aria-hidden="true">→</span></Link></Reveal>
        </Stagger>
      </div>
    </section> */}

    {/* <section className="sec wellness-section her-care-section" aria-labelledby="wellness-her-title">
      <div className="wrap">
        <Stagger className="her-care-head" gap={0.09}>
          <Reveal as="span" className="her-care-tag">// Feminine intimate hygiene</Reveal>
          <Reveal as="h2" id="wellness-her-title">A gentle refresh, <em>with clear boundaries.</em></Reveal>
          <Reveal as="p">Wipelo HER is a fragrance-free wipe for occasional cleansing of external intimate skin — individually wrapped for discretion.</Reveal>
        </Stagger>
        <Stagger className="her-care-grid" gap={0.1}>
          <div className="her-care-col">
            {herFeatures.slice(0, 2).map((feature, index) => <HerFeature key={feature.label} index={index} {...feature} />)}
          </div>
          <Reveal variant="softScale" className="her-care-media">
            <Image src="/wipelo-her-travel-care.png" width={1536} height={1024} sizes="(max-width: 720px) 92vw, 420px" alt="A woman places an individually wrapped wipe in a travel pouch on a bathroom counter." />
          </Reveal>
          <div className="her-care-col">
            {herFeatures.slice(2).map((feature, index) => <HerFeature key={feature.label} index={index + 2} {...feature} />)}
          </div>
        </Stagger>
        <Reveal className="her-care-bar">
          <p>
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="10" cy="6.3" r="1" fill="currentColor" /></svg>
            <span><b>For external use only.</b> Do not insert or use internally. It does not change or regulate vaginal pH.</span>
          </p>
          <Link className="her-care-btn" href={herHref}>Explore HER <span aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
    </section> */}

    <section className="sec dark wellness-section needs-section" aria-labelledby="wellness-purpose-title">
      <div className="wrap">
        <Reveal>
          <NeedsScience heading={<Stagger className="needs-head" gap={0.09}>
            <Reveal as="span" className="needs-tag">// Functional personal care &amp; body wellness</Reveal>
            <Reveal as="h2" id="wellness-purpose-title">Three needs.<br /><em>Each with its own science.</em></Reveal>
          </Stagger>} tabs={[
            {
              label: "Body freshness", product: "ON THE GO", tone: "mint", image: onTheGoImage, href: onTheGoHref,
              headline: "Don’t just cover up body odor. Cleanse away the sweat and residue behind it.",
              actives: [
                { icon: "drop", dose: "0.4–0.8%", name: "Zinc ricinoleate", body: "Traps and neutralises odor molecules — not dependent on fragrance." },
                { icon: "leaf", dose: "0.4–1.2%", name: "Sulfate-free cleansers", body: "Sodium cocoyl glutamate + coco-glucoside lift sweat without stripping." },
                { icon: "heart", dose: "2–4%", name: "Glycerin + propanediol", body: "Non-sticky slip; prevents a tight afterfeel." },
                { icon: "shield", dose: "0.5–2%", name: "Panthenol, allantoin, aloe", body: "Calms friction-stressed skin after the gym or a long commute." },
              ],
              specs: [{ label: "Lotion pH", value: "4.5–5.0" }, { label: "Size", value: "~20 × 20 cm" }, { label: "Cloth", value: "50–60 gsm" }, { label: "Fibre", value: "Lyocell / viscose" }],
              note: "For external use. Not an antiperspirant or a substitute for washing.",
            },
            {
              label: "Body breakouts", product: "SPOTLESS", tone: "stone", image: spotlessImage, href: spotlessHref,
              headline: "Body acne doesn’t stop at your face. Neither should your skincare.",
              actives: [
                { icon: "dots", dose: "0.5%", name: "Salicylic acid (BHA)", body: "Helps exfoliate dead skin cells and address clogged pores." },
                { icon: "shield", dose: "2%", name: "Niacinamide", body: "Barrier support; evens the look of marks." },
                { icon: "spark", dose: "0.5%", name: "Zinc PCA", body: "Helps with an oily-looking back and chest." },
                { icon: "drop", dose: "3% + 1%", name: "Glycerin + panthenol", body: "Offsets the dryness exfoliation can bring." },
              ],
              specs: [{ label: "Lotion pH", value: "~3.9" }, { label: "Format", value: "Leave-on" }, { label: "Cloth", value: "60 gsm" }, { label: "Lotion load", value: "~400%" }],
              note: "Proposed 0.5% salicylic acid. Use on intact skin; start gradually if sensitive. Results not guaranteed.",
            },
            {
              label: "External intimate care", product: "HER", tone: "sand", image: herImage, href: herHref,
              headline: "A gentle, convenient external refresh — without added fragrance.",
              actives: [
                { icon: "flask", dose: "0.3–0.5%", name: "Lactic acid + 0.5% sodium lactate", body: "Supports an acidic, pH-considerate lotion design." },
                { icon: "heart", dose: "1.5% + 2%", name: "Panthenol + aloe", body: "A soothing, comfortable afterfeel for sensitive skin." },
                { icon: "leaf", dose: "0.5% + 0.5%", name: "Prebiotic + postbiotic", body: "Alpha-glucan oligosaccharide and lactobacillus ferment lysate." },
                { icon: "drop", dose: "≤3%", name: "Glycerin, capped", body: "Hydrating, deliberately kept low for intimate skin." },
              ],
              specs: [{ label: "Lotion pH", value: "3.8–4.5" }, { label: "Size", value: "~15 × 20 cm" }, { label: "Cloth", value: "50 gsm cotton" }, { label: "Fragrance", value: "0%" }],
              note: "External use only — never insert. Not a treatment or a way to regulate vaginal pH.",
            },
          ]} />
        </Reveal>
      </div>
    </section>
  </>;
}
