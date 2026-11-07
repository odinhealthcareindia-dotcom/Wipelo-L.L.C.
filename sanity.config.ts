"use client";

/**
 * Sanity Studio embedded in the website at /studio (see app/studio/[[...tool]]/page.tsx).
 * Editors sign in with their sanity.io account; only members of the Wipelo project can see or change content.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./lib/sanity/config";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Wipelo",
  basePath: "/studio",
  projectId: sanityProjectId,
  dataset: sanityDataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool(),
    // Vision is a GROQ query playground, useful while developing; hidden on the live site.
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: sanityApiVersion })] : []),
  ],
});
