import { HomeShopSection, HomeShopStrip } from "@/components/catalog";
import { FAQAccordion } from "@/components/faq-accordion";
import { LegacyInteractions } from "@/components/legacy-interactions";
import { getFaqItems, getHomeMarkup } from "@/lib/legacy-content";
import { getProducts } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const { opening, middleBeforeFAQ, middleAfterFAQ, newsletter } = getHomeMarkup(products[0] ?? null);
  const quizProducts = products.map((product) => ({
    handle: product.handle,
    title: product.title,
    description: product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
    price: moneyLabel(product.priceRange.minVariantPrice),
  }));

  return <LegacyInteractions products={quizProducts}>
    <div dangerouslySetInnerHTML={{ __html: opening }} />
    <HomeShopSection products={products} />
    <div dangerouslySetInnerHTML={{ __html: middleBeforeFAQ }} />
    <FAQAccordion items={getFaqItems()} />
    <div dangerouslySetInnerHTML={{ __html: middleAfterFAQ }} />
    <HomeShopStrip products={products} />
    <div dangerouslySetInnerHTML={{ __html: newsletter }} />
  </LegacyInteractions>;
}
