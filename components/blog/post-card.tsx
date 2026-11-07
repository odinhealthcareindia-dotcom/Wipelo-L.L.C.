import Link from "next/link";
import { sanityImageSrcSet, sanityImageUrl } from "@/lib/sanity/image";
import type { BlogPostCard } from "@/lib/sanity/types";

export function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function PostMeta({ post }: { post: BlogPostCard }) {
  return <p className="post-meta">
    <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
    <span>{post.readingMinutes} min read</span>
  </p>;
}

/** One post in the blog index. `featured` is the wide lead story at the top of the page. */
export function PostCard({ post, featured = false }: { post: BlogPostCard; featured?: boolean }) {
  const aspect = featured ? 4 / 3 : 3 / 2;
  const category = post.categories[0];
  return <article className={`post-card${featured ? " is-featured" : ""}`}>
    <Link href={`/blog/${post.slug}`} className="post-card-media" tabIndex={-1} aria-hidden="true">
      {post.coverImage?.asset
        ? <img src={sanityImageUrl(post.coverImage, 1200, Math.round(1200 / aspect))} srcSet={sanityImageSrcSet(post.coverImage, [480, 800, 1200], aspect)} sizes={featured ? "(max-width: 900px) 100vw, 55vw" : "(max-width: 640px) 100vw, (max-width: 1020px) 50vw, 33vw"} alt="" loading={featured ? "eager" : "lazy"} />
        : <span className="post-card-placeholder">{post.title}</span>}
    </Link>
    <div className="post-card-body">
      {category && <Link className="post-card-category" href={`/blog/category/${category.slug}`}>{category.title}</Link>}
      <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
      {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
      <PostMeta post={post} />
    </div>
  </article>;
}

export function CategoryNav({ categories, active }: { categories: { title: string; slug: string }[]; active?: string }) {
  if (!categories.length) return null;
  return <nav className="blog-cats" aria-label="Blog topics">
    <Link href="/blog" aria-current={!active ? "page" : undefined}>All</Link>
    {categories.map((category) => <Link key={category.slug} href={`/blog/category/${category.slug}`} aria-current={active === category.slug ? "page" : undefined}>{category.title}</Link>)}
  </nav>;
}

export function BlogEmpty({ message }: { message: string }) {
  return <div className="blog-empty">
    <h2>Nothing here yet.</h2>
    <p>{message}</p>
  </div>;
}
