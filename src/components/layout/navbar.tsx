'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu, X, Search, Globe, User, Settings, LogOut,
  Calendar, Heart, Pi, Hotel, Map, UtensilsCrossed,
  Building2, Sparkles,
} from 'lucide-react';

interface NavbarProps { locale: string; session: any; }

const languages = [
  { code: 'en', name: 'English',   flag: '🇬🇧' },
  { code: 'ar', name: 'العربية',  flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español',  flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch',  flag: '🇩🇪' },
  { code: 'zh', name: '中文',     flag: '🇨🇳' },
  { code: 'ja', name: '日本語',   flag: '🇯🇵' },
  { code: 'ru', name: 'Русский',  flag: '🇷🇺' },
];

export function Navbar({ locale, session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { name: 'Hotels',       href: `/${locale}/hotels`,      icon: Hotel },
    { name: 'Attractions',  href: `/${locale}/attractions`, icon: Map },
    { name: 'Restaurants',  href: `/${locale}/restaurants`, icon: UtensilsCrossed },
    { name: 'Cities',       href: `/${locale}/cities`,      icon: Building2 },
    { name: 'AI Assistant', href: `/${locale}/ai`,          icon: Sparkles },
  ];

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  const btnBase: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9,
    border: '1px solid rgba(201,162,39,.18)',
    background: 'transparent', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .3s, background .3s',
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 600, padding: '1.4rem 1.8rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(3,2,10,.85)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(201,162,39,.07)',
    }}>
      {/* Logo */}
      <Link href={`/${locale}`} style={{
        fontFamily: 'Georgia, serif', fontSize: '1.6rem',
        fontWeight: 300, letterSpacing: '.2em', color: 'var(--t1)',
        textDecoration: 'none',
      }}>
        <b style={{ color: 'var(--gold)', fontWeight: 400 }}>Va</b> Travel
      </Link>

      {/* Desktop nav links */}
      <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}
          className="hidden md:flex">
        {nav.map(item => (
          <li key={item.name}>
            <Link
              href={item.href}
              style={{
                fontFamily: 'monospace', fontSize: '.5rem',
                letterSpacing: '.28em', textTransform: 'uppercase',
                color: 'rgba(242,238,230,.55)', textDecoration: 'none',
                transition: 'color .3s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(242,238,230,.55)'}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>

        {/* Live indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontFamily: 'monospace', fontSize: '.44rem', letterSpacing: '.18em',
          color: 'var(--green)',
        }}>
          <span className="live-dot" style={{
            width: 5, height: 5, background: 'var(--green)',
            borderRadius: '50%', display: 'inline-block',
          }} />
          LIVE
        </div>

        {/* Search */}
        <Link href={`/${locale}/search`}>
          <button style={btnBase}>
            <Search style={{ width: 15, height: 15, color: 'rgba(242,238,230,.55)' }} />
          </button>
        </Link>

        {/* Theme */}
        <ThemeToggle size="sm" />

        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button style={{ ...btnBase }} className="hidden sm:flex">
              <Globe style={{ width: 13, height: 13, color: 'rgba(242,238,230,.55)' }} />
              <span style={{ marginLeft: 4, fontSize: 12 }}>{currentLang.flag}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ background: 'rgba(10,8,20,.96)', border: '1px solid rgba(201,162,39,.18)', borderRadius: 8 }}>
            <DropdownMenuLabel style={{ color: 'rgba(242,238,230,.3)', fontSize: 11 }}>Language</DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: 'rgba(201,162,39,.1)' }} />
            {languages.map(lang => (
              <DropdownMenuItem key={lang.code} asChild>
                <Link href={`/${lang.code}`} style={{ color: 'rgba(242,238,230,.55)', fontSize: 13, display: 'flex', gap: 8 }}>
                  {lang.flag} {lang.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User or auth buttons */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Avatar style={{ width: 34, height: 34, outline: '2px solid var(--gold)', outlineOffset: 1 }}>
                  <AvatarImage src={session.user.image} />
                  <AvatarFallback style={{ background: 'var(--gold)', color: 'var(--void)', fontSize: 12, fontWeight: 600 }}>
                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ width: 220, background: 'rgba(10,8,20,.96)', border: '1px solid rgba(201,162,39,.18)', borderRadius: 8 }}>
              <DropdownMenuLabel>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', margin: 0 }}>{session.user.name}</p>
                <p style={{ fontSize: 11, color: 'var(--t3)', margin: 0 }}>{session.user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: 'rgba(201,162,39,.1)' }} />
              {[
                { href: `/${locale}/dashboard`, icon: User,     label: 'Dashboard' },
                { href: `/${locale}/bookings`,  icon: Calendar, label: 'My Bookings' },
                { href: `/${locale}/favorites`, icon: Heart,    label: 'Favorites' },
                { href: `/${locale}/settings`,  icon: Settings, label: 'Settings' },
              ].map(item => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link href={item.href} style={{ color: 'rgba(242,238,230,.55)', fontSize: 13 }}>
                    <item.icon style={{ width: 14, height: 14, marginRight: 8 }} />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator style={{ background: 'rgba(201,162,39,.1)' }} />
              <DropdownMenuItem style={{ background: 'rgba(201,162,39,.06)' }}>
                <Pi style={{ width: 14, height: 14, marginRight: 8, color: 'var(--gold)' }} />
                <span style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 13 }}>
                  π {session.user.piBalance?.toFixed(2) || '0.00'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: 'rgba(201,162,39,.1)' }} />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${locale}` })} style={{ color: '#E24B4A', fontSize: 13 }}>
                <LogOut style={{ width: 14, height: 14, marginRight: 8 }} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden sm:flex" style={{ gap: '.5rem', display: 'flex' }}>
            <Link href={`/${locale}/auth/signin`}>
              <button style={{
                height: 34, padding: '0 14px', borderRadius: 9,
                border: '1px solid rgba(201,162,39,.3)',
                background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, color: 'rgba(242,238,230,.55)',
              }}>Sign in</button>
            </Link>
            <Link href={`/${locale}/auth/signup`}>
              <button style={{
                height: 34, padding: '0 14px', borderRadius: 9,
                background: 'var(--gold)', border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--void)',
              }}>Get started</button>
            </Link>
          </div>
        )}

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(v => !v)}
          style={btnBase}
        >
          {mobileOpen
            ? <X style={{ width: 16, height: 16, color: 'rgba(242,238,230,.55)' }} />
            : <Menu style={{ width: 16, height: 16, color: 'rgba(242,238,230,.55)' }} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(3,2,10,.97)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(201,162,39,.1)',
          padding: '1rem 1.8rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          {nav.map(item => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'monospace', fontSize: '.54rem',
                letterSpacing: '.22em', textTransform: 'uppercase',
                color: 'rgba(242,238,230,.55)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '.7rem',
              }}
            >
              <item.icon style={{ width: 15, height: 15 }} />
              {item.name}
            </Link>
          ))}
          <div style={{ height: 1, background: 'rgba(201,162,39,.1)' }} />
          {!session?.user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <Link href={`/${locale}/auth/signin`} onClick={() => setMobileOpen(false)}>
                <button style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid rgba(201,162,39,.3)', background: 'transparent', color: 'rgba(242,238,230,.55)', cursor: 'pointer', fontSize: 14 }}>Sign in</button>
              </Link>
              <Link href={`/${locale}/auth/signup`} onClick={() => setMobileOpen(false)}>
                <button style={{ width: '100%', height: 38, borderRadius: 9, background: 'var(--gold)', border: 'none', color: 'var(--void)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Get started</button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
