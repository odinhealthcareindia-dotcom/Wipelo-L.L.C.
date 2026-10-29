import { getProductSearchText, type CommerceProduct } from "@/lib/commerce";

/* ---------- Types ---------- */

export type ProductCategory = "her" | "spotless" | "on-the-go" | "wipelo";

type CopyCard = { title: string; body: string };
type UsageRow = { label: string; context: string; direction: string };

// Keys of the icon registry in components/product/live-product-pdp.tsx.
export type BenefitIconKey = "clock" | "travel" | "drop" | "leaf" | "shield" | "heart" | "spark" | "pin";
// `when` is the scene-setting line above a moment ("08:40 — gym to meeting").
type BenefitCard = CopyCard & { icon?: BenefitIconKey; when?: string };

export type ProductGallerySlide = {
  image: string; alt: string; eyebrow: string; headline: string; caption: string;
  fit?: "contain" | "cover";
};
export type IngredientDetail = CopyCard & {
  status: string; image?: string; imageAlt?: string; evidenceLabel?: string; evidenceUrl?: string;
};
// `label` names what the figure measures ("Had back involvement"); `title` is the figure itself.
export type QualityProof = CopyCard & { label?: string; sourceLabel?: string; sourceUrl?: string; image?: string; imageAlt?: string };
export type AccordionItem = { question: string; answer: string };
export type ProductDetailSection = { label: string; body: string; list?: string[] };
export type SubscriptionStory = { eyebrow: string; title: string; body: string; benefits: string[] };
export type ExpertReview = {
  name: string; credentials: string; jurisdiction: string; relationship: string; disclosure: string;
  quote: string; scope: string; reviewedAt: string; image: string; imageAlt: string;
};
// Independent public guidance a product's use decision is based on (not an endorsement).
export type CareGuidance = { body: string; source: string; url: string; disclaimer: string };

export type ProductProfile = {
  category: ProductCategory;
  audience: string;
  badge: string;
  shortBenefit: string;
  galleryHighlight: string;
  galleryCaption: string;
  roleSummary: string;
  heroPromise: string;
  overview: string;
  information: string;
  imageLabel: string;
  lifestyleImage: string;
  lifestyleAlt: string;
  // The Benefits tab sits next to the lifestyle image elsewhere on the page, so it needs a different photo.
  benefitsTabImage?: string;
  pdpRoutineSection: string;
  pdpProofSection: string;
  pdpProofSection1?: string;
  pdpProofSection2?: string;
  pdpDirection: string;
  ingredientTextureImg: string;
  publishedDetails: string[];
  gallerySlides?: ProductGallerySlide[];
  benefitsHeading: string;
  benefitsIntro: string;
  benefits: BenefitCard[];
  storyEyebrow: string;
  storyTitle: string;
  idealFor: string[];
  // Becomes an FAQ answer about where and how not to use the product.
  careBoundary: { title: string; body: string };
  routine: CopyCard[];
  ingredientHeading: string;
  ingredientIntro: string;
  keyIngredients: IngredientDetail[];
  ingredients?: IngredientDetail[];
  formulaNote: string;
  qualityHeading: string;
  qualityProofs: QualityProof[];
  usageHeading: string;
  usageIntro: string;
  usageRows: UsageRow[];
  expectationHeading: string;
  expectationIntro: string;
  expectations: { window: string; title: string; body: string; img: string }[];
  expectationHighlight?: { title: string; checks: string[] };
  expectationDisclaimer?: string;
  faqs: AccordionItem[];
  accordions?: AccordionItem[];
  productDetails: ProductDetailSection[];
  subscriptionStory?: SubscriptionStory;
  expertReview?: ExpertReview;
  careGuidance?: CareGuidance;
  // Handles of the products shown in the related shelf.
  relatedHandles: string[];
  // Buy-box header: where the product is used, shown above the title.
  heroKicker: string;
  // Four label/value tiles in the buy box.
  heroSpecs: { label: string; value: string }[];
  // Short safety line under the buy box.
  heroSafety: string;
  // A subscription offer from the product brief, shown as "Soon" until Shopify selling plans exist.
  plannedSubscription?: { savingsPercent: number; perk: string };
};

/* ---------- Category detection ---------- */

export function getProductCategory(product: CommerceProduct): ProductCategory {
  const searchable = getProductSearchText(product);
  // HER is checked first: its intimate-care wording is the most specific, and the body-care products
  // must never be routed to intimate-care copy (or the reverse) by a passing word in a description.
  if (/\bwipelo her\b|external intimate|intimate skin|vulv/i.test(searchable)) return "her";
  if (/\bspotless\b|salicylic|breakout|exfoliat/i.test(searchable)) return "spotless";
  if (/on[\s-]?the[\s-]?go|between[- ]shower|zinc ricinoleate|odou?r/i.test(searchable)) return "on-the-go";
  return "wipelo";
}

/* ---------- Profiles ---------- */

