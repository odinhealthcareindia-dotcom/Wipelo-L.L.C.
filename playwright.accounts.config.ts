import { defineConfig, devices } from "@playwright/test";

// Full browser flows against a local mock of Shopify (tests/support/mock-shopify.mjs). This proves our behaviour, not Shopify's.
const port = 3200;
const mockOrigin = "localhost:8443";
const baseURL = `http://127.0.0.1:${port}`;
// ACCOUNTS_E2E_PROD=1 runs against `next build && next start`, which also proves __Host- cookies, Secure and cache headers.
const production = Boolean(process.env.ACCOUNTS_E2E_PROD);

export default defineConfig({
  testDir: "./tests/accounts",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: "line",
  use: { baseURL, ...devices["Desktop Chrome"], ignoreHTTPSErrors: true, trace: "retain-on-failure" },
  webServer: [
    { command: "node tests/support/mock-shopify.mjs", url: `https://${mockOrigin}/__health`, ignoreHTTPSErrors: true, reuseExistingServer: false, timeout: 30_000 },
    {
      command: production ? `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}` : `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 240_000,
      env: {
        NEXT_TEST_DIST_DIR: ".next-accounts-test",
        NODE_TLS_REJECT_UNAUTHORIZED: "0",
        SHOPIFY_STORE_DOMAIN: mockOrigin,
        SHOPIFY_STOREFRONT_ACCESS_TOKEN: "mock-storefront-token",
        SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: "mock-client",
        SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET: "mock-secret",
        SESSION_SECRET: Buffer.alloc(32, 7).toString("base64"),
        APP_ORIGINS: production ? baseURL : "",
        NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL: "",
      },
    },
  ],
});
