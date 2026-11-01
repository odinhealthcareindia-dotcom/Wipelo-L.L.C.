import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const MOCK = "https://localhost:8443";
const PRODUCTION = Boolean(process.env.ACCOUNTS_E2E_PROD);
const SESSION_COOKIE = PRODUCTION ? "__Host-wipelo_session" : "wipelo_session";
const CART_KEY = "wipelo-shopify-cart-v1";
const OWNER_KEY = "wipelo-cart-owner";

async function control(page: Page, body: Record<string, unknown>) {
  await page.request.post(`${MOCK}/__control`, { data: body, ignoreHTTPSErrors: true });
}
async function mockState(page: Page) {
  return (await page.request.get(`${MOCK}/__state`, { ignoreHTTPSErrors: true })).json();
}

// Waits for the storefront to finish loading its cart, so clicks can't race hydration.
async function openProduct(page: Page, handle = "her") {
  await page.goto(`/products/${handle}`);
  await page.waitForLoadState("networkidle");
}
async function addOneTime(page: Page, handle = "her") {
  await openProduct(page, handle);
  await page.getByRole("radio", { name: /^One-time/ }).click();
  const added = page.waitForResponse((response) => response.url().endsWith("/api/cart") && response.request().method() === "POST");
  await page.locator(".pdp6-cart-row .pdp6-add").click();
  expect((await added).status()).toBe(200);
  await expect(page.locator(".drawer.on")).toBeVisible();
  await page.locator(".dr-close").click();
}
async function signIn(page: Page, who: "alice" | "bob", returnTo = "/account") {
  await page.goto(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  await page.locator(`a[data-who="${who}"]`).click();
  await page.waitForURL((url) => url.origin === "http://127.0.0.1:3200" && !url.pathname.startsWith("/api/"));
  await page.waitForLoadState("networkidle");
}
async function signOut(page: Page) {
  await page.goto("/account");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("http://127.0.0.1:3200/");
  await page.waitForLoadState("networkidle");
}
const cartCount = (page: Page) => page.locator(".cart-count");
async function cartTotal(page: Page) {
  await page.waitForLoadState("networkidle");
  return Number(await cartCount(page).innerText());
}
const stored = (page: Page, key: string) => page.evaluate((name) => window.localStorage.getItem(name), key);

test.describe("guest cart", () => {
  test("survives refreshes and a browser restart, in localStorage, with no account", async ({ page, context }) => {
    await addOneTime(page);
    await page.reload();
    await expect(cartCount(page)).toHaveText("1");
    expect(await stored(page, CART_KEY)).toMatch(/^gid:\/\/shopify\/Cart\//);
    expect(await stored(page, OWNER_KEY)).toBeNull();
    // No prices or totals are stored: Shopify stays the source of truth.
    expect(await page.evaluate(() => JSON.stringify(window.localStorage))).not.toContain("amount");

    const state = await context.storageState();
    const restarted = await context.browser()!.newContext({ storageState: state, ignoreHTTPSErrors: true, baseURL: "http://127.0.0.1:3200" });
    const fresh = await restarted.newPage();
    await fresh.goto("/shop");
    await expect(cartCount(fresh)).toHaveText("1");
    await restarted.close();
  });

  test("quantity changes, discount codes and removal go through Shopify", async ({ page }) => {
    await addOneTime(page);
    await page.locator(".cart-btn").click();
    await page.getByRole("dialog", { name: "Cart" }).getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.locator(".dr-qty span")).toHaveText("2");
    // The product page defaults to the 3-pack at $60.
    await expect(page.locator(".di-price")).toHaveText("$120.00");

    await page.getByPlaceholder("Discount code").fill("NOPE");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.locator(".dr-notices")).toContainText("NOPE");
    await page.getByPlaceholder("Discount code").fill("SAVE10");
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.locator(".dr-discount-chip")).toContainText("SAVE10");
    await expect(page.locator(".dr-total b")).toHaveText("$108.00");

    await page.locator(".cart-remove").click();
    await expect(page.locator(".dr-empty")).toBeVisible();
    await expect(cartCount(page)).toHaveText("0");
  });

  test("a failed change rolls back and explains itself", async ({ page }) => {
    await addOneTime(page);
    await page.locator(".cart-btn").click();
    await page.route("**/api/cart", async (route) => {
      const action = route.request().postDataJSON()?.action;
      if (action === "update") await route.fulfill({ status: 502, json: { cart: null, error: "We couldn't reach the store. Please try again.", notices: [] } });
      else await route.continue();
    });
    await page.getByRole("dialog", { name: "Cart" }).getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.locator(".cart-error")).toContainText("couldn't reach");
    await expect(page.locator(".dr-qty span")).toHaveText("1");
  });

  test("a subscription keeps its selling plan through the cart", async ({ page }) => {
    await openProduct(page);
    await page.locator(".pdp6-cadence label").first().click();
    await page.locator(".pdp6-cart-row .pdp6-add").click();
    await expect(page.locator(".drawer.on .di-meta")).toContainText(/every 2 weeks/i);
  });

  test("a garbage or expired stored cart ID is cleared", async ({ page }) => {
    await page.goto("/our-story");
    await page.evaluate((key) => window.localStorage.setItem(key, "not-a-cart"), CART_KEY);
    await page.reload();
    await expect.poll(() => stored(page, CART_KEY)).toBeNull();
    await page.evaluate((key) => window.localStorage.setItem(key, "gid://shopify/Cart/gone?key=x"), CART_KEY);
    await page.reload();
    await expect.poll(() => stored(page, CART_KEY)).toBeNull();
    await page.locator(".cart-btn").click();
    await expect(page.locator(".dr-notices")).toContainText("no longer available");
  });

  test("guest checkout hands off to Shopify with no account", async ({ page }) => {
    await addOneTime(page);
    await page.locator(".cart-btn").click();
    await page.locator(".cart-checkout").click();
    await page.waitForURL(/\/checkouts\//);
    await expect(page.locator("#buyer")).toHaveText("guest");
    await expect(page.locator("#qty")).toHaveText("1");
    await expect(page.locator("#logged-in")).toHaveText("");
  });
});

