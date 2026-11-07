import { sanityFetch } from "./fetch";
import type { BlogCategory, BlogPost, BlogPostCard } from "./types";

// A post is live once it has a slug and its publish date has arrived, so editors can schedule posts.
const LIVE = `_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()`;

const CARD = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  "readingMinutes": round(length(pt::text(body)) / 5 / 220) + 1,
  "categories": coalesce(categories[]->{ title, "slug": slug.current }, []),
  author->{ name, role, image }
`;

export function getPosts() {
  return sanityFetch<BlogPostCard[]>({ query: `*[${LIVE}] | order(publishedAt desc) { ${CARD} }`, tags: ["post"], fallback: [] });
}

export function getPostsByCategory(category: string) {
  return sanityFetch<BlogPostCard[]>({
    query: `*[${LIVE} && $category in categories[]->slug.current] | order(publishedAt desc) { ${CARD} }`,
    params: { category },
    tags: ["post", "category"],
    fallback: [],
  });
}

export function getPost(slug: string) {
  return sanityFetch<BlogPost | null>({
    query: `*[${LIVE} && slug.current == $slug][0] {
      ${CARD},
      _updatedAt,
      body[]{
        ...,
        _type == "image" => { ..., asset },
        markDefs[]{ ..., _type == "internalLink" => { "slug": @.reference->slug.current } }
      },
      "faqs": coalesce(faqs, []),
      seo,
      author->{ name, role, image, bio },
      "related": *[${LIVE} && slug.current != $slug && references(^.categories[]._ref)] | order(publishedAt desc)[0...3] { ${CARD} }
    }`,
    params: { slug },
    tags: ["post"],
    fallback: null,
  });
}

export function getPostSlugs() {
  return sanityFetch<{ slug: string; updatedAt: string }[]>({ query: `*[${LIVE}]{ "slug": slug.current, "updatedAt": _updatedAt }`, tags: ["post"], fallback: [] });
}

export function getCategories() {
  return sanityFetch<BlogCategory[]>({
    query: `*[_type == "category" && defined(slug.current)] | order(title asc) {
      title, "slug": slug.current, description,
      "count": count(*[${LIVE} && references(^._id)])
    }[count > 0]`,
    tags: ["category"],
    fallback: [],
  });
}

export function getCategory(slug: string) {
  return sanityFetch<BlogCategory | null>({
    query: `*[_type == "category" && slug.current == $slug][0]{ title, "slug": slug.current, description }`,
    params: { slug },
    tags: ["category"],
    fallback: null,
  });
}
