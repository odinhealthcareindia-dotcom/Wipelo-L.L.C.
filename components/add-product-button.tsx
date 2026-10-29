"use client";

import { useStorefrontCart } from "@/components/storefront-provider";
import type { ShopifyVariant } from "@/lib/shopify";

export function AddProductButton({ variant, sellingPlanId, className = "btn btn-teal", children = "Add +" }: { variant: ShopifyVariant; sellingPlanId?: string; className?: string; children?: React.ReactNode }) {
  const { addToCart, busy } = useStorefrontCart();
  return <button type="button" className={className} disabled={busy || !variant.availableForSale} onClick={() => void addToCart(variant, sellingPlanId)}>{busy ? "Adding…" : variant.availableForSale ? children : "Sold out"}</button>;
}
