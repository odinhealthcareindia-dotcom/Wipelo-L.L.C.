import { NextRequest, NextResponse } from "next/server";
import { completeLogin } from "@/lib/server/auth/login-flow";
import { discoverEndpoints } from "@/lib/server/auth/oidc";
import { signInUrl } from "@/lib/server/auth/routes";
import { AUTH_COOKIE, noStore, requestOrigin, setSessionCookies } from "@/lib/server/http";
import { getCustomerAccountConfig, getSealer } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = requestOrigin(request) ?? request.nextUrl.origin;
  const config = getCustomerAccountConfig();
  const sealer = getSealer();
  if (!config || !sealer) return noStore(NextResponse.redirect(signInUrl(origin, "unavailable"), 303));

  const fail = (status: Parameters<typeof signInUrl>[1]) => {
    const response = noStore(NextResponse.redirect(signInUrl(origin, status), 303));
    response.cookies.delete(AUTH_COOKIE());
    return response;
  };

  try {
    const result = await completeLogin({ sealer, config, endpoints: await discoverEndpoints(config) }, {
      params: request.nextUrl.searchParams,
      transactionCookie: request.cookies.get(AUTH_COOKIE())?.value,
    });
    if (!result.ok) return fail(result.reason);
    // Any earlier account's cookies are overwritten here. The storefront compares cart owners on its next load.
    const response = noStore(NextResponse.redirect(`${origin}${result.returnTo}`, 303));
    response.cookies.delete(AUTH_COOKIE());
    setSessionCookies(response, sealer, result.session, result.idToken);
    return response;
  } catch (error) {
    console.error("Customer sign-in callback failed:", error instanceof Error ? error.name : "unknown");
    return fail("provider");
  }
}
