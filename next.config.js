/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // CHANGED: Disable SWC minify to avoid android-arm64 issues
  swcMinify: false,

  // ============================================
  // CRITICAL: Enable standalone output for Docker
  // ============================================
  output: 'standalone',

  // ============================================
  // Internationalization
  // ============================================
  i18n: {
    locales: ['en', 'ar', 'fr', 'es', 'de', 'it', 'ru', 'zh', 'ja', 'ko'],
    defaultLocale: 'en',
    localeDetection: false,
  },

  // ============================================
  // Images Configuration
  // ============================================
  images: {
    domains: [
      'localhost',
      'vatravel.com',
      'res.cloudinary.com',
      's3.amazonaws.com',
      'images.unsplash.com',
      'api.dicebear.com',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ============================================
  // Security Headers
  // ============================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // ============================================
  // Redirects
  // ============================================
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ============================================
  // Webpack Configuration
  // ============================================
  webpack: (config, { isServer }) => {
    // SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Production optimizations
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    return config;
  },

  // ============================================
  // Experimental Features
  // ============================================
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizeCss: true,
    scrollRestoration: true,
  },

  // ============================================
  // Compiler Options
  // ============================================
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info'],
    } : false,
  },

  // ============================================
  // Environment Variables (Public)
  // ============================================
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },

  // ============================================
  // Build Configuration
  // ============================================
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  // ============================================
  // Production Optimizations
  // ============================================
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
