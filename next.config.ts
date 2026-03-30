import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable React 19 + Server Components features
    serverComponentsExternalPackages: ["postgres"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Inngest requires this to handle long-running functions
  async headers() {
    return [
      {
        source: "/api/webhooks/inngest",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
