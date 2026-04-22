/* ============================================================
   PATH: components/BottomNav.tsx
   ============================================================ */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

interface BottomNavProps {
  locale?: string;
}

export default function BottomNav({ locale = 'en' }: BottomNavProps) {
  const pathname = usePathname();

  const isAr = locale === 'ar';

  const items = [
    {
      href: `/${locale}`,
      label: isAr ? 'الرئيسية' : 'Home',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          {!active && <polyline points="9 22 9 12 15 12 15 22"/>}
        </svg>
      ),
    },
    {
      href: `/${locale}/hotels`,
      label: isAr ? 'فنادق' : 'Hotels',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 22V12h6v10M3 9h18"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/ai`,
      label: 'AI',
      icon: (_active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
          <circle cx="9" cy="13" r="1" fill="currentColor"/>
          <circle cx="15" cy="13" r="1" fill="currentColor"/>
        </svg>
      ),
      isAI: true,
    },
    {
      href: `/${locale}/bookings`,
      label: isAr ? 'حجوزات' : 'Bookings',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
          {!active && <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>}
        </svg>
      ),
    },
    {
      href: `/${locale}/profile`,
      label: isAr ? 'حسابي' : 'Profile',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {items.map((item) => {
          const isActive = item.isAI
            ? pathname.includes('/ai')
            : pathname === item.href;

          if (item.isAI) {
            return (
              <Link key={item.href} href={item.href} className={styles.aiLink}>
                <span className={styles.aiBubble}>
                  {item.icon(true)}
                </span>
                <span className={`${styles.label} ${styles.aiLabel}`}>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.iconWrap}>
                {item.icon(isActive)}
                {isActive && <span className={styles.dot} />}
              </span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
