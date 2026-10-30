import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveProductPdp } from "@/components/product/live-product-pdp";
import { getProductProfile } from "@/lib/product-profiles";
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
  return { title: product.title, description: getProductProfile(product).overview.slice(0, 160) };
}

// Products load on the server (cached for 60 seconds), so a missing handle renders Next's not-found page.
export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await resolveProduct(handle);
  if (!product) notFound();

  const { relatedHandles } = getProductProfile(product);
  const related = relatedHandles.length ? (await getProducts()).filter((candidate) => relatedHandles.includes(candidate.handle)) : [];

  return <LiveProductPdp key={product.id} product={product} related={related} />;
}
