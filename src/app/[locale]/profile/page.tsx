'use client';
// PATH: src/app/[locale]/profile/page.tsx

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './page.module.css';

interface Props {
  params: { locale: string };
}

const isAr = (locale: string) => locale === 'ar';

export default function ProfilePage({ params: { locale } }: Props) {
  const ar = isAr(locale);
  const { data: session, status } = useSession();
  const authenticated = status === 'authenticated' && !!session?.user;

  const menu = [
    { icon: '🗓️', label: ar ? 'حجوزاتي' : 'My Bookings', href: `/${locale}/bookings` },
    { icon: '💳', label: ar ? 'وسائل الدفع والمحفظة' : 'Payments & Wallet', href: `/${locale}/wallet` },
    { icon: '⚙️', label: ar ? 'الإعدادات' : 'Settings', href: `/${locale}/settings` },
    { icon: '❤️', label: ar ? 'الأماكن المحفوظة' : 'Saved Places', href: `/${locale}/favorites` },
  ];

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>
      <div className={styles.sh}>
        <div className={styles.st}>👤 {ar ? 'الملف الشخصي' : 'Profile'}</div>
      </div>

      <div className="prof-card">
        <div className="prof-ava">{authenticated ? '🧑' : '👤'}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700 }}>
          {authenticated ? (session?.user?.name || session?.user?.email) : (ar ? 'مسافر ضيف' : 'Guest Traveler')}
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--tm)', marginTop: 2 }}>
          {authenticated
            ? (ar ? 'مرحباً بعودتك' : 'Welcome back')
            : (ar ? 'سجّل دخولك لتفعيل كل المميزات' : 'Sign in to unlock all features')}
        </div>
        {authenticated ? (
          <button
            className="sbtn"
            style={{ marginTop: 14, padding: 12 }}
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
          >
            <span className="sbtn-txt">{ar ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        ) : (
          <Link href={`/${locale}/auth/signin`} style={{ textDecoration: 'none' }}>
            <button className="sbtn" style={{ marginTop: 14, padding: 12, width: '100%' }}>
              <span className="sbtn-txt">{ar ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}</span>
            </button>
          </Link>
        )}
      </div>

      {authenticated && (
        <div className="loy-card">
          <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'rgba(201,162,39,.7)', letterSpacing: '.09em', textTransform: 'uppercase' }}>
            Va Travel · {ar ? 'الولاء' : 'Loyalty'}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--g)', margin: '3px 0' }}>
            ✦ {ar ? 'عضو ذهبي' : 'Gold Member'}
          </div>
          <div className="loy-pts">
            0 <span style={{ fontSize: '.78rem', fontWeight: 400, color: 'var(--td)' }}>{ar ? 'نقطة' : 'points'}</span>
          </div>
          <div className="loy-bar-t"><div className="loy-bar-f" style={{ width: '0%' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.61rem', color: 'var(--tm)' }}>
            <span>{ar ? 'ابدأ الحجز لكسب النقاط' : 'Book to start earning points'}</span>
          </div>
        </div>
      )}

      <div className="menu-card">
        {menu.map(m => (
          <Link key={m.href} href={m.href} className="mitem" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="mico">{m.icon}</div>
            <div style={{ flex: 1, fontSize: '.83rem', fontWeight: 600 }}>{m.label}</div>
            <span style={{ color: 'var(--tm)' }}>›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
