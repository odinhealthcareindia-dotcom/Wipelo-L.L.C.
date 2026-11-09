import type { Viewport } from "next";
import { SiteShell } from "@/components/site-shell";
import "../globals.css";

// Every storefront page lives in this (site) group. The group name is not part of the URL.
// The Sanity Studio (app/studio) sits outside it so the site's global CSS and chrome never touch the Studio UI.
// viewport-fit=cover lets fixed bottom bars (e.g. the PDP buy bar) reach the real screen edge in iOS Safari
// instead of floating above the toolbar's reserved area; env(safe-area-inset-bottom) then pads past the home indicator.
// themeColor tints Chrome Android's address bar (and older Safari) to the cream header.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#FAF5EF" };

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
