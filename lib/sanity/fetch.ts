import "server-only";
import { SANITY_TAG, isSanityConfigured, sanityApiVersion, sanityDataset, sanityProjectId } from "./config";

type Params = Record<string, string | number | boolean | string[]>;

/**
 * Runs a GROQ query against the published dataset. It uses the live API rather than Sanity's CDN: Next caches the result,
 * so request volume stays low, and the live API never serves a version older than the publish that triggered the webhook.
 * Results are cached by Next and tagged, so the publish webhook (app/api/sanity/revalidate) refreshes them instantly;
 * the hourly revalidate is only a safety net in case a webhook is missed.
 * Returns `fallback` when Sanity is not configured or unreachable, so the rest of the site keeps working.
 */
export async function sanityFetch<T>({ query, params = {}, tags = [], fallback }: { query: string; params?: Params; tags?: string[]; fallback: T }): Promise<T> {
  if (!isSanityConfigured()) return fallback;

  const search = new URLSearchParams({ query, perspective: "published" });
  for (const [key, value] of Object.entries(params)) search.set(`$${key}`, JSON.stringify(value));
  const url = `https://${sanityProjectId}.api.sanity.io/v${sanityApiVersion}/data/query/${sanityDataset}?${search}`;

  try {
    // In development there is no webhook to clear the cache, so always read fresh content; edits show on refresh.
    const response = await fetch(url, process.env.NODE_ENV === "development" ? { cache: "no-store" } : { next: { revalidate: 3600, tags: [SANITY_TAG, ...tags] } });
    if (!response.ok) {
      console.error(`[sanity] query failed with ${response.status}: ${await response.text()}`);
      return fallback;
    }
    const body = (await response.json()) as { result: T | null };
    return body.result ?? fallback;
  } catch (error) {
    console.error("[sanity] query failed", error);
    return fallback;
  }
}
