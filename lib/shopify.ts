const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";
const DEFAULT_PRODUCT_METAFIELDS = [
  "wipelo.function",
  "wipelo.active",
  "wipelo.skin_type",
  "wipelo.directions",
  "wipelo.ingredients",
  "wipelo.free_from",
  "wipelo.features",
  "wipelo.pdp_content",
];
const PRODUCT_METAFIELDS = [...new Set([
  ...DEFAULT_PRODUCT_METAFIELDS,
  ...(process.env.SHOPIFY_PRODUCT_METAFIELDS || "").split(",").map((identifier) => identifier.trim()).filter(Boolean),
])]
  .map((identifier) => identifier.split("."))
  .filter(([namespace, key]) => Boolean(namespace && key))
  .map(([namespace, key]) => ({ namespace, key }));

export type ShopifyMoney = { amount: string; currencyCode: string };
export type ShopifyImage = { url: string; altText: string | null; width?: number | null; height?: number | null };
export type ShopifyOption = { name: string; value: string };
export type ShopifySellingPlan = { id: string; name: string; description: string | null; recurringDeliveries: boolean; options: { name: string | null; value: string | null }[] };
export type ShopifyPlanAllocation = {
  sellingPlan: ShopifySellingPlan;
  checkoutChargeAmount: ShopifyMoney;
};
export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: ShopifyOption[];
  image: ShopifyImage | null;
  sellingPlanAllocations: ShopifyPlanAllocation[];
};
export type ShopifyMetafield = { id: string; namespace: string; key: string; type: string; value: string };
export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  requiresSellingPlan: boolean;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney };
  options: { id: string; name: string; values: string[] }[];
  variants: ShopifyVariant[];
  metafields: ShopifyMetafield[];
};
export type ShopifyCollection = { id: string; handle: string; title: string; description: string; products: ShopifyProduct[] };
type ShopifyProductConnection = { nodes: ShopifyProductPayload[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
type ShopifyVariantPayload = Omit<ShopifyVariant, "sellingPlanAllocations"> & {
  sellingPlanAllocations?: { nodes: ShopifyPlanAllocation[] } | ShopifyPlanAllocation[];
};
type ShopifyProductPayload = Omit<ShopifyProduct, "images" | "variants" | "metafields"> & {
  metafields: (ShopifyMetafield | null)[] | null;
  images: { nodes: ShopifyImage[] } | ShopifyImage[];
  variants: { nodes: ShopifyVariantPayload[] } | ShopifyVariantPayload[];
};
type ShopifyProductPayloadConnection = Omit<ShopifyProductConnection, "nodes"> & { nodes: ShopifyProductPayload[] };

export function isShopifyConfigured() {
  return Boolean(SHOPIFY_DOMAIN && SHOPIFY_TOKEN);
}

export function shopifyStoreDomain() {
  return SHOPIFY_DOMAIN || null;
}

type StorefrontPayload<T> = { data?: T | null; errors?: { message: string; extensions?: { code?: string } }[] };

async function storefrontRequest<T>(query: string, variables: Record<string, unknown> | undefined, cache: RequestCache): Promise<StorefrontPayload<T>> {
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    ...(cache === "force-cache" ? { next: { revalidate: 60, tags: ["shopify", "shopify-products"] } } : {}),
  });
  if (!response.ok) throw new Error(`Shopify responded with HTTP ${response.status}`);
  return response.json();
}

// Selling-plan fields fail the whole query unless the token has unauthenticated_read_selling_plans,
// so they are only requested once Shopify confirms access. Products keep selling one-time without it.
let warnedPlanAccess = false;
async function canReadSellingPlans() {
  try {
    const payload = await storefrontRequest(`{ products(first: 1) { nodes { sellingPlanGroups(first: 1) { nodes { name } } } } }`, undefined, "force-cache");
    const denied = Boolean(payload.errors?.some((error) => error.extensions?.code === "ACCESS_DENIED"));
    if (denied && !warnedPlanAccess) {
      warnedPlanAccess = true;
      console.warn("Shopify Storefront token lacks unauthenticated_read_selling_plans; subscriptions are hidden.");
    }
    return !denied;
  } catch {
    return false;
  }
}

