import { expect, test } from "@playwright/test";

// Runs against whatever the configured store returns, and skips until selling plans are readable.
test("subscribing sends the chosen selling plan to the cart", async ({ page }) => {
  await page.goto("/products/her");
  const subscribe = page.getByRole("radio", { name: /^Subscribe/ });
  test.skip(await subscribe.count() === 0, "No selling plans readable by the Storefront token.");
  await expect(subscribe).toHaveAttribute("aria-checked", "true");

  const cadences = page.locator(".pdp6-cadence input");
  await expect(cadences.first()).toBeAttached();
  await page.locator(".pdp6-cadence label").first().click();
  const add = page.locator(".pdp6-cart-row .pdp6-add");
  await expect(add).toHaveText(/^Subscribe — /);
  await expect(page.locator(".pdp6-renewal")).toContainText("Renews automatically");

  const [request] = await Promise.all([
    page.waitForRequest((candidate) => candidate.url().endsWith("/api/cart") && candidate.method() === "POST"),
    add.click(),
  ]);
  expect(request.postDataJSON().lines[0].sellingPlanId).toMatch(/^gid:\/\/shopify\/SellingPlan\//);
  await expect(page.locator(".drawer.on .di-meta")).toContainText(/Every/i);
  await expect(page.locator(".drawer.on .dr-guar")).toContainText("renew automatically");
});

test("one-time purchases never send a selling plan", async ({ page }) => {
  await page.goto("/products/her");
  await page.getByRole("radio", { name: /^One-time/ }).click({ timeout: 5_000 }).catch(() => undefined);
  const [request] = await Promise.all([
    page.waitForRequest((candidate) => candidate.url().endsWith("/api/cart") && candidate.method() === "POST"),
    page.locator(".pdp6-cart-row .pdp6-add").click(),
  ]);
  expect(request.postDataJSON().lines[0].sellingPlanId).toBeUndefined();
  await expect(page.locator(".drawer.on .di-name")).toBeVisible();
});

test("the cart API rejects a malformed selling plan instead of selling one-time", async ({ request }) => {
  const response = await request.post("/api/cart", {
    headers: { Origin: "http://127.0.0.1:3100" },
    data: { action: "create", lines: [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1, sellingPlanId: "not-a-plan" }] },
  });
  expect(response.status()).toBe(400);
});

test("the guest cart survives a reload and checkout hands off to the store", async ({ page }) => {
  await page.goto("/products/her");
  await page.waitForLoadState("networkidle");
  await page.locator(".pdp6-cart-row .pdp6-add").click();
  await expect(page.locator(".drawer.on .di-name")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("wipelo-shopify-cart-v1"))).toMatch(/^gid:\/\/shopify\/Cart\//);
  await page.reload();
  await expect(page.locator(".cart-count")).not.toHaveText("0");
  await page.locator(".cart-btn").click();
  await page.locator(".cart-checkout").click();
  await page.waitForURL(/myshopify\.com|wipelo\.com/);
});
