import Link from "next/link";
import type { ShopifyProduct } from "@/lib/shopify";
import { moneyLabel } from "@/lib/money";
import { AddProductButton } from "@/components/add-product-button";
import { Parallax } from "@/components/motion/parallax";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { getProductCategory, getProductProfile } from "@/lib/product-profiles";
import { maxPlanSavingsPercent } from "@/lib/subscriptions";

function firstVariant(product: ShopifyProduct) {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null;
}

function productSummary(product: ShopifyProduct) {
  return getProductProfile(product).shortBenefit;
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
  const subscribeSaving = maxPlanSavingsPercent(product);
  return <article className={`sku-card product-card${compact ? " product-card-compact" : ""}`}>
    <Link className="sku-stage st-cream product-stage" href={`/products/${product.handle}`} aria-label={`View ${product.title}`}>
      {image ? <img className="product-card-image" src={image.url} alt={image.altText || product.title} /> : <div className="product-pack-art"><span className="p-cat">Functional wet wipes</span><span className="p-name">Wipelo</span><span className="p-sku">{product.title}</span></div>}
      {!product.availableForSale && <span className="sku-flag">Sold out</span>}
    </Link>
    <div className="sku-body">
      <span className="who">{getProductProfile(product).badge}</span>
      <Link href={`/products/${product.handle}`}><h3>{product.title}</h3></Link>
      {productSummary(product) && <p className="tag">{productSummary(product)}</p>}
      {subscribeSaving > 0 && <Link className="sku-subscribe" href={`/products/${product.handle}`}>Subscribe &amp; save up to {subscribeSaving}%</Link>}
      <div className="sku-foot">
        <div className="price">{moneyLabel(product.priceRange.minVariantPrice)}{product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && <span className="per"> – {moneyLabel(product.priceRange.maxVariantPrice)}</span>}</div>
        {variant?.availableForSale && !product.requiresSellingPlan ? <AddProductButton variant={variant} className="sku-add">Add +</AddProductButton> : <Link className="sku-add" href={`/products/${product.handle}`}>View →</Link>}
      </div>
    </div>
  </article>;
}

export function ProductGrid({ products, compact = false }: { products: ShopifyProduct[]; compact?: boolean }) {
  if (!products.length) return <StoreSetupNote compact={compact} />;
  return <div className={`line-grid product-grid${compact ? " product-grid-compact" : ""}`}>{products.map((product) => <ProductCard key={product.id} product={product} compact={compact} />)}</div>;
}

const compareRows = [
  { key: "bestFor", label: "Best for" },
  { key: "useOn", label: "Use on" },
  { key: "ingredients", label: "Key ingredients" },
  { key: "format", label: "Format" },
  { key: "note", label: "Good to know" },
] as const;

type CompareSpec = { tone: string; eyebrow: string } & Record<(typeof compareRows)[number]["key"], string>;

const compareSpecs: Record<string, CompareSpec> = {
  otg: { tone: "mint", eyebrow: "Between showers", bestFor: "Lifting surface sweat and everyday residue", useOn: "Underarms, feet, body", ingredients: "Mild cleansers + zinc ricinoleate", format: "Individually sealed · no rinse", note: "Not an antiperspirant or a shower replacement" },
  spotless: { tone: "stone", eyebrow: "Body breakouts", bestFor: "Breakout-prone body skin", useOn: "Back, chest, shoulders", ingredients: "Planned 0.5% salicylic acid, niacinamide, glycerin, panthenol", format: "Individually sealed · leave-on", note: "Check the finished pack for confirmed ingredients" },
  her: { tone: "sand", eyebrow: "External intimate care", bestFor: "Occasional external intimate cleansing", useOn: "External intimate skin only", ingredients: "Planned lactic acid + sodium lactate, glycerin, panthenol, aloe", format: "Individually wrapped · fragrance-free", note: "Does not change or regulate vaginal pH" },
};

function compareKey(product: ShopifyProduct) {
  const category = getProductCategory(product);
  return category === "on-the-go" ? "otg" : category === "wipelo" ? null : category;
}

