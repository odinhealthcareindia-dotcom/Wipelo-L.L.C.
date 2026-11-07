import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogEmpty, CategoryNav, PostCard } from "@/components/blog/post-card";
import { getCategories, getCategory, getPostsByCategory } from "@/lib/sanity/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.title} | Journal`,
    description: category.description ?? `Wipelo Journal articles about ${category.title.toLowerCase()}.`,
    alternates: { canonical: `/blog/category/${slug}` },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, posts, categories] = await Promise.all([getCategory(slug), getPostsByCategory(slug), getCategories()]);
  if (!category) notFound();

  return <>
    <section className="sec blog-intro">
      <div className="wrap">
        <h1 className="h-display">{category.title}.</h1>
        {category.description && <p className="lede">{category.description}</p>}
        <CategoryNav categories={categories} active={slug} />
      </div>
    </section>

    <section className="blog-list">
      <div className="wrap">
        {posts.length
          ? <div className="post-grid">{posts.map((post) => <PostCard key={post._id} post={post} />)}</div>
          : <BlogEmpty message="No articles in this topic yet." />}
      </div>
    </section>
  </>;
}
