import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dateLabel, statusLabel } from "@/lib/account-format";
import { moneyLabel } from "@/lib/money";
import { accountQuery } from "@/lib/server/account/api";
import { CUSTOMER_OPERATIONS } from "@/lib/server/account/operations";
import type { ShopifyMoney } from "@/lib/shopify";

export const metadata: Metadata = { title: "Order details" };

type OrderDetail = { order: {
  id: string; name: string; processedAt: string; financialStatus: string | null; fulfillmentStatus: string; statusPageUrl: string | null; cancelledAt: string | null;
  subtotal: ShopifyMoney | null; totalShipping: ShopifyMoney | null; totalTax: ShopifyMoney | null; totalPrice: ShopifyMoney;
  shippingAddress: { formatted: string[] } | null;
  lineItems: { nodes: { id: string; title: string; variantTitle: string | null; quantity: number; sellingPlan: { name: string } | null; image: { url: string; altText: string | null } | null; totalPrice: ShopifyMoney | null }[] };
  fulfillments: { nodes: { id: string; status: string | null; trackingInformation: { company: string | null; number: string | null; url: string | null }[] }[] };
} | null };

// The ID in the URL is not trusted: the query runs with this customer's token, so Shopify returns null for anyone else's order.
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,20}$/.test(id)) notFound();
  const { order } = await accountQuery<OrderDetail>(`/account/orders/${id}`, CUSTOMER_OPERATIONS.order, { id: `gid://shopify/Order/${id}` });
  if (!order) notFound();
  const tracking = order.fulfillments.nodes.flatMap((fulfillment) => fulfillment.trackingInformation);
  return <>
    <header className="account-head">
      <Link className="account-back" href="/account/orders">← All orders</Link>
      <h1 className="h-section">Order {order.name}</h1>
      <p className="account-sub">Placed {dateLabel(order.processedAt)}</p>
      <div className="account-badges">
        {order.cancelledAt && <span className="account-badge">Cancelled</span>}
        <span className="account-badge">{statusLabel(order.fulfillmentStatus)}</span>
        {order.financialStatus && <span className="account-badge">{statusLabel(order.financialStatus)}</span>}
      </div>
    </header>
    <section className="account-card">
      <ul className="account-lines">{order.lineItems.nodes.map((line) => <li key={line.id}>
        {line.image ? <img src={line.image.url} alt={line.image.altText || line.title} loading="lazy" width={64} height={64} /> : <span className="account-line-art" aria-hidden="true">W</span>}
        <div><b>{line.title}</b><span>{[line.variantTitle, line.sellingPlan?.name].filter(Boolean).join(" · ")}</span><span>Qty {line.quantity}</span></div>
        <em>{moneyLabel(line.totalPrice ?? undefined)}</em>
      </li>)}</ul>
      <dl className="account-totals">
        {order.subtotal && <div><dt>Subtotal</dt><dd>{moneyLabel(order.subtotal)}</dd></div>}
        {order.totalShipping && <div><dt>Shipping</dt><dd>{moneyLabel(order.totalShipping)}</dd></div>}
        {order.totalTax && <div><dt>Tax</dt><dd>{moneyLabel(order.totalTax)}</dd></div>}
        <div className="is-total"><dt>Total</dt><dd>{moneyLabel(order.totalPrice)}</dd></div>
      </dl>
    </section>
    <div className="account-panels">
      {order.shippingAddress && <section className="account-card"><div className="account-card-head"><h2>Shipping to</h2></div><address>{order.shippingAddress.formatted.map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</address></section>}
      <section className="account-card">
        <div className="account-card-head"><h2>Tracking</h2></div>
        {tracking.length
          ? <ul className="account-tracking">{tracking.map((item, index) => <li key={`${item.number}-${index}`}>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.company ?? "Track"} {item.number}</a> : <>{item.company} {item.number}</>}</li>)}</ul>
          : <p className="account-muted">Tracking appears here once your order ships.</p>}
        {order.statusPageUrl && <p><a href={order.statusPageUrl}>View order status</a></p>}
      </section>
    </div>
  </>;
}
