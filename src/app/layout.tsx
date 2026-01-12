import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin']
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Va Travel - Global Travel & Booking Platform',
    template: '%s | Va Travel',
  },
  description: 'AI-powered global travel platform for hotel bookings, tourist attractions, and local services worldwide with Pi Network integration.',
  keywords: [
    'travel',
    'booking',
    'hotels',
    'attractions',
    'restaurants',
    'pi network',
    'cryptocurrency',
    'ai travel',
    'global travel',
    'multilingual',
  ],
  authors: [{ name: 'Va Travel Team' }],
  creator: 'Va Travel',
  publisher: 'Va Travel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('va.up.railway.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'ar': '/ar',
      'fr': '/fr',
      'es': '/es',
      'de': '/de',
      'zh': '/zh',
      'ja': '/ja',
      'ru': '/ru',
      'pt': '/pt',
      'hi': '/hi',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'va.up.railway.app',
    title: 'Va Travel - Global Travel & Booking Platform',
    description: 'AI-powered global travel platform for hotel bookings, tourist attractions, and local services worldwide with Pi Network integration.',
    siteName: 'Va Travel',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Va Travel - Global Travel Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Va Travel - Global Travel & Booking Platform',
    description: 'AI-powered global travel platform for hotel bookings, tourist attractions, and local services worldwide with Pi Network integration.',
    images: ['/twitter-image.png'],
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
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  category: 'travel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
