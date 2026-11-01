import type { Sealer } from "@/lib/server/crypto";
import type { TokenSet } from "./oidc";

// The session is the cookie: sealed with AES-GCM and HttpOnly, so tokens never reach browser JavaScript and
// no server-side store is needed. The tradeoff is that a stolen cookie can't be revoked from here; sign-out
// clears it and ends the session at Shopify.
export const SESSION_COOKIE_MAX_AGE = 30 * 86_400;
const REFRESH_SKEW_MS = 60_000;
const COALESCE_MS = 30_000;

export type CustomerSession = { sub: string; accessToken: string; refreshToken: string | null; expiresAt: number; refreshedAt: number | null };

export function sessionFromTokens(sub: string, tokens: TokenSet, now = Date.now()): CustomerSession {
  return { sub, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: now + tokens.expiresIn * 1000, refreshedAt: null };
}

export function readSession(sealer: Sealer, cookie: string | undefined): CustomerSession | null {
  const raw = cookie ? sealer.unseal(cookie, "session") : null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
}

export function needsRefresh(session: CustomerSession, now = Date.now()) {
  // A token that's still valid and was just issued gets used. Without this, a lifetime shorter than the skew
  // would send every page straight back to refresh, forever.
  if (session.refreshedAt && now - session.refreshedAt < REFRESH_SKEW_MS && session.expiresAt > now) return false;
  return session.expiresAt - now <= REFRESH_SKEW_MS;
}

const inFlight = new Map<string, { result: Promise<CustomerSession>; expires: number }>();

// Refresh tokens can rotate on use, so requests arriving together in this process share one refresh, and for a
// short time afterwards late arrivals with the old cookie get the same result rather than spending a dead token.
export function refreshSession(session: CustomerSession, refresh: (refreshToken: string) => Promise<TokenSet>, now = Date.now()) {
  const refreshToken = session.refreshToken;
  if (!refreshToken) return Promise.reject(new Error("This session has no refresh token."));
  for (const [key, entry] of inFlight) if (entry.expires <= now) inFlight.delete(key);
  const existing = inFlight.get(refreshToken);
  if (existing) return existing.result;
  const result = refresh(refreshToken).then((next): CustomerSession => ({
    sub: session.sub,
    accessToken: next.accessToken,
    refreshToken: next.refreshToken ?? refreshToken,
    expiresAt: Date.now() + next.expiresIn * 1000,
    refreshedAt: Date.now(),
  }));
  inFlight.set(refreshToken, { result, expires: now + COALESCE_MS });
  result.catch(() => inFlight.delete(refreshToken));
  return result;
}
