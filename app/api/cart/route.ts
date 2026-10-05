import { NextRequest, NextResponse } from "next/server";
import {
  addCartLines,
  createCart,
  getCart,
  isShopifyConfigured,
  removeCartLines,
  updateCartLines,
  type ShopifyCartLineInput,
} from "@/lib/shopify";

export const dynamic = "force-dynamic";

function responseError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function validateLines(value: unknown): ShopifyCartLineInput[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  const result: ShopifyCartLineInput[] = [];
  for (const item of value) {
    if (!item || typeof item.merchandiseId !== "string" || !item.merchandiseId.startsWith("gid://shopify/ProductVariant/")) return null;
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
    result.push({
      merchandiseId: item.merchandiseId,
      quantity,
      ...(typeof item.sellingPlanId === "string" && item.sellingPlanId.startsWith("gid://shopify/SellingPlan/")
        ? { sellingPlanId: item.sellingPlanId }
        : {}),
    });
  }
  return result;
}

function unwrap(result: unknown): { errors: string[] } | { cart: unknown } | null {
  if (!result || typeof result !== "object") return null;
  const mutation = Object.values(result as Record<string, { cart: unknown; userErrors: { message: string }[] }>)[0];
  if (!mutation) return null;
  const errors = mutation.userErrors?.map((error) => error.message) ?? [];
  if (errors.length) return { errors };
  return { cart: mutation.cart };
}

export async function GET(request: NextRequest) {
  if (!isShopifyConfigured()) return responseError("Shopify Storefront API credentials are not configured.", 503);
  const cartId = request.nextUrl.searchParams.get("cartId");
  if (!cartId) return responseError("A cart ID is required.");
  const cart = await getCart(cartId);
  return cart ? NextResponse.json({ cart }) : responseError("The Shopify cart could not be loaded.", 502);
}

export async function POST(request: NextRequest) {
  if (!isShopifyConfigured()) return responseError("Shopify Storefront API credentials are not configured.", 503);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return responseError("The request body must be JSON.");
  }

  const action = body.action;
  if (action === "create" || action === "add") {
    const lines = validateLines(body.lines);
    if (!lines) return responseError("Add at least one valid Shopify product variant.");
    if (action === "add" && (typeof body.cartId !== "string" || !body.cartId.startsWith("gid://shopify/Cart/"))) {
      return responseError("A valid Shopify cart ID is required.");
    }
    const result = action === "create" ? await createCart(lines) : await addCartLines(body.cartId as string, lines);
    const data = unwrap(result);
    if (!data) return responseError("Shopify could not update the cart. Check the Storefront API permissions and try again.", 502);
    if ("errors" in data) return NextResponse.json({ error: data.errors.join(" ") }, { status: 422 });
    return NextResponse.json({ cart: data.cart });
  }

  if (action === "update") {
    if (typeof body.cartId !== "string" || !Array.isArray(body.lines) || body.lines.length > 100) return responseError("A valid cart and line list are required.");
    const lines: { id: string; quantity: number }[] = [];
    for (const item of body.lines) {
      if (!item || typeof item.id !== "string" || !item.id.startsWith("gid://shopify/CartLine/")) return responseError("A valid Shopify cart line is required.");
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return responseError("Quantity must be between 1 and 99.");
      lines.push({ id: item.id, quantity });
    }
    const data = unwrap(await updateCartLines(body.cartId, lines));
    if (!data) return responseError("Shopify could not update the cart.", 502);
    if ("errors" in data) return NextResponse.json({ error: data.errors.join(" ") }, { status: 422 });
    return NextResponse.json({ cart: data.cart });
  }

  if (action === "remove") {
    if (typeof body.cartId !== "string" || !Array.isArray(body.lineIds) || body.lineIds.length < 1 || body.lineIds.length > 100) return responseError("A valid cart and line ID list are required.");
    const lineIds = body.lineIds;
    if (!lineIds.every((id) => typeof id === "string" && id.startsWith("gid://shopify/CartLine/"))) return responseError("A valid Shopify cart line is required.");
    const data = unwrap(await removeCartLines(body.cartId, lineIds as string[]));
    if (!data) return responseError("Shopify could not update the cart.", 502);
    if ("errors" in data) return NextResponse.json({ error: data.errors.join(" ") }, { status: 422 });
    return NextResponse.json({ cart: data.cart });
  }

  return responseError("Unknown cart action.");
}
