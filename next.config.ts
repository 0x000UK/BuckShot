import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
        incomingRequests: true,
    },
    allowedDevOrigins: ['10.205.7.213', 'http://10.205.7.213:3000'],
};

export default nextConfig;
