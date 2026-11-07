import type { Metadata } from "next";
import Link from "next/link";
import { dateLabel, orderPath, statusLabel } from "@/lib/account-format";
import { moneyLabel } from "@/lib/money";
import { accountQuery } from "@/lib/server/account/api";
import { CUSTOMER_OPERATIONS } from "@/lib/server/account/operations";
import type { ShopifyMoney } from "@/lib/shopify";

export const metadata: Metadata = { title: "Orders" };

const PAGE_SIZE = 10;
const CURSOR = /^[A-Za-z0-9+/=_:.-]{1,512}$/;

type Orders = { customer: { orders: {
  nodes: { id: string; name: string; processedAt: string; financialStatus: string | null; fulfillmentStatus: string; totalPrice: ShopifyMoney; lineItemsSummary: { lineItemCount: number } | null }[];
  pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; startCursor: string | null; endCursor: string | null };
} } };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ after?: string; before?: string }> }) {
  const params = await searchParams;
  const after = typeof params.after === "string" && CURSOR.test(params.after) ? params.after : null;
  const before = !after && typeof params.before === "string" && CURSOR.test(params.before) ? params.before : null;
  const { customer: { orders } } = await accountQuery<Orders>("/account/orders", CUSTOMER_OPERATIONS.orders, before ? { last: PAGE_SIZE, before } : { first: PAGE_SIZE, after });
  return <>
    <header className="account-head"><span className="mono-tag">// Orders</span><h1 className="h-section">Your orders.</h1></header>
    {orders.nodes.length
      ? <ul className="account-order-list">{orders.nodes.map((order) => <li key={order.id} className="account-card">
          <Link href={orderPath(order.id)}>
            <b>{order.name}</b>
            <span>{dateLabel(order.processedAt)}{order.lineItemsSummary ? ` · ${order.lineItemsSummary.lineItemCount} ${order.lineItemsSummary.lineItemCount === 1 ? "item" : "items"}` : ""}</span>
            <span className="account-badge">{statusLabel(order.fulfillmentStatus)}</span>
            <em>{moneyLabel(order.totalPrice)}</em>
          </Link>
        </li>)}</ul>
      : <div className="account-empty"><h2>No orders yet.</h2><p>When you place an order, it will appear here.</p><Link className="btn btn-teal" href="/shop">Shop the range</Link></div>}
    {(orders.pageInfo.hasPreviousPage || orders.pageInfo.hasNextPage) && <nav className="account-pager" aria-label="Order pages">
      {orders.pageInfo.hasPreviousPage && orders.pageInfo.startCursor ? <Link href={`/account/orders?${new URLSearchParams({ before: orders.pageInfo.startCursor })}`}>← Newer</Link> : <span />}
      {orders.pageInfo.hasNextPage && orders.pageInfo.endCursor ? <Link href={`/account/orders?${new URLSearchParams({ after: orders.pageInfo.endCursor })}`}>Older →</Link> : <span />}
    </nav>}
  </>;
}
