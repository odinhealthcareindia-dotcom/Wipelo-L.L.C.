import type { SavedCart, SaveResult, SavedCartStore } from "../../lib/server/account/saved-cart";
import type { CartGateway, CartLineInput, CartMutationResult, FullCart } from "../../lib/server/cart/gateway";
import { createSealer } from "../../lib/server/crypto";

export const sealer = createSealer(Buffer.alloc(32, 1).toString("base64"));

// Behaves like metafieldsSet with compareDigest: a write based on an old read is refused.
export class FakeSavedCart implements SavedCartStore {
  cartId: string | null = null;
  snapshot: FullCart | null = null;
  version = 0;
  available = true;
  writeResult: SaveResult | null = null;
  writes = 0;

  async read(): Promise<SavedCart> {
    if (!this.available) return { customerId: "gid://shopify/Customer/1", cartId: null, digest: null, available: false };
    return { customerId: "gid://shopify/Customer/1", cartId: this.cartId, digest: this.cartId ? `v${this.version}` : null, available: true };
  }

  async write({ cart, digest }: { customerId: string; cart: FullCart; digest: string | null }): Promise<SaveResult> {
    if (this.writeResult) return this.writeResult;
    const current = this.cartId ? `v${this.version}` : null;
    if (current !== digest) return "conflict";
    this.writes += 1;
    this.version += 1;
    this.cartId = cart.id;
    this.snapshot = cart;
    return "ok";
  }

  async clear() {
    this.cartId = null;
    this.snapshot = null;
    this.version += 1;
  }
}

let unique = 0;
export const uniqueId = (prefix: string) => `${prefix}-${process.pid}-${Date.now()}-${unique++}`;

type StoredLine = CartLineInput;
type StoredCart = { id: string; lines: StoredLine[]; note?: string; attributes: { key: string; value: string }[]; discountCodes: string[]; customerToken?: string };

// Follows the rules observed on a real store: identical lines combine, unknown plans silently add nothing,
// unknown variants fail the whole mutation, and retired carts read as null.
export class FakeCartGateway implements CartGateway {
  carts = new Map<string, StoredCart>();
  unavailableVariants = new Set<string>();
  missingVariants = new Set<string>();
  invalidCustomerTokens = new Set<string>();
  plansVisible = true;
  failCreates = 0;
  failLoads = 0;
  createCalls = 0;
  private seq = 0;
  private barrierSize = 0;
  private barrierWaiting: (() => void)[] = [];

  // Holds every caller of the next cart creations until `size` have arrived. Without this, a fast local database
  // lets the first merge finish before the others start, and a "concurrent" test exercises no contention at all.
  holdCreatesUntil(size: number) {
    this.barrierSize = size;
    this.barrierWaiting = [];
  }

  private async passBarrier() {
    if (!this.barrierSize) return;
    if (this.barrierWaiting.length + 1 >= this.barrierSize) {
      this.barrierSize = 0;
      this.barrierWaiting.forEach((release) => release());
      this.barrierWaiting = [];
      return;
    }
    await new Promise<void>((resolve) => this.barrierWaiting.push(resolve));
  }

  seed(lines: StoredLine[], extra: Partial<StoredCart> = {}) {
    const id = `gid://shopify/Cart/${uniqueId("c")}?key=secret`;
    const cart: StoredCart = { id, lines: [], attributes: [], discountCodes: [], ...extra };
    this.add(cart, lines);
    this.carts.set(id, cart);
    return id;
  }

  private add(cart: StoredCart, lines: StoredLine[]) {
    for (const line of lines) {
      if (line.sellingPlanId?.endsWith("/invalid")) continue;
      const key = (item: StoredLine) => JSON.stringify([item.merchandiseId, item.sellingPlanId ?? null, item.attributes ?? []]);
      const existing = cart.lines.find((item) => key(item) === key(line));
      if (existing) existing.quantity += line.quantity;
      else cart.lines.push({ ...line });
    }
  }

