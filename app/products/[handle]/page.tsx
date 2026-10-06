import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery, ProductPurchase, ShopifyProductDescription } from "@/components/product-buy";
import { ProductDetailSections } from "@/components/product-details";
import { ProductAnnouncementTicker } from "@/components/product-announcement-ticker";
import { StickyProductBar } from "@/components/sticky-product-bar";
import { parsePdpContent } from "@/lib/pdp-content";
import { getProductByHandle, getProducts } from "@/lib/shopify";

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }> };

async function resolveProduct(handle: string) {
  const exact = await getProductByHandle(handle);
  if (exact || handle !== "first") return exact;
  return (await getProducts()).find((product) => /\bfirst\b/i.test(product.title)) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await resolveProduct(handle);
  if (!product) return { title: "Product not found" };
  const content = parsePdpContent(product.metafields);
  return { title: product.title, description: (content?.intro || product.description).slice(0, 160) };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await resolveProduct(handle);
  if (!product) notFound();

  const content = parsePdpContent(product.metafields);
  const catalog = content ? await getProducts() : [];
  const related = content ? catalog.filter((candidate) => content.crossSell.handles.includes(candidate.handle)) : [];

  return <>
    <ProductAnnouncementTicker key={product.id} content={content} productTitle={product.title} />
    <section className="wrap pdp shopify-pdp" id="buybox">
      <ProductGallery key={product.id} product={product} content={content} />
      <ProductPurchase key={product.id} product={product} content={content} />
    </section>
    {content ? <ProductDetailSections key={product.id} content={content} related={related} /> : <ShopifyProductDescription html={product.descriptionHtml} />}
    {product.metafields.some((item) => item.namespace !== "wipelo") && <section className="sec product-metafields"><div className="wrap"><span className="mono-tag">// More product information</span><div className="metafield-grid">{product.metafields.filter((item) => item.namespace !== "wipelo").map((item) => <article key={item.id}><span className="mono">{item.namespace} · {item.key}</span><p>{item.value}</p></article>)}</div></div></section>}
    <StickyProductBar key={product.id} product={product} />
  </>;
}
