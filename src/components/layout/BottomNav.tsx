'use client';
// PATH: src/components/layout/BottomNav.tsx
// Six-tab mobile bottom navigation matching the reference design
// (Home / Explore / Plan / AI / Saved / Me). Uses the shared `.bnav` /
// `.bni` / `.bico` / `.bni-dot` classes from src/app/globals.css.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, Home, Plane, Sparkles, User, type LucideIcon } from 'lucide-react';
import { t } from '@/lib/i18n/translations';

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const tr = t(locale);

  // Vector icons instead of emoji: emoji are drawn by each phone maker's font,
  // so the bar looked different on every device and could not take the
  // active-tab colour. These inherit the tab colour (gold when active).
  const items: Array<{ href: string; label: string; Icon: LucideIcon; dot?: boolean }> = [
    { href: `/${locale}`, label: tr.bottomNav.home, Icon: Home },
    { href: `/${locale}/cities`, label: tr.bottomNav.explore, Icon: Compass },
    { href: `/${locale}/search`, label: tr.bottomNav.plan, Icon: Plane },
    { href: `/${locale}/ai`, label: tr.bottomNav.ai, Icon: Sparkles, dot: true },
    { href: `/${locale}/favorites`, label: tr.bottomNav.saved, Icon: Heart },
    { href: `/${locale}/profile`, label: tr.bottomNav.me, Icon: User },
  ];

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="bnav" aria-label="Main navigation">
      {items.map(({ href, label, Icon, dot }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href} className={`bni${active ? ' on' : ''}`} aria-current={active ? 'page' : undefined}>
            <span className="bico" style={{ display: 'flex' }}>
              <Icon size={22} strokeWidth={active ? 2.2 : 1.7} aria-hidden fill={active && Icon === Heart ? 'currentColor' : 'none'} />
            </span>
            <span>{label}</span>
            {dot && <div className="bni-dot on" />}
          </Link>
        );
      })}
    </nav>
  );
}
