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
    <html
      lang="en"
      dir="ltr"
      className={`${cormorant.variable} ${dmSans.variable} ${spaceMono.variable} ${cairo.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#C9A227" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('va-travel-theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();` }} />
      </head>
      <body suppressHydrationWarning>
        <div id="vg-cursor" aria-hidden="true" />
        <div id="vg-cursor-ring" aria-hidden="true" />
        <Providers>{children}</Providers>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
        <Script id="vg-cursor-js" strategy="afterInteractive">{`(function(){var d=document.getElementById('vg-cursor'),r=document.getElementById('vg-cursor-ring');if(!d||!r)return;var rx=0,ry=0,mx=0,my=0;document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;d.style.left=mx+'px';d.style.top=my+'px';});(function loop(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;r.style.left=rx+'px';r.style.top=ry+'px';requestAnimationFrame(loop);})();})();`}</Script>
      </body>
    </html>
  );
}
