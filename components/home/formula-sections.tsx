import { FormulaTabs, type FormulaTab } from "./formula-tabs";

type FormulaSectionsProps = {
  onTheGoHref: string;
  spotlessHref: string;
  herHref: string;
};

export function FormulaSections({ onTheGoHref, spotlessHref, herHref }: FormulaSectionsProps) {
  const tabs: FormulaTab[] = [
    {
      name: "ON THE GO",
      title: "Body cleansing with odor-binding support.",
      image: "/wipelo-lab-on-the-go.png",
      alt: "The deep-teal Wipelo ON THE GO packet beside a folded wipe and clear liquid in glass labware.",
      ingredients: [
        { name: "Mild cleansers", role: "Lift surface sweat and residue" },
        { name: "Zinc ricinoleate", role: "Odor-binding support" },
      ],
      note: "Not an antiperspirant or a replacement for a shower.",
      href: onTheGoHref,
    },
    {
      name: "SPOTLESS",
      title: "Leave-on care for breakout-prone body skin.",
      image: "/wipelo-lab-spotless.png",
      alt: "The white Wipelo SPOTLESS packet beside a folded wipe and clear liquid in a glass petri dish.",
      ingredients: [
        { name: "Salicylic acid 0.5%", role: "Helps manage buildup" },
        { name: "Niacinamide", role: "Skin conditioning" },
        { name: "Glycerin · panthenol", role: "Hydration" },
      ],
      note: "Formula planned. Check the finished pack for confirmed ingredients and directions.",
      href: spotlessHref,
    },
    {
      name: "HER",
      title: "Fragrance-free, external intimate cleansing.",
      image: "/wipelo-lab-her.png",
      alt: "The cream Wipelo HER packet with a white wipe, clear glass dishes, and an aloe leaf.",
      ingredients: [
        { name: "Lactic acid + sodium lactate", role: "pH-considerate care" },
        { name: "Glycerin · panthenol · aloe", role: "Skin comfort" },
      ],
      note: "Formula planned. External use only — it does not change or regulate vaginal pH.",
      href: herHref,
    },
  ];

  return <section className="sec dark formula-section" id="ingredients" aria-labelledby="science-range-title">
    <div className="wrap">
      <div className="formula-head rv">
        <div>
          <span className="formula-tag">// Formulation, with a clear purpose</span>
          <h2 id="science-range-title">Different needs.<br /><em>Different ingredient choices.</em></h2>
        </div>
        <p>Ingredient choices follow the intended use of each formula. Pick a wipe to see what&rsquo;s inside and why.</p>
      </div>
      <div className="rv"><FormulaTabs tabs={tabs} /></div>
    </div>
  </section>;
}
