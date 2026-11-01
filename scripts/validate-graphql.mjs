// Validates GraphQL operations against Shopify's schemas, because neither API is checked at build time.
//   Storefront API: introspects the store configured in .env.local.
//   Customer Account API: reads the schema Shopify publishes in @shopify/hydrogen (path in CUSTOMER_SCHEMA_JSON).
// Usage: CUSTOMER_SCHEMA_JSON=/path/customer-account.schema.json GRAPHQL_PACKAGE=/path/node_modules/graphql/index.mjs node scripts/validate-graphql.mjs
import { readFileSync } from "node:fs";

const { buildClientSchema, getIntrospectionQuery, parse, validate } = await import(process.env.GRAPHQL_PACKAGE ?? "graphql");

const env = Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1).trim()]));

// Operations are extracted from source text so this script needs no TypeScript toolchain.
function extract(file, name) {
  const source = readFileSync(file, "utf8");
  const fragments = Object.fromEntries([...source.matchAll(/const ([A-Z_]+) = (?:`([\s\S]*?)`|"([^"]*)");/g)].map((match) => [match[1], match[2] ?? match[3]]));
  const expand = (text) => text.replace(/\$\{([A-Z_]+)\}/g, (_, key) => expand(fragments[key] ?? ""));
  const start = source.indexOf(`export const ${name} = {`);
  const body = source.slice(start, source.indexOf("\n};", start));
  return [...body.matchAll(/^\s*(\w+): `([\s\S]*?)`,$/gm)].map((match) => [match[1], expand(match[2])]);
}

function check(label, schema, operations) {
  let failures = 0;
  for (const [name, text] of operations) {
    const errors = validate(schema, parse(text));
    if (errors.length) failures += 1;
    console.log(`${errors.length ? "FAIL" : "ok  "} ${label} ${name}${errors.length ? `\n  ${errors.map((error) => error.message).join("\n  ")}` : ""}`);
  }
  return failures;
}

const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_API_VERSION}/graphql.json`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_ACCESS_TOKEN },
  body: JSON.stringify({ query: getIntrospectionQuery() }),
});
// assumeValid: Shopify's schemas have internal deprecation mismatches that would otherwise abort validation.
const storefront = buildClientSchema((await response.json()).data, { assumeValid: true });
let failures = check(`storefront@${env.SHOPIFY_API_VERSION}`, storefront, extract("lib/server/cart/gateway.ts", "CART_OPERATIONS"));

const raw = JSON.parse(readFileSync(process.env.CUSTOMER_SCHEMA_JSON, "utf8"));
const customer = buildClientSchema(raw.data ?? raw, { assumeValid: true });
failures += check("customer-account", customer, extract("lib/server/account/operations.ts", "CUSTOMER_OPERATIONS"));
failures += check("customer-account", customer, extract("lib/server/account/saved-cart.ts", "SAVED_CART_OPERATIONS"));
process.exitCode = failures ? 1 : 0;
