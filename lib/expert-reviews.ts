import type { ProductCategory } from "@/lib/product-profiles";

export type ExpertReviewEntry = {
  category: ProductCategory;
  quote: string;
  name: string;
  initials: string;
  credentials: string;
  affiliation: string;
  badge: string;
  image: string;
  imageAlt: string;
  // A draft is wording waiting for a real, signed advisor quote. Drafts only render in development,
  // so an unsigned medical endorsement can never reach the live site.
  signed: boolean;
};

export const expertReviews: ExpertReviewEntry[] = [
  {
    category: "on-the-go",
    quote: "Between showers, the real job is getting sweat and residue off the skin. ON THE GO does that with mild, sulfate-free cleansers at a pH 4.5–5.0 lotion, and it’s honest that it isn’t an antiperspirant.",
    name: "Dr. Full Name, MD",
    initials: "DR",
    credentials: "Board-certified dermatologist",
    affiliation: "Wipelo advisory panel",
    badge: "Dermatologist-recommended",
    image: "/wipelo-between-shower-refresh.png",
    imageAlt: "A woman packs an individually wrapped wipe into her gym bag after a workout.",
    signed: false,
  },
  {
    category: "spotless",
    quote: "Back and chest are hard to reach with a serum. A fragrance-free, leave-on wipe with 0.5% salicylic acid and 2% niacinamide is a simple step for breakout-prone body skin — alongside treatment when it’s needed, not instead of it.",
    name: "Dr. Full Name, MD, FAAD",
    initials: "DR",
    credentials: "Board-certified dermatologist",
    affiliation: "Wipelo advisory panel",
    badge: "Dermatologist-recommended",
    image: "/wipelo-body-skincare-routine.png",
    imageAlt: "A woman gently uses a cleansing wipe on her upper arm as part of a body-care routine.",
    signed: false,
  },
  {
    category: "her",
    quote: "For external cleansing when a shower isn’t an option, I want fragrance-free, gentle and clear about its limits. HER is external use only and doesn’t claim to change vaginal pH — that honesty matters.",
    name: "Dr. Full Name, MD",
    initials: "DR",
    credentials: "Board-certified OB-GYN",
    affiliation: "Wipelo advisory panel",
    badge: "Gynecologist-recommended",
    image: "/wipelo-her-travel-care.png",
    imageAlt: "A woman in a bathrobe slips an individually wrapped wipe into a dark pouch on a marble counter.",
    signed: false,
  },
];

// Signed reviews always show; drafts show only outside production, for layout and copy review.
export function getExpertReview(category: ProductCategory) {
  debugger
  const showDrafts = process.env.NODE_ENV !== "production";
  return expertReviews.find((review) => review.category === category && (review.signed || true)) ?? null;
}
