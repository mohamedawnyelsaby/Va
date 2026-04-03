// PATH: src/components/layout/navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu, X, Search, Globe,
  User, Settings, LogOut, Calendar, Heart,
  Hotel, Map, UtensilsCrossed, Building2, Sparkles,
} from 'lucide-react';

interface NavbarProps {
  locale: string;
  session: any;
}

const languages = [
  { code: 'en', name: 'English',   flag: '🇬🇧' },
  { code: 'ar', name: 'العربية',  flag: '🇸🇦' },
  { code: 'fr', name: 'Français',  flag: '🇫🇷' },
  { code: 'es', name: 'Español',   flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch',   flag: '🇩🇪' },
  { code: 'zh', name: '中文',      flag: '🇨🇳' },
  { code: 'ja', name: '日本語',    flag: '🇯🇵' },
  { code: 'ru', name: 'Русский',   flag: '🇷🇺' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'hi', name: 'हिंदी',    flag: '🇮🇳' },
];

export function Navbar({ locale, session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const nav = [
    { name: 'Hotels',       href: `/${locale}/hotels`,      icon: Hotel },
    { name: 'Attractions',  href: `/${locale}/attractions`, icon: Map },
    { name: 'Restaurants',  href: `/${locale}/restaurants`, icon: UtensilsCrossed },
    { name: 'Cities',       href: `/${locale}/cities`,      icon: Building2 },
    { name: 'AI Concierge', href: `/${locale}/ai`,          icon: Sparkles },
  ];

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <nav
      className="vg-nav"
      style={{
        background: scrolled
          ? 'var(--vg-nav-bg)'
          : 'transparent',
        borderBottom: scrolled
          ? '0.5px solid var(--vg-nav-border)'
          : 'none',
        transition: 'background 0.4s, border-color 0.4s',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '1.5rem',
                fontWeight: 300,
                letterSpacing: '0.2em',
                color: 'var(--vg-text)',
              }}
            >
              <span style={{ color: 'var(--vg-gold)' }}>Va</span>
              {' '}Travel
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {nav.map(item => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontSize: '0.55rem',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  color: 'var(--vg-text-3)',
                  textDecoration: 'none',
                  transition: 'color 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--vg-gold)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--vg-text-3)')}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Pi badge */}
            <div className="vg-badge-outline hidden sm:flex">
              <span className="dot" />
              Pi Network
            </div>

            {/* Search */}
            <Link href={`/${locale}/search`}>
              <button
                style={{
                  width: 32, height: 32,
                  border: '0.5px solid var(--vg-border-2)',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Search style={{ width: 14, height: 14, color: 'var(--vg-text-2)' }} />
              </button>
            </Link>

            {/* Theme toggle */}
            <ThemeToggle size="sm" />

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="hidden sm:flex items-center gap-1"
                  style={{
                    height: 32, padding: '0 10px',
                    border: '0.5px solid var(--vg-border-2)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'var(--vg-text-2)',
                  }}
                >
                  <Globe style={{ width: 12, height: 12 }} />
                  <span>{currentLang.flag}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                style={{
                  background: 'var(--vg-bg-card)',
                  border: '0.5px solid var(--vg-border-2)',
                }}
              >
                <DropdownMenuLabel style={{ color: 'var(--vg-text-3)', fontSize: 11 }}>
                  Select Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator style={{ background: 'var(--vg-border)' }} />
                {languages.map(lang => (
                  <DropdownMenuItem key={lang.code} asChild>
                    <Link
                      href={`/${lang.code}`}
                      style={{ color: 'var(--vg-text-2)', fontSize: 13 }}
                    >
                      {lang.flag} {lang.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Avatar style={{ width: 32, height: 32, outline: '1px solid var(--vg-gold-border)', outlineOffset: 1 }}>
                      <AvatarImage src={session.user.image} />
                      <AvatarFallback
                        style={{ background: 'var(--vg-gold)', color: 'var(--vg-bg)', fontSize: 12 }}
                      >
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  style={{
                    width: 200,
                    background: 'var(--vg-bg-card)',
                    border: '0.5px solid var(--vg-border-2)',
                  }}
                >
                  <DropdownMenuLabel>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--vg-text)', margin: 0 }}>
                      {session.user.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--vg-text-3)', margin: 0 }}>
                      {session.user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ background: 'var(--vg-border)' }} />
                  {[
                    { href: `/${locale}/dashboard`, icon: User,     label: 'Dashboard' },
                    { href: `/${locale}/bookings`,  icon: Calendar, label: 'My Bookings' },
                    { href: `/${locale}/favorites`, icon: Heart,    label: 'Favorites' },
                    { href: `/${locale}/settings`,  icon: Settings, label: 'Settings' },
                  ].map(item => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={item.href} style={{ color: 'var(--vg-text-2)', fontSize: 13 }}>
                        <item.icon style={{ width: 14, height: 14, marginRight: 8 }} />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator style={{ background: 'var(--vg-border)' }} />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: `/${locale}` })}
                    style={{ color: '#E24B4A', fontSize: 13 }}
                  >
                    <LogOut style={{ width: 14, height: 14, marginRight: 8 }} />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href={`/${locale}/auth/signin`}>
                  <button
                    style={{
                      height: 32, padding: '0 14px',
                      border: '0.5px solid var(--vg-border-2)',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--vg-text-2)',
                      fontFamily: 'var(--font-space-mono), monospace',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Sign in
                  </button>
                </Link>
                <Link href={`/${locale}/auth/signup`}>
                  <button className="vg-btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.55rem' }}>
                    Get started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(v => !v)}
              style={{
                width: 32, height: 32,
                border: '0.5px solid var(--vg-border-2)',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileOpen
                ? <X style={{ width: 15, height: 15, color: 'var(--vg-text-2)' }} />
                : <Menu style={{ width: 15, height: 15, color: 'var(--vg-text-2)' }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: '0.5px solid var(--vg-border)', padding: '1rem 0' }}>
            <div className="flex flex-col gap-4">
              {nav.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-space-mono), monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: 'var(--vg-text-2)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon style={{ width: 14, height: 14 }} />
                  {item.name}
                </Link>
              ))}
              <div style={{ height: '0.5px', background: 'var(--vg-border)' }} />
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 12, color: 'var(--vg-text-3)' }}>Theme</span>
                <ThemeToggle size="sm" />
              </div>
              {!session?.user && (
                <div className="flex flex-col gap-2">
                  <Link href={`/${locale}/auth/signin`} onClick={() => setMobileOpen(false)}>
                    <button style={{
                      width: '100%', height: 36,
                      border: '0.5px solid var(--vg-border-2)',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--vg-text-2)',
                    }}>
                      Sign in
                    </button>
                  </Link>
                  <Link href={`/${locale}/auth/signup`} onClick={() => setMobileOpen(false)}>
                    <button className="vg-btn-primary" style={{ width: '100%', padding: '0.7rem', fontSize: '0.6rem' }}>
                      Get started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
