import { expect, test } from "@playwright/test";

test("mobile navigation opens and closes accessibly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Toggle menu" });
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(nav.getByRole("link", { name: "Shop" })).toBeVisible();
  await nav.getByRole("link", { name: "Shop" }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("FAQ accordion opens and closes with its accessible state", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /So it's… a wet wipe/i });
  await trigger.scrollIntoViewIfNeeded();
  const answer = page.locator(`#${await trigger.getAttribute("aria-controls")}`);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(answer).toHaveAttribute("aria-hidden", "false");
  await expect(answer).toBeVisible();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(answer).toHaveAttribute("aria-hidden", "true");
});

test("product gallery, pack selection, and sticky bar remain interactive", async ({ page }) => {
  await page.goto("/products/her");
  const secondImage = page.getByRole("button", { name: "Show image 2" });
  if (await secondImage.count()) {
    await secondImage.click();
    await expect(secondImage).toHaveClass(/on/);
  }

  const pack = page.getByRole("radio", { name: /6 packs/i });
  if (await pack.count()) {
    await pack.locator("xpath=..").click();
    await expect(pack).toBeChecked();
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator(".product-stickybar")).toHaveClass(/on/, { timeout: 5000 });
});

test("home quiz updates its recommendation after the questions are answered", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".q-opts[data-q='1'] .q-opt[data-v='her']");
  await first.scrollIntoViewIfNeeded();
  await first.click();
  await page.locator(".q-opts[data-q='2'] .q-opt[data-v='intim']").click();
  await expect(page.locator("#quizResult")).toHaveClass(/show/);
  await expect(page.locator("#qrCta")).toHaveAttribute("href", /^\/products\//);
});

test("review filters update the active choice and visible cards", async ({ page }) => {
  await page.goto("/");
  const travel = page.locator('.chip[data-f="travel"]');
  await travel.scrollIntoViewIfNeeded();
  await travel.click();
  await expect(travel).toHaveClass(/on/);
  const visibleReviews = page.locator(".rev-card:not(.hidden)");
  await expect(visibleReviews).not.toHaveCount(0);
  const tags = await visibleReviews.evaluateAll((cards) => cards.map((card) => card.getAttribute("data-tags")));
  expect(tags.every((value) => value?.split(/\s+/).includes("travel"))).toBe(true);
});

test("keyboard focus is visible and reduced motion disables FAQ transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  const outlineStyle = await focused.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).not.toBe("none");

  const trigger = page.getByRole("button", { name: /So it's… a wet wipe/i });
  await trigger.scrollIntoViewIfNeeded();
  const answerId = await trigger.getAttribute("aria-controls");
  await trigger.click();
  const duration = await page.locator(`#${answerId}`).evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(duration.split(",").every((value) => Number.parseFloat(value) === 0)).toBe(true);
});

test("cart drawer opens and closes without changing the cart", async ({ page }) => {
  await page.goto("/shop");
  const cartButton = page.getByRole("button", { name: /Cart/ });
  await cartButton.click();
  const drawer = page.locator(".drawer");
  await expect(drawer).toHaveAttribute("role", "dialog");
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Close cart" }).click();
  await expect(drawer).toHaveAttribute("aria-hidden", "true");
});
