import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Customer Dispute Resolution",
  description: "How Wipelo resolves customer complaints and disputes: how to reach us, response times, escalation, payment disputes, and your rights under U.S. consumer protection law.",
  alternates: { canonical: "/dispute-resolution" },
};

const SUPPORT_EMAIL = "uswipelo@gmail.com";
const LAST_UPDATED = "November 5, 2026";

const sections = [
  { id: "commitment", label: "Our commitment" },
  { id: "what-it-covers", label: "What this covers" },
  { id: "step-1", label: "Step 1: Contact us" },
  { id: "step-2", label: "Step 2: Our response" },
  { id: "step-3", label: "Step 3: Escalation" },
  { id: "outcomes", label: "Possible outcomes" },
  { id: "payment-disputes", label: "Payment disputes & chargebacks" },
  { id: "product-safety", label: "Product safety concerns" },
  { id: "outside-help", label: "Outside help" },
  { id: "your-rights", label: "Your legal rights" },
  { id: "records", label: "Records & privacy" },
  { id: "contact", label: "Contact us" },
];

const mailto = (subject: string) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

export default function DisputeResolutionPage() {
  return <>
    <section className="sec story-intro policy-intro">
      <div className="wrap">
        <span className="mono-tag">// Customer care</span>
        <h1 className="h-display">Dispute Resolution.</h1>
        <p className="lede">If something went wrong with your order, we want to fix it. Here&apos;s how to reach us, what to expect, and the options you have if we can&apos;t agree.</p>
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
          <section id="commitment" className="policy-highlight">
            <span className="mono-tag">// Fair, fast, in writing</span>
            <h2>Our commitment</h2>
            <p>Most problems can be solved with one email. When you contact us, we promise to:</p>
            <ul>
              <li><strong>Reply within 2 business days</strong> and give you a case number.</li>
              <li><strong>Aim to resolve your issue within 10 business days.</strong> If we need longer, we&apos;ll tell you why and when to expect an answer.</li>
              <li><strong>Explain our decision in writing</strong>, including the reasons if we can&apos;t give you what you asked for.</li>
              <li><strong>Never charge you</strong> to raise a complaint, and never limit your legal rights.</li>
            </ul>
          </section>

          <section id="what-it-covers">
            <h2>What this covers</h2>
            <p>This process applies to any concern about a purchase from wipelo.com, including:</p>
            <ul>
              <li>Charges, pricing, discounts, taxes, or billing errors.</li>
              <li>Late, lost, damaged, incomplete, or incorrect orders.</li>
              <li>Refunds, returns, and the <Link href="/return-policy#guarantee">30-Day Free Guarantee</Link>.</li>
              <li>Subscription renewals, cancellations, and changes.</li>
              <li>Product quality or performance concerns.</li>
              <li>Your account, your data, or how we communicated with you.</li>
            </ul>
            <p>For a standard return or refund, you can go straight to our <Link href="/return-policy">Return Policy</Link>. Use this process if that didn&apos;t solve the problem or your issue is about something else.</p>
          </section>

          <section id="step-1">
            <h2>Step 1: Contact us</h2>
            <p>Email <a href={mailto("Customer dispute")}>{SUPPORT_EMAIL}</a> with &ldquo;Customer dispute&rdquo; in the subject line. To help us resolve it quickly, please include:</p>
            <ul>
              <li>Your name and the email address used for the order.</li>
              <li>Your order number, if you have one.</li>
              <li>A short description of the problem and when it happened.</li>
              <li>What you&apos;d like us to do (for example, a refund, replacement, or correction).</li>
              <li>Any supporting photos, screenshots, receipts, or tracking details.</li>
            </ul>
            <p className="policy-note">Please contact us within 60 days of the charge or delivery date. That keeps your card&apos;s dispute rights open if you need them later. We&apos;ll still review issues raised after that.</p>
          </section>

          <section id="step-2">
            <h2>Step 2: Our response</h2>
            <ol className="policy-steps">
              <li><strong>Acknowledgment (within 2 business days):</strong> we confirm we&apos;ve received your complaint and give you a case number.</li>
              <li><strong>Review:</strong> we check your order, payment, shipping, and communication records. If we need more information, we&apos;ll ask once and clearly.</li>
              <li><strong>Decision (within 10 business days):</strong> we send a written decision explaining what we&apos;ll do and why. If we resolve it in your favor, we act on it within 5 business days.</li>
            </ol>
          </section>

          <section id="step-3">
            <h2>Step 3: Escalation</h2>
            <p>If you&apos;re not satisfied with our decision, reply to that email within 30 days and ask for an escalation review. A member of our leadership team who wasn&apos;t involved in the first decision will review your case and give you a final written response within <strong>10 business days</strong>.</p>
            <p>Asking for an escalation doesn&apos;t affect your right to use any of the <a href="#outside-help">outside options</a> below at any time.</p>
          </section>

          <section id="outcomes">
            <h2>Possible outcomes</h2>
            <p>Depending on what happened, we may offer:</p>
            <ul>
              <li>A full or partial refund to your original payment method.</li>
              <li>A free replacement or a reshipment of missing items.</li>
              <li>A correction to a billing, tax, or subscription error.</li>
              <li>Cancellation of a subscription, with a refund of any renewal charged after you asked to cancel.</li>
              <li>Store credit, but only if you prefer it over a refund.</li>
            </ul>
          </section>

          <section id="payment-disputes">
            <h2>Payment disputes &amp; chargebacks</h2>
            <p>You have the right to dispute a charge with your card issuer or payment provider. Under the federal Fair Credit Billing Act, you generally have <strong>60 days</strong> from the date the statement with the error was sent to dispute a credit card billing error. Debit cards and other payment methods have their own rules and deadlines.</p>
            <ul>
              <li>We encourage you to contact us first. We can usually refund you faster than the dispute process.</li>
              <li>If you file a dispute, we&apos;ll respond to your card issuer honestly and provide the relevant order records.</li>
              <li>We won&apos;t close your account or treat you unfairly because you disputed a charge.</li>
              <li>If we refund you directly while a dispute is open, please let your card issuer know so you aren&apos;t refunded twice.</li>
            </ul>
          </section>

          <section id="product-safety">
            <h2>Product safety concerns</h2>
            <p>If you have a skin reaction or another health concern after using a Wipelo product, stop using it and consult a healthcare professional. Then email us with &ldquo;Product safety&rdquo; in the subject line. We treat these reports as a priority, refund that purchase, and investigate the batch.</p>
            <p>You can also report a reaction to a cosmetic product directly to the U.S. Food and Drug Administration through <a href="https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program" target="_blank" rel="noopener noreferrer">FDA MedWatch</a>.</p>
          </section>

          <section id="outside-help">
            <h2>Outside help</h2>
            <p>If we haven&apos;t resolved your concern, or you&apos;d rather not deal with us directly, you can go to any of these at any time:</p>
            <ul>
              <li><strong>Your state attorney general or consumer protection office.</strong> Find yours at <a href="https://www.usa.gov/state-consumer" target="_blank" rel="noopener noreferrer">USA.gov</a>.</li>
              <li><strong>The Federal Trade Commission</strong> at <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer">ReportFraud.ftc.gov</a>.</li>
              <li><strong>The Better Business Bureau</strong> at <a href="https://www.bbb.org" target="_blank" rel="noopener noreferrer">BBB.org</a>, which offers complaint handling and mediation.</li>
              <li><strong>The Consumer Financial Protection Bureau</strong> at <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer">consumerfinance.gov</a>, for problems with a bank or card issuer&apos;s handling of a dispute.</li>
              <li><strong>Small claims court</strong> in your county, for individual claims within your state&apos;s limit.</li>
            </ul>
            <p>We&apos;re also open to free, non-binding mediation through a neutral third party if both sides agree it would help.</p>
          </section>

          <section id="your-rights">
            <h2>Your legal rights</h2>
            <p>This page describes how we handle complaints. It doesn&apos;t replace or limit any rights you have under federal, state, or local law, including consumer protection, warranty, and automatic-renewal laws. Using this process is voluntary, and you don&apos;t have to complete it before contacting a government agency, your card issuer, or a court.</p>
            <p>Nothing on this page requires you to give up the right to go to court or to join a class action, and we won&apos;t retaliate against anyone for raising a complaint, posting an honest review, or contacting a regulator.</p>
          </section>

          <section id="records">
            <h2>Records &amp; privacy</h2>
            <p>We keep a record of each complaint, our response, and the outcome for at least 3 years so we can spot recurring problems and answer regulator or card-issuer questions. We use the information you send only to handle your complaint and improve our service, and we don&apos;t sell it.</p>
          </section>

          <section id="contact" className="policy-contact">
            <h2>Contact us</h2>
            <p>Email <a href={mailto("Customer dispute")}>{SUPPORT_EMAIL}</a>. We reply within 2 business days, Monday to Friday, excluding U.S. federal holidays.</p>
            <p>See also our <Link href="/return-policy">Return Policy</Link> and <Link href="/#faq">FAQs</Link>.</p>
          </section>
        </article>
      </div>
    </section>
  </>;
}
