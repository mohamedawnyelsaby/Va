'use client';
// PATH: src/components/layout/BottomNav.tsx
// Six-tab mobile bottom navigation matching the reference design
// (Home / Explore / Plan / AI / Saved / Me). Uses the shared `.bnav` /
// `.bni` / `.bico` / `.bni-dot` classes from src/app/globals.css.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { t } from '@/lib/i18n/translations';

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const tr = t(locale);

  const items = [
    { href: `/${locale}`, label: tr.bottomNav.home, icon: '🏠' },
    { href: `/${locale}/cities`, label: tr.bottomNav.explore, icon: '🗺️' },
    { href: `/${locale}/search`, label: tr.bottomNav.plan, icon: '✈️' },
    { href: `/${locale}/ai`, label: tr.bottomNav.ai, icon: '✨', dot: true },
    { href: `/${locale}/favorites`, label: tr.bottomNav.saved, icon: '❤️' },
    { href: `/${locale}/profile`, label: tr.bottomNav.me, icon: '👤' },
  ];

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="bnav" aria-label="Main navigation">
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`bni${isActive(item.href) ? ' on' : ''}`}
        >
          <span className="bico">{item.icon}</span>
          <span>{item.label}</span>
          {item.dot && <div className="bni-dot on" />}
        </Link>
      ))}
    </nav>
  );
}
