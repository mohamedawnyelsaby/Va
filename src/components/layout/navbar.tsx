'use client';
// PATH: src/components/layout/navbar.tsx
// FIX: Light mode — solid backgrounds in dropdowns, good contrast everywhere
// FIX: Scrolled light mode — cream background, dark text/icons
// FIX: Mobile menu — always solid background, never transparent
// FIX: Over hero (transparent) — always light text (hero is always dark)
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

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

export function Navbar({ locale, isRTL = false }: { locale: string; isRTL?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const isMobile = useIsMobile(768);
  const tr = t(locale);

  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [langOpen,  setLangOpen]  = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const [mounted,   setMounted]   = useState(false);

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

  const isDark  = resolvedTheme === 'dark';
  const initial = session?.user?.name?.charAt(0)?.toUpperCase() || '?';

  const NAV = [
    { href: '/hotels',      label: tr.nav.hotels },
    { href: '/attractions', label: tr.nav.attractions },
    { href: '/restaurants', label: tr.nav.restaurants },
    { href: '/ai',          label: tr.nav.aiAssistant },
  ];

  const USER_MENU = [
    { href: '/dashboard',  label: tr.nav.dashboard,        icon: LayoutDashboard },
    { href: '/bookings',   label: tr.pages.bookings.title, icon: Calendar },
    { href: '/favorites',  label: 'Favorites',             icon: Heart },
    { href: '/profile',    label: 'Profile',               icon: User },
    { href: '/settings',   label: 'Settings',              icon: Settings },
  ];

  // ─── Background Strategy ─────────────────────────────────────────────────
  // Hero is ALWAYS dark (#03020A). When NOT scrolled → transparent (shows hero dark bg).
  // When scrolled → solid theme-appropriate background.
  // Light mode scrolled: solid cream — no transparency bleed.
  // Dark mode scrolled: solid near-black.

  const onHero = !scrolled; // Transparent over hero

  const navBg = scrolled
    ? (isDark
        ? 'rgba(3,2,10,0.96)'
        : '#F6F3EC')  // Solid cream in light mode — no transparency
    : 'transparent';

  const navBorder = scrolled
    ? (isDark
        ? '0.5px solid rgba(242,238,230,0.08)'
        : '0.5px solid rgba(26,18,8,0.14)')
    : 'none';

  const navBlur = scrolled && isDark ? 'blur(20px)' : 'none';
  const navShadow = scrolled && !isDark ? '0 1px 12px rgba(26,18,8,0.08)' : 'none';

  // When over hero (transparent): always light text (hero is dark)
  // When scrolled in light mode: dark text/icons
  // When scrolled in dark mode: light text/icons
  const navTextColor = onHero
    ? 'rgba(242,238,230,0.80)'
    : (isDark ? 'rgba(242,238,230,0.65)' : 'rgba(26,18,8,0.72)');

  const navLogoColor = onHero
    ? '#F2EEE6'
    : (isDark ? 'var(--vg-text)' : '#1A1208');

  const iconBorderColor = onHero
    ? 'rgba(242,238,230,0.25)'
    : (isDark ? 'rgba(242,238,230,0.12)' : 'rgba(26,18,8,0.20)');

  const iconBg = onHero ? 'rgba(242,238,230,0.08)' : 'transparent';

  const iconColor = onHero
    ? 'rgba(242,238,230,0.78)'
    : (isDark ? 'rgba(242,238,230,0.65)' : 'rgba(26,18,8,0.68)');

  const iconBtnStyle: React.CSSProperties = {
    background:  iconBg,
    border:      `0.5px solid ${iconBorderColor}`,
    cursor:      'pointer',
    color:       iconColor,
    display:     'flex',
    alignItems:  'center',
    padding:     '0.4rem',
    transition:  'all 0.2s',
    flexShrink:  0,
  };

  // Dropdown background — always solid (no transparency)
  const dropdownBg = isDark ? '#0E0C18' : '#FFFFFF';
  const dropdownBorder = isDark ? '1px solid rgba(242,238,230,0.10)' : '1px solid rgba(26,18,8,0.14)';
  const dropdownShadow = isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(26,18,8,0.12)';
  const dropdownItemColor = isDark ? 'rgba(242,238,230,0.65)' : 'rgba(26,18,8,0.72)';
  const dropdownDivider = isDark ? '0.5px solid rgba(242,238,230,0.06)' : '0.5px solid rgba(26,18,8,0.08)';
  const dropdownHoverBg = isDark ? 'rgba(242,238,230,0.04)' : 'rgba(26,18,8,0.04)';

  // Mobile menu background — ALWAYS solid
  const mobileMenuBg = isDark ? '#09080F' : '#F6F3EC';
  const mobileNavTextColor = isDark ? 'var(--vg-text)' : '#1A1208';
  const mobileDivider = isDark ? '0.5px solid rgba(242,238,230,0.08)' : '0.5px solid rgba(26,18,8,0.10)';

  return (
    <>
      <nav
        dir="ltr"
        style={{
          position:            'fixed',
          top: 0, left: 0, right: 0,
          zIndex:              500,
          background:          navBg,
          borderBottom:        navBorder,
          backdropFilter:      navBlur,
          WebkitBackdropFilter:navBlur,
          boxShadow:           navShadow,
          transition:          'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        <div style={{
          display:     'flex',
          alignItems:  'center',
          height:      '60px',
          padding:     '0 clamp(1rem, 4vw, 3rem)',
          maxWidth:    '1400px',
          margin:      '0 auto',
          gap:         '1rem',
        }}>

          {/* Logo */}
          <Link href={`/${locale}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily:    'var(--font-cormorant)',
              fontSize:      'clamp(1.2rem, 3vw, 1.45rem)',
              fontWeight:    300,
              color:         navLogoColor,
              letterSpacing: '-0.01em',
              whiteSpace:    'nowrap',
              transition:    'color 0.35s',
            }}>
              Va<em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}> Travel</em>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {!isMobile && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 'clamp(1rem, 3vw, 2.5rem)' }}>
              {NAV.map(l => (
                <Link key={l.href} href={`/${locale}${l.href}`}
                  style={{
                    fontFamily:    'var(--font-space-mono)',
                    fontSize:      VG.font.nav,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color:         navTextColor,
                    textDecoration:'none',
                    transition:    'color 0.2s',
                    whiteSpace:    'nowrap',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--vg-gold)')}
                  onMouseLeave={e => (e.currentTarget.style.color = navTextColor)}>
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label={isDark ? 'Light mode' : 'Dark mode'}
                style={iconBtnStyle}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'var(--vg-gold-border)';
                  el.style.color = 'var(--vg-gold)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = iconBorderColor;
                  el.style.color = iconColor;
                }}
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            {/* Language selector */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLangOpen(v => !v)}
                style={{
                  ...iconBtnStyle,
                  gap:           '0.3rem',
                  padding:       '0.3rem 0.6rem',
                  fontFamily:    'var(--font-space-mono)',
                  fontSize:      VG.font.micro,
                  letterSpacing: '0.15em',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'var(--vg-gold-border)';
                  el.style.color = 'var(--vg-gold)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = iconBorderColor;
                  el.style.color = iconColor;
                }}
              >
                <Globe size={12} />
                {!isMobile && <span>{locale.toUpperCase()}</span>}
                <ChevronDown size={10} />
              </button>

              {langOpen && (
                <div style={{
                  position:  'absolute',
                  top:       'calc(100% + 0.5rem)',
                  right:     0,
                  // ALWAYS solid — no transparency
                  background:dropdownBg,
                  border:    dropdownBorder,
                  minWidth:  '148px',
                  zIndex:    999,
                  boxShadow: dropdownShadow,
                }}>
                  {LANGS.map(l => (
                    <Link key={l.code} href={`/${l.code}`} onClick={() => setLangOpen(false)}
                      style={{
                        display:        'flex',
                        alignItems:     'center',
                        gap:            '0.6rem',
                        padding:        '0.65rem 1rem',
                        fontFamily:     'var(--font-space-mono)',
                        fontSize:       VG.font.micro,
                        letterSpacing:  '0.12em',
                        color:          l.code === locale ? 'var(--vg-gold)' : dropdownItemColor,
                        textDecoration: 'none',
                        background:     l.code === locale ? 'var(--vg-gold-dim)' : 'none',
                        borderBottom:   dropdownDivider,
                        transition:     'background 0.15s, color 0.15s',
                        direction:      'ltr',
                      }}
                      onMouseEnter={e => {
                        if (l.code !== locale) {
                          (e.currentTarget as HTMLElement).style.background = dropdownHoverBg;
                        }
                      }}
                      onMouseLeave={e => {
                        if (l.code !== locale) {
                          (e.currentTarget as HTMLElement).style.background = 'none';
                        }
                      }}>
                      <span style={{ opacity: 0.5, width: '18px', fontSize: VG.font.micro }}>{l.label}</span>
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
                      width:        '32px',
                      height:       '32px',
                      background:   'var(--vg-gold-dim)',
                      border:       '1px solid var(--vg-gold-border)',
                      cursor:       'pointer',
                      color:        'var(--vg-gold)',
                      display:      'flex',
                      alignItems:   'center',
                      justifyContent: 'center',
                      fontFamily:   'var(--font-cormorant)',
                      fontSize:     '1rem',
                      fontWeight:   300,
                      transition:   'background 0.2s',
                      flexShrink:   0,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.25)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--vg-gold-dim)'}
                  >
                    {initial}
                  </button>

                  {userOpen && (
                    <div style={{
                      position:  'absolute',
                      top:       'calc(100% + 0.5rem)',
                      right:     0,
                      background: dropdownBg,
                      border:    dropdownBorder,
                      minWidth:  '210px',
                      zIndex:    999,
                      boxShadow: dropdownShadow,
                    }}>
                      <div style={{
                        padding:      '0.9rem 1rem',
                        borderBottom: `1px solid ${isDark ? 'rgba(242,238,230,0.07)' : 'rgba(26,18,8,0.08)'}`,
                        background:   'var(--vg-gold-dim)',
                      }}>
                        <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', color: 'var(--vg-text)', marginBottom: '0.15rem' }}>
                          {session.user?.name}
                        </div>
                        <div style={{
                          fontFamily:    'var(--font-space-mono)',
                          fontSize:      VG.font.micro,
                          letterSpacing: '0.1em',
                          color:         'var(--vg-text-3)',
                          overflow:      'hidden',
                          textOverflow:  'ellipsis',
                          whiteSpace:    'nowrap',
                          direction:     'ltr',
                        }}>
                          {session.user?.email}
                        </div>
                      </div>

                      {USER_MENU.map(item => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={`/${locale}${item.href}`} onClick={() => setUserOpen(false)}
                            style={{
                              display:        'flex',
                              alignItems:     'center',
                              gap:            '0.6rem',
                              padding:        '0.65rem 1rem',
                              fontFamily:     'var(--font-space-mono)',
                              fontSize:       VG.font.micro,
                              letterSpacing:  '0.1em',
                              color:          dropdownItemColor,
                              textDecoration: 'none',
                              borderBottom:   dropdownDivider,
                              transition:     'color 0.15s, background 0.15s',
                              direction:      'ltr',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)';
                              (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.color = dropdownItemColor;
                              (e.currentTarget as HTMLElement).style.background = 'none';
                            }}>
                            <Icon size={12} /> {item.label}
                          </Link>
                        );
                      })}

                      <button
                        onClick={() => signOut({ callbackUrl: `/${locale}` })}
                        style={{
                          display:        'flex',
                          width:          '100%',
                          alignItems:     'center',
                          gap:            '0.5rem',
                          padding:        '0.65rem 1rem',
                          fontFamily:     'var(--font-space-mono)',
                          fontSize:       VG.font.micro,
                          letterSpacing:  '0.1em',
                          color:          dropdownItemColor,
                          background:     'none',
                          border:         'none',
                          cursor:         'pointer',
                          transition:     'color 0.15s, background 0.15s',
                          direction:      'ltr',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.05)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = dropdownItemColor;
                          (e.currentTarget as HTMLButtonElement).style.background = 'none';
                        }}
                      >
                        <LogOut size={12} /> {tr.nav.signOut}
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
                      fontFamily:     'var(--font-space-mono)',
                      fontSize:       VG.font.micro,
                      letterSpacing:  '0.18em',
                      textTransform:  'uppercase',
                      color:          navTextColor,
                      padding:        '0.45rem 0.8rem',
                      border:         `1px solid ${iconBorderColor}`,
                      transition:     'all 0.2s',
                      whiteSpace:     'nowrap',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = navTextColor;
                      (e.currentTarget as HTMLElement).style.borderColor = iconBorderColor;
                    }}
                  >
                    {tr.nav.signIn}
                  </Link>
                  <Link
                    href={`/${locale}/auth/signup`}
                    className="vg-btn-primary"
                    style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: VG.font.micro, whiteSpace: 'nowrap' }}
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
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  // Always visible regardless of mode
                  color:      onHero ? 'rgba(242,238,230,0.88)' : (isDark ? 'rgba(242,238,230,0.88)' : 'rgba(26,18,8,0.82)'),
                  padding:    '0.4rem',
                  display:    'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu — ALWAYS solid background, never transparent */}
      {isMobile && menuOpen && (
        <div
          dir="ltr"
          style={{
            position:        'fixed',
            inset:           0,
            zIndex:          499,
            // Solid background — no page content showing through
            background:      mobileMenuBg,
            display:         'flex',
            flexDirection:   'column',
            paddingTop:      '60px',
          }}
        >
          <div style={{
            flex:       1,
            display:    'flex',
            flexDirection: 'column',
            padding:    '2rem clamp(1.5rem, 6vw, 3rem)',
            overflowY:  'auto',
          }}>
            {NAV.map((l, i) => (
              <Link
                key={l.href}
                href={`/${locale}${l.href}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily:    'var(--font-cormorant)',
                  fontSize:      'clamp(2.4rem, 9vw, 3.5rem)',
                  fontWeight:    300,
                  color:         mobileNavTextColor,
                  textDecoration:'none',
                  borderBottom:  mobileDivider,
                  padding:       '1.2rem 0',
                  lineHeight:    1,
                  opacity:       0,
                  animation:     `fadeUp 0.4s ease ${i * 0.07}s forwards`,
                  direction:     'ltr',
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '1rem',
                }}
              >
                <em style={{
                  color:         'var(--vg-gold)',
                  fontStyle:     'italic',
                  fontSize:      '0.5em',
                  fontFamily:    'var(--font-space-mono)',
                  letterSpacing: '0.2em',
                  fontWeight:    400,
                  opacity:       0.7,
                }}>
                  0{i + 1}
                </em>
                {l.label}
              </Link>
            ))}

            {/* Auth Buttons */}
            <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {session ? (
                <>
                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setMenuOpen(false)}
                    className="vg-btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    {tr.nav.dashboard}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: `/${locale}` })}
                    className="vg-btn-outline"
                  >
                    {tr.nav.signOut}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/auth/signin`}
                    onClick={() => setMenuOpen(false)}
                    className="vg-btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    {tr.nav.signIn}
                  </Link>
                  <Link
                    href={`/${locale}/auth/signup`}
                    onClick={() => setMenuOpen(false)}
                    className="vg-btn-outline"
                    style={{ textDecoration: 'none' }}
                  >
                    {tr.nav.signUp}
                  </Link>
                </>
              )}
            </div>

            {/* Language row in mobile menu */}
            <div style={{
              marginTop:  '1.5rem',
              display:    'flex',
              flexWrap:   'wrap',
              gap:        '0.5rem',
              paddingTop: '1.5rem',
              borderTop:  mobileDivider,
            }}>
              {LANGS.map(l => (
                <Link
                  key={l.code}
                  href={`/${l.code}`}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily:     'var(--font-space-mono)',
                    fontSize:       VG.font.micro,
                    letterSpacing:  '0.15em',
                    padding:        '0.4rem 0.7rem',
                    border:         `1px solid ${l.code === locale ? 'var(--vg-gold-border)' : (isDark ? 'rgba(242,238,230,0.12)' : 'rgba(26,18,8,0.15)')}`,
                    background:     l.code === locale ? 'var(--vg-gold-dim)' : 'none',
                    color:          l.code === locale ? 'var(--vg-gold)' : (isDark ? 'rgba(242,238,230,0.55)' : 'rgba(26,18,8,0.55)'),
                    textDecoration: 'none',
                    transition:     'all 0.15s',
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
