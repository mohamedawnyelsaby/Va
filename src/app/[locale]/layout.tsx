// PATH: src/app/[locale]/layout.tsx
// UPDATED: Added world-class BottomNav for mobile app experience
// FIXED: RTL only for Arabic, strict LTR everywhere else
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/BottomNav';

const locales    = ['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ru'];
const rtlLocales = ['ar'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const isRTL = rtlLocales.includes(locale);

  return (
    <div
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        direction:  isRTL ? 'rtl' : 'ltr',
        fontFamily: isRTL
          ? 'var(--font-cairo), system-ui, sans-serif'
          : 'var(--font-dm-sans), system-ui, sans-serif',
        minHeight:  '100vh',
        textAlign:  isRTL ? 'right' : 'left',
      }}
    >
      <Navbar locale={locale} isRTL={isRTL} />
      <main style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        {children}
      </main>
      {/* Desktop footer — hidden on mobile (BottomNav replaces it) */}
      <div className="vg-desktop-footer">
        <Footer locale={locale} isRTL={isRTL} />
      </div>
      {/* Mobile bottom navigation — app-like experience */}
      <BottomNav locale={locale} />
    </div>
  );
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
