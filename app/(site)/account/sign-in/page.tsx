import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/server/account/api";
import { safeReturnTo } from "@/lib/server/auth/return-to";
import { accountsEnabled } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const STATUS_MESSAGES: Record<string, { tone: "info" | "error"; text: string }> = {
  cancelled: { tone: "info", text: "Sign-in was cancelled. Nothing changed, and your cart is still here." },
  expired: { tone: "error", text: "That sign-in link has expired or was already used. Please start again." },
  invalid: { tone: "error", text: "We couldn't verify that sign-in. Please start again from this page." },
  permission: { tone: "error", text: "Sign-in isn't available for this store right now. Please contact Wipelo." },
  provider: { tone: "error", text: "We couldn't reach the sign-in service. Please try again in a moment." },
  unavailable: { tone: "error", text: "Accounts aren't available right now. You can still shop and check out as a guest." },
  "session-ended": { tone: "info", text: "Your session ended. Please sign in again to continue." },
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const enabled = accountsEnabled();
  if (enabled && !params.status && await isSignedIn()) redirect(returnTo);
  const status = typeof params.status === "string" ? STATUS_MESSAGES[params.status] : undefined;
  const loginHref = `/api/auth/login?${new URLSearchParams({ returnTo })}`;

  return <section className="sec account-signin"><div className="wrap account-signin-in">
    <span className="mono-tag">// Your Wipelo account</span>
    <h1 className="h-section">Sign in or create an account.</h1>
    <p className="lede">Enter your email on the next screen and we’ll send a one-time code. New here? The same step creates your account, so there’s no password to remember.</p>
    {status && <p className={`account-form-status is-${status.tone === "error" ? "error" : "info"}`} role={status.tone === "error" ? "alert" : "status"}>{status.text}</p>}
    {enabled && <a className="btn btn-teal btn-lg" href={loginHref}>Continue with email <span>→</span></a>}
    <ul className="account-signin-points">
      <li>Your cart follows you to any device.</li>
      <li>See orders and save your addresses.</li>
      <li>An account is optional. <Link href="/shop">Keep shopping</Link> and check out as a guest.</li>
    </ul>
  </div></section>;
}
