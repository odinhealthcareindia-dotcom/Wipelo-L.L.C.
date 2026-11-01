import { NextRequest, NextResponse } from "next/server";
import { TokenError } from "@/lib/server/auth/oidc";
import { safeReturnTo } from "@/lib/server/auth/return-to";
import { signInUrl } from "@/lib/server/auth/routes";
import { readSession, refreshSession } from "@/lib/server/auth/sessions";
import { clearSessionCookies, noStore, requestOrigin, SESSION_COOKIE, setSessionCookies } from "@/lib/server/http";
import { customerRefresher, getCustomerAccountConfig, getSealer } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

// Server Components can't write cookies, so account pages come through here when the access token has expired.
export async function GET(request: NextRequest) {
  const origin = requestOrigin(request) ?? request.nextUrl.origin;
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
  const config = getCustomerAccountConfig();
  const sealer = getSealer();
  if (!config || !sealer) return noStore(NextResponse.redirect(signInUrl(origin, "unavailable"), 303));
  const session = readSession(sealer, request.cookies.get(SESSION_COOKIE())?.value);
  const signedOut = () => {
    const response = noStore(NextResponse.redirect(signInUrl(origin, "session-ended", returnTo), 303));
    clearSessionCookies(response);
    return response;
  };
  if (!session) return signedOut();
  try {
    const response = noStore(NextResponse.redirect(`${origin}${returnTo}`, 303));
    setSessionCookies(response, sealer, await refreshSession(session, customerRefresher(config)));
    return response;
  } catch (error) {
    if (error instanceof TokenError && error.kind === "unavailable") return noStore(NextResponse.redirect(signInUrl(origin, "provider", returnTo), 303));
    return signedOut();
  }
}
