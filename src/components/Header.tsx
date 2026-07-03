/* ============================================================
   PATH: components/Header.tsx
   CHANGED: Removed manual dark/light toggle (data-theme + localStorage).
   Theme is now 100% automatic via OS (prefers-color-scheme in globals.css).
   Everything else — logo, language dropdown, hamburger menu, nav items —
   is untouched.
   ============================================================ */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'AR' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
  { code: 'zh', label: 'ZH' },
  { code: 'ja', label: 'JA' },
  { code: 'ru', label: 'RU' },
];

interface HeaderProps {
  locale?: string;
}

export default function Header({ locale = 'en' }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const NAV_ITEMS = [
    { href: `/${locale}`, label: locale === 'ar' ? 'الرئيسية' : 'Home' },
    { href: `/${locale}/hotels`, label: locale === 'ar' ? 'الفنادق' : 'Hotels' },
    { href: `/${locale}/landmarks`, label: locale === 'ar' ? 'المعالم' : 'Landmarks' },
    { href: `/${locale}/restaurants`, label: locale === 'ar' ? 'المطاعم' : 'Restaurants' },
    { href: `/${locale}/ai`, label: locale === 'ar' ? 'مساعد AI' : 'AI Assistant' },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href={`/${locale}`} className={styles.logo}>
            <span className={styles.logoVa}>Va</span>
            <span className={styles.logoTravel}>Travel</span>
          </Link>

          {/* Actions */}
          <div className={styles.actions}>
            {/* Language selector */}
            <div className={styles.langWrapper}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={styles.langBtn}
                aria-label="Change language"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>{locale.toUpperCase()}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {langOpen && (
                <div className={styles.langDropdown}>
                  {LANGUAGES.map(lang => (
                    <Link
                      key={lang.code}
                      href={pathname.replace(`/${locale}`, `/${lang.code}`)}
                      className={`${styles.langOption} ${locale === lang.code ? styles.langActive : ''}`}
                      onClick={() => setLangOpen(false)}
                    >
                      {lang.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`${styles.iconBtn} ${menuOpen ? styles.active : ''}`}
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12"/>
                ) : (
                  <>
                    <path d="M3 12h18M3 6h18M3 18h18"/>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Menu Overlay */}
      <div className={`${styles.menuOverlay} ${menuOpen ? styles.menuOpen : ''}`}>
        <nav className={styles.menuNav}>
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.menuItem}
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.menuNum}>0{i + 1}</span>
              <span className={styles.menuLabel}>{item.label}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.menuArrow}>
                <path d={locale === 'ar' ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"}/>
              </svg>
            </Link>
          ))}

          <div className={styles.menuFooter}>
            <Link href={`/${locale}/login`} className="btn btn-outline" onClick={() => setMenuOpen(false)}>
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
            <Link href={`/${locale}/signup`} className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              {locale === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
