import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { baseCookie, SESSION_COOKIE } from "@/lib/server/http";
import { SESSION_COOKIE_MAX_AGE, needsRefresh, readSession, refreshSession, type CustomerSession } from "@/lib/server/auth/sessions";
import { TokenError } from "@/lib/server/auth/oidc";
import { customerRefresher, getCustomerAccountConfig, getSealer } from "@/lib/server/runtime";
import { CustomerApiError, customerGraphql } from "./customer-graphql";

const RECENT_REFRESH_MS = 60_000;

// One lookup per render. The session is the only source of identity: no customer ID is ever accepted from the browser.
const currentSession = cache(async (): Promise<CustomerSession | null> => {
  // Cookies first: returning early would let Next prerender a signed-out page at build time and serve it to everyone.
  const cookie = (await cookies()).get(SESSION_COOKIE())?.value;
  const sealer = getSealer();
  return sealer ? readSession(sealer, cookie) : null;
});

function signInRedirect(returnTo: string, status?: "session-ended"): never {
  const query = new URLSearchParams({ returnTo, ...(status ? { status } : {}) });
  redirect(`/account/sign-in?${query}`);
}

const refreshRedirect = (returnTo: string): never => redirect(`/api/auth/refresh?${new URLSearchParams({ returnTo })}`);

export async function requireCustomer(returnTo: string) {
  const session = await currentSession();
  if (!session) signInRedirect(returnTo);
  return session;
}

export async function isSignedIn() {
  return Boolean(await currentSession());
}

function requireConfig() {
  const config = getCustomerAccountConfig();
  if (!config) throw new CustomerApiError("Customer accounts aren't configured.");
  return config;
}

// For pages. Server Components can't write cookies, so an expired token goes through the refresh route and comes back.
export async function accountQuery<T>(returnTo: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const session = await requireCustomer(returnTo);
  if (needsRefresh(session)) refreshRedirect(returnTo);
  try {
    return await customerGraphql<T>(requireConfig(), session.accessToken, query, variables);
  } catch (error) {
    if (error instanceof CustomerApiError && error.code === "unauthorized") {
      // A token refused straight after a refresh won't improve with another one.
      if (session.refreshedAt && Date.now() - session.refreshedAt < RECENT_REFRESH_MS) signInRedirect(returnTo, "session-ended");
      refreshRedirect(returnTo);
    }
    throw error;
  }
}

export type ActionState = { status: "idle" | "success" | "error"; message?: string; fields?: Record<string, string>; values?: Record<string, string> };
export type UserError = { field?: string[] | null; message: string };

// Server Actions are public endpoints, so this re-checks the session every time. Unlike pages, they can write cookies.
async function refreshedToken(session: CustomerSession, returnTo: string) {
  const sealer = getSealer();
  if (!sealer) throw new CustomerApiError("Customer accounts aren't configured.");
  try {
    const next = await refreshSession(session, customerRefresher(requireConfig()));
    (await cookies()).set(SESSION_COOKIE(), sealer.seal(JSON.stringify(next), "session"), { ...baseCookie(), maxAge: SESSION_COOKIE_MAX_AGE });
    return next.accessToken;
  } catch (error) {
    if (error instanceof TokenError && error.kind === "unavailable") throw new CustomerApiError("Shopify could not be reached.");
    signInRedirect(returnTo, "session-ended");
  }
}

export async function accountMutation<T>(returnTo: string, query: string, variables: Record<string, unknown>): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const session = await requireCustomer(returnTo);
  try {
    const token = needsRefresh(session) ? await refreshedToken(session, returnTo) : session.accessToken;
    try {
      return { ok: true, data: await customerGraphql<T>(requireConfig(), token, query, variables) };
    } catch (error) {
      // A 401 means the request never ran, so even a mutation is safe to send again with a new token.
      if (!(error instanceof CustomerApiError && error.code === "unauthorized")) throw error;
      return { ok: true, data: await customerGraphql<T>(requireConfig(), await refreshedToken(session, returnTo), query, variables) };
    }
  } catch (error) {
    if (error instanceof CustomerApiError) {
      console.warn("Account change failed:", error.message);
      if (error.code === "unauthorized") signInRedirect(returnTo, "session-ended");
      return { ok: false, message: error.code === "denied" ? "Your account can't make this change right now." : "We couldn't save that. Please try again." };
    }
    throw error;
  }
}
