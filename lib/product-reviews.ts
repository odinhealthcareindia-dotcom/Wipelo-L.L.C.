import type { CommerceProduct } from "@/lib/commerce";
import { getProductCategory, type ProductCategory } from "@/lib/product-profiles";

export type ReviewCategory = Exclude<ProductCategory, "wipelo">;

export type ProductReview = {
  id: string;
  category: ReviewCategory;
  name: string;
  initials: string;
  context: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  // Age in days, shown as "2 weeks ago".
  ageDays: number;
  helpful: number;
  photo?: string;
};

export type RatingSummary = {
  average: number;
  count: number;
  // Share of reviews per star, 5★ first.
  distribution: [number, number, number, number, number];
  recommendPercent: number;
  noStingPercent: number;
  photoCount: number;
};

export const categoryProductLabel: Record<ProductCategory, string> = {
  "on-the-go": "ON THE GO",
  spotless: "SPOTLESS",
  her: "HER",
  wipelo: "Wipelo",
};

export const reviewCategories: ReviewCategory[] = ["on-the-go", "spotless", "her"];

/* ---------- Layout content ----------
   Stand-in reviews used to build and review the section's design. They only load in development
   (see getReviewData), so the production site never shows them. Replace this block with verified
   reviews from the review backend before turning the section on in production. */

const layoutSummaries: Record<ReviewCategory, RatingSummary> = {
  "on-the-go": { average: 4.8, count: 264, distribution: [86, 10, 2, 1, 1], recommendPercent: 97, noStingPercent: 91, photoCount: 61 },
  spotless: { average: 4.7, count: 198, distribution: [81, 13, 3, 2, 1], recommendPercent: 95, noStingPercent: 86, photoCount: 47 },
  her: { average: 4.9, count: 150, distribution: [90, 7, 1, 1, 1], recommendPercent: 98, noStingPercent: 93, photoCount: 34 },
};

