"use client";

import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProductGrid } from "@/components/catalog";
import { FAQAccordion } from "@/components/faq-accordion";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { useStorefrontCart } from "@/components/storefront-provider";
import { cleanTitle, getImageUrl, type CommerceProduct } from "@/lib/commerce";
import { moneyLabel, perWipeLabel } from "@/lib/money";
import { getProductProfile, type BenefitIconKey, type SubscriptionStory } from "@/lib/product-profiles";
import { getReviewData } from "@/lib/product-reviews";
import { ProductReviewsSection } from "./product-reviews";
import { getExpertReview } from "@/lib/expert-reviews";
import { ExpertReviewSection } from "./expert-review";
import { deliveryLabel, planSavingsPercent, subscriptionAllocations } from "@/lib/subscriptions";
import type { ShopifyVariant } from "@/lib/shopify";
import { FeaturedInStrip } from "../home/featured-in";
import { ProductIntro } from "./product-intro";
import { ProductLightbox } from "./product-lightbox";
import { OrbitIcon, ProductModelViewer, type ProductModel } from "./product-model-viewer";
import { ReceiptsSectionPdp } from "../home/receipts-pdp";
import { GuaranteeSection } from "../home/guarantee";

type PurchaseMode = "subscribe" | "one-time";
/** A gallery slide: a photo, or a Shopify 3D model shown on its poster until the shopper turns it around. */
type GallerySlide = { image: string; alt: string; eyebrow?: string; headline: string; caption?: string; fit?: "cover" | "contain"; model?: ProductModel };

/** Minimum gallery length; a product with more Shopify images shows all of them. */
const GALLERY_SIZE = 8;
const FORMULA_PRODUCTS = [
  { handle: "on-the-go", category: "on-the-go", label: "ON THE GO" },
  { handle: "her", category: "her", label: "HER" },
  { handle: "spotless", category: "spotless", label: "SPOTLESS" },
];
const BRAND_IMAGES = ["/wipelo-lab-range.png", "/wipelo-purposeful-care.png"];
const SLIDE_HEADLINES = ["The pack", "Up close", "Inside the formula", "How to use it", "In real life", "Made to carry", "The detail", "Ready when you are"];

const baseSectionLinks = [
  // { id: "product", label: "Overview" },
  { id: "intro", label: "Info" },
  { id: "ingredients", label: "Ingredients" },
  { id: "why-it-works", label: "Benefits" },
  { id: "proof", label: "Expert" },
  { id: "expect", label: "What to expect" },
  { id: "reviews", label: "Reviews" },
  // { id: "how-to-use", label: "How to use" },
  { id: "subscribe", label: "Subscribe" },
  { id: "faq", label: "FAQ" },
];

