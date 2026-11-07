import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "URL", type: "slug", options: { source: "title", maxLength: 64 }, description: "wipelo.com/blog/category/<this>", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2, description: "Shown at the top of the category page." }),
  ],
});
