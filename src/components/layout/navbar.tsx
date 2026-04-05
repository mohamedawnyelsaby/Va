'use client';
// PATH: src/components/layout/navbar.tsx
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Globe, Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
];

const NAV_LINKS = [
  { href: '/hotels',        label: 'Hotels' },
  { href: '/attractions',   label: 'Attractions' },
  { href: '/restaurants',   label: 'Restaurants' },
  { href: '/ai-assistant',  label: 'AI Assistant' },
];

export function Navbar({ locale, isRTL = false }: { locale: string; isRTL?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav
      className="vg-nav"
      style={{
        borderBottomColor: scrolled ? 'var(--vg-gold-border)' : 'var(--vg-nav-border)',
        padding: '0 clamp(1rem, 5vw, 4rem)',
        direction: 'ltr', // ALWAYS LTR regardless of locale
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', direction: 'ltr' }}>

        {/* Logo — always left */}
        <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--vg-text)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
          </span>
        </Link>

        {/* Desktop nav links — center */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, justifyContent: 'center' }} className="hidden md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={`/${locale}${l.href}`}
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.52rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--vg-text-2)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--vg-gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--vg-text-2)')}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vg-text-2)', display: 'flex', padding: '0.4rem', alignItems: 'center' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Language picker */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vg-text-2)', display: 'flex', padding: '0.4rem', alignItems: 'center' }}
            >
              <Globe size={15} />
            </button>
            {langOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', minWidth: '140px', zIndex: 999, direction: 'ltr' }}>
                {LANGS.map((l) => (
                  <Link
                    key={l.code}
                    href={`/${l.code}`}
                    onClick={() => setLangOpen(false)}
                    style={{ display: 'block', padding: '0.65rem 1rem', fontFamily: 'var(--font-space-mono)', fontSize: '0.52rem', letterSpacing: '0.1em', color: l.code === locale ? 'var(--vg-gold)' : 'var(--vg-text-2)', textDecoration: 'none', background: l.code === locale ? 'var(--vg-gold-dim)' : 'none' }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {session ? (
            <div ref={userRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserOpen(!userOpen)}
                style={{ background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', cursor: 'pointer', color: 'var(--vg-gold)', display: 'flex', padding: '0.5rem', alignItems: 'center' }}
              >
                <User size={14} />
              </button>
              {userOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', minWidth: '180px', zIndex: 999, direction: 'ltr' }}>
                  <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--vg-border)', fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.12em', color: 'var(--vg-text-2)' }}>
                    {session.user?.name || session.user?.email}
                  </div>
                  <Link href={`/${locale}/profile`} onClick={() => setUserOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.12em', color: 'var(--vg-text-2)', textDecoration: 'none' }}>
                    <User size={12} /> Profile
                  </Link>
                  <button onClick={() => signOut()} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.12em', color: 'var(--vg-text-2)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/${locale}/auth/signin`} className="vg-btn-primary" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none', fontSize: '0.5rem' }}>
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vg-text-2)', padding: '0.4rem', alignItems: 'center' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid var(--vg-border)', paddingBottom: '1rem', direction: 'ltr' }}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={`/${locale}${l.href}`}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '0.9rem 0', fontFamily: 'var(--font-space-mono)', fontSize: '0.54rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--vg-text-2)', textDecoration: 'none', borderBottom: '1px solid var(--vg-border)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
