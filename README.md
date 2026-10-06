# Wipelo headless storefront

This project uses the Next.js App Router and Shopify's Storefront GraphQL API. The existing Wipelo landing page content and visual system are retained; the former navigation tabs now have their own routes. Product cards, product pages, images, variants, prices, collections, optional selling plans, Shopify carts, and checkout URLs are read from Shopify.

## Run locally

1. Use Node.js 20.9 or newer, then install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add your Shopify store domain and Storefront API access token to `.env.local`.
4. Start the app with `npm run dev`.

The store domain should look like `your-store.myshopify.com`, without a protocol. The token remains server-side and is not exposed as a `NEXT_PUBLIC_` variable. Until credentials and products are available, the shop displays a setup state rather than sample product prices.

## Shopify setup

1. In Shopify Admin, install the **Headless** sales channel, open it, and create a storefront. Copy its Storefront API public access token.
2. In the Headless storefront's Storefront API permissions, allow product listings (`unauthenticated_read_product_listings`) and cart read/write (`unauthenticated_read_checkouts`, `unauthenticated_write_checkouts`). If you use subscriptions, also allow selling plans (`unauthenticated_read_selling_plans`).
3. Add `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` to `.env.local` or your hosting environment. Set `SHOPIFY_API_VERSION` to a stable API version supported by your store (the starter value is `2026-07`).
4. Create products in Shopify. Add title, description, product images with alt text, prices, variants, and inventory as needed. Set products to **Active** and publish them to the **Headless** sales channel.
5. To add structured Wipelo details to a product page, create product metafield definitions in the `wipelo` namespace and expose them to the Storefront API (`PUBLIC_READ`). The default keys are `function`, `active`, `skin_type`, `directions`, `ingredients`, `free_from`, and `features`. `SHOPIFY_PRODUCT_METAFIELDS` adds extra `namespace.key` identifiers to the default list. Shopify's Storefront API requires metafield identifiers to be requested explicitly.
6. To manage complete PDP sections in Shopify, define `wipelo.pdp_content` as a JSON product metafield, expose it to the Storefront API (`PUBLIC_READ`), and paste the matching JSON from `content/shopify-pdp/*_pdp_content.json` into each product. The app renders moments, proposed mechanism and research notes, usage steps, comparisons, reviews state, ingredients, FAQs, and other product copy from that field. The matching `content/shopify-pdp/*.json` files also document the product handles, option values, USD pack prices, and compare-at prices used when creating the three Shopify listings.
7. For subscriptions, install and configure a Shopify subscription app, attach selling plans to products, enable the `unauthenticated_read_selling_plans` permission, and set `SHOPIFY_ENABLE_SELLING_PLANS=true`. Until a real selling plan is attached, the proposed subscription price and Welcome Kit appear as unavailable and the purchase button only adds a one-time Shopify variant to cart.
8. Configure a subscription app/customer account portal and put its URL in `NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL` to activate the Manage Subscription button.
9. Before accepting orders, finish the store's payment provider, market/currency, shipping, tax, and policy settings in Shopify. Shopify checkout uses those settings.

The Headless channel controls which products are available to this storefront. Products that exist in Admin but are not published to Headless won't be returned by the Storefront API.

## Routes

- `/` — preserved landing page, with Shopify-powered product sections
- `/shop` — Shopify product catalog
- `/products/[handle]` — Shopify product detail, options, purchase plans, cart, and checkout
- `/collections/[handle]` — Shopify collection; `/collections/all` lists all products
- `/science` — science and formulation content
- `/our-story` — Wipelo story
- `/manage-subscription` — subscription portal entry point and FAQs

The cart API proxy is at `/api/cart`. It creates and updates Shopify carts on the server, stores the cart ID in the browser, and sends buyers to Shopify's `checkoutUrl` to complete payment.

## Content note

The original design includes review counts, press quotes, study percentages, and clinician/UGC content that its own source labels as fictional or illustrative. They are retained in the landing-page design for continuity; replace them with verified, approved content before the storefront goes live.
