"use client";

import { useState } from "react";
import { useStorefrontCart } from "@/components/storefront-provider";
import { moneyLabel } from "@/lib/money";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

export function AddProductButton({ variant, sellingPlanId, className = "btn btn-teal" }: { variant: ShopifyVariant; sellingPlanId?: string; className?: string }) {
  const { addToCart, busy } = useStorefrontCart();
  return <button type="button" className={className} disabled={busy || !variant.availableForSale} onClick={() => void addToCart(variant, sellingPlanId)}>{busy ? "Adding…" : variant.availableForSale ? "Add +" : "Sold out"}</button>;
}

export function ProductGallery({ product }: { product: ShopifyProduct }) {
  const images = product.images.length ? product.images : product.featuredImage ? [product.featuredImage] : [];
  const [active, setActive] = useState(0);
  const [torn, setTorn] = useState(false);

  return <div className="pdp-gallery">
    <div className="gal-main product-gal-main">
      {images.length ? images.map((image, index) => <div className={`g-slide product-slide${active === index ? " on" : ""}`} key={image.url}>
        <img src={image.url} alt={image.altText || product.title} />
      </div>) : <div className="g-slide on product-slide product-slide-placeholder"><div className="product-pack-art pack-lg"><span className="p-cat">Functional Wet Wipes™</span><span className="p-name">Wipelo</span><span className="p-sku">{product.title}</span></div></div>}
      {images.length > 0 && <div className="product-image-count mono">{active + 1} / {images.length}</div>}
    </div>
    {images.length > 1 && <div className="gal-thumbs product-thumbs">{images.map((image, index) => <button key={image.url} className={`gal-th${active === index ? " on" : ""}`} onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`}><img src={image.url} alt={image.altText || ""} /></button>)}</div>}
    <button type="button" className={`product-tear${torn ? " torn" : ""}`} onClick={() => setTorn((value) => !value)} aria-pressed={torn}>
      <span className="s-notch" /><span className="s-brand">Wipelo <em>{product.title}</em></span><span className="s-func">{torn ? "Seal broken · ready to use" : "Single-Seal Fresh™ · tear here →"}</span>
    </button>
  </div>;
}

export function ProductPurchase({ product }: { product: ShopifyProduct }) {
  const { addToCart, busy } = useStorefrontCart();
  const availableVariants = product.variants;
  const initialVariant = availableVariants.find((item) => item.availableForSale) ?? availableVariants[0] ?? null;
  const [variantId, setVariantId] = useState(initialVariant?.id ?? "");
  const selectedVariant = availableVariants.find((variant) => variant.id === variantId) ?? initialVariant;
  const planAllocations = selectedVariant?.sellingPlanAllocations ?? [];
  const [selectedPlan, setSelectedPlan] = useState("");

  const optionValues = new Map<string, string[]>();
  product.options.forEach((option) => {
    if (option.values.length > 1 && option.name.toLowerCase() !== "title") optionValues.set(option.name, option.values);
  });

  function chooseOption(name: string, value: string) {
    const current = selectedVariant?.selectedOptions ?? [];
    const selectedOptions = [...current.filter((item) => item.name !== name), { name, value }];
    const next = availableVariants.find((variant) => selectedOptions.every((option) => variant.selectedOptions.some((candidate) => candidate.name === option.name && candidate.value === option.value)));
    if (next) {
      setVariantId(next.id);
      setSelectedPlan("");
    }
  }

  const activePlan = planAllocations.find((allocation) => allocation.sellingPlan.id === selectedPlan);
  const displayPrice = activePlan?.checkoutChargeAmount ?? selectedVariant?.price;

  return <div className="pdp-buybox">
    <span className="mono-tag">// Product from Shopify</span>
    <div className="pdp-title-row"><h1 className="h-section">{product.title}</h1><span className="pdp-price">{moneyLabel(displayPrice)}</span></div>
    <p className="lede pdp-description">{product.description}</p>
    {product.options.map((option) => optionValues.has(option.name) && <fieldset className="product-option" key={option.id}><legend>{option.name}</legend><div className="product-option-values">{option.values.map((value) => <button key={value} type="button" className={selectedVariant?.selectedOptions.some((selected) => selected.name === option.name && selected.value === value) ? "selected" : ""} onClick={() => chooseOption(option.name, value)}>{value}</button>)}</div></fieldset>)}
    {planAllocations.length > 0 && <fieldset className="product-option"><legend>Purchase option</legend><div className="purchase-plans"><button type="button" className={!selectedPlan ? "selected" : ""} onClick={() => setSelectedPlan("")}>One-time · {moneyLabel(selectedVariant?.price)}</button>{planAllocations.map((allocation) => <button type="button" key={allocation.sellingPlan.id} className={selectedPlan === allocation.sellingPlan.id ? "selected" : ""} onClick={() => setSelectedPlan(allocation.sellingPlan.id)}>{allocation.sellingPlan.name} · {moneyLabel(allocation.checkoutChargeAmount)}</button>)}</div></fieldset>}
    <div className="product-buy-action"><button type="button" className="btn btn-teal btn-lg btn-wide" disabled={!selectedVariant?.availableForSale || busy} onClick={() => selectedVariant && void addToCart(selectedVariant, selectedPlan || undefined)}>{busy ? "Adding to cart…" : selectedVariant?.availableForSale ? "Add to cart" : "Sold out"}</button></div>
    {selectedVariant?.compareAtPrice && Number(selectedVariant.compareAtPrice.amount) > Number(selectedVariant.price.amount) && <p className="compare-at-price">Compare at {moneyLabel(selectedVariant.compareAtPrice)}</p>}
    {product.metafields.length > 0 && <div className="product-meta-summary">{product.metafields.filter((item) => item.namespace === "wipelo").map((item) => <div className="spec-row" key={item.id}><span className="k">{item.key.replace(/[-_]/g, " ")}</span><span className="dots" /><span className="v">{item.value}</span></div>)}</div>}
    <p className="shopify-checkout-note">Secure checkout and payment are completed by Shopify.</p>
  </div>;
}

export function ShopifyProductDescription({ html }: { html: string }) {
  if (!html.trim()) return null;
  return <section className="sec product-long-description"><div className="wrap"><span className="mono-tag">// Product details from Shopify</span><div className="product-description-html" dangerouslySetInnerHTML={{ __html: html }} /></div></section>;
}