const LEGAL = "For external use only. Stop use if irritation occurs. Keep out of reach of children. Do not flush. Product made in India; distributor details must match the final pack.";

export function getProductProfile(product: CommerceProduct): ProductProfile {
  const category = getProductCategory(product);

  if (category === "on-the-go") {
    return {
      category,
      audience: "All-gender body care",
      badge: "Between showers",
      shortBenefit: "Individually sealed body cleansing wipes to help lift surface sweat and everyday residue between showers.",
      galleryHighlight: "Mild surfactants lift residue; zinc ricinoleate is included for odor-binding intent.",
      galleryCaption: "One individually sealed, two-sided wipe for feet, underarms and body.",
      roleSummary: "It is a practical reset, not an antiperspirant or a substitute for washing.",
      heroPromise: "Before clean. After clean.",
      overview: "The day does not always leave room for a second shower. ON THE GO removes surface sweat and residue where odor begins. A textured plant-fiber cloth does the physical work; a mild cleanser and zinc ricinoleate are designed to address the remaining odor impression. It is a practical reset, not an antiperspirant or a substitute for washing.",
      information: "Masking path: sweat and residue remain while fragrance sits over them. Proposed Source Reset path: a wipe removes surface material, cleansing lotion lifts remaining residue, and zinc ricinoleate is intended to bind odor molecules. This is a mechanism diagram, not a measured before-and-after result. A finished-product odor study must establish any difference.",
      imageLabel: "30 individually sealed wipes per pack · target lotion pH 4.5–5.0, pending batch verification",
      lifestyleImage: "/wipelo-between-shower-refresh.png",
      lifestyleAlt: "A woman packs an individually wrapped wipe into her gym bag after a workout.",
      benefitsTabImage: "/on-the-go-home.png",
      pdpRoutineSection: "/on-the-go-home.png",
      pdpProofSection: "/wipelo-lab-on-the-go.png",
      pdpDirection: "/one-pass-one-wipe.png",
      ingredientTextureImg: "/wipelo-lab-on-the-go.png",
      publishedDetails: ["Intact external body skin", "Target pH 4.5–5.0 · batch verification pending", "30 individually sealed wipes per pack"],
      benefitsHeading: "A small reset for the moments between.",
      benefitsIntro: "Glycerin, panthenol and an acidic pH target support a comfortable finish; fragrance is present.",
      benefits: [
        { when: "08:40 — gym to meeting", title: "A shirt change, no shower", body: "A pass over underarms and neck removes surface residue before the next layer of deodorant.", icon: "clock" },
        { when: "Seat 14A — hour six", title: "A long travel day", body: "One sealed wipe fits next to your toothbrush for the gap between showers.", icon: "travel" },
        { when: "17:25 — shoes off", title: "Dinner is next", body: "Feet and shoes have had a full day. Clean the skin first; cologne over socks is not a plan.", icon: "drop" },
        { when: "21:30 — campsite sink", title: "When facilities are far", body: "Clean the skin you can reach, then use soap and water when you can.", icon: "pin" },
      ],
      storyEyebrow: "Source Reset System™",
      storyTitle: "Two paths after a long day.",
      idealFor: ["After workout", "Commute", "Travel", "Feet"],
      careBoundary: { title: "Where should I not use it?", body: "Avoid mucosa, broken skin, and the groin because this proposed version contains fragrance and a cooling agent. " + LEGAL },
      routine: [
        { title: "Lift surface residue", body: "The embossed side is designed to pick up sweat and surface debris; the smooth side finishes the pass. Physical removal comes first." },
        { title: "Clean the skin", body: "Mild sugar and amino-acid surfactants help release oily residue. The lotion pH target is 4.5–5.0, pending batch verification." },
        { title: "Address odor impression", body: "Zinc ricinoleate is included to bind some odor molecules rather than rely on scent alone. A finished-wipe study must establish its effect." },
      ],
      ingredientHeading: "What’s in it.",
      ingredientIntro: "Current development formula; check the finished product label before use. The final INCI order must follow the manufactured batch.",
      keyIngredients: [
        { title: "Zinc ricinoleate", body: "A zinc salt included to bind some odor molecules in a formulation. It is not an antiperspirant or disinfectant, and it is not proof of finished-wipe efficacy.", status: "Proposed formula" },
        { title: "Lactic acid + sodium lactate", body: "The intended acidic pH adjustment and buffer. They do not sterilize skin or erase the normal microbiome.", status: "Proposed formula" },
        { title: "Panthenol + glycerin", body: "Conditioning ingredients for a less tight afterfeel. They do not prevent sweat.", status: "Proposed formula" },
        { title: "Cloth", body: "Proposed plant-derived lyocell/viscose spunlace, about 20 × 20 cm and 50–60 gsm, with a smooth and textured side. Verify fiber and biodegradation claims before publication.", status: "Proposed material" },
      ],
      formulaNote: "No ethanol/denatured alcohol, parabens, or MIT/CMIT in the proposed formula. This version is fragranced.",
      qualityHeading: "Three numbers to know.",
      qualityProofs: [
        { title: "24 volunteers", label: "Axillary microbiota study", body: "One study linked bacterial communities with odor differences through the day.", sourceLabel: "Axillary microbiota and odor study · PMID 25653852", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/25653852/" },
        { title: "About 50×", label: "Bacteria in a comparison group", body: "In that study, non-antiperspirant users had more underarm bacteria on average; this is not an ON THE GO result.", sourceLabel: "Axillary microbiota and odor study · PMID 25653852", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/25653852/" },
        { title: "96%", label: "Sequences in a small sample", body: "In an 11-person sample, 96% belonged to three common skin-bacteria genera; this is not product efficacy.", sourceLabel: "Axillary microbiota and odor study · PMID 25653852", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/25653852/" },
      ],
      usageHeading: "How to use it.",
      usageIntro: "For intact external body skin: underarms, feet and body.",
      usageRows: [
        { label: "01", context: "Open", direction: "Open one sachet." },
        { label: "02", context: "Wipe", direction: "Wipe underarms, feet, or external body skin; use the textured side first and the smooth side to finish. Avoid mucosa, broken skin, and the groin because this proposed version contains fragrance and a cooling agent." },
        { label: "03", context: "Finish", direction: "Let skin dry, dress, and bin the wipe. Do not flush. Wash normally when facilities are available." },
      ],
      expectationHeading: "What actually happens.",
      expectationIntro: "No promised transformation.",
      expectations: [
        { window: "First use", title: "A clean, light finish", body: "Skin may feel clean and lightly scented. Sweat production does not stop.", img: "/wipelo-between-shower-refresh.png" },
        { window: "Week 1", title: "Useful at predictable gaps", body: "A sealed wipe can be useful at predictable gaps: commute, exercise, and travel. Use only on intact body skin.", img: "/on-the-go-home.png" },
        { window: "Week 4", title: "A clean-up option", body: "The practical gain is a clean-up option where a shower is unavailable. No 24-hour odor control, antibacterial action, or shower-equivalent result is promised.", img: "/wipelo-lab-on-the-go.png" },
      ],
      expectationDisclaimer: "The proposed wipe can physically clean skin but cannot reduce sweat production. Its finished-product odor effect still needs direct testing.",
      faqs: [
        { question: "Is it safe for sensitive or intimate skin?", answer: "This proposed scented version is for intact external body skin such as underarms and feet. Do not use on genital mucosa or the groin. Patch test if fragrance or cooling ingredients bother you. Children should use it only with adult supervision after age-appropriate safety review." },
        { question: "Does it replace washing or deodorant?", answer: "No. A wipe is a bridge until soap and water are available. It does not stop sweat like an antiperspirant; use your usual deodorant if you need longer odor management." },
        { question: "Will it remove every odor?", answer: "No. It removes surface material and contains an odor-binding ingredient, but odor differs by person, fabric, and activity. A persistent new odor deserves medical assessment." },
      ],
      productDetails: [
        { label: "Description", body: "The day does not always leave room for a second shower. ON THE GO removes surface sweat and residue where odor begins." },
        { label: "What it’s made of", body: "Aqua, Glycerin, Propanediol, Aloe Barbadensis Leaf Juice, Hamamelis Virginiana Water, Sodium Cocoyl Glutamate, Coco-Glucoside, Niacinamide, Zinc Ricinoleate, Sodium PCA, Panthenol, Lactic Acid, Sodium Lactate, Menthyl Lactate, Allantoin, Caprylyl Glycol, Glyceryl Caprylate, Sodium Benzoate, Potassium Sorbate, Tetrasodium Glutamate Diacetate, Parfum. Indicative pack-deck list; final INCI order must follow the manufactured batch." },
        { label: "How to use", body: "", list: ["Open one sachet.", "Wipe underarms, feet, or external body skin; textured side first, smooth side to finish.", "Let skin dry, dress, and bin the wipe. Do not flush."] },
        { label: "Specs", body: "", list: ["Use · Intact external body skin", "Lotion pH · Target 4.5–5.0 · batch verification pending", "Format · 30 individually sealed wipes per pack", "Cloth · Dual Surface Cloth™, about 20 × 20 cm, 50–60 gsm"] },
      ],
      careGuidance: {
        body: "The American Academy of Dermatology explains that odor forms where sweat mixes with skin bacteria. Its whole-body deodorant guidance cautions against applying fragranced products to the groin. This proposed scented version is therefore focused on underarms, feet, and body skin.",
        source: "American Academy of Dermatology · Whole-body deodorant",
        url: "https://www.aad.org/public/everyday-care/skin-care-secrets/routine/whole-body-deodorant",
        disclaimer: "This independent guidance informs the use decision. It is not an endorsement of Wipelo or this product.",
      },
      heroKicker: "Between-shower body care · Underarms · Feet · Body",
      heroSpecs: [{ label: "Odor binder", value: "Zinc ricinoleate" }, { label: "Lotion pH", value: "Target 4.5–5.0" }, { label: "Cloth", value: "~20 × 20 cm, two-sided" }, { label: "Free from", value: "Ethanol · parabens · MIT/CMIT" }],
      heroSafety: "For external use only. Not an antiperspirant or a substitute for washing. This version contains fragrance. Do not flush.",
      plannedSubscription: { savingsPercent: 10, perk: "+ Welcome Kit on first order" },
      relatedHandles: ["her", "spotless"],
    };
  }

  if (category === "spotless") {
    return {
      category,
      audience: "All-gender body care",
      badge: "Body pore care",
      shortBenefit: "Leave-on body wipes with a proposed 0.5% salicylic acid formula for breakout-prone skin on the back, chest, and shoulders.",
      galleryHighlight: "Proposed 0.5% salicylic acid; finished-wipe delivery and dose must be verified.",
      galleryCaption: "One individually sealed, leave-on wipe for chest, shoulders, or back after sweat.",
      roleSummary: "It is a body-skin routine step, not an overnight cure or a replacement for diagnosis.",
      heroPromise: "Clear skin, clear mind.",
      overview: "Your face routine does not reach every place that gets sweaty or congested. SPOTLESS spreads a salicylic-acid lotion across hard-to-reach body skin. The proposed 0.5% formula pairs a beta hydroxy acid with niacinamide and humectants in a sealed cloth. It is a body-skin routine step, not an overnight cure or a replacement for diagnosis.",
      information: "Proposed lotion: 0.5% salicylic acid. A pass with a saturated cloth is followed by air-dry, leave-on contact. Concentration alone does not establish drug compliance or the amount transferred from the cloth. Do not present wipe time as a clinical contact-time claim.",
      imageLabel: "30 individually sealed wipes per pack · proposed 0.5% salicylic acid; target lotion pH about 3.9",
      lifestyleImage: "/wipelo-body-skincare-routine.png",
      lifestyleAlt: "A woman gently uses a cleansing wipe on her upper arm as part of a body-care routine.",
      benefitsTabImage: "/spotless-body-home.png",
      pdpRoutineSection: "/spotless-body-home.png",
      pdpProofSection: "/wipelo-lab-spotless.png",
      pdpDirection: "/one-pass-one-wipe.png",
      ingredientTextureImg: "/wipelo-lab-spotless.png",
      publishedDetails: ["Intact external body skin", "Proposed 0.5% salicylic acid · transfer not measured", "30 individually sealed wipes per pack"],
      benefitsHeading: "A small reset for the moments between.",
      benefitsIntro: "Fragrance free and ethanol free, with niacinamide, glycerin, and panthenol for skin feel.",
      benefits: [
        { when: "07:15 — workout finished", title: "After a workout", body: "Sweat and a tight shirt stay together on the walk home. Your face-only routine may never reach your shoulders.", icon: "clock" },
        { when: "13:30 — backpack straps", title: "The same strip of skin", body: "Heat and friction meet the same part of your upper back every day. A deliberate routine can reach the place that needs it.", icon: "pin" },
        { when: "19:00 — changing room", title: "A small sink, cleanser at home", body: "One sealed wipe makes a careful pass over chest and back skin possible.", icon: "drop" },
        { when: "Sunday — laundry fold", title: "A step after washing", body: "A leave-on pore-care step can fit after an ordinary wash; it does not replace it.", icon: "leaf" },
      ],
      storyEyebrow: "Pore Path System™",
      storyTitle: "Concentration is not delivered dose.",
      idealFor: ["Back", "Chest", "Post-workout", "Sensitive skin"],
      careBoundary: { title: "Where should I not use it?", body: "Avoid eyes, lips, mucosa, and broken skin. Do not scrub. " + LEGAL },
      routine: [
        { title: "Reach body skin", body: "A single cloth spreads lotion over chest, shoulders, or upper back without a bottle, cotton rounds, or a second pair of hands." },
        { title: "Exfoliate carefully", body: "The proposed lotion contains 0.5% salicylic acid. The amount retained on skin after wiping has not been measured." },
        { title: "Keep the routine comfortable", body: "Niacinamide, glycerin, and panthenol are included for skin feel. They do not remove the chance of dryness or irritation." },
      ],
      ingredientHeading: "What’s in it.",
      ingredientIntro: "Current development formula; check the finished product label before use. Finished-wipe delivery, stability, and final INCI order must be verified.",
      keyIngredients: [
        { title: "Salicylic acid", body: "A beta hydroxy acid in the proposed lotion at 0.5%. It exfoliates and can help unclog pores. It does not establish finished-product acne-treatment status or clear cysts overnight.", status: "Proposed formula" },
        { title: "Niacinamide + zinc PCA", body: "Ingredients selected for skin conditioning and oil-look support. They do not replace acne medicines or prove reduced sebum for this wipe.", status: "Proposed formula" },
        { title: "Glycerin + panthenol", body: "Humectant and conditioning support for the feel of an acid routine. They do not make irritation impossible.", status: "Proposed formula" },
        { title: "Cloth", body: "Proposed viscose or viscose/lyocell cloth, around 60 gsm and saturated to about 400% of dry weight. Verify salicylic-acid stability and delivered dose after contact with the chosen fiber.", status: "Proposed material" },
      ],
      formulaNote: "No added fragrance, ethanol/denatured alcohol, or parabens in the proposed formula.",
      qualityHeading: "Three numbers to know.",
      qualityProofs: [
        { title: "965 patients", label: "Dermatology referral cohort", body: "The cohort examined face, chest, and back acne rather than treating the face as the only site.", sourceLabel: "Facial and truncal acne referral cohort · PMID 18561586", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/18561586/" },
        { title: "61%", label: "Had back involvement", body: "A figure from that referral cohort, not a population prevalence estimate.", sourceLabel: "Facial and truncal acne referral cohort · PMID 18561586", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/18561586/" },
        { title: "45%", label: "Had chest involvement", body: "A figure from the same cohort; none of these numbers measures SPOTLESS results.", sourceLabel: "Facial and truncal acne referral cohort · PMID 18561586", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/18561586/" },
      ],
      usageHeading: "How to use it.",
      usageIntro: "For intact external body skin: chest, shoulders and back.",
      usageRows: [
        { label: "01", context: "Open", direction: "Open one sachet." },
        { label: "02", context: "Pass", direction: "Gently pass over intact chest, shoulders, or back. Avoid eyes, lips, mucosa, and broken skin. Do not scrub." },
        { label: "03", context: "Leave on", direction: "Let the lotion air-dry; do not rinse. Bin the wipe. Start every other day if sensitive and use sunscreen on exposed skin." },
      ],
      expectationHeading: "What actually happens.",
      expectationIntro: "No promised transformation.",
      expectations: [
        { window: "First use", title: "A lightly conditioned feel", body: "A clean, lightly conditioned feel. A tingle can occur; stinging is a reason to stop. No visible clearing is promised.", img: "/wipelo-body-skincare-routine.png" },
        { window: "Week 1", title: "Consistency over scrubbing", body: "Consistency matters more than scrubbing. Begin conservatively and do not stack strong exfoliants without advice.", img: "/spotless-body-home.png" },
        { window: "Week 4", title: "The honest picture", body: "Skin may look smoother, or it may not. No transformation, fixed lesion reduction, or clearance timeline is promised.", img: "/wipelo-lab-spotless.png" },
      ],
      expectationDisclaimer: "No wipe replaces washing. A compliant acne medicine also requires substantiation that this proposed cosmetic positioning does not provide.",
      faqs: [
        { question: "Is it safe for sensitive or intimate skin?", answer: "This is for intact external body skin only, not genital or other mucosal skin. Salicylic acid can dry or irritate. Patch test and start slowly. For children, ask a pediatric clinician before use; this formula has no age-specific safety data." },
        { question: "Does it replace washing or my acne treatment?", answer: "No. Cleanse normally after heavy sweat when you can. If you use prescription or over-the-counter acne medicine, ask your clinician before layering another acid, especially on large areas." },
        { question: "Will it clear body acne in four weeks?", answer: "No fixed timeline is promised. Body bumps can have different causes, including folliculitis or keratosis pilaris. Painful, deep, spreading, or scarring lesions need a clinician." },
      ],
      productDetails: [
        { label: "Description", body: "Your face routine does not reach every place that gets sweaty or congested. SPOTLESS spreads a salicylic-acid lotion across hard-to-reach body skin." },
        { label: "What it’s made of", body: "Aqua, Glycerin, Niacinamide, Panthenol, Salicylic Acid, Zinc PCA, Allantoin, Centella Asiatica Extract, Camellia Sinensis Leaf Extract, Polysorbate 20, Sodium Hyaluronate, Sodium Phytate, Phenoxyethanol, Ethylhexylglycerin, Sodium Benzoate, Sodium Hydroxide. Indicative pack-deck list; final INCI order must follow the manufactured batch." },
        { label: "How to use", body: "", list: ["Open one sachet.", "Gently pass over intact chest, shoulders, or back. Do not scrub.", "Let the lotion air-dry; do not rinse. Bin the wipe."] },
        { label: "Specs", body: "", list: ["Use · Intact external body skin", "Salicylic acid · Proposed 0.5% lotion · transfer not measured", "Format · 30 individually sealed wipes per pack", "Cloth · Leave-On Cloth™, around 60 gsm, saturated to about 400%"] },
      ],
      careGuidance: {
        body: "The American Academy of Dermatology explains that salicylic acid opens clogged pores and exfoliates skin. That supports the ingredient mechanism, not a claim that this particular wipe treats acne. Deep, painful, or scarring lesions need a dermatologist.",
        source: "American Academy of Dermatology · Acne treatment",
        url: "https://www.aad.org/public/diseases/acne/derm-treat/treat",
        disclaimer: "This independent guidance informs the ingredient and use decision. It is not an endorsement of Wipelo or this product.",
      },
      heroKicker: "Body pore care · Chest · Shoulders · Back",
      heroSpecs: [{ label: "Active", value: "Proposed 0.5% salicylic acid" }, { label: "Lotion pH", value: "Target ~3.9" }, { label: "Cloth", value: "~60 gsm, leave-on" }, { label: "Free from", value: "Fragrance · ethanol · parabens" }],
      heroSafety: "For external use only. Avoid eyes, lips, mucosa and broken skin. Use sunscreen on exposed skin. Do not flush.",
      plannedSubscription: { savingsPercent: 10, perk: "+ Welcome Kit on first order" },
      relatedHandles: ["her", "on-the-go"],
    };
  }

  if (category === "her") {
    return {
      category,
      audience: "External intimate skin care",
      badge: "pH-considerate cleansing",
      shortBenefit: "Fragrance-free, individually wrapped wipes for occasional cleansing of external intimate skin.",
      galleryHighlight: "Lactic acid + sodium lactate: an acidic lotion target, not a vaginal treatment.",
      galleryCaption: "One smooth, individually wrapped wipe for a clean reset away from home.",
      roleSummary: "It is care for the outside, with no promise to change what happens inside.",
      heroPromise: "Your pH, respected.",
      overview: "Some days ask for a clean reset before the next shower. HER gently cleanses external intimate skin without added fragrance. Its lactic acid and sodium lactate system is designed around an acidic target pH, while a smooth, individually sealed cloth keeps the ritual discreet. It is care for the outside, with no promise to change what happens inside.",
      information: "Vaginal fluid in one healthy cohort averaged 3.80 ± 0.20. HER’s proposed lotion target is 3.8–4.5. Vulvar skin varies by site and can be higher. This overlap illustrates formulation intent only; it does not show that HER changes vaginal pH. Batch results and finished-product tolerance data are still required.",
      imageLabel: "30 individually sealed wipes per pack · target lotion pH 3.8–4.5; verify on each production batch",
      lifestyleImage: "/wipelo-her-travel-care.png",
      lifestyleAlt: "A woman places an individually wrapped wipe in a travel pouch on a bathroom counter.",
      benefitsTabImage: "/her-handbag-essential.png",
      pdpRoutineSection: "/her-handbag-essential.png",
      pdpProofSection: "/wipelo-lab-her.png",
      pdpDirection: "/tear-at-notch-v2.png",
      ingredientTextureImg: "/wipelo-lab-her.png",
      publishedDetails: ["External intimate skin care only", "Target pH 3.8–4.5 · batch verification pending", "30 individually sealed wipes per pack"],
      benefitsHeading: "A small reset for the moments between.",
      benefitsIntro: "Fragrance free and alcohol free, with panthenol and glycerin for a softer afterfeel.",
      benefits: [
        { when: "08:40 — gym to meeting", title: "Before getting dressed", body: "Your bag has everything except a shower. A private, simple clean-up can fit before the next part of the day.", icon: "clock" },
        { when: "Seat 14A — hour six", title: "Mid-travel", body: "A long travel day can leave skin feeling less comfortable. A sealed wipe fits in a small pouch; bin the used cloth.", icon: "travel" },
        { when: "Day two — period bag", title: "A period-bag staple", body: "A pad change may be a moment for an external refresh. There is no need to “correct” your body or wash inside it.", icon: "heart" },
        { when: "21:10 — after intimacy", title: "A brief external clean", body: "If skin stings or discomfort persists, stop using the product and speak with a clinician.", icon: "shield" },
      ],
      storyEyebrow: "pH Regard System™",
      storyTitle: "pH is location specific.",
      idealFor: ["Period bag", "Travel", "After activity", "Sensitive skin"],
      careBoundary: { title: "Where should I not use it?", body: "Never insert it or use it on broken skin. HER is for external skin only; its lotion pH target does not set or regulate vaginal pH. " + LEGAL },
      routine: [
        { title: "Lift surface residue", body: "A smooth, wet cloth removes surface residue with a gentle pass. No scrubbing and no internal use." },
        { title: "Respect the outside", body: "Lactic acid and sodium lactate set an acidic lotion target. That does not mean a wipe can set or regulate vaginal pH." },
        { title: "Leave skin comfortable", body: "Panthenol, glycerin and aloe are included for skin feel. Individually sealed sachets keep a wipe ready when water is unavailable." },
      ],
      ingredientHeading: "What’s in it.",
      ingredientIntro: "Current development formula; check the finished product label before use. The final INCI order must follow the manufactured batch.",
      keyIngredients: [
        { title: "Lactic acid + sodium lactate", body: "A pH-adjusting acid and its salt. They set the lotion’s acidic target. They are not probiotics and cannot treat BV or yeast infection or restore vaginal pH.", status: "Proposed formula" },
        { title: "Alpha-glucan oligosaccharide + lactobacillus ferment lysate", body: "A prebiotic-type ingredient and a nonliving ferment lysate in the proposed formula. They do not establish a clinical microbiome benefit for this wipe.", status: "Proposed formula" },
        { title: "Panthenol + glycerin", body: "Humectant and conditioning ingredients chosen for skin feel. They are not a cure for irritation.", status: "Proposed formula" },
        { title: "Cloth", body: "Proposed soft, smooth plant-fiber cloth, about 15 × 20 cm and 50 gsm. Confirm final fiber and plastic content before making environmental claims.", status: "Proposed material" },
      ],
      formulaNote: "No added fragrance, ethanol/denatured alcohol, or parabens in the proposed formula.",
      qualityHeading: "Three numbers to know.",
      qualityProofs: [
        { title: "3.80 ± 0.20", label: "Vaginal pH in one cohort", body: "A 20-woman study of lactobacilli-dominant microbiota; vaginal data, not a universal vulvar target.", sourceLabel: "In-vivo vaginal pH study · PMID 30642259", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/30642259/" },
        { title: "36 women", label: "External gel-wash study", body: "Over 28 days, a separate pH 4.2 gel wash study reported acceptable tolerance. HER was not studied.", sourceLabel: "28-day external gel wash study · PMID 32024047", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/32024047/" },
        { title: "99 women", label: "Vulvar skin study", body: "Vulvar pH varied by site and was higher than inner-thigh and forearm control sites.", sourceLabel: "Vulvar skin study · PMID 23435846", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/23435846/" },
      ],
      usageHeading: "How to use it.",
      usageIntro: "External intimate skin care only.",
      usageRows: [
        { label: "01", context: "Open", direction: "Open one sealed sachet with clean hands." },
        { label: "02", context: "Wipe", direction: "Gently wipe external vulvar skin from front to back. Never insert it or use it on broken skin." },
        { label: "03", context: "Finish", direction: "Let skin dry; bin the wipe and wrapper. Do not flush." },
      ],
      expectationHeading: "What actually happens.",
      expectationIntro: "No promised transformation.",
      expectations: [
        { window: "First use", title: "A light, unscented afterfeel", body: "A brief external clean and a light, unscented afterfeel. Stop if it stings.", img: "/wipelo-her-travel-care.png" },
        { window: "Week 1", title: "An optional bag staple", body: "An optional bag staple for moments without water, not a daily hygiene requirement.", img: "/her-handbag-essential.png" },
        { window: "Week 4", title: "Reliable access", body: "The practical value is reliable access to a gentle external clean. No transformed microbiome, fewer infections, or “better” natural scent is promised.", img: "/wipelo-lab-her.png" },
      ],
      expectationDisclaimer: "The cloth and lotion details are proposed and should be checked against the final manufactured pack. No wipe replaces washing.",
      faqs: [
        { question: "Is it safe for sensitive or intimate skin?", answer: "It is designed for external vulvar skin, but “sensitive safe” needs finished-product testing. Patch test first if you react easily. Do not insert it, use it on broken skin, or continue if it burns. Persistent odor, itching, pain, or unusual discharge needs medical advice." },
        { question: "Does HER replace washing?", answer: "No. Water and gentle cleansing remain the baseline. HER is an occasional clean-up when a sink or shower is out of reach." },
        { question: "Can it balance vaginal pH or prevent infection?", answer: "No. HER is used on the outside. A lotion pH target does not prove a change to vaginal pH or a reduction in BV, yeast infections, or UTIs." },
      ],
      productDetails: [
        { label: "Description", body: "Some days ask for a clean reset before the next shower. HER gently cleanses external intimate skin without added fragrance." },
        { label: "What it’s made of", body: "Aqua, Aloe Barbadensis Leaf Juice, Glycerin, Panthenol, Lactic Acid, Sodium Lactate, Alpha-Glucan Oligosaccharide, Lactobacillus Ferment Lysate, Coco-Glucoside, Decyl Glucoside, Vaccinium Macrocarpon Fruit Extract, Calendula Officinalis Flower Extract, Chamomilla Recutita Flower Extract, Allantoin, Sodium Hyaluronate, Menthyl Lactate, Phenoxyethanol, Ethylhexylglycerin, Sodium Benzoate, Potassium Sorbate, Sodium Phytate. Indicative pack-deck list; final INCI order must follow the manufactured batch." },
        { label: "How to use", body: "", list: ["Open one sealed sachet with clean hands.", "Gently wipe external vulvar skin from front to back. Never insert it.", "Let skin dry; bin the wipe and wrapper. Do not flush."] },
        { label: "Specs", body: "", list: ["Use · External intimate skin care only", "Lotion pH · Target 3.8–4.5 · batch verification pending", "Format · 30 individually sealed wipes per pack", "Cloth · Soft Surface Cloth™, about 15 × 20 cm, 50 gsm"] },
      ],
      careGuidance: {
        body: "ACOG guidance says clear water is adequate for the inner vulva and advises avoiding certain scented or intimate-hygiene products. HER is positioned for occasional external use when water is not practical, rather than as a medical or daily necessity.",
        source: "ACOG · Vulvovaginal health",
        url: "https://www.acog.org/womens-health/faqs/vulvovaginal-health",
        disclaimer: "This independent guidance informs the use decision. It is not an endorsement of Wipelo or this product.",
      },
      heroKicker: "External intimate skin care · Fragrance-free",
      heroSpecs: [{ label: "pH system", value: "Lactic acid + sodium lactate" }, { label: "Lotion pH", value: "Target 3.8–4.5" }, { label: "Cloth", value: "~15 × 20 cm, smooth" }, { label: "Free from", value: "Fragrance · ethanol · parabens" }],
      heroSafety: "External use only — never insert. Not a treatment or a way to regulate vaginal pH. Do not flush.",
      plannedSubscription: { savingsPercent: 10, perk: "+ Welcome Kit on first order" },
      relatedHandles: ["on-the-go", "spotless"],
    };
  }

  // Generic fallback: neutral copy that stays truthful for any Wipelo product.
  return {
    category,
    audience: "Personal care",
    badge: "Individually wrapped",
    shortBenefit: "Individually wrapped personal-care wipes for moments away from a sink.",
    galleryHighlight: "Each wipe is individually sealed for easy carrying.",
    galleryCaption: "Formula details match the approved package label.",
    roleSummary: "A practical clean-up when water is out of reach. It does not replace washing.",
    heroPromise: "Care that goes where life does.",
    overview: "An individually wrapped wipe for moments away from a sink. Check the package label for the approved formula, directions, and cautions.",
    information: "Each wipe is individually sealed, so the last one in the box is as ready as the first. Formula details, directions, and cautions are printed on the approved package label.",
    imageLabel: "Product images from Shopify",
    lifestyleImage: "/wipelo-purposeful-care.png",
    lifestyleAlt: "Three individually wrapped wipes arranged beside a folded cloth on a pale stone surface.",
    benefitsTabImage: "/wipelo-lab-range.png",
    pdpRoutineSection: "/wipelo-lab-range.png",
    pdpProofSection: "/wipelo-lab-range.png",
    pdpDirection: "/one-pass-one-wipe.png",
    ingredientTextureImg: "/wipelo-lab-range.png",
    publishedDetails: ["Individually wrapped", "See package label for formula"],
    benefitsHeading: "Made for the moments between.",
    benefitsIntro: "One sealed wipe, ready when a sink is not.",
    benefits: [
      { title: "Ready to carry", body: "Each wipe is individually sealed for a bag, pocket, or desk drawer.", icon: "travel" },
      { title: "One wipe, one job", body: "Use one wipe, then bin it. Do not flush.", icon: "leaf" },
    ],
    storyEyebrow: "Wipelo",
    storyTitle: "One wipe. One clear purpose.",
    idealFor: ["Travel", "On the move"],
    careBoundary: { title: "Where should I not use it?", body: LEGAL },
    routine: [
      { title: "Open", body: "Open one sealed sachet." },
      { title: "Use", body: "Follow the directions on the package label." },
      { title: "Bin", body: "Bin the used wipe. Do not flush." },
    ],
    ingredientHeading: "What’s in it.",
    ingredientIntro: "Formula details match the approved package label.",
    keyIngredients: [{ title: "Formula", body: "See the package label for the full ingredient list.", status: "Package label" }],
    formulaNote: "Check the package label before use.",
    qualityHeading: "Made with care.",
    qualityProofs: [{ title: "Individually sealed", body: "Each wipe is sealed in its own sachet." }],
    usageHeading: "How to use it.",
    usageIntro: "Follow the directions on the package label.",
    usageRows: [
      { label: "01", context: "Open", direction: "Open one sealed sachet." },
      { label: "02", context: "Use", direction: "Follow the directions on the package label." },
      { label: "03", context: "Finish", direction: "Bin the wipe. Do not flush." },
    ],
    expectationHeading: "What to expect.",
    expectationIntro: "No promised transformation.",
    expectations: [
      { window: "First use", title: "A quick clean-up", body: "A practical clean-up when water is out of reach.", img: "/wipelo-purposeful-care.png" },
    ],
    faqs: [
      { question: "Does it replace washing?", answer: "No. A wipe is a bridge until soap and water are available." },
    ],
    productDetails: [
      { label: "Description", body: "An individually wrapped wipe for moments away from a sink." },
    ],
    relatedHandles: [],
    heroKicker: "Personal care · Individually wrapped",
    heroSpecs: [{ label: "Format", value: "Individually sealed" }, { label: "Use", value: "See package label" }, { label: "Formula", value: "See package label" }, { label: "Disposal", value: "Bin, do not flush" }],
    heroSafety: "For external use only. Follow the package label. Do not flush.",
  };
}
