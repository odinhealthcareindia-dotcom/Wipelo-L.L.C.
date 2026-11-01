import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";
import { subscriptionPortalUrl } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: { default: "Your account", template: "%s | Your account | Wipelo" }, robots: { index: false } };

// Navigation only. Each page and action checks the session for itself, because layouts don't re-run on client navigation.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <section className="sec account-portal"><div className="wrap account-portal-grid">
    <AccountNav subscriptionsUrl={subscriptionPortalUrl()} />
    <div className="account-main">{children}</div>
  </div></section>;
}
