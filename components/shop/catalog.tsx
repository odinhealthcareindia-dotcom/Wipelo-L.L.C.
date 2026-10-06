import Link from "next/link";
import { isShopifyConfigured, type ShopifyProduct } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";
import { AddProductButton } from "@/components/product/product-buy";

function firstVariant(product: ShopifyProduct) {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null;
}

export function StoreSetupNote({ compact = false }: { compact?: boolean }) {
  return <div className={`shop-empty [grid-column:1/-1] [min-height:260px] flex flex-col justify-center items-start [padding:clamp(24px,5vw,56px)] [border:1px_solid_var(--hairline)] [border-radius:14px] [background:linear-gradient(130deg,var(--mist),rgba(223,242,237,.25))] [&_.mono-tag]:[margin-bottom:12px] [&_h3]:[font-size:clamp(24px,3vw,34px)] [&_h3]:[max-width:20ch] [&_p]:[max-width:60ch] [&_p]:[color:var(--ink-60)] [&_p]:[margin:14px_0_18px]${compact ? " shop-empty-compact" : ""}`}>
    <span className="mono-tag font-wipelo-mono [font-size:10px] [letter-spacing:.16em] uppercase text-wipelo-teal-deep">// {isShopifyConfigured() ? "No products published yet" : "Shopify connection needed"}</span>
    <h3>{isShopifyConfigured() ? "Your first products will appear here." : "Your storefront is ready for your Shopify catalog."}</h3>
    <p>{isShopifyConfigured()
      ? "Add products in Shopify, set them to Active, and publish them to your Headless sales channel. This page will pick them up automatically."
      : "Connect a Storefront API token in the environment settings, then publish products to the Headless sales channel. Product names, images, prices, variants, and product pages will come directly from Shopify."}</p>
  </div>;
}

