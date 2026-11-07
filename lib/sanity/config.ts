// Public Sanity project settings. These identify the project; they are not secrets.
export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
// Pin the API to a date so Sanity never changes query behaviour under us.
export const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-02-19";

export function isSanityConfigured() {
  return Boolean(sanityProjectId);
}

/** Every Sanity-backed page carries this cache tag; the publish webhook clears it. */
export const SANITY_TAG = "sanity";
