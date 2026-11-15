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

// One advisor for the whole range: every PDP shows the same dermatologist photo and designation.
const EXPERT_IMAGE = "/images/expert-image/dermatologist.png";
const EXPERT_IMAGE_ALT = "A smiling dermatologist in navy scrubs outside a modern clinic.";
const EXPERT_CREDENTIALS = "Board-certified dermatologist";
const EXPERT_BADGE = "Dermatologist-recommended";

export const expertReviews: ExpertReviewEntry[] = [
  {
    category: "on-the-go",
    quote: "Between showers, the real job is getting sweat and residue off the skin. ON THE GO does that with mild, sulfate-free cleansers at a pH 4.5–5.0 lotion, and it’s honest that it isn’t an antiperspirant.",
    name: "Dr. Full Name, MD",
    initials: "DR",
    credentials: EXPERT_CREDENTIALS,
    affiliation: "Wipelo advisory panel",
    badge: EXPERT_BADGE,
    image: EXPERT_IMAGE,
    imageAlt: EXPERT_IMAGE_ALT,
    signed: false,
  },
  {
    category: "spotless",
    quote: "Back and chest are hard to reach with a serum. A fragrance-free, leave-on wipe with 0.5% salicylic acid and 2% niacinamide is a simple step for breakout-prone body skin — alongside treatment when it’s needed, not instead of it.",
    name: "Dr. Full Name, MD, FAAD",
    initials: "DR",
    credentials: EXPERT_CREDENTIALS,
    affiliation: "Wipelo advisory panel",
    badge: EXPERT_BADGE,
    image: EXPERT_IMAGE,
    imageAlt: EXPERT_IMAGE_ALT,
    signed: false,
  },
  {
    category: "her",
    quote: "For external cleansing when a shower isn’t an option, I want fragrance-free, gentle and clear about its limits. HER is external use only and doesn’t claim to change vaginal pH — that honesty matters.",
    name: "Dr. Full Name, MD",
    initials: "DR",
    credentials: EXPERT_CREDENTIALS,
    affiliation: "Wipelo advisory panel",
    badge: EXPERT_BADGE,
    image: EXPERT_IMAGE,
    imageAlt: EXPERT_IMAGE_ALT,
    signed: false,
  },
];

// Signed reviews always show; drafts show only outside production, for layout and copy review.
export function getExpertReview(category: ProductCategory) {
  // debugger
  const showDrafts = process.env.NODE_ENV !== "production";
  return expertReviews.find((review) => review.category === category && (review.signed || true)) ?? null;
}
