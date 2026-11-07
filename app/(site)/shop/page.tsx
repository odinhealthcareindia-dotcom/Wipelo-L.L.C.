import type { Metadata } from "next";
import { CollectionHeader, ProductGrid } from "@/components/catalog";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 60;

export default async function ShopPage() {
  const products = await getProducts();
  return <section className="sec shop-page" id="products">
    <CollectionHeader title="The line." description="The products, options, images, and prices below come directly from your Shopify catalog." />
    <div className="wrap"><ProductGrid products={products} /></div>
  </section>;
}
