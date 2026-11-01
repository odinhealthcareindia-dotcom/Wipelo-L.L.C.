"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [["Overview", "/account"], ["Profile", "/account/profile"], ["Addresses", "/account/addresses"], ["Orders", "/account/orders"]] as const;

export function AccountNav({ subscriptionsUrl }: { subscriptionsUrl: string | null }) {
  const pathname = usePathname();
  return <nav className="account-nav" aria-label="Account">
    {LINKS.map(([label, href]) => {
      const active = href === "/account" ? pathname === href : pathname.startsWith(href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
    })}
    {subscriptionsUrl && <a href={subscriptionsUrl}>Subscriptions <span aria-hidden="true">↗</span></a>}
    <form method="post" action="/api/auth/logout"><button className="account-link-button">Sign out</button></form>
  </nav>;
}
