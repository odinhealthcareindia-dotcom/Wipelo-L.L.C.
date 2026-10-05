import Link from "next/link";
import { isShopifyConfigured, type ShopifyProduct } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";
import { AddProductButton } from "@/components/product-buy";

function firstVariant(product: ShopifyProduct) {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null;
}

export function StoreSetupNote({ compact = false }: { compact?: boolean }) {
  return <div className={`shop-empty${compact ? " shop-empty-compact" : ""}`}>
    <span className="mono-tag">// {isShopifyConfigured() ? "No products published yet" : "Shopify connection needed"}</span>
    <h3>{isShopifyConfigured() ? "Your first products will appear here." : "Your storefront is ready for your Shopify catalog."}</h3>
    <p>{isShopifyConfigured()
      ? "Add products in Shopify, set them to Active, and publish them to your Headless sales channel. This page will pick them up automatically."
      : "Connect a Storefront API token in the environment settings, then publish products to the Headless sales channel. Product names, images, prices, variants, and product pages will come directly from Shopify."}</p>
  </div>;
}

function ProductCard({ product, compact = false }: { product: ShopifyProduct; compact?: boolean }) {
  const variant = firstVariant(product);
  const image = product.featuredImage ?? product.images[0] ?? null;
  return <article className={`sku-card product-card${compact ? " product-card-compact" : ""}`}>
    <Link className="sku-stage st-cream product-stage" href={`/products/${product.handle}`} aria-label={`View ${product.title}`}>
      {image ? <img className="product-card-image" src={image.url} alt={image.altText || product.title} /> : <div className="product-pack-art"><span className="p-cat">Functional Wet Wipes™</span><span className="p-name">Wipelo</span><span className="p-sku">{product.title}</span></div>}
      {!product.availableForSale && <span className="sku-flag">Sold out</span>}
    </Link>
    <div className="sku-body">
      <span className="who">{product.options.length > 1 ? `${product.options.length} options` : "Functional Wet Wipes™"}</span>
      <Link href={`/products/${product.handle}`}><h3>{product.title}</h3></Link>
      {product.description && <p className="tag">{product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180)}</p>}
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
      <div className="sec-head rv"><span className="mono-tag">// The line — one active, one job</span><h2 className="h-section">Shop the line.</h2><p className="lede">Every product, option, image, and price shown here is loaded from your Shopify catalog.</p></div>
      <ProductGrid products={products} />
    </div>
  </section>;
}

export function HomeShopStrip({ products }: { products: ShopifyProduct[] }) {
  return <section className="sec home-shop-strip" style={{ paddingTop: 0 }}><div className="wrap"><div className="sec-head"><span className="mono-tag">// Find your functional wipe</span><h2 className="h-section">Your skin, your call.</h2></div><ProductGrid products={products} compact /></div></section>;
}

export function CollectionHeader({ title, description }: { title: string; description?: string }) {
  return <div className="shop-intro wrap"><span className="mono-tag">// Wipelo shop</span><h1 className="h-section">{title}</h1>{description && <p className="lede">{description}</p>}</div>;
}
