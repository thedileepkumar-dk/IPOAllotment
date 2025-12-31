/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    output: 'standalone', // Optimized for production
    eslint: {
        ignoreDuringBuilds: true, // Saves memory during build
    },
    typescript: {
        ignoreBuildErrors: true, // Saves memory during build
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;
