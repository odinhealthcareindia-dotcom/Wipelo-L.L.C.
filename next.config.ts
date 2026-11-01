import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The account browser tests run alongside a developer's own `next dev`, which holds a lock on the default directory.
  ...(process.env.NEXT_TEST_DIST_DIR ? { distDir: process.env.NEXT_TEST_DIST_DIR } : {}),
  // Customer-specific responses must never reach a shared cache.
  async headers() {
    return ["/account/:path*", "/api/auth/:path*", "/api/account/:path*", "/api/cart"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex" }, { key: "Referrer-Policy", value: "same-origin" }],
    }));
  },
  outputFileTracingIncludes: {
    "/": ["./content/home-body.html"],
    "/science": ["./content/home-body.html"],
    "/our-story": ["./content/home-body.html"],
    "/manage-subscription": ["./content/home-body.html"],
  },
};

export default nextConfig;
