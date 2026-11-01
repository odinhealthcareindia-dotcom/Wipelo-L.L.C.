// Local stand-in for Shopify's OAuth, Customer Account API and Storefront API, for browser tests only.
// Cart rules copy behaviour observed on a real store: identical lines combine, an unknown plan silently adds nothing,
// an unknown variant fails the whole mutation, and a retired cart reads as null.
import { execFileSync } from "node:child_process";
import { createHash, generateKeyPairSync, randomUUID, createSign } from "node:crypto";
import { mkdtempSync, readFileSync } from "node:fs";
import https from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ORIGIN = "https://localhost:8443";
const CLIENT_ID = "mock-client";
const directory = mkdtempSync(join(tmpdir(), "wipelo-mock-"));
execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", join(directory, "k.pem"), "-out", join(directory, "c.pem"), "-days", "1", "-subj", "/CN=localhost"], { stdio: "ignore" });

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "mock", alg: "RS256", use: "sig" };

const b64 = (value) => Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
function signIdToken(claims) {
  const body = `${b64({ alg: "RS256", kid: "mock" })}.${b64(claims)}`;
  return `${body}.${createSign("RSA-SHA256").update(body).sign(privateKey).toString("base64url")}`;
}

const money = (amount) => ({ amount: Number(amount).toFixed(2), currencyCode: "USD" });
const PLANS = [[2, 5], [4, 6], [8, 7]].map(([weeks, off], index) => ({ id: `gid://shopify/SellingPlan/90${index}`, name: `Deliver every ${weeks} weeks, ${off}% off`, description: null, recurringDeliveries: true, options: [{ name: "Delivery frequency", value: `Deliver every ${weeks} weeks` }], off }));
const plain = ({ off, ...plan }) => plan;
const VARIANT_PRICES = { 1: 24, 2: 60, 3: 108 };

function variantNode(handle, n) {
  const count = { 1: 1, 2: 3, 3: 6 }[n];
  return {
    id: `gid://shopify/ProductVariant/${handle.length}${n}`,
    title: `${count} pack${count > 1 ? "s" : ""} · ${count * 30} wipes`,
    availableForSale: !state.unavailable.has(`gid://shopify/ProductVariant/${handle.length}${n}`),
    price: money(VARIANT_PRICES[n]), compareAtPrice: null, selectedOptions: [{ name: "Supply", value: `${count}` }], image: null,
    sellingPlanAllocations: { nodes: PLANS.map((plan) => ({ sellingPlan: plain(plan), checkoutChargeAmount: money(VARIANT_PRICES[n] * (1 - plan.off / 100)) })) },
  };
}
function productNode(handle, title) {
  return { id: `gid://shopify/Product/${handle.length}`, handle, title, productType: "Wipes", tags: [], description: "", descriptionHtml: "", availableForSale: true, requiresSellingPlan: false, featuredImage: null, images: { nodes: [] }, priceRange: { minVariantPrice: money(24), maxVariantPrice: money(108) }, options: [], variants: { nodes: [1, 2, 3].map((n) => variantNode(handle, n)) }, metafields: [] };
}
const PRODUCTS = [["her", "Wipelo HER"], ["on-the-go", "Wipelo ON THE GO"], ["spotless", "Wipelo SPOTLESS"]];

const customers = {
  alice: { firstName: "Alice", lastName: "Stone", email: "alice@example.test", addresses: [], orders: 12, metafields: {} },
  bob: { firstName: "Bob", lastName: "Reed", email: "bob@example.test", addresses: [], orders: 0, metafields: {} },
};

const state = { carts: new Map(), codes: new Map(), tokens: new Map(), refreshTokens: new Map(), unavailable: new Set(), failNext: {}, counts: { refresh: 0, cartCreate: 0, tokenExchange: 0 }, lastAuthorize: null, accessTtl: 3600, seq: 1, metafieldsDisabled: false };
const digestOf = (value) => createHash("sha256").update(value).digest("hex");

