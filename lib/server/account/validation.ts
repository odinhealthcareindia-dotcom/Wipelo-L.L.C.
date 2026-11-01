const NAME_MAX = 100;
const ADDRESS_FIELD_MAX = 200;

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
};

export function validateProfileForm(form: FormData) {
  const values = { firstName: text(form, "firstName"), lastName: text(form, "lastName") };
  const fields: Record<string, string> = {};
  if (values.firstName.length > NAME_MAX) fields.firstName = `Use ${NAME_MAX} characters or fewer.`;
  if (values.lastName.length > NAME_MAX) fields.lastName = `Use ${NAME_MAX} characters or fewer.`;
  if (Object.keys(fields).length) return { ok: false as const, fields, values };
  return { ok: true as const, input: values, values };
}

export function validateAddressForm(form: FormData) {
  const values = {
    firstName: text(form, "firstName"),
    lastName: text(form, "lastName"),
    company: text(form, "company"),
    address1: text(form, "address1"),
    address2: text(form, "address2"),
    city: text(form, "city"),
    zoneCode: text(form, "zoneCode").toUpperCase(),
    zip: text(form, "zip"),
    countryCode: text(form, "countryCode").toUpperCase(),
    phoneNumber: text(form, "phoneNumber"),
  };
  const fields: Record<string, string> = {};
  if (!values.address1) fields.address1 = "Enter a street address.";
  if (!values.city) fields.city = "Enter a city.";
  if (!/^[A-Z]{2}$/.test(values.countryCode)) fields.countryCode = "Choose a country.";
  if (values.zoneCode && !/^[A-Z0-9-]{1,10}$/.test(values.zoneCode)) fields.zoneCode = "Use the state or province code, like CA.";
  if (values.phoneNumber && !/^\+[1-9]\d{6,14}$/.test(values.phoneNumber.replace(/[\s()-]/g, ""))) fields.phoneNumber = "Include the country code, like +1 555 123 4567.";
  for (const [name, value] of Object.entries(values)) if (value.length > ADDRESS_FIELD_MAX) fields[name] = `Use ${ADDRESS_FIELD_MAX} characters or fewer.`;
  const addressId = text(form, "addressId");
  if (addressId && !addressId.startsWith("gid://shopify/CustomerAddress/")) fields.addressId = "That address couldn't be found.";
  if (Object.keys(fields).length) return { ok: false as const, fields, values };
  const { phoneNumber, ...rest } = values;
  return {
    ok: true as const,
    values,
    addressId: addressId || null,
    defaultAddress: form.get("defaultAddress") === "on",
    address: { ...rest, ...(phoneNumber ? { phoneNumber: phoneNumber.replace(/[\s()-]/g, "") } : {}) },
  };
}
