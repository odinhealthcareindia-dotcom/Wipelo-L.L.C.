import type { Metadata } from "next";
import { FAQAccordion } from "@/components/faq-accordion";
import { homeFaqItems } from "@/components/home/faq";
import { RevealEffects } from "@/components/reveal-effects";
import { getSubscriptionPolicyUrl, subscriptionPortalUrl } from "@/lib/shopify";

export const metadata: Metadata = { title: "Manage Subscription" };
export const revalidate = 60;

export default async function ManageSubscriptionPage() {
  const portalUrl = subscriptionPortalUrl();
  const policyUrl = await getSubscriptionPolicyUrl();
  return <>
    <section className="sec account-page"><div className="wrap account-intro">
      <span className="mono-tag">// Your Wipelo account</span>
      <h1 className="h-section">Your routine, on your terms.</h1>
      <p className="lede">Sign in with the email you used at checkout to see your subscriptions and upcoming deliveries.</p>
      {portalUrl ? <a className="btn btn-teal btn-lg" href={portalUrl}>Manage your subscription <span>→</span></a> : <a className="link-arrow" href="/shop">Browse the shop</a>}
      {policyUrl && <p className="lede"><a className="link-arrow" href={policyUrl} target="_blank" rel="noreferrer">Read the cancellation policy</a></p>}
      <div className="account-steps"><div><span className="n">01</span><h3>Sign in</h3><p>Enter your checkout email. Shopify sends a one-time code, so there is no password to remember.</p></div><div><span className="n">02</span><h3>Open your subscription</h3><p>Find it under Subscriptions in your account, with its delivery schedule and price.</p></div><div><span className="n">03</span><h3>Make your change</h3><p>Update your subscription or cancel it there. Your order emails also link to your order.</p></div></div>
    </div></section>
    <RevealEffects><FAQAccordion items={homeFaqItems} /></RevealEffects>
  </>;
}
