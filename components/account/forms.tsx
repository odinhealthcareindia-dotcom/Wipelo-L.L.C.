"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import type { ActionState } from "@/lib/server/account/api";

type Action = (previous: ActionState, form: FormData) => Promise<ActionState>;
const IDLE: ActionState = { status: "idle" };

export function FormStatus({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;
  return <p className={`account-form-status is-${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>;
}

function Field({ name, label, state, defaultValue, required, autoComplete, hint, type = "text" }: { name: string; label: string; state: ActionState; defaultValue?: string | null; required?: boolean; autoComplete?: string; hint?: string; type?: string }) {
  const id = useId();
  const error = state.fields?.[name];
  const value = state.values?.[name] ?? defaultValue ?? "";
  return <div className={`account-field${error ? " has-error" : ""}`}>
    <label htmlFor={id}>{label}{required ? "" : <small> (optional)</small>}</label>
    <input id={id} key={value} name={name} type={type} defaultValue={value} required={required} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${id}-note` : undefined} />
    {(error || hint) && <small id={`${id}-note`} className={error ? "account-field-error" : "account-field-hint"}>{error ?? hint}</small>}
  </div>;
}

export function ProfileForm({ action, firstName, lastName }: { action: Action; firstName: string | null; lastName: string | null }) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  return <form action={formAction} className="account-form">
    <div className="account-form-row">
      <Field name="firstName" label="First name" state={state} defaultValue={firstName} autoComplete="given-name" />
      <Field name="lastName" label="Last name" state={state} defaultValue={lastName} autoComplete="family-name" />
    </div>
    <FormStatus state={state} />
    <button className="btn btn-teal" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
  </form>;
}

export type AddressValues = { id: string; firstName: string | null; lastName: string | null; company: string | null; address1: string | null; address2: string | null; city: string | null; zoneCode: string | null; zip: string | null; countryCode: string | null; phoneNumber: string | null };
export type Country = { isoCode: string; name: string };

export function AddressForm({ action, address, defaults, countries, isDefault, onDone }: { action: Action; address?: AddressValues; defaults?: { firstName: string | null; lastName: string | null }; countries: Country[]; isDefault?: boolean; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  const countryId = useId();
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status !== "success") return;
    if (!address) form.current?.reset();
    onDone?.();
  }, [state, address, onDone]);
  const selected = state.values?.countryCode ?? address?.countryCode ?? (countries.some((item) => item.isoCode === "US") ? "US" : countries[0]?.isoCode ?? "");
  const options = address?.countryCode && !countries.some((item) => item.isoCode === address.countryCode) ? [...countries, { isoCode: address.countryCode, name: address.countryCode }] : countries;
  return <form ref={form} action={formAction} className="account-form">
    {address && <input type="hidden" name="addressId" value={address.id} />}
    <div className="account-form-row">
      <Field name="firstName" label="First name" state={state} defaultValue={address?.firstName ?? defaults?.firstName} autoComplete="given-name" />
      <Field name="lastName" label="Last name" state={state} defaultValue={address?.lastName ?? defaults?.lastName} autoComplete="family-name" />
    </div>
    <Field name="company" label="Company" state={state} defaultValue={address?.company} autoComplete="organization" />
    <Field name="address1" label="Street address" state={state} defaultValue={address?.address1} autoComplete="address-line1" required />
    <Field name="address2" label="Apartment, suite, etc." state={state} defaultValue={address?.address2} autoComplete="address-line2" />
    <div className="account-form-row">
      <Field name="city" label="City" state={state} defaultValue={address?.city} autoComplete="address-level2" required />
      <Field name="zoneCode" label="State / province code" state={state} defaultValue={address?.zoneCode} autoComplete="address-level1" hint="For example, CA" />
    </div>
    <div className="account-form-row">
      <Field name="zip" label="ZIP / postal code" state={state} defaultValue={address?.zip} autoComplete="postal-code" />
      <div className={`account-field${state.fields?.countryCode ? " has-error" : ""}`}>
        <label htmlFor={countryId}>Country</label>
        <select id={countryId} key={selected} name="countryCode" defaultValue={selected} autoComplete="country" required>
          {options.map((country) => <option key={country.isoCode} value={country.isoCode}>{country.name}</option>)}
        </select>
        {state.fields?.countryCode && <small className="account-field-error">{state.fields.countryCode}</small>}
      </div>
    </div>
    <Field name="phoneNumber" label="Phone" type="tel" state={state} defaultValue={address?.phoneNumber} autoComplete="tel" hint="Include the country code" />
    <label className="account-check"><input type="checkbox" name="defaultAddress" defaultChecked={isDefault} /> Use as my default address</label>
    <FormStatus state={state} />
    <button className="btn btn-teal" disabled={pending}>{pending ? "Saving…" : address ? "Save address" : "Add address"}</button>
  </form>;
}

export function DeleteAddressForm({ action, addressId }: { action: Action; addressId: string }) {
  const [state, formAction, pending] = useActionState(action, IDLE);
  return <form action={formAction} className="account-inline-form">
    <input type="hidden" name="addressId" value={addressId} />
    <button className="account-link-button" disabled={pending}>{pending ? "Removing…" : "Remove"}</button>
    <FormStatus state={state} />
  </form>;
}
