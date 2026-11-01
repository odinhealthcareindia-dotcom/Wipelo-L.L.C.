import { expect, test } from "@playwright/test";
import { buildCartSnapshot } from "../../lib/server/account/saved-cart";
import { addToCart, CartActionError, loadCart, runCartMutation } from "../../lib/server/cart/actions";
import { CartMergeError, MAX_LINE_QUANTITY, MERGE_MARKER, lineKey, syncAccountCart } from "../../lib/server/cart/merge";
import { FakeCartGateway, FakeSavedCart } from "./support";

const V1 = "gid://shopify/ProductVariant/1";
const V2 = "gid://shopify/ProductVariant/2";
const PLAN = "gid://shopify/SellingPlan/4";

function open() {
  const gateway = new FakeCartGateway();
  const saved = new FakeSavedCart();
  const deps = { gateway, saved };
  const seedAccount = (lines: Parameters<FakeCartGateway["seed"]>[0], extra = {}) => {
    const id = gateway.seed(lines, extra);
    saved.cartId = id;
    saved.version = 1;
    return id;
  };
  return { gateway, saved, deps, seedAccount };
}

test("line identity covers merchandise, plan and attributes, in any attribute order", () => {
  expect(lineKey({ merchandiseId: V1 })).toBe(lineKey({ merchandiseId: V1, attributes: [] }));
  expect(lineKey({ merchandiseId: V1 })).not.toBe(lineKey({ merchandiseId: V1, sellingPlanId: PLAN }));
  expect(lineKey({ merchandiseId: V1, attributes: [{ key: "a", value: "1" }] })).not.toBe(lineKey({ merchandiseId: V1 }));
  expect(lineKey({ merchandiseId: V1, attributes: [{ key: "a", value: "1" }, { key: "b", value: "2" }] })).toBe(lineKey({ merchandiseId: V1, attributes: [{ key: "b", value: "2" }, { key: "a", value: "1" }] }));
});

test("with no saved cart, the guest cart is saved to the customer", async () => {
  const { deps, gateway, saved } = open();
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 2 }]);
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: "token" });
  expect(result.cart?.id).toBe(guest);
  expect(result.saved).toBe(true);
  expect(result.attached).toBe(true);
  expect(saved.cartId).toBe(guest);
  expect(gateway.carts.get(guest)?.customerToken).toBe("token");
  expect(gateway.createCalls).toBe(0);
});

test("with no local cart, the saved cart is restored on this device", async () => {
  const { deps, seedAccount } = open();
  const account = seedAccount([{ merchandiseId: V1, quantity: 3 }]);
  const result = await syncAccountCart(deps, { localCartId: null, customerAccessToken: "token" });
  expect(result.cart?.id).toBe(account);
  expect(result.cart?.totalQuantity).toBe(3);
});

test("equal lines add up, different plans stay separate, and the originals are untouched", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  const before = seedAccount([{ merchandiseId: V1, quantity: 1 }, { merchandiseId: V1, quantity: 1, sellingPlanId: PLAN }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 2 }, { merchandiseId: V2, quantity: 3 }]);
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: "token" });
  expect(result.cart?.id).toBe(saved.cartId);
  expect(saved.cartId).not.toBe(before);
  expect(gateway.quantities(saved.cartId!)).toEqual({ [`${V1}|`]: 3, [`${V1}|${PLAN}`]: 1, [`${V2}|`]: 3 });
  expect(gateway.carts.get(saved.cartId!)?.customerToken).toBe("token");
  expect(gateway.quantities(before)[`${V1}|`]).toBe(1);
  expect(gateway.quantities(guest)[`${V1}|`]).toBe(2);
});

test("lines with different attributes stay separate and keep their attributes", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1, attributes: [{ key: "_gift", value: "yes" }] }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 1 }]);
  await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  const lines = gateway.carts.get(saved.cartId!)!.lines;
  expect(lines).toHaveLength(2);
  expect(lines.find((line) => line.attributes?.length)?.attributes).toEqual([{ key: "_gift", value: "yes" }]);
});

test("notes, attributes and valid discount codes carry over, with the saved cart winning conflicts", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }], { note: "account note", attributes: [{ key: "a", value: "account" }], discountCodes: ["ACCOUNT"] });
  const guest = gateway.seed([{ merchandiseId: V2, quantity: 1 }], { note: "guest note", attributes: [{ key: "a", value: "guest" }, { key: "b", value: "guest" }], discountCodes: ["GUEST", "BAD"] });
  await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  const merged = gateway.carts.get(saved.cartId!)!;
  expect(merged.note).toBe("account note");
  expect(merged.attributes).toEqual(expect.arrayContaining([{ key: "a", value: "account" }, { key: "b", value: "guest" }]));
  expect(merged.discountCodes.sort()).toEqual(["ACCOUNT", "GUEST"]);
});

