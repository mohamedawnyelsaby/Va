// PATH: src/app/layout.tsx
// Theme is now fully automatic via CSS (prefers-color-scheme) — no inline
// theme script, no localStorage, no manual .dark class toggling needed.
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans, Space_Mono, Cairo } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/providers';
import GoldenCursorTrail from '@/components/ui/GoldenCursorTrail';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Va Travel — Beyond Every Horizon', template: '%s | Va Travel' },
  description: 'AI-powered luxury travel platform with Pi Network payments.',
  metadataBase: new URL('https://va-pied.vercel.app'),
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#C9A227' },
    { media: '(prefers-color-scheme: dark)', color: '#C9A227' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${cormorant.variable} ${dmSans.variable} ${spaceMono.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <GoldenCursorTrail />
        <Providers>{children}</Providers>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
