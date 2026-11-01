import { NextRequest, NextResponse } from "next/server";
import type { AccountSession } from "@/lib/cart-types";
import { readSession } from "@/lib/server/auth/sessions";
import { sha256 } from "@/lib/server/crypto";
import { noStore, SESSION_COOKIE } from "@/lib/server/http";
import { accountsEnabled, getSealer } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

// Tells the storefront whether anyone is signed in. Reads only the cookie, so it stays cheap on every page load.
export async function GET(request: NextRequest) {
  const sealer = getSealer();
  const session = sealer ? readSession(sealer, request.cookies.get(SESSION_COOKIE())?.value) : null;
  const body: AccountSession = { enabled: accountsEnabled(), signedIn: Boolean(session), owner: session ? sha256(session.sub).slice(0, 16) : null };
  return noStore(NextResponse.json(body));
}
