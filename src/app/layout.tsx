// PATH: src/app/layout.tsx
// Theme is now fully automatic via CSS (prefers-color-scheme) — no inline
// theme script, no localStorage, no manual .dark class toggling needed.
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import './legacy-tokens.css';
import './vg.css';
import './responsive.css';
import { Providers } from '@/components/providers';
import GoldenCursorTrail from '@/components/ui/GoldenCursorTrail';
import SafeAreaFix from '@/components/layout/SafeAreaFix';

// Fonts ship WITH the app (src/fonts, from the open-source @fontsource packages: SIL OFL)
// instead of being downloaded from Google while building. Vercel's builds were failing
// at random with "next/font ... Cannot read properties of null" whenever Google's font
// service answered badly. Same families, weights and CSS variables as before.
const cormorant = localFont({
  src: [
    { path: '../fonts/cormorant-garamond-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/cormorant-garamond-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cormorant-garamond-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/cormorant-garamond-latin-300-italic.woff2', weight: '300', style: 'italic' },
    { path: '../fonts/cormorant-garamond-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/cormorant-garamond-latin-600-italic.woff2', weight: '600', style: 'italic' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
});
const dmSans = localFont({
  src: [
    { path: '../fonts/dm-sans-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/dm-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/dm-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
});
const spaceMono = localFont({
  src: [
    { path: '../fonts/space-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/space-mono-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-space-mono',
  display: 'swap',
  preload: false,
});
// Cairo: one family per script; responsive.css chains them into --font-cairo
// (the browser picks the file that actually has the glyph).
const cairoLatin = localFont({
  src: [
    { path: '../fonts/cairo-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/cairo-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cairo-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/cairo-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-cairo-latin',
  display: 'swap',
  preload: false,
});
const cairoArabic = localFont({
  src: [
    { path: '../fonts/cairo-arabic-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/cairo-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cairo-arabic-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/cairo-arabic-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-cairo-arabic',
  display: 'swap',
  preload: false,
});

// Never let a malformed env value (e.g. a missing https://) break the build.
function siteUrl(): URL {
  const raw = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  try { return new URL(raw); } catch { return new URL('https://va-pied.vercel.app'); }
}

export const metadata: Metadata = {
  title: { default: 'Va Travel — Beyond Every Horizon', template: '%s | Va Travel' },
  description: 'AI-powered luxury travel platform with Pi Network payments.',
  // Each deployment (Testnet / Mainnet) advertises its own address in link previews.
  metadataBase: siteUrl(),
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
  // Lets the page use the full screen and read the safe-area insets (notches, and the
  // Android buttons that Pi Browser draws over the page) so the bottom bar is never hidden.
  viewportFit: 'cover',
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
      className={`${cormorant.variable} ${dmSans.variable} ${spaceMono.variable} ${cairoLatin.variable} ${cairoArabic.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <SafeAreaFix />
        <GoldenCursorTrail />
        <Providers>{children}</Providers>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
