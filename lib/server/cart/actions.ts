import type { CartGateway, CartLineInput, CartMutationResult, FullCart } from "./gateway";
import type { CartNotice } from "@/lib/cart-types";

export const CART_GONE_NOTICE: CartNotice = { kind: "info", message: "Your previous cart is no longer available. It may have expired or already been checked out." };

export class CartActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartActionError";
  }
}

const describeErrors = (result: CartMutationResult) => result.userErrors.map((error) => error.message).join(" ");

// An invalid selling plan makes Shopify return success with nothing added, which would look like a working button.
function verifyAdded(lines: CartLineInput[], cart: FullCart) {
  for (const line of lines) {
    if (!cart.lines.nodes.some((node) => node.merchandise.id === line.merchandiseId && (node.sellingPlanAllocation?.sellingPlan.id ?? undefined) === line.sellingPlanId)) {
      throw new CartActionError("That option is no longer available. Please refresh and try again.");
    }
  }
}

export type CartActionResult = { cart: FullCart | null; notices: CartNotice[]; gone: boolean };

export async function addToCart(gateway: CartGateway, cartId: string | null, lines: CartLineInput[]): Promise<CartActionResult> {
  const notices: CartNotice[] = [];
  if (cartId) {
    const result = await gateway.addLines(cartId, lines);
    if (result.cart) {
      if (result.userErrors.length) throw new CartActionError(describeErrors(result));
      verifyAdded(lines, result.cart);
      return { cart: result.cart, notices, gone: false };
    }
    // Shopify no longer has this cart, so start a new one with the same items.
    notices.push(CART_GONE_NOTICE);
  }
  const created = await gateway.create({ lines });
  if (!created.cart || created.userErrors.length) throw new CartActionError(describeErrors(created) || "We couldn't update your cart.");
  verifyAdded(lines, created.cart);
  return { cart: created.cart, notices, gone: false };
}

export async function runCartMutation(run: () => Promise<CartMutationResult>): Promise<CartActionResult> {
  const result = await run();
  if (!result.cart) return { cart: null, notices: [CART_GONE_NOTICE], gone: true };
  if (result.userErrors.length) throw new CartActionError(describeErrors(result));
  const notices = result.cart.discountCodes.filter((item) => !item.applicable).map((item) => ({ kind: "warning" as const, message: `Discount code ${item.code} can't be applied to this cart.` }));
  return { cart: result.cart, notices, gone: false };
}

export async function loadCart(gateway: CartGateway, cartId: string): Promise<CartActionResult> {
  const cart = await gateway.load(cartId);
  return cart ? { cart, notices: [], gone: false } : { cart: null, notices: [CART_GONE_NOTICE], gone: true };
}
