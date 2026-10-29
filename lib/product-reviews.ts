import type { CommerceProduct } from "@/lib/commerce";
import { getProductCategory, type ProductCategory } from "@/lib/product-profiles";

export type ProductReview = { name: string; rating: number; title: string; body: string; verified: boolean; date: string };

export const categoryProductLabel: Record<ProductCategory, string> = {
  "on-the-go": "ON THE GO",
  spotless: "SPOTLESS",
  her: "HER",
  wipelo: "Wipelo",
};

// Only verified-purchase reviews, published without editing the customer's words. None exist yet,
// so every list is empty and the PDP hides its reviews section until real ones are added here.
const approvedReviews: Record<ProductCategory, ProductReview[]> = {
  "on-the-go": [],
  spotless: [],
  her: [],
  wipelo: [],
};

export function getApprovedReviews(category: ProductCategory): ProductReview[] {
  return approvedReviews[category];
}

export function getRatingSummary(product: CommerceProduct) {
  const reviews = getApprovedReviews(getProductCategory(product));
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  return { average, count: reviews.length };
}
