'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu, X, Search, Globe,
  User, Settings, LogOut, Calendar, Heart, Pi,
  Hotel, Map, UtensilsCrossed, Building2, Sparkles
} from 'lucide-react';

interface NavbarProps {
  locale: string;
  session: any;
}

const languages = [
  { code: 'en', name: 'English',  flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español',  flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch',  flag: '🇩🇪' },
  { code: 'zh', name: '中文',     flag: '🇨🇳' },
  { code: 'ja', name: '日本語',   flag: '🇯🇵' },
  { code: 'ru', name: 'Русский',  flag: '🇷🇺' },
  { code: 'pt', name: 'Português',flag: '🇵🇹' },
  { code: 'hi', name: 'हिंदी',   flag: '🇮🇳' },
];

export function Navbar({ locale, session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Hotels',       href: `/${locale}/hotels`,      icon: Hotel         },
    { name: 'Attractions',  href: `/${locale}/attractions`, icon: Map           },
    { name: 'Restaurants',  href: `/${locale}/restaurants`, icon: UtensilsCrossed },
    { name: 'Cities',       href: `/${locale}/cities`,      icon: Building2     },
    { name: 'AI Assistant', href: `/${locale}/ai`,          icon: Sparkles      },
  ];

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  return (
    <nav
      className="vt-nav sticky top-0 z-50 w-full"
      style={{
        backgroundColor: 'var(--vt-nav-bg)',
        borderBottom: '0.5px solid var(--vt-nav-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--vt-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Va</span>
            </div>
            <span
              className="hidden sm:inline-block"
              style={{ fontSize: 15, fontWeight: 500, color: 'var(--vt-text)' }}
            >
              Va Travel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-5">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontSize: 13, color: 'var(--vt-text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--vt-text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--vt-text-3)')}
              >
                <item.icon style={{ width: 13, height: 13 }} />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Pi badge */}
            <div className="vt-pi-badge hidden sm:flex items-center gap-1">
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--vt-pi)', display: 'inline-block' }} />
              Pi Network
            </div>

            {/* Search */}
            <Link href={`/${locale}/search`}>
              <button
                style={{
                  width: 34, height: 34, borderRadius: 9,
                  border: '0.5px solid var(--vt-border-2)',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Search style={{ width: 15, height: 15, color: 'var(--vt-text-2)' }} />
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
                    height: 34, padding: '0 10px', borderRadius: 9,
                    border: '0.5px solid var(--vt-border-2)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'var(--vt-text-2)',
                  }}
                >
                  <Globe style={{ width: 13, height: 13 }} />
                  <span>{currentLanguage.flag}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                style={{
                  background: 'var(--vt-bg-card)',
                  border: '0.5px solid var(--vt-border-2)',
                  borderRadius: 12,
                }}
              >
                <DropdownMenuLabel style={{ color: 'var(--vt-text-3)', fontSize: 11 }}>
                  Select Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator style={{ background: 'var(--vt-border)' }} />
                {languages.map(lang => (
                  <DropdownMenuItem key={lang.code} asChild>
                    <Link
                      href={`/${lang.code}`}
                      className="flex items-center gap-2"
                      style={{ color: 'var(--vt-text-2)', fontSize: 13 }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
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
                    <Avatar style={{ width: 34, height: 34, outline: `2px solid var(--vt-brand)`, outlineOffset: 1 }}>
                      <AvatarImage src={session.user.image} alt={session.user.name} />
                      <AvatarFallback
                        style={{ background: 'var(--vt-brand)', color: '#fff', fontSize: 12, fontWeight: 600 }}
                      >
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  style={{
                    width: 220,
                    background: 'var(--vt-bg-card)',
                    border: '0.5px solid var(--vt-border-2)',
                    borderRadius: 12,
                  }}
                >
                  <DropdownMenuLabel>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--vt-text)', margin: 0 }}>{session.user.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--vt-text-3)', margin: 0 }}>{session.user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ background: 'var(--vt-border)' }} />
                  {[
                    { href: `/${locale}/dashboard`,  icon: User,     label: 'Dashboard'  },
                    { href: `/${locale}/bookings`,   icon: Calendar, label: 'My Bookings' },
                    { href: `/${locale}/favorites`,  icon: Heart,    label: 'Favorites'  },
                    { href: `/${locale}/settings`,   icon: Settings, label: 'Settings'   },
                  ].map(item => (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={item.href} style={{ color: 'var(--vt-text-2)', fontSize: 13 }}>
                        <item.icon style={{ width: 14, height: 14, marginRight: 8 }} />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator style={{ background: 'var(--vt-border)' }} />
                  <DropdownMenuItem style={{ background: 'var(--vt-pi-bg)' }}>
                    <Pi style={{ width: 14, height: 14, marginRight: 8, color: 'var(--vt-pi)' }} />
                    <span style={{ color: 'var(--vt-pi)', fontWeight: 500, fontSize: 13 }}>
                      π {session.user.piBalance?.toFixed(2) || '0.00'}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: 'var(--vt-border)' }} />
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
                      height: 34, padding: '0 14px', borderRadius: 9,
                      border: '0.5px solid var(--vt-border-2)',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 13, fontWeight: 500,
                      color: 'var(--vt-text-2)',
                    }}
                  >
                    Sign in
                  </button>
                </Link>
                <Link href={`/${locale}/auth/signup`}>
                  <button
                    className="vt-btn-brand"
                    style={{
                      height: 34, padding: '0 14px', borderRadius: 9,
                      cursor: 'pointer',
                      fontSize: 13, fontWeight: 500,
                    }}
                  >
                    Get started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(v => !v)}
              style={{
                width: 34, height: 34, borderRadius: 9,
                border: '0.5px solid var(--vt-border-2)',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {mobileMenuOpen
                ? <X style={{ width: 16, height: 16, color: 'var(--vt-text-2)' }} />
                : <Menu style={{ width: 16, height: 16, color: 'var(--vt-text-2)' }} />
              }
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: '0.5px solid var(--vt-border)',
              padding: '16px 0',
            }}
          >
            <div className="flex flex-col gap-4">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3"
                  style={{ fontSize: 14, color: 'var(--vt-text-2)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon style={{ width: 15, height: 15 }} />
                  {item.name}
                </Link>
              ))}
              <div style={{ height: '0.5px', background: 'var(--vt-border)' }} />
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, color: 'var(--vt-text-3)' }}>Theme</span>
                <ThemeToggle size="sm" showLabel />
              </div>
              {!session?.user && (
                <div className="flex flex-col gap-2">
                  <Link href={`/${locale}/auth/signin`} onClick={() => setMobileMenuOpen(false)}>
                    <button
                      style={{
                        width: '100%', height: 38, borderRadius: 10,
                        border: '0.5px solid var(--vt-border-2)',
                        background: 'transparent',
                        cursor: 'pointer', fontSize: 14, fontWeight: 500,
                        color: 'var(--vt-text-2)',
                      }}
                    >
                      Sign in
                    </button>
                  </Link>
                  <Link href={`/${locale}/auth/signup`} onClick={() => setMobileMenuOpen(false)}>
                    <button
                      className="vt-btn-brand"
                      style={{
                        width: '100%', height: 38, borderRadius: 10,
                        cursor: 'pointer', fontSize: 14, fontWeight: 500,
                      }}
                    >
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
