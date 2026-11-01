import { createLocalJWKSet, createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

export type CustomerAccountConfig = { clientId: string; clientSecret: string; shopDomain: string; apiVersion: string; pkce: boolean };

export type OidcEndpoints = {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  endSessionEndpoint: string;
  jwks: JWTVerifyGetKey;
  graphqlEndpoint: string;
};

export type TokenSet = { accessToken: string; refreshToken: string | null; idToken: string | null; expiresIn: number };

// "rejected" means Shopify definitively refused the grant. "unavailable" is transient and safe to retry later.
export class TokenError extends Error {
  constructor(readonly kind: "rejected" | "unavailable", message: string) {
    super(message);
    this.name = "TokenError";
  }
}

export const CUSTOMER_ACCOUNT_SCOPE = "openid email customer-account-api:full";
const USER_AGENT = "Wipelo-Storefront/1.0";
const TIMEOUT_MS = 10_000;
const DISCOVERY_TTL_MS = 60 * 60 * 1000;

let discoveryCache: { key: string; endpoints: OidcEndpoints; expires: number } | null = null;

async function fetchJson(url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (!response.ok) throw new TokenError("unavailable", `Discovery request failed with HTTP ${response.status}`);
  return response.json() as Promise<Record<string, string>>;
}

export async function discoverEndpoints(config: CustomerAccountConfig): Promise<OidcEndpoints> {
  const key = `${config.shopDomain}|${config.apiVersion}`;
  if (discoveryCache?.key === key && discoveryCache.expires > Date.now()) return discoveryCache.endpoints;
  const [openId, customerApi] = await Promise.all([
    fetchJson(`https://${config.shopDomain}/.well-known/openid-configuration`),
    fetchJson(`https://${config.shopDomain}/.well-known/customer-account-api`),
  ]);
  const required = [openId.issuer, openId.authorization_endpoint, openId.token_endpoint, openId.end_session_endpoint, openId.jwks_uri, customerApi.graphql_api];
  if (required.some((value) => typeof value !== "string" || !value)) throw new TokenError("unavailable", "Shopify's discovery documents are incomplete.");
  const endpoints: OidcEndpoints = {
    issuer: openId.issuer,
    authorizationEndpoint: openId.authorization_endpoint,
    tokenEndpoint: openId.token_endpoint,
    endSessionEndpoint: openId.end_session_endpoint,
    jwks: createRemoteJWKSet(new URL(openId.jwks_uri)),
    // Discovery advertises the newest API version. Pin ours so a Shopify release can't change our queries underneath us.
    graphqlEndpoint: customerApi.graphql_api.replace(/\/api\/[^/]+\/graphql/, `/api/${config.apiVersion}/graphql`),
  };
  discoveryCache = { key, endpoints, expires: Date.now() + DISCOVERY_TTL_MS };
  return endpoints;
}

export function buildAuthorizationUrl(input: { config: CustomerAccountConfig; endpoints: OidcEndpoints; redirectUri: string; state: string; nonce: string; codeChallenge?: string }) {
  const url = new URL(input.endpoints.authorizationEndpoint);
  url.searchParams.set("scope", CUSTOMER_ACCOUNT_SCOPE);
  url.searchParams.set("client_id", input.config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("state", input.state);
  url.searchParams.set("nonce", input.nonce);
  if (input.codeChallenge) {
    url.searchParams.set("code_challenge", input.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

async function tokenRequest(config: CustomerAccountConfig, endpoints: OidcEndpoints, body: Record<string, string>): Promise<TokenSet> {
  let response: Response;
  try {
    response = await fetch(endpoints.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({ client_id: config.clientId, ...body }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new TokenError("unavailable", "The Shopify token endpoint could not be reached.");
  }
  const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok || typeof payload?.access_token !== "string") {
    // Only the OAuth error code is kept: bodies can echo request data.
    const code = typeof payload?.error === "string" ? payload.error : `http_${response.status}`;
    const rejected = response.status >= 400 && response.status < 500 && response.status !== 429;
    throw new TokenError(rejected ? "rejected" : "unavailable", `Shopify token request failed: ${code}`);
  }
  return {
    accessToken: payload.access_token,
    refreshToken: typeof payload.refresh_token === "string" ? payload.refresh_token : null,
    idToken: typeof payload.id_token === "string" ? payload.id_token : null,
    expiresIn: Number(payload.expires_in) || 3600,
  };
}

export function exchangeCode(input: { config: CustomerAccountConfig; endpoints: OidcEndpoints; code: string; redirectUri: string; codeVerifier?: string }) {
  return tokenRequest(input.config, input.endpoints, {
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    ...(input.codeVerifier ? { code_verifier: input.codeVerifier } : {}),
  });
}

export function refreshTokens(config: CustomerAccountConfig, endpoints: OidcEndpoints, refreshToken: string) {
  return tokenRequest(config, endpoints, { grant_type: "refresh_token", refresh_token: refreshToken });
}

// Signature, issuer, audience, expiry and nonce. RS256 is the only algorithm Shopify advertises.
export async function verifyIdToken(input: { idToken: string; endpoints: Pick<OidcEndpoints, "issuer" | "jwks">; clientId: string; nonce: string }) {
  const { payload } = await jwtVerify(input.idToken, input.endpoints.jwks, { issuer: input.endpoints.issuer, audience: input.clientId, algorithms: ["RS256"] });
  if (payload.nonce !== input.nonce) throw new Error("ID token nonce mismatch.");
  if (typeof payload.sub !== "string" || !payload.sub) throw new Error("ID token has no subject.");
  return { sub: payload.sub };
}

export function buildLogoutUrl(endpoints: OidcEndpoints, idToken: string, postLogoutRedirectUri: string) {
  const url = new URL(endpoints.endSessionEndpoint);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  return url.toString();
}

export { createLocalJWKSet };
