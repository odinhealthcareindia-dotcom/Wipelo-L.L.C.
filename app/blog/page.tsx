import type { Metadata } from "next";
import { BlogEmpty, CategoryNav, PostCard } from "@/components/blog/post-card";
import { getCategories, getPosts } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Journal",
  description: "Practical, evidence-minded reads on body freshness, breakout-prone skin, and external intimate care from the Wipelo team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const [lead, ...rest] = posts;

  return <>
    <section className="sec blog-intro">
      <div className="wrap">
        <h1 className="h-display">The Wipelo Journal.</h1>
        <p className="lede">Plain-spoken reads on sweat, skin and the in-between moments, with the science kept honest.</p>
        <CategoryNav categories={categories} />
      </div>
    </section>

    <section className="blog-list">
      <div className="wrap">
        {lead ? <>
          <PostCard post={lead} featured />
          {rest.length > 0 && <div className="post-grid">{rest.map((post) => <PostCard key={post._id} post={post} />)}</div>}
        </> : <BlogEmpty message="The first articles are on their way. Check back soon." />}
      </div>
    </section>
  </>;
}
