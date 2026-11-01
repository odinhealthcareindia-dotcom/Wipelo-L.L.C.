# Customer accounts and persistent carts

How sign-in, account pages and carts work, how to configure them, and how to verify them. There is no database: everything lives in the browser and in Shopify.

## How it fits together

```
Browser                              Next.js server                     Shopify
localStorage                         /api/cart  ── cart mutations ───▶  Storefront Cart API
  wipelo-shopify-cart-v1 (cart ID)   /api/account/cart ── merge, save ▶ Customer metafields
  wipelo-cart-owner (hash)           /api/auth/* ── OAuth, tokens ───▶  Customer Account API
HttpOnly cookies                     /account/*  ── buyer's token ───▶  (orders, profile, addresses)
  wipelo_session, wipelo_id (sealed)
```

### Sessions

- Sign-in is hosted by Shopify using OAuth with a confidential client: `state`, `nonce` and PKCE S256. The client secret goes in HTTP Basic on the token request.
- The ID token is checked for signature (RS256 via the published JWKS), issuer, audience, expiry and nonce.
- The session is an AES-GCM sealed, HttpOnly cookie that holds the tokens, so they never reach browser JavaScript. The ID token has its own cookie and is used only as the logout hint.
- A sign-in attempt lives in a sealed 10-minute cookie, cleared after any callback. A replayed callback finds no cookie, and Shopify's codes are single-use anyway.
- Server Components can't write cookies, so account pages with an expired token go through `/api/auth/refresh` and come back. Route handlers and Server Actions refresh in place.
- Requests arriving together in one server process share a single token refresh. See the limitations for what this doesn't cover.

### Sign-in and account creation

Shopify's customer accounts are passwordless and unified: the customer enters an email and gets a 6-digit code, and a profile is created automatically if none exists. So "sign in" and "create account" are the same step, and the interface says so. There is no password storage, OTP delivery or separate signup here.

### Guest carts

- The cart ID is kept in `localStorage`, so it survives refreshes and browser restarts until Shopify retires the cart. Shopify's official docs don't state a lifetime, so expired carts are detected and the shopper is told.
- Prices and totals aren't stored. They come from Shopify on every load.
- `/api/cart` proxies cart operations so the Storefront token stays on the server. Cart IDs travel in POST bodies, not URLs, to keep the key inside them out of access logs.
- Guests need no account, cookie or configuration beyond the Storefront token.

### Account carts

Shopify has no API to look up or merge a customer's carts, so the cart ID is saved on the customer record:

- `custom.cart_id` is the cart every device loads.
- `custom.cart_snapshot` is a readable copy for the team on the customer page in Shopify admin.

On each page load, and when a tab regains focus, a signed-in browser posts its cart to `/api/account/cart`, which merges it with the saved cart and returns the result. Cart changes are reported back after a 1.5-second delay, so a burst of clicks is one save.

### Merging

The merge builds a **new** cart containing both sets of items, then saves it with `metafieldsSet` and `compareDigest`.

| Situation | What happens |
| --- | --- |
| Shopify fails during the merge | Both original carts are untouched. The browser keeps its cart and retries on the next load. |
| Replay, retry, or a second tab | The new cart's hidden `_wipelo_merged` attribute lists the carts it was built from, so the work is seen as done, even if the browser never got the answer. |
| Two devices merging at once | Shopify refuses the stale write. The loser discards its cart, re-reads, and merges on top of the winner. |
| The save fails after merging | The browser keeps the merged cart. The marker stops the retry from counting the saved cart's items twice. |
| Metafields aren't set up | Carts and checkout keep working. Only cross-device sync is off, and a warning is logged. |

The marker is created in the same mutation as the cart, so the two can't disagree. It holds hashes, never cart IDs or keys. The leading underscore hides it from Shopify's checkout, but staff may see it as an order attribute in admin.

Merge rules:

- Lines match on merchandise, selling plan and attributes. Matches add up; anything else stays separate.
- A line is capped at 99.
- Unavailable or deleted items are dropped and reported.
- The saved cart's note and attributes win conflicts.
- Discount codes that were applying in either cart carry over, and any that stop applying are reported.
- The result is compared with what was requested, because Shopify can return success while dropping a line with an invalid selling plan.
- A merge is refused if selling plans can't be read, since it would turn subscriptions into one-time purchases.

### Sign-out and shared browsers

`wipelo-cart-owner` records whose cart the browser holds, as a hash of the customer ID. On every page load:

- **Signed out, but the cart has an owner** (sign-out or an expired session): the browser's copy is removed. The cart stays on the customer record for next time.
- **Signed in as someone else:** the cart is removed without merging, so one customer never inherits another's cart.
- **A guest cart with no owner:** it merges into whoever signs in, which is the usual storefront behaviour.

### Checkout identity

Shopify's Storefront API accepts Customer Account API tokens directly in `buyerIdentity.customerAccessToken`. The older `storefrontCustomerAccessTokenCreate` exchange is deprecated and not used. When a signed-in shopper leaves for checkout, the token is re-attached and `logged_in=true` is added, which is how Shopify's Hydrogen marks these URLs. If attaching fails, checkout proceeds with `sso=silent`. Guests go straight to the cart's checkout URL.

## Setup

### Environment variables

See `.env.example`. All are server-only. With any of these missing, the sign-in page says accounts are unavailable and guest shopping continues.

| Variable | Notes |
| --- | --- |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | From the Customer Account API settings. |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET` | Same place. Never in code or chat. |
| `SESSION_SECRET` | `openssl rand -base64 32`. Changing it signs everyone out, unless the old value is kept in `SESSION_SECRET_PREVIOUS`. |
| `APP_ORIGINS` | Required in production: `https://wipelo.com,https://www.wipelo.com` |

