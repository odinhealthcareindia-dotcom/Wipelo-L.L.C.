import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_MAX_AGE, type CustomerSession } from "@/lib/server/auth/sessions";
import type { Sealer } from "@/lib/server/crypto";

const production = () => process.env.NODE_ENV === "production";

// __Host- makes the browser enforce Secure, Path=/ and no Domain, so a sibling subdomain can't plant or read these.
const cookieName = (name: string) => (production() ? `__Host-${name}` : name);
export const SESSION_COOKIE = () => cookieName("wipelo_session");
export const ID_TOKEN_COOKIE = () => cookieName("wipelo_id");
export const AUTH_COOKIE = () => cookieName("wipelo_auth");

export const baseCookie = () => ({ httpOnly: true, secure: production(), sameSite: "lax" as const, path: "/" });

function configuredOrigins() {
  return (process.env.APP_ORIGINS ?? "").split(",").map((origin) => origin.trim().replace(/\/$/, "")).filter(Boolean);
}

// Built from an allowlist in production, so a forged Host header can't redirect sign-in somewhere else.
export function requestOrigin(request: NextRequest) {
  const allowed = configuredOrigins();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const candidate = host ? `${protocol}://${host}` : request.nextUrl.origin;
  if (allowed.includes(candidate)) return candidate;
  if (allowed.length) return allowed[0];
  if (production()) return null;
  return candidate;
}

// Browsers always send Origin on POST, so a missing one isn't a browser form or fetch from our pages.
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = configuredOrigins();
  if (allowed.length) return allowed.includes(origin);
  return origin === requestOrigin(request);
}

export function clientIp(request: NextRequest) {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export function noStore<T extends NextResponse>(response: T) {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export function setSessionCookies(response: NextResponse, sealer: Sealer, session: CustomerSession, idToken?: string | null) {
  response.cookies.set(SESSION_COOKIE(), sealer.seal(JSON.stringify(session), "session"), { ...baseCookie(), maxAge: SESSION_COOKIE_MAX_AGE });
  // Only needed as a logout hint, so it has its own cookie and each stays well under the 4 KB browser limit.
  if (idToken) response.cookies.set(ID_TOKEN_COOKIE(), sealer.seal(idToken, "id-token"), { ...baseCookie(), maxAge: SESSION_COOKIE_MAX_AGE });
}

export function clearSessionCookies(response: NextResponse) {
  for (const name of [SESSION_COOKIE(), ID_TOKEN_COOKIE(), AUTH_COOKIE()]) response.cookies.set(name, "", { ...baseCookie(), maxAge: 0 });
}