function compareSpec(product: ShopifyProduct) {
  const key = compareKey(product);
  return key ? compareSpecs[key] : null;
}

function compareOrder(product: ShopifyProduct) {
  const index = Object.keys(compareSpecs).indexOf(compareKey(product) ?? "");
  return index === -1 ? Infinity : index;
}

function CompareColumn({ product }: { product: ShopifyProduct }) {
  const variant = firstVariant(product);
  const image = product.featuredImage ?? product.images[0] ?? null;
  const spec = compareSpec(product);
  const min = product.priceRange.minVariantPrice;
  const max = product.priceRange.maxVariantPrice;
  return <Reveal className="cmpx-col">
    <div className="cmpx-cell cmpx-product">
      <Link className={`cmpx-stage cmpx-tone-${spec?.tone ?? "mint"}`} href={`/products/${product.handle}`} aria-label={`View ${product.title}`}>
        {image ? <Parallax fill offset={12}><img src={image.url} alt={image.altText || product.title} /></Parallax> : <span className="cmpx-stage-name">{product.title}</span>}
        {!product.availableForSale && <span className="cmpx-flag">Sold out</span>}
      </Link>
      {spec && <span className="cmpx-eyebrow">{spec.eyebrow}</span>}
      <Link href={`/products/${product.handle}`}><h3>{product.title.replace(/^wipelo\s*/i, "")}</h3></Link>
      <div className="cmpx-price">{moneyLabel(min)}{min.amount !== max.amount && <span> – {moneyLabel(max)}</span>}</div>
      {variant?.availableForSale && !product.requiresSellingPlan ? <AddProductButton variant={variant} className="cmpx-add">Add to bag</AddProductButton> : <Link className="cmpx-add" href={`/products/${product.handle}`}>View product</Link>}
    </div>
    {compareRows.map((row) => <div className="cmpx-cell" data-label={row.label} key={row.key}>{spec?.[row.key] ?? (row.key === "bestFor" ? productSummary(product) : "—")}</div>)}
  </Reveal>;
}

export function HomeShopSection({ products }: { products: ShopifyProduct[] }) {
  return <section className="sec cmpx-section" id="products">
    <div className="wrap">
      <Stagger className="cmpx-head" gap={0.09}><Reveal as="span" className="cmpx-tag">// Three needs. Three wipes.</Reveal><Reveal as="h2">Find your Wipelo.</Reveal><Reveal as="p">Choose the wipe designed for the moment and area you want to care for.</Reveal></Stagger>
      {products.length ? <Stagger className="cmpx-table" gap={0.12} style={{ "--cmpx-n": products.length } as React.CSSProperties}>
        <Reveal variant="fadeIn" className="cmpx-col cmpx-labels" aria-hidden="true">
          <div className="cmpx-cell cmpx-product"><span>Compare</span></div>
          {compareRows.map((row) => <div className="cmpx-cell" key={row.key}>{row.label}</div>)}
        </Reveal>
        {[...products].sort((a, b) => compareOrder(a) - compareOrder(b)).map((product) => <CompareColumn key={product.id} product={product} />)}
      </Stagger> : <StoreSetupNote />}
      <Reveal as="p" className="cmpx-foot">Still unsure? <Link href="#choose-your-wipe">Answer one question</Link> and we'll point you to the right wipe.</Reveal>
    </div>
  </section>;
}

export function HomeShopStrip({ products }: { products: ShopifyProduct[] }) {
  return <section className="sec home-shop-strip" style={{ paddingTop: 0 }}><div className="wrap"><Stagger className="sec-head" gap={0.09}><Reveal as="span" className="mono-tag">// The Wipelo range</Reveal><Reveal as="h2" className="h-section">Choose the care you need.</Reveal></Stagger><Reveal><ProductGrid products={products} compact /></Reveal></div></section>;
}

export function CollectionHeader({ title, description }: { title: string; description?: string }) {
  return <div className="shop-intro wrap"><span className="mono-tag">// Wipelo shop</span><h1 className="h-section">{title}</h1>{description && <p className="lede">{description}</p>}</div>;
}
