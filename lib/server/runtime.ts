import "server-only";
import { createSealer, type Sealer } from "@/lib/server/crypto";
import { discoverEndpoints, refreshTokens, type CustomerAccountConfig } from "@/lib/server/auth/oidc";

// Pinned, not discovered: this is the version our Customer Account API operations are validated against.
const DEFAULT_CUSTOMER_API_VERSION = "2026-10";

let sealer: Sealer | null | undefined;

export function getSealer(): Sealer | null {
  if (sealer !== undefined) return sealer;
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) return (sealer = null);
  return (sealer = createSealer(secret, process.env.SESSION_SECRET_PREVIOUS?.trim() || undefined));
}

export function getCustomerAccountConfig(): CustomerAccountConfig | null {
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim();
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!clientId || !clientSecret || !shopDomain) return null;
  return {
    clientId,
    clientSecret,
    shopDomain,
    apiVersion: process.env.SHOPIFY_CUSTOMER_API_VERSION?.trim() || DEFAULT_CUSTOMER_API_VERSION,
    pkce: process.env.SHOPIFY_CUSTOMER_ACCOUNT_PKCE !== "false",
  };
}

export function accountsEnabled() {
  return Boolean(getCustomerAccountConfig() && getSealer());
}

export function customerRefresher(config: CustomerAccountConfig) {
  return async (refreshToken: string) => refreshTokens(config, await discoverEndpoints(config), refreshToken);
}
