import { NextRequest, NextResponse } from "next/server";
import { AUTH_TRANSACTION_TTL_SECONDS, startLogin } from "@/lib/server/auth/login-flow";
import { discoverEndpoints } from "@/lib/server/auth/oidc";
import { signInUrl } from "@/lib/server/auth/routes";
import { AUTH_COOKIE, baseCookie, noStore, requestOrigin } from "@/lib/server/http";
import { getCustomerAccountConfig, getSealer } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request);
  const config = getCustomerAccountConfig();
  const sealer = getSealer();
  if (!origin || !config || !sealer) return noStore(NextResponse.redirect(signInUrl(origin ?? request.nextUrl.origin, "unavailable"), 303));

  try {
    const { url, cookie } = startLogin({ sealer, config, endpoints: await discoverEndpoints(config) }, { returnTo: request.nextUrl.searchParams.get("returnTo"), redirectUri: `${origin}/api/auth/callback` });
    const response = noStore(NextResponse.redirect(url, 303));
    response.cookies.set(AUTH_COOKIE(), cookie, { ...baseCookie(), maxAge: AUTH_TRANSACTION_TTL_SECONDS });
    return response;
  } catch (error) {
    console.error("Could not start customer sign-in:", error instanceof Error ? error.name : "unknown");
    return noStore(NextResponse.redirect(signInUrl(origin, "provider"), 303));
  }
}