test.describe("sign in", () => {
  test("protected pages send visitors through sign-in and back", async ({ page }) => {
    await page.goto("/account/orders");
    await expect(page).toHaveURL(/\/account\/sign-in\?returnTo=%2Faccount%2Forders/);
    await expect(page.getByRole("main").getByRole("heading", { name: /Sign in or create an account/ })).toBeVisible();
    await page.getByRole("link", { name: /Continue with email/ }).click();
    await page.locator('a[data-who="alice"]').click();
    await expect(page).toHaveURL(/\/account\/orders$/);
    await expect(page.getByRole("main").getByRole("heading", { name: "Your orders." })).toBeVisible();
  });

  test("the request sent to Shopify is complete and the secret stays on the server", async ({ page }) => {
    await page.goto("/api/auth/login");
    const { lastAuthorize } = await mockState(page);
    expect(lastAuthorize).toMatchObject({ client_id: "mock-client", response_type: "code", scope: "openid email customer-account-api:full", code_challenge_method: "S256", redirect_uri: "http://127.0.0.1:3200/api/auth/callback" });
    expect(lastAuthorize.state).toBeTruthy();
    expect(lastAuthorize.nonce).toBeTruthy();
    expect(page.url()).not.toContain("mock-secret");
  });

  test("session cookies are sealed, HttpOnly, and invisible to scripts", async ({ page, context }) => {
    await signIn(page, "alice");
    const session = (await context.cookies()).find((cookie) => cookie.name === SESSION_COOKIE)!;
    expect(session.httpOnly).toBe(true);
    expect(session.secure).toBe(PRODUCTION);
    expect(session.sameSite).toBe("Lax");
    expect(session.value).not.toContain("shcat_");
    expect(session.value.length).toBeLessThan(4096);
    expect(await page.evaluate(() => document.cookie)).not.toContain("wipelo");
    const html = await page.content();
    expect(html).not.toContain("shcat_");
    expect(html).not.toContain("shcrt_");
    expect(await page.evaluate(() => JSON.stringify(window.localStorage))).not.toContain("shcat_");
    // Next's dev server replaces this header, so the exact value is only meaningful on a production build.
    expect((await page.request.get("/account")).headers()["cache-control"]).toMatch(PRODUCTION ? /no-store/ : /no-store|no-cache/);
  });

  test("cancelling keeps the cart and says so", async ({ page }) => {
    await addOneTime(page);
    await page.goto("/api/auth/login");
    await page.locator("#cancel").click();
    await expect(page).toHaveURL(/status=cancelled/);
    await expect(page.getByText(/Sign-in was cancelled/)).toBeVisible();
    await expect(cartCount(page)).toHaveText("1");
  });

  test("a replayed callback is refused and adds nothing to the cart", async ({ page }) => {
    await page.goto("/api/auth/login");
    const href = await page.locator('a[data-who="bob"]').getAttribute("href");
    await page.goto(href!);
    await expect(page).toHaveURL(/\/account$/);
    const before = await cartTotal(page);
    await page.goto(href!);
    await expect(page).toHaveURL(/status=expired/);
    await expect(page.getByText(/expired or was already used/)).toBeVisible();
    await page.goto("/shop");
    expect(await cartTotal(page)).toBe(before);
    await signOut(page);
  });

  test("a callback with a forged state is refused", async ({ page }) => {
    await page.goto("/api/auth/login");
    await page.goto("/api/auth/callback?code=abc&state=forged");
    await expect(page).toHaveURL(/status=invalid/);
  });

  test("open redirects are refused", async ({ page }) => {
    await signIn(page, "alice", "https://evil.example/");
    await expect(page).toHaveURL(/127\.0\.0\.1:3200\/account$/);
  });

  test("cross-site POSTs are refused", async ({ request }) => {
    expect((await request.post("/api/auth/logout", { headers: { Origin: "https://evil.example" } })).status()).toBe(403);
    expect((await request.post("/api/auth/logout")).status()).toBe(403);
    expect((await request.post("/api/cart", { headers: { Origin: "https://evil.example" }, data: { action: "add", lines: [] } })).status()).toBe(403);
    expect((await request.post("/api/account/cart", { headers: { Origin: "https://evil.example" }, data: {} })).status()).toBe(403);
  });

  test("an expiring token refreshes silently, and a rejected refresh returns to sign-in", async ({ page }) => {
    // A lifetime shorter than the refresh margin, which must not cause a redirect loop.
    await control(page, { accessTtl: 30 });
    const before = (await mockState(page)).counts.refresh;
    try {
      await signIn(page, "alice");
      await page.goto("/account/profile");
      await expect(page.getByRole("main").getByLabel("First name")).toBeVisible();
      expect((await mockState(page)).counts.refresh).toBeGreaterThan(before);
    } finally {
      await control(page, { accessTtl: 3600 });
    }

    await control(page, { expireTokensOf: "alice", revokeRefreshTokens: true });
    await page.goto("/account/profile");
    await expect(page).toHaveURL(/sign-in\?.*status=session-ended/);
    await expect(page.getByText(/Your session ended/)).toBeVisible();
  });
});

