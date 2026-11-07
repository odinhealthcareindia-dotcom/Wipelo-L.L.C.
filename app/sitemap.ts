import type { MetadataRoute } from "next";
import { getCategories, getPostSlugs } from "@/lib/sanity/queries";
import { getProducts } from "@/lib/shopify";

// Set NEXT_PUBLIC_SITE_URL to the live domain (e.g. https://wipelo.com) so search engines get absolute URLs.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, products] = await Promise.all([getPostSlugs(), getCategories(), getProducts().catch(() => [])]);
  const pages = ["", "/shop", "/science", "/our-story", "/blog", "/return-policy", "/dispute-resolution"];

  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...products.map((product) => ({ url: `${SITE_URL}/products/${product.handle}` })),
    ...categories.map((category) => ({ url: `${SITE_URL}/blog/category/${category.slug}` })),
    ...posts.map((post) => ({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: post.updatedAt })),
  ];
}
