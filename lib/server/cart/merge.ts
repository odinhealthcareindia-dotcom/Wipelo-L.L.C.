import { sha256 } from "@/lib/server/crypto";
import type { SavedCartStore } from "@/lib/server/account/saved-cart";
import type { CartNotice } from "@/lib/cart-types";
import { CART_GONE_NOTICE } from "./actions";
import type { CartGateway, CartLineInput, CartMutationResult, FullCart, FullCartLine } from "./gateway";

export const MAX_LINE_QUANTITY = 99;
const MAX_COMMIT_ATTEMPTS = 3;
// The leading underscore keeps it out of Shopify's checkout UI. It holds hashes only, never cart IDs or keys.
export const MERGE_MARKER = "_wipelo_merged";

export class CartMergeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartMergeError";
  }
}

// Same merchandise, plan and attributes are one line. Anything else is a distinct configuration.
export function lineKey(line: { merchandiseId: string; sellingPlanId?: string; attributes?: { key: string; value: string }[] }) {
  const attributes = [...(line.attributes ?? [])].sort((a, b) => a.key.localeCompare(b.key)).map(({ key, value }) => [key, value]);
  return JSON.stringify([line.merchandiseId, line.sellingPlanId ?? null, attributes]);
}

function toInput(line: FullCartLine): CartLineInput {
  return {
    merchandiseId: line.merchandise.id,
    quantity: line.quantity,
    ...(line.sellingPlanAllocation ? { sellingPlanId: line.sellingPlanAllocation.sellingPlan.id } : {}),
    ...(line.attributes.length ? { attributes: line.attributes } : {}),
  };
}

const lineTitle = (line: FullCartLine) => `${line.merchandise.product.title} (${line.merchandise.title})`;

export type MergePlan = { lines: CartLineInput[]; titles: Map<string, string>; note?: string; attributes: { key: string; value: string }[]; discountCodes: string[]; notices: CartNotice[] };

// Pure combination of two carts. Prices are deliberately absent: Shopify recalculates everything on the new cart.
export function planMerge(destination: FullCart, source: FullCart): MergePlan {
  const merged = new Map<string, CartLineInput>();
  const titles = new Map<string, string>();
  const notices: CartNotice[] = [];

  for (const line of [...destination.lines.nodes, ...source.lines.nodes]) {
    const input = toInput(line);
    const key = lineKey(input);
    titles.set(key, lineTitle(line));
    if (!line.merchandise.availableForSale) {
      if (!merged.has(key)) notices.push({ kind: "warning", message: `${lineTitle(line)} is no longer available, so it wasn't kept in your cart.` });
      merged.set(key, { ...input, quantity: 0 });
      continue;
    }
    const existing = merged.get(key);
    merged.set(key, { ...input, quantity: (existing?.quantity ?? 0) + input.quantity });
  }

  const lines: CartLineInput[] = [];
  for (const [key, line] of merged) {
    if (line.quantity <= 0) continue;
    if (line.quantity > MAX_LINE_QUANTITY) notices.push({ kind: "warning", message: `${titles.get(key)} is limited to ${MAX_LINE_QUANTITY} per order, so we adjusted the quantity.` });
    lines.push({ ...line, quantity: Math.min(line.quantity, MAX_LINE_QUANTITY) });
  }

  // The account cart wins conflicts over a note or attribute, because it is the older, deliberate one.
  const attributes = new Map([...source.attributes, ...destination.attributes].map(({ key, value }) => [key, value]));
  const discountCodes = [...new Set([...destination.discountCodes, ...source.discountCodes].filter((code) => code.applicable).map((code) => code.code))];
  return {
    lines,
    titles,
    ...((destination.note || source.note) ? { note: destination.note || source.note || undefined } : {}),
    attributes: [...attributes].map(([key, value]) => ({ key, value })),
    discountCodes,
    notices,
  };
}

// Shopify rejects the whole cartCreate for one bad variant, so drop just that line and try again.
async function createWithRecovery(gateway: CartGateway, plan: MergePlan, customerAccessToken: string | null) {
  const lines = [...plan.lines];
  const notices = [...plan.notices];
  let useIdentity = Boolean(customerAccessToken);
  for (let attempt = 0; attempt <= plan.lines.length + 1; attempt += 1) {
    const result: CartMutationResult = await gateway.create({
      lines,
      ...(plan.note ? { note: plan.note } : {}),
      ...(plan.attributes.length ? { attributes: plan.attributes } : {}),
      ...(plan.discountCodes.length ? { discountCodes: plan.discountCodes } : {}),
      ...(useIdentity && customerAccessToken ? { customerAccessToken } : {}),
    });
    if (result.cart && !result.userErrors.length) return { cart: result.cart, lines, notices, warnings: result.warnings };

    // Attaching the customer is re-attempted at checkout, so it must not cost the shopper their merged cart.
    if (useIdentity && result.userErrors.some((error) => error.field?.includes("customerAccessToken") || error.field?.includes("buyerIdentity"))) {
      useIdentity = false;
      continue;
    }
    const badIndex = result.userErrors
      .map((error) => error.field?.includes("lines") ? Number(error.field[error.field.indexOf("lines") + 1]) : NaN)
      .find((index) => Number.isInteger(index) && index >= 0 && index < lines.length);
    if (badIndex === undefined) throw new CartMergeError(`cartCreate failed: ${result.userErrors.map((error) => error.code ?? "UNKNOWN").join(",") || "no cart returned"}`);
    const [removed] = lines.splice(badIndex, 1);
    notices.push({ kind: "warning", message: `${plan.titles.get(lineKey(removed)) ?? "An item"} is no longer available, so it wasn't kept in your cart.` });
  }
  throw new CartMergeError("cartCreate kept failing after removing invalid lines.");
}

