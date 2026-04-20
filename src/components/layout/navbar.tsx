'use client';
// PATH: src/components/layout/navbar.tsx
// REDESIGN: Ultra-premium glassmorphism navbar — cinematic, seamless
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Globe, Menu, X, Sun, Moon, User, LogOut, ChevronDown, LayoutDashboard, Calendar, Heart, Settings } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { VG } from '@/lib/tokens';
import { t } from '@/lib/i18n/translations';

const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ar', label: 'AR', full: 'العربية' },
  { code: 'fr', label: 'FR', full: 'Français' },
  { code: 'es', label: 'ES', full: 'Español' },
  { code: 'de', label: 'DE', full: 'Deutsch' },
  { code: 'zh', label: 'ZH', full: '中文' },
  { code: 'ja', label: 'JA', full: '日本語' },
  { code: 'ru', label: 'RU', full: 'Русский' },
];

function useIsMobile(bp = 768) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth < bp);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, [bp]);
  return m;
}

export function Navbar({ locale, isRTL = false }: { locale: string; isRTL?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const isMobile = useIsMobile(768);
  const tr = t(locale);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMenuOpen(false); }, [locale]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isDark = resolvedTheme === 'dark';

  // — Colors resolve based on scroll + theme —
  const onHero = !scrolled;

  const navBg = scrolled
    ? (isDark ? 'rgba(6,5,15,0.92)' : 'rgba(248,245,240,0.96)')
    : 'transparent';

  const navBlur = scrolled ? 'blur(24px) saturate(1.5)' : 'none';

  const navBorder = scrolled
    ? (isDark ? '1px solid rgba(250,247,242,0.06)' : '1px solid rgba(21,14,7,0.10)')
    : 'none';

  const navShadow = scrolled
    ? (isDark
        ? '0 1px 40px rgba(0,0,0,0.5)'
        : '0 1px 24px rgba(21,14,7,0.08)')
    : 'none';

  // Text colors
  const textColor = onHero
    ? 'rgba(250,247,242,0.80)'
    : (isDark ? 'rgba(250,247,242,0.62)' : 'rgba(21,14,7,0.68)');

  const logoColor = onHero ? '#FAF7F2' : (isDark ? 'var(--vg-text)' : '#150E07');

  // Icon button style
  const iconBg       = onHero ? 'rgba(250,247,242,0.07)' : (isDark ? 'transparent' : 'rgba(21,14,7,0.04)');
  const iconBorder   = onHero ? 'rgba(250,247,242,0.18)' : (isDark ? 'rgba(250,247,242,0.10)' : 'rgba(21,14,7,0.14)');
  const iconColor    = onHero ? 'rgba(250,247,242,0.75)' : (isDark ? 'rgba(250,247,242,0.55)' : 'rgba(21,14,7,0.62)');

  const iconBtn: React.CSSProperties = {
    background: iconBg,
    border: `1px solid ${iconBorder}`,
    cursor: 'pointer',
    color: iconColor,
    display: 'flex', alignItems: 'center',
    padding: '0.4rem',
    transition: 'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
    flexShrink: 0,
  };

  // Dropdown styles
  const dropBg     = isDark ? '#0D0C1C' : '#FDFCF9';
  const dropBorder = isDark ? '1px solid rgba(250,247,242,0.08)' : '1px solid rgba(21,14,7,0.10)';
  const dropShadow = isDark
    ? '0 12px 48px rgba(0,0,0,0.60), 0 0 0 1px rgba(212,168,83,0.06) inset'
    : '0 12px 48px rgba(21,14,7,0.14), 0 0 0 1px rgba(139,92,10,0.06) inset';
  const dropItem   = isDark ? 'rgba(250,247,242,0.58)' : 'rgba(21,14,7,0.65)';
  const dropDivider = isDark ? '1px solid rgba(250,247,242,0.05)' : '1px solid rgba(21,14,7,0.06)';
  const dropHover  = isDark ? 'rgba(212,168,83,0.07)' : 'rgba(139,92,10,0.06)';

  // Mobile menu bg
  const mobileBg = isDark ? '#06050F' : '#F8F5F0';
  const mobileText = isDark ? '#FAF7F2' : '#150E07';
  const mobileDivider = isDark ? '1px solid rgba(250,247,242,0.06)' : '1px solid rgba(21,14,7,0.08)';

  const NAV = [
    { href: '/hotels',      label: tr.nav.hotels },
    { href: '/attractions', label: tr.nav.attractions },
    { href: '/restaurants', label: tr.nav.restaurants },
    { href: '/ai',          label: tr.nav.aiAssistant },
  ];

  const USER_MENU = [
    { href: '/dashboard',  label: tr.nav.dashboard,        Icon: LayoutDashboard },
    { href: '/bookings',   label: tr.pages.bookings.title, Icon: Calendar },
    { href: '/favorites',  label: 'Favorites',             Icon: Heart },
    { href: '/profile',    label: 'Profile',               Icon: User },
    { href: '/settings',   label: 'Settings',              Icon: Settings },
  ];

  const initial = session?.user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <nav dir="ltr" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        background: navBg,
        border: 'none',
        borderBottom: navBorder,
        backdropFilter: navBlur,
        WebkitBackdropFilter: navBlur,
        boxShadow: navShadow,
        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          height: '62px',
          padding: '0 clamp(1rem, 4.5vw, 3rem)',
          maxWidth: '1400px', margin: '0 auto', gap: '1rem',
        }}>

          {/* ── Logo ── */}
          <Link href={`/${locale}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.3rem, 2.8vw, 1.55rem)',
              fontWeight: 300,
              color: logoColor,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease',
            }}>
              Va
              <em style={{
                backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5CC74 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontStyle: 'italic',
                marginLeft: '0.25em',
              }}>
                Travel
              </em>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          {!isMobile && (
            <nav style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 'clamp(1.2rem, 3.5vw, 2.8rem)' }}>
              {NAV.map(l => (
                <Link
                  key={l.href}
                  href={`/${locale}${l.href}`}
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: textColor,
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = textColor}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}

          {/* ── Right Actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label="Toggle theme"
                style={iconBtn}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'rgba(212,168,83,0.40)';
                  el.style.color = 'var(--vg-gold)';
                  el.style.background = 'rgba(212,168,83,0.08)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = iconBorder;
                  el.style.color = iconColor;
                  el.style.background = iconBg;
                }}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}

            {/* Language picker */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLangOpen(v => !v)}
                style={{
                  ...iconBtn,
                  gap: '0.3rem', padding: '0.35rem 0.65rem',
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '0.58rem', letterSpacing: '0.14em',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'rgba(212,168,83,0.40)';
                  el.style.color = 'var(--vg-gold)';
                  el.style.background = 'rgba(212,168,83,0.08)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = iconBorder;
                  el.style.color = iconColor;
                  el.style.background = iconBg;
                }}
              >
                <Globe size={12} />
                {!isMobile && <span>{locale.toUpperCase()}</span>}
                <ChevronDown size={9} />
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 0.6rem)', right: 0,
                  background: dropBg, border: dropBorder,
                  minWidth: '160px', zIndex: 999,
                  boxShadow: dropShadow,
                  overflow: 'hidden',
                }}>
                  {LANGS.map(l => (
                    <Link
                      key={l.code}
                      href={`/${l.code}`}
                      onClick={() => setLangOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.7rem',
                        padding: '0.7rem 1.1rem',
                        fontFamily: 'var(--font-space-mono)',
                        fontSize: '0.56rem', letterSpacing: '0.12em',
                        color: l.code === locale ? (isDark ? 'var(--vg-gold)' : 'var(--vg-gold)') : dropItem,
                        textDecoration: 'none',
                        background: l.code === locale ? 'rgba(212,168,83,0.08)' : 'none',
                        borderBottom: dropDivider,
                        transition: 'background 0.15s, color 0.15s',
                        direction: 'ltr',
                      }}
                      onMouseEnter={e => {
                        if (l.code !== locale) {
                          (e.currentTarget as HTMLElement).style.background = dropHover;
                          (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (l.code !== locale) {
                          (e.currentTarget as HTMLElement).style.background = 'none';
                          (e.currentTarget as HTMLElement).style.color = dropItem;
                        }
                      }}
                    >
                      <span style={{ opacity: 0.45, width: '20px', fontSize: '0.56rem' }}>{l.label}</span>
                      {l.full}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Auth — desktop */}
            {!isMobile && (
              session ? (
                <div ref={userRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserOpen(v => !v)}
                    style={{
                      width: '34px', height: '34px',
                      background: 'var(--vg-gold-dim)',
                      border: '1px solid var(--vg-gold-border)',
                      cursor: 'pointer',
                      color: isDark ? 'var(--vg-gold)' : 'var(--vg-gold)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.1rem', fontWeight: 300,
                      transition: 'background 0.2s ease, box-shadow 0.2s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,168,83,0.20)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 3px rgba(212,168,83,0.12)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--vg-gold-dim)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    }}
                  >
                    {initial}
                  </button>

                  {userOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 0.6rem)', right: 0,
                      background: dropBg, border: dropBorder,
                      minWidth: '220px', zIndex: 999,
                      boxShadow: dropShadow, overflow: 'hidden',
                    }}>
                      {/* Gold top accent */}
                      <div style={{ height: '2px', background: 'linear-gradient(to right, var(--vg-gold), var(--vg-gold-2))' }} />

                      {/* User info */}
                      <div style={{
                        padding: '1rem 1.1rem',
                        borderBottom: `1px solid ${isDark ? 'rgba(250,247,242,0.06)' : 'rgba(21,14,7,0.07)'}`,
                        background: isDark ? 'rgba(212,168,83,0.06)' : 'rgba(139,92,10,0.04)',
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-cormorant)',
                          fontSize: '1.05rem', fontWeight: 300,
                          color: isDark ? 'var(--vg-text)' : '#150E07',
                          marginBottom: '0.2rem',
                        }}>
                          {session.user?.name}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-space-mono)',
                          fontSize: '0.52rem', letterSpacing: '0.08em',
                          color: isDark ? 'rgba(250,247,242,0.30)' : 'rgba(21,14,7,0.38)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          direction: 'ltr',
                        }}>
                          {session.user?.email}
                        </div>
                      </div>

                      {USER_MENU.map(item => (
                        <Link
                          key={item.href}
                          href={`/${locale}${item.href}`}
                          onClick={() => setUserOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.65rem',
                            padding: '0.68rem 1.1rem',
                            fontFamily: 'var(--font-space-mono)',
                            fontSize: '0.54rem', letterSpacing: '0.10em',
                            color: dropItem, textDecoration: 'none',
                            borderBottom: dropDivider,
                            transition: 'color 0.15s, background 0.15s',
                            direction: 'ltr',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)';
                            (e.currentTarget as HTMLElement).style.background = dropHover;
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = dropItem;
                            (e.currentTarget as HTMLElement).style.background = 'none';
                          }}
                        >
                          <item.Icon size={11} />
                          {item.label}
                        </Link>
                      ))}

                      <button
                        onClick={() => signOut({ callbackUrl: `/${locale}` })}
                        style={{
                          display: 'flex', width: '100%',
                          alignItems: 'center', gap: '0.5rem',
                          padding: '0.68rem 1.1rem',
                          fontFamily: 'var(--font-space-mono)',
                          fontSize: '0.54rem', letterSpacing: '0.10em',
                          color: dropItem, background: 'none', border: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.15s, background 0.15s',
                          direction: 'ltr',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = '#F87171';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.06)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = dropItem;
                          (e.currentTarget as HTMLButtonElement).style.background = 'none';
                        }}
                      >
                        <LogOut size={11} />
                        {tr.nav.signOut}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link
                    href={`/${locale}/auth/signin`}
                    style={{
                      textDecoration: 'none',
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.56rem',
                      letterSpacing: '0.20em',
                      textTransform: 'uppercase',
                      color: textColor,
                      padding: '0.45rem 0.85rem',
                      border: `1px solid ${iconBorder}`,
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = 'var(--vg-gold)';
                      el.style.borderColor = 'rgba(212,168,83,0.40)';
                      el.style.background = 'rgba(212,168,83,0.07)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = textColor;
                      el.style.borderColor = iconBorder;
                      el.style.background = 'transparent';
                    }}
                  >
                    {tr.nav.signIn}
                  </Link>
                  <Link
                    href={`/${locale}/auth/signup`}
                    className="vg-btn-primary"
                    style={{ textDecoration: 'none', padding: '0.5rem 1.1rem', fontSize: '0.56rem', whiteSpace: 'nowrap' }}
                  >
                    {tr.nav.signUp}
                  </Link>
                </div>
              )
            )}

            {/* Hamburger */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(v => !v)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: onHero ? 'rgba(250,247,242,0.88)' : (isDark ? 'rgba(250,247,242,0.82)' : 'rgba(21,14,7,0.80)'),
                  padding: '0.4rem', display: 'flex', alignItems: 'center', flexShrink: 0,
                }}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile Full-screen Menu ── */}
      {isMobile && menuOpen && (
        <div dir="ltr" style={{
          position: 'fixed', inset: 0, zIndex: 499,
          background: mobileBg,
          display: 'flex', flexDirection: 'column', paddingTop: '62px',
          overflowY: 'auto',
        }}>
          {/* Gold top line */}
          <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold-border), transparent)' }} />

          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: '2.5rem clamp(1.5rem, 6vw, 3rem)',
          }}>
            {NAV.map((l, i) => (
              <Link
                key={l.href}
                href={`/${locale}${l.href}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(2.8rem, 10vw, 4rem)',
                  fontWeight: 300, color: mobileText,
                  textDecoration: 'none',
                  borderBottom: mobileDivider,
                  padding: '1.1rem 0',
                  lineHeight: 1,
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  opacity: 0,
                  animation: `fade-up 0.4s ease ${i * 0.07}s both`,
                  direction: 'ltr',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isDark ? 'var(--vg-gold)' : 'var(--vg-gold)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = mobileText}
              >
                <em style={{
                  color: 'var(--vg-gold)', fontStyle: 'italic',
                  fontSize: '0.5em', fontFamily: 'var(--font-space-mono)',
                  letterSpacing: '0.2em', fontWeight: 400, opacity: 0.65,
                }}>
                  0{i + 1}
                </em>
                {l.label}
              </Link>
            ))}

            {/* Auth */}
            <div style={{ marginTop: 'auto', paddingTop: '2.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {session ? (
                <>
                  <Link href={`/${locale}/dashboard`} onClick={() => setMenuOpen(false)} className="vg-btn-primary" style={{ textDecoration: 'none' }}>
                    {tr.nav.dashboard}
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: `/${locale}` })} className="vg-btn-outline">
                    {tr.nav.signOut}
                  </button>
                </>
              ) : (
                <>
                  <Link href={`/${locale}/auth/signin`} onClick={() => setMenuOpen(false)} className="vg-btn-primary" style={{ textDecoration: 'none' }}>
                    {tr.nav.signIn}
                  </Link>
                  <Link href={`/${locale}/auth/signup`} onClick={() => setMenuOpen(false)} className="vg-btn-outline" style={{ textDecoration: 'none' }}>
                    {tr.nav.signUp}
                  </Link>
                </>
              )}
            </div>

            {/* Language */}
            <div style={{
              marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
              paddingTop: '1.5rem', borderTop: mobileDivider,
            }}>
              {LANGS.map(l => (
                <Link
                  key={l.code}
                  href={`/${l.code}`}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-space-mono)', fontSize: '0.56rem',
                    letterSpacing: '0.14em', padding: '0.42rem 0.75rem',
                    border: l.code === locale ? '1px solid var(--vg-gold-border)' : `1px solid ${isDark ? 'rgba(250,247,242,0.10)' : 'rgba(21,14,7,0.14)'}`,
                    background: l.code === locale ? 'var(--vg-gold-dim)' : 'none',
                    color: l.code === locale ? 'var(--vg-gold)' : (isDark ? 'rgba(250,247,242,0.48)' : 'rgba(21,14,7,0.50)'),
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