async function storefrontQuery<T>(query: string, variables?: Record<string, unknown>, cache: RequestCache = "force-cache"): Promise<T | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const planVariables = query.includes("$sellingPlans") ? { sellingPlans: await canReadSellingPlans() } : {};
    const payload = await storefrontRequest<T>(query, { ...variables, ...planVariables }, cache);
    if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join("; "));
    return payload.data ?? null;
  } catch (error) {
    console.error("Shopify Storefront API request failed:", error);
    return null;
  }
}

const IMAGE_FIELDS = `url altText width height`;
const VARIANT_PLAN_FIELDS = `
  sellingPlanAllocations(first: 20) @include(if: $sellingPlans) {
    nodes {
      checkoutChargeAmount { amount currencyCode }
      sellingPlan { id name description recurringDeliveries options { name value } }
    }
  }`;
const PRODUCT_FIELDS = `
  id handle title productType tags description descriptionHtml availableForSale requiresSellingPlan
  featuredImage { ${IMAGE_FIELDS} }
  images(first: 20) { nodes { ${IMAGE_FIELDS} } }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  options { id name values }
  variants(first: 100) {
    nodes {
      id title availableForSale price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
      image { ${IMAGE_FIELDS} }${VARIANT_PLAN_FIELDS}
    }
  }
  metafields(identifiers: $metafieldIdentifiers) { id namespace key type value }
`;

function normalizeProduct(product: ShopifyProductPayload): ShopifyProduct {
  const images = Array.isArray(product.images) ? product.images : product.images.nodes;
  const variants = Array.isArray(product.variants) ? product.variants : product.variants.nodes;

  return {
    ...product,
    images,
    variants: variants.map((variant) => {
      const allocations = variant.sellingPlanAllocations;
      return {
        ...variant,
        sellingPlanAllocations: Array.isArray(allocations) ? allocations : allocations?.nodes ?? [],
      };
    }),
    metafields: (product.metafields ?? []).filter((field): field is ShopifyMetafield => Boolean(field)),
  };
}

