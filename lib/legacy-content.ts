// Archived prototype parser. Live pages render the components in components/home.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { moneyLabel } from "@/lib/money";
import type { ShopifyProduct } from "@/lib/shopify";

const source = readFileSync(join(process.cwd(), "content/home-body.html"), "utf8");

function cleanBody() {
  let body = source.slice(source.indexOf("</header>") + "</header>".length);
  body = body.slice(0, body.indexOf("<!-- FOOTER"));
  body = body.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  return rewriteLinks(body);
}

function rewriteLinks(markup: string) {
  return markup
    .replace(/href="(?:index\.html)?#line"/g, 'href="/shop#products"')
    .replace(/href="index\.html#line"/g, 'href="/shop#products"')
    .replace(/href="(?:index\.html)?#science"/g, 'href="/science#science"')
    .replace(/href="index\.html#science"/g, 'href="/science#science"')
    .replace(/href="(?:index\.html)?#beat"/g, 'href="/our-story#beat"')
    .replace(/href="index\.html#beat"/g, 'href="/our-story#beat"')
    .replace(/href="#faq"/g, 'href="/manage-subscription#faq"')
    .replace(/href="first\.html"/g, 'href="/products/first"')
    .replace(/href="index\.html"/g, 'href="/"');
}

function between(markup: string, start: string, end: string) {
  const startAt = markup.indexOf(start);
  const endAt = markup.indexOf(end, startAt + start.length);
  if (startAt < 0 || endAt < 0) return "";
  return markup.slice(startAt, endAt);
}

function replaceDivByClass(markup: string, className: string, replacement: string) {
  const opening = new RegExp(`<div\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, "i");
  const start = markup.search(opening);
  if (start < 0) return markup;
  const openingTag = markup.slice(start).match(opening)?.[0];
  if (!openingTag) return markup;
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 0;
  let end = -1;
  for (let match = tags.exec(markup); match; match = tags.exec(markup)) {
    if (/^<div\b/i.test(match[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) {
      end = tags.lastIndex;
      break;
    }
  }
  if (end < 0) return markup;
  return `${markup.slice(0, start)}${replacement}${markup.slice(end)}`;
}

function escapeHTML(value: string) {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (character) => entities[character] || character);
}

function homeHeroVisualMarkup(product: ShopifyProduct | null) {
  const image = product?.featuredImage ?? product?.images[0] ?? null;
  const title = product ? escapeHTML(product.title) : "Shopify catalog";
  const price = product ? escapeHTML(moneyLabel(product.priceRange.minVariantPrice)) : "Your product catalog";
  const imageMarkup = image
    ? `<img class="home-product-hero-image" src="./hero-image.png" alt="${escapeHTML(image.altText || product?.title || "Wipelo product")}">`
    : `<div class="pack pack-lg"><span class="p-seal">✦</span><span class="p-ghost">W</span><span class="p-cat">Functional Wet Wipes™</span><span class="p-name">Wipelo</span><span class="p-sku">${title}</span><div class="p-spec">${product ? escapeHTML(product.description.slice(0, 110)) : "Product names · images<br>Details · options · pricing<br>Connected to Shopify"}</div></div>`;
  const productLink = product ? `/products/${encodeURIComponent(product.handle)}` : "/shop";
  const linkLabel = product ? `Explore ${title} →` : "Browse the shop →";
  const productHandle = product ? escapeHTML(product.handle) : "Publish products to begin";
  return `<div class="hero-visual rv">
  <div class="hero-comp home-product-hero">
  <div class="hero-badge">
  <span class="mono">${product ? "From the Shopify catalog" : "Catalog ready"}</span>
  </div>${imageMarkup}
  <div class="home-product-hero-details">
  <span class="mono">${price}</span>
  <a class="link-arrow" href="${productLink}">${linkLabel}</a></div>
  </div>
  </div>`;
}
  // <div class="sachet hero-product-sachet">
  // <span class="s-notch"></span>
  // <span class="s-brand">Wipelo <em>${title}</em></span>
  // <span class="s-func">${product ? "Product details from Shopify" : "Product details load from Shopify"}</span>
  // <span class="s-line">${productHandle}</span>
  // </div>

export function getHomeMarkup(product: ShopifyProduct | null = null) {
  let body = cleanBody();
  body = replaceDivByClass(body, "hero-visual", homeHeroVisualMarkup(product));
  body = body.replace("<span class=\"v\">4 SKUs</span>", "<span class=\"v\">Shopify catalog</span>");
  const lineAt = body.indexOf("<!-- THE LINE -->");
  const ritualAt = body.indexOf("<!-- THE RITUAL -->");
  const faqAt = body.indexOf("<!-- FAQ -->");
  const finalShopAt = body.indexOf("<!-- FINAL SHOP STRIP -->");
  const newsletterAt = body.indexOf("<!-- NEWSLETTER + FOOTER -->");
  if ([lineAt, ritualAt, faqAt, finalShopAt, newsletterAt].some((index) => index < 0)) {
    return { opening: body, middleBeforeFAQ: "", middleAfterFAQ: "", newsletter: "" };
  }
  const rawOpening = body.slice(0, lineAt);
  const rawMiddleAfterFAQ = body.slice(faqAt + "<!-- FAQ -->".length, finalShopAt);
  const middleAfterFAQ = rawMiddleAfterFAQ.replace(/<section\b(?=[^>]*\bid="faq")[^>]*>[\s\S]*?<\/section>/i, "");
  return {
    opening: rawOpening,
    middleBeforeFAQ: body.slice(ritualAt, faqAt),
    middleAfterFAQ,
    newsletter: body.slice(newsletterAt),
  };
}

export function getScienceMarkup() {
  const body = cleanBody();
  const gap = between(body, "<!-- THE GAP (ink) -->", "<!-- THE LINE -->");
  const mechanismAndComparison = between(body, "<!-- MECHANISM (ink) -->", "<!-- THE OBJECT -->");
  return gap + mechanismAndComparison;
}

export function getStoryMarkup() {
  const body = cleanBody();
  return between(body, "<!-- BRAND BEAT -->", "<!-- FAQ -->");
}

export function getFaqMarkup() {
  const body = cleanBody();
  return between(body, "<!-- FAQ -->", "<!-- FINAL SHOP STRIP -->");
}

export function getFaqItems() {
  const markup = getFaqMarkup();
  const details = markup.matchAll(/<details\b[^>]*class="[^"]*\bfaq-item\b[^"]*"[^>]*>([\s\S]*?)<\/details>/gi);

  return Array.from(details, ([, itemMarkup]) => {
    const questionHTML = itemMarkup.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1]
      ?.replace(/<span\b[^>]*class="[^"]*\bpm\b[^"]*"[^>]*>[\s\S]*?<\/span>/i, "")
      .trim();
    const answerHTML = itemMarkup.match(/<div\b[^>]*class="[^"]*\bfaq-a\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1]
      ?.trim();

    return questionHTML && answerHTML ? { questionHTML, answerHTML } : null;
  }).filter((item): item is { questionHTML: string; answerHTML: string } => item !== null);
}