test("the merge marker holds hashes only, never a cart ID or key", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  await syncAccountCart(deps, { localCartId: gateway.seed([{ merchandiseId: V1, quantity: 1 }]), customerAccessToken: null });
  const marker = gateway.carts.get(saved.cartId!)!.attributes.find((attribute) => attribute.key === MERGE_MARKER)!.value;
  expect(marker).toMatch(/^[0-9a-f]{16},[0-9a-f]{16}$/);
});

test("replaying a merge from the same old cart adds nothing, even if the browser never heard the answer", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 2 }]);
  await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  const merged = saved.cartId!;
  const creates = gateway.createCalls;
  const again = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(again.cart?.id).toBe(merged);
  expect(gateway.createCalls).toBe(creates);
  expect(gateway.quantities(merged)[`${V1}|`]).toBe(3);
});

test("ten concurrent merges of one cart count its items exactly once", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 2 }]);
  gateway.holdCreatesUntil(10);
  const results = await Promise.all(Array.from({ length: 10 }, () => syncAccountCart(deps, { localCartId: guest, customerAccessToken: null })));
  // All ten really did race to this point: each built its own combined cart.
  expect(gateway.createCalls).toBe(10);
  expect(new Set(results.map((result) => result.cart?.id))).toEqual(new Set([saved.cartId]));
  expect(gateway.quantities(saved.cartId!)[`${V1}|`]).toBe(3);
});

test("two devices merging different carts at once both keep their items", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const phone = gateway.seed([{ merchandiseId: V1, quantity: 2 }]);
  const laptop = gateway.seed([{ merchandiseId: V2, quantity: 5 }]);
  gateway.holdCreatesUntil(2);
  await Promise.all([syncAccountCart(deps, { localCartId: phone, customerAccessToken: null }), syncAccountCart(deps, { localCartId: laptop, customerAccessToken: null })]);
  expect(gateway.quantities(saved.cartId!)).toEqual({ [`${V1}|`]: 3, [`${V2}|`]: 5 });
});

test("a Shopify failure changes nothing, and the retry succeeds once", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  const before = seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 2 }]);
  gateway.failCreates = 1;
  await expect(syncAccountCart(deps, { localCartId: guest, customerAccessToken: null })).rejects.toThrow();
  expect(saved.cartId).toBe(before);
  await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(gateway.quantities(saved.cartId!)[`${V1}|`]).toBe(3);
});

test("if the save fails after merging, the browser keeps the merged cart and the retry doesn't double it", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  const before = seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 2 }]);
  saved.writeResult = "unavailable";
  const first = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(first.saved).toBe(false);
  expect(first.cart?.totalQuantity).toBe(3);
  expect(saved.cartId).toBe(before);

  // The browser now holds the merged cart. The next sync has to spot that it already contains the saved cart.
  saved.writeResult = null;
  const second = await syncAccountCart(deps, { localCartId: first.cart!.id, customerAccessToken: null });
  expect(second.saved).toBe(true);
  expect(saved.cartId).toBe(first.cart!.id);
  expect(gateway.quantities(saved.cartId!)[`${V1}|`]).toBe(3);
});

test("without metafield access the cart keeps working, unsynced", async () => {
  const { deps, gateway, saved } = open();
  saved.available = false;
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 2 }]);
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: "token" });
  expect(result).toMatchObject({ saved: false, attached: true });
  expect(result.cart?.id).toBe(guest);
  expect(saved.writes).toBe(0);
});

test("subscriptions are never merged without plan data", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  const before = seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 1, sellingPlanId: PLAN }]);
  gateway.plansVisible = false;
  await expect(syncAccountCart(deps, { localCartId: guest, customerAccessToken: null })).rejects.toBeInstanceOf(CartMergeError);
  expect(saved.cartId).toBe(before);
});

test("unavailable items are dropped and reported", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V2, quantity: 1 }]);
  gateway.unavailableVariants.add(V2);
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(gateway.quantities(saved.cartId!)).toEqual({ [`${V1}|`]: 1 });
  expect(result.notices.some((notice) => notice.kind === "warning" && notice.message.includes("no longer available"))).toBe(true);
});

test("a deleted variant doesn't cost the rest of the cart", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V2, quantity: 1 }]);
  gateway.missingVariants.add(V2);
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(gateway.quantities(saved.cartId!)).toEqual({ [`${V1}|`]: 1 });
  expect(result.notices.some((notice) => notice.kind === "warning")).toBe(true);
});

