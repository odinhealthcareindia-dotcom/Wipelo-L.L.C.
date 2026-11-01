import { NextRequest, NextResponse } from "next/server";
import { buildLogoutUrl, discoverEndpoints } from "@/lib/server/auth/oidc";
import { clearSessionCookies, ID_TOKEN_COOKIE, isSameOrigin, noStore, requestOrigin } from "@/lib/server/http";
import { getCustomerAccountConfig, getSealer } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

// Ends the session here and at Shopify. The account cart stays on the customer record for next time. The storefront
// sees it is signed out on the next page load and drops the browser's copy of the cart ID, so the next person starts empty.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return noStore(NextResponse.json({ error: "Invalid request origin." }, { status: 403 }));
  const origin = requestOrigin(request) ?? request.nextUrl.origin;
  const sealer = getSealer();
  const config = getCustomerAccountConfig();
  const sealedIdToken = request.cookies.get(ID_TOKEN_COOKIE())?.value;
  const idToken = sealer && sealedIdToken ? sealer.unseal(sealedIdToken, "id-token") : null;

  let destination = `${origin}/`;
  if (idToken && config) {
    try {
      destination = buildLogoutUrl(await discoverEndpoints(config), idToken, `${origin}/`);
    } catch (error) {
      console.error("Could not reach Shopify to sign out:", error instanceof Error ? error.name : "unknown");
    }
  }
  const response = noStore(NextResponse.redirect(destination, 303));
  clearSessionCookies(response);
  return response;
}
