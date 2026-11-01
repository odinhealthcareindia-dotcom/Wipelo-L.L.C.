import type { ShopifyImage, ShopifyMoney, ShopifySellingPlan } from "@/lib/shopify";

// What the browser keeps of a cart. Everything here is display-only: Shopify recalculates on every change.
export type PublicCartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: ShopifyMoney };
  merchandise: { id: string; title: string; image: ShopifyImage | null; price: ShopifyMoney; product: { title: string; handle: string } };
  sellingPlanAllocation?: { sellingPlan: Pick<ShopifySellingPlan, "id" | "name" | "recurringDeliveries" | "options"> } | null;
};
export type PublicCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney };
  lines: { nodes: PublicCartLine[] };
  discountCodes: { code: string; applicable: boolean }[];
};
export type CartNotice = { kind: "info" | "warning"; message: string };
// `gone` means Shopify no longer has the requested cart (expired or checked out), so the browser should forget its ID.
export type CartResponse = { cart: PublicCart | null; notices: CartNotice[]; gone?: boolean; error?: string };
// `owner` is an opaque hash, used to spot a cart ID left in this browser by a different customer.
export type AccountSession = { enabled: boolean; signedIn: boolean; owner: string | null };
