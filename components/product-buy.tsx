"use client";

import { useState } from "react";
import { useStorefrontCart } from "@/components/storefront-provider";
import { moneyLabel } from "@/lib/money";
import type { PdpContent } from "@/lib/pdp-content";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

export function AddProductButton({ variant, sellingPlanId, className = "btn btn-teal", children = "Add +" }: { variant: ShopifyVariant; sellingPlanId?: string; className?: string; children?: React.ReactNode }) {
  const { addToCart, busy } = useStorefrontCart();
  return <button type="button" className={className} disabled={busy || !variant.availableForSale} onClick={() => void addToCart(variant, sellingPlanId)}>{busy ? "Adding…" : variant.availableForSale ? children : "Sold out"}</button>;
}

function optionPackCount(variant: ShopifyVariant) {
  const optionText = variant.selectedOptions.map((option) => option.value).join(" ") || variant.title;
  return Number(optionText.match(/\b(1|3|6)\b/)?.[1] ?? 1);
}

function productName(title: string) {
  return title.replace(/^wipelo\s*/i, "");
}

export function ProductGallery({ product, content }: { product: ShopifyProduct; content: PdpContent | null }) {
  const images = product.images.length ? product.images : product.featuredImage ? [product.featuredImage] : [];
  const [active, setActive] = useState(0);
  const [torn, setTorn] = useState(false);
  const name = productName(product.title);
  const facts = content?.quickFacts ?? [
    { label: "Product", value: product.title },
    { label: "Format", value: "See pack details in Shopify" },
    { label: "Details", value: "Product information is managed in Shopify" },
  ];
  const formatFact = facts.find((fact) => fact.label === "Format")?.value || "Product details from Shopify";
  const placeholderSlides = ["Pack", "Full spec", "The seal", "How to use", "In the box"];

  return <div className="gal pdp-gallery">
    <div className="gal-main product-gal-main" aria-label={`${product.title} product gallery`}>
      {images.length ? images.map((image, index) => <div className={`g-slide product-slide${active === index ? " on" : ""}`} key={image.url}>
        <img src={image.url} alt={image.altText || product.title} />
      </div>) : placeholderSlides.map((label, index) => <div className={`g-slide product-slide product-slide-placeholder${index === 1 ? " g-solid-teal" : index === 4 ? " g-solid-cream" : ""}${active === index ? " on" : ""}`} key={label}>
        {index === 0 && <div className="pack pack-lg"><span className="p-cat">Functional Wet Wipes™</span><span className="p-name">Wipelo</span><span className="p-sku">{name}</span><div className="p-spec">{facts.map((fact) => <span key={fact.label}>{fact.label} · {fact.value}<br /></span>)}</div></div>}
        {index === 1 && <div className="product-spec-panel"><span className="mono-tag">// {name} · product details</span>{facts.map((fact) => <div className="spec-row" key={fact.label}><span className="k">{fact.label}</span><span className="dots" /><span className="v">{fact.value}</span></div>)}</div>}
        {index === 2 && <div className="product-gallery-message"><span className="mono-tag">// One sachet. One moment.</span><div className="sachet"><span className="s-notch" /><span className="s-brand">Wipelo <em>{name}</em></span><span className="s-func">{content?.systemName ?? "Individually sealed"}</span><span className="s-line">{formatFact}</span></div><p>Product imagery can be added to this Shopify listing at any time.</p></div>}
        {index === 3 && <div className="product-gallery-message"><span className="mono-tag">// Made for the moment</span><h2>{name}</h2><p>{content?.intro ?? product.description}</p></div>}
        {index === 4 && <div className="product-gallery-message"><span className="mono-tag">// In every pack</span><h2>{formatFact}</h2><p>See this product’s Shopify listing for the current pack and use information.</p></div>}
      </div>)}
      {images.length > 1 && <div className="product-image-count mono">{active + 1} / {images.length}</div>}
    </div>
    {images.length > 1 ? <div className="gal-thumbs product-thumbs">{images.map((image, index) => <button key={image.url} className={`gal-th${active === index ? " on" : ""}`} onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`}><img src={image.url} alt={image.altText || ""} /></button>)}</div> : !images.length && <div className="gal-thumbs product-thumbs">{placeholderSlides.map((label, index) => <button key={label} type="button" className={`gal-th${active === index ? " on" : ""}${index === 1 ? " t-teal" : index === 4 ? " t-ink" : ""}`} onClick={() => setActive(index)} aria-label={`Show ${label}`}><span className="mini">{label}</span></button>)}</div>}
    <button type="button" className={`product-tear${torn ? " torn" : ""}`} onClick={() => setTorn((value) => !value)} aria-pressed={torn}>
      <span className="s-notch" /><span className="s-brand">Wipelo <em>{name}</em></span><span className="s-func">{torn ? "Seal broken · ready to use" : "Single-seal sachet · tear here →"}</span>
    </button>
  </div>;
}

export function ProductPurchase({ product, content }: { product: ShopifyProduct; content: PdpContent | null }) {
  const { addToCart, busy } = useStorefrontCart();
  const variants = product.variants;
  const threePack = variants.find((variant) => optionPackCount(variant) === 3);
  const initialVariant = (threePack?.availableForSale ? threePack : null) ?? variants.find((variant) => variant.availableForSale) ?? threePack ?? variants[0] ?? null;
  const [variantId, setVariantId] = useState(initialVariant?.id ?? "");
  const selectedVariant = variants.find((variant) => variant.id === variantId) ?? initialVariant;
  const [selectedPlan, setSelectedPlan] = useState("");
  const options = product.options.filter((option) => option.values.length > 1 && option.name.toLowerCase() !== "title");
  const plans = selectedVariant?.sellingPlanAllocations ?? [];
  const activePlan = plans.find((allocation) => allocation.sellingPlan.id === selectedPlan);
  const displayPrice = activePlan?.checkoutChargeAmount ?? selectedVariant?.price;
  const count = selectedVariant ? optionPackCount(selectedVariant) : 1;
  const wipes = count * 30;
  const proposedSubscriptionPrice = selectedVariant ? moneyLabel({
    amount: (Number(selectedVariant.price.amount) * (1 - ((content?.subscription.savingsPercent ?? 10) / 100))).toFixed(2),
    currencyCode: selectedVariant.price.currencyCode,
  }) : "Not set up";
  const description = content?.intro || product.description;
  const name = productName(product.title);
  const formatFact = content?.quickFacts.find((fact) => fact.label === "Format")?.value || "Product details from Shopify";

  function selectVariant(variant: ShopifyVariant) {
    setVariantId(variant.id);
    setSelectedPlan("");
  }

  return <div className="buy pdp-buybox" id="buybox-info">
    <span className="crumb">{content?.breadcrumb || "Functional wet wipes™ · Body care"}</span>
    <h1>{product.title}</h1>
    <div className="rating"><span className="stars" aria-label="No ratings yet">☆☆☆☆☆</span><span>Rating pending · 0 verified reviews</span><a href="#reviews">Read reviews ↓</a></div>
    {description && <p className="pitch">{description}</p>}
    {content?.bullets.length ? <ul className="buy-bullets">{content.bullets.map((bullet) => <li key={bullet}><span className="bt">✦</span>{bullet}</li>)}</ul> : null}

    <div className="opt-label"><span>01 — Choose your supply</span><span>{content ? `${count} pack${count === 1 ? "" : "s"} · ${wipes} wipes` : selectedVariant?.title || "Choose an option"}</span></div>
    {options.length ? options.map((option) => <div className="opts" key={option.id} role="radiogroup" aria-label={option.name}>{option.values.map((value) => {
      const variant = variants.find((candidate) => candidate.selectedOptions.some((selected) => selected.name === option.name && selected.value === value));
      if (!variant) return null;
      const packCount = optionPackCount(variant);
      const price = moneyLabel(variant.price);
      const compareAt = variant.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount) ? moneyLabel(variant.compareAtPrice) : null;
      const perWipe = content ? moneyLabel({ amount: (Number(variant.price.amount) / (packCount * 30)).toFixed(2), currencyCode: variant.price.currencyCode }) : null;
      const popular = packCount === 3;
      return <label className={`opt${selectedVariant?.id === variant.id ? " sel" : ""}`} key={value}>
        {popular && <span className="opt-badge tealb">Most popular</span>}
        {packCount === 6 && <span className="opt-badge">Best deal</span>}
        <input type="radio" name={`supply-${product.id}`} checked={selectedVariant?.id === variant.id} onChange={() => selectVariant(variant)} aria-label={value} />
        <span className="dot" />
        <span className="o-main"><span className="o-title">{value}</span><span className="o-sub">{content ? (popular ? "Three individually packed boxes · launch price" : `${packCount * 30} individually wrapped wipes`) : variant.title}</span></span>
        <span className="o-price">{compareAt && <span className="was">{compareAt}</span>}<span className="now">{price}</span>{perWipe && <span className="per">{perWipe} / wipe</span>}</span>
      </label>;
    })}</div>) : <div className="opts"><div className="opt sel"><span className="dot" /><span className="o-main"><span className="o-title">{selectedVariant?.title || "One-time purchase"}</span><span className="o-sub">Product options and pack sizes are managed in Shopify.</span></span><span className="o-price"><span className="now">{moneyLabel(selectedVariant?.price)}</span></span></div></div>}

    {(content || plans.length > 0) && <>
      <div className="opt-label"><span>02 — How often</span><span>{plans.length ? "Shopify subscription" : "Recurring checkout not set up"}</span></div>
      <div className="opts">
        <label className={`opt${!selectedPlan ? " sel" : ""}`}>
          <input type="radio" name={`frequency-${product.id}`} checked={!selectedPlan} onChange={() => setSelectedPlan("")} aria-label="One-time purchase" />
          <span className="dot" /><span className="o-main"><span className="o-title">One-time</span><span className="o-sub">A single order. No recurring charge.</span></span>
          <span className="o-price"><span className="now">{moneyLabel(selectedVariant?.price)}</span><span className="per">one delivery</span></span>
        </label>
        {plans.length ? plans.map((allocation) => <label className={`opt${selectedPlan === allocation.sellingPlan.id ? " sel" : ""}`} key={allocation.sellingPlan.id}>
          <input type="radio" name={`frequency-${product.id}`} checked={selectedPlan === allocation.sellingPlan.id} onChange={() => setSelectedPlan(allocation.sellingPlan.id)} aria-label={allocation.sellingPlan.name} />
          <span className="dot" /><span className="o-main"><span className="o-title">{allocation.sellingPlan.name}</span><span className="o-sub">Terms and interval managed by your Shopify subscription app.</span></span>
          <span className="o-price"><span className="now">{moneyLabel(allocation.checkoutChargeAmount)}</span><span className="per">per delivery</span></span>
        </label>) : content && <div className="opt opt-disabled" aria-disabled="true">
          <span className="dot" /><span className="o-main"><span className="o-title">Subscribe &amp; save {content.subscription.savingsPercent}%</span><span className="o-sub">Planned in the product brief. Connect a Shopify subscription app and selling plan to activate recurring orders.</span></span>
          <span className="o-price"><span className="now">{proposedSubscriptionPrice}</span><span className="per">proposed · unavailable</span></span>
        </div>}
      </div>
    </>}

    {content && selectedVariant && <div className="kit"><div className="k-title"><span>// Your first delivery, itemized</span><span>{count} pack{count === 1 ? "" : "s"}</span></div><ul><li>✦ <b>{wipes} individually packed wipes</b> — {count} box{count === 1 ? "" : "es"} of {name}</li><li>✦ <b>Welcome Kit · ${content.subscription.welcomeKitValue} proposed value</b> — planned for a first subscription order only</li></ul><div className="k-total"><span>Proposed subscription today</span><span><span className="pay">{moneyLabel({ amount: (Number(selectedVariant.price.amount) * (1 - (content.subscription.savingsPercent / 100))).toFixed(2), currencyCode: selectedVariant.price.currencyCode })}</span></span></div><p className="shopify-checkout-note">{content.subscription.note}</p></div>}
    <div className="atc"><button className="btn btn-teal btn-lg btn-wide" type="button" disabled={!selectedVariant?.availableForSale || busy} onClick={() => selectedVariant && void addToCart(selectedVariant, selectedPlan || undefined)}>{busy ? "Adding to cart…" : selectedVariant?.availableForSale ? `Add to cart — ${moneyLabel(displayPrice)}` : "Sold out"}</button></div>
    {selectedVariant?.compareAtPrice && Number(selectedVariant.compareAtPrice.amount) > Number(selectedVariant.price.amount) && <p className="compare-at-price">Regular pack value {moneyLabel(selectedVariant.compareAtPrice)}. Your price: {moneyLabel(selectedVariant.price)}.</p>}
    {content ? <div className="atc-under"><div className="u-row"><span className="ic">✓</span><span><b>{content.guarantee.title}</b> — {content.guarantee.body}</span></div><div className="u-row"><span className="ic">✓</span><span>{content.announcements.find((line) => line.toLowerCase().includes("shipping")) || "Shipping details are set by the Shopify store."}</span></div><div className="u-row"><span className="ic">✓</span><span>{content.announcements.find((line) => line.toLowerCase().includes("dispatch")) || "Availability and fulfillment are confirmed at checkout."}</span></div></div> : <p className="shopify-checkout-note">Secure checkout and payment are completed by Shopify.</p>}
    <div className="buy-specfoot"><b>//</b> {content ? `${content.systemName} · ${content.clothName} · ${formatFact}` : "Product details, format, and options are managed in Shopify."}</div>
  </div>;
}

export function ShopifyProductDescription({ html }: { html: string }) {
  if (!html.trim()) return null;
  return <section className="sec product-long-description"><div className="wrap"><span className="mono-tag">// Product details from Shopify</span><div className="product-description-html" dangerouslySetInnerHTML={{ __html: html }} /></div></section>;
}