function findVariant(id) {
  for (const [handle, title] of PRODUCTS) for (const n of [1, 2, 3]) {
    const variant = variantNode(handle, n);
    if (variant.id === id) return { variant, handle, title, price: VARIANT_PRICES[n] };
  }
  return null;
}
function cartView(cart) {
  const nodes = cart.lines.map((line) => {
    const found = findVariant(line.merchandiseId);
    const plan = PLANS.find((item) => item.id === line.sellingPlanId);
    return {
      id: `gid://shopify/CartLine/${line.id}?cart=${cart.token}`,
      quantity: line.quantity,
      attributes: line.attributes ?? [],
      cost: { totalAmount: money(found.price * line.quantity * (plan ? 1 - plan.off / 100 : 1)) },
      merchandise: { id: found.variant.id, title: found.variant.title, availableForSale: found.variant.availableForSale, image: null, price: found.variant.price, product: { title: found.title, handle: found.handle } },
      sellingPlanAllocation: plan ? { sellingPlan: plain(plan) } : null,
    };
  });
  const total = nodes.reduce((sum, node) => sum + Number(node.cost.totalAmount.amount), 0);
  const off = cart.discountCodes.includes("SAVE10") ? 0.9 : 1;
  return {
    id: cart.id, checkoutUrl: `${ORIGIN}/checkouts/${cart.token}`, note: cart.note ?? null, attributes: cart.attributes ?? [], updatedAt: "2026-11-01T10:00:00Z",
    totalQuantity: nodes.reduce((sum, node) => sum + node.quantity, 0),
    discountCodes: cart.discountCodes.map((code) => ({ code, applicable: code === "SAVE10" })),
    cost: { subtotalAmount: money(total * off), totalAmount: money(total * off) },
    lines: { nodes },
  };
}
function addLines(cart, lines) {
  for (const line of lines) {
    if (line.sellingPlanId && !PLANS.some((plan) => plan.id === line.sellingPlanId)) continue;
    const key = JSON.stringify([line.merchandiseId, line.sellingPlanId ?? null, line.attributes ?? []]);
    const existing = cart.lines.find((item) => JSON.stringify([item.merchandiseId, item.sellingPlanId ?? null, item.attributes ?? []]) === key);
    if (existing) existing.quantity += line.quantity;
    else cart.lines.push({ id: randomUUID(), merchandiseId: line.merchandiseId, quantity: line.quantity, sellingPlanId: line.sellingPlanId, attributes: line.attributes });
  }
}
const ok = (cart) => ({ cart: cart ? cartView(cart) : null, userErrors: [], warnings: [] });
const consumeFailure = (name) => {
  if (state.failNext[name] > 0) {
    state.failNext[name] -= 1;
    return true;
  }
  return false;
};