export async function getProducts(first = 50): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let after: string | null = null;
  for (let page = 0; page < 50; page += 1) {
    const data: { products: ShopifyProductConnection } | null = await storefrontQuery<{ products: ShopifyProductConnection }>(
      `query WipeloProducts($first: Int!, $after: String, $metafieldIdentifiers: [HasMetafieldsIdentifier!]!, $sellingPlans: Boolean!) {
        products(first: $first, after: $after, sortKey: TITLE) {
          nodes { ${PRODUCT_FIELDS} }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { first, after, metafieldIdentifiers: PRODUCT_METAFIELDS },
    );
    if (!data) break;
    products.push(...data.products.nodes.map(normalizeProduct));
    if (!data.products.pageInfo.hasNextPage || !data.products.pageInfo.endCursor) break;
    after = data.products.pageInfo.endCursor;
  }
  return products;
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontQuery<{ product: ShopifyProductPayload | null }>(
    `query WipeloProduct($handle: String!, $metafieldIdentifiers: [HasMetafieldsIdentifier!]!, $sellingPlans: Boolean!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`,
    { handle, metafieldIdentifiers: PRODUCT_METAFIELDS },
  );
  return data?.product ? normalizeProduct(data.product) : null;
}

export async function getCollectionByHandle(handle: string): Promise<ShopifyCollection | null> {
  const data = await storefrontQuery<{ collection: Omit<ShopifyCollection, "products"> & { products: ShopifyProductConnection } | null }>(
    `query WipeloCollection($handle: String!, $first: Int!, $after: String, $metafieldIdentifiers: [HasMetafieldsIdentifier!]!, $sellingPlans: Boolean!) {
      collection(handle: $handle) {
        id handle title description
        products(first: $first, after: $after, sortKey: TITLE) {
          nodes { ${PRODUCT_FIELDS} }
          pageInfo { hasNextPage endCursor }
        }
      }
    }`,
    { handle, first: 50, after: null, metafieldIdentifiers: PRODUCT_METAFIELDS },
  );
  if (!data?.collection) return null;
  const { products: firstPage, ...collection } = data.collection;
  const products = firstPage.nodes.map(normalizeProduct);
  let after = firstPage.pageInfo.endCursor;
  for (let page = 1; page < 50 && firstPage.pageInfo.hasNextPage && after; page += 1) {
    const next = await storefrontQuery<{ collection: { products: ShopifyProductConnection } | null }>(
      `query WipeloCollectionPage($handle: String!, $first: Int!, $after: String, $metafieldIdentifiers: [HasMetafieldsIdentifier!]!, $sellingPlans: Boolean!) {
        collection(handle: $handle) {
          products(first: $first, after: $after, sortKey: TITLE) {
            nodes { ${PRODUCT_FIELDS} }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { handle, first: 50, after, metafieldIdentifiers: PRODUCT_METAFIELDS },
    );
    const connection = next?.collection?.products;
    if (!connection) break;
    products.push(...connection.nodes.map(normalizeProduct));
    after = connection.pageInfo.endCursor;
    if (!connection.pageInfo.hasNextPage) break;
  }
  return { ...collection, products };
}

export async function getSubscriptionPolicyUrl() {
  const data = await storefrontQuery<{ shop: { subscriptionPolicy: { url: string } | null } }>(`{ shop { subscriptionPolicy { url } } }`);
  return data?.shop.subscriptionPolicy?.url ?? null;
}

// Customer accounts is where Shopify Subscriptions lets buyers change or cancel. /account redirects there.
export function subscriptionPortalUrl() {
  return process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL?.trim() || (SHOPIFY_DOMAIN ? `https://${SHOPIFY_DOMAIN}/account` : null);
}

export type ShopifyCartLineInput = { merchandiseId: string; quantity: number; sellingPlanId?: string | null };
export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney };
  totalQuantity: number;
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: ShopifyMoney };
      merchandise: {
        id: string;
        title: string;
        image: ShopifyImage | null;
        price: ShopifyMoney;
        product: { title: string; handle: string };
      };
      sellingPlanAllocation?: { sellingPlan: Pick<ShopifySellingPlan, "id" | "name" | "recurringDeliveries" | "options"> } | null;
    }[];
  };
};

const CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id quantity cost { totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id title image { ${IMAGE_FIELDS} } price { amount currencyCode }
          product { title handle }
        }
      }
      sellingPlanAllocation @include(if: $sellingPlans) { sellingPlan { id name recurringDeliveries options { name value } } }
    }
  }
`;

type CartMutationData = { cart: ShopifyCart | null; userErrors: { message: string; field: string[] | null }[] };

export async function getCart(cartId: string) {
  const data = await storefrontQuery<{ cart: ShopifyCart | null }>(
    `query WipeloCart($id: ID!, $sellingPlans: Boolean!) { cart(id: $id) { ${CART_FIELDS} } }`,
    { id: cartId },
    "no-store",
  );
  return data?.cart ?? null;
}

export async function createCart(lines: ShopifyCartLineInput[]) {
  return storefrontQuery<{ cartCreate: CartMutationData }>(
    `mutation WipeloCartCreate($input: CartInput!, $sellingPlans: Boolean!) {
      cartCreate(input: $input) { cart { ${CART_FIELDS} } userErrors { field message } }
    }`,
    { input: { lines } },
    "no-store",
  );
}

export async function addCartLines(cartId: string, lines: ShopifyCartLineInput[]) {
  return storefrontQuery<{ cartLinesAdd: CartMutationData }>(
    `mutation WipeloCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $sellingPlans: Boolean!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { field message } }
    }`,
    { cartId, lines },
    "no-store",
  );
}

export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]) {
  return storefrontQuery<{ cartLinesUpdate: CartMutationData }>(
    `mutation WipeloCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $sellingPlans: Boolean!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { field message } }
    }`,
    { cartId, lines },
    "no-store",
  );
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  return storefrontQuery<{ cartLinesRemove: CartMutationData }>(
    `mutation WipeloCartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $sellingPlans: Boolean!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { field message } }
    }`,
    { cartId, lineIds },
    "no-store",
  );
}
