import type { Metadata } from "next";
import { StorefrontProvider } from "@/components/storefront-provider";
import { SiteFooter, SiteHeader } from "@/components/chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Wipelo — Functional Wet Wipes™", template: "%s | Wipelo" },
  description: "Functional Wet Wipes™ — engineered actives, body-skin care, and individually sealed wipes. Skin is skin. Everywhere.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en">
    <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" /></head>
    <body suppressHydrationWarning><StorefrontProvider><SiteHeader /><main>{children}</main><SiteFooter /></StorefrontProvider></body>
  </html>;
}