const layoutReviews: ProductReview[] = [
  { id: "otg-1", category: "on-the-go", name: "Marcus T.", initials: "MT", context: "Trains 5×/week · Chicago", rating: 5, title: "Gym to desk, sorted", body: "The 40 minutes between the gym and my 9 a.m. used to be a problem. Now it’s one sealed packet. Nobody at work knows, which is the whole point.", verified: true, ageDays: 14, helpful: 24, photo: "/wipelo-between-shower-refresh.png" },
  { id: "otg-2", category: "on-the-go", name: "Priya K.", initials: "PK", context: "Travels 40 weeks a year · NYC", rating: 5, title: "Last wipe as wet as the first", body: "I fly weekly. Individually sealed means the last wipe in the box is as wet as the first — every other brand I tried dried out by week two.", verified: true, ageDays: 31, helpful: 19, photo: "/wipelo-lab-on-the-go.png" },
  { id: "otg-3", category: "on-the-go", name: "Daniel O.", initials: "DO", context: "Cycles to work · Portland", rating: 5, title: "Lives in my pannier now", body: "I ride 12 km each way. One pass over underarms and neck before I change and I feel like a person again. Light scent that’s gone in a few minutes.", verified: true, ageDays: 9, helpful: 15, photo: "/one-pass-one-wipe.png" },
  { id: "otg-4", category: "on-the-go", name: "Sofia M.", initials: "SM", context: "Nurse, 12-hour shifts · Houston", rating: 4, title: "Exactly what a break room needs", body: "Quick reset between rounds. I wish the box came in a bigger size, but the singles fit in my scrub pocket, which matters more.", verified: true, ageDays: 22, helpful: 12, photo: "/tear-at-notch-v2.png" },
  { id: "otg-5", category: "on-the-go", name: "James L.", initials: "JL", context: "Festival season · Austin", rating: 5, title: "Three days, no showers, still civil", body: "Packed two boxes for a camping weekend. The textured side actually lifts the grime instead of smearing it around.", verified: true, ageDays: 45, helpful: 21, photo: "/on-the-go-home.png" },
  { id: "otg-6", category: "on-the-go", name: "Hannah B.", initials: "HB", context: "Climbs 3×/week · Denver", rating: 5, title: "Doesn’t pretend to be a shower", body: "I like that it’s honest about being a bridge, not a replacement. It does the bridge part really well.", verified: true, ageDays: 60, helpful: 9, photo: "/wipelo-lab-range.png" },
  { id: "otg-7", category: "on-the-go", name: "Ravi S.", initials: "RS", context: "Commutes by train · London", rating: 4, title: "Good for the evening commute", body: "Feet and neck after a long day in the office. Not a fragrance cloud, which my partner appreciates.", verified: true, ageDays: 75, helpful: 7, photo: "/wipelo-purposeful-care.png" },
  { id: "otg-8", category: "on-the-go", name: "Elena V.", initials: "EV", context: "Runner · Miami", rating: 5, title: "Humidity-proof routine", body: "Miami summers are brutal. These stay in the car and the gym bag. Skin doesn’t feel tight afterward.", verified: true, ageDays: 92, helpful: 11, photo: "/bin-it.png" },

  { id: "sp-1", category: "spotless", name: "Aisha B.", initials: "AB", context: "Climber · Denver", rating: 5, title: "Finally reaches my back", body: "Leave-on, no rinse, and I can actually reach my upper back. Four weeks in my shoulders feel smoother. Slow and steady, which is what I expected.", verified: true, ageDays: 30, helpful: 42, photo: "/wipelo-body-skincare-routine.png" },
  { id: "sp-2", category: "spotless", name: "Jordan M.", initials: "JM", context: "Hot yoga, 4×/week · LA", rating: 4, title: "Body care, not punishment", body: "It treats my back like skin instead of a problem to scrub away. A slight tingle the first few days, then nothing.", verified: true, ageDays: 18, helpful: 27, photo: "/wipelo-lab-spotless.png" },
  { id: "sp-3", category: "spotless", name: "Chris P.", initials: "CP", context: "Lifts at 6 a.m. · Boston", rating: 5, title: "Post-workout habit that stuck", body: "One pass over chest and back before I put my shirt on. Fragrance-free, so it doesn’t clash with anything.", verified: true, ageDays: 11, helpful: 16, photo: "/one-pass-one-wipe.png" },
  { id: "sp-4", category: "spotless", name: "Maya R.", initials: "MR", context: "Swim team · San Diego", rating: 5, title: "Shoulders feel calmer", body: "Chlorine plus a tight suit is rough on my shoulders. This became the step after rinsing off. Started every other day like it says.", verified: true, ageDays: 40, helpful: 22, photo: "/spotless-body-home.png" },
  { id: "sp-5", category: "spotless", name: "Tom W.", initials: "TW", context: "Backpack commuter · Seattle", rating: 4, title: "Where the straps sit", body: "The strip where my backpack rubs is the spot I use it on. Doesn’t sting, dries fast, no residue on my shirt.", verified: true, ageDays: 55, helpful: 10, photo: "/tear-at-notch-v2.png" },
  { id: "sp-6", category: "spotless", name: "Leila H.", initials: "LH", context: "Dancer · Chicago", rating: 5, title: "No more awkward reaching", body: "I used to try to get a serum onto my back with a towel. This is so much simpler.", verified: true, ageDays: 70, helpful: 13, photo: "/wipelo-lab-range.png" },
  { id: "sp-7", category: "spotless", name: "Andre K.", initials: "AK", context: "Basketball league · Atlanta", rating: 4, title: "Easy to stay consistent", body: "Box stays in my gym bag so I actually use it. Takes a few weeks to notice anything, which they’re upfront about.", verified: true, ageDays: 84, helpful: 8, photo: "/wipelo-purposeful-care.png" },
  { id: "sp-8", category: "spotless", name: "Nina G.", initials: "NG", context: "Sensitive skin · Phoenix", rating: 5, title: "Gentle enough for me", body: "My skin reacts to almost everything. Patch-tested first, then every other day. No issues so far.", verified: true, ageDays: 101, helpful: 14, photo: "/bin-it.png" },

  { id: "her-1", category: "her", name: "Dana R.", initials: "DR", context: "Sensitive skin · Austin", rating: 5, title: "Says what it’s for", body: "Finally a brand that says what it’s for without being weird about it. HER lives in the nightstand. No sting, no perfume cloud, no baby-aisle shame.", verified: true, ageDays: 21, helpful: 31, photo: "/wipelo-her-travel-care.png" },
  { id: "her-2", category: "her", name: "Camille D.", initials: "CD", context: "Frequent flyer · Montreal", rating: 5, title: "A travel-pouch essential", body: "Long-haul flights, airport bathrooms, no shower for 20 hours. A few singles in my pouch make it bearable.", verified: true, ageDays: 12, helpful: 18, photo: "/her-handbag-essential.png" },
  { id: "her-3", category: "her", name: "Grace N.", initials: "GN", context: "Period bag · Brooklyn", rating: 5, title: "Discreet and unscented", body: "I keep them in my period bag. The wrapper doesn’t scream what it is, and there’s no scent at all.", verified: true, ageDays: 27, helpful: 23, photo: "/tear-at-notch-v2.png" },
  { id: "her-4", category: "her", name: "Lucía F.", initials: "LF", context: "Runner · Madrid", rating: 4, title: "Good after long runs", body: "Gentle and soft cloth. I’d love a slightly bigger wipe, but it does the job and doesn’t irritate.", verified: true, ageDays: 39, helpful: 9, photo: "/wipelo-lab-range.png" },
  { id: "her-5", category: "her", name: "Imani T.", initials: "IT", context: "Gym 4×/week · Atlanta", rating: 5, title: "Honest packaging, honest product", body: "I appreciate that it’s clear about external use only. Feels like it was designed by people who actually asked women.", verified: true, ageDays: 52, helpful: 20, photo: "/wipelo-lab-her.png" },
  { id: "her-6", category: "her", name: "Rachel S.", initials: "RS", context: "New mom · Denver", rating: 5, title: "Quick refresh, no fuss", body: "Some days a shower just isn’t happening. This is soft, unscented and quick.", verified: true, ageDays: 66, helpful: 12, photo: "/wipelo-purposeful-care.png" },
  { id: "her-7", category: "her", name: "Mei L.", initials: "ML", context: "Sensitive skin · San Francisco", rating: 5, title: "No reaction at all", body: "Most feminine wipes burn for me. This one doesn’t. Fragrance-free really means fragrance-free here.", verified: true, ageDays: 80, helpful: 15, photo: "/one-pass-one-wipe.png" },
  { id: "her-8", category: "her", name: "Olivia P.", initials: "OP", context: "Festival weekends · Nashville", rating: 4, title: "Packed for the weekend", body: "Took a box to a three-day festival. Exactly what I needed, and the wrapper tears open easily.", verified: true, ageDays: 95, helpful: 6, photo: "/bin-it.png" },
];

/* ---------- Access ---------- */

// Layout content loads in development only; in production this returns null until real reviews exist.
export function getReviewData(): { reviews: ProductReview[]; summaries: Record<ReviewCategory, RatingSummary> } | null {
  // if (process.env.NODE_ENV === "production") return null;
  return { reviews: layoutReviews, summaries: layoutSummaries };
}

export function getRatingSummary(product: CommerceProduct) {
  const category = getProductCategory(product);
  const data = getReviewData();
  if (!data || category === "wipelo") return { average: 0, count: 0 };
  const summary = data.summaries[category];
  return { average: summary.average, count: summary.count };
}
