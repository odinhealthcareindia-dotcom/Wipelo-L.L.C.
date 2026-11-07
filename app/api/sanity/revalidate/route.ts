import { revalidateTag } from "next/cache";
import { SIGNATURE_HEADER_NAME, isValidSignature } from "@sanity/webhook";
import { SANITY_TAG } from "@/lib/sanity/config";

/**
 * Sanity calls this when a post, author or category is published, changed or deleted.
 * The request is signed with SANITY_REVALIDATE_SECRET, so nobody else can flush the cache.
 * The blog is small, so one tag refreshes every Sanity-backed page at once.
 */
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });

  const body = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME) ?? "";
  if (!(await isValidSignature(body, signature, secret))) return Response.json({ message: "Invalid signature" }, { status: 401 });

  // expire: 0 so an editor who publishes and reloads sees the new version straight away, not one stale render first.
  revalidateTag(SANITY_TAG, { expire: 0 });
  return Response.json({ revalidated: true, now: Date.now() });
}
