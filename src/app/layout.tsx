// PATH: src/app/layout.tsx
import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  DM_Sans,
  Space_Mono,
  Cairo,
} from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/providers';

// ── Primary serif display font ──────────────────────────
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

// ── Body / UI sans-serif ─────────────────────────────────
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

// ── Monospace for labels / prices ────────────────────────
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

// ── Arabic support ───────────────────────────────────────
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Va Travel — Beyond Every Horizon',
    template: '%s | Va Travel',
  },
  description:
    'The first AI-native luxury travel platform powered by Pi Network. Book hotels, attractions, and restaurants worldwide.',
  keywords: [
    'travel',
    'booking',
    'hotels',
    'Pi Network',
    'AI travel',
    'luxury travel',
    'global travel',
  ],
  authors: [{ name: 'Va Travel' }],
  metadataBase: new URL('https://va-pied.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://va-pied.vercel.app',
    title: 'Va Travel — Beyond Every Horizon',
    description:
      'AI-powered luxury travel platform with Pi Network payments.',
    siteName: 'Va Travel',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Va Travel — Beyond Every Horizon',
    description:
      'AI-powered luxury travel platform with Pi Network payments.',
    creator: '@vatravel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'travel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${cormorant.variable} ${dmSans.variable} ${spaceMono.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#C9A227" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Pi Network SDK */}
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{
          fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
          background: 'var(--vg-bg)',
          color: 'var(--vg-text)',
        }}
        suppressHydrationWarning
      >
        {/* Custom cursor (desktop only) */}
        <div id="vg-cursor" aria-hidden="true" />
        <div id="vg-cursor-ring" aria-hidden="true" />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
