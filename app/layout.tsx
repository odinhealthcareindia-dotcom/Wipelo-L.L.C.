import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Wipelo | Functional Wet Wipes for Body & Intimate Care", template: "%s | Wipelo" },
  description: "Explore ON THE GO body wipes, SPOTLESS body breakout care, and HER fragrance-free wipes for external intimate use. Individually wrapped for life on the move.",
};

// The bare document shared by the storefront and the Studio. Site CSS, header and footer live in app/(site)/layout.tsx,
// so the embedded Sanity Studio at /studio renders with its own styles only.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth">
    <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,600&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" /><noscript><style>{"[data-motion]{opacity:1!important;transform:none!important}"}</style></noscript></head>
    <body suppressHydrationWarning>{children}</body>
  </html>;
}
