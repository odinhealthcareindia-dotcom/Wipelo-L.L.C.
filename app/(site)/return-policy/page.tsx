import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return Policy & 30-Day Free Guarantee",
  description: "Wipelo's 30-Day Free Guarantee and return policy: refunds on your first order with no return needed, plus returns, damaged items, subscriptions, and refund timing.",
  alternates: { canonical: "/return-policy" },
};

const SUPPORT_EMAIL = "uswipelo@gmail.com";
const LAST_UPDATED = "November 5, 2026";

const sections = [
  { id: "guarantee", label: "30-Day Free Guarantee" },
  { id: "returns", label: "Standard returns" },
  { id: "damaged", label: "Damaged, defective, or wrong items" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "non-returnable", label: "What we can't accept" },
  { id: "how-to", label: "How to start a return" },
  { id: "refunds", label: "Refund method & timing" },
  { id: "special-cases", label: "Gifts, retailers & international" },
  { id: "your-rights", label: "Your rights" },
  { id: "contact", label: "Contact us" },
];

export default function ReturnPolicyPage() {
  return <>
    <section className="sec story-intro policy-intro">
      <div className="wrap">
        <span className="mono-tag">// Returns &amp; refunds</span>
        <h1 className="h-display">Return Policy.</h1>
        <p className="lede">Try Wipelo for 30 days. If it doesn&apos;t earn a place in your routine, we&apos;ll refund your first order. No return label, no interrogation.</p>
        <p className="policy-updated">Last updated: {LAST_UPDATED}</p>
      </div>
    </section>

    <section className="sec policy-body">
      <div className="wrap policy-grid">
        <nav className="policy-toc" aria-label="On this page">
          <span className="mono-tag">On this page</span>
          <ol>{sections.map(({ id, label }) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
        </nav>

        <article className="policy-content">
          <section id="guarantee" className="policy-highlight">
            <span className="mono-tag">// Risk, reversed</span>
            <h2>30-Day Free Guarantee</h2>
            <p>Use your first Wipelo order for 30 days — really use it. If you&apos;re not happy with it for any reason, tell us within <strong>30 days of delivery</strong> and we&apos;ll refund that order in full.</p>
            <ul>
              <li><strong>Free:</strong> no return shipping and no need to send anything back. Keep or toss what&apos;s left.</li>
              <li><strong>Full refund:</strong> the product price, sales tax, and any shipping you paid on that order.</li>
              <li><strong>Opened is fine:</strong> the guarantee covers opened and partly used packs, including HER, SPOTLESS, and ON THE GO.</li>
              <li><strong>What it covers:</strong> your first order from wipelo.com, including the first delivery of a subscription.</li>
              <li><strong>Limit:</strong> one guarantee claim per customer and household. Later orders are covered by our <a href="#returns">standard returns</a> and <a href="#damaged">damaged-item</a> policies.</li>
            </ul>
          </section>

          <section id="returns">
            <h2>Standard returns</h2>
            <p>For orders not covered by the 30-Day Free Guarantee, you can return <strong>unopened, unused products</strong> in their original packaging within <strong>30 days of delivery</strong> for a full refund of the product price and applicable sales tax.</p>
            <ul>
              <li>Because our wipes are personal-care products, we can only accept standard returns of sealed boxes. Individually wrapped wipes that are still sealed may be returned with their box.</li>
              <li>Return shipping is the customer&apos;s responsibility unless the return is due to our error (see <a href="#damaged">damaged, defective, or wrong items</a>).</li>
              <li>Original shipping charges are not refundable on standard returns unless required by law.</li>
              <li>We recommend a trackable shipping service. We can&apos;t issue a refund for a return we never receive.</li>
            </ul>
          </section>

          <section id="damaged">
            <h2>Damaged, defective, or wrong items</h2>
            <p>If your order arrives damaged, leaking, dried out, defective, or isn&apos;t what you ordered, contact us within <strong>30 days of delivery</strong> with your order number and a photo of the problem.</p>
            <ul>
              <li>We&apos;ll send a free replacement or issue a full refund — your choice — including any shipping you paid.</li>
              <li>You usually won&apos;t need to send anything back. If we do need the item, we&apos;ll email you a prepaid return label.</li>
              <li>If your tracking shows delivered but the package is missing, contact us within 14 days of the delivery date and we&apos;ll work with the carrier to resolve it.</li>
            </ul>
            <p className="policy-note">If a product causes irritation or a skin reaction, stop using it and consult a healthcare professional if symptoms persist. Then contact us — we&apos;ll refund that purchase and want to hear what happened.</p>
          </section>

          <section id="subscriptions">
            <h2>Subscriptions</h2>
            <ul>
              <li>Your first subscription delivery is covered by the <a href="#guarantee">30-Day Free Guarantee</a>.</li>
              <li>You can skip, pause, change, or cancel at any time before your next renewal from <Link href="/account">your account</Link> or by emailing us. There are no cancellation fees.</li>
              <li>We email you a reminder before each renewal ships. Cancellation takes effect for any renewal that hasn&apos;t been processed yet.</li>
              <li>If a renewal was charged after you tried to cancel, or you missed the reminder, contact us within <strong>30 days of delivery</strong>. Unopened renewal orders can be returned for a full refund; if we failed to process a cancellation you requested, we&apos;ll refund the renewal and you won&apos;t need to send it back.</li>
            </ul>
          </section>

          <section id="non-returnable">
            <h2>What we can&apos;t accept</h2>
            <ul>
              <li>Opened or used products, except under the <a href="#guarantee">30-Day Free Guarantee</a> or for <a href="#damaged">damaged or defective items</a>.</li>
              <li>Requests made more than 30 days after delivery.</li>
              <li>Gift cards and items clearly marked as final sale at checkout.</li>
              <li>Products bought from another retailer or marketplace. Please return those to the store where you bought them.</li>
            </ul>
          </section>

          <section id="how-to">
            <h2>How to start a return or refund</h2>
            <ol className="policy-steps">
              <li><strong>Email us</strong> at <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Return request")}`}>{SUPPORT_EMAIL}</a> with your order number, the email used at checkout, and what you&apos;d like to return. For damaged items, include a photo.</li>
              <li><strong>We reply within 2 business days</strong> to confirm your refund or, for standard returns, send the return address and instructions.</li>
              <li><strong>Ship it back</strong> (standard returns only), sealed and in original packaging. Please don&apos;t send returns without contacting us first.</li>
              <li><strong>Get your refund.</strong> We email you as soon as it&apos;s issued.</li>
            </ol>
          </section>

          <section id="refunds">
            <h2>Refund method &amp; timing</h2>
            <ul>
              <li>Refunds go back to your <strong>original payment method</strong>. We don&apos;t substitute store credit unless you ask for it.</li>
              <li>30-Day Free Guarantee and damaged-item refunds are issued within <strong>5 business days</strong> of approval.</li>
              <li>Standard-return refunds are issued within <strong>5 business days</strong> after the return arrives and is inspected.</li>
              <li>Your bank or card issuer may take another 5–10 business days to post the refund to your account.</li>
              <li>Orders paid with a promotional discount are refunded at the amount you actually paid.</li>
            </ul>
          </section>

          <section id="special-cases">
            <h2>Gifts, retailers &amp; international orders</h2>
            <ul>
              <li><strong>Gifts:</strong> if an item was marked as a gift and shipped to you directly, we&apos;ll refund the original purchaser or, if you prefer, issue you store credit for the return value.</li>
              <li><strong>Retail and marketplace purchases:</strong> return policies are set by that seller.</li>
              <li><strong>Outside the U.S.:</strong> the 30-Day Free Guarantee and damaged-item policy apply. For standard returns, return shipping, customs duties, and import taxes are not refundable unless the return is due to our error or local law requires otherwise.</li>
            </ul>
          </section>

          <section id="your-rights">
            <h2>Your rights</h2>
            <p>This policy is in addition to, and does not limit, any rights you have under federal, state, or local consumer protection laws. If a state law gives you a longer return window or additional remedies, that law applies.</p>
            <p>If you think a charge is wrong, please contact us first — we can usually fix it faster than a dispute. You keep any rights you have under the Fair Credit Billing Act and your card issuer&apos;s policies.</p>
            <p>We may update this policy from time to time. Changes apply to orders placed after the &ldquo;Last updated&rdquo; date above; your order is covered by the policy in effect when you placed it.</p>
          </section>

          <section id="contact" className="policy-contact">
            <h2>Contact us</h2>
            <p>Questions about an order, a return, or this policy? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We reply within 2 business days.</p>
            <p>Looking for something else? Check our <Link href="/#faq">FAQs</Link>, or see how we handle complaints in our <Link href="/dispute-resolution">Dispute Resolution</Link> policy.</p>
          </section>
        </article>
      </div>
    </section>
  </>;
}
