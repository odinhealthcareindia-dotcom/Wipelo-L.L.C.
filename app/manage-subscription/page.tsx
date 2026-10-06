import type { Metadata } from "next";
import { FAQAccordion } from "@/components/faq-accordion";
import { homeFaqItems } from "@/components/home/faq";
import { RevealEffects } from "@/components/reveal-effects";

export const metadata: Metadata = { title: "Manage Subscription" };

export default function ManageSubscriptionPage() {
  const portalUrl = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL;
  return <>
    <section className="sec account-page"><div className="wrap account-intro">
      <span className="mono-tag">// Your Wipelo account</span>
      <h1 className="h-section">Your routine, on your terms.</h1>
      <p className="lede">Subscription changes are handled in the customer portal provided by your Shopify subscription app.</p>
      {portalUrl ? <a className="btn btn-teal btn-lg" href={portalUrl}>Manage your subscription <span>→</span></a> : <div className="account-setup"><b>Subscription portal setup</b><p>After installing a Shopify subscription app and enabling its customer portal, add that portal URL as <code>NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL</code> in your environment settings.</p><a className="link-arrow" href="/shop">Browse the shop</a></div>}
      <div className="account-steps"><div><span className="n">01</span><h3>Choose a subscription app</h3><p>Install the app you plan to use in Shopify and configure its customer portal.</p></div><div><span className="n">02</span><h3>Publish purchase options</h3><p>Attach selling plans to products. The product page reads plan names and prices from Shopify when selling-plan access is enabled.</p></div><div><span className="n">03</span><h3>Connect the portal</h3><p>Set the portal link and update the app’s notification emails and policies for your store.</p></div></div>
    </div></section>
    <RevealEffects><FAQAccordion items={homeFaqItems} /></RevealEffects>
  </>;
}
