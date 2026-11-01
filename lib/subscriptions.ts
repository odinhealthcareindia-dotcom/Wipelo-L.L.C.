import type { ShopifyPlanAllocation, ShopifyProduct, ShopifySellingPlan, ShopifyVariant } from "@/lib/shopify";

// Everything here derives from live Shopify plans, so editing a plan in Shopify updates the storefront.
const UNIT_DAYS: Record<string, number> = { day: 1, week: 7, month: 30, year: 365 };

type PlanText = Pick<ShopifySellingPlan, "name" | "options">;

function planCadence(plan: PlanText) {
  const text = [...plan.options.map((option) => option.value ?? ""), plan.name].join(" ");
  const counted = text.match(/(\d+)[\s-]*(day|week|month|year)s?\b/i);
  if (counted) return { count: Number(counted[1]), unit: counted[2].toLowerCase() };
  const single = text.match(/\b(?:every|each)\s+(day|week|month|year)\b/i);
  return single ? { count: 1, unit: single[1].toLowerCase() } : null;
}

// "Every 4 weeks", or the plan's own name if it states no cadence.
export function deliveryLabel(plan: PlanText) {
  const cadence = planCadence(plan);
  if (!cadence) return plan.name;
  return cadence.count === 1 ? `Every ${cadence.unit}` : `Every ${cadence.count} ${cadence.unit}s`;
}

// Recurring plans only, shortest cadence first. Pre-order and try-before-you-buy plans are not subscriptions.
export function subscriptionAllocations(variant: ShopifyVariant) {
  const days = ({ sellingPlan }: ShopifyPlanAllocation) => {
    const cadence = planCadence(sellingPlan);
    return cadence ? cadence.count * UNIT_DAYS[cadence.unit] : Infinity;
  };
  return variant.sellingPlanAllocations
    .filter((allocation) => allocation.sellingPlan.recurringDeliveries)
    .sort((a, b) => days(a) - days(b));
}

export function planSavingsPercent(variant: ShopifyVariant, allocation: ShopifyPlanAllocation) {
  const price = Number(variant.price.amount);
  return price > 0 ? Math.round((1 - Number(allocation.checkoutChargeAmount.amount) / price) * 100) : 0;
}

export function maxPlanSavingsPercent(product: ShopifyProduct) {
  return Math.max(0, ...product.variants.flatMap((variant) => subscriptionAllocations(variant).map((allocation) => planSavingsPercent(variant, allocation))));
}
