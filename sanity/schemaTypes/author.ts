import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Role", type: "string", description: "For example: Formulation lead, or Board-certified dermatologist." }),
    defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", title: "Short bio", type: "text", rows: 3, description: "Shown at the end of each post by this author.", validation: (rule) => rule.max(320) }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "image" } },
});
