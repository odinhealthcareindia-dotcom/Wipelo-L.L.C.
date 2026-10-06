import Link from "next/link";
import { moneyLabel } from "@/lib/money";
import type { ShopifyProduct } from "@/lib/shopify";

export function HeroVisual({ product }: { product: ShopifyProduct | null }) {
  const image = product?.featuredImage ?? product?.images[0];
  const title = product?.title ?? "Shopify catalog";
  const price = product ? moneyLabel(product.priceRange.minVariantPrice) : "Your product catalog";
  const productLink = product ? `/products/${encodeURIComponent(product.handle)}` : "/shop";

  return <div className="hero-visual rv">
    <div className="hero-comp home-product-hero">
      <div className="hero-badge"><span className="mono">{product ? "From the Shopify catalog" : "Catalog ready"}</span></div>
      {image ? (
        <img
          className="home-product-hero-image"
          src="/hero-image.png"
          alt={image.altText || product?.title || "Wipelo product"}
          width={1186}
          height={735}
        />
      ) : (
        <div className="pack pack-lg">
          <span className="p-seal">✦</span>
          <span className="p-ghost">W</span>
          <span className="p-cat">Functional Wet Wipes™</span>
          <span className="p-name">Wipelo</span>
          <span className="p-sku">{title}</span>
          <div className="p-spec">
            {product ? product.description.slice(0, 110) : <>Product names · images<br />Details · options · pricing<br />Connected to Shopify</>}
          </div>
        </div>
      )}
      <div className="home-product-hero-details">
        <span className="mono">{price}</span>
        <Link className="link-arrow" href={productLink}>{product ? `Explore ${title} →` : "Browse the shop →"}</Link>
      </div>
    </div>
  </div>;
}