const defaultSubscriptionStory: SubscriptionStory = {
  eyebrow: "Subscribe",
  title: "Never run out between showers.",
  body: "Pick how often it arrives and save on every delivery. Terms and pricing are shown before you pay, and you can change or cancel from your account.",
  benefits: ["Delivered on your schedule", "A lower price on every delivery", "Change or cancel from your account"],
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

const heroEase = [0.22, 1, 0.36, 1] as const;

function CheckIcon() {
  return <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" /></svg>;
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

// Wraps one word of a heading in <em> ("What *actually* happens.").
function emphasize(text: string, word?: string) {
  if (!word || !text.includes(word)) return text;
  const [before, after] = text.split(word);
  return <>{before}<em>{word}</em>{after}</>;
}

// Placeholder figures and notes show while building the page, never on the live site.
const showDrafts = process.env.NODE_ENV !== "production";

function cycle<T>(items: T[], size: number) {
  if (!items.length) return [];
  return Array.from({ length: size }, (_, index) => items[index % items.length]);
}

export function LiveProductPdp({ product, related = [], subscriptionPolicyUrl, subscriptionPortalUrl }: { product: CommerceProduct; related?: CommerceProduct[]; subscriptionPolicyUrl?: string | null; subscriptionPortalUrl?: string | null }) {
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
  const hasSubscription = variants.some((variant) => subscriptionAllocations(variant).length > 0);
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>(hasSubscription ? "subscribe" : "one-time");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const quantity = 1;
  const hasLaunchPrice = variants.some((variant) => savingsPercent(variant) > 0);
  const planOptions = useMemo(() => selected ? subscriptionAllocations(selected) : [], [selected]);
  // The middle cadence (every 4 weeks on the current plans) until the shopper picks one; the choice carries across packs.
  const activePlan = planOptions.find((option) => option.sellingPlan.id === selectedPlanId) ?? planOptions[Math.floor(planOptions.length / 2)] ?? null;
  const canBuyOnce = !product.requiresSellingPlan;
  const subscribing = Boolean(activePlan) && (purchaseMode === "subscribe" || !canBuyOnce);
  const plan = subscribing ? activePlan : null;
  const purchasable = Boolean(selected?.availableForSale) && (canBuyOnce || Boolean(activePlan));
  const effectivePrice = plan ? plan.checkoutChargeAmount : selected?.price;
  const activePlanSaving = selected && activePlan ? planSavingsPercent(selected, activePlan) : 0;

  // 2–4. Title, profile, reviews.
  const title = cleanTitle(product.title);
  const profile = getProductProfile(product);
  const reviewData = getReviewData();
  const ratingSummary = reviewData && profile.category !== "wipelo" ? reviewData.summaries[profile.category] : null;
  const expertReview = getExpertReview(profile.category);
  const hasPlaceholderStat = profile.expectations.some((item) => item.stats.some((stat) => stat.placeholder));

  // 5. Section links, matched to the sections that actually render.
  const sectionLinks = useMemo(() => baseSectionLinks.filter((link) => {
    if (link.id === "reviews") return Boolean(reviewData);
    if (link.id === "subscribe") return hasSubscription;
    if (link.id === "proof") return Boolean(expertReview);
    return true;
  }), [reviewData, hasSubscription, expertReview]);

  // 6. Gallery slides.
  const detailImage = profile.pdpProofSection;
  const slides = useMemo((): GallerySlide[] => {
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
    // Every image uploaded in Shopify is shown, in Shopify's order. Brand and lifestyle shots only top up galleries with fewer than GALLERY_SIZE images.
    const size = Math.max(GALLERY_SIZE, liveImages.length);
    const gallery: GallerySlide[] = cycle(unique, size).map((source, index) => {
      if (index === 0) return { ...source, eyebrow: profile.badge, headline: profile.heroPromise, caption: profile.galleryHighlight, fit: "cover" as const };
      if (index === 2 && profile.expertReview) return { ...source, eyebrow: "Expert review", headline: profile.expertReview.name, caption: profile.expertReview.scope, fit: "cover" as const };
      return { ...source, eyebrow: `${profile.audience}`, headline: SLIDE_HEADLINES[index % SLIDE_HEADLINES.length], caption: captions[index % captions.length], fit: "cover" as const };
    });
    // 3D models (GLB uploaded to the product's media in Shopify) keep their place in Shopify's media order,
    // but never land first: the opening slide stays a photo so the page paints without the 3D viewer.
    const models = (product.models ?? []).flatMap((model) => {
      const glb = model.sources.find((source) => source.format === "glb" || source.url.split("?")[0].endsWith(".glb"));
      if (!glb) return [];
      const usdz = model.sources.find((source) => source.format === "usdz")?.url;
      const poster = model.previewImage ? getImageUrl(model.previewImage.url, 1400) : gallery[0]?.image ?? profile.lifestyleImage;
      const alt = model.alt || `3D model of Wipelo ${title}`;
      return [{ position: Math.max(1, model.position), slide: { image: poster, alt, headline: "3D view", fit: "cover" as const, model: { glb: glb.url, usdz, poster, alt } } }];
    });
    models.forEach(({ position, slide }, offset) => gallery.splice(Math.min(position + offset, gallery.length), 0, slide));
    return gallery;
  }, [product.images, product.models, profile, title, detailImage]);

  const [slideIndex, setSlideIndex] = useState(0);
  const activeIsModel = Boolean(slides[slideIndex]?.model);
  const thumbsRef = useRef<HTMLDivElement>(null);
  // Keep the active thumbnail in view when the slide changes (swipe, arrows, or a click near the edge).
  useEffect(() => {
    const rail = thumbsRef.current;
    const thumb = rail?.children[slideIndex] as HTMLElement | undefined;
    if (!rail || !thumb) return;
    const left = thumb.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
    if (left < rail.scrollLeft || left + thumb.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      rail.scrollTo({ left: left - (rail.clientWidth - thumb.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
    }
  }, [slideIndex]);
  const swipeStartX = useRef<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const goToSlide = (step: number) => setSlideIndex((index) => (index + step + slides.length) % slides.length);

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
    { key: "directions", label: "Directions", eyebrow: profile.usageHeading, title: profile.usageIntro, body: profile.usageRows.map((row) => row.direction).join(" "), image: profile.pdpDirection, alt: `How to use Wipelo ${title}`, href: "#pdp6-details" },
    { key: "benefit", label: "Benefit", eyebrow: firstBenefit.when ?? profile.benefitsHeading, title: firstBenefit.title, body: firstBenefit.body, image: profile.benefitsTabImage ?? profile.lifestyleImage, alt: `Wipelo ${title} in everyday use`, href: "#why-it-works" },
  ];
  const [tabIndex, setTabIndex] = useState(0);
  const tab = tabs[tabIndex];

  // Product details accordion, closing with shipping and returns.
  const details = [...profile.productDetails, { label: "Shipping & returns", body: "Free U.S. shipping on orders of $50 or more. The First Pack Promise gives you 30 days from delivery to contact Wipelo about a refund of your first order." }];
  const [openDetail, setOpenDetail] = useState<number | null>(0);
  const usageDetailIndex = details.findIndex((detail) => /how to use/i.test(detail.label));
  const openUsageDetail = () => { if (usageDetailIndex >= 0) setOpenDetail(usageDetailIndex); };

  // Subnav: highlight the section in view and glide one shared underline to its link.
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const subnavLinksRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const sections = sectionLinks.map((link) => document.getElementById(link.id)).filter((node): node is HTMLElement => Boolean(node));
    if (!sections.length) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) visible.add(entry.target.id); else visible.delete(entry.target.id); });
      const current = sectionLinks.find((link) => visible.has(link.id));
      setActiveSection(current?.id ?? null);
    }, { rootMargin: "-140px 0px -55% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [sectionLinks]);
  useLayoutEffect(() => {
    const container = subnavLinksRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;
    const link = activeSection ? container.querySelector<HTMLAnchorElement>(`a[href="#${activeSection}"]`) : null;
    if (!link) { indicator.style.opacity = "0"; return; }
    indicator.style.opacity = "1";
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    if (container.scrollWidth > container.clientWidth) container.scrollTo({ left: link.offsetLeft - container.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
  }, [activeSection]);

  // 9. Commerce FAQs depend on live data, so they live here rather than in the profile.
  const commerceFaqs = [
    ...(hasSubscription ? [{ question: "How does the subscription work?", answer: `Choose Subscribe in the buy box and pick how often it arrives. Each delivery is charged automatically at the discounted price shown, and it continues until you cancel. You can change or cancel from your account.` }] : []),
    { question: "What if it does not work for me?", answer: `The First Pack Promise: try your first delivery for 30 days. If ${title} does not earn a place in your routine, contact Wipelo for a refund of that first order.` },
    { question: "Where does payment happen?", answer: "On Shopify’s secure checkout. Wipelo never sees your full card details." },
  ];
  const allFaqs = [...faqItems, { question: profile.careBoundary.title, answer: profile.careBoundary.body }, ...commerceFaqs];

  // Sticky buy bar: shown once the main add-to-bag button has scrolled above the header,
  // and tucked away again while the footer is on screen so it never covers the footer.
  // Measured from scroll position rather than IntersectionObserver crossings: an observer only fires when the
  // button enters or leaves view, so a jump straight past it (subnav link, scroll restore, fast fling, or the
  // button starting below the fold) never fired and left the bar hidden.
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const button = mainButtonRef.current;
      if (!button) return;
      const pastButton = button.getBoundingClientRect().bottom < 80;
      const footerTop = document.querySelector(".wipe-footer")?.getBoundingClientRect().top ?? Infinity;
      setStickyVisible(pastButton && footerTop >= window.innerHeight);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); cancelAnimationFrame(frame); };
  }, []);

  const addSelected = () => { if (selected) void addToCart(selected, plan?.sellingPlan.id, quantity); };
  const total = effectivePrice ? { amount: (Number(effectivePrice.amount) * quantity).toFixed(2), currencyCode: effectivePrice.currencyCode } : null;
  const heroButtonLabel: ReactNode = !selected?.availableForSale ? "Sold out" : busy ? "Adding…" : <>{plan ? "Subscribe" : "Add to bag"} <span aria-hidden="true">·</span> {moneyLabel(total)}</>;
  const buttonLabel = !selected?.availableForSale ? "Sold out" : busy ? "Adding…" : `${plan ? "Add to bag" : "Add to bag"} · ${moneyLabel(total)}`;

  return <div className={`pdp6-page product-tone-${profile.category}`}>
    <div className="pdp6-subnav">
      <nav className="pdp6-subnav-crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/shop">Shop</Link><span aria-hidden="true">/</span><b>{title}</b>
      </nav>
      <nav ref={subnavLinksRef} className="pdp6-subnav-links" aria-label="Product page sections">
        <span ref={indicatorRef} className="pdp6-subnav-indicator" aria-hidden="true" />
        {sectionLinks.map((link) => <a key={link.id} href={`#${link.id}`} className={activeSection === link.id ? "active" : undefined} aria-current={activeSection === link.id ? "location" : undefined}>{link.label}</a>)}
      </nav>
    </div>

    {/* Hero: gallery + buy box */}
    <section className="pdp6-hero wrap" id="product">
      <div className="pdp6-gallery">
        <div className="pdp6-media-frame">
          <div className="pdp6-main-media" onPointerDown={(event) => { swipeStartX.current = event.clientX; }} onPointerUp={(event) => {
            if (swipeStartX.current === null) return;
            const deltaX = event.clientX - swipeStartX.current;
            swipeStartX.current = null;
            if (Math.abs(deltaX) >= 40) goToSlide(deltaX < 0 ? 1 : -1);
            else if (Math.abs(deltaX) < 8 && event.button === 0 && !activeIsModel) setLightboxOpen(true);
          }}>
            {slides.map((item, index) => item.model ? <ProductModelViewer key={`${item.model.glb}-${index}`} model={item.model} active={index === slideIndex} /> : <img key={`${item.image}-${index}`} src={item.image} alt={index === slideIndex ? item.alt : ""} aria-hidden={index !== slideIndex} draggable={false} className={`pdp6-stage-img fit-${item.fit ?? "cover"}${index === slideIndex ? " is-active" : ""}`} loading={index === 0 ? "eager" : "lazy"} />)}
            {hasLaunchPrice && <span className="pdp6-media-badge">Launch price</span>}
            <span className="pdp6-media-count">{slideIndex + 1} / {slides.length}</span>
            {!activeIsModel && <button type="button" className="pdp6-media-expand" onPointerDown={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()} onClick={() => setLightboxOpen(true)} aria-label="View image full screen">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>}
          </div>
          <button type="button" className="pdp6-media-arrow pdp6-media-prev" aria-label="Show previous image" onClick={() => goToSlide(-1)}><span aria-hidden="true" /></button>
          <button type="button" className="pdp6-media-arrow pdp6-media-next" aria-label="Show next image" onClick={() => goToSlide(1)}><span aria-hidden="true" /></button>
        </div>
        <div className="pdp6-media-nav" ref={thumbsRef} role="tablist" aria-label="Product images">
          {slides.map((item, index) => <button key={`${item.image}-${index}`} type="button" role="tab" aria-selected={index === slideIndex} aria-label={item.model ? `3D model ${index + 1}: turn the pack around` : `Image ${index + 1}: ${item.headline}`} className={`${index === slideIndex ? "active" : ""}${item.model ? " is-model" : ""}` || undefined} onClick={() => setSlideIndex(index)}><img src={item.image} alt="" width="160" height="160" loading="lazy" />{item.model && <span className="pdp6-thumb-3d" aria-hidden="true"><OrbitIcon size={14} />3D</span>}</button>)}
        </div>
        <ProductLightbox slides={slides} index={slideIndex} onIndexChange={setSlideIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} title={product.title} />
        <p className="pdp6-image-note"><span aria-hidden="true">✦</span>{profile.imageLabel}</p>
      </div>

      <div className="pdp6-buy">
        <span className="pdp6-kicker">{profile.heroKicker}</span>
        <h1>{product.title}</h1>
        <div className="pdp6-rating">
          <span className={`pdp6-stars${ratingSummary ? " is-rated" : ""}`} aria-hidden="true">★★★★★</span>
          {ratingSummary
            ? <a href="#reviews">{ratingSummary.average.toFixed(1)} from {ratingSummary.count.toLocaleString("en-US")} reviews</a>
            : <>New, no reviews yet. <a href={`mailto:uswipelo@gmail.com?subject=${encodeURIComponent(`Review: ${title}`)}`}>Be the first to review</a></>}
        </div>
        <p className="pdp6-lead">{profile.overview}</p>

        <div className="pdp6-short-pitch">
          <span>The short version</span>
          <p>{profile.shortBenefit}</p>
          <a href="#why-it-works">See why it earns its place <b aria-hidden="true">→</b></a>
        </div>

        {variants.length > 1 && <fieldset className="pdp6-variants">
          <legend>Choose your pack</legend>
          <div className="pdp6-variant-grid">
            {variants.map((variant) => {
              const saving = savingsPercent(variant);
              const isSelected = variant.id === selected?.id;
              const [packLabel, countLabel] = variant.title.split("·").map((part) => part.trim());
              return <label key={variant.id} className={`${isSelected ? "active" : ""}${variant.availableForSale ? "" : " is-unavailable"}`}>
                {variant.id === recommendedVariantId && <span className="pdp6-variant-badge">Most popular</span>}
                {variant.id === bestValueVariantId && <span className="pdp6-variant-badge">Best value</span>}
                <input type="radio" name={`variant-${product.id}`} checked={isSelected} disabled={!variant.availableForSale} onChange={() => setSelectedId(variant.id)} />
                <span className="pdp6-variant-box">
                  <strong>{packLabel}</strong>
                  <small>{variant.availableForSale ? countLabel ?? durationLabel(variant) : "Sold out"}</small>
                  {variant.availableForSale && <small className="pdp6-variant-unit">{perWipeLabel(variant.price, variant.title)}</small>}
                </span>
                {saving > 0 && <span className="pdp6-variant-save">Save {saving}%</span>}
              </label>;
            })}
          </div>
        </fieldset>}

        <fieldset className="pdp6-purchase-options">
          <legend>Select your plan</legend>
          {hasSubscription && <label className={subscribing ? "active" : undefined}>
            <input type="radio" name={`purchase-${product.id}`} checked={subscribing} disabled={!activePlan} onChange={() => setPurchaseMode("subscribe")} />
            <span>
              <strong>Subscribe{activePlanSaving > 0 ? ` & save ${activePlanSaving}%` : ""}</strong>
              {!activePlan && <small>Not available for this pack</small>}
              {subscribing && planOptions.length > 1 && <span className="pdp6-frequency-picker" role="group" aria-label="Delivery frequency">
                {planOptions.map((option) => {
                  const saving = selected ? planSavingsPercent(selected, option) : 0;
                  const isActive = option.sellingPlan.id === activePlan?.sellingPlan.id;
                  return <button key={option.sellingPlan.id} type="button" className={isActive ? "active" : undefined} aria-pressed={isActive} onClick={(event) => { event.preventDefault(); setSelectedPlanId(option.sellingPlan.id); }}>
                    {deliveryLabel(option.sellingPlan)}{saving > 0 && <i>{saving}% off</i>}
                  </button>;
                })}
              </span>}
              <AnimatePresence initial={false}>
                {subscribing && <m.ul className="pdp6-subscribe-benefits" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ height: { duration: 0.35, ease: heroEase }, opacity: { duration: 0.25 } }}>
                  {activePlan && <li><CheckIcon /><span>Arrives {deliveryLabel(activePlan.sellingPlan).toLowerCase()}</span></li>}
                  {subscriptionStory.benefits.slice(1).map((item) => <li key={item}><CheckIcon /><span>{item}</span></li>)}
                </m.ul>}
              </AnimatePresence>
            </span>
            {activePlan && <span className="pdp6-purchase-price">
              {activePlanSaving > 0 && <s>{moneyLabel(selected?.price)}</s>}
              <b>{moneyLabel(activePlan.checkoutChargeAmount)}</b>
              <small className="pdp6-purchase-unit">{perWipeLabel(activePlan.checkoutChargeAmount, selected?.title)}</small>
            </span>}
          </label>}
          {canBuyOnce && <label className={!subscribing ? "active" : undefined}>
            <input type="radio" name={`purchase-${product.id}`} checked={!subscribing} onChange={() => setPurchaseMode("one-time")} />
            <span>
              <strong>One-time purchase</strong>
              <small>No automatic renewal.</small>
            </span>
            <span className="pdp6-purchase-price">
              {selected?.compareAtPrice && savingsPercent(selected) > 0 && <s>{moneyLabel(selected.compareAtPrice)}</s>}
              <b>{moneyLabel(selected?.price)}</b>
              <small className="pdp6-purchase-unit">{perWipeLabel(selected?.price, selected?.title)}</small>
            </span>
          </label>}
        </fieldset>

        <div className="pdp6-cart-row">
          <button ref={mainButtonRef} type="button" className="pdp6-add" disabled={busy || !purchasable} onClick={addSelected}>{heroButtonLabel}</button>
        </div>
        {plan && <p className="pdp6-renewal">Renews automatically: {moneyLabel(total)} plus any shipping and tax, {deliveryLabel(plan.sellingPlan).toLowerCase()}, until you cancel. {subscriptionPortalUrl ? <a href={subscriptionPortalUrl}>Change or cancel from your account</a> : "Change or cancel from your account"}{subscriptionPolicyUrl ? <>. <a href={subscriptionPolicyUrl} target="_blank" rel="noreferrer">Cancellation policy</a></> : ""}.</p>}
        <div className="pdp6-micro-trust">
          <span>Secure checkout</span>
          <span>30-day First Pack Promise</span>
          <span>Free U.S. shipping over $50</span>
          <span>{plan ? "Change or cancel online" : "Shipping shown at checkout"}</span>
        </div>

        <section className="pdp6-tell" aria-labelledby="pdp6-tell-title">
          <h2 id="pdp6-tell-title">Tell me about:</h2>
          <div className="pdp6-tell-tabs" role="tablist" aria-label={`About ${title}`}>
            {tabs.map((item, index) => <button key={item.key} type="button" role="tab" id={`pdp6-tab-${item.key}`} aria-selected={index === tabIndex} aria-controls="pdp6-tell-panel" className={index === tabIndex ? "active" : undefined} onClick={() => setTabIndex(index)}>{item.label}</button>)}
          </div>
          <div className="pdp6-tell-panel" role="tabpanel" id="pdp6-tell-panel" aria-labelledby={`pdp6-tab-${tab.key}`} key={tab.key}>
            <div className="pdp6-tell-photo"><img src={tab.image} alt="" width="224" height="224" loading="lazy" /></div>
            <div>
              <span>{tab.eyebrow}</span>
              <h3>{tab.title}</h3>
              <p>{tab.body}</p>
              <a href={tab.href} onClick={tab.key === "directions" ? openUsageDetail : undefined}>Read the full detail <b aria-hidden="true">→</b></a>
            </div>
          </div>
        </section>

        <div className="pdp6-details" id="pdp6-details">
          {details.map((detail, index) => {
            const isOpen = openDetail === index;
            return <div key={detail.label} className={`pdp6-details-item${isOpen ? " is-open" : ""}`}>
              <button type="button" className="pdp6-details-trigger" id={`pdp6-detail-trigger-${index}`} aria-controls={`pdp6-detail-panel-${index}`} aria-expanded={isOpen} onClick={() => setOpenDetail(isOpen ? null : index)}>
                {detail.label}<span className="pdp6-details-icon" aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && <m.div className="pdp6-details-body" id={`pdp6-detail-panel-${index}`} role="region" aria-labelledby={`pdp6-detail-trigger-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ height: { duration: 0.35, ease: heroEase }, opacity: { duration: 0.25 } }}>
                  <div className="pdp6-details-body-inner">
                    {detail.body && <p>{detail.body}</p>}
                    {detail.list && <ul>{detail.list.map((item) => <li key={item}>{item}</li>)}</ul>}
                  </div>
                </m.div>}
              </AnimatePresence>
            </div>;
          })}
        </div>
        <p className="pdp6-safety">{profile.heroSafety}</p>
      </div>
    </section>
    <FeaturedInStrip />
    <ProductIntro product={product} category={profile.category} />

    {/* Ingredients */}
    <section className="pdp6-section pdp6-formula" id="ingredients" aria-labelledby="pdp6-formula-title">
      <div className="wrap">
        <div className="pdp6-formula-head">
          <Stagger gap={0.09}>
            <Reveal as="span" className="pdp6-eyebrow">// Inside the formula · {title}</Reveal>
            <Reveal as="h2" id="pdp6-formula-title">What’s in it — <em>and what it isn’t.</em></Reveal>
            <Reveal as="p">{profile.ingredientIntro}</Reveal>
          </Stagger>
          {/* <nav className="pdp6-formula-switch" aria-label="Compare formulas">
            {FORMULA_PRODUCTS.map((item) => <Link key={item.handle} href={`/products/${item.handle}#ingredients`} aria-current={item.category === profile.category ? "page" : undefined} className={item.category === profile.category ? "is-active" : undefined}>{item.label}</Link>)}
          </nav> */}
        </div>

        <div className="pdp6-formula-bento">
          <Reveal variant="scaleIn" as="figure" className="pdp6-formula-hero">
            <img src={profile.ingredientTextureImg} alt={`Wipelo ${title} beside a folded wipe and glass labware`} loading="lazy" />
            <figcaption>
              {/* <p>See the cloth.<br />Read the dose.</p> */}
              <dl>{profile.ingredientSpecs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
            </figcaption>
          </Reveal>

          <ul className="pdp6-formula-cards" aria-label={`${title} ingredients`}>
            {profileIngredients.map((ingredient) => <Reveal as="li" className="pdp6-formula-card" key={ingredient.title}>
              <div className={`pdp6-formula-media${ingredient.image ? " has-photo" : ""}`}>
                {ingredient.image
                  ? <img src={ingredient.image} alt={ingredient.imageAlt ?? ""} loading="lazy" />
                  : <span className="pdp6-formula-dish" aria-hidden="true"><b>{(ingredient.dose ?? "✓").split(" · ").map((part) => <span key={part}>{part}</span>)}</b></span>}
                {/* <small>{ingredient.status}</small> */}
              </div>
              <div className="pdp6-formula-copy">
                <h3>{ingredient.title}{ingredient.dose && <span className="sr-only">, {ingredient.dose}</span>}</h3>
                <div>
                  <p>{ingredient.does ?? ingredient.body}</p>
                  {/* {ingredient.doesnt && <p className="pdp6-formula-not"><span aria-hidden="true">×</span> {ingredient.doesnt}</p>} */}
                </div>
              </div>
            </Reveal>)}
          </ul>
        </div>

        <Reveal className="pdp6-formula-promise">
          <span className="pdp6-formula-promise-mark" aria-hidden="true">i</span>
          <div>
            <h3>What’s left out</h3>
            <p>{profile.formulaNote} {profile.ingredientUseNote}</p>
          </div>
          {profile.freeFrom.length > 0 && <ul>{profile.freeFrom.map((item) => <li key={item}>{item}</li>)}</ul>}
        </Reveal>
      </div>
    </section>

    {/* Benefits */}
    <section className="pdp6-section pdp6-why" id="why-it-works" aria-labelledby="pdp6-why-title">
      <div className="wrap pdp6-why-grid">
        <div className="pdp6-why-copy">
          <h2 id="pdp6-why-title">{profile.benefitsHeading}</h2>
          <p className="pdp6-why-intro">{profile.benefitsIntro}</p>
          <Stagger as="ul" className="pdp6-why-list" gap={0.08}>
            {profile.benefits.map((benefit, index) => <Reveal as="li" key={benefit.title}>
              <span className="pdp6-why-badge" aria-hidden="true"><Icon name={benefit.icon ?? fallbackIcons[index % fallbackIcons.length]} /></span>
              <div>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
                {benefit.when && <small>{benefit.when}</small>}
              </div>
            </Reveal>)}
          </Stagger>
        </div>
        <Reveal variant="scaleIn" className="pdp6-why-media"><img src={profile.momentsBetween} alt={profile.lifestyleAlt} loading="lazy" /></Reveal>
      </div>
    </section>
    <section className="pdp6-section pdp6-story-section">
      <div className="wrap">
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


    {/* Expert review (drafts render in development only) */}
    {expertReview && <ExpertReviewSection review={expertReview} />}
    {/* What actually happens */}
    <section className="pdp6-section pdp6-arc" id="expect" aria-labelledby="pdp6-arc-title">
      <div className="wrap">
        <Stagger className="pdp6-arc-head" gap={0.09}>
          <Reveal as="span" className="pdp6-eyebrow">// Honest expectations</Reveal>
          <Reveal as="h2" id="pdp6-arc-title">{emphasize(profile.expectationHeading, profile.expectationEmphasis)}</Reveal>
          <Reveal as="p">{profile.expectationIntro}</Reveal>
        </Stagger>
        <Stagger as="ol" className="pdp6-arc-cards" gap={0.12}>
          {profile.expectations.map((item, index) => <Reveal as="li" className="pdp6-arc-card" key={item.window}>
            <div className="pdp6-arc-media">
              <img src={item.img} alt={item.imgAlt ?? ""} loading="lazy" />
              <span className="pdp6-arc-window">{item.window}</span>
              <span className="pdp6-arc-num" aria-hidden="true">{index + 1}</span>
            </div>
            <div className="pdp6-arc-body">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {item.stats.some((stat) => showDrafts || !stat.placeholder) && <ul className="pdp6-arc-stats">
                {item.stats.filter((stat) => showDrafts || !stat.placeholder).map((stat) => <li key={stat.label}><b>{stat.value}</b> {stat.label}</li>)}
              </ul>}
            </div>
          </Reveal>)}
        </Stagger>
        {/* <Reveal className="pdp6-arc-limits">
          <div className="pdp6-arc-wont">
            <b>And what it won’t do:</b>
            <ul>{profile.expectationWontDo.map((item) => <li key={item}><span aria-hidden="true">×</span>{item}</li>)}</ul>
          </div>
          {showDrafts && hasPlaceholderStat && profile.expectationFootnote && <p className="pdp6-arc-foot">{profile.expectationFootnote}</p>}
        </Reveal> */}
      </div>
    </section>

    {/* Customer reviews */}
    {reviewData && <ProductReviewsSection initial={profile.category === "wipelo" ? "all" : profile.category} reviews={reviewData.reviews} summaries={reviewData.summaries} productTitle={title} />}
    {/* Receipts */}
    <ReceiptsSectionPdp />
    {/* Directions */}
    {/* <section className="pdp6-section pdp6-tint" id="how-to-use">
      <div className="wrap">
        <div className="pdp6-usage is-last">
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

      </div>
    </section> */}
    <GuaranteeSection />
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


    <FAQAccordion items={allFaqs} />

    {related.length > 0 && <section className="pdp6-section pdp6-related">
      <div className="wrap">
        <div className="pdp6-head"><span className="pdp6-eyebrow">The rest of the range</span><h2>Built for other moments.</h2></div>
        <ProductGrid products={related} compact />
      </div>
    </section>}

    <div className={`pdp6-sticky${stickyVisible ? " is-visible" : ""}`} aria-hidden={!stickyVisible} inert={!stickyVisible}>
      <div className="pdp6-sticky-in">
        {slides[0] && <img className="pdp6-sticky-thumb" src={slides[0].image} alt="" width="44" height="44" loading="lazy" />}
        <span className="pdp6-sticky-name"><b>{title}</b><small>{selected?.title}{plan ? ` · ${deliveryLabel(plan.sellingPlan)}` : ""}</small></span>
        <button type="button" className="pdp6-add is-small" disabled={busy || !purchasable} onClick={addSelected}>{buttonLabel}</button>
      </div>
    </div>
  </div>;
}