test("a plan Shopify silently refuses is reported, not lost quietly", async () => {
  const { deps, gateway, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V2, quantity: 1, sellingPlanId: PLAN }]);
  const original = gateway.create.bind(gateway);
  gateway.create = (input) => original({ ...input, lines: input.lines.map((line) => (line.sellingPlanId ? { ...line, sellingPlanId: `${line.sellingPlanId}/invalid` } : line)) });
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(result.notices.some((notice) => notice.kind === "warning")).toBe(true);
});

test("quantities are capped and the shopper is told", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 90 }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 20 }]);
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(gateway.quantities(saved.cartId!)[`${V1}|`]).toBe(MAX_LINE_QUANTITY);
  expect(result.notices.some((notice) => notice.message.includes(String(MAX_LINE_QUANTITY)))).toBe(true);
});

test("a rejected discount code is reported", async () => {
  const { deps, gateway, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 1 }], { discountCodes: ["GUEST"] });
  const original = gateway.create.bind(gateway);
  gateway.create = (input) => original({ ...input, discountCodes: ["BAD"] });
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(result.notices.some((notice) => notice.message.includes("BAD"))).toBe(true);
});

test("an expired local cart leaves the saved cart alone", async () => {
  const { deps, saved, seedAccount } = open();
  const before = seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const result = await syncAccountCart(deps, { localCartId: "gid://shopify/Cart/gone?key=x", customerAccessToken: null });
  expect(result.cart?.id).toBe(before);
  expect(saved.cartId).toBe(before);
});

test("an expired saved cart is replaced by the local one", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  gateway.carts.delete(seedAccount([{ merchandiseId: V1, quantity: 1 }]));
  const guest = gateway.seed([{ merchandiseId: V2, quantity: 1 }]);
  await syncAccountCart(deps, { localCartId: guest, customerAccessToken: null });
  expect(saved.cartId).toBe(guest);
});

test("a saved cart that has been checked out is cleared, with a notice", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  const account = seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  gateway.carts.delete(account);
  const result = await syncAccountCart(deps, { localCartId: account, customerAccessToken: null });
  expect(result.cart).toBeNull();
  expect(result.notices[0].message).toContain("no longer available");
  expect(saved.cartId).toBeNull();
});

test("a token Shopify rejects doesn't cost the merge, and the cart isn't marked as attached", async () => {
  const { deps, gateway, saved, seedAccount } = open();
  seedAccount([{ merchandiseId: V1, quantity: 1 }]);
  const guest = gateway.seed([{ merchandiseId: V1, quantity: 1 }]);
  gateway.invalidCustomerTokens.add("stale");
  const result = await syncAccountCart(deps, { localCartId: guest, customerAccessToken: "stale" });
  expect(gateway.quantities(saved.cartId!)[`${V1}|`]).toBe(2);
  expect(result.attached).toBe(false);
});

test("the snapshot is readable and carries no IDs", () => {
  const gateway = new FakeCartGateway();
  const id = gateway.seed([{ merchandiseId: V1, quantity: 2, sellingPlanId: PLAN }]);
  const snapshot = buildCartSnapshot(gateway.view(gateway.carts.get(id)!));
  expect(snapshot).toMatchObject({ status: "active", itemCount: 2, items: [{ product: "Wipe", quantity: 2, plan: "Plan" }] });
  expect(JSON.stringify(snapshot)).not.toContain("gid://");
  expect(buildCartSnapshot(null).status).toBe("empty");
});

test("adding to an expired cart starts a new one with the same items and says so", async () => {
  const gateway = new FakeCartGateway();
  const result = await addToCart(gateway, "gid://shopify/Cart/gone?key=x", [{ merchandiseId: V1, quantity: 3 }]);
  expect(result.cart?.totalQuantity).toBe(3);
  expect(result.notices).toHaveLength(1);
});

test("a selling plan Shopify silently drops becomes an error, not a false success", async () => {
  await expect(addToCart(new FakeCartGateway(), null, [{ merchandiseId: V1, quantity: 1, sellingPlanId: "gid://shopify/SellingPlan/invalid" }])).rejects.toBeInstanceOf(CartActionError);
});

test("a vanished cart reads as gone, while an outage throws so the ID isn't thrown away", async () => {
  const gateway = new FakeCartGateway();
  expect(await loadCart(gateway, "gid://shopify/Cart/gone?key=x")).toMatchObject({ cart: null, gone: true });
  expect(await runCartMutation(() => gateway.updateLines("gid://shopify/Cart/gone?key=x"))).toMatchObject({ cart: null, gone: true });
  gateway.failLoads = 1;
  await expect(loadCart(gateway, gateway.seed([]))).rejects.toThrow("outage");
});
