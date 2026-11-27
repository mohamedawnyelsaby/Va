// next.config.mjs
//
// SECURITY FIXES IN THIS VERSION
// 1) Removed the global `Access-Control-Allow-Origin: *` (+ Methods/Headers)
//    that was applied to EVERY path. It overrode the origin allowlist in
//    src/middleware.ts and made the whole API cross-origin readable from any
//    website. CORS for /api/* is now handled only by middleware.ts.
// 2) Removed `X-Frame-Options: ALLOWALL` ("ALLOWALL" is not a valid value;
//    browsers ignore it). Framing by Pi Browser is controlled by the CSP
//    `frame-ancestors` directive below, which is the correct mechanism.
// 3) images.remotePatterns no longer allows every https host (`**`), which
//    turned /_next/image into an open image proxy. Only hosts the app really
//    uses are allowed.
// 4) Added standard security headers and disabled the X-Powered-By header.
//
// TYPE CHECKING:
// - typescript.ignoreBuildErrors is false: `next build` now fails on type
//   errors instead of shipping them. `tsc --noEmit` has been clean and CI's
//   full build has passed, so this should not block deploys; if a deploy
//   fails on a type error, fix the error rather than flipping this back.

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Display-only copy of the server's PI_PER_<CUR> conversion rates (how many Pi
// equal 1 unit of that currency). It is built from the very same env vars that
// src/lib/pricing.ts charges with, so the price a user SEES in Pi can never
// drift from the Pi amount they are charged. Rates are public numbers, not secrets.
const piRates = {};
for (const [key, value] of Object.entries(process.env)) {
  const m = /^PI_PER_([A-Z]{3})$/.exec(key);
  const rate = Number(value);
  if (m && Number.isFinite(rate) && rate > 0) {piRates[m[1]] = rate;}
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PI_RATES: JSON.stringify(piRates),
  },

  reactStrictMode: true,
  poweredByHeader: false,
  // Required for Docker/Railway: the Dockerfile copies .next/standalone and
  // runs `node server.js` from it. Without this, `next build` never
  // produces that directory and the Docker image build fails at the COPY
  // step. Vercel deployments are unaffected either way (Vercel ignores
  // `output` and uses its own build output).
  output: 'standalone',

  experimental: {
    scrollRestoration: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      // Seed data + static content
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Booking.com photos returned by the RapidAPI hotel search
      { protocol: 'https', hostname: 'cf.bstatic.com' },
      // Cloudinary uploads
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Google account avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Pi Network assets
      { protocol: 'https', hostname: 'app-cdn.minepi.com' },
    ],
  },

  outputFileTracingRoot: path.join(__dirname, './'),

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Allow the app to be embedded only by itself and Pi Browser.
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors 'self' https://*.minepi.com https://app-cdn.minepi.com",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000',
          },
        ],
      },
    ];
  },

  // Support for both Turbopack and Webpack
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };

    // Known, harmless build noise (the app behaves the same with or without it):
    //  - stellar-sdk -> sodium-native -> require-addon use a dynamic require() for an
    //    OPTIONAL native speed-up; when it is missing they fall back to pure JS.
    //  - src/lib/monitoring/sentry.ts imports @sentry/nextjs on purpose only when
    //    NEXT_PUBLIC_SENTRY_DSN is set. REMOVE this entry when @sentry/nextjs is installed.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules[\\/](require-addon|sodium-native)[\\/]/ },
      { module: /src[\\/]lib[\\/]monitoring[\\/]sentry\.ts/, message: /Can't resolve '@sentry\/nextjs'/ },
    ];
    return config;
  },
};

export default nextConfig;
