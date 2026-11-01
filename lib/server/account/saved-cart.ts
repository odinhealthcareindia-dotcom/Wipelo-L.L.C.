import type { FullCart } from "@/lib/server/cart/gateway";

export const SAVED_CART_METAFIELDS = { namespace: "custom", cartIdKey: "cart_id", snapshotKey: "cart_snapshot" } as const;

export const SAVED_CART_OPERATIONS = {
  read: `query WipeloSavedCart {
    customer {
      id
      cartId: metafield(namespace: "custom", key: "cart_id") { value compareDigest }
    }
  }`,
  customerId: `query WipeloCustomerId { customer { id } }`,
  set: `mutation WipeloSavedCartSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) { userErrors { code field message } }
  }`,
  clear: `mutation WipeloSavedCartClear($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) { userErrors { field message } }
  }`,
};

export type CartSnapshot =
  | { status: "active"; updatedAt: string; itemCount: number; subtotal: string; items: { product: string; variant: string; quantity: number; lineTotal: string; plan?: string }[] }
  | { status: "empty"; updatedAt: string };

const money = ({ amount, currencyCode }: { amount: string; currencyCode: string }) => `${Number(amount).toFixed(2)} ${currencyCode}`;

// A readable copy of the cart for the team, on the customer page in Shopify admin.
export function buildCartSnapshot(cart: FullCart | null, now = new Date()): CartSnapshot {
  if (!cart?.lines.nodes.length) return { status: "empty", updatedAt: cart?.updatedAt ?? now.toISOString() };
  return {
    status: "active",
    updatedAt: cart.updatedAt,
    itemCount: cart.totalQuantity,
    subtotal: money(cart.cost.subtotalAmount),
    items: cart.lines.nodes.map((line) => ({
      product: line.merchandise.product.title,
      variant: line.merchandise.title,
      quantity: line.quantity,
      lineTotal: money(line.cost.totalAmount),
      ...(line.sellingPlanAllocation ? { plan: line.sellingPlanAllocation.sellingPlan.name } : {}),
    })),
  };
}

export type SavedCart = { customerId: string; cartId: string | null; digest: string | null; available: boolean };
export type SaveResult = "ok" | "conflict" | "unavailable";

export interface SavedCartStore {
  read(): Promise<SavedCart>;
  // Writes both metafields together, succeeding only if the saved cart is still the one read as `digest`.
  write(input: { customerId: string; cart: FullCart; digest: string | null }): Promise<SaveResult>;
  clear(customerId: string): Promise<void>;
}

type Query = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>;
type ReadData = { customer: { id: string; cartId: { value: string; compareDigest: string } | null } };

// Missing metafield definitions or permissions never stop anyone shopping: carts and checkout keep working, only the sync is off.
export function createSavedCartStore(query: Query): SavedCartStore {
  return {
    async read() {
      try {
        const { customer } = await query<ReadData>(SAVED_CART_OPERATIONS.read);
        return { customerId: customer.id, cartId: customer.cartId?.value || null, digest: customer.cartId?.compareDigest ?? null, available: true };
      } catch (error) {
        console.warn("Saved cart metafield unavailable (read):", error instanceof Error ? error.message : "unknown");
        const { customer } = await query<{ customer: { id: string } }>(SAVED_CART_OPERATIONS.customerId);
        return { customerId: customer.id, cartId: null, digest: null, available: false };
      }
    },
    async write({ customerId, cart, digest }) {
      const { namespace, cartIdKey, snapshotKey } = SAVED_CART_METAFIELDS;
      try {
        const { metafieldsSet } = await query<{ metafieldsSet: { userErrors: { code: string | null; message: string }[] } }>(SAVED_CART_OPERATIONS.set, {
          metafields: [
            { ownerId: customerId, namespace, key: cartIdKey, type: "single_line_text_field", value: cart.id, compareDigest: digest },
            { ownerId: customerId, namespace, key: snapshotKey, type: "json", value: JSON.stringify(buildCartSnapshot(cart)) },
          ],
        });
        if (metafieldsSet.userErrors.some((error) => error.code === "INVALID_COMPARE_DIGEST" || error.code === "STALE_OBJECT")) return "conflict";
        if (!metafieldsSet.userErrors.length) return "ok";
        console.warn("Saved cart metafield unavailable (write):", metafieldsSet.userErrors.map((error) => error.code ?? error.message).join(","));
      } catch (error) {
        console.warn("Saved cart metafield unavailable (write):", error instanceof Error ? error.message : "unknown");
      }
      return "unavailable";
    },
    async clear(customerId) {
      const { namespace, cartIdKey, snapshotKey } = SAVED_CART_METAFIELDS;
      try {
        await query(SAVED_CART_OPERATIONS.clear, { metafields: [{ ownerId: customerId, namespace, key: cartIdKey }, { ownerId: customerId, namespace, key: snapshotKey }] });
      } catch (error) {
        console.warn("Saved cart metafield unavailable (clear):", error instanceof Error ? error.message : "unknown");
      }
    },
  };
}