function ProductCard({ product, compact = false }: { product: ShopifyProduct; compact?: boolean }) {
  const variant = firstVariant(product);
  const image = product.featuredImage ?? product.images[0] ?? null;
  return <article className={`sku-card product-card [border-radius:var(--r)] overflow-hidden bg-white [border:1px_solid_var(--stone)] flex flex-col [transition:transform_.5s_var(--ease),box-shadow_.5s_var(--ease)]  [&:hover]:[transform:translateY(-6px)] [&:hover]:[box-shadow:var(--shadow)] [&:hover_.sku-stage_.pack]:[transform:rotate(-2.5deg)_scale(1.03)] [&:hover_.product-card-image]:[transform:scale(1.035)] [&_.sku-body>a:hover_h3]:[color:var(--teal-deep)] [&_.tag]:[min-height:3.2em] [&_.sku-add]:[white-space:nowrap] [&_.sku-foot_.price]:[font-size:21px]${compact ? " product-card-compact" : ""}`}>
    <Link className="sku-stage st-cream product-stage [aspect-ratio:1/1.02] flex items-center justify-center relative overflow-hidden [&_.pack]:[width:150px] [&_.pack]:[padding:14px_13px] [&_.pack]:[border-radius:9px] [&_.pack]:[transition:transform_.5s_var(--ease)] [&_.pack_.p-name]:[font-size:19px] [&_.pack_.p-sku]:[font-size:10.5px] [&_.pack_.p-sku]:[margin-bottom:8px] [&_.pack_.p-spec]:[font-size:5.6px] [&.st-cream]:[background:var(--cream)] [&.st-teal]:[background:var(--teal)] [&.st-ink]:[background:var(--ink)] [&.st-stone]:[background:var(--stone)] [&.st-mist]:[background:var(--mist)]" href={`/products/${product.handle}`} aria-label={`View ${product.title}`}>
      {image ? <img className="product-card-image w-full h-full absolute inset-0 [object-fit:cover] [transition:transform_.6s_var(--ease)]" src={image.url} alt={image.altText || product.title} /> : <div className="product-pack-art [width:150px] [min-height:214px] [padding:16px_13px] flex items-center justify-center flex-col relative [border-radius:9px] [background:linear-gradient(150deg,#05221E,#0B7468)] text-wipelo-cream [box-shadow:0_16px_34px_-18px_rgba(5,34,30,.55)] text-center [&_.p-cat]:[font:400_7px/1.4_var(--mo)] [&_.p-cat]:[letter-spacing:.13em] [&_.p-cat]:[text-transform:uppercase] [&_.p-cat]:[opacity:.64] [&_.p-name]:[font:600_27px/1_var(--fr)] [&_.p-name]:[margin:14px_0_8px] [&_.p-sku]:[font:700_12px/1.2_var(--mo)] [&_.p-sku]:[letter-spacing:.1em] [&_.p-sku]:[text-transform:uppercase] [&_.p-sku]:[color:var(--teal-bright)] [&.pack-lg]:[width:clamp(180px,22vw,260px)] [&.pack-lg]:[min-height:clamp(280px,32vw,380px)] [&.pack-lg]:[flex:none]"><span className="p-cat">Functional Wet Wipes™</span><span className="p-name">Wipelo</span><span className="p-sku">{product.title}</span></div>}
      {!product.availableForSale && <span className="sku-flag absolute [top:14px] [left:14px] font-wipelo-mono [font-size:9px] [letter-spacing:.14em] uppercase [background:rgba(11,11,11,.78)] text-wipelo-cream [padding:6px_11px] [border-radius:5px]">Sold out</span>}
    </Link>
    <div className="sku-body [padding:20px_20px_22px] flex flex-col [gap:8px] [flex:1] [&_.who]:[font-family:var(--mo)] [&_.who]:[font-size:9.5px] [&_.who]:[letter-spacing:.14em] [&_.who]:[text-transform:uppercase] [&_.who]:[color:var(--teal-deep)] [&_h3]:[font-size:21px] [&_.tag]:[font-size:13.5px] [&_.tag]:[color:var(--ink-60)] [&_.tag]:[flex:1]">
      <span className="who">{product.options.length > 1 ? `${product.options.length} options` : "Functional Wet Wipes™"}</span>
      <Link href={`/products/${product.handle}`}><h3>{product.title}</h3></Link>
      {product.description && <p className="tag">{product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180)}</p>}
      <div className="sku-foot flex items-center justify-between [margin-top:10px] [padding-top:14px] [border-top:1px_solid_var(--hairline)] [&_.price]:[font:600_15px/1_var(--in)] [&_.price_.per]:[display:block] [&_.price_.per]:[font:400_10px/1.6_var(--mo)] [&_.price_.per]:[letter-spacing:.06em] [&_.price_.per]:[color:var(--ink-40)] [&_.price_.per]:[text-transform:uppercase]">
        <div className="price">{moneyLabel(product.priceRange.minVariantPrice)}{product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && <span className="per"> – {moneyLabel(product.priceRange.maxVariantPrice)}</span>}</div>
        {variant?.availableForSale ? <AddProductButton variant={variant} className="sku-add [font:600_12.5px/1_var(--in)] [border:1.5px_solid_var(--ink)] [border-radius:999px] [padding:10px_16px] [transition:background_.2s,color_.2s] [&:hover]:[background:var(--ink)] [&:hover]:[color:var(--cream)]">Add +</AddProductButton> : <Link className="sku-add [font:600_12.5px/1_var(--in)] [border:1.5px_solid_var(--ink)] [border-radius:999px] [padding:10px_16px] [transition:background_.2s,color_.2s] [&:hover]:[background:var(--ink)] [&:hover]:[color:var(--cream)]" href={`/products/${product.handle}`}>View →</Link>}
      </div>
    </div>
  </article>;
}

