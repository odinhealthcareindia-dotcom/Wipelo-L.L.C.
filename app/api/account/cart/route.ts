import { NextRequest, NextResponse } from "next/server";
import type { CartResponse } from "@/lib/cart-types";
import { CustomerApiError, customerGraphql } from "@/lib/server/account/customer-graphql";
import { createSavedCartStore } from "@/lib/server/account/saved-cart";
import { TokenError } from "@/lib/server/auth/oidc";
import { needsRefresh, readSession, refreshSession } from "@/lib/server/auth/sessions";
import { CartUnavailableError, createStorefrontCartGateway, toPublicCart } from "@/lib/server/cart/gateway";
import { CartMergeError, syncAccountCart } from "@/lib/server/cart/merge";
import { clientIp, isSameOrigin, noStore, SESSION_COOKIE, setSessionCookies } from "@/lib/server/http";
import { customerRefresher, getCustomerAccountConfig, getSealer } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

const isCartId = (value: unknown): value is string => typeof value === "string" && value.startsWith("gid://shopify/Cart/") && value.length < 512;

function reply(body: CartResponse, status = 200) {
  return noStore(NextResponse.json(body, { status }));
}

// Merges this browser's cart with the one saved on the customer record, saves the result there, and returns it.
// `checkout: true` also returns a URL that opens checkout signed in.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return reply({ cart: null, notices: [], error: "Invalid request origin." }, 403);
  const config = getCustomerAccountConfig();
  const sealer = getSealer();
  let session = config && sealer ? readSession(sealer, request.cookies.get(SESSION_COOKIE())?.value) : null;
  if (!config || !sealer || !session) return reply({ cart: null, notices: [], error: "Not signed in." }, 401);

  const body = await request.json().catch(() => ({})) as { cartId?: unknown; checkout?: unknown };
  if (body.cartId != null && !isCartId(body.cartId)) return reply({ cart: null, notices: [], error: "That isn't a valid cart." }, 400);

  let refreshed = false;
  try {
    if (needsRefresh(session)) {
      session = await refreshSession(session, customerRefresher(config));
      refreshed = true;
    }
  } catch (error) {
    if (error instanceof TokenError && error.kind === "unavailable") return reply({ cart: null, notices: [], error: "We couldn't reach the store." }, 502);
    // The cookie is left alone: another request may have just rotated it. The next page load settles it through /api/auth/refresh.
    return reply({ cart: null, notices: [], error: "Your session has expired." }, 401);
  }

  const finish = (response: NextResponse) => {
    if (refreshed && session) setSessionCookies(response, sealer, session);
    return response;
  };

  try {
    const token = session.accessToken;
    const saved = createSavedCartStore((query, variables) => customerGraphql(config, token, query, variables));
    const result = await syncAccountCart({ gateway: createStorefrontCartGateway(clientIp(request)), saved }, { localCartId: body.cartId ?? null, customerAccessToken: token });
    const cart = toPublicCart(result.cart);
    if (cart && body.checkout) {
      const url = new URL(cart.checkoutUrl);
      // Either route to a recognised checkout: the attached customer, or Shopify's own session check if attaching failed.
      if (result.attached) url.searchParams.set("logged_in", "true");
      else url.searchParams.set("sso", "silent");
      cart.checkoutUrl = url.toString();
    }
    return finish(reply({ cart, notices: result.notices }));
  } catch (error) {
    if (error instanceof CustomerApiError && error.code === "unauthorized") return finish(reply({ cart: null, notices: [], error: "Your session has expired." }, 401));
    if (error instanceof CartMergeError || error instanceof CartUnavailableError || error instanceof CustomerApiError) {
      console.warn("Cart sync will retry:", error.message);
      return finish(reply({ cart: null, notices: [{ kind: "warning", message: "We couldn't sync this cart to your account yet. Your items are safe and we'll try again." }], error: "Cart sync failed." }, 502));
    }
    throw error;
  }
}
