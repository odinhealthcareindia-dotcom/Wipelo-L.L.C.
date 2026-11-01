import { generateKeyPairSync } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createLocalJWKSet, exportJWK, importPKCS8, SignJWT } from "jose";
import { completeLogin, startLogin, type LoginDeps } from "../../lib/server/auth/login-flow";
import type { OidcEndpoints } from "../../lib/server/auth/oidc";
import { sealer } from "./support";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const otherKey = generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey;
const ISSUER = "https://shopify.com/authentication/1";

async function idToken(claims: Record<string, unknown>, options: { key?: typeof privateKey; expires?: string; issuer?: string; audience?: string } = {}) {
  const key = await importPKCS8((options.key ?? privateKey).export({ type: "pkcs8", format: "pem" }).toString(), "RS256");
  return new SignJWT(claims).setProtectedHeader({ alg: "RS256", kid: "k" }).setIssuer(options.issuer ?? ISSUER).setAudience(options.audience ?? "client").setIssuedAt().setExpirationTime(options.expires ?? "1h").sign(key);
}

async function setup(tokenResponse: (body: URLSearchParams, nonce: string) => Promise<Response>) {
  const jwk = { ...(await exportJWK(publicKey)), kid: "k", alg: "RS256" };
  const endpoints: OidcEndpoints = { issuer: ISSUER, authorizationEndpoint: "https://shopify.com/authorize", tokenEndpoint: "https://shopify.com/token", endSessionEndpoint: "https://shopify.com/logout", graphqlEndpoint: "https://shopify.com/gql", jwks: createLocalJWKSet({ keys: [jwk] }) };
  const deps: LoginDeps = { sealer, endpoints, config: { clientId: "client", clientSecret: "secret", shopDomain: "x.myshopify.com", apiVersion: "2026-10", pkce: true } };
  const started = startLogin(deps, { returnTo: "/account/orders", redirectUri: "https://wipelo.com/api/auth/callback" });
  const url = new URL(started.url);
  const state = url.searchParams.get("state")!;
  const nonce = url.searchParams.get("nonce")!;
  const requests: { headers: Headers; body: URLSearchParams }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body as URLSearchParams;
    requests.push({ headers: new Headers(init?.headers), body });
    return tokenResponse(body, nonce);
  }) as typeof fetch;
  return { deps, started, url, state, nonce, requests, restore: () => { globalThis.fetch = original; } };
}

const okTokens = (token: string) => Response.json({ access_token: "a", refresh_token: "r", id_token: token, expires_in: 3600 });
const params = (values: Record<string, string>) => new URLSearchParams(values);

test.describe.configure({ mode: "serial" });

test("authorize URL carries the documented parameters and no secrets", async () => {
  const context = await setup(async () => new Response());
  context.restore();
  const { searchParams } = context.url;
  expect(searchParams.get("scope")).toBe("openid email customer-account-api:full");
  expect(searchParams.get("response_type")).toBe("code");
  expect(searchParams.get("client_id")).toBe("client");
  expect(searchParams.get("redirect_uri")).toBe("https://wipelo.com/api/auth/callback");
  expect(searchParams.get("code_challenge_method")).toBe("S256");
  expect(context.url.toString()).not.toContain("secret");
});

test("the sign-in cookie hides the verifier and nonce", async () => {
  const context = await setup(async () => new Response());
  context.restore();
  expect(context.started.cookie).not.toContain(context.nonce);
  expect(sealer.unseal(context.started.cookie, "session")).toBeNull();
});

test("a valid callback creates a session and returns to the requested page", async () => {
  const context = await setup(async (_body, nonce) => okTokens(await idToken({ sub: "customer-1", nonce })));
  const result = await completeLogin(context.deps, { params: params({ code: "c", state: context.state, iss: ISSUER }), transactionCookie: context.started.cookie });
  context.restore();
  expect(result).toMatchObject({ ok: true, returnTo: "/account/orders", session: { sub: "customer-1", accessToken: "a", refreshToken: "r" } });
  // The token request uses HTTP Basic, sends the PKCE verifier and matches the redirect URI.
  const { headers, body } = context.requests[0];
  expect(headers.get("authorization")).toBe(`Basic ${Buffer.from("client:secret").toString("base64")}`);
  expect(headers.get("user-agent")).toBeTruthy();
  expect(body.get("code_verifier")).toBeTruthy();
  expect(body.get("redirect_uri")).toBe("https://wipelo.com/api/auth/callback");
});

