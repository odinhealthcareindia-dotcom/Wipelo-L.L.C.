import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { expect, test } from "@playwright/test";

const baselineCss = readFileSync(path.join(process.cwd(), "tests/visual/legacy-baseline.css"), "utf8");
const allRoutes = [
  "/",
  "/shop",
  "/science",
  "/our-story",
  "/manage-subscription",
  "/collections/all",
  "/products/her",
  "/products/on-the-go",
  "/products/spotless",
  "/missing-page",
];
const allViewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
];
const routes = process.env.VISUAL_ROUTE ? [process.env.VISUAL_ROUTE] : allRoutes;
const viewports = process.env.VISUAL_WIDTH
  ? allViewports.filter((viewport) => viewport.width === Number(process.env.VISUAL_WIDTH))
  : allViewports;
const freezeMotion = "*,*::before,*::after{animation:none!important;transition:none!important}html{scroll-behavior:auto!important}";

async function changedPixelRatio(before: Buffer, after: Buffer) {
  const a = await sharp(before).raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(after).raw().toBuffer({ resolveWithObject: true });
  expect(a.info.width).toBe(b.info.width);
  const channels = a.info.channels;
  const rowBytes = a.info.width * channels;
  const maxHeight = Math.max(a.info.height, b.info.height);
  const ratios = [-1, 0, 1].map((offsetY) => {
    let changed = 0;
    for (let row = 0; row < maxHeight; row += 1) {
      const otherRow = row - offsetY;
      if (row >= a.info.height || otherRow < 0 || otherRow >= b.info.height) {
        changed += a.info.width;
        continue;
      }
      for (let column = 0; column < a.info.width; column += 1) {
        const left = row * rowBytes + column * channels;
        const right = otherRow * rowBytes + column * channels;
        let delta = 0;
        for (let channel = 0; channel < channels; channel += 1) {
          delta = Math.max(delta, Math.abs(a.data[left + channel] - b.data[right + channel]));
        }
        if (delta > 4) changed += 1;
      }
    }
    return changed / (a.info.width * maxHeight);
  });
  return Math.min(...ratios);
}

test("active routes preserve their legacy design at desktop and mobile sizes", async ({ page }) => {
  test.setTimeout(300_000);
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      runtimeErrors.length = 0;
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      if (route === "/missing-page") expect(response?.status()).toBe(404);
      else expect(response?.status(), route).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(80);
      const unexpectedErrors = runtimeErrors.filter((error) => !(route === "/missing-page" && error === "Failed to load resource: the server responded with a status of 404 (Not Found)"));
      expect(unexpectedErrors, `${route} emitted browser or hydration errors`).toEqual([]);

      // Compare both styles against one render and one Shopify response so live
      // catalog changes cannot create a false visual regression.
      const originalStyles = await page.addStyleTag({ content: baselineCss });
      const freezeOriginal = await page.addStyleTag({ content: freezeMotion });
      await page.evaluate(() => document.getAnimations().forEach((animation) => animation.pause()));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const before = await page.screenshot({ fullPage: true, animations: "disabled" });
      await originalStyles.evaluate((element) => (element as HTMLElement).remove());
      await freezeOriginal.evaluate((element) => (element as HTMLElement).remove());
      const freezeMigrated = await page.addStyleTag({ content: freezeMotion });
      await page.evaluate(() => document.getAnimations().forEach((animation) => animation.pause()));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const after = await page.screenshot({ fullPage: true, animations: "disabled" });
      await freezeMigrated.evaluate((element) => (element as HTMLElement).remove());
      const ratio = await changedPixelRatio(before, after);
      expect(ratio, `${route} at ${viewport.width}px changed ${(ratio * 100).toFixed(3)}% of pixels`).toBeLessThan(0.01);
    }
  }
});