### Customer metafields

Create both in **Settings → Custom data → Customers → Add definition**:

| Name | Namespace and key | Type | Customer Account API access | Purpose |
| --- | --- | --- | --- | --- |
| Cart ID | `custom.cart_id` | Single line text | Read and write | The cart every device loads |
| Cart snapshot | `custom.cart_snapshot` | JSON | Read and write | Readable cart for staff, on the customer page |

Both are read and written by the Customer Account API with the signed-in customer's token. Storefront API access isn't needed for either, and no Admin API token is required.

`custom.cart_id` holds the full cart ID including its secret key, so staff with access to customers can see it.

### Shopify checklist

1. **Settings → Customer accounts:** enable customer accounts.
2. **Settings → Custom data → Customers:** create the two metafields above.
3. **Sales channels → Headless → storefront → Customer Account API:**
   - Client type: Confidential.
   - Callback URIs: `https://wipelo.com/api/auth/callback`, `https://www.wipelo.com/api/auth/callback`
   - Logout URIs: `https://wipelo.com/`, `https://www.wipelo.com/`
   - Permissions used: `customer_read_customers`, `customer_write_customers`, `customer_read_orders`. Subscription contract permissions are only needed by Shopify's hosted subscription pages.
4. **Same storefront → Storefront API permissions:** product listings, cart read/write, selling plans.
5. Authorization requests ask for the scope `openid email customer-account-api:full`, and endpoints are read from the store's discovery documents.

**`www`:** both hosts work, but cookies and `localStorage` are per host, so a guest switching hosts would look like a new browser. Redirect `www` to the apex at the hosting level.

**Local development:** Shopify rejects `localhost` and any `http` callback, so use an HTTPS tunnel:

1. Add `https://<tunnel>/api/auth/callback` and `https://<tunnel>/` in the Customer Account API settings.
2. Add the tunnel origin to `APP_ORIGINS`.
3. Run `npm run dev`.

### Names and email

Shopify has no username field, and metafields can't enforce uniqueness. The account uses Shopify's first and last name. A unique public username would need its own service and isn't built.

Email changes need verification, so the profile page links to Shopify's hosted account rather than offering a field.

## Tests

| Command | What it proves | Needs |
| --- | --- | --- |
| `npm run test:unit` | OAuth failure paths, session refresh, merge rules and concurrency, validation. | Nothing |
| `npm run test:accounts` | Full browser flows against `tests/support/mock-shopify.mjs`. | Ports 3200 and 8443 |
| `ACCOUNTS_E2E_PROD=1 npm run test:accounts` | The same on `next build && next start`, with `__Host-` cookies and cache headers. | Ports 3200 and 8443 |
| `npx playwright test tests/e2e/subscriptions.spec.ts` | Subscriptions and guest carts on the real store. | `.env.local`. Set `NEXT_TEST_DIST_DIR` if another `next dev` is running. |
| `npm run graphql:validate` | Every GraphQL operation against Shopify's schemas. | `CUSTOMER_SCHEMA_JSON` from `@shopify/hydrogen`'s `dist/customer-account.schema.json`, and `GRAPHQL_PACKAGE`. See the script header. |

The mock copies cart behaviour observed on the real store, but it is still a mock. It proves this code's behaviour, not Shopify's.

## Verifying against real Shopify

After configuring the above, on `wipelo.com` or a tunnel:

1. Add an item as a guest, then sign in with a real email. The item should still be there.
2. Check the customer in Shopify admin. `Cart ID` and `Cart snapshot` should be filled in.
3. On a second device, sign in. The same cart should appear.
4. Add an item while signed out on that device, then sign in. Items should combine without duplicates.
5. Check `/account`, profile, addresses and orders.
6. Go to checkout while signed in. You should be recognised rather than asked to sign in.
7. Sign out. The cart should be empty, and signing back in should restore it.

If the token exchange fails with a code-verifier error, set `SHOPIFY_CUSTOMER_ACCOUNT_PKCE=false`: Shopify documents PKCE for public clients and advertises support generally, so its behaviour with confidential clients needs confirming.

## Known limitations

These are the costs of having no server-side store.

- **Cart key in the browser and in admin:** Shopify advises against exposing the cart ID's key client-side. With it, a script running on the site through an XSS flaw could read and change the cart, including buyer details attached to it. It gives no access to the account, because tokens stay in HttpOnly cookies. Staff can also see the ID in `custom.cart_id`.
- **Sessions can't be revoked from here:** sign-out clears the cookie and ends the Shopify session, but a copied session cookie stays usable until Shopify rejects its tokens or the cookie's 30 days run out. Rotating `SESSION_SECRET` signs everyone out at once.
- **Token refresh across servers:** requests are coalesced within one process. If two server instances refresh the same rotating token at once, the loser's request gets a 401. The cookie isn't cleared, so the next page load recovers.
- **No rate limiting:** there's no shared store to count requests in. Add limits at the hosting or CDN level if `/api/auth/*` or `/api/cart` are abused. Shopify applies its own limits behind them.
- **A stale tab can lose an edit:** if another device has already merged a cart, an edit made in an older tab on that old cart is dropped when the tab next syncs.
- **Account page status codes:** account pages stream, so a missing order or a signed-out visit returns HTTP 200 with the not-found page or a client redirect. No customer data is included, and the pages are marked `noindex`.
- **Checked-out carts:** these are assumed to read as null from Shopify, as retired carts do. This hasn't been observed with a completed order.
- **Old carts:** Shopify has no delete-cart API, so merged carts are abandoned rather than deleted, and expire on their own.
