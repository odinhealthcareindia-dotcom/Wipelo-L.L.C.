"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/server/account/api";
import { AddressForm, DeleteAddressForm, type AddressValues, type Country } from "./forms";

type Action = (previous: ActionState, form: FormData) => Promise<ActionState>;

export function AddressCard({ address, formatted, isDefault, countries, saveAction, deleteAction }: { address: AddressValues; formatted: string[]; isDefault: boolean; countries: Country[]; saveAction: Action; deleteAction: Action }) {
  const [editing, setEditing] = useState(false);
  return <li className="account-card">
    {isDefault && <span className="account-badge">Default</span>}
    {editing
      ? <AddressForm action={saveAction} address={address} countries={countries} isDefault={isDefault} onDone={() => setEditing(false)} />
      : <address>{formatted.map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</address>}
    <div className="account-card-actions">
      <button type="button" className="account-link-button" aria-expanded={editing} onClick={() => setEditing((open) => !open)}>{editing ? "Cancel" : "Edit"}</button>
      {!editing && <DeleteAddressForm action={deleteAction} addressId={address.id} />}
    </div>
  </li>;
}
