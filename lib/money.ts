export function moneyLabel(money?: { amount: string; currencyCode: string } | null) {
  if (!money) return "";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: money.currencyCode }).format(Number(money.amount));
  } catch {
    return `${money.amount} ${money.currencyCode}`;
  }
}

type Money = { amount: string; currencyCode: string };

/** Every Wipelo pack holds 30 individually sealed wipes. */
export const WIPES_PER_PACK = 30;

/** Wipes in a variant, read from its title ("3 packs · 90 wipes"); falls back to packs × 30, then one pack. */
export function wipeCount(variantTitle?: string | null) {
  const wipes = variantTitle?.match(/(\d+)\s*wipes?\b/i);
  if (wipes) return Number(wipes[1]);
  const packs = variantTitle?.match(/(\d+)\s*packs?\b/i);
  return (packs ? Number(packs[1]) : 1) * WIPES_PER_PACK;
}

/** "$0.80/wipe" — the given price spread over the wipes in that variant. */
export function perWipeLabel(money: Money | null | undefined, variantTitle?: string | null) {
  if (!money) return "";
  const wipes = wipeCount(variantTitle);
  if (!wipes) return "";
  return `${moneyLabel({ amount: String(Number(money.amount) / wipes), currencyCode: money.currencyCode })}/wipe`;
}

/** Per-wipe cost of a product's lowest-priced variant, matching the "from" price shown beside it ($24 ÷ 30 = $0.80/wipe). */
export function productPerWipeLabel(product: { variants: { title: string; price: Money; availableForSale?: boolean }[]; priceRange: { minVariantPrice: Money } }) {
  const cheapest = product.variants.reduce<(typeof product.variants)[number] | undefined>((low, variant) => !low || Number(variant.price.amount) < Number(low.price.amount) ? variant : low, undefined);
  return perWipeLabel(product.priceRange.minVariantPrice, cheapest?.title);
}
