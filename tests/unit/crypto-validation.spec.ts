import { expect, test } from "@playwright/test";
import { validateAddressForm, validateProfileForm } from "../../lib/server/account/validation";
import { createSealer } from "../../lib/server/crypto";

const key = (fill: number) => Buffer.alloc(32, fill).toString("base64");

test("sealed values round-trip and never contain the plaintext", () => {
  const sealer = createSealer(key(1));
  const sealed = sealer.seal("customer-token-secret", "oauth");
  expect(sealed).not.toContain("secret");
  expect(sealer.unseal(sealed, "oauth")).toBe("customer-token-secret");
  expect(sealer.seal("same", "oauth")).not.toBe(sealer.seal("same", "oauth"));
});

test("a value sealed for one purpose can't be opened for another", () => {
  const sealer = createSealer(key(1));
  expect(sealer.unseal(sealer.seal("x", "oauth"), "session")).toBeNull();
});

test("tampered, malformed and foreign values are rejected", () => {
  const sealer = createSealer(key(1));
  const sealed = sealer.seal("value", "oauth");
  const parts = sealed.split(".");
  parts[2] = Buffer.from("other").toString("base64url");
  expect(sealer.unseal(parts.join("."), "oauth")).toBeNull();
  expect(sealer.unseal("not-sealed", "oauth")).toBeNull();
  expect(createSealer(key(2)).unseal(sealed, "oauth")).toBeNull();
});

test("the previous key decrypts during rotation", () => {
  const old = createSealer(key(1)).seal("value", "oauth");
  expect(createSealer(key(2), key(1)).unseal(old, "oauth")).toBe("value");
});

test("short keys are refused", () => {
  expect(() => createSealer(Buffer.alloc(16).toString("base64"))).toThrow();
});

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(values)) data.set(name, value);
  return data;
};

test("profile names are trimmed and limited", () => {
  expect(validateProfileForm(form({ firstName: " Ann ", lastName: "" }))).toMatchObject({ ok: true, input: { firstName: "Ann", lastName: "" } });
  expect(validateProfileForm(form({ firstName: "a".repeat(101), lastName: "" }))).toMatchObject({ ok: false, fields: { firstName: expect.any(String) } });
});

test("addresses require the fields Shopify needs", () => {
  const missing = validateAddressForm(form({}));
  expect(missing).toMatchObject({ ok: false, fields: { address1: expect.any(String), city: expect.any(String), countryCode: expect.any(String) } });
  const good = validateAddressForm(form({ address1: "1 Main", city: "Reno", countryCode: "us", zoneCode: "nv", phoneNumber: "+1 (555) 123-4567" }));
  expect(good).toMatchObject({ ok: true, address: { countryCode: "US", zoneCode: "NV", phoneNumber: "+15551234567" }, addressId: null });
});

test("address IDs must be address IDs, and bad phones are explained", () => {
  expect(validateAddressForm(form({ address1: "1", city: "R", countryCode: "US", addressId: "gid://shopify/Customer/1" }))).toMatchObject({ ok: false, fields: { addressId: expect.any(String) } });
  expect(validateAddressForm(form({ address1: "1", city: "R", countryCode: "US", phoneNumber: "555" }))).toMatchObject({ ok: false, fields: { phoneNumber: expect.any(String) } });
});
