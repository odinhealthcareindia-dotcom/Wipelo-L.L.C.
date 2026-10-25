import { HomeShopSection, HomeShopStrip } from "@/components/catalog";
import { FAQAccordion } from "@/components/faq-accordion";
import { BrandBeatSection } from "@/components/home/brand-beat";
import { homeFaqItems } from "@/components/home/faq";
import { FeaturedInStrip } from "@/components/home/featured-in";
import { HeroSection } from "@/components/home/hero";
import { MechanismSection } from "@/components/home/mechanism";
import { OnTheGoSection } from "@/components/home/on-the-go";
import { SpotlessSection } from "@/components/home/spotless";
import { HerSection } from "@/components/home/her";
import { QuizSection } from "@/components/home/quiz";
import { RitualSection } from "@/components/home/ritual";
import { WellnessSections } from "@/components/home/wellness-sections";
import { FormulaSections } from "@/components/home/formula-sections";
import { RevealEffects } from "@/components/reveal-effects";
import { getProducts } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";
import { ProblemSection } from "@/components/home/problem";
import { MarqueeSection } from "@/components/home/marquee";
import { ComparisonSection } from "@/components/home/comparison";
import { ObjectSection } from "@/components/home/object";
import { ReviewsSection } from "@/components/home/reviews";
import { ReceiptsSection } from "@/components/home/receipts";
import { GuaranteeSection } from "@/components/home/guarantee";
import { NewsletterSection } from "@/components/home/newsletter";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const quizProducts = products.map((product) => ({
    handle: product.handle,
    title: product.title,
    price: moneyLabel(product.priceRange.minVariantPrice),
  }));
  const onTheGoProduct = products.find((product) => /on[\s-]?the[\s-]?go/i.test(`${product.title} ${product.handle}`));
  const spotlessProduct = products.find((product) => /spotless/i.test(`${product.title} ${product.handle}`));
  const herProduct = products.find((product) => /\bher\b/i.test(`${product.title} ${product.handle}`));

  return <RevealEffects>
    <HeroSection />
    <FeaturedInStrip />
    <OnTheGoSection productHref={onTheGoProduct ? `/products/${encodeURIComponent(onTheGoProduct.handle)}` : "/shop#products"} />
    <SpotlessSection productHref={spotlessProduct ? `/products/${encodeURIComponent(spotlessProduct.handle)}` : "/shop#products"} />
    <HerSection productHref={herProduct ? `/products/${encodeURIComponent(herProduct.handle)}` : "/shop#products"} />
    <ProblemSection />
    <HomeShopSection products={products} />
    <WellnessSections
      onTheGoHref={onTheGoProduct ? `/products/${encodeURIComponent(onTheGoProduct.handle)}` : "/shop#products"}
      spotlessHref={spotlessProduct ? `/products/${encodeURIComponent(spotlessProduct.handle)}` : "/shop#products"}
      herHref={herProduct ? `/products/${encodeURIComponent(herProduct.handle)}` : "/shop#products"}
    />
    <FormulaSections
      onTheGoHref={onTheGoProduct ? `/products/${encodeURIComponent(onTheGoProduct.handle)}` : "/shop#products"}
      spotlessHref={spotlessProduct ? `/products/${encodeURIComponent(spotlessProduct.handle)}` : "/shop#products"}
      herHref={herProduct ? `/products/${encodeURIComponent(herProduct.handle)}` : "/shop#products"}
    />
    <RitualSection />
    <QuizSection products={quizProducts} />
    <MarqueeSection />
    <MechanismSection />
    <BrandBeatSection />
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