test("a replayed callback without the cookie is refused and never reaches Shopify", async () => {
  const context = await setup(async () => new Response());
  const result = await completeLogin(context.deps, { params: params({ code: "c", state: context.state }), transactionCookie: undefined });
  context.restore();
  expect(result).toEqual({ ok: false, reason: "expired" });
  expect(context.requests).toHaveLength(0);
});

test("a replayed code that Shopify refuses reads as expired", async () => {
  const context = await setup(async () => Response.json({ error: "invalid_grant" }, { status: 400 }));
  const result = await completeLogin(context.deps, { params: params({ code: "used", state: context.state }), transactionCookie: context.started.cookie });
  context.restore();
  expect(result).toEqual({ ok: false, reason: "expired" });
});

test("cancelled sign-in is reported as cancelled", async () => {
  const context = await setup(async () => new Response());
  const result = await completeLogin(context.deps, { params: params({ error: "access_denied", state: context.state }), transactionCookie: context.started.cookie });
  context.restore();
  expect(result).toEqual({ ok: false, reason: "cancelled" });
  expect(context.requests).toHaveLength(0);
});

for (const [error, reason] of [["invalid_scope", "permission"], ["unauthorized_client", "permission"], ["server_error", "provider"]]) {
  test(`provider error ${error} maps to ${reason}`, async () => {
    const context = await setup(async () => new Response());
    const result = await completeLogin(context.deps, { params: params({ error, state: context.state }), transactionCookie: context.started.cookie });
    context.restore();
    expect(result).toEqual({ ok: false, reason });
  });
}

test("a forged state and missing parameters are refused (login CSRF)", async () => {
  const context = await setup(async () => new Response());
  const cookie = context.started.cookie;
  expect(await completeLogin(context.deps, { params: params({ code: "c", state: "forged" }), transactionCookie: cookie })).toEqual({ ok: false, reason: "invalid" });
  expect(await completeLogin(context.deps, { params: params({ code: "c" }), transactionCookie: cookie })).toEqual({ ok: false, reason: "invalid" });
  expect(await completeLogin(context.deps, { params: params({ state: context.state }), transactionCookie: cookie })).toEqual({ ok: false, reason: "invalid" });
  context.restore();
  expect(context.requests).toHaveLength(0);
});

test("a tampered cookie and an expired attempt are refused", async () => {
  const context = await setup(async () => new Response());
  expect(await completeLogin(context.deps, { params: params({ code: "c", state: context.state }), transactionCookie: "v1.a.b.c" })).toEqual({ ok: false, reason: "expired" });
  const later = { ...context.deps, now: () => Date.now() + 11 * 60_000 };
  expect(await completeLogin(later, { params: params({ code: "c", state: context.state }), transactionCookie: context.started.cookie })).toEqual({ ok: false, reason: "expired" });
  context.restore();
});

test("a mismatched issuer parameter is refused", async () => {
  const context = await setup(async () => new Response());
  const result = await completeLogin(context.deps, { params: params({ code: "c", state: context.state, iss: "https://evil.example" }), transactionCookie: context.started.cookie });
  context.restore();
  expect(result).toEqual({ ok: false, reason: "invalid" });
});

const badTokens: [string, (nonce: string) => Promise<string>][] = [
  ["wrong nonce", () => idToken({ sub: "c", nonce: "other" })],
  ["wrong audience", (nonce) => idToken({ sub: "c", nonce }, { audience: "someone-else" })],
  ["wrong issuer", (nonce) => idToken({ sub: "c", nonce }, { issuer: "https://evil.example" })],
  ["expired", (nonce) => idToken({ sub: "c", nonce }, { expires: "-1h" })],
  ["forged signature", (nonce) => idToken({ sub: "c", nonce }, { key: otherKey })],
  ["no subject", (nonce) => idToken({ nonce })],
];
for (const [name, build] of badTokens) {
  test(`an ID token with ${name} creates no session`, async () => {
    const context = await setup(async (_body, nonce) => okTokens(await build(nonce)));
    const result = await completeLogin(context.deps, { params: params({ code: "c", state: context.state }), transactionCookie: context.started.cookie });
    context.restore();
    expect(result).toEqual({ ok: false, reason: "invalid" });
  });
}

test("a provider outage is reported as such", async () => {
  const context = await setup(async () => new Response("down", { status: 503 }));
  expect(await completeLogin(context.deps, { params: params({ code: "c", state: context.state }), transactionCookie: context.started.cookie })).toEqual({ ok: false, reason: "provider" });
  context.restore();
});
