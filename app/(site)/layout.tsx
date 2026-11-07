import { SiteShell } from "@/components/site-shell";
import "../globals.css";

// Every storefront page lives in this (site) group. The group name is not part of the URL.
// The Sanity Studio (app/studio) sits outside it so the site's global CSS and chrome never touch the Studio UI.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
