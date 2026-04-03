// PATH: src/app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const isRTL = locale === 'ar';

  return (
    <div
      className="flex min-h-screen flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={locale}
      style={{
        fontFamily: isRTL
          ? 'var(--font-cairo), system-ui, sans-serif'
          : 'var(--font-dm-sans), system-ui, sans-serif',
      }}
    >
      <Navbar locale={locale} session={session} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
