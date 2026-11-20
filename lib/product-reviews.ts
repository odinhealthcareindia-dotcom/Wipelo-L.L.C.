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
  // Describes the photo for screen readers in the photo viewer.
  photoAlt?: string;
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

// One review per approved customer photo (public/images/customer-review). Each review's copy is
// written to match what its photo shows. Helpful counts alternate scene shots and handheld shots,
// so the photo strip (sorted by "Most helpful") mixes both.
const OTG = "/images/customer-review/on-the-go";
const SP = "/images/customer-review/spotless";
const HER = "/images/customer-review/her";

const layoutReviews: ProductReview[] = [
  // ON THE GO
  { id: "otg-2", category: "on-the-go", name: "Marcus T.", initials: "MT", context: "Trains 5×/week · Chicago", rating: 5, title: "Actually wet, not half-dry", body: "The first thing I noticed is that the cloth is properly saturated. One covers both underarms and the back of my neck after a session, with some left over.", verified: true, ageDays: 9, helpful: 46, photo: `${OTG}/handheld-01-gym-bench.webp`, photoAlt: "A hand holding an unfolded white wipe over a gym bench, a gym bag and towel behind." },
  { id: "otg-4", category: "on-the-go", name: "Sana Q.", initials: "SQ", context: "Long runs on weekends · Austin", rating: 5, title: "Halfway through a hot run", body: "I stopped at a park bench at mile seven on a hot day. The cloth is a decent size and doesn’t fall apart when you’re a sweaty mess.", verified: true, ageDays: 16, helpful: 41, photo: `${OTG}/handheld-02-park-stop.webp`, photoAlt: "A hand in a striped sleeve holding a wipe beside a park bench and trees." },
  { id: "otg-6", category: "on-the-go", name: "Ibrahim N.", initials: "IN", context: "Site engineer · Phoenix", rating: 5, title: "Car park, 34°C, client in five", body: "I sit in the car after a site visit, take two minutes with one of these, and I can walk into the client’s office without feeling like I brought the site with me.", verified: true, ageDays: 27, helpful: 36, photo: `${OTG}/handheld-03-car-window.webp`, photoAlt: "A hand holding a wipe inside a car, a street visible through the side window." },
  { id: "otg-8", category: "on-the-go", name: "Tom H.", initials: "TH", context: "Cycles to the office · Copenhagen", rating: 5, title: "You can feel both sides", body: "Textured side first, then flip to the smooth side to finish, like it says. It’s a small thing, but it actually lifts sweat instead of smearing it around.", verified: true, ageDays: 6, helpful: 31, photo: `${OTG}/handheld-04-entryway.webp`, photoAlt: "A hand holding a wipe in a bright entryway, a bench and white sneakers behind." },
  { id: "otg-10", category: "on-the-go", name: "Hannah B.", initials: "HB", context: "Climbs 3×/week · Denver", rating: 5, title: "Not a fragrance cloud", body: "I used it in a café bathroom between climbing and lunch with friends. Nobody noticed anything, which is exactly what I want from it.", verified: true, ageDays: 40, helpful: 27, photo: `${OTG}/handheld-05-cafe-pause.webp`, photoAlt: "A hand holding a wipe over a dark wooden café table, a mug in the background." },
  { id: "otg-12", category: "on-the-go", name: "Wei L.", initials: "WL", context: "Bike commute, back-to-back calls · San Francisco", rating: 5, title: "Desk-day reset", body: "I ride in and go straight into calls. One of these in the office restroom and I can sit next to people again. It’s discreet enough that nobody knows.", verified: true, ageDays: 19, helpful: 23, photo: `${OTG}/handheld-06-office-break.webp`, photoAlt: "A hand holding a wipe at an office desk beside a laptop and a spiral notebook." },
  { id: "otg-14", category: "on-the-go", name: "Priya K.", initials: "PK", context: "Travels 40 weeks a year · NYC", rating: 5, title: "The hotel gym before checkout", body: "I fit in a quick workout with 20 minutes until checkout and my bag already zipped. One wipe, and I’m presentable for the airport.", verified: true, ageDays: 31, helpful: 19, photo: `${OTG}/handheld-07-hotel-gym.webp`, photoAlt: "A hand holding a wipe in a small hotel gym with a weight bench." },
  { id: "otg-16", category: "on-the-go", name: "Ravi S.", initials: "RS", context: "Commutes by train · London", rating: 5, title: "Six hours on a train", body: "Halfway through a long train ride I used one at my seat on my neck and hands. It cools things down and the scent fades fast, so my seatmate didn’t get a perfume hit.", verified: true, ageDays: 52, helpful: 15, photo: `${OTG}/handheld-08-travel-window.webp`, photoAlt: "Two hands holding a wipe by a train window, trees blurred outside." },
  { id: "otg-18", category: "on-the-go", name: "Jonas W.", initials: "JW", context: "CrossFit 4×/week · Berlin", rating: 4, title: "Soft, but not flimsy", body: "It holds up to a proper wipe-down without tearing. I’d take an even lighter scent, but it’s gone in a few minutes, so that’s a small complaint.", verified: true, ageDays: 104, helpful: 11, photo: `${OTG}/handheld-09-after-training.webp`, photoAlt: "A hand holding a wipe over a black gym bench next to a grey towel." },
  { id: "otg-20", category: "on-the-go", name: "Elena V.", initials: "EV", context: "Hot yoga · Miami", rating: 5, title: "After class, before brunch", body: "I go straight from the mat to brunch most Sundays. It does underarms and feet, my skin doesn’t feel tight after, and that’s the whole routine.", verified: true, ageDays: 118, helpful: 7, photo: `${OTG}/handheld-10-yoga-mat.webp`, photoAlt: "A hand holding a wipe in a sunny room, a rolled purple yoga mat behind." },

  // SPOTLESS
  { id: "sp-2", category: "spotless", name: "Jordan M.", initials: "JM", context: "Hot yoga, 4×/week · LA", rating: 5, title: "Saturated, in a good way", body: "The cloth is heavier than I expected and properly wet. It leaves a thin layer that dries down in a minute. It isn’t sticky, and it doesn’t pill on my skin.", verified: true, ageDays: 18, helpful: 49, photo: `${SP}/handheld-01-bathroom-sink.webp`, photoAlt: "A hand holding a wet wipe over a white bathroom basin." },
  { id: "sp-4", category: "spotless", name: "Maya R.", initials: "MR", context: "Swim team · San Diego", rating: 5, title: "Not tacky once it dries", body: "I was worried a leave-on would feel like sunscreen that never sets. It doesn’t. Two minutes later I can pull on a fitted top.", verified: true, ageDays: 40, helpful: 44, photo: `${SP}/handheld-02-vanity-mirror.webp`, photoAlt: "A hand holding a wipe at a bathroom vanity, a towel hanging behind." },
  { id: "sp-6", category: "spotless", name: "Lauren E.", initials: "LE", context: "Early riser · Minneapolis", rating: 5, title: "Thirty seconds in the morning", body: "I open one by the window while the kettle boils and sweep it across my shoulders. It’s the easiest part of my routine.", verified: true, ageDays: 24, helpful: 38, photo: `${SP}/handheld-03-window-routine.webp`, photoAlt: "A hand holding a wipe by a bright bathroom window over a white counter." },
  { id: "sp-8", category: "spotless", name: "Andre K.", initials: "AK", context: "Swims laps · Atlanta", rating: 5, title: "After rinsing off the chlorine", body: "Rinse, towel off, then this goes over my back and shoulders. It’s my last step before I get dressed in the pool changing room.", verified: true, ageDays: 84, helpful: 33, photo: `${SP}/handheld-04-shower-tile.webp`, photoAlt: "A hand holding a wipe against beige shower tiles, a towel hanging on the wall." },
  { id: "sp-10", category: "spotless", name: "Leila H.", initials: "LH", context: "Dancer · Chicago", rating: 5, title: "Straight after class", body: "I keep one in the studio cubby. After rehearsal I do one pass over the strip where my leotard sits, let it dry, and head home.", verified: true, ageDays: 70, helpful: 29, photo: `${SP}/handheld-05-yoga-studio.webp`, photoAlt: "A hand holding a wipe in a sunlit studio, a rolled lilac yoga mat on the shelf." },
  { id: "sp-12", category: "spotless", name: "Fatima Z.", initials: "FZ", context: "Runner · Dubai", rating: 4, title: "Shoulders and upper back in one go", body: "One cloth covers both shoulders and my upper back without running dry. There’s a mild tingle for the first few uses, which they warn you about.", verified: true, ageDays: 46, helpful: 25, photo: `${SP}/handheld-06-linen-shelf.webp`, photoAlt: "A hand holding a wipe in front of stacked white towels on a linen shelf." },
  { id: "sp-14", category: "spotless", name: "Tom W.", initials: "TW", context: "Backpack commuter · Seattle", rating: 5, title: "Night-time, by the dresser", body: "I use it after the evening shower and before bed, on the strip where my backpack straps sit all day. It doesn’t sting, dries fast, and leaves nothing on my sheets.", verified: true, ageDays: 55, helpful: 21, photo: `${SP}/handheld-07-bedroom-dresser.webp`, photoAlt: "A hand holding a wipe in a bedroom, a wooden dresser behind." },
  { id: "sp-16", category: "spotless", name: "Sam D.", initials: "SD", context: "Conference season · Las Vegas", rating: 5, title: "A whole week in hotel bathrooms", body: "I didn’t want to pack my usual body wash for a week of travel. This covered it, and it was easy to keep up every other night.", verified: true, ageDays: 90, helpful: 17, photo: `${SP}/handheld-08-hotel-bathroom.webp`, photoAlt: "A hand holding a wipe in a hotel bathroom over a marble basin." },
  { id: "sp-18", category: "spotless", name: "Paul A.", initials: "PA", context: "Sensitive skin · Melbourne", rating: 4, title: "A tingle at first, then nothing", body: "There was a light tingle the first two or three times, then nothing. I wear sunscreen on my shoulders now, as the box says, since they’re out all summer.", verified: true, ageDays: 66, helpful: 13, photo: `${SP}/handheld-09-close-skin-care.webp`, photoAlt: "A close view of a hand holding a wipe over a bathroom counter." },
  { id: "sp-20", category: "spotless", name: "Marco V.", initials: "MV", context: "Basketball league · Milan", rating: 5, title: "Easy to stay consistent", body: "The box sits in the bathroom with the lights low, and it’s the last thing I do before bed. It takes a few weeks to notice anything, which they’re upfront about.", verified: true, ageDays: 8, helpful: 9, photo: `${SP}/handheld-10-evening-bathroom.webp`, photoAlt: "A hand holding a wipe in a warmly lit bathroom, a towel on the rail behind." },

  // HER
  { id: "her-2", category: "her", name: "Mei L.", initials: "ML", context: "Sensitive skin · San Francisco", rating: 5, title: "Smooth cloth, no texture", body: "The cloth is soft and smooth, with no embossed pattern, which is exactly what I want here. Most feminine wipes burn for me. This one doesn’t.", verified: true, ageDays: 80, helpful: 47, photo: `${HER}/handheld-01-bedroom-window.webp`, photoAlt: "A hand holding a soft white wipe by a bedroom window with a floral pillow." },
  { id: "her-4", category: "her", name: "Olivia P.", initials: "OP", context: "Festival weekends · Nashville", rating: 5, title: "Wet without dripping", body: "I packed a few for a three-day festival. Each one is generously wet but doesn’t drip everywhere, and the wrapper tears open easily.", verified: true, ageDays: 95, helpful: 42, photo: `${HER}/handheld-02-weekend-packing.webp`, photoAlt: "A hand holding a wipe over a bed with folded clothes and a canvas bag." },
  { id: "her-6", category: "her", name: "Grace N.", initials: "GN", context: "Period bag · Brooklyn", rating: 5, title: "No sting, no scent", body: "Fragrance-free really means it here. There’s nothing on the cloth to smell, and no tingle afterward.", verified: true, ageDays: 27, helpful: 37, photo: `${HER}/handheld-03-bathroom-vanity.webp`, photoAlt: "A hand holding a wipe over a stone bathroom vanity next to folded towels." },
  { id: "her-8", category: "her", name: "Anika V.", initials: "AV", context: "Minimalist · Amsterdam", rating: 4, title: "Holds together", body: "It doesn’t pill or shred, even when I’m not gentle unwrapping it. I’d love a recyclable wrapper next.", verified: true, ageDays: 44, helpful: 32, photo: `${HER}/handheld-04-linen-cupboard.webp`, photoAlt: "A hand holding a wipe in front of a wooden shelf of folded towels." },
  { id: "her-10", category: "her", name: "Bianca F.", initials: "BF", context: "Layovers · Frankfurt", rating: 5, title: "Layover reset", body: "A four-hour layover, a quick stop in the restroom, and one of these. Then I feel ready for the next flight.", verified: true, ageDays: 58, helpful: 28, photo: `${HER}/handheld-05-travel-seat.webp`, photoAlt: "A hand holding a wipe by a row of airport seats, a runway visible through the window." },
  { id: "her-12", category: "her", name: "Sophie R.", initials: "SR", context: "Period nights · Leeds", rating: 5, title: "For the heavy days", body: "I keep a few in the bedside drawer for the heavy days, for a quick external refresh before bed. It’s gentle, and nothing I have to think about.", verified: true, ageDays: 14, helpful: 24, photo: `${HER}/handheld-06-bedside-table.webp`, photoAlt: "A hand holding a wipe in a dim bedroom, a lamp on the bedside table behind." },
  { id: "her-14", category: "her", name: "Hana Y.", initials: "HY", context: "Commutes by tram · Vienna", rating: 5, title: "Midday, mid-week", body: "One lives in the inside pocket of my work bag. I don’t reach for it every day, but on the days I do, I’m glad it’s there.", verified: true, ageDays: 49, helpful: 20, photo: `${HER}/handheld-07-work-bag.webp`, photoAlt: "A hand holding a wipe over an armchair beside a canvas work bag and a notebook." },
  { id: "her-16", category: "her", name: "Noor A.", initials: "NA", context: "Sensitive skin · Toronto", rating: 5, title: "When I need it, not every day", body: "I like that it’s positioned as occasional care, not something you’re supposed to need. It’s on my dresser for the days that call for it.", verified: true, ageDays: 102, helpful: 16, photo: `${HER}/handheld-08-home-dresser.webp`, photoAlt: "A hand holding a wipe beside a wooden dresser with a hairbrush on top." },
  { id: "her-18", category: "her", name: "Carmen J.", initials: "CJ", context: "Weekend walker · San Antonio", rating: 5, title: "After a long walk outside", body: "I walked for two hours on a warm day and sat on a park bench afterward. It’s cool and gentle, and nothing lingers.", verified: true, ageDays: 33, helpful: 12, photo: `${HER}/handheld-09-fresh-air.webp`, photoAlt: "A hand holding a wipe over a park bench with green shrubs behind." },
  { id: "her-20", category: "her", name: "Priya D.", initials: "PD", context: "Sensitive skin · Bengaluru", rating: 5, title: "Softer than I expected", body: "It feels closer to a soft cotton cloth than a wipe. It’s gentle, unscented, and goes straight in the bin afterward, never down the toilet.", verified: true, ageDays: 19, helpful: 8, photo: `${HER}/handheld-10-hand-towel.webp`, photoAlt: "A hand holding a wipe in a bathroom, a mirror and hand towel behind." },
];

/* ---------- Access ---------- */

// Layout content loads in development only; in production this returns null until real reviews exist.
export function getReviewData(): { reviews: ProductReview[]; summaries: Record<ReviewCategory, RatingSummary> } | null {
  if (process.env.NODE_ENV === "production") return null;
  return { reviews: layoutReviews, summaries: layoutSummaries };
}

export function getRatingSummary(product: CommerceProduct) {
  const category = getProductCategory(product);
  const data = getReviewData();
  if (!data || category === "wipelo") return { average: 0, count: 0 };
  const summary = data.summaries[category];
  return { average: summary.average, count: summary.count };
}
