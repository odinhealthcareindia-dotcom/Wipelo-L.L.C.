import type { ProductCategory } from "@/lib/product-profiles";

type IntroContent = {
  name: string;
  kicker: string;
  title: string;
  titleEnd: string;
  description: string;
  benefits: { icon: "drop" | "texture" | "pack" | "shield"; title: string; body: string }[];
  storyTitle: string;
  story: string;
  image: string;
  imageAlt: string;
  facts: { label: string; value: string }[];
};

// Editorial copy for the split introduction. Formula figures remain development targets.
export const productIntros: Partial<Record<ProductCategory, IntroContent>> = {
  "on-the-go": {
    name: "ON THE GO",
    kicker: "Between-shower care · Individually sealed · External body skin",
    title: "Your fresh-up", titleEnd: "for the in-between.",
    description: "Individually sealed body-cleansing wipes to help remove surface sweat and everyday residue from underarms, feet and body — when a shower has to wait.",
    benefits: [
      { icon: "drop", title: "Odor addressed at the source", body: "Proposed 0.4–0.8% zinc ricinoleate helps bind odor molecules." },
      { icon: "texture", title: "Cleans through texture", body: "A textured plant-fibre cloth lifts sweat; mild cleansers finish." },
      { icon: "pack", title: "One wipe, one reset", body: "Each wipe is sealed, so it stays wet in your bag or carry-on." },
      { icon: "shield", title: "Comfortable on skin", body: "pH 4.5–5.0 lotion with glycerin and panthenol; contains fragrance." },
    ],
    storyTitle: "Gym to work. Long travel days. The commute home.",
    story: "Most days don’t leave room for a second shower, and spraying over sweat doesn’t remove it. ON THE GO cleans away the surface residue behind body odor so you can reset and carry on. It isn’t an antiperspirant, a deodorant replacement or a shower — use soap and water when you can.",
    image: "/images/product-intro/on-the-go.webp",
    imageAlt: "Deep teal Wipelo ON THE GO sachet with a folded white wipe on dark green stone against a forest-green backdrop.",
    facts: [{ label: "Zinc ricinoleate", value: "0.4–0.8%" }, { label: "Lotion pH target", value: "4.5–5.0" }, { label: "Cloth", value: "20 cm" }],
  },
  her: {
    name: "HER",
    kicker: "External use only · No added fragrance · Individually wrapped",
    title: "A gentle refresh,", titleEnd: "for the outside.",
    description: "Fragrance-free, individually wrapped wipes for occasional cleansing of external intimate skin — when water isn’t close by.",
    benefits: [
      { icon: "drop", title: "A considered pH approach", body: "Lactic acid targets pH 3.8–4.5, not a way to change vaginal pH." },
      { icon: "texture", title: "Soft by design", body: "A smooth, soft 15 × 20 cm cloth for gentle external cleansing." },
      { icon: "pack", title: "Discreet. Sealed. Ready.", body: "Individually wrapped to fit a handbag, travel kit or desk drawer." },
      { icon: "shield", title: "Care for the outside", body: "Glycerin and aloe, no fragrance. External only — never insert." },
    ],
    storyTitle: "Travel days. After a workout. During your period.",
    story: "Some moments call for a simple external-care routine. Open one sachet, gently wipe external vulvar skin from front to back, and discard. Do not flush. HER is for occasional external cleansing; it does not regulate vaginal pH or treat infection.",
    image: "/images/product-intro/her-blended.webp",
    imageAlt: "Ivory Wipelo HER sachet and a soft white wipe lit against a deep forest-green background.",
    facts: [{ label: "Added fragrance", value: "None" }, { label: "Lotion pH target", value: "3.8–4.5" }, { label: "Cloth", value: "15 × 20 cm" }],
  },
  spotless: {
    name: "SPOTLESS",
    kicker: "For external body skin · Fragrance-free · Leave-on",
    title: "Body care that reaches", titleEnd: "beyond your face.",
    description: "Individually wrapped, leave-on body wipes for breakout-prone skin on the back, chest and shoulders.",
    benefits: [
      { icon: "drop", title: "A focused formula", body: "Proposed 0.5% salicylic acid, an exfoliant. Final dose pending." },
      { icon: "texture", title: "Reach beyond your face", body: "Reaches back, chest and shoulders. Intact external skin only." },
      { icon: "pack", title: "One wipe. Leave it on.", body: "Pass it over skin and let it dry. Don’t rinse. Don’t flush." },
      { icon: "shield", title: "Support for skin feel", body: "Fragrance-free, with niacinamide. The acid may still dry skin." },
    ],
    storyTitle: "Your back. Your chest. Your shoulders. Part of the routine.",
    story: "Your face isn’t the only place that needs care. SPOTLESS brings a convenient leave-on step to breakout-prone body areas. Avoid combining with other strong exfoliants without advice. No fixed clear-skin timeline is promised; seek medical advice for painful, persistent or scarring breakouts.",
    image: "/images/product-intro/spotless-blended.webp",
    imageAlt: "White Wipelo SPOTLESS sachet and a folded wipe on dark green stone against a tonal green backdrop.",
    facts: [{ label: "Salicylic acid", value: "0.5%*" }, { label: "Lotion pH target", value: "~3.9" }, { label: "Format", value: "Leave-on" }],
  },
};
