import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      /*Accept all links */
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
