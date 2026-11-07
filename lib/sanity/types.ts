import type { PortableTextBlock } from "@portabletext/react";

export type SanityImage = {
  _type?: "image";
  asset?: { _ref: string; _type?: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
  caption?: string;
};

export type BlogCategory = { title: string; slug: string; description?: string; count?: number };

export type BlogAuthor = { name: string; role?: string; image?: SanityImage; bio?: string };

export type BlogFAQ = { _key: string; question: string; answer: string };

export type BlogSEO = { metaTitle?: string; metaDescription?: string; ogImage?: SanityImage; noIndex?: boolean };

export type BlogPostCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: SanityImage;
  publishedAt: string;
  readingMinutes: number;
  categories: BlogCategory[];
  author?: BlogAuthor;
};

export type BlogPost = BlogPostCard & {
  _updatedAt: string;
  body: PortableTextBlock[];
  faqs: BlogFAQ[];
  seo?: BlogSEO;
  related: BlogPostCard[];
};
