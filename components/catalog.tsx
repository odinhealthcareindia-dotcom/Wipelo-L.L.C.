import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";
import { AddProductButton } from "@/components/product-buy";

function firstVariant(product: ShopifyProduct) {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null;
}

function productSummary(product: ShopifyProduct) {
  const summaries: Record<string, string> = {
    "on-the-go": "Individually sealed body cleansing wipes to help lift surface sweat and everyday residue between showers.",
    spotless: "Leave-on body wipes with a proposed 0.5% salicylic acid formula for breakout-prone skin on the back, chest, and shoulders.",
    her: "Fragrance-free, individually wrapped wipes for occasional cleansing of external intimate skin.",
  };
  return summaries[product.handle] ?? product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

export function StoreSetupNote({ compact = false }: { compact?: boolean }) {
  return <div className={`shop-empty${compact ? " shop-empty-compact" : ""}`}>
    <span className="mono-tag">// The Wipelo range</span>
    <h3>Our wipes are getting ready.</h3>
    <p>Check back soon to explore ON THE GO, SPOTLESS, and HER.</p>
  </div>;
}

function ProductCard({ product, compact = false }: { product: ShopifyProduct; compact?: boolean }) {
  const variant = firstVariant(product);
  const image = product.featuredImage ?? product.images[0] ?? null;
  return <article className={`sku-card product-card${compact ? " product-card-compact" : ""}`}>
    <Link className="sku-stage st-cream product-stage" href={`/products/${product.handle}`} aria-label={`View ${product.title}`}>
      {image ? <img className="product-card-image" src={image.url} alt={image.altText || product.title} /> : <div className="product-pack-art"><span className="p-cat">Personal care wipes</span><span className="p-name">Wipelo</span><span className="p-sku">{product.title}</span></div>}
      {!product.availableForSale && <span className="sku-flag">Sold out</span>}
    </Link>
    <div className="sku-body">
      <span className="who">{product.handle === "on-the-go" ? "Between-shower body care" : product.handle === "spotless" ? "Targeted body acne care" : product.handle === "her" ? "External intimate care" : "Individually wrapped wipes"}</span>
      <Link href={`/products/${product.handle}`}><h3>{product.title}</h3></Link>
      {productSummary(product) && <p className="tag">{productSummary(product)}</p>}
      <div className="sku-foot">
        <div className="price">{moneyLabel(product.priceRange.minVariantPrice)}{product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && <span className="per"> – {moneyLabel(product.priceRange.maxVariantPrice)}</span>}</div>
        {variant?.availableForSale ? <AddProductButton variant={variant} className="sku-add">Add +</AddProductButton> : <Link className="sku-add" href={`/products/${product.handle}`}>View →</Link>}
      </div>
    </div>
  </article>;
}

export function ProductGrid({ products, compact = false }: { products: ShopifyProduct[]; compact?: boolean }) {
  if (!products.length) return <StoreSetupNote compact={compact} />;
  return <div className={`line-grid product-grid${compact ? " product-grid-compact" : ""}`}>{products.map((product) => <ProductCard key={product.id} product={product} compact={compact} />)}</div>;
}

export function HomeShopSection({ products }: { products: ShopifyProduct[] }) {
  return <section className="sec" id="products">
    <div className="wrap">
      <div className="sec-head rv"><span className="mono-tag">// Three needs. Three wipes.</span><h2 className="h-section">Find your Wipelo.</h2><p className="lede">Choose the wipe designed for the moment and area you want to care for.</p></div>
      <ProductGrid products={products} />
    </div>
  </section>;
}

export function HomeShopStrip({ products }: { products: ShopifyProduct[] }) {
  return <section className="sec home-shop-strip" style={{ paddingTop: 0 }}><div className="wrap"><div className="sec-head"><span className="mono-tag">// The Wipelo range</span><h2 className="h-section">Choose the care you need.</h2></div><ProductGrid products={products} compact /></div></section>;
}

export function CollectionHeader({ title, description }: { title: string; description?: string }) {
  return <div className="shop-intro wrap"><span className="mono-tag">// Wipelo shop</span><h1 className="h-section">{title}</h1>{description && <p className="lede">{description}</p>}</div>;
}