test.describe("account pages", () => {
  test("overview shows the signed-in customer", async ({ page }) => {
    await signIn(page, "alice");
    await expect(page.getByRole("main").getByRole("heading", { name: /^Hi, / })).toBeVisible();
    await expect(page.getByRole("main").getByText("alice@example.test")).toBeVisible();
    await expect(page.locator(".site-nav .nav-account")).toHaveText("Account");
  });

  test("the profile saves, and validates on the server", async ({ page }) => {
    await signIn(page, "bob", "/account/profile");
    const main = page.getByRole("main");
    await main.getByLabel("First name").fill("Robert");
    await main.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Your profile was updated." })).toBeVisible();
    await page.reload();
    await expect(main.getByLabel("First name")).toHaveValue("Robert");
    await main.getByLabel("Last name").fill("x".repeat(150));
    await main.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Use 100 characters or fewer.")).toBeVisible();
    await main.getByLabel("First name").fill("Bob");
    await main.getByLabel("Last name").fill("Reed");
    await main.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Your profile was updated." })).toBeVisible();
  });

  test("addresses can be added, edited and removed", async ({ page }) => {
    await signIn(page, "bob", "/account/addresses");
    const main = page.getByRole("main");
    await expect(main.getByText(/No addresses saved yet/)).toBeVisible();
    await main.getByLabel("Street address").fill("1 Main St");
    await main.getByLabel("City").fill("Reno");
    await main.getByLabel(/State/).fill("NV");
    await main.getByLabel(/ZIP/).fill("89501");
    await main.getByLabel("Country").selectOption("US");
    await main.getByRole("button", { name: "Add address" }).click();
    const card = main.locator(".account-address-grid .account-card");
    await expect(card).toContainText("1 Main St");
    await card.getByRole("button", { name: "Edit" }).click();
    await card.getByLabel("City").fill("Sparks");
    await card.getByRole("button", { name: "Save address" }).click();
    await expect(card).toContainText("Sparks");
    await card.getByRole("button", { name: "Remove" }).click();
    await expect(main.getByText(/No addresses saved yet/)).toBeVisible();
  });

  test("order history paginates and shows details", async ({ page }) => {
    await signIn(page, "alice", "/account/orders");
    const main = page.getByRole("main");
    const rows = main.locator(".account-order-list li");
    await expect(rows).toHaveCount(10);
    await main.getByRole("link", { name: "Older →" }).click();
    await expect(rows).toHaveCount(2);
    await main.getByRole("link", { name: "← Newer" }).click();
    await expect(rows).toHaveCount(10);
    await rows.first().getByRole("link").click();
    await expect(main.getByRole("heading", { name: /^Order #/ })).toBeVisible();
    await expect(main.getByRole("link", { name: /UPS 1Z999/ })).toBeVisible();
  });

  test("another customer's order is not found, and bad IDs are refused", async ({ page }) => {
    await signIn(page, "bob", "/account/orders");
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "No orders yet." })).toBeVisible();
    // Alice's order, asked for with Bob's token. Streaming means the HTTP status is already sent, so check what's shown.
    await page.goto("/account/orders/1001");
    await expect(main.getByRole("heading", { name: "This page isn’t here." })).toBeVisible();
    await expect(main.getByText("#1001")).toHaveCount(0);
    await page.goto("/account/orders/not-a-number");
    await expect(main.getByRole("heading", { name: "This page isn’t here." })).toBeVisible();
  });

  test("screenshots for review", async ({ page }) => {
    test.skip(!process.env.ACCOUNT_SCREENSHOT_DIR, "Only when reviewing the design.");
    const directory = process.env.ACCOUNT_SCREENSHOT_DIR!;
    const shoot = async (name: string, path: string) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `${directory}/${name}.png` });
    };
    for (const [label, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]] as const) {
      await page.setViewportSize({ width, height });
      await signIn(page, "alice");
      await shoot(`addresses-${label}`, "/account/addresses");
      await signOut(page);
    }
  });

  test("works at phone size", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, "alice");
    await expect(page.getByRole("navigation", { name: "Account" }).getByRole("link", { name: "Orders" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Account" })).toBeVisible();
    await page.goto("/account/addresses");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});

test.describe("account cart", () => {
  // A throwaway browser profile, like a second device.
  async function device(context: BrowserContext) {
    const other = await context.browser()!.newContext({ ignoreHTTPSErrors: true, baseURL: "http://127.0.0.1:3200" });
    return { context: other, page: await other.newPage() };
  }

  test("guest items survive sign-in, are saved to the customer, and follow to another device", async ({ page, context }) => {
    await signIn(page, "alice");
    const start = await cartTotal(page);
    await signOut(page);
    await addOneTime(page);
    await signIn(page, "alice");
    expect(await cartTotal(page)).toBe(start + 1);

    const saved = (await mockState(page)).metafields.alice;
    expect(saved.cart_id).toBe(await stored(page, CART_KEY));
    expect(JSON.parse(saved.cart_snapshot)).toMatchObject({ status: "active", itemCount: start + 1 });

    const phone = await device(context);
    await signIn(phone.page, "alice");
    expect(await cartTotal(phone.page)).toBe(start + 1);
    await signOut(phone.page);
    await expect(cartCount(phone.page)).toHaveText("0");

    await addOneTime(phone.page);
    await addOneTime(phone.page, "spotless");
    await signIn(phone.page, "alice", "/our-story");
    expect(await cartTotal(phone.page)).toBe(start + 3);
    await phone.page.locator(".cart-btn").click();
    // Strict Mode's second load in development would replace this notice with an empty list.
    if (PRODUCTION) await expect(phone.page.locator(".dr-notices")).toContainText("added the items");
    await expect(phone.page.locator(".dr-item", { hasText: "SPOTLESS" })).toHaveCount(1);

    // The first device now sees the combined cart too.
    await page.reload();
    expect(await cartTotal(page)).toBe(start + 3);
    await phone.context.close();
    await signOut(page);
  });

  test("changes reach the customer record after a short delay", async ({ page }) => {
    await signIn(page, "bob");
    const start = await cartTotal(page);
    await addOneTime(page);
    await expect.poll(async () => JSON.parse((await mockState(page)).metafields.bob.cart_snapshot ?? "{}").itemCount, { timeout: 10_000 }).toBe(start + 1);
    await signOut(page);
  });

  test("a failed merge keeps the items, says so, and retries exactly once", async ({ page }) => {
    // A saved cart with items forces a real merge rather than adopting the guest cart.
    await signIn(page, "alice");
    await addOneTime(page);
    await page.waitForTimeout(2000);
    const start = await cartTotal(page);
    await signOut(page);
    await addOneTime(page);

    await control(page, { failNext: { cartCreate: 1 } });
    await signIn(page, "alice", "/our-story");
    await expect(page.locator(".dr-notices")).toContainText("couldn't sync");
    await expect(cartCount(page)).toHaveText("1");

    await page.reload();
    await expect(cartCount(page)).toHaveText(String(start + 1));
    await page.reload();
    await expect(cartCount(page)).toHaveText(String(start + 1));
    await signOut(page);
  });

  test("concurrent tabs merge the guest cart only once", async ({ page }) => {
    await signIn(page, "alice");
    const start = await cartTotal(page);
    await signOut(page);
    await addOneTime(page);
    const guestCart = await stored(page, CART_KEY);

    // Hold the storefront's own sync back, so all six requests below really do start from the guest cart.
    await page.route("**/api/account/cart", (route) => (route.request().headers()["x-test-tab"] ? route.continue() : route.fulfill({ status: 502, json: { cart: null, notices: [] } })));
    await signIn(page, "alice", "/our-story");
    const totals = await page.evaluate((cartId) => Promise.all(Array.from({ length: 6 }, () => fetch("/api/account/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-test-tab": "1" },
      body: JSON.stringify({ cartId }),
    }).then((response) => response.json()).then((body) => body.cart?.totalQuantity))), guestCart);
    expect(new Set(totals)).toEqual(new Set([start + 1]));
    await page.unroute("**/api/account/cart");
    await page.reload();
    expect(await cartTotal(page)).toBe(start + 1);
    await signOut(page);
  });

  test("sign-out protects a shared browser, and each account gets only its own cart", async ({ page }) => {
    await signIn(page, "alice");
    await addOneTime(page);
    await page.waitForTimeout(2000);
    const aliceTotal = await cartTotal(page);
    const aliceCart = await stored(page, CART_KEY);
    await signOut(page);

    await expect(page.locator(".site-nav .nav-account")).toHaveText("Sign in");
    await expect(cartCount(page)).toHaveText("0");
    expect(await stored(page, CART_KEY)).toBeNull();
    expect(await stored(page, OWNER_KEY)).toBeNull();
    const signedOut = await (await page.request.get("/account/profile")).text();
    expect(signedOut).not.toContain("alice@example.test");
    await page.goto("/account/profile");
    await expect(page).toHaveURL(/\/account\/sign-in/);

    await signIn(page, "bob");
    expect(await stored(page, CART_KEY)).not.toBe(aliceCart);
    await expect(page.getByRole("main").getByText("bob@example.test")).toBeVisible();
    await expect(page.getByRole("main").getByText("alice@example.test")).toHaveCount(0);
    await signOut(page);

    await signIn(page, "alice");
    expect(await cartTotal(page)).toBe(aliceTotal);
    expect(await stored(page, CART_KEY)).toBe(aliceCart);
    await signOut(page);
  });

  test("signing in as someone else without signing out doesn't merge or inherit the cart", async ({ page }) => {
    await signIn(page, "alice");
    await addOneTime(page);
    await page.waitForTimeout(2000);
    const aliceCart = await stored(page, CART_KEY);
    const aliceTotal = await cartTotal(page);
    await signIn(page, "bob");
    await expect(page.getByRole("main").getByText("bob@example.test")).toBeVisible();
    expect(await stored(page, CART_KEY)).not.toBe(aliceCart);
    expect((await mockState(page)).metafields.bob.cart_id).not.toBe(aliceCart);
    await signOut(page);
    await signIn(page, "alice");
    expect(await cartTotal(page)).toBe(aliceTotal);
    await signOut(page);
  });

  test("an expired session clears the browser's copy of the cart, and the customer record keeps it", async ({ page, context }) => {
    await signIn(page, "alice");
    await addOneTime(page);
    await page.waitForTimeout(2000);
    const saved = (await mockState(page)).metafields.alice.cart_id;
    await context.clearCookies();
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    await expect(cartCount(page)).toHaveText("0");
    expect(await stored(page, CART_KEY)).toBeNull();
    expect((await mockState(page)).metafields.alice.cart_id).toBe(saved);
  });

  test("signed-in checkout opens recognised, with the customer attached", async ({ page }) => {
    await signIn(page, "bob");
    await addOneTime(page);
    await page.locator(".cart-btn").click();
    await page.locator(".cart-checkout").click();
    await page.waitForURL(/\/checkouts\//);
    await expect(page.locator("#buyer")).toHaveText("bob");
    await expect(page.locator("#logged-in")).toHaveText("true");
  });

  test("a checked-out cart leaves a clean empty cart, and the customer record forgets it", async ({ page }) => {
    await signIn(page, "bob");
    await addOneTime(page);
    await control(page, { retireCartOf: "bob" });
    await page.goto("/shop");
    await expect(cartCount(page)).toHaveText("0");
    await page.locator(".cart-btn").click();
    await expect(page.locator(".dr-notices")).toContainText("no longer available");
    await expect.poll(async () => (await mockState(page)).metafields.bob.cart_id).toBeUndefined();
    await page.locator(".dr-close").click();
    await addOneTime(page);
    expect(await cartTotal(page)).toBe(1);
    await signOut(page);
  });

  test("if the metafields aren't set up in Shopify, shopping and checkout still work", async ({ page }) => {
    await control(page, { metafieldsDisabled: true });
    try {
      await addOneTime(page);
      await signIn(page, "bob", "/our-story");
      expect(await cartTotal(page)).toBe(1);
      await page.locator(".cart-btn").click();
      await page.locator(".cart-checkout").click();
      await page.waitForURL(/\/checkouts\//);
      await expect(page.locator("#qty")).toHaveText("1");
      await expect(page.locator("#buyer")).toHaveText("bob");
    } finally {
      await control(page, { metafieldsDisabled: false });
    }
  });
});
