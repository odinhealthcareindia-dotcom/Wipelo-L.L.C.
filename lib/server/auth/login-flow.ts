import { randomToken, safeEqual, sha256Base64Url, type Sealer } from "@/lib/server/crypto";
import { buildAuthorizationUrl, exchangeCode, TokenError, verifyIdToken, type CustomerAccountConfig, type OidcEndpoints } from "./oidc";
import { safeReturnTo } from "./return-to";
import { sessionFromTokens, type CustomerSession } from "./sessions";

export const AUTH_TRANSACTION_TTL_SECONDS = 600;

type Transaction = { state: string; nonce: string; codeVerifier: string | null; returnTo: string; redirectUri: string; expiresAt: number };

export type LoginDeps = { sealer: Sealer; config: CustomerAccountConfig; endpoints: OidcEndpoints; now?: () => number };

// The sign-in attempt lives in a sealed, short-lived cookie, which also ties the callback to this browser.
export function startLogin(deps: LoginDeps, input: { returnTo: unknown; redirectUri: string }) {
  const now = deps.now?.() ?? Date.now();
  const transaction: Transaction = {
    state: randomToken(),
    nonce: randomToken(),
    codeVerifier: deps.config.pkce ? randomToken(48) : null,
    returnTo: safeReturnTo(input.returnTo),
    redirectUri: input.redirectUri,
    expiresAt: now + AUTH_TRANSACTION_TTL_SECONDS * 1000,
  };
  return {
    cookie: deps.sealer.seal(JSON.stringify(transaction), "oauth"),
    url: buildAuthorizationUrl({
      config: deps.config,
      endpoints: deps.endpoints,
      redirectUri: input.redirectUri,
      state: transaction.state,
      nonce: transaction.nonce,
      ...(transaction.codeVerifier ? { codeChallenge: sha256Base64Url(transaction.codeVerifier) } : {}),
    }),
  };
}

export type LoginFailure = "cancelled" | "expired" | "invalid" | "permission" | "provider";
export type LoginResult = { ok: true; session: CustomerSession; idToken: string; returnTo: string } | { ok: false; reason: LoginFailure };

const failure = (reason: LoginFailure): LoginResult => ({ ok: false, reason });

// Replays fail twice over: the route clears the cookie after any callback, and Shopify's codes are single-use.
export async function completeLogin(deps: LoginDeps, input: { params: URLSearchParams; transactionCookie: string | undefined }): Promise<LoginResult> {
  const { params } = input;
  const providerError = params.get("error");
  if (providerError) {
    if (providerError === "access_denied") return failure("cancelled");
    if (providerError === "unauthorized_client" || providerError === "invalid_scope") return failure("permission");
    return failure("provider");
  }

  const state = params.get("state");
  const code = params.get("code");
  if (!state || !code) return failure("invalid");
  const raw = input.transactionCookie ? deps.sealer.unseal(input.transactionCookie, "oauth") : null;
  if (!raw) return failure("expired");
  const transaction = JSON.parse(raw) as Transaction;
  if (transaction.expiresAt <= (deps.now?.() ?? Date.now())) return failure("expired");
  if (!safeEqual(state, transaction.state)) return failure("invalid");
  const issuer = params.get("iss");
  if (issuer && issuer !== deps.endpoints.issuer) return failure("invalid");

  try {
    const tokens = await exchangeCode({ config: deps.config, endpoints: deps.endpoints, code, redirectUri: transaction.redirectUri, ...(transaction.codeVerifier ? { codeVerifier: transaction.codeVerifier } : {}) });
    if (!tokens.idToken) return failure("provider");
    const { sub } = await verifyIdToken({ idToken: tokens.idToken, endpoints: deps.endpoints, clientId: deps.config.clientId, nonce: transaction.nonce });
    return { ok: true, session: sessionFromTokens(sub, tokens), idToken: tokens.idToken, returnTo: safeReturnTo(transaction.returnTo) };
  } catch (error) {
    if (error instanceof TokenError) return failure(error.kind === "rejected" ? "expired" : "provider");
    console.error("Customer sign-in failed ID token validation:", error instanceof Error ? error.name : "unknown");
    return failure("invalid");
  }
}
