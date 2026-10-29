"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProductGrid } from "@/components/catalog";
import { FAQAccordion } from "@/components/faq-accordion";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { useStorefrontCart } from "@/components/storefront-provider";
import { cleanTitle, getImageUrl, type CommerceProduct } from "@/lib/commerce";
import { moneyLabel } from "@/lib/money";
import { getProductProfile, type BenefitIconKey, type SubscriptionStory } from "@/lib/product-profiles";
import { getApprovedReviews } from "@/lib/product-reviews";
import type { ShopifyVariant } from "@/lib/shopify";
import { FeaturedInStrip } from "../home/featured-in";
import { ProductIntro } from "./product-intro";

type PurchaseMode = "subscribe" | "one-time";

const GALLERY_SIZE = 8;
const BRAND_IMAGES = ["/wipelo-lab-range.png", "/wipelo-purposeful-care.png"];
const SLIDE_HEADLINES = ["The pack", "Up close", "Inside the formula", "How to use it", "In real life", "Made to carry", "The detail", "Ready when you are"];

const baseSectionLinks = [
  { id: "product", label: "Overview" },
  { id: "why-it-works", label: "Benefits" },
  { id: "proof", label: "Expert" },
  { id: "ingredients", label: "Ingredients" },
  { id: "quality", label: "Quality" },
  { id: "care-guidance", label: "Care guidance" },
  { id: "expect", label: "What to expect" },
  { id: "subscribe", label: "Subscribe" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
];

const defaultSubscriptionStory: SubscriptionStory = {
  eyebrow: "Subscribe",
  title: "Never run out between showers.",
  body: "Choose a delivery rhythm at checkout. Terms and pricing are shown before you pay, and you can manage the subscription from your account.",
  benefits: ["Delivered on your schedule", "Terms shown before you pay", "Manage it from your account"],
};

const benefitIcons: Record<BenefitIconKey, ReactNode> = {
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2" /></>,
  travel: <><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
  drop: <path d="M12 4c3 4 5 6.6 5 9.2A5 5 0 0 1 7 13.2C7 10.6 9 8 12 4Z" />,
  leaf: <><path d="M6 18c0-7 5-12 12-12 0 7-5 12-12 12Z" /><path d="M6 18 13 11" /></>,
  shield: <path d="M12 4 18 6.5v5c0 4-2.6 6.7-6 8-3.4-1.3-6-4-6-8v-5L12 4Z" />,
  heart: <path d="M12 19s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 1.8C19 14.6 12 19 12 19Z" />,
  spark: <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1" />,
  pin: <><path d="M12 20s6-5.4 6-10a6 6 0 0 0-12 0c0 4.6 6 10 6 10Z" /><circle cx="12" cy="10" r="2" /></>,
};
const fallbackIcons: BenefitIconKey[] = ["clock", "travel", "drop", "leaf"];

function Icon({ name }: { name: BenefitIconKey }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{benefitIcons[name]}</svg>;
}

function savingsPercent(variant: ShopifyVariant) {
  const price = Number(variant.price.amount);
  const compareAt = Number(variant.compareAtPrice?.amount ?? 0);
  return compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;
}

function durationLabel(variant: ShopifyVariant) {
  const match = variant.title.match(/(\d+)\s*(week|month)s?/i);
  return match ? `${match[1]} ${match[2].toLowerCase()}${match[1] === "1" ? "" : "s"}` : null;
}

function cycle<T>(items: T[], size: number) {
  if (!items.length) return [];
  return Array.from({ length: size }, (_, index) => items[index % items.length]);
}

export function LiveProductPdp({ product, related = [] }: { product: CommerceProduct; related?: CommerceProduct[] }) {
  const { addToCart, busy } = useStorefrontCart();

  // 1. Offer logic from live variants.
  const variants = product.variants;
  const defaultVariant = (variants[1]?.availableForSale ? variants[1] : variants.find((variant) => variant.availableForSale)) ?? variants[0];
  const [selectedId, setSelectedId] = useState(defaultVariant?.id ?? "");
  const selected = variants.find((variant) => variant.id === selectedId) ?? defaultVariant;
  const bestValueVariantId = useMemo(() => {
    const ranked = variants.map((variant) => ({ id: variant.id, saving: savingsPercent(variant) })).filter((item) => item.saving > 0).sort((a, b) => b.saving - a.saving);
    return ranked[0]?.id ?? null;
  }, [variants]);
  const recommendedVariantId = variants.length > 2 && variants[Math.floor(variants.length / 2)].id !== bestValueVariantId ? variants[Math.floor(variants.length / 2)].id : null;
  const hasSubscription = variants.some((variant) => variant.sellingPlanAllocations.length > 0);
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>(hasSubscription ? "subscribe" : "one-time");
  const [quantity, setQuantity] = useState(1);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const hasLaunchPrice = variants.some((variant) => savingsPercent(variant) > 0);
  const plan = purchaseMode === "subscribe" ? selected?.sellingPlanAllocations[0] ?? null : null;
  const effectivePrice = plan ? plan.checkoutChargeAmount : selected?.price;
  const planSaving = plan && selected ? Number(selected.price.amount) - Number(plan.checkoutChargeAmount.amount) : 0;

  // 2–4. Title, profile, reviews.
  const title = cleanTitle(product.title);
  const profile = getProductProfile(product);
  const reviews = getApprovedReviews(profile.category);
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  // 5. Section links, matched to the sections that actually render.
  const sectionLinks = useMemo(() => baseSectionLinks.filter((link) => {
    if (link.id === "reviews") return reviews.length > 0;
    if (link.id === "subscribe") return hasSubscription;
    if (link.id === "proof") return Boolean(profile.expertReview);
    if (link.id === "care-guidance") return Boolean(profile.careGuidance);
    return true;
  }), [reviews.length, hasSubscription, profile.expertReview, profile.careGuidance]);

  // 6. Gallery slides.
  const detailImage = profile.pdpProofSection;
  const slides = useMemo(() => {
    const liveImages = product.images.map((image) => ({ image: getImageUrl(image.url, 1400), alt: image.altText || `Wipelo ${title}` }));
    if (!liveImages.length && profile.gallerySlides?.length) return cycle(profile.gallerySlides, GALLERY_SIZE);
    const sources = [
      ...liveImages,
      { image: profile.lifestyleImage, alt: profile.lifestyleAlt },
      { image: detailImage, alt: `Wipelo ${title} beside a folded wipe and glass labware` },
      ...(profile.benefitsTabImage ? [{ image: profile.benefitsTabImage, alt: `Wipelo ${title} in use` }] : []),
      ...BRAND_IMAGES.map((image) => ({ image, alt: "The Wipelo range of individually wrapped wipes" })),
    ];
    const unique = sources.filter((source, index) => sources.findIndex((other) => other.image === source.image) === index);
    const captions = [profile.ingredientIntro, profile.usageIntro, profile.galleryCaption];
    return cycle(unique, GALLERY_SIZE).map((source, index) => {
      if (index === 0) return { ...source, eyebrow: profile.badge, headline: profile.heroPromise, caption: profile.galleryHighlight, fit: "contain" as const };
      if (index === 2 && profile.expertReview) return { ...source, eyebrow: "Expert review", headline: profile.expertReview.name, caption: profile.expertReview.scope, fit: "cover" as const };
      return { ...source, eyebrow: `${profile.audience}`, headline: SLIDE_HEADLINES[index], caption: captions[index % captions.length], fit: index < liveImages.length ? "contain" as const : "cover" as const };
    });
  }, [product.images, profile, title, detailImage]);
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex];

  // 8. Fallback merges.
  const profileIngredients = profile.ingredients ?? profile.keyIngredients;
  const faqItems = profile.accordions ?? profile.faqs;
  const subscriptionStory = profile.subscriptionStory ?? defaultSubscriptionStory;
  const ingredientImage = (index: number) => profileIngredients[index]?.image ?? slides.find((item) => item.image === profile.ingredientTextureImg)?.image ?? detailImage;

  // 7. "Tell me about" tabs.
  const firstIngredient = profileIngredients[0];
  const firstBenefit = profile.benefits[0];
  const tabs = [
    profile.expertReview
      ? { key: "expert", label: "Expert view", eyebrow: profile.expertReview.credentials, title: profile.expertReview.name, body: profile.expertReview.quote, image: profile.expertReview.image, alt: profile.expertReview.imageAlt, href: "#proof" }
      : { key: "role", label: "Product role", eyebrow: profile.badge, title: profile.heroPromise, body: profile.roleSummary, image: profile.lifestyleImage, alt: profile.lifestyleAlt, href: "#why-it-works" },
    { key: "ingredient", label: "Key ingredient", eyebrow: firstIngredient.status, title: firstIngredient.title, body: firstIngredient.body, image: ingredientImage(0), alt: firstIngredient.imageAlt ?? `Wipelo ${title} formula`, href: "#ingredients" },
    { key: "directions", label: "Directions", eyebrow: profile.usageHeading, title: profile.usageIntro, body: profile.usageRows.map((row) => row.direction).join(" "), image: profile.pdpDirection, alt: `How to use Wipelo ${title}`, href: "#expect" },
    { key: "benefit", label: "Benefit", eyebrow: firstBenefit.when ?? profile.benefitsHeading, title: firstBenefit.title, body: firstBenefit.body, image: profile.benefitsTabImage ?? profile.lifestyleImage, alt: `Wipelo ${title} in everyday use`, href: "#why-it-works" },
  ];
  const [tabIndex, setTabIndex] = useState(0);
  const tab = tabs[tabIndex];

  // 9. Commerce FAQs depend on live data, so they live here rather than in the profile.
  const commerceFaqs = [
    { question: "How does the subscription work?", answer: hasSubscription ? "Choose Subscribe in the buy box. The delivery rhythm, price, and terms are shown before you pay, and you can manage the subscription from your account." : "Subscriptions aren’t available yet, so every order is a one-time purchase for now." },
    { question: "What if it does not work for me?", answer: `The First Pack Promise: try your first delivery for 30 days. If ${title} does not earn a place in your routine, contact Wipelo for a refund of that first order.` },
    { question: "Where does payment happen?", answer: "On Shopify’s secure checkout. Wipelo never sees your full card details." },
  ];
  const allFaqs = [...faqItems, { question: profile.careBoundary.title, answer: profile.careBoundary.body }, ...commerceFaqs];

  // Sticky buy bar: shown once the main add-to-bag button has scrolled above the header.
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  useEffect(() => {
    const button = mainButtonRef.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0), { rootMargin: "-80px 0px 0px 0px" });
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  const addSelected = () => { if (selected) void addToCart(selected, plan?.sellingPlan.id, quantity); };
  const total = effectivePrice ? { amount: (Number(effectivePrice.amount) * quantity).toFixed(2), currencyCode: effectivePrice.currencyCode } : null;
  const buttonLabel = !selected?.availableForSale ? "Sold out" : busy ? "Adding…" : `Add to cart — ${moneyLabel(total)}`;
  // Saving against buying the same number of wipes as single packs (the compare-at price).
  const totalSaving = selected?.compareAtPrice && effectivePrice ? (Number(selected.compareAtPrice.amount) - Number(effectivePrice.amount)) * quantity : 0;

  return <div className={`pdp6-page product-tone-${profile.category}`}>
    <nav className="pdp6-subnav" aria-label="On this page">
      <div className="wrap pdp6-subnav-in">
        <span className="pdp6-crumb"><Link href="/shop">Shop</Link> / {profile.audience} / <b>{title}</b></span>
        <div className="pdp6-subnav-links">{sectionLinks.map((link) => <a key={link.id} href={`#${link.id}`}>{link.label}</a>)}</div>
      </div>
    </nav>

    {/* Hero: gallery + buy box */}
    <section className="pdp6-hero" id="product">
      <div className="wrap">
        <nav className="pdp6-breadcrumb" aria-label="Breadcrumb"><Link href="/shop">Shop</Link> / <span>{profile.audience}</span> / <b>{title}</b></nav>
        <div className="pdp6-hero-grid">
          <div className="pdp6-gallery">
            <div className="pdp6-thumbs" role="tablist" aria-label="Product images">
              {slides.map((item, index) => <button key={`${item.image}-${index}`} type="button" role="tab" aria-selected={index === slideIndex} aria-label={`Image ${index + 1}: ${item.headline}`} className={index === slideIndex ? "is-active" : undefined} onClick={() => setSlideIndex(index)}><img src={item.image} alt="" loading="lazy" /></button>)}
            </div>
            <div className="pdp6-stage">
              {slides.map((item, index) => <img key={`${item.image}-${index}`} src={item.image} alt={index === slideIndex ? item.alt : ""} aria-hidden={index !== slideIndex} className={`pdp6-stage-img fit-${item.fit ?? "cover"}${index === slideIndex ? " is-active" : ""}`} loading={index === 0 ? "eager" : "lazy"} />)}
              {hasLaunchPrice && <span className="pdp6-stage-pill">New · Launch price</span>}
              <span className="pdp6-stage-count">{slideIndex + 1} / {slides.length}</span>
            </div>
          </div>

          <div className="pdp6-buy">
            <span className="pdp6-kicker">{profile.heroKicker}</span>
            <h1>{product.title}</h1>
            <div className="pdp6-rating">
              <span className={`pdp6-stars${reviews.length ? " is-rated" : ""}`} aria-hidden="true">★★★★★</span>
              {reviews.length > 0
                ? <a href="#reviews">{averageRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}</a>
                : <>New — no reviews yet. <a href={`mailto:founder@wipelo.com?subject=${encodeURIComponent(`Review: ${title}`)}`}>Be the first to review</a></>}
            </div>
            <div className={`pdp6-overview-wrap${overviewOpen ? " is-open" : ""}`}>
              <p className="pdp6-overview" id="pdp6-overview">{profile.overview}</p>
              <button type="button" className="pdp6-more" aria-expanded={overviewOpen} aria-controls="pdp6-overview" onClick={() => setOverviewOpen((open) => !open)}>{overviewOpen ? "Show less" : "Read more"}</button>
            </div>
            <dl className="pdp6-specs">{profile.heroSpecs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>

            <fieldset className="pdp6-variants">
              <legend>01 · Choose your supply</legend>
              <div className="pdp6-variant-grid">
                {variants.map((variant) => {
                  const saving = savingsPercent(variant);
                  const isSelected = variant.id === selected?.id;
                  const [packLabel, countLabel] = variant.title.split("·").map((part) => part.trim());
                  const wipes = Number(countLabel?.match(/\d+/)?.[0] ?? 0);
                  return <label key={variant.id} className={`pdp6-variant${isSelected ? " is-selected" : ""}${variant.availableForSale ? "" : " is-unavailable"}`}>
                    <input type="radio" name={`variant-${product.id}`} checked={isSelected} disabled={!variant.availableForSale} onChange={() => setSelectedId(variant.id)} />
                    {variant.id === recommendedVariantId && <span className="pdp6-flag">Most popular</span>}
                    {variant.id === bestValueVariantId && <span className="pdp6-flag is-dark">Best value</span>}
                    <b className="pdp6-variant-name">{packLabel}</b>
                    <small className="pdp6-variant-count">{countLabel ?? durationLabel(variant) ?? (variant.availableForSale ? "In stock" : "Sold out")}</small>
                    <span className="pdp6-variant-price">{moneyLabel(variant.price)}</span>
                    <small className="pdp6-variant-per">
                      {variant.compareAtPrice && saving > 0 && <s>{moneyLabel(variant.compareAtPrice)}</s>}
                      {wipes > 0 && <> {moneyLabel({ amount: (Number(variant.price.amount) / wipes).toFixed(2), currencyCode: variant.price.currencyCode })} / wipe</>}
                    </small>
                  </label>;
                })}
              </div>
            </fieldset>

            {(hasSubscription || profile.plannedSubscription) && <div className="pdp6-frequency">
              <span className="pdp6-step">02 · How often</span>
              <div className="pdp6-mode" role="radiogroup" aria-label="Purchase type">
                <button type="button" role="radio" aria-checked={purchaseMode === "one-time"} className={purchaseMode === "one-time" ? "is-active" : undefined} onClick={() => setPurchaseMode("one-time")}>
                  <b>One-time</b><small>{moneyLabel(selected?.price)} · no recurring charge</small>
                </button>
                {hasSubscription
                  ? <button type="button" role="radio" aria-checked={purchaseMode === "subscribe"} className={purchaseMode === "subscribe" ? "is-active" : undefined} onClick={() => setPurchaseMode("subscribe")}>
                      <b>Subscribe{planSaving > 0 ? ` & save ${moneyLabel({ amount: planSaving.toFixed(2), currencyCode: selected!.price.currencyCode })}` : ""}</b><small>{moneyLabel(selected?.sellingPlanAllocations[0]?.checkoutChargeAmount)} · {selected?.sellingPlanAllocations[0]?.sellingPlan.name}</small>
                    </button>
                  : profile.plannedSubscription && selected && <div className="pdp6-mode-soon" role="radio" aria-checked={false} aria-disabled="true">
                      <b>Subscribe &amp; save {profile.plannedSubscription.savingsPercent}% <i>Soon</i></b>
                      <small>{moneyLabel({ amount: (Number(selected.price.amount) * (1 - profile.plannedSubscription.savingsPercent / 100)).toFixed(2), currencyCode: selected.price.currencyCode })} · {profile.plannedSubscription.perk}</small>
                    </div>}
              </div>
            </div>}

            <div className="pdp6-cart-row">
              <div className="pdp6-qty" role="group" aria-label="Quantity">
                <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                <span aria-live="polite">{quantity}</span>
                <button type="button" aria-label="Increase quantity" disabled={quantity >= 10} onClick={() => setQuantity((value) => Math.min(10, value + 1))}>+</button>
              </div>
              <button ref={mainButtonRef} type="button" className="pdp6-add" disabled={busy || !selected?.availableForSale} onClick={addSelected}>{buttonLabel}</button>
            </div>
            {totalSaving > 0 && <p className="pdp6-saving">You save {moneyLabel({ amount: totalSaving.toFixed(2), currencyCode: selected!.price.currencyCode })} vs. single packs</p>}

            <ul className="pdp6-trust">
              <li><Icon name="shield" /><b>30-day First Pack Promise</b><span>Refund on your first order. No return label.</span></li>
              <li><Icon name="travel" /><b>Free U.S. shipping</b><span>On orders of $50 or more.</span></li>
              <li><Icon name="clock" /><b>Ships in 1–2 days</b><span>Proposed dispatch, in business days.</span></li>
            </ul>
            <p className="pdp6-safety">{profile.heroSafety}</p>
          </div>
        </div>
      </div>
    </section>
    <FeaturedInStrip />
    <ProductIntro product={product} category={profile.category} />

    {/* Tell me about + details */}
    {/* <section className="pdp6-about">
      <div className="wrap pdp6-about-grid">
        <div className="pdp6-tabs">
          <span className="pdp6-eyebrow">Tell me about</span>
          <div className="pdp6-tablist" role="tablist" aria-label={`About ${title}`}>
            {tabs.map((item, index) => <button key={item.key} type="button" role="tab" id={`pdp6-tab-${item.key}`} aria-selected={index === tabIndex} aria-controls="pdp6-tabpanel" className={index === tabIndex ? "is-active" : undefined} onClick={() => setTabIndex(index)}>{item.label}</button>)}
          </div>
          <div className="pdp6-tabpanel" role="tabpanel" id="pdp6-tabpanel" aria-labelledby={`pdp6-tab-${tab.key}`} key={tab.key}>
            <img src={tab.image} alt={tab.alt} loading="lazy" />
            <div>
              <span>{tab.eyebrow}</span>
              <h3>{tab.title}</h3>
              <p>{tab.body}</p>
              <a href={tab.href}>Read more ↓</a>
            </div>
          </div>
        </div>
        <div className="pdp6-details">
          {[...profile.productDetails, { label: "Shipping & returns", body: "Free U.S. shipping on orders of $50 or more. The First Pack Promise gives you 30 days from delivery to contact Wipelo about a refund of your first order." }].map((detail, index) => <details key={detail.label} open={index === 0}>
            <summary>{detail.label}</summary>
            {detail.body && <p>{detail.body}</p>}
            {detail.list && <ul>{detail.list.map((item) => <li key={item}>{item}</li>)}</ul>}
          </details>)}
        </div>
      </div>
    </section> */}

    {/* Benefits */}
    <section className="pdp6-section" id="why-it-works">
      <div className="wrap">
        <Stagger className="pdp6-head" gap={0.09}>
          <Reveal as="span" className="pdp6-eyebrow">{profile.badge}</Reveal>
          <Reveal as="h2">{profile.benefitsHeading}</Reveal>
          <Reveal as="p">{profile.benefitsIntro}</Reveal>
        </Stagger>
        <Stagger className="pdp6-benefits" gap={0.08}>
          {profile.benefits.map((benefit, index) => <Reveal className="pdp6-benefit" key={benefit.title}>
            <span className="pdp6-icon"><Icon name={benefit.icon ?? fallbackIcons[index % fallbackIcons.length]} /></span>
            {benefit.when && <small>{benefit.when}</small>}
            <h3>{benefit.title}</h3>
            <p>{benefit.body}</p>
          </Reveal>)}
        </Stagger>
        <div className="pdp6-story">
          <Reveal variant="slideFromLeft" className="pdp6-story-media"><img src={profile.pdpRoutineSection} alt={profile.lifestyleAlt} loading="lazy" /></Reveal>
          <Reveal variant="slideFromRight" className="pdp6-story-copy">
            <span className="pdp6-eyebrow">{profile.storyEyebrow}</span>
            <h3>{profile.storyTitle}</h3>
            <p>{profile.information}</p>
            <ol>{profile.routine.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{step.title}</b><p>{step.body}</p></div></li>)}</ol>
            <div className="pdp6-ideal"><span>Ideal for</span>{profile.idealFor.map((item) => <i key={item}>{item}</i>)}</div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* Expert (only when a real expert review exists) */}
    {profile.expertReview && <section className="pdp6-section pdp6-expert" id="proof">
      <div className="wrap pdp6-expert-grid">
        <img src={profile.expertReview.image} alt={profile.expertReview.imageAlt} loading="lazy" />
        <div>
          <span className="pdp6-eyebrow">{profile.expertReview.scope}</span>
          <blockquote>{profile.expertReview.quote}</blockquote>
          <p><b>{profile.expertReview.name}</b>, {profile.expertReview.credentials} · {profile.expertReview.jurisdiction}</p>
          <p className="pdp6-fine">{profile.expertReview.relationship} {profile.expertReview.disclosure} Reviewed {profile.expertReview.reviewedAt}.</p>
        </div>
      </div>
    </section>}

    {/* Ingredients */}
    <section className="pdp6-section pdp6-tint" id="ingredients">
      <div className="wrap pdp6-ingredients-grid">
        <Reveal variant="scaleIn" className="pdp6-texture"><img src={profile.ingredientTextureImg} alt={`Wipelo ${title} formula`} loading="lazy" /></Reveal>
        <div>
          <Stagger className="pdp6-head is-left" gap={0.09}>
            <Reveal as="span" className="pdp6-eyebrow">Inside the formula</Reveal>
            <Reveal as="h2">{profile.ingredientHeading}</Reveal>
            <Reveal as="p">{profile.ingredientIntro}</Reveal>
          </Stagger>
          <Stagger className="pdp6-ingredients" gap={0.08}>
            {profileIngredients.map((ingredient) => <Reveal className="pdp6-ingredient" key={ingredient.title}>
              <small>{ingredient.status}</small>
              <h3>{ingredient.title}</h3>
              <p>{ingredient.body}</p>
              {ingredient.evidenceUrl && <a href={ingredient.evidenceUrl} target="_blank" rel="noopener noreferrer">{ingredient.evidenceLabel ?? "Evidence"} ↗</a>}
            </Reveal>)}
          </Stagger>
          <p className="pdp6-fine">{profile.formulaNote}</p>
        </div>
      </div>
    </section>

    {/* Quality */}
    <section className="pdp6-section" id="quality">
      <div className="wrap pdp6-quality-grid">
        <div>
          <Stagger className="pdp6-head is-left" gap={0.09}>
            <Reveal as="span" className="pdp6-eyebrow">The evidence</Reveal>
            <Reveal as="h2">{profile.qualityHeading}</Reveal>
          </Stagger>
          <Stagger className="pdp6-proofs" gap={0.1}>
            {profile.qualityProofs.map((proof) => <Reveal className="pdp6-proof" key={proof.title + proof.body}>
              <b>{proof.title}</b>
              {proof.label && <span>{proof.label}</span>}
              <p>{proof.body}</p>
              {proof.sourceUrl && <a href={proof.sourceUrl} target="_blank" rel="noopener noreferrer">{proof.sourceLabel ?? "Source"} ↗</a>}
            </Reveal>)}
          </Stagger>
        </div>
        <Reveal variant="slideFromRight" className="pdp6-quality-media"><img src={profile.pdpProofSection} alt={`Wipelo ${title} beside glass labware`} loading="lazy" /></Reveal>
      </div>
    </section>

    {/* Care guidance */}
    {profile.careGuidance && <section className="pdp6-section pdp6-care" id="care-guidance">
      <div className="wrap">
        <Reveal className="pdp6-care-card">
          <span className="pdp6-eyebrow">Independent guidance</span>
          <blockquote>{profile.careGuidance.body}</blockquote>
          <a href={profile.careGuidance.url} target="_blank" rel="noopener noreferrer">{profile.careGuidance.source} ↗</a>
          <p className="pdp6-fine">{profile.careGuidance.disclaimer}</p>
        </Reveal>
      </div>
    </section>}

    {/* Directions + what to expect */}
    <section className="pdp6-section pdp6-tint" id="expect">
      <div className="wrap">
        <div className="pdp6-usage">
          <Reveal variant="slideFromLeft" className="pdp6-usage-media"><img src={profile.pdpDirection} alt={`How to use Wipelo ${title}`} loading="lazy" /></Reveal>
          <div>
            <Stagger className="pdp6-head is-left" gap={0.09}>
              <Reveal as="span" className="pdp6-eyebrow">Directions</Reveal>
              <Reveal as="h2">{profile.usageHeading}</Reveal>
              <Reveal as="p">{profile.usageIntro}</Reveal>
            </Stagger>
            <Stagger as="ol" className="pdp6-usage-rows" gap={0.1}>
              {profile.usageRows.map((row) => <Reveal as="li" key={row.label}><span>{row.label}</span><div><b>{row.context}</b><p>{row.direction}</p></div></Reveal>)}
            </Stagger>
          </div>
        </div>

        <Stagger className="pdp6-head" gap={0.09}>
          <Reveal as="span" className="pdp6-eyebrow">{profile.expectationIntro}</Reveal>
          <Reveal as="h2">{profile.expectationHeading}</Reveal>
        </Stagger>
        {profile.expectationHighlight && <div className="pdp6-highlight"><b>{profile.expectationHighlight.title}</b><ul>{profile.expectationHighlight.checks.map((check) => <li key={check}>{check}</li>)}</ul></div>}
        <Stagger className="pdp6-timeline" gap={0.12}>
          {profile.expectations.map((item) => <Reveal className="pdp6-moment" key={item.window}>
            <img src={item.img} alt="" loading="lazy" />
            <span>{item.window}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </Reveal>)}
        </Stagger>
        {profile.expectationDisclaimer && <p className="pdp6-fine is-center">{profile.expectationDisclaimer}</p>}
      </div>
    </section>

    {/* Subscribe (only when Shopify selling plans exist) */}
    {hasSubscription && <section className="pdp6-section pdp6-subscribe" id="subscribe">
      <div className="wrap">
        <Reveal className="pdp6-subscribe-card">
          <span className="pdp6-eyebrow">{subscriptionStory.eyebrow}</span>
          <h2>{subscriptionStory.title}</h2>
          <p>{subscriptionStory.body}</p>
          <ul>{subscriptionStory.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
          <a href="#product" onClick={() => setPurchaseMode("subscribe")}>Choose a pack ↑</a>
        </Reveal>
      </div>
    </section>}

    {/* Reviews (only when approved reviews exist) */}
    {reviews.length > 0 && <section className="pdp6-section" id="reviews">
      <div className="wrap">
        <div className="pdp6-head"><span className="pdp6-eyebrow">Verified reviews</span><h2>★ {averageRating.toFixed(1)} from {reviews.length} review{reviews.length === 1 ? "" : "s"}</h2></div>
        <div className="pdp6-reviews">{reviews.map((review) => <article key={review.name + review.date}><b>{"★".repeat(review.rating)}</b><h3>{review.title}</h3><p>{review.body}</p><small>{review.name}{review.verified ? " · Verified buyer" : ""} · {review.date}</small></article>)}</div>
      </div>
    </section>}

    <FAQAccordion items={allFaqs} />

    {related.length > 0 && <section className="pdp6-section pdp6-related">
      <div className="wrap">
        <div className="pdp6-head"><span className="pdp6-eyebrow">The rest of the range</span><h2>Built for other moments.</h2></div>
        <ProductGrid products={related} compact />
      </div>
    </section>}

    <div className={`pdp6-sticky${stickyVisible ? " is-visible" : ""}`} aria-hidden={!stickyVisible} inert={!stickyVisible}>
      <div className="wrap pdp6-sticky-in">
        <span className="pdp6-sticky-name"><b>{title}</b><small>{selected?.title}</small></span>
        <button type="button" className="pdp6-add is-small" disabled={busy || !selected?.availableForSale} onClick={addSelected}>{buttonLabel}</button>
      </div>
    </div>
  </div>;
}
