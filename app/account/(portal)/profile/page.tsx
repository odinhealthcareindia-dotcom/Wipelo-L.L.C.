import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/forms";
import { accountQuery } from "@/lib/server/account/api";
import { CUSTOMER_OPERATIONS } from "@/lib/server/account/operations";
import { subscriptionPortalUrl } from "@/lib/shopify";
import { updateProfile } from "../actions";

export const metadata: Metadata = { title: "Profile" };

type Profile = { customer: { firstName: string | null; lastName: string | null; emailAddress: { emailAddress: string | null } | null } };

export default async function ProfilePage() {
  const { customer } = await accountQuery<Profile>("/account/profile", CUSTOMER_OPERATIONS.profile);
  const hostedAccount = subscriptionPortalUrl();
  return <>
    <header className="account-head"><span className="mono-tag">// Profile</span><h1 className="h-section">Your details.</h1></header>
    <section className="account-card">
      <ProfileForm action={updateProfile} firstName={customer.firstName} lastName={customer.lastName} />
    </section>
    <section className="account-card">
      <div className="account-card-head"><h2>Email</h2></div>
      <p>{customer.emailAddress?.emailAddress ?? "No email on file"}</p>
      <p className="account-muted">This is how you sign in. Changing it requires verification, so it’s handled in your Shopify customer account.{hostedAccount && <> <a href={hostedAccount}>Change email</a>.</>}</p>
    </section>
  </>;
}
