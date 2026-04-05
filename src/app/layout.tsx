// PATH: src/app/layout.tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, Space_Mono, Cairo } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/providers';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300','400','600'], style: ['normal','italic'], variable: '--font-cormorant', display: 'swap' });
const dmSans    = DM_Sans({ subsets: ['latin'], weight: ['300','400','500'], variable: '--font-dm-sans', display: 'swap' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-space-mono', display: 'swap' });
const cairo     = Cairo({ subsets: ['arabic','latin'], weight: ['300','400','500','600'], variable: '--font-cairo', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Va Travel — Beyond Every Horizon', template: '%s | Va Travel' },
  description: 'AI-powered luxury travel platform with Pi Network payments.',
  metadataBase: new URL('https://va-pied.vercel.app'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr"
      className={`${cormorant.variable} ${dmSans.variable} ${spaceMono.variable} ${cairo.variable}`}
      suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#C9A227" />
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
      </head>
      <body style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif', background: 'var(--vg-bg)', color: 'var(--vg-text)' }} suppressHydrationWarning>
        <div id="vg-cursor" aria-hidden="true" />
        <div id="vg-cursor-ring" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
