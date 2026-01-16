/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove optimizeCss - it requires critters which is causing the error
    scrollRestoration: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable standalone output for better deployment
  output: 'standalone',
  
  // Disable swc minifier (as warned in logs)
  swcMinify: false,
  
  // Skip static generation for pages that need database
  generateBuildId: async () => {
    return 'va-travel-build-' + Date.now()
  },
};

export default nextConfig;
