import { HomeShopSection, HomeShopStrip } from "@/components/catalog";
import { FAQAccordion } from "@/components/faq-accordion";
import { BrandBeatSection } from "@/components/home/brand-beat";
import { ComparisonSection } from "@/components/home/comparison";
import { homeFaqItems } from "@/components/home/faq";
import { GuaranteeSection } from "@/components/home/guarantee";
import { HeroSection } from "@/components/home/hero";
import { MarqueeSection } from "@/components/home/marquee";
import { MechanismSection } from "@/components/home/mechanism";
import { NewsletterSection } from "@/components/home/newsletter";
import { ObjectSection } from "@/components/home/object";
import { PressSection } from "@/components/home/press";
import { ProblemSection } from "@/components/home/problem";
import { QuizSection } from "@/components/home/quiz";
import { ReceiptsSection } from "@/components/home/receipts";
import { ReviewsSection } from "@/components/home/reviews";
import { RitualSection } from "@/components/home/ritual";
import { RevealEffects } from "@/components/reveal-effects";
import { getProducts } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const quizProducts = products.map((product) => ({
    handle: product.handle,
    title: product.title,
    description: product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
    price: moneyLabel(product.priceRange.minVariantPrice),
  }));

  return <RevealEffects>
    <HeroSection product={products[0] ?? null} />
    <PressSection />
    <ProblemSection />
    <HomeShopSection products={products} />
    <RitualSection />
    <QuizSection products={quizProducts} />
    <MarqueeSection />
    <MechanismSection />
    <ComparisonSection />
    <ObjectSection />
    <ReviewsSection />
    <ReceiptsSection />
    <GuaranteeSection />
    <BrandBeatSection />
    <FAQAccordion items={homeFaqItems} />
    <HomeShopStrip products={products} />
    <NewsletterSection />
  </RevealEffects>;
}
