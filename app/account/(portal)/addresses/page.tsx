import type { Metadata } from "next";
import { AddressCard } from "@/components/account/address-card";
import { AddressForm, type AddressValues } from "@/components/account/forms";
import { accountQuery } from "@/lib/server/account/api";
import { CUSTOMER_OPERATIONS } from "@/lib/server/account/operations";
import { getAvailableCountries } from "@/lib/shopify";
import { deleteAddress, saveAddress } from "../actions";

export const metadata: Metadata = { title: "Addresses" };

type Addresses = { customer: { firstName: string | null; lastName: string | null; defaultAddress: { id: string } | null; addresses: { nodes: (AddressValues & { formatted: string[] })[] } } };

export default async function AddressesPage() {
  const [{ customer }, countries] = await Promise.all([accountQuery<Addresses>("/account/addresses", CUSTOMER_OPERATIONS.addresses), getAvailableCountries()]);
  return <>
    <header className="account-head"><span className="mono-tag">// Addresses</span><h1 className="h-section">Where we deliver.</h1></header>
    {customer.addresses.nodes.length
      ? <ul className="account-address-grid">{customer.addresses.nodes.map((address) => <AddressCard key={address.id} address={address} formatted={address.formatted} isDefault={address.id === customer.defaultAddress?.id} countries={countries} saveAction={saveAddress} deleteAction={deleteAddress} />)}</ul>
      : <p className="account-muted">No addresses saved yet. Add one below to speed up checkout.</p>}
    <section className="account-card">
      <div className="account-card-head"><h2>Add an address</h2></div>
      <AddressForm action={saveAddress} defaults={customer} countries={countries} />
    </section>
  </>;
}
