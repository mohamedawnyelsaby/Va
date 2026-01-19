// src/app/[locale]/layout.tsx
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
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar locale={locale} session={session} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
