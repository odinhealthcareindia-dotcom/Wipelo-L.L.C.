import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/react";
import { FAQAccordion } from "@/components/faq-accordion";
import { PostBody, headingId } from "@/components/blog/post-body";
import { PostCard, PostMeta } from "@/components/blog/post-card";
import { sanityImageDimensions, sanityImageSrcSet, sanityImageUrl } from "@/lib/sanity/image";
import { getPost, getPostSlugs } from "@/lib/sanity/queries";
import { getProductByHandle, type ShopifyProduct } from "@/lib/shopify";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt;
  const shareImage = post.seo?.ogImage?.asset ? post.seo.ogImage : post.coverImage;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: post.seo?.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: shareImage?.asset ? [{ url: sanityImageUrl(shareImage, 1200, 630), width: 1200, height: 630, alt: shareImage.alt ?? post.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

type Heading = { id: string; text: string };

function outline(body: PortableTextBlock[]): Heading[] {
  return body
    .filter((block) => block._type === "block" && block.style === "h2")
    .map((block) => {
      const text = (block.children as { text?: string }[]).map((child) => child.text ?? "").join("");
      return { id: headingId(text), text };
    })
    .filter((heading) => heading.text);
}

async function productsIn(body: PortableTextBlock[]) {
  const handles = [...new Set(body.filter((block) => block._type === "productCard").map((block) => (block as unknown as { handle: string }).handle).filter(Boolean))];
  const found = await Promise.all(handles.map((handle) => getProductByHandle(handle).catch(() => null)));
  return Object.fromEntries(found.filter((product): product is ShopifyProduct => Boolean(product)).map((product) => [product.handle, product]));
}

/** Structured data so search engines can show the article, and its FAQ, as rich results. */
function jsonLd(post: NonNullable<Awaited<ReturnType<typeof getPost>>>) {
  const graph: Record<string, unknown>[] = [{
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo?.metaDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    image: post.coverImage?.asset ? sanityImageUrl(post.coverImage, 1600) : undefined,
    author: post.author ? { "@type": "Person", name: post.author.name, jobTitle: post.author.role } : { "@type": "Organization", name: "Wipelo" },
    publisher: { "@type": "Organization", name: "Wipelo" },
  }];
  if (post.faqs.length) graph.push({
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  });
  // Escape "<" so article text can never close the script tag.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const body = post.body ?? [];
  const [products, headings] = [await productsIn(body), outline(body)];
  const cover = post.coverImage?.asset ? post.coverImage : null;
  const coverSize = cover ? sanityImageDimensions(cover) : null;

  return <article className="post">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(post) }} />

    <header className="post-head wrap">
      <nav className="post-crumbs" aria-label="Breadcrumb">
        <Link href="/blog">Journal</Link>
        {post.categories[0] && <><span aria-hidden="true">/</span><Link href={`/blog/category/${post.categories[0].slug}`}>{post.categories[0].title}</Link></>}
      </nav>
      <h1>{post.title}</h1>
      {post.excerpt && <p className="post-dek">{post.excerpt}</p>}
      <div className="post-byline">
        {post.author?.image?.asset && <img src={sanityImageUrl(post.author.image, 96, 96)} alt="" width={48} height={48} />}
        <div>
          {post.author && <p className="post-author">{post.author.name}{post.author.role && <span>{post.author.role}</span>}</p>}
          <PostMeta post={post} />
        </div>
      </div>
    </header>

    {cover && coverSize && <figure className="post-cover wrap">
      <img src={sanityImageUrl(cover, 1800)} srcSet={sanityImageSrcSet(cover, [720, 1200, 1800, 2400])} sizes="(max-width: 1240px) 100vw, 1200px" width={coverSize.width} height={coverSize.height} alt={cover.alt ?? ""} fetchPriority="high" />
      {cover.caption && <figcaption>{cover.caption}</figcaption>}
    </figure>}

    <div className="post-layout wrap">
      {headings.length > 2 && <nav className="post-toc" aria-label="In this article">
        <p>In this article</p>
        <ol>{headings.map((heading) => <li key={heading.id}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ol>
      </nav>}
      <PostBody body={body} products={products} />
    </div>

    {post.author?.bio && <aside className="post-author-card wrap">
      <p><strong>About {post.author.name}.</strong> {post.author.bio}</p>
    </aside>}

    {post.faqs.length > 0 && <FAQAccordion tag="// Questions on this topic" title="Quick answers." items={post.faqs.map((faq) => ({ question: faq.question, answer: <p>{faq.answer}</p> }))} />}

    {post.related.length > 0 && <section className="sec post-related">
      <div className="wrap">
        <h2 className="h-section">Keep reading.</h2>
        <div className="post-grid">{post.related.map((related) => <PostCard key={related._id} post={related} />)}</div>
      </div>
    </section>}
  </article>;
}
