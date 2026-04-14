// PATH: src/components/layout/navbar.tsx
// UPDATED: Dashboard link, Sign Up CTA, improved user menu
'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Globe, Menu, X, Sun, Moon, User, LogOut, ChevronDown, LayoutDashboard, Calendar, Heart, Settings } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { VG } from '@/lib/tokens';

const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ar', label: 'AR', full: 'العربية' },
  { code: 'fr', label: 'FR', full: 'Français' },
  { code: 'es', label: 'ES', full: 'Español' },
  { code: 'de', label: 'DE', full: 'Deutsch' },
  { code: 'zh', label: 'ZH', full: '中文' },
];

const NAV = [
  { href: '/hotels',      label: 'Hotels' },
  { href: '/attractions', label: 'Attractions' },
  { href: '/restaurants', label: 'Restaurants' },
  { href: '/ai',          label: 'AI Assistant' },
];

const USER_MENU = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/bookings',   label: 'My Bookings', icon: Calendar },
  { href: '/favorites',  label: 'Favorites',   icon: Heart },
  { href: '/profile',    label: 'Profile',     icon: User },
  { href: '/settings',   label: 'Settings',    icon: Settings },
];

export function Navbar({ locale, isRTL = false }: { locale: string; isRTL?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [locale]);

  const isDark = resolvedTheme === 'dark';

  const navBg = scrolled
    ? 'var(--vg-nav-bg)'
    : isDark
      ? 'linear-gradient(to bottom, rgba(3,2,10,0.7) 0%, transparent 100%)'
      : 'transparent';

  const navBorder = scrolled
    ? '0.5px solid var(--vg-gold-border)'
    : isDark
      ? '0.5px solid transparent'
      : '0.5px solid var(--vg-border)';

  const initial = session?.user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <nav
        dir="ltr"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
          background: navBg,
          borderBottom: navBorder,
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(8px)',
          transition: 'background .4s, border-color .4s',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center',
          height: '60px',
          padding: '0 clamp(1rem, 4vw, 3rem)',
          maxWidth: '1400px', margin: '0 auto',
          gap: '1.5rem',
        }}>

          {/* Logo */}
          <Link href={`/${locale}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.45rem', fontWeight: 300, color: 'var(--vg-text)', letterSpacing: '-.01em' }}>
              Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '2.5rem' }} className="hidden md:flex">
            {NAV.map(l => (
              <Link key={l.href} href={`/${locale}${l.href}`}
                style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.nav, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--vg-text-2)', textDecoration: 'none', transition: 'color .2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--vg-gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--vg-text-2)')}
              >{l.label}</Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginLeft: 'auto' }}>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ background: 'none', border: '0.5px solid var(--vg-border)', cursor: 'pointer', color: 'var(--vg-text-2)', display: 'flex', padding: '.4rem', alignItems: 'center', transition: 'border-color .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--vg-gold-border)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--vg-border)'}
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            {/* Language */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button onClick={() => setLangOpen(v => !v)}
                style={{ background: 'none', border: '0.5px solid var(--vg-border)', cursor: 'pointer', color: 'var(--vg-text-2)', display: 'flex', alignItems: 'center', gap: '.3rem', padding: '.3rem .6rem', fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '.15em', transition: 'border-color .2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--vg-gold-border)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--vg-border)'}
              >
                <Globe size={12} /> {locale.toUpperCase()} <ChevronDown size={10} />
              </button>
              {langOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + .5rem)', right: 0, background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', minWidth: '140px', zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                  {LANGS.map(l => (
                    <Link key={l.code} href={`/${l.code}`} onClick={() => setLangOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.6rem 1rem', fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '.12em', color: l.code === locale ? 'var(--vg-gold)' : 'var(--vg-text-2)', textDecoration: 'none', background: l.code === locale ? 'var(--vg-gold-dim)' : 'none', borderBottom: '0.5px solid var(--vg-border)', transition: 'background .2s' }}
                      onMouseEnter={e => { if (l.code !== locale) (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-surface)'; }}
                      onMouseLeave={e => { if (l.code !== locale) (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      <span style={{ opacity: .5, width: '18px', fontSize: VG.font.micro }}>{l.label}</span>
                      {l.full}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth */}
            {session ? (
              <div ref={userRef} style={{ position: 'relative' }}>
                <button onClick={() => setUserOpen(v => !v)}
                  aria-label="Account menu"
                  style={{ width: '32px', height: '32px', background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', cursor: 'pointer', color: 'var(--vg-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontWeight: 300, transition: 'background .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.25)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--vg-gold-dim)'}
                >
                  {initial}
                </button>
                {userOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + .5rem)', right: 0, background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', minWidth: '200px', zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                    {/* User info header */}
                    <div style={{ padding: '.85rem 1rem', borderBottom: '1px solid var(--vg-border)', background: 'var(--vg-gold-dim)' }}>
                      <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', color: 'var(--vg-text)', marginBottom: '0.15rem' }}>{session.user?.name}</div>
                      <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.1em', color: 'var(--vg-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.email}</div>
                    </div>

                    {USER_MENU.map(item => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={`/${locale}${item.href}`} onClick={() => setUserOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.65rem 1rem', fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '.1em', color: 'var(--vg-text-2)', textDecoration: 'none', borderBottom: '0.5px solid var(--vg-border)', transition: 'color .2s, background .2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'; (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-2)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                        >
                          <Icon size={12} /> {item.label}
                        </Link>
                      );
                    })}

                    <button onClick={() => signOut({ callbackUrl: `/${locale}` })}
                      style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '.5rem', padding: '.65rem 1rem', fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '.1em', color: 'var(--vg-text-2)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color .2s, background .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.05)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--vg-text-2)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                    >
                      <LogOut size={12} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} className="hidden md:flex">
                <Link href={`/${locale}/auth/signin`}
                  style={{ textDecoration: 'none', fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--vg-text-2)', padding: '0.45rem 0.8rem', border: '1px solid var(--vg-border)', transition: 'color 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'; }}
                >
                  Sign In
                </Link>
                <Link href={`/${locale}/auth/signup`} className="vg-btn-primary" style={{ textDecoration: 'none', padding: '.5rem 1rem', fontSize: VG.font.micro }}>
                  Sign Up
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex md:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vg-text-2)', padding: '.4rem', display: 'flex', alignItems: 'center' }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div dir="ltr" style={{ position: 'fixed', inset: 0, zIndex: 499, background: 'var(--vg-bg)', display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem clamp(1.5rem,6vw,3rem)' }}>
            {NAV.map((l, i) => (
              <Link key={l.href} href={`/${locale}${l.href}`} onClick={() => setMenuOpen(false)}
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem,8vw,3rem)', fontWeight: 300, color: 'var(--vg-text)', textDecoration: 'none', borderBottom: '0.5px solid var(--vg-border)', padding: '1.2rem 0', lineHeight: 1, opacity: 0, animation: `fadeUp .4s ease ${i * .07}s forwards` }}>
                <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic', marginRight: '.5rem', fontSize: '.5em', fontFamily: 'var(--font-space-mono)', letterSpacing: '.2em' }}>0{i + 1}</em>
                {l.label}
              </Link>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {session ? (
                <>
                  <Link href={`/${locale}/dashboard`} onClick={() => setMenuOpen(false)} className="vg-btn-primary" style={{ textDecoration: 'none' }}>Dashboard</Link>
                  <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className="vg-btn-outline">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/auth/signin`} onClick={() => setMenuOpen(false)} className="vg-btn-primary" style={{ textDecoration: 'none' }}>Sign In</Link>
                  <Link href={`/${locale}/auth/signup`} onClick={() => setMenuOpen(false)} className="vg-btn-outline" style={{ textDecoration: 'none' }}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
