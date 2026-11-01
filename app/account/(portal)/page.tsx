import type { Metadata } from "next";
import Link from "next/link";
import { dateLabel, orderPath, statusLabel } from "@/lib/account-format";
import { moneyLabel } from "@/lib/money";
import { accountQuery } from "@/lib/server/account/api";
import { CUSTOMER_OPERATIONS } from "@/lib/server/account/operations";
import type { ShopifyMoney } from "@/lib/shopify";

export const metadata: Metadata = { title: "Overview" };

type Overview = { customer: {
  firstName: string | null; lastName: string | null; displayName: string;
  emailAddress: { emailAddress: string | null } | null;
  defaultAddress: { formatted: string[] } | null;
  orders: { nodes: { id: string; name: string; processedAt: string; financialStatus: string | null; fulfillmentStatus: string; totalPrice: ShopifyMoney }[] };
} };

export default async function AccountOverviewPage() {
  const { customer } = await accountQuery<Overview>("/account", CUSTOMER_OPERATIONS.overview);
  return <>
    <header className="account-head">
      <span className="mono-tag">// Your Wipelo account</span>
      <h1 className="h-section">{customer.firstName ? `Hi, ${customer.firstName}.` : "Welcome back."}</h1>
      {customer.emailAddress?.emailAddress && <p className="account-sub">{customer.emailAddress.emailAddress}</p>}
    </header>
    <div className="account-panels">
      <section className="account-card">
        <div className="account-card-head"><h2>Recent orders</h2><Link href="/account/orders">View all</Link></div>
        {customer.orders.nodes.length
          ? <ul className="account-order-mini">{customer.orders.nodes.map((order) => <li key={order.id}><Link href={orderPath(order.id)}><b>{order.name}</b><span>{dateLabel(order.processedAt)} · {statusLabel(order.fulfillmentStatus)}</span><em>{moneyLabel(order.totalPrice)}</em></Link></li>)}</ul>
          : <p className="account-muted">No orders yet. <Link href="/shop">Find your wipe</Link>.</p>}
      </section>
      <section className="account-card">
        <div className="account-card-head"><h2>Default address</h2><Link href="/account/addresses">Manage</Link></div>
        {customer.defaultAddress
          ? <address>{customer.defaultAddress.formatted.map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</address>
          : <p className="account-muted">No address saved yet.</p>}
      </section>
    </div>
  </>;
}
