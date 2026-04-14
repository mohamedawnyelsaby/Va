// PATH: src/app/[locale]/layout.tsx
// FIXED: Explicit dir attribute on wrapper div — no more direction bleed
// FIXED: RTL only applies to Arabic locale, everything else is strictly LTR
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

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
        // Prevent text-align inheritance when switching locales
        textAlign:  isRTL ? 'right' : 'left',
      }}
    >
      <Navbar locale={locale} isRTL={isRTL} />
      <main style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        {children}
      </main>
      <Footer locale={locale} isRTL={isRTL} />
    </div>
  );
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
