import { NextRequest, NextResponse } from "next/server";
import type { CartNotice, CartResponse } from "@/lib/cart-types";
import { addToCart, CartActionError, loadCart, runCartMutation, type CartActionResult } from "@/lib/server/cart/actions";
import { CartUnavailableError, createStorefrontCartGateway, toPublicCart, type CartLineInput } from "@/lib/server/cart/gateway";
import { MAX_LINE_QUANTITY } from "@/lib/server/cart/merge";
import { clientIp, isSameOrigin, noStore } from "@/lib/server/http";
import { isShopifyConfigured } from "@/lib/shopify";

export const dynamic = "force-dynamic";

const MAX_DISCOUNT_CODES = 5;

function failure(message: string, status: number, notices: CartNotice[] = []) {
  return noStore(NextResponse.json({ cart: null, error: message, notices } satisfies CartResponse, { status }));
}

const isCartId = (value: unknown): value is string => typeof value === "string" && value.startsWith("gid://shopify/Cart/") && value.length < 512;

function validateAddLines(value: unknown): CartLineInput[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  const result: CartLineInput[] = [];
  for (const item of value) {
    if (!item || typeof item.merchandiseId !== "string" || !item.merchandiseId.startsWith("gid://shopify/ProductVariant/")) return null;
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) return null;
    // A bad plan ID must fail: dropping it would quietly turn a subscription into a one-time purchase.
    if (item.sellingPlanId != null && (typeof item.sellingPlanId !== "string" || !item.sellingPlanId.startsWith("gid://shopify/SellingPlan/"))) return null;
    result.push({ merchandiseId: item.merchandiseId, quantity, ...(item.sellingPlanId ? { sellingPlanId: item.sellingPlanId } : {}) });
  }
  return result;
}

function validateUpdateLines(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  const lines: { id: string; quantity: number }[] = [];
  for (const item of value) {
    if (!item || typeof item.id !== "string" || !item.id.startsWith("gid://shopify/CartLine/")) return null;
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) return null;
    lines.push({ id: item.id, quantity });
  }
  return lines;
}

function validateLineIds(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  return value.every((id) => typeof id === "string" && id.startsWith("gid://shopify/CartLine/")) ? value as string[] : null;
}

function validateDiscountCodes(value: unknown) {
  if (!Array.isArray(value) || value.length > MAX_DISCOUNT_CODES) return null;
  const codes = value.map((code) => (typeof code === "string" ? code.trim() : ""));
  return codes.every((code) => code.length > 0 && code.length <= 64) ? [...new Set(codes)] : null;
}

// Cart IDs arrive in POST bodies rather than URLs, because the key inside them shouldn't land in access logs.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return failure("Invalid request origin.", 403);
  if (!isShopifyConfigured()) return failure("Shopify Storefront API credentials are not configured.", 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return failure("The request body must be JSON.", 400);
  }

  const gateway = createStorefrontCartGateway(clientIp(request));
  const { action } = body;
  const cartId = isCartId(body.cartId) ? body.cartId : null;
  if (body.cartId != null && !cartId) return failure("That isn't a valid cart.", 400);

  try {
    let result: CartActionResult;
    if (action === "add") {
      const lines = validateAddLines(body.lines);
      if (!lines) return failure("Add at least one valid product variant.", 400);
      result = await addToCart(gateway, cartId, lines);
    } else {
      if (!["load", "update", "remove", "discount"].includes(String(action))) return failure("Unknown cart action.", 400);
      if (!cartId) return failure("A valid cart is required.", 400);
      if (action === "load") {
        result = await loadCart(gateway, cartId);
      } else if (action === "update") {
        const lines = validateUpdateLines(body.lines);
        if (!lines) return failure(`Quantity must be between 1 and ${MAX_LINE_QUANTITY}.`, 400);
        result = await runCartMutation(() => gateway.updateLines(cartId, lines));
      } else if (action === "remove") {
        const lineIds = validateLineIds(body.lineIds);
        if (!lineIds) return failure("A valid cart line is required.", 400);
        result = await runCartMutation(() => gateway.removeLines(cartId, lineIds));
      } else {
        const codes = validateDiscountCodes(body.codes);
        if (!codes) return failure("Enter a valid discount code.", 400);
        result = await runCartMutation(() => gateway.updateDiscountCodes(cartId, codes));
      }
    }
    return noStore(NextResponse.json({ cart: toPublicCart(result.cart), notices: result.notices, gone: result.gone } satisfies CartResponse));
  } catch (error) {
    if (error instanceof CartActionError) return failure(error.message, 422);
    if (error instanceof CartUnavailableError) {
      // A mutation may or may not have landed, so it is never retried here. The client reloads the true cart.
      console.warn("Cart request failed:", error.message);
      return failure("We couldn't reach the store. Please try again.", 502);
    }
    throw error;
  }
}