function storefront({ query, variables = {} }) {
  if (query.includes("sellingPlanGroups")) return { data: { products: { nodes: [{ sellingPlanGroups: { nodes: [{ name: "Subscribe and save" }] } }] } } };
  if (query.includes("WipeloProducts")) return { data: { products: { nodes: PRODUCTS.map(([handle, title]) => productNode(handle, title)), pageInfo: { hasNextPage: false, endCursor: null } } } };
  if (query.includes("WipeloProduct(")) {
    const found = PRODUCTS.find(([handle]) => handle === variables.handle);
    return { data: { product: found ? productNode(...found) : null } };
  }
  if (query.includes("WipeloCollection")) return { data: { collection: null } };
  if (query.includes("subscriptionPolicy")) return { data: { shop: { subscriptionPolicy: { url: `${ORIGIN}/policy` } } } };
  if (query.includes("availableCountries")) return { data: { localization: { availableCountries: [{ isoCode: "US", name: "United States" }, { isoCode: "CA", name: "Canada" }] } } };

  if (query.includes("WipeloCartCreate")) {
    state.counts.cartCreate += 1;
    if (consumeFailure("cartCreate")) return { errors: [{ message: "Injected outage" }] };
    const { lines = [], note, attributes, discountCodes = [], buyerIdentity } = variables.input;
    const badIndex = lines.findIndex((line) => !findVariant(line.merchandiseId));
    if (badIndex >= 0) return { data: { cartCreate: { cart: null, userErrors: [{ code: "INVALID", field: ["input", "lines", String(badIndex), "merchandiseId"], message: "The merchandise does not exist." }], warnings: [] } } };
    const token = `hW${randomUUID().replaceAll("-", "")}`;
    const cart = { id: `gid://shopify/Cart/${token}?key=${randomUUID().replaceAll("-", "")}`, token, lines: [], note, attributes, discountCodes, buyer: null };
    if (buyerIdentity?.customerAccessToken) {
      cart.buyer = state.tokens.get(buyerIdentity.customerAccessToken)?.customer ?? null;
      if (!cart.buyer) return { data: { cartCreate: { cart: null, userErrors: [{ code: "INVALID", field: ["input", "buyerIdentity", "customerAccessToken"], message: "Customer is invalid" }], warnings: [] } } };
    }
    addLines(cart, lines);
    state.carts.set(cart.id, cart);
    return { data: { cartCreate: ok(cart) } };
  }
  const id = variables.cartId ?? variables.id;
  const cart = state.carts.get(id);
  if (query.includes("WipeloCartLinesAdd")) {
    if (!cart) return { data: { cartLinesAdd: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"], message: "The specified cart does not exist." }], warnings: [] } } };
    addLines(cart, variables.lines);
    return { data: { cartLinesAdd: ok(cart) } };
  }
  if (query.includes("WipeloCartLinesUpdate")) {
    if (!cart) return { data: { cartLinesUpdate: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"], message: "The specified cart does not exist." }], warnings: [] } } };
    for (const update of variables.lines) {
      const line = cart.lines.find((item) => update.id.includes(item.id));
      if (line) line.quantity = update.quantity;
    }
    return { data: { cartLinesUpdate: ok(cart) } };
  }
  if (query.includes("WipeloCartLinesRemove")) {
    if (!cart) return { data: { cartLinesRemove: { cart: null, userErrors: [{ code: "INVALID", field: ["cartId"], message: "The specified cart does not exist." }], warnings: [] } } };
    cart.lines = cart.lines.filter((line) => !variables.lineIds.some((lineId) => lineId.includes(line.id)));
    return { data: { cartLinesRemove: ok(cart) } };
  }
  if (query.includes("WipeloCartDiscountCodes")) {
    if (!cart) return { data: { cartDiscountCodesUpdate: { cart: null, userErrors: [], warnings: [] } } };
    cart.discountCodes = variables.discountCodes;
    return { data: { cartDiscountCodesUpdate: ok(cart) } };
  }
  if (query.includes("WipeloCartBuyerIdentity")) {
    if (!cart) return { data: { cartBuyerIdentityUpdate: { cart: null, userErrors: [], warnings: [] } } };
    const customer = state.tokens.get(variables.buyerIdentity.customerAccessToken)?.customer;
    if (!customer) return { data: { cartBuyerIdentityUpdate: { ...ok(cart), userErrors: [{ code: "INVALID", field: ["buyerIdentity", "customerAccessToken"], message: "Customer is invalid" }] } } };
    cart.buyer = customer;
    return { data: { cartBuyerIdentityUpdate: ok(cart) } };
  }
  if (query.includes("WipeloCart(")) return { data: { cart: cart ? cartView(cart) : null } };
  return { errors: [{ message: `Mock has no handler for: ${query.slice(0, 80)}` }] };
}

function addressView(address) {
  return { ...address, formatted: [`${address.firstName ?? ""} ${address.lastName ?? ""}`.trim(), address.address1, `${address.city} ${address.zoneCode ?? ""} ${address.zip ?? ""}`.trim(), address.countryCode].filter(Boolean) };
}
const orderId = (who, n) => `gid://shopify/Order/${who === "alice" ? 1000 + n : 2000 + n}`;
function orderSummary(who, n) {
  return { id: orderId(who, n), name: `#${1000 + n}`, processedAt: "2026-10-01T10:00:00Z", financialStatus: "PAID", fulfillmentStatus: "FULFILLED", totalPrice: money(24), lineItemsSummary: { lineItemCount: 1 } };
}

function customerApi(token, { query, variables = {} }) {
  const session = state.tokens.get(token);
  if (!session || session.expires < Date.now()) return { status: 401, body: { errors: [{ message: "Unauthorized" }] } };
  const who = session.customer;
  const customer = customers[who];
  const data = (value) => ({ status: 200, body: { data: value } });
  const allOrders = Array.from({ length: customer.orders }, (_, index) => orderSummary(who, index + 1));
  if (query.includes("WipeloSavedCartSet")) {
    if (state.metafieldsDisabled) return data({ metafieldsSet: { userErrors: [{ code: "APP_NOT_AUTHORIZED", field: ["metafields"], message: "Access denied" }] } });
    for (const field of variables.metafields) {
      if ("compareDigest" in field) {
        const current = customer.metafields[field.key];
        if ((current ? digestOf(current) : null) !== field.compareDigest) return data({ metafieldsSet: { userErrors: [{ code: "INVALID_COMPARE_DIGEST", field: ["metafields"], message: "Stale" }] } });
      }
    }
    for (const field of variables.metafields) customer.metafields[field.key] = field.value;
    return data({ metafieldsSet: { userErrors: [] } });
  }
  if (query.includes("WipeloSavedCartClear")) {
    for (const field of variables.metafields) delete customer.metafields[field.key];
    return data({ metafieldsDelete: { userErrors: [] } });
  }
  if (query.includes("WipeloSavedCart")) {
    if (state.metafieldsDisabled) return { status: 200, body: { errors: [{ message: "Access denied", extensions: { code: "ACCESS_DENIED" } }] } };
    const value = customer.metafields.cart_id;
    return data({ customer: { id: `gid://shopify/Customer/${who}`, cartId: value ? { value, compareDigest: digestOf(value) } : null } });
  }
  if (query.includes("WipeloCustomerId")) return data({ customer: { id: `gid://shopify/Customer/${who}` } });
  if (query.includes("AccountOverview")) return data({ customer: { firstName: customer.firstName, lastName: customer.lastName, displayName: customer.firstName, emailAddress: { emailAddress: customer.email }, defaultAddress: customer.addresses[0] ? addressView(customer.addresses[0]) : null, orders: { nodes: allOrders.slice(0, 3) } } });
  if (query.includes("AccountProfile")) return data({ customer: { firstName: customer.firstName, lastName: customer.lastName, emailAddress: { emailAddress: customer.email } } });
  if (query.includes("AccountUpdateProfile")) {
    Object.assign(customer, variables.input);
    return data({ customerUpdate: { customer: variables.input, userErrors: [] } });
  }
  if (query.includes("AccountAddresses")) return data({ customer: { firstName: customer.firstName, lastName: customer.lastName, defaultAddress: customer.addresses[0] ? { id: customer.addresses[0].id } : null, addresses: { nodes: customer.addresses.map(addressView) } } });
  if (query.includes("AccountCreateAddress")) {
    const address = { id: `gid://shopify/CustomerAddress/${state.seq++}`, ...variables.address };
    if (variables.defaultAddress) customer.addresses.unshift(address); else customer.addresses.push(address);
    return data({ customerAddressCreate: { customerAddress: { id: address.id }, userErrors: [] } });
  }
  if (query.includes("AccountUpdateAddress")) {
    const address = customer.addresses.find((item) => item.id === variables.addressId);
    if (!address) return data({ customerAddressUpdate: { customerAddress: null, userErrors: [{ field: ["addressId"], message: "Address not found." }] } });
    Object.assign(address, variables.address);
    return data({ customerAddressUpdate: { customerAddress: { id: address.id }, userErrors: [] } });
  }
  if (query.includes("AccountDeleteAddress")) {
    const before = customer.addresses.length;
    customer.addresses = customer.addresses.filter((item) => item.id !== variables.addressId);
    return data({ customerAddressDelete: before === customer.addresses.length ? { deletedAddressId: null, userErrors: [{ field: ["addressId"], message: "Address not found." }] } : { deletedAddressId: variables.addressId, userErrors: [] } });
  }
  if (query.includes("AccountOrders(") || query.includes("AccountOrders ")) {
    const cursorOf = (index) => `c${index}`;
    let start = 0;
    let end = Math.min(variables.first ?? 10, allOrders.length);
    if (variables.after) { start = Number(variables.after.slice(1)) + 1; end = Math.min(start + (variables.first ?? 10), allOrders.length); }
    if (variables.before) { end = Number(variables.before.slice(1)); start = Math.max(0, end - (variables.last ?? 10)); }
    return data({ customer: { orders: { nodes: allOrders.slice(start, end), pageInfo: { hasNextPage: end < allOrders.length, hasPreviousPage: start > 0, startCursor: cursorOf(start), endCursor: cursorOf(end - 1) } } } });
  }
  if (query.includes("AccountOrder(")) {
    const summary = allOrders.find((order) => order.id === variables.id);
    if (!summary) return data({ order: null });
    return data({ order: { ...summary, statusPageUrl: `${ORIGIN}/status`, cancelledAt: null, subtotal: money(24), totalShipping: money(0), totalTax: money(0), shippingAddress: { formatted: ["Alice Stone", "1 Main St"] }, lineItems: { nodes: [{ id: "li1", title: "Wipelo HER", variantTitle: "1 pack · 30 wipes", quantity: 1, sellingPlan: null, image: null, totalPrice: money(24) }] }, fulfillments: { nodes: [{ id: "f1", status: "SUCCESS", trackingInformation: [{ company: "UPS", number: "1Z999", url: `${ORIGIN}/track` }] }] } } });
  }
  return { status: 200, body: { errors: [{ message: "Mock has no handler" }] } };
}

function issueTokens(customer, nonce) {
  const accessToken = `shcat_${randomUUID()}`;
  const refreshToken = `shcrt_${randomUUID()}`;
  state.tokens.set(accessToken, { customer, expires: Date.now() + state.accessTtl * 1000 });
  state.refreshTokens.set(refreshToken, customer);
  const now = Math.floor(Date.now() / 1000);
  return { access_token: accessToken, refresh_token: refreshToken, expires_in: state.accessTtl, token_type: "Bearer", id_token: signIdToken({ iss: `${ORIGIN}/authentication/1`, aud: CLIENT_ID, sub: `gid://shopify/Customer/${customer}`, iat: now, exp: now + 3600, ...(nonce ? { nonce } : {}) }) };
}

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}
function html(res, body) {
  res.writeHead(200, { "content-type": "text/html" });
  res.end(`<!doctype html><title>Mock Shopify</title>${body}`);
}

https.createServer({ key: readFileSync(join(directory, "k.pem")), cert: readFileSync(join(directory, "c.pem")) }, (req, res) => {
  let raw = "";
  req.on("data", (chunk) => { raw += chunk; });
  req.on("end", () => {
    const url = new URL(req.url, ORIGIN);
    const path = url.pathname;
    if (path === "/__health") return json(res, 200, { ok: true });
    if (path === "/__control") {
      const body = JSON.parse(raw || "{}");
      if (body.failNext) Object.assign(state.failNext, body.failNext);
      if (body.unavailable) state.unavailable = new Set(body.unavailable);
      if (body.retireCartOf) for (const cart of state.carts.values()) if (cart.buyer === body.retireCartOf) state.carts.delete(cart.id);
      if (body.expireTokensOf) for (const session of state.tokens.values()) if (session.customer === body.expireTokensOf) session.expires = 0;
      if (body.accessTtl) state.accessTtl = body.accessTtl;
      if (body.revokeRefreshTokens) state.refreshTokens.clear();
      if ("metafieldsDisabled" in body) state.metafieldsDisabled = body.metafieldsDisabled;
      return json(res, 200, { ok: true });
    }
    if (path === "/__state") return json(res, 200, { counts: state.counts, lastAuthorize: state.lastAuthorize, metafields: Object.fromEntries(Object.entries(customers).map(([who, customer]) => [who, customer.metafields])), carts: [...state.carts.values()].map((cart) => ({ buyer: cart.buyer, quantity: cart.lines.reduce((sum, line) => sum + line.quantity, 0) })) });
    if (path === "/.well-known/openid-configuration") return json(res, 200, { issuer: `${ORIGIN}/authentication/1`, authorization_endpoint: `${ORIGIN}/authorize`, token_endpoint: `${ORIGIN}/token`, end_session_endpoint: `${ORIGIN}/logout`, jwks_uri: `${ORIGIN}/jwks` });
    if (path === "/.well-known/customer-account-api") return json(res, 200, { graphql_api: `${ORIGIN}/account/customer/api/2099-01/graphql` });
    if (path === "/jwks") return json(res, 200, { keys: [jwk] });
    if (path === "/authorize") {
      state.lastAuthorize = Object.fromEntries(url.searchParams);
      const back = (query) => `${url.searchParams.get("redirect_uri")}?${new URLSearchParams(query)}`;
      const state_ = url.searchParams.get("state");
      const links = Object.keys(customers).map((who) => {
        const code = randomUUID();
        state.codes.set(code, { customer: who, nonce: url.searchParams.get("nonce"), redirectUri: url.searchParams.get("redirect_uri"), challenge: url.searchParams.get("code_challenge") });
        return `<a data-who="${who}" href="${back({ code, state: state_ })}">Continue as ${who}</a><br>`;
      }).join("");
      return html(res, `${links}<a id="cancel" href="${back({ error: "access_denied", state: state_ })}">Cancel</a>`);
    }
    if (path === "/token") {
      if (!req.headers.authorization?.startsWith("Basic ")) return json(res, 401, { error: "invalid_client" });
      const body = new URLSearchParams(raw);
      if (body.get("grant_type") === "refresh_token") {
        state.counts.refresh += 1;
        const customer = state.refreshTokens.get(body.get("refresh_token"));
        if (!customer) return json(res, 400, { error: "invalid_grant" });
        state.refreshTokens.delete(body.get("refresh_token"));
        return json(res, 200, issueTokens(customer));
      }
      const grant = state.codes.get(body.get("code"));
      state.codes.delete(body.get("code"));
      if (!grant || grant.redirectUri !== body.get("redirect_uri")) return json(res, 400, { error: "invalid_grant" });
      state.counts.tokenExchange += 1;
      return json(res, 200, issueTokens(grant.customer, grant.nonce));
    }
    if (path === "/logout") {
      res.writeHead(303, { location: url.searchParams.get("post_logout_redirect_uri") });
      return res.end();
    }
    if (path.startsWith("/checkouts/")) {
      const cart = [...state.carts.values()].find((item) => item.token === path.split("/").pop());
      return html(res, `<h1>Mock checkout</h1><p id="buyer">${cart?.buyer ?? "guest"}</p><p id="qty">${cart ? cart.lines.reduce((sum, line) => sum + line.quantity, 0) : 0}</p><p id="sso">${url.searchParams.get("sso") ?? ""}</p><p id="logged-in">${url.searchParams.get("logged_in") ?? ""}</p>`);
    }
    if (path.startsWith("/account/customer/api/")) {
      const result = customerApi(req.headers.authorization ?? "", JSON.parse(raw));
      return json(res, result.status, result.body);
    }
    if (/^\/api\/[^/]+\/graphql\.json$/.test(path)) return json(res, 200, storefront(JSON.parse(raw)));
    return json(res, 404, { error: "not found" });
  });
}).listen(8443, () => console.log("Mock Shopify listening on 8443"));
