import { expect, test } from "@playwright/test";
import { safeReturnTo } from "../../lib/server/auth/return-to";

for (const value of ["https://evil.example/", "//evil.example", "/\\evil.example", "/%2F%2Fevil.example", "/%5Cevil.example", "javascript:alert(1)", "account", "", "/\nSet-Cookie:x", "/%zz", "/api/auth/logout", "/account/sign-in", undefined, null, 7, ["/account"], `/${"a".repeat(600)}`]) {
  test(`rejects ${JSON.stringify(value)?.slice(0, 40)}`, () => {
    expect(safeReturnTo(value)).toBe("/account");
  });
}

for (const value of ["/", "/shop", "/account/orders/123", "/products/her?variant=1#reviews"]) {
  test(`keeps ${value}`, () => {
    expect(safeReturnTo(value)).toBe(value);
  });
}