// Shopify can quietly return less than requested (an invalid selling plan yields an empty line and no error),
// so the outcome is compared with the request rather than assumed.
export function reportOutcome(requested: CartLineInput[], titles: Map<string, string>, cart: FullCart): CartNotice[] {
  const actual = new Map(cart.lines.nodes.map((line) => [lineKey(toInput(line)), line.quantity]));
  const notices: CartNotice[] = [];
  for (const line of requested) {
    const key = lineKey(line);
    const quantity = actual.get(key) ?? 0;
    const title = titles.get(key) ?? "An item";
    if (quantity === 0) notices.push({ kind: "warning", message: `${title} is no longer available, so it wasn't kept in your cart.` });
    else if (quantity < line.quantity) notices.push({ kind: "warning", message: `Only ${quantity} of ${title} could be kept in your cart.` });
  }
  return notices;
}

export type SyncResult = { cart: FullCart | null; notices: CartNotice[]; saved: boolean; attached: boolean };
export type SyncDeps = { gateway: CartGateway; saved: SavedCartStore };

const MAX_MERGE_MARKERS = 10;

const cartHash = (cartId: string) => sha256(cartId.split("?")[0]).slice(0, 16);

function mergedInto(cart: FullCart) {
  return (cart.attributes.find((attribute) => attribute.key === MERGE_MARKER)?.value ?? "").split(",").filter(Boolean);
}

async function attachCustomer(gateway: CartGateway, cart: FullCart, token: string | null) {
  if (!token) return { cart, attached: false };
  const result = await gateway.updateBuyerIdentity(cart.id, token);
  if (result.cart && !result.userErrors.length) return { cart: result.cart, attached: true };
  console.warn("Could not attach customer to cart; will retry later:", result.userErrors.map((error) => error.code).join(","));
  return { cart, attached: false };
}

// Brings this browser's cart and the customer's saved cart together. Safe to call repeatedly and concurrently:
// - The combined cart is a brand-new Shopify cart, so a crash midway leaves both originals untouched.
// - It records the carts it was built from in a hidden attribute, in the same mutation that creates it, so a replay
//   or retry can see the work is already done, even if the browser never heard the answer.
// - The save is a compare-and-swap on the metafield's digest: losing a race discards the new cart and starts again
//   from the winner, so neither device's items are dropped or counted twice.
// Throws with nothing changed if Shopify can't be reached. The browser keeps its cart and tries again next time.
export async function syncAccountCart(deps: SyncDeps, input: { localCartId: string | null; customerAccessToken: string | null }): Promise<SyncResult> {
  const { gateway, saved: store } = deps;

  for (let attempt = 0; attempt < MAX_COMMIT_ATTEMPTS; attempt += 1) {
    const saved = await store.read();
    const destination = saved.cartId ? await gateway.load(saved.cartId) : null;
    const source = input.localCartId && input.localCartId !== saved.cartId ? await gateway.load(input.localCartId) : null;
    const hasLines = (cart: FullCart | null): cart is FullCart => Boolean(cart?.lines.nodes.length);

    const keep = async (cart: FullCart, notices: CartNotice[]): Promise<SyncResult | null> => {
      const { cart: current, attached } = await attachCustomer(gateway, cart, input.customerAccessToken);
      if (!saved.available) return { cart: current, notices, saved: false, attached };
      const result = await store.write({ customerId: saved.customerId, cart: current, digest: saved.digest });
      // Keeping the cart that's already saved only refreshes the snapshot, so losing that race changes nothing that matters.
      if (result === "conflict") return cart.id === saved.cartId ? { cart: current, notices, saved: true, attached } : null;
      return { cart: current, notices, saved: result === "ok", attached };
    };

    let outcome: SyncResult | null;
    if (!hasLines(source)) {
      if (destination) {
        outcome = await keep(destination, []);
      } else {
        if (saved.cartId) await store.clear(saved.customerId);
        const gone = saved.cartId || (input.localCartId && !source);
        return { cart: source, notices: gone ? [CART_GONE_NOTICE] : [], saved: saved.available, attached: false };
      }
    } else if (!hasLines(destination)) {
      outcome = await keep(source, [{ kind: "info", message: "Your cart is now saved to your account." }]);
    } else if (mergedInto(destination).includes(cartHash(source.id))) {
      // Already folded in: a replay, a second tab, or another device got here first.
      outcome = await keep(destination, []);
    } else if (mergedInto(source).includes(cartHash(destination.id))) {
      // This browser holds a merge whose save never landed, so finish saving it rather than merging again.
      outcome = await keep(source, []);
    } else {
      if (!(await gateway.canSeeSellingPlans())) throw new CartMergeError("Selling plans aren't readable, so a merge could lose subscriptions.");
      const plan = planMerge(destination, source);
      const markers = [...new Set([...mergedInto(destination), ...mergedInto(source), cartHash(destination.id), cartHash(source.id)])].slice(-MAX_MERGE_MARKERS);
      plan.attributes = [...plan.attributes.filter((attribute) => attribute.key !== MERGE_MARKER), { key: MERGE_MARKER, value: markers.join(",") }];
      const created = await createWithRecovery(gateway, plan, input.customerAccessToken);
      const rejectedDiscounts = created.cart.discountCodes.filter((code) => !code.applicable).map((code) => code.code);
      outcome = await keep(created.cart, [
        { kind: "info", message: "We added the items from this visit to your saved cart." },
        ...created.notices,
        ...reportOutcome(created.lines, plan.titles, created.cart),
        ...rejectedDiscounts.map((code) => ({ kind: "warning" as const, message: `Discount code ${code} no longer applies to your cart.` })),
      ]);
    }
    if (outcome) return outcome;
  }
  throw new CartMergeError("Could not save the merged cart after repeated conflicts.");
}
