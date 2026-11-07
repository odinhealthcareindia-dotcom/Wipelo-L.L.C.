import type { ReactNode } from "react";
import { StorefrontProvider } from "@/components/storefront-provider";
import { SiteHeader } from "@/components/chrome";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/motion/motion-provider";

/** Everything a storefront page sits inside: cart and motion context, header and footer. The Studio at /studio does not use it. */
export function SiteShell({ children }: { children: ReactNode }) {
  return <MotionProvider><StorefrontProvider><SiteHeader /><main>{children}</main>
    <SiteFooter />
  </StorefrontProvider></MotionProvider>;
}
