import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionHeader, ProductGrid } from "@/components/catalog";
import { getCollectionByHandle, getProducts } from "@/lib/shopify";

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  if (handle === "all") return { title: "All Products" };
  const collection = await getCollectionByHandle(handle);
  return { title: collection?.title || "Collection not found", description: collection?.description };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  if (handle === "all") return <section className="sec shop-page"><CollectionHeader title="All products" /><div className="wrap"><ProductGrid products={await getProducts()} /></div></section>;
  const collection = await getCollectionByHandle(handle);
  if (!collection) notFound();
  return <section className="sec shop-page"><CollectionHeader title={collection.title} description={collection.description} /><div className="wrap"><ProductGrid products={collection.products} /></div></section>;
}
