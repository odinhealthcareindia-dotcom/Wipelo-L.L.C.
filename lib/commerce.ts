import type { ShopifyProduct } from "@/lib/shopify";

// Live commerce data as it comes from Shopify. Editorial copy never lives here; see lib/product-profiles.ts.
export type CommerceProduct = ShopifyProduct;

const BLOCK_TAGS = /<\/?(p|div|br|li|ul|ol|h[1-6]|tr|section|article|blockquote)\b[^>]*>/gi;
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const value = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

// Plain-text description: scripts and styles dropped, block tags become line breaks, entities decoded.
export function getProductDescription(product: CommerceProduct) {
  const html = product.descriptionHtml || product.description || "";
  return decodeEntities(html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(BLOCK_TAGS, "\n")
    .replace(/<[^>]+>/g, ""))
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

// The only input to category detection.
export function getProductSearchText(product: CommerceProduct) {
  return `${product.title} ${product.productType ?? ""} ${(product.tags ?? []).join(" ")} ${getProductDescription(product)}`;
}

// Resizes Shopify CDN images; any other URL (e.g. local /public images) is returned unchanged.
export function getImageUrl(url: string, width: number) {
  if (!/^https:\/\/cdn\.shopify\.com\//.test(url)) return url;
  const next = new URL(url);
  next.searchParams.set("width", String(width));
  return next.toString();
}

// "Wipelo ON THE GO" → "ON THE GO".
export function cleanTitle(title: string) {
  return title.replace(/^wipelo\s*/i, "").trim() || title;
}
