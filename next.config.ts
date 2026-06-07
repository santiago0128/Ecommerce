import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mssql', 'tedious'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
