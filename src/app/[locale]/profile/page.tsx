'use client';
// PATH: src/app/[locale]/profile/page.tsx

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './page.module.css';
import { t } from '@/lib/i18n/translations';

interface Props {
  params: { locale: string };
}

const isAr = (locale: string) => locale === 'ar';

export default function ProfilePage({ params: { locale } }: Props) {
  const ar = isAr(locale);
  const tr = t(locale);
  const p = tr.profile;
  const { data: session, status } = useSession();
  const authenticated = status === 'authenticated' && !!session?.user;

  const menu = [
    { icon: '🗓️', label: p.menuBookings, href: `/${locale}/bookings` },
    { icon: '💳', label: p.menuPayments, href: `/${locale}/wallet` },
    { icon: '⚙️', label: p.menuSettings, href: `/${locale}/settings` },
    { icon: '❤️', label: p.menuSaved, href: `/${locale}/favorites` },
  ];

  return (
    <main className={styles.main} dir={ar ? 'rtl' : 'ltr'}>
      <div className={styles.sh}>
        <div className={styles.st}>👤 {p.title}</div>
      </div>

      <div className="prof-card">
        <div className="prof-ava">{authenticated ? '🧑' : '👤'}</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700 }}>
          {authenticated ? (session?.user?.name || session?.user?.email) : p.guestName}
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--tm)', marginTop: 2 }}>
          {authenticated ? p.welcomeBack : p.signInPrompt}
        </div>
        {authenticated ? (
          <button
            className="sbtn"
            style={{ marginTop: 14, padding: 12 }}
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
          >
            <span className="sbtn-txt">{p.signOut}</span>
          </button>
        ) : (
          <Link href={`/${locale}/auth/signin`} style={{ textDecoration: 'none' }}>
            <button className="sbtn" style={{ marginTop: 14, padding: 12, width: '100%' }}>
              <span className="sbtn-txt">{p.signInRegister}</span>
            </button>
          </Link>
        )}
      </div>

      {authenticated && (
        <div className="loy-card">
          <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'rgba(201,162,39,.7)', letterSpacing: '.09em', textTransform: 'uppercase' }}>
            Va Travel · {p.loyalty}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--g)', margin: '3px 0' }}>
            ✦ {p.goldMember}
          </div>
          <div className="loy-pts">
            0 <span style={{ fontSize: '.78rem', fontWeight: 400, color: 'var(--td)' }}>{p.points}</span>
          </div>
          <div className="loy-bar-t"><div className="loy-bar-f" style={{ width: '0%' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.61rem', color: 'var(--tm)' }}>
            <span>{p.earnPoints}</span>
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
