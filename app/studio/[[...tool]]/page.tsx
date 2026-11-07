import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

// The Studio is a single-page app that handles its own routing under /studio, so the shell is prerendered once.
export const dynamic = "force-static";

// noindex + same-origin referrer for the Studio, and the viewport it expects.
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
