import type { Metadata } from "next";
import { StorefrontProvider } from "@/components/storefront-provider";
import { SiteHeader } from "@/components/chrome";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Wipelo | Personal Care Wipes for Body & Intimate Care", template: "%s | Wipelo" },
  description: "Explore ON THE GO body wipes, SPOTLESS body breakout care, and HER fragrance-free wipes for external intimate use. Individually wrapped for life on the move.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en">
    <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,600&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" /><noscript><style>{"[data-motion]{opacity:1!important;transform:none!important}"}</style></noscript></head>
    <body suppressHydrationWarning><MotionProvider><StorefrontProvider><SiteHeader /><main>{children}</main>
    <SiteFooter />
    </StorefrontProvider></MotionProvider></body>
  </html>;
}
