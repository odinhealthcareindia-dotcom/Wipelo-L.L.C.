import Link from "next/link";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "@portabletext/react";
import { sanityImageDimensions, sanityImageSrcSet, sanityImageUrl } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";
import type { ShopifyProduct } from "@/lib/shopify";
import { moneyLabel, productPerWipeLabel } from "@/lib/money";

type Callout = { _type: "callout"; tone?: "note" | "tip" | "caution"; title?: string; text: string };
type ProductCardBlock = { _type: "productCard"; handle: string; note?: string };

const CALLOUT_LABEL = { note: "Good to know", tip: "Try this", caution: "Take care" } as const;

/** Turns a heading's text into a stable anchor id, so the table of contents can link to it. */
export function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

function blockText(value: PortableTextBlock) {
  return (value.children as { text?: string }[] | undefined)?.map((child) => child.text ?? "").join("") ?? "";
}

export function PostBody({ body, products }: { body: PortableTextBlock[]; products: Record<string, ShopifyProduct> }) {
  const components: PortableTextComponents = {
    block: {
      h2: ({ children, value }) => <h2 id={headingId(blockText(value))}>{children}</h2>,
      h3: ({ children, value }) => <h3 id={headingId(blockText(value))}>{children}</h3>,
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    },
    marks: {
      link: ({ children, value }) => {
        const href: string = value?.href ?? "#";
        const external = /^https?:\/\//.test(href) && !href.includes("wipelo");
        return external
          ? <a href={href} target={value?.blank ? "_blank" : undefined} rel="noopener noreferrer">{children}</a>
          : <Link href={href}>{children}</Link>;
      },
      internalLink: ({ children, value }) => value?.slug ? <Link href={`/blog/${value.slug}`}>{children}</Link> : <>{children}</>,
    },
    types: {
      image: ({ value }: { value: SanityImage }) => {
        if (!value?.asset) return null;
        const { width, height } = sanityImageDimensions(value);
        return <figure className="post-figure">
          <img src={sanityImageUrl(value, 1400)} srcSet={sanityImageSrcSet(value, [640, 960, 1400])} sizes="(max-width: 760px) 100vw, 720px" width={width} height={height} alt={value.alt ?? ""} loading="lazy" />
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>;
      },
      callout: ({ value }: { value: Callout }) => {
        const tone = value.tone ?? "note";
        return <aside className={`post-callout is-${tone}`}>
          <strong>{value.title || CALLOUT_LABEL[tone]}</strong>
          <p>{value.text}</p>
        </aside>;
      },
      productCard: ({ value }: { value: ProductCardBlock }) => {
        const product = products[value.handle];
        if (!product) return null;
        const image = product.featuredImage ?? product.images[0];
        return <aside className="post-product">
          {image && <img src={image.url} alt={image.altText || product.title} width={160} height={160} loading="lazy" />}
          <div>
            <span className="post-product-label">Shop this</span>
            <h4>{product.title}</h4>
            {value.note && <p>{value.note}</p>}
            <div className="post-product-foot">
              <span>From {moneyLabel(product.priceRange.minVariantPrice)} · {productPerWipeLabel(product)}</span>
              <Link href={`/products/${product.handle}`}>View {product.title.replace(/^wipelo\s*/i, "")}</Link>
            </div>
          </div>
        </aside>;
      },
    },
  };

  return <div className="post-prose"><PortableText value={body} components={components} /></div>;
}
