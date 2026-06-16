import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async rewrites() {
    return [
      // Proxy Clerk JS/UI bundles via jsDelivr (avoids cdn.clerk.io block)
      {
        source: "/__clerk/npm/:path*",
        destination: "https://cdn.jsdelivr.net/npm/:path*",
      },
      // Proxy Clerk API calls to the real Clerk Frontend API
      {
        source: "/__clerk/:path*",
        destination: "https://clerk.smartlease-ai-phi.vercel.app/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
