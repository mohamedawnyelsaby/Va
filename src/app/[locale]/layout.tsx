// PATH: src/app/[locale]/layout.tsx
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
      data-locale={locale}
      style={{
        minHeight: '100vh',
        textAlign: isRTL ? 'right' : 'left',
      }}
    >
      <Navbar locale={locale} isRTL={isRTL} />
      <main>
        {children}
      </main>
      <div className="vg-desktop-footer">
        <Footer locale={locale} isRTL={isRTL} />
      </div>
      <BottomNav locale={locale} />
    </div>
  );
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
