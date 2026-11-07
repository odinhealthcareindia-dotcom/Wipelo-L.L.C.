import { defineArrayMember, defineField, defineType } from "sanity";

/** Image with the alt text and caption every blog image needs. */
const imageWithAlt = (name: string, title: string, options: { required?: boolean; caption?: boolean } = {}) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    validation: options.required ? (rule) => rule.required() : undefined,
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        description: "Describe the image for people using screen readers and for Google. Leave empty only if the image is purely decorative.",
        validation: (rule) => rule.max(160),
      }),
      ...(options.caption ? [defineField({ name: "caption", title: "Caption", type: "string" })] : []),
    ],
  });

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "faq", title: "FAQ" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (rule) => rule.required().max(110) }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "content",
      description: "The page address: wipelo.com/blog/<this>. Click Generate after writing the title.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description: "One or two sentences shown on the blog index and under the title.",
      validation: (rule) => rule.max(240),
    }),
    imageWithAlt("coverImage", "Cover image", { required: true, caption: true }),
    defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "author" }], group: "content" }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
      description: "The first category is shown on the post card.",
    }),
    defineField({
      name: "publishedAt",
      title: "Publish date",
      type: "datetime",
      group: "content",
      description: "The post appears on the site from this date. Set a future date to schedule it.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Subheading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullets", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              defineArrayMember({
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({ name: "href", title: "URL", type: "url", validation: (rule) => rule.required().uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }) }),
                  defineField({ name: "blank", title: "Open in a new tab", type: "boolean", initialValue: false }),
                ],
              }),
              defineArrayMember({
                name: "internalLink",
                title: "Link to another post",
                type: "object",
                fields: [defineField({ name: "reference", title: "Post", type: "reference", to: [{ type: "post" }] })],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt text", type: "string" }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        }),
        defineArrayMember({
          name: "callout",
          title: "Callout box",
          type: "object",
          fields: [
            defineField({
              name: "tone",
              title: "Type",
              type: "string",
              options: { list: [{ title: "Good to know", value: "note" }, { title: "Try this", value: "tip" }, { title: "Take care", value: "caution" }], layout: "radio", direction: "horizontal" },
              initialValue: "note",
            }),
            defineField({ name: "title", title: "Heading (optional)", type: "string" }),
            defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "title", subtitle: "text" }, prepare: ({ title, subtitle }) => ({ title: title || "Callout", subtitle }) },
        }),
        defineArrayMember({
          name: "productCard",
          title: "Shop this product",
          type: "object",
          fields: [
            defineField({
              name: "handle",
              title: "Product",
              type: "string",
              description: "The Shopify product. Price and image come from Shopify automatically.",
              options: { list: [{ title: "ON THE GO", value: "on-the-go" }, { title: "SPOTLESS", value: "spotless" }, { title: "HER", value: "her" }] },
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "note", title: "Why it fits this article (optional)", type: "string" }),
          ],
          preview: { select: { title: "handle", subtitle: "note" }, prepare: ({ title, subtitle }) => ({ title: `Shop: ${title}`, subtitle }) },
        }),
      ],
    }),
    defineField({
      name: "faqs",
      title: "FAQ",
      type: "array",
      group: "faq",
      description: "Shown at the end of the post and sent to Google as FAQ rich results.",
      of: [
        defineArrayMember({
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",
      description: "Optional. Anything left empty falls back to the title, excerpt and cover image.",
      fields: [
        defineField({ name: "metaTitle", title: "Search title", type: "string", validation: (rule) => rule.max(60).warning("Google shows about 60 characters.") }),
        defineField({ name: "metaDescription", title: "Search description", type: "text", rows: 3, validation: (rule) => rule.max(160).warning("Google shows about 160 characters.") }),
        defineField({ name: "ogImage", title: "Social share image", type: "image", description: "Shown when the post is shared. 1200 × 630 works best.", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alt text", type: "string" })] }),
        defineField({ name: "noIndex", title: "Hide from search engines", type: "boolean", initialValue: false }),
      ],
    }),
  ],
  orderings: [{ title: "Newest first", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", media: "coverImage", date: "publishedAt", author: "author.name" },
    prepare: ({ title, media, date, author }) => ({
      title,
      media,
      subtitle: [date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date", author].filter(Boolean).join(" · "),
    }),
  },
});
