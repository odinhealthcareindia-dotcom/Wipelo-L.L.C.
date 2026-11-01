"use server";

import { revalidatePath } from "next/cache";
import { accountMutation, type ActionState, type UserError } from "@/lib/server/account/api";
import { CUSTOMER_OPERATIONS } from "@/lib/server/account/operations";
import { validateAddressForm, validateProfileForm } from "@/lib/server/account/validation";

function userErrorState(errors: UserError[], values: Record<string, string>): ActionState {
  const fields: Record<string, string> = {};
  for (const error of errors) {
    const field = error.field?.at(-1);
    if (field) fields[field] = error.message;
  }
  return { status: "error", message: errors[0]?.message ?? "Please check the details and try again.", fields, values };
}

export async function updateProfile(_previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = validateProfileForm(form);
  if (!parsed.ok) return { status: "error", message: "Please check the highlighted fields.", fields: parsed.fields, values: parsed.values };
  const result = await accountMutation<{ customerUpdate: { userErrors: UserError[] } }>("/account/profile", CUSTOMER_OPERATIONS.updateProfile, { input: parsed.input });
  if (!result.ok) return { status: "error", message: result.message, values: parsed.values };
  if (result.data.customerUpdate.userErrors.length) return userErrorState(result.data.customerUpdate.userErrors, parsed.values);
  revalidatePath("/account", "layout");
  return { status: "success", message: "Your profile was updated.", values: parsed.values };
}

export async function saveAddress(_previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = validateAddressForm(form);
  if (!parsed.ok) return { status: "error", message: "Please check the highlighted fields.", fields: parsed.fields, values: parsed.values };
  const { addressId, address, defaultAddress } = parsed;
  // Shopify scopes the address ID to this customer's token, so another customer's address can't be reached.
  const result = addressId
    ? await accountMutation<{ customerAddressUpdate: { userErrors: UserError[] } }>("/account/addresses", CUSTOMER_OPERATIONS.updateAddress, { addressId, address, defaultAddress })
    : await accountMutation<{ customerAddressCreate: { userErrors: UserError[] } }>("/account/addresses", CUSTOMER_OPERATIONS.createAddress, { address, defaultAddress });
  if (!result.ok) return { status: "error", message: result.message, values: parsed.values };
  const errors = "customerAddressUpdate" in result.data ? result.data.customerAddressUpdate.userErrors : result.data.customerAddressCreate.userErrors;
  if (errors.length) return userErrorState(errors, parsed.values);
  revalidatePath("/account", "layout");
  return { status: "success", message: addressId ? "Address updated." : "Address added." };
}

export async function deleteAddress(_previous: ActionState, form: FormData): Promise<ActionState> {
  const addressId = form.get("addressId");
  if (typeof addressId !== "string" || !addressId.startsWith("gid://shopify/CustomerAddress/")) return { status: "error", message: "That address couldn't be found." };
  const result = await accountMutation<{ customerAddressDelete: { userErrors: UserError[] } }>("/account/addresses", CUSTOMER_OPERATIONS.deleteAddress, { addressId });
  if (!result.ok) return { status: "error", message: result.message };
  if (result.data.customerAddressDelete.userErrors.length) return { status: "error", message: result.data.customerAddressDelete.userErrors[0].message };
  revalidatePath("/account", "layout");
  return { status: "success", message: "Address removed." };
}
