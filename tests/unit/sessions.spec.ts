import { expect, test } from "@playwright/test";
import { TokenError, type TokenSet } from "../../lib/server/auth/oidc";
import { needsRefresh, readSession, refreshSession, sessionFromTokens, type CustomerSession } from "../../lib/server/auth/sessions";
import { sealer } from "./support";

const tokens = (overrides: Partial<TokenSet> = {}): TokenSet => ({ accessToken: "access-1", refreshToken: "refresh-1", idToken: "id-1", expiresIn: 3600, ...overrides });
let unique = 0;
const session = (overrides: Partial<CustomerSession> = {}): CustomerSession => ({ ...sessionFromTokens("customer", tokens({ refreshToken: `refresh-${unique++}-${Date.now()}` })), ...overrides });

test("the sealed cookie round-trips and hides its tokens", () => {
  const cookie = sealer.seal(JSON.stringify(session({ accessToken: "visible-token" })), "session");
  expect(cookie).not.toContain("visible-token");
  expect(readSession(sealer, cookie)?.accessToken).toBe("visible-token");
});

test("a realistic session stays well under the 4 KB cookie limit", () => {
  const cookie = sealer.seal(JSON.stringify(session({ accessToken: `shcat_${"x".repeat(1000)}`, refreshToken: `shcrt_${"y".repeat(1000)}` })), "session");
  expect(cookie.length).toBeLessThan(4000);
});

test("missing, tampered and foreign cookies read as signed out", () => {
  expect(readSession(sealer, undefined)).toBeNull();
  expect(readSession(sealer, "not-sealed")).toBeNull();
  expect(readSession(sealer, sealer.seal("{}", "oauth"))).toBeNull();
  expect(readSession(sealer, sealer.seal("not json", "session"))).toBeNull();
});

test("tokens refresh just before they expire, not after", () => {
  const now = Date.now();
  expect(needsRefresh(session({ expiresAt: now + 3_600_000 }), now)).toBe(false);
  expect(needsRefresh(session({ expiresAt: now + 30_000 }), now)).toBe(true);
  expect(needsRefresh(session({ expiresAt: now - 1 }), now)).toBe(true);
});

test("a just-refreshed token is used even if its lifetime is shorter than the skew, so pages can't loop", () => {
  const now = Date.now();
  expect(needsRefresh(session({ expiresAt: now + 30_000, refreshedAt: now - 1000 }), now)).toBe(false);
  // Once it has really expired, or the refresh is no longer recent, it refreshes again.
  expect(needsRefresh(session({ expiresAt: now - 1, refreshedAt: now - 1000 }), now)).toBe(true);
  expect(needsRefresh(session({ expiresAt: now + 30_000, refreshedAt: now - 120_000 }), now)).toBe(true);
});

test("twenty concurrent requests with one cookie share a single refresh", async () => {
  let calls = 0;
  const current = session();
  const refresh = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 40));
    return tokens({ accessToken: "access-2", refreshToken: "refresh-2" });
  };
  const results = await Promise.all(Array.from({ length: 20 }, () => refreshSession(current, refresh)));
  expect(calls).toBe(1);
  expect(new Set(results.map((item) => item.accessToken))).toEqual(new Set(["access-2"]));
});

test("a late request with the old cookie reuses the result instead of spending a dead token", async () => {
  let calls = 0;
  const current = session();
  const refresh = async () => {
    calls += 1;
    return tokens({ accessToken: "access-2" });
  };
  await refreshSession(current, refresh);
  expect((await refreshSession(current, refresh)).accessToken).toBe("access-2");
  expect(calls).toBe(1);
});

test("a refresh with no new refresh token keeps the old one and records when it happened", async () => {
  const current = session({ refreshToken: `keep-${Date.now()}` });
  const next = await refreshSession(current, async () => ({ accessToken: "access-2", refreshToken: null, idToken: null, expiresIn: 3600 }));
  expect(next.refreshToken).toBe(current.refreshToken);
  expect(next.sub).toBe("customer");
  expect(next.refreshedAt).not.toBeNull();
});

test("a failed refresh isn't remembered, so a later attempt can succeed", async () => {
  const current = session();
  await expect(refreshSession(current, async () => { throw new TokenError("unavailable", "down"); })).rejects.toBeInstanceOf(TokenError);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect((await refreshSession(current, async () => tokens({ accessToken: "access-2" }))).accessToken).toBe("access-2");
});

test("a session with no refresh token can't refresh", async () => {
  await expect(refreshSession(session({ refreshToken: null }), async () => tokens())).rejects.toThrow();
});
