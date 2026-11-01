import "server-only";
import { canReadSellingPlans, storefrontRequest } from "@/lib/shopify";
import type { PublicCart, PublicCartLine } from "@/lib/cart-types";

export type CartLineInput = { merchandiseId: string; quantity: number; sellingPlanId?: string; attributes?: { key: string; value: string }[] };
export type CartCreateInput = { lines: CartLineInput[]; note?: string; attributes?: { key: string; value: string }[]; discountCodes?: string[]; customerAccessToken?: string };

export type FullCartLine = PublicCartLine & { attributes: { key: string; value: string }[]; merchandise: PublicCartLine["merchandise"] & { availableForSale: boolean } };
export type FullCart = Omit<PublicCart, "lines"> & { note: string | null; updatedAt: string; attributes: { key: string; value: string }[]; lines: { nodes: FullCartLine[] } };

export type CartUserError = { code: string | null; field: string[] | null; message: string };
export type CartWarning = { code: string; message: string };
export type CartMutationResult = { cart: FullCart | null; userErrors: CartUserError[]; warnings: CartWarning[] };

export class CartUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartUnavailableError";
  }
}

export interface CartGateway {
  // Null means Shopify says the cart is gone (expired or checked out). Outages throw instead, so a blip never discards a cart.
  load(cartId: string): Promise<FullCart | null>;
  create(input: CartCreateInput): Promise<CartMutationResult>;
  addLines(cartId: string, lines: CartLineInput[]): Promise<CartMutationResult>;
  updateLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<CartMutationResult>;
  removeLines(cartId: string, lineIds: string[]): Promise<CartMutationResult>;
  updateDiscountCodes(cartId: string, codes: string[]): Promise<CartMutationResult>;
  updateBuyerIdentity(cartId: string, customerAccessToken: string): Promise<CartMutationResult>;
  // A merge rebuilt without plan data would turn subscriptions into one-time lines.
  canSeeSellingPlans(): Promise<boolean>;
}

const IMAGE_FIELDS = "url altText width height";
const CART_FIELDS = `
  id checkoutUrl totalQuantity note updatedAt
  attributes { key value }
  discountCodes { code applicable }
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id quantity attributes { key value } cost { totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id title availableForSale image { ${IMAGE_FIELDS} } price { amount currencyCode }
          product { title handle }
        }
      }
      sellingPlanAllocation @include(if: $sellingPlans) { sellingPlan { id name recurringDeliveries options { name value } } }
    }
  }
`;
const PAYLOAD = `cart { ${CART_FIELDS} } userErrors { code field message } warnings { code message }`;

export const CART_OPERATIONS = {
  load: `query WipeloCart($id: ID!, $sellingPlans: Boolean!) { cart(id: $id) { ${CART_FIELDS} } }`,
  create: `mutation WipeloCartCreate($input: CartInput!, $sellingPlans: Boolean!) { cartCreate(input: $input) { ${PAYLOAD} } }`,
  addLines: `mutation WipeloCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $sellingPlans: Boolean!) { cartLinesAdd(cartId: $cartId, lines: $lines) { ${PAYLOAD} } }`,
  updateLines: `mutation WipeloCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $sellingPlans: Boolean!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { ${PAYLOAD} } }`,
  removeLines: `mutation WipeloCartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $sellingPlans: Boolean!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { ${PAYLOAD} } }`,
  discountCodes: `mutation WipeloCartDiscountCodes($cartId: ID!, $discountCodes: [String!]!, $sellingPlans: Boolean!) { cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { ${PAYLOAD} } }`,
  buyerIdentity: `mutation WipeloCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!, $sellingPlans: Boolean!) { cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) { ${PAYLOAD} } }`,
};

export function toPublicCart(cart: FullCart | null): PublicCart | null {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: cart.cost,
    discountCodes: cart.discountCodes,
    lines: { nodes: cart.lines.nodes.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      cost: line.cost,
      merchandise: { id: line.merchandise.id, title: line.merchandise.title, image: line.merchandise.image, price: line.merchandise.price, product: line.merchandise.product },
      sellingPlanAllocation: line.sellingPlanAllocation ?? null,
    })) },
  };
}

export function createStorefrontCartGateway(buyerIp: string | null): CartGateway {
  // Required on server-side calls to keep the logged-in checkout experience.
  const headers: Record<string, string> = buyerIp ? { "Shopify-Storefront-Buyer-IP": buyerIp } : {};

  async function request<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    let payload;
    try {
      payload = await storefrontRequest<T>(query, { ...variables, sellingPlans: await canReadSellingPlans() }, "no-store", headers);
    } catch (error) {
      throw new CartUnavailableError(error instanceof Error ? error.name : "Shopify request failed");
    }
    if (payload.errors?.length) throw new CartUnavailableError(payload.errors.map((error) => error.message).join("; "));
    if (!payload.data) throw new CartUnavailableError("Shopify returned no data.");
    return payload.data;
  }

  async function mutate(query: string, field: string, variables: Record<string, unknown>) {
    const data = await request<Record<string, CartMutationResult>>(query, variables);
    return data[field];
  }

  return {
    async load(cartId) {
      // Reads are idempotent, so a transient failure gets one retry. Mutations never do.
      try {
        return (await request<{ cart: FullCart | null }>(CART_OPERATIONS.load, { id: cartId })).cart;
      } catch {
        return (await request<{ cart: FullCart | null }>(CART_OPERATIONS.load, { id: cartId })).cart;
      }
    },
    create({ customerAccessToken, ...input }) {
      return mutate(CART_OPERATIONS.create, "cartCreate", { input: { ...input, ...(customerAccessToken ? { buyerIdentity: { customerAccessToken } } : {}) } });
    },
    addLines: (cartId, lines) => mutate(CART_OPERATIONS.addLines, "cartLinesAdd", { cartId, lines }),
    updateLines: (cartId, lines) => mutate(CART_OPERATIONS.updateLines, "cartLinesUpdate", { cartId, lines }),
    removeLines: (cartId, lineIds) => mutate(CART_OPERATIONS.removeLines, "cartLinesRemove", { cartId, lineIds }),
    updateDiscountCodes: (cartId, discountCodes) => mutate(CART_OPERATIONS.discountCodes, "cartDiscountCodesUpdate", { cartId, discountCodes }),
    updateBuyerIdentity: (cartId, customerAccessToken) => mutate(CART_OPERATIONS.buyerIdentity, "cartBuyerIdentityUpdate", { cartId, buyerIdentity: { customerAccessToken } }),
    canSeeSellingPlans: canReadSellingPlans,
  };
}