  view(cart: StoredCart): FullCart {
    const nodes = cart.lines.map((line, index) => ({
      id: `gid://shopify/CartLine/${index}?cart=x`,
      quantity: line.quantity,
      attributes: line.attributes ?? [],
      cost: { totalAmount: { amount: "1.00", currencyCode: "USD" } },
      merchandise: { id: line.merchandiseId, title: "1 pack", availableForSale: !this.unavailableVariants.has(line.merchandiseId), image: null, price: { amount: "1.00", currencyCode: "USD" }, product: { title: "Wipe", handle: "wipe" } },
      sellingPlanAllocation: line.sellingPlanId ? { sellingPlan: { id: line.sellingPlanId, name: "Plan", recurringDeliveries: true, options: [] } } : null,
    }));
    return {
      id: cart.id,
      checkoutUrl: `https://checkout.example/${encodeURIComponent(cart.id)}`,
      note: cart.note ?? null,
      updatedAt: "2026-11-01T00:00:00Z",
      attributes: cart.attributes,
      totalQuantity: nodes.reduce((sum, line) => sum + line.quantity, 0),
      discountCodes: cart.discountCodes.map((code) => ({ code, applicable: code !== "BAD" })),
      cost: { subtotalAmount: { amount: "1.00", currencyCode: "USD" }, totalAmount: { amount: "1.00", currencyCode: "USD" } },
      lines: { nodes },
    };
  }

  private result(cart: StoredCart | undefined): CartMutationResult {
    return { cart: cart ? this.view(cart) : null, userErrors: cart ? [] : [{ code: "INVALID", field: ["cartId"], message: "The specified cart does not exist." }], warnings: [] };
  }

  async load(id: string) {
    if (this.failLoads > 0) {
      this.failLoads -= 1;
      throw new Error("outage");
    }
    const cart = this.carts.get(id);
    return cart ? this.view(cart) : null;
  }

  async create(input: Parameters<CartGateway["create"]>[0]): Promise<CartMutationResult> {
    this.createCalls += 1;
    await this.passBarrier();
    if (this.failCreates > 0) {
      this.failCreates -= 1;
      throw new Error("outage");
    }
    if (input.customerAccessToken && this.invalidCustomerTokens.has(input.customerAccessToken)) return { cart: null, userErrors: [{ code: "INVALID", field: ["input", "buyerIdentity", "customerAccessToken"], message: "Customer is invalid" }], warnings: [] };
    const bad = input.lines.findIndex((line) => this.missingVariants.has(line.merchandiseId));
    if (bad >= 0) return { cart: null, userErrors: [{ code: "INVALID", field: ["input", "lines", String(bad), "merchandiseId"], message: "Does not exist" }], warnings: [] };
    const id = `gid://shopify/Cart/new-${this.seq++}-${uniqueId("c")}?key=secret`;
    const cart: StoredCart = { id, lines: [], note: input.note, attributes: input.attributes ?? [], discountCodes: input.discountCodes ?? [], customerToken: input.customerAccessToken };
    this.add(cart, input.lines);
    this.carts.set(id, cart);
    return this.result(cart);
  }

  async addLines(id: string, lines: CartLineInput[]) {
    const cart = this.carts.get(id);
    if (cart) this.add(cart, lines);
    return this.result(cart);
  }

  async updateLines(id: string) { return this.result(this.carts.get(id)); }
  async removeLines(id: string) { return this.result(this.carts.get(id)); }

  async updateDiscountCodes(id: string, codes: string[]) {
    const cart = this.carts.get(id);
    if (cart) cart.discountCodes = codes;
    return this.result(cart);
  }

  async updateBuyerIdentity(id: string, token: string) {
    const cart = this.carts.get(id);
    if (this.invalidCustomerTokens.has(token)) return { ...this.result(cart), userErrors: [{ code: "INVALID", field: ["buyerIdentity", "customerAccessToken"], message: "Customer is invalid" }] };
    if (cart) cart.customerToken = token;
    return this.result(cart);
  }

  async canSeeSellingPlans() { return this.plansVisible; }

  quantities(id: string) {
    return Object.fromEntries((this.carts.get(id)?.lines ?? []).map((line) => [`${line.merchandiseId}|${line.sellingPlanId ?? ""}`, line.quantity]));
  }
}
