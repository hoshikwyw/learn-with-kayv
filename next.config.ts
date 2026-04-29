import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow up to 6MB in server-action POST bodies (default is 1MB).
      // Avatar uploads are capped at 2MB and course images at 5MB.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Allow Supabase Storage public URLs through next/image
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Google avatar URLs (default for OAuth users until they upload one)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
