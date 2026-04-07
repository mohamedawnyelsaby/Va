// PATH: src/app/[locale]/layout.tsx
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const locales = ['en', 'ar', 'fr', 'es', 'de', 'zh', 'ja', 'ru'];
const rtlLocales = ['ar'];

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!locales.includes(locale)) notFound();
  const isRTL = rtlLocales.includes(locale);

  return (
    <div
      lang={locale}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        direction: isRTL ? 'rtl' : 'ltr',
        fontFamily: isRTL ? 'var(--font-cairo), system-ui, sans-serif' : undefined,
        minHeight: '100vh',
      }}
    >
      <Navbar locale={locale} isRTL={isRTL} />
      <main>{children}</main>
      <Footer locale={locale} isRTL={isRTL} />
    </div>
  );
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
