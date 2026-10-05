import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/": ["./content/home-body.html"],
    "/science": ["./content/home-body.html"],
    "/our-story": ["./content/home-body.html"],
    "/manage-subscription": ["./content/home-body.html"],
  },
};

export default nextConfig;