export function ProductGrid({ products, compact = false }: { products: ShopifyProduct[]; compact?: boolean }) {
  if (!products.length) return <StoreSetupNote compact={compact} />;
  return <div className={`line-grid product-grid grid [grid-template-columns:repeat(4,1fr)] [gap:18px] max-[1020px]:[grid-template-columns:repeat(2,1fr)] [align-items:stretch] max-[520px]:[&]:[grid-template-columns:1fr]${compact ? " product-grid-compact" : ""}`}>{products.map((product) => <ProductCard key={product.id} product={product} compact={compact} />)}</div>;
}

export function HomeShopSection({ products }: { products: ShopifyProduct[] }) {
  return <section className="sec [padding:clamp(72px,9vw,128px)_0]" id="products">
    <div className="wrap [max-width:var(--max)] [margin:0_auto] [padding:0_min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-left:min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-right:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-left:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-right:min(5vw,40px)]">
      <div className="sec-head rv [margin-bottom:clamp(36px,5vw,64px)] [max-width:760px] [opacity:0] [transform:translateY(26px)] [transition:opacity_.8s_var(--ease),transform_.8s_var(--ease)] motion-reduce:[opacity:1] motion-reduce:[transform:none] motion-reduce:[transition:none] [&_.mono-tag]:[display:block] [&_.mono-tag]:[margin-bottom:16px] [&_p]:[margin-top:18px] [&.in]:[opacity:1] [&.in]:[transform:none] [&.rv-now]:[transition:none]"><span className="mono-tag font-wipelo-mono [font-size:10px] [letter-spacing:.16em] uppercase text-wipelo-teal-deep">// The line — one active, one job</span><h2 className="h-section [font-size:clamp(32px,4.2vw,56px)]">Shop the line.</h2><p className="lede [font-size:clamp(16px,1.4vw,19px)] [line-height:1.65] [color:var(--ink-60)] [max-width:56ch]">Every product, option, image, and price shown here is loaded from your Shopify catalog.</p></div>
      <ProductGrid products={products} />
    </div>
  </section>;
}

export function HomeShopStrip({ products }: { products: ShopifyProduct[] }) {
  return <section className="sec home-shop-strip [padding:clamp(72px,9vw,128px)_0] [padding-bottom:clamp(56px,8vw,110px)]" style={{ paddingTop: 0 }}><div className="wrap [max-width:var(--max)] [margin:0_auto] [padding:0_min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-left:min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-right:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-left:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-right:min(5vw,40px)]"><div className="sec-head [margin-bottom:clamp(36px,5vw,64px)] [max-width:760px] [&_.mono-tag]:[display:block] [&_.mono-tag]:[margin-bottom:16px] [&_p]:[margin-top:18px]"><span className="mono-tag font-wipelo-mono [font-size:10px] [letter-spacing:.16em] uppercase text-wipelo-teal-deep">// Find your functional wipe</span><h2 className="h-section [font-size:clamp(32px,4.2vw,56px)]">Your skin, your call.</h2></div><ProductGrid products={products} compact /></div></section>;
}

export function CollectionHeader({ title, description }: { title: string; description?: string }) {
  return <div className="shop-intro wrap [max-width:var(--max)] [margin:0_auto] [padding:0_min(5vw,40px)] [margin:0_auto_clamp(34px,5vw,64px)] [&_.mono-tag]:[display:block] [&_.mono-tag]:[margin-bottom:15px] [&_.lede]:[margin-top:18px] max-[1020px]:[&.hero-grid]:[padding-left:min(5vw,40px)] max-[1020px]:[&.hero-grid]:[padding-right:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-left:min(5vw,40px)] max-[1020px]:[&.pdp]:[padding-right:min(5vw,40px)]"><span className="mono-tag font-wipelo-mono [font-size:10px] [letter-spacing:.16em] uppercase text-wipelo-teal-deep">// Wipelo shop</span><h1 className="h-section [font-size:clamp(32px,4.2vw,56px)]">{title}</h1>{description && <p className="lede [font-size:clamp(16px,1.4vw,19px)] [line-height:1.65] [color:var(--ink-60)] [max-width:56ch]">{description}</p>}</div>;
}
